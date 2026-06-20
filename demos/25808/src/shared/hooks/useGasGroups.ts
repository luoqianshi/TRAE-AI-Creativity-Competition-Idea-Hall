import { useState, useEffect } from 'react';
import { GasGroupConfig } from '../types';

const STORAGE_KEY = 'gas_group_configs';

const DEFAULT_CONFIGS: GasGroupConfig[] = [
  { id: 'group_boiler', name: '锅炉房总用量', memberIds: [] }, // MemberIds will be matched by name containing "锅炉" for fallback
  { id: 'group_kitchen', name: '餐饮用气汇总', memberIds: [] },
];

export const useGasGroups = () => {
  const [groups, setGroups] = useState<GasGroupConfig[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setGroups(JSON.parse(stored));
    } else {
      setGroups(DEFAULT_CONFIGS);
    }
  }, []);

  const saveGroups = (newGroups: GasGroupConfig[]) => {
    setGroups(newGroups);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups));
  };

  return { groups, saveGroups };
};
