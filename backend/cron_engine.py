"""
DueDate - Cron Automation & IST Timezone Engine (Python)
Automates payment reminder triggers relative to due date:
- Day -2 (48 hours before due date)
- Day 0 (On Due Date)
- Day +3 (3 days overdue)
- Day +7 (1 week overdue)
- Day +10 (Critical overdue)
Enforces IST (Asia/Kolkata) timezone.
"""

from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Tuple

IST = timezone(timedelta(hours=5, minutes=30))

def get_current_ist_time() -> datetime:
    """Returns current datetime in IST (UTC+05:30) using built-in standard library"""
    return datetime.now(IST)

def evaluate_reminder_trigger(due_day: int, target_days_offsets: List[int] = None) -> Tuple[bool, int, str]:
    """
    Checks if today matches any scheduled reminder offset.
    e.g. if due_day is 5th, and today is 3rd: offset = -2 -> Trigger Day -2
    """
    if target_days_offsets is None:
        target_days_offsets = [-2, 0, 3, 7, 10]

    now_ist = get_current_ist_time()
    today_day = now_ist.day
    offset = today_day - due_day

    if offset in target_days_offsets:
        if offset < 0:
            label = f"Day {offset} (Upcoming in {abs(offset)} days)"
        elif offset == 0:
            label = "Day 0 (Due Date Today!)"
        else:
            label = f"Day +{offset} (Overdue by {offset} days)"
        return True, offset, label

    return False, offset, f"No trigger for Day {offset}"

def calculate_month_rollover(joining_date_str: str, payments_history: List[Dict[str, Any]], current_month: int, current_year: int, fee_amount: float) -> Dict[str, Any]:
    """
    Auto rolls over unpaid months.
    If April not paid till May, shows April pending + May pending separately with cumulative total.
    """
    unpaid_months = []
    total_arrears = 0.0

    # Map existing recorded payments
    payment_map = {(p['month'], p['year']): p for p in payments_history}

    current_payment = payment_map.get((current_month, current_year))
    current_status = current_payment.get('status', 'PENDING') if current_payment else 'PENDING'
    current_paid = current_payment.get('amount_paid', 0.0) if current_payment else 0.0
    current_due = fee_amount - current_paid

    # Check previous month for arrears
    prev_month = 12 if current_month == 1 else current_month - 1
    prev_year = current_year - 1 if current_month == 1 else current_year

    prev_payment = payment_map.get((prev_month, prev_year))
    if prev_payment:
        if prev_payment.get('status') != 'PAID':
            prev_due = prev_payment.get('amount_due', fee_amount) - prev_payment.get('amount_paid', 0.0)
            if prev_due > 0:
                unpaid_months.append({
                    'month': prev_month,
                    'year': prev_year,
                    'amount_due': prev_due,
                    'is_arrear': True
                })
                total_arrears += prev_due

    total_outstanding = current_due + total_arrears

    return {
        'current_month_due': current_due,
        'current_status': current_status,
        'has_arrears': len(unpaid_months) > 0,
        'arrears_list': unpaid_months,
        'total_arrears': total_arrears,
        'total_outstanding': total_outstanding
    }

if __name__ == "__main__":
    now = get_current_ist_time()
    print("Current IST Time:", now.strftime("%Y-%m-%d %H:%M:%S IST"))
    should_run, off, desc = evaluate_reminder_trigger(due_day=now.day + 2)
    print("Evaluation:", should_run, off, desc)
