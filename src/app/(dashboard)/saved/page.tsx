import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { logoutUser } from '@/app/(auth)/actions';
import { saveCollegeAction, removeCollegeAction } from '@/app/actions/saved';
import ShortlistSelector from '@/components/college/ShortlistSelector';
import { calculateMatchScore } from '@/lib/predictor';
import DashboardCharts from '@/components/dashboard/DashboardCharts';


// Form actions
async function handleRemoveBookmark(formData: FormData) {
  'use server';
  const collegeId = formData.get('collegeId') as string;
  if (!collegeId) return;

  try {
    await removeCollegeAction(collegeId);
  } catch (error) {
    console.error('Failed to remove bookmark on dashboard:', error);
  }
}

async function handleUpdateNotes(formData: FormData) {
  'use server';
  const collegeId = formData.get('collegeId') as string;
  const notes = formData.get('notes') as string;
  if (!collegeId) return;

  try {
    await saveCollegeAction(collegeId, notes);
  } catch (error) {
    console.error('Failed to update notes on dashboard:', error);
  }
}

export default async function SavedCollegesDashboard() {
  const session = await auth();

  // Safeguard dashboard redirection
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;
  const userName = session.user.name || 'Student';
  const userImage = session.user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

  // 1. Fetch user preferences, search logs, and comparison logs
  const [preferences, searchHistory, comparisonHistory] = await Promise.all([
    db.userPreference.findUnique({ where: { userId } }),
    db.searchHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 4 }),
    db.comparisonHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ]);

  // 2. Fetch saved colleges
  const savedColleges = await db.savedCollege.findMany({
    where: { userId },
    include: {
      college: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          state: true,
          tuitionOutState: true,
          admissionRate: true,
          graduationRate: true,
          imageUrl: true,
          logoUrl: true,
          satReadingMin: true,
          satReadingMax: true,
          satMathMin: true,
          satMathMax: true,
          actCompositeMin: true,
          actCompositeMax: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate most preferred location from saved colleges
  const locationsMap = new Map<string, number>();
  savedColleges.forEach((sc) => {
    locationsMap.set(sc.college.state, (locationsMap.get(sc.college.state) || 0) + 1);
  });
  const mostPreferredLocation = locationsMap.size > 0
    ? Array.from(locationsMap.entries()).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    : 'None';

  // Format Recharts data
  const chartData = savedColleges.map((sc) => ({
    name: sc.college.name,
    tuition: sc.college.tuitionOutState,
  }));

  // 3. Personalized Recommendations logic
  // Fetch up to 3 colleges that are not bookmarked yet and match criteria
  const savedIds = new Set(savedColleges.map((s) => s.collegeId));
  
  const matchesFilter: any = {
    id: { notIn: Array.from(savedIds) },
  };

  if (preferences) {
    const OR_conds = [];
    if (preferences.preferredState) {
      OR_conds.push({ state: { equals: preferences.preferredState, mode: 'insensitive' as const } });
    }
    if (preferences.preferredCourse) {
      OR_conds.push({
        courses: {
          some: {
            course: {
              category: { contains: preferences.preferredCourse, mode: 'insensitive' as const },
            },
          },
        },
      });
    }
    if (OR_conds.length > 0) {
      matchesFilter.OR = OR_conds;
    }
    if (preferences.budgetMax) {
      matchesFilter.tuitionOutState = { lte: preferences.budgetMax };
    }
  }

  const recommendations = await db.college.findMany({
    where: matchesFilter,
    take: 3,
    include: {
      courses: {
        select: {
          course: {
            select: {
              name: true,
              category: true,
            },
          },
        },
      },
    },
  });

  const formattedRecommendations = recommendations.map((col) => {
    const formattedCol = {
      ...col,
      courses: col.courses.map((c) => c.course),
    };
    const score = preferences
      ? calculateMatchScore(formattedCol, preferences).matchScore
      : 50; // default middle fallback
    return {
      ...col,
      score,
    };
  }).sort((a, b) => b.score - a.score);

  // Group Bookmarked Colleges by shortlist categories
  const dreamColleges = savedColleges.filter((c) => c.category === 'DREAM');
  const targetColleges = savedColleges.filter((c) => c.category === 'TARGET');
  const safeColleges = savedColleges.filter((c) => c.category === 'SAFE');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
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
            <Link href="/compare" className="hover:text-white transition">
              Compare
            </Link>
            <Link href="/saved" className="text-indigo-400">
              Dashboard
            </Link>
            <Link href="/predict" className="hover:text-white transition">
              Predictor
            </Link>
          </nav>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src={userImage}
                alt="Profile"
                className="h-9 w-9 rounded-full border border-indigo-500/30 object-cover"
              />
              <span className="hidden md:inline text-sm font-semibold text-slate-200">{userName}</span>
            </div>

            <form action={logoutUser}>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white rounded-lg px-4 py-1.5 text-xs font-semibold transition duration-200"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* User Card & Dynamic Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/50">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Student Hub Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Analyze saved colleges, review search queries, and view personalized recommendation fits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/predict"
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
            >
              Analyze Score Matches
            </Link>
            <Link
              href="/colleges"
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-indigo-600/10 transition"
            >
              Explore Colleges
            </Link>
          </div>
        </div>

        {/* Analytics Summary Cards Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Choices</p>
            <p className="text-2xl font-black text-white mt-1">{savedColleges.length}</p>
            <p className="text-[10px] text-slate-450 mt-1">Colleges in Shortlist</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Searches Logged</p>
            <p className="text-2xl font-black text-white mt-1">{searchHistory.length}</p>
            <p className="text-[10px] text-slate-450 mt-1">Recent search keywords</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Comparisons Made</p>
            <p className="text-2xl font-black text-white mt-1">{comparisonHistory.length}</p>
            <p className="text-[10px] text-slate-450 mt-1">Compared college cohorts</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred State</p>
            <p className="text-2xl font-black text-indigo-400 mt-1">{mostPreferredLocation}</p>
            <p className="text-[10px] text-slate-450 mt-1">Based on saved locations</p>
          </div>
        </section>

        {/* Recharts dynamic financial overview section */}
        {chartData.length > 0 && (
          <section className="w-full">
            <DashboardCharts data={chartData} budgetMax={preferences?.budgetMax || null} />
          </section>
        )}

        {/* Sidebar History Logs + Main Shortlists layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Shortlist Columns (Left 70%) */}
          <div className="flex-grow space-y-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🔖</span> My CampusCompass Shortlists
            </h2>

            {savedColleges.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                <p className="text-sm text-slate-450">No saved choices listed. Search schools and add them to get started.</p>
                <Link href="/colleges" className="text-indigo-400 hover:underline text-xs mt-2 inline-block">
                  Explore catalogs →
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Dream Colleges Column */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    Dream Colleges ({dreamColleges.length})
                  </h3>
                  {dreamColleges.length === 0 ? (
                    <p className="text-xs text-slate-600 italic px-2">No colleges categorized as dream reach choices.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dreamColleges.map((sc) => renderSavedCard(sc))}
                    </div>
                  )}
                </div>

                {/* 2. Target Colleges Column */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Target Colleges ({targetColleges.length})
                  </h3>
                  {targetColleges.length === 0 ? (
                    <p className="text-xs text-slate-600 italic px-2">No colleges categorized as target fit choices.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {targetColleges.map((sc) => renderSavedCard(sc))}
                    </div>
                  )}
                </div>

                {/* 3. Safe Colleges Column */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Safe Colleges ({safeColleges.length})
                  </h3>
                  {safeColleges.length === 0 ? (
                    <p className="text-xs text-slate-600 italic px-2">No colleges categorized as safe target choices.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {safeColleges.map((sc) => renderSavedCard(sc))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Side Info widgets (History logs + Recommendations) */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            {/* Preferences Profile Card */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/10 rounded-2xl p-5 shadow-md space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>🎯 Match Preferences</span>
                <Link href="/predict" className="text-xxs font-bold text-indigo-400 hover:underline uppercase">
                  Edit
                </Link>
              </h3>
              {preferences ? (
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Preferred State</span>
                    <span className="font-semibold text-slate-200">{preferences.preferredState || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Preferred Major</span>
                    <span className="font-semibold text-slate-200 truncate block">{preferences.preferredCourse || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Max Budget</span>
                    <span className="font-semibold text-slate-200">
                      {preferences.budgetMax ? `$${preferences.budgetMax.toLocaleString()}` : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Admissions Score</span>
                    <span className="font-semibold text-slate-200">
                      {preferences.examType && preferences.examScore ? `${preferences.examType} ${preferences.examScore}` : 'Not set'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No preferences set. Configure filters inside predictor.</p>
              )}
            </div>

            {/* Recommendations Widget */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>✨</span> Personalized Recommendations
              </h3>

              {formattedRecommendations.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Configure preferences to calculate recommended matches.</p>
              ) : (
                <div className="space-y-3">
                  {formattedRecommendations.map((col) => (
                    <div
                      key={col.id}
                      className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex justify-between items-center gap-3 hover:border-slate-800 transition"
                    >
                      <div className="space-y-0.5 truncate">
                        <Link
                          href={`/colleges/${col.slug}`}
                          className="text-xs font-bold text-slate-200 hover:text-white hover:underline truncate block"
                        >
                          {col.name}
                        </Link>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                          {col.city}, {col.state}
                        </span>
                      </div>
                      <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-indigo-400">{col.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search History Logs */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🔍</span> Recent Searches
              </h3>
              {searchHistory.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No search logs recorded.</p>
              ) : (
                <div className="space-y-2.5">
                  {searchHistory.map((hist) => (
                    <div key={hist.id} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">🕐</span>
                      <div className="truncate flex-grow">
                        <Link
                          href={`/colleges?q=${encodeURIComponent(hist.query)}`}
                          className="text-slate-300 hover:text-indigo-400 hover:underline truncate block"
                        >
                          "{hist.query}"
                        </Link>
                        {hist.filters && (
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">
                            Filters: {JSON.stringify(hist.filters)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub component to render each individual saved card layout
function renderSavedCard(sc: any) {
  const { college, notes, category } = sc;
  const displayImage = college.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600';
  const displayLogo = college.logoUrl || 'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&q=80&w=100';

  return (
    <div
      key={college.id}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-slate-800 transition duration-300 flex flex-col justify-between"
    >
      <div className="relative h-36 bg-slate-900">
        <img
          src={displayImage}
          alt={college.name}
          className="w-full h-full object-cover opacity-80"
        />
        {/* Glass Overlay Title */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-4">
          <div className="flex items-center gap-3">
            {college.logoUrl && (
              <img
                src={displayLogo}
                alt={`${college.name} Logo`}
                className="h-10 w-10 rounded-lg bg-white object-contain p-1 border border-slate-200"
              />
            )}
            <div>
              <Link href={`/colleges/${college.slug}`} className="hover:underline">
                <h4 className="text-sm font-bold text-white drop-shadow-md line-clamp-1">
                  {college.name}
                </h4>
              </Link>
              <p className="text-[10px] text-slate-300 drop-shadow-sm font-medium">
                {college.city}, {college.state}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content & Action Forms */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
        {/* Shortlist Category Selector & Bookmarks Delete button */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
          <ShortlistSelector collegeId={college.id} currentCategory={category} />
          
          <form action={handleRemoveBookmark}>
            <input type="hidden" name="collegeId" value={college.id} />
            <button
              type="submit"
              className="text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-wide px-2 py-0.5 border border-slate-800 bg-slate-900/40 rounded transition"
            >
              Remove
            </button>
          </form>
        </div>

        {/* Interactive Notes form */}
        <form action={handleUpdateNotes} className="space-y-1.5">
          <input type="hidden" name="collegeId" value={college.id} />
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Notes & Application Tasks
            </label>
            <button
              type="submit"
              className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 px-1.5 py-0.5 border border-indigo-500/20 bg-indigo-500/5 rounded hover:bg-indigo-500/10 transition"
            >
              Save
            </button>
          </div>
          <textarea
            name="notes"
            defaultValue={notes || ''}
            placeholder="Write deadlines, essay prompt outline..."
            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-650 focus:outline-none focus:border-slate-800 min-h-[50px] resize-none transition"
          />
        </form>
      </div>
    </div>
  );
}
