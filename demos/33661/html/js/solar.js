/* ============================================================
   节气计算 —— 24 节气表 + 当前节气判定
   数据来源：紫金山天文台近似值（1900-2100）
   ============================================================ */

const SolarTerms = {
  // 节气名 + 每月近似日期（上半月/下半月）
  // 简化版：基于公历日期近似判定，精度 ±1 天
  terms: [
    { name: '小寒', month: 1, day: 6, pentad: ['雁北乡', '鹊始巢', '雉始雊'], poem: '冰雪林中著此身，不同桃李混芳尘', author: '王冕' },
    { name: '大寒', month: 1, day: 20, pentad: ['鸡乳', '征鸟厉疾', '水泽腹坚'], poem: '大寒雪未消，闭户不能出', author: '陆游' },
    { name: '立春', month: 2, day: 4, pentad: ['东风解冻', '蛰虫始振', '鱼陟负冰'], poem: '春风又绿江南岸，明月何时照我还', author: '王安石' },
    { name: '雨水', month: 2, day: 19, pentad: ['獭祭鱼', '候雁北', '草木萌动'], poem: '好雨知时节，当春乃发生', author: '杜甫' },
    { name: '惊蛰', month: 3, day: 6, pentad: ['桃始华', '仓庚鸣', '鹰化为鸠'], poem: '微雨众卉新，一雷惊蛰始', author: '韦应物' },
    { name: '春分', month: 3, day: 21, pentad: ['玄鸟至', '雷乃发声', '始电'], poem: '燕飞犹个个，花落已纷纷', author: '徐铉' },
    { name: '清明', month: 4, day: 5, pentad: ['桐始华', '田鼠化为鴽', '虹始见'], poem: '清明时节雨纷纷，路上行人欲断魂', author: '杜牧' },
    { name: '谷雨', month: 4, day: 20, pentad: ['萍始生', '鸣鸠拂其羽', '戴胜降于桑'], poem: '雨过琴书润，风和翰墨香', author: '佚名' },
    { name: '立夏', month: 5, day: 6, pentad: ['蝼蝈鸣', '蚯蚓出', '王瓜生'], poem: '绿树阴浓夏日长，楼台倒影入池塘', author: '高骈' },
    { name: '小满', month: 5, day: 21, pentad: ['苦菜秀', '靡草死', '麦秋至'], poem: '夜莺啼绿柳，皓月醒长空', author: '欧阳修' },
    { name: '芒种', month: 6, day: 6, pentad: ['螳螂生', '鵙始鸣', '反舌无声'], poem: '时雨及芒种，四野皆插秧', author: '陆游' },
    { name: '夏至', month: 6, day: 21, pentad: ['鹿角解', '蜩始鸣', '半夏生'], poem: '昼晷已云极，宵漏自此长', author: '韦应物' },
    { name: '小暑', month: 7, day: 7, pentad: ['温风至', '蟋蟀居宇', '鹰始鸷'], poem: '荷风送香气，竹露滴清响', author: '孟浩然' },
    { name: '大暑', month: 7, day: 23, pentad: ['腐草为萤', '土润溽暑', '大雨时行'], poem: '赤日满天地，火云成山岳', author: '王维' },
    { name: '立秋', month: 8, day: 8, pentad: ['凉风至', '白露生', '寒蝉鸣'], poem: '落霞与孤鹜齐飞，秋水共长天一色', author: '王勃' },
    { name: '处暑', month: 8, day: 23, pentad: ['鹰乃祭鸟', '天地始肃', '禾乃登'], poem: '离离暑云散，袅袅凉风起', author: '白居易' },
    { name: '白露', month: 9, day: 8, pentad: ['鸿雁来', '玄鸟归', '群鸟养羞'], poem: '蒹葭苍苍，白露为霜', author: '诗经' },
    { name: '秋分', month: 9, day: 23, pentad: ['雷始收声', '蛰虫坯户', '水始涸'], poem: '山明水净夜来霜，数树深红出浅黄', author: '刘禹锡' },
    { name: '寒露', month: 10, day: 8, pentad: ['鸿雁来宾', '雀入大水为蛤', '菊有黄华'], poem: '寒露惊秋晚，朝看菊渐黄', author: '白居易' },
    { name: '霜降', month: 10, day: 23, pentad: ['豺乃祭兽', '草木黄落', '蛰虫咸俯'], poem: '停车坐爱枫林晚，霜叶红于二月花', author: '杜牧' },
    { name: '立冬', month: 11, day: 7, pentad: ['水始冰', '地始冻', '雉入大水为蜃'], poem: '冻笔新诗懒写，寒炉美酒时温', author: '李白' },
    { name: '小雪', month: 11, day: 22, pentad: ['虹藏不见', '天气上升地气下降', '闭塞而成冬'], poem: '绿蚁新醅酒，红泥小火炉', author: '白居易' },
    { name: '大雪', month: 12, day: 7, pentad: ['鹖鴠不鸣', '虎始交', '荔挺出'], poem: '忽如一夜春风来，千树万树梨花开', author: '岑参' },
    { name: '冬至', month: 12, day: 22, pentad: ['蚯蚓结', '麋角解', '水泉动'], poem: '邯郸驿里逢冬至，抱膝灯前影伴身', author: '白居易' }
  ],

  /** 获取指定日期的当前节气 */
  getCurrentTerm(date = new Date()) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    let current = this.terms[this.terms.length - 1]; // 默认冬至
    for (let i = 0; i < this.terms.length; i++) {
      const t = this.terms[i];
      if (m < t.month || (m === t.month && d < t.day)) {
        current = this.terms[i - 1] || this.terms[this.terms.length - 1];
        break;
      }
      current = t;
    }
    return current;
  },

  /** 获取下一节气 */
  getNextTerm(date = new Date()) {
    const cur = this.getCurrentTerm(date);
    const idx = this.terms.findIndex(t => t.name === cur.name);
    return this.terms[(idx + 1) % this.terms.length];
  },

  /** 获取当前候（三候之一） */
  getCurrentPentad(date = new Date()) {
    const cur = this.getCurrentTerm(date);
    const d = date.getDate();
    const day = cur.day;
    const offset = d - day;
    if (offset < 5) return cur.pentad[0];
    if (offset < 10) return cur.pentad[1];
    return cur.pentad[2];
  },

  /** 节气序号（0-23） */
  getTermIndex(name) {
    return this.terms.findIndex(t => t.name === name);
  }
};
