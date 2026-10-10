import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Copy, 
  Check, 
  Database,
  Lock,
  RefreshCw,
  AlertCircle,
  UserCheck,
  UserX,
  BellRing,
  Send
} from 'lucide-react';
import { soundEngine } from '../services/webAudioService';
import { UserProfile, TeamMember, FollowRequest } from '../types';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

const MANOJ_EMAIL = 'manojka246@gmail.com';
const MANOJ_PHONE = '8499837949';

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
  const [owner, setOwner] = useState({
    name: 'Manoj',
    email: MANOJ_EMAIL,
    phone: MANOJ_PHONE,
    role: 'Admin / Owner',
  });
  const [loading, setLoading] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'requests' | 'invite' | 'request-follow'>('members');

  // Follow request form for guests / other users
  const [guestName, setGuestName] = useState(currentUser.isLoggedIn ? currentUser.name : '');
  const [guestEmail, setGuestEmail] = useState(currentUser.isLoggedIn ? (currentUser.email || '') : '');
  const [guestPhone, setGuestPhone] = useState(currentUser.phone || '');

  // Verify if current user is Manoj (the sole administrator)
  const isManojAdmin = 
    currentUser.isLoggedIn &&
    (currentUser.email?.toLowerCase().trim() === MANOJ_EMAIL.toLowerCase() ||
     currentUser.phone?.trim() === MANOJ_PHONE ||
     currentUser.name?.toLowerCase().includes('manoj'));

  // Load team data and follow requests from the database
  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        if (data.owner) {
          setOwner({
            ...data.owner,
            email: MANOJ_EMAIL,
            phone: MANOJ_PHONE,
          });
        }
        if (Array.isArray(data.members)) {
          setMembers(data.members);
        }
        if (Array.isArray(data.followRequests)) {
          setFollowRequests(data.followRequests);
        }
      }
    } catch (err) {
      console.error('Failed to load team data from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTeam();
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pendingRequests = followRequests.filter(r => r.status === 'pending');

  // Manoj accepts a follow request
  const handleAcceptFollowRequest = async (requestId: string, reqName: string) => {
    if (!isManojAdmin) {
      setErrorMessage('Permission denied: Only Manoj can accept follow requests.');
      return;
    }

    try {
      setLoading(true);
      soundEngine.playSuccessChime();
      const res = await fetch('/api/follow/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.members)) setMembers(data.members);
        if (Array.isArray(data.followRequests)) setFollowRequests(data.followRequests);
        setSuccessMessage(`Approved and accepted ${reqName}! They are now in your squad.`);
        setErrorMessage('');
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to accept follow request.');
      }
    } catch (err) {
      console.error('Accept request error:', err);
      setErrorMessage('Error communicating with database.');
    } finally {
      setLoading(false);
    }
  };

  // Manoj declines a follow request
  const handleDeclineFollowRequest = async (requestId: string, reqName: string) => {
    if (!isManojAdmin) return;
    try {
      setLoading(true);
      soundEngine.playClick();
      const res = await fetch('/api/follow/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.followRequests)) setFollowRequests(data.followRequests);
        setSuccessMessage(`Declined follow request from ${reqName}.`);
        setErrorMessage('');
      }
    } catch (err) {
      console.error('Decline request error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Someone requests to follow Manoj / join squad
  const handleSendFollowRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) {
      setErrorMessage('Please enter both your name and email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/follow/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestName.trim(),
          email: guestEmail.trim().toLowerCase(),
          phone: guestPhone.trim() || undefined,
        }),
      });

      if (res.ok) {
        soundEngine.playSuccessChime();
        const data = await res.json();
        setSuccessMessage(data.message || 'Follow request sent to Manoj for security approval!');
        setErrorMessage('');
        fetchTeam();
        setActiveTab('members');
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to submit follow request');
      }
    } catch (err) {
      console.error('Send request error:', err);
      setErrorMessage('Error sending request to database');
    } finally {
      setLoading(false);
    }
  };

  // Invite member directly into the database (Manoj only)
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManojAdmin) {
      setErrorMessage('Permission denied: Only Manoj (manojka246@gmail.com) can invite team members.');
      return;
    }

    if (!inviteName.trim() || !inviteEmail.trim()) {
      setErrorMessage('Please provide both friend name and email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim().toLowerCase(),
          phone: invitePhone.trim() || undefined,
        }),
      });

      if (res.ok) {
        soundEngine.playSuccessChime();
        const data = await res.json();
        if (Array.isArray(data.members)) {
          setMembers(data.members);
        }
        setInviteName('');
        setInviteEmail('');
        setInvitePhone('');
        setErrorMessage('');
        setSuccessMessage(`Successfully invited ${inviteName.trim()} to Kurukshetra!`);
        setActiveTab('members');
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to invite team member');
      }
    } catch (err) {
      console.error('Invite error:', err);
      setErrorMessage('Network error while saving invite to database');
    } finally {
      setLoading(false);
    }
  };

  // Remove a member from the database
  const handleRemoveMember = async (id: string, name: string) => {
    if (!isManojAdmin) {
      alert('Only Manoj has administrator permission to remove team members.');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${name} from your team?`)) {
      return;
    }

    soundEngine.playClick();
    try {
      setLoading(true);
      const res = await fetch(`/api/team/member/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.members)) {
          setMembers(data.members);
        } else {
          setMembers(prev => prev.filter(m => m.id !== id));
        }
        setSuccessMessage(`Removed ${name} from the team.`);
      }
    } catch (err) {
      console.error('Remove member error:', err);
      setMembers(prev => prev.filter(m => m.id !== id));
    } finally {
      setLoading(false);
    }
  };

  // Clear all team members (reset to zero)
  const handleClearAllMembers = async () => {
    if (!isManojAdmin) return;
    if (!window.confirm('Delete all team members and reset team to zero?')) return;

    soundEngine.playClick();
    try {
      setLoading(true);
      const res = await fetch('/api/team/clear-all', {
        method: 'DELETE',
      });
      if (res.ok) {
        setMembers([]);
        setSuccessMessage('All team members have been deleted.');
      }
    } catch (err) {
      console.error('Clear all error:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle or inspect a member's daily dot in the database
  const handleToggleMemberDot = async (memberId: string, dotIdx: number) => {
    if (!isManojAdmin) return;
    try {
      const res = await fetch(`/api/team/member/${memberId}/dots`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dotIndex: dotIdx }),
      });
      if (res.ok) {
        soundEngine.playClick();
        const data = await res.json();
        if (data.members) {
          setMembers(data.members);
        }
      }
    } catch (err) {
      console.error('Failed to toggle member dot:', err);
    }
  };

  const handleCopyLink = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(`${window.location.origin}?invite=kurukshetra-manoj`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#070a13] p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Kurukshetra Team
              </h3>
              <p className="text-xs text-slate-400">
                Squad workspace & security gate. Admin restricted to Manoj.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('members');
                }}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'members'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Members ({members.length})
              </button>

              {/* Follow Requests Tab for Manoj */}
              {isManojAdmin && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab('requests');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === 'requests'
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BellRing className="h-3.5 w-3.5 text-amber-400" />
                  <span>Requests</span>
                  {pendingRequests.length > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
              )}

              {/* Invite Member Tab for Manoj */}
              {isManojAdmin ? (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab('invite');
                  }}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === 'invite'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + Invite
                </button>
              ) : (
                /* Request to Follow Button for Other Users */
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab('request-follow');
                  }}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === 'request-follow'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Request to Follow
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sole Administrator Card: Manoj (manojka246@gmail.com | 8499837949) */}
        <div className="my-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/25 via-slate-900/70 to-slate-900/50 p-4 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-lg shadow-md shadow-amber-500/20">
                M
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{owner.name}</h4>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    Sole Administrator
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-0.5 font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Mail className="h-3 w-3 text-cyan-400" />
                    {MANOJ_EMAIL}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Phone className="h-3 w-3 text-amber-400" />
                    {MANOJ_PHONE}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isManojAdmin ? (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded">
                  Admin Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
                  <Lock className="h-3 w-3 text-amber-400" />
                  View Only
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="mb-3 rounded-lg bg-red-950/40 border border-red-500/30 p-2.5 text-xs text-red-300 flex items-center gap-2 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 flex items-center gap-2 shrink-0">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Tab 1: Members List */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center bg-slate-950/40">
                  <Users className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                  <h4 className="text-sm font-semibold text-slate-300">No Team Members Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Clean zero squad. Only Manoj can invite friends or accept incoming follow requests.
                  </p>
                  {isManojAdmin ? (
                    <button
                      onClick={() => setActiveTab('invite')}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Invite Friend Now</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('request-follow')}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Request to Follow Manoj</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-1">
                    <span>
                      {members.length} {members.length === 1 ? 'member' : 'members'} in your squad
                    </span>
                    {isManojAdmin && members.length > 0 && (
                      <button
                        onClick={handleClearAllMembers}
                        className="text-[11px] text-red-400/80 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        Clear All Members
                      </button>
                    )}
                  </div>

                  {members.map(member => {
                    const whiteCount = member.dots ? member.dots.filter(Boolean).length : member.whiteDotsCount || 0;
                    const totalDays = member.totalDays || 30;
                    const completionPct = Math.round((whiteCount / totalDays) * 100);

                    return (
                      <div
                        key={member.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700"
                      >
                        {/* Member Row Header */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-sm">
                              {member.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">{member.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                                <span>{member.email}</span>
                                {member.phone && (
                                  <>
                                    <span>·</span>
                                    <span>{member.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Remove Member Button (Only Manoj can remove) */}
                          {isManojAdmin && (
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              title={`Remove ${member.name} from team`}
                              className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-950/20 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-950/50 hover:border-red-500/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        {/* Member's Daily Dots Matrix */}
                        <div className="rounded-lg bg-black/60 border border-slate-800/80 p-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                            <span className="font-semibold text-slate-300">
                              Daily Dots Matrix
                            </span>
                            <span className="font-mono text-white">
                              {whiteCount} White / {totalDays} Total ({completionPct}%)
                            </span>
                          </div>

                          {/* 30 Dots Grid */}
                          <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 items-center">
                            {(member.dots || new Array(30).fill(false)).slice(0, 30).map((isWhite, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleToggleMemberDot(member.id, idx)}
                                title={`Day ${idx + 1}: ${isWhite ? 'White (Completed)' : 'Black (Pending)'}${isManojAdmin ? ' - Click to toggle' : ''}`}
                                className={`h-3.5 w-3.5 rounded-full transition-all ${
                                  isWhite
                                    ? 'bg-white shadow-xs shadow-white/60 border border-white'
                                    : 'bg-black border border-slate-700 hover:border-slate-500'
                                } ${isManojAdmin ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* Tab 2: Follow Requests (Security Acceptance for Manoj) */}
          {activeTab === 'requests' && isManojAdmin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    Security Follow Requests
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    For security purposes, when someone requests to follow your account, you must accept before they join your squad.
                  </p>
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center bg-slate-950/40">
                  <ShieldCheck className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                  <h4 className="text-sm font-semibold text-slate-300">No Pending Requests</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Your account is secure. Whenever a friend requests to follow your profile, their request will appear here for your approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingRequests.map(req => (
                    <div
                      key={req.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-slate-900/80 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold">
                          {req.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{req.name}</span>
                            <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                              Wants to follow
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            <span>{req.email}</span>
                            {req.phone && <span> · {req.phone}</span>}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Requested {new Date(req.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons: Accept / Decline */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleAcceptFollowRequest(req.id, req.name)}
                          disabled={loading}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Accept & Add</span>
                        </button>
                        <button
                          onClick={() => handleDeclineFollowRequest(req.id, req.name)}
                          disabled={loading}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Direct Invite Friend Form (Manoj Only) */}
          {activeTab === 'invite' && isManojAdmin && (
            <div className="space-y-4">
              <form onSubmit={handleInvite} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-cyan-400" />
                    Invite Friend to Kurukshetra
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add a friend directly to your squad. They start with a fresh 30-day dots matrix.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Friend Name *
                    </label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                      autoFocus
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="friend@gmail.com"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500">
                    Saves directly to persistent database
                  </span>
                  <button
                    type="submit"
                    disabled={loading || !inviteName.trim() || !inviteEmail.trim()}
                    className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{loading ? 'Adding to Database...' : 'Add to Team'}</span>
                  </button>
                </div>
              </form>

              {/* Direct Invite Link */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h4 className="text-xs font-semibold text-slate-300 mb-1">
                  Direct Squad Invite Link
                </h4>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Share this link with friends so they can submit a follow request to your squad.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}?invite=kurukshetra-manoj`}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Request to Follow Form (Non-Manoj users) */}
          {activeTab === 'request-follow' && !isManojAdmin && (
            <div className="space-y-4">
              <form onSubmit={handleSendFollowRequest} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Send className="h-4 w-4 text-cyan-400" />
                    Request to Follow Manoj's Kurukshetra Squad
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    For security purposes, Manoj must accept your request before you can access the squad and daily dots.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Your Email Address *
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Your Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500">
                    Will be sent to Manoj for security approval
                  </span>
                  <button
                    type="submit"
                    disabled={loading || !guestName.trim() || !guestEmail.trim()}
                    className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <Send className="h-4 w-4" />
                    <span>{loading ? 'Submitting Request...' : 'Send Follow Request'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span>Database: Connected</span>
            <button
              onClick={() => {
                soundEngine.playClick();
                fetchTeam();
              }}
              title="Refresh team data from database"
              className="text-slate-400 hover:text-white transition-colors ml-1 p-0.5 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
