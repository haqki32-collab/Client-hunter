import React, { useState } from 'react';
import {
  Award,
  DollarSign,
  FileText,
  PlusCircle,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Lead, WebsiteProposal } from '../types.ts';

interface ClientsProposalsViewProps {
  leads: Lead[];
  proposals: WebsiteProposal[];
  onOpenProposalModal: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenSendModal: (lead: Lead, msg: any) => void;
}

export const ClientsProposalsView: React.FC<ClientsProposalsViewProps> = ({
  leads,
  proposals,
  onOpenProposalModal,
  onSelectLead,
  onOpenSendModal,
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'proposals'>('clients');

  // Leads that are clients won, proposals sent, or interested
  const clientLeads = leads.filter(
    (l) => l.outreachStatus === 'client_won' || l.outreachStatus === 'proposal_sent' || l.outreachStatus === 'interested'
  );

  const totalWonRevenue = clientLeads
    .filter((l) => l.outreachStatus === 'client_won')
    .reduce((sum, l) => sum + (l.dealValue || 950), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clients & Proposals</h2>
          <p className="text-xs text-slate-500">
            Pipeline of warm prospects, delivered client proposals, and active web development accounts.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'clients'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Active Pipeline & Won Clients ({clientLeads.length})
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'proposals'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Drafted Proposals ({proposals.length})
          </button>
        </div>
      </div>

      {/* Revenue Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Won Contract Revenue</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              ${totalWonRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Proposals Generated</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {proposals.length}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Converted Clients</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {leads.filter((l) => l.outreachStatus === 'client_won').length}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'clients' ? (
        <div className="space-y-4">
          {clientLeads.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-400 text-xs">
              <Award className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              No active clients in this stage yet. Reach out to high-opportunity leads to start closing deals!
            </div>
          ) : (
            clientLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 text-left"
                    >
                      {lead.businessName}
                    </button>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                        lead.outreachStatus === 'client_won'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lead.outreachStatus === 'proposal_sent'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {lead.outreachStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    {lead.category} • {lead.city}, {lead.country} • Phone: {lead.whatsapp || lead.phone || 'N/A'}
                  </p>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {lead.notes || lead.opportunitySummary || 'Ongoing website modernization project.'}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => onOpenProposalModal(lead)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    New Proposal
                  </button>

                  <button
                    onClick={() => onOpenSendModal(lead, null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Message on WhatsApp
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Proposals View */
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-400 text-xs">
              <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              No website proposals created yet. Open any lead and click "Generate Proposal" to draft one.
            </div>
          ) : (
            proposals.map((prop) => (
              <div
                key={prop.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{prop.businessName}</h3>
                    <p className="text-xs text-slate-500">
                      Tier: <strong className="capitalize text-slate-800">{prop.tier}</strong> • Created: {new Date(prop.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">${prop.price} {prop.currency}</span>
                    <span className="text-xs text-slate-400 block">{prop.deliveryTimeline}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {prop.conceptSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block mb-1 text-slate-800">Scope Pages:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      {prop.recommendedPages.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block mb-1 text-slate-800">High-ROI Features:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      {prop.recommendedFeatures.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
