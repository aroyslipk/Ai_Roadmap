'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Task } from '@/types';
import TaskItem from './task-item';
import { ListTodo } from 'lucide-react';

interface TaskListProps {
  dayId: number;
  tasks: Task[];
  onTaskToggle: (dayId: number, taskId: string, completed: boolean) => void;
}

export default function TaskList({ dayId, tasks, onTaskToggle }: TaskListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-5 w-5" />
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id}>
                <TaskItem
                  task={task}
                  onToggle={(completed) => onTaskToggle(dayId, task.id, completed)}
                />
                {index < tasks.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
