/**
 * DueDate - Domain Types & Constants (JavaScript)
 * Configures dynamic organization types, labels, templates, and initial records.
 */

export const ORG_TYPES = {
  gym: {
    id: 'gym',
    name: 'Gym & Fitness Center',
    memberLabel: 'Member',
    memberLabelPlural: 'Members',
    groupLabel: 'Slot / Plan',
    guardianLabel: 'Emergency Contact',
    defaultFee: 2000,
    icon: 'Dumbbell',
    color: 'emerald'
  },
  school: {
    id: 'school',
    name: 'School',
    memberLabel: 'Student',
    memberLabelPlural: 'Students',
    groupLabel: 'Class & Section',
    guardianLabel: 'Parent / Guardian',
    defaultFee: 3500,
    icon: 'GraduationCap',
    color: 'rose'
  },
  coaching: {
    id: 'coaching',
    name: 'Coaching & Test Prep',
    memberLabel: 'Student',
    memberLabelPlural: 'Students',
    groupLabel: 'Target Batch',
    guardianLabel: 'Parent',
    defaultFee: 5000,
    icon: 'BookOpen',
    color: 'amber'
  },
  tuition: {
    id: 'tuition',
    name: 'Tuition Center',
    memberLabel: 'Student',
    memberLabelPlural: 'Students',
    groupLabel: 'Batch / Subject',
    guardianLabel: 'Parent',
    defaultFee: 1500,
    icon: 'Users',
    color: 'blue'
  },
  hostel: {
    id: 'hostel',
    name: 'Hostel & PG',
    memberLabel: 'Resident',
    memberLabelPlural: 'Residents',
    groupLabel: 'Room / Block',
    guardianLabel: 'Local Guardian',
    defaultFee: 8500,
    icon: 'Building2',
    color: 'purple'
  },
  academy: {
    id: 'academy',
    name: 'Sports / Dance Academy',
    memberLabel: 'Cadet / Trainee',
    memberLabelPlural: 'Cadets',
    groupLabel: 'Discipline / Batch',
    guardianLabel: 'Parent / Sponsor',
    defaultFee: 3000,
    icon: 'Trophy',
    color: 'orange'
  },
  college: {
    id: 'college',
    name: 'College / Institute',
    memberLabel: 'Student',
    memberLabelPlural: 'Students',
    groupLabel: 'Department / Year',
    guardianLabel: 'Guardian',
    defaultFee: 12000,
    icon: 'Landmark',
    color: 'indigo'
  },
  other: {
    id: 'other',
    name: 'Club / Society / Other',
    memberLabel: 'Member',
    memberLabelPlural: 'Members',
    groupLabel: 'Wing / Wing Flat',
    guardianLabel: 'Contact Person',
    defaultFee: 1000,
    icon: 'ShieldCheck',
    color: 'slate'
  }
};

export const DEFAULT_TEMPLATES = {
  polite: "Namaste {{guardian_name}}, {{member_name}} ka {{month}} fee Rs {{fee_amount}} due hai {{org_name}} me. Pay kare: {{upi_link}}",
  firm: "Reminder: {{member_name}} ka fee abhi tak pending hai {{org_name}} me. Kal tak Rs {{fee_amount}} pay kar de. UPI link: {{upi_link}}",
  formal: "Dear {{guardian_name}}, gentle reminder that the recurring {{month}} dues of Rs {{fee_amount}} for {{member_name}} at {{org_name}} are pending. Kindly complete payment via UPI: {{upi_link}}"
};

export const INITIAL_ORGANIZATIONS = [
  {
    id: 'org-gym-01',
    org_name: 'IronPulse Elite Gym',
    org_type: 'gym',
    logo_icon: 'Dumbbell',
    owner_phone: '+919876543210',
    upi_id: 'ironpulse@upi',
    default_fee: 2500,
    due_day: 5,
    custom_tagline: 'Strength & Conditioning Academy'
  },
  {
    id: 'org-school-01',
    org_name: 'Shanti Vidya Mandir',
    org_type: 'school',
    logo_icon: 'GraduationCap',
    owner_phone: '+919811223344',
    upi_id: 'shantischool@okhdfcbank',
    default_fee: 3800,
    due_day: 10,
    custom_tagline: 'CBSE Affiliated Senior Secondary'
  },
  {
    id: 'org-coaching-01',
    org_name: 'Apex JEE & NEET Coaching',
    org_type: 'coaching',
    logo_icon: 'BookOpen',
    owner_phone: '+919822334455',
    upi_id: 'apexprep@icici',
    default_fee: 6500,
    due_day: 5,
    custom_tagline: 'Premier Engineering & Medical Entrance'
  },
  {
    id: 'org-hostel-01',
    org_name: 'Greenwood Executive Hostel',
    org_type: 'hostel',
    logo_icon: 'Building2',
    owner_phone: '+919833445566',
    upi_id: 'greenwoodhostel@paytm',
    default_fee: 9000,
    due_day: 7,
    custom_tagline: 'Student & Working Professional Residency'
  }
];

export const INITIAL_MEMBERS = [
  // 1-5: IronPulse Gym
  {
    id: 'mem-01',
    org_id: 'org-gym-01',
    name: 'Kabir Verma',
    guardian_name: 'Sunil Verma',
    phone_number: '+919871100221',
    group_name: 'Morning Crossfit (6 AM)',
    fee_amount: 2500,
    joining_date: '2026-01-15',
    custom_field: 'Locker #42',
    is_archived: false
  },
  {
    id: 'mem-02',
    org_id: 'org-gym-01',
    name: 'Ananya Sharma',
    guardian_name: 'Deepak Sharma',
    phone_number: '+919820011442',
    group_name: 'Evening Strength (7 PM)',
    fee_amount: 3000,
    joining_date: '2026-02-01',
    custom_field: 'Personal Trainer Pkg',
    is_archived: false
  },
  {
    id: 'mem-03',
    org_id: 'org-gym-01',
    name: 'Rohan Deshmukh',
    guardian_name: 'Meena Deshmukh',
    phone_number: '+919833445511',
    group_name: 'Morning Crossfit (6 AM)',
    fee_amount: 2500,
    joining_date: '2026-03-10',
    custom_field: 'General Member',
    is_archived: false
  },
  {
    id: 'mem-04',
    org_id: 'org-gym-01',
    name: 'Priya Nambiar',
    guardian_name: 'K. Nambiar',
    phone_number: '+919844556622',
    group_name: 'Yoga & Mobility Slot',
    fee_amount: 2000,
    joining_date: '2026-04-05',
    custom_field: 'Locker #18',
    is_archived: false
  },

  // 5-8: Shanti Vidya Mandir (School)
  {
    id: 'mem-05',
    org_id: 'org-school-01',
    name: 'Aarav Gupta',
    guardian_name: 'Vikram Gupta',
    phone_number: '+919811009988',
    group_name: 'Class 10-A (Science)',
    fee_amount: 3800,
    joining_date: '2026-04-01',
    custom_field: 'Roll #14, Bus Route #3',
    is_archived: false
  },
  {
    id: 'mem-06',
    org_id: 'org-school-01',
    name: 'Diya Sen',
    guardian_name: 'Amit Sen',
    phone_number: '+919822338877',
    group_name: 'Class 10-B',
    fee_amount: 3800,
    joining_date: '2026-04-01',
    custom_field: 'Roll #22',
    is_archived: false
  },
  {
    id: 'mem-07',
    org_id: 'org-school-01',
    name: 'Tanmay Joshi',
    guardian_name: 'Suresh Joshi',
    phone_number: '+919833112244',
    group_name: 'Class 8-C',
    fee_amount: 3200,
    joining_date: '2026-04-01',
    custom_field: 'Roll #08',
    is_archived: false
  },
  {
    id: 'mem-08',
    org_id: 'org-school-01',
    name: 'Isha Malhotra',
    guardian_name: 'Rajeev Malhotra',
    phone_number: '+919844002233',
    group_name: 'Class 12-Commerce',
    fee_amount: 4200,
    joining_date: '2026-04-01',
    custom_field: 'Roll #03, Computer Elective',
    is_archived: false
  },

  // 9-12: Apex JEE & NEET Coaching
  {
    id: 'mem-09',
    org_id: 'org-coaching-01',
    name: 'Devansh Rathore',
    guardian_name: 'Mahesh Rathore',
    phone_number: '+919855112233',
    group_name: 'JEE Advanced Rankers (Batch A1)',
    fee_amount: 6500,
    joining_date: '2026-05-10',
    custom_field: 'Scholarship 15%',
    is_archived: false
  },
  {
    id: 'mem-10',
    org_id: 'org-coaching-01',
    name: 'Sneha Kulkarni',
    guardian_name: 'Anand Kulkarni',
    phone_number: '+919866223344',
    group_name: 'NEET Target 2027 (Batch N2)',
    fee_amount: 6500,
    joining_date: '2026-05-15',
    custom_field: 'Hostel Resident',
    is_archived: false
  },
  {
    id: 'mem-11',
    org_id: 'org-coaching-01',
    name: 'Aditya Mehta',
    guardian_name: 'Pradeep Mehta',
    phone_number: '+919877334455',
    group_name: 'Foundation Class 9-10',
    fee_amount: 4500,
    joining_date: '2026-06-01',
    custom_field: 'Weekend Batch',
    is_archived: false
  },
  {
    id: 'mem-12',
    org_id: 'org-coaching-01',
    name: 'Ritika Roy',
    guardian_name: 'Subhash Roy',
    phone_number: '+919888445566',
    group_name: 'JEE Advanced Rankers (Batch A1)',
    fee_amount: 6500,
    joining_date: '2026-05-10',
    custom_field: 'Target IIT Bombay',
    is_archived: false
  },

  // 13-15: Greenwood Executive Hostel
  {
    id: 'mem-13',
    org_id: 'org-hostel-01',
    name: 'Manish Chawla',
    guardian_name: 'Harish Chawla',
    phone_number: '+919899556677',
    group_name: 'Block B - Room 204 (AC Single)',
    fee_amount: 11000,
    joining_date: '2026-02-15',
    custom_field: 'Mess Plan Included',
    is_archived: false
  },
  {
    id: 'mem-14',
    org_id: 'org-hostel-01',
    name: 'Pooja Reddy',
    guardian_name: 'Venkat Reddy',
    phone_number: '+919811667788',
    group_name: 'Block A - Room 102 (Double Sharing)',
    fee_amount: 8000,
    joining_date: '2026-03-01',
    custom_field: 'Biometric Card #88',
    is_archived: false
  },
  {
    id: 'mem-15',
    org_id: 'org-hostel-01',
    name: 'Arjun Singhania',
    guardian_name: 'Naveen Singhania',
    phone_number: '+919822778899',
    group_name: 'Block B - Room 310 (AC Single)',
    fee_amount: 11000,
    joining_date: '2026-04-10',
    custom_field: 'Parking Slot #04',
    is_archived: false
  }
];

export const INITIAL_PAYMENTS = [
  // Current month: October 2026 (Month 10)
  // IronPulse Gym
  {
    id: 'pay-01',
    member_id: 'mem-01',
    org_id: 'org-gym-01',
    month: 10,
    year: 2026,
    amount_due: 2500,
    amount_paid: 2500,
    status: 'PAID',
    paid_date: '2026-10-04T10:15:00',
    payment_method: 'UPI',
    notes: 'Paid via GPay UPI ref #948271'
  },
  {
    id: 'pay-02',
    member_id: 'mem-02',
    org_id: 'org-gym-01',
    month: 10,
    year: 2026,
    amount_due: 3000,
    amount_paid: 1000,
    status: 'PARTIAL',
    paid_date: '2026-10-06T18:30:00',
    payment_method: 'CASH',
    notes: 'Paid 1000 cash, balance 2000 promised on 15th'
  },
  {
    id: 'pay-03',
    member_id: 'mem-03',
    org_id: 'org-gym-01',
    month: 10,
    year: 2026,
    amount_due: 2500,
    amount_paid: 0,
    status: 'PENDING',
    paid_date: null,
    payment_method: null,
    notes: 'Due on 5th Oct - Overdue'
  },
  {
    id: 'pay-04',
    member_id: 'mem-04',
    org_id: 'org-gym-01',
    month: 10,
    year: 2026,
    amount_due: 2000,
    amount_paid: 2000,
    status: 'PAID',
    paid_date: '2026-10-05T09:40:00',
    payment_method: 'UPI',
    notes: 'PhonePe QR scan'
  },

  // Shanti School
  {
    id: 'pay-05',
    member_id: 'mem-05',
    org_id: 'org-school-01',
    month: 10,
    year: 2026,
    amount_due: 3800,
    amount_paid: 3800,
    status: 'PAID',
    paid_date: '2026-10-08T11:20:00',
    payment_method: 'UPI',
    notes: 'Fee desk online portal'
  },
  {
    id: 'pay-06',
    member_id: 'mem-06',
    org_id: 'org-school-01',
    month: 10,
    year: 2026,
    amount_due: 3800,
    amount_paid: 0,
    status: 'PENDING',
    paid_date: null,
    payment_method: null,
    notes: 'Due on 10th'
  },
  {
    id: 'pay-07',
    member_id: 'mem-07',
    org_id: 'org-school-01',
    month: 10,
    year: 2026,
    amount_due: 3200,
    amount_paid: 1500,
    status: 'PARTIAL',
    paid_date: '2026-10-07T14:10:00',
    payment_method: 'CHEQUE',
    notes: 'Chq #39102 cleared for 1500, balance 1700'
  },
  {
    id: 'pay-08',
    member_id: 'mem-08',
    org_id: 'org-school-01',
    month: 10,
    year: 2026,
    amount_due: 4200,
    amount_paid: 0,
    status: 'PENDING',
    paid_date: null,
    payment_method: null,
    notes: 'Father requested till Monday'
  },

  // Coaching
  {
    id: 'pay-09',
    member_id: 'mem-09',
    org_id: 'org-coaching-01',
    month: 10,
    year: 2026,
    amount_due: 6500,
    amount_paid: 6500,
    status: 'PAID',
    paid_date: '2026-10-02T16:00:00',
    payment_method: 'BANK_TRANSFER',
    notes: 'NEFT Transfer HDFC00018'
  },
  {
    id: 'pay-10',
    member_id: 'mem-10',
    org_id: 'org-coaching-01',
    month: 10,
    year: 2026,
    amount_due: 6500,
    amount_paid: 3000,
    status: 'PARTIAL',
    paid_date: '2026-10-05T12:00:00',
    payment_method: 'UPI',
    notes: 'Installment 1 paid'
  },
  {
    id: 'pay-11',
    member_id: 'mem-11',
    org_id: 'org-coaching-01',
    month: 10,
    year: 2026,
    amount_due: 4500,
    amount_paid: 0,
    status: 'PENDING',
    paid_date: null,
    payment_method: null,
    notes: 'Reminder Day 3 sent'
  },
  {
    id: 'pay-12',
    member_id: 'mem-12',
    org_id: 'org-coaching-01',
    month: 10,
    year: 2026,
    amount_due: 6500,
    amount_paid: 6500,
    status: 'PAID',
    paid_date: '2026-10-05T15:20:00',
    payment_method: 'UPI',
    notes: 'Paytm UPI transaction'
  },

  // Hostel
  {
    id: 'pay-13',
    member_id: 'mem-13',
    org_id: 'org-hostel-01',
    month: 10,
    year: 2026,
    amount_due: 11000,
    amount_paid: 11000,
    status: 'PAID',
    paid_date: '2026-10-06T19:00:00',
    payment_method: 'UPI',
    notes: 'Advance room rent cleared'
  },
  {
    id: 'pay-14',
    member_id: 'mem-14',
    org_id: 'org-hostel-01',
    month: 10,
    year: 2026,
    amount_due: 8000,
    amount_paid: 4000,
    status: 'PARTIAL',
    paid_date: '2026-10-07T11:45:00',
    payment_method: 'CASH',
    notes: 'Remaining 4000 due on 15th'
  },
  {
    id: 'pay-15',
    member_id: 'mem-15',
    org_id: 'org-hostel-01',
    month: 10,
    year: 2026,
    amount_due: 11000,
    amount_paid: 0,
    status: 'PENDING',
    paid_date: null,
    payment_method: null,
    notes: 'Due on 7th - Overdue'
  }
];

export const INITIAL_REMINDER_LOGS = [
  {
    id: 'log-01',
    member_id: 'mem-03',
    org_id: 'org-gym-01',
    phone_number: '+919833445511',
    channel: 'WhatsApp',
    message: 'Namaste Meena Deshmukh, Rohan Deshmukh ka October fee Rs 2500 due hai IronPulse Elite Gym me. Pay kare: upi://pay?pa=ironpulse@upi&am=2500',
    delivery_status: 'SENT',
    sent_at: '2026-10-08T09:15:00'
  },
  {
    id: 'log-02',
    member_id: 'mem-11',
    org_id: 'org-coaching-01',
    phone_number: '+919877334455',
    channel: 'WhatsApp',
    message: 'Reminder: Aditya Mehta ka fee abhi tak pending hai Apex JEE & NEET Coaching me. Kal tak Rs 4500 pay kar de.',
    delivery_status: 'SENT',
    sent_at: '2026-10-08T11:30:00'
  }
];
