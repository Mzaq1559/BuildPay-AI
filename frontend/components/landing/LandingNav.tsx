'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080c14]/90 backdrop-blur-xl border-b border-slate-800/60 shadow-xl shadow-black/20'
          : 'bg-transparent'
      }`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-blue-900/30">
            <div className="w-full h-full bg-[#080c14] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
                BuildPay AI
              </span>
              <span className="hidden sm:inline text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30 font-mono">
                v1.0
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              Construction Project Controls
            </p>
          </div>
        </div>

        {/* Nav Actions */}
        <nav className="flex items-center gap-3" aria-label="Main navigation">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-900/30 transition-all hover:shadow-amber-900/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Demo
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
