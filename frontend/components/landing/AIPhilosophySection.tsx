'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Calculator, Flag, Search, UserCheck, ArrowRight } from 'lucide-react';

const AI_CAPABILITIES = [
  {
    icon: Search,
    title: 'Prepares',
    desc: 'Structures BOQ registers, compiles check request data, aggregates measurements across work categories.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Brain,
    title: 'Checks',
    desc: 'Validates claimed quantities against BOQ approvals, cross-references measurement records, verifies item codes.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Calculator,
    title: 'Calculates',
    desc: 'Computes gross amounts, retention deductions, variation impacts, and net payable for IPC generation.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Flag,
    title: 'Flags',
    desc: 'Surfaces quantity overruns, duplicate claims, specification deviations, and compliance exceptions for human review.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
];

// Animated agent pipeline visual
function AgentPipeline() {
  const AGENTS = [
    'BOQ Agent', 'Quantity Agent', 'Evidence Agent',
    'CR Agent', 'Variation Agent', 'History Agent',
    'Compliance Agent', 'Review Agent', 'IPC Agent',
  ];

  return (
    <div className="landing-glass rounded-2xl p-5 border border-slate-800/60">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        <span className="text-xs font-semibold text-purple-300">AI Multi-Agent Engine — 9 Specialized Agents</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {AGENTS.map((agent, i) => (
          <motion.div
            key={agent}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-purple-950/30 border border-purple-500/20 hover:border-purple-400/40 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-[10px] text-purple-200 font-medium leading-tight">{agent}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">groq/llama-3.1-70b-versatile</span>
          <span className="text-emerald-400 font-semibold">Engine Active</span>
        </div>
      </div>
    </div>
  );
}

export function AIPhilosophySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden"
      aria-label="AI Philosophy"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19] via-[#0d1020] to-[#0b0f19]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left: Agent pipeline visual */}
          <motion.div
            className="flex-1 w-full"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <AgentPipeline />
          </motion.div>

          {/* Right: Copy */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6"
            >
              AI Assistance Model
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-50 mb-6 tracking-tight leading-tight"
            >
              9 AI Agents.
              <br />
              <span className="gradient-text-ai">One Audit Pipeline.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-slate-400 text-base mb-8 leading-relaxed"
            >
              BuildPay AI deploys specialized agents for every layer of construction project controls —
              each focused on a specific compliance dimension, working in parallel.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AI_CAPABILITIES.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <motion.div
                    key={cap.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                    className={`rounded-xl p-4 border ${cap.border} ${cap.bg} space-y-2`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${cap.bg} border ${cap.border}`}>
                        <Icon className={`w-4 h-4 ${cap.color}`} />
                      </div>
                      <span className={`text-sm font-bold ${cap.color}`}>{cap.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 flex items-center gap-3 text-sm text-slate-400"
            >
              <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <span className="text-amber-400 font-semibold">Final authority remains human.</span>{' '}
                AI provides advisory analysis. QS, Consultant, and Client roles authorize.
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
