from fastapi import APIRouter, Request, Response, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
import httpx
import asyncio
from app.core.config import settings
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter()
ELECTRIC_URL = settings.ELECTRIC_URL

@router.api_route("/{path:path}", methods=["GET"])
async def electric_proxy(
    path: str,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)  # Require authentication
):
    print(f"[Electric Proxy] Cookies: {request.cookies}")
    print(f"[Electric Proxy] Headers: {dict(request.headers)}")
    
    # Filter out problematic headers
    safe_headers = {
        k: v for k, v in request.headers.items() 
        if k.lower() not in ["host", "connection", "content-length", "transfer-encoding"]
    }
    
    # Get query parameters and body
    body = await request.body()
    electric_url = f"{ELECTRIC_URL}/v1/{path}"
    print(f"[Electric Proxy] Proxying to: {electric_url}")
    print(f"[Electric Proxy] Query params: {dict(request.query_params)}")
    
    # For streaming connections (with live=true), we need special handling
    if request.query_params.get("live") == "true":
        print("[Electric Proxy] Handling as streaming connection")
        return await stream_response(electric_url, request.method, safe_headers, body, request.query_params)
    else:
        # Non-streaming response is simpler
        async with httpx.AsyncClient() as client:
            resp = await client.request(
                request.method,
                electric_url,
                headers=safe_headers,
                content=body,
                params=request.query_params,
            )
            print(f"[Electric Proxy] Response status: {resp.status_code}")
            
            # Filter problematic response headers
            excluded_headers = {
                "content-encoding", "transfer-encoding", "connection", 
                "keep-alive", "proxy-authenticate", "proxy-authorization", 
                "te", "trailer", "upgrade"
            }
            response_headers = {
                k: v for k, v in resp.headers.items() 
                if k.lower() not in excluded_headers
            }
            
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers=response_headers,
                media_type=resp.headers.get("content-type"),
            )

async def stream_response(url, method, headers, body, params):
    """
    Create a streaming response that properly handles the long-lived connection
    by using an intermediate buffer with asyncio.Queue.
    """
    # Create an asyncio Queue to buffer chunks between the two tasks
    queue = asyncio.Queue()
    
    # Flag to signal when the producer has completed
    producer_done = asyncio.Event()

    async def producer():
        """Fetch data from upstream and put into queue"""
        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream(
                    method, url, headers=headers, content=body, params=params
                ) as resp:
                    print(f"[Electric Producer] Stream response status: {resp.status_code}")
                    
                    # Put the status code in the queue first (will be read by consumer)
                    await queue.put((resp.status_code, resp.headers))
                    
                    # Stream chunks to queue
                    async for chunk in resp.aiter_bytes():
                        await queue.put(chunk)
                        
        except Exception as e:
            print(f"[Electric Producer] Error: {e}")
            # Make sure we signal the end even on error
        finally:
            # Signal producer is done
            producer_done.set()

    async def consumer():
        """Read from queue and yield to client"""
        try:
            # Continue yielding chunks until producer is done and queue is empty
            while not (producer_done.is_set() and queue.empty()):
                try:
                    chunk = await asyncio.wait_for(queue.get(), timeout=0.1)
                    yield chunk
                except asyncio.TimeoutError:
                    # No data available yet, but producer may still be running
                    continue
                    
        except Exception as e:
            print(f"[Electric Consumer] Error: {e}")
            
        print("[Electric Consumer] Stream complete")

    # Start the producer task
    background_task = asyncio.create_task(producer())
    
    # Wait for the first item which should be status code and headers
    first_item = await queue.get()
    
    # Check if it's a tuple with status_code and headers
    if isinstance(first_item, tuple) and len(first_item) == 2:
        status_code, resp_headers = first_item
    else:
        # If not, it's a data chunk - put it back in the queue and use defaults
        await queue.put(first_item)
        status_code = 200
        resp_headers = {"content-type": "application/octet-stream"}
    
    # Filter problematic response headers
    excluded_headers = {
        "content-encoding", "transfer-encoding", "connection", 
        "keep-alive", "proxy-authenticate", "proxy-authorization", 
        "te", "trailer", "upgrade"
    }
    response_headers = {
        k: v for k, v in resp_headers.items() 
        if k.lower() not in excluded_headers
    }
    
    # Return streaming response with our consumer generator
    return StreamingResponse(
        consumer(),
        status_code=status_code,
        headers=response_headers,
        media_type=resp_headers.get("content-type"),
    )