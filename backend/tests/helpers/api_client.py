"""
API Client wrapper for testing
"""
import httpx
from typing import Optional, Dict, Any


class APIClient:
    """HTTP client wrapper for API testing"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.client = httpx.Client(base_url=base_url, timeout=30.0)
        self._access_token: Optional[str] = None
        
    def set_token(self, token: str):
        """Set the authorization token"""
        self._access_token = token
        
    def clear_token(self):
        """Clear the authorization token"""
        self._access_token = None
        
    def _get_headers(self, headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        """Get headers with authorization if token is set"""
        default_headers = {}
        if self._access_token:
            default_headers["Authorization"] = f"Bearer {self._access_token}"
        if headers:
            default_headers.update(headers)
        return default_headers
    
    def get(self, url: str, **kwargs) -> httpx.Response:
        """Send GET request"""
        headers = self._get_headers(kwargs.pop("headers", None))
        return self.client.get(url, headers=headers, **kwargs)
    
    def post(self, url: str, **kwargs) -> httpx.Response:
        """Send POST request"""
        headers = self._get_headers(kwargs.pop("headers", None))
        return self.client.post(url, headers=headers, **kwargs)
    
    def put(self, url: str, **kwargs) -> httpx.Response:
        """Send PUT request"""
        headers = self._get_headers(kwargs.pop("headers", None))
        return self.client.put(url, headers=headers, **kwargs)
    
    def delete(self, url: str, **kwargs) -> httpx.Response:
        """Send DELETE request"""
        headers = self._get_headers(kwargs.pop("headers", None))
        return self.client.delete(url, headers=headers, **kwargs)
    
    def close(self):
        """Close the client"""
        self.client.close()
        
    def __enter__(self):
        return self
        
    def __exit__(self, *args):
        self.close()

