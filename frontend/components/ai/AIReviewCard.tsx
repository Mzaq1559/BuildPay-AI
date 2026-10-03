import React from 'react';
import { AIReview, AIFinding } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Bot, AlertTriangle, CheckCircle2, Info, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

interface AIReviewCardProps {
  review?: AIReview | null;
  onTriggerReview?: () => void;
  isLoading?: boolean;
}

export const AIReviewCard: React.FC<AIReviewCardProps> = ({
  review,
  onTriggerReview,
  isLoading = false,
}) => {
  if (!review) {
    return (
      <div className="ai-glass-card rounded-xl p-6 border border-purple-500/20 text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-purple-500/15 rounded-full border border-purple-500/30 text-purple-300">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-purple-200">AI Multi-Agent Compliance Audit</h3>
          <p className="text-sm text-slate-400 max-w-md">
            Trigger BuildPay AI multi-agent pipeline to verify BOQ quantities, documents, variation risks, and historical duplicates.
          </p>
          {onTriggerReview && (
            <button
              onClick={onTriggerReview}
              disabled={isLoading}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              {isLoading ? 'Running Multi-Agent Audit...' : 'Run BuildPay AI Audit'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'pass':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="ai-glass-card rounded-xl p-6 border border-purple-500/30 relative overflow-hidden space-y-5">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 rounded-lg border border-purple-400/30 text-purple-300">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">BuildPay AI Multi-Agent Audit</h3>
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/30 font-mono">
                9 Agents
              </span>
            </div>
            <p className="text-xs text-purple-300/70">
              Audited on {new Date(review.reviewed_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Confidence Score</div>
            <div className="text-lg font-bold font-mono text-purple-300">
              {(review.overall_confidence * 100).toFixed(0)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Risk Assessment</div>
            <div className="text-lg font-bold font-mono text-rose-400">
              {(review.risk_score * 100).toFixed(0)} / 100
            </div>
          </div>
          <StatusBadge status={review.overall_status} size="lg" />
        </div>
      </div>

      {/* Human override note */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-medium">
        <UserCheck className="w-4 h-4 shrink-0 text-amber-400" />
        <span>
          <strong>Human-in-the-Loop Required:</strong> AI findings provide advisory project control evidence. Final approval authority rests exclusively with human QS / Consultant / Client roles.
        </span>
      </div>

      {/* Summary */}
      {review.summary_text && (
        <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-sm text-slate-300 leading-relaxed">
          {review.summary_text}
        </div>
      )}

      {/* Agent Findings */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Specialized Agent Findings ({review.findings.length})
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {review.findings.map((finding: AIFinding) => (
            <div
              key={finding.id}
              className="p-4 rounded-lg bg-slate-900/80 border border-purple-500/15 hover:border-purple-500/30 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(finding.severity)}
                  <span className="text-sm font-semibold text-slate-200">{finding.title}</span>
                  <span className="text-xs text-purple-400/80 bg-purple-950/60 px-2 py-0.5 rounded font-mono">
                    {finding.agent_name}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {(finding.confidence_score * 100).toFixed(0)}% conf
                </span>
              </div>

              <p className="text-xs text-slate-300">{finding.finding}</p>

              {finding.evidence_citation && (
                <div className="text-xs text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-800/80 font-mono">
                  <span className="text-purple-400 font-semibold">Evidence:</span> {finding.evidence_citation}
                </div>
              )}

              {finding.recommendation && (
                <div className="text-xs text-emerald-400/90 font-medium">
                  <strong>Recommendation:</strong> {finding.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
