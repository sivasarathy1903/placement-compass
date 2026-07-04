import type { ApplicationStatus } from './types';
import api from '../../services/api';

/**
 * applicationService — thin Axios wrapper for the /api/applications REST endpoints.
 *
 * Why a separate service file?
 * It separates HTTP concerns from React state/component concerns.
 * The useApplications hook calls these functions — if we ever swap Axios for fetch(),
 * we only change this file, not every component.
 */

export interface Application {
  id: string;
  companyName: string;
  role: string;
  jobUrl?: string;
  status: ApplicationStatus;
  source?: string;
  applicationDate: string;   // ISO date string from backend (LocalDate serialises as "YYYY-MM-DD")
  nextActionDate?: string;
  notes?: string;
  ctcOffered?: string;
  createdAt: string;
  updatedAt: string;
  rounds?: any[];
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // current page (0-indexed)
  size: number;
}

export interface ApplicationSummary {
  totalApplications: number;
  applied: number;
  oa: number;
  interview: number;
  offer: number;
  rejected: number;
  withdrawn: number;
}

export interface CreateApplicationPayload {
  companyName: string;
  role: string;
  jobUrl?: string;
  status: ApplicationStatus;
  source?: string;
  applicationDate: string;
  nextActionDate?: string;
  notes?: string;
  ctcOffered?: string;
}

export type UpdateApplicationPayload = Partial<CreateApplicationPayload>;

// ── API calls ──────────────────────────────────────────────────────

export const applicationService = {

  /** GET /api/applications/summary */
  getSummary: (): Promise<ApplicationSummary> =>
    api.get<ApplicationSummary>('/api/applications/summary').then(r => r.data),

  /** GET /api/applications?page=&size=&sortBy=&direction=&status= */
  getAll: (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'asc' | 'desc';
    status?: ApplicationStatus;
  }): Promise<PagedResponse<Application>> =>
    api.get<PagedResponse<Application>>('/api/applications', { params }).then(r => r.data),

  /** GET /api/applications/:id */
  getById: (id: string): Promise<Application> =>
    api.get<Application>(`/api/applications/${id}`).then(r => r.data),

  /** POST /api/applications */
  create: (payload: CreateApplicationPayload): Promise<Application> =>
    api.post<Application>('/api/applications', payload).then(r => r.data),

  /** PATCH /api/applications/:id */
  update: (id: string, payload: UpdateApplicationPayload): Promise<Application> =>
    api.patch<Application>(`/api/applications/${id}`, payload).then(r => r.data),

  /** DELETE /api/applications/:id */
  delete: (id: string): Promise<void> =>
    api.delete(`/api/applications/${id}`).then(() => undefined),
};
