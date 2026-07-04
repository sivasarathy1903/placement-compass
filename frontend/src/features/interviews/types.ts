// ─── Interview Round TypeScript types ───────────────────────────────────────

export type InterviewRoundType =
  | 'RESUME_SHORTLIST'
  | 'ONLINE_ASSESSMENT'
  | 'APTITUDE_TEST'
  | 'GROUP_DISCUSSION'
  | 'TECHNICAL'
  | 'SYSTEM_DESIGN'
  | 'MANAGERIAL'
  | 'HR'
  | 'OTHER';

export type InterviewRoundOutcome =
  | 'PENDING'
  | 'PASSED'
  | 'FAILED'
  | 'ON_HOLD';

export interface InterviewRound {
  roundId: string;
  roundNumber: number;
  type: InterviewRoundType;
  outcome: InterviewRoundOutcome;
  scheduledAt?: string;        // ISO datetime from backend
  durationMinutes?: number;
  interviewer?: string;
  platform?: string;
  notes?: string;
}

export interface CreateRoundPayload {
  roundNumber: number;
  type: InterviewRoundType;
  outcome?: InterviewRoundOutcome;
  scheduledAt?: string;
  durationMinutes?: number;
  interviewer?: string;
  platform?: string;
  notes?: string;
}

export type UpdateRoundPayload = Partial<CreateRoundPayload>;

// ─── Display helpers ─────────────────────────────────────────────────────────

export const ROUND_TYPE_LABELS: Record<InterviewRoundType, string> = {
  RESUME_SHORTLIST:  'Resume Shortlist',
  ONLINE_ASSESSMENT: 'Online Assessment',
  APTITUDE_TEST:     'Aptitude Test',
  GROUP_DISCUSSION:  'Group Discussion',
  TECHNICAL:         'Technical Interview',
  SYSTEM_DESIGN:     'System Design',
  MANAGERIAL:        'Managerial Round',
  HR:                'HR Interview',
  OTHER:             'Other',
};

export const ROUND_TYPE_COLORS: Record<InterviewRoundType, string> = {
  RESUME_SHORTLIST:  'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  ONLINE_ASSESSMENT: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  APTITUDE_TEST:     'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  GROUP_DISCUSSION:  'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  TECHNICAL:         'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  SYSTEM_DESIGN:     'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  MANAGERIAL:        'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  HR:                'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  OTHER:             'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
};

export const OUTCOME_CONFIG: Record<
  InterviewRoundOutcome,
  { label: string; badge: string; dot: string; glow: string }
> = {
  PENDING: {
    label: 'Pending',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    dot:   '#f59e0b',
    glow:  'shadow-amber-400/20',
  },
  PASSED: {
    label: 'Passed',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    dot:   '#10b981',
    glow:  'shadow-emerald-400/20',
  },
  FAILED: {
    label: 'Failed',
    badge: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
    dot:   '#f43f5e',
    glow:  'shadow-red-400/20',
  },
  ON_HOLD: {
    label: 'On Hold',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    dot:   '#3b82f6',
    glow:  'shadow-blue-400/20',
  },
};

export const ALL_ROUND_TYPES: InterviewRoundType[] = [
  'RESUME_SHORTLIST', 'ONLINE_ASSESSMENT', 'APTITUDE_TEST', 'GROUP_DISCUSSION',
  'TECHNICAL', 'SYSTEM_DESIGN', 'MANAGERIAL', 'HR', 'OTHER',
];

export const ALL_OUTCOMES: InterviewRoundOutcome[] = [
  'PENDING', 'PASSED', 'FAILED', 'ON_HOLD',
];
