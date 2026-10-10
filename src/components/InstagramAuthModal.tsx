import React, { useState, useEffect } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Bell, 
  BellRing, 
  CheckCircle2, 
  LogOut, 
  AlertCircle, 
  KeyRound, 
  Smartphone, 
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { UserProfile } from '../types';
import { soundEngine } from '../services/webAudioService';
import { notificationService } from '../services/notificationService';
import { setAuthToken, fetchWithAuth } from '../services/apiClient';
import { TermsModal } from './TermsModal';
import { GoogleAuthDialog, InstagramAuthDialog, SnapchatAuthDialog } from './SocialAuthDialogs';

interface InstagramAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  whiteDotsCount: number;
}

export const InstagramAuthModal: React.FC<InstagramAuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  whiteDotsCount,
}) => {
  // Mode: 'login' | 'signup' | 'forgot'
  const [viewMode, setViewMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Login form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up form
  const [signupEmailOrPhone, setSignupEmailOrPhone] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Forgot password form
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotMsg, setForgotMsg] = useState('');

  // Dialog popups
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isGoogleDialogOpen, setIsGoogleDialogOpen] = useState(false);
  const [isInstagramDialogOpen, setIsInstagramDialogOpen] = useState(false);
  const [isSnapchatDialogOpen, setIsSnapchatDialogOpen] = useState(false);

  // UI feedback state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Notification state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [notifStatusText, setNotifStatusText] = useState('');

  useEffect(() => {
    if (notificationService.isSupported()) {
      setNotifPermission(notificationService.getPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // Authentication Handlers
  // -------------------------------------------------------------

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your phone number, username, or email');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim() || 'password123',
          device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to log in. Please check your credentials.');
      }

      // Save token in client for API authentication
      if (data.token) {
        setAuthToken(data.token);
      }

      soundEngine.playSuccessChime();
      onUpdateUser({
        id: data.user.id,
        username: data.user.username,
        name: data.user.name,
        role: data.user.role,
        isLoggedIn: true,
        joinedDate: new Date(data.user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        dots: data.user.dots,
        notificationEnabled: data.user.notificationEnabled,
        provider: data.user.provider || 'local',
        token: data.token,
      });

      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 500);
    } catch (err: any) {
      soundEngine.playAlertBeep();
      setErrorMsg(err.message || 'Error logging into account');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSuccess = (data: { token: string; user: any; message: string }) => {
    if (data.token) {
      setAuthToken(data.token);
    }
    soundEngine.playCelebrationChord();
    onUpdateUser({
      id: data.user.id,
      username: data.user.username,
      name: data.user.name,
      role: data.user.role,
      isLoggedIn: true,
      joinedDate: new Date(data.user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      dots: data.user.dots,
      notificationEnabled: true,
      provider: data.user.provider,
      token: data.token,
    });
    setSuccessMsg(data.message || 'Authenticated successfully!');
    setTimeout(() => {
      onClose();
      setSuccessMsg('');
    }, 500);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmailOrPhone.trim()) {
      setErrorMsg('Please enter your mobile number or email');
      return;
    }
    if (!signupUsername.trim()) {
      setErrorMsg('Please choose a username');
      return;
    }
    if (!signupPassword.trim()) {
      setErrorMsg('Please enter a password');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('You must agree to the Terms of Service & Privacy Policy to sign up');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupUsername.trim(),
          name: signupFullName.trim() || signupUsername.trim(),
          emailOrPhone: signupEmailOrPhone.trim(),
          password: signupPassword.trim(),
          agreedToTerms: true,
          device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sign up');

      if (data.token) {
        setAuthToken(data.token);
      }

      soundEngine.playSuccessChime();
      onUpdateUser({
        id: data.user.id,
        username: data.user.username,
        name: data.user.name,
        role: data.user.role,
        isLoggedIn: true,
        joinedDate: 'Just now',
        dots: data.user.dots,
        notificationEnabled: true,
        provider: 'local',
        token: data.token,
      });

      setSuccessMsg('Account created and secured in Kurukshetra DB!');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 600);
    } catch (err: any) {
      soundEngine.playAlertBeep();
      setErrorMsg(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotStep === 'request') {
      if (!forgotIdentifier.trim()) {
        setErrorMsg('Please enter your email, phone, or username');
        return;
      }
      setLoading(true);
      setErrorMsg('');

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'User not found');

        setForgotMsg(data.message);
        setForgotStep('reset');
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (!newPassword.trim() || newPassword.length < 4) {
        setErrorMsg('New password must be at least 4 characters');
        return;
      }
      setLoading(true);
      setErrorMsg('');

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: forgotIdentifier.trim(),
            newPassword: newPassword.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Reset failed');

        soundEngine.playSuccessChime();
        setSuccessMsg('Password updated! Please log in.');
        setTimeout(() => {
          setViewMode('login');
          setForgotStep('request');
          setSuccessMsg('');
        }, 800);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    soundEngine.playClick();
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthToken(null);
    onUpdateUser({
      ...user,
      isLoggedIn: false,
      token: undefined,
    });
    setViewMode('login');
  };

  // Notification reminder test
  const handleTriggerTestReminder = async () => {
    const incompleteDots = 30 - whiteDotsCount;
    const res = await notificationService.sendDirectDotNotification(incompleteDots, {
      test: true,
      userId: user.id,
      username: user.username || 'manoj',
    });
    setNotifPermission(res.permission);
    setNotifStatusText(res.message);
    setTimeout(() => setNotifStatusText(''), 4000);
  };

  const handleEnableNotifications = async () => {
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      soundEngine.playSuccessChime();
      setNotifStatusText('Browser push notifications enabled for mobile & desktop!');
      setTimeout(() => setNotifStatusText(''), 3000);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => {
          if (user.isLoggedIn) onClose();
        }}
      >
        <div 
          className="relative w-full max-w-md font-sans max-h-[92dvh] overflow-y-auto no-scrollbar"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button only available if user is already logged in */}
          {user.isLoggedIn && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 z-20 rounded-full border border-slate-700 bg-slate-900/90 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer shadow-lg min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* ======================================================== */}
          {/* LOGGED IN: PRIVACY-PROTECTED PROFILE CARD               */}
          {/* ======================================================== */}
          {user.isLoggedIn ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0d111c] p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5">
              {/* Header: Private Profile (email and phone hidden) */}
              <div className="flex items-center gap-3.5 sm:gap-4 border-b border-slate-800/80 pb-4 sm:pb-5">
                <div className="relative">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full p-[2.5px] shadow-lg ${
                    user.provider === 'google'
                      ? 'bg-gradient-to-tr from-blue-500 to-emerald-500 shadow-blue-500/10'
                      : user.provider === 'snapchat'
                      ? 'bg-gradient-to-tr from-yellow-400 to-amber-500 shadow-yellow-500/10'
                      : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-amber-500/10'
                  }`}>
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0d111c] text-white font-black text-2xl">
                      {user.name ? user.name.slice(0, 1).toUpperCase() : 'W'}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#0d111c]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white truncate">
                      @{user.username || 'warrior'}
                    </h3>
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      {user.role || 'Warrior'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{user.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Verified Account
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 capitalize">{user.provider || 'Kurukshetra'} Auth</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 text-center">
                <div>
                  <p className="text-xl font-black text-white">{whiteDotsCount}</p>
                  <p className="text-xs font-medium text-slate-400">White Dots Done</p>
                </div>
                <div className="border-l border-slate-800">
                  <p className="text-xl font-black text-amber-400">
                    {Math.max(0, 30 - whiteDotsCount)}
                  </p>
                  <p className="text-xs font-medium text-slate-400">Dots Incomplete</p>
                </div>
              </div>

              {/* DIRECT DESKTOP & MOBILE NOTIFICATION REMINDER BOX */}
              <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <BellRing className="h-4 w-4 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        Direct Mobile & Desktop Reminders
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Direct alert notifications when daily dot is not completed
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    notifPermission === 'granted'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                  }`}>
                    {notifPermission === 'granted' ? 'Active' : 'Setup'}
                  </span>
                </div>

                {notifStatusText && (
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                    {notifStatusText}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  {notifPermission !== 'granted' && (
                    <button
                      onClick={handleEnableNotifications}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <Bell className="h-3.5 w-3.5" />
                      <span>Enable Browser Push</span>
                    </button>
                  )}
                  <button
                    onClick={handleTriggerTestReminder}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 text-white font-semibold text-xs py-2 transition-all cursor-pointer"
                  >
                    <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Send Test Alert to Phone</span>
                  </button>
                </div>
              </div>

              {/* Legal & Terms link */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Terms of Service & Privacy Policy</span>
                </button>
                <span className="text-[11px] text-slate-500">v3.4 Secured</span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-300 font-semibold text-xs py-2.5 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out from Kurukshetra</span>
              </button>
            </div>
          ) : (
            /* ======================================================== */
            /* LOGGED OUT: OFFICIAL MULTI-APP SIGN IN & REGISTRATION    */
            /* ======================================================== */
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-800/90 bg-[#0d111c] p-6 sm:p-7 shadow-2xl">
                {/* Brand Logo & Header */}
                <div className="text-center mb-5">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white font-black text-2xl shadow-xl shadow-amber-500/20 mb-2.5">
                    K
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white font-serif">
                    Kurukshetra
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sign in to track your 30-day dots & habit discipline
                  </p>
                </div>

                {/* Error & Success Messages */}
                {errorMsg && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/40 p-2.5 text-xs text-red-300 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span className="flex-1">{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-xs text-emerald-300 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="flex-1">{successMsg}</span>
                  </div>
                )}

                {/* VIEW: FORGOT PASSWORD */}
                {viewMode === 'forgot' ? (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 mb-2">
                        <Lock className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Trouble logging in?</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Enter your email, phone, or username to reset your account password.
                      </p>
                    </div>

                    {forgotMsg && (
                      <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300">
                        {forgotMsg}
                      </div>
                    )}

                    <form onSubmit={handleForgotSubmit} className="space-y-3">
                      {forgotStep === 'request' ? (
                        <div>
                          <input
                            type="text"
                            value={forgotIdentifier}
                            onChange={e => setForgotIdentifier(e.target.value)}
                            placeholder="Email, phone, or username"
                            className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loading
                          ? 'Processing...'
                          : forgotStep === 'request'
                          ? 'Send Recovery Code'
                          : 'Update Password'}
                      </button>
                    </form>

                    <div className="text-center pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('login');
                          setErrorMsg('');
                        }}
                        className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Back to login
                      </button>
                    </div>
                  </div>
                ) : (
                  /* MAIN AUTH TABS: SOCIAL + FORM */
                  <div className="space-y-4">
                    {/* Official Social Login Buttons (Google, Instagram, Snapchat) */}
                    <div className="space-y-2">
                      {/* Google Sign In */}
                      <button
                        type="button"
                        onClick={() => setIsGoogleDialogOpen(true)}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-700/90 bg-slate-900/90 hover:bg-slate-800/90 text-white font-semibold text-xs py-2.5 transition-all cursor-pointer shadow-sm hover:border-slate-500"
                      >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </button>

                      {/* Instagram & Snapchat Row */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Instagram */}
                        <button
                          type="button"
                          onClick={() => setIsInstagramDialogOpen(true)}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 to-purple-950/40 hover:from-rose-900/50 hover:to-purple-900/50 text-white font-semibold text-xs py-2.5 transition-all cursor-pointer"
                        >
                          <svg className="h-4 w-4 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          <span>Instagram</span>
                        </button>

                        {/* Snapchat */}
                        <button
                          type="button"
                          onClick={() => setIsSnapchatDialogOpen(true)}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 rounded-xl border border-yellow-500/40 bg-yellow-950/30 hover:bg-yellow-950/50 text-white font-semibold text-xs py-2.5 transition-all cursor-pointer"
                        >
                          <svg className="h-4 w-4 text-yellow-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.002 2c-3.89 0-6.19 2.766-6.19 5.86 0 1.25.437 2.454.898 3.328.093.176.12.285.043.435-.118.232-.475.568-.962.775-.487.206-.89.155-1.07.126-.144-.023-.277.067-.323.208-.06.185-.045.412.167.575.698.536 1.704.836 2.502.943.14.019.224.116.208.257-.04.356-.16.924-.46 1.256-.22.244-.555.385-1.01.425-.19.017-.325.176-.307.367.037.387.414.712.98.835.63.137 1.237.078 1.637-.024.184-.047.339.066.388.248.167.625.594 1.15 1.503 1.344.412.088.895.074 1.42-.047.34-.078.69-.115 1.04-.115.352 0 .701.037 1.042.115.525.121 1.008.135 1.42.047.909-.194 1.336-.719 1.503-1.344.049-.182.204-.295.388-.248.4.102 1.007.161 1.637.024.566-.123.943-.448.98-.835.018-.191-.117-.35-.307-.367-.455-.04-.79-.181-1.01-.425-.3-.332-.42-.9-.46-1.256-.016-.141.068-.238.208-.257.798-.107 1.804-.407 2.502-.943.212-.163.227-.39.167-.575-.046-.141-.179-.231-.323-.208-.18.029-.583.08-1.07-.126-.487-.207-.844-.543-.962-.775-.077-.15-.05-.259.043-.435.461-.874.898-2.078.898-3.328 0-3.094-2.3-5.86-6.19-5.86z" />
                          </svg>
                          <span>Snapchat</span>
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        OR WITH USER ID
                      </span>
                      <div className="flex-1 h-px bg-slate-800" />
                    </div>

                    {/* Mode Selector Tabs (Log In vs Sign Up) */}
                    <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('login');
                          setErrorMsg('');
                        }}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'login'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Log In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('signup');
                          setErrorMsg('');
                        }}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'signup'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    {viewMode === 'login' ? (
                      /* LOG IN FORM */
                      <form onSubmit={handleLoginSubmit} className="space-y-3">
                        <div>
                          <input
                            type="text"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            placeholder="Phone number, username, or email"
                            className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-all"
                          />
                        </div>

                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none pr-12 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-[11px] text-slate-400">
                          <label className="flex items-center gap-2 cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={e => setRememberMe(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                            />
                            <span>Stay logged in</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setViewMode('forgot');
                              setErrorMsg('');
                            }}
                            className="text-cyan-400 hover:underline cursor-pointer py-1"
                          >
                            Forgot password?
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs py-2.5 min-h-[44px] transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                        >
                          {loading ? 'Logging in...' : 'Log In'}
                        </button>

                        <p className="text-[10px] text-slate-500 text-center leading-relaxed pt-1">
                          By logging in, you agree to Kurukshetra&apos;s{' '}
                          <button
                            type="button"
                            onClick={() => setIsTermsOpen(true)}
                            className="text-amber-400/90 hover:underline font-semibold cursor-pointer"
                          >
                            Terms of Service
                          </button>{' '}
                          and{' '}
                          <button
                            type="button"
                            onClick={() => setIsTermsOpen(true)}
                            className="text-amber-400/90 hover:underline font-semibold cursor-pointer"
                          >
                            Privacy Policy
                          </button>
                          .
                        </p>
                      </form>
                    ) : (
                      /* SIGN UP FORM */
                      <form onSubmit={handleSignupSubmit} className="space-y-3">
                        <input
                          type="text"
                          value={signupEmailOrPhone}
                          onChange={e => setSignupEmailOrPhone(e.target.value)}
                          placeholder="Mobile number or email"
                          className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={signupFullName}
                          onChange={e => setSignupFullName(e.target.value)}
                          placeholder="Full name"
                          className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={signupUsername}
                          onChange={e => setSignupUsername(e.target.value)}
                          placeholder="Username"
                          className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        />
                        <input
                          type="password"
                          value={signupPassword}
                          onChange={e => setSignupPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        />

                        {/* Explicit Terms & Conditions Agreement Checkbox */}
                        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-[11px] text-slate-400">
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={agreedToTerms}
                              onChange={e => setAgreedToTerms(e.target.checked)}
                              className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                            />
                            <span className="leading-tight">
                              I accept Kurukshetra&apos;s{' '}
                              <button
                                type="button"
                                onClick={() => setIsTermsOpen(true)}
                                className="text-amber-400 hover:underline font-semibold cursor-pointer"
                              >
                                Terms of Service
                              </button>
                              ,{' '}
                              <button
                                type="button"
                                onClick={() => setIsTermsOpen(true)}
                                className="text-amber-400 hover:underline font-semibold cursor-pointer"
                              >
                                Privacy Policy
                              </button>
                              , and permanent database synchronization.
                            </span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                        >
                          {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card: Switch between Login & Sign Up / Help */}
              <div className="rounded-xl border border-slate-800/90 bg-[#0d111c] p-3.5 text-center text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="hover:text-amber-300 transition-colors font-medium cursor-pointer"
                >
                  View Official Terms & Conditions • Privacy Policy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Dialog Modals */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        onAccept={() => setAgreedToTerms(true)}
      />

      <GoogleAuthDialog
        isOpen={isGoogleDialogOpen}
        onClose={() => setIsGoogleDialogOpen(false)}
        onSuccess={handleSocialSuccess}
        onOpenTerms={() => {
          setIsGoogleDialogOpen(false);
          setIsTermsOpen(true);
        }}
      />

      <InstagramAuthDialog
        isOpen={isInstagramDialogOpen}
        onClose={() => setIsInstagramDialogOpen(false)}
        onSuccess={handleSocialSuccess}
        onOpenTerms={() => {
          setIsInstagramDialogOpen(false);
          setIsTermsOpen(true);
        }}
      />

      <SnapchatAuthDialog
        isOpen={isSnapchatDialogOpen}
        onClose={() => setIsSnapchatDialogOpen(false)}
        onSuccess={handleSocialSuccess}
        onOpenTerms={() => {
          setIsSnapchatDialogOpen(false);
          setIsTermsOpen(true);
        }}
      />
    </>
  );
};
