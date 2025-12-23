import { useState, useEffect } from 'react';

interface Stats {
  totalProducts: number;
  totalBrands: number;
  averageScore: number;
  lastUpdated: string;
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try to get from localStorage first (client-side cache)
        const cached = localStorage.getItem('homepage-stats');
        const cacheExpiry = localStorage.getItem('homepage-stats-expiry');

        if (cached && cacheExpiry) {
          const expiryTime = parseInt(cacheExpiry);
          const now = Date.now();

          // If cache is still valid (24 hours), use it
          if (now < expiryTime) {
            setStats(JSON.parse(cached));
            setIsLoading(false);
            return;
          }
        }

        // Fetch from API
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data: Stats = await response.json();

        // Cache in localStorage for 24 hours
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem('homepage-stats', JSON.stringify(data));
        localStorage.setItem('homepage-stats-expiry', expiryTime.toString());

        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');

        // Fallback stats if API fails
        setStats({
          totalProducts: 200,
          totalBrands: 50,
          averageScore: 87,
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}