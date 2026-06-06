'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateShortlistCategoryAction } from '@/app/actions/saved';

interface ShortlistSelectorProps {
  collegeId: string;
  currentCategory: 'DREAM' | 'TARGET' | 'SAFE';
}

export default function ShortlistSelector({
  collegeId,
  currentCategory,
}: ShortlistSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCategory = e.target.value as 'DREAM' | 'TARGET' | 'SAFE';

    startTransition(async () => {
      try {
        await updateShortlistCategoryAction(collegeId, nextCategory);
        router.refresh();
      } catch (err) {
        console.error('Failed to update shortlist category:', err);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        Category:
      </span>
      <div className="relative flex items-center">
        <select
          value={currentCategory}
          onChange={handleChange}
          disabled={isPending}
          className={`bg-slate-950 border border-slate-800 text-[11px] font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 transition uppercase cursor-pointer ${
            currentCategory === 'DREAM'
              ? 'text-purple-400 border-purple-500/20'
              : currentCategory === 'TARGET'
                ? 'text-amber-400 border-amber-500/20'
                : 'text-emerald-400 border-emerald-500/20'
          } disabled:opacity-50`}
        >
          <option value="DREAM">Dream</option>
          <option value="TARGET">Target</option>
          <option value="SAFE">Safe</option>
        </select>
        {isPending && (
          <div className="absolute right-[-18px] top-1.5">
            <svg className="animate-spin h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
