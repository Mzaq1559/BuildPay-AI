'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Building2, Plus, FileSpreadsheet, MapPin, Calendar, Sparkles } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [clientName, setClientName] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [boqType, setBoqType] = useState('5_marla');
  const [contractValue, setContractValue] = useState(6500000);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p = await api.createProject({
        name,
        location,
        client_name: clientName,
        contractor_name: contractorName,
        boq_type: boqType,
        contract_value: contractValue,
        currency: 'PKR',
        retention_rate: 0.1,
      });

      // Populate BOQ from chosen template
      await api.createBOQFromTemplate(p.id, boqType);

      setShowCreateModal(false);
      fetchProjects();
    } catch (err) {
      console.error('Create project error:', err);
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
            <Building2 className="w-6 h-6 text-blue-400" />
            Projects & Civil BOQ Registers
          </h1>
          <p className="text-xs text-slate-400">
            Manage construction projects linked to standardized 5 Marla, 10 Marla, and 1 Kanal BOQs.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-900/40 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center space-y-4">
          <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click &quot;Seed Demo Data&quot; in the top navigation bar or &quot;Create New Project&quot; to load standard BOQs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card rounded-xl p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-blue-400 font-semibold uppercase tracking-wider">
                      {project.project_number}
                    </span>
                    <h3 className="font-bold text-base text-slate-100">{project.name}</h3>
                  </div>
                  <StatusBadge status={project.status} size="sm" />
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Client: {project.client_name}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Contract Value:</span>
                    <span className="font-mono font-bold text-slate-100">
                      {formatPKR(project.contract_value)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>BOQ Type:</span>
                    <span className="font-medium text-purple-300 capitalize">
                      {project.boq_type?.replace('_', ' ') || 'Standard Civil'}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/projects/${project.id}`}
                className="w-full text-center py-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all"
              >
                Inspect BOQ & Workflows →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-5 border border-slate-700 shadow-2xl relative">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Create Construction Project
            </h2>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. DHA Phase 9 Townhouse"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lahore, Pakistan"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Paragon Developers"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Contractor Name</label>
                  <input
                    type="text"
                    required
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    placeholder="e.g. Habib Builders"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">BOQ Standard Template</label>
                  <select
                    value={boqType}
                    onChange={(e) => {
                      setBoqType(e.target.value);
                      if (e.target.value === '5_marla') setContractValue(6500000);
                      else if (e.target.value === '10_marla') setContractValue(12500000);
                      else setContractValue(28000000);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="5_marla">5 Marla Double Storey</option>
                    <option value="10_marla">10 Marla Double Storey</option>
                    <option value="1_kanal">1 Kanal Double Storey</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Contract Value (PKR)</label>
                  <input
                    type="number"
                    required
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-900/40"
                >
                  Create & Seed BOQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
