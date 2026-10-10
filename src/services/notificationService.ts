import { soundEngine } from './webAudioService';
import { fetchWithAuth } from './apiClient';

export interface NotificationResult {
  sent: boolean;
  permission: NotificationPermission;
  message: string;
}

class NotificationService {
  private reminderIntervalId: any = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  /**
   * Directly triggers a desktop or mobile browser notification alerting about incomplete dots
   */
  public async sendDirectDotNotification(
    incompleteCount: number,
    options?: { test?: boolean; userId?: string; username?: string }
  ): Promise<NotificationResult> {
    const isTest = options?.test ?? false;

    // Check permission
    let permission = this.getPermission();
    if (permission === 'default') {
      permission = await this.requestPermission();
    }

    const title = isTest
      ? '⚡ Kurukshetra Reminder Test'
      : '⚠️ Kurukshetra: Daily Dot Not Completed!';

    const body = isTest
      ? 'Direct alert active! Kurukshetra will remind you whenever your daily dot task is left incomplete.'
      : `Alert: You still have ${incompleteCount} task dot${incompleteCount > 1 ? 's' : ''} incomplete! Complete your focus session now and turn your dot white.`;

    let systemNotificationSent = false;

    if (this.isSupported() && permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'kurukshetra-dot-alert',
          requireInteraction: true,
          silent: false,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        systemNotificationSent = true;
      } catch (e) {
        console.warn('System notification error, falling back to in-app sound & log', e);
      }
    }

    // Play audible alert sound
    soundEngine.playAlertBeep();

    // Log to permanent database
    const deviceType = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent)
      ? 'Mobile Device'
      : 'Desktop System';

    try {
      await fetchWithAuth('/api/notifications/dot-reminder', {
        method: 'POST',
        body: JSON.stringify({
          userId: options?.userId || 'user-manoj',
          username: options?.username || 'manoj',
          incompleteCount,
          device: deviceType,
        }),
      });
    } catch (e) {
      console.error('Failed to log notification to database', e);
    }

    return {
      sent: true,
      permission,
      message: systemNotificationSent
        ? `Direct alert sent to your ${deviceType}!`
        : `Notification sound & in-app alert played (${permission === 'granted' ? 'Alert fired' : 'Enable browser notifications for lock screen alerts'})`,
    };
  }

  /**
   * Start background check loop for incomplete dots
   */
  public startIncompleteDotWatcher(
    checkIncomplete: () => number,
    userId?: string,
    username?: string
  ) {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
    }

    // Check every 30 minutes if dots are not completed
    this.reminderIntervalId = setInterval(() => {
      const incomplete = checkIncomplete();
      if (incomplete > 0) {
        this.sendDirectDotNotification(incomplete, { userId, username });
      }
    }, 30 * 60 * 1000);
  }

  public stopIncompleteDotWatcher() {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
      this.reminderIntervalId = null;
    }
  }
}

export const notificationService = new NotificationService();
