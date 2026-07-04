import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { interviewService } from './interviewService';
import type { InterviewRound, CreateRoundPayload, UpdateRoundPayload } from './types';

/**
 * useInterviews — manages interview round state for a given applicationId.
 *
 * Usage:
 *   const { rounds, loading, fetchRounds, addRound, updateRound, deleteRound } =
 *     useInterviews();
 *
 * Call `fetchRounds(appId)` whenever the selected application changes.
 */
export function useInterviews() {
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────

  const fetchRounds = useCallback(async (appId: string) => {
    setLoading(true);
    try {
      const data = await interviewService.getRounds(appId);
      setRounds(data);
    } catch {
      toast.error('Failed to load interview rounds.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Add ────────────────────────────────────────────────────────

  const addRound = useCallback(
    async (appId: string, payload: CreateRoundPayload): Promise<boolean> => {
      try {
        const created = await interviewService.addRound(appId, payload);
        setRounds(prev =>
          [...prev, created].sort((a, b) => a.roundNumber - b.roundNumber)
        );
        toast.success('Interview round added.');
        return true;
      } catch {
        toast.error('Failed to add round.');
        return false;
      }
    },
    []
  );

  // ── Update ─────────────────────────────────────────────────────

  const updateRound = useCallback(
    async (
      appId: string,
      roundId: string,
      payload: UpdateRoundPayload,
    ): Promise<boolean> => {
      try {
        const updated = await interviewService.updateRound(appId, roundId, payload);
        setRounds(prev =>
          prev
            .map(r => (r.roundId === roundId ? updated : r))
            .sort((a, b) => a.roundNumber - b.roundNumber)
        );
        toast.success('Round updated.');
        return true;
      } catch {
        toast.error('Failed to update round.');
        return false;
      }
    },
    []
  );

  // ── Delete ─────────────────────────────────────────────────────

  const deleteRound = useCallback(
    async (appId: string, roundId: string): Promise<boolean> => {
      try {
        await interviewService.deleteRound(appId, roundId);
        setRounds(prev => prev.filter(r => r.roundId !== roundId));
        toast.success('Round deleted.');
        return true;
      } catch {
        toast.error('Failed to delete round.');
        return false;
      }
    },
    []
  );

  return { rounds, loading, fetchRounds, addRound, updateRound, deleteRound };
}
