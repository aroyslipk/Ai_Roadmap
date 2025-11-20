'use client';

import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState<string>('unknown');

  useEffect(() => {
    // Check initial status
    const checkStatus = async () => {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        setNetworkType(status.connectionType);
      } catch (error) {
        // Fallback to browser API if Capacitor is not available
        setIsOnline(navigator.onLine);
      }
    };

    checkStatus();

    // Listen for network changes
    const handler = Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected);
      setNetworkType(status.connectionType);
    });

    // Fallback browser listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      handler.then(h => h.remove());
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, networkType };
}
