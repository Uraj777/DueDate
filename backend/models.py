"""
DueDate - Core Data Models (Python)
Represents Organizations, Members, Payments, Reminders, and Cron Configurations.
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from datetime import datetime, date

@dataclass
class Organization:
    id: str
    org_name: str
    org_type: str  # 'school', 'tuition', 'coaching', 'gym', 'college', 'academy', 'hostel', 'other'
    owner_phone: str
    upi_id: str
    default_fee: float = 2000.0
    due_day_of_month: int = 5
    logo_url: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    @property
    def member_label(self) -> str:
        """Dynamic terminology based on organization type"""
        mapping = {
            'gym': 'Member',
            'school': 'Student',
            'tuition': 'Student',
            'coaching': 'Student',
            'college': 'Student',
            'academy': 'Cadet / Member',
            'hostel': 'Resident',
            'other': 'Member'
        }
        return mapping.get(self.org_type.lower(), 'Member')

@dataclass
class Member:
    id: str
    org_id: str
    name: str
    phone_number: str  # Stored in standardized format e.g. +91XXXXXXXXXX
    guardian_name: Optional[str] = None
    group_name: Optional[str] = None  # Class / Batch / Room / Plan
    fee_amount: float = 2000.0
    joining_date: str = field(default_factory=lambda: date.today().isoformat())
    custom_field: Optional[str] = None
    photo_url: Optional[str] = None
    is_archived: bool = False
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

@dataclass
class Payment:
    id: str
    member_id: str
    org_id: str
    month: int  # 1 - 12
    year: int
    amount_due: float
    amount_paid: float = 0.0
    status: str = 'PENDING'  # 'PAID', 'PENDING', 'PARTIAL'
    paid_date: Optional[str] = None
    payment_method: Optional[str] = None  # 'UPI', 'CASH', 'BANK_TRANSFER', 'CHEQUE'
    notes: Optional[str] = None

    @property
    def remaining_amount(self) -> float:
        return max(0.0, self.amount_due - self.amount_paid)

@dataclass
class ReminderLog:
    id: str
    member_id: str
    org_id: str
    phone_number: str
    message: str
    channel: str = 'WhatsApp'
    delivery_status: str = 'SENT'  # 'SENT', 'FAILED', 'DELIVERED'
    sent_at: str = field(default_factory=lambda: datetime.now().isoformat())
    error_message: Optional[str] = None
