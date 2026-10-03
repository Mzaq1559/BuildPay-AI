'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { IPC, Project } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AIReviewCard } from '@/components/ai/AIReviewCard';
import { Receipt, Plus, Sparkles, CheckCircle2, DollarSign, FileText, ArrowRight } from 'lucide-react';

export default function IPCPage() {
  const [ipcs, setIpcs] = useState<IPC[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [selectedIpc, setSelectedIpc] = useState<IPC | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    api.getProjects().then((p) => {
      setProjects(p);
      if (p.length > 0) setSelectedProjectId(p[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadIPCs();
    }
  }, [selectedProjectId]);

  async function loadIPCs() {
    try {
      setLoading(true);
      const data = await api.getIPCs(selectedProjectId);
      setIpcs(data);
      if (data.length > 0 && !selectedIpc) {
        setSelectedIpc(data[0]);
      }
    } catch (err) {
      console.error('Error loading IPCs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIpc = async () => {
    try {
      setIsGenerating(true);
      const today = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const newIpc = await api.generateIPC({
        project_id: selectedProjectId,
        period_start: start,
        period_end: today,
        notes: 'Monthly Interim Payment Valuation based on certified site measurements',
      });
      loadIPCs();
      setSelectedIpc(newIpc);
    } catch (err) {
      console.error('Error generating IPC:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunAiAudit = async (ipcId: number) => {
    try {
      setIsAuditing(true);
      const updated = await api.triggerIPCReview(selectedProjectId, ipcId);
      setSelectedIpc(updated);
      loadIPCs();
    } catch (err) {
      console.error('AI audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCertify = async () => {
    if (!selectedIpc) return;
    try {
      const updated = await api.certifiyIPC(selectedProjectId, selectedIpc.id, 'Certified by Consultant Quantity Surveyor');
      setSelectedIpc(updated);
      loadIPCs();
    } catch (err) {
      console.error('Certify error:', err);
    }
  };

  const handleApprove = async () => {
    if (!selectedIpc) return;
    try {
      const updated = await api.approveIPC(selectedProjectId, selectedIpc.id, 'Approved for payment disbursement by Client Representative');
      setSelectedIpc(updated);
      loadIPCs();
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-400" />
            Interim Payment Certificates (IPC)
          </h1>
          <p className="text-xs text-slate-400">
            Valuation certificates with automated retention calculation and multi-agent AI financial reconciliation.
          </p>
        </div>

        <button
          onClick={handleGenerateIpc}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-900/40 transition-all self-start disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {isGenerating ? 'Calculating Valuation...' : 'Generate New IPC'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: IPC List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span>Certificates ({ipcs.length})</span>
            <span>Select to inspect</span>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-xs">Loading IPC register...</div>
            ) : ipcs.length === 0 ? (
              <div className="glass-panel p-6 text-center text-xs text-slate-400 rounded-xl">
                No Interim Payment Certificates found. Click &quot;Generate New IPC&quot; or &quot;Seed Demo Data&quot;.
              </div>
            ) : (
              ipcs.map((ipc) => {
                const isSelected = selectedIpc?.id === ipc.id;
                return (
                  <div
                    key={ipc.id}
                    onClick={() => setSelectedIpc(ipc)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border text-xs space-y-2 ${
                      isSelected
                        ? 'bg-slate-900/90 border-purple-500 shadow-md shadow-purple-950/40'
                        : 'glass-card border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-400">{ipc.ipc_number}</span>
                      <StatusBadge status={ipc.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Valuation Period:</span>
                      <span className="font-mono text-[11px] text-slate-400">{ipc.period_start} to {ipc.period_end}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
                      <span>Net Payable:</span>
                      <span className="font-bold text-emerald-400">{formatPKR(ipc.net_payable)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected IPC Detail & AI Audit */}
        <div className="lg:col-span-7 space-y-6">
          {selectedIpc ? (
            <div className="space-y-6">
              {/* IPC Financial Breakdown Card */}
              <div className="glass-panel rounded-xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-purple-400">{selectedIpc.ipc_number}</span>
                      <StatusBadge status={selectedIpc.status} size="md" />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Valuation Period: {selectedIpc.period_start} to {selectedIpc.period_end}</p>
                  </div>

                  <button
                    onClick={() => handleRunAiAudit(selectedIpc.id)}
                    disabled={isAuditing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-900/40 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAuditing ? 'Auditing...' : 'Trigger AI Audit'}
                  </button>
                </div>

                {/* Financial Summary Table */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-semibold text-slate-300">Valuation & Statutory Deductions</h4>
                  <div className="space-y-1 rounded-xl bg-slate-900/80 p-4 border border-slate-800 font-mono">
                    <div className="flex justify-between text-slate-300 py-1">
                      <span>Gross Current Valuation:</span>
                      <span className="font-bold text-slate-100">{formatPKR(selectedIpc.gross_amount)}</span>
                    </div>
                    <div className="flex justify-between text-rose-400 py-1 border-t border-slate-800">
                      <span>Less: Retention Fund:</span>
                      <span>-{formatPKR(selectedIpc.retention_amount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 py-2 border-t border-slate-700 text-sm font-bold">
                      <span>NET PAYABLE TO CONTRACTOR:</span>
                      <span>{formatPKR(selectedIpc.net_payable)}</span>
                    </div>
                  </div>
                </div>

                {/* Governance Buttons */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Dual Governance Certification & Approval</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCertify}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-md shadow-sky-900/30"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Certify Valuation (QS)
                    </button>
                    <button
                      onClick={handleApprove}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-900/30"
                    >
                      <DollarSign className="w-4 h-4" /> Authorize Payment (Client)
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Multi-Agent Audit Card */}
              <AIReviewCard
                review={selectedIpc.ai_review}
                onTriggerReview={() => handleRunAiAudit(selectedIpc.id)}
                isLoading={isAuditing}
              />
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-12 text-center text-slate-400 text-sm">
              Select an Interim Payment Certificate to inspect valuation breakdowns, retention deductions, and AI audit reports.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
