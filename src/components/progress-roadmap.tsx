'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Day } from '@/types';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { Progress } from './ui/progress';

interface ProgressRoadmapProps {
  days: Day[];
  onDaySelect: (day: Day) => void;
}

export function ProgressRoadmap({ days, onDaySelect }: ProgressRoadmapProps) {
  const milestones = useMemo(() => {
    const milestoneDays = [1, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
    return milestoneDays.map(dayNum => {
      const day = days.find(d => d.day === dayNum);
      const isCompleted = day ? day.tasks.every(t => t.isCompleted) : false;
      const isAccessible = dayNum === 1 || days.find(d => d.day === dayNum - 1)?.tasks.every(t => t.isCompleted);
      return { dayNum, day, isCompleted, isAccessible };
    });
  }, [days]);

  const overallProgress = useMemo(() => {
    const completed = days.filter(d => d.tasks.every(t => t.isCompleted)).length;
    return (completed / days.length) * 100;
  }, [days]);

  const getMilestoneLabel = (dayNum: number) => {
    if (dayNum === 1) return 'Start';
    if (dayNum === 90) return 'First Capstone';
    if (dayNum === 150) return 'Halfway';
    if (dayNum === 300) return 'Complete';
    return `Day ${dayNum}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Learning Journey</CardTitle>
        <CardDescription>
          Visual roadmap of your 300-day AI mastery path
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Milestone Path */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-6">
            {milestones.map((milestone, index) => {
              const Icon = milestone.isCompleted
                ? CheckCircle2
                : milestone.isAccessible
                ? Circle
                : Lock;
              const iconColor = milestone.isCompleted
                ? 'text-green-600'
                : milestone.isAccessible
                ? 'text-blue-600'
                : 'text-muted-foreground';

              return (
                <div key={milestone.dayNum} className="relative flex items-start gap-4">
                  <div className={`relative z-10 rounded-full bg-background p-1`}>
                    <Icon className={`h-8 w-8 ${iconColor}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <button
                      onClick={() => milestone.day && onDaySelect(milestone.day)}
                      disabled={!milestone.isAccessible}
                      className="text-left w-full group"
                    >
                      <div className="font-semibold group-hover:text-primary transition-colors">
                        {getMilestoneLabel(milestone.dayNum)}
                      </div>
                      {milestone.day && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {milestone.day.topic}
                        </div>
                      )}
                      {milestone.day?.difficulty && (
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              milestone.day.difficulty === 'beginner'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : milestone.day.difficulty === 'intermediate'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            }`}
                          >
                            {milestone.day.difficulty}
                          </span>
                          {milestone.day.estimatedHours && (
                            <span className="text-xs text-muted-foreground">
                              {milestone.day.estimatedHours}h
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
