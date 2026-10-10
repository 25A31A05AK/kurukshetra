import React, { useState } from 'react';
import { X, Check, ArrowRight, Shield, User, Lock, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface SocialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { token: string; user: any; message: string }) => void;
  onOpenTerms: () => void;
}

// -------------------------------------------------------------
// 1. Official Google Account Chooser
// -------------------------------------------------------------
export const GoogleAuthDialog: React.FC<SocialDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenTerms,
}) => {
  const [useOther, setUseOther] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectAccount = async (email: string, name: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Google Auth Portal',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google authorization failed');
      onSuccess({
        token: data.token,
        user: data.user,
        message: `Signed in as ${email}`,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address');
      return;
    }
    handleSelectAccount(customEmail.trim(), customName.trim() || customEmail.split('@')[0]);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto no-scrollbar rounded-2xl border border-slate-700 bg-white text-slate-900 shadow-2xl font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-2">
          <div className="flex items-center gap-2.5">
            <svg className="h-6 w-6" viewBox="0 0 24 24">
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
            <span className="text-sm font-semibold text-slate-700 tracking-tight">Sign in with Google</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-2.5">
          <h3 className="text-xl font-bold text-slate-900">Choose an account</h3>
          <p className="text-xs text-slate-600 mt-1">
            to continue to <strong className="text-slate-900 font-semibold">Kurukshetra</strong>
          </p>
        </div>

        {error && (
          <div className="mx-5 sm:mx-6 mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Account Selector List */}
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {/* Default Account: Manoj */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSelectAccount('manojka246@gmail.com', 'Manoj')}
            className="w-full flex items-center gap-3.5 px-5 sm:px-6 py-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer disabled:opacity-60 min-h-[56px]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-base shadow-sm">
              M
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 leading-tight">Manoj</p>
              <p className="text-xs text-slate-500 truncate">manojka246@gmail.com</p>
            </div>
            <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
              Owner
            </span>
          </button>

          {/* Another Account option */}
          {!useOther ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => setUseOther(true)}
              className="w-full flex items-center gap-3.5 px-5 sm:px-6 py-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer min-h-[56px]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-600 bg-slate-50">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">Use another Google account</p>
                <p className="text-xs text-slate-500">Sign in with different email</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-5 sm:p-6 bg-slate-50 space-y-3">
              <input
                type="email"
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
                placeholder="Google email address"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Display Name (optional)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 min-h-[44px] transition-colors cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Sign In with This Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setUseOther(false)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer / Terms Notice */}
        <div className="bg-slate-50 border-t border-slate-100 px-5 sm:px-6 py-3.5 text-[11px] text-slate-500 leading-relaxed">
          <p>
            To continue, Google will share your name and email with Kurukshetra. Before using this app, review its{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. Official Instagram Login Dialog
// -------------------------------------------------------------
export const InstagramAuthDialog: React.FC<SocialDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenTerms,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (igUsername: string, displayName?: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: igUsername,
          name: displayName || igUsername,
          device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Instagram In-App Browser',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Instagram authentication failed');
      onSuccess({
        token: data.token,
        user: data.user,
        message: `Connected Instagram @${data.user.username}`,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Instagram connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your Instagram username, phone or email');
      return;
    }
    handleLogin(username.trim());
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-sm max-h-[92dvh] overflow-y-auto no-scrollbar rounded-2xl border border-slate-800 bg-[#121624] text-white shadow-2xl font-sans"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-7 space-y-4 sm:space-y-5 text-center">
          {/* Instagram Gradient Logo */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/20">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Log in with Instagram</h3>
            <p className="text-xs text-slate-400 mt-1">Connect your Instagram account to Kurukshetra</p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300 text-left">
              {error}
            </div>
          )}

          {/* Quick 1-Tap Option */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-200">1-Tap Connect</p>
                <p className="text-[11px] text-slate-400">Sign in as @manoj (Admin)</p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleLogin('manoj', 'Manoj')}
                className="rounded-lg bg-gradient-to-r from-rose-500 to-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 min-h-[38px]"
              >
                Connect
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-bold uppercase text-slate-500">Or use handle</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Instagram username, phone or email"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Instagram password"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs py-2.5 min-h-[44px] transition-all cursor-pointer shadow-lg shadow-rose-500/20 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Log In with Instagram'}
            </button>
          </form>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            By connecting, you agree to Meta / Instagram terms and Kurukshetra&apos;s{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-rose-400 hover:underline font-semibold cursor-pointer"
            >
              Terms & Conditions
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. Official Snapchat Login Dialog (Login Kit)
// -------------------------------------------------------------
export const SnapchatAuthDialog: React.FC<SocialDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenTerms,
}) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (snapUser: string, snapName?: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/snapchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: snapUser,
          displayName: snapName || snapUser,
          device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Snapchat Mobile App',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Snapchat authentication failed');
      onSuccess({
        token: data.token,
        user: data.user,
        message: `Connected Snapchat @${data.user.username}`,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Snapchat connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your Snapchat username');
      return;
    }
    handleLogin(username.trim(), displayName.trim());
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-sm max-h-[92dvh] overflow-y-auto no-scrollbar rounded-2xl border border-yellow-500/30 bg-[#0f1422] text-white shadow-2xl font-sans"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-7 space-y-4 sm:space-y-5 text-center">
          {/* Snapchat Yellow Ghost Logo */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFFC00] text-black shadow-lg shadow-yellow-500/20">
            <svg className="h-9 w-9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.002 2c-3.89 0-6.19 2.766-6.19 5.86 0 1.25.437 2.454.898 3.328.093.176.12.285.043.435-.118.232-.475.568-.962.775-.487.206-.89.155-1.07.126-.144-.023-.277.067-.323.208-.06.185-.045.412.167.575.698.536 1.704.836 2.502.943.14.019.224.116.208.257-.04.356-.16.924-.46 1.256-.22.244-.555.385-1.01.425-.19.017-.325.176-.307.367.037.387.414.712.98.835.63.137 1.237.078 1.637-.024.184-.047.339.066.388.248.167.625.594 1.15 1.503 1.344.412.088.895.074 1.42-.047.34-.078.69-.115 1.04-.115.352 0 .701.037 1.042.115.525.121 1.008.135 1.42.047.909-.194 1.336-.719 1.503-1.344.049-.182.204-.295.388-.248.4.102 1.007.161 1.637.024.566-.123.943-.448.98-.835.018-.191-.117-.35-.307-.367-.455-.04-.79-.181-1.01-.425-.3-.332-.42-.9-.46-1.256-.016-.141.068-.238.208-.257.798-.107 1.804-.407 2.502-.943.212-.163.227-.39.167-.575-.046-.141-.179-.231-.323-.208-.18.029-.583.08-1.07-.126-.487-.207-.844-.543-.962-.775-.077-.15-.05-.259.043-.435.461-.874.898-2.078.898-3.328 0-3.094-2.3-5.86-6.19-5.86z" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Log in with Snapchat</h3>
            <p className="text-xs text-yellow-300/80 font-medium mt-1">Snapchat Login Kit • Fast & Secure</p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300 text-left">
              {error}
            </div>
          )}

          {/* Quick 1-Tap Option */}
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-3 text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-yellow-300">1-Tap Snap Login</p>
                <p className="text-[11px] text-slate-400">Connect as @manoj_snap</p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleLogin('manoj_snap', 'Manoj')}
                className="rounded-lg bg-[#FFFC00] px-3.5 py-2 text-xs font-bold text-black hover:bg-yellow-300 transition-colors cursor-pointer disabled:opacity-50 min-h-[38px]"
              >
                Log In
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-bold uppercase text-slate-500">Or use Snapchat handle</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Snapchat username"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Display Name (optional)"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#FFFC00] hover:bg-yellow-300 text-black font-bold text-xs py-2.5 min-h-[44px] transition-all cursor-pointer shadow-lg shadow-yellow-500/20 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Continue with Snapchat'}
            </button>
          </form>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            By connecting, you agree to Snap Inc. terms and Kurukshetra&apos;s{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-yellow-400 hover:underline font-semibold cursor-pointer"
            >
              Terms of Service
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
