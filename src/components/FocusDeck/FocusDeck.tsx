import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Pin,
  Bell,
  Sparkles,
  Coffee,
  CheckCircle2,
  VolumeX
} from 'lucide-react';
import { TaskItem, SoundscapeType, FocusSession } from '../../types';
import { soundEngine } from '../../services/webAudioService';

interface FocusDeckProps {
  tasks: TaskItem[];
  pinnedTask: TaskItem | null;
  onSetPinnedTask: (task: TaskItem | null) => void;
  onAddTask?: (task: Omit<TaskItem, 'id'>) => TaskItem;
  onLogFocusSession: (session: Omit<FocusSession, 'id' | 'completedAt'>) => void;
  activeSoundscape: SoundscapeType | null;
  onToggleSoundscape: (type: SoundscapeType) => void;
  soundVolume: number;
  onUpdateSoundVolume: (vol: number) => void;
  focusHistory: FocusSession[];
  onOpenDotModal?: () => void;
}

export const FocusDeck: React.FC<FocusDeckProps> = ({
  tasks,
  pinnedTask,
  onSetPinnedTask,
  onAddTask,
  onLogFocusSession,
  activeSoundscape,
  onToggleSoundscape,
  soundVolume,
  onUpdateSoundVolume,
  focusHistory,
  onOpenDotModal,
}) => {
  const [newObjectiveText, setNewObjectiveText] = useState('');
  // Timer settings
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [workDurationMinutes, setWorkDurationMinutes] = useState<number>(25);
  const [shortBreakMinutes] = useState<number>(5);
  const [longBreakMinutes] = useState<number>(15);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [totalSecondsForCurrentMode, setTotalSecondsForCurrentMode] = useState<number>(25 * 60);
  const [isAlarmGreetingActive, setIsAlarmGreetingActive] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch modes
  const handleSelectMode = (newMode: 'work' | 'shortBreak' | 'longBreak', minutes?: number) => {
    soundEngine.playClick();
    setIsRunning(false);
    setMode(newMode);

    let duration = 25;
    if (newMode === 'work') {
      duration = minutes || workDurationMinutes;
    } else if (newMode === 'shortBreak') {
      duration = shortBreakMinutes;
    } else if (newMode === 'longBreak') {
      duration = longBreakMinutes;
    }

    const totalSec = duration * 60;
    setTotalSecondsForCurrentMode(totalSec);
    setTimeLeftSeconds(totalSec);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);

            // Record completed focus session
            if (mode === 'work') {
              onLogFocusSession({
                taskId: pinnedTask?.id,
                taskTitle: pinnedTask ? pinnedTask.title : 'Deep Focus Sprint',
                durationMinutes: Math.max(1, Math.round(totalSecondsForCurrentMode / 60)),
                type: 'Work',
              });
            }

            // Exactly the next second: sound the alarm greeting!
            setTimeout(() => {
              soundEngine.playAlarmGreeting();
              setIsAlarmGreetingActive(true);
            }, 1000);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, pinnedTask, totalSecondsForCurrentMode, onLogFocusSession]);

  const handleDismissAlarm = () => {
    soundEngine.stopAlarmGreeting();
    soundEngine.playClick();
    setIsAlarmGreetingActive(false);
  };

  const handleStartBreakFromAlarm = () => {
    soundEngine.stopAlarmGreeting();
    setIsAlarmGreetingActive(false);
    handleSelectMode('shortBreak', 5);
    setIsRunning(true);
  };

  const handleOpenDotFromAlarm = () => {
    soundEngine.stopAlarmGreeting();
    setIsAlarmGreetingActive(false);
    if (onOpenDotModal) onOpenDotModal();
  };

  const toggleTimer = () => {
    soundEngine.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    soundEngine.playClick();
    setIsRunning(false);
    setTimeLeftSeconds(totalSecondsForCurrentMode);
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circular math
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalSecondsForCurrentMode > 0 ? (totalSecondsForCurrentMode - timeLeftSeconds) / totalSecondsForCurrentMode : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Uncompleted tasks for pinning
  const pendingTasks = tasks.filter(t => !t.completed);

  // Daily focus stats
  const todayFocusMinutes = focusHistory
    .filter(s => {
      const d = new Date(s.completedAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    })
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const completedSessionsCount = focusHistory.filter(s => {
    const d = new Date(s.completedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString() && s.type === 'Work';
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Focus Mode
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Eliminate digital noise, lock into high-output flow with Pomodoro cycles and ambient acoustics.
        </p>
      </div>

      <div className="flex justify-center w-full">
        {/* Main Timer Deck */}
        <div className="w-full max-w-2xl flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-6 md:p-12 shadow-2xl">
          {/* Mode Tabs (Swipeable on mobile) */}
          <div className="w-full flex items-center justify-start sm:justify-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-6 overflow-x-auto no-scrollbar touch-pan-x">
            <button
              type="button"
              onClick={() => handleSelectMode('work', 25)}
              className={`rounded-lg px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] transition-all cursor-pointer ${
                mode === 'work' && totalSecondsForCurrentMode === 25 * 60
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              25m Focus
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('work', 50)}
              className={`rounded-lg px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] transition-all cursor-pointer ${
                mode === 'work' && totalSecondsForCurrentMode === 50 * 60
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              50m Ultra
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('shortBreak')}
              className={`rounded-lg px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] transition-all cursor-pointer ${
                mode === 'shortBreak'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              5m Break
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('longBreak')}
              className={`rounded-lg px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] transition-all cursor-pointer ${
                mode === 'longBreak'
                  ? 'bg-violet-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              15m Rest
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setIsRunning(false);
                setMode('work');
                setTotalSecondsForCurrentMode(5);
                setTimeLeftSeconds(5);
              }}
              title="Test timer completion and next-second alarm greeting"
              className={`rounded-lg px-3 py-2 text-[11px] font-semibold whitespace-nowrap shrink-0 min-h-[40px] transition-all cursor-pointer ${
                totalSecondsForCurrentMode === 5
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              5s Test
            </button>
          </div>

          {/* Active Objective Pin Display */}
          <div className="mb-4 sm:mb-6 w-full max-w-md">
            {pinnedTask ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Pin className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span className="text-xs text-slate-400 shrink-0">Anchor:</span>
                  <span className="text-xs sm:text-sm font-semibold text-white truncate">
                    {pinnedTask.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSetPinnedTask(null)}
                  className="text-xs text-slate-400 hover:text-white shrink-0 p-1 cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-800 px-3.5 py-2 text-xs text-slate-400 text-center">
                <Pin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Ready for focus session</span>
              </div>
            )}
          </div>

          {/* Radial Neon Progress Ring (Scalable for all screen widths) */}
          <div className="relative flex items-center justify-center my-2 sm:my-4">
            <svg 
              viewBox="0 0 320 320" 
              className="w-[230px] h-[230px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] transform -rotate-90"
            >
              {/* Background Track */}
              <circle
                cx="160"
                cy="160"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-900"
              />
              {/* Animated Progress Fill */}
              <circle
                cx="160"
                cy="160"
                r={radius}
                stroke={mode === 'work' ? '#f59e0b' : mode === 'shortBreak' ? '#06b6d4' : '#8b5cf6'}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 ease-linear"
              />
            </svg>

            {/* Centered Digital Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight tabular-nums text-white">
                {timeFormatted}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1 sm:mt-2">
                {mode === 'work' ? 'Deep Work Sprint' : mode === 'shortBreak' ? 'Short Recovery' : 'Extended Recharge'}
              </span>
            </div>
          </div>

          {/* Primary Controls with touch targets >= 48px */}
          <div className="flex items-center gap-5 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={toggleTimer}
              className={`flex h-16 w-16 items-center justify-center rounded-full text-slate-950 font-bold transition-all shadow-xl active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-400/30'
                  : 'bg-cyan-400 hover:bg-cyan-300 shadow-cyan-400/30'
              }`}
            >
              {isRunning ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={resetTimer}
              title="Reset Timer"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Alarm Greeting Modal (Fires the next second after completion) */}
      {isAlarmGreetingActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-2xl border border-amber-500/60 bg-gradient-to-b from-slate-900 via-slate-950 to-[#070a13] p-6 text-center shadow-2xl shadow-amber-500/20">
            {/* Animated ringing bell */}
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 animate-bounce">
              <Bell className="h-10 w-10 fill-amber-400 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Alarm Greeting</span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white">
              Focus Sprint Completed!
            </h3>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Awesome work, champion! You locked in and conquered your sprint. Take a deep breath, celebrate the win, and log your daily progress!
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={handleOpenDotFromAlarm}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-slate-200 shadow-lg shadow-white/20 transition-all"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-black inline-block" />
                <span>Open Dot & Mark Today White</span>
              </button>

              <button
                onClick={handleStartBreakFromAlarm}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all"
              >
                <Coffee className="h-4 w-4" />
                <span>Start 5m Rest Break</span>
              </button>

              <button
                onClick={handleDismissAlarm}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <VolumeX className="h-4 w-4" />
                <span>Dismiss Alarm Tone</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
