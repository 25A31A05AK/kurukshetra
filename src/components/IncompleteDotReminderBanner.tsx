import React, { useState } from 'react';
import { BellRing, Check, Smartphone, X, Sparkles } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { soundEngine } from '../services/webAudioService';

interface IncompleteDotReminderBannerProps {
  whiteDotsCount: number;
  totalDays?: number;
  onOpenDotModal: () => void;
  userId?: string;
  username?: string;
}

export const IncompleteDotReminderBanner: React.FC<IncompleteDotReminderBannerProps> = ({
  whiteDotsCount,
  totalDays = 30,
  onOpenDotModal,
  userId,
  username,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [alertSentMsg, setAlertSentMsg] = useState('');

  const incompleteCount = totalDays - whiteDotsCount;

  // If all dots completed or user dismissed, don't show
  if (dismissed || incompleteCount <= 0) return null;

  const handleSendDirectAlert = async () => {
    soundEngine.playAlertBeep();
    const res = await notificationService.sendDirectDotNotification(incompleteCount, {
      userId,
      username,
    });
    setAlertSentMsg(res.message);
    setTimeout(() => setAlertSentMsg(''), 4000);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-lg animate-in slide-in-from-bottom duration-300">
      <div className="rounded-xl border border-amber-500/40 bg-[#0d111c]/95 backdrop-blur-lg p-3 sm:p-3.5 shadow-2xl shadow-amber-500/10">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <BellRing className="h-4 w-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Daily Dot Incomplete</span>
                <span className="text-[10px] font-semibold bg-amber-950/60 border border-amber-500/30 text-amber-400 px-1.5 py-0.2 rounded">
                  {incompleteCount} Remaining
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {alertSentMsg || 'Your focus task dot is not marked white yet.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSendDirectAlert}
              title="Send notification to your mobile or desktop"
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-cyan-400 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition-all cursor-pointer whitespace-nowrap"
            >
              <Smartphone className="h-3 w-3 text-cyan-400" />
              <span className="hidden sm:inline">Alert Phone</span>
            </button>
            <button
              onClick={onOpenDotModal}
              className="flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-[11px] font-bold text-slate-950 transition-all cursor-pointer shadow-sm shadow-amber-500/20 whitespace-nowrap"
            >
              <Check className="h-3 w-3" />
              <span>Mark White</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
