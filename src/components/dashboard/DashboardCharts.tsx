'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ChartItem {
  name: string;
  tuition: number;
}

interface DashboardChartsProps {
  data: ChartItem[];
  budgetMax: number | null;
}

export default function DashboardCharts({ data, budgetMax }: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Avoid SSR hydration mismatch issues by only rendering Recharts after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/20 border border-slate-800/60 rounded-2xl animate-pulse">
        <span className="text-xs text-slate-500">Loading analytics matrix...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/20 border border-slate-800/60 rounded-2xl">
        <p className="text-xs text-slate-500 italic">No college tuition data found to display. Bookmark colleges to begin.</p>
      </div>
    );
  }

  // Format data for shorter X-Axis labels
  const chartData = data.map((item) => ({
    name: item.name.length > 15 ? `${item.name.substring(0, 12)}...` : item.name,
    fullName: item.name,
    Tuition: item.tuition,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl space-y-0.5">
          <p className="text-xs font-bold text-white">{dataPoint.fullName}</p>
          <p className="text-xs text-indigo-400 font-semibold">
            Tuition: <span className="text-slate-200">${dataPoint.Tuition.toLocaleString()}</span>
          </p>
          {budgetMax && (
            <p className="text-[10px] text-slate-500 font-medium">
              Budget Diff: ${ (budgetMax - dataPoint.Tuition).toLocaleString() }
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📈</span> Tuition Cost vs. Budget Max
          </h3>
          <p className="text-[11px] text-slate-500">
            Out-of-state tuition compared against your preference budget limit.
          </p>
        </div>
        {budgetMax && (
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Budget Cap: ${budgetMax.toLocaleString()}
          </span>
        )}
      </div>

      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="Tuition" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={48} />
            {budgetMax && (
              <ReferenceLine
                y={budgetMax}
                stroke="#ec4899"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: 'Max Budget',
                  position: 'top',
                  fill: '#ec4899',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
