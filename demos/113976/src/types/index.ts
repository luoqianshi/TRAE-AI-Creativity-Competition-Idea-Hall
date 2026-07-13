// 亲络家谱 核心类型定义

// ========== 用户（账号）==========

export interface User {
  id: string;
  phone: string;           // 手机号
  passwordHash: string;    // 密码哈希（开发期用简单哈希，上线前换 bcrypt）
  createdAt: string;
  personId: string | null;  // 关联的本人节点 ID（S2 阶段填充）
}

// 本地存储的当前登录用户（不存密码）
export interface CurrentUser {
  id: string;
  phone: string;
  personId: string | null;
  createdAt: string;
}

export interface RegisterParams {
  phone: string;
  password: string;
}

export interface LoginParams {
  phone: string;
  password: string;
}

// ========== 人员节点 ==========

// 性别
export type Gender = 'male' | 'female' | 'unknown';

// 节点类型
// - registered: 已注册（绑定用户账号）
// - shadow: 影子节点（未注册但有姓名，可被认领）
// - placeholder: 占位节点（姓名留空，只知道存在）
export type NodeType = 'registered' | 'shadow' | 'placeholder';

// 人员节点
export interface Person {
  id: string;
  // 所属用户（registered 节点才有）
  ownerUserId: string | null;

  // 节点类型
  nodeType: NodeType;

  // 基本信息
  displayName: string;     // 显示名（完整姓名）
  surname: string;          // 姓
  givenName: string;        // 名
  gender: Gender;
  birthDate: string | null;  // ISO 日期
  deathDate: string | null;  // ISO 日期（null 表示在世）
  isAlive: boolean;

  // 籍贯与居所
  birthPlace: string | null;
  currentAddress: string | null;

  // 联系方式（registered 节点才有）
  phone: string | null;

  // 头像（本地存储的 data URL 或文件路径）
  avatar: string | null;

  // 简介
  bio: string | null;

  // 元数据
  createdAt: string;
  updatedAt: string;
}

// 创建/更新人员的参数
export interface PersonInput {
  displayName: string;
  surname?: string;
  givenName?: string;
  gender: Gender;
  birthDate?: string | null;
  deathDate?: string | null;
  isAlive?: boolean;
  birthPlace?: string | null;
  currentAddress?: string | null;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
}

// ========== 关系 ==========

// 关系类型
// - PARENT_CHILD: 父母-子女（包括亲骨肉、养、继、义）
// - SPOUSE: 配偶（婚姻关系）
// - SIBLING: 兄弟姐妹（同父或同母）
export type RelationType = 'PARENT_CHILD' | 'SPOUSE' | 'SIBLING';

// 关系类别（用于区分亲生/婚姻/收养/继/义）
export type RelationCategory =
  | 'BLOOD'       // 血亲（亲生）
  | 'MARRIAGE'    // 姻亲（婚姻关系）
  | 'ADOPTION'    // 收养
  | 'STEP'        // 继（继父母/继子女）
  | 'FOSTER'      // 寄养
  | 'SWORN';      // 义（结拜/义父母义子女）

// 角色定义
export type Role =
  // 父母-子女关系中的角色
  | 'FATHER'              // 父亲
  | 'MOTHER'              // 母亲
  | 'CHILD'               // 子女
  | 'PATERNAL_GRANDFATHER' // 祖父
  | 'PATERNAL_GRANDMOTHER' // 祖母
  | 'MATERNAL_GRANDFATHER' // 外祖父
  | 'MATERNAL_GRANDMOTHER' // 外祖母
  | 'GRANDCHILD'          // 孙辈
  // 伯叔姑舅姨（父母的兄弟姐妹）
  | 'PATERNAL_UNCLE'      // 伯/叔（父亲的兄弟）
  | 'PATERNAL_AUNT'       // 姑姑（父亲的姐妹）
  | 'MATERNAL_UNCLE'      // 舅舅（母亲的兄弟）
  | 'MATERNAL_AUNT'       // 姨妈（母亲的姐妹）
  // 侄甥（兄弟姐妹的子女，按性别分）
  | 'NIECE'              // 侄（兄弟的子女）
  | 'NEPHEW'             // 甥（姐妹的子女）
  // 配偶关系中的角色
  | 'HUSBAND'             // 丈夫
  | 'WIFE'                // 妻子
  // 兄弟姐妹关系中的角色
  | 'ELDER_BROTHER'       // 哥哥
  | 'YOUNGER_BROTHER'     // 弟弟
  | 'ELDER_SISTER'        // 姐姐
  | 'YOUNGER_SISTER';     // 妹妹

// 兄弟姐妹血缘类型（仅 SIBLING 关系用）
// - FULL: 同父同母
// - PATERNAL: 同父异母（共享父亲）
// - MATERNAL: 同母异父（共享母亲）
export type SiblingType = 'FULL' | 'PATERNAL' | 'MATERNAL';

// 关系记录
export interface Relationship {
  id: string;
  // 关系类型
  relationType: RelationType;
  // 关系类别
  relationCategory: RelationCategory;

  // 起点人员
  fromPersonId: string;
  fromRole: Role;

  // 终点人员
  toPersonId: string;
  toRole: Role;

  // 兄弟姐妹血缘类型（仅 SIBLING 关系用，其他关系为 null）
  siblingType: SiblingType | null;

  // 关系开始时间（如结婚日期、收养日期）
  startDate: string | null;
  // 关系结束时间（如离婚日期）
  endDate: string | null;

  // 验证状态
  // - UNVERIFIED: 单方面建立，未确认
  // - VERIFIED: 双方已确认（认亲系统建立后）
  // - PENDING: 认亲请求中
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'PENDING';

  // 备注（如"养子"、"继子"等说明）
  note: string | null;

  // 元数据
  createdAt: string;
  updatedAt: string;
}

// 添加亲属的参数
export interface AddRelativeInput {
  // 关系类型
  relationType: RelationType;
  // 关系类别（默认 BLOOD 血亲）
  relationCategory?: RelationCategory;
  // 从当前人员的角色（如"父亲" → fromRole 是 FATHER）
  fromRole: Role;
  // 对方角色（如"父亲" → toRole 是 CHILD）
  toRole: Role;
  // 兄弟姐妹血缘类型（仅 SIBLING 关系用）
  siblingType?: SiblingType | null;
  // 关系开始时间
  startDate?: string | null;
  // 备注
  note?: string | null;

  // 新亲属的人员信息（如果未创建）
  personInput: PersonInput;
}
