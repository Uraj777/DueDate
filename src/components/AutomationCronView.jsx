import React, { useState, useEffect } from 'react';
import {
  Clock,
  Zap,
  Play,
  CheckCircle,
  AlertCircle,
  Copy,
  MessageSquare,
  Sparkles,
  Settings,
  Calendar
} from 'lucide-react';
import { renderTemplate } from '../lib/whatsapp.js';
import { DEFAULT_TEMPLATES } from '../lib/types.js';

export default function AutomationCronView({
  currentOrg,
  members,
  payments,
  cronSettings,
  onSaveCronSettings,
  templates,
  onSaveTemplates,
  reminderLogs
}) {
  const [activeOffsets, setActiveOffsets] = useState(cronSettings?.triggerOffsets || [-2, 0, 3, 7, 10]);
  const [cronEnabled, setCronEnabled] = useState(cronSettings?.enabled ?? true);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('polite');
  const [templateDrafts, setTemplateDrafts] = useState(templates || DEFAULT_TEMPLATES);
  const [istTimeStr, setIstTimeStr] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Update IST time live
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Formatted in IST
      const istStr = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setIstTimeStr(istStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOffset = (offset) => {
    if (activeOffsets.includes(offset)) {
      if (activeOffsets.length === 1) return; // Keep at least one
      setActiveOffsets(activeOffsets.filter((o) => o !== offset));
    } else {
      setActiveOffsets([...activeOffsets, offset].sort((a, b) => a - b));
    }
  };

  const handleSaveCron = () => {
    onSaveCronSettings({
      ...cronSettings,
      enabled: cronEnabled,
      triggerOffsets: activeOffsets
    });
    onSaveTemplates(templateDrafts);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleInsertVariable = (varName) => {
    const currentText = templateDrafts[selectedTemplateKey] || '';
    setTemplateDrafts({
      ...templateDrafts,
      [selectedTemplateKey]: `${currentText} {{${varName}}}`
    });
  };

  // Run simulation of today's cron trigger
  const handleSimulateCron = () => {
    const dueDay = currentOrg?.due_day || 5;
    const now = new Date();
    const todayDate = now.getDate();
    const currentOffset = todayDate - dueDay;

    const isTriggerDay = activeOffsets.includes(currentOffset);

    // Identify pending members
    const pendingMembers = members.filter((m) => {
      if (m.is_archived) return false;
      const pay = payments.find((p) => p.member_id === m.id);
      return !pay || pay.status === 'PENDING' || pay.status === 'PARTIAL';
    });

    setSimulationResult({
      todayDate,
      dueDay,
      currentOffset,
      isTriggerDay,
      pendingCount: pendingMembers.length,
      sampleTargets: pendingMembers.slice(0, 4)
    });
  };

  const availableOffsets = [
    { offset: -3, label: 'Day -3 (3 days before due)' },
    { offset: -2, label: 'Day -2 (48 hrs before due)' },
    { offset: -1, label: 'Day -1 (1 day before due)' },
    { offset: 0, label: 'Day 0 (On Due Date)' },
    { offset: 3, label: 'Day +3 (3 days overdue)' },
    { offset: 5, label: 'Day +5 (5 days overdue)' },
    { offset: 7, label: 'Day +7 (1 week overdue)' },
    { offset: 10, label: 'Day +10 (Critical overdue)' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Engine Card */}
      <div className="rounded-2xl border border-white/10 bg-[#10121a]/90 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              <h2 className="text-xl font-bold text-white font-['Outfit']">
                Automation Engine (Cron &amp; Schedule)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automates WhatsApp payment reminders based on monthly due date for {currentOrg?.org_name}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Asia / Kolkata (IST)
              </div>
              <div className="text-xs font-mono font-bold text-amber-400">
                {istTimeStr || 'Loading clock...'}
              </div>
            </div>

            <button
              onClick={() => setCronEnabled(!cronEnabled)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                cronEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {cronEnabled ? 'Engine Active' : 'Engine Paused'}
            </button>
          </div>
        </div>

        {/* Schedule Triggers Configuration */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-400" />
              <span>Reminder Trigger Schedule (Relative to {currentOrg?.due_day || 5}th Due Date)</span>
            </h3>
            <span className="text-xs text-slate-400">
              Select which days triggers will execute
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {availableOffsets.map(({ offset, label }) => {
              const isActive = activeOffsets.includes(offset);
              return (
                <button
                  key={offset}
                  type="button"
                  onClick={() => handleToggleOffset(offset)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    isActive
                      ? 'border-rose-500/50 bg-rose-950/30 text-white shadow-sm'
                      : 'border-white/10 bg-[#141620] text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono">
                      {offset === 0 ? 'Day 0' : offset > 0 ? `Day +${offset}` : `Day ${offset}`}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? 'bg-rose-400' : 'bg-slate-600'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {offset === 0
                      ? 'Due Date'
                      : offset < 0
                      ? `${Math.abs(offset)} days before`
                      : `${offset} days overdue`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulator Button */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Current schedule has <strong className="text-white">{activeOffsets.length} active checkpoints</strong>.
          </div>
          <button
            onClick={handleSimulateCron}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <Play className="h-3.5 w-3.5 text-amber-400" />
            <span>Simulate Today's Cron Trigger</span>
          </button>
        </div>

        {/* Simulation Output */}
        {simulationResult && (
          <div className="mt-4 rounded-xl border border-white/10 bg-[#0e1017] p-4 text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-white">Simulation Check: Day {simulationResult.todayDate} of Month</span>
              {simulationResult.isTriggerDay ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Trigger matches Day {simulationResult.currentOffset}!
                </span>
              ) : (
                <span className="text-slate-400">
                  Offset is Day {simulationResult.currentOffset} (No scheduled blast today)
                </span>
              )}
            </div>
            <p className="text-slate-400">
              Target Candidates:{' '}
              <strong className="text-rose-400">{simulationResult.pendingCount} unpaid members</strong> would be evaluated. Double reminder guard checks them against today's logs before sending.
            </p>
          </div>
        )}

      </div>

      {/* Message Templates Editor */}
      <div className="rounded-2xl border border-white/10 bg-[#10121a]/90 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-rose-500" />
              <span>WhatsApp Message Template Editor</span>
            </h3>
            <p className="text-xs text-slate-400">
              Customize dynamic templates with variable placeholders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['polite', 'firm', 'formal'].map((key) => (
              <button
                key={key}
                onClick={() => setSelectedTemplateKey(key)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all ${
                  selectedTemplateKey === key
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'border border-white/10 bg-[#161824] text-slate-400 hover:text-white'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Variable Helper Chips */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Click to Insert Dynamic Variable:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'member_name', label: '{{member_name}}' },
              { id: 'guardian_name', label: '{{guardian_name}}' },
              { id: 'fee_amount', label: '{{fee_amount}}' },
              { id: 'month', label: '{{month}}' },
              { id: 'org_name', label: '{{org_name}}' },
              { id: 'upi_link', label: '{{upi_link}}' },
              { id: 'due_date', label: '{{due_date}}' }
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleInsertVariable(v.id)}
                className="rounded-lg border border-white/10 bg-[#161824] px-2.5 py-1 text-[11px] font-mono text-amber-300 hover:bg-amber-400/10 transition-colors"
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Text Area */}
        <div className="mt-4">
          <textarea
            rows={4}
            value={templateDrafts[selectedTemplateKey] || ''}
            onChange={(e) =>
              setTemplateDrafts({
                ...templateDrafts,
                [selectedTemplateKey]: e.target.value
              })
            }
            className="w-full rounded-xl border border-white/15 bg-[#161824] p-3 text-xs text-white font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* Preview of edited template */}
        <div className="mt-3 rounded-xl border border-white/10 bg-[#0d0e15] p-3 text-xs text-slate-300">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Live Sample Preview:</div>
          {renderTemplate(templateDrafts[selectedTemplateKey] || '', {
            member_name: 'Aarav Kumar',
            guardian_name: 'Rajesh Kumar',
            fee_amount: '2,500',
            month: 'October',
            org_name: currentOrg?.org_name,
            upi_link: `upi://pay?pa=${currentOrg?.upi_id}&am=2500`,
            due_date: `${currentOrg?.due_day || 5}th of October`
          })}
        </div>

        {/* Save button */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          {isSaved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle className="h-4 w-4" />
              Settings &amp; Templates Saved!
            </span>
          )}
          <button
            onClick={handleSaveCron}
            className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-950 transition-all active:scale-95"
          >
            Save Automation &amp; Templates
          </button>
        </div>

      </div>

      {/* Recent Dispatches Audit Table */}
      <div className="rounded-2xl border border-white/10 bg-[#10121a]/90 p-5 backdrop-blur-xl shadow-2xl">
        <h3 className="text-base font-bold text-white font-['Outfit'] mb-3">
          Recent WhatsApp Dispatch Logs
        </h3>
        {reminderLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No reminders dispatched yet.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#0e1017]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 bg-white/[0.02]">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Recipient</th>
                  <th className="p-2.5">Message Excerpt</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {reminderLogs.slice(0, 10).map((l) => (
                  <tr key={l.id}>
                    <td className="p-2.5 font-mono text-[11px] text-slate-400">
                      {new Date(l.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-white">
                      {l.phone_number}
                    </td>
                    <td className="p-2.5 truncate max-w-xs text-[11px] text-slate-300">
                      {l.message}
                    </td>
                    <td className="p-2.5">
                      <span className="rounded bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                        {l.delivery_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
