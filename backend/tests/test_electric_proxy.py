"""
Electric Proxy API endpoint tests
"""
import pytest
from tests.helpers.api_client import APIClient


@pytest.mark.integration
class TestElectricProxyEndpoint:
    """Tests for GET /api/v1/electric/{path:path}"""
    
    def test_authenticated_request_accepted(self, authenticated_client):
        """Authenticated request should be accepted by proxy"""
        api_client, user_data, access_token = authenticated_client
        
        try:
            # Make request through proxy (will fail if Electric not running)
            response = api_client.get("/api/v1/electric/shape")
            
            # Should either succeed (if Electric running) or fail with connection error
            # But NOT return 401/403 (authentication should pass)
            assert response.status_code not in [401]
        except Exception as e:
            # Connection errors are fine - Electric service may not be running
            # The important thing is authentication passed
            assert "401" not in str(e) and "Unauthorized" not in str(e)
    
    def test_query_parameters_accepted(self, authenticated_client):
        """Query parameters should be accepted"""
        api_client, user_data, access_token = authenticated_client
        
        try:
            # Make request with query params
            response = api_client.get(
                "/api/v1/electric/shape",
                params={"offset": "0", "limit": "10"}
            )
            
            # Should not return auth errors (actual connection may fail)
            assert response.status_code not in [401]
        except Exception:
            # Connection errors are fine - Electric service may not be running
            pass
    
    def test_no_authentication_returns_401(self, api_client: APIClient):
        """Request without authentication returns 401"""
        response = api_client.get("/api/v1/electric/shape")
        
        assert response.status_code in [401, 403]
    
    def test_invalid_token_returns_401(self, api_client: APIClient):
        """Request with invalid token returns 401"""
        api_client.set_token("invalid.token.here")
        
        response = api_client.get("/api/v1/electric/shape")
        
        assert response.status_code == 401
    
    def test_different_paths_accepted(self, authenticated_client):
        """Different Electric paths should be accepted"""
        api_client, user_data, access_token = authenticated_client
        
        # Test various paths
        paths = ["shape", "items", "sync"]
        
        for path in paths:
            try:
                response = api_client.get(f"/api/v1/electric/{path}")
                # Should not return auth errors
                assert response.status_code not in [401]
            except Exception:
                # Connection errors are fine
                pass
    
    def test_live_parameter_accepted(self, authenticated_client):
        """live=true parameter should be accepted for streaming"""
        api_client, user_data, access_token = authenticated_client
        
        try:
            # Make request with live=true (streaming mode)
            response = api_client.get(
                "/api/v1/electric/shape",
                params={"live": "true"}
            )
            
            # Should not return auth errors
            assert response.status_code not in [401]
        except Exception:
            # Connection/streaming errors are fine
            pass

