import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Circle, Marker, Polyline, Region } from 'react-native-maps';

import {
  alerts,
  elderProfile,
  emergencyContacts,
  fence,
  homePoint as defaultHomePoint,
  missingPersonChannels,
  spokenMessages,
  voiceRules,
} from '../data/demoData';
import { useLiveLocation } from '../hooks/useLiveLocation';
import { AlertItem, AppMode, LocationPoint } from '../types';

const levelColors = {
  high: '#F87171',
  medium: '#FBBF24',
  low: '#4ADE80',
} as const;

const fencePresets = [300, 800, 1200];

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.modeButton, active && styles.modeButtonActive]}
    >
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.actionButton,
        tone === 'secondary' && styles.actionButtonSecondary,
        tone === 'danger' && styles.actionButtonDanger,
      ]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

function StatusPill({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <View style={[styles.statusPill, active && styles.statusPillActive]}>
      <Text style={styles.statusPillText}>{label}</Text>
    </View>
  );
}

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${Math.round(meters)} m`;
}

function getDistanceMeters(start: LocationPoint, end: LocationPoint) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const latDelta = toRadians(end.latitude - start.latitude);
  const lonDelta = toRadians(end.longitude - start.longitude);
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(toRadians(start.latitude)) *
      Math.cos(toRadians(end.latitude)) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildRegion(center: LocationPoint): Region {
  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };
}

async function openWalkingNavigation(destination: LocationPoint) {
  const url = `https://uri.amap.com/navigation?to=${destination.longitude},${destination.latitude},家&mode=walk&src=peace-home-guardian`;
  await Linking.openURL(url);
}

async function dialEmergencyContact(phone: string) {
  await Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
}

function LiveMap({
  homeLocation,
  currentPoint,
  history,
  replayPoint,
  fenceRadius,
}: {
  homeLocation: LocationPoint;
  currentPoint: LocationPoint;
  history: LocationPoint[];
  replayPoint: LocationPoint;
  fenceRadius: number;
}) {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    const coordinates = [homeLocation, currentPoint, ...history, replayPoint].map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));

    if (!mapRef.current) {
      return;
    }

    if (coordinates.length > 1) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 48,
          right: 48,
          bottom: 48,
          left: 48,
        },
        animated: true,
      });
      return;
    }

    mapRef.current.animateToRegion(buildRegion(currentPoint), 300);
  }, [currentPoint, fenceRadius, history, homeLocation, replayPoint]);

  return (
    <View style={styles.mapCard}>
      <MapView
        ref={(instance) => {
          mapRef.current = instance;
        }}
        style={styles.mapCanvas}
        initialRegion={buildRegion(currentPoint)}
        showsUserLocation
        showsMyLocationButton
      >
        <Circle
          center={{
            latitude: homeLocation.latitude,
            longitude: homeLocation.longitude,
          }}
          radius={fenceRadius}
          fillColor="rgba(59, 130, 246, 0.14)"
          strokeColor="#60A5FA"
          strokeWidth={2}
        />
        <Polyline
          coordinates={history.map((point) => ({
            latitude: point.latitude,
            longitude: point.longitude,
          }))}
          strokeColor="#22C55E"
          strokeWidth={4}
        />
        <Marker
          coordinate={{
            latitude: homeLocation.latitude,
            longitude: homeLocation.longitude,
          }}
          title="家"
          description={homeLocation.address}
          pinColor="#2563EB"
        />
        <Marker
          coordinate={{
            latitude: currentPoint.latitude,
            longitude: currentPoint.longitude,
          }}
          title="实时位置"
          description={currentPoint.status}
          pinColor="#10B981"
        />
        <Marker
          coordinate={{
            latitude: replayPoint.latitude,
            longitude: replayPoint.longitude,
          }}
          title={`轨迹回放 · ${replayPoint.time}`}
          description={replayPoint.address}
          pinColor="#F8FAFC"
        />
      </MapView>
      <View style={styles.mapLegend}>
        <Text style={styles.mapLegendText}>
          蓝色为家与围栏，绿色为实时位置，折线为采集到的轨迹。
        </Text>
      </View>
    </View>
  );
}

export function GuardianPrototype() {
  const [mode, setMode] = useState<AppMode>('elder');
  const [sosTriggered, setSosTriggered] = useState(false);
  const [homeTriggered, setHomeTriggered] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [homeLocation, setHomeLocation] = useState<LocationPoint>(defaultHomePoint);
  const [fenceRadius, setFenceRadius] = useState(fence.radiusMeters);

  const {
    permissionStatus,
    backgroundStatus,
    currentPoint,
    rawCurrentPoint,
    history,
    isStarting,
    isForegroundTracking,
    isBackgroundTracking,
    errorMessage,
    startForegroundTracking,
    requestBackgroundTracking,
    stopTracking,
  } = useLiveLocation();

  useEffect(() => {
    if (trackIndex > history.length - 1) {
      setTrackIndex(Math.max(history.length - 1, 0));
    }
  }, [history.length, trackIndex]);

  const replayPoint = history[trackIndex] ?? currentPoint;
  const distanceToHome = getDistanceMeters(homeLocation, currentPoint);
  const insideFence = distanceToHome <= fenceRadius;

  const liveAlerts = useMemo<AlertItem[]>(
    () => [
      {
        id: 'live-fence',
        level: insideFence ? 'low' : 'high',
        title: insideFence ? '围栏内活动正常' : '围栏越界预警',
        detail: insideFence
          ? `距安全区中心 ${formatDistance(distanceToHome)}，仍在围栏内。`
          : `已离开围栏 ${formatDistance(distanceToHome - fenceRadius)}，建议立即远程引导或发起寻人协查。`,
        time: currentPoint.time,
      },
      ...alerts.slice(1),
    ],
    [currentPoint.time, distanceToHome, fenceRadius, insideFence]
  );

  const seekCard = useMemo(
    () => ({
      title: `${elderProfile.name} 紧急寻人卡`,
      summary: `最后定位 ${currentPoint.time}，坐标 ${formatCoordinate(
        currentPoint.latitude
      )}, ${formatCoordinate(currentPoint.longitude)}。如已失联，请优先排查附近地铁口、公交站和商超出口。`,
    }),
    [currentPoint]
  );

  const handleReplayStep = (direction: 'prev' | 'next') => {
    setTrackIndex((current) => {
      if (direction === 'prev') {
        return current === 0 ? history.length - 1 : current - 1;
      }

      return current === history.length - 1 ? 0 : current + 1;
    });
  };

  const handleHomeNavigation = async () => {
    await openWalkingNavigation(homeLocation);
    setHomeTriggered(true);
  };

  const handleSos = async () => {
    await dialEmergencyContact(emergencyContacts[0].phone);
    setSosTriggered(true);
  };

  const elderView = (
    <>
      <SectionCard
        title="老人零操作模式"
        subtitle="保留唯一主动作，其他能力由定位守护和家属端接管。"
      >
        <View style={styles.elderHero}>
          <Text style={styles.heroName}>
            {elderProfile.name} · {elderProfile.age} 岁
          </Text>
          <Text style={styles.heroSubtext}>
            当前家庭位置: {homeLocation.address ?? '已由子女端设定'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void handleHomeNavigation();
            }}
            style={[styles.homeButton, homeTriggered && styles.homeButtonActive]}
          >
            <Text style={styles.homeButtonLabel}>回家</Text>
            <Text style={styles.homeButtonHint}>一键调起高德步行导航回家</Text>
          </Pressable>
          <Text style={styles.stateText}>
            {homeTriggered
              ? '已拉起外部导航，请跟随语音返回家中。'
              : '未操作时仍可由子女端实时查看位置并接收越界告警。'}
          </Text>
        </View>
      </SectionCard>

      <SectionCard title="定位守护状态" subtitle="真机测试前，请先授予定位权限。">
        <View style={styles.statusRow}>
          <StatusPill label={`前台定位: ${permissionStatus}`} active={permissionStatus === 'granted'} />
          <StatusPill
            label={`后台守护: ${isBackgroundTracking ? '运行中' : backgroundStatus}`}
            active={isBackgroundTracking}
          />
        </View>
        <View style={styles.actionRow}>
          <ActionButton
            label={isStarting ? '正在开启...' : '启用定位守护'}
            onPress={() => {
              void startForegroundTracking();
            }}
          />
          <ActionButton
            label="开启后台守护"
            tone="secondary"
            onPress={() => {
              void requestBackgroundTracking();
            }}
          />
        </View>
        <Text style={styles.helperText}>
          当前实时坐标: {formatCoordinate(currentPoint.latitude)}, {formatCoordinate(currentPoint.longitude)}
        </Text>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </SectionCard>

      <SectionCard title="SOS 紧急求助" subtitle="长按直接拨打紧急联系人。">
        <Pressable
          accessibilityRole="button"
          delayLongPress={700}
          onLongPress={() => {
            void handleSos();
          }}
          style={[styles.sosButton, sosTriggered && styles.sosButtonActive]}
        >
          <Text style={styles.sosButtonLabel}>长按 SOS</Text>
          <Text style={styles.sosButtonHint}>
            直接拨打 {emergencyContacts[0].name} {emergencyContacts[0].phone}
          </Text>
        </Pressable>
        <Text style={styles.helperText}>
          {sosTriggered
            ? '已尝试拨出电话，子女端可根据地图和轨迹快速协助。'
            : '真机测试时会拉起系统拨号界面。'}
        </Text>
      </SectionCard>

      <SectionCard
        title="自动接听与语音播报"
        subtitle="当前版本保留规则展示，后续需接 Android 原生能力。"
      >
        {voiceRules.map((rule) => (
          <View key={rule.id} style={styles.ruleRow}>
            <View style={styles.ruleTextWrap}>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
              <Text style={styles.ruleSubtitle}>{rule.subtitle}</Text>
            </View>
            <View style={[styles.ruleBadge, rule.enabled && styles.ruleBadgeOn]}>
              <Text style={styles.ruleBadgeText}>{rule.enabled ? '开启' : '关闭'}</Text>
            </View>
          </View>
        ))}
        <View style={styles.voiceSamples}>
          {spokenMessages.map((message) => (
            <Text key={message} style={styles.voiceSampleText}>
              "{message}"
            </Text>
          ))}
        </View>
      </SectionCard>
    </>
  );

  const guardianView = (
    <>
      <SectionCard title="定位与地图总览" subtitle="已接入 Expo Location 和原生地图组件。">
        <View style={styles.metricRow}>
          <Metric label="电量" value={elderProfile.batteryLevel} />
          <Metric label="前台定位" value={isForegroundTracking ? '运行中' : permissionStatus} />
          <Metric label="后台守护" value={isBackgroundTracking ? '运行中' : backgroundStatus} />
        </View>
        <View style={styles.statusRow}>
          <StatusPill label={`围栏状态: ${insideFence ? '安全' : '越界'}`} active={insideFence} />
          <StatusPill label={`距家: ${formatDistance(distanceToHome)}`} active={insideFence} />
        </View>
        <LiveMap
          homeLocation={homeLocation}
          currentPoint={currentPoint}
          history={history}
          replayPoint={replayPoint}
          fenceRadius={fenceRadius}
        />
        <View style={styles.locationBlock}>
          <Text style={styles.locationTitle}>当前位置</Text>
          <Text style={styles.locationAddress}>
            {formatCoordinate(currentPoint.latitude)}, {formatCoordinate(currentPoint.longitude)}
          </Text>
          <Text style={styles.locationMeta}>
            更新时间 {currentPoint.time} · {currentPoint.status ?? '定位已采集'}
          </Text>
        </View>
      </SectionCard>

      <SectionCard title="守护控制" subtitle="先启用前台定位，再申请后台守护。">
        <View style={styles.actionGrid}>
          <ActionButton
            label={isStarting ? '正在开启...' : '开启前台定位'}
            onPress={() => {
              void startForegroundTracking();
            }}
          />
          <ActionButton
            label="开启后台守护"
            tone="secondary"
            onPress={() => {
              void requestBackgroundTracking();
            }}
          />
          <ActionButton
            label="将当前位置设为家"
            tone="secondary"
            onPress={() => {
              if (rawCurrentPoint) {
                setHomeLocation({
                  ...rawCurrentPoint,
                  id: 'home-custom',
                  label: '家',
                  address: '已按真机当前位置设为家',
                  status: '子女端最新设定',
                });
              }
            }}
          />
          <ActionButton
            label="停止守护"
            tone="danger"
            onPress={() => {
              void stopTracking();
            }}
          />
        </View>
        <Text style={styles.helperText}>
          Android 后台守护需 Development Build；iOS 后台定位也不支持在 Expo Go 完整验证。
        </Text>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </SectionCard>

      <SectionCard title="安全围栏" subtitle="可在真机当前点周围快速验证围栏告警。">
        <View style={styles.fenceRow}>
          <Text style={styles.fenceLabel}>围栏名称</Text>
          <Text style={styles.fenceValue}>{fence.name}</Text>
        </View>
        <View style={styles.fenceRow}>
          <Text style={styles.fenceLabel}>中心点</Text>
          <Text style={styles.fenceValue}>{homeLocation.address ?? '自定义家庭位置'}</Text>
        </View>
        <View style={styles.fencePresetRow}>
          {fencePresets.map((radius) => (
            <Pressable
              key={radius}
              onPress={() => setFenceRadius(radius)}
              style={[
                styles.presetButton,
                fenceRadius === radius && styles.presetButtonActive,
              ]}
            >
              <Text style={styles.presetButtonText}>{radius}m</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.helperText}>
          {fence.activeWindow} 生效，{fence.breachRule}
        </Text>
      </SectionCard>

      <SectionCard title="告警中心" subtitle="基于真实位置与围栏距离自动更新。">
        {liveAlerts.map((alert) => (
          <View key={alert.id} style={styles.alertRow}>
            <View
              style={[
                styles.alertDot,
                { backgroundColor: levelColors[alert.level] },
              ]}
            />
            <View style={styles.alertTextWrap}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertSubtitle}>{alert.detail}</Text>
            </View>
            <Text style={styles.alertTime}>{alert.time}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="轨迹回放" subtitle="回看最近采集到的位置轨迹。">
        <View style={styles.replayHeader}>
          <Text style={styles.replayCurrent}>
            当前回放: {replayPoint.time} · {replayPoint.label}
          </Text>
          <View style={styles.replayActions}>
            <Pressable onPress={() => handleReplayStep('prev')} style={styles.smallAction}>
              <Text style={styles.smallActionText}>上一步</Text>
            </Pressable>
            <Pressable onPress={() => handleReplayStep('next')} style={styles.smallAction}>
              <Text style={styles.smallActionText}>下一步</Text>
            </Pressable>
          </View>
        </View>
        {history.map((point, index) => (
          <View
            key={point.id}
            style={[
              styles.timelineRow,
              index === trackIndex && styles.timelineRowActive,
            ]}
          >
            <Text style={styles.timelineTime}>{point.time}</Text>
            <View style={styles.timelineBody}>
              <Text style={styles.timelineTitle}>{point.label}</Text>
              <Text style={styles.timelineSubtitle}>
                {formatCoordinate(point.latitude)}, {formatCoordinate(point.longitude)}
              </Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="寻人联动" subtitle="寻人卡会带上最近一次真实定位。">
        <View style={styles.seekCard}>
          <Text style={styles.seekCardTitle}>{seekCard.title}</Text>
          <Text style={styles.seekCardText}>{seekCard.summary}</Text>
          <Text style={styles.seekCardTag}>最近定位: {currentPoint.time}</Text>
        </View>
        {missingPersonChannels.map((channel) => (
          <View key={channel.id} style={styles.channelRow}>
            <View style={styles.channelTextWrap}>
              <Text style={styles.channelTitle}>{channel.name}</Text>
              <Text style={styles.channelSubtitle}>{channel.description}</Text>
            </View>
            <Text style={styles.channelEta}>{channel.eta}</Text>
          </View>
        ))}
      </SectionCard>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>真机测试版</Text>
          <Text style={styles.title}>老人零操作，子女全掌控</Text>
          <Text style={styles.subtitle}>
            已接入 Expo Location 与原生地图，可在真机上测试实时定位、围栏和轨迹能力。
          </Text>
        </View>

        <View style={styles.modeSwitcher}>
          <ModeButton
            label="老人端"
            active={mode === 'elder'}
            onPress={() => setMode('elder')}
          />
          <ModeButton
            label="子女端"
            active={mode === 'guardian'}
            onPress={() => setMode('guardian')}
          />
        </View>

        {mode === 'elder' ? elderView : guardianView}

        <SectionCard title="真机测试提醒" subtitle="背景定位需开发版才能完整验证。">
          <Text style={styles.deliveryText}>1. 前台定位和实时地图可直接在真机中测试。</Text>
          <Text style={styles.deliveryText}>2. Android 后台守护与前台服务通知需使用 Development Build。</Text>
          <Text style={styles.deliveryText}>3. iOS 后台定位同样需要开发构建，不支持在 Expo Go 完整验证。</Text>
          <Text style={styles.deliveryText}>4. 自动接听和语音播报仍需后续接原生能力。</Text>
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
  },
  subtitle: {
    color: '#B8C4D9',
    fontSize: 15,
    lineHeight: 22,
  },
  modeSwitcher: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: '#101B2D',
    borderRadius: 18,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  modeButtonActive: {
    backgroundColor: '#2563EB',
  },
  modeButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#101B2D',
    borderRadius: 24,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: '#1E2B43',
  },
  cardHeader: {
    gap: 4,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#8FA2BF',
    fontSize: 13,
    lineHeight: 19,
  },
  elderHero: {
    alignItems: 'center',
    gap: 12,
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  heroSubtext: {
    color: '#9FB1CC',
    fontSize: 14,
    textAlign: 'center',
  },
  homeButton: {
    width: '100%',
    minHeight: 250,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 6,
  },
  homeButtonActive: {
    backgroundColor: '#1D4ED8',
  },
  homeButtonLabel: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 64,
  },
  homeButtonHint: {
    color: '#DBEAFE',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  stateText: {
    color: '#C9D5E7',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  sosButton: {
    minHeight: 110,
    borderRadius: 24,
    backgroundColor: '#7F1D1D',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  sosButtonActive: {
    backgroundColor: '#B91C1C',
  },
  sosButtonLabel: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },
  sosButtonHint: {
    color: '#FECACA',
    fontSize: 14,
    textAlign: 'center',
  },
  helperText: {
    color: '#9FB1CC',
    fontSize: 14,
    lineHeight: 20,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ruleTextWrap: {
    flex: 1,
    gap: 4,
  },
  ruleTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ruleSubtitle: {
    color: '#8FA2BF',
    fontSize: 13,
    lineHeight: 18,
  },
  ruleBadge: {
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  ruleBadgeOn: {
    backgroundColor: '#065F46',
  },
  ruleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  voiceSamples: {
    gap: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#0B1525',
  },
  voiceSampleText: {
    color: '#D8E3F2',
    fontSize: 14,
    lineHeight: 20,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#0B1525',
    gap: 4,
  },
  metricLabel: {
    color: '#8FA2BF',
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  mapCard: {
    gap: 10,
  },
  mapCanvas: {
    height: 260,
    borderRadius: 24,
    overflow: 'hidden',
  },
  mapLegend: {
    paddingHorizontal: 4,
  },
  mapLegendText: {
    color: '#8FA2BF',
    fontSize: 12,
  },
  locationBlock: {
    gap: 4,
  },
  locationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  locationAddress: {
    color: '#DDE7F5',
    fontSize: 15,
    lineHeight: 21,
  },
  locationMeta: {
    color: '#8FA2BF',
    fontSize: 13,
    lineHeight: 18,
  },
  fenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fenceLabel: {
    color: '#8FA2BF',
    fontSize: 14,
  },
  fenceValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 5,
  },
  alertTextWrap: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  alertSubtitle: {
    color: '#A8BAD3',
    fontSize: 13,
    lineHeight: 18,
  },
  alertTime: {
    color: '#8FA2BF',
    fontSize: 12,
  },
  replayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  replayCurrent: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  replayActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1D4ED8',
  },
  smallActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#0B1525',
  },
  timelineRowActive: {
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  timelineTime: {
    width: 52,
    color: '#93A4BF',
    fontSize: 13,
    fontWeight: '700',
  },
  timelineBody: {
    flex: 1,
    gap: 4,
  },
  timelineTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  timelineSubtitle: {
    color: '#A8BAD3',
    fontSize: 13,
    lineHeight: 18,
  },
  seekCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#172554',
    gap: 8,
  },
  seekCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  seekCardText: {
    color: '#DBEAFE',
    fontSize: 14,
    lineHeight: 20,
  },
  seekCardTag: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  channelTextWrap: {
    flex: 1,
    gap: 4,
  },
  channelTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  channelSubtitle: {
    color: '#9FB1CC',
    fontSize: 13,
    lineHeight: 18,
  },
  channelEta: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '800',
  },
  deliveryText: {
    color: '#C9D5E7',
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionGrid: {
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#2563EB',
  },
  actionButtonSecondary: {
    backgroundColor: '#1E40AF',
  },
  actionButtonDanger: {
    backgroundColor: '#991B1B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#334155',
  },
  statusPillActive: {
    backgroundColor: '#065F46',
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
  fencePresetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  presetButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#0B1525',
    borderWidth: 1,
    borderColor: '#1E2B43',
  },
  presetButtonActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#60A5FA',
  },
  presetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
