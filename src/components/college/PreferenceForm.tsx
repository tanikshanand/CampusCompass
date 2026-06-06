'use client';

import React, { useActionState } from 'react';
import { savePreferenceAction, PreferenceFormState } from '@/app/actions/preference';

interface PreferenceFormProps {
  initialData?: {
    preferredState: string | null;
    preferredCourse: string | null;
    budgetMax: number | null;
    examType: string | null;
    examScore: number | null;
  } | null;
}

export default function PreferenceForm({ initialData }: PreferenceFormProps) {
  const [state, formAction, isPending] = useActionState(
    savePreferenceAction,
    {} as PreferenceFormState
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">My Match Criteria</h3>
        <p className="text-xs text-slate-400">
          Define your targets to calculate admission and cost matching scores.
        </p>
      </div>

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs px-4 py-2.5 rounded-xl">
          ⚠️ {state.error}
        </div>
      )}

      {state.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs px-4 py-2.5 rounded-xl">
          ✅ {state.message || 'Criteria saved! Updating predictions...'}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* State */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Preferred State (2-letter code)
          </label>
          <input
            name="preferredState"
            type="text"
            maxLength={2}
            defaultValue={initialData?.preferredState || ''}
            placeholder="e.g. CA, MA, TX"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition uppercase"
          />
        </div>

        {/* Course */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Preferred Major / Discipline
          </label>
          <input
            name="preferredCourse"
            type="text"
            defaultValue={initialData?.preferredCourse || ''}
            placeholder="e.g. Computer Science, Engineering"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Budget */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Max Annual Budget ($)
          </label>
          <input
            name="budgetMax"
            type="number"
            defaultValue={initialData?.budgetMax || ''}
            placeholder="e.g. 50000"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Exam Type & Score */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Exam Type
            </label>
            <select
              name="examType"
              defaultValue={initialData?.examType || ''}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">None</option>
              <option value="SAT">SAT</option>
              <option value="ACT">ACT</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Your Score
            </label>
            <input
              name="examScore"
              type="number"
              defaultValue={initialData?.examScore || ''}
              placeholder="e.g. 1500 or 32"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-3 text-sm font-semibold shadow-lg shadow-indigo-600/10 active:translate-y-[1px] disabled:opacity-50 transition duration-200"
        >
          {isPending ? 'Calculating...' : 'Save & Calculate Matches'}
        </button>
      </form>
    </div>
  );
}
