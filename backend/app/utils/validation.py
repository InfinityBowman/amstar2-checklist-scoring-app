from typing import Tuple


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
        