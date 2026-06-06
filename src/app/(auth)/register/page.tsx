'use client';

import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '../actions';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      {/* Premium Glassmorphic Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
            Create Account
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Join the discovery platform and track your choices
          </p>
        </div>

        {state.error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <p>{state.error}</p>
          </div>
        )}

        {state.success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>✅</span>
            <p>{state.message || 'Account created! Redirecting to login...'}</p>
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              required
              disabled={state.success}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200 disabled:opacity-50"
              placeholder="Alex Johnson"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              disabled={state.success}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200 disabled:opacity-50"
              placeholder="alex@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              disabled={state.success}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || state.success}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-3 text-sm font-semibold shadow-lg shadow-indigo-600/20 active:translate-y-[1px] disabled:opacity-50 transition duration-200"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-400 pt-2 border-t border-slate-800/60">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition duration-200">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
