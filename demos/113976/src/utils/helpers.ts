// 工具函数

import type { Person, Gender } from '@/types';

// 生成唯一 ID
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

// 获取当前时间 ISO 字符串
export function now(): string {
  return new Date().toISOString();
}

// 简单哈希函数（开发期使用，上线前换 bcrypt）
export function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `qinluo_${hash}_salt`;
}

// 手机号校验
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

// 密码强度校验
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

// ========== 日期相关 ==========

// 模糊日期格式：
// - "1990" → 1990年
// - "1990-05" → 1990年5月
// - "1990-05-15" → 1990年5月15日
// 内部存储：原样保存字符串
// 显示：根据长度格式化

// 格式化模糊日期为中文显示
export function formatDateChinese(dateStr: string | null): string {
  if (!dateStr) return '';
  const str = dateStr.trim();
  if (!str) return '';

  // 完整日期 1990-05-15
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
  }

  // 年月 1990-05
  if (/^\d{4}-\d{2}$/.test(str)) {
    const [y, m] = str.split('-');
    return `${y}年${parseInt(m)}月`;
  }

  // 仅年份 1990
  if (/^\d{4}$/.test(str)) {
    return `${str}年`;
  }

  // 其他格式尝试解析
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  return str;
}

// 格式化日期为短格式（用于列表显示）
export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return '';
  const str = dateStr.trim();
  if (!str) return '';

  if (/^\d{4}$/.test(str)) return str;
  if (/^\d{4}-\d{2}$/.test(str)) return str;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return str;
}

// 计算年龄（支持模糊日期）
export function getAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const str = birthDate.trim();
  if (!str) return null;

  // 提取年份
  const yearMatch = str.match(/^(\d{4})/);
  if (!yearMatch) return null;

  const birthYear = parseInt(yearMatch[1]);
  const now = new Date();
  let age = now.getFullYear() - birthYear;

  // 如果有月份，按月份精确计算
  const monthMatch = str.match(/^\d{4}-(\d{2})/);
  if (monthMatch) {
    const birthMonth = parseInt(monthMatch[1]);
    const monthDiff = now.getMonth() + 1 - birthMonth;
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < 15)) {
      age--;
    }
  }

  return age < 0 ? 0 : age;
}

// 校验模糊日期格式
export function isValidPartialDate(value: string): boolean {
  if (!value) return true;  // 允许空
  const str = value.trim();
  return /^\d{4}(-\d{2}(-\d{2})?)?$/.test(str);
}

// ========== 人员相关 ==========

// 获取显示名（占位节点显示"待完善"）
export function getDisplayName(person: Person): string {
  if (person.nodeType === 'placeholder' || !person.displayName) {
    return '待完善';
  }
  return person.displayName;
}

// 性别标签
export function getGenderLabel(gender: Gender): string {
  switch (gender) {
    case 'male': return '男';
    case 'female': return '女';
    default: return '未知';
  }
}

// 获取人员的生卒信息（用于列表/卡片显示）
// - 在世：不显示"在世"，只显示年龄（如有出生日期）
// - 已故：显示"出生 - 去世"日期范围，未知用 ?
//   - 有出生和去世：1950年1月1日 - 2020年1月1日
//   - 有出生无去世：1950年1月1日 - ?
//   - 无出生有去世：? - 2020年1月1日
//   - 无出生无去世：已故
export function getLifeSpan(person: Person): string {
  if (person.isAlive) {
    // 在世：只显示年龄（若有出生日期）
    if (person.birthDate) {
      const age = getAge(person.birthDate);
      return age !== null ? `${age}岁` : '';
    }
    return '';
  }

  // 已故
  const birth = person.birthDate ? formatDateChinese(person.birthDate) : null;
  const death = person.deathDate ? formatDateChinese(person.deathDate) : null;

  if (birth && death) {
    return `${birth} - ${death}`;
  }
  if (birth && !death) {
    return `${birth} - ?`;
  }
  if (!birth && death) {
    return `? - ${death}`;
  }
  // 无出生无去世：直接显示"已故"
  return '已故';
}

// 获取人员的简短生卒信息（用于卡片小字显示）
// 规则同 getLifeSpan，但日期用短格式
export function getLifeSpanShort(person: Person): string {
  if (person.isAlive) {
    if (person.birthDate) {
      const age = getAge(person.birthDate);
      return age !== null ? `${age}岁` : '';
    }
    return '';
  }

  const birth = person.birthDate ? formatDateShort(person.birthDate) : null;
  const death = person.deathDate ? formatDateShort(person.deathDate) : null;

  if (birth && death) {
    return `${birth} - ${death}`;
  }
  if (birth && !death) {
    return `${birth} - ?`;
  }
  if (!birth && death) {
    return `? - ${death}`;
  }
  return '已故';
}

// 从姓名拆分姓和名
export function splitName(displayName: string): { surname: string; givenName: string } {
  if (!displayName) return { surname: '', givenName: '' };
  // 中文姓名：第一个字是姓
  // 复姓判断
  const compoundSurnames = ['欧阳', '太史', '端木', '上官', '司马', '东方', '独孤', '南宫', '万俟', '闻人', '夏侯', '诸葛', '尉迟', '公羊', '赫连', '澹台', '皇甫', '宗政', '濮阳', '公冶', '太叔', '申屠', '公孙', '慕容', '仲孙', '钟离', '长孙', '宇文', '司徒', '鲜于', '司空', '闾丘', '子车', '亓官', '司寇', '巫马', '公西', '颛孙', '壤驷', '公良', '漆雕', '乐正', '宰父', '谷梁', '拓跋', '夹谷', '轩辕', '令狐', '段干', '百里', '呼延', '东郭', '南门', '羊舌', '微生', '公户', '公玉', '公仪', '梁丘', '公仲', '公上', '公门', '公山', '公坚', '左丘', '公伯', '西门', '公祖', '第五', '公乘', '贯丘', '公皙', '南荣', '东里', '东宫', '仲长', '子书', '子桑', '即墨', '达奚', '褚师'];
  for (const cs of compoundSurnames) {
    if (displayName.startsWith(cs)) {
      return { surname: cs, givenName: displayName.slice(cs.length) };
    }
  }
  // 单姓
  return { surname: displayName[0] || '', givenName: displayName.slice(1) };
}
