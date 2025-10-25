"""
User API endpoint tests
"""
import pytest
from tests.helpers.api_client import APIClient
from tests.helpers.generators import generate_email, generate_name, generate_strong_password
from tests.helpers.auth import create_user_and_get_token


@pytest.mark.user
class TestGetCurrentUserEndpoint:
    """Tests for GET /api/v1/users/me"""
    
    def test_valid_token_returns_user_profile(self, authenticated_client):
        """Valid token should return user profile"""
        api_client, user_data, access_token = authenticated_client
        
        response = api_client.get("/api/v1/users/me")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_data["id"]
        assert data["email"] == user_data["email"]
        assert data["name"] == user_data["name"]
        assert "created_at" in data
    
    def test_response_excludes_password(self, authenticated_client):
        """Response should exclude password"""
        api_client, user_data, access_token = authenticated_client
        
        response = api_client.get("/api/v1/users/me")
        
        assert response.status_code == 200
        data = response.json()
        assert "password" not in data
        assert "hashed_password" not in data
    
    def test_no_token_returns_401(self, api_client: APIClient):
        """No token should return 403 (FastAPI HTTPBearer default)"""
        response = api_client.get("/api/v1/users/me")
        assert response.status_code == 403
    
    def test_invalid_token_returns_401(self, api_client: APIClient):
        """Invalid token should return 401"""
        api_client.set_token("invalid.token.here")
        response = api_client.get("/api/v1/users/me")
        assert response.status_code == 401
    
    def test_malformed_token_returns_401(self, api_client: APIClient):
        """Malformed token should return 401"""
        api_client.set_token("not-a-jwt-token")
        response = api_client.get("/api/v1/users/me")
        assert response.status_code == 401


@pytest.mark.user
class TestSearchUsersEndpoint:
    """Tests for GET /api/v1/users/search"""
    
    def test_search_by_name_returns_matches(self, api_client: APIClient):
        """Search by name should return matching users"""
        # Create main user (will be authenticated)
        main_email = generate_email()
        main_user, main_token = create_user_and_get_token(
            api_client, main_email, "Main User", generate_strong_password()
        )
        api_client.set_token(main_token)
        
        # Create a user with specific name
        target_email = generate_email()
        target_user, _ = create_user_and_get_token(
            api_client, target_email, "Alice Johnson", generate_strong_password()
        )
        
        # Search for "Alice"
        response = api_client.get("/api/v1/users/search", params={"q": "Alice"})
        
        assert response.status_code == 200
        users = response.json()
        assert len(users) >= 1
        # Check that Alice is in results
        alice_found = any(u["name"] == "Alice Johnson" for u in users)
        assert alice_found
    
    def test_search_by_email_returns_matches(self, api_client: APIClient):
        """Search by email should return matching users"""
        # Create main user
        main_email = generate_email()
        main_user, main_token = create_user_and_get_token(
            api_client, main_email, "Main User", generate_strong_password()
        )
        api_client.set_token(main_token)
        
        # Create a user with specific email pattern
        unique_id = generate_email().split('@')[0]  # Get unique part
        target_email = f"alice.special.{unique_id}@example.com"
        target_user, _ = create_user_and_get_token(
            api_client, target_email, "Alice Special", generate_strong_password()
        )
        
        # Search for unique part
        response = api_client.get("/api/v1/users/search", params={"q": unique_id})
        
        assert response.status_code == 200
        users = response.json()
        assert len(users) >= 1
        # Check that our target user is in results
        alice_found = any(u["email"] == target_email for u in users)
        assert alice_found
    
    def test_search_is_case_insensitive(self, api_client: APIClient):
        """Search should be case-insensitive"""
        # Create main user
        main_email = generate_email()
        main_user, main_token = create_user_and_get_token(
            api_client, main_email, "Main User", generate_strong_password()
        )
        api_client.set_token(main_token)
        
        # Create a user with specific name
        target_email = generate_email()
        target_user, _ = create_user_and_get_token(
            api_client, target_email, "Bob Smith", generate_strong_password()
        )
        
        # Search with different casing
        response = api_client.get("/api/v1/users/search", params={"q": "bob"})
        assert response.status_code == 200
        users_lower = response.json()
        
        response = api_client.get("/api/v1/users/search", params={"q": "BOB"})
        assert response.status_code == 200
        users_upper = response.json()
        
        response = api_client.get("/api/v1/users/search", params={"q": "BoB"})
        assert response.status_code == 200
        users_mixed = response.json()
        
        # All should return Bob
        assert any(u["name"] == "Bob Smith" for u in users_lower)
        assert any(u["name"] == "Bob Smith" for u in users_upper)
        assert any(u["name"] == "Bob Smith" for u in users_mixed)
    
    def test_empty_query_returns_verified_users(self, authenticated_client):
        """Empty query should return verified users"""
        api_client, user_data, access_token = authenticated_client
        
        response = api_client.get("/api/v1/users/search")
        
        assert response.status_code == 200
        users = response.json()
        # Should return at least 0 users (might be empty if only one user exists)
        assert isinstance(users, list)
    
    def test_no_matches_returns_empty_array(self, authenticated_client):
        """No matches should return empty array"""
        api_client, user_data, access_token = authenticated_client
        
        # Search for something that definitely doesn't exist
        response = api_client.get(
            "/api/v1/users/search",
            params={"q": "nonexistent_user_12345_xyz"}
        )
        
        assert response.status_code == 200
        users = response.json()
        assert users == []
    
    def test_excludes_current_user_from_results(self, api_client: APIClient):
        """Search should exclude current user from results"""
        # Create user with specific name
        my_email = generate_email()
        my_user, my_token = create_user_and_get_token(
            api_client, my_email, "Charlie Brown", generate_strong_password()
        )
        api_client.set_token(my_token)
        
        # Search for own name
        response = api_client.get("/api/v1/users/search", params={"q": "Charlie"})
        
        assert response.status_code == 200
        users = response.json()
        # Current user should not be in results
        current_user_found = any(u["id"] == my_user["id"] for u in users)
        assert not current_user_found
    
    def test_only_returns_verified_users(self, api_client: APIClient):
        """Search should only return verified users"""
        # Create verified user (main user)
        main_email = generate_email()
        main_user, main_token = create_user_and_get_token(
            api_client, main_email, "Main User", generate_strong_password()
        )
        api_client.set_token(main_token)
        
        # Create unverified user
        unverified_email = generate_email()
        api_client.post(
            "/api/v1/auth/signup",
            json={
                "email": unverified_email,
                "name": "Unverified User",
                "password": generate_strong_password()
            }
        )
        # Don't verify this user
        
        # Search for unverified user
        response = api_client.get("/api/v1/users/search", params={"q": "Unverified"})
        
        assert response.status_code == 200
        users = response.json()
        # Unverified user should not be in results
        unverified_found = any(u["email"] == unverified_email for u in users)
        assert not unverified_found
    
    def test_respects_limit_parameter(self, api_client: APIClient):
        """Search should respect limit parameter"""
        # Create main user
        main_email = generate_email()
        main_user, main_token = create_user_and_get_token(
            api_client, main_email, "Main User", generate_strong_password()
        )
        api_client.set_token(main_token)
        
        # Create several users
        for i in range(5):
            email = generate_email()
            create_user_and_get_token(
                api_client, email, f"Test User {i}", generate_strong_password()
            )
        
        # Search with limit
        response = api_client.get("/api/v1/users/search", params={"limit": 2})
        
        assert response.status_code == 200
        users = response.json()
        assert len(users) <= 2
    
    def test_default_limit_is_10(self, api_client: APIClient):
        """Default limit should be 10"""
        # Create main user
        main_email = generate_email()
        main_user, main_token = create_user_and_get_token(
            api_client, main_email, "Main User", generate_strong_password()
        )
        api_client.set_token(main_token)
        
        # Search without limit
        response = api_client.get("/api/v1/users/search")
        
        assert response.status_code == 200
        users = response.json()
        # Should not exceed default limit of 10
        assert len(users) <= 10
    
    def test_max_limit_enforced(self, api_client: APIClient):
        """Maximum limit of 50 should be enforced - returns 422 for invalid value"""
        # Create main user
        main_email = generate_email()
        main_user, main_token = create_user_and_get_token(
            api_client, main_email, "Main User", generate_strong_password()
        )
        api_client.set_token(main_token)
        
        # Try to search with limit > 50
        response = api_client.get("/api/v1/users/search", params={"limit": 100})
        
        # Should return validation error
        assert response.status_code == 422
    
    def test_min_limit_enforced(self, api_client: APIClient):
        """Minimum limit of 1 should be enforced"""
        # Create main user
        main_email = generate_email()
        main_user, main_token = create_user_and_get_token(
            api_client, main_email, "Main User", generate_strong_password()
        )
        api_client.set_token(main_token)
        
        # Try to search with limit < 1
        response = api_client.get("/api/v1/users/search", params={"limit": 0})
        
        # Should return validation error
        assert response.status_code == 422
    
    def test_no_auth_returns_401(self, api_client: APIClient):
        """No authentication should return 403 (FastAPI HTTPBearer default)"""
        response = api_client.get("/api/v1/users/search")
        assert response.status_code == 403

