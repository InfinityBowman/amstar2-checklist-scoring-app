from typing import Tuple

def is_valid_email(email: str) -> Tuple[bool, str]:
    """
    Checks if the email string is valid

    Returns (True, "") on success, or (False, detailed error message) on failure.
    """
    sanitized_email = email.strip()
    if not sanitized_email():
        return (False, "Email is missing.")
    
    parts = email.split("@")

    if len(parts) != 2:
        return (False, "Email must contain exactly one '@' symbol.")
    
    local_part, domain_part = parts
    
    if not local_part or not domain_part:
        return (False, "Email must have content before and after the '@' symbol.")
    
    if "." not in domain_part:
        return (False, "Email domain must contain a '.' symbol.")
    
    if not domain_part.split(".")[-1]:
        return (False, "Email domain must have a top-level extension (e.g., .com).")
    
    return (True, "")


def is_strong_password(password: str) -> Tuple[bool, str]:
    """
    Checks if the password meets the minimum criteria.

    Criteria
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character

    Returns (True, "") on success, or (False, detailed error message) on failure.
    """
    if not password.strip():
        return (False, "Password is required.")
    
    # Minimum length check
    if len(password) < 8:
        return (False, "Password must be at least 8 characters long.")
    
    # At least one uppercase letter
    if not any(chr.isupper() for chr in password):
        return (False, "Password must contain at least one uppercase letter.")

    # At least one lowercase letter
    if not any(chr.islower() for chr in password):
        return (False, "Password must contain at least one lowercase letter.")

    # At least one digit
    if not any(chr.isdigit() for chr in password):
        return (False, "Password must contain at least one digit.")

    # At least one special character
    if not any(not chr.isalnum() and not chr.isspace() for chr in password):
        return (False, "Password must contain at least one special character (symbol or punctuation)")

    return (True, "")
        