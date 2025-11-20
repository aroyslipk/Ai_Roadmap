import type { Timestamp } from "firebase/firestore";

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string; // Storing as ISO string
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  isFavorited: boolean;
  isCompleted: boolean;
  rating?: 'helpful' | 'not_helpful';
}

export interface Day {
  day: number;
  topic: string;
  project: string;
  tasks: Task[];
  resources: Resource[];
  notes: string;
  userId?: string;
  createdAt?: Timestamp;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours?: number;
  why?: string;
  realWorld?: string;
  path?: ('beginner' | 'intermediate' | 'advanced' | 'all')[];
}

export interface UserProgress {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  totalDaysCompleted: number;
  achievements: Achievement[];
  selectedPath?: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    message: string;
    createdAt: Timestamp | Date; // Allow both for client-side creation
    isPending?: boolean; // True if message is waiting to sync
}
