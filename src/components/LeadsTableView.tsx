import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  Phone,
  Sparkles,
  MessageSquare,
  Shield,
  ShieldAlert,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  FileSpreadsheet,
  PlusCircle,
  Eye,
} from 'lucide-react';
import { Lead } from '../types.ts';

interface LeadsTableViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onTriggerAnalyze: (leadId: string) => Promise<void>;
  onTriggerMessage: (leadId: string) => Promise<void>;
  onOpenSendModal: (lead: Lead) => void;
  onToggleDNC: (lead: Lead) => Promise<void>;
  onOpenAddModal: () => void;
  onOpenCsvModal: () => void;
  initialFilter?: any;
}

export const LeadsTableView: React.FC<LeadsTableViewProps> = ({
  leads,
  onSelectLead,
  onTriggerAnalyze,
  onTriggerMessage,
  onOpenSendModal,
  onToggleDNC,
  onOpenAddModal,
  onOpenCsvModal,
  initialFilter,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState(initialFilter?.status || 'all');
  const [hideDNC, setHideDNC] = useState(false);
  const [sortField, setSortField] = useState<'opportunityScore' | 'businessName' | 'dateDiscovered'>('opportunityScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});

  // Categories & cities lists
  const categories = useMemo(() => Array.from(new Set(leads.map((l) => l.category))), [leads]);
  const cities = useMemo(() => Array.from(new Set(leads.map((l) => l.city))), [leads]);

  // Filtering
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        if (search) {
          const q = search.toLowerCase();
          const matchName = lead.businessName.toLowerCase().includes(q);
          const matchPhone = (lead.phone || '').toLowerCase().includes(q);
          const matchWa = (lead.whatsapp || '').toLowerCase().includes(q);
          const matchNotes = (lead.notes || '').toLowerCase().includes(q);
          const matchCity = lead.city.toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchWa && !matchNotes && !matchCity) return false;
        }

        if (categoryFilter !== 'all' && lead.category !== categoryFilter) return false;
        if (cityFilter !== 'all' && lead.city !== cityFilter) return false;

        if (websiteFilter !== 'all') {
          if (websiteFilter === 'no_website' && lead.websiteStatus !== 'no_website') return false;
          if (websiteFilter === 'website_broken' && lead.websiteStatus !== 'website_broken') return false;
          if (websiteFilter === 'website_outdated' && lead.websiteStatus !== 'website_outdated') return false;
          if (websiteFilter === 'website_active' && lead.websiteStatus !== 'website_active') return false;
        }

        if (scoreFilter === 'high' && lead.opportunityScore < 80) return false;
        if (scoreFilter === 'medium' && (lead.opportunityScore < 60 || lead.opportunityScore >= 80)) return false;
        if (scoreFilter === 'low' && lead.opportunityScore >= 60) return false;

        if (statusFilter !== 'all' && lead.outreachStatus !== statusFilter) return false;
        if (hideDNC && lead.doNotContact) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = (valA as string).toLowerCase();
        if (typeof valB === 'string') valB = (valB as string).toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [leads, search, categoryFilter, cityFilter, websiteFilter, scoreFilter, statusFilter, hideDNC, sortField, sortOrder]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleRunAnalyze = async (leadId: string) => {
    setAnalyzingIds((prev) => ({ ...prev, [leadId]: true }));
    try {
      await onTriggerAnalyze(leadId);
      await onTriggerMessage(leadId);
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [leadId]: false }));
    }
  };

  const handleExportCsv = () => {
    const headers = ['Business Name', 'Category', 'City', 'Country', 'Phone', 'WhatsApp', 'Website Status', 'Opportunity Score', 'Level', 'Status', 'Do Not Contact'];
    const rows = filteredLeads.map((l) => [
      `"${l.businessName.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.city}"`,
      `"${l.country}"`,
      `"${l.phone || ''}"`,
      `"${l.whatsapp || ''}"`,
      `"${l.websiteStatus}"`,
      l.opportunityScore,
      `"${l.opportunityLevel}"`,
      `"${l.outreachStatus}"`,
      l.doNotContact ? 'YES' : 'NO',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Prospects & Leads Pipeline</h2>
          <p className="text-xs text-slate-500">
            {filteredLeads.length} of {leads.length} total business prospects qualified
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4 text-slate-500" /> Export Filtered CSV
          </button>
          <button
            onClick={onOpenCsvModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Import CSV
          </button>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
          >
            <PlusCircle className="h-4 w-4 text-indigo-400" /> + Add Lead
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search business, phone, city, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* City */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Cities</option>
            {cities.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>

          {/* Website Status */}
          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Website Statuses</option>
            <option value="no_website">No Website (Missing)</option>
            <option value="website_broken">Broken / Inactive</option>
            <option value="website_outdated">Outdated / Poor Mobile</option>
            <option value="website_active">Active Site</option>
          </select>

          {/* Score filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Scores</option>
            <option value="high">High Opportunity (80+)</option>
            <option value="medium">Medium Opportunity (60-79)</option>
            <option value="low">Low Opportunity (&lt;60)</option>
          </select>

          {/* Outreach status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Pipeline Stages</option>
            <option value="new_lead">New Lead</option>
            <option value="analyzed">Analyzed</option>
            <option value="message_ready">Message Ready</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="message_sent">Contacted (Sent)</option>
            <option value="replied">Replied</option>
            <option value="interested">Interested</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="client_won">Client Won</option>
          </select>

          {/* DNC toggle */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideDNC}
              onChange={(e) => setHideDNC(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span>Hide DNC</span>
          </label>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">
                  <button onClick={() => toggleSort('businessName')} className="flex items-center gap-1 hover:text-slate-900">
                    Business Name <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Location</th>
                <th className="py-3.5 px-3">Website Status</th>
                <th className="py-3.5 px-3">
                  <button onClick={() => toggleSort('opportunityScore')} className="flex items-center gap-1 hover:text-slate-900">
                    Opportunity <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3.5 px-3">WhatsApp / Phone</th>
                <th className="py-3.5 px-3">Outreach Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No leads matching criteria. Adjust filters or discover new leads.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isAnalyzing = analyzingIds[lead.id];
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Business */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2">
                          <div>
                            <button
                              onClick={() => onSelectLead(lead)}
                              className="font-bold text-slate-900 hover:text-indigo-600 text-left block"
                            >
                              {lead.businessName}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                              {lead.isDemo && (
                                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded text-[9px] font-bold">
                                  DEMO
                                </span>
                              )}
                              {lead.doNotContact ? (
                                <span className="bg-red-100 text-red-700 px-1.5 py-0.2 rounded text-[9px] font-bold flex items-center gap-0.5">
                                  <ShieldAlert className="h-2.5 w-2.5" /> DNC
                                </span>
                              ) : (
                                <span className="text-slate-400">{lead.source}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-slate-600">
                        {lead.category}
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-3 text-slate-600">
                        {lead.city}, {lead.country}
                      </td>

                      {/* Website status */}
                      <td className="py-3.5 px-3">
                        {lead.websiteStatus === 'no_website' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            No Website
                          </span>
                        ) : lead.websiteStatus === 'website_broken' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Broken Site
                          </span>
                        ) : lead.websiteStatus === 'website_outdated' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                            Outdated Site
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active Site
                          </span>
                        )}
                      </td>

                      {/* Opportunity score */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-extrabold text-xs px-2 py-0.5 rounded-full ${
                              lead.opportunityScore >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : lead.opportunityScore >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {lead.opportunityScore}
                          </span>
                          <span className="text-[11px] text-slate-400">{lead.opportunityLevel}</span>
                        </div>
                      </td>

                      {/* WhatsApp contact */}
                      <td className="py-3.5 px-3 text-slate-700 font-mono text-[11px]">
                        {lead.whatsapp || lead.phone || <span className="text-slate-400 italic">None</span>}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                            lead.outreachStatus === 'client_won'
                              ? 'bg-emerald-100 text-emerald-800'
                              : lead.outreachStatus === 'interested'
                              ? 'bg-purple-100 text-purple-800'
                              : lead.outreachStatus === 'message_sent'
                              ? 'bg-blue-100 text-blue-800'
                              : lead.outreachStatus === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {lead.outreachStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Inspect Lead Audit Profile"
                            onClick={() => onSelectLead(lead)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            title="Analyze & Draft WhatsApp with AI"
                            disabled={isAnalyzing || lead.doNotContact}
                            onClick={() => handleRunAnalyze(lead.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40"
                          >
                            <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-spin text-indigo-600' : ''}`} />
                          </button>

                          <button
                            title="Open WhatsApp Outreach Modal"
                            disabled={lead.doNotContact}
                            onClick={() => onOpenSendModal(lead)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>

                          <button
                            title={lead.doNotContact ? 'Remove Do Not Contact' : 'Mark Do Not Contact'}
                            onClick={() => onToggleDNC(lead)}
                            className={`p-1.5 rounded-lg ${
                              lead.doNotContact
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                            }`}
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
