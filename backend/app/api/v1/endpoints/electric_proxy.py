from fastapi import APIRouter, Request, Response
import httpx

router = APIRouter()

ELECTRIC_URL = "http://electric:3000"

@router.get("/{path:path}")
async def electric_proxy(path: str, request: Request):
    """
    Simple proxy to ElectricSQL with HTTP/2 support.
    Forwards all headers and query parameters to Electric server.
    """
    # Build the Electric URL
    url = f"{ELECTRIC_URL}/{path}"
    
    # Forward query parameters 
    query_string = str(request.query_params)
    if query_string:
        url = f"{url}?{query_string}"
    
    # Forward headers (excluding host and other hop-by-hop headers)
    headers = {
        key: value for key, value in request.headers.items()
        if key.lower() not in ['host', 'connection', 'transfer-encoding']
    }
    
    # Make the request to ElectricSQL
    async with httpx.AsyncClient(http2=True, timeout=30.0) as client:
        response = await client.get(url, headers=headers)
        
        # Forward all response headers, especially Electric-specific ones
        response_headers = {}
        for key, value in response.headers.items():
            # Keep all Electric headers and standard headers
            if key.lower() not in ['content-length', 'transfer-encoding', 'connection']:
                response_headers[key] = value
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
            media_type=response.headers.get('content-type', 'application/json')
        )
