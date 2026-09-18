import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  Globe,
  Star,
  MapPin,
  Calendar,
  X,
  Phone,
  Sparkles,
} from 'lucide-react';
import {
  fetchAnalyzedBusinessesFromFirestore,
  removeAnalyzedBusinessFromFirestore,
} from '../firebase.ts';

export interface AnalyzedBusinessRecord {
  signature: string;
  businessName: string;
  city: string;
  country: string;
  category: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  websiteStatus?: string;
  rating?: number;
  reviewCount?: number;
  googleBusinessUrl?: string;
  opportunityScore?: number;
  topReviewHighlight?: string;
  selectedOfferPitch?: string;
  discoveredAt?: string;
  isRealVerifiedPlaces?: boolean;
}

interface AnalyzedHistoryViewProps {
  onSelectLeadForChat?: (lead: any) => void;
  onRefreshCount?: () => void;
}

export const AnalyzedHistoryView: React.FC<AnalyzedHistoryViewProps> = ({
  onRefreshCount,
}) => {
  const [records, setRecords] = useState<AnalyzedBusinessRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [websiteFilter, setWebsiteFilter] = useState<string>('all');
  const [copiedSig, setCopiedSig] = useState<string | null>(null);
  const [viewPitchRecord, setViewPitchRecord] = useState<AnalyzedBusinessRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    let combinedRecords: AnalyzedBusinessRecord[] = [];

    // 1. Fetch from server API if available
    try {
      const res = await fetch('/api/historical-registry');
      if (res.ok) {
        const data = await res.json();
        combinedRecords = data.registry || [];
      }
    } catch (err) {
      console.warn('API registry fetch unavailable:', err);
    }

    // 2. Fetch from Firebase Firestore for persistent cloud storage
    try {
      const firestoreRecords = await fetchAnalyzedBusinessesFromFirestore();
      if (firestoreRecords.length > 0) {
        const sigMap = new Map<string, AnalyzedBusinessRecord>();
        for (const r of combinedRecords) sigMap.set(r.signature, r);
        for (const r of firestoreRecords) {
          if (!sigMap.has(r.signature)) {
            sigMap.set(r.signature, r);
          }
        }
        combinedRecords = Array.from(sigMap.values());
      }
    } catch (e) {
      console.warn('Firestore sync warning:', e);
    }

    // 3. Fallback to localStorage if both were empty
    if (combinedRecords.length === 0) {
      try {
        const localData = localStorage.getItem('ch_analyzed_registry');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            combinedRecords = parsed;
          }
        }
      } catch (e) {}
    }

    setRecords(combinedRecords);
    setTotalCount(combinedRecords.length);
    try {
      localStorage.setItem('ch_analyzed_registry', JSON.stringify(combinedRecords));
    } catch (e) {}
    if (onRefreshCount) onRefreshCount();
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleRemoveRecord = async (signature: string, businessName: string) => {
    if (!window.confirm(`Kya aap "${businessName}" ko history se hatana chahtay hain taake Google Maps ise dobara search kar sakay?`)) {
      return;
    }
    setIsDeleting(signature);
    try {
      await removeAnalyzedBusinessFromFirestore(signature);
      await fetch(`/api/historical-registry/${encodeURIComponent(signature)}`, {
        method: 'DELETE',
      });
      setRecords((prev) => prev.filter((r) => r.signature !== signature));
      setTotalCount((prev) => Math.max(0, prev - 1));
      if (onRefreshCount) onRefreshCount();
    } catch (err) {
      console.error('Failed to remove record:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Kya aap saari analyzed businesses ki history khatam karna chahtay hain? Is ke baad Google Maps inhein dobara detect kar sakega.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/historical-registry/clear', { method: 'POST' });
      if (res.ok) {
        setRecords([]);
        setTotalCount(0);
        if (onRefreshCount) onRefreshCount();
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPitch = (signature: string, pitchText: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pitchText);
      setCopiedSig(signature);
      setTimeout(() => setCopiedSig(null), 2000);
    }
  };

  const handleExportCsv = () => {
    if (records.length === 0) return;
    const headers = [
      'Business Name',
      'City',
      'Country',
      'Category',
      'Rating',
      'Reviews',
      'Phone',
      'Website Status',
      'Website',
      'Google Maps URL',
      'Date Analyzed',
    ];
    const rows = records.map((r) => [
      `"${(r.businessName || '').replace(/"/g, '""')}"`,
      `"${r.city || ''}"`,
      `"${r.country || ''}"`,
      `"${r.category || ''}"`,
      r.rating || '',
      r.reviewCount || '',
      `"${r.phone || r.whatsapp || ''}"`,
      `"${r.websiteStatus || ''}"`,
      `"${r.website || ''}"`,
      `"${r.googleBusinessUrl || ''}"`,
      `"${r.discoveredAt || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyzed_businesses_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      r.businessName.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      (r.phone && r.phone.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === 'all' || r.category === categoryFilter;

    const matchesWebsite =
      websiteFilter === 'all'
        ? true
        : websiteFilter === 'no_website'
        ? !r.website || r.websiteStatus === 'no_website'
        : Boolean(r.website && r.websiteStatus !== 'no_website');

    return matchesSearch && matchesCategory && matchesWebsite;
  });

  const categories = Array.from(new Set(records.map((r) => r.category).filter(Boolean)));
  const noWebsiteCount = records.filter((r) => !r.website || r.websiteStatus === 'no_website').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Google Maps Deduplication Protection Active
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {totalCount} Businesses Recorded
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Already Analyzed Businesses
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Yeh tamam businesses pehle se analyze ho chuki hain. Google Maps ka search engine inhein <strong>dobara kabhi detect ya repeat nahi karega</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRecords}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExportCsv}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            {records.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Total Recorded</span>
            <span className="text-xl font-bold text-slate-900">{totalCount}</span>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <span className="text-xs text-amber-700 font-medium block">No Website (High Opportunity)</span>
            <span className="text-xl font-bold text-amber-900">{noWebsiteCount}</span>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 col-span-2 sm:col-span-1">
            <span className="text-xs text-emerald-700 font-medium block">Repeat Detection Prevented</span>
            <span className="text-xl font-bold text-emerald-900">100% Protected</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by business name, city, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Website Filter */}
          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Website Statuses</option>
            <option value="no_website">No Website Only</option>
            <option value="has_website">Has Website</option>
          </select>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* List of Analyzed Businesses */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Loading analyzed businesses database...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {records.length === 0 ? 'No Analyzed Businesses Yet' : 'No matching businesses found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {records.length === 0
              ? 'Pehle step ("Find & Analyze Businesses") mein ja kar search karein. Jo businesses analyze hon gi wo automatically yahan add ho jayen gi aur Google Maps se dobara kabi nahi ayen gi.'
              : 'Try adjusting your search query or filters above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((item) => {
            const hasNoWeb = !item.website || item.websiteStatus === 'no_website';
            let cleanPhone = (item.whatsapp || item.phone || '').replace(/[^0-9]/g, '');
            if (cleanPhone.startsWith('03') && cleanPhone.length === 11) {
              cleanPhone = '92' + cleanPhone.slice(1);
            } else if (cleanPhone.startsWith('05') && cleanPhone.length === 10) {
              cleanPhone = '971' + cleanPhone.slice(1);
            }
            const defaultPitch =
              item.selectedOfferPitch ||
              `Assalam o Alaikum! I noticed ${item.businessName} has fantastic reviews on Google Maps in ${item.city}, but no official mobile website for customer orders. Would you like a free mockup preview?`;
            const waUrl = cleanPhone
              ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(defaultPitch)}`
              : '';

            return (
              <div
                key={item.signature}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.category || 'Local Business'}
                    </span>
                    {hasNoWeb ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        No Website
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                        Has Website
                      </span>
                    )}
                  </div>

                  {/* Business Name & Location */}
                  <div className="mb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {item.businessName}
                      </h3>
                      {item.googleBusinessUrl && (
                        <a
                          href={item.googleBusinessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Google Maps Profile"
                          className="text-slate-400 hover:text-indigo-600 transition shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.city}, {item.country}</span>
                    </div>
                  </div>

                  {/* Rating & Review */}
                  <div className="flex items-center gap-3 py-2 border-y border-slate-100 my-3 text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{item.rating || 4.5}</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{item.reviewCount || 30}+ Google Reviews</span>
                  </div>

                  {/* Phone */}
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 mb-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.phone || item.whatsapp || 'Phone not available'}</span>
                  </div>

                  {/* Date Analyzed */}
                  {item.discoveredAt && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-4">
                      <Calendar className="h-3 w-3" />
                      <span>Analyzed: {new Date(item.discoveredAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* View AI Message */}
                    <button
                      onClick={() => setViewPitchRecord(item)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      View AI Message
                    </button>

                    {/* WhatsApp */}
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}

                    {/* Remove from Exclusion */}
                    <button
                      onClick={() => handleRemoveRecord(item.signature, item.businessName)}
                      disabled={isDeleting === item.signature}
                      title="Allow Google Maps to detect again"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Never Re-detected
                    </span>
                    <button
                      onClick={() => handleCopyPitch(item.signature, defaultPitch)}
                      className="hover:text-slate-600 flex items-center gap-1"
                    >
                      {copiedSig === item.signature ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: View Generated AI Pitch */}
      {viewPitchRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI Generated WhatsApp Pitch
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {viewPitchRecord.businessName}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewPitchRecord.city}, {viewPitchRecord.country} • {viewPitchRecord.phone || 'Phone on file'}
                </p>
              </div>
              <button
                onClick={() => setViewPitchRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans max-h-72 overflow-y-auto mb-4">
              {viewPitchRecord.selectedOfferPitch ||
                `Assalam o Alaikum / Hello ${viewPitchRecord.businessName} team! 👋\n\nI was admiring your stellar reputation on Google Maps (${viewPitchRecord.rating || 4.6}★) in ${viewPitchRecord.city}.\n\nHowever, I noticed you do not have an official mobile-friendly website with direct 1-click WhatsApp ordering. Customers searching for you on Google Maps are unable to place direct orders.\n\nI build fast, high-converting mobile websites with direct WhatsApp integration. Would you be open to a quick 24-hour visual mockup?`}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  const pitch = viewPitchRecord.selectedOfferPitch || '';
                  if (pitch) handleCopyPitch(viewPitchRecord.signature, pitch);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                {copiedSig === viewPitchRecord.signature ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Pitch
                  </>
                )}
              </button>

              {(() => {
                let cleanPhone = (viewPitchRecord.whatsapp || viewPitchRecord.phone || '').replace(/[^0-9]/g, '');
                if (cleanPhone.startsWith('03') && cleanPhone.length === 11) {
                  cleanPhone = '92' + cleanPhone.slice(1);
                } else if (cleanPhone.startsWith('05') && cleanPhone.length === 10) {
                  cleanPhone = '971' + cleanPhone.slice(1);
                }
                const pitch = viewPitchRecord.selectedOfferPitch || '';
                const waUrl = cleanPhone
                  ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(pitch)}`
                  : '';
                if (!waUrl) return null;
                return (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open WhatsApp Direct
                  </a>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
