import React from 'react';
import type { ProjectStage } from '../../core/types';
import { Rocket, Code, Coins, BarChart, Globe, Folder } from 'lucide-react';

interface StageBadgeProps {
  stage?: ProjectStage;
  className?: string;
  size?: 'sm' | 'md';
}

const STAGE_CONFIG: Record<
  ProjectStage,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  distribution: {
    label: 'Distribution',
    icon: Rocket,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  development: {
    label: 'Development',
    icon: Code,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20'
  },
  monetization: {
    label: 'Monetization',
    icon: Coins,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20'
  },
  analytics: {
    label: 'Analytics',
    icon: BarChart,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20'
  },
  web: {
    label: 'Web & Legal',
    icon: Globe,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20'
  },
  other: {
    label: 'General',
    icon: Folder,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20'
  }
};

export const StageBadge: React.FC<StageBadgeProps> = ({ stage = 'other', className = '', size = 'sm' }) => {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.other;
  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 11 : 13;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium border ${padding} ${config.bg} ${config.border} ${config.color} ${className}`}
    >
      <Icon size={iconSize} />
      <span>{config.label}</span>
    </span>
  );
};
