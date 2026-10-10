import React from 'react';
import { 
  CheckCircle2, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { SoundscapeType, UserProfile } from '../types';

interface NavbarProps {
  onOpenDotModal: () => void;
  onOpenProfileModal?: () => void;
  activeSoundscape: SoundscapeType | null;
  onToggleSoundscapeModal: () => void;
  user?: UserProfile;
  whiteDotsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDotModal,
  activeSoundscape,
  onToggleSoundscapeModal,
  whiteDotsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070a13]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark: Kurukshetra */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-red-600 text-white font-black text-base sm:text-lg shadow-lg shadow-amber-500/20">
            K
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
            Kurukshetra
          </span>
        </div>

        {/* Zone 2: Desktop Navigation (Focus Mode and Dot) */}
        <nav className="hidden md:flex items-center gap-2">
          {/* Focus Mode */}
          <span className="flex items-center gap-2 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 text-xs font-semibold text-amber-400 whitespace-nowrap shrink-0">
            <CheckCircle2 className="h-4 w-4" />
            <span>Focus Mode</span>
          </span>

          {/* Dot (Beside Focus Mode) */}
          <button
            onClick={onOpenDotModal}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-white hover:text-white hover:bg-slate-800 transition-all whitespace-nowrap shrink-0 cursor-pointer group"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-white shadow-xs group-hover:scale-110 transition-transform" />
            <span>Dot</span>
            {whiteDotsCount > 0 && (
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30 px-1 rounded">
                {whiteDotsCount}/30
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Ambience */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Ambient Soundscape Control */}
          <button
            onClick={onToggleSoundscapeModal}
            title={activeSoundscape ? `Soundscape Active: ${activeSoundscape}` : 'Ambient Soundscapes'}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all cursor-pointer min-h-[38px] ${
              activeSoundscape
                ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {activeSoundscape ? (
              <>
                <Volume2 className="h-4 w-4 text-cyan-400 animate-pulse shrink-0" />
                <span className="hidden sm:inline capitalize">{activeSoundscape}</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Ambience</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
