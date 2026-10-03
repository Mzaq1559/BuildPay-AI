'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AuditEvent, Project } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { History, ShieldCheck, User, Filter, Calendar } from 'lucide-react';

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadAuditTrail = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditTrail(selectedProjectId);
      setEvents(data);
    } catch (err) {
      console.error('Error loading audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getProjects().then((p) => setProjects(p)).catch(() => {});
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAuditTrail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            Immutable Audit Log & Governance Trail
          </h1>
          <p className="text-xs text-slate-400">
            Complete record of human approvals, AI multi-agent audits, variations, and payment certifications.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Timeline List */}
      <div className="glass-panel rounded-xl p-6 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Loading audit trail...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No audit events recorded. Perform actions or seed demo data to populate audit history.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative pl-6 space-y-1">
                {/* Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-purple-500" />

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-300 capitalize">
                    {event.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-200">{event.summary}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                  <span>Target: {event.entity_type.replace('_', ' ')} #{event.entity_id}</span>
                  {event.actor_name && (
                    <span>• Actor: {event.actor_name} ({event.actor_role})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
