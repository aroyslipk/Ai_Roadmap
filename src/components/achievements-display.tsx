'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Trophy, Flame } from 'lucide-react';
import { Achievement } from '@/types';
import { achievementDefinitions } from '@/lib/achievements';
import { format } from 'date-fns';

interface AchievementsDisplayProps {
  achievements: Achievement[];
  currentStreak: number;
  longestStreak: number;
  daysCompleted: number;
}

export function AchievementsDisplay({
  achievements,
  currentStreak,
  longestStreak,
  daysCompleted
}: AchievementsDisplayProps) {
  const unlockedIds = new Set(achievements.map(a => a.id));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Trophy className="mr-2 h-4 w-4" />
          Achievements
          {achievements.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {achievements.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Your Achievements</SheetTitle>
          <SheetDescription>
            Track your progress and unlock achievements as you learn
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Streak Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currentStreak}</div>
                <p className="text-xs text-muted-foreground mt-1">days in a row</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Longest Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{longestStreak}</div>
                <p className="text-xs text-muted-foreground mt-1">days total</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Unlocked Achievements</h3>
            <div className="grid gap-3">
              {achievementDefinitions.map((def) => {
                const isUnlocked = unlockedIds.has(def.id);
                const achievement = achievements.find(a => a.id === def.id);

                return (
                  <Card
                    key={def.id}
                    className={`${isUnlocked ? 'bg-accent/50' : 'opacity-60'}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{def.icon}</div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{def.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {def.description}
                          </CardDescription>
                          {isUnlocked && achievement && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Unlocked {format(new Date(achievement.unlockedAt), 'PPP')}
                            </p>
                          )}
                        </div>
                        {isUnlocked && (
                          <div className="text-green-600 font-semibold text-sm">
                            ✓ Unlocked
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
