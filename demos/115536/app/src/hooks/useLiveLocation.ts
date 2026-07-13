import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';

import { liveLocation, trajectory } from '../data/demoData';
import { BACKGROUND_LOCATION_TASK } from '../services/backgroundLocationTask';
import { appendTrackingPoint, loadTrackingSnapshot } from '../services/locationStorage';
import { LocationPoint } from '../types';

import '../services/backgroundLocationTask';

function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toPoint(
  location: Pick<Location.LocationObject, 'coords' | 'timestamp'>,
  source: LocationPoint['source']
): LocationPoint {
  return {
    id: `${source}-${location.timestamp}`,
    label: source === 'background' ? '后台定位' : '当前位置',
    time: formatTime(new Date(location.timestamp)),
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    source,
    status:
      source === 'background'
        ? '后台持续守护中'
        : '真机前台实时更新中',
  };
}

export function useLiveLocation() {
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>(
    'unknown'
  );
  const [backgroundStatus, setBackgroundStatus] = useState<
    'unknown' | 'granted' | 'denied'
  >('unknown');
  const [currentPoint, setCurrentPoint] = useState<LocationPoint | null>(null);
  const [history, setHistory] = useState<LocationPoint[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isForegroundTracking, setIsForegroundTracking] = useState(false);
  const [isBackgroundTracking, setIsBackgroundTracking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hydrateStoredSnapshot = useCallback(async () => {
    const snapshot = await loadTrackingSnapshot();

    if (snapshot.lastPoint) {
      setCurrentPoint(snapshot.lastPoint);
    }

    if (snapshot.history.length > 0) {
      setHistory(snapshot.history);
    }
  }, []);

  const refreshStatuses = useCallback(async () => {
    const foregroundPermission = await Location.getForegroundPermissionsAsync();
    const backgroundPermission = await Location.getBackgroundPermissionsAsync();
    const backgroundStarted = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK
    );

    setPermissionStatus(
      foregroundPermission.granted ? 'granted' : foregroundPermission.canAskAgain ? 'unknown' : 'denied'
    );
    setBackgroundStatus(
      backgroundPermission.granted ? 'granted' : backgroundPermission.canAskAgain ? 'unknown' : 'denied'
    );
    setIsBackgroundTracking(backgroundStarted);
  }, []);

  const handlePoint = useCallback(async (point: LocationPoint) => {
    setCurrentPoint(point);
    setHistory((existing) => [...existing, point].slice(-60));
    await appendTrackingPoint(point);
  }, []);

  const startForegroundTracking = useCallback(async () => {
    try {
      setIsStarting(true);
      setErrorMessage(null);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setPermissionStatus('denied');
        setErrorMessage('未授予前台定位权限，无法开启实时守护。');
        return;
      }

      setPermissionStatus('granted');

      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      await handlePoint(toPoint(initial, 'foreground'));

      watcherRef.current?.remove();
      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (update) => {
          void handlePoint(toPoint(update, 'foreground'));
        }
      );

      setIsForegroundTracking(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '开启前台定位时发生未知错误。'
      );
    } finally {
      setIsStarting(false);
    }
  }, [handlePoint]);

  const requestBackgroundTracking = useCallback(async () => {
    try {
      setErrorMessage(null);

      const foregroundPermission = await Location.getForegroundPermissionsAsync();

      if (!foregroundPermission.granted) {
        await startForegroundTracking();
      }

      const backgroundPermission = await Location.requestBackgroundPermissionsAsync();

      if (!backgroundPermission.granted) {
        setBackgroundStatus('denied');
        setErrorMessage(
          '未授予后台定位权限。Android 11+ 会跳转系统设置，Expo Go 也不支持完整后台守护。'
        );
        return;
      }

      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 25,
        timeInterval: 15000,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: '安心回家正在守护',
          notificationBody: '后台持续记录位置，异常时可协助快速寻回。',
        },
      });

      setBackgroundStatus('granted');
      setIsBackgroundTracking(true);
      await hydrateStoredSnapshot();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '开启后台定位失败，请使用 Development Build 真机测试。'
      );
    }
  }, [hydrateStoredSnapshot, startForegroundTracking]);

  const stopTracking = useCallback(async () => {
    watcherRef.current?.remove();
    watcherRef.current = null;
    setIsForegroundTracking(false);

    const backgroundStarted = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK
    );

    if (backgroundStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }

    setIsBackgroundTracking(false);
  }, []);

  useEffect(() => {
    void hydrateStoredSnapshot();
    void refreshStatuses();

    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          void hydrateStoredSnapshot();
          void refreshStatuses();
        }
      }
    );

    return () => {
      appStateSubscription.remove();
      watcherRef.current?.remove();
    };
  }, [hydrateStoredSnapshot, refreshStatuses]);

  const fallbackPoint = currentPoint ?? liveLocation;
  const routeHistory = useMemo(
    () => (history.length > 1 ? history : trajectory),
    [history]
  );

  return {
    permissionStatus,
    backgroundStatus,
    currentPoint: fallbackPoint,
    rawCurrentPoint: currentPoint,
    history: routeHistory,
    isStarting,
    isForegroundTracking,
    isBackgroundTracking,
    errorMessage,
    startForegroundTracking,
    requestBackgroundTracking,
    stopTracking,
    refreshStatuses,
  };
}
