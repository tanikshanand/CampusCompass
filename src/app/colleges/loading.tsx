import React from 'react';

export default function CollegesLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 animate-pulse">
      {/* Header Skeleton */}
      <header className="bg-slate-900/40 border-b border-slate-800/60 h-16 w-full sticky top-0 z-50 px-6 py-4" />

      {/* Hero Header Skeleton */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 space-y-4">
        <div className="h-8 bg-slate-900 rounded-lg w-1/3" />
        <div className="h-4 bg-slate-900 rounded-lg w-2/3" />
        <div className="h-12 bg-slate-900 rounded-xl w-full max-w-lg mt-4" />
      </div>

      {/* Grid Layout Skeleton */}
      <main className="max-w-7xl mx-auto px-6 mt-6 flex flex-col md:flex-row gap-8">
        {/* Left Filter Sidebar Skeleton */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 h-[450px] w-full md:w-80 shrink-0 space-y-6">
          <div className="h-6 bg-slate-800 rounded w-1/2" />
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
            <div className="h-4 bg-slate-800 rounded w-5/6" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-slate-800 rounded w-full" />
            <div className="h-2 bg-slate-800 rounded w-full" />
          </div>
        </div>

        {/* Right Cards Skeletons */}
        <div className="flex-grow space-y-6">
          <div className="h-6 bg-slate-900 rounded w-1/4 pb-4 border-b border-slate-800" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/30 border border-slate-900 rounded-2xl overflow-hidden h-[360px] flex flex-col justify-between"
              >
                <div className="bg-slate-900 h-44 w-full" />
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="h-5 bg-slate-900 rounded w-3/4" />
                  <div className="h-10 bg-slate-900 rounded w-full" />
                  <div className="flex gap-2 pt-2 border-t border-slate-800/40">
                    <div className="h-9 bg-slate-900 rounded flex-grow" />
                    <div className="h-9 bg-slate-900 rounded w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
