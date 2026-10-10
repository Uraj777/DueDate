/**
 * DueDate - Client Storage & Data Layer (JavaScript)
 * Manages persistent reactive state in LocalStorage with fallback and multi-org switching.
 */

import {
  INITIAL_ORGANIZATIONS,
  INITIAL_MEMBERS,
  INITIAL_PAYMENTS,
  INITIAL_REMINDER_LOGS,
  DEFAULT_TEMPLATES
} from './types.js';

const STORAGE_KEYS = {
  ORGS: 'duedate_organizations_v1',
  CURRENT_ORG: 'duedate_current_org_id_v1',
  MEMBERS: 'duedate_members_v1',
  PAYMENTS: 'duedate_payments_v1',
  REMINDER_LOGS: 'duedate_reminder_logs_v1',
  TEMPLATES: 'duedate_templates_v1',
  CRON_SETTINGS: 'duedate_cron_settings_v1',
  USER_ROLE: 'duedate_user_role_v1' // 'owner' | 'assistant'
};

function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.ORGS)) {
    writeJSON(STORAGE_KEYS.ORGS, INITIAL_ORGANIZATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_ORG)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ORG, INITIAL_ORGANIZATIONS[0].id);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    writeJSON(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    writeJSON(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REMINDER_LOGS)) {
    writeJSON(STORAGE_KEYS.REMINDER_LOGS, INITIAL_REMINDER_LOGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
    writeJSON(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CRON_SETTINGS)) {
    writeJSON(STORAGE_KEYS.CRON_SETTINGS, {
      enabled: true,
      dueDay: 5,
      triggerOffsets: [-2, 0, 3, 7, 10], // Days relative to due date
      activeTemplateKey: 'polite',
      autoSend: false // Manual confirmation or auto dispatch
    });
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER_ROLE)) {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, 'owner');
  }
}

// ----------------- Organizations -----------------

export function getOrganizations() {
  return readJSON(STORAGE_KEYS.ORGS, INITIAL_ORGANIZATIONS);
}

export function getCurrentOrgId() {
  if (typeof window === 'undefined') return INITIAL_ORGANIZATIONS[0].id;
  return localStorage.getItem(STORAGE_KEYS.CURRENT_ORG) || INITIAL_ORGANIZATIONS[0].id;
}

export function setCurrentOrgId(orgId) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_ORG, orgId);
}

export function getCurrentOrg() {
  const orgs = getOrganizations();
  const currentId = getCurrentOrgId();
  return orgs.find((o) => o.id === currentId) || orgs[0] || INITIAL_ORGANIZATIONS[0];
}

export function saveOrganization(org) {
  const orgs = getOrganizations();
  const idx = orgs.findIndex((o) => o.id === org.id);
  if (idx !== -1) {
    orgs[idx] = { ...orgs[idx], ...org };
  } else {
    orgs.push(org);
  }
  writeJSON(STORAGE_KEYS.ORGS, orgs);
  return org;
}

// ----------------- Members -----------------

export function getMembers(orgId = null, includeArchived = false) {
  const all = readJSON(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  const targetOrg = orgId || getCurrentOrgId();
  return all.filter((m) => {
    if (m.org_id !== targetOrg) return false;
    if (!includeArchived && m.is_archived) return false;
    return true;
  });
}

export function saveMember(memberData) {
  const all = readJSON(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  const currentOrgId = getCurrentOrgId();

  if (memberData.id) {
    const idx = all.findIndex((m) => m.id === memberData.id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...memberData };
      writeJSON(STORAGE_KEYS.MEMBERS, all);
      return all[idx];
    }
  }

  const newMember = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    org_id: memberData.org_id || currentOrgId,
    name: memberData.name.trim(),
    guardian_name: (memberData.guardian_name || '').trim(),
    phone_number: memberData.phone_number,
    group_name: (memberData.group_name || 'General').trim(),
    fee_amount: Number(memberData.fee_amount) || 2000,
    joining_date: memberData.joining_date || new Date().toISOString().slice(0, 10),
    custom_field: (memberData.custom_field || '').trim(),
    is_archived: false,
    created_at: new Date().toISOString()
  };

  all.push(newMember);
  writeJSON(STORAGE_KEYS.MEMBERS, all);
  return newMember;
}

export function archiveMember(memberId) {
  const all = readJSON(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  const idx = all.findIndex((m) => m.id === memberId);
  if (idx !== -1) {
    all[idx].is_archived = true;
    writeJSON(STORAGE_KEYS.MEMBERS, all);
  }
}

export function restoreMember(memberId) {
  const all = readJSON(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  const idx = all.findIndex((m) => m.id === memberId);
  if (idx !== -1) {
    all[idx].is_archived = false;
    writeJSON(STORAGE_KEYS.MEMBERS, all);
  }
}

// ----------------- Payments -----------------

export function getPayments(orgId = null, month = 10, year = 2026) {
  const all = readJSON(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  const targetOrg = orgId || getCurrentOrgId();
  return all.filter((p) => p.org_id === targetOrg && p.month === month && p.year === year);
}

export function getAllPaymentsForMember(memberId) {
  const all = readJSON(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  return all.filter((p) => p.member_id === memberId).sort((a, b) => b.month - a.month);
}

export function recordPayment({
  memberId,
  orgId,
  month = 10,
  year = 2026,
  amountDue,
  payingAmount,
  paymentMethod = 'UPI',
  notes = ''
}) {
  const all = readJSON(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  const currentOrgId = orgId || getCurrentOrgId();

  const existingIdx = all.findIndex(
    (p) => p.member_id === memberId && p.org_id === currentOrgId && p.month === month && p.year === year
  );

  const existing = existingIdx !== -1 ? all[existingIdx] : null;
  const currentPaid = existing ? Number(existing.amount_paid || 0) : 0;
  const newPaidTotal = currentPaid + Number(payingAmount);
  const totalDue = Number(amountDue);

  let newStatus = 'PENDING';
  if (newPaidTotal >= totalDue) {
    newStatus = 'PAID';
  } else if (newPaidTotal > 0) {
    newStatus = 'PARTIAL';
  }

  const updatedRecord = {
    id: existing ? existing.id : `pay-${Date.now()}`,
    member_id: memberId,
    org_id: currentOrgId,
    month,
    year,
    amount_due: totalDue,
    amount_paid: newPaidTotal,
    status: newStatus,
    paid_date: new Date().toISOString(),
    payment_method: paymentMethod,
    notes: notes || (existing ? existing.notes : '')
  };

  if (existingIdx !== -1) {
    all[existingIdx] = updatedRecord;
  } else {
    all.push(updatedRecord);
  }

  writeJSON(STORAGE_KEYS.PAYMENTS, all);
  return updatedRecord;
}

// ----------------- Reminders -----------------

export function getReminderLogs(orgId = null) {
  const all = readJSON(STORAGE_KEYS.REMINDER_LOGS, INITIAL_REMINDER_LOGS);
  const targetOrg = orgId || getCurrentOrgId();
  return all.filter((l) => l.org_id === targetOrg).sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
}

export function logReminder({ memberId, orgId, phone, message, deliveryStatus = 'SENT', channel = 'WhatsApp', error = null }) {
  const all = readJSON(STORAGE_KEYS.REMINDER_LOGS, INITIAL_REMINDER_LOGS);
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    member_id: memberId,
    org_id: orgId || getCurrentOrgId(),
    phone_number: phone,
    channel,
    message,
    delivery_status: deliveryStatus,
    error_message: error,
    sent_at: new Date().toISOString()
  };

  all.unshift(newLog);
  writeJSON(STORAGE_KEYS.REMINDER_LOGS, all);
  return newLog;
}

// ----------------- Templates -----------------

export function getTemplates() {
  return readJSON(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
}

export function saveTemplates(templates) {
  writeJSON(STORAGE_KEYS.TEMPLATES, templates);
}

// ----------------- Cron Settings -----------------

export function getCronSettings() {
  return readJSON(STORAGE_KEYS.CRON_SETTINGS, {
    enabled: true,
    dueDay: 5,
    triggerOffsets: [-2, 0, 3, 7, 10],
    activeTemplateKey: 'polite',
    autoSend: false
  });
}

export function saveCronSettings(settings) {
  writeJSON(STORAGE_KEYS.CRON_SETTINGS, settings);
}

// ----------------- Staff Role -----------------

export function getUserRole() {
  if (typeof window === 'undefined') return 'owner';
  return localStorage.getItem(STORAGE_KEYS.USER_ROLE) || 'owner';
}

export function setUserRole(role) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
}

export function resetToDefaults() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ORGS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_ORG);
  localStorage.removeItem(STORAGE_KEYS.MEMBERS);
  localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
  localStorage.removeItem(STORAGE_KEYS.REMINDER_LOGS);
  localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
  localStorage.removeItem(STORAGE_KEYS.CRON_SETTINGS);
  initializeStorage();
}
