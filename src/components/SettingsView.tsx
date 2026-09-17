import React, { useState } from 'react';
import {
  User,
  Sliders,
  DollarSign,
  MessageSquare,
  Globe,
  Save,
  CheckCircle2,
  Shield,
  Layers,
} from 'lucide-react';
import { AppSettings } from '../types.ts';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onUpdateSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Developer Profile & Outreach Settings</h2>
        <p className="text-xs text-slate-500">
          Customize your freelance agency identity, portfolio references, opportunity thresholds, and default pricing tiers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Freelance Web Developer Profile</h3>
              <p className="text-xs text-slate-500">These details are dynamically injected into AI messages and proposals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={formData.developerName}
                onChange={(e) => setFormData({ ...formData, developerName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Agency / Brand Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Portfolio Showcase URL
              </label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Direct WhatsApp Number
              </label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Opportunity Thresholds & Guardrails */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Opportunity Score Thresholds</h3>
              <p className="text-xs text-slate-500">Define score boundaries for categorizing website viability</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                High Opportunity Threshold
              </label>
              <input
                type="number"
                min={70}
                max={95}
                value={formData.scoreThresholds.high}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scoreThresholds: { ...formData.scoreThresholds, high: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default 80 (Leads with no website / broken site)</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Medium Opportunity Threshold
              </label>
              <input
                type="number"
                min={40}
                max={75}
                value={formData.scoreThresholds.medium}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scoreThresholds: { ...formData.scoreThresholds, medium: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default 60 (Outdated layout / missing mobile)</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Daily Safe Outreach Limit
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={formData.dailyOutreachLimit}
                onChange={(e) =>
                  setFormData({ ...formData, dailyOutreachLimit: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Prevents account flagging; max safe messages/day</span>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Default Web Project Pricing Packages</h3>
              <p className="text-xs text-slate-500">Configured baseline prices used in 1-click Proposal Generation</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Basic Site ($)
              </label>
              <input
                type="number"
                value={formData.pricing.basic}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, basic: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Business Site ($)
              </label>
              <input
                type="number"
                value={formData.pricing.business}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, business: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                E-Commerce ($)
              </label>
              <input
                type="number"
                value={formData.pricing.ecommerce}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, ecommerce: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Custom Web App ($)
              </label>
              <input
                type="number"
                value={formData.pricing.custom}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, custom: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Message Templates Variables Reference */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Dynamic AI Template Variables</h3>
          </div>
          <p className="text-slate-500">
            ClientHunter AI prompt generation automatically incorporates:
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">{'{{business_name}}'}</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">{'{{city}}'}</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">{'{{category}}'}</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">{'{{website_status}}'}</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">{'{{developer_name}}'}</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">{'{{portfolio_url}}'}</span>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Preferences saved!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
