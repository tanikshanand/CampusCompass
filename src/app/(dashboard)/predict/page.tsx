import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import PreferenceForm from '@/components/college/PreferenceForm';
import BookmarkButton from '@/components/college/BookmarkButton';
import { calculateMatchScore } from '@/lib/predictor';
import { logoutUser } from '@/app/(auth)/actions';

export default async function PredictorPage() {
  const session = await auth();

  // Safeguard dashboard redirection
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;
  const userName = session.user.name || 'Student';
  const userImage = session.user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

  // 1. Fetch user preference metrics
  const preferences = await db.userPreference.findUnique({
    where: { userId },
  });

  // 2. Fetch all colleges with courses to calculate matches
  const colleges = await db.college.findMany({
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

  // 3. Fetch current user saved bookmark IDs
  const bookmarks = await db.savedCollege.findMany({
    where: { userId },
    select: { collegeId: true },
  });
  const savedIds = new Set(bookmarks.map((b) => b.collegeId));

  // 4. Calculate predictions if preferences exist
  const hasPreferences =
    preferences &&
    (preferences.examScore !== null ||
      preferences.budgetMax !== null ||
      preferences.preferredState !== null ||
      preferences.preferredCourse !== null);

  const predictions = hasPreferences
    ? colleges
        .map((col) => {
          const formattedCol = {
            ...col,
            courses: col.courses.map((c) => c.course),
          };
          const prediction = calculateMatchScore(formattedCol, preferences);
          return {
            college: col,
            ...prediction,
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Header bar */}
      <header className="bg-slate-900/40 border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/colleges" className="flex items-center gap-2 group">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:from-indigo-300 group-hover:to-purple-300 transition duration-200">
              🎓 CollegeHub
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/colleges" className="hover:text-white transition">
              Colleges
            </Link>
            <Link href="/compare" className="hover:text-white transition">
              Compare
            </Link>
            <Link href="/saved" className="hover:text-white transition">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src={userImage}
                alt="Profile"
                className="h-9 w-9 rounded-full border border-indigo-500/30 object-cover"
              />
              <span className="hidden md:inline text-sm font-semibold text-slate-200">
                {userName}
              </span>
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

      {/* Main page layout */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            College Match Predictor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Input your test scores, budget caps, and majors to run our weighted admissions score analyzer.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side: Preference Update Form */}
          <div className="w-full lg:w-80 shrink-0">
            <PreferenceForm initialData={preferences} />
          </div>

          {/* Right Side: Prediction results */}
          <div className="flex-grow space-y-6">
            {!hasPreferences ? (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 space-y-4">
                <p className="text-lg text-slate-400 font-medium">
                  Preferences incomplete.
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Provide your SAT/ACT score, tuition budget, or target majors in the criteria card to calculate your matching feasibility.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📊</span> Predicted College Match Ranking ({predictions.length})
                </h2>

                <div className="space-y-4">
                  {predictions.map(({ college, matchScore, category, explanation }) => (
                    <div
                      key={college.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md hover:border-slate-700 transition"
                    >
                      <div className="flex items-start md:items-center gap-5 flex-grow">
                        {/* Score Gauge Circle */}
                        <div className="h-16 w-16 rounded-full border-4 border-indigo-500/15 bg-slate-950 flex items-center justify-center shrink-0">
                          <span className="text-base font-extrabold text-indigo-400">
                            {matchScore}%
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/colleges/${college.slug}`}
                              className="text-lg font-bold text-white hover:underline line-clamp-1"
                            >
                              {college.name}
                            </Link>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                category === 'SAFE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : category === 'TARGET'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              }`}
                            >
                              {category}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-400 font-medium">
                            📍 {college.city}, {college.state} | Tuition: ${college.tuitionOutState.toLocaleString()}
                          </p>

                          <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-2">
                            {explanation}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                        <Link
                          href={`/colleges/${college.slug}`}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                        >
                          View Page
                        </Link>
                        <BookmarkButton
                          collegeId={college.id}
                          initialSaved={savedIds.has(college.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
