import React, { useState } from 'react';
import {
  X,
  Globe,
  Phone,
  MessageSquare,
  MapPin,
  Star,
  ExternalLink,
  Shield,
  ShieldAlert,
  Sparkles,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  PlusCircle,
} from 'lucide-react';
import { Lead, LeadMessage, FollowUpItem, WebsiteProposal, ActivityLog } from '../types.ts';

interface LeadProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  messages: LeadMessage[];
  followups: FollowUpItem[];
  proposals: WebsiteProposal[];
  activity: ActivityLog[];
  onTriggerAnalyze: (leadId: string) => Promise<void>;
  onTriggerMessage: (leadId: string) => Promise<void>;
  onOpenSendModal: (lead: Lead, msg: LeadMessage | null) => void;
  onOpenProposalModal: (lead: Lead) => void;
  onToggleDNC: (lead: Lead) => Promise<void>;
  onUpdateNotes: (leadId: string, notes: string) => Promise<void>;
}

export const LeadProfileModal: React.FC<LeadProfileModalProps> = ({
  isOpen,
  onClose,
  lead,
  messages,
  followups,
  proposals,
  activity,
  onTriggerAnalyze,
  onTriggerMessage,
  onOpenSendModal,
  onOpenProposalModal,
  onToggleDNC,
  onUpdateNotes,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'messages' | 'proposal' | 'timeline'>('overview');
  const [notesText, setNotesText] = useState(lead?.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingMsg, setIsGeneratingMsg] = useState(false);

  if (!isOpen || !lead) return null;

  const currentMessage = messages[0] || null;

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await onUpdateNotes(lead.id, notesText);
    setSavingNotes(false);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    await onTriggerAnalyze(lead.id);
    setIsAnalyzing(false);
  };

  const handleRunMsgGen = async () => {
    setIsGeneratingMsg(true);
    await onTriggerMessage(lead.id);
    setIsGeneratingMsg(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 font-bold text-lg">
              {lead.businessName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">{lead.businessName}</h2>
                {lead.isDemo && (
                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    DEMO LEAD
                  </span>
                )}
                {lead.doNotContact ? (
                  <span className="text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> DO NOT CONTACT
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Outreach Eligible
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span>{lead.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {lead.city}, {lead.country}
                </span>
                {lead.rating && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <Star className="h-3 w-3 fill-amber-300" />
                      {lead.rating} ({lead.reviewCount || 0} reviews)
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleDNC(lead)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                lead.doNotContact
                  ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                  : 'bg-red-500/10 text-red-300 border-red-400/40 hover:bg-red-500/20'
              }`}
            >
              {lead.doNotContact ? 'Remove from DNC' : 'Mark Do Not Contact'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Action quick bar */}
        <div className="bg-slate-800 px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs border-t border-slate-700">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Opportunity Score:</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                lead.opportunityScore >= 80
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : lead.opportunityScore >= 60
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-600 text-slate-300'
              }`}
            >
              {lead.opportunityScore}/100 ({lead.opportunityLevel})
            </span>
            <span className="text-slate-400">Website:</span>
            <span className="text-slate-200 font-medium">
              {lead.websiteStatus === 'no_website' ? 'No website detected' : lead.websiteStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition font-medium disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Re-Analyze AI'}
            </button>
            <button
              onClick={handleRunMsgGen}
              disabled={isGeneratingMsg || lead.doNotContact}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition font-medium disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isGeneratingMsg ? 'Generating...' : 'Generate WhatsApp Message'}
            </button>
            <button
              onClick={() => onOpenProposalModal(lead)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-500 transition font-medium"
            >
              <FileText className="h-3.5 w-3.5" />
              Generate Proposal
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-2 overflow-x-auto text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview & Details' },
            { id: 'analysis', label: 'Website & Opportunity' },
            { id: 'messages', label: `Outreach (${messages.length})` },
            { id: 'proposal', label: `Proposals (${proposals.length})` },
            { id: 'timeline', label: 'Activity Timeline' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 font-medium transition ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-indigo-600" />
                  Contact & Online Identifiers
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Phone Number</span>
                    <span className="font-medium text-slate-900">{lead.phone || 'Not verified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">WhatsApp Contact</span>
                    <span className="font-medium text-emerald-700">{lead.whatsapp || lead.phone || 'Not verified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Google Business</span>
                    <span className="font-medium text-slate-900 truncate max-w-[200px]">
                      {lead.googleBusinessUrl ? (
                        <a href={lead.googleBusinessUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                          Google Maps Profile <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">Not available</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Official Website</span>
                    <span className="font-medium text-slate-900 truncate max-w-[200px]">
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                          {lead.website} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-amber-600">None detected</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Public Email</span>
                    <span className="font-medium text-slate-900">{lead.email || 'Not verified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Address</span>
                    <span className="font-medium text-slate-900 text-right">{lead.address || `${lead.city}, ${lead.country}`}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Discovered Via</span>
                    <span className="font-medium text-slate-900">{lead.source}</span>
                  </div>
                </div>

                {/* Social Profiles */}
                {lead.socialProfiles && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Social Footprint
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {lead.socialProfiles.instagram && (
                        <a
                          href={lead.socialProfiles.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-md bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition"
                        >
                          Instagram
                        </a>
                      )}
                      {lead.socialProfiles.facebook && (
                        <a
                          href={lead.socialProfiles.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                        >
                          Facebook
                        </a>
                      )}
                      {lead.socialProfiles.linkedin && (
                        <a
                          href={lead.socialProfiles.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Developer Private Notes */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Developer Notes & Pipeline Context
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    Internal scratchpad for conversation progress, owner schedule, preferred pricing, and custom hooks.
                  </p>
                  <textarea
                    rows={6}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="E.g. Spoke with manager on Instagram; prefers direct WhatsApp contact between 2-4pm..."
                    className="w-full rounded-lg border border-slate-200 p-3 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEBSITE & OPPORTUNITY ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Score Highlight Card */}
              <div className="rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-50/70 to-slate-50 p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Website Opportunity Score
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">
                      {lead.opportunityScore} / 100
                      <span className="text-sm font-semibold text-indigo-600 ml-2">({lead.opportunityLevel} Opportunity)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Website Status:</span>
                    <div className="text-sm font-bold text-slate-800 capitalize">
                      {lead.websiteStatus.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-700 font-medium">
                  {lead.opportunitySummary || 'AI analysis provides verified, ground-truth opportunities without inventing artificial metrics.'}
                </p>

                {/* Reasons breakdown */}
                <div className="mt-4 pt-3 border-t border-indigo-100/60">
                  <h5 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                    Transparent Scoring Factors:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {lead.opportunityReasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-white/70 p-2 rounded-lg border border-slate-200">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical & Functional Feature Audit Matrix */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center justify-between">
                  <span>Digital Presence & Feature Matrix</span>
                  <span className="text-xs text-slate-400 font-normal">Based on verified online observations</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Mobile Friendliness</span>
                    <span className="font-semibold text-slate-800 mt-1 block">
                      {lead.websiteAnalysisDetails?.mobileFriendly || 'Not verified'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Visual Quality</span>
                    <span className="font-semibold text-slate-800 mt-1 block">
                      {lead.websiteAnalysisDetails?.visualQuality || 'Not verified'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">SSL / HTTPS</span>
                    <span className="font-semibold text-slate-800 mt-1 block">
                      {lead.websiteAnalysisDetails?.https || 'Not verified'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Speed Estimate</span>
                    <span className="font-semibold text-slate-800 mt-1 block">
                      {lead.websiteAnalysisDetails?.speedEstimate || 'Not verified'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">WhatsApp Chat Trigger</span>
                    <span className="font-semibold text-slate-800 mt-1 block">
                      {lead.websiteAnalysisDetails?.whatsappIntegration || 'Missing'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Online Ordering</span>
                    <span className="font-semibold text-slate-800 mt-1 block">
                      {lead.websiteAnalysisDetails?.orderingAvailable || 'No'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Appointment Booking</span>
                    <span className="font-semibold text-slate-800 mt-1 block">
                      {lead.websiteAnalysisDetails?.bookingAvailable || 'No'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Clear Call-to-Action</span>
                    <span className="font-semibold text-slate-800 mt-1 block">
                      {lead.websiteAnalysisDetails?.clearCta || 'None'}
                    </span>
                  </div>
                </div>

                {lead.websiteAnalysisDetails?.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-slate-50 text-xs text-slate-600 border border-slate-200">
                    <strong>Auditor Observation:</strong> {lead.websiteAnalysisDetails.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: OUTREACH & MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-slate-200">
                  <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">No outreach message generated yet</p>
                  <p className="text-xs text-slate-400 mt-1">Generate 3 tailored variants with verified observations</p>
                  <button
                    onClick={handleRunMsgGen}
                    disabled={isGeneratingMsg || lead.doNotContact}
                    className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition disabled:opacity-50"
                  >
                    Generate WhatsApp Message
                  </button>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                          Status:
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            msg.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : msg.status === 'sent'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {msg.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Generated: {new Date(msg.generatedAt).toLocaleString()}
                      </span>
                    </div>

                    {/* WhatsApp Balloon Preview */}
                    <div className="mt-4 rounded-xl bg-[#EFEAE2] p-4 border border-[#d1c7bc]">
                      <div className="max-w-[95%] rounded-xl rounded-tl-xs bg-white p-3.5 shadow-sm text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                        {msg.approvedContent}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        Target: <strong className="text-slate-800">{msg.whatsappNumber || msg.contactNumber}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenSendModal(lead, msg)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Review & Send Outbound
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: PROPOSALS */}
          {activeTab === 'proposal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Website Proposals</h4>
                  <p className="text-xs text-slate-500">Tailored scope, recommended architecture, and questions for {lead.businessName}</p>
                </div>
                <button
                  onClick={() => onOpenProposalModal(lead)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Draft New Proposal
                </button>
              </div>

              {proposals.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-slate-200">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">No proposal generated yet</p>
                  <p className="text-xs text-slate-400 mt-1">Once a lead responds or requests pricing, create a tailored proposal with 1-click</p>
                </div>
              ) : (
                proposals.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-sm capitalize">{p.tier} Package Proposal</span>
                        <p className="text-xs text-slate-500">{p.conceptSummary}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-slate-900">${p.price} {p.currency}</span>
                        <span className="block text-[11px] text-slate-400">Timeline: {p.deliveryTimeline}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-800 block mb-1">Recommended Pages:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                          {p.recommendedPages.map((page, i) => (
                            <li key={i}>{page}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-800 block mb-1">High-ROI Features:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                          {p.recommendedFeatures.map((feat, i) => (
                            <li key={i}>{feat}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs">
                      <span className="font-semibold text-indigo-950 block mb-1">Client Discovery Questionnaire:</span>
                      <ul className="list-decimal list-inside space-y-1 text-indigo-900">
                        {p.clientDiscoveryQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: TIMELINE & AUDIT LOG */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 text-sm">Lead Journey & Compliance Audit Log</h4>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activity.length === 0 ? (
                  <p className="text-xs text-slate-400">No activity logged yet.</p>
                ) : (
                  activity.map((item) => (
                    <div key={item.id} className="relative">
                      <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-indigo-600 border-2 border-white shadow-xs"></span>
                      <div className="text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 font-semibold">{item.action}</strong>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{item.details}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
