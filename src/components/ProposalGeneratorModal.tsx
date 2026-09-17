import React, { useState } from 'react';
import { X, Sparkles, FileText, Check, Copy, CheckCircle2 } from 'lucide-react';
import { Lead, AppSettings } from '../types.ts';

interface ProposalGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  settings: AppSettings;
  onGenerated: () => void;
}

export const ProposalGeneratorModal: React.FC<ProposalGeneratorModalProps> = ({
  isOpen,
  onClose,
  lead,
  settings,
  onGenerated,
}) => {
  const [tier, setTier] = useState<'basic' | 'business' | 'ecommerce' | 'custom'>('business');
  const [customPrice, setCustomPrice] = useState<number>(settings.pricing.business);
  const [loading, setLoading] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !lead) return null;

  const handleTierChange = (newTier: 'basic' | 'business' | 'ecommerce' | 'custom') => {
    setTier(newTier);
    setCustomPrice(settings.pricing[newTier] || 950);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/generate-proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          customPrice,
        }),
      });
      const data = await res.json();
      if (data.proposal) {
        setGeneratedProposal(data.proposal);
        onGenerated();
      }
    } catch (e: any) {
      alert('Error generating proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!generatedProposal) return;
    const text = `WEBSITE DEVELOPMENT PROPOSAL FOR ${lead.businessName.toUpperCase()}
Prepared by: ${settings.developerName} (${settings.businessName})

Concept Summary:
${generatedProposal.conceptSummary}

Scope & Package Tier: ${tier.toUpperCase()} ($${generatedProposal.price} ${generatedProposal.currency})
Delivery Timeline: ${generatedProposal.deliveryTimeline}

Recommended Pages:
${generatedProposal.recommendedPages.map((p: string) => `• ${p}`).join('\n')}

High-ROI Key Features:
${generatedProposal.recommendedFeatures.map((f: string) => `• ${f}`).join('\n')}

Discovery Questions:
${generatedProposal.clientDiscoveryQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

Developer Portfolio: ${settings.portfolioUrl}
Direct WhatsApp Contact: ${settings.whatsappNumber}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">AI Website Proposal Generator</h3>
              <p className="text-xs text-slate-500">For {lead.businessName} • {lead.city}, {lead.country}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!generatedProposal ? (
          <div className="mt-4 space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Select a package tier and custom price. ClientHunter AI will structure a tailored proposal specifically addressing {lead.businessName}'s digital gaps.
            </p>

            {/* Package Selector */}
            <div>
              <label className="font-semibold text-slate-800 uppercase tracking-wider block mb-2">
                Select Website Package Tier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['basic', 'business', 'ecommerce', 'custom'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTierChange(t)}
                    className={`p-3 rounded-xl border text-left transition ${
                      tier === t
                        ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-semibold ring-1 ring-purple-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block capitalize font-bold">{t}</span>
                    <span className="text-slate-500 font-medium">${settings.pricing[t]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Price Field */}
            <div>
              <label className="font-semibold text-slate-800 uppercase tracking-wider block mb-1">
                Proposal Quoted Price ({settings.pricing.currency})
              </label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold focus:border-purple-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                You configure the baseline pricing in Settings; AI never invents arbitrary prices.
              </span>
            </div>

            {/* Lead Context Snapshot */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1">Lead Context Captured for AI:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>Website Status: <strong>{lead.websiteStatus}</strong></li>
                <li>Score: <strong>{lead.opportunityScore}/100</strong> ({lead.opportunityLevel})</li>
                <li>Primary observation: {lead.opportunityReasons[0] || 'Digital expansion opportunity'}</li>
              </ul>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition disabled:opacity-50"
              >
                <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Structuring Proposal...' : 'Generate Proposal with AI'}
              </button>
            </div>
          </div>
        ) : (
          /* Generated Proposal View */
          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-xl bg-purple-50/70 p-4 border border-purple-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-950 text-sm">{lead.businessName} Website Proposal</span>
                <p className="text-purple-700 font-medium">
                  {tier.toUpperCase()} Tier • ${generatedProposal.price} {generatedProposal.currency} • {generatedProposal.deliveryTimeline}
                </p>
              </div>
              <button
                onClick={handleCopyText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-800 font-semibold shadow-xs hover:bg-purple-100 transition"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Proposal Text'}
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              <div>
                <strong className="text-slate-900 block mb-1 uppercase tracking-wider">Concept Summary:</strong>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {generatedProposal.conceptSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Recommended Pages:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {generatedProposal.recommendedPages.map((page: string, i: number) => (
                      <li key={i}>{page}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Key Features:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {generatedProposal.recommendedFeatures.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">Project Scope:</strong>
                <p className="text-slate-600 leading-relaxed">{generatedProposal.estimatedScope}</p>
              </div>

              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <strong className="text-indigo-950 block mb-1">Discovery Questions for Client:</strong>
                <ul className="list-decimal list-inside space-y-1 text-indigo-900">
                  {generatedProposal.clientDiscoveryQuestions.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGeneratedProposal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
              >
                Regenerate / Change Tier
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
