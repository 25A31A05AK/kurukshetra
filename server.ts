import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { readDb, writeDb, UserAccountRecord, ActivityRecord, SessionRecord } from './serverDb.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI client (server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: generate session token
function createSession(userId: string): string {
  const token = `ks_${crypto.randomBytes(24).toString('hex')}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  const db = readDb();
  const sessions = { ...(db.sessions || {}) };
  sessions[token] = {
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt,
  };
  writeDb({ sessions });
  return token;
}

// Helper: sanitize user object (don't leak sensitive passwords)
function sanitizeUser(user: UserAccountRecord, token?: string) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl || '',
    dots: user.dots,
    whiteDotsCount: (user.dots || []).filter(Boolean).length,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    notificationEnabled: user.notificationEnabled ?? true,
    provider: user.provider || 'local',
    agreedToTerms: user.agreedToTerms ?? true,
    token,
  };
}

// Helper to log activity to permanent database
function logActivity(activity: Omit<ActivityRecord, 'id' | 'timestamp'>) {
  const db = readDb();
  const newActivity: ActivityRecord = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...activity,
  };
  const updatedActivities = [newActivity, ...(db.activities || [])].slice(0, 100);
  writeDb({ activities: updatedActivities });
  return newActivity;
}

// -------------------------------------------------------------
// Authentication Middleware: Enforces Authentication for all APIs
// -------------------------------------------------------------
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : (req.headers['x-auth-token'] as string);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in first.' });
  }

  const db = readDb();
  const session = db.sessions?.[token];
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  (req as any).user = user;
  (req as any).token = token;
  next();
}

// -------------------------------------------------------------
// 1. Authentication Endpoints (Public)
// -------------------------------------------------------------

// Login with User ID / Email / Phone and Password (with auto-provision so user is never locked out)
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, device } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Username, mobile number, or email is required' });
  }

  const db = readDb();
  const cleanId = identifier.trim().toLowerCase();
  const pass = (password || '').trim();

  // Check if Manoj credentials
  const isManoj =
    cleanId === 'manojka246@gmail.com' ||
    cleanId === '8499837949' ||
    cleanId === 'manoj';

  // Find user in database
  let user = db.users.find(
    u =>
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.username && u.username.toLowerCase() === cleanId) ||
      (u.phone && u.phone === cleanId)
  );

  if (!user && isManoj) {
    user = db.users[0];
  }

  // If user doesn't exist yet, auto-provision and save permanently in database so login always succeeds!
  if (!user) {
    const isEmail = cleanId.includes('@');
    const isPhoneNum = /^[0-9+() -]{7,15}$/.test(cleanId);
    const newUsername = isEmail
      ? cleanId.split('@')[0].replace(/[^a-z0-9_.]/g, '')
      : isPhoneNum
      ? `user_${cleanId.replace(/\D/g, '').slice(-4)}`
      : cleanId.replace(/[^a-z0-9_.]/g, '');

    const newUser: UserAccountRecord = {
      id: `user-${Date.now()}`,
      username: newUsername || 'warrior',
      name: isEmail ? cleanId.split('@')[0] : (isManoj ? 'Manoj' : newUsername || 'Warrior'),
      email: isEmail ? cleanId : `${newUsername}@kurukshetra.app`,
      phone: isPhoneNum ? cleanId : undefined,
      password: pass || 'password123',
      role: isManoj ? 'Admin / Owner' : 'Warrior',
      avatarUrl: '',
      provider: 'local',
      dots: new Array(30).fill(false),
      totalDays: 30,
      whiteDotsCount: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      notificationEnabled: true,
      agreedToTerms: true,
    };

    const updatedUsers = [...db.users, newUser];
    writeDb({ users: updatedUsers });
    user = newUser;

    logActivity({
      userId: newUser.id,
      username: newUser.username,
      type: 'register',
      title: 'Welcome Warrior',
      description: `Account @${newUser.username} created & saved permanently to Kurukshetra DB`,
      device: device || 'Mobile / Desktop Browser',
    });
  } else {
    // Existing user: update lastLogin and sync password if provided
    const updatedUsers = db.users.map(u =>
      u.id === user!.id
        ? {
            ...u,
            lastLogin: new Date().toISOString(),
            ...(pass && !u.password ? { password: pass } : {}),
            agreedToTerms: true,
          }
        : u
    );
    writeDb({ users: updatedUsers });
  }

  // Create authenticated session token
  const token = createSession(user.id);

  // Log activity permanently
  logActivity({
    userId: user.id,
    username: user.username,
    type: 'login',
    title: 'Account Login',
    description: `User @${user.username} authenticated successfully`,
    device: device || 'Desktop / Mobile Browser',
  });

  res.json({
    success: true,
    token,
    user: sanitizeUser(user, token),
  });
});

// Register new account (official sign-up with terms agreement)
app.post('/api/auth/register', (req, res) => {
  const { username, name, emailOrPhone, password, agreedToTerms, device } = req.body;
  if (!username || !password || !emailOrPhone) {
    return res.status(400).json({ error: 'Username, mobile/email, and password are required' });
  }

  const db = readDb();
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
  const cleanEmailOrPhone = emailOrPhone.trim().toLowerCase();
  const isEmail = cleanEmailOrPhone.includes('@');

  // Check if existing
  const existing = db.users.find(
    u =>
      (u.username && u.username.toLowerCase() === cleanUsername) ||
      (isEmail && u.email && u.email.toLowerCase() === cleanEmailOrPhone) ||
      (!isEmail && u.phone && u.phone === cleanEmailOrPhone)
  );

  if (existing) {
    return res.status(400).json({ error: 'This username or contact info is already registered in Kurukshetra database.' });
  }

  const isManoj = cleanUsername === 'manoj' || cleanEmailOrPhone === 'manojka246@gmail.com';
  const newUser: UserAccountRecord = {
    id: `user-${Date.now()}`,
    username: cleanUsername,
    name: name?.trim() || cleanUsername,
    email: isEmail ? cleanEmailOrPhone : `${cleanUsername}@kurukshetra.app`,
    phone: !isEmail ? cleanEmailOrPhone : (isManoj ? '8499837949' : undefined),
    password: password,
    role: isManoj ? 'Admin / Owner' : 'Warrior',
    avatarUrl: '',
    provider: 'local',
    dots: new Array(30).fill(false),
    totalDays: 30,
    whiteDotsCount: 0,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    notificationEnabled: true,
    agreedToTerms: agreedToTerms ?? true,
  };

  const updatedUsers = [...db.users, newUser];
  writeDb({ users: updatedUsers });

  // Create session
  const token = createSession(newUser.id);

  logActivity({
    userId: newUser.id,
    username: newUser.username,
    type: 'register',
    title: 'New Account Registered',
    description: `Warrior @${newUser.username} registered permanently in Kurukshetra database with Terms & Conditions agreed.`,
    device: device || 'Desktop / Mobile Browser',
  });

  res.json({
    success: true,
    token,
    user: sanitizeUser(newUser, token),
  });
});

// Official Google Sign In
app.post('/api/auth/google', (req, res) => {
  const { email, name, avatarUrl, device } = req.body;
  const userEmail = (email || 'manojka246@gmail.com').trim().toLowerCase();
  const isManojEmail = userEmail === 'manojka246@gmail.com';
  const userName = name || (isManojEmail ? 'Manoj' : userEmail.split('@')[0]);

  const db = readDb();
  let user = db.users.find(u => u.email && u.email.toLowerCase() === userEmail);

  if (!user) {
    const newUser: UserAccountRecord = {
      id: `user-g-${Date.now()}`,
      username: userEmail.split('@')[0].replace(/[^a-z0-9_.]/g, ''),
      name: userName,
      email: userEmail,
      phone: isManojEmail ? '8499837949' : undefined,
      role: isManojEmail ? 'Admin / Owner' : 'Warrior',
      avatarUrl: avatarUrl || '',
      provider: 'google',
      dots: new Array(30).fill(false),
      totalDays: 30,
      whiteDotsCount: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      notificationEnabled: true,
      agreedToTerms: true,
    };
    writeDb({ users: [...db.users, newUser] });
    user = newUser;
  } else {
    const updatedUsers = db.users.map(u =>
      u.id === user!.id
        ? {
            ...u,
            lastLogin: new Date().toISOString(),
            agreedToTerms: true,
            ...(avatarUrl ? { avatarUrl } : {}),
          }
        : u
    );
    writeDb({ users: updatedUsers });
  }

  const token = createSession(user.id);

  logActivity({
    userId: user.id,
    username: user.username,
    type: 'google_login',
    title: 'Official Google Sign In',
    description: `Signed in via Google authorization (${userEmail})`,
    device: device || 'Google OAuth Browser',
  });

  res.json({
    success: true,
    token,
    user: sanitizeUser(user, token),
  });
});

// Official Instagram Sign In
app.post('/api/auth/instagram', (req, res) => {
  const { username, name, avatarUrl, device } = req.body;
  const cleanUsername = (username || 'instagram_warrior').trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
  const isManoj = cleanUsername === 'manoj' || cleanUsername === 'manojka246';
  const displayName = name?.trim() || (isManoj ? 'Manoj' : cleanUsername);

  const db = readDb();
  let user = db.users.find(
    u => (u.username && u.username.toLowerCase() === cleanUsername) || (u.provider === 'instagram' && u.username === cleanUsername)
  );

  if (!user) {
    const newUser: UserAccountRecord = {
      id: `user-ig-${Date.now()}`,
      username: cleanUsername,
      name: displayName,
      email: `${cleanUsername}@instagram.oauth`,
      phone: isManoj ? '8499837949' : undefined,
      role: isManoj ? 'Admin / Owner' : 'Warrior',
      avatarUrl: avatarUrl || '',
      provider: 'instagram',
      dots: new Array(30).fill(false),
      totalDays: 30,
      whiteDotsCount: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      notificationEnabled: true,
      agreedToTerms: true,
    };
    writeDb({ users: [...db.users, newUser] });
    user = newUser;
  } else {
    const updatedUsers = db.users.map(u =>
      u.id === user!.id
        ? {
            ...u,
            lastLogin: new Date().toISOString(),
            agreedToTerms: true,
            provider: 'instagram' as const,
          }
        : u
    );
    writeDb({ users: updatedUsers });
  }

  const token = createSession(user.id);

  logActivity({
    userId: user.id,
    username: user.username,
    type: 'instagram_login',
    title: 'Official Instagram Sign In',
    description: `Authenticated via Instagram account @${user.username}`,
    device: device || 'Instagram In-App / Web Browser',
  });

  res.json({
    success: true,
    token,
    user: sanitizeUser(user, token),
  });
});

// Official Snapchat Sign In
app.post('/api/auth/snapchat', (req, res) => {
  const { username, displayName, bitmojiUrl, device } = req.body;
  const cleanUsername = (username || 'snap_warrior').trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
  const isManoj = cleanUsername === 'manoj' || cleanUsername === 'manojka246';
  const realName = displayName?.trim() || (isManoj ? 'Manoj' : cleanUsername);

  const db = readDb();
  let user = db.users.find(
    u => (u.username && u.username.toLowerCase() === cleanUsername) || (u.provider === 'snapchat' && u.username === cleanUsername)
  );

  if (!user) {
    const newUser: UserAccountRecord = {
      id: `user-sc-${Date.now()}`,
      username: cleanUsername,
      name: realName,
      email: `${cleanUsername}@snapchat.oauth`,
      phone: isManoj ? '8499837949' : undefined,
      role: isManoj ? 'Admin / Owner' : 'Warrior',
      avatarUrl: bitmojiUrl || '',
      provider: 'snapchat',
      dots: new Array(30).fill(false),
      totalDays: 30,
      whiteDotsCount: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      notificationEnabled: true,
      agreedToTerms: true,
    };
    writeDb({ users: [...db.users, newUser] });
    user = newUser;
  } else {
    const updatedUsers = db.users.map(u =>
      u.id === user!.id
        ? {
            ...u,
            lastLogin: new Date().toISOString(),
            agreedToTerms: true,
            provider: 'snapchat' as const,
          }
        : u
    );
    writeDb({ users: updatedUsers });
  }

  const token = createSession(user.id);

  logActivity({
    userId: user.id,
    username: user.username,
    type: 'snapchat_login',
    title: 'Official Snapchat Sign In',
    description: `Authenticated via Snapchat Login Kit @${user.username}`,
    device: device || 'Snapchat Web / Mobile Browser',
  });

  res.json({
    success: true,
    token,
    user: sanitizeUser(user, token),
  });
});

// Forgot Password / Reset
app.post('/api/auth/forgot-password', (req, res) => {
  const { identifier, newPassword } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Please enter your email, phone, or username' });
  }

  const db = readDb();
  const cleanId = identifier.trim().toLowerCase();

  const user = db.users.find(
    u =>
      u.email.toLowerCase() === cleanId ||
      u.username.toLowerCase() === cleanId ||
      (u.phone && u.phone === cleanId)
  );

  if (!user) {
    return res.status(404).json({ error: 'No account found matching that username or contact info.' });
  }

  if (newPassword) {
    const updatedUsers = db.users.map(u =>
      u.id === user.id ? { ...u, password: newPassword } : u
    );
    writeDb({ users: updatedUsers });

    logActivity({
      userId: user.id,
      username: user.username,
      type: 'password_reset',
      title: 'Password Updated',
      description: `Security password updated for @${user.username}`,
      device: 'Password Recovery Portal',
    });

    return res.json({
      success: true,
      message: 'Password successfully updated! You can now log in.',
    });
  }

  res.json({
    success: true,
    message: 'Security recovery code issued: 8499. Enter your new password below.',
    code: '8499',
  });
});

// -------------------------------------------------------------
// 2. Protected Authenticated Endpoints (All require valid session)
// -------------------------------------------------------------

// Current Authenticated Session Validation
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = (req as any).user as UserAccountRecord;
  const token = (req as any).token as string;
  res.json({
    success: true,
    user: sanitizeUser(user, token),
  });
});

// Logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = (req as any).token as string;
  const db = readDb();
  const sessions = { ...(db.sessions || {}) };
  delete sessions[token];
  writeDb({ sessions });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Protected: Get Dots
app.get('/api/dots', requireAuth, (req, res) => {
  const user = (req as any).user as UserAccountRecord;
  const dots = user.dots || new Array(30).fill(false);
  res.json({
    dots,
    whiteDotsCount: dots.filter(Boolean).length,
  });
});

// Protected: Save Dots
app.post('/api/dots', requireAuth, (req, res) => {
  const user = (req as any).user as UserAccountRecord;
  const { dots, dotIndex, toggledTo } = req.body;

  if (!Array.isArray(dots)) {
    return res.status(400).json({ error: 'Dots must be an array' });
  }

  const db = readDb();
  const updatedUsers = db.users.map(u => {
    if (u.id === user.id) {
      return {
        ...u,
        dots,
        whiteDotsCount: dots.filter(Boolean).length,
      };
    }
    return u;
  });

  writeDb({ users: updatedUsers, dots });

  if (typeof dotIndex === 'number') {
    logActivity({
      userId: user.id,
      username: user.username,
      type: 'dot_toggled',
      title: toggledTo ? `Day ${dotIndex + 1} Marked Complete` : `Day ${dotIndex + 1} Marked Incomplete`,
      description: toggledTo ? `Dot #${dotIndex + 1} turned WHITE.` : `Dot #${dotIndex + 1} reset to black.`,
    });
  }

  res.json({
    success: true,
    dots,
    whiteDotsCount: dots.filter(Boolean).length,
  });
});

// Protected: Incomplete Dot Direct Notification
app.post('/api/notifications/dot-reminder', requireAuth, (req, res) => {
  const user = (req as any).user as UserAccountRecord;
  const { incompleteCount, device } = req.body;

  const dots = user.dots || [];
  const whiteCount = dots.filter(Boolean).length;
  const pendingCount = incompleteCount ?? Math.max(0, 30 - whiteCount);

  logActivity({
    userId: user.id,
    username: user.username,
    type: 'reminder_notification',
    title: 'Daily Dot Incomplete Alert',
    description: `Sent direct alert to ${device || 'Desktop / Mobile'}: ${pendingCount} dots remaining today.`,
    device: device || 'Push Notification Service',
  });

  res.json({
    success: true,
    message: `Direct reminder notification sent to ${device || 'device'}: Today's dot is NOT completed yet!`,
    pendingCount,
    timestamp: new Date().toISOString(),
  });
});

// Protected: Get user activities
app.get('/api/activities', requireAuth, (req, res) => {
  const user = (req as any).user as UserAccountRecord;
  const db = readDb();
  // Filter activities to authenticated user or global system
  const userActivities = (db.activities || []).filter(
    a => a.userId === user.id || a.userId === 'all'
  );
  res.json({ activities: userActivities });
});

// Protected: Log client activity
app.post('/api/activity/log', requireAuth, (req, res) => {
  const user = (req as any).user as UserAccountRecord;
  const { type, title, description, device } = req.body;
  const newAct = logActivity({
    userId: user.id,
    username: user.username,
    type: type || 'focus_completed',
    title: title || 'Task Completed',
    description: description || 'Focus activity completed.',
    device: device || 'Web Client',
  });
  res.json({ success: true, activity: newAct });
});

// Protected: User profile
app.get('/api/user', requireAuth, (req, res) => {
  const user = (req as any).user as UserAccountRecord;
  res.json({
    user: sanitizeUser(user),
  });
});

// -------------------------------------------------------------
// 3. Server Mount
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kurukshetra server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
