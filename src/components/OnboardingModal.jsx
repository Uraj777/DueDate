import React, { useState } from 'react';
import { X, Sparkles, Building2, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { validateUPIId } from '../lib/upiUtils.js';
import { normalizePhoneNumber } from '../lib/phoneUtils.js';
import { ORG_TYPES } from '../lib/types.js';

export default function OnboardingModal({
  isOpen,
  onClose,
  onCreateOrg
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [orgType, setOrgType] = useState('school');
  const [orgName, setOrgName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [defaultFee, setDefaultFee] = useState(3500);
  const [dueDay, setDueDay] = useState(5);

  const [upiError, setUpiError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);

  const selectedMeta = ORG_TYPES[orgType] || ORG_TYPES.other;

  const handleOrgTypeSelect = (typeKey) => {
    setOrgType(typeKey);
    const meta = ORG_TYPES[typeKey];
    if (meta) {
      setDefaultFee(meta.defaultFee);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!orgName.trim()) {
        alert('Please enter your organization name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
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
      setUpiError(null);
      setPhoneError(null);
      setStep(3);
    } else if (step === 3) {
      // Create new org!
      const newOrg = {
        id: `org-${Date.now()}`,
        org_name: orgName.trim(),
        org_type: orgType,
        upi_id: upiId.trim(),
        owner_phone: normalizePhoneNumber(ownerPhone).formatted,
        default_fee: Number(defaultFee) || 2000,
        due_day: Number(dueDay) || 5,
        custom_tagline: `Premium ${selectedMeta.name}`
      };
      onCreateOrg(newOrg);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-[#12141e] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white font-bold text-xs">
              {step}/3
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                2-Minute Organization Setup
              </h3>
              <p className="text-xs text-slate-400">
                Setup your fee rules and customize dynamic member terminology
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Select Type & Name */}
        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organization / Center Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Zenith Academy, FitPulse Gym, St. Mary School"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#161824] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select What Kind of Place This Is:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(ORG_TYPES).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleOrgTypeSelect(t.id)}
                    className={`rounded-xl border p-2.5 text-left transition-all ${
                      orgType === t.id
                        ? 'border-rose-500 bg-rose-950/40 text-white shadow-sm ring-1 ring-rose-500'
                        : 'border-white/10 bg-[#161824] text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="font-bold text-xs text-white truncate">{t.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Calls people: <strong className="text-emerald-400">{t.memberLabelPlural}</strong>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-300">
              💡 <strong>Smart Terminology:</strong> By selecting{' '}
              <span className="text-white font-semibold">{selectedMeta.name}</span>, all screens, WhatsApp templates, and reports will dynamically refer to your clients as{' '}
              <strong className="text-emerald-400">{selectedMeta.memberLabelPlural}</strong>.
            </div>
          </div>
        )}

        {/* Step 2: UPI ID & Phone */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Your UPI ID (VPA) for Receiving Fees *
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Format: name@bank</span>
              </div>
              <input
                type="text"
                placeholder="e.g. zenithacademy@okhdfcbank or 9811223344@paytm"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  const res = validateUPIId(e.target.value);
                  setUpiError(res.isValid ? null : res.error);
                }}
                className={`w-full rounded-xl border bg-[#161824] px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 ${
                  upiError ? 'border-rose-500 focus:ring-rose-500' : 'border-white/15 focus:ring-emerald-500'
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Administrator / Teacher Phone Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 9811223344 or +91 98112 23344"
                value={ownerPhone}
                onChange={(e) => {
                  setOwnerPhone(e.target.value);
                  const res = normalizePhoneNumber(e.target.value);
                  setPhoneError(res.isValid ? null : res.error);
                }}
                className={`w-full rounded-xl border bg-[#161824] px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 ${
                  phoneError ? 'border-rose-500 focus:ring-rose-500' : 'border-white/15 focus:ring-emerald-500'
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
        )}

        {/* Step 3: Default Fee & Due Date */}
        {step === 3 && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Recurring Fee (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  value={defaultFee}
                  onChange={(e) => setDefaultFee(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#161824] px-3.5 py-2.5 text-sm font-mono font-semibold text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Due Day of Every Month (1-28)
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#161824] px-3.5 py-2.5 text-sm font-mono font-semibold text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Ready to Launch {orgName}</span>
              </div>
              <p className="text-slate-300">
                Reminders will automatically target the <strong>{dueDay}th of each month</strong> with your custom UPI link. You can add {selectedMeta.memberLabelPlural.toLowerCase()} via CSV or manual add immediately.
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-6 flex items-center justify-between pt-3 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-950 transition-all active:scale-95"
          >
            <span>{step === 3 ? 'Launch Organization' : 'Continue'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
