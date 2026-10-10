import React from 'react';
import {
  Building2,
  Dumbbell,
  GraduationCap,
  BookOpen,
  Plus,
  Shield,
  UserCheck,
  ChevronDown,
  Sparkles,
  Zap
} from 'lucide-react';
import { ORG_TYPES } from '../lib/types.js';

export default function Navbar({
  currentOrg,
  organizations,
  onSelectOrg,
  onOpenNewOrgModal,
  activeTab,
  onSelectTab,
  onOpenAddMember,
  userRole,
  onToggleRole
}) {
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = React.useState(false);
  const orgTypeConfig = ORG_TYPES[currentOrg?.org_type] || ORG_TYPES.other;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0c0e15]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        
        {/* Zone 1: Single text element wordmark with logo mark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 via-rose-700 to-amber-700 shadow-lg shadow-rose-950/50">
            {/* Custom geometric circular lattice mark inspired by reference image */}
            <svg
              className="h-6 w-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
              <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-['Outfit']">
                DueDate
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-wide text-amber-400/90 uppercase px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-medium">
              Smart Fee & Dues Reminder System
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (4-5 single-line clean tabs) */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('automation')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'automation'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Automation & Cron
          </button>
          <button
            onClick={() => onSelectTab('members')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'members'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {orgTypeConfig.memberLabelPlural} Directory
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Settings & UPI
          </button>
        </nav>

        {/* Zone 3: Actions - Org Switcher + Role + Crimson Action Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Org Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#141620] px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#1a1d2c] transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              <span className="max-w-[110px] sm:max-w-[150px] truncate text-left">
                {currentOrg?.org_name || 'Select Org'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </button>

            {isOrgDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl border border-white/15 bg-[#12141c] p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsOrgDropdownOpen(false)}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Switch Organization
                </div>
                <div className="space-y-0.5">
                  {organizations.map((org) => {
                    const isSelected = org.id === currentOrg?.id;
                    const meta = ORG_TYPES[org.org_type] || ORG_TYPES.other;
                    return (
                      <button
                        key={org.id}
                        onClick={() => onSelectOrg(org.id)}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                          isSelected
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-400 text-xs">
                            {org.org_type === 'gym' ? '🏋️' : org.org_type === 'school' ? '🏫' : org.org_type === 'coaching' ? '📚' : '🏢'}
                          </span>
                          <span className="truncate">{org.org_name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0 uppercase">
                          {meta.memberLabelPlural}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1 border-t border-white/10 pt-1">
                  <button
                    onClick={onOpenNewOrgModal}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-rose-300 hover:bg-rose-500/10 transition-colors font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    + Setup New Organization
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role Pill Switcher */}
          <button
            onClick={onToggleRole}
            title={`Current Role: ${userRole}. Click to toggle Owner / Assistant.`}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#141620] px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#1a1d2c] transition-colors"
          >
            <Shield className="h-3.5 w-3.5 text-amber-400" />
            <span className="capitalize">{userRole}</span>
          </button>

          {/* Primary Action Button (Crimson velvet pill matching Demo Request in image) */}
          <button
            onClick={onOpenAddMember}
            className="flex items-center gap-1.5 rounded-full bg-[#9E202C] px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-rose-950/60 transition-all hover:bg-[#b91c1c] active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add {orgTypeConfig.memberLabel}</span>
          </button>
        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-white/5 px-4 py-2 gap-2 text-xs text-slate-400 scrollbar-none">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-3 py-1 rounded-md shrink-0 ${
            activeTab === 'dashboard' ? 'bg-white/10 text-white font-medium' : 'hover:text-white'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('automation')}
          className={`px-3 py-1 rounded-md shrink-0 flex items-center gap-1 ${
            activeTab === 'automation' ? 'bg-white/10 text-white font-medium' : 'hover:text-white'
          }`}
        >
          <Zap className="h-3 w-3 text-amber-400" />
          Automation
        </button>
        <button
          onClick={() => onSelectTab('members')}
          className={`px-3 py-1 rounded-md shrink-0 ${
            activeTab === 'members' ? 'bg-white/10 text-white font-medium' : 'hover:text-white'
          }`}
        >
          {orgTypeConfig.memberLabelPlural}
        </button>
        <button
          onClick={() => onSelectTab('settings')}
          className={`px-3 py-1 rounded-md shrink-0 ${
            activeTab === 'settings' ? 'bg-white/10 text-white font-medium' : 'hover:text-white'
          }`}
        >
          Settings
        </button>
      </div>
    </header>
  );
}
