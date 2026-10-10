export type Priority = 'P1' | 'P2' | 'P3';

export type TaskCategory = 'Deep Work' | 'Work' | 'Routine' | 'Health' | 'Personal' | 'Break';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  startTime: string; // "HH:MM" 24h
  endTime: string; // "HH:MM" 24h
  category: TaskCategory;
  priority: Priority;
  completed: boolean;
  estimatedMinutes?: number;
  notes?: string;
  color?: string;
}

export interface HabitItem {
  id: string;
  name: string;
  description?: string;
  category: 'Wellness' | 'Focus' | 'Learning' | 'Fitness' | 'Mindset';
  color: string;
  streak: number;
  bestStreak: number;
  completedDates: string[]; // ISO date strings "YYYY-MM-DD"
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  durationMinutes: number;
  completedAt: string;
  type: 'Work' | 'Short Break' | 'Long Break';
}

export interface CompanionProfile {
  name: string;
  avatarUrl: string;
  tone: string;
  tagline: string;
  greeting: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'add_task' | 'start_focus' | 'check_habits' | 'optimize';
    label: string;
    payload?: any;
  };
}

export type SoundscapeType = 'rain' | 'synth' | 'theta' | 'cafe';

export interface SoundscapeState {
  isPlaying: boolean;
  activeType: SoundscapeType;
  volume: number; // 0 to 1
}

export interface UserProfile {
  id: string;
  username?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  joinedDate: string;
  dots?: boolean[];
  notificationEnabled?: boolean;
  token?: string;
  provider?: 'local' | 'google' | 'instagram' | 'snapchat';
  agreedToTerms?: boolean;
}

export interface ActivityItem {
  id: string;
  userId: string;
  username: string;
  type: 'login' | 'google_login' | 'instagram_login' | 'snapchat_login' | 'register' | 'focus_completed' | 'dot_toggled' | 'reminder_notification' | 'password_reset';
  title: string;
  description: string;
  timestamp: string;
  device?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'focusing' | 'idle';
  totalDays: number;
  whiteDotsCount: number;
  dots: boolean[];
  invitedAt: string;
}

export interface FollowRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'declined';
}
