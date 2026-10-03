'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project, OverviewMetrics, AuditEvent } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Building2, 
  TrendingUp, 
  FileCheck2, 
  GitPullRequest, 
  Receipt, 
  ShieldAlert, 
  Plus, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentAudit, setRecentAudit] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const p = await api.getProjects().catch(() => []);
        let m = null;
        if (p.length > 0) {
            m = await api.getOverviewMetrics(p[0].id).catch(() => null);
        }
        const a = await api.getAuditTrail().catch(() => []);

        if (m) setMetrics(m);
        setProjects(p);
        setRecentAudit(a.slice(0, 5));

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              BuildPay AI Project Controls Hub
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Construction Payments & Governance
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Multi-agent AI compliance engine verifying BOQ quantities, site inspection check requests, variations, and Interim Payment Certificates.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/check-requests"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-900/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Check Request
            </Link>
            <Link
              href="/ipc"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-900/40 transition-all"
            >
              <Receipt className="w-4 h-4" />
              Generate IPC
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects */}
        <div className="glass-card rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Portfolio Value</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-100">
              {metrics ? formatPKR(metrics.total_contract_value) : 'PKR 17.75M'}
            </div>
            <p className="text-xs text-slate-400 mt-1">Across active residential civil BOQs</p>
          </div>
        </div>

        {/* Card 2: Active Check Requests */}
        <div className="glass-card rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Check Requests</span>
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-100">
              {metrics ? metrics.active_crs : 3}
            </div>
            <p className="text-xs text-sky-400 mt-1 font-medium">Pending site inspection / AI review</p>
          </div>
        </div>

        {/* Card 3: Pending Variations */}
        <div className="glass-card rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Variations</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <GitPullRequest className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-100">
              {metrics ? metrics.pending_variations : 2}
            </div>
            <p className="text-xs text-amber-400 mt-1 font-medium">Under commercial QS verification</p>
          </div>
        </div>

        {/* Card 4: AI Compliance Flags */}
        <div className="glass-card rounded-xl p-5 space-y-3 relative overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-300">AI Risk Flags</span>
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300 border border-purple-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-purple-200">
              {metrics ? metrics.ai_flags_count : 4}
            </div>
            <p className="text-xs text-purple-300/80 mt-1 font-medium">Quantity overrun & spec warnings</p>
          </div>
        </div>
      </div>

      {/* Projects Overview & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Active Construction Projects</h2>
              <p className="text-xs text-slate-400">Standardized BOQ templates for 5 Marla, 10 Marla & 1 Kanal</p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No active projects found. Click &quot;Seed Demo Data&quot; in the navbar to load standard BOQs.
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{project.name}</span>
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400">
                      {project.location} • Client: {project.client_name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
                      <span>Contract: {formatPKR(project.contract_value)}</span>
                      <span>• Retention: {(project.retention_rate * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors shrink-0"
                  >
                    Open BOQ
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Trail Sidebar */}
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Live Audit Log
            </h2>
            <Link href="/audit" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
              Full Log
            </Link>
          </div>

          <div className="space-y-3">
            {recentAudit.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">No audit events recorded yet</div>
            ) : (
              recentAudit.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300 capitalize">{event.event_type.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300">{event.summary}</p>
                  {event.actor_name && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      By: {event.actor_name} ({event.actor_role})
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
