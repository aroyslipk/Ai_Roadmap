'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useIsClient } from '@/hooks/use-is-client';
import ClientOnly from './client-only';
import { cn } from '@/lib/utils';

interface ClockProps {
  className?: string;
}

export default function Clock({ className }: ClockProps) {
  const [time, setTime] = useState(() => new Date());
  const isClient = useIsClient();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  if (!isClient) {
    return (
      <div className={cn("hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground", className)}>
        <span className="w-24 h-4 bg-muted rounded animate-pulse"></span>
        <span className="w-20 h-4 bg-muted rounded animate-pulse"></span>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className={cn("hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground", className)}>
        <span>{format(time, 'eeee')}</span>
        <span className="font-mono">{format(time, 'HH:mm:ss')}</span>
      </div>
    </ClientOnly>
  );
}
