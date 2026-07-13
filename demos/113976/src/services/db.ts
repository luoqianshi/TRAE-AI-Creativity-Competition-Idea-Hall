// IndexedDB 封装 - 浏览器本地数据存储
//
// 设计说明：
// - 所有数据库操作通过此文件提供
// - 后期迁移到后端时，只需改 service 层的实现
// - UI 组件不直接调用此文件

import { DB_CONFIG } from '@/constants';

// IndexedDB 数据库实例
let dbInstance: IDBDatabase | null = null;

// 打开数据库（如果不存在则创建）
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    // 首次创建或版本升级时，创建表结构
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // users 表：用户账号
      if (!db.objectStoreNames.contains(DB_CONFIG.stores.users)) {
        const store = db.createObjectStore(DB_CONFIG.stores.users, {
          keyPath: 'id',
        });
        // 按手机号建索引（用于登录查询）
        store.createIndex('phone', 'phone', { unique: true });
      }

      // persons 表：人员节点（S2 阶段用）
      if (!db.objectStoreNames.contains(DB_CONFIG.stores.persons)) {
        const store = db.createObjectStore(DB_CONFIG.stores.persons, {
          keyPath: 'id',
        });
        store.createIndex('ownerUserId', 'ownerUserId', { unique: false });
      }

      // relationships 表：关系（S3 阶段用）
      if (!db.objectStoreNames.contains(DB_CONFIG.stores.relationships)) {
        const store = db.createObjectStore(DB_CONFIG.stores.relationships, {
          keyPath: 'id',
        });
        store.createIndex('fromPersonId', 'fromPersonId', { unique: false });
        store.createIndex('toPersonId', 'toPersonId', { unique: false });
      }
    };
  });
}

// 写入一条记录
export async function dbPut<T>(storeName: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// 按 ID 获取一条记录
export async function dbGet<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 获取所有记录
export async function dbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 按索引查询单条记录
export async function dbGetByIndex<T>(
  storeName: string,
  indexName: string,
  value: string,
): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.get(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 按 ID 删除一条记录
export async function dbDelete(storeName: string, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
