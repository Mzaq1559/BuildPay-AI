'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  HardHat, FileSpreadsheet, Calculator, Building2, Briefcase, ShieldCheck,
} from 'lucide-react';

const ROLES = [
  {
    icon: HardHat,
    title: 'Contractor',
    org: 'Raza Construction Co.',
    desc: 'Submit check requests, record site measurements, raise variation orders, and track payment certifications for completed work.',
    capabilities: ['Submit Check Requests', 'Record Measurements', 'Raise Variations', 'Track IPC Status'],
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'hover:shadow-amber-900/20',
  },
  {
    icon: FileSpreadsheet,
    title: 'Consultant',
    org: 'NEC Engineers',
    desc: 'Review AI-generated compliance reports, verify check request evidence, and authorize measurement certifications.',
    capabilities: ['Review AI Reports', 'Verify Evidence', 'Certify Measurements', 'Approve Check Requests'],
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    glow: 'hover:shadow-sky-900/20',
  },
  {
    icon: Calculator,
    title: 'Quantity Surveyor',
    org: 'Quantity Surveys Ltd.',
    desc: 'Analyze BOQ quantities, validate variation claims, assess financial impact, and prepare interim payment certificates.',
    capabilities: ['Analyze BOQ Data', 'Validate Variations', 'Prepare IPCs', 'Financial Verification'],
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'hover:shadow-violet-900/20',
  },
  {
    icon: Building2,
    title: 'Client',
    org: 'DHA Lahore',
    desc: 'Receive AI-summarized payment reports, review risk flags, and apply final authorization to payment certificates.',
    capabilities: ['Review IPC Summaries', 'Authorize Payments', 'Review Risk Flags', 'Portfolio Oversight'],
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'hover:shadow-emerald-900/20',
  },
  {
    icon: Briefcase,
    title: 'Project Manager',
    org: 'Bahria Town',
    desc: 'Monitor overall project progress, track budget spend against BOQ, and coordinate approvals across project stakeholders.',
    capabilities: ['Monitor Progress', 'Budget Tracking', 'Coordinate Approvals', 'Performance Reports'],
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'hover:shadow-blue-900/20',
  },
  {
    icon: ShieldCheck,
    title: 'Admin',
    org: 'BuildPay AI',
    desc: 'Configure project settings, manage user roles, seed BOQ templates, and oversee the AI agent pipeline configuration.',
    capabilities: ['Project Configuration', 'User Management', 'BOQ Templates', 'Audit Trail Access'],
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    glow: 'hover:shadow-rose-900/20',
  },
];

function RoleCard({
  role,
  index,
  isSelected,
  onSelect,
}: {
  role: typeof ROLES[0];
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = role.icon;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 shadow-lg ${role.glow} hover:shadow-xl ${
        isSelected
          ? `${role.bg} ${role.border} scale-[1.02]`
          : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700/80'
      }`}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${role.bg} border ${role.border} shrink-0`}>
          <Icon className={`w-5 h-5 ${role.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-sm ${isSelected ? role.color : 'text-slate-200'} transition-colors`}>
            {role.title}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{role.org}</div>
        </div>
      </div>

      {/* Expanded capabilities */}
      <motion.div
        initial={false}
        animate={{ height: isSelected ? 'auto' : 0, opacity: isSelected ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <div className="pt-4 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">{role.desc}</p>
          <div className="space-y-1.5">
            {role.capabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-2 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${role.color.replace('text-', 'bg-')} shrink-0`} />
                <span className="text-slate-300">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function RolesSection() {
  const [selectedRole, setSelectedRole] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden"
      aria-label="User roles"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        <div className="absolute inset-0 bg-[#080c14]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs font-semibold mb-4"
          >
            Built for Every Project Role
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-50 tracking-tight"
          >
            One Platform.
            <br />
            <span className="gradient-text-construction">Every Stakeholder.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 mt-4 max-w-xl mx-auto text-base"
          >
            Click a role to explore its specific capabilities within the BuildPay AI platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map((role, i) => (
            <RoleCard
              key={role.title}
              role={role}
              index={i}
              isSelected={selectedRole === i}
              onSelect={() => setSelectedRole(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
