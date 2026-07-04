import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsSubmitting(true);
    try {
      // Future Integration: Send new password to backend with reset token from URL
      console.log('Resetting password to:', data.password);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // mock request delay
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error('Failed to reset password. Please request a new recovery link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-white">Reset Password</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Create a new strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5"
          >
            New Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={`w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border ${
              errors.password
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 dark:border-zinc-800 focus:ring-brand-500/20'
            } text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:border-brand-500 transition duration-150`}
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            className={`w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border ${
              errors.confirmPassword
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 dark:border-zinc-800 focus:ring-brand-500/20'
            } text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:border-brand-500 transition duration-150`}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center py-2 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-premium dark:shadow-dark-premium"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Back to{' '}
        <Link
          to="/login"
          className="font-medium text-brand-500 hover:text-brand-600 transition"
        >
          Sign in
        </Link>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
