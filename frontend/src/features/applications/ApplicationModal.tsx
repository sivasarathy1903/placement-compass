import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Application, CreateApplicationPayload } from './applicationService';
import { ALL_STATUSES, STATUS_LABELS } from './types';

// ── Validation schema ─────────────────────────────────────────────

const applicationSchema = z.object({
  companyName:     z.string().min(1, 'Company name is required').max(150),
  role:            z.string().min(1, 'Role is required').max(200),
  jobUrl:          z.string().max(500).optional().or(z.literal('')),
  status:          z.enum(['APPLIED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']),
  source:          z.string().max(100).optional().or(z.literal('')),
  applicationDate: z.string().min(1, 'Application date is required'),
  nextActionDate:  z.string().optional().or(z.literal('')),
  notes:           z.string().max(2000).optional().or(z.literal('')),
  ctcOffered:      z.string().max(100).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof applicationSchema>;

// ── Props ─────────────────────────────────────────────────────────

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateApplicationPayload) => Promise<unknown>;
  editingApplication?: Application | null;
}

// ── Component ─────────────────────────────────────────────────────

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingApplication,
}) => {
  const isEditing = !!editingApplication;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: '',
      role: '',
      jobUrl: '',
      status: 'APPLIED',
      source: '',
      applicationDate: new Date().toISOString().split('T')[0],
      nextActionDate: '',
      notes: '',
      ctcOffered: '',
    },
  });

  // Populate form when editing an existing application
  useEffect(() => {
    if (editingApplication) {
      reset({
        companyName:     editingApplication.companyName,
        role:            editingApplication.role,
        jobUrl:          editingApplication.jobUrl ?? '',
        status:          editingApplication.status,
        source:          editingApplication.source ?? '',
        applicationDate: editingApplication.applicationDate,
        nextActionDate:  editingApplication.nextActionDate ?? '',
        notes:           editingApplication.notes ?? '',
        ctcOffered:      editingApplication.ctcOffered ?? '',
      });
    } else {
      reset({
        companyName: '',
        role: '',
        jobUrl: '',
        status: 'APPLIED',
        source: '',
        applicationDate: new Date().toISOString().split('T')[0],
        nextActionDate: '',
        notes: '',
        ctcOffered: '',
      });
    }
  }, [editingApplication, reset]);

  const handleFormSubmit = async (values: FormValues) => {
    // Strip empty optional strings so backend doesn't store ""
    const payload: CreateApplicationPayload = {
      companyName:     values.companyName,
      role:            values.role,
      status:          values.status,
      applicationDate: values.applicationDate,
      jobUrl:          values.jobUrl       || undefined,
      source:          values.source       || undefined,
      nextActionDate:  values.nextActionDate || undefined,
      notes:           values.notes        || undefined,
      ctcOffered:      values.ctcOffered   || undefined,
    };
    await onSubmit(payload);
    onClose();
  };

  // Field helper for consistent styling
  const fieldClass = (hasError: boolean) =>
    `w-full px-3 py-2 text-sm rounded-lg border transition
     bg-white dark:bg-zinc-900
     text-zinc-900 dark:text-zinc-100
     ${hasError
       ? 'border-red-400 focus:ring-red-400'
       : 'border-zinc-200 dark:border-zinc-700 focus:border-brand-500 focus:ring-brand-500'
     }
     focus:outline-none focus:ring-2 focus:ring-opacity-30`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-2xl glass-panel rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    {isEditing ? 'Edit Application' : 'Add Application'}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isEditing ? 'Update the application details below.' : 'Track a new placement opportunity.'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Row 1: Company + Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Company Name *
                    </label>
                    <input
                      {...register('companyName')}
                      placeholder="e.g. Google"
                      className={fieldClass(!!errors.companyName)}
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Role / Job Title *
                    </label>
                    <input
                      {...register('role')}
                      placeholder="e.g. Software Engineer Intern"
                      className={fieldClass(!!errors.role)}
                    />
                    {errors.role && (
                      <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Status + Source */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Status *
                    </label>
                    <select {...register('status')} className={fieldClass(!!errors.status)}>
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Source
                    </label>
                    <input
                      {...register('source')}
                      placeholder="LinkedIn, Campus, Referral…"
                      className={fieldClass(!!errors.source)}
                    />
                  </div>
                </div>

                {/* Row 3: Application Date + Next Action Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Application Date *
                    </label>
                    <input
                      {...register('applicationDate')}
                      type="date"
                      className={fieldClass(!!errors.applicationDate)}
                    />
                    {errors.applicationDate && (
                      <p className="mt-1 text-xs text-red-500">{errors.applicationDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Next Action Date
                    </label>
                    <input
                      {...register('nextActionDate')}
                      type="date"
                      className={fieldClass(!!errors.nextActionDate)}
                    />
                  </div>
                </div>

                {/* Job URL */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Job URL
                  </label>
                  <input
                    {...register('jobUrl')}
                    type="url"
                    placeholder="https://careers.google.com/..."
                    className={fieldClass(!!errors.jobUrl)}
                  />
                </div>

                {/* CTC (shown prominently for offers) */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                    CTC / Package (if offer)
                  </label>
                  <input
                    {...register('ctcOffered')}
                    placeholder="e.g. ₹12 LPA or $90,000/yr"
                    className={fieldClass(!!errors.ctcOffered)}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    placeholder="Recruiter contact, prep notes, interview rounds…"
                    className={`${fieldClass(!!errors.notes)} resize-none`}
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition"
                  >
                    {isSubmitting
                      ? (isEditing ? 'Saving…' : 'Adding…')
                      : (isEditing ? 'Save Changes' : 'Add Application')
                    }
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApplicationModal;
