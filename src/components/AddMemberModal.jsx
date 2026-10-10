import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { normalizePhoneNumber, checkDuplicateMember } from '../lib/phoneUtils.js';
import { ORG_TYPES } from '../lib/types.js';

export default function AddMemberModal({
  isOpen,
  onClose,
  currentOrg,
  existingMembers,
  onSaveMember
}) {
  if (!isOpen) return null;

  const orgConfig = ORG_TYPES[currentOrg?.org_type] || ORG_TYPES.other;

  const [name, setName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [groupName, setGroupName] = useState('');
  const [feeAmount, setFeeAmount] = useState(currentOrg?.default_fee || 2500);
  const [customField, setCustomField] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));

  const [phoneError, setPhoneError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const handlePhoneChange = (val) => {
    setRawPhone(val);
    if (!val.trim()) {
      setPhoneError(null);
      setDuplicateWarning(null);
      return;
    }

    const norm = normalizePhoneNumber(val);
    if (!norm.isValid) {
      setPhoneError(norm.error);
      setDuplicateWarning(null);
    } else {
      setPhoneError(null);
      // Check duplicate
      const dup = checkDuplicateMember(existingMembers, name, norm.formatted);
      if (dup.isDuplicate) {
        setDuplicateWarning(dup.message);
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleNameChange = (val) => {
    setName(val);
    if (rawPhone.trim()) {
      const norm = normalizePhoneNumber(rawPhone);
      if (norm.isValid) {
        const dup = checkDuplicateMember(existingMembers, val, norm.formatted);
        setDuplicateWarning(dup.isDuplicate ? dup.message : null);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const norm = normalizePhoneNumber(rawPhone);
    if (!norm.isValid) {
      setPhoneError(norm.error);
      return;
    }

    const dup = checkDuplicateMember(existingMembers, name, norm.formatted);
    if (dup.isDuplicate) {
      setDuplicateWarning(dup.message);
      if (!window.confirm(`${dup.message}\nDo you still want to proceed with adding?`)) {
        return;
      }
    }

    onSaveMember({
      org_id: currentOrg.id,
      name: name.trim(),
      guardian_name: guardianName.trim(),
      phone_number: norm.formatted,
      group_name: groupName.trim() || 'General Batch',
      fee_amount: Number(feeAmount) || currentOrg.default_fee,
      joining_date: joiningDate,
      custom_field: customField.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#12141e] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-rose-500" />
              <span>Enroll New {orgConfig.memberLabel}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Adding to {currentOrg?.org_name} ({orgConfig.name})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {orgConfig.memberLabel} Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Kabir Vohra"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            {/* Guardian Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {orgConfig.guardianLabel} (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Vohra (Father)"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

          </div>

          {/* Phone Number with validation & auto +91 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                WhatsApp Phone Number *
              </label>
              <span className="text-[10px] text-slate-400">
                Auto-adds +91 · 10 digits
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. 9811223344 or +91 98112 23344"
              value={rawPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={`w-full rounded-xl border bg-[#161824] px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 ${
                phoneError ? 'border-rose-500 focus:ring-rose-500' : 'border-white/10 focus:ring-emerald-500'
              }`}
              required
            />
            {phoneError && (
              <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {phoneError}
              </p>
            )}
            {duplicateWarning && (
              <p className="mt-1 text-[11px] text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {duplicateWarning}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Group / Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {orgConfig.groupLabel} *
              </label>
              <input
                type="text"
                placeholder="e.g. Morning Slot, Class 10-A, Batch B2"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            {/* Fee Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Fee Amount (₹) *
              </label>
              <input
                type="number"
                min="100"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-xs text-white font-mono font-semibold placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Joining Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom Notes / Roll No (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Locker 14, Bus Route #2"
                value={customField}
                onChange={(e) => setCustomField(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-950 transition-all active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>Enroll {orgConfig.memberLabel}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
