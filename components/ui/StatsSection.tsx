'use client';

import { useStats } from '@/hooks/useStats';

export function StatsSection() {
  const { stats, isLoading } = useStats();

  if (isLoading || !stats) {
    // Loading state with skeleton
    return (
      <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 bg-[var(--color-background-card)] px-6 py-3 rounded-lg border border-[var(--color-border)] shadow-[var(--shadow-small)] animate-pulse">
            <div className="text-center">
              <div className="w-12 h-6 bg-gray-200 rounded mb-1"></div>
              <div className="w-16 h-4 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
      <div className="flex items-center gap-3 bg-[var(--color-background-card)] px-6 py-3 rounded-lg border border-[var(--color-border)] shadow-[var(--shadow-small)]">
        <div className="text-center">
          <div className="text-xl font-bold text-[var(--color-text-primary)]">{stats.totalProducts}+</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Products listed</div>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-[var(--color-background-card)] px-6 py-3 rounded-lg border border-[var(--color-border)] shadow-[var(--shadow-small)]">
        <div className="text-center">
          <div className="text-xl font-bold text-[var(--color-text-primary)]">{stats.totalBrands}+</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Brands analyzed</div>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-[var(--color-background-card)] px-6 py-3 rounded-lg border border-[var(--color-border)] shadow-[var(--shadow-small)]">
        <div className="text-center">
          <div className="text-xl font-bold text-[var(--color-text-primary)]">{stats.averageScore}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Avg. score</div>
        </div>
      </div>
    </div>
  );
}
