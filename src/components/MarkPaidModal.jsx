import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MarkPaidModal({
  isOpen,
  onClose,
  member,
  paymentRecord,
  currentOrg,
  selectedMonth,
  selectedYear,
  onSavePayment
}) {
  if (!isOpen || !member) return null;

  const totalFee = member.fee_amount;
  const alreadyPaid = paymentRecord ? Number(paymentRecord.amount_paid || 0) : 0;
  const initialRemaining = Math.max(0, totalFee - alreadyPaid);

  const [payingAmount, setPayingAmount] = useState(initialRemaining);
  const [paymentMethod, setPaymentMethod] = useState(paymentRecord?.payment_method || 'UPI');
  const [notes, setNotes] = useState(paymentRecord?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPayingAmount(initialRemaining);
    setPaymentMethod(paymentRecord?.payment_method || 'UPI');
    setNotes(paymentRecord?.notes || '');
  }, [member, paymentRecord, initialRemaining]);

  const numPaying = Number(payingAmount) || 0;
  const newTotalPaid = alreadyPaid + numPaying;
  const remainingAfter = Math.max(0, totalFee - newTotalPaid);

  const isFullSettlement = newTotalPaid >= totalFee;
  const isPartial = newTotalPaid > 0 && newTotalPaid < totalFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numPaying <= 0 && alreadyPaid === 0) {
      alert('Please enter a payment amount greater than 0.');
      return;
    }

    setIsSubmitting(true);

    onSavePayment({
      memberId: member.id,
      orgId: currentOrg.id,
      month: selectedMonth,
      year: selectedYear,
      amountDue: totalFee,
      payingAmount: numPaying,
      paymentMethod,
      notes: notes.trim()
    });

    // If fully settled, fire celebratory confetti!
    if (isFullSettlement) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback
      }
    }

    setIsSubmitting(false);
    onClose();
  };

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#12141e] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              <span>Verify &amp; Mark Payment</span>
            </h3>
            <p className="text-xs text-slate-400">
              {member.name} · {monthNames[selectedMonth]} {selectedYear}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Summary Box */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Total Monthly Fee:</span>
              <span className="font-semibold text-white font-mono">₹{totalFee.toLocaleString('en-IN')}</span>
            </div>
            {alreadyPaid > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Previously Paid:</span>
                <span className="font-mono">₹{alreadyPaid.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
              <span className="text-slate-300">Outstanding Balance:</span>
              <span className="text-rose-400 font-mono">₹{initialRemaining.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Amount Paying Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Amount Being Paid Right Now (₹)
              </label>
              <div className="space-x-1.5">
                <button
                  type="button"
                  onClick={() => setPayingAmount(initialRemaining)}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Pay Full (₹{initialRemaining})
                </button>
                {initialRemaining > 1000 && (
                  <button
                    type="button"
                    onClick={() => setPayingAmount(Math.round(initialRemaining / 2))}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Half (₹{Math.round(initialRemaining / 2)})
                  </button>
                )}
              </div>
            </div>
            <input
              type="number"
              min="0"
              max={totalFee}
              value={payingAmount}
              onChange={(e) => setPayingAmount(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-white/15 bg-[#181a26] px-4 py-2.5 text-sm font-semibold text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Status Prediction Badge */}
          <div className="rounded-lg bg-black/30 border border-white/10 p-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Resulting Status:</span>
            {isFullSettlement ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                PAID (Zero balance remaining)
              </span>
            ) : isPartial ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-400">
                <Clock className="h-4 w-4" />
                PARTIAL (Remaining due: ₹{remainingAfter})
              </span>
            ) : (
              <span className="text-rose-400 font-semibold">
                PENDING (No payment recorded)
              </span>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['UPI', 'CASH', 'BANK_TRANSFER', 'CHEQUE'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                    paymentMethod === m
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                      : 'border-white/10 bg-[#161824] text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {m === 'BANK_TRANSFER' ? 'NEFT/IMPS' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Note / Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Transaction Ref / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. GPay UPI ref #849204, or Cash handed by father"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#181a26] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition-all active:scale-95"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Confirm &amp; Record Payment</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
