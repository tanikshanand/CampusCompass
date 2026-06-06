'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SimpleCollege {
  id: string;
  name: string;
  slug: string;
  state: string;
}

interface ComparisonSelectorProps {
  allColleges: SimpleCollege[];
  currentlySelectedIds: string[];
}

export default function ComparisonSelector({
  allColleges,
  currentlySelectedIds,
}: ComparisonSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter out colleges that are already selected
  const availableColleges = allColleges.filter(
    (col) => !currentlySelectedIds.includes(col.id) && !currentlySelectedIds.includes(col.slug)
  );

  const handleAddCollege = (idOrSlug: string) => {
    setError(null);
    if (!idOrSlug) return;

    if (currentlySelectedIds.length >= 3) {
      setError('You can compare a maximum of 3 colleges.');
      return;
    }

    const updatedIds = [...currentlySelectedIds, idOrSlug];
    updateUrl(updatedIds);
    setSelectedId('');
  };

  const handleRemoveCollege = (idOrSlug: string) => {
    setError(null);
    const updatedIds = currentlySelectedIds.filter((id) => id !== idOrSlug);
    updateUrl(updatedIds);
  };

  const updateUrl = (ids: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (ids.length > 0) {
      params.set('ids', ids.join(','));
    } else {
      params.delete('ids');
    }
    router.push(`/compare?${params.toString()}`);
  };

  // Find college metadata for rendering selected pills
  const selectedColleges = currentlySelectedIds
    .map((id) => allColleges.find((col) => col.id === id || col.slug === id))
    .filter(Boolean) as SimpleCollege[];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">Select Colleges to Compare</h3>
        <p className="text-xs text-slate-400">
          Compare admissions, tuition costs, and graduation statistics side-by-side (Max 3).
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs px-4 py-2.5 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={currentlySelectedIds.length >= 3}
          className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">-- Choose a College --</option>
          {availableColleges.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name} ({col.state})
            </option>
          ))}
        </select>
        <button
          onClick={() => handleAddCollege(selectedId)}
          disabled={!selectedId || currentlySelectedIds.length >= 3}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl px-6 py-3 text-sm font-semibold transition active:translate-y-[1px] disabled:translate-y-0"
        >
          Add to Compare
        </button>
      </div>

      {/* Selected badges list */}
      {selectedColleges.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Selected Schools ({selectedColleges.length}/3)
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedColleges.map((col) => (
              <div
                key={col.id}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-semibold"
              >
                <span>
                  {col.name} ({col.state})
                </span>
                <button
                  onClick={() => handleRemoveCollege(col.id)}
                  className="text-slate-500 hover:text-red-400 font-bold transition ml-1"
                  type="button"
                  aria-label={`Remove ${col.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
