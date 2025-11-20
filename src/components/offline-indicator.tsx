'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white shadow-lg">
      <WifiOff className="h-5 w-5" />
      <span className="text-sm font-medium">You're offline</span>
    </div>
  );
}

export function NetworkStatusBadge() {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-orange-500" />
      )}
      <span className="text-xs text-muted-foreground">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
