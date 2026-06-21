// 机器人连接状态
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// 机器人状态
export interface RobotStatus {
  connectionStatus: ConnectionStatus;
  batteryLevel: number;
  temperature: number;
  isMoving: boolean;
  gripperState: 'open' | 'closed' | 'moving';
  lastUpdate: string;
}

// 运动控制参数
export interface MotionControl {
  direction: 'forward' | 'backward' | 'left' | 'right' | 'stop';
  speed: number;
  angle: number;
}

// 夹爪控制参数
export interface GripperControl {
  action: 'open' | 'close';
}

// 机器人配置
export interface RobotConfig {
  name: string;
  ip: string;
  port: number;
  autoConnect: boolean;
}

// API 响应
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}
