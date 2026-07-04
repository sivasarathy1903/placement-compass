import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { applicationService } from '../applications/applicationService';
import type { Application } from '../applications/applicationService';
import { useInterviews } from './useInterviews';
import type { InterviewRound } from './types';
import RoundCard from './RoundCard';
import RoundModal from './RoundModal';
import type { CreateRoundPayload } from './types';

// ─── Status colour helpers (mirrors applicationService types) ─────────────────
const STATUS_DOT: Record<string, string> = {
  APPLIED:   '#8b5cf6',
  OA:        '#06b6d4',
  INTERVIEW: '#f59e0b',
  OFFER:     '#10b981',
  REJECTED:  '#f43f5e',
  WITHDRAWN: '#a1a1aa',
};
const STATUS_LABEL: Record<string, string> = {
  APPLIED:   'Applied',
  OA:        'OA',
  INTERVIEW: 'Interview',
  OFFER:     'Offer',
  REJECTED:  'Rejected',
  WITHDRAWN: 'Withdrawn',
};

// ─── Summary bar helpers ──────────────────────────────────────────────────────
const countByOutcome = (rounds: InterviewRound[], outcome: string) =>
  rounds.filter(r => r.outcome === outcome).length;

/**
 * InterviewTimeline — the main Phase 6 page at /interviews.
 *
 * Layout:
 *   Left panel  → Application picker (search + scrollable list)
 *   Right panel → Vertical timeline of rounds for the selected application
 *
 * Features:
 *   - Search applications by company name or role
 *   - Animated round cards with outcome-coloured connector dots
 *   - Add / Edit / Delete rounds via modal
 *   - Summary progress bar (Passed / Pending / Failed / On Hold)
 */
const InterviewTimeline: React.FC = () => {
  // ── Application list state ──────────────────────────────────────
  const [apps, setApps] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // ── Interview rounds state (from hook) ──────────────────────────
  const { rounds, loading: roundsLoading, fetchRounds, addRound, updateRound, deleteRound } =
    useInterviews();

  // ── Modal state ─────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<InterviewRound | null>(null);

  // ── Load all applications once ──────────────────────────────────
  useEffect(() => {
    const loadApps = async () => {
      try {
        const pages = await applicationService.getAll({ size: 200, sortBy: 'companyName', direction: 'asc' });
        setApps(pages.content);
      } catch {
        // handled silently — empty list shown
      } finally {
        setAppsLoading(false);
      }
    };
    loadApps();
  }, []);

  // ── Fetch rounds when selected app changes ──────────────────────
  useEffect(() => {
    if (selectedApp) fetchRounds(selectedApp.id);
  }, [selectedApp, fetchRounds]);

  // ── Filtered app list ───────────────────────────────────────────
  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(
      a =>
        a.companyName.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q),
    );
  }, [apps, search]);

  // ── Progress summary ────────────────────────────────────────────
  const summary = useMemo(() => ({
    total:   rounds.length,
    passed:  countByOutcome(rounds, 'PASSED'),
    failed:  countByOutcome(rounds, 'FAILED'),
    onHold:  countByOutcome(rounds, 'ON_HOLD'),
    pending: countByOutcome(rounds, 'PENDING'),
  }), [rounds]);

  // ── Modal handlers ──────────────────────────────────────────────
  const openAdd = () => {
    setEditingRound(null);
    setModalOpen(true);
  };

  const openEdit = (round: InterviewRound) => {
    setEditingRound(round);
    setModalOpen(true);
  };

  const handleModalSubmit = async (payload: CreateRoundPayload): Promise<boolean> => {
    if (!selectedApp) return false;
    if (editingRound) {
      return updateRound(selectedApp.id, editingRound.roundId, payload);
    }
    return addRound(selectedApp.id, payload);
  };

  const handleDelete = async (roundId: string) => {
    if (!selectedApp) return;
    if (!window.confirm('Delete this interview round?')) return;
    await deleteRound(selectedApp.id, roundId);
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="flex h-full gap-0 overflow-hidden">
      {/* ════════════════════ LEFT: Application Picker ════════════════════ */}
      <aside className="w-72 shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
            Select Application
          </h2>
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search company or role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>
        </div>

        {/* App list */}
        <div className="flex-1 overflow-y-auto py-2">
          {appsLoading ? (
            <div className="flex flex-col gap-2 px-4 pt-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center mt-8 px-4">
              {search ? 'No matches found.' : 'No applications yet.'}
            </p>
          ) : (
            filteredApps.map(app => {
              const isActive = selectedApp?.id === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/50 border-r-2 border-brand-600'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: STATUS_DOT[app.status] ?? '#a1a1aa' }}
                  >
                    {app.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-zinc-900 dark:text-white'}`}>
                      {app.companyName}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">{app.role}</p>
                    <span className="inline-flex items-center gap-1 mt-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: STATUS_DOT[app.status] }}
                      />
                      <span className="text-[10px] text-zinc-400">{STATUS_LABEL[app.status]}</span>
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ════════════════════ RIGHT: Timeline Panel ════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {!selectedApp ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center">
              <CalendarDaysIcon className="w-8 h-8 text-brand-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-800 dark:text-white">
                Select an Application
              </h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-xs">
                Pick a job application from the left panel to view and manage its interview rounds.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ── Panel header ── */}
            <div className="px-6 pt-5 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: STATUS_DOT[selectedApp.status] }}
                >
                  {selectedApp.companyName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                    {selectedApp.companyName}
                  </h1>
                  <p className="text-xs text-zinc-400 truncate">{selectedApp.role}</p>
                </div>
              </div>

              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition shrink-0"
              >
                <PlusIcon className="w-4 h-4" />
                Add Round
              </button>
            </div>

            {/* ── Progress summary bar ── */}
            {rounds.length > 0 && (
              <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center gap-4">
                {/* Stacked bar */}
                <div className="flex-1 min-w-[120px] h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                  {summary.passed  > 0 && <div className="h-full bg-emerald-500" style={{ width: `${(summary.passed  / summary.total) * 100}%` }} />}
                  {summary.pending > 0 && <div className="h-full bg-amber-400"   style={{ width: `${(summary.pending / summary.total) * 100}%` }} />}
                  {summary.onHold  > 0 && <div className="h-full bg-blue-400"    style={{ width: `${(summary.onHold  / summary.total) * 100}%` }} />}
                  {summary.failed  > 0 && <div className="h-full bg-red-500"     style={{ width: `${(summary.failed  / summary.total) * 100}%` }} />}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {(
                    [
                      { label: 'Passed',  count: summary.passed,  color: '#10b981' },
                      { label: 'Pending', count: summary.pending, color: '#f59e0b' },
                      { label: 'On Hold', count: summary.onHold,  color: '#3b82f6' },
                      { label: 'Failed',  count: summary.failed,  color: '#f43f5e' },
                    ] as const
                  ).map(item =>
                    item.count > 0 ? (
                      <span key={item.label} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        {item.count} {item.label}
                      </span>
                    ) : null
                  )}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {summary.total} total
                  </span>
                </div>
              </div>
            )}

            {/* ── Timeline body ── */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {roundsLoading ? (
                <div className="flex flex-col gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse shrink-0" />
                      <div className="flex-1 h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : rounds.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <CalendarDaysIcon className="w-7 h-7 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      No interview rounds yet
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Click <strong>Add Round</strong> to track your first interview.
                    </p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.07 } },
                  }}
                >
                  {rounds.map((round, idx) => (
                    <motion.div
                      key={round.roundId}
                      variants={{
                        hidden:  { opacity: 0, x: -16 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                      }}
                    >
                      <RoundCard
                        round={round}
                        isLast={idx === rounds.length - 1}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Round Modal ── */}
      <RoundModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initial={editingRound}
        defaultRoundNumber={rounds.length + 1}
      />
    </div>
  );
};

export default InterviewTimeline;
