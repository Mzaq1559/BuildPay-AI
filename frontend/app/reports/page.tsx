'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project, OverviewMetrics } from '@/types';
import { BarChart3, Download, FileSpreadsheet, FileText, CheckCircle2, Building2 } from 'lucide-react';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then((p) => {
      setProjects(p);
      if (p.length > 0) {
        api.getOverviewMetrics(p[0].id).then(m => setMetrics(m)).catch(() => null);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportCSV = (reportType: string) => {
    alert(`Exporting ${reportType} report as CSV file...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Executive Financial & Governance Reports
          </h1>
          <p className="text-xs text-slate-400">
            Export certified BOQ progress, Variation Orders, and IPC payment audit reports.
          </p>
        </div>
      </div>

      {/* Report Types Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Report 1 */}
        <div className="glass-card rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20 w-fit">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">BOQ Execution & Variance Statement</h3>
            <p className="text-xs text-slate-400">
              Detailed line-item comparison between original contract quantity, approved variations, and certified execution.
            </p>
          </div>
          <button
            onClick={() => handleExportCSV('BOQ Variance')}
            className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Export BOQ Report (CSV)
          </button>
        </div>

        {/* Report 2 */}
        <div className="glass-card rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20 w-fit">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Variation Register & Scope Change Log</h3>
            <p className="text-xs text-slate-400">
              Summary of all proposed and approved Variation Orders, financial impacts, and engineering justifications.
            </p>
          </div>
          <button
            onClick={() => handleExportCSV('Variation Register')}
            className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Export Variation Log (CSV)
          </button>
        </div>

        {/* Report 3 */}
        <div className="glass-card rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20 w-fit">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">IPC Payment Certificate Ledger</h3>
            <p className="text-xs text-slate-400">
              Interim valuation ledger with gross certified amounts, retention fund withholdings, and net payable summaries.
            </p>
          </div>
          <button
            onClick={() => handleExportCSV('IPC Ledger')}
            className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Export Payment Ledger (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
