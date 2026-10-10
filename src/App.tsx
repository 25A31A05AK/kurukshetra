import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FocusDeck } from './components/FocusDeck/FocusDeck';
import { SoundscapeModal } from './components/SoundscapeModal';
import { DotModal } from './components/DotModal';
import { InstagramAuthModal } from './components/InstagramAuthModal';
import { IncompleteDotReminderBanner } from './components/IncompleteDotReminderBanner';
import { useCyberStore } from './store/useCyberStore';
import { TaskItem, UserProfile } from './types';
import { notificationService } from './services/notificationService';
import { getAuthToken, setAuthToken, fetchWithAuth } from './services/apiClient';
import { MobileBottomDock } from './components/MobileBottomDock';

const USER_STORAGE_KEY = 'kurukshetra_user_profile_v3';
const DOTS_STORAGE_KEY = 'cybersync_day_dots_v1';

export default function App() {
  const store = useCyberStore();
  const [isSoundscapeModalOpen, setIsSoundscapeModalOpen] = useState(false);
  const [isDotModalOpen, setIsDotModalOpen] = useState(false);
  const [pinnedTask, setPinnedTask] = useState<TaskItem | null>(null);

  // User auth state: Defaults to logged out so login modal prompts on open
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isLoggedIn === 'boolean') {
          return parsed;
        }
      }
    } catch {}
    return {
      id: 'user-guest',
      username: 'guest',
      name: 'Warrior',
      role: 'Warrior',
      isLoggedIn: false, // Prompt login on open
      joinedDate: 'October 2026',
      notificationEnabled: true,
    };
  });

  // Modal open state: Ask for login immediately when opening website if not logged in
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(() => {
    const token = getAuthToken();
    return !token;
  });

  // Validate session on app launch
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchWithAuth('/api/auth/me')
        .then(res => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then(data => {
          if (data?.user) {
            setUser({
              ...data.user,
              isLoggedIn: true,
            });
            setIsProfileModalOpen(false);
            syncDotsCount();
          }
        })
        .catch(() => {
          setAuthToken(null);
          setUser(prev => ({ ...prev, isLoggedIn: false }));
          setIsProfileModalOpen(true);
        });
    } else {
      setUser(prev => ({ ...prev, isLoggedIn: false }));
      setIsProfileModalOpen(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  // Read current white dots count from database and local storage
  const [whiteDotsCount, setWhiteDotsCount] = useState<number>(0);

  const syncDotsCount = () => {
    fetchWithAuth('/api/dots')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data.dots)) {
          setWhiteDotsCount(data.dots.filter(Boolean).length);
          localStorage.setItem(DOTS_STORAGE_KEY, JSON.stringify(data.dots));
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem(DOTS_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setWhiteDotsCount(parsed.filter(Boolean).length);
            }
          }
        } catch {}
      });
  };

  useEffect(() => {
    if (user.isLoggedIn) {
      syncDotsCount();
    }
    window.addEventListener('storage', syncDotsCount);
    return () => window.removeEventListener('storage', syncDotsCount);
  }, [isDotModalOpen, user.isLoggedIn]);

  // Direct Mobile / Desktop Notification Watcher for Incomplete Dots
  useEffect(() => {
    if (!user.isLoggedIn) return;
    notificationService.startIncompleteDotWatcher(
      () => 30 - whiteDotsCount,
      user.id,
      user.username
    );

    return () => {
      notificationService.stopIncompleteDotWatcher();
    };
  }, [whiteDotsCount, user.id, user.username, user.isLoggedIn]);

  // Log completed focus sessions to persistent database activity
  const handleLogFocusSession = (session: any) => {
    store.logFocusSession(session);
    if (!user.isLoggedIn) return;

    fetchWithAuth('/api/activity/log', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        username: user.username || 'warrior',
        type: 'focus_completed',
        title: `Focus Completed: ${session.taskTitle}`,
        description: `Completed ${session.durationMinutes}m focus session.`,
      }),
    }).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation for Kurukshetra */}
      <Navbar
        onOpenDotModal={() => setIsDotModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        activeSoundscape={store.activeSoundscape}
        onToggleSoundscapeModal={() => setIsSoundscapeModalOpen(true)}
        user={user}
        whiteDotsCount={whiteDotsCount}
      />

      {/* Main Viewport: Focus Mode */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 sm:pb-8 flex flex-col justify-center">
        <FocusDeck
          tasks={store.tasks}
          pinnedTask={pinnedTask}
          onSetPinnedTask={setPinnedTask}
          onAddTask={store.addTask}
          onLogFocusSession={handleLogFocusSession}
          activeSoundscape={store.activeSoundscape}
          onToggleSoundscape={store.toggleSoundscape}
          soundVolume={store.soundVolume}
          onUpdateSoundVolume={store.updateSoundVolume}
          focusHistory={store.focusHistory}
          onOpenDotModal={() => setIsDotModalOpen(true)}
        />
      </main>

      {/* Mobile Bottom Thumb Navigation Dock */}
      <MobileBottomDock
        onOpenDotModal={() => setIsDotModalOpen(true)}
        onOpenSoundscapeModal={() => setIsSoundscapeModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        activeSoundscape={store.activeSoundscape}
        user={user}
        whiteDotsCount={whiteDotsCount}
      />

      {/* Daily Incomplete Dot Reminder Banner with direct mobile/desktop alerts */}
      {user.isLoggedIn && (
        <IncompleteDotReminderBanner
          whiteDotsCount={whiteDotsCount}
          totalDays={30}
          onOpenDotModal={() => setIsDotModalOpen(true)}
          userId={user.id}
          username={user.username}
        />
      )}

      {/* Dot Daily Matrix Modal */}
      <DotModal
        isOpen={isDotModalOpen}
        onClose={() => setIsDotModalOpen(false)}
        userId={user.id}
        username={user.username}
      />

      {/* Instagram-style Login, Registration, Forgot Password & Profile Modal */}
      <InstagramAuthModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={setUser}
        whiteDotsCount={whiteDotsCount}
      />

      {/* Ambient Soundscape Selection Modal */}
      <SoundscapeModal
        isOpen={isSoundscapeModalOpen}
        onClose={() => setIsSoundscapeModalOpen(false)}
        activeSoundscape={store.activeSoundscape}
        onToggleSoundscape={store.toggleSoundscape}
        soundVolume={store.soundVolume}
        onUpdateSoundVolume={store.updateSoundVolume}
        onStopSoundscape={store.stopSoundscape}
      />
    </div>
  );
}
