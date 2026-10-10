/**
 * DueDate - WhatsApp Messaging Engine & Template Parser (JavaScript)
 * Resolves dynamic template variables and dispatches via WhatsApp.
 */

export function renderTemplate(templateString, variables) {
  if (!templateString) return '';
  let result = templateString;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value !== undefined && value !== null ? String(value) : '');
  }
  return result;
}

export function canSendReminder(paymentStatus, lastSentTimestamp) {
  if ((paymentStatus || '').toUpperCase() === 'PAID') {
    return {
      allowed: false,
      reason: 'This member is already marked as PAID. Reminders cannot be sent for cleared dues.'
    };
  }

  if (lastSentTimestamp) {
    try {
      const sentDate = new Date(lastSentTimestamp);
      const today = new Date();
      const isSameDay =
        sentDate.getFullYear() === today.getFullYear() &&
        sentDate.getMonth() === today.getMonth() &&
        sentDate.getDate() === today.getDate();

      if (isSameDay) {
        const timeStr = sentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          allowed: false,
          isDuplicateToday: true,
          reason: `A reminder was already sent today at ${timeStr}. To avoid spamming parents/members, double reminders are blocked.`
        };
      }
    } catch {
      // Ignore parse error
    }
  }

  return { allowed: true, reason: null };
}

/**
 * Placeholder sendWhatsApp function (as required by prompt).
 * Encodes text into a WhatsApp direct intent link and logs the transaction.
 */
export function sendWhatsApp(phone, message, { openInNewTab = false } = {}) {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  if (openInNewTab && typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  return {
    status: 'SENT',
    channel: 'WhatsApp',
    phone: cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`,
    waUrl,
    sentAt: new Date().toISOString()
  };
}
