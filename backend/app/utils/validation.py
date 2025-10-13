def is_valid_email(email: str) -> bool:
    """
    Checks if the email string is valid
    """
    sanitized_email = email.strip()
    if not sanitized_email():
        return False
    
    email_chars = set(sanitized_email)

    # Check if @ and . is in the email
    if ("@" not in email_chars) or ("." not in email_chars):
        return False
    
    # Ensure there is content before/after @ and .
    parts = email_chars.split("@")
    if len(parts) != 2 or not parts[0] or not parts[1]:
        return False
    
    if not parts[1].split(".")[-1]:
        return False

    return True


def is_strong_password(password: str) -> bool:
    """
    Checks if the password meets the minimum criteria.

    Criteria
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if not password:
        return False
    
    # Minimum length check
    if len(password) < 8:
        return False
    
    # At least one uppercase letter
    has_uppercase = any(chr.isupper() for chr in password)

    # At least one lowercase letter
    has_lowercase = any(chr.islower() for chr in password)

    # At least one digit
    has_digit = any(chr.isdigit() for chr in password)

    # At least one special character
    has_special_char = any(not chr.isalnum() and not chr.isspace() for chr in password)

    return has_uppercase and has_lowercase and has_digit and has_special_char
        