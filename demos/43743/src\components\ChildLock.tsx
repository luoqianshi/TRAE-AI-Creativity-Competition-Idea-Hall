'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ChildLock — 离开家长后台前的确认
 * 暂保留此组件以备家长退出时使用
 */
export function ChildLock() {
  const router = useRouter();
  useEffect(() => {
    // 进入家长页时锁定 player store
  }, []);
  return null;
}
