import React, { useState } from 'react';
import { X, Upload, FileText, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseMemberCSV, generateSampleCSV } from '../lib/csvParser.js';
import { ORG_TYPES } from '../lib/types.js';

export default function CSVUploadModal({
  isOpen,
  onClose,
  currentOrg,
  existingMembers,
  onImportMembers
}) {
  if (!isOpen) return null;

  const orgConfig = ORG_TYPES[currentOrg?.org_type] || ORG_TYPES.other;

  const [csvText, setCsvText] = useState('');
  const [parseResult, setParseResult] = useState(null);
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'file'

  const handleParse = (text) => {
    const res = parseMemberCSV(text, existingMembers);
    setParseResult(res);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setCsvText(val);
    if (val.trim()) {
      handleParse(val);
    } else {
      setParseResult(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setCsvText(text);
        handleParse(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sample = generateSampleCSV(currentOrg?.org_type);
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DueDate_Sample_${currentOrg.org_type || 'template'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    onImportMembers(parseResult.validRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#12141e] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Upload className="h-5 w-5 text-rose-500" />
              <span>Import {orgConfig.memberLabelPlural} from CSV</span>
            </h3>
            <p className="text-xs text-slate-400">
              Bulk import with auto-sanitization of phone numbers and validation checks
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action strip: download sample template */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
          <span className="text-slate-300">
            Need the column format? Download pre-formatted template:
          </span>
          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-rose-400" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* Input area */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Upload CSV File or Paste Raw Text:
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
            />
          </div>

          <textarea
            rows={5}
            value={csvText}
            onChange={handleTextChange}
            placeholder={`Name,Phone,Guardian Name,Class / Batch,Fee Amount,Notes\nAarav Gupta,9876543210,Rajesh Gupta,Batch 10-A,3500,Roll #15\nDiya Sen,9822334455,Amit Sen,Batch 10-B,3500,Roll #22`}
            className="w-full rounded-xl border border-white/10 bg-[#161824] p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* Validation Result Box */}
        {parseResult && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                {parseResult.validRows.length} Valid Records Ready
              </span>
              {parseResult.failedRows.length > 0 && (
                <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  {parseResult.failedRows.length} Errors Found
                </span>
              )}
            </div>

            {/* Error rows breakdown */}
            {parseResult.failedRows.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-xl border border-rose-500/20 bg-rose-950/20 p-2.5 text-xs text-rose-300 space-y-1">
                <div className="font-semibold text-rose-200">Failed Rows (Will be skipped):</div>
                {parseResult.failedRows.map((err, idx) => (
                  <div key={idx} className="text-[11px] font-mono">
                    Line {err.rowNumber}: {err.error}
                  </div>
                ))}
              </div>
            )}

            {/* Preview table for valid rows */}
            {parseResult.validRows.length > 0 && (
              <div className="max-h-36 overflow-y-auto rounded-xl border border-white/10 bg-[#0e1017]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-slate-400 bg-white/[0.02]">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Phone (Standardized)</th>
                      <th className="p-2">Group</th>
                      <th className="p-2">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-mono text-[11px]">
                    {parseResult.validRows.slice(0, 5).map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 font-sans font-medium text-white">{r.name}</td>
                        <td className="p-2">{r.phone_number}</td>
                        <td className="p-2 font-sans">{r.group_name}</td>
                        <td className="p-2 text-emerald-400 font-semibold">₹{r.fee_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parseResult || parseResult.validRows.length === 0}
            onClick={handleConfirmImport}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-lg transition-all active:scale-95 ${
              !parseResult || parseResult.validRows.length === 0
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950 cursor-pointer'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>
              Import {parseResult ? parseResult.validRows.length : 0} {orgConfig.memberLabelPlural}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
