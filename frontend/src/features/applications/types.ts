// Shared application status type — used by service, hooks, and components.
export type ApplicationStatus =
  | 'APPLIED'
  | 'OA'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED:   'Applied',
  OA:        'Online Assessment',
  INTERVIEW: 'Interview',
  OFFER:     'Offer',
  REJECTED:  'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const STATUS_COLORS: Record<ApplicationStatus, { badge: string; dot: string }> = {
  APPLIED:   { badge: 'bg-brand-50   text-brand-700  dark:bg-brand-950  dark:text-brand-300',  dot: '#8b5cf6' },
  OA:        { badge: 'bg-cyan-50    text-cyan-700   dark:bg-cyan-950   dark:text-cyan-300',    dot: '#06b6d4' },
  INTERVIEW: { badge: 'bg-amber-50   text-amber-700  dark:bg-amber-950  dark:text-amber-300',   dot: '#f59e0b' },
  OFFER:     { badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', dot: '#10b981' },
  REJECTED:  { badge: 'bg-red-50     text-red-700    dark:bg-red-950    dark:text-red-300',      dot: '#f43f5e' },
  WITHDRAWN: { badge: 'bg-zinc-100   text-zinc-500   dark:bg-zinc-800   dark:text-zinc-400',     dot: '#a1a1aa' },
};

export const ALL_STATUSES: ApplicationStatus[] = [
  'APPLIED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN',
];
