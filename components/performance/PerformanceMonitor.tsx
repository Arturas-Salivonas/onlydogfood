'use client';

import { useEffect } from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Import web-vitals dynamically to avoid SSR issues
    import('web-vitals').then((webVitals) => {
      // Track Core Web Vitals
      webVitals.onCLS(sendToAnalytics);
      webVitals.onINP(sendToAnalytics);
      webVitals.onFCP(sendToAnalytics);
      webVitals.onLCP(sendToAnalytics);
      webVitals.onTTFB(sendToAnalytics);

      // Additional performance metrics
      if ('PerformanceObserver' in window) {
        // Track navigation timing
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              sendToAnalytics({
                name: 'NavigationTiming',
                value: navEntry.loadEventEnd - navEntry.fetchStart,
                id: 'nav-timing',
                delta: 0,
              });
            }
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });

        // Track resource loading
        const resourceObserver = new PerformanceObserver((list) => {
          const resources = list.getEntries().filter(entry =>
            entry.duration > 1000 // Only track slow resources
          );

          if (resources.length > 0) {
            sendToAnalytics({
              name: 'SlowResources',
              value: resources.length,
              id: 'slow-resources',
              delta: 0,
            });
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

        // Track long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          sendToAnalytics({
            name: 'LongTasks',
            value: list.getEntries().length,
            id: 'long-tasks',
            delta: 0,
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      }
    });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendToAnalytics({
          name: 'PageHidden',
          value: Date.now(),
          id: 'page-visibility',
          delta: 0,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}

function sendToAnalytics(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', metric);
  }

  // Send to analytics service (Google Analytics, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      custom_map: { metric_value: metric.value },
      non_interaction: true,
    });
  }

  // You can also send to other analytics services here
  // Example: Sentry, LogRocket, etc.
}



