'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';
import { ReactNode } from 'react';

interface OnlineOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  message?: string;
}

export function OnlineOnly({ 
  children, 
  fallback,
  message = 'This feature requires an internet connection'
}: OnlineOnlyProps) {
  const { isOnline } = useNetworkStatus();

  if (!isOnline) {
    return fallback || (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to check if feature should be disabled
export function useOnlineOnly() {
  const { isOnline } = useNetworkStatus();
  return { isOnline, isOffline: !isOnline };
}
