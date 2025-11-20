'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Day } from '@/types';
import { BarChart, ChevronLeft, ChevronRight, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { format, formatDistance } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from './ui/skeleton';
import { useIsClient } from '@/hooks/use-is-client';
import { usePagination } from '@/hooks/use-pagination';
import ClientOnly from './client-only';
import { ProgressRoadmap } from './progress-roadmap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface DashboardProps {
  days: Day[];
  onDaySelect: (day: Day) => void;
}

const ITEMS_PER_PAGE = 10;

export function Dashboard({ days, onDaySelect }: DashboardProps) {
  const isClient = useIsClient();

  const {
    paginatedData: paginatedDays,
    currentPage,
    totalPages,
    handleNextPage,
    handlePrevPage,
    handleSetPage,
  } = usePagination(days, ITEMS_PER_PAGE);

  const {
    totalTopics,
    completedTopics,
    remainingTopics,
    progress,
    currentDay,
    startDate,
    timeTaken,
  } = useMemo(() => {
    if (!isClient) {
      return {
        totalTopics: days.length,
        completedTopics: 0,
        remainingTopics: days.length,
        progress: 0,
        currentDay: null,
        startDate: null,
        timeTaken: 'N/A'
      };
    }
    const totalTopics = days.length;
    const completedDays = days.filter(day => day.tasks.every(t => t.isCompleted));
    const completedTopics = completedDays.length;
    const remainingTopics = totalTopics - completedTopics;
    const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
    
    const firstUnfinishedDay = days.find(day => !day.tasks.every(t => t.isCompleted));
    const currentDay = firstUnfinishedDay || days[days.length - 1];

    const firstDayWithCompletion = days.find(d => d.tasks.some(t => t.completedAt));
    const startDate = firstDayWithCompletion && firstDayWithCompletion.tasks.some(t => t.completedAt)
      ? new Date(Math.min(...firstDayWithCompletion.tasks.filter(t=>t.completedAt).map(t => new Date(t.completedAt!).getTime())))
      : null;

    const lastCompletedTask = days
      .flatMap(d => d.tasks)
      .filter(t => t.isCompleted && t.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
      
    const endDate = lastCompletedTask ? new Date(lastCompletedTask.completedAt!) : null;
      
    const timeTaken = startDate && endDate ? formatDistance(endDate, startDate) : 'N/A';
    
    return {
      totalTopics,
      completedTopics,
      remainingTopics,
      progress,
      currentDay,
      startDate,
      timeTaken,
    };
  }, [days, isClient]);

  const handleSelectDay = (day: Day) => {
    onDaySelect(day);
    // This is a bit of a hack, but we need to close the sheet.
    // A better solution would be to manage the sheet's open state from the parent.
    document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(new MouseEvent('click'));
  };

  if (!isClient) {
    return (
        <Button variant="outline">
            <BarChart className="mr-2 h-4 w-4" />
            Dashboard
        </Button>
    )
  }
  
  if (!days || days.length === 0) {
    return (
         <Button variant="outline">
            <BarChart className="mr-2 h-4 w-4" />
            Dashboard
        </Button>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
            <BarChart className="mr-2 h-4 w-4" />
            Dashboard
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Your Progress Dashboard</SheetTitle>
          <SheetDescription>
            An overview of your 300-day journey to mastering AI.
          </SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="stats" className="py-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>
          <TabsContent value="stats" className="space-y-4">
        <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTopics}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedTopics}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{remainingTopics}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Topic</CardTitle>
                         <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                       <Button variant="link" className="p-0 h-auto text-base font-bold" onClick={() => currentDay && handleSelectDay(currentDay)}>
                         Day {currentDay?.day}
                       </Button>
                       <p className="text-xs text-muted-foreground truncate">{currentDay?.topic}</p>
                    </CardContent>
                </Card>
            </div>
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Roadmap Progress</CardTitle>
                    <CardDescription>You have completed {completedTopics} of {totalTopics} topics.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-2'>
                    <Progress value={progress} />
                     <p className="text-sm text-muted-foreground">
                        <ClientOnly>
                            Time taken so far: {timeTaken}. {startDate ? `Started on ${format(startDate, 'PP')}.` : ''}
                        </ClientOnly>
                    </p>
                </CardContent>
            </Card>
        </div>
          </TabsContent>
          <TabsContent value="roadmap">
            <ProgressRoadmap days={days} onDaySelect={handleSelectDay} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
