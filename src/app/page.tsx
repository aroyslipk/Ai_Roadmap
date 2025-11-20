'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/app-header';
import DayList from '@/components/day-list';
import DayView from '@/components/day-view';
import RightPane from '@/components/right-pane';
import { initialCurriculum } from '@/lib/curriculum';
import type { Day, Resource, Task, ChatMessage, UserProgress, Achievement } from '@/types';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import Login from '@/components/login';
import { collection, onSnapshot, query, orderBy, doc, writeBatch, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import ClientOnly from '@/components/client-only';
import { useOfflineChat } from '@/hooks/use-offline-chat';
import { LearningPathSelector } from '@/components/learning-path-selector';
import { AchievementsDisplay } from '@/components/achievements-display';
import { calculateStreak, checkNewAchievements } from '@/lib/achievements';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MessageCircle } from 'lucide-react';

function MainApp() {
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [selectedPath, setSelectedPath] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');
  const [offlineMode, setOfflineMode] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { messages: chatMessages, sendMessage, isOnline, pendingCount } = useOfflineChat();
  
  // Timeout to prevent infinite loading
  useEffect(() => {
    if (!user || days.length > 0) return;
    
    const timer = setTimeout(() => {
      if (days.length === 0 && !offlineMode) {
        console.warn('Loading timeout - entering offline mode');
        setLoadingTimeout(true);
        setOfflineMode(true);
        
        const sortedDays = [...initialCurriculum].sort((a, b) => a.day - b.day).map(d => ({
          ...d, 
          userId: user?.uid || '', 
          id: String(d.day)
        }));
        setDays(sortedDays);
        setSelectedDay(sortedDays[0]);
        
        if (!userProgress) {
          setUserProgress({
            userId: user?.uid || '',
            currentStreak: 0,
            longestStreak: 0,
            totalDaysCompleted: 0,
            achievements: [],
            selectedPath: 'all'
          });
        }
        
        toast({
          title: 'Loaded in Offline Mode',
          description: 'Taking too long to connect. Running offline.',
        });
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, [user, days.length, offlineMode, userProgress, toast]);

  const userDaysCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/days`);
  }, [firestore, user]);

  const { data: userDays, isLoading: areDaysLoading, error: daysError } = useCollection<Day>(userDaysCollection);
  
  // Handle collection errors gracefully - enter offline mode
  useEffect(() => {
    if (daysError) {
      console.warn('Error loading days collection, entering offline mode:', daysError);
      setOfflineMode(true);
      
      // Use initial curriculum as fallback
      if (days.length === 0) {
        const sortedDays = [...initialCurriculum].sort((a, b) => a.day - b.day).map(d => ({
          ...d, 
          userId: user?.uid || '', 
          id: String(d.day)
        }));
        setDays(sortedDays);
        setSelectedDay(sortedDays[0]);
        
        // Initialize progress in offline mode
        if (!userProgress) {
          setUserProgress({
            userId: user?.uid || '',
            currentStreak: 0,
            longestStreak: 0,
            totalDaysCompleted: 0,
            achievements: [],
            selectedPath: 'all'
          });
        }
        
        toast({
          title: 'Offline Mode',
          description: 'Running in offline mode. Progress will not be saved.',
          variant: 'default'
        });
      }
    }
  }, [daysError, days.length, user, userProgress, toast]);

  // Load user progress
  useEffect(() => {
    if (!firestore || !user) return;

    const progressRef = doc(firestore, `users/${user.uid}/progress/main`);
    const unsubscribe = onSnapshot(progressRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserProgress(snapshot.data() as UserProgress);
        setSelectedPath((snapshot.data() as UserProgress).selectedPath || 'all');
      } else {
        // Initialize progress
        const initialProgress: UserProgress = {
          userId: user.uid,
          currentStreak: 0,
          longestStreak: 0,
          totalDaysCompleted: 0,
          achievements: [],
          selectedPath: 'all'
        };
        setDoc(progressRef, initialProgress).catch((error) => {
          console.warn('Could not create progress document. Using local state only.', error);
        });
        setUserProgress(initialProgress);
      }
    }, (error) => {
      console.warn('Could not listen to progress. Using local state only.', error);
      // Fallback to local state if Firestore rules aren't deployed yet
      const initialProgress: UserProgress = {
        userId: user.uid,
        currentStreak: 0,
        longestStreak: 0,
        totalDaysCompleted: 0,
        achievements: [],
        selectedPath: 'all'
      };
      setUserProgress(initialProgress);
    });

    return () => unsubscribe();
  }, [firestore, user]);

  useEffect(() => {
    // Skip if in offline mode
    if (offlineMode) return;
    
    if (areDaysLoading || !firestore || !user || !userDays) return;
  
    const processDays = async () => {
      if (userDays.length === 0) {
        // First time user, populate their days from curriculum
        try {
          const batch = writeBatch(firestore);
          initialCurriculum.forEach(dayData => {
            const dayRef = doc(firestore, `users/${user.uid}/days`, String(dayData.day));
            const dayWithUser = { ...dayData, userId: user.uid, id: String(dayData.day) };
            batch.set(dayRef, dayWithUser);
          });
          await batch.commit();
          
          // Set days immediately so UI doesn't stay stuck
          const sortedDays = [...initialCurriculum].sort((a, b) => a.day - b.day).map(d => ({
            ...d, 
            userId: user.uid, 
            id: String(d.day)
          }));
          setDays(sortedDays);
          setSelectedDay(sortedDays[0]);
          
          toast({ title: 'Welcome!', description: 'Your 300-day AI Roadmap is ready!' });
        } catch (error) {
          console.error('Error creating curriculum:', error);
          toast({ 
            variant: 'destructive',
            title: 'Error', 
            description: 'Could not create your roadmap. Please refresh the page.' 
          });
        }
      } else {
        // Filter days based on selected path
        let filteredDays = [...userDays];
        if (selectedPath !== 'all') {
          filteredDays = userDays.filter(d => d.path?.includes(selectedPath) || d.path?.includes('all'));
        }
        
        const sortedDays = filteredDays.sort((a, b) => a.day - b.day);
        setDays(sortedDays);
        
        if (!selectedDay) {
          setSelectedDay(sortedDays[0]);
        } else {
          const reselected = sortedDays.find(d => d.day === selectedDay.day);
          if (reselected) setSelectedDay(reselected);
        }

        // Update streak and achievements
        if (userProgress) {
          const streakData = calculateStreak(userDays);
          const completedCount = userDays.filter(d => d.tasks.every(t => t.isCompleted)).length;
          
          const newAchievements = checkNewAchievements(
            completedCount,
            streakData.currentStreak,
            userProgress.achievements
          );

          if (newAchievements.length > 0 || 
              streakData.currentStreak !== userProgress.currentStreak ||
              completedCount !== userProgress.totalDaysCompleted) {
            const updatedProgress: UserProgress = {
              ...userProgress,
              currentStreak: streakData.currentStreak,
              longestStreak: Math.max(streakData.longestStreak, userProgress.longestStreak),
              lastCompletedDate: streakData.lastCompletedDate || userProgress.lastCompletedDate,
              totalDaysCompleted: completedCount,
              achievements: [...userProgress.achievements, ...newAchievements]
            };

            // Update local state immediately
            setUserProgress(updatedProgress);

            // Try to save to Firestore, but don't fail if rules aren't deployed
            try {
              const progressRef = doc(firestore, `users/${user.uid}/progress/main`);
              updateDocumentNonBlocking(progressRef, updatedProgress);
            } catch (error) {
              console.warn('Could not save progress to Firestore. Using local state only.', error);
            }

            // Show toast for new achievements
            if (newAchievements.length > 0) {
              newAchievements.forEach(achievement => {
                toast({
                  title: 'Achievement Unlocked!',
                  description: `${achievement.icon} ${achievement.title}: ${achievement.description}`
                });
              });
            }
          }
        }
      }
    }
  
    processDays();
  
  }, [userDays, areDaysLoading, firestore, user, toast, selectedPath]);

  // Show toast when coming back online with pending messages
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      toast({
        title: 'Back Online!',
        description: `Syncing ${pendingCount} pending message${pendingCount > 1 ? 's' : ''}...`,
      });
    }
  }, [isOnline, pendingCount, toast]);

  const handleDaySelect = (day: Day) => {
    setSelectedDay(day);
  };

  const getDayRef = (dayId: number) => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}/days`, String(dayId));
  };

  const handleTaskToggle = (dayId: number, taskId: string, completed: boolean) => {
    const dayRef = getDayRef(dayId);
    if (!dayRef || !selectedDay) return;

    const newTasks = selectedDay.tasks.map(t => {
      if (t.id === taskId) {
        const updatedTask: any = { ...t, isCompleted: completed };
        if (completed) {
          updatedTask.completedAt = new Date().toISOString();
        } else {
          // Remove completedAt field instead of setting to undefined
          delete updatedTask.completedAt;
        }
        return updatedTask;
      }
      return t;
    });
    updateDocumentNonBlocking(dayRef, { tasks: newTasks });
  };

  const handleResourceUpdate = (dayId: number, resourceId: string, newResource: Partial<Resource>) => {
    const dayRef = getDayRef(dayId);
    if (!dayRef || !selectedDay) return;

    const newResources = selectedDay.resources.map(r => (r.id === resourceId ? { ...r, ...newResource } : r));
    updateDocumentNonBlocking(dayRef, { resources: newResources });
  };

  const handleAddResource = (dayId: number, newResource: Omit<Resource, 'id'>) => {
    const dayRef = getDayRef(dayId);
    if (!dayRef || !selectedDay) return;

    const resourceWithId = { ...newResource, id: `res-${dayId}-${Date.now()}` };
    const newResources = [...selectedDay.resources, resourceWithId];
    updateDocumentNonBlocking(dayRef, { resources: newResources });
  };

  const handleNotesChange = (dayId: number, notes: string) => {
    const dayRef = getDayRef(dayId);
    if (!dayRef) return;
    updateDocumentNonBlocking(dayRef, { notes });
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const handlePathSelect = async (path: 'beginner' | 'intermediate' | 'advanced' | 'all') => {
    if (!firestore || !user) return;
    
    setSelectedPath(path);
    
    // Update local state immediately
    if (userProgress) {
      setUserProgress({ ...userProgress, selectedPath: path });
    }
    
    // Try to update Firestore, but don't fail if rules aren't deployed
    try {
      const progressRef = doc(firestore, `users/${user.uid}/progress/main`);
      await updateDocumentNonBlocking(progressRef, { selectedPath: path });
    } catch (error) {
      console.warn('Could not save path to Firestore. Using local state only.', error);
    }
    
    toast({
      title: 'Learning Path Updated',
      description: `Switched to ${path === 'all' ? 'complete journey' : path} path`
    });
  };

  const handleResetProgress = async () => {
    if (!firestore || !user) return;

    const confirmation = confirm('Are you sure you want to reset all your progress? This cannot be undone.');
    if (!confirmation) return;

    toast({ title: 'Resetting Progress...', description: 'Please wait.' });

    try {
      const batch = writeBatch(firestore);
      initialCurriculum.forEach(dayData => {
        const dayRef = doc(firestore, `users/${user.uid}/days`, String(dayData.day));
        const dayWithUser = { ...dayData, userId: user.uid, id: String(dayData.day) };
        batch.set(dayRef, dayWithUser);
      });
      await batch.commit();

      const sortedDays = [...initialCurriculum].sort((a, b) => a.day - b.day).map(d => ({...d, userId: user.uid, id: String(d.day)}));
      setDays(sortedDays);
      setSelectedDay(sortedDays[0]);
      
      toast({ title: 'Progress Reset', description: 'Your roadmap has been reset to Day 1.' });
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not reset your progress.' });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-xl font-semibold">Loading Your Roadmap...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }
  
  // Only show loading if we're actually loading AND don't have days yet
  if (days.length === 0) {
    if (areDaysLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-xl font-semibold">Loading your roadmap...</div>
        </div>
      );
    }
    
    // If not loading but still no days, show setup message
    if (!userDays || userDays.length === 0) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-xl font-semibold">Setting up your roadmap...</div>
        </div>
      );
    }
    
    // If we have userDays but days is empty, something went wrong with filtering
    // This shouldn't happen, but let's handle it
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-xl font-semibold">Preparing your content...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <AppHeader 
        onReset={handleResetProgress} 
        selectedDay={selectedDay} 
        days={days} 
        onDaySelect={handleDaySelect}
        userProgress={userProgress}
        onPathSelect={handlePathSelect}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Day List - Always render (has mobile button inside) */}
          <DayList days={days} selectedDay={selectedDay} onDaySelect={handleDaySelect} />
          
          {/* Main Content - Full width on mobile */}
          <main className={`${selectedDay ? 'flex-1' : 'hidden md:flex-1'} overflow-y-auto`}>
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
              {selectedDay ? (
                <DayView
                  key={selectedDay.day}
                  day={selectedDay}
                  onTaskToggle={handleTaskToggle}
                  onResourceUpdate={handleResourceUpdate}
                  onAddResource={handleAddResource}
                  onNotesChange={handleNotesChange}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Select a day to begin.</p>
                </div>
              )}
            </div>
          </main>
          
          {/* Right Pane - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block lg:w-96 overflow-hidden">
            <RightPane chatMessages={chatMessages} onSendMessage={handleSendMessage} isOnline={isOnline} pendingCount={pendingCount} />
          </div>
        </div>
      </div>
      
      {/* Mobile Chat Button - Opens group chat directly */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96 flex flex-col p-0">
            <SheetHeader className="p-4 pb-0">
              <SheetTitle>Group Chat</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
              <RightPane chatMessages={chatMessages} onSendMessage={handleSendMessage} isOnline={isOnline} pendingCount={pendingCount} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ClientOnly>
      <MainApp />
    </ClientOnly>
  );
}
