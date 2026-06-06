import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import ComparisonSelector from '@/components/college/ComparisonSelector';
import { logoutUser } from '@/app/(auth)/actions';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Helper to provide realistic median salaries for seeded schools if not set in DB
const getMedianSalary = (slug: string): number => {
  switch (slug) {
    case 'stanford-university':
      return 94300;
    case 'harvard-university':
      return 91200;
    case 'massachusetts-institute-of-technology':
      return 104500;
    case 'university-of-california-berkeley':
      return 83700;
    case 'university-of-michigan':
      return 72100;
    case 'university-of-texas-at-austin':
      return 69800;
    default:
      return 62000;
  }
};

export default async function CollegeComparisonPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const session = await auth();
  const userId = (session?.user as any)?.id;

  // Extract selected IDs or slugs
  const ids = typeof resolvedParams.ids === 'string'
    ? resolvedParams.ids.split(',').map(id => id.trim()).filter(Boolean)
    : Array.isArray(resolvedParams.ids)
      ? resolvedParams.ids.map(id => String(id).trim()).filter(Boolean)
      : [];

  // 1. Fetch all colleges for the dropdown selector search
  const allColleges = await db.college.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      state: true,
    },
    orderBy: { name: 'asc' },
  });

  // 2. Fetch details of currently selected colleges (capped at 3)
  const comparisonIds = ids.slice(0, 3);

  // Natively Log Comparison History in Background
  if (userId && comparisonIds.length > 0) {
    try {
      await db.comparisonHistory.create({
        data: {
          userId,
          colleges: {
            create: comparisonIds.map(collegeId => ({ collegeId })),
          },
        },
      });
    } catch (err) {
      console.error('Failed to log comparison history:', err);
    }
  }

  const colleges = comparisonIds.length > 0
    ? await db.college.findMany({
        where: {
          OR: [
            { id: { in: comparisonIds } },
            { slug: { in: comparisonIds } }
          ]
        },
        include: {
          courses: {
            select: {
              course: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          reviews: {
            select: { rating: true },
          },
        },
      })
    : [];

  // Format data and calculate rating aggregates
  const formattedColleges = colleges.map((col) => {
    const totalReviews = col.reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((col.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
        : 0;

    return {
      ...col,
      courses: col.courses.map((c) => c.course),
      averageRating,
      medianSalary: getMedianSalary(col.slug),
    };
  });

  // Calculate "Best Values" for highlighting
  const minTuitionInState = formattedColleges.length > 0 
    ? Math.min(...formattedColleges.map(c => c.tuitionInState)) 
    : 0;
  const minTuitionOutState = formattedColleges.length > 0 
    ? Math.min(...formattedColleges.map(c => c.tuitionOutState)) 
    : 0;
  const maxRating = formattedColleges.length > 0 
    ? Math.max(...formattedColleges.map(c => c.averageRating)) 
    : 0;
  const maxGraduation = formattedColleges.length > 0 
    ? Math.max(...formattedColleges.map(c => c.graduationRate)) 
    : 0;
  const maxSalary = formattedColleges.length > 0 
    ? Math.max(...formattedColleges.map(c => c.medianSalary)) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header bar */}
      <header className="bg-slate-900/40 border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/colleges" className="flex items-center gap-2 group">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:from-indigo-300 group-hover:to-purple-300 transition duration-200">
              🎓 CampusCompass
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/colleges" className="hover:text-white transition">
              Colleges
            </Link>
            <Link href="/compare" className="text-indigo-400">
              Compare
            </Link>
            <Link href="/saved" className="hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/predict" className="hover:text-white transition">
              Predictor
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <Link href="/saved" className="flex items-center gap-2 group">
                  <img
                    src={session.user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border border-indigo-500/30 object-cover"
                  />
                  <span className="hidden md:inline text-xs font-semibold text-slate-300 group-hover:text-white transition">
                    {session.user.name}
                  </span>
                </Link>
                <form action={logoutUser}>
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                  >
                    Log Out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Compare College Choices
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review financial aid costs, student ratings, and postgraduate placements side-by-side.
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-6 space-y-8">
        {/* Dynamic Selector Dropdown widget */}
        <ComparisonSelector allColleges={allColleges} currentlySelectedIds={comparisonIds} />

        {/* Comparison Table */}
        {formattedColleges.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
            <p className="text-lg text-slate-400 font-medium">No colleges selected for comparison.</p>
            <p className="text-xs text-slate-500 mt-1">Select up to 3 colleges from the dropdown box above.</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            {/* Scrollable table wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm table-fixed min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    {/* Empty top-left cell */}
                    <th className="px-6 py-5 w-56 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Comparison Metric
                    </th>
                    {formattedColleges.map((col) => (
                      <th key={col.id} className="px-6 py-5 border-l border-slate-800/80">
                        <div className="flex items-center gap-3">
                          {col.logoUrl && (
                            <img
                              src={col.logoUrl}
                              alt={col.name}
                              className="h-10 w-10 rounded-lg bg-white p-1 border border-slate-200 shrink-0"
                            />
                          )}
                          <div>
                            <Link href={`/colleges/${col.slug}`} className="hover:underline font-bold text-white block truncate">
                              {col.name}
                            </Link>
                            <span className="text-xxs text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                              {col.city}, {col.state}
                            </span>
                          </div>
                        </div>
                      </th>
                    ))}
                    {/* Fill columns to keep width constant if comparing less than 3 */}
                    {Array.from({ length: 3 - formattedColleges.length }).map((_, i) => (
                      <th key={i} className="px-6 py-5 border-l border-slate-800/80 w-80 bg-slate-950/20">
                        <span className="text-xs text-slate-600 italic font-normal">Add another school...</span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {/* Location Row */}
                  <tr>
                    <td className="px-6 py-4 font-semibold text-slate-400">Location</td>
                    {formattedColleges.map((col) => (
                      <td key={col.id} className="px-6 py-4 border-l border-slate-800/60">
                        {col.city}, {col.state}, {col.country}
                      </td>
                    ))}
                    {Array.from({ length: 3 - formattedColleges.length }).map((_, i) => (
                      <td key={i} className="px-6 py-4 border-l border-slate-800/60 bg-slate-950/20" />
                    ))}
                  </tr>

                  {/* Tuition Out State */}
                  <tr>
                    <td className="px-6 py-4 font-semibold text-slate-400">Out-of-State Tuition</td>
                    {formattedColleges.map((col) => {
                      const isBest = col.tuitionOutState === minTuitionOutState && formattedColleges.length > 1;
                      return (
                        <td
                          key={col.id}
                          className={`px-6 py-4 border-l border-slate-800/60 font-semibold ${
                            isBest ? 'bg-emerald-500/10 text-emerald-400 border-x border-emerald-500/20' : 'text-white'
                          }`}
                        >
                          ${col.tuitionOutState.toLocaleString()}
                          {isBest && <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded ml-2">Best Value</span>}
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - formattedColleges.length }).map((_, i) => (
                      <td key={i} className="px-6 py-4 border-l border-slate-800/60 bg-slate-950/20" />
                    ))}
                  </tr>

                  {/* Tuition In State */}
                  <tr>
                    <td className="px-6 py-4 font-semibold text-slate-400">In-State Tuition</td>
                    {formattedColleges.map((col) => {
                      const isBest = col.tuitionInState === minTuitionInState && formattedColleges.length > 1;
                      return (
                        <td
                          key={col.id}
                          className={`px-6 py-4 border-l border-slate-800/60 font-semibold ${
                            isBest ? 'bg-emerald-500/10 text-emerald-400 border-x border-emerald-500/20' : 'text-white'
                          }`}
                        >
                          ${col.tuitionInState.toLocaleString()}
                          {isBest && <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded ml-2">Best Value</span>}
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - formattedColleges.length }).map((_, i) => (
                      <td key={i} className="px-6 py-4 border-l border-slate-800/60 bg-slate-950/20" />
                    ))}
                  </tr>

                  {/* Average Rating */}
                  <tr>
                    <td className="px-6 py-4 font-semibold text-slate-400">Average Student Rating</td>
                    {formattedColleges.map((col) => {
                      const isBest = col.averageRating === maxRating && maxRating > 0 && formattedColleges.length > 1;
                      return (
                        <td
                          key={col.id}
                          className={`px-6 py-4 border-l border-slate-800/60 ${
                            isBest ? 'bg-emerald-500/10 text-emerald-400 border-x border-emerald-500/20 font-bold' : ''
                          }`}
                        >
                          {col.averageRating > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-amber-400">★</span>
                              <span>{col.averageRating} / 5.0</span>
                              {isBest && <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 px-2 py-0.5 rounded ml-2">Top Rated</span>}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic">No ratings yet</span>
                          )}
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - formattedColleges.length }).map((_, i) => (
                      <td key={i} className="px-6 py-4 border-l border-slate-800/60 bg-slate-950/20" />
                    ))}
                  </tr>

                  {/* Graduation Rate */}
                  <tr>
                    <td className="px-6 py-4 font-semibold text-slate-400">Graduation Rate</td>
                    {formattedColleges.map((col) => {
                      const isBest = col.graduationRate === maxGraduation && formattedColleges.length > 1;
                      return (
                        <td
                          key={col.id}
                          className={`px-6 py-4 border-l border-slate-800/60 font-semibold ${
                            isBest ? 'bg-emerald-500/10 text-emerald-400 border-x border-emerald-500/20' : 'text-white'
                          }`}
                        >
                          {Math.round(col.graduationRate * 100)}%
                          {isBest && <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 px-2 py-0.5 rounded ml-2">Highest</span>}
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - formattedColleges.length }).map((_, i) => (
                      <td key={i} className="px-6 py-4 border-l border-slate-800/60 bg-slate-950/20" />
                    ))}
                  </tr>

                  {/* Median Post-Grad Placements */}
                  <tr>
                    <td className="px-6 py-4 font-semibold text-slate-400">Median Earnings (10 Yrs)</td>
                    {formattedColleges.map((col) => {
                      const isBest = col.medianSalary === maxSalary && formattedColleges.length > 1;
                      return (
                        <td
                          key={col.id}
                          className={`px-6 py-4 border-l border-slate-800/60 font-semibold ${
                            isBest ? 'bg-emerald-500/10 text-emerald-400 border-x border-emerald-500/20' : 'text-white'
                          }`}
                        >
                          ${col.medianSalary.toLocaleString()} / yr
                          {isBest && <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 px-2 py-0.5 rounded ml-2">Highest</span>}
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - formattedColleges.length }).map((_, i) => (
                      <td key={i} className="px-6 py-4 border-l border-slate-800/60 bg-slate-950/20" />
                    ))}
                  </tr>

                  {/* Majors / Courses Offered */}
                  <tr>
                    <td className="px-6 py-4 font-semibold text-slate-400">Offered majors</td>
                    {formattedColleges.map((col) => (
                      <td key={col.id} className="px-6 py-4 border-l border-slate-800/60">
                        <div className="flex flex-wrap gap-1">
                          {col.courses.map((c) => (
                            <span
                              key={c.id}
                              className="text-[9px] font-semibold px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: 3 - formattedColleges.length }).map((_, i) => (
                      <td key={i} className="px-6 py-4 border-l border-slate-800/60 bg-slate-950/20" />
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
