import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-[#050810] py-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-slate-300">BuildPay AI</span>
        </div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} BuildPay AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
