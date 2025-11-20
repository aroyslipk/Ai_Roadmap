'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { useIsClient } from '@/hooks/use-is-client';
import ClientOnly from './client-only';

interface TaskItemProps {
  task: Task;
  onToggle: (completed: boolean) => void;
}

export default function TaskItem({ task, onToggle }: TaskItemProps) {
  const checkboxId = `task-${task.id}`;
  const isClient = useIsClient();

  if (!isClient) {
    return (
        <div className="flex items-start space-x-3">
            <Skeleton className="h-4 w-4 rounded-sm mt-1" />
            <div className="grid gap-1.5 leading-none w-full">
                <Skeleton className="h-5 w-3/4" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex items-start space-x-3">
      <Checkbox
        id={checkboxId}
        checked={task.isCompleted}
        onCheckedChange={(checked) => onToggle(!!checked)}
        className="mt-1"
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor={checkboxId}
          className={cn(
            'text-base font-medium',
            task.isCompleted ? 'line-through text-muted-foreground' : ''
          )}
        >
          {task.title}
        </Label>
        <ClientOnly>
          {task.isCompleted && task.completedAt && (
              <p className="text-xs text-muted-foreground">
                  Completed on {format(new Date(task.completedAt), 'PP')}
              </p>
          )}
        </ClientOnly>
      </div>
    </div>
  );
}
