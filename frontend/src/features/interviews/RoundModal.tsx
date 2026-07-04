import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { InterviewRound, CreateRoundPayload } from './types';
import {
  ALL_ROUND_TYPES,
  ALL_OUTCOMES,
  ROUND_TYPE_LABELS,
  OUTCOME_CONFIG,
} from './types';

interface RoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRoundPayload) => Promise<boolean>;
  initial?: InterviewRound | null;  // null = create mode, InterviewRound = edit mode
  defaultRoundNumber?: number;
}

const emptyForm = (): CreateRoundPayload => ({
  roundNumber: 1,
  type: 'TECHNICAL',
  outcome: 'PENDING',
  scheduledAt: '',
  durationMinutes: undefined,
  interviewer: '',
  platform: '',
  notes: '',
});

/**
 * RoundModal — create / edit an interview round.
 * Glassmorphism style consistent with ApplicationModal.tsx.
 */
const RoundModal: React.FC<RoundModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initial,
  defaultRoundNumber = 1,
}) => {
  const [form, setForm] = useState<CreateRoundPayload>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateRoundPayload, string>>>({});

  // Populate form when editing
  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setForm({
        roundNumber:     initial.roundNumber,
        type:            initial.type,
        outcome:         initial.outcome,
        scheduledAt:     initial.scheduledAt
          ? initial.scheduledAt.slice(0, 16)  // trim seconds for datetime-local input
          : '',
        durationMinutes: initial.durationMinutes,
        interviewer:     initial.interviewer ?? '',
        platform:        initial.platform ?? '',
        notes:           initial.notes ?? '',
      });
    } else {
      setForm({ ...emptyForm(), roundNumber: defaultRoundNumber });
    }
    setErrors({});
  }, [isOpen, initial, defaultRoundNumber]);

  const set = <K extends keyof CreateRoundPayload>(key: K, val: CreateRoundPayload[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof CreateRoundPayload, string>> = {};
    if (!form.roundNumber || form.roundNumber < 1) e.roundNumber = 'Must be ≥ 1';
    if (!form.type) e.type = 'Required';
    if (form.durationMinutes !== undefined && form.durationMinutes < 1)
      e.durationMinutes = 'Must be ≥ 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const payload: CreateRoundPayload = {
      roundNumber:     form.roundNumber,
      type:            form.type,
      outcome:         form.outcome || 'PENDING',
      scheduledAt:     form.scheduledAt || undefined,
      durationMinutes: form.durationMinutes || undefined,
      interviewer:     form.interviewer || undefined,
      platform:        form.platform || undefined,
      notes:           form.notes || undefined,
    };

    const ok = await onSubmit(payload);
    setSaving(false);
    if (ok) onClose();
  };

  const inputCls =
    'w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition';
  const labelCls = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1';
  const errorCls = 'text-xs text-red-500 mt-1';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 16  }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                {initial ? 'Edit Interview Round' : 'Add Interview Round'}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Row: Round # + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Round Number *</label>
                  <input
                    type="number"
                    min={1}
                    value={form.roundNumber}
                    onChange={e => set('roundNumber', parseInt(e.target.value) || 1)}
                    className={inputCls}
                  />
                  {errors.roundNumber && <p className={errorCls}>{errors.roundNumber}</p>}
                </div>
                <div>
                  <label className={labelCls}>Round Type *</label>
                  <select
                    value={form.type}
                    onChange={e => set('type', e.target.value as CreateRoundPayload['type'])}
                    className={inputCls}
                  >
                    {ALL_ROUND_TYPES.map(t => (
                      <option key={t} value={t}>{ROUND_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                  {errors.type && <p className={errorCls}>{errors.type}</p>}
                </div>
              </div>

              {/* Outcome */}
              <div>
                <label className={labelCls}>Outcome</label>
                <select
                  value={form.outcome}
                  onChange={e => set('outcome', e.target.value as CreateRoundPayload['outcome'])}
                  className={inputCls}
                >
                  {ALL_OUTCOMES.map(o => (
                    <option key={o} value={o}>{OUTCOME_CONFIG[o].label}</option>
                  ))}
                </select>
              </div>

              {/* Row: Scheduled At + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Scheduled At</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt ?? ''}
                    onChange={e => set('scheduledAt', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Duration (min)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 60"
                    value={form.durationMinutes ?? ''}
                    onChange={e =>
                      set('durationMinutes', e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className={inputCls}
                  />
                  {errors.durationMinutes && <p className={errorCls}>{errors.durationMinutes}</p>}
                </div>
              </div>

              {/* Row: Interviewer + Platform */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Interviewer</label>
                  <input
                    type="text"
                    placeholder="Priya Sharma"
                    value={form.interviewer ?? ''}
                    onChange={e => set('interviewer', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Platform</label>
                  <input
                    type="text"
                    placeholder="Zoom, Google Meet…"
                    value={form.platform ?? ''}
                    onChange={e => set('platform', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes / Prep Topics</label>
                <textarea
                  rows={3}
                  placeholder="Topics covered, feedback received, prep reminders…"
                  value={form.notes ?? ''}
                  onChange={e => set('notes', e.target.value)}
                  className={`${inputCls} resize-none`}
                  maxLength={2000}
                />
                <p className="text-xs text-zinc-400 mt-1 text-right">
                  {(form.notes ?? '').length}/2000
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Round'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoundModal;
