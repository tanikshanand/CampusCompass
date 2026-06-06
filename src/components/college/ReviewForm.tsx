'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  collegeId: string;
}

export default function ReviewForm({ collegeId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    if (content.trim().length < 10) {
      setError('Review must be at least 10 characters long.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collegeId, rating, content }),
        });

        const data = await response.json();

        if (response.status === 401) {
          setError('You must be logged in to submit a review.');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          setError(data.error || 'Failed to submit review.');
          return;
        }

        setSuccess('Review submitted successfully! Thank you.');
        setRating(0);
        setContent('');
        router.refresh(); // Fetch new server-side data immediately
      } catch (err) {
        console.error('Review submit error:', err);
        setError('Something went wrong. Please try again.');
      }
    });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      <h3 className="text-lg font-bold text-white">Share Your Review</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
          <span>✅</span>
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Interactive Star Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Your Rating
          </label>
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition duration-150 transform hover:scale-110 focus:outline-none"
              >
                <span
                  className={
                    star <= (hoverRating || rating)
                      ? 'text-amber-400'
                      : 'text-slate-700'
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Review Details
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell future students about campus life, professors, resources, or financial aid..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px] transition duration-200"
            disabled={isPending}
            required
          />
          <p className="text-[10px] text-slate-500 text-right">
            Min 10 characters, max 2000.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-3 text-sm font-semibold shadow-lg shadow-indigo-600/20 active:translate-y-[1px] disabled:opacity-50 transition duration-200"
        >
          {isPending ? 'Submitting review...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
