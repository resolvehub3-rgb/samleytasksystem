import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { Database, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { loginSchema, registerSchema } from '../lib/validation';

interface AuthPageProps {
  onOpenSupabaseSetup: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onOpenSupabaseSetup }) => {
  const { signIn, signUp, resetPassword, configured } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'login') {
      const val = loginSchema.safeParse({ email, password });
      if (!val.success) {
        setError(val.error.issues[0].message);
        return;
      }

      try {
        setLoading(true);
        const { error: signInError } = await signIn(email.trim(), password);
        if (signInError) {
          setError(signInError.message || 'Invalid email or password');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to sign in');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'register') {
      const val = registerSchema.safeParse({
        email,
        password,
        full_name: fullName,
      });
      if (!val.success) {
        setError(val.error.issues[0].message);
        return;
      }

      try {
        setLoading(true);
        const { error: signUpError, data } = await signUp(
          email.trim(),
          password,
          fullName.trim()
        );
        if (signUpError) {
          setError(signUpError.message || 'Failed to create account');
        } else if (data?.user && !data.session) {
          setSuccess(
            'Registration successful! Please check your email inbox to confirm your account, or sign in if email confirmation is disabled.'
          );
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to register');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }

      try {
        setLoading(true);
        const { error: resetError } = await resetPassword(email.trim());
        if (resetError) {
          setError(resetError.message || 'Failed to send reset link');
        } else {
          setSuccess('Password reset link sent to your email.');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to reset password');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0B100D] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <BrandLogo size="lg" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {mode === 'login' && 'Sign in to your SaaS workspace'}
          {mode === 'register' && 'Create your partner workspace'}
          {mode === 'forgot' && 'Reset your password'}
        </h2>
        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
          {mode === 'login' &&
            'Real-time project management for you and your business partner.'}
          {mode === 'register' &&
            'Start managing your software projects, tasks, clients, and revenue together.'}
          {mode === 'forgot' &&
            'Enter your registered email and we will send you a password recovery link.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#121A15] py-8 px-6 sm:px-10 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-sm text-xs">
          {/* Supabase Notice */}
          {!configured && (
            <div className="mb-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px]">
                <p className="font-semibold">Connect to Supabase</p>
                <p className="mt-0.5 opacity-90">
                  Configure your live Supabase database credentials to enable real-time authentication.
                </p>
                <button
                  type="button"
                  onClick={onOpenSupabaseSetup}
                  className="mt-2 text-[#0B5D3B] dark:text-[#28A76B] font-bold underline cursor-pointer flex items-center gap-1"
                >
                  <Database className="w-3 h-3" />
                  <span>Configure Supabase Project</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Mensah"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Password *
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#0B5D3B] dark:text-[#28A76B] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In to Workspace'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'forgot' && 'Send Recovery Email'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
            {mode === 'login' ? (
              <p className="text-neutral-600 dark:text-neutral-400">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="font-bold text-[#0B5D3B] dark:text-[#28A76B] hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400">
                Already registered?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-bold text-[#0B5D3B] dark:text-[#28A76B] hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Database Credentials Link */}
        <div className="mt-6 text-center">
          <button
            onClick={onOpenSupabaseSetup}
            className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#0B5D3B]" />
            <span>Supabase Connection &amp; Schema SQL Setup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
