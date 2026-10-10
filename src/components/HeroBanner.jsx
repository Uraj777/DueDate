import React from 'react';
import { Send, Upload, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';
import { ORG_TYPES } from '../lib/types.js';

export default function HeroBanner({
  currentOrg,
  stats,
  onOpenBulkReminder,
  onOpenCSVUpload,
  onOpenAddMember
}) {
  const orgTypeConfig = ORG_TYPES[currentOrg?.org_type] || ORG_TYPES.other;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#13151f]/90 via-[#0e1017]/90 to-[#0a0b10] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
      {/* Decorative ambient internal radial gradient */}
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-gradient-to-bl from-amber-500/10 via-rose-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent blur-3xl" />

      <div className="relative z-10 max-w-4xl">
        {/* Subtle pill kicker */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-xs text-amber-300 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Active for {currentOrg?.org_name} · {orgTypeConfig.name}</span>
        </div>

        {/* Hero headline in Outfit display face matching the reference image */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-['Outfit'] leading-tight">
          Crafting the Future of <br className="hidden sm:inline" />
          Fee &amp; Dues Automation
        </h1>

        <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
          <strong className="text-white font-semibold">Never chase payments again.</strong> Instant WhatsApp reminders, auto-generated UPI intent QR codes, and IST schedule engine designed specifically for {orgTypeConfig.memberLabelPlural.toLowerCase()}.
        </p>

        {/* Ambient statistics strip matching "6 Continents Reached | 30+ Years" from reference image */}
        <div className="mt-6 flex flex-wrap items-center gap-6 sm:gap-10 border-y border-white/10 py-4 text-slate-300">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Outfit'] tabular-nums">
              {stats.totalMembers}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Enrolled {orgTypeConfig.memberLabelPlural}
            </span>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10" />

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400 font-['Outfit'] tabular-nums">
              ₹{stats.collectedAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Collected This Month ({stats.recoveryRate}%)
            </span>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10" />

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-400 font-['Outfit'] tabular-nums">
              ₹{stats.pendingAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Pending ({stats.pendingCount} Defaulters)
            </span>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenBulkReminder}
            disabled={stats.pendingCount === 0}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all ${
              stats.pendingCount > 0
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-950/50 cursor-pointer active:scale-95'
                : 'bg-white/10 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send 1-Click WhatsApp Reminders ({stats.pendingCount})</span>
          </button>

          <button
            onClick={onOpenCSVUpload}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Upload className="h-3.5 w-3.5 text-slate-300" />
            <span>Import CSV / Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
