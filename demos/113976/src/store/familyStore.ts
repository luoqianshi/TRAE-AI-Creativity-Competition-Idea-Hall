// 家族状态管理（Zustand）
//
// 职责：
// - 管理所有人员节点
// - 管理所有关系
// - 加载当前用户的家族数据
// - 提供创建/更新人员、添加亲属方法

import { create } from 'zustand';
import {
  createSelfPerson,
  updatePerson,
  getPersonByUserId,
  getPerson,
  getAllPersons,
} from '@/services/personService';
import {
  addRelative,
  getAllRelationships,
  getPersonRelationships,
  deleteRelationship,
  linkExistingRelative,
} from '@/services/relationshipService';
import type { Person, PersonInput, Relationship, AddRelativeInput } from '@/types';

interface FamilyState {
  // 本人节点
  selfPerson: Person | null;
  // 所有人员
  persons: Person[];
  // 所有关系
  relationships: Relationship[];
  // 加载状态
  isLoading: boolean;

  // 加载家族数据（登录后调用）
  loadFamily: (userId: string) => Promise<void>;
  // 加载单个人员
  loadPerson: (personId: string) => Promise<Person | null>;
  // 获取某人的所有关系
  getRelationshipsOf: (personId: string) => Relationship[];

  // 创建本人节点
  createSelf: (userId: string, input: PersonInput) => Promise<Person>;
  // 更新人员
  update: (personId: string, input: Partial<PersonInput>) => Promise<Person>;
  // 添加亲属（创建新人员 + 建立关系）
  addRelative: (fromPersonId: string, input: AddRelativeInput) => Promise<{ person: Person; relationship: Relationship }>;
  // 关联到已有人员（匹配亲属，不创建新人员）
  linkRelative: (fromPersonId: string, existingPersonId: string, input: Omit<AddRelativeInput, 'personInput'>) => Promise<Relationship>;
  // 删除关系（移除亲属，不删除人员节点）
  removeRelative: (relationshipId: string) => Promise<void>;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  selfPerson: null,
  persons: [],
  relationships: [],
  isLoading: false,

  loadFamily: async (userId) => {
    set({ isLoading: true });
    try {
      // 1. 查找本人节点
      const self = await getPersonByUserId(userId);
      // 2. 加载所有人员
      const persons = await getAllPersons();
      // 3. 加载所有关系
      const relationships = await getAllRelationships();
      set({ selfPerson: self || null, persons, relationships, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadPerson: async (personId) => {
    // 先从 store 找
    const cached = get().persons.find((p) => p.id === personId);
    if (cached) return cached;

    // 再从 DB 加载
    const person = await getPerson(personId);
    return person || null;
  },

  getRelationshipsOf: (personId) => {
    return get().relationships.filter(
      (r) => r.fromPersonId === personId || r.toPersonId === personId,
    );
  },

  createSelf: async (userId, input) => {
    const person = await createSelfPerson(userId, input);

    // 更新 state
    const persons = [...get().persons, person];
    set({ selfPerson: person, persons });

    return person;
  },

  update: async (personId, input) => {
    const person = await updatePerson(personId, input);

    // 更新 state 中的人员列表
    const persons = get().persons.map((p) =>
      p.id === personId ? person : p,
    );
    const selfPerson =
      get().selfPerson?.id === personId ? person : get().selfPerson;
    set({ persons, selfPerson });

    return person;
  },

  addRelative: async (fromPersonId, input) => {
    const result = await addRelative(fromPersonId, input);

    // 更新 state
    const persons = [...get().persons, result.person];
    const relationships = [...get().relationships, result.relationship];
    set({ persons, relationships });

    return result;
  },

  removeRelative: async (relationshipId) => {
    await deleteRelationship(relationshipId);

    // 更新 state：移除该关系
    const relationships = get().relationships.filter(
      (r) => r.id !== relationshipId,
    );
    set({ relationships });
  },

  linkRelative: async (fromPersonId, existingPersonId, input) => {
    const relationship = await linkExistingRelative(fromPersonId, existingPersonId, input);

    // 更新 state
    const relationships = [...get().relationships, relationship];
    set({ relationships });

    return relationship;
  },
}));
