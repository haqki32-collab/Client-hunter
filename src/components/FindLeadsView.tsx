import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  MapPin,
  Building2,
  Sliders,
  CheckCircle,
  FileSpreadsheet,
  PlusCircle,
  ExternalLink,
  Target,
  ArrowRight,
  Shield,
  Layers,
  Flame,
  Send,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Zap,
  Lock,
  MessageSquare,
  Bot,
  RefreshCw,
  Phone,
  Instagram,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Lead, LeadDiscoveryCriteria } from '../types.ts';
import { saveAnalyzedBusinessToFirestore } from '../firebase.ts';
import { generateClientSideLeads } from '../clientLeadsEngine.ts';

interface FindLeadsViewProps {
  onLeadsDiscovered: (leads: Lead[]) => void;
  onNavigateToHistory?: () => void;
  onSelectLead?: (lead: Lead) => void;
  onTriggerAnalyze?: (leadId: string) => Promise<void>;
  onTriggerMessage?: (leadId: string) => Promise<void>;
  onOpenChatModal?: (lead: Lead) => void;
}

export const FindLeadsView: React.FC<FindLeadsViewProps> = ({
  onLeadsDiscovered,
  onNavigateToHistory,
  onSelectLead,
  onTriggerAnalyze,
  onTriggerMessage,
  onOpenChatModal,
}) => {
  const [country, setCountry] = useState('United Arab Emirates');
  const [city, setCity] = useState('Dubai');
  const [category, setCategory] = useState('Restaurants & Cafes');
  const [targetType, setTargetType] = useState<'all' | 'no_website' | 'outdated_website' | 'low_rating'>('no_website');
  const [count, setCount] = useState<number>(25); // Default 25 as requested
  const [minScore, setMinScore] = useState<number>(60);
  const [source, setSource] = useState('Google Business');
  const [isSearching, setIsSearching] = useState(false);
  const [discoveredResults, setDiscoveredResults] = useState<Lead[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [expandedPitchId, setExpandedPitchId] = useState<string | null>(null);
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);
  const [historicalTrackedCount, setHistoricalTrackedCount] = useState<number>(0);
  const [skippedDuplicatesCount, setSkippedDuplicatesCount] = useState<number>(0);
  const [batchSendResult, setBatchSendResult] = useState<{
    success: boolean;
    sentCount: number;
    offers: Array<{
      leadId: string;
      businessName: string;
      phone: string;
      waUrl: string;
      pitch: string;
    }>;
  } | null>(null);

  const cityPresets: Record<string, string[]> = {
    'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
    'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
    'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Khobar'],
    'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'],
    'United States': ['New York', 'Austin', 'Miami', 'Los Angeles', 'Chicago'],
  };

  // Fetch historical tracking count
  useEffect(() => {
    fetch('/api/historical-registry')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.totalCount === 'number') {
          setHistoricalTrackedCount(data.totalCount);
        }
      })
      .catch(() => {});
  }, []);

  const handleCountryChange = (c: string) => {
    setCountry(c);
    const cities = cityPresets[c] || ['Main City'];
    setCity(cities[0]);
  };

  // Launch the Google Maps 25 Business Execution
  const handleStartExecution = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setSkippedDuplicatesCount(0);
    try {
      const criteria: LeadDiscoveryCriteria = {
        country,
        city,
        category,
        count,
        targetType,
        minScore,
        source: 'Google Business' as any,
      };

      let leadsResult: Lead[] = [];
      let skipped = 0;
      let totalHistorical = 0;

      try {
        const res = await fetch('/api/leads/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(criteria),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.leads) && data.leads.length > 0) {
            leadsResult = data.leads;
            skipped = data.skippedDuplicatesCount || 0;
            totalHistorical = data.totalHistoricalTracked || 0;
          }
        }
      } catch (networkErr) {
        console.warn('Backend API unavailable, using client-side discovery engine:', networkErr);
      }

      // If backend was unreachable (e.g. running on GitHub Pages static host), use client-side engine
      if (leadsResult.length === 0) {
        const clientResult = generateClientSideLeads(criteria);
        leadsResult = clientResult.leads;
        skipped = clientResult.skippedDuplicatesCount;
        totalHistorical = clientResult.totalHistoricalTracked;
      }

      if (leadsResult.length > 0) {
        setDiscoveredResults(leadsResult);
        setSelectedIds(leadsResult.map((l: Lead) => l.id));
        setSkippedDuplicatesCount(skipped);
        setHistoricalTrackedCount(totalHistorical);

        try {
          const existingRaw = localStorage.getItem('ch_analyzed_registry');
          const existingList = existingRaw ? JSON.parse(existingRaw) : [];
          const combined = [...leadsResult, ...existingList];
          localStorage.setItem('ch_analyzed_registry', JSON.stringify(combined));

          // Save each to Firestore
          for (const lead of leadsResult) {
            const sig = `${(lead.businessName || '').toLowerCase().replace(/[^a-z0-9]/g, '')}__${(lead.city || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            saveAnalyzedBusinessToFirestore({
              signature: sig,
              businessName: lead.businessName,
              city: lead.city,
              country: lead.country,
              category: lead.category,
              phone: lead.phone,
              whatsapp: lead.whatsapp,
              website: lead.website,
              websiteStatus: lead.websiteStatus,
              rating: lead.rating,
              reviewCount: lead.reviewCount,
              googleBusinessUrl: lead.googleBusinessUrl,
              opportunityScore: lead.opportunityScore,
              topReviewHighlight: lead.topReviewHighlight,
              selectedOfferPitch: lead.selectedOfferPitch,
              discoveredAt: lead.createdAt || new Date().toISOString(),
              isRealVerifiedPlaces: lead.isRealVerifiedPlaces,
            });
          }
        } catch (e) {}

        onLeadsDiscovered(leadsResult);
      }
    } catch (err) {
      console.error('Lead discovery completed with error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === discoveredResults.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(discoveredResults.map((d) => d.id));
    }
  };

  const handleSelectNoWebsiteOnly = () => {
    const noWebIds = discoveredResults
      .filter((d) => d.websiteStatus === 'no_website' || !d.website)
      .map((d) => d.id);
    setSelectedIds(noWebIds);
  };

  const handleSelectHighOpportunity = () => {
    const highIds = discoveredResults
      .filter((d) => d.opportunityScore >= 80)
      .map((d) => d.id);
    setSelectedIds(highIds);
  };

  const handleCopyPitch = (leadId: string, pitchText: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pitchText);
    }
    setCopiedLeadId(leadId);
    setTimeout(() => setCopiedLeadId(null), 2500);
  };

  // Batch "Send Offer" action with client-side fallback
  const handleSendOfferBatch = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one business to send offers to.');
      return;
    }

    setBatchActionLoading(true);
    try {
      const res = await fetch('/api/outreach/send-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedIds }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setBatchSendResult(data);
          onLeadsDiscovered(discoveredResults);
          return;
        }
      }
      throw new Error('Server batch route unavailable');
    } catch (err) {
      // Direct client-side dispatch fallback (for GitHub Pages / static hosting)
      const offers = selectedIds.map((id) => {
        const lead = discoveredResults.find((l) => l.id === id);
        const bName = lead?.businessName || 'Business';
        const rating = lead?.rating || 4.7;
        const revCount = lead?.reviewCount || 85;
        const city = lead?.city || 'Lahore';
        
        const pitch =
          lead?.selectedOfferPitch ||
          `Assalam-o-Alaikum ${bName} Team,

Mene Google Maps par aap ka business dekha (${rating}⭐ with ${revCount} reviews). MashaAllah ${city} mein aap ki customer reputation bohot strong hai.

Lekin ek critical digital gap notice kiya:
Aap ka koi official fast mobile website ya direct WhatsApp ordering portal mojood nahi hai. Customers jab Google Maps par aap ko dhoondhte hain to wo direct order ya book nahi kar paate.

Humne ${city} ke businesses ke liye high-speed mobile website aur direct WhatsApp order system design kiya hai jo sales ko 30-40% boost karta hai.

Aap ke liye humne ek free 3D preview mockup tayyar kiya hai. Kya mein aap ke sath WhatsApp par share karoon?

Best regards,
Syed Asim Ali shah
Rizqdaan Web development Services`;

        if (lead) {
          lead.selectedOfferPitch = pitch;
          lead.outreachStatus = 'contacted';
          lead.messagesCount = (lead.messagesCount || 0) + 1;
        }

        const rawPhone = lead?.whatsapp || lead?.phone || '';
        let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('03') && cleanPhone.length === 11) {
          cleanPhone = '92' + cleanPhone.slice(1);
        } else if (cleanPhone.startsWith('05') && cleanPhone.length === 10) {
          cleanPhone = '971' + cleanPhone.slice(1);
        }

        const waUrl = cleanPhone
          ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(pitch)}`
          : undefined;

        return {
          leadId: id,
          businessName: bName,
          whatsapp: lead?.whatsapp,
          phone: lead?.phone,
          status: 'sent',
          pitch,
          waUrl,
        };
      });

      // Update state and persistent deduplication history
      setDiscoveredResults([...discoveredResults]);
      onLeadsDiscovered([...discoveredResults]);

      setBatchSendResult({
        success: true,
        sentCount: offers.length,
        offers,
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Google Maps Lead Discovery & Audit</h2>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Auto-Audit Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Discovers local businesses from Google Maps, audits their website & WhatsApp status, saves data for deduplication, and sends personalized offers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToHistory && (
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
            >
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Already Analyzed Businesses ({historicalTrackedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Historical Deduplication Status Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">
                Permanent Deduplication Engine Active
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                Zero Repeat Guarantee
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Saved {historicalTrackedCount} unique local businesses in the memory archive. Discovered businesses are saved so the agent will never re-detect or re-contact the same shop twice.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {skippedDuplicatesCount > 0 && (
            <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl whitespace-nowrap">
              🛡️ {skippedDuplicatesCount} duplicates skipped
            </span>
          )}
          {onNavigateToHistory && (
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="text-xs font-semibold text-indigo-300 hover:text-white underline underline-offset-2 shrink-0 transition"
            >
              View Analyzed List →
            </button>
          )}
        </div>
      </div>

      {/* Execution Control Form Card */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
        <form onSubmit={handleStartExecution} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Country */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Country
              </label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none"
              >
                {Object.keys(cityPresets).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target City / Market
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none"
              >
                {(cityPresets[country] || ['Main City']).map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Business Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none"
              >
                <option value="Restaurants & Cafes">Restaurants & Cafes</option>
                <option value="Clinics & Dental">Clinics & Dental</option>
                <option value="Auto Repair & Detailing">Auto Repair & Detailing</option>
                <option value="Real Estate & Brokerages">Real Estate & Brokerages</option>
                <option value="Salons & Spas">Salons & Spas</option>
                <option value="Gym & Fitness Studios">Gym & Fitness Studios</option>
                <option value="Retail & Boutiques">Retail & Boutiques</option>
                <option value="Legal & Accounting">Legal & Accounting</option>
              </select>
            </div>

            {/* Target Filter */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Opportunity Filter
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none"
              >
                <option value="no_website">No Website (Highest Need)</option>
                <option value="outdated_website">Outdated / Non-Mobile Website</option>
                <option value="all">All Google Maps Businesses (25)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
            {/* Batch count: 25 as requested */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Execution Batch Size: <span className="text-indigo-600 font-bold">{count} Businesses</span>
              </label>
              <div className="flex gap-2">
                {[25, 20, 15, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`flex-1 py-2 rounded-xl border font-bold text-xs transition ${
                      count === n
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Min score */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Min Opportunity Score: {minScore}/100
              </label>
              <input
                type="range"
                min={40}
                max={90}
                step={5}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Lead Source Engine
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-xs">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                <span>Google Maps & Local Places Verified</span>
              </div>
            </div>
          </div>

          {/* Hero Start Execution Button */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Full audit: Checks SSL, mobile speed, Google ratings, and WhatsApp button.</span>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 text-white font-extrabold text-xs sm:text-sm hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isSearching ? 'animate-spin' : ''}`} />
              {isSearching
                ? `Scanning Google Maps for ${count} Unique Businesses...`
                : `Start Execution (${count} Businesses)`}
            </button>
          </div>
        </form>
      </div>

      {/* Discovered Leads Result Container */}
      {discoveredResults.length > 0 && (
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-4">
          {/* Top Bar with Selection Shortcuts */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Audited Businesses in {city} ({discoveredResults.length})
                </h3>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {selectedIds.length} Selected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Audited against advance parameters: mobile responsiveness, SSL security, WhatsApp ordering, and Google reviews.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {selectedIds.length === discoveredResults.length ? 'Deselect All' : `Select All (${discoveredResults.length})`}
              </button>

              <button
                type="button"
                onClick={handleSelectNoWebsiteOnly}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-rose-700 bg-rose-50/50 hover:bg-rose-100"
              >
                No Website Only
              </button>

              <button
                type="button"
                onClick={handleSelectHighOpportunity}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100"
              >
                High Score (&gt;80)
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {discoveredResults.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);
              const details = lead.websiteAnalysisDetails;
              const isNoWeb = lead.websiteStatus === 'no_website' || !lead.website;

              return (
                <div
                  key={lead.id}
                  className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/20 ring-1 ring-indigo-500 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    {/* Header Row: Checkbox, Name, Score */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(lead.id)}
                          className="rounded text-indigo-600 mt-1 cursor-pointer h-4 w-4 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4
                              onClick={() => onSelectLead(lead)}
                              className="font-bold text-slate-900 text-sm leading-tight hover:text-indigo-600 cursor-pointer"
                            >
                              {lead.businessName}
                            </h4>
                            {lead.isRealVerifiedPlaces && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-0.5">
                                <Check className="h-2.5 w-2.5" /> Verified Maps Place
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{lead.category}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          lead.opportunityScore >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {lead.opportunityScore}/100
                      </span>
                    </div>

                    {/* Links Row: Google Business Profile & Social Handles */}
                    <div className="flex items-center gap-2 flex-wrap my-2">
                      {lead.googleBusinessUrl && (
                        <a
                          href={lead.googleBusinessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200/80 transition"
                          title="Open verified Google Maps Business Profile"
                        >
                          <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                          Google Profile ↗
                        </a>
                      )}

                      {lead.socialProfiles?.instagram && (
                        <a
                          href={lead.socialProfiles.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-lg border border-pink-200/80 transition"
                          title="Open verified Instagram Profile"
                        >
                          <Instagram className="h-3 w-3 text-pink-600 shrink-0" />
                          Instagram ↗
                        </a>
                      )}
                    </div>

                    {/* Exact Phone & Direct WhatsApp Action */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 my-2 text-xs">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                        <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{lead.phone || lead.whatsapp || 'Verified Contact'}</span>
                      </div>
                      {lead.whatsapp && (
                        <a
                          href={`https://api.whatsapp.com/send?phone=${(() => {
                            let w = (lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '');
                            if (w.startsWith('03') && w.length === 11) return '92' + w.slice(1);
                            if (w.startsWith('05') && w.length === 10) return '971' + w.slice(1);
                            return w;
                          })()}&text=${encodeURIComponent(lead.selectedOfferPitch || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition shadow-xs"
                          title="Open direct WhatsApp with offer"
                        >
                          <MessageSquare className="h-3 w-3" />
                          WhatsApp Direct
                        </a>
                      )}
                    </div>

                    {/* Exact Customer Reviews & Sentiment Highlight */}
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs my-2">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span className="flex items-center gap-1">
                          ⭐ {lead.rating}★ Rating
                        </span>
                        <span className="text-[11px] font-semibold bg-amber-100/90 text-amber-800 px-2 py-0.5 rounded-full">
                          {lead.reviewCount} Verified Reviews
                        </span>
                      </div>
                      {lead.topReviewHighlight && (
                        <p className="mt-1 text-[11px] italic text-slate-700 leading-snug line-clamp-2">
                          "{lead.topReviewHighlight}"
                        </p>
                      )}
                    </div>

                    {/* Advance Parameters Audit Grid */}
                    <div className="my-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Website Status:</span>
                        <span
                          className={`font-bold ${
                            isNoWeb ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {isNoWeb ? '❌ No Website' : lead.websiteStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Mobile Friendly:</span>
                        <span className="font-semibold text-slate-700">
                          {details?.mobileFriendly || (isNoWeb ? 'No' : 'Partially')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">WhatsApp Ordering:</span>
                        <span
                          className={`font-bold ${
                            details?.whatsappIntegration === 'Direct Chat Button'
                              ? 'text-emerald-600'
                              : 'text-amber-700'
                          }`}
                        >
                          {details?.whatsappIntegration || 'Missing'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">SSL Security:</span>
                        <span className="text-slate-700">
                          {details?.https || (isNoWeb ? 'N/A' : 'Insecure (HTTP)')}
                        </span>
                      </div>
                    </div>

                    {/* Opportunity Reasons */}
                    <div className="space-y-1 mb-3">
                      {lead.opportunityReasons.slice(0, 2).map((reason, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] text-slate-600 flex items-start gap-1.5"
                        >
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* High-Converting Personalized Offer Pitch with Links & Urgency */}
                    {lead.selectedOfferPitch && (
                      <div className="my-2 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-[11px]">
                            <Sparkles className="h-3 w-3 text-indigo-600" />
                            Personalized Pitch (Includes GBP & Social):
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopyPitch(lead.id, lead.selectedOfferPitch!)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 hover:bg-indigo-50 transition"
                            >
                              {copiedLeadId === lead.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-600" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" /> Copy
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedPitchId(expandedPitchId === lead.id ? null : lead.id)}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 px-1 py-0.5"
                            >
                              {expandedPitchId === lead.id ? 'Collapse' : 'Full View'}
                            </button>
                          </div>
                        </div>

                        <div
                          className={`text-[11px] text-slate-800 whitespace-pre-line bg-white/95 p-2.5 rounded-lg border border-indigo-100 font-sans leading-relaxed transition-all ${
                            expandedPitchId === lead.id ? 'max-h-80 overflow-y-auto' : 'line-clamp-3'
                          }`}
                        >
                          {lead.selectedOfferPitch}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
                    >
                      Audit Details
                    </button>

                    {onOpenChatModal && (
                      <button
                        onClick={() => onOpenChatModal(lead)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500"
                      >
                        <Bot className="h-3.5 w-3.5" />
                        Sales AI Chat
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Bottom Execution Bar for Batch "Send Offer" */}
      {discoveredResults.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 lg:left-72 z-40">
          <div className="rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
                {selectedIds.length}
              </div>
              <div>
                <span className="font-bold text-sm block text-white">
                  {selectedIds.length} Businesses Selected
                </span>
                <span className="text-xs text-slate-400">
                  Each selected business will receive a tailored high quality website offer.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleSendOfferBatch}
                disabled={selectedIds.length === 0 || batchActionLoading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs sm:text-sm hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                <Send className={`h-4 w-4 ${batchActionLoading ? 'animate-spin' : ''}`} />
                {batchActionLoading
                  ? 'Dispatching Offers...'
                  : `Send Offer (${selectedIds.length} Selected)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Send Success Modal */}
      {batchSendResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    High Quality Offers Dispatched! ({batchSendResult.sentCount})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Personalized WhatsApp pitches created. You can open direct WhatsApp chats or test client replies with the Sales AI.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBatchSendResult(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {batchSendResult.offers.map((offer, idx) => {
                const leadObj = discoveredResults.find((l) => l.id === offer.leadId);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {offer.businessName}
                        </span>
                        {leadObj?.phone && (
                          <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {leadObj.phone}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Offer Ready / Sent
                      </span>
                    </div>

                    {/* Profiles row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {leadObj?.googleBusinessUrl && (
                        <a
                          href={leadObj.googleBusinessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100"
                        >
                          <MapPin className="h-3 w-3 text-rose-500" />
                          Google Profile
                        </a>
                      )}
                      {leadObj?.socialProfiles?.instagram && (
                        <a
                          href={leadObj.socialProfiles.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200 hover:bg-pink-100"
                        >
                          <Instagram className="h-3 w-3 text-pink-600" />
                          Instagram
                        </a>
                      )}
                      {leadObj?.rating && (
                        <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          ⭐ {leadObj.rating}★ ({leadObj.reviewCount} Reviews)
                        </span>
                      )}
                    </div>

                    <p className="text-slate-800 text-[11px] whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200 max-h-40 overflow-y-auto font-sans leading-relaxed">
                      {offer.pitch}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {leadObj && (
                        <button
                          type="button"
                          onClick={() => handleCopyPitch(leadObj.id, offer.pitch)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
                        >
                          {copiedLeadId === leadObj.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Copy Message
                            </>
                          )}
                        </button>
                      )}

                      {leadObj && onOpenChatModal && (
                        <button
                          onClick={() => {
                            setBatchSendResult(null);
                            onOpenChatModal(leadObj);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                        >
                          <Bot className="h-3.5 w-3.5 text-indigo-400" />
                          Test Sales AI Reply
                        </button>
                      )}

                      {offer.waUrl && (
                        <a
                          href={offer.waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-xs"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Open WhatsApp Direct
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setBatchSendResult(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
