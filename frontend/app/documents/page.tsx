'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Document, Project } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FileText, Upload, ShieldCheck, FileCheck, Search, HardDrive } from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then((p) => {
      setProjects(p);
      if (p.length > 0) setSelectedProjectId(p[0].id);
    }).catch(() => {});
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments(selectedProjectId);
      setDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadDocuments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            Document & Evidence Vault
          </h1>
          <p className="text-xs text-slate-400">
            Site photos, structural drawings, quality test reports, and joint measurement sheets verified by Document Agent.
          </p>
        </div>

        {/* Project Selector */}
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

      {/* Document Grid */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Document Name</th>
                <th className="px-4 py-3">Entity Type</th>
                <th className="px-4 py-3 text-center">Format</th>
                <th className="px-4 py-3 text-right">Size</th>
                <th className="px-4 py-3 text-center">AI Evidence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Loading documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No documents attached for this project yet. Seed demo data to load attachments.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{doc.original_filename}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 uppercase font-mono text-[11px]">
                      {doc.entity_type.replace('_', ' ')} #{doc.entity_id}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-400 uppercase">
                      {doc.filename.split('.').pop()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {formatBytes(doc.file_size)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={doc.status} size="sm" />
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
