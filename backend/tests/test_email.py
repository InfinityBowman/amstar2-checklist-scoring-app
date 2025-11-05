import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from email.mime.multipart import MIMEMultipart

from app.utils.email import (
    send_email,
    send_verification_email,
    send_password_reset_email,
)
from app.core.config import settings


@pytest.fixture
def mock_smtp_settings():
    """Mock SMTP settings for testing."""
    with patch.object(settings, 'SMTP_USER', 'test@example.com'), \
         patch.object(settings, 'SMTP_PASS', 'test_password'), \
         patch.object(settings, 'SMTP_HOST', 'smtp.gmail.com'), \
         patch.object(settings, 'SMTP_PORT', 587), \
         patch.object(settings, 'EMAIL_FROM', 'test@example.com'), \
         patch.object(settings, 'EMAIL_FROM_NAME', 'Test CoRATES'), \
         patch.object(settings, 'FRONTEND_URL', 'http://localhost:5173'):
        yield


@pytest.mark.asyncio
class TestSendEmail:
    """Test cases for the send_email function."""
    
    async def test_send_email_success(self, mock_smtp_settings):
        """Test successful email sending."""
        with patch('app.utils.email.aiosmtplib.send', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = None
            
            result = await send_email(
                to_email="recipient@example.com",
                subject="Test Subject",
                html_content="<h1>Test HTML</h1>",
                text_content="Test Text"
            )
            
            assert result is True
            mock_send.assert_called_once()
            
            # Verify the message structure
            call_args = mock_send.call_args
            message = call_args[0][0]
            assert isinstance(message, MIMEMultipart)
            assert message["To"] == "recipient@example.com"
            assert message["Subject"] == "Test Subject"
            assert "Test CoRATES" in message["From"]
    
    async def test_send_email_no_smtp_credentials(self):
        """Test email sending fails gracefully when SMTP not configured."""
        with patch.object(settings, 'SMTP_USER', ''), \
             patch.object(settings, 'SMTP_PASS', ''):
            
            result = await send_email(
                to_email="recipient@example.com",
                subject="Test Subject",
                html_content="<h1>Test HTML</h1>"
            )
            
            assert result is False
    
    async def test_send_email_smtp_exception(self, mock_smtp_settings):
        """Test email sending handles SMTP exceptions."""
        import aiosmtplib
        
        with patch('app.utils.email.aiosmtplib.send', new_callable=AsyncMock) as mock_send:
            mock_send.side_effect = aiosmtplib.SMTPException("SMTP connection failed")
            
            result = await send_email(
                to_email="recipient@example.com",
                subject="Test Subject",
                html_content="<h1>Test HTML</h1>"
            )
            
            assert result is False
    
    async def test_send_email_generic_exception(self, mock_smtp_settings):
        """Test email sending handles generic exceptions."""
        with patch('app.utils.email.aiosmtplib.send', new_callable=AsyncMock) as mock_send:
            mock_send.side_effect = Exception("Unexpected error")
            
            result = await send_email(
                to_email="recipient@example.com",
                subject="Test Subject",
                html_content="<h1>Test HTML</h1>"
            )
            
            assert result is False
    
    async def test_send_email_html_only(self, mock_smtp_settings):
        """Test sending email with only HTML content."""
        with patch('app.utils.email.aiosmtplib.send', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = None
            
            result = await send_email(
                to_email="recipient@example.com",
                subject="Test Subject",
                html_content="<h1>Test HTML</h1>"
            )
            
            assert result is True
            mock_send.assert_called_once()


@pytest.mark.asyncio
class TestSendVerificationEmail:
    """Test cases for the send_verification_email function."""
    
    async def test_send_verification_email_success(self, mock_smtp_settings):
        """Test sending verification email successfully."""
        with patch('app.utils.email.send_email', new_callable=AsyncMock) as mock_send_email:
            mock_send_email.return_value = True
            
            result = await send_verification_email("user@example.com", "123456")
            
            assert result is True
            mock_send_email.assert_called_once()
            
            # Verify the email content includes the code
            call_args = mock_send_email.call_args
            assert call_args[0][0] == "user@example.com"
            assert "Verify Your Email" in call_args[0][1]
            assert "123456" in call_args[0][2]  # HTML content
            assert "123456" in call_args[0][3]  # Text content
    
    async def test_send_verification_email_contains_magic_link(self, mock_smtp_settings):
        """Test verification email contains magic link."""
        with patch('app.utils.email.send_email', new_callable=AsyncMock) as mock_send_email:
            mock_send_email.return_value = True
            
            result = await send_verification_email("user@example.com", "123456")
            
            assert result is True
            
            # Verify magic link is in the email
            call_args = mock_send_email.call_args
            html_content = call_args[0][2]
            assert "verify-email?codeSent=true&code=123456" in html_content
    
    async def test_send_verification_email_failure(self, mock_smtp_settings):
        """Test handling verification email send failure."""
        with patch('app.utils.email.send_email', new_callable=AsyncMock) as mock_send_email:
            mock_send_email.return_value = False
            
            result = await send_verification_email("user@example.com", "123456")
            
            assert result is False


@pytest.mark.asyncio
class TestSendPasswordResetEmail:
    """Test cases for the send_password_reset_email function."""
    
    async def test_send_password_reset_email_success(self, mock_smtp_settings):
        """Test sending password reset email successfully."""
        with patch('app.utils.email.send_email', new_callable=AsyncMock) as mock_send_email:
            mock_send_email.return_value = True
            
            result = await send_password_reset_email("user@example.com", "654321")
            
            assert result is True
            mock_send_email.assert_called_once()
            
            # Verify the email content includes the code
            call_args = mock_send_email.call_args
            assert call_args[0][0] == "user@example.com"
            assert "Reset Your Password" in call_args[0][1]
            assert "654321" in call_args[0][2]  # HTML content
            assert "654321" in call_args[0][3]  # Text content
    
    async def test_send_password_reset_email_contains_magic_link(self, mock_smtp_settings):
        """Test password reset email contains magic link."""
        with patch('app.utils.email.send_email', new_callable=AsyncMock) as mock_send_email:
            mock_send_email.return_value = True
            
            result = await send_password_reset_email("user@example.com", "654321")
            
            assert result is True
            
            # Verify magic link is in the email
            call_args = mock_send_email.call_args
            html_content = call_args[0][2]
            assert "reset-password?codeSent=true&code=654321" in html_content
    
    async def test_send_password_reset_email_contains_security_warning(self, mock_smtp_settings):
        """Test password reset email contains security warning."""
        with patch('app.utils.email.send_email', new_callable=AsyncMock) as mock_send_email:
            mock_send_email.return_value = True
            
            result = await send_password_reset_email("user@example.com", "654321")
            
            assert result is True
            
            # Verify security warning is in both HTML and text versions
            call_args = mock_send_email.call_args
            html_content = call_args[0][2]
            text_content = call_args[0][3]
            assert "Security Notice" in html_content or "security" in html_content.lower()
            assert "didn't request" in text_content.lower()
    
    async def test_send_password_reset_email_failure(self, mock_smtp_settings):
        """Test handling password reset email send failure."""
        with patch('app.utils.email.send_email', new_callable=AsyncMock) as mock_send_email:
            mock_send_email.return_value = False
            
            result = await send_password_reset_email("user@example.com", "654321")
            
            assert result is False


@pytest.mark.asyncio
class TestEmailContent:
    """Test cases for email content formatting."""
    
    async def test_verification_email_has_both_html_and_text(self, mock_smtp_settings):
        """Test verification email includes both HTML and plain text versions."""
        with patch('app.utils.email.send_email', new_callable=AsyncMock) as mock_send_email:
            mock_send_email.return_value = True
            
            await send_verification_email("user@example.com", "123456")
            
            call_args = mock_send_email.call_args
            html_content = call_args[0][2]
            text_content = call_args[0][3]
            
            # Both should contain the code
            assert "123456" in html_content
            assert "123456" in text_content
            
            # HTML should have HTML tags
            assert "<html>" in html_content or "<!DOCTYPE html>" in html_content
            
            # Text should not have HTML tags
            assert "<html>" not in text_content and "<!DOCTYPE" not in text_content
    
    async def test_password_reset_email_has_both_html_and_text(self, mock_smtp_settings):
        """Test password reset email includes both HTML and plain text versions."""
        with patch('app.utils.email.send_email', new_callable=AsyncMock) as mock_send_email:
            mock_send_email.return_value = True
            
            await send_password_reset_email("user@example.com", "654321")
            
            call_args = mock_send_email.call_args
            html_content = call_args[0][2]
            text_content = call_args[0][3]
            
            # Both should contain the code
            assert "654321" in html_content
            assert "654321" in text_content
            
            # HTML should have HTML tags
            assert "<html>" in html_content or "<!DOCTYPE html>" in html_content
            
            # Text should not have HTML tags
            assert "<html>" not in text_content and "<!DOCTYPE" not in text_content

