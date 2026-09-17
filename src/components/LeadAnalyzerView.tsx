import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Globe,
  Phone,
  Shield,
  FileText,
  Send,
  RefreshCw,
  Sliders,
  Check,
  Smartphone,
} from 'lucide-react';
import { Lead, LeadMessage } from '../types.ts';

interface LeadAnalyzerViewProps {
  leads: Lead[];
  messages: LeadMessage[];
  onTriggerAnalyze: (leadId: string) => Promise<void>;
  onTriggerMessage: (leadId: string) => Promise<void>;
  onApproveMessage: (messageId: string, content: string) => Promise<void>;
  onOpenSendModal: (lead: Lead, msg: LeadMessage | null) => void;
  onSelectLead: (lead: Lead) => void;
}

export const LeadAnalyzerView: React.FC<LeadAnalyzerViewProps> = ({
  leads,
  messages,
  onTriggerAnalyze,
  onTriggerMessage,
  onApproveMessage,
  onOpenSendModal,
  onSelectLead,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [selectedVariant, setSelectedVariant] = useState<'professional' | 'friendly' | 'short'>('friendly');
  const [editedText, setEditedText] = useState<string>('');

  const activeLead = leads.find((l) => l.id === selectedLeadId) || leads[0];
  const activeMessage = messages.find((m) => m.leadId === activeLead?.id);

  const getVariantText = (msg: LeadMessage | undefined, variant: 'professional' | 'friendly' | 'short'): string => {
    if (!msg || !msg.variants) return '';
    if (Array.isArray(msg.variants)) {
      const found = msg.variants.find((v) => v.type === variant);
      return found ? found.text : (msg.approvedContent || '');
    }
    return (msg.variants as any)[variant] || msg.approvedContent || '';
  };

  const analysisSteps = [
    'Collecting business information...',
    'Checking website status & DNS records...',
    'Analyzing online footprint & social channels...',
    'Identifying website & conversion opportunities...',
    'Calculating transparent lead opportunity score...',
    'Generating 3 personalized WhatsApp message variants...',
  ];

  const handleRunFullAnalysis = async () => {
    if (!activeLead) return;
    setIsAnalyzing(true);
    setCurrentStepIndex(0);

    // Simulate animated progressive status updates
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < analysisSteps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 550);

    try {
      await onTriggerAnalyze(activeLead.id);
      await onTriggerMessage(activeLead.id);
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(interval);
      setCurrentStepIndex(analysisSteps.length);
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentStepIndex(-1);
      }, 400);
    }
  };

  const handleVariantSwitch = (variant: 'professional' | 'friendly' | 'short') => {
    setSelectedVariant(variant);
    if (activeMessage) {
      setEditedText(getVariantText(activeMessage, variant));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI Deep Lead Analyzer</h2>
          <p className="text-xs text-slate-500">
            Multi-stage ground-truth audit of a business's online presence, responsiveness, and web expansion value.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none flex-1 sm:flex-none max-w-xs"
          >
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.businessName} ({l.opportunityScore}/100)
              </option>
            ))}
          </select>

          <button
            onClick={handleRunFullAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition shadow-xs disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Run Progressive Audit'}
          </button>
        </div>
      </div>

      {/* Progressive Step Tracker (shown during or just after analysis) */}
      {isAnalyzing && (
        <div className="rounded-2xl bg-indigo-950 p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Auditing {activeLead?.businessName}
            </span>
            <span className="text-xs text-indigo-400">Step {currentStepIndex + 1} of 6</span>
          </div>

          <div className="space-y-2">
            {analysisSteps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 text-xs p-2 rounded-lg transition ${
                    isCurrent
                      ? 'bg-indigo-900/90 text-white font-semibold'
                      : isCompleted
                      ? 'text-emerald-300'
                      : 'text-indigo-400/50'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <div className="h-4 w-4 rounded-full border-2 border-indigo-300 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-indigo-700 shrink-0" />
                  )}
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Analysis Display */}
      {activeLead && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Opportunity Audit & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score & Summary Banner */}
            <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
              <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{activeLead.businessName}</h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        activeLead.opportunityScore >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {activeLead.opportunityScore}/100 • {activeLead.opportunityLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeLead.category} • {activeLead.city}, {activeLead.country} • Discovered via {activeLead.source}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block uppercase font-semibold">Website State</span>
                  <span className="text-sm font-bold text-slate-800 capitalize">
                    {activeLead.websiteStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Opportunity Summary */}
              <div className="mt-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs leading-relaxed text-indigo-950">
                <strong className="block mb-1 text-indigo-900 uppercase tracking-wider text-[11px]">
                  AI Audit Diagnostic:
                </strong>
                {activeLead.opportunitySummary || 'High potential for new website deployment or modernization.'}
              </div>

              {/* Scoring Factors Breakdown */}
              <div className="mt-5">
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  Ground-Truth Opportunity Breakdown:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeLead.opportunityReasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical Feature Matrix */}
            <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-4">
                Digital Presence & Technical Capabilities
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Mobile Optimization</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {activeLead.websiteAnalysisDetails?.mobileFriendly || 'Unknown'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Visual Quality</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {activeLead.websiteAnalysisDetails?.visualQuality || 'Unknown'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">SSL Security (HTTPS)</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {activeLead.websiteAnalysisDetails?.https || 'Unknown'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">WhatsApp Click-to-Chat</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {activeLead.websiteAnalysisDetails?.whatsappIntegration || 'Missing'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Online Ordering / Catalog</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {activeLead.websiteAnalysisDetails?.orderingAvailable || 'No'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Appointment Booking</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {activeLead.websiteAnalysisDetails?.bookingAvailable || 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Personalized WhatsApp Message Draft */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h4 className="font-bold text-slate-900 text-sm">Personalized Message Draft</h4>
                  {activeMessage && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        activeMessage.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {activeMessage.status.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Variant Switcher */}
                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl mb-3 text-xs font-semibold">
                  {(['friendly', 'professional', 'short'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleVariantSwitch(v)}
                      className={`flex-1 py-1.5 rounded-lg capitalize transition ${
                        selectedVariant === v
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                {/* WhatsApp Chat Balloon UI */}
                <div className="rounded-2xl bg-[#EFEAE2] p-4 border border-[#d1c7bc] min-h-[220px]">
                  <div className="max-w-[95%] rounded-2xl rounded-tl-xs bg-white p-3 shadow-xs text-slate-800 text-xs leading-relaxed">
                    <textarea
                      rows={8}
                      value={
                        editedText ||
                        (activeMessage
                          ? getVariantText(activeMessage, selectedVariant)
                          : 'Click "Run Progressive Audit" to generate personalized WhatsApp message variants based on observed facts.')
                      }
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none resize-none font-sans text-xs"
                    />
                    <div className="mt-2 text-[10px] text-slate-400 text-right">
                      {activeLead.whatsapp || activeLead.phone || 'No phone'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Only mentions verified facts. Never claims fabricated issues.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={async () => {
                    if (activeMessage) {
                      const textToApprove = editedText || getVariantText(activeMessage, selectedVariant);
                      await onApproveMessage(activeMessage.id, textToApprove);
                      onOpenSendModal(activeLead, {
                        ...activeMessage,
                        approvedContent: textToApprove,
                        status: 'approved',
                      });
                    } else {
                      await onTriggerMessage(activeLead.id);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Check className="h-4 w-4" />
                  Approve & Review Outreach
                </button>

                <button
                  onClick={() => onSelectLead(activeLead)}
                  className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                >
                  Inspect Full Business Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
