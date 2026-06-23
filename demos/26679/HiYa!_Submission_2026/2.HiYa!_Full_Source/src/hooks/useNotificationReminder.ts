import { useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Capacitor } from '@capacitor/core';

const NOTIFICATION_SCHEDULED_KEY = 'haiya_notification_scheduled';

export const useNotificationReminder = () => {
  const { getEntryByDate } = useApp();

  const scheduleNativeNotification = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('[Notification] Not native platform, skipping.');
      return;
    }

    // Only schedule once
    if (localStorage.getItem(NOTIFICATION_SCHEDULED_KEY) === 'true') return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      const permResult = await LocalNotifications.requestPermissions();
      if (permResult.display !== 'granted') {
        console.warn('[Notification] Permission denied.');
        return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: '嗨呀！',
            body: '昨天嗨呀！了没？来记录让你开心的事！',
            id: 1010,
            schedule: {
              on: { hour: 10, minute: 10 },
              allowWhileIdle: true,
            },
          },
        ],
      });

      localStorage.setItem(NOTIFICATION_SCHEDULED_KEY, 'true');
      console.log('[Notification] Daily 10:10 notification scheduled.');
    } catch (err) {
      console.warn('[Notification] Failed to schedule:', err);
    }
  }, []);

  useEffect(() => {
    scheduleNativeNotification();
  }, [scheduleNativeNotification]);

  return {
    scheduleNativeNotification,
  };
};
