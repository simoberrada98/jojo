'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

const SERVICE_WORKER_PATH = '/service-worker.js';

export function ServiceWorkerProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    if (!('serviceWorker' in navigator)) {
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
          scope: '/',
        });
      } catch (error) {
        logger.error('Service worker registration failed', error as Error);
      }
    };

    void register();
  }, []);

  return null;
}
