"""
DueDate - Phone Validator & Normalizer (Python)
Strictly enforces Indian phone numbers:
- Strips spaces, dashes, parentheses
- Auto-adds +91 prefix
- Verifies exact 10-digit mobile number
- Detects invalid lengths and malformed values
"""

import re
from typing import Tuple, Optional

def normalize_phone_number(raw_phone: str) -> Tuple[bool, str, Optional[str]]:
    """
    Cleans and standardizes an Indian phone number.
    Returns: (is_valid, cleaned_formatted_phone, error_message)
    Example:
      '98112 23344' -> (True, '+919811223344', None)
      '09811223344' -> (True, '+919811223344', None)
      '+91 9811223344' -> (True, '+919811223344', None)
      '12345' -> (False, '', 'Phone number must have 10 digits')
    """
    if not raw_phone or not isinstance(raw_phone, str):
        return False, "", "Phone number cannot be empty."

    # Remove all non-digit characters except leading plus
    cleaned = re.sub(r'[\s\-\(\)\.]', '', raw_phone.strip())

    # If it starts with +91, strip it for digit inspection
    if cleaned.startswith('+91'):
        digits = cleaned[3:]
    elif cleaned.startswith('91') and len(cleaned) == 12:
        digits = cleaned[2:]
    elif cleaned.startswith('0') and len(cleaned) == 11:
        digits = cleaned[1:]
    else:
        digits = re.sub(r'\D', '', cleaned)

    # Validate 10 digits and valid mobile starting digit (6, 7, 8, 9 for India)
    if len(digits) != 10:
        return False, "", f"Phone number must have exactly 10 digits (got {len(digits)})."

    if not re.match(r'^[6-9]\d{9}$', digits):
        return False, "", "Phone number must start with 6, 7, 8, or 9 for Indian mobile numbers."

    formatted = f"+91{digits}"
    return True, formatted, None

def check_duplicate_member(existing_members: list, name: str, phone: str) -> Tuple[bool, Optional[str]]:
    """
    Verifies if a member with the same normalized phone or same name+phone already exists.
    """
    is_valid, normalized_phone, _ = normalize_phone_number(phone)
    name_clean = name.strip().lower()

    for m in existing_members:
        existing_phone = getattr(m, 'phone_number', '') if hasattr(m, 'phone_number') else m.get('phone_number', '')
        existing_name = (getattr(m, 'name', '') if hasattr(m, 'name') else m.get('name', '')).strip().lower()

        if is_valid and existing_phone == normalized_phone:
            if existing_name == name_clean:
                return True, f"Member '{name}' with phone {normalized_phone} already exists."
            return True, f"A member with phone {normalized_phone} is already registered as '{existing_name}'."

    return False, None

if __name__ == "__main__":
    test_cases = ["9811223344", " 98112-23344 ", "+91 98112 23344", "09811223344", "123456", "981122334455"]
    for test in test_cases:
        valid, formatted, err = normalize_phone_number(test)
        print(f"'{test}' -> Valid: {valid}, Formatted: '{formatted}', Error: '{err}'")
