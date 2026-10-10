import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, Bell, CheckCircle2, ExternalLink } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'dots' | 'notifications'>('terms');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-2xl border border-slate-700/80 bg-[#0d111c] text-slate-100 shadow-2xl overflow-hidden font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 bg-slate-900/60">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/20 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Legal & Terms of Service</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Official terms & privacy governance</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            aria-label="Close terms"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0b0e17] px-2 sm:px-4 overflow-x-auto no-scrollbar text-xs font-semibold">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('dots')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dots'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Habit & Dots Storage</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Direct Notifications</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-300">
                <p className="font-semibold text-xs">Summary of Kurukshetra Terms</p>
                <p className="text-[11px] text-amber-200/80 mt-1">
                  By accessing or signing in to Kurukshetra through Google, Instagram, Snapchat, or your user credentials, you enter into a binding agreement to abide by discipline guidelines and account protection rules.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Acceptance of Terms</h4>
                <p>
                  These Terms of Service govern your use of the Kurukshetra discipline, habit tracking, and focus system. By clicking &quot;Log In&quot;, &quot;Sign Up&quot;, or continuing with Google, Instagram, or Snapchat, you agree to be bound by these Terms and our Privacy Policy.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Warrior Account & Security</h4>
                <p>
                  You are responsible for maintaining the confidentiality of your login credentials. All activities occurring under your authenticated account—including dot completions, focus deck sessions, and follow connections—are recorded in our secured database.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. Social Account Integration</h4>
                <p>
                  When connecting with Google, Instagram, or Snapchat, we only verify identity and basic profile identifiers necessary for authentication. We never post on your behalf or access private messages.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">4. Permanent Cloud Synchronization</h4>
                <p>
                  Your 30-day dot matrix and focus statistics are permanently stored in the Kurukshetra database to ensure that when you log in across multiple devices (mobile, tablet, or desktop), your habit data remains completely synchronized.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">5. Community Guidelines & Anti-Abuse</h4>
                <p>
                  Users must treat fellow warriors with respect. Any unauthorized attempts to compromise account security, forge session tokens, or send spam follow requests will result in account termination.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-300">
                <p className="font-semibold text-xs">Privacy-First Architecture</p>
                <p className="text-[11px] text-emerald-200/80 mt-1">
                  We guarantee that your personal phone number and email address are never displayed on your public profile or shared with third parties.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Information We Collect</h4>
                <p>
                  We collect your username, display name, chosen password or OAuth provider token, and habit completion timestamps. Your email or phone number is utilized solely for account verification and password recovery.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Profile Privacy Safeguards</h4>
                <p>
                  In accordance with our privacy guidelines, all public and profile cards display only your @username, warrior badge, and dot statistics. Personal phone numbers and emails are masked and hidden from standard view.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. Token Security & Encryption</h4>
                <p>
                  API requests utilize cryptographic Bearer session tokens. Unauthenticated requests are strictly rejected with 401 Unauthorized status.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">4. Zero Data Selling</h4>
                <p>
                  Kurukshetra does not sell, lease, or monetize your personal information or habit data to third-party advertisers.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'dots' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-cyan-300">
                <p className="font-semibold text-xs">The 30-Day Dot Matrix Protocol</p>
                <p className="text-[11px] text-cyan-200/80 mt-1">
                  Each day represents a commitment. When you toggle a dot white, it is committed immediately to the permanent online database.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Multi-Device Dot Persistence</h4>
                <p>
                  When you refresh your browser or open Kurukshetra on a mobile phone, your completed dots are retrieved directly from the secure server, preventing data loss or accidental resets.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Habit Integrity</h4>
                <p>
                  The dot matrix measures daily warrior discipline. Toggling dots updates your progress counter in real time across all open sessions.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 text-purple-300">
                <p className="font-semibold text-xs">Direct Notification Consent</p>
                <p className="text-[11px] text-purple-200/80 mt-1">
                  We send direct desktop and mobile browser push notifications solely to alert you when your daily dot has not been completed.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Purpose of Alerts</h4>
                <p>
                  Notification alerts help you maintain uninterrupted habit streaks. If your day has incomplete dots, an automated reminder is dispatched to your device.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Opt-Out & Frequency</h4>
                <p>
                  You can manage your notification preferences at any time from your profile settings or your browser permissions panel.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/80 px-6 py-4">
          <p className="text-[11px] text-slate-500">
            Last revised: October 2026 • Kurukshetra Warrior Protocol
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-md shadow-amber-500/20"
              >
                I Agree & Accept
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
