'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project, BOQ, BOQItem } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Building2, 
  FileSpreadsheet, 
  Layers, 
  Search, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck2,
  GitPullRequest,
  Receipt
} from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = parseInt(resolvedParams.id, 10);

  const [project, setProject] = useState<Project | null>(null);
  const [boq, setBoq] = useState<BOQ | null>(null);
  const [items, setItems] = useState<BOQItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [p, boqList] = await Promise.all([
          api.getProject(projectId).catch(() => null),
          api.getBOQs(projectId).catch(() => []),
        ]);

        if (p) setProject(p);

        if (boqList.length > 0) {
          const activeBoq = boqList[0];
          setBoq(activeBoq);
          const boqItems = await api.getBOQItems(projectId, activeBoq.id).catch(() => []);
          setItems(boqItems);
        }
      } catch (err) {
        console.error('Error loading project details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  const filteredItems = items.filter((item) => {
    const matchesSection = selectedSection === 'ALL' || item.section === selectedSection;
    const matchesSearch =
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const sections = ['ALL', 'Mobilization', 'Grey Structure', 'Finishing', 'Other'];

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
          </Link>
          {project && (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-100">{project.name}</h1>
              <StatusBadge status={project.status} size="sm" />
            </div>
          )}
          {project && (
            <p className="text-xs text-slate-400">
              {project.location} • Client: {project.client_name} • Contractor: {project.contractor_name}
            </p>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/check-requests?project_id=${projectId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition-all"
          >
            <FileCheck2 className="w-4 h-4" /> CR Register
          </Link>
          <Link
            href={`/variations?project_id=${projectId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-900/30 transition-all"
          >
            <GitPullRequest className="w-4 h-4" /> Variations
          </Link>
          <Link
            href={`/ipc?project_id=${projectId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-all"
          >
            <Receipt className="w-4 h-4" /> IPC Register
          </Link>
        </div>
      </div>

      {/* BOQ Summary Header */}
      {boq && (
        <div className="glass-panel rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">BOQ Specification</span>
            <span className="font-bold text-slate-200 capitalize font-mono">{boq.boq_type.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Covered Area</span>
            <span className="font-bold text-slate-200 font-mono">{boq.covered_area_sqft || 0} sq.ft</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Total BOQ Items</span>
            <span className="font-bold text-slate-200 font-mono">{items.length} items</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Original Contract Value</span>
            <span className="font-bold text-blue-400 font-mono">
              {formatPKR(items.reduce((acc, item) => acc + item.amount, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSection === sec
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* BOQ Data Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Unit</th>
                <th className="px-4 py-3 text-right">Unit Rate (PKR)</th>
                <th className="px-4 py-3 text-right">Original Qty</th>
                <th className="px-4 py-3 text-right">Appr. Var Qty</th>
                <th className="px-4 py-3 text-right">Certified Qty</th>
                <th className="px-4 py-3 text-right">Total Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    Loading BOQ items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    No matching BOQ items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isOverrun = item.certified_quantity > item.current_approved_quantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-400">{item.item_code}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px]">
                          {item.section}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200 max-w-xs truncate">{item.description}</td>
                      <td className="px-4 py-3 text-center font-mono text-slate-400">{item.unit}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">
                        {item.unit_rate.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">
                        {item.original_quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-400">
                        {item.approved_variation_quantity > 0 ? `+${item.approved_variation_quantity}` : '-'}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${isOverrun ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.certified_quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-100">
                        {formatPKR(item.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
