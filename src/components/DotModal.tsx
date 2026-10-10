import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Check, 
  Info,
  Database,
  CloudCheck,
  RefreshCw,
  Sparkles,
  BellRing,
  Smartphone
} from 'lucide-react';
import { soundEngine } from '../services/webAudioService';
import { notificationService } from '../services/notificationService';
import { fetchWithAuth } from '../services/apiClient';

interface DotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  username?: string;
}

const STORAGE_KEY = 'cybersync_day_dots_v1';

export const DotModal: React.FC<DotModalProps> = ({ 
  isOpen, 
  onClose,
  userId,
  username
}) => {
  const [dots, setDots] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return new Array(30).fill(false);
  });

  const [totalDays, setTotalDays] = useState<number>(30);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [reminderMsg, setReminderMsg] = useState<string>('');

  const loadDotsFromDatabase = async () => {
    try {
      setIsSyncing(true);
      const res = await fetchWithAuth('/api/dots');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.dots)) {
          setDots(data.dots);
          setTotalDays(data.dots.length);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.dots));
          setDbConnected(true);
          setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn('Backend dots fetch failed, using local storage cache', err);
      setDbConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadDotsFromDatabase();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadDotsFromDatabase();
    }
  }, [isOpen]);

  // Persist dot update to both server database and localStorage
  const saveDotsToBackend = async (newDots: boolean[], dotIndex?: number, toggledTo?: boolean) => {
    try {
      setIsSyncing(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDots));
      const res = await fetchWithAuth('/api/dots', {
        method: 'POST',
        body: JSON.stringify({ 
          dots: newDots,
          userId,
          dotIndex,
          toggledTo,
        }),
      });
      if (res.ok) {
        setDbConnected(true);
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Error saving dots to database:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRangeChange = (days: number) => {
    setTotalDays(days);
    setDots(prev => {
      let updated: boolean[];
      if (prev.length === days) return prev;
      if (prev.length < days) {
        updated = [...prev, ...new Array(days - prev.length).fill(false)];
      } else {
        updated = prev.slice(0, days);
      }
      saveDotsToBackend(updated);
      return updated;
    });
  };

  const handleToggleDot = (index: number) => {
    setDots(prev => {
      const next = [...prev];
      const willBeWhite = !next[index];
      next[index] = willBeWhite;

      if (willBeWhite) {
        soundEngine.playSuccessChime();
      } else {
        soundEngine.playClick();
      }
      saveDotsToBackend(next, index, willBeWhite);
      return next;
    });
  };

  const handleReset = () => {
    soundEngine.playClick();
    if (window.confirm('Reset all dots back to black?')) {
      const resetArray = new Array(totalDays).fill(false);
      setDots(resetArray);
      saveDotsToBackend(resetArray);
    }
  };

  const handleSendReminderAlert = async () => {
    const whiteCount = dots.filter(Boolean).length;
    const incomplete = dots.length - whiteCount;
    const res = await notificationService.sendDirectDotNotification(incomplete, {
      userId,
      username,
    });
    setReminderMsg(res.message);
    setTimeout(() => setReminderMsg(''), 4000);
  };

  if (!isOpen) return null;

  const whiteCount = dots.filter(Boolean).length;
  const blackCount = dots.length - whiteCount;
  const completionPercentage = dots.length > 0 ? Math.round((whiteCount / dots.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#070a13] p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-white shadow-md shadow-white/40 shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Dot Daily Matrix
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Black dots = days to conquer. Tap a dot to mark it white.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={handleReset}
              title="Reset All Dots"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Database Persistence Status Badge & Direct Mobile Reminder */}
        <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">Cloud DB Sync:</span>
            <span className="font-semibold text-emerald-400 text-[11px] sm:text-xs">Active</span>
            {lastSavedTime && (
              <span className="text-[10px] sm:text-[11px] text-slate-500 hidden xs:inline">
                ({lastSavedTime})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {blackCount > 0 && (
              <button
                type="button"
                onClick={handleSendReminderAlert}
                title="Send reminder to phone or desktop"
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer min-h-[32px] px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20"
              >
                <BellRing className="h-3 w-3" />
                <span>Alert Phone</span>
              </button>
            )}
            <button
              type="button"
              onClick={loadDotsFromDatabase}
              title="Reload dots from database"
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer min-h-[32px] px-2 py-1"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {reminderMsg && (
          <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 text-center animate-in fade-in">
            {reminderMsg}
          </div>
        )}

        {/* Status & Range Selector (Responsive on mobile) */}
        <div className="my-3 sm:my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3 sm:p-4 shrink-0">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-black border border-slate-600 inline-block" />
              <span className="text-xs text-slate-400">
                Incomplete: <strong className="font-mono text-slate-200 font-bold">{blackCount}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-xs inline-block" />
              <span className="text-xs text-slate-400">
                Done: <strong className="font-mono text-white font-bold">{whiteCount}</strong>
              </span>
            </div>

            <span className="text-xs font-mono tabular-nums text-cyan-400 font-semibold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
              {completionPercentage}%
            </span>
          </div>

          {/* Range picker buttons */}
          <div className="flex items-center gap-1 self-end sm:self-auto">
            {[30, 60, 100].map(days => (
              <button
                key={days}
                type="button"
                onClick={() => handleRangeChange(days)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-[34px] ${
                  totalDays === days
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* The Dot Grid (Comfortable 5-col on mobile, 6 on sm, 10 on md) */}
        <div className="flex-1 overflow-y-auto p-1 sm:p-2 min-h-48 no-scrollbar">
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2.5 sm:gap-3 justify-items-center py-1">
            {dots.map((isWhite, index) => {
              const dayNum = index + 1;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleToggleDot(index)}
                  title={`Day ${dayNum}: Tap to mark ${isWhite ? 'incomplete (black)' : 'completed (white)'}`}
                  className="group relative flex flex-col items-center justify-center transition-all transform active:scale-90 cursor-pointer min-h-[48px] min-w-[48px]"
                >
                  {/* The Dot itself */}
                  <div
                    className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isWhite
                        ? 'bg-white text-black shadow-lg shadow-white/30 border-2 border-white scale-105'
                        : 'bg-black border-2 border-slate-700 hover:border-slate-400 active:border-white'
                    }`}
                  >
                    {isWhite ? (
                      <Check className="h-5 w-5 stroke-[3] text-black" />
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-300 font-bold">
                        {dayNum}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-mono mt-1 ${isWhite ? 'text-white font-bold' : 'text-slate-500'}`}>
                    D{dayNum}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructional Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5 text-[11px] sm:text-xs truncate max-w-[200px] sm:max-w-none">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Saved to Kurukshetra DB
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-slate-200 transition-colors cursor-pointer min-h-[38px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
