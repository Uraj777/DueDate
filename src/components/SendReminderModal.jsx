import React, { useState, useMemo } from 'react';
import { X, Send, AlertTriangle, CheckCircle, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';
import { renderTemplate, canSendReminder, sendWhatsApp } from '../lib/whatsapp.js';
import { generateUPILink } from '../lib/upiUtils.js';
import { DEFAULT_TEMPLATES } from '../lib/types.js';

export default function SendReminderModal({
  isOpen,
  onClose,
  member,
  paymentRecord,
  currentOrg,
  selectedMonth,
  selectedYear,
  lastReminderLog,
  templates,
  onLogReminder
}) {
  if (!isOpen || !member) return null;

  const [selectedTemplateKey, setSelectedTemplateKey] = useState('polite');
  const [customText, setCustomText] = useState('');
  const [forceSend, setForceSend] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[selectedMonth] || 'Monthly';

  const outstandingFee = paymentRecord
    ? Math.max(0, member.fee_amount - (paymentRecord.amount_paid || 0))
    : member.fee_amount;

  // Generate dynamic UPI intent link
  const upiLink = useMemo(() => {
    return generateUPILink({
      upiId: currentOrg.upi_id || 'fee@upi',
      amount: outstandingFee,
      payeeName: currentOrg.org_name,
      note: `${monthName} ${selectedYear} fee for ${member.name}`
    });
  }, [currentOrg, outstandingFee, monthName, selectedYear, member]);

  // Variables map for interpolation
  const variables = useMemo(() => {
    return {
      member_name: member.name,
      guardian_name: member.guardian_name || member.name,
      fee_amount: outstandingFee,
      month: monthName,
      year: selectedYear,
      org_name: currentOrg.org_name,
      upi_link: upiLink,
      due_date: `${currentOrg.due_day || 5}th of ${monthName}`
    };
  }, [member, outstandingFee, monthName, selectedYear, currentOrg, upiLink]);

  // Active template string
  const activeTemplateStr =
    selectedTemplateKey === 'custom'
      ? customText
      : (templates && templates[selectedTemplateKey]) || DEFAULT_TEMPLATES[selectedTemplateKey] || DEFAULT_TEMPLATES.polite;

  // Rendered preview
  const renderedMessage = useMemo(() => {
    return renderTemplate(activeTemplateStr, variables);
  }, [activeTemplateStr, variables]);

  // Check double reminder & paid guards
  const guardCheck = useMemo(() => {
    return canSendReminder(paymentRecord?.status, lastReminderLog?.sent_at);
  }, [paymentRecord, lastReminderLog]);

  const handleSend = () => {
    setIsSending(true);

    try {
      // Execute WhatsApp dispatch
      const dispatch = sendWhatsApp(member.phone_number, renderedMessage, { openInNewTab: true });

      // Save to logs
      onLogReminder({
        memberId: member.id,
        orgId: currentOrg.id,
        phone: member.phone_number,
        message: renderedMessage,
        deliveryStatus: 'SENT',
        channel: 'WhatsApp'
      });

      setIsSending(false);
      onClose();
    } catch (err) {
      console.error('Error dispatching WhatsApp:', err);
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#12141e] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-rose-500" />
              <span>Send WhatsApp Reminder</span>
            </h3>
            <p className="text-xs text-slate-400">
              {member.name} ({member.phone_number}) · Outstanding: ₹{outstandingFee}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Double Reminder Guard Warning */}
        {!guardCheck.allowed && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Double Reminder Guard Active</span>
            </div>
            <p className="text-slate-300">{guardCheck.reason}</p>
            {guardCheck.isDuplicateToday && (
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceSend}
                  onChange={(e) => setForceSend(e.target.checked)}
                  className="rounded border-amber-500/40 bg-black/40 text-rose-600 focus:ring-0"
                />
                <span className="text-[11px] text-amber-200 font-medium">
                  Override guard &amp; send another reminder anyway
                </span>
              </label>
            )}
          </div>
        )}

        {/* Template Selector Tabs */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Select Message Template
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedTemplateKey('polite')}
              className={`rounded-xl border py-2 px-2 text-xs font-medium transition-all ${
                selectedTemplateKey === 'polite'
                  ? 'border-rose-500 bg-rose-500/15 text-white shadow-sm'
                  : 'border-white/10 bg-[#161824] text-slate-400 hover:text-white'
              }`}
            >
              1. Polite (Hindi)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplateKey('firm')}
              className={`rounded-xl border py-2 px-2 text-xs font-medium transition-all ${
                selectedTemplateKey === 'firm'
                  ? 'border-rose-500 bg-rose-500/15 text-white shadow-sm'
                  : 'border-white/10 bg-[#161824] text-slate-400 hover:text-white'
              }`}
            >
              2. Firm (Hindi)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplateKey('formal')}
              className={`rounded-xl border py-2 px-2 text-xs font-medium transition-all ${
                selectedTemplateKey === 'formal'
                  ? 'border-rose-500 bg-rose-500/15 text-white shadow-sm'
                  : 'border-white/10 bg-[#161824] text-slate-400 hover:text-white'
              }`}
            >
              3. Formal (English)
            </button>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-300">
              Live WhatsApp Message Preview
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              UPI link injected
            </span>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d0e15] p-3.5 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap select-all">
            {renderedMessage}
          </div>
        </div>

        {/* Send Action */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={(!guardCheck.allowed && !forceSend) || isSending}
            onClick={handleSend}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-lg transition-all active:scale-95 ${
              (!guardCheck.allowed && !forceSend) || isSending
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950 cursor-pointer'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Open &amp; Send in WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
