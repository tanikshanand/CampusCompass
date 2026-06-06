import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { Prisma } from '@prisma/client';
import SearchInput from '@/components/search/SearchInput';
import FilterSidebar from '@/components/search/FilterSidebar';
import CollegeCard from '@/components/college/CollegeCard';
import Pagination from '@/components/search/Pagination';
import { logoutUser } from '@/app/(auth)/actions';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CollegesPage({ searchParams }: PageProps) {
  // Await searchParams as required by Next.js 15
  const resolvedParams = await searchParams;

  // Extract query filters
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  
  const state = typeof resolvedParams.state === 'string'
    ? resolvedParams.state.split(',').filter(Boolean)
    : Array.isArray(resolvedParams.state)
      ? resolvedParams.state.filter(Boolean)
      : undefined;

  const category = typeof resolvedParams.category === 'string'
    ? resolvedParams.category.split(',').filter(Boolean)
    : Array.isArray(resolvedParams.category)
      ? resolvedParams.category.filter(Boolean)
      : undefined;

  const tuitionMax = typeof resolvedParams.tuitionMax === 'string'
    ? parseInt(resolvedParams.tuitionMax)
    : undefined;

  const admissionRateMax = typeof resolvedParams.admissionRateMax === 'string'
    ? parseFloat(resolvedParams.admissionRateMax)
    : undefined;

  const page = typeof resolvedParams.page === 'string' ? Math.max(1, parseInt(resolvedParams.page)) : 1;
  const limit = 6; // 6 items per page for visual balance

  // 1. Check User session & bookmarks
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const savedCollegeIds = new Set<string>();

  if (userId) {
    const bookmarks = await db.savedCollege.findMany({
      where: { userId },
      select: { collegeId: true },
    });
    bookmarks.forEach((b) => savedCollegeIds.add(b.collegeId));

    // Natively Log Search History in background
    if (q) {
      try {
        await db.searchHistory.create({
          data: {
            userId,
            query: q,
            filters: state || category ? JSON.stringify({ state, category }) : undefined,
          },
        });
      } catch (err) {
        console.error('Failed to log search history:', err);
      }
    }
  }

  // 2. Build Prisma Filter Clause
  const where: Prisma.CollegeWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { city: { contains: q } },
    ];
  }

  if (state && state.length > 0) {
    where.state = { in: state };
  }

  if (tuitionMax !== undefined) {
    where.tuitionOutState = { lte: tuitionMax };
  }

  if (admissionRateMax !== undefined) {
    where.admissionRate = { lte: admissionRateMax };
  }

  if (category && category.length > 0) {
    where.courses = {
      some: {
        course: {
          category: {
            in: category,
          },
        },
      },
    };
  }

  // 3. Query Database
  const skip = (page - 1) * limit;
  const [colleges, totalCount] = await Promise.all([
    db.college.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      include: {
        courses: {
          select: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    }),
    db.college.count({ where }),
  ]);

  const formattedColleges = colleges.map((col) => ({
    ...col,
    courses: col.courses.map((c) => c.course),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Header / Navbar */}
      <header className="bg-slate-900/40 border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/colleges" className="flex items-center gap-2 group">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:from-indigo-300 group-hover:to-purple-300 transition duration-200">
              🎓 CampusCompass
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/colleges" className="text-indigo-400">
              Colleges
            </Link>
            <Link href="/compare" className="hover:text-white transition">
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
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 space-y-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Discover Colleges & Universities
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Filter through our curated database of colleges, explore degree courses, compare tuition budgets, and save choices to your applications checklist.
          </p>
        </div>

        {/* Global Search Box */}
        <div className="flex items-center pt-2">
          <SearchInput />
        </div>
      </div>

      {/* Search Layout Grid */}
      <main className="max-w-7xl mx-auto px-6 mt-6 flex flex-col md:flex-row gap-8">
        {/* Left Filters Sidebar */}
        <FilterSidebar />

        {/* Right Search Results */}
        <div className="flex-grow space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Showing <span className="text-slate-200 font-bold">{colleges.length}</span> of{' '}
              <span className="text-slate-200 font-bold">{totalCount}</span> Colleges Found
            </p>
          </div>

          {formattedColleges.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
              <p className="text-lg text-slate-400 font-medium">No colleges match your filter options.</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing some query tags or resetting range sliders.</p>
              <Link
                href="/colleges"
                className="mt-4 inline-block bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Reset Search
              </Link>
            </div>
          ) : (
            <>
              {/* Colleges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {formattedColleges.map((col) => (
                  <CollegeCard
                    key={col.id}
                    college={col}
                    isSaved={savedCollegeIds.has(col.id)}
                  />
                ))}
              </div>

              {/* Paginated Navigation */}
              <Pagination page={page} pages={totalPages} searchParams={resolvedParams} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
