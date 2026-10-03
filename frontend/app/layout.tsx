import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'BuildPay AI — AI-Powered Construction Project Controls',
  description:
    'From BOQs and check requests to measurements, variations and payment certificates — BuildPay AI prepares, checks, calculates and flags. Humans authorize.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 min-h-screen selection:bg-amber-500/30 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
