import React from 'react';

export default function CollegeDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 animate-pulse">
      {/* Header bar */}
      <header className="bg-slate-900/40 border-b border-slate-800/60 h-16 w-full sticky top-0 z-50 px-6 py-4" />

      {/* Hero Banner Section */}
      <section className="relative h-96 bg-slate-900 overflow-hidden flex items-end p-8 md:p-12">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-slate-800 shrink-0" />
            <div className="space-y-3">
              <div className="h-8 bg-slate-800 rounded w-64" />
              <div className="h-4 bg-slate-800 rounded w-48" />
            </div>
          </div>
          <div className="h-10 bg-slate-800 rounded w-48" />
        </div>
      </section>

      {/* Grid Columns Skeletons */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-4">
            <div className="h-6 bg-slate-900 rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-900 rounded w-full" />
              <div className="h-4 bg-slate-900 rounded w-full" />
              <div className="h-4 bg-slate-900 rounded w-5/6" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-slate-900 rounded w-1/4" />
            <div className="h-24 bg-slate-900 rounded-2xl" />
          </div>
        </div>

        {/* Right side stats widget */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 h-48" />
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 h-48" />
        </div>
      </main>
    </div>
  );
}
