import React, { useState } from 'react';
import { X, Lock, ShieldCheck, User, Mail, Phone, LogOut, KeyRound } from 'lucide-react';
import { UserProfile } from '../types';
import { soundEngine } from '../services/webAudioService';

interface AuthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  whiteDotsCount: number;
}

const MANOJ_EMAIL = 'manojka246@gmail.com';
const MANOJ_PHONE = '8499837949';

export const AuthProfileModal: React.FC<AuthProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  whiteDotsCount,
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [emailInput, setEmailInput] = useState(user.email || MANOJ_EMAIL);
  const [phoneInput, setPhoneInput] = useState(user.phone || MANOJ_PHONE);
  const [nameInput, setNameInput] = useState(user.name || 'Manoj');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMessage('Please enter your email or username');
      return;
    }
    if (!passwordInput.trim() || passwordInput.length < 4) {
      setErrorMessage('Security PIN / Password must be at least 4 characters');
      return;
    }

    const isManoj = emailInput.trim().toLowerCase() === MANOJ_EMAIL.toLowerCase();

    soundEngine.playSuccessChime();
    onUpdateUser({
      ...user,
      email: emailInput.trim(),
      phone: phoneInput.trim() || (isManoj ? MANOJ_PHONE : undefined),
      name: nameInput.trim() || (isManoj ? 'Manoj' : emailInput.split('@')[0]),
      role: isManoj ? 'Admin / Owner' : 'Team Member',
      isLoggedIn: true,
    });
    setErrorMessage('');
    onClose();
  };

  const handleQuickManojLogin = () => {
    soundEngine.playSuccessChime();
    onUpdateUser({
      ...user,
      id: 'owner-manoj',
      name: 'Manoj',
      email: MANOJ_EMAIL,
      phone: MANOJ_PHONE,
      role: 'Admin / Owner',
      isLoggedIn: true,
      joinedDate: 'October 2026',
    });
    setErrorMessage('');
    onClose();
  };

  const handleLogout = () => {
    soundEngine.playClick();
    onUpdateUser({
      ...user,
      isLoggedIn: false,
    });
    setPasswordInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#070a13] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {user.isLoggedIn ? 'Security & Profile' : 'Kurukshetra Access'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {user.isLoggedIn ? 'Authenticated Session' : 'Security authorization required'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {user.isLoggedIn ? (
          /* Profile Section */
          <div className="mt-5 space-y-5">
            {/* Avatar & User Details */}
            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-cyan-500 text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white truncate">{user.name}</h4>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    {user.role || 'Admin / Owner'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 truncate mt-1 font-mono">
                  <Mail className="h-3 w-3 text-cyan-400 shrink-0" />
                  <span>{user.email || MANOJ_EMAIL}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 truncate mt-0.5 font-mono">
                  <Phone className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>{user.phone || MANOJ_PHONE}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Member since {user.joinedDate}
                </p>
              </div>
            </div>

            {/* Security Status Box */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-cyan-400" />
                  Team Administrator Access
                </span>
                <span className="text-emerald-400 font-semibold font-mono">Authorized</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white inline-block shadow-xs" />
                  Completed White Dots
                </span>
                <span className="font-mono text-white font-bold">{whiteDotsCount} Days</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/20 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>

              <button
                onClick={onClose}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                Close Profile
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="mt-5 space-y-4">
            {/* Quick Manoj Admin Login Button */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-center">
              <p className="text-xs text-amber-200 mb-2 font-medium">
                Admin Sign-In for Manoj:
              </p>
              <button
                type="button"
                onClick={handleQuickManojLogin}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Sign In as Manoj ({MANOJ_EMAIL})</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-mono">or manual login</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              {errorMessage && (
                <div className="rounded-lg bg-red-950/40 border border-red-500/30 p-2.5 text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Manoj"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="manojka246@gmail.com"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="8499837949"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Password / PIN
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                <span>{isLoginMode ? 'Unlock Secure Access' : 'Create Protected Account'}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setErrorMessage('');
                  }}
                  className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
                >
                  {isLoginMode ? "Don't have an account? Sign up" : 'Already have credentials? Sign in'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
