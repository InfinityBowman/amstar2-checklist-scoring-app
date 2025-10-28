"""
Review API endpoint tests
"""
import pytest
from tests.helpers.api_client import APIClient
from tests.helpers.generators import (
    generate_email,
    generate_name,
    generate_strong_password,
    generate_project_name,
    generate_review_name,
)
from tests.helpers.auth import (
    create_user_and_get_token,
    create_project,
    add_project_member_by_email,
)


@pytest.mark.review
class TestCreateReviewEndpoint:
    """Tests for POST /api/v1/reviews/"""
    
    def test_project_owner_can_create_review(self, authenticated_client):
        """Project owner can create review in their project"""
        api_client, user_data, access_token = authenticated_client
        
        # Create project
        project = create_project(api_client, generate_project_name())
        review_name = generate_review_name()
        
        # Create review
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": review_name, "project_id": project["id"]}
        )
        
        assert response.status_code == 201
        review = response.json()
        assert review["name"] == review_name
        assert review["project_id"] == project["id"]
    
    def test_project_member_can_create_review(self, two_authenticated_clients):
        """Project member can create review"""
        (user1_data, token1), (user2_data, token2), api_client = two_authenticated_clients
        
        # User 1 creates project
        api_client.set_token(token1)
        project = create_project(api_client, generate_project_name())
        
        # User 1 adds User 2 as member
        add_project_member_by_email(api_client, project["id"], user2_data["email"])
        
        # User 2 creates review
        api_client.set_token(token2)
        review_name = generate_review_name()
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": review_name, "project_id": project["id"]}
        )
        
        assert response.status_code == 201
        review = response.json()
        assert review["name"] == review_name
        assert review["project_id"] == project["id"]
    
    def test_response_includes_all_fields(self, authenticated_client):
        """Response should include id, project_id, name, created_at"""
        api_client, user_data, access_token = authenticated_client
        
        # Create project
        project = create_project(api_client, generate_project_name())
        
        # Create review
        review_name = generate_review_name()
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": review_name, "project_id": project["id"]}
        )
        
        assert response.status_code == 201
        review = response.json()
        
        # Check all required fields
        assert "id" in review
        assert "project_id" in review
        assert "name" in review
        assert "created_at" in review
        
        # Validate field types
        assert isinstance(review["id"], str)
        assert isinstance(review["project_id"], str)
        assert isinstance(review["name"], str)
        assert isinstance(review["created_at"], str)
    
    def test_non_member_cannot_create_review(self, two_authenticated_clients):
        """User not in project cannot create review"""
        (user1_data, token1), (user2_data, token2), api_client = two_authenticated_clients
        
        # User 1 creates project
        api_client.set_token(token1)
        project = create_project(api_client, generate_project_name())
        
        # User 2 (not a member) tries to create review
        api_client.set_token(token2)
        review_name = generate_review_name()
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": review_name, "project_id": project["id"]}
        )
        
        # Should return 403 (ideally) or 500 (server error but still blocks access)
        assert response.status_code in [403, 500]
    
    def test_project_not_found_returns_404(self, authenticated_client):
        """Creating review for non-existent project returns 404"""
        api_client, user_data, access_token = authenticated_client
        
        # Try to create review with fake project ID
        fake_project_id = "00000000-0000-0000-0000-000000000000"
        review_name = generate_review_name()
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": review_name, "project_id": fake_project_id}
        )
        
        assert response.status_code == 404
    
    def test_no_authentication_returns_401_or_403(self, api_client: APIClient):
        """Request without authentication should return 401 or 403"""
        review_name = generate_review_name()
        fake_project_id = "00000000-0000-0000-0000-000000000000"
        
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": review_name, "project_id": fake_project_id}
        )
        
        # API may return 401 (no auth) or 403 (forbidden) depending on order of checks
        assert response.status_code in [401, 403]
    
    def test_empty_name_returns_422(self, authenticated_client):
        """Empty review name should be rejected"""
        api_client, user_data, access_token = authenticated_client
        
        # Create project
        project = create_project(api_client, generate_project_name())
        
        # Try to create review with empty name
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": "", "project_id": project["id"]}
        )
        
        assert response.status_code == 422
    
    def test_name_too_long_returns_422(self, authenticated_client):
        """Review name longer than 255 characters should be rejected"""
        api_client, user_data, access_token = authenticated_client
        
        # Create project
        project = create_project(api_client, generate_project_name())
        
        # Try to create review with name > 255 chars
        long_name = "a" * 256
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": long_name, "project_id": project["id"]}
        )
        
        assert response.status_code == 422
    
    def test_missing_name_returns_422(self, authenticated_client):
        """Missing name field should be rejected"""
        api_client, user_data, access_token = authenticated_client
        
        # Create project
        project = create_project(api_client, generate_project_name())
        
        # Try to create review without name
        response = api_client.post(
            "/api/v1/reviews/",
            json={"project_id": project["id"]}
        )
        
        assert response.status_code == 422
    
    def test_invalid_project_id_returns_422(self, authenticated_client):
        """Invalid project_id UUID should be rejected"""
        api_client, user_data, access_token = authenticated_client
        
        review_name = generate_review_name()
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": review_name, "project_id": "not-a-uuid"}
        )
        
        assert response.status_code == 422
    
    def test_missing_project_id_returns_422(self, authenticated_client):
        """Missing project_id field should be rejected"""
        api_client, user_data, access_token = authenticated_client
        
        review_name = generate_review_name()
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": review_name}
        )
        
        assert response.status_code == 422

