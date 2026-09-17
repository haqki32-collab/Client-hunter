import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  DollarSign,
  Send,
  MessageSquare,
  FileText,
  Building2,
  Phone,
  MapPin,
  Sparkles,
  Award,
  ArrowUpRight,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { Lead, AppSettings } from '../types.ts';

interface SeriousClientsViewProps {
  leads: Lead[];
  settings: AppSettings;
  onSelectLead: (lead: Lead) => void;
  onOpenChat: (lead: Lead) => void;
  onOpenProposalModal: (lead: Lead) => void;
  onRefresh: () => void;
}

export const SeriousClientsView: React.FC<SeriousClientsViewProps> = ({
  leads,
  settings,
  onSelectLead,
  onOpenChat,
  onOpenProposalModal,
  onRefresh,
}) => {
  const [closingDealLead, setClosingDealLead] = useState<Lead | null>(null);
  const [closingAmount, setClosingAmount] = useState<number>(950);
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'ready_to_buy' | 'interested' | 'won'>('all');

  // Filter hot/serious clients
  const seriousClients = leads.filter((l) => {
    if (filterType === 'all') {
      return (
        l.outreachStatus === 'ready_to_buy' ||
        l.outreachStatus === 'interested' ||
        l.outreachStatus === 'negotiating' ||
        l.outreachStatus === 'won' ||
        l.isReadyToBuy === true
      );
    }
    if (filterType === 'ready_to_buy') {
      return l.outreachStatus === 'ready_to_buy' || l.isReadyToBuy === true;
    }
    return l.outreachStatus === filterType;
  });

  const readyToBuyCount = leads.filter(
    (l) => l.outreachStatus === 'ready_to_buy' || l.isReadyToBuy === true
  ).length;

  const wonDeals = leads.filter((l) => l.outreachStatus === 'won');
  const totalWonRevenue = wonDeals.reduce((sum, l) => sum + (l.dealValue || 950), 0);
  const pipelineValue = leads
    .filter((l) => l.outreachStatus === 'ready_to_buy' || l.outreachStatus === 'interested')
    .reduce((sum, l) => sum + (l.dealValue || 950), 0);

  const handleOpenWhatsAppPersonal = (lead: Lead) => {
    const devName = settings.developerName || 'Hamza';
    const cleanPhone = (lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '');
    const pitch = `Assalam o Alaikum ${lead.businessName}! ${devName} here from ${settings.businessName || 'Apex Web Studio'}. Regarding our discussion about your new mobile website with direct WhatsApp ordering: I have your custom project scope and live delivery plan ready. We can kick off tomorrow and launch in 4 business days. Would you like me to send over the kickoff details?`;

    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(pitch)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(pitch)}`;

    window.open(url, '_blank');
  };

  const handleConfirmCloseDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingDealLead) return;
    setIsSubmittingClose(true);
    try {
      const res = await fetch(`/api/leads/${closingDealLead.id}/close-deal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealValue: closingAmount }),
      });
      if (res.ok) {
        setClosingDealLead(null);
        onRefresh();
      } else {
        alert('Failed to update deal status.');
      }
    } catch (err) {
      alert('Network error while closing deal.');
    } finally {
      setIsSubmittingClose(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Serious Clients & Closings</h2>
            <span className="flex items-center gap-1 text-[11px] font-extrabold bg-rose-500 text-white px-2.5 py-0.5 rounded-full shadow-xs">
              <Flame className="h-3.5 w-3.5 fill-current" />
              HOT PIPELINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prospects who confirmed buying interest, requested pricing, or are ready to close. Send personal WhatsApp messages to close the deal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Serious ({leads.filter((l) => l.outreachStatus === 'ready_to_buy' || l.outreachStatus === 'interested' || l.outreachStatus === 'won').length})
          </button>
          <button
            onClick={() => setFilterType('ready_to_buy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              filterType === 'ready_to_buy'
                ? 'bg-rose-600 text-white'
                : 'bg-white border border-slate-200 text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Flame className="h-3 w-3 fill-current" />
            Ready to Buy ({readyToBuyCount})
          </button>
          <button
            onClick={() => setFilterType('won')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              filterType === 'won'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Award className="h-3 w-3" />
            Deals Won ({wonDeals.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ready to Buy (Hot)
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {readyToBuyCount} Clients
            </span>
            <span className="text-[11px] text-slate-500">Awaiting your personal WhatsApp close</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Flame className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Pipeline Value
            </span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">
              ${pipelineValue.toLocaleString()} USD
            </span>
            <span className="text-[11px] text-slate-500">Based on proposed website packages</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Closed / Won Deals
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              ${totalWonRevenue.toLocaleString()} USD
            </span>
            <span className="text-[11px] text-slate-500">{wonDeals.length} projects successfully closed</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Serious Clients List */}
      {seriousClients.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-slate-200 shadow-xs">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3">
            <Flame className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Serious Clients in this filter yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Run the 25-lead execution on Google Maps, send personalized offers, or simulate a client reply to see them appear here ready for closing!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {seriousClients.map((client) => {
            const isWon = client.outreachStatus === 'won';
            const isHot = client.outreachStatus === 'ready_to_buy' || client.isReadyToBuy;
            const lastClientMsg = client.salesConversation?.filter((m) => m.sender === 'client').slice(-1)[0];
            const lastAgentMsg = client.salesConversation?.filter((m) => m.sender === 'sales_agent').slice(-1)[0];

            return (
              <div
                key={client.id}
                className={`rounded-2xl p-5 border transition shadow-xs ${
                  isWon
                    ? 'bg-emerald-50/20 border-emerald-200'
                    : isHot
                    ? 'bg-white border-rose-200 ring-1 ring-rose-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left Column: Business Overview */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3
                        onClick={() => onSelectLead(client)}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {client.businessName}
                      </h3>

                      {isWon ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          DEAL CLOSED / WON
                        </span>
                      ) : isHot ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                          <Flame className="h-3.5 w-3.5 fill-current" />
                          READY TO BUY
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                          Interested / Discussion
                        </span>
                      )}

                      <span className="text-xs text-slate-500 font-medium">
                        {client.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {client.city}, {client.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {client.whatsapp || client.phone || 'No phone'}
                      </span>
                      <span className="font-bold text-slate-900">
                        Budget / Scope:{' '}
                        <span className="text-emerald-700 font-black">
                          ${client.dealValue || 950} USD
                        </span>
                      </span>
                    </div>

                    {/* Buying Signal / Notes */}
                    <div className="mt-2 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="font-semibold text-rose-700 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Buying Signal:</span>
                        <span className="text-slate-700 font-normal">
                          {client.buyingSignalSummary || 'Confirmed interest in website development & requested package details.'}
                        </span>
                      </div>

                      {lastClientMsg && (
                        <div className="text-[11px] text-slate-600 italic">
                          Last client message: "{lastClientMsg.text}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap w-full lg:w-auto justify-end">
                    <button
                      onClick={() => onOpenChat(client)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition"
                    >
                      <MessageSquare className="h-4 w-4 text-indigo-600" />
                      Sales Chat
                    </button>

                    <button
                      onClick={() => onOpenProposalModal(client)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                    >
                      <FileText className="h-4 w-4 text-slate-500" />
                      Proposal
                    </button>

                    <button
                      onClick={() => handleOpenWhatsAppPersonal(client)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Personal WhatsApp Close
                    </button>

                    {!isWon && (
                      <button
                        onClick={() => {
                          setClosingDealLead(client);
                          setClosingAmount(client.dealValue || 950);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-xs"
                      >
                        <Award className="h-3.5 w-3.5 text-amber-400" />
                        Mark Deal Won
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Close Deal Confirmation Modal */}
      {closingDealLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Close Deal as WON! 🎉</h3>
                <p className="text-xs text-slate-500">
                  {closingDealLead.businessName}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmCloseDeal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Final Agreed Deal Value ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={closingAmount}
                    onChange={(e) => setClosingAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  This will record ${closingAmount} USD into your confirmed closed revenue.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Next Steps on Closing:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Status changes to "Deal Won" across pipeline.</li>
                  <li>Generates project agreement and kickoff checklist.</li>
                  <li>Updates total agency earnings analytics.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingDealLead(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow-md disabled:opacity-50"
                >
                  {isSubmittingClose ? 'Recording...' : 'Confirm & Close Deal ($' + closingAmount + ')'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
