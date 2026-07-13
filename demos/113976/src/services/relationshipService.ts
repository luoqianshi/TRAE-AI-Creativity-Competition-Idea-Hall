// 关系服务 - 处理人员之间的关系
//
// 设计说明：
// - 所有关系操作通过此文件
// - 当前实现：IndexedDB
// - 后期迁移：改为 HTTP API 调用后端
// - UI 组件通过 familyStore 调用

import { DB_CONFIG } from '@/constants';
import { dbPut, dbGetAll } from './db';
import { generateId, now, splitName } from '@/utils/helpers';
import { deriveAllRelationships } from './relationDerivation';
import type {
  Relationship,
  AddRelativeInput,
  Person,
  PersonInput,
  Role,
} from '@/types';

// 创建一个人员（影子节点，未注册用户）
async function createShadowPerson(input: PersonInput): Promise<Person> {
  const { surname, givenName } = splitName(input.displayName);

  const person: Person = {
    id: generateId(),
    ownerUserId: null,  // 影子节点没有关联用户
    nodeType: 'shadow',
    displayName: input.displayName,
    surname: input.surname || surname,
    givenName: input.givenName || givenName,
    gender: input.gender,
    birthDate: input.birthDate || null,
    deathDate: input.deathDate || null,
    isAlive: input.isAlive !== false,
    birthPlace: input.birthPlace || null,
    currentAddress: input.currentAddress || null,
    phone: null,
    avatar: input.avatar || null,
    bio: input.bio || null,
    createdAt: now(),
    updatedAt: now(),
  };

  await dbPut(DB_CONFIG.stores.persons, person);
  return person;
}

// 添加亲属（创建新人员 + 创建关系）
export async function addRelative(
  fromPersonId: string,
  input: AddRelativeInput,
): Promise<{ person: Person; relationship: Relationship }> {
  // 1. 创建亲属人员（影子节点）
  const person = await createShadowPerson(input.personInput);

  // 2. 创建关系
  const relationship: Relationship = {
    id: generateId(),
    relationType: input.relationType,
    relationCategory: input.relationCategory || 'BLOOD',
    fromPersonId,
    fromRole: input.fromRole,
    toPersonId: person.id,
    toRole: input.toRole,
    siblingType: input.relationType === 'SIBLING' ? (input.siblingType || 'FULL') : null,
    startDate: input.startDate || null,
    endDate: null,
    verificationStatus: 'UNVERIFIED',
    note: input.note || null,
    createdAt: now(),
    updatedAt: now(),
  };

  await dbPut(DB_CONFIG.stores.relationships, relationship);

  return { person, relationship };
}

// 获取所有关系
export async function getAllRelationships(): Promise<Relationship[]> {
  return dbGetAll<Relationship>(DB_CONFIG.stores.relationships);
}

// 获取某人的所有关系
export async function getPersonRelationships(
  personId: string,
): Promise<Relationship[]> {
  const all = await getAllRelationships();
  return all.filter(
    (r) => r.fromPersonId === personId || r.toPersonId === personId,
  );
}

// 删除关系
export async function deleteRelationship(relationshipId: string): Promise<void> {
  const { dbDelete } = await import('./db');
  await dbDelete(DB_CONFIG.stores.relationships, relationshipId);
}

// 关联到已有人员（不创建新人员，仅建立关系）
// 用于"匹配已有亲属"场景，如：给儿子添加母亲时，匹配我的配偶
export async function linkExistingRelative(
  fromPersonId: string,
  existingPersonId: string,
  input: Omit<AddRelativeInput, 'personInput'>,
): Promise<Relationship> {
  const relationship: Relationship = {
    id: generateId(),
    relationType: input.relationType,
    relationCategory: input.relationCategory || 'BLOOD',
    fromPersonId,
    fromRole: input.fromRole,
    toPersonId: existingPersonId,
    toRole: input.toRole,
    siblingType: input.relationType === 'SIBLING' ? (input.siblingType || 'FULL') : null,
    startDate: input.startDate || null,
    endDate: null,
    verificationStatus: 'VERIFIED',  // 匹配的视为已确认
    note: input.note || '通过匹配关联',
    createdAt: now(),
    updatedAt: now(),
  };

  await dbPut(DB_CONFIG.stores.relationships, relationship);
  return relationship;
}

// 检测匹配候选
// 当用户给 fromPerson 添加某角色亲属时，查找是否已有候选人员可匹配
//
// 核心场景：
// 1. 给子女添加"父亲/母亲" → 候选 = 子女已有父母的配偶（如：给儿子添加母亲，儿子的父亲是我，我的妻子是候选）
// 2. 给某人添加"子女" → 候选 = 该人配偶的子女（如：给妻子添加儿子，丈夫我的儿子是候选）
// 3. 给某人添加"兄弟姐妹" → 候选 = 父母的其他子女
// 4. 给某人添加"父亲/母亲"（本人）→ 候选 = 兄弟姐妹的已有父母
export function findMatchCandidates(
  fromPersonId: string,
  option: RelationOption,
  persons: Person[],
  relationships: Relationship[],
): Person[] {
  const candidates = new Map<string, Person>();  // 用 Map 去重

  // 辅助函数：获取某人的父母
  const getParentsOf = (personId: string): Array<{ personId: string; role: Role }> => {
    const result: Array<{ personId: string; role: Role }> = [];
    for (const rel of relationships) {
      if (rel.relationType !== 'PARENT_CHILD') continue;
      if (rel.fromRole === 'CHILD' && rel.fromPersonId === personId) {
        result.push({ personId: rel.toPersonId, role: rel.toRole });
      } else if (rel.toRole === 'CHILD' && rel.toPersonId === personId) {
        result.push({ personId: rel.fromPersonId, role: rel.fromRole });
      }
    }
    return result;
  };

  // 辅助函数：获取某人的子女
  const getChildrenOf = (personId: string): string[] => {
    const result: string[] = [];
    for (const rel of relationships) {
      if (rel.relationType !== 'PARENT_CHILD') continue;
      if (rel.fromRole === 'CHILD' && rel.toPersonId === personId) {
        result.push(rel.fromPersonId);
      } else if (rel.toRole === 'CHILD' && rel.fromPersonId === personId) {
        result.push(rel.toPersonId);
      }
    }
    return result;
  };

  // 辅助函数：获取某人的配偶
  const getSpousesOf = (personId: string): string[] => {
    const result: string[] = [];
    for (const rel of relationships) {
      if (rel.relationType !== 'SPOUSE') continue;
      if (rel.fromPersonId === personId) result.push(rel.toPersonId);
      else if (rel.toPersonId === personId) result.push(rel.fromPersonId);
    }
    return result;
  };

  // 辅助函数：获取某人的兄弟姐妹
  const getSiblingsOf = (personId: string): string[] => {
    const result: string[] = [];
    for (const rel of relationships) {
      if (rel.relationType !== 'SIBLING') continue;
      if (rel.fromPersonId === personId) result.push(rel.toPersonId);
      else if (rel.toPersonId === personId) result.push(rel.fromPersonId);
    }
    return result;
  };

  const findPerson = (id: string) => persons.find((p) => p.id === id);

  if (option.relationType === 'PARENT_CHILD') {
    if (option.toRole === 'FATHER' || option.toRole === 'MOTHER') {
      // 给 fromPerson 添加父亲/母亲
      // 候选 = fromPerson 已有父母的配偶（如：儿子的父亲的配偶 = 我的妻子）
      const parents = getParentsOf(fromPersonId);

      for (const parent of parents) {
        // 跳过已有的同角色父母（避免重复匹配）
        if (parent.role === option.toRole) continue;

        const spouses = getSpousesOf(parent.personId);
        for (const spouseId of spouses) {
          // 跳过已是 fromPerson 父母的人
          if (parents.some((p) => p.personId === spouseId)) continue;
          // 跳过 fromPerson 自己
          if (spouseId === fromPersonId) continue;

          const person = findPerson(spouseId);
          if (person) candidates.set(spouseId, person);
        }
      }

      // 也检查兄弟姐妹的已有父母
      const siblings = getSiblingsOf(fromPersonId);
      for (const siblingId of siblings) {
        const siblingParents = getParentsOf(siblingId);
        for (const sp of siblingParents) {
          if (sp.role !== option.toRole) continue;
          // 跳过已是 fromPerson 父母的人
          if (parents.some((p) => p.personId === sp.personId)) continue;
          const person = findPerson(sp.personId);
          if (person) candidates.set(sp.personId, person);
        }
      }
    } else if (option.toRole === 'CHILD') {
      // 给 fromPerson 添加子女
      // 候选 = fromPerson 配偶的子女（未和 fromPerson 建立关系的）
      const spouses = getSpousesOf(fromPersonId);

      for (const spouseId of spouses) {
        const spouseChildren = getChildrenOf(spouseId);
        for (const childId of spouseChildren) {
          // 跳过已是 fromPerson 子女的人
          const childParents = getParentsOf(childId);
          if (childParents.some((p) => p.personId === fromPersonId)) continue;

          const person = findPerson(childId);
          if (person) candidates.set(childId, person);
        }
      }
    }
  } else if (option.relationType === 'SIBLING') {
    // 给 fromPerson 添加兄弟姐妹
    // 候选 = fromPerson 父母的其他子女（包括推导的兄弟姐妹的兄弟姐妹）
    // 使用 deriveAllRelationships 的推导结果来发现更远的候选

    // 先用直接关系找候选
    const parents = getParentsOf(fromPersonId);
    for (const parent of parents) {
      const otherChildren = getChildrenOf(parent.personId);
      for (const childId of otherChildren) {
        if (childId === fromPersonId) continue;
        // 跳过已是兄弟姐妹的人
        if (getSiblingsOf(fromPersonId).includes(childId)) continue;
        const person = findPerson(childId);
        if (person) candidates.set(childId, person);
      }
    }

    // 再用推导关系找候选
    // 场景：大姨添加妹妹，推导已建立大姨和母亲的姐妹关系
    // → 母亲应作为候选
    const derivedRels = deriveAllRelationships(fromPersonId, persons, relationships);
    for (const dRel of derivedRels) {
      if (dRel.relationType !== 'SIBLING') continue;
      if (dRel.isDerived === false) continue;  // 跳过直接关系（已处理）

      const person = findPerson(dRel.toPersonId);
      if (person && dRel.toPersonId !== fromPersonId) {
        candidates.set(dRel.toPersonId, person);
      }
    }
  }

  // 根据选项的性别要求过滤候选
  // 哥哥/弟弟 → 男性，姐姐/妹妹 → 女性
  // 父亲/祖父/外祖父 → 男性，母亲/祖母/外祖母 → 女性
  // 儿子 → 男性，女儿 → 女性
  // 丈夫 → 男性，妻子 → 女性
  const requiredGender = getRequiredGender(option.label);

  let result = Array.from(candidates.values());

  if (requiredGender) {
    result = result.filter((p) => p.gender === requiredGender);
  }

  // 按年龄排序
  // - 添加"哥哥/姐姐"（年长）→ 候选按出生日期降序（年龄大的在前）
  // - 添加"弟弟/妹妹"（年幼）→ 候选按出生日期升序（年龄小的在前）
  // - 没有出生日期的放最后
  // - 其他关系不排序
  const elderLabels = ['哥哥', '姐姐'];
  const youngerLabels = ['弟弟', '妹妹'];

  if (elderLabels.includes(option.label) || youngerLabels.includes(option.label)) {
    const preferElder = elderLabels.includes(option.label);
    result.sort((a, b) => {
      const yearA = a.birthDate ? parseInt(a.birthDate.slice(0, 4)) : 0;
      const yearB = b.birthDate ? parseInt(b.birthDate.slice(0, 4)) : 0;

      // 没有出生日期的放最后
      if (yearA === 0 && yearB === 0) return 0;
      if (yearA === 0) return 1;
      if (yearB === 0) return -1;

      // 年长的在前：年龄大（年份小）的在前
      // 年幼的在前：年龄小（年份大）的在前
      return preferElder ? yearA - yearB : yearB - yearA;
    });
  }

  return result;
}

// 根据关系标签获取要求的性别
function getRequiredGender(label: string): 'male' | 'female' | null {
  const maleLabels = ['父亲', '爷爷', '外公', '儿子', '丈夫', '哥哥', '弟弟'];
  const femaleLabels = ['母亲', '奶奶', '外婆', '女儿', '妻子', '姐姐', '妹妹'];

  if (maleLabels.includes(label)) return 'male';
  if (femaleLabels.includes(label)) return 'female';
  return null;
}

// 根据添加者性别动态确定 fromRole
// "儿子"/"女儿"：fromRole 应为 FATHER（添加者男）或 MOTHER（添加者女）
// "丈夫"/"妻子"：fromRole 应根据添加者性别确定配偶角色
export function resolveFromRole(
  option: RelationOption,
  fromPerson: Person | undefined,
): Role {
  // 添加子女：fromRole = 添加者的父母角色
  if (option.label === '儿子' || option.label === '女儿') {
    return fromPerson?.gender === 'female' ? 'MOTHER' : 'FATHER';
  }
  // 添加配偶：fromRole = 添加者的配偶角色
  if (option.label === '丈夫') {
    // 添加"丈夫"→ 添加者是妻子角色
    return fromPerson?.gender === 'female' ? 'WIFE' : 'HUSBAND';
  }
  if (option.label === '妻子') {
    // 添加"妻子"→ 添加者是丈夫角色
    return fromPerson?.gender === 'male' ? 'HUSBAND' : 'WIFE';
  }
  // 其他情况：用 option.fromRole
  return option.fromRole;
}

// ========== 关系角色推导 ==========
// 给定一个关系，返回对方在该人员视角下的角色标签

export function getRelationLabel(
  relationship: Relationship,
  currentPersonId: string,
): string {
  const isFrom = relationship.fromPersonId === currentPersonId;

  // fromRole 是当前人员的角色，toRole 是对方的角色
  // 如果当前人员是 from，那对方就是 to，看 toRole
  // 如果当前人员是 to，那对方就是 from，看 fromRole
  const otherRole = isFrom ? relationship.toRole : relationship.fromRole;

  const labelMap: Record<Role, string> = {
    FATHER: '父亲',
    MOTHER: '母亲',
    CHILD: '子女',
    PATERNAL_GRANDFATHER: '祖父',
    PATERNAL_GRANDMOTHER: '祖母',
    MATERNAL_GRANDFATHER: '外祖父',
    MATERNAL_GRANDMOTHER: '外祖母',
    GRANDCHILD: '孙辈',
    PATERNAL_UNCLE: '伯/叔',
    PATERNAL_AUNT: '姑姑',
    MATERNAL_UNCLE: '舅舅',
    MATERNAL_AUNT: '姨妈',
    NIECE: '侄',
    NEPHEW: '甥',
    HUSBAND: '丈夫',
    WIFE: '妻子',
    ELDER_BROTHER: '哥哥',
    YOUNGER_BROTHER: '弟弟',
    ELDER_SISTER: '姐姐',
    YOUNGER_SISTER: '妹妹',
  };

  let label = labelMap[otherRole] || '亲属';

  // 子女根据性别显示"儿子"或"女儿"
  if (otherRole === 'CHILD') {
    // 这里需要知道对方的性别，但 Relationship 里没有
    // 由调用方在需要精确标签时单独处理
    label = '子女';
  }

  // 加上关系类别前缀
  const category = relationship.relationCategory;
  if (category === 'ADOPTION') {
    label = `养${label}`;
  } else if (category === 'STEP') {
    label = `继${label}`;
  } else if (category === 'FOSTER') {
    label = `寄养${label}`;
  } else if (category === 'SWORN') {
    label = `义${label}`;
  }

  return label;
}

// 根据选择的关系，推导出 fromRole 和 toRole
// 用户选择"添加 X 关系"时，确定 X 是当前人员的什么角色
export interface RelationOption {
  label: string;           // 显示给用户的标签（如"父亲"）
  relationType: Relationship['relationType'];
  fromRole: Role;          // 当前人员的角色
  toRole: Role;            // 新亲属的角色
  defaultGender?: Person['gender'];  // 新亲属的默认性别
}

export const RELATION_OPTIONS: RelationOption[] = [
  // 父母
  {
    label: '父亲',
    relationType: 'PARENT_CHILD',
    fromRole: 'CHILD',
    toRole: 'FATHER',
    defaultGender: 'male',
  },
  {
    label: '母亲',
    relationType: 'PARENT_CHILD',
    fromRole: 'CHILD',
    toRole: 'MOTHER',
    defaultGender: 'female',
  },
  // 配偶
  {
    label: '丈夫',
    relationType: 'SPOUSE',
    fromRole: 'WIFE',
    toRole: 'HUSBAND',
    defaultGender: 'male',
  },
  {
    label: '妻子',
    relationType: 'SPOUSE',
    fromRole: 'HUSBAND',
    toRole: 'WIFE',
    defaultGender: 'female',
  },
  // 子女
  {
    label: '儿子',
    relationType: 'PARENT_CHILD',
    fromRole: 'FATHER',
    toRole: 'CHILD',
    defaultGender: 'male',
  },
  {
    label: '女儿',
    relationType: 'PARENT_CHILD',
    fromRole: 'MOTHER',
    toRole: 'CHILD',
    defaultGender: 'female',
  },
  // 兄弟姐妹
  {
    label: '哥哥',
    relationType: 'SIBLING',
    fromRole: 'YOUNGER_BROTHER',
    toRole: 'ELDER_BROTHER',
    defaultGender: 'male',
  },
  {
    label: '弟弟',
    relationType: 'SIBLING',
    fromRole: 'ELDER_BROTHER',
    toRole: 'YOUNGER_BROTHER',
    defaultGender: 'male',
  },
  {
    label: '姐姐',
    relationType: 'SIBLING',
    fromRole: 'YOUNGER_SISTER',
    toRole: 'ELDER_SISTER',
    defaultGender: 'female',
  },
  {
    label: '妹妹',
    relationType: 'SIBLING',
    fromRole: 'ELDER_SISTER',
    toRole: 'YOUNGER_SISTER',
    defaultGender: 'female',
  },
  // 祖父母
  {
    label: '爷爷',
    relationType: 'PARENT_CHILD',
    fromRole: 'CHILD',
    toRole: 'PATERNAL_GRANDFATHER',
    defaultGender: 'male',
  },
  {
    label: '奶奶',
    relationType: 'PARENT_CHILD',
    fromRole: 'CHILD',
    toRole: 'PATERNAL_GRANDMOTHER',
    defaultGender: 'female',
  },
  {
    label: '外公',
    relationType: 'PARENT_CHILD',
    fromRole: 'CHILD',
    toRole: 'MATERNAL_GRANDFATHER',
    defaultGender: 'male',
  },
  {
    label: '外婆',
    relationType: 'PARENT_CHILD',
    fromRole: 'CHILD',
    toRole: 'MATERNAL_GRANDMOTHER',
    defaultGender: 'female',
  },
];
