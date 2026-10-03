'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Variation, Project, BOQItem } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AIReviewCard } from '@/components/ai/AIReviewCard';
import { GitPullRequest, Plus, Sparkles, CheckCircle2, RotateCcw, XCircle, ArrowUpRight } from 'lucide-react';

export default function VariationsPage() {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Variation Form State
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [selectedBoqItemId, setSelectedBoqItemId] = useState<number>(1);
  const [title, setTitle] = useState<string>('Additional Excavation due to Hard Rock Encounter');
  const [justification, setJustification] = useState<string>('Unexpected soil conditions required pneumatic breaking beyond contract depth');
  const [proposedQty, setProposedQty] = useState<number>(180);

  useEffect(() => {
    api.getProjects().then((p) => {
      setProjects(p);
      if (p.length > 0) setSelectedProjectId(p[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadVariations();
      api.getBOQs(selectedProjectId).then(async (boqs) => {
        if (boqs.length > 0) {
          const items = await api.getBOQItems(selectedProjectId, boqs[0].id).catch(() => []);
          setBoqItems(items);
          if (items.length > 0) setSelectedBoqItemId(items[0].id);
        }
      }).catch(() => {});
    }
  }, [selectedProjectId]);

  async function loadVariations() {
    try {
      setLoading(true);
      const data = await api.getVariations(selectedProjectId);
      setVariations(data);
      if (data.length > 0 && !selectedVar) {
        setSelectedVar(data[0]);
      }
    } catch (err) {
      console.error('Error loading variations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const v = await api.createVariation({
        project_id: selectedProjectId,
        boq_item_id: selectedBoqItemId,
        title,
        justification,
        proposed_quantity: proposedQty,
      });
      setShowCreateModal(false);
      loadVariations();
      setSelectedVar(v);
    } catch (err) {
      console.error('Error creating variation:', err);
    }
  };

  const handleRunAiAudit = async (varId: number) => {
    try {
      setIsAuditing(true);
      const updated = await api.triggerVariationReview(selectedProjectId, varId);
      setSelectedVar(updated);
      loadVariations();
    } catch (err) {
      console.error('AI audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDecision = async (decision: 'approved' | 'returned' | 'rejected') => {
    if (!selectedVar) return;
    try {
      const updated = await api.decideVariation(selectedProjectId, selectedVar.id, decision, `Human decision: ${decision.toUpperCase()}`);
      setSelectedVar(updated);
      loadVariations();
    } catch (err) {
      console.error('Decision error:', err);
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
            <GitPullRequest className="w-6 h-6 text-amber-400" />
            Variation Order (VO) Register
          </h1>
          <p className="text-xs text-slate-400">
            Scope changes & quantity overruns audited by AI Variation Agent before formal Commercial QS approval.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-900/40 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Propose Variation Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Variations List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span>Variations ({variations.length})</span>
            <span>Select to inspect</span>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-xs">Loading variations...</div>
            ) : variations.length === 0 ? (
              <div className="glass-panel p-6 text-center text-xs text-slate-400 rounded-xl">
                No Variation Orders found. Click &quot;Propose Variation Order&quot; or &quot;Seed Demo Data&quot;.
              </div>
            ) : (
              variations.map((v) => {
                const isSelected = selectedVar?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVar(v)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border text-xs space-y-2 ${
                      isSelected
                        ? 'bg-slate-900/90 border-amber-500 shadow-md shadow-amber-950/40'
                        : 'glass-card border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">{v.variation_number}</span>
                      <StatusBadge status={v.status} size="sm" />
                    </div>

                    <h4 className="font-bold text-slate-200 line-clamp-1">{v.title}</h4>

                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
                      <span>Delta: +{v.quantity_delta}</span>
                      <span className="font-bold text-amber-300">+{formatPKR(v.amount_delta)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Variation Detail & AI Multi-Agent Audit */}
        <div className="lg:col-span-7 space-y-6">
          {selectedVar ? (
            <div className="space-y-6">
              {/* Detail Card */}
              <div className="glass-panel rounded-xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-amber-400">{selectedVar.variation_number}</span>
                      <StatusBadge status={selectedVar.status} size="md" />
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm mt-1">{selectedVar.title}</h3>
                  </div>

                  <button
                    onClick={() => handleRunAiAudit(selectedVar.id)}
                    disabled={isAuditing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-900/40 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAuditing ? 'Auditing...' : 'Trigger AI Audit'}
                  </button>
                </div>

                {/* Before vs After comparison */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold block">Original BOQ Baseline</span>
                    <div className="font-mono text-slate-300">Qty: {selectedVar.original_quantity}</div>
                    <div className="font-mono text-slate-300">Val: {formatPKR(selectedVar.original_amount)}</div>
                  </div>
                  <div className="space-y-1 border-l border-slate-800 pl-4">
                    <span className="text-amber-400 font-semibold block">Proposed Variation</span>
                    <div className="font-mono text-amber-300 font-bold">New Qty: {selectedVar.proposed_quantity}</div>
                    <div className="font-mono text-amber-300 font-bold">New Val: {formatPKR(selectedVar.proposed_amount)}</div>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-slate-400">Engineering Justification:</span>
                  <p className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                    {selectedVar.justification}
                  </p>
                </div>

                {/* Human Approval Action Panel */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Quantity Surveyor Governance Decision</span>
                    <span className="text-[10px] text-slate-400">Commercial Signoff</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDecision('approved')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-900/30"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Variation
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

              {/* AI Multi-Agent Audit Card */}
              <AIReviewCard
                review={selectedVar.ai_review}
                onTriggerReview={() => handleRunAiAudit(selectedVar.id)}
                isLoading={isAuditing}
              />
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-12 text-center text-slate-400 text-sm">
              Select a Variation Order from the list to view detailed AI multi-agent findings and commercial decision controls.
            </div>
          )}
        </div>
      </div>

      {/* Create Variation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-slate-700 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-amber-400" />
              Propose Variation Order (VO)
            </h2>

            <form onSubmit={handleCreateVariation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target BOQ Item</label>
                <select
                  value={selectedBoqItemId}
                  onChange={(e) => setSelectedBoqItemId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                >
                  {boqItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_code} - {item.description.substring(0, 40)}... (Orig: {item.original_quantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Variation Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Proposed New Total Quantity</label>
                <input
                  type="number"
                  required
                  value={proposedQty}
                  onChange={(e) => setProposedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Technical / Commercial Justification</label>
                <textarea
                  rows={3}
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
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
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-md shadow-amber-900/40"
                >
                  Submit Variation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
