import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return "-";
  return score.toString();
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'beginner': case 'low': case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'intermediate': case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'advanced': case 'high': case 'hard': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'passed': case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'pending': case 'open': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'in-progress': case 'evaluated': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'failed': case 'wont-fix': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}
