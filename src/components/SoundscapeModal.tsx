import React from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Radio, 
  Headphones, 
  Coffee,
  Check,
  Sparkles
} from 'lucide-react';
import { SoundscapeType } from '../types';

interface SoundscapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSoundscape: SoundscapeType | null;
  onToggleSoundscape: (type: SoundscapeType) => void;
  soundVolume: number;
  onUpdateSoundVolume: (vol: number) => void;
  onStopSoundscape: () => void;
}

export const SoundscapeModal: React.FC<SoundscapeModalProps> = ({
  isOpen,
  onClose,
  activeSoundscape,
  onToggleSoundscape,
  soundVolume,
  onUpdateSoundVolume,
  onStopSoundscape,
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      type: 'rain',
      name: 'Cyber Rain',
      description: 'Procedurally filtered pink noise simulating night rain outside a high-rise window.',
      icon: CloudRain,
      tag: 'Pink Noise Low-Pass',
    },
    {
      type: 'synth',
      name: 'Neon Synth Drone',
      description: 'Analog detuned sawtooth and sub-sine oscillators for deep calm and cyber warmth.',
      icon: Radio,
      tag: '55Hz Sub + 110Hz Chord',
    },
    {
      type: 'theta',
      name: 'Deep Space Theta Waves',
      description: 'Binaural carrier frequencies generating a 6Hz theta brainwave rhythm to lock into hyperfocus.',
      icon: Headphones,
      tag: '6Hz Differential Binaural',
    },
    {
      type: 'cafe',
      name: 'Lo-Fi Night Cafe',
      description: 'Filtered warm ambient room acoustics for gentle grounding presence.',
      icon: Coffee,
      tag: 'Bandpass Acoustic Hum',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-white">Generative Ambient Soundscapes</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Synthesized directly in your browser using the Web Audio API. Zero external audio downloads, infinite seamless looping, zero lag.
        </p>

        {/* Sound Presets List */}
        <div className="mt-4 space-y-2.5">
          {presets.map(item => {
            const Icon = item.icon;
            const isActive = activeSoundscape === item.type;

            return (
              <div
                key={item.type}
                onClick={() => onToggleSoundscape(item.type as SoundscapeType)}
                className={`cursor-pointer flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'border-cyan-400/60 bg-cyan-950/30 text-white shadow-lg shadow-cyan-950/30'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-lg border ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                      : 'border-slate-800 bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{item.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isActive ? 'Playing' : 'Play'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Volume & Master Stop */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <Volume2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => onUpdateSoundVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-slate-800 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-xs tabular-nums text-slate-400 shrink-0">
              {Math.round(soundVolume * 100)}%
            </span>
          </div>

          {activeSoundscape && (
            <button
              onClick={onStopSoundscape}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-950/40 transition-colors"
            >
              <VolumeX className="h-3.5 w-3.5" />
              <span>Stop Audio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
