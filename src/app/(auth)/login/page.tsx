'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { loginUser } from '../actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      {/* Premium Glassmorphic Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Discover and track your dream colleges
          </p>
        </div>

        {state.error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <p>{state.error}</p>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
              placeholder="name@university.com"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-3 text-sm font-semibold shadow-lg shadow-indigo-600/20 active:translate-y-[1px] disabled:opacity-50 transition duration-200"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-400 pt-2 border-t border-slate-800/60">
          New to the platform?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition duration-200">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
