'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckRequest, Project, BOQItem } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AIReviewCard } from '@/components/ai/AIReviewCard';
import { 
  FileCheck2, 
  Plus, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  FileText, 
  MapPin,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function CheckRequestsPage() {
  const [crs, setCrs] = useState<CheckRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCr, setSelectedCr] = useState<CheckRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New CR Form state
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [selectedBoqItemId, setSelectedBoqItemId] = useState<number>(1);
  const [requestedQty, setRequestedQty] = useState<number>(100);
  const [location, setLocation] = useState<string>('Foundation Grid A-C');
  const [description, setDescription] = useState<string>('Excavation & PCC Bedding executed per structural drawing');

  useEffect(() => {
    loadCRs();
    api.getProjects().then((p) => {
      setProjects(p);
      if (p.length > 0) setSelectedProjectId(p[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      api.getBOQs(selectedProjectId).then(async (boqs) => {
        if (boqs.length > 0) {
          const items = await api.getBOQItems(selectedProjectId, boqs[0].id).catch(() => []);
          setBoqItems(items);
          if (items.length > 0) setSelectedBoqItemId(items[0].id);
        }
      }).catch(() => {});
    }
  }, [selectedProjectId]);

  async function loadCRs() {
    try {
      setLoading(true);
      const data = await api.getCheckRequests(selectedProjectId);
      setCrs(data);
      if (data.length > 0 && !selectedCr) {
        setSelectedCr(data[0]);
      }
    } catch (err) {
      console.error('Failed to load check requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCr = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCr = await api.createCheckRequest({
        project_id: selectedProjectId,
        boq_item_id: selectedBoqItemId,
        requested_quantity: requestedQty,
        location,
        description,
      });
      setShowCreateModal(false);
      loadCRs();
      setSelectedCr(newCr);
    } catch (err) {
      console.error('Create CR failed:', err);
    }
  };

  const handleRunAiAudit = async (crId: number) => {
    try {
      setIsAuditing(true);
      const updatedCr = await api.triggerCRReview(selectedProjectId, crId);
      setSelectedCr(updatedCr);
      loadCRs();
    } catch (err) {
      console.error('AI audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDecision = async (decision: 'approved' | 'returned' | 'rejected') => {
    if (!selectedCr) return;
    try {
      const updated = await api.decideCR(selectedProjectId, selectedCr.id, decision, `Human review decision: ${decision.toUpperCase()}`);
      setSelectedCr(updated);
      loadCRs();
    } catch (err) {
      console.error('Decision error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-sky-400" />
            Check Requests (CR) Register
          </h1>
          <p className="text-xs text-slate-400">
            Contractor site inspection requests verified by BuildPay AI 9-agent pipeline before Consultant/Client signoff.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-900/40 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Submit Site Check Request
        </button>
      </div>

      {/* Main Grid: List on Left, Detail & AI Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CR Register List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span>Site Requests ({crs.length})</span>
            <span>Select to inspect</span>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-xs">Loading CR register...</div>
            ) : crs.length === 0 ? (
              <div className="glass-panel p-6 text-center text-xs text-slate-400 rounded-xl">
                No Check Requests found. Click &quot;Submit Site Check Request&quot; or &quot;Seed Demo Data&quot;.
              </div>
            ) : (
              crs.map((cr) => {
                const isSelected = selectedCr?.id === cr.id;
                return (
                  <div
                    key={cr.id}
                    onClick={() => setSelectedCr(cr)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border text-xs space-y-2 ${
                      isSelected
                        ? 'bg-slate-900/90 border-blue-500 shadow-md shadow-blue-950/40'
                        : 'glass-card border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-400">{cr.cr_number}</span>
                      <StatusBadge status={cr.status} size="sm" />
                    </div>

                    <p className="font-semibold text-slate-200 line-clamp-1">{cr.description}</p>

                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{cr.location || 'Site Grid'}</span>
                      </div>
                      <div className="font-mono font-medium text-slate-300">
                        {cr.requested_quantity} {cr.unit}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected CR Detail & AI Multi-Agent Audit */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCr ? (
            <div className="space-y-6">
              {/* Detail Card */}
              <div className="glass-panel rounded-xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-blue-400">{selectedCr.cr_number}</span>
                      <StatusBadge status={selectedCr.status} size="md" />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Submitted by Contractor Field Engineer</p>
                  </div>

                  {/* Run AI Audit button */}
                  <button
                    onClick={() => handleRunAiAudit(selectedCr.id)}
                    disabled={isAuditing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-900/40 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAuditing ? 'Auditing...' : 'Trigger AI Audit'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Location:</span>
                    <span className="font-semibold text-slate-200">{selectedCr.location || 'Main Structure'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Requested Quantity:</span>
                    <span className="font-mono font-bold text-sky-400">
                      {selectedCr.requested_quantity} {selectedCr.unit}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-slate-400">Work Description:</span>
                  <p className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                    {selectedCr.description}
                  </p>
                </div>

                {/* Human Approval Action Panel */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Human Governance Decision</span>
                    <span className="text-[10px] text-slate-400">Consultant / Client Role</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDecision('approved')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-900/30"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve CR
                    </button>
                    <button
                      onClick={() => handleDecision('returned')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-md shadow-amber-900/30"
                    >
                      <RotateCcw className="w-4 h-4" /> Return for Clarification
                    </button>
                    <button
                      onClick={() => handleDecision('rejected')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md shadow-rose-900/30"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Multi-Agent Review Panel */}
              <AIReviewCard
                review={selectedCr.ai_review}
                onTriggerReview={() => handleRunAiAudit(selectedCr.id)}
                isLoading={isAuditing}
              />
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-12 text-center text-slate-400 text-sm">
              Select a Check Request from the list to view detailed AI multi-agent findings and human approval options.
            </div>
          )}
        </div>
      </div>

      {/* Create CR Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-slate-700 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-sky-400" />
              New Site Inspection Check Request
            </h2>

            <form onSubmit={handleCreateCr} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Linked BOQ Item</label>
                <select
                  value={selectedBoqItemId}
                  onChange={(e) => setSelectedBoqItemId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                >
                  {boqItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_code} - {item.description.substring(0, 40)}... ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Requested Qty</label>
                  <input
                    type="number"
                    required
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Location / Grid</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detailed Site Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-900/40"
                >
                  Submit for AI Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
