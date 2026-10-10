import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  QrCode,
  History,
  Archive,
  Download,
  Phone,
  MessageSquare,
  CheckSquare,
  Square,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { formatPhoneDisplay } from '../lib/phoneUtils.js';
import { ORG_TYPES } from '../lib/types.js';

export default function SmartTable({
  currentOrg,
  members,
  payments,
  selectedMonth,
  selectedYear,
  onChangeMonth,
  onOpenMarkPaid,
  onOpenSendReminder,
  onOpenQRCode,
  onOpenHistory,
  onArchiveMember,
  selectedMemberIds,
  onToggleSelectMember,
  onSelectAllPending,
  onClearSelection,
  onBulkSendReminder
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');

  const orgConfig = ORG_TYPES[currentOrg?.org_type] || ORG_TYPES.other;

  // Build a lookup map for payments for selected month/year
  const paymentMap = useMemo(() => {
    const map = new Map();
    payments.forEach((p) => {
      map.set(p.member_id, p);
    });
    return map;
  }, [payments]);

  // Extract unique groups/batches for filter dropdown
  const uniqueGroups = useMemo(() => {
    const set = new Set();
    members.forEach((m) => {
      if (m.group_name) set.add(m.group_name);
    });
    return Array.from(set).sort();
  }, [members]);

  // Combined member rows with their payment status
  const rows = useMemo(() => {
    return members.map((member) => {
      const payRecord = paymentMap.get(member.id);
      const feeDue = member.fee_amount;
      const amountPaid = payRecord ? payRecord.amount_paid : 0;
      const status = payRecord ? payRecord.status : 'PENDING';
      const remainingDue = Math.max(0, feeDue - amountPaid);

      return {
        ...member,
        paymentRecord: payRecord,
        status,
        amountPaid,
        remainingDue
      };
    });
  }, [members, paymentMap]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchSearch =
        row.name.toLowerCase().includes(search) ||
        (row.guardian_name && row.guardian_name.toLowerCase().includes(search)) ||
        row.phone_number.includes(search) ||
        (row.group_name && row.group_name.toLowerCase().includes(search));

      if (!matchSearch) return false;

      // Status
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'DEFAULTERS') {
          if (row.status !== 'PENDING') return false;
        } else if (row.status !== statusFilter) {
          return false;
        }
      }

      // Group
      if (groupFilter !== 'ALL' && row.group_name !== groupFilter) {
        return false;
      }

      return true;
    });
  }, [rows, searchTerm, statusFilter, groupFilter]);

  // Count pending in current filtered list
  const pendingInFiltered = filteredRows.filter((r) => r.status === 'PENDING' || r.status === 'PARTIAL');

  // Export filtered CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Guardian', 'Group', 'Fee Due', 'Amount Paid', 'Status'];
    const csvLines = [headers.join(',')];
    filteredRows.forEach((r) => {
      csvLines.push(
        [
          `"${r.name}"`,
          `"${r.phone_number}"`,
          `"${r.guardian_name || ''}"`,
          `"${r.group_name || ''}"`,
          r.fee_amount,
          r.amountPaid,
          r.status
        ].join(',')
      );
    });
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentOrg.org_name}_Dues_${selectedMonth}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#10121a]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="border-b border-white/10 p-4 sm:p-5 space-y-3 sm:space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <span>{orgConfig.memberLabelPlural} Ledger</span>
              <span className="text-xs font-normal text-slate-400">
                ({filteredRows.length} shown)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage fee status, issue UPI QR codes, and trigger WhatsApp reminders.
            </p>
          </div>

          {/* Month & Year Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Billing Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => onChangeMonth(Number(e.target.value), selectedYear)}
              className="rounded-lg border border-white/10 bg-[#161824] px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name} {selectedYear}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search by ${orgConfig.memberLabel.toLowerCase()} name, phone, or guardian...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#161824] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-[#161824] p-1 text-xs">
            {['ALL', 'PENDING', 'PARTIAL', 'PAID', 'DEFAULTERS'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'DEFAULTERS' ? 'Defaulters' : st}
              </button>
            ))}
          </div>

          {/* Group Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#161824] px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="ALL">All {orgConfig.groupLabel}s</option>
              {uniqueGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              title="Export Current View as CSV"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#161824] px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

        </div>

        {/* Bulk Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectAllPending(pendingInFiltered.map((p) => p.id))}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium"
            >
              <CheckSquare className="h-3.5 w-3.5 text-rose-400" />
              <span>Select Pending ({pendingInFiltered.length})</span>
            </button>
            {selectedMemberIds.length > 0 && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400 font-semibold">
                  {selectedMemberIds.length} Selected
                </span>
                <button
                  onClick={onClearSelection}
                  className="text-slate-400 hover:text-rose-400 underline text-[11px]"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {selectedMemberIds.length > 0 && (
            <button
              onClick={onBulkSendReminder}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-3 py-1 text-xs font-semibold text-white shadow-md transition-all active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Reminders to {selectedMemberIds.length} Selected</span>
            </button>
          )}
        </div>

      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-medium tracking-wider">
              <th className="py-3 pl-4 pr-2 w-8">
                <span className="sr-only">Select</span>
              </th>
              <th className="py-3 px-3">Photo &amp; Name</th>
              <th className="py-3 px-3">Phone &amp; Contact</th>
              <th className="py-3 px-3">{orgConfig.groupLabel}</th>
              <th className="py-3 px-3">Fee / Balance</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 pr-4 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-8 w-8 text-slate-500" />
                    <p className="font-medium text-slate-300">No {orgConfig.memberLabelPlural.toLowerCase()} match your filter.</p>
                    <p className="text-xs text-slate-500">Try adjusting your search terms or status criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const isSelected = selectedMemberIds.includes(row.id);
                const isPendingOrPartial = row.status === 'PENDING' || row.status === 'PARTIAL';

                // Initial avatar letters
                const initials = row.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      isSelected ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectMember(row.id)}
                        className="rounded border-white/20 bg-[#161824] text-rose-600 focus:ring-0 focus:ring-offset-0 cursor-pointer h-4 w-4"
                      />
                    </td>

                    {/* Photo & Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 text-xs font-semibold text-white border border-white/10 shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{row.name}</span>
                          </div>
                          {row.guardian_name && (
                            <div className="text-[11px] text-slate-400">
                              {orgConfig.guardianLabel}: {row.guardian_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone with WhatsApp & Call quick actions */}
                    <td className="py-3 px-3 font-mono text-[11px] tabular-nums">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{formatPhoneDisplay(row.phone_number)}</span>
                        <a
                          href={`https://wa.me/${row.phone_number.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open WhatsApp chat directly"
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>

                    {/* Group / Class */}
                    <td className="py-3 px-3 text-slate-300">
                      <div>{row.group_name || 'General'}</div>
                      {row.custom_field && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {row.custom_field}
                        </div>
                      )}
                    </td>

                    {/* Fee Amount & Remaining Due */}
                    <td className="py-3 px-3 tabular-nums">
                      <div className="font-semibold text-white font-mono">
                        ₹{row.fee_amount.toLocaleString('en-IN')}
                      </div>
                      {row.status === 'PARTIAL' && (
                        <div className="text-[10px] text-amber-400 font-mono">
                          Paid: ₹{row.amountPaid} · Due: ₹{row.remainingDue}
                        </div>
                      )}
                      {row.status === 'PAID' && (
                        <div className="text-[10px] text-emerald-400/90 font-mono">
                          Cleared: ₹{row.amountPaid}
                        </div>
                      )}
                      {row.status === 'PENDING' && (
                        <div className="text-[10px] text-rose-400/90 font-mono">
                          Due ₹{row.fee_amount}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      {row.status === 'PAID' && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 shadow-sm shadow-emerald-950">
                          <CheckCircle className="h-3 w-3 text-emerald-400" />
                          PAID
                        </span>
                      )}
                      {row.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-950/70 border border-rose-500/30 px-2 py-0.5 text-[11px] font-semibold text-rose-300 shadow-sm shadow-rose-950">
                          <AlertCircle className="h-3 w-3 text-rose-400" />
                          PENDING
                        </span>
                      )}
                      {row.status === 'PARTIAL' && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 text-[11px] font-semibold text-amber-300 shadow-sm shadow-amber-950">
                          <Clock className="h-3 w-3 text-amber-400" />
                          PARTIAL
                        </span>
                      )}
                    </td>

                    {/* Actions: Mark Paid, Send Reminder, UPI QR, History */}
                    <td className="py-3 pr-4 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Mark Paid Button */}
                        <button
                          onClick={() => onOpenMarkPaid(row)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            row.status === 'PAID'
                              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          {row.status === 'PAID' ? 'Update' : 'Mark Paid'}
                        </button>

                        {/* Send Reminder (only if pending/partial) */}
                        <button
                          onClick={() => onOpenSendReminder(row)}
                          title="Preview & Send WhatsApp Reminder"
                          className="rounded-lg border border-white/10 bg-[#161824] p-1.5 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>

                        {/* UPI QR Code */}
                        <button
                          onClick={() => onOpenQRCode(row)}
                          title="Generate UPI QR Code"
                          className="rounded-lg border border-white/10 bg-[#161824] p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>

                        {/* History */}
                        <button
                          onClick={() => onOpenHistory(row)}
                          title="View Payment & Reminder History"
                          className="rounded-lg border border-white/10 bg-[#161824] p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>

                        {/* Archive */}
                        <button
                          onClick={() => onArchiveMember(row.id, row.name)}
                          title="Archive member (Soft delete safety)"
                          className="rounded-lg border border-white/10 bg-[#161824] p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="border-t border-white/10 px-4 py-3 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>
          Showing <strong className="text-white">{filteredRows.length}</strong> of{' '}
          <strong className="text-white">{members.length}</strong> total {orgConfig.memberLabelPlural.toLowerCase()}
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Paid ({rows.filter((r) => r.status === 'PAID').length})
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Partial ({rows.filter((r) => r.status === 'PARTIAL').length})
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Pending ({rows.filter((r) => r.status === 'PENDING').length})
          </span>
        </div>
      </div>

    </div>
  );
}
