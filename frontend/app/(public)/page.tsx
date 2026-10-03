import React from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { WorkflowSection } from '@/components/landing/WorkflowSection';
import { AIPhilosophySection } from '@/components/landing/AIPhilosophySection';
import { RolesSection } from '@/components/landing/RolesSection';
import { ProductPreviewSection } from '@/components/landing/ProductPreviewSection';
import { HumanInLoopSection } from '@/components/landing/HumanInLoopSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-white">
      <LandingNav />
      <main>
        <HeroSection />
        <WorkflowSection />
        <AIPhilosophySection />
        <RolesSection />
        <ProductPreviewSection />
        <HumanInLoopSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
