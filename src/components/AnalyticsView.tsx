import React from 'react';
import {
  TrendingUp,
  Award,
  DollarSign,
  Users,
  Target,
  Send,
  MessageSquare,
  ThumbsUp,
  Percent,
  Layers,
} from 'lucide-react';
import { AnalyticsSummary, Lead } from '../types.ts';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  leads: Lead[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, leads }) => {
  const highOpp = leads.filter((l) => l.opportunityScore >= 80).length;
  const medOpp = leads.filter((l) => l.opportunityScore >= 60 && l.opportunityScore < 80).length;
  const lowOpp = leads.filter((l) => l.opportunityScore < 60).length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  leads.forEach((l) => {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Analytics & Conversion Intelligence</h2>
        <p className="text-xs text-slate-500">
          Measure outreach velocity, funnel conversion rates, response percentages, and projected pipeline revenue.
        </p>
      </div>

      {/* Top 4 Performance KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Response Rate</span>
            <MessageSquare className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {analytics?.responseRate || 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Replies received from sent WhatsApps</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interest Rate</span>
            <ThumbsUp className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {analytics?.interestedRate || 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Prospects requesting proposal or call</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Closed Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            ${analytics?.estimatedRevenue?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Completed / active web builds</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pipeline Value</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ${((analytics?.interestedLeads || 0) * 950).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Weighted opportunities in progress</p>
        </div>
      </div>

      {/* Detailed Conversion Funnel Visualizer */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">End-to-End Funnel Breakdown</h3>
        <p className="text-xs text-slate-500">
          Conversion rate tracking from cold business observation to signed web development engagement.
        </p>

        <div className="space-y-3 pt-2">
          {(analytics?.funnel || []).map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">{step.stage}</span>
                <span className="text-slate-900 font-bold">
                  {step.count} ({step.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, step.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opportunity Score Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Opportunity Score Distribution</h3>
          <p className="text-xs text-slate-500">Breakdown of current database leads by conversion potential.</p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-800">High Opportunity (80+)</span>
                <span className="font-bold text-slate-900">{highOpp} leads</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${leads.length ? (highOpp / leads.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-amber-800">Medium Opportunity (60-79)</span>
                <span className="font-bold text-slate-900">{medOpp} leads</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${leads.length ? (medOpp / leads.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">Low Opportunity (&lt;60)</span>
                <span className="font-bold text-slate-900">{lowOpp} leads</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-400 h-2 rounded-full"
                  style={{ width: `${leads.length ? (lowOpp / leads.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Niche & Industry Performance */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Business Category Distribution</h3>
          <p className="text-xs text-slate-500">Volume of audited local businesses across key verticals.</p>

          <div className="space-y-2.5 pt-2 text-xs">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-700">{cat}</span>
                <span className="font-bold text-slate-900">{count} prospects</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
