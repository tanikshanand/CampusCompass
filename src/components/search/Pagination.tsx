import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  page: number;
  pages: number;
  searchParams: Record<string, string | string[] | undefined>;
}

export default function Pagination({ page, pages, searchParams }: PaginationProps) {
  if (pages <= 1) return null;

  const createPageLink = (targetPage: number) => {
    const params = new URLSearchParams();

    // Copy current query filters to preserve search contexts
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val === undefined) return;
      if (Array.isArray(val)) {
        val.forEach((v) => params.append(key, v));
      } else {
        params.set(key, val);
      }
    });

    params.set('page', targetPage.toString());
    return `/colleges?${params.toString()}`;
  };

  const pagesArray = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6 border-t border-slate-900/60 mt-8">
      {/* Previous Button */}
      {page > 1 ? (
        <Link
          href={createPageLink(page - 1)}
          className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-slate-700 text-xs font-semibold transition"
        >
          Previous
        </Link>
      ) : (
        <span className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-600 cursor-not-allowed select-none">
          Previous
        </span>
      )}

      {/* Pages Indicators */}
      <div className="flex items-center gap-1">
        {pagesArray.map((p) => {
          const isCurrent = p === page;
          return (
            <Link
              key={p}
              href={createPageLink(p)}
              className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-semibold transition ${
                isCurrent
                  ? 'bg-indigo-600 border border-indigo-500 text-white'
                  : 'bg-white/5 border border-white/10 hover:border-slate-700 text-slate-300'
              }`}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {page < pages ? (
        <Link
          href={createPageLink(page + 1)}
          className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-slate-700 text-xs font-semibold transition"
        >
          Next
        </Link>
      ) : (
        <span className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-600 cursor-not-allowed select-none">
          Next
        </span>
      )}
    </div>
  );
}
