'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileSpreadsheet, 
  FileCheck2, 
  Ruler, 
  GitPullRequest, 
  Receipt, 
  FileText, 
  History, 
  BarChart3, 
  Bot,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Projects & BOQ', href: '/projects', icon: FolderKanban },
    { label: 'Check Requests', href: '/check-requests', icon: FileCheck2 },
    { label: 'Measurements', href: '/measurements', icon: Ruler },
    { label: 'Variations', href: '/variations', icon: GitPullRequest },
    { label: 'IPC / Payments', href: '/ipc', icon: Receipt },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'Audit Trail', href: '/audit', icon: History },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Platform Navigation
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border border-blue-500/30 shadow-md shadow-blue-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* AI Multi-Agent Status Sidebar Box */}
      <div className="p-4 m-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI Multi-Agent Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          9 specialized LLM agents monitoring BOQs, CRs, variations & IPCs for risk & compliance.
        </p>
        <div className="flex items-center gap-1.5 pt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] text-emerald-400 font-mono">Agent Engine Ready</span>
        </div>
      </div>
    </aside>
  );
};
