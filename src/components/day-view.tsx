'use client';

import type { Day, Resource } from '@/types';
import TaskList from './task-list';
import ResourceList from './resource-list';
import NotesEditor from './notes-editor';

interface DayViewProps {
  day: Day;
  onTaskToggle: (dayId: number, taskId: string, completed: boolean) => void;
  onResourceUpdate: (dayId: number, resourceId: string, newResource: Partial<Resource>) => void;
  onAddResource: (dayId: number, newResource: Omit<Resource, 'id'>) => void;
  onNotesChange: (dayId: number, notes: string) => void;
}

export default function DayView({ day, onTaskToggle, onResourceUpdate, onAddResource, onNotesChange }: DayViewProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-headline tracking-tight">Day {day.day}: {day.topic}</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">{day.project}</p>
        
        {/* Difficulty and Time */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
          {day.difficulty && (
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                day.difficulty === 'beginner'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : day.difficulty === 'intermediate'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              }`}
            >
              {day.difficulty.charAt(0).toUpperCase() + day.difficulty.slice(1)}
            </span>
          )}
          {day.estimatedHours && (
            <span className="text-sm text-muted-foreground">
              Estimated time: {day.estimatedHours} {day.estimatedHours === 1 ? 'hour' : 'hours'}
            </span>
          )}
        </div>

        {/* Why This Matters */}
        {day.why && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-accent/50 rounded-lg border">
            <p className="text-xs sm:text-sm font-medium mb-1">Why This Matters</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{day.why}</p>
          </div>
        )}

        {/* Real World Applications */}
        {day.realWorld && (
          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium mb-1">Real-World Applications</p>
            <p className="text-xs text-muted-foreground">{day.realWorld}</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
        <TaskList
          dayId={day.day}
          tasks={day.tasks}
          onTaskToggle={onTaskToggle}
        />
        <ResourceList
          dayId={day.day}
          resources={day.resources}
          onResourceUpdate={onResourceUpdate}
          onAddResource={onAddResource}
        />
      </div>
      <NotesEditor
        dayId={day.day}
        notes={day.notes}
        onNotesChange={onNotesChange}
      />
    </div>
  );
}
