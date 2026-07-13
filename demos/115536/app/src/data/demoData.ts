import {
  AlertItem,
  ElderProfile,
  EmergencyContact,
  LocationPoint,
  MissingPersonChannel,
  SafetyFence,
  VoiceBroadcastRule,
} from '../types';

export const elderProfile: ElderProfile = {
  name: '李桂芳',
  age: 71,
  diagnosisStage: '早期认知障碍',
  homeAddress: '静安区康定路 188 弄 6 号 302',
  homeEta: '12 分钟',
  batteryLevel: '78%',
  connectivity: '4G + 北斗增强定位',
  watchStatus: '今日静默定位正常，最后上传 10 秒前',
};

export const emergencyContacts: EmergencyContact[] = [
  {
    id: 'daughter',
    name: '王敏',
    relation: '女儿',
    phone: '138 8888 1001',
    priority: 1,
  },
  {
    id: 'son-in-law',
    name: '周岩',
    relation: '女婿',
    phone: '139 8888 1002',
    priority: 2,
  },
  {
    id: 'community',
    name: '曹护士',
    relation: '社区联络员',
    phone: '137 8888 1003',
    priority: 3,
  },
];

export const fence: SafetyFence = {
  name: '午后活动围栏',
  centerLabel: '康定路家门口',
  radiusMeters: 800,
  activeWindow: '08:00 - 20:00',
  breachRule: '离家超过 800 米且持续 5 分钟即告警',
};

export const liveLocation: LocationPoint = {
  id: 'live',
  label: '当前位置',
  time: '14:36',
  latitude: 31.2317,
  longitude: 121.4456,
  address: '静安寺地铁 1 号口附近',
  status: '轻微偏离回家路径，仍可一键返航',
  source: 'demo',
};

export const homePoint: LocationPoint = {
  id: 'home',
  label: '家',
  time: '常驻',
  latitude: 31.2291,
  longitude: 121.4379,
  address: elderProfile.homeAddress,
  status: '默认导航终点',
  source: 'demo',
};

export const trajectory: LocationPoint[] = [
  {
    id: 't1',
    label: '菜场',
    time: '09:08',
    latitude: 31.2286,
    longitude: 121.4388,
    address: '康定路菜场南门',
    source: 'demo',
  },
  {
    id: 't2',
    label: '公园西门',
    time: '10:16',
    latitude: 31.2298,
    longitude: 121.4411,
    address: '静安雕塑公园西门',
    source: 'demo',
  },
  {
    id: 't3',
    label: '便利店',
    time: '11:42',
    latitude: 31.2309,
    longitude: 121.4435,
    address: '石门一路便利店',
    source: 'demo',
  },
  {
    id: 't4',
    label: '当前位置',
    time: '14:36',
    latitude: liveLocation.latitude,
    longitude: liveLocation.longitude,
    address: liveLocation.address,
    source: 'demo',
  },
];

export const alerts: AlertItem[] = [
  {
    id: 'a1',
    level: 'high',
    title: '围栏越界预警',
    detail: '14:31 离开午后活动围栏，已自动向女儿和社区联络员推送。',
    time: '5 分钟前',
  },
  {
    id: 'a2',
    level: 'medium',
    title: '回家按钮未触发',
    detail: '检测到已偏离常规返家路线，但老人未主动操作，建议子女远程语音引导。',
    time: '9 分钟前',
  },
  {
    id: 'a3',
    level: 'low',
    title: '电量健康',
    detail: '设备电量剩余 78%，预计仍可持续工作 9 小时。',
    time: '刚刚',
  },
];

export const voiceRules: VoiceBroadcastRule[] = [
  {
    id: 'auto-answer',
    title: '来电自动接听',
    subtitle: '白名单联系人来电 6 秒后自动接听，避免老人错过求助电话。',
    enabled: true,
  },
  {
    id: 'arrival-broadcast',
    title: '语音播报提醒',
    subtitle: '自动播报“您已离家较远，请按回家按钮”。',
    enabled: true,
  },
  {
    id: 'call-screening',
    title: '诈骗来电屏蔽',
    subtitle: '陌生来电默认静音并由子女端留痕复核。',
    enabled: true,
  },
];

export const missingPersonChannels: MissingPersonChannel[] = [
  {
    id: 'community-grid',
    name: '社区网格联动',
    description: '同步寻人卡至社区网格员、保安亭和志愿者微信群。',
    eta: '30 秒',
  },
  {
    id: 'city-platform',
    name: '城市寻人平台',
    description: '自动携带最近位置、穿着描述与轨迹摘要生成标准寻人信息。',
    eta: '1 分钟',
  },
  {
    id: 'emergency-dispatch',
    name: '警务协查接口',
    description: '为正式接警前准备规范字段，减少重复沟通时间。',
    eta: '2 分钟',
  },
];

export const spokenMessages = [
  '妈，您现在在静安寺附近，我已经帮您规划回家的路。',
  '如果您不舒服，请长按 SOS 按钮，我们会马上联系您。',
  '陌生来电已被拦截，只有家人电话会自动接通。',
];
