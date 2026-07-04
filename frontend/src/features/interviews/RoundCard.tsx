import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { InterviewRound } from './types';
import {
  ROUND_TYPE_LABELS,
  ROUND_TYPE_COLORS,
  OUTCOME_CONFIG,
} from './types';

interface RoundCardProps {
  round: InterviewRound;
  isLast: boolean;
  onEdit: (round: InterviewRound) => void;
  onDelete: (roundId: string) => void;
}

/** Format ISO datetime string to a readable local string. */
const formatDate = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * RoundCard — a single node in the interview timeline.
 *
 * Visual structure:
 *   [numbered dot] ─── [card]
 *         |
 *      [line to next]
 */
const RoundCard: React.FC<RoundCardProps> = ({ round, isLast, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const outcome = OUTCOME_CONFIG[round.outcome];

  return (
    <div className="relative flex gap-5">
      {/* ── Timeline column ── */}
      <div className="flex flex-col items-center">
        {/* Numbered circle */}
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full border-2 text-xs font-bold shrink-0 z-10"
          style={{ borderColor: outcome.dot, color: outcome.dot, background: 'transparent' }}
        >
          {round.roundNumber}
        </div>
        {/* Connector line (hidden for last item) */}
        {!isLast && (
          <div className="w-0.5 flex-1 mt-1 mb-0 bg-zinc-200 dark:bg-zinc-700 min-h-[24px]" />
        )}
      </div>

      {/* ── Card ── */}
      <motion.div
        layout
        className="flex-1 mb-6 rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        {/* Card header row */}
        <div className="flex items-start justify-between px-4 py-3 gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            {/* Type + outcome badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROUND_TYPE_COLORS[round.type]}`}>
                {ROUND_TYPE_LABELS[round.type]}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${outcome.badge}`}>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: outcome.dot }}
                />
                {outcome.label}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              {round.scheduledAt && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {formatDate(round.scheduledAt)}
                  {round.durationMinutes && (
                    <span className="text-zinc-400">· {round.durationMinutes} min</span>
                  )}
                </span>
              )}
              {round.interviewer && (
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5" />
                  {round.interviewer}
                </span>
              )}
              {round.platform && (
                <span className="flex items-center gap-1">
                  <ComputerDesktopIcon className="w-3.5 h-3.5" />
                  {round.platform}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {round.notes && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Toggle notes"
              >
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDownIcon className="w-4 h-4" />
                </motion.div>
              </button>
            )}
            <button
              onClick={() => onEdit(round)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Edit round"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(round.roundId)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition"
              title="Delete round"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable notes */}
        <AnimatePresence initial={false}>
          {expanded && round.notes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{   height: 0,    opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-start gap-2">
                  <DocumentTextIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-400" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {round.notes}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RoundCard;
