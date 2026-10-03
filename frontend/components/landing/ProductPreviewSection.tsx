'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, FileCheck2, Ruler, AlertTriangle } from 'lucide-react';

export function ProductPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 relative bg-[#0b0f19] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs font-semibold mb-4"
          >
            Product Interface
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-50 tracking-tight"
          >
            Enterprise-Grade. <span className="gradient-text-blue">Built for Construction.</span>
          </motion.h2>
        </div>

        {/* UI Mockup Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="relative mx-auto max-w-5xl rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-2xl overflow-hidden"
        >
          {/* Mockup Header */}
          <div className="h-12 border-b border-slate-800/80 bg-slate-950/80 flex items-center px-4 gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            </div>
            <div className="flex-1 bg-slate-900/80 border border-slate-800/60 rounded-md h-7 max-w-md mx-auto flex items-center px-3">
              <span className="text-[10px] text-slate-500 font-mono">buildpay.ai / dashboard / check-requests</span>
            </div>
          </div>

          {/* Mockup Content */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content area */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-sky-400" />
                    Check Request #CR-009
                  </h3>
                  <p className="text-xs text-slate-400">DHA-P8-2024-001 • Grey Structure</p>
                </div>
                <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase">
                  Pending Verification
                </div>
              </div>

              {/* Data Rows */}
              <div className="space-y-3">
                {[
                  { label: 'BOQ Item', value: 'GS-012: Brick Masonry', icon: Ruler },
                  { label: 'Requested Qty', value: '312.5 m³', icon: Ruler, highlight: true },
                  { label: 'Location', value: 'Block A, Ground Floor Walls', icon: Ruler },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60">
                    <span className="text-xs text-slate-400">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.highlight ? 'text-amber-400' : 'text-slate-200'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar / AI Review area */}
            <div className="space-y-4">
              <div className="rounded-xl bg-purple-950/20 border border-purple-500/30 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl" />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-semibold text-purple-300">AI Review Status</span>
                </div>
                
                <div className="space-y-3">
                  <div className="p-2 rounded bg-slate-900/60 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="font-semibold">Quantity Overrun</span>
                    </div>
                    <p className="text-slate-400 text-[10px]">Claimed quantity exceeds BOQ remaining limit by 64.0 m³.</p>
                  </div>
                  
                  <div className="p-2 rounded bg-slate-900/60 border border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="font-semibold">Evidence Validated</span>
                    </div>
                    <p className="text-slate-400 text-[10px]">3 photos match reported location.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                 <div className="py-2 text-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold cursor-not-allowed opacity-50">
                    Approve
                 </div>
                 <div className="py-2 text-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold cursor-not-allowed opacity-50">
                    Return
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
