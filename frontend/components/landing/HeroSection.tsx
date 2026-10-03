'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

// Animated blueprint grid background
function BlueprintGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Primary grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid-sm" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
          </pattern>
          <pattern id="hero-grid-lg" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#60a5fa" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid-sm)" />
        <rect width="100%" height="100%" fill="url(#hero-grid-lg)" />
      </svg>

      {/* Measurement annotations — engineering drawing style */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        {/* Horizontal dimension lines */}
        <line x1="5%" y1="30%" x2="40%" y2="30%" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 2"/>
        <line x1="5%" y1="30%" x2="5%" y2="28%" stroke="#f59e0b" strokeWidth="0.5"/>
        <line x1="40%" y1="30%" x2="40%" y2="28%" stroke="#f59e0b" strokeWidth="0.5"/>
        <line x1="60%" y1="70%" x2="95%" y2="70%" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 2"/>
        <line x1="60%" y1="70%" x2="60%" y2="72%" stroke="#f59e0b" strokeWidth="0.5"/>
        <line x1="95%" y1="70%" x2="95%" y2="72%" stroke="#f59e0b" strokeWidth="0.5"/>
        {/* Vertical dimension lines */}
        <line x1="8%" y1="15%" x2="8%" y2="65%" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 2"/>
        <line x1="6%" y1="15%" x2="10%" y2="15%" stroke="#f59e0b" strokeWidth="0.5"/>
        <line x1="6%" y1="65%" x2="10%" y2="65%" stroke="#f59e0b" strokeWidth="0.5"/>
      </svg>

      {/* Ambient glow orbs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-amber-500/6 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
    </div>
  );
}

// Floating BOQ data panel
function BOQPanel() {
  const boqItems = [
    { code: 'GS-001', desc: 'RCC Foundation', qty: '248.5 m³', rate: '₹18,500', amount: '₹4.6M', pct: 78 },
    { code: 'GS-012', desc: 'Brick Masonry', qty: '185.2 m³', rate: '₹12,200', amount: '₹2.3M', pct: 52 },
    { code: 'GS-023', desc: 'Reinforcement Steel', qty: '12,450 kg', rate: '₹185', amount: '₹2.3M', pct: 91 },
    { code: 'FN-004', desc: 'Floor Tiling', qty: '320 m²', rate: '₹950', amount: '₹0.3M', pct: 35 },
  ];

  return (
    <div className="landing-glass rounded-2xl overflow-hidden border-glow-blue w-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-slate-300 font-mono">BOQ Register — 5 Marla Double Storey</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">DHA-P8-2024-001</span>
      </div>
      {/* Column headers */}
      <div className="grid grid-cols-5 px-4 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/40">
        <span>Code</span><span className="col-span-2">Description</span><span className="text-right">Amount</span><span className="text-right">Progress</span>
      </div>
      {/* Items */}
      <div className="divide-y divide-slate-800/30">
        {boqItems.map((item, i) => (
          <div key={item.code} className="grid grid-cols-5 items-center px-4 py-2.5 hover:bg-slate-800/20 transition-colors">
            <span className="text-[10px] font-mono text-blue-400">{item.code}</span>
            <span className="col-span-2 text-xs text-slate-200 truncate pr-2">{item.desc}</span>
            <span className="text-right text-[11px] font-mono text-slate-300">{item.amount}</span>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] font-mono ${item.pct >= 80 ? 'text-emerald-400' : item.pct >= 50 ? 'text-amber-400' : 'text-slate-400'}`}>{item.pct}%</span>
              <div className="w-full bg-slate-800 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all ${item.pct >= 80 ? 'bg-emerald-400' : item.pct >= 50 ? 'bg-amber-400' : 'bg-blue-400'}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/60 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] text-purple-300 font-medium">AI Review: 2 flags detected</span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-200">Total: PKR 17.75M</span>
      </div>
    </div>
  );
}

// Floating AI finding card
function AIFindingCard() {
  return (
    <div className="landing-glass-amber rounded-xl p-4 border-glow-amber">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-amber-500/20 rounded-lg shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-300">Quantity Overrun Detected</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/20 font-mono">high</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            CR-009: Claimed 312.5 m³ vs BOQ-approved 248.5 m³ (+25.7%). Human review required before certification.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-purple-400 font-mono">QuantityAgent · 94% conf</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// IPC summary card
function IPCSummaryCard() {
  return (
    <div className="landing-glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">IPC #3 — Period Summary</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-semibold">Certified</span>
      </div>
      <div className="space-y-2">
        {[
          { label: 'Gross Amount', value: 'PKR 3.2M', color: 'text-slate-200' },
          { label: 'Retention (10%)', value: '− PKR 320K', color: 'text-rose-400' },
          { label: 'Net Payable', value: 'PKR 2.88M', color: 'text-emerald-400' },
        ].map((row) => (
          <div key={row.label} className="flex justify-between text-xs">
            <span className="text-slate-500">{row.label}</span>
            <span className={`font-mono font-semibold ${row.color}`}>{row.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[10px] text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Approved by: Col. (R) Tariq Mehmood · DHA Lahore
      </div>
    </div>
  );
}

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden"
      aria-label="Hero section"
    >
      <BlueprintGrid />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
        style={{ y, opacity }}
      >
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-16">
          {/* Left: Text content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              AI-Assisted Construction Project Controls
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            >
              <span className="text-slate-50">AI-Powered</span>
              <br />
              <span className="gradient-text-amber">Construction</span>
              <br />
              <span className="text-slate-50">Project Controls</span>
            </motion.h1>

            {/* Supporting copy */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8"
            >
              From BOQs and check requests to measurements, variations and payment certificates —{' '}
              <span className="text-slate-300">BuildPay AI prepares, checks, calculates and flags.</span>{' '}
              <span className="text-amber-400 font-semibold">Humans authorize.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-900/40 transition-all hover:shadow-amber-900/60 hover:scale-[1.03] active:scale-[0.98]"
              >
                Explore the Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 font-semibold text-sm border border-slate-700/60 hover:border-slate-600 transition-all backdrop-blur-sm"
              >
                Sign In
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={itemVariants} className="flex items-center gap-6 justify-center lg:justify-start mt-8">
              {[
                { label: 'BOQ Items Tracked', value: '12,000+' },
                { label: 'AI Compliance Checks', value: '9 Agents' },
                { label: 'Payment Accuracy', value: '99.4%' },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-lg font-black text-slate-100 leading-none">{stat.value}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Product UI panels */}
          <motion.div
            className="flex-1 w-full max-w-xl lg:max-w-none relative"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative">
              {/* Main BOQ panel */}
              <div className="animate-float-panel">
                <BOQPanel />
              </div>

              {/* AI finding card — overlapping, offset */}
              <motion.div
                className="absolute -bottom-6 -left-4 sm:-left-8 w-72 sm:w-80 animate-float-panel-delay"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <AIFindingCard />
              </motion.div>

              {/* IPC card — top-right */}
              <motion.div
                className="absolute -top-4 -right-4 sm:-right-6 w-56 sm:w-64"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              >
                <IPCSummaryCard />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080c14] to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        aria-hidden="true"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent"
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
