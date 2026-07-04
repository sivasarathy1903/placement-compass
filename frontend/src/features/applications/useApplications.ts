import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  applicationService,
  type Application,
  type CreateApplicationPayload,
  type UpdateApplicationPayload,
} from './applicationService';
import type { ApplicationStatus } from './types';

/**
 * useApplications — custom React hook encapsulating all application state & operations.
 *
 * Why a custom hook?
 * Components should not contain data-fetching logic directly. Extracting it here means:
 * 1. The same state (list, loading, pagination) can be consumed by both the Table
 *    view and the Kanban view without prop drilling.
 * 2. Unit tests can test the hook independently of any component.
 * 3. Adding a cache layer (React Query, SWR) later only changes this file.
 *
 * Usage:
 *   const { applications, loading, createApplication, ... } = useApplications();
 */
export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Pagination & filter state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // ── Fetch ────────────────────────────────────────────────────────

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await applicationService.getAll({
        page,
        size: pageSize,
        sortBy,
        direction: sortDir,
        status: statusFilter,
      });
      setApplications(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ── CRUD operations ──────────────────────────────────────────────

  const createApplication = async (payload: CreateApplicationPayload): Promise<Application | null> => {
    try {
      const created = await applicationService.create(payload);
      toast.success(`Application to ${created.companyName} added!`);
      await fetchApplications(); // refresh list
      return created;
    } catch {
      toast.error('Failed to create application.');
      return null;
    }
  };

  const updateApplication = async (id: string, payload: UpdateApplicationPayload): Promise<Application | null> => {
    try {
      const updated = await applicationService.update(id, payload);
      // Optimistic UI: replace the item in-place without a full refetch
      setApplications(prev =>
        prev.map(app => app.id === id ? updated : app)
      );
      toast.success('Application updated!');
      return updated;
    } catch {
      toast.error('Failed to update application.');
      return null;
    }
  };

  const deleteApplication = async (id: string): Promise<boolean> => {
    try {
      await applicationService.delete(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      setTotalElements(prev => prev - 1);
      toast.success('Application deleted.');
      return true;
    } catch {
      toast.error('Failed to delete application.');
      return false;
    }
  };

  // ── Sort helper ──────────────────────────────────────────────────

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(0); // reset to first page on sort change
  };

  return {
    // State
    applications,
    loading,
    totalElements,
    totalPages,
    page,
    pageSize,
    statusFilter,
    sortBy,
    sortDir,

    // Actions
    createApplication,
    updateApplication,
    deleteApplication,
    refresh: fetchApplications,

    // Setters
    setPage,
    setStatusFilter,
    handleSort,
  };
};
