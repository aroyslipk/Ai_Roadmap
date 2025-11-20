'use client';

import { Button } from '@/components/ui/button';
import type { Resource } from '@/types';
import { cn } from '@/lib/utils';
import { Star, Check, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ResourceItemProps {
  resource: Resource;
  onUpdate: (newResource: Partial<Resource>) => void;
}

export default function ResourceItem({ resource, onUpdate }: ResourceItemProps) {
  return (
    <div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'font-medium hover:underline flex items-center gap-2',
          resource.isCompleted && 'line-through text-muted-foreground'
        )}
      >
        {resource.title}
        <ExternalLink className="h-3 w-3" />
      </a>
      <div className="flex items-center gap-1 mt-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdate({ isFavorited: !resource.isFavorited })}
          aria-label="Favorite"
        >
          <Star
            className={cn(
              'h-4 w-4',
              resource.isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            )}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdate({ isCompleted: !resource.isCompleted })}
          aria-label="Mark as completed"
        >
          <Check
            className={cn(
              'h-4 w-4',
              resource.isCompleted ? 'text-green-500' : 'text-muted-foreground'
            )}
          />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdate({ rating: 'helpful' })}
          aria-label="Helpful"
        >
          <ThumbsUp
            className={cn(
              'h-4 w-4',
              resource.rating === 'helpful' ? 'text-blue-500' : 'text-muted-foreground'
            )}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdate({ rating: 'not_helpful' })}
          aria-label="Not helpful"
        >
          <ThumbsDown
            className={cn(
              'h-4 w-4',
              resource.rating === 'not_helpful' ? 'text-red-500' : 'text-muted-foreground'
            )}
          />
        </Button>
      </div>
    </div>
  );
}
