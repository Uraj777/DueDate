import React from 'react';
import { Users, CheckCircle, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';
import { ORG_TYPES } from '../lib/types.js';

export default function TopCards({ currentOrg, stats, cronSettings }) {
  const orgTypeConfig = ORG_TYPES[currentOrg?.org_type] || ORG_TYPES.other;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Total Members */}
      <div className="rounded-xl border border-white/10 bg-[#12141d]/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total {orgTypeConfig.memberLabelPlural}</span>
          <Users className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Outfit'] tabular-nums">
            {stats.totalMembers}
          </span>
          <span className="text-xs text-slate-400">active records</span>
        </div>
        <div className="mt-3 text-[11px] text-slate-400">
          Default Fee: <span className="text-slate-200 font-medium">₹{currentOrg?.default_fee || 2000}/mo</span>
        </div>
      </div>

      {/* Card 2: Collected This Month */}
      <div className="rounded-xl border border-white/10 bg-[#12141d]/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Collected This Month</span>
          <CheckCircle className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400 font-['Outfit'] tabular-nums">
            ₹{stats.collectedAmount.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-emerald-300 font-medium">{stats.recoveryRate}%</span>
        </div>
        {/* Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, stats.recoveryRate)}%` }}
          />
        </div>
      </div>

      {/* Card 3: Pending Amount */}
      <div className="rounded-xl border border-white/10 bg-[#12141d]/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Pending Amount</span>
          <AlertCircle className="h-4 w-4 text-rose-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-400 font-['Outfit'] tabular-nums">
            ₹{stats.pendingAmount.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-rose-300 font-medium">
            {stats.pendingCount} unpaid
          </span>
        </div>
        <div className="mt-3 text-[11px] text-slate-400">
          Partial payments: <span className="text-amber-300 font-medium">{stats.partialCount} active</span>
        </div>
      </div>

      {/* Card 4: Automation Engine IST */}
      <div className="rounded-xl border border-white/10 bg-[#12141d]/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>IST Automation Engine</span>
          <Clock className="h-4 w-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Outfit']">
            Due {currentOrg?.due_day || 5}th Every Mo
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Schedule: -2, 0, +3, +7</span>
          <span className="text-amber-400 font-medium">Asia/Kolkata</span>
        </div>
      </div>

    </div>
  );
}
