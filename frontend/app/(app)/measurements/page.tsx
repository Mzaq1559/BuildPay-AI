'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Measurement, Project } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Ruler, Plus, AlertTriangle, CheckCircle2, FileText, MapPin } from 'lucide-react';

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then((p) => {
      setProjects(p);
      if (p.length > 0) setSelectedProjectId(p[0].id);
    }).catch(() => {});
  }, []);

  async function loadMeasurements() {
    try {
      setLoading(true);
      const data = await api.getMeasurements(selectedProjectId);
      setMeasurements(data);
    } catch (err) {
      console.error('Error loading measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMeasurements();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Ruler className="w-6 h-6 text-emerald-400" />
            Quantity Measurement Sheet (MB)
          </h1>
          <p className="text-xs text-slate-400">
            Recorded site quantities linked to approved Check Requests and cumulative BOQ tracking.
          </p>
        </div>

        {/* Project selector */}
        {projects.length > 0 && (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Measurement Register Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">BOQ Item</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Current Claim</th>
                <th className="px-4 py-3 text-right">Prev Certified</th>
                <th className="px-4 py-3 text-right">Cumulative Qty</th>
                <th className="px-4 py-3 text-center">Overrun Warning</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    Loading measurement records...
                  </td>
                </tr>
              ) : measurements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No quantity measurements recorded for this project yet.
                  </td>
                </tr>
              ) : (
                measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">#MB-{m.id}</td>
                    <td className="px-4 py-3 font-mono text-blue-400 font-semibold">
                      {m.boq_item?.item_code || `Item #${m.boq_item_id}`}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{m.location_description || 'Site Grid'}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-100">
                      {m.current_quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {m.previously_certified_quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sky-400 font-semibold">
                      {m.cumulative_quantity}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.is_overrun ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> Overrun (+{m.overrun_quantity})
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[10px] font-medium">Within Limit</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={m.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
