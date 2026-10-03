'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FileSpreadsheet,
  FileCheck2,
  Camera,
  Ruler,
  GitPullRequest,
  Receipt,
  CheckCircle,
  CreditCard,
  ArrowDown,
} from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    icon: FileSpreadsheet,
    label: 'BOQ',
    sublabel: 'Bill of Quantities',
    desc: 'Standardized BOQ templates seeded with civil works items — Grey Structure, Finishing, and Mobilization.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'shadow-blue-900/20',
  },
  {
    icon: FileCheck2,
    label: 'Check Request',
    sublabel: 'Site Inspection',
    desc: 'Contractor submits a check request citing BOQ item, requested quantity, location, and evidence.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    glow: 'shadow-sky-900/20',
  },
  {
    icon: Camera,
    label: 'Evidence',
    sublabel: 'Site Documentation',
    desc: 'Photos, PDFs and inspection reports uploaded and linked to the check request for AI verification.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'shadow-violet-900/20',
  },
  {
    icon: Ruler,
    label: 'Measurement',
    sublabel: 'Quantity Verification',
    desc: 'Site measurements are recorded and cross-checked against BOQ quantities, flagging any overruns.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'shadow-amber-900/20',
  },
  {
    icon: GitPullRequest,
    label: 'Variation',
    sublabel: 'Change Orders',
    desc: 'Scope changes raised as variations with justification, AI risk analysis, and QS approval workflow.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    glow: 'shadow-orange-900/20',
  },
  {
    icon: Receipt,
    label: 'IPC',
    sublabel: 'Interim Payment Cert.',
    desc: 'AI-generated payment certificate consolidating all certified measurements, variations, and retention.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'shadow-purple-900/20',
  },
  {
    icon: CheckCircle,
    label: 'Approval',
    sublabel: 'Human Authorization',
    desc: 'Consultant / QS / Client reviews AI summary, AI findings, and applies final human approval authority.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-900/20',
  },
  {
    icon: CreditCard,
    label: 'Payment',
    sublabel: 'Certified & Released',
    desc: 'Net payable calculated with retention, discounts applied, and payment certificate issued for disbursement.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    glow: 'shadow-teal-900/20',
  },
];

function WorkflowStep({
  step,
  index,
  isLast,
}: {
  step: typeof WORKFLOW_STEPS[0];
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const Icon = step.icon;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.06, ease: 'easeOut' }}
        className={`relative w-full max-w-[140px] sm:max-w-[160px] rounded-2xl p-4 border ${step.border} ${step.bg} shadow-lg ${step.glow} backdrop-blur-sm`}
      >
        <div className={`w-10 h-10 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center mb-3 mx-auto`}>
          <Icon className={`w-5 h-5 ${step.color}`} />
        </div>
        <div className={`text-sm font-bold ${step.color} text-center leading-tight`}>{step.label}</div>
        <div className="text-[10px] text-slate-500 text-center font-medium mt-0.5">{step.sublabel}</div>

        {/* Step number */}
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400">
          {index + 1}
        </div>
      </motion.div>

      {/* Arrow connector */}
      {!isLast && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={inView ? { opacity: 1, scaleY: 1 } : {}}
          transition={{ duration: 0.3, delay: index * 0.06 + 0.3, ease: 'easeOut' }}
          className="flex flex-col items-center py-1 origin-top"
          aria-hidden="true"
        >
          <div className="w-px h-4 bg-gradient-to-b from-slate-600 to-slate-700" />
          <ArrowDown className="w-3 h-3 text-slate-600" />
        </motion.div>
      )}
    </div>
  );
}

function DesktopWorkflowStep({ step, index }: { step: typeof WORKFLOW_STEPS[0]; index: number }) {
  const Icon = step.icon;
  const ref = useRef<HTMLDivElement>(null);
  const inV = useInView(ref, { once: true, margin: '-60px' });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inV ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      className={`relative rounded-2xl p-5 border ${step.border} ${step.bg} m-2 backdrop-blur-sm shadow-lg`}
    >
      <div className={`w-10 h-10 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${step.color}`} />
      </div>
      <div className={`text-sm font-bold ${step.color} leading-tight`}>{step.label}</div>
      <div className="text-[10px] text-slate-500 font-medium mt-0.5 mb-2">{step.sublabel}</div>
      <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
      <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
        {index + 1}
      </div>
    </motion.div>
  );
}

export function WorkflowSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: '-60px' });

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" aria-label="Construction workflow">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        <div className="absolute inset-0 bg-[#0a0e1a]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="workflow-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#workflow-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4"
          >
            Construction Workflow
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-50 mb-4 tracking-tight"
          >
            Every Stage. <span className="gradient-text-amber">Every Check.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto"
          >
            BuildPay AI manages the full construction payment lifecycle — from the initial BOQ to
            the final certified payment certificate.
          </motion.p>
        </div>

        {/* Workflow steps — 4 columns on desktop, 2 on tablet, 1 on mobile with connecting arrows */}
        <div className="hidden lg:grid grid-cols-4 gap-0 items-start relative">
          {/* Horizontal connector line behind cards */}
          <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-teal-500/30 pointer-events-none" aria-hidden="true" />

          {WORKFLOW_STEPS.map((step, i) => (
            <DesktopWorkflowStep key={step.label} step={step} index={i} />
          ))}
        </div>

        {/* Mobile / tablet: vertical list */}
        <div className="flex flex-col items-center lg:hidden">
          {WORKFLOW_STEPS.map((step, i) => (
            <WorkflowStep
              key={step.label}
              step={step}
              index={i}
              isLast={i === WORKFLOW_STEPS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
