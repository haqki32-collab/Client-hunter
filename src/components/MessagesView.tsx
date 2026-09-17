import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Edit3,
  RefreshCw,
  XCircle,
  Save,
  Check,
  ExternalLink,
  Shield,
  Smartphone,
} from 'lucide-react';
import { Lead, LeadMessage } from '../types.ts';

interface MessagesViewProps {
  messages: LeadMessage[];
  leads: Lead[];
  onApproveMessage: (messageId: string, content: string) => Promise<void>;
  onTriggerMessage: (leadId: string) => Promise<void>;
  onOpenSendModal: (lead: Lead, msg: LeadMessage | null) => void;
  onSelectLead: (lead: Lead) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  messages,
  leads,
  onApproveMessage,
  onTriggerMessage,
  onOpenSendModal,
  onSelectLead,
}) => {
  const [activeTab, setActiveTab] = useState<'pending_approval' | 'approved' | 'sent' | 'all'>('pending_approval');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeVariants, setActiveVariants] = useState<Record<string, 'professional' | 'friendly' | 'short'>>({});
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});
  const [regeneratingIds, setRegeneratingIds] = useState<Record<string, boolean>>({});

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'all') return true;
    return m.status === activeTab;
  });

  const getVariant = (msg: LeadMessage): 'professional' | 'friendly' | 'short' => {
    return activeVariants[msg.id] || 'friendly';
  };

  const getVariantText = (msg: LeadMessage | undefined, variant: 'professional' | 'friendly' | 'short'): string => {
    if (!msg || !msg.variants) return '';
    if (Array.isArray(msg.variants)) {
      const found = msg.variants.find((v) => v.type === variant);
      return found ? found.text : (msg.approvedContent || '');
    }
    return (msg.variants as any)[variant] || msg.approvedContent || '';
  };

  const setVariant = (msgId: string, variant: 'professional' | 'friendly' | 'short') => {
    setActiveVariants((prev) => ({ ...prev, [msgId]: variant }));
    const msg = messages.find((m) => m.id === msgId);
    if (msg) {
      setEditedContents((prev) => ({ ...prev, [msgId]: getVariantText(msg, variant) }));
    }
  };

  const handleRegenerate = async (leadId: string, msgId: string) => {
    setRegeneratingIds((prev) => ({ ...prev, [msgId]: true }));
    try {
      await onTriggerMessage(leadId);
    } finally {
      setRegeneratingIds((prev) => ({ ...prev, [msgId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Message Approval Queue</h2>
          <p className="text-xs text-slate-500">
            Mandatory human review system. Tailored, respectful WhatsApp messages with verified business observations.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>Human-in-the-Loop Enforced • Zero Automated Spam</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'pending_approval', label: `Pending Approval (${messages.filter((m) => m.status === 'pending_approval').length})` },
          { id: 'approved', label: `Approved Ready (${messages.filter((m) => m.status === 'approved').length})` },
          { id: 'sent', label: `Sent Messages (${messages.filter((m) => m.status === 'sent').length})` },
          { id: 'all', label: `All Messages (${messages.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="space-y-6">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-400 text-xs">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            No messages found in "{activeTab.replace('_', ' ')}". Discover leads to queue outreach!
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const lead = leads.find((l) => l.id === msg.leadId);
            const currentVar = getVariant(msg);
            const isRegenerating = regeneratingIds[msg.id];
            const content = editedContents[msg.id] ?? (msg.approvedContent || getVariantText(msg, currentVar));

            return (
              <div
                key={msg.id}
                className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                {/* Card Top: Business Details & Score */}
                <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => lead && onSelectLead(lead)}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600"
                      >
                        {msg.businessName}
                      </button>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          msg.opportunityScore >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Score: {msg.opportunityScore}/100
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          msg.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : msg.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {msg.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Recipient: <strong className="text-slate-800 font-mono">{msg.whatsappNumber || msg.contactNumber}</strong> • Source: {lead?.source || 'Discovery'} • Website: {lead?.websiteStatus || 'None'}
                    </p>
                  </div>

                  {/* Why this lead was selected */}
                  <div className="max-w-md bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                    <strong className="text-slate-800 block uppercase tracking-wider text-[10px] mb-0.5">
                      Why Selected & Strategic Angle:
                    </strong>
                    {msg.whySelected}
                  </div>
                </div>

                {/* Variant Switcher Pill Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Tone Variant:</span>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                      {(['friendly', 'professional', 'short'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVariant(msg.id, v)}
                          className={`px-3 py-1 rounded-lg capitalize transition ${
                            currentVar === v
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => lead && handleRegenerate(lead.id, msg.id)}
                    disabled={isRegenerating}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? 'Regenerating...' : 'Regenerate Variants'}
                  </button>
                </div>

                {/* WhatsApp Chat Balloon Live Preview & Inline Editor */}
                <div className="rounded-2xl bg-[#EFEAE2] p-5 border border-[#d1c7bc]">
                  <div className="max-w-2xl rounded-2xl rounded-tl-xs bg-white p-4 shadow-sm text-slate-800 text-xs sm:text-sm leading-relaxed">
                    <textarea
                      rows={5}
                      value={content}
                      onChange={(e) =>
                        setEditedContents((prev) => ({ ...prev, [msg.id]: e.target.value }))
                      }
                      className="w-full bg-transparent border-none focus:outline-none resize-y font-sans text-xs sm:text-sm text-slate-800 leading-relaxed"
                    />
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Click to edit text directly</span>
                      <span>Verified facts only</span>
                    </div>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await onApproveMessage(msg.id, content);
                        alert('Message approved and marked ready for outbound sending!');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Save className="h-3.5 w-3.5" /> Save Draft
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await onApproveMessage(msg.id, content);
                        if (lead) onOpenSendModal(lead, { ...msg, approvedContent: content });
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" /> Approve & Send WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
