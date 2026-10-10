import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { generateUPILink, generateQRCodeDataURL } from '../lib/upiUtils.js';

export default function QRCodeModal({
  isOpen,
  onClose,
  member,
  paymentRecord,
  currentOrg,
  selectedMonth,
  selectedYear
}) {
  if (!isOpen || !member) return null;

  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[selectedMonth] || 'Monthly';

  const amountDue = paymentRecord
    ? Math.max(0, member.fee_amount - (paymentRecord.amount_paid || 0))
    : member.fee_amount;

  const upiLink = generateUPILink({
    upiId: currentOrg?.upi_id || 'shanti@upi',
    amount: amountDue,
    payeeName: currentOrg?.org_name || 'DueDate',
    note: `${monthName} ${selectedYear} fee for ${member.name}`
  });

  useEffect(() => {
    setIsLoading(true);
    generateQRCodeDataURL(upiLink).then((url) => {
      setQrDataUrl(url);
      setIsLoading(false);
    });
  }, [upiLink]);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl border border-white/15 bg-[#12141e] p-6 shadow-2xl text-center">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <QrCode className="h-4 w-4 text-emerald-400" />
            <span>UPI Instant Pay QR</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Member Details */}
        <div className="mt-4">
          <h4 className="font-bold text-white text-base">{member.name}</h4>
          <p className="text-xs text-slate-400">
            {monthName} {selectedYear} · {member.group_name || 'General'}
          </p>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
            ₹{amountDue.toLocaleString('en-IN')}
          </div>
        </div>

        {/* QR Code Container */}
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-white/15 bg-white p-3 shadow-xl">
            {isLoading ? (
              <div className="h-56 w-56 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`UPI QR for ${member.name}`}
                className="h-56 w-56 object-contain"
              />
            ) : (
              <div className="h-56 w-56 flex items-center justify-center text-rose-500 text-xs">
                Failed to render QR
              </div>
            )}
          </div>
        </div>

        {/* Payee Info */}
        <div className="mt-4 text-xs text-slate-400">
          Payee UPI ID:{' '}
          <span className="font-mono text-slate-200 font-semibold">
            {currentOrg?.upi_id || 'fee@upi'}
          </span>
        </div>

        {/* Copy UPI Intent Link */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#161824] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Link' : 'Copy UPI Link'}</span>
          </button>

          <a
            href={upiLink}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open UPI App</span>
          </a>
        </div>

      </div>
    </div>
  );
}
