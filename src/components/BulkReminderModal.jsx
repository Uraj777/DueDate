import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { renderTemplate, sendWhatsApp } from '../lib/whatsapp.js';
import { generateUPILink } from '../lib/upiUtils.js';
import { DEFAULT_TEMPLATES } from '../lib/types.js';

export default function BulkReminderModal({
  isOpen,
  onClose,
  selectedMemberIds,
  members,
  payments,
  currentOrg,
  selectedMonth,
  selectedYear,
  templates,
  onLogReminder,
  onComplete
}) {
  if (!isOpen || selectedMemberIds.length === 0) return null;

  const [templateKey, setTemplateKey] = useState('polite');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedList, setCompletedList] = useState([]);

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[selectedMonth] || 'Monthly';

  // Get objects for selected members
  const selectedMembers = members.filter((m) => selectedMemberIds.includes(m.id));

  const handleStartBulkDispatch = () => {
    setIsProcessing(true);
    const results = [];

    const templateStr =
      (templates && templates[templateKey]) || DEFAULT_TEMPLATES[templateKey] || DEFAULT_TEMPLATES.polite;

    selectedMembers.forEach((member) => {
      const payRecord = payments.find((p) => p.member_id === member.id);
      const paid = payRecord ? payRecord.amount_paid : 0;
      const due = Math.max(0, member.fee_amount - paid);

      const upiLink = generateUPILink({
        upiId: currentOrg.upi_id || 'fee@upi',
        amount: due,
        payeeName: currentOrg.org_name,
        note: `${monthName} fee for ${member.name}`
      });

      const message = renderTemplate(templateStr, {
        member_name: member.name,
        guardian_name: member.guardian_name || member.name,
        fee_amount: due,
        month: monthName,
        org_name: currentOrg.org_name,
        upi_link: upiLink
      });

      // Execute placeholder send
      const dispatch = sendWhatsApp(member.phone_number, message, { openInNewTab: false });

      onLogReminder({
        memberId: member.id,
        orgId: currentOrg.id,
        phone: member.phone_number,
        message,
        deliveryStatus: 'SENT',
        channel: 'WhatsApp'
      });

      results.push({
        id: member.id,
        name: member.name,
        phone: member.phone_number,
        amount: due,
        status: 'SENT'
      });
    });

    setCompletedList(results);
    setIsProcessing(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#12141e] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Send className="h-5 w-5 text-rose-500" />
              <span>Bulk WhatsApp Dispatch</span>
            </h3>
            <p className="text-xs text-slate-400">
              Sending reminders to {selectedMembers.length} selected recipients
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected List Summary */}
        <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#0e1017] p-3 space-y-1.5">
          {selectedMembers.map((m) => (
            <div key={m.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/[0.02]">
              <span className="font-medium text-white">{m.name}</span>
              <span className="font-mono text-slate-400">{m.phone_number}</span>
              <span className="font-mono text-rose-400">₹{m.fee_amount}</span>
            </div>
          ))}
        </div>

        {/* Template choice */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Choose Template for Bulk Message
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTemplateKey('polite')}
              className={`rounded-xl border p-2 text-xs font-medium text-left transition-all ${
                templateKey === 'polite'
                  ? 'border-rose-500 bg-rose-500/15 text-white'
                  : 'border-white/10 bg-[#161824] text-slate-400'
              }`}
            >
              1. Polite (Namaste... fee due hai)
            </button>
            <button
              type="button"
              onClick={() => setTemplateKey('firm')}
              className={`rounded-xl border p-2 text-xs font-medium text-left transition-all ${
                templateKey === 'firm'
                  ? 'border-rose-500 bg-rose-500/15 text-white'
                  : 'border-white/10 bg-[#161824] text-slate-400'
              }`}
            >
              2. Firm (Reminder: fee pending hai)
            </button>
          </div>
        </div>

        {/* Success list if processed */}
        {completedList.length > 0 && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Successfully logged {completedList.length} reminders!</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            {completedList.length > 0 ? 'Close' : 'Cancel'}
          </button>
          {completedList.length === 0 && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleStartBulkDispatch}
              className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-950 transition-all active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Dispatch to All ({selectedMembers.length})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
