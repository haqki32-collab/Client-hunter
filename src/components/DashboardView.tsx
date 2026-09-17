import React from 'react';
import {
  Users,
  Target,
  Clock,
  Send,
  MessageSquare,
  ThumbsUp,
  Award,
  DollarSign,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { Lead, LeadMessage, FollowUpItem, AnalyticsSummary, ActivityLog } from '../types.ts';

interface DashboardViewProps {
  analytics: AnalyticsSummary | null;
  leads: Lead[];
  messages: LeadMessage[];
  followups: FollowUpItem[];
  activityLogs: ActivityLog[];
  onNavigate: (tab: string, filterParams?: any) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenSendModal: (lead: Lead, message: LeadMessage | null) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  leads,
  messages,
  followups,
  activityLogs,
  onNavigate,
  onSelectLead,
  onOpenSendModal,
}) => {
  const pendingMessages = messages.filter((m) => m.status === 'pending_approval');
  const dueFollowups = followups.filter((f) => f.status === 'due' || f.status === 'pending');
  const highOpportunityLeads = leads.filter((l) => l.opportunityScore >= 80);

  return (
    <div className="space-y-8">
      {/* Welcome & Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 mb-2">
            <Sparkles className="h-3.5 w-3.5" /> AI Client-Finding & WhatsApp Outreach Agent
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ClientHunter AI</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Discover local businesses without modern websites, audit digital opportunities with AI, and convert owners via personalized WhatsApp outreach.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onNavigate('serious-clients')}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md flex items-center gap-2"
          >
            <Flame className="h-4 w-4 fill-current" />
            Serious Clients ({leads.filter((l) => l.outreachStatus === 'ready_to_buy' || l.isReadyToBuy).length})
          </button>
          <button
            onClick={() => onNavigate('find-leads')}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-md flex items-center gap-2"
          >
            Start 25 Leads Execution <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 8 Metric Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Leads',
            value: analytics?.leadsDiscovered ?? leads.length,
            icon: Users,
            color: 'text-slate-700 bg-slate-100',
            tab: 'leads',
          },
          {
            label: 'High Opp.',
            value: highOpportunityLeads.length,
            icon: Target,
            color: 'text-emerald-700 bg-emerald-100',
            tab: 'leads',
            filter: { minScore: 80 },
          },
          {
            label: 'Pending Approval',
            value: pendingMessages.length,
            icon: Clock,
            color: 'text-amber-700 bg-amber-100',
            tab: 'messages',
            filter: { status: 'pending_approval' },
          },
          {
            label: 'Contacted',
            value: analytics?.messagesSent ?? 0,
            icon: Send,
            color: 'text-blue-700 bg-blue-100',
            tab: 'leads',
            filter: { outreachStatus: 'message_sent' },
          },
          {
            label: 'Replies',
            value: analytics?.replies ?? 0,
            icon: MessageSquare,
            color: 'text-indigo-700 bg-indigo-100',
            tab: 'leads',
            filter: { outreachStatus: 'replied' },
          },
          {
            label: 'Interested',
            value: analytics?.interestedLeads ?? 0,
            icon: ThumbsUp,
            color: 'text-purple-700 bg-purple-100',
            tab: 'leads',
            filter: { outreachStatus: 'interested' },
          },
          {
            label: 'Clients Won',
            value: analytics?.clientsWon ?? 0,
            icon: Award,
            color: 'text-emerald-700 bg-emerald-100',
            tab: 'clients',
          },
          {
            label: 'Est. Revenue',
            value: `$${analytics?.estimatedRevenue?.toLocaleString() ?? '0'}`,
            icon: DollarSign,
            color: 'text-emerald-800 bg-emerald-50',
            tab: 'analytics',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(item.tab, item.filter)}
              className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition text-left group"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color} mb-2`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider line-clamp-1">
                {item.label}
              </span>
              <span className="text-xl font-bold text-slate-900 mt-1 group-hover:text-indigo-600 transition">
                {item.value}
              </span>
            </button>
          );
        })}
      </div>

      {/* The Requested Conversion Funnel Section */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Outreach & Conversion Funnel</h3>
            <p className="text-xs text-slate-500">
              End-to-end progression from raw local business discovery to signed web development contracts
            </p>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
          >
            Detailed Analytics <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Funnel Pipeline Visualizer */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 text-center text-xs">
          {(analytics?.funnel || [
            { stage: 'Leads Found', count: leads.length, percentage: 100 },
            { stage: 'Analyzed', count: leads.length, percentage: 100 },
            { stage: 'Qualified', count: highOpportunityLeads.length, percentage: 80 },
            { stage: 'Message Ready', count: messages.length, percentage: 60 },
            { stage: 'Approved', count: 2, percentage: 40 },
            { stage: 'Contacted', count: 1, percentage: 20 },
            { stage: 'Replied', count: 1, percentage: 20 },
            { stage: 'Interested', count: 1, percentage: 20 },
            { stage: 'Client', count: 0, percentage: 0 },
          ]).map((step, i) => (
            <div
              key={i}
              className="flex flex-col p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-indigo-50/50 hover:border-indigo-300 transition"
            >
              <span className="text-[10px] font-semibold text-slate-400">Step {i + 1}</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 line-clamp-1">{step.stage}</span>
              <span className="text-lg font-extrabold text-indigo-600 mt-1">{step.count}</span>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${Math.max(5, step.percentage)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Pending Messages & Due Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages Requiring Human Review & Approval */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Messages Pending Approval ({pendingMessages.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('messages', { status: 'pending_approval' })}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Review All
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              AI crafts observations based strictly on verified business data. Review, edit, and approve before sending.
            </p>

            <div className="space-y-3">
              {pendingMessages.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No messages waiting for approval. Discover new leads to queue outreach!
                </div>
              ) : (
                pendingMessages.slice(0, 3).map((msg) => {
                  const lead = leads.find((l) => l.id === msg.leadId);
                  return (
                    <div
                      key={msg.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 text-xs">{msg.businessName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Score: {msg.opportunityScore}/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 italic mb-3">
                        "{msg.approvedContent}"
                      </p>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                        <span className="text-slate-400 text-[11px]">To: {msg.whatsappNumber || msg.contactNumber}</span>
                        <button
                          onClick={() => {
                            if (lead) onOpenSendModal(lead, msg);
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition text-xs"
                        >
                          Review & Send
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Due Follow-ups & Activity Stream */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Recent System Activity</h3>
              </div>
              <button
                onClick={() => onNavigate('leads')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                View Leads
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Audit log of lead discoveries, AI opportunity scores, and approved client interactions.
            </p>

            <div className="space-y-3">
              {activityLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex items-start gap-3"
                >
                  <div className="h-2 w-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate">{log.action}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
