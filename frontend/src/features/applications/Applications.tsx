import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useApplications } from './useApplications';
import ApplicationModal from './ApplicationModal';
import type { Application } from './applicationService';
import { STATUS_COLORS, STATUS_LABELS, ALL_STATUSES, type ApplicationStatus } from './types';

/**
 * Applications — the main job applications management page.
 *
 * Features:
 * - Sortable columns (click header to sort, click again to toggle asc/desc)
 * - Status filter chips (filter by a single status)
 * - Client-side search (filters the current page by company/role name)
 * - Add / Edit modal
 * - Delete with inline confirmation
 * - Pagination controls
 */
const Applications: React.FC = () => {
  const {
    applications,
    loading,
    totalElements,
    totalPages,
    page,
    statusFilter,
    sortBy,
    sortDir,
    createApplication,
    updateApplication,
    deleteApplication,
    setPage,
    setStatusFilter,
    handleSort,
  } = useApplications();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Client-side search filter (within the current page)
  const filtered = applications.filter(app => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.companyName.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingApp(null);
    setIsModalOpen(true);
  };

  const openEdit = (app: Application) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (payload: Parameters<typeof createApplication>[0]) => {
    if (editingApp) {
      await updateApplication(editingApp.id, payload);
    } else {
      await createApplication(payload);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId === id) {
      await deleteApplication(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  // Sort icon helper
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronUpDownIcon className="w-3.5 h-3.5 text-zinc-400" />;
    return sortDir === 'asc'
      ? <ChevronUpIcon className="w-3.5 h-3.5 text-brand-500" />
      : <ChevronDownIcon className="w-3.5 h-3.5 text-brand-500" />;
  };

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Applications</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {totalElements} application{totalElements !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* ── Filters + Search ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search company or role…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700
                       bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-opacity-30 transition"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <FunnelIcon className="w-4 h-4 text-zinc-400 shrink-0" />
          <button
            onClick={() => { setStatusFilter(undefined); setPage(0); }}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition
              ${statusFilter === undefined
                ? 'bg-brand-600 text-white border-brand-600'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
          >
            All
          </button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s as ApplicationStatus); setPage(0); }}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition
                ${statusFilter === s
                  ? STATUS_COLORS[s].badge + ' border-transparent'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="metric-card !p-0 overflow-hidden" style={{ borderTop: '3px solid #8b5cf6' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                {[
                  { label: 'Company',  field: 'companyName' },
                  { label: 'Role',     field: 'role' },
                  { label: 'Status',   field: 'status' },
                  { label: 'Source',   field: 'source' },
                  { label: 'Applied',  field: 'applicationDate' },
                  { label: 'Next',     field: 'nextActionDate' },
                ].map(col => (
                  <th
                    key={col.field}
                    onClick={() => handleSort(col.field)}
                    className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none whitespace-nowrap"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-50 dark:border-zinc-800/50">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="animate-shimmer h-4 rounded-md w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-zinc-400 text-sm">
                    {searchQuery || statusFilter
                      ? 'No applications match your filters.'
                      : 'No applications yet. Click "Add Application" to get started!'}
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filtered.map((app, i) => (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 group"
                    >
                      {/* Company */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {app.companyName}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 max-w-48 truncate">
                        {app.role}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[app.status].badge}`}>
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: STATUS_COLORS[app.status].dot }}
                          />
                          {STATUS_LABELS[app.status]}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                        {app.source ?? '—'}
                      </td>

                      {/* Application Date */}
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs whitespace-nowrap">
                        {app.applicationDate}
                      </td>

                      {/* Next Action Date */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {app.nextActionDate
                          ? <span className="text-amber-600 dark:text-amber-400 font-medium">{app.nextActionDate}</span>
                          : <span className="text-zinc-400">—</span>
                        }
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Open URL */}
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-brand-600 transition"
                              title="Open job posting"
                            >
                              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            </a>
                          )}
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(app)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-brand-600 transition"
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          {/* Delete (two-click confirmation) */}
                          <button
                            onClick={() => handleDelete(app.id)}
                            className={`p-1.5 rounded-lg transition text-xs font-medium
                              ${deletingId === app.id
                                ? 'bg-red-500 text-white px-2'
                                : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-500'
                              }`}
                            title={deletingId === app.id ? 'Click again to confirm' : 'Delete'}
                          >
                            {deletingId === app.id
                              ? 'Confirm?'
                              : <TrashIcon className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-400">
              Page {page + 1} of {totalPages} · {totalElements} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-7 h-7 text-xs rounded-lg transition font-medium
                    ${page === i
                      ? 'bg-brand-600 text-white'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ── */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingApp(null); }}
        onSubmit={handleModalSubmit}
        editingApplication={editingApp}
      />
    </div>
  );
};

export default Applications;
