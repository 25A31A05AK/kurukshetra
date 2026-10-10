import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DB_DIR, 'kurukshetra_db.json');

export interface UserAccountRecord {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
  avatarUrl?: string;
  provider: 'local' | 'google' | 'instagram' | 'snapchat';
  dots: boolean[];
  totalDays: number;
  whiteDotsCount: number;
  createdAt: string;
  lastLogin: string;
  notificationEnabled: boolean;
  agreedToTerms?: boolean;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface ActivityRecord {
  id: string;
  userId: string;
  username: string;
  type: 'login' | 'google_login' | 'instagram_login' | 'snapchat_login' | 'register' | 'focus_completed' | 'dot_toggled' | 'reminder_notification' | 'password_reset';
  title: string;
  description: string;
  timestamp: string;
  device?: string;
}

export interface TeamMemberRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  status: 'active' | 'focusing' | 'idle';
  totalDays: number;
  whiteDotsCount: number;
  dots: boolean[];
  invitedAt: string;
}

export interface FollowRequestRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface DatabaseSchema {
  owner: {
    id: string;
    username: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    joinedDate: string;
  };
  users: UserAccountRecord[];
  sessions: Record<string, SessionRecord>;
  activities: ActivityRecord[];
  teamMembers: TeamMemberRecord[];
  followRequests: FollowRequestRecord[];
  dots: boolean[];
  lastUpdated: string;
}

const DEFAULT_MANOJ_USER: UserAccountRecord = {
  id: 'user-manoj',
  username: 'manoj',
  name: 'Manoj',
  email: 'manojka246@gmail.com',
  phone: '8499837949',
  password: 'password123',
  role: 'Admin / Owner',
  avatarUrl: '',
  provider: 'local',
  dots: new Array(30).fill(false),
  totalDays: 30,
  whiteDotsCount: 0,
  createdAt: '2026-10-10T00:00:00.000Z',
  lastLogin: new Date().toISOString(),
  notificationEnabled: true,
};

const DEFAULT_DB: DatabaseSchema = {
  owner: {
    id: 'owner-manoj',
    username: 'manoj',
    name: 'Manoj',
    email: 'manojka246@gmail.com',
    phone: '8499837949',
    role: 'Admin / Owner',
    joinedDate: 'October 2026',
  },
  users: [DEFAULT_MANOJ_USER],
  sessions: {},
  activities: [
    {
      id: 'act-init-1',
      userId: 'user-manoj',
      username: 'manoj',
      type: 'login',
      title: 'Database Initialized',
      description: 'Kurukshetra secure online database ready for Manoj and users.',
      timestamp: new Date().toISOString(),
      device: 'Desktop / Mobile System',
    },
  ],
  teamMembers: [],
  followRequests: [],
  dots: new Array(30).fill(false),
  lastUpdated: new Date().toISOString(),
};

function ensureDbFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);

    // Ensure owner is always Manoj
    parsed.owner = {
      ...DEFAULT_DB.owner,
      ...parsed.owner,
      email: 'manojka246@gmail.com',
      phone: '8499837949',
    };

    // Ensure users array exists
    if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = [DEFAULT_MANOJ_USER];
    } else {
      // Ensure Manoj exists in users array
      const manojIdx = parsed.users.findIndex(
        (u: UserAccountRecord) => u.email.toLowerCase() === 'manojka246@gmail.com' || u.phone === '8499837949'
      );
      if (manojIdx === -1) {
        parsed.users.unshift(DEFAULT_MANOJ_USER);
      } else {
        parsed.users[manojIdx] = {
          ...DEFAULT_MANOJ_USER,
          ...parsed.users[manojIdx],
          email: 'manojka246@gmail.com',
          phone: '8499837949',
        };
      }
    }

    // Ensure sessions map exists
    if (!parsed.sessions || typeof parsed.sessions !== 'object') {
      parsed.sessions = {};
    }

    // Ensure activities array exists
    if (!Array.isArray(parsed.activities)) {
      parsed.activities = DEFAULT_DB.activities;
    }

    if (!Array.isArray(parsed.followRequests)) {
      parsed.followRequests = [];
    }
    if (!Array.isArray(parsed.teamMembers)) {
      parsed.teamMembers = [];
    }
    if (!Array.isArray(parsed.dots)) {
      parsed.dots = new Array(30).fill(false);
    }

    return parsed;
  } catch (err) {
    console.error('Database read error, using fallback:', err);
    return DEFAULT_DB;
  }
}

export function readDb(): DatabaseSchema {
  return ensureDbFile();
}

export function writeDb(data: Partial<DatabaseSchema>): DatabaseSchema {
  const current = readDb();
  const updated: DatabaseSchema = {
    ...current,
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database write error:', err);
  }
  return updated;
}
