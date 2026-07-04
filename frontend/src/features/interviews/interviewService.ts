import api from '../../services/api';
import type { InterviewRound, CreateRoundPayload, UpdateRoundPayload } from './types';

/**
 * interviewService — Axios wrapper for /api/applications/{appId}/rounds endpoints.
 *
 * All methods are namespaced under the application ID, mirroring the REST resource hierarchy.
 */
export const interviewService = {

  /** GET /api/applications/{appId}/rounds */
  getRounds: (appId: string): Promise<InterviewRound[]> =>
    api
      .get<InterviewRound[]>(`/api/applications/${appId}/rounds`)
      .then(r => r.data),

  /** POST /api/applications/{appId}/rounds */
  addRound: (appId: string, payload: CreateRoundPayload): Promise<InterviewRound> =>
    api
      .post<InterviewRound>(`/api/applications/${appId}/rounds`, payload)
      .then(r => r.data),

  /** PATCH /api/applications/{appId}/rounds/{roundId} */
  updateRound: (
    appId: string,
    roundId: string,
    payload: UpdateRoundPayload,
  ): Promise<InterviewRound> =>
    api
      .patch<InterviewRound>(`/api/applications/${appId}/rounds/${roundId}`, payload)
      .then(r => r.data),

  /** DELETE /api/applications/{appId}/rounds/{roundId} */
  deleteRound: (appId: string, roundId: string): Promise<void> =>
    api
      .delete(`/api/applications/${appId}/rounds/${roundId}`)
      .then(() => undefined),
};
