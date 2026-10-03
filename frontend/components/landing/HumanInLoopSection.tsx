'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserCheck, Shield, Lock } from 'lucide-react';

export function HumanInLoopSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden bg-[#080c14]">
      {/* Background styling */}
      <div className="absolute inset-0 border-y border-slate-800/60 bg-slate-900/20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b0f19_1px,transparent_1px),linear-gradient(to_bottom,#0b0f19_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8"
        >
          <UserCheck className="w-8 h-8 text-amber-400" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-50 mb-6 tracking-tight leading-tight"
        >
          AI <span className="text-slate-400 font-medium">Assists.</span> <br className="sm:hidden" />
          Humans <span className="gradient-text-amber">Authorize.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12"
        >
          BuildPay AI is designed to augment human expertise, not replace it. Our AI agents handle the heavy lifting of data correlation, quantity checking, and risk flagging—but every critical financial and project decision requires explicit human authorization from designated project roles.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <div className="flex items-center gap-3 bg-slate-900/60 px-5 py-3 rounded-xl border border-slate-800">
             <Shield className="w-5 h-5 text-emerald-400" />
             <span className="text-sm font-semibold text-slate-200">100% Audit Trail</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/60 px-5 py-3 rounded-xl border border-slate-800">
             <Lock className="w-5 h-5 text-emerald-400" />
             <span className="text-sm font-semibold text-slate-200">Role-Based Security</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
