import React, { useState } from 'react';
import {
  Settings,
  Building2,
  CreditCard,
  Phone,
  Shield,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { validateUPIId } from '../lib/upiUtils.js';
import { normalizePhoneNumber } from '../lib/phoneUtils.js';
import { ORG_TYPES } from '../lib/types.js';

export default function SettingsView({
  currentOrg,
  onSaveOrg,
  userRole,
  onSetUserRole,
  onResetData
}) {
  const [orgName, setOrgName] = useState(currentOrg?.org_name || '');
  const [orgType, setOrgType] = useState(currentOrg?.org_type || 'school');
  const [upiId, setUpiId] = useState(currentOrg?.upi_id || '');
  const [ownerPhone, setOwnerPhone] = useState(currentOrg?.owner_phone || '');
  const [defaultFee, setDefaultFee] = useState(currentOrg?.default_fee || 2500);
  const [dueDay, setDueDay] = useState(currentOrg?.due_day || 5);
  const [tagline, setTagline] = useState(currentOrg?.custom_tagline || '');

  const [upiError, setUpiError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedMeta = ORG_TYPES[orgType] || ORG_TYPES.other;

  const handleUpiChange = (val) => {
    setUpiId(val);
    if (!val.trim()) {
      setUpiError(null);
      return;
    }
    const res = validateUPIId(val);
    setUpiError(res.isValid ? null : res.error);
  };

  const handlePhoneChange = (val) => {
    setOwnerPhone(val);
    if (!val.trim()) {
      setPhoneError(null);
      return;
    }
    const res = normalizePhoneNumber(val);
    setPhoneError(res.isValid ? null : res.error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const upiRes = validateUPIId(upiId);
    if (!upiRes.isValid) {
      setUpiError(upiRes.error);
      return;
    }

    const phoneRes = normalizePhoneNumber(ownerPhone);
    if (!phoneRes.isValid) {
      setPhoneError(phoneRes.error);
      return;
    }

    onSaveOrg({
      ...currentOrg,
      org_name: orgName.trim(),
      org_type: orgType,
      upi_id: upiRes.cleaned,
      owner_phone: phoneRes.formatted,
      default_fee: Number(defaultFee),
      due_day: Number(dueDay),
      custom_tagline: tagline.trim()
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Profile & UPI Settings Card */}
      <div className="rounded-2xl border border-white/10 bg-[#10121a]/90 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Building2 className="h-5 w-5 text-rose-500" />
              <span>Organization Profile &amp; UPI Gateway</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure your institution identity, payment gateway VPA, and due dates.
            </p>
          </div>
          {saveSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle className="h-4 w-4" />
              Settings Updated!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Org Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            {/* Org Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organization Type (Dynamic Terminology) *
              </label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {Object.values(ORG_TYPES).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Labels as "{t.memberLabel}")
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Dynamic terminology indicator */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs flex items-center justify-between">
            <span className="text-slate-400">Current dynamic terminology:</span>
            <div className="flex gap-3 font-semibold text-slate-200">
              <span>Singular: <strong className="text-emerald-400">{selectedMeta.memberLabel}</strong></span>
              <span>Plural: <strong className="text-emerald-400">{selectedMeta.memberLabelPlural}</strong></span>
              <span>Grouping: <strong className="text-amber-400">{selectedMeta.groupLabel}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* UPI ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Official Merchant UPI ID *
                </label>
                <span className="text-[10px] text-slate-400 font-mono">user@bank</span>
              </div>
              <input
                type="text"
                placeholder="e.g. shantischool@okhdfcbank"
                value={upiId}
                onChange={(e) => handleUpiChange(e.target.value)}
                className={`w-full rounded-xl border bg-[#161824] px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 ${
                  upiError ? 'border-rose-500 focus:ring-rose-500' : 'border-white/10 focus:ring-emerald-500'
                }`}
                required
              />
              {upiError && (
                <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {upiError}
                </p>
              )}
            </div>

            {/* Owner Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Owner Contact Mobile *
              </label>
              <input
                type="text"
                placeholder="+919811223344"
                value={ownerPhone}
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
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Default Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Monthly Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={defaultFee}
                onChange={(e) => setDefaultFee(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            {/* Due Day of Month */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Due Date (Day of Month)
              </label>
              <input
                type="number"
                min="1"
                max="28"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
              <span className="text-[10px] text-slate-500">e.g. 5th of every month</span>
            </div>

            {/* Custom Tagline */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Institution Subtitle / Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. CBSE Affiliated Secondary"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161824] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

          </div>

          {/* Submit */}
          <div className="mt-5 flex justify-end pt-3 border-t border-white/10">
            <button
              type="submit"
              className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-950 transition-all active:scale-95"
            >
              Save Organization Changes
            </button>
          </div>

        </form>

      </div>

      {/* Staff Access & Role Mode */}
      <div className="rounded-2xl border border-white/10 bg-[#10121a]/90 p-6 backdrop-blur-xl shadow-2xl">
        <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-amber-400" />
          <span>Staff Login &amp; Role Permissions</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Switch between Owner (Full Access) and Assistant (Daily operations: mark paid, send reminders).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onSetUserRole('owner')}
            className={`rounded-xl border p-4 text-left transition-all ${
              userRole === 'owner'
                ? 'border-rose-500/50 bg-rose-950/20 shadow-md'
                : 'border-white/10 bg-[#141620] text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-sm text-white">
              <span>Owner Mode</span>
              {userRole === 'owner' && <span className="h-2 w-2 rounded-full bg-rose-500" />}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Full control: modify UPI gateway, change due dates, import CSVs, delete records.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSetUserRole('assistant')}
            className={`rounded-xl border p-4 text-left transition-all ${
              userRole === 'assistant'
                ? 'border-amber-500/50 bg-amber-950/20 shadow-md'
                : 'border-white/10 bg-[#141620] text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-sm text-white">
              <span>Assistant / Teacher Mode</span>
              {userRole === 'assistant' && <span className="h-2 w-2 rounded-full bg-amber-500" />}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Operational control: view dues ledger, verify &amp; mark paid, dispatch WhatsApp reminders.
            </p>
          </button>
        </div>
      </div>

      {/* Reset Data Safety */}
      <div className="rounded-2xl border border-white/10 bg-[#10121a]/90 p-6 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Restore 15 Multi-Org Demo Records</h4>
          <p className="text-xs text-slate-400">
            Resets all local records back to the 15 diverse members across Gym, School, Coaching, and Hostel.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Reset local database back to default 15 records?')) {
              onResetData();
            }
          }}
          className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

    </div>
  );
}
