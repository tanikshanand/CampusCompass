import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import BookmarkButton from '@/components/college/BookmarkButton';
import ReviewForm from '@/components/college/ReviewForm';
import { logoutUser } from '@/app/(auth)/actions';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate SEO-friendly dynamic metadata tags
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const college = await db.college.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!college) {
    return {
      title: 'College Not Found | CollegeHub',
    };
  }

  return {
    title: `${college.name} - Tuition, Admissions, & Reviews | CollegeHub`,
    description: college.description.substring(0, 160),
    openGraph: {
      title: `${college.name} Stats`,
      description: college.description.substring(0, 160),
    },
  };
}

export default async function CollegeDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Query college details
  const college = await db.college.findUnique({
    where: { slug },
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
      reviews: {
        select: {
          id: true,
          rating: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!college) {
    notFound();
  }

  // 2. Compute aggregate ratings on the fly
  const totalReviews = college.reviews.length;
  const averageRating =
    totalReviews > 0
      ? Number((college.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
      : null;

  // 3. Check session for bookmarks
  const session = await auth();
  const userId = (session?.user as any)?.id;
  let isSaved = false;

  if (userId) {
    const bookmark = await db.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId: college.id,
        },
      },
    });
    isSaved = !!bookmark;
  }

  const displayImage = college.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200';
  const displayLogo = college.logoUrl || 'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&q=80&w=200';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
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

      {/* Hero Banner Section */}
      <section className="relative h-96 bg-slate-900 overflow-hidden">
        <img
          src={displayImage}
          alt={college.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-8 md:p-12">
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo Frame */}
              <div className="h-20 w-20 rounded-2xl bg-white p-2 shadow-2xl shrink-0 border border-slate-700/50 flex items-center justify-center">
                <img
                  src={displayLogo}
                  alt={`${college.name} Logo`}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {college.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-1.5">
                    📍 {college.city}, {college.state}
                  </span>
                  <span>•</span>
                  <span className="text-indigo-400 font-semibold">{college.country}</span>
                  {averageRating && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        ★ {averageRating}{' '}
                        <span className="text-xs text-slate-400 font-normal">
                          ({totalReviews} reviews)
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Bookmark button */}
            <div className="flex items-center gap-3 self-start md:self-end">
              {college.websiteUrl && (
                <a
                  href={college.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 text-slate-200 px-5 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition"
                >
                  Visit Official Website ↗
                </a>
              )}
              <BookmarkButton collegeId={college.id} initialSaved={isSaved} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Narrative details, Courses, and Reviews) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Overview */}
          <section id="overview" className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📝</span> Institution Overview
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line">
              {college.description}
            </p>
          </section>

          {/* Courses / Majors */}
          <section id="courses" className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📚</span> Courses & Programs Offered
            </h2>
            {college.courses && college.courses.length > 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex flex-wrap gap-2.5">
                  {college.courses.map(({ course }) => (
                    <span
                      key={course.id}
                      className="text-xs font-semibold px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition cursor-default"
                    >
                      {course.name} ({course.code})
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No major disciplines cataloged at this time.</p>
            )}
          </section>

          {/* Fees Detail Table */}
          <section id="fees" className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💰</span> Tuition & Expenses
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Expense Category</th>
                    <th className="px-6 py-4 text-right">In-State Cost</th>
                    <th className="px-6 py-4 text-right">Out-of-State Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="px-6 py-4 font-semibold text-white">Base Tuition (Annual)</td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${college.tuitionInState.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${college.tuitionOutState.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-white">Estimated Fees & Supplies</td>
                    <td className="px-6 py-4 text-right">$1,250</td>
                    <td className="px-6 py-4 text-right">$1,250</td>
                  </tr>
                  <tr className="bg-slate-900/20">
                    <td className="px-6 py-4 font-bold text-white">Estimated Total (Before Aid)</td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-400">
                      ${(college.tuitionInState + 1250).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-400">
                      ${(college.tuitionOutState + 1250).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Student Reviews Feed */}
          <section id="reviews" className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>✍️</span> Student Reviews ({college.reviews.length})
            </h2>

            {/* Submit form */}
            <ReviewForm collegeId={college.id} />

            {/* List */}
            {college.reviews.length === 0 ? (
              <div className="text-center py-12 border border-slate-800 rounded-2xl bg-slate-900/10">
                <p className="text-sm text-slate-500">No reviews submitted yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {college.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                          alt={review.user.name || 'Student'}
                          className="h-8 w-8 rounded-full border border-indigo-500/20 object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-200">
                            {review.user.name || 'Verified Student'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Score stars */}
                      <div className="flex items-center gap-0.5 text-sm text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-light">
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Key Admission & Placement stats) */}
        <div className="space-y-6 lg:self-start lg:sticky lg:top-24">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Admission Selectivity
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Acceptance Rate</span>
                <span className="text-base font-extrabold text-white">
                  {Math.round(college.admissionRate * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${college.admissionRate * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Acceptance rate represents the percentage of applicants admitted. A lower rate indicates higher selectivity.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Career & Graduation
            </h3>
            
            <div className="space-y-5">
              {/* Graduation Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Graduation Rate</span>
                  <span className="text-base font-extrabold text-white">
                    {Math.round(college.graduationRate * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${college.graduationRate * 100}%` }}
                  />
                </div>
              </div>

              {/* Placement / Salary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Median Earnings</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    $74,500 / yr
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Median placement salary of students 10 years after enrollment, showing strong return on tuition investment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
