'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BookOpen, Zap, Rocket, Globe } from 'lucide-react';

interface LearningPathSelectorProps {
  onSelectPath: (path: 'beginner' | 'intermediate' | 'advanced' | 'all') => void;
  currentPath?: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

export function LearningPathSelector({ onSelectPath, currentPath }: LearningPathSelectorProps) {
  const [open, setOpen] = useState(false);

  const paths = [
    {
      id: 'beginner' as const,
      title: 'Complete Beginner',
      description: 'Start from zero. Learn Python basics, data science fundamentals, and build your first AI models.',
      icon: BookOpen,
      duration: '300 days',
      topics: '~200 topics',
      color: 'text-green-600'
    },
    {
      id: 'intermediate' as const,
      title: 'I Know Python',
      description: 'Skip the basics. Jump into data science libraries, machine learning algorithms, and deep learning.',
      icon: Zap,
      duration: '250 days',
      topics: '~180 topics',
      color: 'text-blue-600'
    },
    {
      id: 'advanced' as const,
      title: 'ML to Deep Learning',
      description: 'Focus on advanced topics. Deep learning, transformers, MLOps, and cutting-edge AI research.',
      icon: Rocket,
      duration: '150 days',
      topics: '~120 topics',
      color: 'text-purple-600'
    },
    {
      id: 'all' as const,
      title: 'Complete Journey',
      description: 'Experience everything. All 300 days from Python basics to advanced AI research topics.',
      icon: Globe,
      duration: '300 days',
      topics: '300 topics',
      color: 'text-orange-600'
    }
  ];

  const handleSelect = (pathId: typeof paths[number]['id']) => {
    onSelectPath(pathId);
    setOpen(false);
  };

  return (
    <>
      {currentPath && (
        <Button variant="outline" onClick={() => setOpen(true)}>
          Change Path
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Your Learning Path</DialogTitle>
            <DialogDescription>
              Select the path that matches your current skill level. You can change this anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2 py-4">
            {paths.map((path) => {
              const Icon = path.icon;
              return (
                <Card
                  key={path.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    currentPath === path.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelect(path.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-8 w-8 ${path.color}`} />
                      <div>
                        <CardTitle>{path.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {path.duration} • {path.topics}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
