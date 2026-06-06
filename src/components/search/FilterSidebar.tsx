'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const STATES = [
  { label: 'California (CA)', value: 'CA' },
  { label: 'Massachusetts (MA)', value: 'MA' },
  { label: 'Michigan (MI)', value: 'MI' },
  { label: 'Texas (TX)', value: 'TX' },
];

const CATEGORIES = [
  { label: 'Computer Science', value: 'Computer Science' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Business', value: 'Business' },
  { label: 'Sciences', value: 'Sciences' },
  { label: 'Social Sciences', value: 'Social Sciences' },
  { label: 'Humanities', value: 'Humanities' },
];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for sliders to make drag transitions fluid
  const [tuitionMax, setTuitionMax] = useState(75000);
  const [admissionMax, setAdmissionMax] = useState(100);

  // Sync sliders when URL updates (e.g. on reset or back navigation)
  useEffect(() => {
    const urlTuition = searchParams.get('tuitionMax');
    setTuitionMax(urlTuition ? parseInt(urlTuition) : 75000);

    const urlAdmission = searchParams.get('admissionRateMax');
    setAdmissionMax(urlAdmission ? Math.round(parseFloat(urlAdmission) * 100) : 100);
  }, [searchParams]);

  const getActiveList = (key: string): string[] => {
    return searchParams.getAll(key).flatMap((val) => val.split(',')).filter(Boolean);
  };

  const handleCheckboxChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentList = getActiveList(key);

    let updatedList: string[];
    if (currentList.includes(value)) {
      updatedList = currentList.filter((v) => v !== value);
    } else {
      updatedList = [...currentList, value];
    }

    params.delete(key);
    if (updatedList.length > 0) {
      params.set(key, updatedList.join(','));
    }
    params.set('page', '1'); // Reset pagination on change

    router.push(`/colleges?${params.toString()}`);
  };

  const applySliderValues = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Apply Tuition Limit
    if (tuitionMax < 75000) {
      params.set('tuitionMax', tuitionMax.toString());
    } else {
      params.delete('tuitionMax');
    }

    // Apply Admission Rate Limit
    if (admissionMax < 100) {
      params.set('admissionRateMax', (admissionMax / 100).toString());
    } else {
      params.delete('admissionRateMax');
    }

    params.set('page', '1');
    router.push(`/colleges?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/colleges');
  };

  const activeStates = getActiveList('state');
  const activeCategories = getActiveList('category');
  const hasFilters =
    searchParams.has('state') ||
    searchParams.has('category') ||
    searchParams.has('tuitionMax') ||
    searchParams.has('admissionRateMax');

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-8 w-full md:w-80 shrink-0">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>⚙️</span> Advanced Filters
        </h2>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* States Multi-Select */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">State / Region</h3>
        <div className="space-y-2">
          {STATES.map((state) => {
            const checked = activeStates.includes(state.value);
            return (
              <label key={state.value} className="flex items-center gap-3 cursor-pointer group text-sm text-slate-300 hover:text-white transition">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxChange('state', state.value)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 h-4 w-4 transition cursor-pointer"
                />
                <span className={checked ? 'text-white font-medium' : ''}>{state.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tuition Range Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Out-of-State Tuition</h3>
          <span className="text-xs font-bold text-indigo-400">
            {tuitionMax >= 75000 ? 'Any Cost' : `$${tuitionMax.toLocaleString()}`}
          </span>
        </div>
        <input
          type="range"
          min="10000"
          max="75000"
          step="2500"
          value={tuitionMax}
          onChange={(e) => setTuitionMax(parseInt(e.target.value))}
          onMouseUp={applySliderValues}
          onTouchEnd={applySliderValues}
          className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>$10,000</span>
          <span>$75,000+</span>
        </div>
      </div>

      {/* Admission Rate Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Admission Rate</h3>
          <span className="text-xs font-bold text-indigo-400">
            {admissionMax >= 100 ? 'Open (100%)' : `${admissionMax}%`}
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={admissionMax}
          onChange={(e) => setAdmissionMax(parseInt(e.target.value))}
          onMouseUp={applySliderValues}
          onTouchEnd={applySliderValues}
          className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>5% (Highly Selective)</span>
          <span>100% (Open)</span>
        </div>
      </div>

      {/* Academic/Major Categories */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Majors / Disciplines</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => {
            const checked = activeCategories.includes(cat.value);
            return (
              <label key={cat.value} className="flex items-center gap-3 cursor-pointer group text-sm text-slate-300 hover:text-white transition">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxChange('category', cat.value)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 h-4 w-4 transition cursor-pointer"
                />
                <span className={checked ? 'text-white font-medium' : ''}>{cat.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
