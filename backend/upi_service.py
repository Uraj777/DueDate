"""
DueDate - UPI Link Generator & Validator (Python)
Auto-generates UPI intent links and validates UPI VPA format.
"""

import re
import urllib.parse
from typing import Tuple, Optional

UPI_REGEX = re.compile(r'^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9]{2,64}$')

def validate_upi_id(upi_id: str) -> Tuple[bool, Optional[str]]:
    """
    Validates the UPI Virtual Payment Address (VPA) format (e.g. name@okhdfcbank, institute@upi)
    """
    if not upi_id or not isinstance(upi_id, str):
        return False, "UPI ID cannot be blank."

    clean = upi_id.strip()
    if not UPI_REGEX.match(clean):
        return False, "UPI galat hai (Format must be user@bank e.g. shantischool@upi)."

    return True, None

def generate_upi_payment_link(upi_id: str, amount: float, payee_name: str, transaction_note: str) -> str:
    """
    Generates standard UPI intent string:
    upi://pay?pa=...&pn=...&am=...&tn=...&cu=INR
    """
    params = {
        'pa': upi_id.strip(),
        'pn': payee_name.strip(),
        'am': f"{amount:.2f}",
        'tn': transaction_note.strip(),
        'cu': 'INR'
    }
    query_string = urllib.parse.urlencode(params)
    return f"upi://pay?{query_string}"

if __name__ == "__main__":
    print(validate_upi_id("shanti@upi"))
    print(validate_upi_id("invalid-upi"))
    print(generate_upi_payment_link("shanti@upi", 2500, "Shanti School", "October 2026 fee"))
