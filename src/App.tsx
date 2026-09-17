import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { FindLeadsView } from './components/FindLeadsView.tsx';
import { AnalyzedHistoryView } from './components/AnalyzedHistoryView.tsx';
import { LeadProfileModal } from './components/LeadProfileModal.tsx';
import { WhatsAppSendModal } from './components/WhatsAppSendModal.tsx';
import { Lead, LeadMessage, IntegrationsConfig, AppSettings } from './types.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('find-leads');
  const [analyzedCount, setAnalyzedCount] = useState<number>(0);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadForProfile, setSelectedLeadForProfile] = useState<Lead | null>(null);
  const [sendModalData, setSendModalData] = useState<{ lead: Lead; message: LeadMessage | null } | null>(null);

  const fetchAnalyzedCount = async () => {
    try {
      const res = await fetch('/api/historical-registry');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.totalCount === 'number') {
          setAnalyzedCount(data.totalCount);
        }
      }
    } catch (e) {
      console.warn('Error fetching analyzed count:', e);
    }
  };

  useEffect(() => {
    fetchAnalyzedCount();
  }, []);

  const handleTriggerAnalyze = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/analyze`, { method: 'POST' });
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
        if (selectedLeadForProfile?.id === leadId) {
          setSelectedLeadForProfile(data.lead);
        }
      }
      fetchAnalyzedCount();
    } catch (err) {
      console.error('Analyze error:', err);
    }
  };

  const handleTriggerMessage = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/generate-message`, { method: 'POST' });
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
      }
      fetchAnalyzedCount();
    } catch (err) {
      console.error('Message generation error:', err);
    }
  };

  return (
    <Layout
      currentTab={currentTab}
      onSelectTab={(tab) => setCurrentTab(tab)}
      analyzedCount={analyzedCount}
    >
      {/* Step 1: Find & Analyze Businesses with AI Outreach Message Generator */}
      {currentTab === 'find-leads' && (
        <FindLeadsView
          onLeadsDiscovered={(newLeads) => {
            setLeads(newLeads);
            fetchAnalyzedCount();
          }}
          onNavigateToHistory={() => setCurrentTab('analyzed-history')}
          onSelectLead={(lead) => setSelectedLeadForProfile(lead)}
          onTriggerAnalyze={handleTriggerAnalyze}
          onTriggerMessage={handleTriggerMessage}
        />
      )}

      {/* Step 2: Already Analyzed Businesses (Deduplication History - Never Re-detected) */}
      {currentTab === 'analyzed-history' && (
        <AnalyzedHistoryView
          onRefreshCount={fetchAnalyzedCount}
          onSelectLeadForChat={(lead) => setSelectedLeadForProfile(lead)}
        />
      )}

      {/* Profile Modal */}
      {selectedLeadForProfile && (
        <LeadProfileModal
          isOpen={!!selectedLeadForProfile}
          onClose={() => setSelectedLeadForProfile(null)}
          lead={selectedLeadForProfile}
          messages={[]}
          followups={[]}
          proposals={[]}
          activity={[]}
          onTriggerAnalyze={handleTriggerAnalyze}
          onTriggerMessage={handleTriggerMessage}
          onOpenSendModal={(lead) => setSendModalData({ lead, message: null })}
          onOpenProposalModal={() => {}}
          onToggleDNC={() => {}}
          onUpdateNotes={() => {}}
        />
      )}

      {/* WhatsApp Modal */}
      {sendModalData && (
        <WhatsAppSendModal
          isOpen={!!sendModalData}
          onClose={() => setSendModalData(null)}
          lead={sendModalData.lead}
          message={sendModalData.message}
          onSendSuccess={() => {
            fetchAnalyzedCount();
            setSendModalData(null);
          }}
        />
      )}
    </Layout>
  );
}
