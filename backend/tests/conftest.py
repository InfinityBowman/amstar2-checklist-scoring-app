"""
Shared pytest fixtures and configuration
"""
import pytest
import os
from typing import Generator
from tests.helpers.api_client import APIClient
from tests.helpers.generators import generate_email, generate_name, generate_strong_password
from tests.helpers.auth import create_user_and_get_token


# Base URL for API - can be overridden with environment variable
API_BASE_URL = os.getenv("TEST_API_BASE_URL", "http://localhost:8000")


@pytest.fixture(scope="function")
def api_client() -> Generator[APIClient, None, None]:
    """
    Provide an API client for testing.
    Each test gets a fresh client instance.
    """
    client = APIClient(base_url=API_BASE_URL)
    yield client
    client.close()


@pytest.fixture(scope="function")
def authenticated_client(api_client: APIClient) -> Generator[tuple, None, None]:
    """
    Provide an authenticated API client with a verified user.
    
    Returns:
        Tuple of (api_client, user_data, access_token)
    """
    email = generate_email()
    name = generate_name()
    password = generate_strong_password()
    
    user_data, access_token = create_user_and_get_token(
        api_client, email, name, password
    )
    
    # Set token on the client
    api_client.set_token(access_token)
    
    yield api_client, user_data, access_token
    
    # Cleanup: clear token
    api_client.clear_token()


@pytest.fixture(scope="function")
def two_authenticated_clients(api_client: APIClient) -> Generator[tuple, None, None]:
    """
    Provide two separate authenticated users for multi-user tests.
    
    Returns:
        Tuple of ((user1_data, token1), (user2_data, token2), api_client)
    """
    # Create first user
    email1 = generate_email()
    name1 = generate_name()
    password1 = generate_strong_password()
    user1_data, token1 = create_user_and_get_token(
        api_client, email1, name1, password1
    )
    
    # Create second user
    email2 = generate_email()
    name2 = generate_name()
    password2 = generate_strong_password()
    user2_data, token2 = create_user_and_get_token(
        api_client, email2, name2, password2
    )
    
    yield (user1_data, token1), (user2_data, token2), api_client
    
    # Cleanup
    api_client.clear_token()

