'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/register-sw';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
