"""
Project API endpoint tests
"""
import pytest
from tests.helpers.api_client import APIClient
from tests.helpers.generators import generate_project_name


@pytest.mark.project
class TestCreateProjectEndpoint:
    """Tests for POST /api/v1/projects/"""
    
    def test_valid_project_creation_returns_201(self, authenticated_client):
        """Authenticated user creates project and becomes owner"""
        api_client, user_data, access_token = authenticated_client
        project_name = generate_project_name()
        
        response = api_client.post(
            "/api/v1/projects/",
            json={"name": project_name}
        )
        
        assert response.status_code == 201
        project = response.json()
        assert project["name"] == project_name
        assert project["owner_id"] == user_data["id"]
    
    def test_response_includes_all_fields(self, authenticated_client):
        """Response should include id, name, owner_id, updated_at"""
        api_client, user_data, access_token = authenticated_client
        project_name = generate_project_name()
        
        response = api_client.post(
            "/api/v1/projects/",
            json={"name": project_name}
        )
        
        assert response.status_code == 201
        project = response.json()
        
        # Check all required fields are present
        assert "id" in project
        assert "name" in project
        assert "owner_id" in project
        assert "updated_at" in project
        
        # Validate field types
        assert isinstance(project["id"], str)
        assert isinstance(project["name"], str)
        assert isinstance(project["owner_id"], str)
        assert isinstance(project["updated_at"], str)
    
    def test_empty_name_returns_422(self, authenticated_client):
        """Empty project name should be rejected"""
        api_client, user_data, access_token = authenticated_client
        
        response = api_client.post(
            "/api/v1/projects/",
            json={"name": ""}
        )
        
        assert response.status_code == 422
    
    def test_name_too_long_returns_422(self, authenticated_client):
        """Project name longer than 255 characters should be rejected"""
        api_client, user_data, access_token = authenticated_client
        
        # Create a name with 256 characters
        long_name = "a" * 256
        
        response = api_client.post(
            "/api/v1/projects/",
            json={"name": long_name}
        )
        
        assert response.status_code == 422
    
    def test_missing_name_returns_422(self, authenticated_client):
        """Missing name field should be rejected"""
        api_client, user_data, access_token = authenticated_client
        
        response = api_client.post(
            "/api/v1/projects/",
            json={}
        )
        
        assert response.status_code == 422
    
    def test_no_authentication_returns_401_or_403(self, api_client: APIClient):
        """Request without authentication should return 401 or 403"""
        project_name = generate_project_name()
        
        response = api_client.post(
            "/api/v1/projects/",
            json={"name": project_name}
        )
        
        # API may return 401 (no auth) or 403 (forbidden)
        assert response.status_code in [401, 403]
    
    def test_invalid_token_returns_401(self, api_client: APIClient):
        """Request with invalid token should return 401"""
        api_client.set_token("invalid.token.here")
        project_name = generate_project_name()
        
        response = api_client.post(
            "/api/v1/projects/",
            json={"name": project_name}
        )
        
        assert response.status_code == 401

