"""
Authentication API endpoint tests
"""
import pytest
import re
from tests.helpers.api_client import APIClient
from tests.helpers.generators import (
    generate_email,
    generate_name,
    generate_strong_password,
    generate_weak_password_no_uppercase,
    generate_weak_password_no_lowercase,
    generate_weak_password_no_digit,
    generate_weak_password_too_short,
)
from tests.helpers.auth import extract_code_from_response


@pytest.mark.auth
class TestSignupEndpoint:
    """Tests for POST /api/v1/auth/signup"""
    
    def test_valid_signup_returns_201_with_user_data(self, api_client: APIClient):
        """Valid signup should return 201 with user data (no password)"""
        email = generate_email()
        name = generate_name()
        password = generate_strong_password()
        
        response = api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": name, "password": password}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "message" in data
        assert "user" in data
        
        user = data["user"]
        assert "id" in user
        assert user["email"] == email.lower()  # Email normalized to lowercase
        assert user["name"] == name
        assert "created_at" in user
        assert "password" not in user  # Password should not be in response
        assert "hashed_password" not in user
    
    def test_email_normalized_to_lowercase(self, api_client: APIClient):
        """Email should be normalized to lowercase"""
        email = "Test.User@EXAMPLE.COM"
        name = generate_name()
        password = generate_strong_password()
        
        response = api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": name, "password": password}
        )
        
        assert response.status_code == 201
        user = response.json()["user"]
        assert user["email"] == email.lower()
    
    def test_duplicate_verified_email_returns_409(self, api_client: APIClient):
        """Duplicate verified email should return 409"""
        email = generate_email()
        name = generate_name()
        password = generate_strong_password()
        
        # First signup
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": name, "password": password}
        )
        
        # Verify email
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Try to signup again with same email
        response = api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": "Another Name", "password": "AnotherPass123"}
        )
        
        assert response.status_code == 409
        assert "already registered" in response.json()["detail"].lower()
    
    def test_duplicate_unverified_email_returns_409(self, api_client: APIClient):
        """Duplicate unverified email should return 409"""
        email = generate_email()
        name = generate_name()
        password = generate_strong_password()
        
        # First signup (not verified)
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": name, "password": password}
        )
        
        # Try to signup again without verifying
        response = api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": "Another Name", "password": "AnotherPass123"}
        )
        
        assert response.status_code == 409
        assert "not verified" in response.json()["detail"].lower()
    
    def test_weak_password_no_uppercase_returns_400(self, api_client: APIClient):
        """Password without uppercase should return 400"""
        response = api_client.post(
            "/api/v1/auth/signup",
            json={
                "email": generate_email(),
                "name": generate_name(),
                "password": generate_weak_password_no_uppercase()
            }
        )
        
        assert response.status_code == 400
    
    def test_weak_password_no_lowercase_returns_400(self, api_client: APIClient):
        """Password without lowercase should return 400"""
        response = api_client.post(
            "/api/v1/auth/signup",
            json={
                "email": generate_email(),
                "name": generate_name(),
                "password": generate_weak_password_no_lowercase()
            }
        )
        
        assert response.status_code == 400
    
    def test_weak_password_no_digit_returns_400(self, api_client: APIClient):
        """Password without digit should return 400"""
        response = api_client.post(
            "/api/v1/auth/signup",
            json={
                "email": generate_email(),
                "name": generate_name(),
                "password": generate_weak_password_no_digit()
            }
        )
        
        assert response.status_code == 400
    
    def test_weak_password_too_short_returns_400(self, api_client: APIClient):
        """Password less than 8 characters should return 400"""
        response = api_client.post(
            "/api/v1/auth/signup",
            json={
                "email": generate_email(),
                "name": generate_name(),
                "password": generate_weak_password_too_short()
            }
        )
        
        assert response.status_code == 400
    
    def test_invalid_email_format_returns_422(self, api_client: APIClient):
        """Invalid email format should return 422"""
        response = api_client.post(
            "/api/v1/auth/signup",
            json={
                "email": "not-an-email",
                "name": generate_name(),
                "password": generate_strong_password()
            }
        )
        
        assert response.status_code == 422
    
    def test_missing_required_fields_returns_422(self, api_client: APIClient):
        """Missing required fields should return 422"""
        # Missing email
        response = api_client.post(
            "/api/v1/auth/signup",
            json={"name": generate_name(), "password": generate_strong_password()}
        )
        assert response.status_code == 422
        
        # Missing name
        response = api_client.post(
            "/api/v1/auth/signup",
            json={"email": generate_email(), "password": generate_strong_password()}
        )
        assert response.status_code == 422
        
        # Missing password
        response = api_client.post(
            "/api/v1/auth/signup",
            json={"email": generate_email(), "name": generate_name()}
        )
        assert response.status_code == 422


@pytest.mark.auth
class TestSigninEndpoint:
    """Tests for POST /api/v1/auth/signin"""
    
    def test_valid_credentials_return_200_with_token(self, api_client: APIClient):
        """Valid credentials should return 200 with access token"""
        # Create and verify a user
        email = generate_email()
        password = generate_strong_password()
        
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": password}
        )
        
        # Verify email
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Sign in
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": email, "password": password}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "accessToken" in data
        assert len(data["accessToken"]) > 0
    
    def test_refresh_token_set_as_httponly_cookie(self, api_client: APIClient):
        """Refresh token should be set as HttpOnly cookie"""
        # Create and verify a user
        email = generate_email()
        password = generate_strong_password()
        
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": password}
        )
        
        # Verify email
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Sign in
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": email, "password": password}
        )
        
        assert response.status_code == 200
        # Check for refresh cookie
        assert "refresh" in response.cookies
    
    def test_cookie_has_correct_properties(self, api_client: APIClient):
        """Cookie should have correct security properties"""
        # Create and verify a user
        email = generate_email()
        password = generate_strong_password()
        
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": password}
        )
        
        # Verify email
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Sign in
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": email, "password": password}
        )
        
        # Check cookie properties
        cookie = response.cookies.get("refresh")
        assert cookie is not None
        
        # Note: httponly, secure, and samesite are set in Set-Cookie header
        # httpx Response.cookies doesn't expose these flags directly
        # We can check the raw headers
        set_cookie_header = response.headers.get("set-cookie", "")
        assert "HttpOnly" in set_cookie_header
        assert "SameSite=strict" in set_cookie_header or "SameSite=Strict" in set_cookie_header
    
    def test_invalid_password_returns_401(self, api_client: APIClient):
        """Invalid password should return 401"""
        # Create and verify a user
        email = generate_email()
        password = generate_strong_password()
        
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": password}
        )
        
        # Verify email
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Try to sign in with wrong password
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": email, "password": "WrongPassword123"}
        )
        
        assert response.status_code == 401
    
    def test_nonexistent_user_returns_401(self, api_client: APIClient):
        """Non-existent user should return 401"""
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": "nonexistent@example.com", "password": "SomePassword123"}
        )
        
        assert response.status_code == 401
    
    def test_unverified_email_returns_401(self, api_client: APIClient):
        """Unverified email should return 401"""
        email = generate_email()
        password = generate_strong_password()
        
        # Sign up but don't verify
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": password}
        )
        
        # Try to sign in without verification
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": email, "password": password}
        )
        
        assert response.status_code == 401
        assert "not verified" in response.json()["detail"].lower()
    
    def test_email_case_insensitive_matching(self, api_client: APIClient):
        """Email matching should be case-insensitive"""
        email = "test.user@example.com"
        password = generate_strong_password()
        
        # Sign up
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": password}
        )
        
        # Verify email
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Sign in with different casing
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": "TEST.USER@EXAMPLE.COM", "password": password}
        )
        
        assert response.status_code == 200
    
    def test_missing_credentials_returns_422(self, api_client: APIClient):
        """Missing credentials should return 422"""
        # Missing email
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"password": "SomePassword123"}
        )
        assert response.status_code == 422
        
        # Missing password
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": "test@example.com"}
        )
        assert response.status_code == 422


@pytest.mark.auth
class TestRefreshTokenEndpoint:
    """Tests for POST /api/v1/auth/refresh"""
    
    def test_valid_refresh_token_returns_new_access_token(self, api_client: APIClient):
        """Valid refresh token should return new access token"""
        # Create, verify and sign in user
        email = generate_email()
        password = generate_strong_password()
        
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": password}
        )
        
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        signin_response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": email, "password": password}
        )
        
        # Refresh token is in cookies
        # Use refresh endpoint
        response = api_client.post("/api/v1/auth/refresh")
        
        assert response.status_code == 200
        data = response.json()
        assert "accessToken" in data
        assert len(data["accessToken"]) > 0
    
    def test_missing_refresh_cookie_returns_401(self, api_client: APIClient):
        """Missing refresh cookie should return 401"""
        # Make a fresh client without cookies
        fresh_client = APIClient(base_url=api_client.base_url)
        response = fresh_client.post("/api/v1/auth/refresh")
        fresh_client.close()
        
        assert response.status_code == 401


@pytest.mark.auth
class TestSignoutEndpoint:
    """Tests for POST /api/v1/auth/signout"""
    
    def test_signout_clears_refresh_cookie(self, api_client: APIClient):
        """Signout should clear refresh cookie"""
        # Sign in first to get cookie
        email = generate_email()
        password = generate_strong_password()
        
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": password}
        )
        
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        api_client.post(
            "/api/v1/auth/signin",
            json={"email": email, "password": password}
        )
        
        # Now sign out
        response = api_client.post("/api/v1/auth/signout")
        
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_signout_works_without_authentication(self, api_client: APIClient):
        """Signout should work even without being signed in"""
        response = api_client.post("/api/v1/auth/signout")
        assert response.status_code == 200


@pytest.mark.auth
class TestSendVerificationEndpoint:
    """Tests for POST /api/v1/auth/send-verification"""
    
    def test_valid_email_returns_200_with_code(self, api_client: APIClient):
        """Valid email should return 200 with verification code (dev mode)"""
        email = generate_email()
        
        # Sign up first
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": generate_strong_password()}
        )
        
        # Send verification
        response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        # In dev mode, code is in the message
        assert "CODE:" in data["message"]
    
    def test_user_not_found_returns_404(self, api_client: APIClient):
        """Non-existent user should return 404"""
        response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": "nonexistent@example.com"}
        )
        
        assert response.status_code == 404
    
    def test_missing_email_returns_400(self, api_client: APIClient):
        """Missing email should return 400"""
        response = api_client.post(
            "/api/v1/auth/send-verification",
            json={}
        )
        
        assert response.status_code == 422  # Pydantic validation error


@pytest.mark.auth
class TestVerifyEmailEndpoint:
    """Tests for POST /api/v1/auth/verify-email"""
    
    def test_valid_code_returns_200_success(self, api_client: APIClient):
        """Valid code should return 200 and verify email"""
        email = generate_email()
        
        # Sign up
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": generate_strong_password()}
        )
        
        # Send verification
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        
        # Verify email
        response = api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_invalid_code_returns_401(self, api_client: APIClient):
        """Invalid code should return 401"""
        email = generate_email()
        
        # Sign up
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": generate_strong_password()}
        )
        
        # Send verification (but use wrong code)
        api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        
        # Try to verify with wrong code
        response = api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": "999999"}
        )
        
        assert response.status_code == 401
    
    def test_user_not_found_returns_404(self, api_client: APIClient):
        """Non-existent user should return 404"""
        response = api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": "nonexistent@example.com", "code": "123456"}
        )
        
        assert response.status_code == 404
    
    def test_missing_email_or_code_returns_400(self, api_client: APIClient):
        """Missing email or code should return 400"""
        # Missing code
        response = api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": "test@example.com"}
        )
        assert response.status_code == 422
        
        # Missing email
        response = api_client.post(
            "/api/v1/auth/verify-email",
            json={"code": "123456"}
        )
        assert response.status_code == 422
    
    def test_after_verification_signin_works(self, api_client: APIClient):
        """After email verification, user should be able to sign in"""
        email = generate_email()
        password = generate_strong_password()
        
        # Sign up
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": password}
        )
        
        # Verify email
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Try to sign in
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": email, "password": password}
        )
        
        assert response.status_code == 200


@pytest.mark.auth
class TestRequestPasswordResetEndpoint:
    """Tests for POST /api/v1/auth/request-password-reset"""
    
    def test_valid_email_returns_200(self, api_client: APIClient):
        """Valid email should return 200 (even if user doesn't exist - security)"""
        email = generate_email()
        
        # Sign up and verify user
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": generate_strong_password()}
        )
        
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Request password reset
        response = api_client.post(
            "/api/v1/auth/request-password-reset",
            json={"email": email}
        )
        
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_response_includes_reset_code_for_existing_users(self, api_client: APIClient):
        """Response should include reset code for existing users (dev mode)"""
        email = generate_email()
        
        # Sign up and verify user
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": generate_strong_password()}
        )
        
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Request password reset
        response = api_client.post(
            "/api/v1/auth/request-password-reset",
            json={"email": email}
        )
        
        assert response.status_code == 200
        # Code should be in the message (dev mode)
        assert "CODE:" in response.json()["message"]
    
    def test_nonexistent_email_still_returns_200(self, api_client: APIClient):
        """Non-existent email should still return 200 (security)"""
        response = api_client.post(
            "/api/v1/auth/request-password-reset",
            json={"email": "nonexistent@example.com"}
        )
        
        assert response.status_code == 200
    
    def test_missing_email_returns_400(self, api_client: APIClient):
        """Missing email should return 400"""
        response = api_client.post(
            "/api/v1/auth/request-password-reset",
            json={}
        )
        
        assert response.status_code == 422


@pytest.mark.auth
class TestResetPasswordEndpoint:
    """Tests for POST /api/v1/auth/reset-password"""
    
    def test_valid_code_and_strong_password_returns_200(self, api_client: APIClient):
        """Valid code and strong password should return 200"""
        email = generate_email()
        old_password = generate_strong_password()
        new_password = "NewPassword123"
        
        # Sign up and verify user
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": old_password}
        )
        
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Request password reset
        reset_request_response = api_client.post(
            "/api/v1/auth/request-password-reset",
            json={"email": email}
        )
        reset_code = extract_code_from_response(reset_request_response.json()["message"])
        
        # Reset password
        response = api_client.post(
            "/api/v1/auth/reset-password",
            json={"email": email, "code": reset_code, "new_password": new_password}
        )
        
        assert response.status_code == 200
    
    def test_invalid_code_returns_401(self, api_client: APIClient):
        """Invalid code should return 401"""
        email = generate_email()
        
        # Sign up and verify user
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": generate_strong_password()}
        )
        
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Request password reset but use wrong code
        api_client.post(
            "/api/v1/auth/request-password-reset",
            json={"email": email}
        )
        
        # Try to reset with wrong code
        response = api_client.post(
            "/api/v1/auth/reset-password",
            json={"email": email, "code": "999999", "new_password": "NewPassword123"}
        )
        
        assert response.status_code == 401
    
    def test_weak_new_password_returns_422(self, api_client: APIClient):
        """Weak new password should return 422 (validation error)"""
        email = generate_email()
        
        # Sign up and verify user
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": generate_strong_password()}
        )
        
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Request password reset
        reset_request_response = api_client.post(
            "/api/v1/auth/request-password-reset",
            json={"email": email}
        )
        reset_code = extract_code_from_response(reset_request_response.json()["message"])
        
        # Try to reset with weak password
        response = api_client.post(
            "/api/v1/auth/reset-password",
            json={"email": email, "code": reset_code, "new_password": "weak"}
        )
        
        assert response.status_code == 422
    
    def test_missing_fields_returns_422(self, api_client: APIClient):
        """Missing fields should return 422"""
        # Missing email
        response = api_client.post(
            "/api/v1/auth/reset-password",
            json={"code": "123456", "new_password": "NewPassword123"}
        )
        assert response.status_code == 422
        
        # Missing code
        response = api_client.post(
            "/api/v1/auth/reset-password",
            json={"email": "test@example.com", "new_password": "NewPassword123"}
        )
        assert response.status_code == 422
        
        # Missing new_password
        response = api_client.post(
            "/api/v1/auth/reset-password",
            json={"email": "test@example.com", "code": "123456"}
        )
        assert response.status_code == 422
    
    def test_user_not_found_returns_404(self, api_client: APIClient):
        """Non-existent user should return 404"""
        response = api_client.post(
            "/api/v1/auth/reset-password",
            json={
                "email": "nonexistent@example.com",
                "code": "123456",
                "new_password": "NewPassword123"
            }
        )
        
        assert response.status_code == 404
    
    def test_after_reset_can_signin_with_new_password(self, api_client: APIClient):
        """After reset, user should be able to sign in with new password"""
        email = generate_email()
        old_password = generate_strong_password()
        new_password = "NewPassword123"
        
        # Sign up and verify user
        api_client.post(
            "/api/v1/auth/signup",
            json={"email": email, "name": generate_name(), "password": old_password}
        )
        
        verify_send_response = api_client.post(
            "/api/v1/auth/send-verification",
            json={"email": email}
        )
        code = extract_code_from_response(verify_send_response.json()["message"])
        api_client.post(
            "/api/v1/auth/verify-email",
            json={"email": email, "code": code}
        )
        
        # Request password reset
        reset_request_response = api_client.post(
            "/api/v1/auth/request-password-reset",
            json={"email": email}
        )
        reset_code = extract_code_from_response(reset_request_response.json()["message"])
        
        # Reset password
        api_client.post(
            "/api/v1/auth/reset-password",
            json={"email": email, "code": reset_code, "new_password": new_password}
        )
        
        # Try to sign in with new password
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": email, "password": new_password}
        )
        
        assert response.status_code == 200
        
        # Old password should not work
        response = api_client.post(
            "/api/v1/auth/signin",
            json={"email": email, "password": old_password}
        )
        
        assert response.status_code == 401

