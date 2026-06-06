import React from 'react';
import Link from 'next/link';
import BookmarkButton from './BookmarkButton';

interface Course {
  id: string;
  code: string;
  name: string;
  category: string;
}

interface CollegeCardProps {
  college: {
    id: string;
    slug: string;
    name: string;
    city: string;
    state: string;
    tuitionOutState: number;
    admissionRate: number;
    graduationRate: number;
    imageUrl: string | null;
    logoUrl: string | null;
    courses?: Course[];
  };
  isSaved?: boolean;
}

export default function CollegeCard({ college, isSaved = false }: CollegeCardProps) {
  const displayImage = college.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600';
  const displayLogo = college.logoUrl || 'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&q=80&w=100';

  return (
    <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between">
      {/* Media Banner */}
      <div className="relative h-44 bg-slate-900 overflow-hidden">
        <img
          src={displayImage}
          alt={college.name}
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-5">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="h-12 w-12 rounded-lg bg-white backdrop-blur-md p-1 shadow-md flex items-center justify-center shrink-0 border border-slate-200">
              <img
                src={displayLogo}
                alt={`${college.name} Logo`}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <Link href={`/colleges/${college.slug}`} className="hover:underline">
                <h3 className="text-base font-bold text-white drop-shadow-md line-clamp-1">
                  {college.name}
                </h3>
              </Link>
              <p className="text-xs text-slate-300 drop-shadow-sm font-medium">
                {college.city}, {college.state}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-5">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-3 gap-1.5 text-center bg-slate-950/40 border border-slate-800/40 rounded-xl p-3">
          <div>
            <p className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Tuition</p>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              ${college.tuitionOutState.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Admit Rate</p>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              {Math.round(college.admissionRate * 100)}%
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Grad Rate</p>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              {Math.round(college.graduationRate * 100)}%
            </p>
          </div>
        </div>

        {/* Top majors/courses categories (limited to 3) */}
        {college.courses && college.courses.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Top Majors Offered</p>
            <div className="flex flex-wrap gap-1.5">
              {college.courses.slice(0, 3).map((c) => (
                <span
                  key={c.id}
                  className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full"
                >
                  {c.name}
                </span>
              ))}
              {college.courses.length > 3 && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                  +{college.courses.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex gap-2 pt-3 border-t border-slate-800/60">
          <Link
            href={`/colleges/${college.slug}`}
            className="flex-grow bg-slate-800 hover:bg-slate-700/80 text-white rounded-lg px-4 py-2.5 text-xs font-semibold text-center transition duration-200"
          >
            View Details
          </Link>
          <BookmarkButton collegeId={college.id} initialSaved={isSaved} />
        </div>
      </div>
    </div>
  );
}
