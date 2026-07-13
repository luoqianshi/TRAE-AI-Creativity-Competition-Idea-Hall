import * as TaskManager from 'expo-task-manager';

import { appendTrackingPoint } from './locationStorage';
import { LocationPoint } from '../types';

export const BACKGROUND_LOCATION_TASK = 'peace-home-guardian-background-location';

function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

if (!TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)) {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error || !data) {
      return;
    }

    const payload = data as {
      locations?: Array<{
        timestamp: number;
        coords: {
          latitude: number;
          longitude: number;
        };
      }>;
    };

    const latest = payload.locations?.at(-1);

    if (!latest) {
      return;
    }

    const point: LocationPoint = {
      id: `bg-${latest.timestamp}`,
      label: '后台定位',
      time: formatTime(new Date(latest.timestamp)),
      latitude: latest.coords.latitude,
      longitude: latest.coords.longitude,
      source: 'background',
      status: '应用后台持续记录中',
    };

    await appendTrackingPoint(point);
  });
}
