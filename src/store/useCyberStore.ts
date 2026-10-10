import { useState, useEffect } from 'react';
import { TaskItem, FocusSession, SoundscapeType } from '../types';
import { soundEngine } from '../services/webAudioService';

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Deep Architecture & Strategy',
    description: 'Map out milestones and execution priorities.',
    startTime: '09:00',
    endTime: '10:30',
    category: 'Deep Work',
    priority: 'P1',
    completed: false,
    estimatedMinutes: 90,
    color: '#06b6d4',
  },
  {
    id: 'task-2',
    title: 'High-Impact Implementation',
    description: 'Implement core focus cycles and team synchronization.',
    startTime: '10:45',
    endTime: '12:15',
    category: 'Work',
    priority: 'P1',
    completed: false,
    estimatedMinutes: 90,
    color: '#3b82f6',
  },
  {
    id: 'task-3',
    title: 'Rest & Mental Reset',
    description: 'Step away from monitors, hydrate, reset posture.',
    startTime: '12:30',
    endTime: '13:15',
    category: 'Health',
    priority: 'P3',
    completed: true,
    estimatedMinutes: 45,
    color: '#10b981',
  },
];

const STORAGE_KEYS = {
  TASKS: 'kurukshetra_tasks_v1',
  FOCUS_HISTORY: 'kurukshetra_focus_history_v1',
};

export function useCyberStore() {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [focusHistory, setFocusHistory] = useState<FocusSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOCUS_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType | null>(null);
  const [soundVolume, setSoundVolume] = useState<number>(0.5);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOCUS_HISTORY, JSON.stringify(focusHistory));
  }, [focusHistory]);

  const addTask = (task: Omit<TaskItem, 'id'>): TaskItem => {
    soundEngine.playClick();
    const newTask: TaskItem = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<TaskItem>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    soundEngine.playClick();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            soundEngine.playSuccessChime();
          } else {
            soundEngine.playClick();
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const logFocusSession = (session: Omit<FocusSession, 'id' | 'completedAt'>) => {
    const newSession: FocusSession = {
      ...session,
      id: `session-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    setFocusHistory(prev => [newSession, ...prev]);
  };

  // Soundscape audio controls
  const toggleSoundscape = (type: SoundscapeType) => {
    if (activeSoundscape === type) {
      soundEngine.stopSoundscape();
      setActiveSoundscape(null);
    } else {
      soundEngine.setVolume(soundVolume);
      soundEngine.startSoundscape(type);
      setActiveSoundscape(type);
    }
  };

  const updateSoundVolume = (vol: number) => {
    setSoundVolume(vol);
    soundEngine.setVolume(vol);
  };

  const stopSoundscape = () => {
    soundEngine.stopSoundscape();
    setActiveSoundscape(null);
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    focusHistory,
    logFocusSession,
    activeSoundscape,
    soundVolume,
    toggleSoundscape,
    updateSoundVolume,
    stopSoundscape,
  };
}
