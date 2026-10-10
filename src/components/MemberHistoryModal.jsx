import React from 'react';
import { X, History, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { formatPhoneDisplay } from '../lib/phoneUtils.js';

export default function MemberHistoryModal({
  isOpen,
  onClose,
  member,
  paymentsHistory,
  reminderLogs
}) {
  if (!isOpen || !member) return null;

  const monthNames = [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-[#12141e] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <History className="h-5 w-5 text-amber-400" />
              <span>History &amp; Audit Logs</span>
            </h3>
            <p className="text-xs text-slate-400">
              {member.name} · {formatPhoneDisplay(member.phone_number)} · Group: {member.group_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="mt-4 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Section 1: Past Payments */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Monthly Payment Records
            </h4>
            {paymentsHistory.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-slate-500">
                No past payment transactions recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {paymentsHistory.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#161824] p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {monthNames[p.month]} {p.year}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Method: {p.payment_method || 'Unspecified'}{' '}
                        {p.paid_date && `· ${new Date(p.paid_date).toLocaleDateString()}`}
                      </div>
                      {p.notes && (
                        <div className="text-[10px] text-slate-500 mt-0.5 italic">
                          "{p.notes}"
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-white">
                        ₹{p.amount_paid} / ₹{p.amount_due}
                      </div>
                      <span
                        className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          p.status === 'PAID'
                            ? 'bg-emerald-950 text-emerald-300'
                            : p.status === 'PARTIAL'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: WhatsApp Reminder Logs */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              WhatsApp Reminders Sent
            </h4>
            {reminderLogs.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-slate-500">
                No reminders sent to this member yet.
              </div>
            ) : (
              <div className="space-y-2">
                {reminderLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-white/10 bg-[#161824] p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-medium">WhatsApp Dispatch</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.sent_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 bg-black/40 rounded-lg p-2 font-sans border border-white/5 leading-relaxed">
                      {log.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Recipient: {log.phone_number}</span>
                      <span className="text-emerald-400 font-semibold">{log.delivery_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
