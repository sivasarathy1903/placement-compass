import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Successfully logged in!', {
        id: 'login-success',
      });
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      toast.error(errorMessage);
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
        <h2 className="text-lg font-medium text-zinc-900 dark:text-white">Welcome back</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Enter your credentials to access your tracking metrics
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
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
            placeholder="name@university.edu"
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

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-500 hover:text-brand-600 transition"
            >
              Forgot password?
            </Link>
          </div>
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

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-800 text-brand-600 focus:ring-brand-500 bg-zinc-50 dark:bg-zinc-900"
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Remember me</span>
          </label>
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
            'Sign In'
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        New to Placement Compass?{' '}
        <Link
          to="/register"
          className="font-medium text-brand-500 hover:text-brand-600 transition"
        >
          Create account
        </Link>
      </div>
    </motion.div>
  );
};

export default Login;
