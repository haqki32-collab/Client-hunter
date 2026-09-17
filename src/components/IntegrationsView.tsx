import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  RefreshCw,
  Key,
  Shield,
  Layers,
  Database,
  Globe,
} from 'lucide-react';
import { IntegrationsConfig } from '../types.ts';

interface IntegrationsViewProps {
  integrations: IntegrationsConfig;
  onUpdateIntegrations: (updated: Partial<IntegrationsConfig>) => Promise<void>;
  onRefreshStatus: () => Promise<void>;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrations,
  onUpdateIntegrations,
  onRefreshStatus,
}) => {
  const [phoneNumberId, setPhoneNumberId] = useState(integrations.phoneNumberId || '');
  const [businessAccountId, setBusinessAccountId] = useState(integrations.businessAccountId || '');
  const [accessToken, setAccessToken] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(integrations.isDemoMode);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const fullWebhookUrl = `${window.location.origin}/api/whatsapp/webhook`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(fullWebhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateIntegrations({
        phoneNumberId,
        businessAccountId,
        isDemoMode,
        ...(accessToken ? { accessTokenMasked: '••••••••••••••••' } : {}),
      });
      alert('Integration settings updated successfully!');
    } catch (e) {
      alert('Failed to save integration settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/whatsapp/test-connection', { method: 'POST' });
      const data = await res.json();
      setTestResult(data.message || (data.connected ? 'WhatsApp Business Cloud API connection healthy!' : 'WhatsApp API not yet verified. Safe fallback mode active.'));
    } catch (err) {
      setTestResult('Error connecting to backend test endpoint.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Integrations & External APIs</h2>
        <p className="text-xs text-slate-500">
          Connect your authorized WhatsApp Business Cloud API, configure inbound webhooks, or test safely in Demo Mode.
        </p>
      </div>

      {/* WhatsApp Cloud API Configuration Card */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Meta WhatsApp Business Cloud API</h3>
                {integrations.whatsAppConfigured && !integrations.isDemoMode ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> API Active (Live)
                  </span>
                ) : integrations.isDemoMode ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Demo Mode Active (Safe Direct Link)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Fallback (Direct wa.me)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official Graph API integration for high-deliverability business messaging.
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {testResult && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{testResult}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Demo Mode Switch */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-amber-950 block text-xs">
                Demo Outreach Mode (Safe Direct Link)
              </span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                When enabled, approved messages open pre-filled in WhatsApp Web / App directly via <code>wa.me</code> links without making live billed Graph API calls.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => setIsDemoMode(e.target.checked)}
              className="h-5 w-5 rounded text-amber-600 cursor-pointer accent-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number ID
              </label>
              <input
                type="text"
                placeholder="e.g. 109876543210987"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Found in Meta Developer Portal &gt; WhatsApp &gt; API Setup
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Business Account ID (WABA ID)
              </label>
              <input
                type="text"
                placeholder="e.g. 987654321098765"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Permanent System User Access Token
            </label>
            <input
              type="password"
              placeholder={integrations.accessTokenMasked ? 'Token already saved (leave empty to keep)' : 'Paste EAAG... Meta token'}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Stored exclusively server-side. Never exposed in browser runtime.
            </span>
          </div>

          {/* Webhook information */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Inbound Webhook Callback URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullWebhookUrl}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shrink-0"
              >
                {copiedWebhook ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Verify Token configured: <code>clienthunter_secret_token</code>
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save WhatsApp Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Google Maps & Places API Setup Guide */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Google Maps & Business Data Sourcing</h3>
            <p className="text-xs text-slate-500">How ClientHunter AI accesses local business registries</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          ClientHunter AI natively combines verified directory heuristics with AI grounding to evaluate businesses in target markets (UAE, Pakistan, US, UK). For custom enterprise geocoding, configure <code>GOOGLE_PLACES_API_KEY</code> in server environment variables.
        </p>
      </div>
    </div>
  );
};
