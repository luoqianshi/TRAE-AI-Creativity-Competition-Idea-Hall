import { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { robotService } from '@/services/robot';
import type { RobotStatus, ConnectionStatus, MotionControl, GripperControl, RobotConfig } from '@/types/robot';

interface UseRobotReturn {
  status: RobotStatus | null;
  isConnecting: boolean;
  connect: (config?: RobotConfig) => Promise<void>;
  disconnect: () => Promise<void>;
  controlMotion: (control: MotionControl) => Promise<void>;
  controlGripper: (control: GripperControl) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const defaultStatus: RobotStatus = {
  connectionStatus: 'disconnected',
  batteryLevel: 0,
  temperature: 0,
  isMoving: false,
  gripperState: 'open',
  lastUpdate: ''
};

export function useRobot(): UseRobotReturn {
  const [status, setStatus] = useState<RobotStatus>(defaultStatus);
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * 连接机器人
   */
  const connect = useCallback(async (config?: RobotConfig) => {
    setIsConnecting(true);
    
    try {
      if (config) {
        robotService.setConfig(config);
      }
      
      const response = await robotService.connect();
      
      if (response.success && response.data) {
        setStatus(response.data);
        Taro.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 2000
        });
      } else {
        setStatus(prev => ({
          ...prev,
          connectionStatus: 'error' as ConnectionStatus
        }));
        Taro.showToast({
          title: response.message || '连接失败',
          icon: 'error',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('[useRobot] 连接异常:', error);
      setStatus(prev => ({
        ...prev,
        connectionStatus: 'error' as ConnectionStatus
      }));
      Taro.showToast({
        title: '连接异常',
        icon: 'error',
        duration: 2000
      });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * 断开连接
   */
  const disconnect = useCallback(async () => {
    try {
      const response = await robotService.disconnect();
      
      if (response.success) {
        setStatus(defaultStatus);
        Taro.showToast({
          title: '已断开连接',
          icon: 'success',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('[useRobot] 断开连接异常:', error);
    }
  }, []);

  /**
   * 运动控制
   */
  const controlMotion = useCallback(async (control: MotionControl) => {
    try {
      const response = await robotService.controlMotion(control);
      
      if (response.success) {
        setStatus(prev => ({
          ...prev,
          isMoving: control.direction !== 'stop'
        }));
      } else {
        Taro.showToast({
          title: response.message || '控制失败',
          icon: 'error',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('[useRobot] 运动控制异常:', error);
      Taro.showToast({
        title: '控制异常',
        icon: 'error',
        duration: 2000
      });
    }
  }, []);

  /**
   * 夹爪控制
   */
  const controlGripper = useCallback(async (control: GripperControl) => {
    try {
      const response = await robotService.controlGripper(control);
      
      if (response.success) {
        setStatus(prev => ({
          ...prev,
          gripperState: control.action === 'open' ? 'open' : 'closed'
        }));
        Taro.showToast({
          title: response.message || '操作成功',
          icon: 'success',
          duration: 1500
        });
      } else {
        Taro.showToast({
          title: response.message || '控制失败',
          icon: 'error',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('[useRobot] 夹爪控制异常:', error);
      Taro.showToast({
        title: '控制异常',
        icon: 'error',
        duration: 2000
      });
    }
  }, []);

  /**
   * 刷新状态
   */
  const refreshStatus = useCallback(async () => {
    try {
      const response = await robotService.getStatus();
      
      if (response.success && response.data) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('[useRobot] 刷新状态异常:', error);
    }
  }, []);

  return {
    status,
    isConnecting,
    connect,
    disconnect,
    controlMotion,
    controlGripper,
    refreshStatus
  };
}
