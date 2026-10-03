import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  const getStyle = () => {
    switch (normalized) {
      case 'approved':
      case 'certified':
      case 'paid':
      case 'verified':
      case 'active':
      case 'pass':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'submitted':
      case 'under_review':
      case 'human_review':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'ai_review':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30 animate-pulse';
      case 'returned':
      case 'warning':
      case 'on_hold':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'rejected':
      case 'cancelled':
      case 'disputed':
      case 'critical':
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'draft':
      case 'planning':
      case 'info':
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-sm transition-colors ${getStyle()} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {formatText(status)}
    </span>
  );
};
