"""
Test data generators using Faker
"""
from faker import Faker

fake = Faker()


def generate_email() -> str:
    """Generate a random email address"""
    return fake.email()


def generate_name() -> str:
    """Generate a random full name"""
    return fake.name()


def generate_strong_password() -> str:
    """Generate a strong password that meets all requirements"""
    # At least 8 chars, uppercase, lowercase, digit
    return "Test1234"


def generate_weak_password_no_uppercase() -> str:
    """Generate password without uppercase"""
    return "test1234"


def generate_weak_password_no_lowercase() -> str:
    """Generate password without lowercase"""
    return "TEST1234"


def generate_weak_password_no_digit() -> str:
    """Generate password without digit"""
    return "Testtest"


def generate_weak_password_too_short() -> str:
    """Generate password that's too short"""
    return "Test12"


def generate_project_name() -> str:
    """Generate a random project name"""
    return f"Project {fake.company()}"


def generate_review_name() -> str:
    """Generate a random review name"""
    return f"Review {fake.catch_phrase()}"

