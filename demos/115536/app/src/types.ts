export type AppMode = 'elder' | 'guardian';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  priority: number;
};

export type LocationPoint = {
  id: string;
  label: string;
  time: string;
  latitude: number;
  longitude: number;
  address?: string;
  status?: string;
  source?: 'demo' | 'foreground' | 'background';
};

export type SafetyFence = {
  name: string;
  centerLabel: string;
  radiusMeters: number;
  activeWindow: string;
  breachRule: string;
};

export type AlertItem = {
  id: string;
  level: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  time: string;
};

export type VoiceBroadcastRule = {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
};

export type MissingPersonChannel = {
  id: string;
  name: string;
  description: string;
  eta: string;
};

export type ElderProfile = {
  name: string;
  age: number;
  diagnosisStage: string;
  homeAddress: string;
  homeEta: string;
  batteryLevel: string;
  connectivity: string;
  watchStatus: string;
};

export type TrackingSnapshot = {
  lastPoint: LocationPoint | null;
  history: LocationPoint[];
};
