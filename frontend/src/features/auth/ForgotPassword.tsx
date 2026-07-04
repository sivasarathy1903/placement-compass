import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Sending password recovery email to:', data.email);
      // Future Integration: Send recovery link request to backend
      // await api.post('/api/auth/forgot-password', { email: data.email });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // mock request delay
      setSubmitted(true);
      toast.success('Recovery link sent if email exists!');
    } catch (err: any) {
      toast.error('An error occurred. Please try again.');
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
        <h2 className="text-lg font-medium text-zinc-900 dark:text-white">Recover Password</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Receive a link to reset your account credentials
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="alex@university.edu"
              {...register('email')}
              className={`w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 focus:ring-brand-500/20'
              } text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:border-brand-500 transition duration-150`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-2 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-premium dark:shadow-dark-premium"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send Recovery Link'
            )}
          </button>
        </form>
      ) : (
        <div className="text-center py-4 space-y-4">
          <div className="text-3xl">📧</div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Check your email inbox. We have sent you a recovery link to reset your password.
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Remember your details?{' '}
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

export default ForgotPassword;
