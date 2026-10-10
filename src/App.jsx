import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import TopCards from './components/TopCards.jsx';
import SmartTable from './components/SmartTable.jsx';
import AutomationCronView from './components/AutomationCronView.jsx';
import SettingsView from './components/SettingsView.jsx';

// Modals
import MarkPaidModal from './components/MarkPaidModal.jsx';
import SendReminderModal from './components/SendReminderModal.jsx';
import BulkReminderModal from './components/BulkReminderModal.jsx';
import QRCodeModal from './components/QRCodeModal.jsx';
import MemberHistoryModal from './components/MemberHistoryModal.jsx';
import AddMemberModal from './components/AddMemberModal.jsx';
import CSVUploadModal from './components/CSVUploadModal.jsx';
import OnboardingModal from './components/OnboardingModal.jsx';

import {
  initializeStorage,
  getOrganizations,
  getCurrentOrgId,
  setCurrentOrgId,
  getCurrentOrg,
  saveOrganization,
  getMembers,
  saveMember,
  archiveMember,
  restoreMember,
  getPayments,
  getAllPaymentsForMember,
  recordPayment,
  getReminderLogs,
  logReminder,
  getTemplates,
  saveTemplates,
  getCronSettings,
  saveCronSettings,
  getUserRole,
  setUserRole,
  resetToDefaults
} from './lib/storage.js';

import { ORG_TYPES } from './lib/types.js';

export default function App() {
  // Initialize storage once
  useEffect(() => {
    initializeStorage();
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'automation' | 'members' | 'settings'
  const [selectedMonth, setSelectedMonth] = useState(10); // October (current default)
  const [selectedYear, setSelectedYear] = useState(2026);

  // Core state from storage
  const [organizations, setOrganizations] = useState(() => getOrganizations());
  const [currentOrgId, setCurrentOrgIdState] = useState(() => getCurrentOrgId());
  const [userRole, setUserRoleState] = useState(() => getUserRole());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Trigger re-read on updates
  const reloadData = () => setRefreshTrigger((prev) => prev + 1);

  const currentOrg = useMemo(() => {
    return organizations.find((o) => o.id === currentOrgId) || organizations[0];
  }, [organizations, currentOrgId]);

  const members = useMemo(() => {
    return getMembers(currentOrgId, false);
  }, [currentOrgId, refreshTrigger]);

  const archivedMembers = useMemo(() => {
    const all = getMembers(currentOrgId, true);
    return all.filter((m) => m.is_archived);
  }, [currentOrgId, refreshTrigger]);

  const payments = useMemo(() => {
    return getPayments(currentOrgId, selectedMonth, selectedYear);
  }, [currentOrgId, selectedMonth, selectedYear, refreshTrigger]);

  const reminderLogs = useMemo(() => {
    return getReminderLogs(currentOrgId);
  }, [currentOrgId, refreshTrigger]);

  const templates = useMemo(() => {
    return getTemplates();
  }, [refreshTrigger]);

  const cronSettings = useMemo(() => {
    return getCronSettings();
  }, [refreshTrigger]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalMembers = members.length;
    let collectedAmount = 0;
    let pendingAmount = 0;
    let pendingCount = 0;
    let partialCount = 0;

    const payMap = new Map();
    payments.forEach((p) => payMap.set(p.member_id, p));

    members.forEach((m) => {
      const p = payMap.get(m.id);
      const paid = p ? Number(p.amount_paid || 0) : 0;
      const fee = Number(m.fee_amount || 0);

      collectedAmount += paid;
      const remaining = Math.max(0, fee - paid);
      pendingAmount += remaining;

      if (!p || p.status === 'PENDING') {
        pendingCount += 1;
      } else if (p.status === 'PARTIAL') {
        pendingCount += 1;
        partialCount += 1;
      }
    });

    const totalDues = collectedAmount + pendingAmount;
    const recoveryRate = totalDues > 0 ? Math.round((collectedAmount / totalDues) * 100) : 100;

    return {
      totalMembers,
      collectedAmount,
      pendingAmount,
      pendingCount,
      partialCount,
      recoveryRate
    };
  }, [members, payments]);

  // Bulk Selection State
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // Modal Visibility States
  const [activeModal, setActiveModal] = useState(null); // 'markPaid' | 'sendReminder' | 'bulkReminder' | 'qr' | 'history' | 'addMember' | 'csv' | 'onboarding'
  const [targetMember, setTargetMember] = useState(null);
  const [targetPayment, setTargetPayment] = useState(null);

  // Org Selection Handlers
  const handleSelectOrg = (id) => {
    setCurrentOrgId(id);
    setCurrentOrgIdState(id);
    setSelectedMemberIds([]);
    reloadData();
  };

  const handleCreateOrg = (newOrg) => {
    saveOrganization(newOrg);
    const updatedOrgs = getOrganizations();
    setOrganizations(updatedOrgs);
    handleSelectOrg(newOrg.id);
  };

  const handleSaveOrg = (updatedOrg) => {
    saveOrganization(updatedOrg);
    setOrganizations(getOrganizations());
    reloadData();
  };

  // Staff Role Toggle
  const handleToggleRole = () => {
    const nextRole = userRole === 'owner' ? 'assistant' : 'owner';
    setUserRole(nextRole);
    setUserRoleState(nextRole);
  };

  // Member Handlers
  const handleSaveMember = (memberData) => {
    saveMember(memberData);
    reloadData();
  };

  const handleArchiveMember = (memberId, memberName) => {
    if (window.confirm(`Archive ${memberName}? You can restore them anytime from the archive.`)) {
      archiveMember(memberId);
      setSelectedMemberIds((prev) => prev.filter((id) => id !== memberId));
      reloadData();
    }
  };

  const handleRestoreMember = (memberId) => {
    restoreMember(memberId);
    reloadData();
  };

  // Payment Recording
  const handleRecordPayment = (paymentData) => {
    recordPayment(paymentData);
    reloadData();
  };

  // Reminder Logging
  const handleLogReminder = (logData) => {
    logReminder(logData);
    reloadData();
  };

  // CSV Bulk Import
  const handleImportMembers = (newMembersList) => {
    newMembersList.forEach((m) => {
      saveMember({
        ...m,
        org_id: currentOrgId
      });
    });
    reloadData();
  };

  // Selection handlers
  const handleToggleSelectMember = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllPending = (pendingIds) => {
    setSelectedMemberIds(pendingIds);
  };

  const handleClearSelection = () => {
    setSelectedMemberIds([]);
  };

  // Modal Open Helpers
  const openMarkPaid = (memberRow) => {
    setTargetMember(memberRow);
    setTargetPayment(memberRow.paymentRecord || null);
    setActiveModal('markPaid');
  };

  const openSendReminder = (memberRow) => {
    setTargetMember(memberRow);
    setTargetPayment(memberRow.paymentRecord || null);
    setActiveModal('sendReminder');
  };

  const openQRCode = (memberRow) => {
    setTargetMember(memberRow);
    setTargetPayment(memberRow.paymentRecord || null);
    setActiveModal('qr');
  };

  const openHistory = (memberRow) => {
    setTargetMember(memberRow);
    setActiveModal('history');
  };

  const closeModal = () => {
    setActiveModal(null);
    setTargetMember(null);
    setTargetPayment(null);
  };

  const orgConfig = ORG_TYPES[currentOrg?.org_type] || ORG_TYPES.other;

  return (
    <div className="relative min-h-screen bg-[#08090d] text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      
      {/* Ambient background glows matching reference image */}
      <div className="ambient-bg-glow" aria-hidden="true">
        <div className="ambient-orb-amber" />
        <div className="ambient-orb-emerald" />
        <div className="ambient-orb-crimson" />
      </div>

      {/* Top Bar Header */}
      <Navbar
        currentOrg={currentOrg}
        organizations={organizations}
        onSelectOrg={handleSelectOrg}
        onOpenNewOrgModal={() => setActiveModal('onboarding')}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddMember={() => setActiveModal('addMember')}
        userRole={userRole}
        onToggleRole={handleToggleRole}
      />

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Hero Banner with stats */}
            <HeroBanner
              currentOrg={currentOrg}
              stats={stats}
              onOpenBulkReminder={() => setActiveModal('bulkReminder')}
              onOpenCSVUpload={() => setActiveModal('csv')}
              onOpenAddMember={() => setActiveModal('addMember')}
            />

            {/* Top Cards KPI */}
            <TopCards
              currentOrg={currentOrg}
              stats={stats}
              cronSettings={cronSettings}
            />

            {/* Smart Table */}
            <SmartTable
              currentOrg={currentOrg}
              members={members}
              payments={payments}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onChangeMonth={(m, y) => {
                setSelectedMonth(m);
                setSelectedYear(y);
              }}
              onOpenMarkPaid={openMarkPaid}
              onOpenSendReminder={openSendReminder}
              onOpenQRCode={openQRCode}
              onOpenHistory={openHistory}
              onArchiveMember={handleArchiveMember}
              selectedMemberIds={selectedMemberIds}
              onToggleSelectMember={handleToggleSelectMember}
              onSelectAllPending={handleSelectAllPending}
              onClearSelection={handleClearSelection}
              onBulkSendReminder={() => setActiveModal('bulkReminder')}
            />
          </div>
        )}

        {/* TAB 2: AUTOMATION & CRON */}
        {activeTab === 'automation' && (
          <div className="animate-in fade-in duration-300">
            <AutomationCronView
              currentOrg={currentOrg}
              members={members}
              payments={payments}
              cronSettings={cronSettings}
              onSaveCronSettings={(s) => {
                saveCronSettings(s);
                reloadData();
              }}
              templates={templates}
              onSaveTemplates={(t) => {
                saveTemplates(t);
                reloadData();
              }}
              reminderLogs={reminderLogs}
            />
          </div>
        )}

        {/* TAB 3: MEMBERS DIRECTORY */}
        {activeTab === 'members' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#10121a]/90 p-5 backdrop-blur-xl">
              <div>
                <h2 className="text-xl font-bold text-white font-['Outfit']">
                  {orgConfig.memberLabelPlural} Directory &amp; Records
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Complete registry of all enrolled {orgConfig.memberLabelPlural.toLowerCase()} in {currentOrg?.org_name}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModal('csv')}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  Import CSV
                </button>
                <button
                  onClick={() => setActiveModal('addMember')}
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-950"
                >
                  + Add New {orgConfig.memberLabel}
                </button>
              </div>
            </div>

            <SmartTable
              currentOrg={currentOrg}
              members={members}
              payments={payments}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onChangeMonth={(m, y) => {
                setSelectedMonth(m);
                setSelectedYear(y);
              }}
              onOpenMarkPaid={openMarkPaid}
              onOpenSendReminder={openSendReminder}
              onOpenQRCode={openQRCode}
              onOpenHistory={openHistory}
              onArchiveMember={handleArchiveMember}
              selectedMemberIds={selectedMemberIds}
              onToggleSelectMember={handleToggleSelectMember}
              onSelectAllPending={handleSelectAllPending}
              onClearSelection={handleClearSelection}
              onBulkSendReminder={() => setActiveModal('bulkReminder')}
            />

            {/* Archived Members Section (Delete Safety) */}
            {archivedMembers.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#10121a]/70 p-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Archived / Inactive {orgConfig.memberLabelPlural} ({archivedMembers.length})
                </h3>
                <div className="divide-y divide-white/5">
                  {archivedMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-2 text-xs">
                      <div>
                        <span className="text-white font-semibold">{m.name}</span>
                        <span className="text-slate-500 ml-2">({m.phone_number})</span>
                      </div>
                      <button
                        onClick={() => handleRestoreMember(m.id)}
                        className="text-xs text-emerald-400 hover:underline font-semibold"
                      >
                        Restore Record
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS & UPI */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-300">
            <SettingsView
              currentOrg={currentOrg}
              onSaveOrg={handleSaveOrg}
              userRole={userRole}
              onSetUserRole={(r) => {
                setUserRole(r);
                setUserRoleState(r);
              }}
              onResetData={() => {
                resetToDefaults();
                setOrganizations(getOrganizations());
                handleSelectOrg(getOrganizations()[0].id);
              }}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#08090d]/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-['Outfit']">DueDate</span>
            <span>— Never chase payments again.</span>
          </div>
          <div>
            Built with pure Python &amp; JavaScript · IST Asia/Kolkata Automation
          </div>
        </div>
      </footer>

      {/* ALL MODALS */}

      {/* 1. Mark Paid Modal */}
      <MarkPaidModal
        isOpen={activeModal === 'markPaid'}
        onClose={closeModal}
        member={targetMember}
        paymentRecord={targetPayment}
        currentOrg={currentOrg}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSavePayment={handleRecordPayment}
      />

      {/* 2. Send Reminder Modal */}
      <SendReminderModal
        isOpen={activeModal === 'sendReminder'}
        onClose={closeModal}
        member={targetMember}
        paymentRecord={targetPayment}
        currentOrg={currentOrg}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        lastReminderLog={reminderLogs.find((l) => l.member_id === targetMember?.id)}
        templates={templates}
        onLogReminder={handleLogReminder}
      />

      {/* 3. Bulk Reminder Modal */}
      <BulkReminderModal
        isOpen={activeModal === 'bulkReminder'}
        onClose={closeModal}
        selectedMemberIds={
          selectedMemberIds.length > 0
            ? selectedMemberIds
            : members.filter((m) => {
                const p = payments.find((pay) => pay.member_id === m.id);
                return !p || p.status !== 'PAID';
              }).map((m) => m.id)
        }
        members={members}
        payments={payments}
        currentOrg={currentOrg}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        templates={templates}
        onLogReminder={handleLogReminder}
        onComplete={() => {
          setSelectedMemberIds([]);
          reloadData();
        }}
      />

      {/* 4. QR Code Modal */}
      <QRCodeModal
        isOpen={activeModal === 'qr'}
        onClose={closeModal}
        member={targetMember}
        paymentRecord={targetPayment}
        currentOrg={currentOrg}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {/* 5. Member History Modal */}
      <MemberHistoryModal
        isOpen={activeModal === 'history'}
        onClose={closeModal}
        member={targetMember}
        paymentsHistory={targetMember ? getAllPaymentsForMember(targetMember.id) : []}
        reminderLogs={targetMember ? reminderLogs.filter((l) => l.member_id === targetMember.id) : []}
      />

      {/* 6. Add Member Modal */}
      <AddMemberModal
        isOpen={activeModal === 'addMember'}
        onClose={closeModal}
        currentOrg={currentOrg}
        existingMembers={members}
        onSaveMember={handleSaveMember}
      />

      {/* 7. CSV Upload Modal */}
      <CSVUploadModal
        isOpen={activeModal === 'csv'}
        onClose={closeModal}
        currentOrg={currentOrg}
        existingMembers={members}
        onImportMembers={handleImportMembers}
      />

      {/* 8. Onboarding Modal */}
      <OnboardingModal
        isOpen={activeModal === 'onboarding'}
        onClose={closeModal}
        onCreateOrg={handleCreateOrg}
      />

    </div>
  );
}
