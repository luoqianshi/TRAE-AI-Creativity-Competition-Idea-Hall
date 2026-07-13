import type { ChecklistItem, Ingredient, Medicine } from '../types'

export const ingredients: Ingredient[] = [
  { id: 'tomato', name: '番茄', icon: 'circle', category: '蔬菜', daysLeft: 1, amount: '4 个', status: 'urgent' },
  { id: 'salmon', name: '三文鱼', icon: 'fish', category: '水产', daysLeft: 1, amount: '280 g', status: 'urgent' },
  { id: 'milk', name: '鲜牛奶', icon: 'milk', category: '乳品', daysLeft: 2, amount: '1 盒', status: 'warning' },
  { id: 'spinach', name: '菠菜', icon: 'leaf', category: '蔬菜', daysLeft: 2, amount: '300 g', status: 'warning' },
  { id: 'eggs', name: '鸡蛋', icon: 'egg', category: '蛋类', daysLeft: 6, amount: '8 枚', status: 'fresh' },
  { id: 'mushroom', name: '口蘑', icon: 'sprout', category: '菌菇', daysLeft: 4, amount: '200 g', status: 'fresh' },
  { id: 'chicken', name: '鸡胸肉', icon: 'drumstick', category: '肉类', daysLeft: 5, amount: '2 片', status: 'fresh' },
  { id: 'blueberry', name: '蓝莓', icon: 'cherry', category: '水果', daysLeft: 3, amount: '1 盒', status: 'warning' },
]

export const medicines: Medicine[] = [
  { id: 'vitamin', name: '复合维生素', icon: 'pill', category: '营养补充', stock: 24, dosage: '每日 1 片', status: 'fresh', nextDose: '明早 08:00' },
  { id: 'pressure', name: '降压药', icon: 'heart', category: '处方药', stock: 6, dosage: '每日 1 片', status: 'warning', nextDose: '今晚 20:00' },
  { id: 'allergy', name: '氯雷他定', icon: 'shield', category: '抗过敏', stock: 2, dosage: '按需服用', status: 'urgent', nextDose: '暂无计划' },
  { id: 'cold', name: '感冒颗粒', icon: 'package', category: '常备药', stock: 10, dosage: '每日 2 次', status: 'fresh', nextDose: '今晚 21:00' },
  { id: 'probiotic', name: '益生菌', icon: 'dna', category: '肠胃健康', stock: 14, dosage: '餐后 1 袋', status: 'fresh', nextDose: '午餐后' },
  { id: 'bandage', name: '创可贴', icon: 'bandage', category: '外用护理', stock: 3, dosage: '按需使用', status: 'warning', nextDose: '无需提醒' },
]

export const checklistItems: ChecklistItem[] = [
  { id: 'phone', name: '手机', icon: 'phone', category: '必备', location: '玄关充电台', detail: '玄关柜上层无线充电座，靠近门禁卡托盘。', essential: true, checked: true },
  { id: 'keys', name: '钥匙', icon: 'key', category: '必备', location: '玄关挂钩', detail: '入户门右侧第二个黄铜挂钩。', essential: true, checked: true },
  { id: 'wallet', name: '钱包', icon: 'wallet', category: '必备', location: '玄关抽屉', detail: '玄关柜第一层抽屉左侧收纳格。', essential: true, checked: false },
  { id: 'umbrella', name: '雨伞', icon: 'umbrella', category: '天气', location: '门后伞架', detail: '入户门后黑色长柄伞架，折叠伞在上层。', essential: false, checked: false },
  { id: 'mask', name: '口罩', icon: 'shield', category: '天气', location: '玄关盒', detail: '玄关台面右侧白色抽取盒。', essential: false, checked: false },
  { id: 'laptop', name: '笔记本电脑', icon: 'laptop', category: '工作', location: '书房桌面', detail: '书房升降桌左侧支架，电源已收进电脑包。', essential: true, checked: false },
  { id: 'charger', name: '充电宝', icon: 'battery', category: '数码', location: '电视柜', detail: '电视柜中间抽屉，黑色数码收纳包内。', essential: false, checked: false },
  { id: 'earbuds', name: '耳机', icon: 'headphones', category: '数码', location: '床头柜', detail: '主卧右侧床头柜上，无线充电盘旁。', essential: false, checked: false },
  { id: 'badge', name: '工牌', icon: 'badge', category: '工作', location: '通勤包', detail: '灰色通勤包前侧磁吸口袋。', essential: true, checked: false },
  { id: 'water', name: '水杯', icon: 'cup', category: '日用', location: '厨房吧台', detail: '厨房吧台净水器旁，已装温水。', essential: false, checked: false },
  { id: 'tissue', name: '纸巾', icon: 'box', category: '日用', location: '玄关收纳篮', detail: '玄关下层藤编收纳篮内。', essential: false, checked: false },
  { id: 'medicine', name: '随身药盒', icon: 'pill', category: '健康', location: '餐边柜', detail: '餐边柜右侧抽屉，蓝色便携药盒。', essential: false, checked: false },
]
