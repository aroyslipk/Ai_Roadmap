import type { Achievement } from '@/types';

export const achievementDefinitions = [
  {
    id: 'first_day',
    title: 'First Steps',
    description: 'Complete your first day',
    icon: '🎯',
    checkUnlock: (daysCompleted: number) => daysCompleted >= 1
  },
  {
    id: 'week_one',
    title: 'Week Warrior',
    description: 'Complete 7 days',
    icon: '📅',
    checkUnlock: (daysCompleted: number) => daysCompleted >= 7
  },
  {
    id: 'streak_7',
    title: 'On Fire',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    checkUnlock: (daysCompleted: number, streak: number) => streak >= 7
  },
  {
    id: 'month_one',
    title: 'Monthly Milestone',
    description: 'Complete 30 days',
    icon: '📆',
    checkUnlock: (daysCompleted: number) => daysCompleted >= 30
  },
  {
    id: 'streak_30',
    title: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: '⚡',
    checkUnlock: (daysCompleted: number, streak: number) => streak >= 30
  },
  {
    id: 'halfway',
    title: 'Halfway Hero',
    description: 'Complete 150 days',
    icon: '🎖️',
    checkUnlock: (daysCompleted: number) => daysCompleted >= 150
  },
  {
    id: 'streak_100',
    title: 'Century Streak',
    description: 'Maintain a 100-day streak',
    icon: '💯',
    checkUnlock: (daysCompleted: number, streak: number) => streak >= 100
  },
  {
    id: 'complete_journey',
    title: 'AI Master',
    description: 'Complete all 300 days',
    icon: '👑',
    checkUnlock: (daysCompleted: number) => daysCompleted >= 300
  }
];

export function calculateStreak(days: any[]): { currentStreak: number; longestStreak: number; lastCompletedDate: string | null } {
  const completedDays = days
    .filter(day => day.tasks.every((t: any) => t.isCompleted))
    .sort((a, b) => a.day - b.day);

  if (completedDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  // Get the most recent completion date
  const allCompletedTasks = completedDays
    .flatMap(d => d.tasks)
    .filter(t => t.completedAt)
    .map(t => new Date(t.completedAt!));

  const lastCompletedDate = allCompletedTasks.length > 0
    ? new Date(Math.max(...allCompletedTasks.map(d => d.getTime()))).toISOString()
    : null;

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = completedDays.length - 1; i >= 0; i--) {
    const dayTasks = completedDays[i].tasks.filter((t: any) => t.completedAt);
    if (dayTasks.length === 0) break;

    const completionDate = new Date(dayTasks[dayTasks.length - 1].completedAt);
    completionDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= currentStreak + 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDay = -1;

  for (const day of completedDays) {
    if (lastDay === -1 || day.day === lastDay + 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
    lastDay = day.day;
  }

  return { currentStreak, longestStreak, lastCompletedDate };
}

export function checkNewAchievements(
  daysCompleted: number,
  currentStreak: number,
  existingAchievements: Achievement[]
): Achievement[] {
  const existingIds = new Set(existingAchievements.map(a => a.id));
  const newAchievements: Achievement[] = [];

  for (const def of achievementDefinitions) {
    if (!existingIds.has(def.id) && def.checkUnlock(daysCompleted, currentStreak)) {
      newAchievements.push({
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        unlockedAt: new Date().toISOString()
      });
    }
  }

  return newAchievements;
}
