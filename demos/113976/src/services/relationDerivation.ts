// 关系推导服务 - 自动计算传递关系
//
// 核心逻辑：
// 1. 共享父母：如果 A 和 B 是兄弟姐妹，A 的父母也是 B 的父母
// 2. 父母的父母 → 祖父母/外祖父母
// 3. 父母的兄弟姐妹 → 伯叔姑舅姨
// 4. 父母的其他子女 → 兄弟姐妹
// 5. 兄弟姐妹的子女 → 侄甥
// 6. 子女的子女 → 孙辈
//
// 推导关系（isDerived=true）不存数据库，运行时计算

import type { Person, Relationship, Role, RelationCategory, SiblingType } from '@/types';

// 推导出的关系（不存数据库，运行时计算）
export interface DerivedRelationship {
  relationType: Relationship['relationType'];
  relationCategory: RelationCategory;
  fromPersonId: string;
  fromRole: Role;
  toPersonId: string;
  toRole: Role;
  label: string;
  isDerived: boolean;
  path?: string[];
}

// 角色到标签的映射
const ROLE_LABELS: Record<Role, string> = {
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

export function getRoleLabel(role: Role, category?: RelationCategory): string {
  let label = ROLE_LABELS[role] || '亲属';
  if (category === 'ADOPTION') label = `养${label}`;
  else if (category === 'STEP') label = `继${label}`;
  else if (category === 'FOSTER') label = `寄养${label}`;
  else if (category === 'SWORN') label = `义${label}`;
  return label;
}

// ========== 辈分计算 ==========

export function calculateGenerations(
  persons: Person[],
  relationships: Relationship[],
  rootPersonId: string,
): Map<string, number> {
  const generations = new Map<string, number>();
  generations.set(rootPersonId, 0);

  const parentMap = new Map<string, string[]>();
  const childMap = new Map<string, string[]>();
  const spouseMap = new Map<string, Set<string>>();
  const siblingMap = new Map<string, Set<string>>();  // 兄弟姐妹关系图

  for (const rel of relationships) {
    if (rel.relationType === 'PARENT_CHILD') {
      let parentId: string, childId: string;
      if (rel.fromRole === 'CHILD') {
        childId = rel.fromPersonId;
        parentId = rel.toPersonId;
      } else {
        parentId = rel.fromPersonId;
        childId = rel.toPersonId;
      }

      const parents = parentMap.get(childId) || [];
      parents.push(parentId);
      parentMap.set(childId, parents);

      const children = childMap.get(parentId) || [];
      children.push(childId);
      childMap.set(parentId, children);
    } else if (rel.relationType === 'SPOUSE') {
      const s1 = spouseMap.get(rel.fromPersonId) || new Set();
      s1.add(rel.toPersonId);
      spouseMap.set(rel.fromPersonId, s1);

      const s2 = spouseMap.get(rel.toPersonId) || new Set();
      s2.add(rel.fromPersonId);
      spouseMap.set(rel.toPersonId, s2);
    } else if (rel.relationType === 'SIBLING') {
      // 兄弟姐妹双向
      const s1 = siblingMap.get(rel.fromPersonId) || new Set();
      s1.add(rel.toPersonId);
      siblingMap.set(rel.fromPersonId, s1);

      const s2 = siblingMap.get(rel.toPersonId) || new Set();
      s2.add(rel.fromPersonId);
      siblingMap.set(rel.toPersonId, s2);
    }
  }

  // BFS 分配辈分
  const queue: Array<{ id: string; gen: number }> = [{ id: rootPersonId, gen: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    if (!generations.has(id)) {
      generations.set(id, gen);
    }

    const parents = parentMap.get(id) || [];
    for (const pId of parents) {
      if (!visited.has(pId)) {
        queue.push({ id: pId, gen: gen - 1 });
      }
    }

    const children = childMap.get(id) || [];
    for (const cId of children) {
      if (!visited.has(cId)) {
        queue.push({ id: cId, gen: gen + 1 });
      }
    }

    const spouses = spouseMap.get(id) || [];
    for (const sId of spouses) {
      if (!visited.has(sId)) {
        queue.push({ id: sId, gen });
      }
    }

    // 兄弟姐妹同层（辈分相同）
    const siblings = siblingMap.get(id) || [];
    for (const sId of siblings) {
      if (!visited.has(sId)) {
        queue.push({ id: sId, gen });
      }
    }
  }

  for (const p of persons) {
    if (!generations.has(p.id)) {
      generations.set(p.id, 0);
    }
  }

  return generations;
}

// ========== 内部辅助：构建关系图 ==========

interface ParentEntry {
  personId: string;
  role: Role;        // 父母角色（FATHER/MOTHER）
  category: RelationCategory;
  isDirect: boolean;
}

interface ChildEntry {
  personId: string;
  role: Role;        // 子女角色（CHILD）
  category: RelationCategory;
  isDirect: boolean;
}

interface SiblingEntry {
  personId: string;
  role: Role;        // 兄弟姐妹角色
  category: RelationCategory;
  siblingType: SiblingType;  // 兄弟姐妹血缘类型
  isDirect: boolean;
}

// 构建关系索引，并推导共享父母
function buildRelationGraph(relationships: Relationship[]) {
  const parentMap = new Map<string, ParentEntry[]>();
  const childMap = new Map<string, ChildEntry[]>();
  const siblingMap = new Map<string, SiblingEntry[]>();
  const spouseMap = new Map<string, Set<string>>();

  // 解析 PARENT_CHILD 关系
  for (const rel of relationships) {
    if (rel.relationType === 'PARENT_CHILD') {
      let parentId: string, childId: string;
      let parentRole: Role, childRole: Role;

      if (rel.fromRole === 'CHILD') {
        childId = rel.fromPersonId;
        parentId = rel.toPersonId;
        childRole = rel.fromRole;
        parentRole = rel.toRole;
      } else {
        parentId = rel.fromPersonId;
        childId = rel.toPersonId;
        parentRole = rel.fromRole;
        childRole = rel.toRole;
      }

      const pArr = parentMap.get(childId) || [];
      pArr.push({ personId: parentId, role: parentRole, category: rel.relationCategory, isDirect: true });
      parentMap.set(childId, pArr);

      const cArr = childMap.get(parentId) || [];
      cArr.push({ personId: childId, role: childRole, category: rel.relationCategory, isDirect: true });
      childMap.set(parentId, cArr);
    } else if (rel.relationType === 'SIBLING') {
      // 双向
      const sibType: SiblingType = rel.siblingType || 'FULL';
      const s1 = siblingMap.get(rel.fromPersonId) || [];
      s1.push({ personId: rel.toPersonId, role: rel.toRole, category: rel.relationCategory, siblingType: sibType, isDirect: true });
      siblingMap.set(rel.fromPersonId, s1);

      const s2 = siblingMap.get(rel.toPersonId) || [];
      s2.push({ personId: rel.fromPersonId, role: rel.fromRole, category: rel.relationCategory, siblingType: sibType, isDirect: true });
      siblingMap.set(rel.toPersonId, s2);
    } else if (rel.relationType === 'SPOUSE') {
      const s1 = spouseMap.get(rel.fromPersonId) || new Set();
      s1.add(rel.toPersonId);
      spouseMap.set(rel.fromPersonId, s1);

      const s2 = spouseMap.get(rel.toPersonId) || new Set();
      s2.add(rel.fromPersonId);
      spouseMap.set(rel.toPersonId, s2);
    }
  }

  // 推导共享父母：根据 siblingType 精准推导
  // - FULL（同父同母）：共享父亲和母亲
  // - PATERNAL（同父异母）：只共享父亲
  // - MATERNAL（同母异父）：只共享母亲
  // 迭代直到不再变化
  let changed = true;
  while (changed) {
    changed = false;

    // 遍历所有有兄弟姐妹的人
    for (const [personId, siblings] of siblingMap.entries()) {
      const parents = parentMap.get(personId) || [];

      for (const sibling of siblings) {
        const siblingParents = parentMap.get(sibling.personId) || [];

        for (const parent of parents) {
          // 根据 siblingType 判断是否共享这个父母
          // - FULL：共享所有父母
          // - PATERNAL：只共享父亲（FATHER）
          // - MATERNAL：只共享母亲（MOTHER）
          const shouldShare = (() => {
            if (sibling.siblingType === 'FULL') return true;
            if (sibling.siblingType === 'PATERNAL') return parent.role === 'FATHER';
            if (sibling.siblingType === 'MATERNAL') return parent.role === 'MOTHER';
            return true;  // 默认共享
          })();

          if (!shouldShare) continue;

          // 检查 sibling 是否已经有这个 parent
          const alreadyHas = siblingParents.some((sp) => sp.personId === parent.personId);
          if (!alreadyHas) {
            // 添加共享父母
            siblingParents.push({
              personId: parent.personId,
              role: parent.role,
              category: parent.category,
              isDirect: false,
            });
            parentMap.set(sibling.personId, siblingParents);

            // 同时添加到 parent 的 childMap
            const parentChildren = childMap.get(parent.personId) || [];
            parentChildren.push({
              personId: sibling.personId,
              role: 'CHILD',
              category: parent.category,
              isDirect: false,
            });
            childMap.set(parent.personId, parentChildren);

            changed = true;
          }
        }
      }
    }

    // SIBLING 传递推导：如果 A 是 B 的兄弟，B 是 C 的兄弟，那么 A 也是 C 的兄弟
    // 场景：大舅1 和大舅2 是兄弟（用户直接添加），大舅2 和大姨是兄妹（用户直接添加）
    // → 大舅1 和大姨也是兄妹（推导）
    for (const [personId, siblings] of siblingMap.entries()) {
      for (const sibling of siblings) {
        const siblingSiblings = siblingMap.get(sibling.personId) || [];
        for (const ss of siblingSiblings) {
          // 跳过自己
          if (ss.personId === personId) continue;
          // 检查是否已经是兄弟姐妹
          const alreadySibling = siblings.some((s) => s.personId === ss.personId);
          if (!alreadySibling) {
            // 推导为兄弟姐妹（同父同母，因为如果两边都是同父同母，传递也是同父同母）
            siblings.push({
              personId: ss.personId,
              role: 'SIBLING' as Role,
              category: ss.category,
              siblingType: 'FULL',
              isDirect: false,
            });
            changed = true;
          }
        }
      }
    }
  }

  return { parentMap, childMap, siblingMap, spouseMap };
}

// ========== 核心推导函数 ==========

export function deriveAllRelationships(
  currentPersonId: string,
  persons: Person[],
  relationships: Relationship[],
): DerivedRelationship[] {
  const result: DerivedRelationship[] = [];
  const seenPairs = new Set<string>();

  const addRel = (rel: Omit<DerivedRelationship, 'isDerived' | 'path'> & { isDerived?: boolean; path?: string[] }) => {
    const pairKey = [currentPersonId, rel.toPersonId].sort().join('::');
    if (seenPairs.has(pairKey)) return;
    seenPairs.add(pairKey);
    result.push({
      ...rel,
      isDerived: rel.isDerived ?? false,
    });
  };

  // 辅助函数：根据 target 相对 reference 的年龄/性别，确定 target 是哥哥/弟弟/姐姐/妹妹
  // 用于 SIBLING 关系的角色动态计算
  const determineSiblingRoleFor = (target: Person | undefined, reference: Person | undefined): Role => {
    if (!target) return 'ELDER_BROTHER';
    if (!reference) return 'ELDER_BROTHER';

    const refYear = reference.birthDate ? parseInt(reference.birthDate.slice(0, 4)) : 0;
    const targetYear = target.birthDate ? parseInt(target.birthDate.slice(0, 4)) : 0;

    const isMale = target.gender === 'male';

    if (refYear > 0 && targetYear > 0) {
      if (targetYear < refYear) {
        // target 比 reference 大
        return isMale ? 'ELDER_BROTHER' : 'ELDER_SISTER';
      } else if (targetYear > refYear) {
        // target 比 reference 小
        return isMale ? 'YOUNGER_BROTHER' : 'YOUNGER_SISTER';
      }
    }

    // 同年或未知，默认年长
    return isMale ? 'ELDER_BROTHER' : 'ELDER_SISTER';
  };

  // 1. 添加直接关系
  for (const rel of relationships) {
    if (rel.fromPersonId !== currentPersonId && rel.toPersonId !== currentPersonId) {
      continue;
    }

    const isFrom = rel.fromPersonId === currentPersonId;
    const otherPersonId = isFrom ? rel.toPersonId : rel.fromPersonId;

    // SIBLING 关系：根据性别和年龄动态计算角色，不使用存储的角色
    // 存储的 fromRole/toRole 可能不准确（如父亲添加妹妹，fromRole 根据添加者性别设置）
    if (rel.relationType === 'SIBLING') {
      const otherPerson = persons.find((p) => p.id === otherPersonId);
      const myPerson = persons.find((p) => p.id === currentPersonId);
      const otherRole = determineSiblingRoleFor(otherPerson, myPerson);
      const myRole = determineSiblingRoleFor(myPerson, otherPerson);

      addRel({
        relationType: rel.relationType,
        relationCategory: rel.relationCategory,
        fromPersonId: currentPersonId,
        fromRole: myRole,
        toPersonId: otherPersonId,
        toRole: otherRole,
        label: getRoleLabel(otherRole, rel.relationCategory),
        isDerived: false,
      });
    } else {
      const otherRole = isFrom ? rel.toRole : rel.fromRole;
      const myRole = isFrom ? rel.fromRole : rel.toRole;

      addRel({
        relationType: rel.relationType,
        relationCategory: rel.relationCategory,
        fromPersonId: currentPersonId,
        fromRole: myRole,
        toPersonId: otherPersonId,
        toRole: otherRole,
        label: getRoleLabel(otherRole, rel.relationCategory),
        isDerived: false,
      });
    }
  }

  // 构建扩展关系图（含共享父母推导）
  const { parentMap, childMap, siblingMap } = buildRelationGraph(relationships);

  // 1.5 补充通过共享父母推导的关系
  // 场景：女儿A添加了弟弟（SIBLING 关系），弟弟没有直接的父母关系
  // 但通过共享父母推导，弟弟也和父母（嫂子）建立了 PARENT_CHILD 关系
  // 这里把推导的父母和子女补充到结果中
  const myDerivedParents = parentMap.get(currentPersonId) || [];
  for (const parent of myDerivedParents) {
    if (parent.isDirect) continue;  // 直接关系已在第 1 步添加

    // 推导的父母关系
    addRel({
      relationType: 'PARENT_CHILD',
      relationCategory: parent.category,
      fromPersonId: currentPersonId,
      fromRole: 'CHILD',
      toPersonId: parent.personId,
      toRole: parent.role,
      label: getRoleLabel(parent.role, parent.category),
      isDerived: true,
      path: [currentPersonId, '共享父母推导', parent.personId],
    });
  }

  const myDerivedChildren = childMap.get(currentPersonId) || [];
  for (const child of myDerivedChildren) {
    if (child.isDirect) continue;  // 直接关系已在第 1 步添加

    // 推导的子女关系
    // 根据当前人的性别确定父母角色
    const currentPerson = persons.find((p) => p.id === currentPersonId);
    const myParentRole: Role = currentPerson?.gender === 'female' ? 'MOTHER' : 'FATHER';

    addRel({
      relationType: 'PARENT_CHILD',
      relationCategory: child.category,
      fromPersonId: currentPersonId,
      fromRole: myParentRole,
      toPersonId: child.personId,
      toRole: 'CHILD',
      label: getRoleLabel('CHILD', child.category),
      isDerived: true,
      path: [currentPersonId, '共享父母推导', child.personId],
    });
  }

  // 辅助函数：根据出生日期判断哥哥/弟弟/姐姐/妹妹
  const determineSiblingRole = (siblingPersonId: string): Role => {
    const siblingPerson = persons.find((p) => p.id === siblingPersonId);
    const myPerson = persons.find((p) => p.id === currentPersonId);

    if (!siblingPerson) return 'ELDER_BROTHER';
    if (!myPerson) return 'ELDER_BROTHER';

    const myBirthYear = myPerson.birthDate ? parseInt(myPerson.birthDate.slice(0, 4)) : 0;
    const siblingBirthYear = siblingPerson.birthDate ? parseInt(siblingPerson.birthDate.slice(0, 4)) : 0;

    if (siblingBirthYear > myBirthYear && myBirthYear > 0) {
      // 对方比我小
      return siblingPerson.gender === 'male' ? 'YOUNGER_BROTHER' : 'YOUNGER_SISTER';
    } else if (siblingBirthYear < myBirthYear && siblingBirthYear > 0) {
      // 对方比我大
      return siblingPerson.gender === 'male' ? 'ELDER_BROTHER' : 'ELDER_SISTER';
    } else {
      // 同年或未知，默认年长
      return siblingPerson.gender === 'male' ? 'ELDER_BROTHER' : 'ELDER_SISTER';
    }
  };

  // 2. 父母的父母 → 祖父母/外祖父母
  const myParents = parentMap.get(currentPersonId) || [];
  for (const parent of myParents) {
    const grandparents = parentMap.get(parent.personId) || [];
    for (const gp of grandparents) {
      let grandparentRole: Role;
      if (parent.role === 'FATHER') {
        grandparentRole = gp.role === 'FATHER' ? 'PATERNAL_GRANDFATHER' : 'PATERNAL_GRANDMOTHER';
      } else if (parent.role === 'MOTHER') {
        grandparentRole = gp.role === 'FATHER' ? 'MATERNAL_GRANDFATHER' : 'MATERNAL_GRANDMOTHER';
      } else {
        continue;
      }

      addRel({
        relationType: 'PARENT_CHILD',
        relationCategory: gp.category,
        fromPersonId: currentPersonId,
        fromRole: 'GRANDCHILD',
        toPersonId: gp.personId,
        toRole: grandparentRole,
        label: getRoleLabel(grandparentRole, gp.category),
        isDerived: true,
        path: [currentPersonId, parent.personId, gp.personId],
      });
    }
  }

  // 3. 父母的兄弟姐妹 → 伯叔姑舅姨
  for (const parent of myParents) {
    const parentSiblings = siblingMap.get(parent.personId) || [];
    for (const uncle of parentSiblings) {
      const unclePerson = persons.find((p) => p.id === uncle.personId);
      if (!unclePerson) continue;

      let uncleRole: Role;
      if (parent.role === 'FATHER') {
        // 父亲的兄弟 → 伯/叔，姐妹 → 姑姑
        uncleRole = unclePerson.gender === 'female' ? 'PATERNAL_AUNT' : 'PATERNAL_UNCLE';
      } else if (parent.role === 'MOTHER') {
        // 母亲的兄弟 → 舅舅，姐妹 → 姨妈
        uncleRole = unclePerson.gender === 'female' ? 'MATERNAL_AUNT' : 'MATERNAL_UNCLE';
      } else {
        continue;
      }

      // 我的角色：父亲的兄弟姐妹 → 我是侄；母亲的兄弟姐妹 → 我是甥
      const myNieceRole: Role = parent.role === 'FATHER' ? 'NIECE' : 'NEPHEW';

      addRel({
        relationType: 'SIBLING',
        relationCategory: uncle.category,
        fromPersonId: currentPersonId,
        fromRole: myNieceRole,
        toPersonId: uncle.personId,
        toRole: uncleRole,
        label: getRoleLabel(uncleRole, uncle.category),
        isDerived: true,
        path: [currentPersonId, parent.personId, uncle.personId],
      });
    }
  }

  // 4. 父母的其他子女 → 兄弟姐妹
  for (const parent of myParents) {
    const siblings = childMap.get(parent.personId) || [];
    for (const sibling of siblings) {
      if (sibling.personId === currentPersonId) continue;

      const siblingRole = determineSiblingRole(sibling.personId);

      addRel({
        relationType: 'SIBLING',
        relationCategory: parent.category,
        fromPersonId: currentPersonId,
        fromRole: 'YOUNGER_BROTHER', // 简化，实际应根据相对年龄
        toPersonId: sibling.personId,
        toRole: siblingRole,
        label: getRoleLabel(siblingRole),
        isDerived: true,
        path: [currentPersonId, parent.personId, sibling.personId],
      });
    }
  }

  // 5. 兄弟姐妹的子女 → 侄（兄弟的子女）/ 甥（姐妹的子女）
  // 收集所有兄弟姐妹（直接 + 推导的），区分兄弟和姐妹
  const mySiblingIds = new Set<string>();
  const directSiblings = siblingMap.get(currentPersonId) || [];
  for (const s of directSiblings) {
    mySiblingIds.add(s.personId);
  }
  // 也包括从父母推导的兄弟姐妹
  for (const parent of myParents) {
    const siblings = childMap.get(parent.personId) || [];
    for (const s of siblings) {
      if (s.personId !== currentPersonId) {
        mySiblingIds.add(s.personId);
      }
    }
  }

  for (const siblingId of mySiblingIds) {
    const siblingPerson = persons.find((p) => p.id === siblingId);
    // 根据兄弟姐妹的性别判断是侄还是甥
    const isBrother = siblingPerson?.gender === 'male';
    const nieceRole: Role = isBrother ? 'NIECE' : 'NEPHEW';
    // 我对侄甥的角色：男性→伯/叔，女性→姑姑
    const currentPerson = persons.find((p) => p.id === currentPersonId);
    const myRole: Role = currentPerson?.gender === 'female' ? 'PATERNAL_AUNT' : 'PATERNAL_UNCLE';

    const siblingChildren = childMap.get(siblingId) || [];
    for (const child of siblingChildren) {
      addRel({
        relationType: 'PARENT_CHILD',
        relationCategory: child.category,
        fromPersonId: currentPersonId,
        fromRole: myRole,
        toPersonId: child.personId,
        toRole: nieceRole,
        label: getRoleLabel(nieceRole, child.category),
        isDerived: true,
        path: [currentPersonId, siblingId, child.personId],
      });
    }
  }

  // 6. 子女的子女 → 孙辈
  const myChildren = childMap.get(currentPersonId) || [];
  for (const child of myChildren) {
    const grandchildren = childMap.get(child.personId) || [];
    for (const gc of grandchildren) {
      addRel({
        relationType: 'PARENT_CHILD',
        relationCategory: gc.category,
        fromPersonId: currentPersonId,
        fromRole: 'FATHER', // 简化
        toPersonId: gc.personId,
        toRole: 'GRANDCHILD',
        label: getRoleLabel('GRANDCHILD', gc.category),
        isDerived: true,
        path: [currentPersonId, child.personId, gc.personId],
      });
    }
  }

  // 7. 兄弟姐妹的兄弟姐妹 → 兄弟姐妹（传递推导）
  // 场景：大舅1和大舅2是兄弟，我母亲和大舅1是兄妹 → 我母亲也应看到大舅2
  // buildRelationGraph 的 SIBLING 传递推导已把这些加入 siblingMap
  // 这里直接添加到结果，依赖 addRel 的 seenPairs 去重（直接关系不会被重复添加）
  {
    const mySiblingsFromMap = siblingMap.get(currentPersonId) || [];

    for (const sibling of mySiblingsFromMap) {
      const siblingRole = determineSiblingRole(sibling.personId);
      addRel({
        relationType: 'SIBLING',
        relationCategory: sibling.category,
        fromPersonId: currentPersonId,
        fromRole: 'YOUNGER_BROTHER', // 简化
        toPersonId: sibling.personId,
        toRole: siblingRole,
        label: getRoleLabel(siblingRole),
        isDerived: true,
        path: [currentPersonId, '传递推导', sibling.personId],
      });
    }
  }

  return result;
}

// ========== 分组 ==========

export type GenerationGroup = 'ancestor' | 'peer' | 'descendant';

export function getGenerationGroup(
  rel: DerivedRelationship,
  currentPersonId: string,
  generations: Map<string, number>,
): GenerationGroup {
  const myGen = generations.get(currentPersonId) || 0;
  const otherGen = generations.get(rel.toPersonId);

  if (otherGen === undefined) {
    // 如果辈分未知，根据角色判断
    const ancestorRoles: Role[] = [
      'FATHER', 'MOTHER',
      'PATERNAL_GRANDFATHER', 'PATERNAL_GRANDMOTHER',
      'MATERNAL_GRANDFATHER', 'MATERNAL_GRANDMOTHER',
      'PATERNAL_UNCLE', 'PATERNAL_AUNT',
      'MATERNAL_UNCLE', 'MATERNAL_AUNT',
    ];
    const descendantRoles: Role[] = ['CHILD', 'GRANDCHILD', 'NIECE', 'NEPHEW'];

    if (ancestorRoles.includes(rel.toRole)) return 'ancestor';
    if (descendantRoles.includes(rel.toRole)) return 'descendant';
    return 'peer';
  }

  if (otherGen < myGen) return 'ancestor';
  if (otherGen > myGen) return 'descendant';
  return 'peer';
}

// 细分组标题
export function getSubGroupTitle(
  rel: DerivedRelationship,
  group: GenerationGroup,
): string {
  if (group === 'ancestor') {
    if (rel.toRole === 'FATHER' || rel.toRole === 'MOTHER') return '父母';
    if (rel.toRole === 'PATERNAL_GRANDFATHER' || rel.toRole === 'PATERNAL_GRANDMOTHER') return '祖父母';
    if (rel.toRole === 'MATERNAL_GRANDFATHER' || rel.toRole === 'MATERNAL_GRANDMOTHER') return '外祖父母';
    if (rel.toRole === 'PATERNAL_UNCLE' || rel.toRole === 'PATERNAL_AUNT') return '伯叔姑';
    if (rel.toRole === 'MATERNAL_UNCLE' || rel.toRole === 'MATERNAL_AUNT') return '舅姨';
    return '长辈';
  }

  if (group === 'peer') {
    if (rel.relationType === 'SPOUSE') return '配偶';
    if (rel.relationType === 'SIBLING') return '兄弟姐妹';
    return '平辈';
  }

  // descendant
  if (rel.toRole === 'CHILD') return '子女';
  if (rel.toRole === 'GRANDCHILD') return '孙辈';
  if (rel.toRole === 'NIECE') return '侄';
  if (rel.toRole === 'NEPHEW') return '甥';
  return '晚辈';
}
