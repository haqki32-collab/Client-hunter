import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, Download, AlertCircle } from 'lucide-react';
import { Lead } from '../types.ts';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (importedLeads: Lead[]) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [csvText, setCsvText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sampleCsvContent = `Business Name,Category,City,Country,Phone,WhatsApp,Website,Email,Instagram,Notes
Desert Rose Cafe,Restaurants & Cafes,Dubai,United Arab Emirates,+971 4 888 1234,+971 50 222 3344,,contact@desertrose.ae,@desertrose_cafe,Busy specialty coffee shop with no website
Karachi Auto Masters,Auto Repair & Detailing,Karachi,Pakistan,+92 21 3456 7890,+92 321 444 5566,http://karachiauto-old.pk,info@karachiauto.pk,,Outdated 2012 non-mobile layout
SmileCare Dental,Clinics & Dental,Islamabad,Pakistan,+92 51 222 3344,+92 300 111 2233,,,@smilecare_isb,New clinic running without online booking
Royal Oud Perfumery,Retail & Boutique,Abu Dhabi,United Arab Emirates,+971 2 444 5566,+971 52 333 4455,https://royaloud.ae,sales@royaloud.ae,,Already has ecommerce`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'clienthunter_leads_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvToObjects = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV splitting
      const values = line.split(',').map((v) => v.trim());
      const rowObj: any = {};

      headers.forEach((h, index) => {
        const val = values[index] || '';
        if (h.includes('business') || h.includes('name')) rowObj.businessName = val;
        else if (h.includes('category')) rowObj.category = val;
        else if (h.includes('city')) rowObj.city = val;
        else if (h.includes('country')) rowObj.country = val;
        else if (h.includes('phone')) rowObj.phone = val;
        else if (h.includes('whatsapp')) rowObj.whatsapp = val;
        else if (h.includes('website') || h.includes('url')) rowObj.website = val;
        else if (h.includes('email')) rowObj.email = val;
        else if (h.includes('instagram')) rowObj.instagram = val;
        else if (h.includes('facebook')) rowObj.facebook = val;
        else if (h.includes('notes')) rowObj.notes = val;
      });

      if (rowObj.businessName) {
        rows.push(rowObj);
      }
    }
    return rows;
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = async () => {
    const rows = parseCsvToObjects(csvText);
    if (rows.length === 0) {
      alert('Please provide valid CSV content with a "Business Name" column.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/leads/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: rows }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportSummary({
          imported: data.imported,
          analyzed: data.analyzed || data.imported,
          highOpportunity: data.highOpportunity,
          mediumOpportunity: data.mediumOpportunity,
          lowOpportunity: data.lowOpportunity,
        });
        onImportComplete(data.leads || []);
      } else {
        alert(data.error || 'Failed to import CSV');
      }
    } catch (e) {
      alert('Server error processing CSV import');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">CSV Lead Import & Analysis</h3>
              <p className="text-xs text-slate-500">Bulk import directories, Maps exports, or manual lists</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!importSummary ? (
          <div className="mt-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Supported columns: Business Name, Category, City, Phone, WhatsApp, Website, etc.</span>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                <Download className="h-3.5 w-3.5" /> Download Template
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Click to upload CSV or drag and drop file here</p>
              <p className="text-[11px] text-slate-400 mt-1">Standard UTF-8 CSV supported</p>
            </div>

            {/* Direct Paste */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 uppercase tracking-wider">
                  Or Paste CSV Data Directly
                </label>
                <button
                  type="button"
                  onClick={() => setCsvText(sampleCsvContent)}
                  className="text-[11px] text-indigo-600 hover:underline"
                >
                  Load Sample Data
                </button>
              </div>
              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Business Name,Category,City,Country,Phone,WhatsApp,Website..."
                className="w-full rounded-xl border border-slate-200 p-3 font-mono text-[11px] focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!csvText.trim() || isProcessing}
                onClick={handleProcessImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition disabled:opacity-50"
              >
                {isProcessing ? 'Importing & Analyzing...' : 'Import Leads & Run AI Scoring'}
              </button>
            </div>
          </div>
        ) : (
          /* Import Results Screen as mandated by Section 18 */
          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-200 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-base font-bold text-emerald-950">CSV Batch Import Complete</h4>
              <p className="text-xs text-emerald-700 mt-1">
                All valid records were ingested, indexed, and evaluated by the opportunity scoring engine.
              </p>
            </div>

            {/* Metric breakdown as requested */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Imported</span>
                <span className="text-lg font-extrabold text-slate-900">{importSummary.imported}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 text-[11px] block">High Opportunity</span>
                <span className="text-lg font-extrabold text-emerald-800">{importSummary.highOpportunity}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-amber-700 text-[11px] block">Medium Opp.</span>
                <span className="text-lg font-extrabold text-amber-800">{importSummary.mediumOpportunity}</span>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Low Opp.</span>
                <span className="text-lg font-extrabold text-slate-700">{importSummary.lowOpportunity}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setImportSummary(null);
                  setCsvText('');
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                View Leads in Pipeline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
