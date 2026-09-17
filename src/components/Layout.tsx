import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  History,
  CheckCircle2,
} from 'lucide-react';
import { IntegrationsConfig, AppSettings } from '../types.ts';

interface LayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  integrations?: IntegrationsConfig;
  settings?: AppSettings;
  analyzedCount?: number;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  analyzedCount = 0,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'find-leads',
      stepNum: '1',
      label: 'Find & Analyze (AI Message)',
      subtitle: 'Google Maps Search & Pitch Generator',
      icon: Sparkles,
    },
    {
      id: 'analyzed-history',
      stepNum: '2',
      label: 'Already Analyzed Businesses',
      subtitle: 'Excluded from Future Google Searches',
      icon: ShieldCheck,
      badge: analyzedCount,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-col justify-between bg-slate-900 text-white p-5 border-r border-slate-800 shrink-0 sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-600/30">
              CH
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">ClientHunter</span>
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded">
                  AI
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">Google Maps Lead Outreach</span>
            </div>
          </div>

          {/* Workflow Guide */}
          <div className="px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Simple 2-Step Workflow
            </span>
          </div>

          {/* Nav List */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full text-left p-3 rounded-xl transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.stepNum}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">{item.label}</div>
                        <div
                          className={`text-[10px] mt-0.5 leading-snug ${
                            isActive ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? 'bg-white text-indigo-700'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Shield Status */}
        <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-[11px]">Auto Deduplication Active</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Jo businesses analyze ho jati hain wo permanent history mein save ho jati hain taake Google Maps unhein dobara kabi repeat na kare.
          </p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-slate-900 text-white p-5 flex flex-col justify-between z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                    CH
                  </div>
                  <span className="font-bold text-white text-sm">ClientHunter AI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl ${
                        isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.subtitle}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="font-bold text-slate-900">
                {currentTab === 'find-leads'
                  ? 'Step 1: Find & Analyze Businesses'
                  : 'Step 2: Already Analyzed Businesses'}
              </span>
            </div>
          </div>

          {/* Right Header Navigation Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('find-leads')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === 'find-leads'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. Find & Analyze
            </button>

            <button
              onClick={() => onSelectTab('analyzed-history')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === 'analyzed-history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>2. Analyzed History</span>
              {analyzedCount > 0 && (
                <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-full font-bold">
                  {analyzedCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
