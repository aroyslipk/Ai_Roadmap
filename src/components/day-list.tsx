'use client';

import { cn } from '@/lib/utils';
import type { Day } from '@/types';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { usePagination } from '@/hooks/use-pagination';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useState } from 'react';

interface DayListProps {
  days: Day[];
  selectedDay: Day | null;
  onDaySelect: (day: Day) => void;
}

const DAYS_PER_PAGE = 10;

function DayListContent({ days, selectedDay, onDaySelect, onClose }: DayListProps & { onClose?: () => void }) {
  const {
    paginatedData: paginatedDays,
    currentPage,
    totalPages,
    handleNextPage,
    handlePrevPage,
    setSearch,
  } = usePagination(
    days,
    DAYS_PER_PAGE,
    (day, searchTerm) =>
      day.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `Day ${day.day}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (day: Day) => {
    onDaySelect(day);
    onClose?.();
  };

  return (
    <>
      <div className="p-4">
        <Input
          placeholder="Search days..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-4 pt-0">
          <ul>
            {paginatedDays.map((day) => (
              <li key={day.day}>
                <button
                  onClick={() => handleSelect(day)}
                  className={cn(
                    'w-full text-left p-2 rounded-md text-sm transition-colors',
                    selectedDay?.day === day.day
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="font-bold">Day {day.day}</div>
                  <div className="text-xs text-muted-foreground dark:text-primary-foreground/70">{day.topic}</div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
      <div className="p-4 border-t flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={currentPage === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button variant="outline" size="icon" onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

export default function DayList({ days, selectedDay, onDaySelect }: DayListProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: Sheet trigger button */}
      <div className="md:hidden fixed bottom-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <List className="h-5 w-5 mr-2" />
              Days
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 flex flex-col p-0">
            <SheetHeader className="p-4 pb-0">
              <SheetTitle>Select Day</SheetTitle>
            </SheetHeader>
            <DayListContent 
              days={days} 
              selectedDay={selectedDay} 
              onDaySelect={onDaySelect}
              onClose={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar */}
      <aside className="hidden md:flex flex-col w-80 border-r bg-background/50">
        <DayListContent days={days} selectedDay={selectedDay} onDaySelect={onDaySelect} />
      </aside>
    </>
  );
}
