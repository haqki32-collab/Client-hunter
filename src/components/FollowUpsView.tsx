import React, { useState } from 'react';
import {
  Clock,
  Send,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  Smartphone,
  Check,
  AlertCircle,
} from 'lucide-react';
import { FollowUpItem, Lead } from '../types.ts';

interface FollowUpsViewProps {
  followups: FollowUpItem[];
  leads: Lead[];
  onOpenSendModal: (lead: Lead, msg: any) => void;
  onSelectLead: (lead: Lead) => void;
  onRefresh: () => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  followups,
  leads,
  onOpenSendModal,
  onSelectLead,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'due' | 'all'>('due');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [followupDrafts, setFollowupDrafts] = useState<Record<string, string>>({});

  const filtered = followups.filter((f) => {
    if (activeTab === 'due') return f.status === 'due' || f.status === 'pending';
    return true;
  });

  const handleGenerateFollowUp = async (item: FollowUpItem) => {
    const lead = leads.find((l) => l.id === item.leadId);

    setGeneratingId(item.id);
    try {
      const res = await fetch(`/api/followups/${item.id}/generate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.followup && data.followup.generatedFollowUpText) {
        setFollowupDrafts((prev) => ({ ...prev, [item.id]: data.followup.generatedFollowUpText }));
      } else {
        const text = `Hi ${item.businessName} team, following up on my quick note earlier. Did you get a chance to review the website idea? No worries at all if you're busy!`;
        setFollowupDrafts((prev) => ({ ...prev, [item.id]: text }));
      }
    } catch (e) {
      if (lead) {
        const text = `Hi ${lead.businessName} team, following up on my note regarding ${lead.city}. Have you had a chance to consider having a mobile site?`;
        setFollowupDrafts((prev) => ({ ...prev, [item.id]: text }));
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const handleMarkSkipped = async (item: FollowUpItem) => {
    try {
      await fetch(`/api/followups/${item.id}/skip`, { method: 'POST' });
    } catch (e) {
      console.warn('Skipped followup locally:', e);
    }
    item.status = 'skipped';
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Follow-Up Reminders & Sequences</h2>
          <p className="text-xs text-slate-500">
            Automated calendar triggers (Day 3 & Day 7) to follow up respectfully with prospects who haven't replied yet.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'due'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Due & Upcoming ({followups.filter((f) => f.status === 'due' || f.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Scheduled ({followups.length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-400 text-xs">
            <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            No follow-ups due at this time.
          </div>
        ) : (
          filtered.map((item) => {
            const lead = leads.find((l) => l.id === item.leadId);
            const currentDraft =
              followupDrafts[item.id] ||
              item.recommendedMessage ||
              item.generatedFollowUpText ||
              `Hi ${item.businessName} team, following up on our previous note. Were you able to check the website concept?`;
            const isGen = generatingId === item.id;
            const stepNum = item.step || item.stepNumber || 1;
            const daysAfter = item.daysAfterFirstOutreach || item.dueDaysAfter || 3;

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => lead && onSelectLead(lead)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 text-left"
                    >
                      {item.businessName}
                    </button>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Sequence Step {stepNum} (Day {daysAfter})
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                        item.status === 'due'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : item.status === 'sent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Target Phone: <strong className="text-slate-700">{lead?.whatsapp || lead?.phone || 'Unknown'}</strong> • Due Date: {new Date(item.dueDate).toLocaleDateString()}
                  </p>

                  {/* Follow-up Draft text */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 italic">
                    "{currentDraft}"
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => handleGenerateFollowUp(item)}
                    disabled={isGen}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    <Sparkles className={`h-3.5 w-3.5 ${isGen ? 'animate-spin' : ''}`} />
                    {isGen ? 'Generating...' : 'Regenerate'}
                  </button>

                  <button
                    onClick={() => handleMarkSkipped(item)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50"
                  >
                    Skip
                  </button>

                  <button
                    onClick={() => {
                      if (lead) {
                        onOpenSendModal(lead, {
                          id: `fu-${item.id}`,
                          leadId: lead.id,
                          businessName: lead.businessName,
                          contactNumber: lead.whatsapp || lead.phone || '',
                          whatsappNumber: lead.whatsapp || lead.phone || '',
                          status: 'approved',
                          approvedContent: currentDraft,
                          variants: { professional: currentDraft, friendly: currentDraft, short: currentDraft },
                          whySelected: 'Follow-up Sequence',
                          opportunityScore: lead.opportunityScore,
                          generatedAt: new Date().toISOString(),
                        });
                      }
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Review & Send
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
