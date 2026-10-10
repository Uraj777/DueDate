/**
 * DueDate - Phone Validation & Sanitization (JavaScript)
 * Strictly enforces 10-digit Indian mobile rules, strips formatting, auto adds +91.
 */

export function normalizePhoneNumber(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      formatted: '',
      digits: '',
      error: 'Phone number cannot be empty.'
    };
  }

  // Remove spaces, dashes, brackets, periods
  const cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '').trim();

  let digits = '';
  if (cleaned.startsWith('+91')) {
    digits = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    digits = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    digits = cleaned.slice(1);
  } else {
    digits = cleaned.replace(/\D/g, '');
  }

  if (digits.length !== 10) {
    return {
      isValid: false,
      formatted: '',
      digits,
      error: `Phone number must be exactly 10 digits (got ${digits.length}).`
    };
  }

  // Check valid Indian mobile starting prefix (6, 7, 8, 9)
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return {
      isValid: false,
      formatted: '',
      digits,
      error: 'Indian mobile numbers must start with 6, 7, 8, or 9.'
    };
  }

  return {
    isValid: true,
    formatted: `+91${digits}`,
    digits,
    error: null
  };
}

export function formatPhoneDisplay(phone) {
  if (!phone) return '';
  const norm = normalizePhoneNumber(phone);
  if (!norm.isValid) return phone;
  const d = norm.digits;
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}

export function checkDuplicateMember(members, name, phone, excludeId = null) {
  const norm = normalizePhoneNumber(phone);
  const cleanName = (name || '').trim().toLowerCase();

  for (const m of members) {
    if (excludeId && m.id === excludeId) continue;
    if (m.is_archived) continue;

    const memberNorm = normalizePhoneNumber(m.phone_number);
    const existingName = (m.name || '').trim().toLowerCase();

    if (norm.isValid && memberNorm.isValid && norm.formatted === memberNorm.formatted) {
      if (existingName === cleanName) {
        return {
          isDuplicate: true,
          message: `Member "${m.name}" with phone ${norm.formatted} already exists in this organization.`
        };
      }
      return {
        isDuplicate: true,
        message: `Phone ${norm.formatted} is already registered under "${m.name}".`
      };
    }
  }

  return { isDuplicate: false, message: null };
}
