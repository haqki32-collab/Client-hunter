import React, { useState } from 'react';
import {
  X,
  Send,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';
import { Lead, LeadMessage, IntegrationsConfig } from '../types.ts';

interface WhatsAppSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  message: LeadMessage | null;
  integrations: IntegrationsConfig;
  onSuccess: () => void;
}

export const WhatsAppSendModal: React.FC<WhatsAppSendModalProps> = ({
  isOpen,
  onClose,
  lead,
  message,
  integrations,
  onSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const phone = lead.whatsapp || lead.phone || '';
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('03') && cleanPhone.length === 11) {
    cleanPhone = '92' + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith('05') && cleanPhone.length === 10) {
    cleanPhone = '971' + cleanPhone.slice(1);
  }
  const content = message?.approvedContent || '';

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(content)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendViaApiOrFallback = async () => {
    if (lead.doNotContact) {
      alert('This lead has Do Not Contact enabled. Outbound messaging is blocked.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          messageId: message?.id,
          recipientNumber: phone,
          messageText: content,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResultMessage(data.notice || 'Dispatched successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1800);
      } else {
        alert(data.error || 'Failed to dispatch message');
      }
    } catch (e: any) {
      // Direct client fallback on static/GitHub Pages
      window.open(waUrl, '_blank');
      setResultMessage('Opening direct in WhatsApp Web / App...');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Send WhatsApp Outreach</h3>
              <p className="text-xs text-slate-500">{lead.businessName} • {phone || 'No phone'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* DNC Warning */}
        {lead.doNotContact && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-red-800">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold">Do Not Contact Active</p>
              <p>This business has been flagged as Do Not Contact. You cannot send WhatsApp messages to this lead.</p>
            </div>
          </div>
        )}

        {/* API vs Demo Status Banner */}
        <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">Outreach Channel:</span>
            {integrations.whatsAppConfigured && !integrations.isDemoMode ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                WhatsApp Cloud API (Live)
              </span>
            ) : integrations.isDemoMode ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                DEMO MODE (Safe Direct Link)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                Direct WhatsApp (wa.me) Fallback
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-normal">
            {integrations.whatsAppConfigured && !integrations.isDemoMode
              ? 'Message will be sent via your verified Meta WhatsApp Business Account.'
              : 'WhatsApp API is not configured or in Demo Mode. You can directly open WhatsApp Web/Mobile with prefilled text, or copy to clipboard.'}
          </p>
        </div>

        {/* Message Preview Box (WhatsApp Chat Balloon Style) */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Approved Outreach Text
          </label>
          <div className="rounded-2xl bg-[#EFEAE2] p-4 border border-[#d1c7bc]">
            <div className="max-w-[90%] rounded-2xl rounded-tl-xs bg-white p-3.5 shadow-sm text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {content || 'No message content available.'}
              <div className="mt-2 text-[10px] text-slate-400 text-right">
                Draft Preview • Approved
              </div>
            </div>
          </div>
        </div>

        {resultMessage && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{resultMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Message'}
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              // mark sent in background
              handleSendViaApiOrFallback();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition"
          >
            <ExternalLink className="h-4 w-4" />
            Open WhatsApp Web/App
          </a>

          <button
            type="button"
            disabled={lead.doNotContact || sending}
            onClick={handleSendViaApiOrFallback}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : integrations.whatsAppConfigured && !integrations.isDemoMode ? 'Send via Cloud API' : 'Approve & Log Outbound'}
          </button>
        </div>
      </div>
    </div>
  );
};
