'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log web vitals to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }
    
    // Send metrics to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Replace with your analytics service
      // Example: trackWebVitals(metric);
    }
  });

  return null;
}
