import React from 'react';
import { 
  CheckCircle2, 
  CircleDot, 
  Volume2, 
  VolumeX, 
  User, 
  Sparkles,
  Lock
} from 'lucide-react';
import { SoundscapeType, UserProfile } from '../types';
import { soundEngine } from '../services/webAudioService';

interface MobileBottomDockProps {
  onOpenDotModal: () => void;
  onOpenSoundscapeModal: () => void;
  onOpenProfileModal: () => void;
  activeSoundscape: SoundscapeType | null;
  user: UserProfile;
  whiteDotsCount: number;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  onOpenDotModal,
  onOpenSoundscapeModal,
  onOpenProfileModal,
  activeSoundscape,
  user,
  whiteDotsCount,
}) => {
  const incompleteCount = Math.max(0, 30 - whiteDotsCount);

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-[#070a13]/95 backdrop-blur-xl px-2 pt-2 pb-safe shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.6)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center gap-1">
        {/* 1. Focus Timer */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-amber-400 hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer min-h-[50px]"
        >
          <div className="relative flex items-center justify-center h-6 w-6">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Focus</span>
        </button>

        {/* 2. Daily Dot Matrix */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onOpenDotModal();
          }}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer min-h-[50px] relative"
        >
          <div className="relative flex items-center justify-center h-6 w-6">
            <CircleDot className="h-5 w-5 text-white" />
            {whiteDotsCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-cyan-500 text-[8px] font-black text-slate-950 px-0.5">
                {whiteDotsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">
            Dots ({whiteDotsCount}/30)
          </span>
        </button>

        {/* 3. Ambience Soundscape */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onOpenSoundscapeModal();
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl active:scale-95 transition-all cursor-pointer min-h-[50px] ${
            activeSoundscape 
              ? 'text-cyan-400 bg-cyan-950/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className="relative flex items-center justify-center h-6 w-6">
            {activeSoundscape ? (
              <Volume2 className="h-5 w-5 animate-pulse" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5 truncate max-w-[70px]">
            {activeSoundscape ? activeSoundscape : 'Ambience'}
          </span>
        </button>

        {/* 4. Warrior Account / Profile */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onOpenProfileModal();
          }}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer min-h-[50px] relative"
        >
          <div className="relative flex items-center justify-center h-6 w-6">
            {user.isLoggedIn ? (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#070a13] text-white font-bold text-[9px]">
                  {user.name ? user.name.slice(0, 1).toUpperCase() : 'W'}
                </div>
              </div>
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Lock className="h-3 w-3" />
              </div>
            )}
            {user.isLoggedIn && incompleteCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5 truncate max-w-[70px]">
            {user.isLoggedIn ? `@${user.username || 'profile'}` : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
};
