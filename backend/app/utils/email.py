import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Send an email via SMTP.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML version of the email body
        text_content: Plain text version of the email body (optional)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if SMTP is configured
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        logger.warning("SMTP credentials not configured. Email not sent.")
        return False
    
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM or settings.SMTP_USER}>"
        message["To"] = to_email
        
        # Add plain text version if provided, otherwise convert HTML to basic text
        if text_content:
            part1 = MIMEText(text_content, "plain")
            message.attach(part1)
        
        # Add HTML version
        part2 = MIMEText(html_content, "html")
        message.attach(part2)
        
        # Use the simpler send method which handles connection better
        # This is more reliable than manual connection management
        logger.info(f"Attempting to send email to {to_email} via {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        
        # Choose connection method based on port
        # Port 587 uses STARTTLS, Port 465 uses implicit TLS
        use_tls = settings.SMTP_PORT == 465
        use_starttls = settings.SMTP_PORT == 587
        
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASS,
            use_tls=use_tls,  # Use implicit TLS for port 465
            start_tls=use_starttls,  # Use STARTTLS for port 587
            timeout=60,  # Increase timeout for slow networks
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except aiosmtplib.SMTPException as e:
        logger.error(f"SMTP error sending email to {to_email}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending email to {to_email}: {str(e)}")
        return False


async def send_verification_email(email: str, code: str) -> bool:
    """
    Send email verification code to user.
    
    Args:
        email: User's email address
        code: 6-digit verification code
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    subject = "Verify Your Email - CoRATES"
    
    # Create verification link that will trigger auto-verification in frontend
    verification_link = f"{settings.FRONTEND_URL}/verify-email?codeSent=true&code={code}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                border: 1px solid #e5e7eb;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .button {{
                display: inline-block;
                background-color: #4f46e5;
                color: white !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: 600;
                text-align: center;
            }}
            .code {{
                background-color: #f3f4f6;
                color: #1f2937;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                padding: 16px;
                border-radius: 8px;
                letter-spacing: 4px;
                margin: 20px 0;
                font-family: 'Courier New', monospace;
            }}
            .footer {{
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #1f2937; margin: 0;">Verify Your Email</h1>
            </div>
            
            <p>Hello,</p>
            
            <p>Thank you for signing up with CoRATES! Click the button below to verify your email address:</p>
            
            <div style="text-align: center;">
                <a href="{verification_link}" class="button">Verify Email</a>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 20px 0;">
                Or enter this code manually:
            </p>
            
            <div class="code">{code}</div>
            
            <p style="font-size: 14px; color: #6b7280;">This code will expire in 15 minutes.</p>
            
            <p style="font-size: 14px; color: #6b7280;">If you didn't create an account with CoRATES, please ignore this email.</p>
            
            <div class="footer">
                <p>This is an automated message from CoRATES. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
Verify Your Email - CoRATES

Hello,

Thank you for signing up with CoRATES! 

Click the link below to verify your email address:
{verification_link}

Or enter this verification code manually: {code}

This code will expire in 15 minutes.

If you didn't create an account with CoRATES, please ignore this email.

---
This is an automated message from CoRATES. Please do not reply to this email.
    """
    
    return await send_email(email, subject, html_content, text_content)


async def send_password_reset_email(email: str, code: str) -> bool:
    """
    Send password reset code to user.
    
    Args:
        email: User's email address
        code: 6-digit reset code
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    subject = "Reset Your Password - CoRATES"
    
    # Create reset link that directs to frontend reset password page
    reset_link = f"{settings.FRONTEND_URL}/reset-password?codeSent=true&code={code}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                border: 1px solid #e5e7eb;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .button {{
                display: inline-block;
                background-color: #dc2626;
                color: white !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: 600;
                text-align: center;
            }}
            .code {{
                background-color: #f3f4f6;
                color: #1f2937;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                padding: 16px;
                border-radius: 8px;
                letter-spacing: 4px;
                margin: 20px 0;
                font-family: 'Courier New', monospace;
            }}
            .warning {{
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 16px;
                margin: 20px 0;
                border-radius: 4px;
            }}
            .footer {{
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #1f2937; margin: 0;">Reset Your Password</h1>
            </div>
            
            <p>Hello,</p>
            
            <p>We received a request to reset the password for your CoRATES account. Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 20px 0;">
                Or enter this code manually:
            </p>
            
            <div class="code">{code}</div>
            
            <p style="font-size: 14px; color: #6b7280;">This code will expire in 15 minutes.</p>
            
            <div class="warning">
                <strong style="color: #92400e;">⚠️ Security Notice:</strong>
                <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px;">
                    If you didn't request a password reset, please ignore this email and ensure your account is secure.
                </p>
            </div>
            
            <div class="footer">
                <p>This is an automated message from CoRATES. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
Reset Your Password - CoRATES

Hello,

We received a request to reset the password for your CoRATES account.

Click the link below to reset your password:
{reset_link}

Or enter this reset code manually: {code}

This code will expire in 15 minutes.

⚠️ SECURITY NOTICE: If you didn't request a password reset, please ignore this email and ensure your account is secure.

---
This is an automated message from CoRATES. Please do not reply to this email.
    """
    
    return await send_email(email, subject, html_content, text_content)

