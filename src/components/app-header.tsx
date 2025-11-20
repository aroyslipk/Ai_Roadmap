'use client';

import { Button } from '@/components/ui/button';
import Clock from './clock';
import { UserNav } from './user-nav';
import { Github, ChevronLeft, ChevronRight } from 'lucide-react';
import Chatbot from './chatbot';
import { Day } from '@/types';
import Link from 'next/link';
import { Dashboard } from './dashboard';
import Image from 'next/image';
import { LearningPathSelector } from './learning-path-selector';
import { AchievementsDisplay } from './achievements-display';
import type { UserProgress } from '@/types';

interface AppHeaderProps {
  onReset: () => void;
  selectedDay: Day | null;
  days: Day[];
  onDaySelect: (day: Day) => void;
  userProgress?: UserProgress | null;
  onPathSelect?: (path: 'beginner' | 'intermediate' | 'advanced' | 'all') => void;
}

export default function AppHeader({ onReset, selectedDay, days, onDaySelect, userProgress, onPathSelect }: AppHeaderProps) {
  const handlePrevDay = () => {
    if (!selectedDay) return;
    const currentIndex = days.findIndex(d => d.day === selectedDay.day);
    if (currentIndex > 0) {
      onDaySelect(days[currentIndex - 1]);
    }
  };

  const handleNextDay = () => {
    if (!selectedDay) return;
    const currentIndex = days.findIndex(d => d.day === selectedDay.day);
    if (currentIndex < days.length - 1) {
      onDaySelect(days[currentIndex + 1]);
    }
  };

  const currentIndex = selectedDay ? days.findIndex(d => d.day === selectedDay.day) : -1;

  return (
    <header className="sticky top-0 z-10 flex h-14 sm:h-16 shrink-0 items-center gap-1 sm:gap-2 md:gap-4 border-b bg-background px-2 sm:px-4 md:px-8">
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Image 
          src="/airoadmap.jpg" 
          alt="AI Roadmap Logo" 
          width={28} 
          height={28} 
          className="rounded-md flex-shrink-0 sm:w-8 sm:h-8"
        />
        <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-tight font-headline text-foreground truncate">
          AI_Roadmap
        </h1>
        <Link href="https://github.com/aroyslipk" target="_blank" className="hidden md:inline-flex">
            <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
            </Button>
        </Link>
      </div>
      
      {/* Day Navigation - Mobile Friendly */}
      {selectedDay && (
        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrevDay} 
            disabled={currentIndex === 0}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs md:text-sm font-medium px-1 md:px-2 whitespace-nowrap">
            Day {selectedDay.day}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextDay} 
            disabled={currentIndex === days.length - 1}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
        <Clock className="hidden lg:block" />
        
        {/* Show chatbot on all screens */}
        <Chatbot selectedDay={selectedDay} />
        
        {/* Hide some buttons on very small screens */}
        <div className="hidden sm:flex items-center gap-1 md:gap-2">
          {userProgress && (
            <AchievementsDisplay
              achievements={userProgress.achievements}
              currentStreak={userProgress.currentStreak}
              longestStreak={userProgress.longestStreak}
              daysCompleted={userProgress.totalDaysCompleted}
            />
          )}
          {onPathSelect && (
            <LearningPathSelector
              onSelectPath={onPathSelect}
              currentPath={userProgress?.selectedPath}
            />
          )}
        </div>
        
        <Dashboard days={days} onDaySelect={onDaySelect} />
        <UserNav />
      </div>
    </header>
  );
}
