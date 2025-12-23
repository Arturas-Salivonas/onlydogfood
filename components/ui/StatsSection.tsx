'use client';

import { useStats } from '@/hooks/useStats';

export function StatsSection() {
  const { stats, isLoading } = useStats();

  if (isLoading || !stats) {
    // Loading state with skeleton
    return (
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 animate-pulse">
            <div className="w-6 h-6 bg-white/20 rounded"></div>
            <div className="text-center">
              <div className="w-8 h-5 bg-white/20 rounded mb-1"></div>
              <div className="w-12 h-3 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        <span className="text-2xl">📦</span>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{stats.totalProducts}+</div>
          <div className="text-xs text-blue-100">Products Listed</div>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        <span className="text-2xl">🏢</span>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{stats.totalBrands}+</div>
          <div className="text-xs text-blue-100">Brands Analyzed</div>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        <span className="text-2xl">⭐</span>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{stats.averageScore}</div>
          <div className="text-xs text-blue-100">Avg. Score</div>
        </div>
      </div>
    </div>
  );
}