'use client';

import React, { useState } from 'react';
import { ShieldCheck, Bell, Sparkles, User as UserIcon, Database, Check, LogOut } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange }) => {
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await api.seedData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
      window.location.reload();
    } catch (e) {
      console.error('Seed error:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  const roles = [
    { value: 'contractor', label: 'Contractor' },
    { value: 'consultant', label: 'Consultant / QS' },
    { value: 'client', label: 'Client / PM' },
    { value: 'admin', label: 'System Admin' },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    router.push('/');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-blue-900/30">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              BuildPay AI
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-mono">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Project Controls & Payment Platform</p>
        </div>
      </div>

      {/* Role Switcher & Controls */}
      <div className="flex items-center gap-4">
        {/* Seed Database button */}
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs font-medium transition-all"
          title="Seed test projects, BOQs, CRs, and IPCs"
        >
          {seedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Database Seeded!</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
            </>
          )}
        </button>

        {/* Role Selector Simulator */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <span className="text-xs text-slate-400 pl-2 font-medium hidden md:inline">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs rounded-lg px-2.5 py-1 border border-slate-700/60 font-medium focus:outline-none focus:border-blue-500"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notification indicator */}
        <button className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-semibold text-xs">
            <UserIcon className="w-4 h-4" />
          </div>
          
          {/* Logout Button */}
          <button onClick={handleLogout} className="p-2 ml-1 rounded-lg bg-slate-900/50 hover:bg-red-950/50 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-900/50 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
