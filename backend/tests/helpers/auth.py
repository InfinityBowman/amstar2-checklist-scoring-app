"""
Authentication helper functions for testing
"""
import re
from typing import Dict, Tuple, Optional
from .api_client import APIClient


def create_user_and_get_token(
    client: APIClient,
    email: str,
    name: str,
    password: str
) -> Tuple[Dict, str]:
    """
    Create a user, verify email, and return user data with access token.
    
    Returns:
        Tuple of (user_data, access_token)
    """
    # 1. Sign up
    signup_response = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "name": name, "password": password}
    )
    assert signup_response.status_code == 201, f"Signup failed: {signup_response.text}"
    user_data = signup_response.json()["user"]
    
    # 2. Send verification code
    verify_send_response = client.post(
        "/api/v1/auth/send-verification",
        json={"email": email}
    )
    assert verify_send_response.status_code == 200, f"Send verification failed: {verify_send_response.text}"
    
    # Extract verification code from response (dev mode)
    code_match = re.search(r"CODE: (\d{6})", verify_send_response.json()["message"])
    assert code_match, "Verification code not found in response"
    verification_code = code_match.group(1)
    
    # 3. Verify email
    verify_response = client.post(
        "/api/v1/auth/verify-email",
        json={"email": email, "code": verification_code}
    )
    assert verify_response.status_code == 200, f"Email verification failed: {verify_response.text}"
    
    # 4. Sign in to get access token
    signin_response = client.post(
        "/api/v1/auth/signin",
        json={"email": email, "password": password}
    )
    assert signin_response.status_code == 200, f"Signin failed: {signin_response.text}"
    access_token = signin_response.json()["accessToken"]
    
    return user_data, access_token


def extract_code_from_response(response_message: str) -> Optional[str]:
    """Extract verification/reset code from API response message"""
    code_match = re.search(r"CODE: (\d{6})", response_message)
    return code_match.group(1) if code_match else None

