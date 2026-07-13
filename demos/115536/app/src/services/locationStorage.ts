import AsyncStorage from '@react-native-async-storage/async-storage';

import { LocationPoint, TrackingSnapshot } from '../types';

const LAST_POINT_KEY = 'tracking:lastPoint';
const HISTORY_KEY = 'tracking:history';
const MAX_HISTORY_POINTS = 60;

function trimHistory(history: LocationPoint[]) {
  return history.slice(-MAX_HISTORY_POINTS);
}

export async function appendTrackingPoint(point: LocationPoint) {
  const snapshot = await loadTrackingSnapshot();
  const nextHistory = trimHistory([...snapshot.history, point]);

  await AsyncStorage.setItem(LAST_POINT_KEY, JSON.stringify(point));
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
}

export async function loadTrackingSnapshot(): Promise<TrackingSnapshot> {
  const [lastPointValue, historyValue] = await Promise.all([
    AsyncStorage.getItem(LAST_POINT_KEY),
    AsyncStorage.getItem(HISTORY_KEY),
  ]);

  const lastPoint = lastPointValue
    ? (JSON.parse(lastPointValue) as LocationPoint)
    : null;
  const history = historyValue
    ? (JSON.parse(historyValue) as LocationPoint[])
    : [];

  return {
    lastPoint,
    history,
  };
}
