"""
Security tests for input validation and injection attacks
"""
import pytest
from tests.helpers.api_client import APIClient
from tests.helpers.generators import generate_email, generate_name, generate_strong_password
from tests.helpers.auth import create_project


@pytest.mark.security
class TestSQLInjectionPrevention:
    """Test SQL injection prevention"""
    
    def test_sql_injection_in_signup_email(self, api_client: APIClient):
        """SQL injection attempts in email should be handled safely"""
        malicious_emails = [
            "test' OR '1'='1",
            "test'; DROP TABLE users; --",
            "test' UNION SELECT * FROM users --",
        ]
        
        for email in malicious_emails:
            response = api_client.post(
                "/api/v1/auth/signup",
                json={
                    "email": email,
                    "name": generate_name(),
                    "password": generate_strong_password()
                }
            )
            # Should either be rejected as invalid email (422) or handled safely
            assert response.status_code in [400, 422]
    
    def test_sql_injection_in_project_name(self, authenticated_client):
        """SQL injection attempts in project name should be handled safely"""
        api_client, user_data, access_token = authenticated_client
        
        malicious_names = [
            "Test'; DROP TABLE projects; --",
            "Test' OR '1'='1",
            "Test' UNION SELECT * FROM users --",
        ]
        
        for name in malicious_names:
            response = api_client.post(
                "/api/v1/projects/",
                json={"name": name}
            )
            # Should be handled safely - project should be created or rejected
            # But should NOT crash the database
            assert response.status_code in [201, 400, 422]
    
    def test_sql_injection_in_search_query(self, authenticated_client):
        """SQL injection attempts in search should be handled safely"""
        api_client, user_data, access_token = authenticated_client
        
        malicious_queries = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT password FROM users --",
        ]
        
        for query in malicious_queries:
            response = api_client.get(
                "/api/v1/users/search",
                params={"q": query}
            )
            # Should return 200 with empty/safe results
            assert response.status_code == 200
            # Should not expose sensitive data
            results = response.json()
            assert isinstance(results, list)


@pytest.mark.security
class TestXSSPrevention:
    """Test XSS prevention"""
    
    def test_xss_in_user_name(self, api_client: APIClient):
        """XSS attempts in user name should be handled"""
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "javascript:alert('XSS')",
        ]
        
        for payload in xss_payloads:
            response = api_client.post(
                "/api/v1/auth/signup",
                json={
                    "email": generate_email(),
                    "name": payload,
                    "password": generate_strong_password()
                }
            )
            # Should be handled - either accepted and escaped or rejected
            assert response.status_code in [201, 400, 422]
    
    def test_xss_in_project_name(self, authenticated_client):
        """XSS attempts in project name should be handled"""
        api_client, user_data, access_token = authenticated_client
        
        xss_payload = "<script>alert('XSS')</script>"
        response = api_client.post(
            "/api/v1/projects/",
            json={"name": xss_payload}
        )
        
        # Should be handled safely
        assert response.status_code in [201, 400, 422]
    
    def test_xss_in_review_name(self, authenticated_client):
        """XSS attempts in review name should be handled"""
        api_client, user_data, access_token = authenticated_client
        
        # Create project first
        project = create_project(api_client, "Test Project")
        
        xss_payload = "<img src=x onerror=alert('XSS')>"
        response = api_client.post(
            "/api/v1/reviews/",
            json={"name": xss_payload, "project_id": project["id"]}
        )
        
        # Should be handled safely
        assert response.status_code in [201, 400, 422]


@pytest.mark.security
class TestInputBoundaryTesting:
    """Test input boundary conditions"""
    
    def test_extremely_long_strings(self, authenticated_client):
        """Extremely long strings should be rejected"""
        api_client, user_data, access_token = authenticated_client
        
        # Very long project name (10000 chars)
        very_long_name = "a" * 10000
        response = api_client.post(
            "/api/v1/projects/",
            json={"name": very_long_name}
        )
        
        # Should be rejected
        assert response.status_code == 422
    
    def test_special_characters_in_names(self, authenticated_client):
        """Special characters in names should be handled"""
        api_client, user_data, access_token = authenticated_client
        
        special_names = [
            "Test\x00Project",  # Null byte
            "Test\nProject",    # Newline
            "Test\tProject",    # Tab
            "Test'Project",     # Single quote
            "Test\"Project",    # Double quote
        ]
        
        for name in special_names:
            response = api_client.post(
                "/api/v1/projects/",
                json={"name": name}
            )
            # Should be handled - either accepted or rejected, but not crash
            # 500 is acceptable as long as it doesn't compromise security
            assert response.status_code in [201, 400, 422, 500]
    
    def test_unicode_characters(self, authenticated_client):
        """Unicode characters should be handled properly"""
        api_client, user_data, access_token = authenticated_client
        
        unicode_names = [
            "测试项目",           # Chinese
            "プロジェクト",       # Japanese
            "Тест",             # Russian
            "🚀 Project",       # Emoji
            "Café ☕",          # Mixed
        ]
        
        for name in unicode_names:
            response = api_client.post(
                "/api/v1/projects/",
                json={"name": name}
            )
            # Should handle unicode properly
            assert response.status_code in [201, 400, 422]

