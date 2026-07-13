// 人员服务 - 处理人员节点的增删改查
//
// 设计说明：
// - 所有人员数据操作通过此文件
// - 当前实现：IndexedDB
// - 后期迁移：改为 HTTP API 调用后端
// - UI 组件通过 familyStore 调用，不直接调此文件

import { DB_CONFIG } from '@/constants';
import { dbPut, dbGet, dbGetAll, dbDelete, dbGetByIndex } from './db';
import { generateId, now, splitName } from '@/utils/helpers';
import type { Person, PersonInput } from '@/types';

// 创建本人节点（注册用户首次填写资料）
export async function createSelfPerson(
  userId: string,
  input: PersonInput,
): Promise<Person> {
  const { surname, givenName } = splitName(input.displayName);

  const person: Person = {
    id: generateId(),
    ownerUserId: userId,
    nodeType: 'registered',
    displayName: input.displayName,
    surname: input.surname || surname,
    givenName: input.givenName || givenName,
    gender: input.gender,
    birthDate: input.birthDate || null,
    deathDate: input.deathDate || null,
    isAlive: input.isAlive !== false,
    birthPlace: input.birthPlace || null,
    currentAddress: input.currentAddress || null,
    phone: input.phone || null,
    avatar: input.avatar || null,
    bio: input.bio || null,
    createdAt: now(),
    updatedAt: now(),
  };

  await dbPut(DB_CONFIG.stores.persons, person);
  return person;
}

// 更新人员信息
export async function updatePerson(
  personId: string,
  input: Partial<PersonInput>,
): Promise<Person> {
  const existing = await dbGet<Person>(DB_CONFIG.stores.persons, personId);
  if (!existing) {
    throw new Error('人员不存在');
  }

  // 如果更新了姓名，自动拆分姓和名
  let surname = existing.surname;
  let givenName = existing.givenName;
  if (input.displayName && input.displayName !== existing.displayName) {
    const parts = splitName(input.displayName);
    surname = input.surname || parts.surname;
    givenName = input.givenName || parts.givenName;
  }

  const updated: Person = {
    ...existing,
    ...input,
    surname,
    givenName,
    updatedAt: now(),
  };

  await dbPut(DB_CONFIG.stores.persons, updated);
  return updated;
}

// 获取人员
export async function getPerson(personId: string): Promise<Person | undefined> {
  return dbGet<Person>(DB_CONFIG.stores.persons, personId);
}

// 按用户 ID 获取本人节点
export async function getPersonByUserId(
  userId: string,
): Promise<Person | undefined> {
  return dbGetByIndex<Person>(DB_CONFIG.stores.persons, 'ownerUserId', userId);
}

// 获取所有人员
export async function getAllPersons(): Promise<Person[]> {
  return dbGetAll<Person>(DB_CONFIG.stores.persons);
}

// 删除人员（一般不删除，用合并替代）
export async function deletePerson(personId: string): Promise<void> {
  await dbDelete(DB_CONFIG.stores.persons, personId);
}
