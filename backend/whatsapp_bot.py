"""
DueDate - WhatsApp Automation & Template Resolver (Python)
Provides template variable interpolation and the placeholder sendWhatsApp function.
"""

import urllib.parse
from datetime import datetime, date
from typing import Dict, Any, Tuple, Optional

# Default templates
DEFAULT_TEMPLATES = {
    "polite": "Namaste {{guardian_name}}, {{member_name}} ka {{month}} fee Rs {{fee_amount}} due hai {{org_name}} me. Pay kare: {{upi_link}}",
    "firm": "Reminder: {{member_name}} ka fee abhi tak pending hai {{org_name}} me. Kal tak Rs {{fee_amount}} pay kar de. UPI link: {{upi_link}}",
    "formal": "Dear {{guardian_name}}, gentle reminder that the recurring {{month}} dues of Rs {{fee_amount}} for {{member_name}} at {{org_name}} are pending. Kindly complete payment via UPI: {{upi_link}}"
}

def render_message_template(template_str: str, variables: Dict[str, Any]) -> str:
    """
    Substitutes dynamic variables like {{member_name}}, {{guardian_name}}, etc.
    """
    rendered = template_str
    for key, val in variables.items():
        placeholder = f"{{{{{key}}}}}"
        rendered = rendered.replace(placeholder, str(val))
    return rendered

def check_can_send_reminder(member_status: str, last_sent_timestamp: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    Enforces double reminder prevention rules:
    - Never send if already PAID
    - Never send if a reminder was already sent today
    """
    if member_status.upper() == 'PAID':
        return False, "Member fee is already marked as PAID. Reminder not required."

    if last_sent_timestamp:
        try:
            last_date = datetime.fromisoformat(last_sent_timestamp).date()
            if last_date == date.today():
                return False, f"Reminder was already sent today at {last_sent_timestamp[:16]}."
        except Exception:
            pass

    return True, None

def sendWhatsApp(phone: str, message: str) -> Dict[str, Any]:
    """
    Placeholder WhatsApp sender.
    Replace with your Twilio / Gupshup / Wati / Meta Cloud API credentials later.
    """
    clean_phone = phone.replace('+', '').replace(' ', '')
    encoded_text = urllib.parse.quote(message)
    wa_me_url = f"https://wa.me/{clean_phone}?text={encoded_text}"

    # Simulated dispatch log
    print(f"[WhatsApp API Placeholder] Dispatching to {clean_phone}...")
    print(f"[Message]:\n{message}\n")

    return {
        "status": "SENT",
        "channel": "WhatsApp",
        "phone": phone,
        "wa_link": wa_me_url,
        "sent_at": datetime.now().isoformat(),
        "provider": "Placeholder (Ready for Meta Cloud API)"
    }

if __name__ == "__main__":
    sample_vars = {
        "guardian_name": "Rajesh Kumar",
        "member_name": "Aarav Kumar",
        "month": "October",
        "fee_amount": 2500,
        "org_name": "Shanti Public School",
        "upi_link": "upi://pay?pa=shanti@upi&am=2500"
    }
    msg = render_message_template(DEFAULT_TEMPLATES["polite"], sample_vars)
    res = sendWhatsApp("+919811223344", msg)
    print("Result:", res)
