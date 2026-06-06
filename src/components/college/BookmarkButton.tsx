'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveCollegeAction, removeCollegeAction } from '@/app/actions/saved';

interface BookmarkButtonProps {
  collegeId: string;
  initialSaved: boolean;
}

export default function BookmarkButton({ collegeId, initialSaved }: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      try {
        if (isSaved) {
          // Trigger un-bookmark Server Action
          await removeCollegeAction(collegeId);
          setIsSaved(false);
        } else {
          // Trigger bookmark Server Action
          await saveCollegeAction(collegeId);
          setIsSaved(true);
        }
        router.refresh();
      } catch (error) {
        console.error('Failed to toggle bookmark via Server Action:', error);
        // Fallback redirection to login if unauthorized
        router.push('/login');
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2.5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
        isSaved
          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
      } disabled:opacity-50`}
      aria-label={isSaved ? 'Remove from saved' : 'Save college'}
    >
      {isPending ? (
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : isSaved ? (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
        </svg>
      ) : (
        <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      )}
    </button>
  );
}
