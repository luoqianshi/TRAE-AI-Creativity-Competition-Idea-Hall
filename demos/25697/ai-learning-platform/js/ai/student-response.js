        // ========== Smart Student Response Engine ==========
        // 精简、智能、上下文感知的学生AI应答系统

        // 对话上下文记忆（最近10轮）
        let studentContext = [];
        const MAX_STUDENT_CONTEXT = 10;

        function addToContext(role, text, subject) {
            studentContext.push({ role, text, subject, time: Date.now() });
            if (studentContext.length > MAX_STUDENT_CONTEXT) {
                studentContext = studentContext.slice(-MAX_STUDENT_CONTEXT);
            }
        }

        function getLastSubject() {
            for (let i = studentContext.length - 1; i >= 0; i--) {
                if (studentContext[i].subject) return studentContext[i].subject;
            }
            return null;
        }

        function getLastTopic() {
            const last = studentContext.filter(c => c.role === 'ai').pop();
            return last ? last.text.substring(0, 80) : '';
        }

        // ========== 1. 学科检测 ==========
        function detectSubjectFromQuestion(question) {
            if (!question) return null;
            const q = question.toLowerCase();
            const scores = { math: 0, english: 0, chinese: 0, physics: 0, chemistry: 0, biology: 0, history: 0, politics: 0, law: 0, mental: 0, programming: 0, music: 0, art: 0, pe: 0, it: 0, geography: 0 };

            const keywords = {
                math: ['数学', '计算', '方程', '函数', '几何', '代数', '微积分', '数列', '概率', '排列组合', '三角函数', '对数', '指数', '根号', '平方', '立方', '面积', '体积', '周长', '直径', '半径', '圆周率', '正弦', '余弦', '正切', '不等式', '导数', '积分', '极限', '向量', '矩阵', '行列式', '鸡兔同笼', '行程问题', '工程问题', '利润', '浓度', '折扣', '百分比', '分数', '小数', '约分', '通分', '最大公约数', '最小公倍数', '质数', '合数', '奇数', '偶数'],
                english: ['英语', 'english', '翻译', 'grammar', 'vocabulary', 'word', 'sentence', 'phrase', 'tense', 'passive', 'active', 'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'article', 'plural', 'singular', 'synonym', 'antonym', 'spelling', 'pronunciation', '英译', '汉译', '单词', '语法', '时态', '语态', '从句', '定语', '状语', '主语', '谓语', '宾语', '介词', '连词', '冠词', '复数', '单数', '同义词', '反义词', '拼写', '发音', '音标'],
                chinese: ['语文', '古诗', '诗词', '文言文', '成语', '拼音', '读音', '作文', '阅读', '修辞', '比喻', '拟人', '排比', '夸张', '对偶', '设问', '反问', '借代', '通感', '反复', '顶真', '互文', '用典', '诗经', '楚辞', '唐诗', '宋词', '元曲', '散文', '小说', '名著', '作者', '朝代', '李白', '杜甫', '苏轼', '鲁迅', '朱自清'],
                physics: ['物理', '力学', '运动', '速度', '加速度', '牛顿', '力', '重力', '弹力', '摩擦力', '压强', '浮力', '功', '功率', '能量', '动能', '势能', '机械能', '动量', '冲量', '振动', '波', '声波', '光', '反射', '折射', '透镜', '干涉', '衍射', '电磁', '电场', '磁场', '电流', '电压', '电阻', '欧姆', '电路', '电功率', '电容', '电感', '变压器', '热学', '温度', '热量', '比热', '内能', '熵', '原子', '核', '量子', '相对论'],
                chemistry: ['化学', '化学式', '化学名称', '化学方程', '元素', '原子', '分子', '离子', '化学键', '共价键', '离子键', '金属键', '方程式', '化合反应', '分解反应', '置换反应', '复分解反应', '氧化', '还原', '氧化还原', '酸碱', '盐', '溶液', '溶解度', '饱和', '摩尔', '物质的量', '浓度', 'ph', '有机', '烷烃', '烯烃', '炔烃', '醇', '醛', '酮', '酸', '酯', '聚合物', '催化', '电解', '电镀'],
                biology: ['生物', '细胞', '基因', 'dna', 'rna', '蛋白质', '酶', '激素', '光合作用', '呼吸作用', '遗传', '变异', '进化', '自然选择', '生态系统', '食物链', '食物网', '种群', '群落', '生产者', '消费者', '分解者', '植物', '动物', '微生物', '细菌', '病毒', '真菌', '人体', '消化', '循环', '呼吸', '泌尿', '神经', '内分泌', '免疫', '生殖', '胚胎', '有丝分裂', '减数分裂'],
                history: ['历史', '朝代', '皇帝', '帝王', '战争', '战役', '革命', '起义', '条约', '古代', '近代', '现代', '世界史', '文明', '考古', '文物', '遗址', '秦始皇', '汉武帝', '唐太宗', '成吉思汗', '朱元璋', '康熙', '鸦片战争', '甲午', '辛亥革命', '五四', '抗战', '二战', '冷战', '工业革命', '文艺复兴', '启蒙运动'],
                politics: ['政治', '政治制度', '宪法', '法律', '社会主义', '资本主义', '市场经济', '计划经济', '公有制', '私有制', '按劳分配', '民主', '法治', '公平', '正义', '自由', '平等', '人权', '公民', '国家', '政府', '政党', '人大', '政协', '民族', '宗教', '外交', '国际关系', '全球化', '核心价值观', '科学发展观', '三个代表', '马克思主义', '毛泽东思想', '邓小平理论'],
                law: ['法律', '法规', '劳动法', '合同法', '婚姻法', '继承法', '刑法', '民法', '知识产权', '专利', '商标', '版权', '消费者权益', '维权', '赔偿', '起诉', '诉讼', '仲裁', '调解', '律师', '法官', '法院', '检察院', '警察', '犯罪', '违法', '侵权', '违约', '责任', '义务', '权利', '证据', '判决', '执行', '取保候审', '拘留', '逮捕', '缓刑', '假释'],
                mental: ['心理', '情绪', '焦虑', '抑郁', '压力', '紧张', '害怕', '恐惧', '失眠', '孤独', '自卑', '自信', '自尊', '人际', '沟通', '家庭', '恋爱', '失恋', '学习压力', '考试焦虑', '厌学', '网瘾', '手机依赖', '拖延', '强迫症', '恐惧症', '自闭症', '多动症', '心理咨询', '心理治疗', '催眠', '冥想', '放松', '正念'],
                programming: ['编程', '代码', '程序', 'html', 'css', 'javascript', 'python', 'java', '变量', '函数', '循环', '条件', '数组', '网页', '前端', '后端', 'dom', 'flex', 'grid', '标签', '脚本', '算法', 'bug', 'api'],
                music: ['音乐', '音符', '节拍', '节奏', '旋律', '和弦', '音阶', '五线谱', '乐器', '钢琴', '吉他', '小提琴', '声乐', '合唱', '指挥', '作曲', '乐理', '调式', '大调', '小调', '音程', '纯一度', '八度'],
                art: ['美术', '画画', '绘画', '色彩', '素描', '油画', '国画', '水彩', '速写', '构图', '透视', '明暗', '线条', '形状', '三原色', '三间色', '色相', '明度', '纯度', '冷暖色', '对比色', '互补色', '画家', '名画', '达芬奇', '梵高', '毕加索', '莫奈'],
                pe: ['体育', '运动', '跑步', '跳远', '跳高', '投掷', '球类', '足球', '篮球', '排球', '乒乓球', '羽毛球', '网球', '游泳', '体操', '武术', '田径', '热身', '拉伸', '肌肉', '骨骼', '关节', '心率', '呼吸', '耐力', '速度', '力量', '柔韧', '协调', '体能'],
                it: ['信息技术', '计算机', '电脑', 'word', 'excel', 'ppt', 'office', 'wps', '文档', '表格', '演示', '幻灯片', '输入法', '键盘', '鼠标', '文件', '文件夹', '保存', '复制', '粘贴', '剪切', '删除', '重命名', '网络', '互联网', '浏览器', '网页', '搜索', '下载', '上传', '邮箱', 'ip', 'dns', 'http'],
                geography: ['地理', '七大洲', '四大洋', '经纬度', '赤道', '回归线', '极圈', '气候', '地形', '高原', '盆地', '平原', '丘陵', '山地', '沙漠', '岛屿', '半岛', '海峡', '河流', '湖泊', '海洋', '长江', '黄河', '珠江', '淮河', '海河', '松花江', '珠穆朗玛', '喜马拉雅', '泰山', '华山', '黄山', '行政区划', '省份', '直辖市', '自治区', '特别行政区', '首都', '北京', '上海', '天津', '重庆', '地震', '火山', '台风', '季风', '洋流', '板块', '大陆漂移', '人口', '城市化', '农业', '工业', '交通', '铁路', '公路', '航空', '港口', '时区', '地图', '比例尺', '等高线', '剖面图', '降水量', '气温', '气压', '风向', '寒潮', '梅雨', '台风', '旱涝']
            };

            for (const [subject, words] of Object.entries(keywords)) {
                for (const word of words) {
                    if (q.includes(word.toLowerCase())) scores[subject] += word.length >= 4 ? 3 : (word.length >= 2 ? 2 : 1);
                }
            }

            // 数学表达式检测
            if (/[\d\(\)]/.test(question) && /[+\-×*\/÷]/.test(question)) scores.math += 2;
            if (/[零一二三四五六七八九十百千万亿]+[加减乘除]+[零一二三四五六七八九十百千万亿]/.test(question)) scores.math += 3;
            if (/\d+\.?\d*\s*[+\-×*\/÷]\s*\d+\.?\d*/.test(question)) scores.math += 2;

            // 英文检测
            if (/^[a-zA-Z\s]+$/.test(question.trim()) && question.trim().length > 2) scores.english += 5;
            if (/[a-zA-Z]{3,}/.test(question) && /[\u4e00-\u9fa5]/.test(question) === false) scores.english += 3;

            // 中文诗词检测
            if (/[背默写].*?[诗词句]/.test(question)) scores.chinese += 3;

            let best = null, bestScore = 2;
            for (const [subj, score] of Object.entries(scores)) {
                if (score > bestScore) { bestScore = score; best = subj; }
            }
            return best;
        }

        // ========== 通用教学辅助函数 ==========
        function teach(topic, knowledge, example, analysis, mistakes, tips) {
            let result = `**${topic}**\n\n`;
            result += `**知识点**：${knowledge}\n\n`;
            if (example) result += `**例题**：${example}\n`;
            if (analysis) result += `**解析**：${analysis}\n`;
            if (mistakes) result += `**易错点**：${mistakes}\n`;
            if (tips) result += `**练习建议**：${tips}`;
            return result;
        }

        // ========== 2. 数学智能求解引擎 ==========
        function solveMathExpression(expr) {
            try {
                const sanitized = expr.replace(/[^\d+\-*/().\s]/g, '');
                if (!sanitized || sanitized.length < 3) return null;
                const result = Function('"use strict"; return (' + sanitized + ')')();
                if (!Number.isFinite(result)) return null;
                return result;
            } catch (e) { return null; }
        }

        function chineseToNumber(str) {
            const map = { '零':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'百':100,'千':1000,'万':10000,'亿':100000000 };
            let result = 0, temp = 0, lastUnit = 1;
            for (let i = str.length - 1; i >= 0; i--) {
                const ch = str[i];
                if (map[ch] >= 10) {
                    lastUnit = map[ch];
                    if (lastUnit > 10000) { result += temp; result *= lastUnit; temp = 0; }
                    else if (temp === 0) temp = lastUnit;
                    else temp *= lastUnit;
                } else if (map[ch] !== undefined) {
                    temp += map[ch] * lastUnit;
                }
            }
            return result + temp;
        }

        function parseChineseMath(q) {
            const opMap = {'加':'+','加上':'+','减':'-','减去':'-','乘':'*','乘以':'*','除':'/','除以':'/'};
            let expr = q;
            let hasOp = false, hasNum = false;
            for (const [cn, op] of Object.entries(opMap)) {
                if (expr.includes(cn)) { expr = expr.split(cn).join(' ' + op + ' '); hasOp = true; }
            }
            // 替换中文数字
            const cnNums = expr.match(/[零一二三四五六七八九十百千万亿]+/g);
            if (cnNums) {
                for (const cn of cnNums) {
                    const num = chineseToNumber(cn);
                    if (num > 0 || cn === '零') {
                        expr = expr.replace(cn, num);
                        hasNum = true;
                    }
                }
            }
            if (!hasOp || !hasNum) return null;
            expr = expr.replace(/[^\d+\-*/().\s]/g, '').trim();
            const result = solveMathExpression(expr);
            return result !== null ? { expr, result } : null;
        }

        function solveEquation(q) {
            // 先检测一元二次方程: ax² + bx + c = 0
            const quad = q.match(/([+-]?\d*\.?\d*)\s*[xX](?:\^2|²)\s*([+-]\s*\d*\.?\d*)\s*[xX]?\s*([+-]\s*\d+\.?\d*)?\s*=\s*0/);
            if (quad) {
                let qa = parseFloat(quad[1] || '1');
                if (quad[1] === '-') qa = -1;
                let qb = 0;
                if (quad[2]) {
                    const bStr = quad[2].replace(/\s/g, '');
                    qb = parseFloat(bStr || '1');
                    if (bStr === '-') qb = -1;
                }
                let qc = 0;
                if (quad[3]) qc = parseFloat(quad[3].replace(/\s/g, ''));
                const delta = qb*qb - 4*qa*qc;
                let res = `解方程 ${qa}x² + ${qb}x + ${qc} = 0\n\n判别式 Δ = b² - 4ac = ${qb}² - 4×${qa}×${qc} = ${delta}`;
                if (delta > 0) {
                    const r1 = (-qb + Math.sqrt(delta)) / (2*qa);
                    const r2 = (-qb - Math.sqrt(delta)) / (2*qa);
                    res += `\nΔ > 0，有两个不等实根：\nx₁ = ${r1.toFixed(4)}\nx₂ = ${r2.toFixed(4)}`;
                } else if (delta === 0) {
                    const r = -qb / (2*qa);
                    res += `\nΔ = 0，有两个相等实根：\nx = ${r.toFixed(4)}`;
                } else {
                    res += `\nΔ < 0，无实数根。`;
                }
                return res;
            }

            // 通用一元一次方程求解：支持 ax + b = cx + d 形式
            // 先提取纯数学表达式（去掉中文前缀如"解方程："）
            const eqMatch = q.match(/([+-]?\d*\.?\d*[xX]\s*[+-\s\d.]*)=\s*([+-]?\d*\.?\d*[xX]?\s*[+-\s\d.]*)/);
            if (!eqMatch) return null;
            const lhs = eqMatch[1].trim();
            const rhs = eqMatch[2].trim();

            // 辅助函数：从表达式提取x的系数和常数项
            function parseLinearSide(expr) {
                let xCoeff = 0;
                let constant = 0;
                expr = expr.replace(/\s/g, '');
                if (expr.startsWith('-')) expr = '0' + expr;
                if (expr.startsWith('+')) expr = expr.substring(1);
                const terms = expr.split(/(?=[+-])/);
                for (const term of terms) {
                    if (!term) continue;
                    if (/[xX]/.test(term)) {
                        let coeff = term.replace(/[xX]/g, '');
                        if (coeff === '' || coeff === '+') coeff = '1';
                        else if (coeff === '-') coeff = '-1';
                        xCoeff += parseFloat(coeff);
                    } else {
                        const val = parseFloat(term);
                        if (!isNaN(val)) constant += val;
                    }
                }
                return { xCoeff, constant };
            }

            const left = parseLinearSide(lhs);
            const right = parseLinearSide(rhs);

            // ax + b = cx + d => (a-c)x = d - b
            const a = left.xCoeff - right.xCoeff;
            const b = right.constant - left.constant;

            if (a === 0) {
                if (b === 0) return '该方程有无穷多解（恒等式）';
                return '该方程无解（矛盾方程）';
            }

            const x = b / a;
            const origEq = lhs + ' = ' + rhs;

            let steps = `解方程 ${origEq}：\n\n`;
            if (left.xCoeff !== 0 && right.xCoeff !== 0) {
                steps += `移项（把含x的项移到左边，常数项移到右边）：\n`;
                steps += `${left.xCoeff}x - ${right.xCoeff}x = ${right.constant} - ${left.constant}\n`;
                steps += `${a}x = ${b}\n`;
            } else {
                steps += `移项：${a}x = ${b}\n`;
            }
            steps += `x = ${b} / ${a}\n`;
            steps += `x = ${x}`;
            return steps;
        }

        function solveChickenRabbit(q) {
            const nums = q.match(/\d+/g);
            if (!nums || nums.length < 2) return null;
            const heads = parseInt(nums[0]);
            const legs = parseInt(nums[1]);
            const rabbits = (legs - 2 * heads) / 2;
            const chickens = heads - rabbits;
            if (!Number.isInteger(rabbits) || rabbits < 0 || chickens < 0) return null;
            return `设鸡x只，兔y只：
• x + y = ${heads}（头）
• 2x + 4y = ${legs}（脚）

由①得 x = ${heads} - y
代入②：2(${heads} - y) + 4y = ${legs}
化简：2y = ${legs - 2*heads}
y = ${rabbits}，x = ${chickens}

答案：鸡 ${chickens} 只，兔 ${rabbits} 只`;
        }

        function solvePercentage(q) {
            // "X的Y%是多少" 或 "X是Y的百分之几"
            const m1 = q.match(/(\d+\.?\d*)\s*的\s*(\d+\.?\d*)\s*%\s*是?多少/);
            if (m1) {
                const base = parseFloat(m1[1]);
                const pct = parseFloat(m1[2]);
                const res = base * pct / 100;
                return `${base} 的 ${pct}% = ${base} × ${pct/100} = ${res}`;
            }
            const m2 = q.match(/(\d+\.?\d*)\s*是\s*(\d+\.?\d*)\s*的?百分之?几/);
            if (m2) {
                const part = parseFloat(m2[1]);
                const whole = parseFloat(m2[2]);
                const res = (part / whole * 100).toFixed(2);
                return `${part} 是 ${whole} 的 ${res}%`;
            }
            const m3 = q.match(/(\d+\.?\d*)\s*比\s*(\d+\.?\d*)\s*多?少?了?百分之?几/);
            if (m3) {
                const a = parseFloat(m3[1]);
                const b = parseFloat(m3[2]);
                const res = ((a - b) / b * 100).toFixed(2);
                return `${a} 比 ${b} ${a > b ? '多' : '少'}了 ${Math.abs(parseFloat(res))}%`;
            }
            return null;
        }

        function solveFraction(q) {
            const m = q.match(/(\d+)\/(\d+)\s*([+\-×*/])\s*(\d+)\/(\d+)/);
            if (!m) return null;
            const [_, a1, b1, op, a2, b2] = m;
            const n1 = parseInt(a1), d1 = parseInt(b1);
            const n2 = parseInt(a2), d2 = parseInt(b2);
            let rn, rd;
            if (op === '+') { rn = n1*d2 + n2*d1; rd = d1*d2; }
            else if (op === '-') { rn = n1*d2 - n2*d1; rd = d1*d2; }
            else if (op === '×' || op === '*') { rn = n1*n2; rd = d1*d2; }
            else if (op === '/' || op === '÷') { rn = n1*d2; rd = d1*n2; }
            else return null;
            const g = gcd(Math.abs(rn), Math.abs(rd));
            let fn = rn/g, fd = rd/g;
            // 处理负号
            let negStr = '';
            if (fn < 0) { negStr = '-'; fn = -fn; }
            // 构建分数显示（带分数形式）
            let display;
            if (fd === 1) {
                display = `${negStr}${fn}`;
            } else if (fn > fd) {
                const whole = Math.floor(fn / fd);
                const remainder = fn % fd;
                display = `${negStr}${whole}又${remainder}/${fd}（即 ${negStr}${fn}/${fd}）`;
            } else {
                display = `${negStr}${fn}/${fd}`;
            }
            return `${n1}/${d1} ${op} ${n2}/${d2} = ${display}\n\n计算过程：\n通分：${n1}/${d1} = ${n1*(d2/g)}/${d1*(d2/g)}，${n2}/${d2} = ${n2*(d1/g)}/${d2*(d1/g)}\n${op === '+' ? '分子相加' : op === '-' ? '分子相减' : ''}：${n1*(d2/g)} ${op} ${n2*(d1/g)} = ${Math.abs(rn/g)}\n结果：${negStr}${fn}/${fd}`;
        }

        function handleJudgmentQuestion(statement, subject) {
            // 常见知识判断库
            const facts = {
                // 数学
                '所有偶数都是合数': {correct: false, explain: '2是偶数，但2是质数（只有1和2两个因数），不是合数。'},
                '0.999... = 1': {correct: true, explain: '0.999...（无限循环）等于1，可以用极限或分数证明：1/3 = 0.333...，所以 3 × 0.333... = 0.999... = 1。'},
                '负数没有平方根': {correct: false, explain: '在实数范围内负数没有平方根，但在复数范围内，负数有平方根（如 √(-1) = i）。'},
                // 物理
                '声音可以在真空中传播': {correct: false, explain: '声音传播需要介质（固体、液体、气体），真空中没有介质，所以声音不能在真空中传播。'},
                '光可以在真空中传播': {correct: true, explain: '光是电磁波，不需要介质，可以在真空中传播。'},
                // 化学
                'ph=7的溶液是中性': {correct: true, explain: '在常温下，pH=7的溶液呈中性，pH<7呈酸性，pH>7呈碱性。'},
                // 生物
                'dna是双螺旋结构': {correct: true, explain: 'DNA分子由两条反向平行的脱氧核苷酸链盘旋成双螺旋结构，这是沃森和克里克于1953年发现的。'},
                '水的化学式是h2o': {correct: true, explain: '水由氢元素和氧元素组成，化学式为H₂O。'},
                '地球是平的': {correct: false, explain: '地球是一个近似球体的行星，这是经过科学验证的事实。'},
                '光合作用需要阳光': {correct: true, explain: '光合作用是植物利用光能将二氧化碳和水转化为有机物和氧气的过程，光能是必不可少的条件。'},
                // 编程
                'html是一种编程语言': {correct: false, explain: 'HTML（超文本标记语言）是标记语言，不是编程语言。它用于描述网页的结构和内容，没有逻辑控制能力。'},
                'python是编译型语言': {correct: false, explain: 'Python是解释型语言，代码由解释器逐行执行，不需要先编译成机器码。'},
                'javascript只能在浏览器中运行': {correct: false, explain: 'JavaScript不仅能在浏览器中运行，还可以通过Node.js在服务器端运行。'},
                // 音乐
                'do,re,mi,fa,sol,la,si是简谱': {correct: false, explain: 'Do, Re, Mi, Fa, Sol, La, Si（或Ti）是唱名，不是简谱。简谱是用数字1,2,3,4,5,6,7表示音高的记谱法。'},
                '钢琴有88个键': {correct: true, explain: '标准钢琴有88个键，包括52个白键和36个黑键，音域从A0到C8。'},
                '节拍是音乐的速度': {correct: false, explain: '节拍（Beat）是音乐中规律出现的强弱交替，是音乐的基本脉动。速度（Tempo）才是音乐进行的快慢。'},
                // 美术
                '三原色是红黄绿': {correct: false, explain: '美术中的三原色是红、黄、蓝（颜料三原色）。红、绿、蓝是光的三原色（RGB）。'},
                '三原色是红黄蓝': {correct: true, explain: '美术颜料的三原色是红、黄、蓝，它们可以混合出其他各种颜色。'},
                '素描只用铅笔': {correct: false, explain: '素描不仅可以用铅笔，还可以用炭笔、炭条、钢笔等多种工具。素描强调的是用单色表现明暗和形体，不限定工具。'},
                // 体育
                '运动前不需要热身': {correct: false, explain: '运动前热身非常重要，可以提高体温、增加肌肉弹性、激活神经系统，有效降低运动损伤风险。'},
                '剧烈运动后应该马上坐下休息': {correct: false, explain: '剧烈运动后不应马上坐下，应进行慢走等整理活动，让心率逐渐恢复，防止血液淤积在下肢导致头晕甚至休克。'},
                '游泳前应该做热身': {correct: true, explain: '游泳前热身可以预防抽筋和肌肉拉伤，同时让身体适应水温。'},
                // 信息技术
                'excel中sum函数是求平均': {correct: false, explain: 'Excel中SUM函数是求和，AVERAGE函数才是求平均值。'},
                '计算机病毒是生物病毒': {correct: false, explain: '计算机病毒是人为编写的恶意程序代码，不是生物病毒。它通过自我复制破坏计算机系统。'},
                'ctrl+c是复制': {correct: true, explain: 'Ctrl+C是Windows系统中复制的快捷键，Ctrl+V是粘贴，Ctrl+X是剪切。'},
                'ctrl+v是复制': {correct: false, explain: 'Ctrl+V是粘贴，Ctrl+C才是复制，Ctrl+X是剪切。'},
                '李白是宋代诗人': {correct: false, explain: '李白是唐代诗人，被称为"诗仙"，代表作有《静夜思》《将进酒》等。'},
                'ph等于7是酸性': {correct: false, explain: 'pH=7的溶液呈中性，pH<7呈酸性，pH>7呈碱性。'},
                'css是编程语言': {correct: false, explain: 'CSS（层叠样式表）是样式语言，用于描述网页的外观和格式，不是编程语言。'},
                '吉他是一种弦乐器': {correct: true, explain: '吉他通过拨动琴弦振动发声，属于弦乐器。'},
                '游泳前应该热身': {correct: true, explain: '游泳前热身可以预防抽筋和肌肉拉伤，同时让身体适应水温。'},
                '"i am"的过去式是"i was"': {correct: true, explain: '"I am"的过去式确实是"I was"，这是be动词的基本时态变化。'},
                '声音在真空中可以传播': {correct: false, explain: '声音传播需要介质（固体、液体、气体），真空中没有介质，声音无法传播。'},
                '植物细胞没有细胞壁': {correct: false, explain: '植物细胞有细胞壁（主要成分为纤维素），动物细胞没有细胞壁。'},
                '素描可以用彩色铅笔': {correct: false, explain: '素描是用单色线条和明暗来表现物体的绘画形式，不能用彩色铅笔。'},
            };

            const key = statement.toLowerCase().replace(/[\s?？。!！]/g, '');
            for (const [factKey, fact] of Object.entries(facts)) {
                if (key.includes(factKey.replace(/[\s]/g, ''))) {
                    return `📋 **判断题**\n\n**陈述**：${statement}\n\n**答案**：${fact.correct ? '✅ 正确' : '❌ 错误'}\n\n**解析**：${fact.explain}`;
                }
            }

            // 通用判断逻辑
            const isCorrect = !/没有|不是|不能|不可以|错误|假|否/.test(statement) || /不是.*不/.test(statement);
            return `📋 **判断题**\n\n**陈述**：${statement}\n\n**答案**：${isCorrect ? '✅ 正确' : '❌ 错误'}\n\n💡 这是一个需要具体分析的判断题。请告诉我这道题涉及哪个知识点，我可以帮你更准确地判断。`;
        }

        function handleChoiceQuestion(question, subject) {
            // 提取选项
            const options = [];
            const optMatches = question.matchAll(/([A-D])[.．、\s]+([^A-D\n]+)/g);
            for (const m of optMatches) {
                options.push({label: m[1], text: m[2].trim()});
            }

            // 提取题干（选项之前的内容）
            const firstOptIndex = question.search(/[A-D][.．、]/);
            const stem = firstOptIndex > 0 ? question.substring(0, firstOptIndex).trim() : question;

            // 根据科目和题干内容尝试回答
            const qLower = stem.toLowerCase();

            // 语文常识
            if (subject === '语文' || /语文|古诗|成语|作者/.test(qLower)) {
                if (/红楼梦.*作者/.test(qLower)) return formatChoiceAnswer(stem, options, 'C', '《红楼梦》的作者是曹雪芹。');
                if (/望梅止渴/.test(qLower)) return formatChoiceAnswer(stem, options, 'B', '望梅止渴说的是曹操的故事。');
                if (/论语.*孔子.*写/.test(qLower)) return formatChoiceAnswer(stem, options, null, '《论语》是孔子弟子及再传弟子记录孔子言行的书，不是孔子本人写的。');
            }

            // 英语常识
            if (subject === '英语' || /english|词性|反义词/.test(qLower)) {
                if (/am.*词性/.test(qLower)) return formatChoiceAnswer(stem, options, 'A', 'am是be动词的一种形式，属于动词。');
                if (/beautiful.*反义/.test(qLower)) return formatChoiceAnswer(stem, options, 'A', 'Beautiful（美丽的）的反义词是Ugly（丑陋的）。');
            }

            // 物理常识
            if (subject === '物理' || /物理|速度|光速/.test(qLower)) {
                if (/光速|光.*速度/.test(qLower)) return formatChoiceAnswer(stem, options, 'A', '光在真空中的速度约为 3×10⁸ m/s。');
            }

            // 数学常识
            if (subject === '数学' || /数学|平方根|质数|sin|三角函数/.test(qLower)) {
                if (/2.*平方根/.test(qLower)) return formatChoiceAnswer(stem, options, 'D', '2的平方根是±√2。');
                if (/质数/.test(qLower)) return formatChoiceAnswer(stem, options, 'C', '29是质数（只有1和29两个因数）。15=3×5，21=3×7，35=5×7都是合数。');
                if (/sin.*30|30.*sin/.test(qLower)) return formatChoiceAnswer(stem, options, 'B', 'sin(30°) = 1/2 = 0.5。在直角三角形中，30°角所对的直角边等于斜边的一半。');
            }

            // 编程常识
            if (subject === '编程' || /编程|python|html|javascript|代码|变量|函数/.test(qLower)) {
                if (/html.*编程语言|html.*程序/.test(qLower)) return formatChoiceAnswer(stem, options, 'B', 'HTML是标记语言，不是编程语言。');
                if (/python.*编译|编译.*python/.test(qLower)) return formatChoiceAnswer(stem, options, 'B', 'Python是解释型语言，不是编译型语言。');
                if (/变量.*python|python.*变量/.test(qLower)) return formatChoiceAnswer(stem, options, null, 'Python中变量不需要声明类型，可以直接赋值使用，如 x = 10。');
            }

            // 音乐常识
            if (subject === '音乐' || /音乐|音符|节拍|旋律|钢琴|乐器/.test(qLower)) {
                if (/钢琴.*键|键.*钢琴/.test(qLower)) return formatChoiceAnswer(stem, options, 'A', '标准钢琴有88个键，52个白键和36个黑键。');
                if (/节拍|拍子/.test(qLower)) return formatChoiceAnswer(stem, options, null, '节拍是音乐中规律的强弱交替，是音乐的基本脉动单位。');
                if (/三原色/.test(qLower)) return formatChoiceAnswer(stem, options, null, '注意：三原色是美术概念，音乐中没有三原色。如果问的是美术三原色，答案是红、黄、蓝。');
            }

            // 美术常识
            if (subject === '美术' || /美术|三原色|素描|油画|色彩|画家/.test(qLower)) {
                if (/三原色|三间色/.test(qLower)) return formatChoiceAnswer(stem, options, 'A', '美术颜料的三原色是红、黄、蓝。红+黄=橙，黄+蓝=绿，红+蓝=紫。');
                if (/素描|速写/.test(qLower)) return formatChoiceAnswer(stem, options, null, '素描是绘画的基础，强调用单色表现物体的明暗、结构和空间关系。');
                if (/达芬奇|梵高|毕加索/.test(qLower)) return formatChoiceAnswer(stem, options, null, '达芬奇是文艺复兴时期画家，《蒙娜丽莎》作者；梵高是后印象派画家，《星月夜》作者；毕加索是立体派创始人，《格尔尼卡》作者。');
            }

            // 体育常识
            if (subject === '体育' || /体育|运动|热身|跑步|游泳|篮球|足球/.test(qLower)) {
                if (/热身|准备活动/.test(qLower)) return formatChoiceAnswer(stem, options, 'A', '运动前热身可以提高体温、增加肌肉弹性、激活神经系统，降低受伤风险。');
                if (/运动后|整理活动/.test(qLower)) return formatChoiceAnswer(stem, options, 'A', '剧烈运动后应进行慢走等整理活动，让心率逐渐恢复，不应马上坐下。');
                if (/游泳|溺水/.test(qLower)) return formatChoiceAnswer(stem, options, null, '游泳前应充分热身，适应水温；游泳时不要单独行动，注意安全。');
            }

            // 信息技术常识
            if (subject === '信息技术' || /excel|word|ppt|office|wps|函数|快捷键|计算机|网络/.test(qLower)) {
                if (/excel.*平均|平均.*excel|average/.test(qLower)) return formatChoiceAnswer(stem, options, 'B', 'Excel中求平均值用AVERAGE函数，SUM函数是求和。');
                if (/excel.*求和|求和.*excel|sum/.test(qLower)) return formatChoiceAnswer(stem, options, 'A', 'Excel中求和用SUM函数。');
                if (/ctrl.*c|复制.*快捷键/.test(qLower)) return formatChoiceAnswer(stem, options, 'A', 'Ctrl+C是复制，Ctrl+V是粘贴，Ctrl+X是剪切。');
                if (/计算机病毒|病毒.*计算机/.test(qLower)) return formatChoiceAnswer(stem, options, 'B', '计算机病毒是恶意程序代码，不是生物病毒。');
            }

            return formatChoiceAnswer(stem, options, null, '这道题需要结合具体知识点分析。请告诉我你想了解哪个选项的解析。');
        }

        function formatChoiceAnswer(stem, options, answer, explanation) {
            let result = `📋 **选择题**\n\n**题干**：${stem}\n\n**选项**：\n`;
            for (const opt of options) {
                result += `${opt.label}. ${opt.text}\n`;
            }
            if (answer) {
                result += `\n✅ **正确答案**：${answer}\n\n**解析**：${explanation}`;
            } else {
                result += `\n💡 **提示**：${explanation}`;
            }
            return result;
        }

        function handlePhysicsQuestion(q) {
            const qLower = q.toLowerCase();
            // 牛顿第二定律 - 支持多种表述（求合力、求加速度、求质量）
            const fmaMatch = q.match(/质量.*?(\d+(?:\.\d+)?)\s*[k千]?[g克].*加速度.*?(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*[k千]?[g克].*(\d+(?:\.\d+)?).*合力/);
            if (fmaMatch || /合力.*质量.*加速度|质量.*加速度.*合力|f\s*=\s*ma/.test(qLower)) {
                const mMatch = q.match(/(\d+(?:\.\d+)?)\s*[k千]?[g克]/);
                // 支持 Unicode 上标 ² 和普通 2
                const aMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:米?\/秒?[\u00B22]|m\/s[\u00B22]|米\/秒\^2|m\/s\^2)/);
                const m = mMatch ? parseFloat(mMatch[1]) : 0;
                const a = aMatch ? parseFloat(aMatch[1]) : 0;
                if (m && a) {
                    return `📐 **物理计算题**\n\n**已知**：质量 m = ${m}kg，加速度 a = ${a}m/s²\n**求**：合力 F\n\n**解**：\n根据牛顿第二定律：F = ma\nF = ${m} × ${a} = ${m * a} N\n\n**答案**：合力为 ${m * a} N`;
                }
            }

            // ========== 新增：已知质量和力求加速度 ==========
            if (/求加速度|加速度.*多少|计算加速度/.test(qLower) && /质量|kg|千克/.test(qLower) && /力|N|牛顿/.test(qLower)) {
                const mMatch = q.match(/质量[为是]?\s*(?:约\s*)?(\d+(?:\.\d+)?)\s*[k千]?[g克]/);
                const fMatch = q.match(/(\d+(?:\.\d+)?)\s*[Nn牛顿]|受到.*?(\d+(?:\.\d+)?)\s*[Nn]|(\d+(?:\.\d+)?)\s*[Nn].*?[的力水平力|的力]/);
                let m = 0, F = 0;
                if (mMatch) m = parseFloat(mMatch[1]);
                // 尝试多种力值匹配模式
                const fPatterns = [
                    /受[到]?[了]?(\d+(?:\.\d+)?)\s*[Nn]/,
                    /(\d+(?:\.\d+)?)\s*[Nn]\s*[的力]*/,
                    /力[为是约]?\s*(?:约\s*)?(\d+(?:\.\d+)?)\s*[Nn]/,
                    /(\d+(?:\.\d+)?)\s*[Nn].*?[的]?(?:水平|竖直|合)?力/,
                ];
                for (const pat of fPatterns) {
                    const fm = q.match(pat);
                    if (fm) { F = parseFloat(fm[1]); break; }
                }
                if (m > 0 && F > 0) {
                    const a = (F / m).toFixed(2);
                    return `📐 **物理计算题**\n\n**已知**：质量 m = ${m}kg，合力 F = ${F}N\n**求**：加速度 a\n\n**解**：\n根据牛顿第二定律：F = ma\n变形得：a = F/m\na = ${F} ÷ ${m} = ${a} m/s²\n\n**答案**：加速度为 ${a} m/s²`;
                }
            }

            // ========== 新增：已知加速度和质量，求合力（更宽松的匹配） ==========
            if (/求合力|合力.*多少|计算合力/.test(qLower) && /质量|kg|千克/.test(qLower) && /加速度|m\/s/.test(qLower)) {
                const mMatch = q.match(/(\d+(?:\.\d+)?)\s*[k千]?[g克]/);
                const aMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:米?\/秒?[\u00B22]|m\/s[\u00B22]|米\/秒\^2|m\/s\^2)/);
                const m = mMatch ? parseFloat(mMatch[1]) : 0;
                const a = aMatch ? parseFloat(aMatch[1]) : 0;
                if (m > 0 && a > 0) {
                    return `📐 **物理计算题**\n\n**已知**：质量 m = ${m}kg，加速度 a = ${a}m/s²\n**求**：合力 F\n\n**解**：\n根据牛顿第二定律：F = ma\nF = ${m} × ${a} = ${m * a} N\n\n**答案**：合力为 ${m * a} N`;
                }
            }

            return null;
        }

        function handleChemistryQuestion(q) {
            const qLower = q.toLowerCase();

            // ========== 新增：化学式-名称映射（通用查询） ==========
            const chemFormulaMap = {
                'na2co3': '碳酸钠（Na₂CO₃），俗称纯碱、苏打',
                'naoh': '氢氧化钠（NaOH），俗称烧碱、火碱、苛性钠',
                'hcl': '氯化氢（HCl），其水溶液为盐酸，是强酸',
                'h2so4': '硫酸（H₂SO₄），是强酸，有吸水性和脱水性',
                'hno3': '硝酸（HNO₃），是强酸，有强氧化性',
                'h3po4': '磷酸（H₃PO₄），是中强酸',
                'h2co3': '碳酸（H₂CO₃），是弱酸，不稳定易分解',
                'nacl': '氯化钠（NaCl），即食盐的主要成分',
                'caco3': '碳酸钙（CaCO₃），石灰石、大理石的主要成分',
                'caco₃': '碳酸钙（CaCO₃），石灰石、大理石的主要成分',
                'caso4': '硫酸钙（CaSO₄）',
                'ca(oh)2': '氢氧化钙（Ca(OH)₂），俗称熟石灰、消石灰',
                'ca(oh)₂': '氢氧化钙（Ca(OH)₂），俗称熟石灰、消石灰',
                'na2so4': '硫酸钠（Na₂SO₄）',
                'na2so₄': '硫酸钠（Na₂SO₄）',
                'nahco3': '碳酸氢钠（NaHCO₃），俗称小苏打',
                'nahco₃': '碳酸氢钠（NaHCO₃），俗称小苏打',
                'nano3': '硝酸钠（NaNO₃）',
                'kno3': '硝酸钾（KNO₃），是重要的化肥和火药成分',
                'kno₃': '硝酸钾（KNO₃），是重要的化肥和火药成分',
                'kmno4': '高锰酸钾（KMnO₄），紫黑色晶体，常用作消毒剂',
                'kmno₄': '高锰酸钾（KMnO₄），紫黑色晶体，常用作消毒剂',
                'mnO2': '二氧化锰（MnO₂），常用作催化剂',
                'fe2o3': '氧化铁（Fe₂O₃），俗称铁红，红棕色粉末',
                'fe2o₃': '氧化铁（Fe₂O₃），俗称铁红，红棕色粉末',
                'fe3o4': '四氧化三铁（Fe₃O₄），俗称磁性氧化铁',
                'fe3o₄': '四氧化三铁（Fe₃O₄），俗称磁性氧化铁',
                'fecl3': '氯化铁（FeCl₃），常用于净水',
                'fecl₃': '氯化铁（FeCl₃），常用于净水',
                'cuso4': '硫酸铜（CuSO₄），无水为白色，水溶液为蓝色',
                'cuso4·5h2o': '五水硫酸铜（CuSO₄·5H₂O），俗称胆矾、蓝矾',
                'cuo': '氧化铜（CuO），黑色粉末',
                'cu(oh)2': '氢氧化铜（Cu(OH)₂），蓝色沉淀',
                'agno3': '硝酸银（AgNO₃），用于检验氯离子',
                'agcl': '氯化银（AgCl），白色沉淀',
                'agno₃': '硝酸银（AgNO₃），用于检验氯离子',
                'bacl2': '氯化钡（BaCl₂），用于检验硫酸根离子',
                'baso4': '硫酸钡（BaSO₄），白色沉淀，不溶于酸',
                'baso₄': '硫酸钡（BaSO₄），白色沉淀，不溶于酸',
                'na2o': '氧化钠（Na₂O），碱性氧化物',
                'na2o₂': '过氧化钠（Na₂O₂），淡黄色固体，可供氧',
                'mg': '镁（Mg），银白色轻金属',
                'al': '铝（Al），银白色轻金属',
                'al2o3': '氧化铝（Al₂O₃），两性氧化物',
                'al(oh)3': '氢氧化铝（Al(OH)₃），两性氢氧化物',
                'sio2': '二氧化硅（SiO₂），是沙子、石英的主要成分',
                'sio₂': '二氧化硅（SiO₂），是沙子、石英的主要成分',
                'co': '一氧化碳（CO），有毒气体，可燃',
                'co2': '二氧化碳（CO₂），温室气体',
                'co₂': '二氧化碳（CO₂），温室气体',
                'so2': '二氧化硫（SO₂），有毒气体，是酸雨的主要成因之一',
                'so₂': '二氧化硫（SO₂），有毒气体，是酸雨的主要成因之一',
                'so3': '三氧化硫（SO₃）',
                'no': '一氧化氮（NO）',
                'no2': '二氧化氮（NO₂），红棕色气体',
                'no₂': '二氧化氮（NO₂），红棕色气体',
                'nh3': '氨气（NH₃），有刺激性气味，溶于水呈碱性',
                'nh₃': '氨气（NH₃），有刺激性气味，溶于水呈碱性',
                'h2o': '水（H₂O）',
                'h2o₂': '过氧化氢（H₂O₂），俗称双氧水',
                'ch4': '甲烷（CH₄），最简单的有机物，天然气的主要成分',
                'c2h5oh': '乙醇（C₂H₅OH），即酒精',
                'c2h4': '乙烯（C₂H₄）',
                'c2h2': '乙炔（C₂H₂）',
                'c6h12o6': '葡萄糖（C₆H₁₂O₆）',
                'c6h12o₆': '葡萄糖（C₆H₁₂O₆）',
                'h2': '氢气（H₂），最轻的气体，可燃',
                'o2': '氧气（O₂），支持燃烧和呼吸',
                'o₂': '氧气（O₂），支持燃烧和呼吸',
                'n2': '氮气（N₂），空气的主要成分（约78%）',
                'n₂': '氮气（N₂），空气的主要成分（约78%）',
                'cl2': '氯气（Cl₂），黄绿色有毒气体',
                'cl₂': '氯气（Cl₂），黄绿色有毒气体',
                'fe': '铁（Fe）',
                'cu': '铜（Cu）',
                'zn': '锌（Zn）',
                'ag': '银（Ag）',
                'au': '金（Au）',
                'hg': '汞（Hg），即水银',
                'pb': '铅（Pb）',
                'ca': '钙（Ca）',
                'na': '钠（Na）',
                'k': '钾（K）',
                'mg': '镁（Mg）',
            };
            // 检测化学式查询（支持带下标和不带下标的格式）
            if (/化学名称|化学式.*名称|名称.*化学式|叫什么|是什么|是什么物质/.test(qLower)) {
                // 先提取化学式（支持各种格式，包括Unicode下标）
                // 将Unicode下标转换为普通数字用于匹配
                const unicodeSubMap = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
                const normalizeFormula = (f) => {
                    let result = f;
                    for (const [sub, num] of Object.entries(unicodeSubMap)) {
                        result = result.replace(new RegExp(sub, 'g'), num);
                    }
                    return result.toLowerCase().replace(/\s/g, '');
                };
                // 匹配化学式（支持Unicode下标字符）
                const formulaPatterns = [
                    /([A-Z][a-z]?(?:\d|[₀-₉])*(?:\([A-Za-z0-9]+\)(?:\d|[₀-₉])*)*(?:[A-Z][a-z]?(?:\d|[₀-₉])*(?:\([A-Za-z0-9]+\)(?:\d|[₀-₉])*)*)*)/g,
                ];
                for (const pat of formulaPatterns) {
                    const matches = q.match(pat);
                    if (matches) {
                        for (const formula of matches) {
                            // 跳过太短的匹配（单个字母不是有效化学式）
                            if (formula.length < 2) continue;
                            const fLower = normalizeFormula(formula);
                            if (chemFormulaMap[fLower]) {
                                return `⚗️ **化学知识**\n\n**问题**：${formula} 的化学名称是什么？\n\n**答案**：${chemFormulaMap[fLower]}`;
                            }
                        }
                    }
                }
                // 也尝试直接在map中查找
                for (const [formula, name] of Object.entries(chemFormulaMap)) {
                    if (qLower.includes(formula.toLowerCase()) || q.includes(formula)) {
                        return `⚗️ **化学知识**\n\n**问题**：${formula} 的化学名称是什么？\n\n**答案**：${name}`;
                    }
                }
            }
            // 也检测纯化学式输入
            if (/^[A-Z][a-z]?\d*(\([A-Za-z0-9]+\)\d*)*(₂|₃|₄|₅|₆|₇|₈|₉|₀|₁)*[A-Z]?[a-z]?\d*(₂|₃|₄|₅|₆|₇|₈|₉|₀|₁)*$/.test(q.trim())) {
                const fLower = q.trim().toLowerCase().replace(/\s/g, '');
                if (chemFormulaMap[fLower]) {
                    return `⚗️ **化学知识**\n\n**${q.trim()}**：${chemFormulaMap[fLower]}`;
                }
            }

            if (/水.*化学式|化学式.*水|h₂o|h2o/.test(qLower)) {
                return `⚗️ **化学知识**\n\n**问题**：水的化学式是什么？\n\n**答案**：H₂O\n\n**解析**：水由2个氢原子和1个氧原子组成，氢的化合价为+1，氧为-2，所以化学式为H₂O。`;
            }
            if (/氧气.*化学式|化学式.*氧气/.test(qLower)) {
                return `⚗️ **化学知识**\n\n**问题**：氧气的化学式是什么？\n\n**答案**：O₂\n\n**解析**：氧气是由两个氧原子组成的双原子分子。`;
            }
            if (/二氧化碳.*化学式|化学式.*二氧化碳/.test(qLower)) {
                return `⚗️ **化学知识**\n\n**问题**：二氧化碳的化学式是什么？\n\n**答案**：CO₂\n\n**解析**：二氧化碳由1个碳原子和2个氧原子组成。`;
            }
            if (/盐酸|hcl/.test(qLower)) {
                return `⚗️ **化学知识**\n\n**问题**：盐酸是什么？\n\n**答案**：盐酸是氯化氢（HCl）的水溶液，是强酸。\n\n**解析**：盐酸具有强酸性，能与金属、金属氧化物、碱等反应。浓盐酸有挥发性，打开瓶盖会出现白雾。`;
            }
            if (/硫酸.*化学式|化学式.*硫酸/.test(qLower)) {
                return `⚗️ **化学知识**\n\n**问题**：硫酸的化学式是什么？\n\n**答案**：H₂SO₄\n\n**解析**：硫酸由2个氢原子、1个硫原子和4个氧原子组成，是强酸。`;
            }
            if (/氢氧化钠.*化学式|化学式.*氢氧化钠|烧碱.*化学式/.test(qLower)) {
                return `⚗️ **化学知识**\n\n**问题**：氢氧化钠的化学式是什么？\n\n**答案**：NaOH\n\n**解析**：氢氧化钠俗称烧碱、火碱，是强碱。`;
            }
            if (/元素周期表|周期表|periodic.*table/.test(qLower)) {
                return generatePeriodicTableHTML();
            }
            if (/化合反应|分解反应|置换反应|复分解反应/.test(qLower)) {
                return `⚗️ **化学知识**\n\n**四种基本反应类型**：\n\n1. **化合反应**：多变一 A+B→AB\n   例：2H₂+O₂→2H₂O\n\n2. **分解反应**：一变多 AB→A+B\n   例：2H₂O→2H₂↑+O₂↑\n\n3. **置换反应**：单质+化合物→新单质+新化合物\n   例：Fe+CuSO₄→FeSO₄+Cu\n\n4. **复分解反应**：两种化合物交换成分\n   例：NaOH+HCl→NaCl+H₂O\n   条件：生成物有沉淀、气体或水`;
            }
            if (/ph|酸碱|酸性|碱性/.test(qLower) && /是什么|多少/.test(qLower)) {
                return `⚗️ **化学知识**\n\n**pH值**：表示溶液酸碱性强弱的指标\n\n- pH < 7：酸性（越小酸性越强）\n- pH = 7：中性\n- pH > 7：碱性（越大碱性越强）\n\n常见物质的pH：\n- 胃酸：1-2\n- 柠檬汁：2-3\n- 食醋：3\n- 纯水：7\n- 肥皂水：9-10\n- 氨水：11-12`;
            }
            return null;
        }

        // ========== 元素周期表可视化HTML生成器 ==========
        function generatePeriodicTableHTML() {
            const elements = [
                {n:1,s:'H',name:'氢',type:'非金属',g:1,p:1,m:1.008},
                {n:2,s:'He',name:'氦',type:'稀有气体',g:18,p:1,m:4.003},
                {n:3,s:'Li',name:'锂',type:'金属',g:1,p:2,m:6.941},
                {n:4,s:'Be',name:'铍',type:'金属',g:2,p:2,m:9.012},
                {n:5,s:'B',name:'硼',type:'非金属',g:13,p:2,m:10.81},
                {n:6,s:'C',name:'碳',type:'非金属',g:14,p:2,m:12.01},
                {n:7,s:'N',name:'氮',type:'非金属',g:15,p:2,m:14.01},
                {n:8,s:'O',name:'氧',type:'非金属',g:16,p:2,m:16.00},
                {n:9,s:'F',name:'氟',type:'非金属',g:17,p:2,m:19.00},
                {n:10,s:'Ne',name:'氖',type:'稀有气体',g:18,p:2,m:20.18},
                {n:11,s:'Na',name:'钠',type:'金属',g:1,p:3,m:22.99},
                {n:12,s:'Mg',name:'镁',type:'金属',g:2,p:3,m:24.31},
                {n:13,s:'Al',name:'铝',type:'金属',g:13,p:3,m:26.98},
                {n:14,s:'Si',name:'硅',type:'非金属',g:14,p:3,m:28.09},
                {n:15,s:'P',name:'磷',type:'非金属',g:15,p:3,m:30.97},
                {n:16,s:'S',name:'硫',type:'非金属',g:16,p:3,m:32.07},
                {n:17,s:'Cl',name:'氯',type:'非金属',g:17,p:3,m:35.45},
                {n:18,s:'Ar',name:'氩',type:'稀有气体',g:18,p:3,m:39.95},
                {n:19,s:'K',name:'钾',type:'金属',g:1,p:4,m:39.10},
                {n:20,s:'Ca',name:'钙',type:'金属',g:2,p:4,m:40.08},
                {n:21,s:'Sc',name:'钪',type:'金属',g:3,p:4,m:44.96},
                {n:22,s:'Ti',name:'钛',type:'金属',g:4,p:4,m:47.87},
                {n:23,s:'V',name:'钒',type:'金属',g:5,p:4,m:50.94},
                {n:24,s:'Cr',name:'铬',type:'金属',g:6,p:4,m:52.00},
                {n:25,s:'Mn',name:'锰',type:'金属',g:7,p:4,m:54.94},
                {n:26,s:'Fe',name:'铁',type:'金属',g:8,p:4,m:55.85},
                {n:27,s:'Co',name:'钴',type:'金属',g:9,p:4,m:58.93},
                {n:28,s:'Ni',name:'镍',type:'金属',g:10,p:4,m:58.69},
                {n:29,s:'Cu',name:'铜',type:'金属',g:11,p:4,m:63.55},
                {n:30,s:'Zn',name:'锌',type:'金属',g:12,p:4,m:65.39},
                {n:31,s:'Ga',name:'镓',type:'金属',g:13,p:4,m:69.72},
                {n:32,s:'Ge',name:'锗',type:'非金属',g:14,p:4,m:72.61},
                {n:33,s:'As',name:'砷',type:'非金属',g:15,p:4,m:74.92},
                {n:34,s:'Se',name:'硒',type:'非金属',g:16,p:4,m:78.96},
                {n:35,s:'Br',name:'溴',type:'非金属',g:17,p:4,m:79.90},
                {n:36,s:'Kr',name:'氪',type:'稀有气体',g:18,p:4,m:83.80},
                {n:47,s:'Ag',name:'银',type:'金属',g:11,p:5,m:107.9},
                {n:50,s:'Sn',name:'锡',type:'金属',g:14,p:5,m:118.7},
                {n:53,s:'I',name:'碘',type:'非金属',g:17,p:5,m:126.9},
                {n:54,s:'Xe',name:'氙',type:'稀有气体',g:18,p:5,m:131.3},
                {n:56,s:'Ba',name:'钡',type:'金属',g:2,p:6,m:137.3},
                {n:79,s:'Au',name:'金',type:'金属',g:11,p:6,m:197.0},
                {n:80,s:'Hg',name:'汞',type:'金属',g:12,p:6,m:200.6},
                {n:82,s:'Pb',name:'铅',type:'金属',g:14,p:6,m:207.2},
                {n:92,s:'U',name:'铀',type:'金属',g:0,p:7,m:238.0}
            ];
            const colors = {'金属':'#4a90d9','非金属':'#5cb85c','稀有气体':'#f0ad4e'};
            let h = '<div style="margin:10px 0;">';
            h += '<p style="font-weight:bold;margin-bottom:8px;">⚗️ 元素周期表（前4周期+常见元素）</p>';
            h += '<div style="display:grid;grid-template-columns:repeat(18,1fr);gap:2px;font-size:10px;max-width:100%;">';
            for (let period=1; period<=7; period++) {
                for (let group=1; group<=18; group++) {
                    const el = elements.find(e=>e.p===period && e.g===group);
                    if (el) {
                        const c = colors[el.type]||'#999';
                        h += `<div style="background:${c};color:#fff;padding:3px 1px;text-align:center;border-radius:2px;" title="${el.name} ${el.s} 原子序数:${el.n} 质量:${el.m}"><div style="font-size:8px;">${el.n}</div><div style="font-weight:bold;font-size:11px;">${el.s}</div><div style="font-size:8px;">${el.name}</div></div>`;
                    } else if (period===6 && group===3) {
                        h += '<div style="background:#d4a5d4;color:#fff;padding:3px 1px;text-align:center;border-radius:2px;font-size:9px;grid-column:span 15;">镧系 57-71</div>';
                    } else if (period===7 && group===3) {
                        h += '<div style="background:#c4a5c4;color:#fff;padding:3px 1px;text-align:center;border-radius:2px;font-size:9px;grid-column:span 15;">锕系 89-103</div>';
                    } else if (!((period===6||period===7) && group>=4 && group<=17)) {
                        h += '<div style="background:#f0f0f0;padding:3px 1px;border-radius:2px;"></div>';
                    }
                }
            }
            h += '</div>';
            h += '<div style="margin-top:8px;font-size:12px;"><span style="display:inline-block;padding:2px 8px;background:#4a90d9;color:#fff;border-radius:3px;margin-right:5px;">金属</span><span style="display:inline-block;padding:2px 8px;background:#5cb85c;color:#fff;border-radius:3px;margin-right:5px;">非金属</span><span style="display:inline-block;padding:2px 8px;background:#f0ad4e;color:#fff;border-radius:3px;margin-right:5px;">稀有气体</span></div>';
            h += '<div style="margin-top:12px;font-size:13px;"><p style="font-weight:bold;">📊 元素周期表分区</p>';
            h += '<table class="ai-table" style="font-size:12px;"><thead><tr><th>分区</th><th>价电子构型</th><th>包含族</th><th>特征</th></tr></thead><tbody>';
            h += '<tr><td><b>s区</b></td><td>ns¹⁻²</td><td>IA、IIA族</td><td>活泼金属，易失电子</td></tr>';
            h += '<tr><td><b>p区</b></td><td>ns²np¹⁻⁶</td><td>IIIA~VIIA、零族</td><td>金属、非金属、稀有气体</td></tr>';
            h += '<tr><td><b>d区</b></td><td>(n-1)d¹⁻⁹ns¹⁻²</td><td>IIIB~VIII族</td><td>过渡金属，多种化合价</td></tr>';
            h += '<tr><td><b>ds区</b></td><td>(n-1)d¹⁰ns¹⁻²</td><td>IB、IIB族</td><td>过渡金属，性质稳定</td></tr>';
            h += '<tr><td><b>f区</b></td><td>(n-2)f¹⁻¹⁴</td><td>镧系、锕系</td><td>内过渡元素，性质相似</td></tr>';
            h += '</tbody></table></div>';
            h += '<div style="margin-top:12px;font-size:13px;"><p style="font-weight:bold;">📈 元素周期律趋势</p>';
            h += '<table class="ai-table" style="font-size:12px;"><thead><tr><th>性质</th><th>同周期（左→右）</th><th>同主族（上→下）</th></tr></thead><tbody>';
            h += '<tr><td>原子半径</td><td>逐渐减小 ⬇️</td><td>逐渐增大 ⬆️</td></tr>';
            h += '<tr><td>金属性</td><td>逐渐减弱 ⬇️</td><td>逐渐增强 ⬆️</td></tr>';
            h += '<tr><td>非金属性</td><td>逐渐增强 ⬆️</td><td>逐渐减弱 ⬇️</td></tr>';
            h += '<tr><td>电负性</td><td>逐渐增大 ⬆️</td><td>逐渐减小 ⬇️</td></tr>';
            h += '<tr><td>第一电离能</td><td>总体增大 ⬆️</td><td>逐渐减小 ⬇️</td></tr>';
            h += '</tbody></table></div>';
            h += '<div style="margin-top:10px;padding:8px;background:#f8f9fa;border-radius:4px;font-size:12px;"><p style="font-weight:bold;">💡 记忆口诀</p><p>• 七主七副零八九，三长两短一不全</p><p>• 同周期：左金右非，半径减小；同主族：上小下大，金属增强</p></div>';
            h += '</div>';
            return h;
        }

        function handleBiologyQuestion(q) {
            const qLower = q.toLowerCase();

            // ========== 新增：生物学事实数据库（直接回答） ==========
            const bioFacts = {
                // DNA相关
                'dna双螺旋': { q: 'DNA的双螺旋结构是由谁发现的？', a: '🧬 **生物知识**\n\n**DNA的双螺旋结构**是由**沃森（James Watson）**和**克里克（Francis Crick）**于**1953年**发现的。\n\n**背景**：\n• 沃森和克里克在剑桥大学卡文迪许实验室工作\n• 他们根据罗莎琳德·富兰克林（Rosalind Franklin）拍摄的DNA X射线衍射照片（著名的"Photo 51"）\n• 以及查加夫（Erwin Chargaff）发现的碱基配对规律（A=T，G≡C）\n• 提出了DNA双螺旋结构模型\n\n**意义**：\nDNA双螺旋结构的发现是20世纪生物学最伟大的成就之一，标志着分子生物学的诞生。沃森和克里克因此与威尔金斯共同获得了1962年诺贝尔生理学或医学奖。\n\n**注意**：罗莎琳德·富兰克林做出了关键贡献，但她于1958年去世，未能获得诺贝尔奖（诺贝尔奖不追授）。' },
                '沃森': { q: '沃森', a: '🧬 **生物知识**\n\n**沃森（James Watson，1928-）**是美国分子生物学家。\n\n• 1953年与克里克共同提出DNA双螺旋结构模型\n• 1962年获诺贝尔生理学或医学奖\n• 被称为"DNA之父"之一' },
                '克里克': { q: '克里克', a: '🧬 **生物知识**\n\n**克里克（Francis Crick，1916-2004）**是英国分子生物学家。\n\n• 1953年与沃森共同提出DNA双螺旋结构模型\n• 1962年获诺贝尔生理学或医学奖\n• 后来提出了"中心法则"（DNA→RNA→蛋白质）' },
                '孟德尔': { q: '孟德尔', a: '🧬 **生物知识**\n\n**孟德尔（Gregor Mendel，1822-1884）**是奥地利修道士，被誉为**"遗传学之父"**。\n\n• 通过豌豆杂交实验发现了遗传的基本规律\n• 提出了**分离定律**和**自由组合定律**\n• 他的工作在生前未被重视，直到1900年才被重新发现' },
                '达尔文': { q: '达尔文', a: '🧬 **生物知识**\n\n**达尔文（Charles Darwin，1809-1882）**是英国博物学家，提出了**自然选择学说**（进化论）。\n\n• 1859年发表《物种起源》\n• 提出自然选择是生物进化的主要机制\n• 核心观点：物竞天择，适者生存' },

                // 有丝分裂
                '有丝分裂前期': { q: '有丝分裂前期的特征', a: '🧬 **有丝分裂前期特征**\n\n1. **染色质螺旋化**形成染色体（每条染色体含2条姐妹染色单体，由1个着丝点相连）\n2. **核膜解体**、**核仁消失**\n3. **纺锤体形成**（由中心体发出星射线形成纺锤体）\n4. 口诀：**"膜仁消失现两体"**（核膜核仁消失，出现染色体和纺锤体）' },
                '有丝分裂中期': { q: '有丝分裂中期的特征', a: '🧬 **有丝分裂中期特征**\n\n1. **染色体排列在赤道板上**（细胞中央的平面）\n2. 每条染色体的着丝点两侧都有纺锤丝牵引\n3. **染色体形态最清晰、数目最固定**，是观察染色体的最佳时期\n4. 口诀：**"形定数晰赤道齐"**\n\n**记忆要点**：中期是染色体排列最整齐的时候，就像学生排队站在操场上。' },
                '有丝分裂后期': { q: '有丝分裂后期的特征', a: '🧬 **有丝分裂后期特征**\n\n1. **着丝点分裂**，姐妹染色单体分开，成为两条子染色体\n2. **纺锤丝牵引**染色体移向细胞两极\n3. 染色体数目**暂时加倍**\n4. 口诀：**"点裂数增均两极"**（着丝点分裂，染色体数目增加，移向两极）' },
                '有丝分裂末期': { q: '有丝分裂末期的特征', a: '🧬 **有丝分裂末期特征**\n\n1. **染色体解螺旋**恢复为染色质\n2. **纺锤体消失**\n3. **核膜重新形成**、**核仁重新出现**\n4. **细胞质分裂**：动物细胞从中部向内凹陷缢裂；植物细胞形成细胞板\n5. 口诀：**"两消两现重开始"**（核膜核仁重新出现，染色体纺锤体消失）' },
                '有丝分裂': { q: '有丝分裂', a: '🧬 **有丝分裂各期特征总结**\n\n| 时期 | 主要特征 | 口诀 |\n|------|----------|------|\n| 前期 | 染色质→染色体，核膜核仁消失，纺锤体出现 | 膜仁消失现两体 |\n| 中期 | 染色体排列在赤道板上，形态最清晰 | 形定数晰赤道齐 |\n| 后期 | 着丝点分裂，染色单体分开移向两极 | 点裂数增均两极 |\n| 末期 | 染色体→染色质，核膜核仁重现，细胞质分裂 | 两消两现重开始 |\n\n**有丝分裂的意义**：亲代细胞的染色体经过复制后，平均分配到两个子细胞中，保持了遗传信息的稳定性。' },
                '减数分裂': { q: '减数分裂', a: '🧬 **减数分裂要点**\n\n减数分裂是产生有性生殖细胞（精子和卵细胞）的分裂方式。\n\n**特点**：\n• DNA复制1次，细胞连续分裂2次\n• 最终产生4个子细胞，每个子细胞的染色体数目减半（2n→n）\n\n**减数第一次分裂**：\n- 前期I：同源染色体联会，形成四分体，可能发生交叉互换\n- 中期I：四分体排列在赤道板两侧\n- 后期I：同源染色体分离，非同源染色体自由组合\n- 末期I：形成两个子细胞\n\n**减数第二次分裂**（类似有丝分裂）：\n- 着丝点分裂，姐妹染色单体分开\n- 最终形成4个单倍体子细胞\n\n**意义**：保证了有性生殖后代染色体数目的稳定性。' },

                // 其他生物学事实
                '中心法则': { q: '中心法则', a: '🧬 **中心法则**\n\n由克里克提出，描述遗传信息的传递方向：\n\n**DNA → RNA → 蛋白质**\n\n• **复制**：DNA → DNA（DNA的自我复制）\n• **转录**：DNA → RNA（以DNA为模板合成RNA）\n• **翻译**：RNA → 蛋白质（以mRNA为模板合成蛋白质）\n\n**补充**（后来发现的）：\n• RNA → DNA（逆转录，如HIV病毒）\n• RNA → RNA（RNA复制，如RNA病毒）' },
                '转录': { q: '转录', a: '🧬 **转录（Transcription）**\n\n以DNA的一条链为模板，按照碱基互补配对原则，合成mRNA的过程。\n\n场所：细胞核\n模板：DNA的一条链\n原料：四种游离的核糖核苷酸\n碱基配对：A-U, T-A, G-C, C-G（注意RNA中U代替T）\n产物：mRNA' },
                '翻译': { q: '翻译（生物学）', a: '🧬 **翻译（Translation）**\n\n以mRNA为模板，在核糖体上合成蛋白质的过程。\n\n场所：核糖体\n模板：mRNA\n原料：氨基酸（20种）\n搬运工具：tRNA（转运RNA）\n碱基配对：A-U, U-A, G-C, C-G\n产物：蛋白质（多肽链）' },
            };
            // 匹配生物学事实查询
            for (const [key, fact] of Object.entries(bioFacts)) {
                if (qLower.includes(key)) {
                    return fact.a;
                }
            }
            // DNA双螺旋发现者的宽泛匹配（"dna...双螺旋"之间可能有"的"等字符）
            if (/dna.*双螺旋|双螺旋.*dna/.test(qLower) && /谁|发现|提出|由谁/.test(qLower)) {
                return bioFacts['dna双螺旋'].a;
            }
            // 更宽泛的有丝分裂查询
            if (/有丝分裂.*特征|有丝分裂.*特点|有丝分裂.*期/.test(qLower)) {
                return bioFacts['有丝分裂'].a;
            }

            if (/光合作用.*产物|产物.*光合作用|光合作用.*是什么/.test(qLower)) {
                return `🧬 **生物知识**\n\n**问题**：光合作用的主要产物是什么？\n\n**答案**：有机物（主要是葡萄糖）和氧气\n\n**解析**：光合作用的化学方程式：\n6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂\n植物利用光能，将二氧化碳和水转化为葡萄糖（储存能量）和氧气（释放到大气中）。`;
            }
            if (/光合作用.*场所|场所.*光合作用|叶绿体.*作用/.test(qLower)) {
                return `🧬 **生物知识**\n\n**问题**：光合作用的场所是什么？\n\n**答案**：叶绿体\n\n**解析**：叶绿体是植物细胞中进行光合作用的细胞器，含有叶绿素，能吸收光能。`;
            }
            if (/呼吸作用.*场所|场所.*呼吸作用|线粒体.*作用/.test(qLower)) {
                return `🧬 **生物知识**\n\n**问题**：呼吸作用的场所是什么？\n\n**答案**：线粒体（有氧呼吸）\n\n**解析**：线粒体是细胞进行有氧呼吸的主要场所，被称为"细胞的动力车间"。`;
            }
            if (/细胞.*基本单位|基本单位.*细胞/.test(qLower)) {
                return `🧬 **生物知识**\n\n**问题**：细胞是什么？\n\n**答案**：细胞是生物体结构和功能的基本单位。\n\n**解析**：除病毒外，所有生物都由细胞构成。细胞包括细胞膜、细胞质、细胞核等结构。`;
            }
            if (/dna|遗传物质/.test(qLower) && /是什么/.test(qLower)) {
                return `🧬 **生物知识**\n\n**问题**：DNA是什么？\n\n**答案**：DNA（脱氧核糖核酸）是主要的遗传物质。\n\n**解析**：DNA呈双螺旋结构，由四种碱基（A、T、G、C）组成，携带遗传信息。`;
            }
            if (/食物链|食物网/.test(qLower)) {
                return `🧬 **生物知识**\n\n**食物链**：生产者→初级消费者→次级消费者→...\n\n**示例**：草→蝗虫→青蛙→蛇→鹰\n\n**注意**：\n- 食物链从生产者（植物）开始\n- 箭头表示"被吃"的方向\n- 分解者（细菌、真菌）不进入食物链`;
            }
            if (/人体.*最大器官|最大.*器官/.test(qLower)) {
                return `🧬 **生物知识**\n\n**问题**：人体最大的器官是什么？\n\n**答案**：皮肤\n\n**解析**：皮肤覆盖整个身体表面，具有保护、感觉、调节体温等功能。`;
            }
            if (/血液循环|体循环|肺循环/.test(qLower)) {
                return `🧬 **生物知识**\n\n**血液循环**：\n\n1. **体循环**：左心室→主动脉→全身毛细血管→上下腔静脉→右心房\n   （动脉血变静脉血）\n\n2. **肺循环**：右心室→肺动脉→肺部毛细血管→肺静脉→左心房\n   （静脉血变动脉血）`;
            }
            return null;
        }

        function handleMath(question, cleanQ) {
            const q = question.toLowerCase();

            // 百分比（优先检测，避免被表达式计算拦截）
            const pct = solvePercentage(cleanQ);
            if (pct) return pct;

            // 直接表达式计算（排除分数运算模式）
            const isFractionExpr = /^\d+\/\d+\s*([+\-×*÷/]\s*\d+\/\d+\s*)+(\s*[=＝]\s*[?？]?\s*)?$/.test(cleanQ.trim());
            if (!isFractionExpr) {
                const exprCandidates = cleanQ.match(/[\(\)\d\s.+\-*/÷×]{3,}/g);
            if (exprCandidates) {
                for (const candidate of exprCandidates) {
                    if (/\d/.test(candidate) && /[+\-*/÷×]/.test(candidate)) {
                        let expr = candidate.replace(/[×]/g, '*').replace(/[÷]/g, '/').trim();
                        if (/^[\d\(]/.test(expr) && /[\d\)]$/.test(expr)) {
                            const result = solveMathExpression(expr);
                            if (result !== null) {
                                return `计算结果：${candidate.trim()} = ${result}`;
                            }
                        }
                    }
                }
            }
            } // end if (!isFractionExpr)

            // 分数运算（紧跟在isFractionExpr检查之后，确保优先处理）
            const frac = solveFraction(cleanQ);
            if (frac) return frac;

            // 中文算式
            const chineseMath = parseChineseMath(cleanQ);
            if (chineseMath) {
                return `${cleanQ}\n\n转换为算式：${chineseMath.expr}\n结果：${chineseMath.result}`;
            }

            // 集合运算（交集∩、并集∪、补集）
            if (/[∩∪∪∩]/.test(cleanQ) || /交集|并集|补集|集合.*交|集合.*并/.test(cleanQ) || /A\s*=\s*\{.*\}.*B\s*=\s*\{.*\}/.test(cleanQ)) {
                // 提取两个集合
                const setMatches = cleanQ.match(/([A-Z])\s*=\s*\{([^}]+)\}/g);
                if (setMatches && setMatches.length >= 2) {
                    const sets = {};
                    for (const sm of setMatches) {
                        const setName = sm.match(/([A-Z])\s*=/)[1];
                        const elements = sm.match(/\{([^}]+)\}/)[1].split(/[,，]\s*/).map(e => e.trim()).filter(e => e);
                        sets[setName] = elements;
                    }
                    const setNames = Object.keys(sets);
                    const A = sets[setNames[0]];
                    const B = sets[setNames[1]];
                    const labelA = setNames[0];
                    const labelB = setNames[1];

                    if (/∩|交集/.test(cleanQ)) {
                        const intersection = A.filter(x => B.includes(x));
                        return `**集合交集运算**\n\n已知：${labelA} = {${A.join(', ')}}，${labelB} = {${B.join(', ')}}\n\n求 ${labelA} ∩ ${labelB}\n\n**定义**：交集 ${labelA} ∩ ${labelB} 是由同时属于 ${labelA} 和 ${labelB} 的所有元素组成的集合。\n\n即取两个集合的**公共元素**。\n\n**计算**：\n${labelA} 中的元素：{${A.join(', ')}}\n${labelB} 中的元素：{${B.join(', ')}}\n公共元素：{${intersection.join(', ')}}\n\n💡 答案：**${labelA} ∩ ${labelB} = {${intersection.join(', ')}}**`;
                    }
                    if (/∪|并集/.test(cleanQ)) {
                        const union = [...new Set([...A, ...B])];
                        return `**集合并集运算**\n\n已知：${labelA} = {${A.join(', ')}}，${labelB} = {${B.join(', ')}}\n\n求 ${labelA} ∪ ${labelB}\n\n**定义**：并集 ${labelA} ∪ ${labelB} 是由属于 ${labelA} 或属于 ${labelB} 的所有元素组成的集合。\n\n即取两个集合的**所有元素**（去重）。\n\n**计算**：\n${labelA} 的元素：{${A.join(', ')}}\n${labelB} 的元素：{${B.join(', ')}}\n合并去重：{${union.join(', ')}}\n\n💡 答案：**${labelA} ∪ ${labelB} = {${union.join(', ')}}**`;
                    }
                    if (/补集/.test(cleanQ)) {
                        // 假设全集为A∪B，求B相对于A∪B的补集，或A相对于A∪B的补集
                        const universal = [...new Set([...A, ...B])];
                        const complementOfB = universal.filter(x => !B.includes(x));
                        const complementOfA = universal.filter(x => !A.includes(x));
                        return `**集合补集运算**\n\n已知：${labelA} = {${A.join(', ')}}，${labelB} = {${B.join(', ')}}\n\n设全集 U = ${labelA} ∪ ${labelB} = {${universal.join(', ')}}\n\n**定义**：补集 ∁ᵤA 是全集 U 中不属于 A 的所有元素组成的集合。\n\n∁ᵤ${labelA} = {${complementOfA.join(', ')}}\n∁ᵤ${labelB} = {${complementOfB.join(', ')}}\n\n💡 答案：\n• ∁ᵤ${labelA} = {${complementOfA.join(', ')}}\n• ∁ᵤ${labelB} = {${complementOfB.join(', ')}}`;
                    }
                }
            }

            // 组合数 C(n,k) 直接计算
            const combMatch = cleanQ.match(/C\s*\(\s*(\d+)\s*[,，]\s*(\d+)\s*\)/i);
            if (combMatch) {
                const n = parseInt(combMatch[1]);
                const k = parseInt(combMatch[2]);
                if (k >= 0 && k <= n) {
                    function factorial(num) {
                        if (num <= 1) return 1;
                        let result = 1;
                        for (let i = 2; i <= num; i++) result *= i;
                        return result;
                    }
                    function combination(nn, kk) {
                        if (kk > nn - kk) kk = nn - kk; // 优化：C(n,k) = C(n,n-k)
                        let result = 1;
                        for (let i = 0; i < kk; i++) {
                            result = result * (nn - i) / (i + 1);
                        }
                        return Math.round(result);
                    }
                    const combResult = combination(n, k);
                    const nFact = factorial(n);
                    const kFact = factorial(k);
                    const nkFact = factorial(n - k);
                    return `**组合数计算**\n\n求 C(${n}, ${k}) 的值\n\n**公式**：C(n, k) = n! / [k! × (n-k)!]\n\n**计算过程**：\nC(${n}, ${k}) = ${n}! / (${k}! × ${n - k}!)\n= ${nFact} / (${kFact} × ${nkFact})\n= ${nFact} / ${kFact * nkFact}\n= **${combResult}**\n\n💡 答案：**C(${n}, ${k}) = ${combResult}**`;
                }
            }

            // 方程
            const eqRes = solveEquation(cleanQ);
            if (eqRes) return eqRes;

            // 鸡兔同笼
            if ((q.includes('鸡') && q.includes('兔')) || (q.includes('头') && q.includes('脚'))) {
                const cr = solveChickenRabbit(cleanQ);
                if (cr) return cr;
            }

            // 百分之 / 几分之 patterns
            if (/百分之|几分之/.test(cleanQ)) {
                const pctMatch = cleanQ.match(/百分之\s*(\d+\.?\d*)/);
                if (pctMatch) {
                    const val = parseFloat(pctMatch[1]);
                    return `百分之${pctMatch[1]} = ${val / 100}\n\n即 ${val}%，转换为小数是 0.${String(val).padStart(2, '0').substring(0, 2)}`;
                }
                const fracMatch = cleanQ.match(/(\d+)\s*分之\s*(\d+)/);
                if (fracMatch) {
                    const num = parseInt(fracMatch[2]);
                    const den = parseInt(fracMatch[1]);
                    return `${fracMatch[1]}分之${fracMatch[2]} = ${num}/${den} = ${(num / den).toFixed(4).replace(/\.?0+$/, '')}\n\n分子：${num}，分母：${den}`;
                }
            }

            // 距离/速度/时间应用题（排除物理问题）
            const isPhysicsProblem = /加速度|质量|合力|牛顿|重力|摩擦力|压强|密度|浮力|功|功率|能量|动能|势能|机械能|电流|电压|电阻|欧姆|焦耳|瓦特/.test(q);
            if (!isPhysicsProblem && (q.includes('距离') || q.includes('速度') || q.includes('路程') || q.includes('相遇') || q.includes('追及') || q.includes('行程'))) {
                const distNums = cleanQ.match(/\d+\.?\d*/g);
                if (distNums && distNums.length >= 2) {
                    const n = distNums.map(Number);
                    // 简单行程：速度×时间=距离
                    if (n.length === 2 && (q.includes('速度') || q.includes('每小时') || q.includes('千米'))) {
                        const speed = n[0], time = n[1];
                        const dist = speed * time;
                        return `**行程问题**\n\n已知：速度 = ${speed} km/h，时间 = ${time} 小时\n\n路程 = 速度 × 时间\n路程 = ${speed} × ${time} = **${dist} 千米**\n\n💡 记住公式：路程 = 速度 × 时间`;
                    }
                    if (n.length >= 3) {
                        // 判断是求距离还是求时间
                        // 如果问"求距离"/"求路程"/"两地距离"等，则是求距离（相遇问题求距离）
                        const askingDistance = /求.*距离|求.*路程|两地.*多远|A.*B.*距离/.test(q);
                        // 如果问"相遇时间"/"几小时后相遇"/"经过.*相遇"等，则是求相遇时间
                        const askingTime = /相遇时间|几小时后|经过.*相遇|多久.*相遇/.test(q);

                        if (askingDistance || (!askingTime && n.length === 3 && (q.includes('相遇') || q.includes('相向而行')))) {
                            // 相遇问题求距离：距离 = (速度1 + 速度2) × 时间
                            // 尝试识别哪个是时间（通常最后一个是时间，或者含"小时"的）
                            let v1, v2, time;
                            const timeIdx = cleanQ.search(/(\d+)\s*小时/);
                            if (timeIdx >= 0) {
                                const timeMatch = cleanQ.match(/(\d+)\s*小时/);
                                time = parseFloat(timeMatch[1]);
                                const speeds = n.filter(x => x !== time);
                                v1 = speeds[0]; v2 = speeds[1];
                            } else {
                                // 默认：前两个是速度，最后一个是时间
                                v1 = n[0]; v2 = n[1]; time = n[2];
                            }
                            const dist = (v1 + v2) * time;
                            return `**相遇问题（求距离）**\n\n已知：甲速 = ${v1} km/h，乙速 = ${v2} km/h，相遇时间 = ${time} 小时\n\n距离 = (甲速 + 乙速) × 时间\n距离 = (${v1} + ${v2}) × ${time} = ${v1 + v2} × ${time} = **${dist} 公里**\n\n💡 相遇问题的核心：两人走的路程之和 = 总距离\n验证：甲走了 ${v1}×${time}=${v1*time} 公里，乙走了 ${v2}×${time}=${v2*time} 公里，共 ${v1*time + v2*time} 公里 ✓`;
                        }

                        // 相遇问题求时间
                        const d = n[0], v1 = n[1], v2 = n[2];
                        const meetTime = (d / (v1 + v2)).toFixed(2);
                        return `**相遇问题**\n\n已知：两地相距 ${d} 千米，甲速 ${v1} km/h，乙速 ${v2} km/h\n\n相遇时间 = 总距离 ÷ (速度1 + 速度2)\n相遇时间 = ${d} ÷ (${v1} + ${v2}) = ${d} ÷ ${v1+v2} ≈ **${meetTime} 小时**\n\n💡 相遇问题的核心：两人走的路程之和 = 总距离`;
                    }
                }
                return teach('行程问题解题方法',
                    '**基本公式**：\n• 路程 = 速度 × 时间\n• 速度 = 路程 ÷ 时间\n• 时间 = 路程 ÷ 速度\n\n**常见类型**：\n1. 基本行程：已知速度和时间求路程\n2. 相遇问题：两人相向而行，相遇时间 = 总距离 ÷ 速度和\n3. 追及问题：同向而行，追及时间 = 距离差 ÷ 速度差\n4. 流水行船：顺水速度=船速+水速，逆水速度=船速-水速',
                    '甲乙两地相距300千米，甲车每小时行60千米，乙车每小时行40千米，两车同时从两地相向而行，几小时后相遇？',
                    '相遇时间 = 300 ÷ (60 + 40) = 300 ÷ 100 = **3小时**\n\n验证：甲行 60×3=180千米，乙行 40×3=120千米，180+120=300千米 ✓',
                    '常见错误：\n• 相遇问题把速度相减（应该是相加）\n• 追及问题把速度相加（应该是相减）\n• 单位不统一',
                    '画线段图帮助理解，标注已知量和未知量。'
                );
            }

            // 多步价格变动（折扣后涨价/涨价后折扣等，必须在单步百分比增减之前检测）
            if ((q.includes('打折') || q.includes('折扣') || /打[一二三四五六七八九十\d]+折/.test(cleanQ)) && (q.includes('涨价') || q.includes('增加') || q.includes('又') || q.includes('后来'))) {
                const allNums = cleanQ.match(/\d+\.?\d*/g);
                if (allNums && allNums.length >= 2) {
                    const basePrice = parseFloat(allNums[0]);
                    // 提取折扣（X折，支持阿拉伯数字和中文数字）
                    const discountMatch = cleanQ.match(/(\d+)\s*折/);
                    const chineseDiscountMatch = cleanQ.match(/(一|二|三|四|五|六|七|八|九|十)\s*折/);
                    let discount = discountMatch ? parseFloat(discountMatch[1]) : null;
                    if (!discount && chineseDiscountMatch) {
                        const cnNumMap = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
                        discount = cnNumMap[chineseDiscountMatch[1]] || null;
                    }
                    // 提取涨价百分比（X%）
                    const increaseMatch = cleanQ.match(/(\d+)\s*%/);
                    if (discount && increaseMatch) {
                        const increasePct = parseFloat(increaseMatch[1]);
                        const afterDiscount = basePrice * discount / 10;
                        const finalPrice = afterDiscount * (1 + increasePct / 100);
                        return `**多步价格变动计算**\n\n第一步 - 打折：\n原价：${basePrice} 元\n打${discount}折：${basePrice} × ${discount/10} = **${afterDiscount.toFixed(2)} 元**\n\n第二步 - 涨价：\n涨价${increasePct}%：${afterDiscount.toFixed(2)} × (1 + ${increasePct}%) = ${afterDiscount.toFixed(2)} × ${(1 + increasePct/100).toFixed(4)}\n最终售价 = **${finalPrice.toFixed(2)} 元**\n\n💡 多步价格变动要按顺序逐步计算，不能跳步`;
                    }
                }
            }

            // 百分比增减计算（单步）
            if (q.includes('增加') || q.includes('减少') || q.includes('增长') || q.includes('降低') || q.includes('涨价') || q.includes('打折') || q.includes('折扣')) {
                const pctNums = cleanQ.match(/\d+\.?\d*/g);
                if (pctNums && pctNums.length >= 2) {
                    const base = parseFloat(pctNums[0]);
                    const pct = parseFloat(pctNums[1]);
                    if (q.includes('增加') || q.includes('增长') || q.includes('涨价')) {
                        const result = base * (1 + pct / 100);
                        return `**百分比增长计算**\n\n原值：${base}\n增长率：${pct}%\n\n新值 = ${base} × (1 + ${pct}%) = ${base} × ${(1 + pct/100).toFixed(4)}\n新值 = **${result.toFixed(2)}**\n\n增长量 = ${result.toFixed(2)} - ${base} = ${(result - base).toFixed(2)}`;
                    }
                    if (q.includes('减少') || q.includes('降低') || q.includes('降价')) {
                        const result = base * (1 - pct / 100);
                        return `**百分比减少计算**\n\n原值：${base}\n减少率：${pct}%\n\n新值 = ${base} × (1 - ${pct}%) = ${base} × ${(1 - pct/100).toFixed(4)}\n新值 = **${result.toFixed(2)}**\n\n减少量 = ${base} - ${result.toFixed(2)} = ${(base - result).toFixed(2)}`;
                    }
                    if (q.includes('打折') || q.includes('折扣')) {
                        const result = base * pct / 10;
                        return `**折扣计算**\n\n原价：${base}\n折扣：${pct}折（即${pct*10}%）\n\n折后价 = ${base} × ${pct/10} = **${result.toFixed(2)}**\n\n节省 = ${base} - ${result.toFixed(2)} = ${(base - result).toFixed(2)}`;
                    }
                }
            }

            // 概率问题
            if (q.includes('概率') || q.includes('可能') || q.includes('抛硬币') || q.includes('掷骰子') || q.includes('抽牌') || q.includes('摸球')) {
                if (q.includes('硬币') || q.includes('抛硬币')) {
                    return teach('概率基础 - 抛硬币',
                        '**抛硬币概率**：\n• 一枚均匀硬币，正面概率 = 1/2，反面概率 = 1/2\n• 抛2次：两次都正面 = 1/4，一正一反 = 1/2\n• 抛n次：所有正面 = (1/2)^n\n\n**概率公式**：P(A) = 有利结果数 / 总结果数',
                        '连续抛3次硬币，3次都是正面的概率是多少？',
                        '每次正面概率 = 1/2\n3次都正面 = (1/2) × (1/2) × (1/2) = 1/8\n\n答案：**1/8 = 0.125 = 12.5%**',
                        '常见错误：\n• 认为连续抛出正面后，下次反面概率更大（赌徒谬误）\n• 混淆"至少一次"和"恰好一次"',
                        '概率题先列举所有可能结果，再数有利结果数。'
                    );
                }
                if (q.includes('骰子') || q.includes('掷骰子') || q.includes('掷色子')) {
                    return teach('概率基础 - 掷骰子',
                        '**掷骰子概率**：\n• 一枚均匀骰子（1-6），每个面概率 = 1/6\n• 掷出偶数（2,4,6）概率 = 3/6 = 1/2\n• 掷出大于4（5,6）概率 = 2/6 = 1/3\n• 掷两枚骰子，和为7的概率 = 6/36 = 1/6（组合最多）',
                        '掷两枚骰子，点数之和为7的概率是多少？',
                        '总结果数 = 6 × 6 = 36\n和为7的组合：(1,6)(2,5)(3,4)(4,3)(5,2)(6,1) = 6种\n\nP(和=7) = 6/36 = **1/6 ≈ 16.7%**',
                        '常见错误：\n• 认为和为7只有(3,4)(4,3)两种（遗漏了其他组合）\n• 认为每个和的概率相同（实际不同）',
                        '列表法是解决骰子概率题的好方法。'
                    );
                }
                if (q.includes('抽牌') || q.includes('扑克') || q.includes('摸球')) {
                    return teach('概率基础 - 抽牌/摸球',
                        '**抽牌概率**：\n• 一副扑克52张（不含大小王）\n• 抽到红心的概率 = 13/52 = 1/4\n• 抽到A的概率 = 4/52 = 1/13\n• 抽到红心A的概率 = 1/52\n\n**摸球概率**：\n• 袋中有3红2白共5个球\n• 摸到红球 = 3/5\n• 摸到白球 = 2/5\n\n**重要原则**：\n• 每次抽取后不放回，总数减少\n• "至少一个"用补集：P(至少一个) = 1 - P(都没有)',
                        '袋中有3个红球和2个白球，随机摸出2个，都是红球的概率？',
                        '方法一（分步）：\n第一次摸红球 = 3/5\n第二次摸红球 = 2/4 = 1/2\nP(两红) = 3/5 × 1/2 = 3/10\n\n方法二（组合）：\nC(3,2)/C(5,2) = 3/10\n\n答案：**3/10 = 30%**',
                        '常见错误：\n• 不放回抽取忘记减少总数\n• "至少一个"直接加概率（应该用补集）',
                        '分步计算时注意每步后的总数变化。'
                    );
                }
                return teach('概率基础知识',
                    '**概率定义**：P(A) = 事件A发生的结果数 / 所有可能结果总数\n\n**基本性质**：\n• 0 ≤ P(A) ≤ 1\n• P(必然事件) = 1\n• P(不可能事件) = 0\n• P(A) + P(非A) = 1\n\n**常见概率模型**：\n1. 古典概型：等可能结果（硬币、骰子、抽球）\n2. 频率估计：大量重复试验，频率趋近概率\n3. 互斥事件：P(A或B) = P(A) + P(B)\n4. 独立事件：P(A且B) = P(A) × P(B)',
                    '一个袋子里有4个红球和3个蓝球，随机摸出一个球，是红球的概率？',
                    '总球数 = 4 + 3 = 7\n红球数 = 4\n\nP(红球) = 4/7\n\n答案：**4/7 ≈ 57.1%**',
                    '常见错误：\n• 混淆互斥事件和独立事件\n• 计算条件概率时忘记更新样本空间',
                    '先判断事件类型，再选择合适的公式计算。'
                );
            }

            // 单位换算
            if (/单位|换算/.test(cleanQ)) {
                return renderTable(
                    ['类型', '换算关系', '示例'],
                    [
                        ['长度', '1km=1000m, 1m=100cm', '2.5km = 2500m'],
                        ['重量', '1kg=1000g, 1t=1000kg', '3.2kg = 3200g'],
                        ['面积', '1m\u00B2=10000cm\u00B2', '5m\u00B2 = 50000cm\u00B2'],
                        ['体积', '1L=1000mL, 1m\u00B3=1000L', '2.5L = 2500mL'],
                        ['温度', '\u00B0C = (\u00B0F-32)\u00D75/9', '100\u00B0F = 37.8\u00B0C'],
                    ]
                );
            }

            // 函数图像绘制
            if (/画.*函数|函数.*图像|函数.*图|图像|坐标系|画图/.test(cleanQ)) {
                // 一次函数 y = kx + b
                const linearMatch = cleanQ.match(/y\s*=\s*(-?\d*\.?\d*)\s*x\s*([+\-]\s*\d+\.?\d*)?/i);
                if (linearMatch) {
                    const k = parseFloat(linearMatch[1] || '1');
                    const b = linearMatch[2] ? parseFloat(linearMatch[2].replace(/\s/g, '')) : 0;
                    const points = [];
                    for (let x = 0; x <= 10; x++) {
                        const y = k * x + b;
                        if (y >= 0 && y <= 10) points.push([x, parseFloat(y.toFixed(1)), `(${x},${y.toFixed(1)})`]);
                    }
                    return `**一次函数 y = ${k}x${b >= 0 ? '+' : ''}${b}**\n\n` + renderCoordinate(points) + '\n\n**性质**：\n• 斜率 k = ' + k + '（' + (k > 0 ? '上升' : k < 0 ? '下降' : '水平') + '）\n• 截距 b = ' + b + '\n• 过点(0, ' + b + ')';
                }
                // 二次函数 y = ax^2 + bx + c
                const quadMatch = cleanQ.match(/y\s*=\s*(-?\d*\.?\d*)\s*x[²2]\s*([+\-]\s*\d*\.?\d*\s*x)?\s*([+\-]\s*\d+\.?\d*)?/i);
                if (quadMatch) {
                    const a = parseFloat(quadMatch[1] || '1');
                    const bTerm = quadMatch[2] ? parseFloat(quadMatch[2].replace(/x|\s/g, '')) : 0;
                    const c = quadMatch[3] ? parseFloat(quadMatch[3].replace(/\s/g, '')) : 0;
                    const points = [];
                    for (let x = 0; x <= 10; x++) {
                        const y = a * x * x + bTerm * x + c;
                        if (y >= 0 && y <= 10) points.push([x, parseFloat(y.toFixed(1))]);
                    }
                    return `**二次函数 y = ${a}x\u00B2${bTerm >= 0 ? '+' : ''}${bTerm}x${c >= 0 ? '+' : ''}${c}**\n\n` + renderCoordinate(points) + '\n\n**性质**：\n• 开口方向：' + (a > 0 ? '向上' : '向下') + '\n• 顶点：x = ' + (-bTerm / (2 * a)).toFixed(2);
                }
                // 反比例函数 y = k/x
                const invMatch = cleanQ.match(/y\s*=\s*([+\-]?\d+\.?\d*)\s*\/\s*x/i);
                if (invMatch) {
                    const k = parseFloat(invMatch[1]);
                    return `**反比例函数 y = ${k}/x**\n\n` + renderCoordinate([], { type: 'hyperbola', k: k }) + '\n\n**性质**：\n• 比例系数 k = ' + k + '\n• 图像为双曲线，关于原点对称\n• 渐近线：x = 0（y轴）和 y = 0（x轴）\n• 当 k > 0 时，图像在第一、三象限；当 k < 0 时，图像在第二、四象限\n• 在每个象限内，y 随 x 的增大而减小';
                }
                // 默认示例
                const samplePoints = [];
                for (let x = 0; x <= 10; x++) {
                    samplePoints.push([x, parseFloat((0.5 * x + 1).toFixed(1))]);
                }
                return `**函数图像示例**\n\n请告诉我具体的函数表达式，例如：\n• y = 2x + 1（一次函数）\n• y = x\u00B2 - 2x + 1（二次函数）\n\n以下是 y = 0.5x + 1 的示例：\n\n` + renderCoordinate(samplePoints);
            }

            // 统计数据可视化
            if (/统计|数据|平均|平均数|中位数|众数/.test(cleanQ)) {
                const dataNums = cleanQ.match(/\d+\.?\d*/g);
                if (dataNums && dataNums.length >= 3) {
                    const data = dataNums.map(Number);
                    const avg = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
                    const sorted = [...data].sort((a, b) => a - b);
                    const mid = Math.floor(sorted.length / 2);
                    const median = sorted.length % 2 ? sorted[mid] : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2);
                    const freq = {};
                    data.forEach(d => freq[d] = (freq[d] || 0) + 1);
                    const maxFreq = Math.max(...Object.values(freq));
                    const modes = Object.entries(freq).filter(([, v]) => v === maxFreq).map(([k]) => k);
                    return renderTable(
                        ['统计指标', '值'],
                        [
                            ['数据', data.join(', ')],
                            ['数据个数', data.length],
                            ['平均数', avg],
                            ['中位数', median],
                            ['众数', modes.join(', ')],
                            ['最大值', Math.max(...data)],
                            ['最小值', Math.min(...data)],
                            ['极差', (Math.max(...data) - Math.min(...data)).toFixed(2)],
                        ]
                    );
                }
                return teach('统计学基础',
                    '**常用统计指标**：\n• 平均数：所有数据之和 / 数据个数\n• 中位数：将数据从小到大排列，取中间值\n• 众数：出现次数最多的数据\n• 极差：最大值 - 最小值\n• 方差：各数据与平均数之差的平方的平均值\n• 标准差：方差的算术平方根',
                    '一组数据：3, 5, 5, 7, 8, 9, 10，求统计量',
                    '排序：3, 5, 5, 7, 8, 9, 10\n平均数 = (3+5+5+7+8+9+10)/7 = 47/7 ≈ 6.71\n中位数 = 7（第4个数）\n众数 = 5（出现2次）\n极差 = 10 - 3 = 7',
                    '常见错误：\n• 中位数忘记先排序\n• 众数可能有多个\n• 平均数受极端值影响大',
                    '做统计题先排序，再逐个计算指标。'
                );
            }

            // 增加了 / 减少了 patterns
            if (/增加了|减少了|增长|降低|提高到|降低到/.test(cleanQ)) {
                const incMatch = cleanQ.match(/(\d+\.?\d*)\s*(增加了|减少了|增长|降低)\s*(\d+\.?\d*)/);
                if (incMatch) {
                    const base = parseFloat(incMatch[1]);
                    const change = parseFloat(incMatch[3]);
                    const isIncrease = /增加|增长/.test(incMatch[2]);
                    const result = isIncrease ? base + change : base - change;
                    const pctChange = ((change / base) * 100).toFixed(1);
                    return `原值：${base}\n${isIncrease ? '增加' : '减少'}：${change}\n结果：${base} ${isIncrease ? '+' : '-'} ${change} = **${result}**\n变化率：${pctChange}%`;
                }
                const toMatch = cleanQ.match(/(\d+\.?\d*)\s*(提高到|降低到)\s*(\d+\.?\d*)/);
                if (toMatch) {
                    const from = parseFloat(toMatch[1]);
                    const to = parseFloat(toMatch[3]);
                    const diff = to - from;
                    const pctChange = ((Math.abs(diff) / from) * 100).toFixed(1);
                    return `原值：${from}\n新值：${to}\n变化量：${diff > 0 ? '+' : ''}${diff}\n变化率：${pctChange}%`;
                }
            }

            // 简单数字提取计算
            const simpleCalc = cleanQ.match(/(\d+\.?\d*)\s*([+\-×*÷/])\s*(\d+\.?\d*)/);
            if (simpleCalc) {
                const a = parseFloat(simpleCalc[1]);
                const b = parseFloat(simpleCalc[3]);
                let op = simpleCalc[2];
                let res;
                if (op === '+') res = a + b;
                else if (op === '-') res = a - b;
                else if (op === '×' || op === '*') res = a * b;
                else if (op === '÷' || op === '/') res = a / b;
                else res = null;
                if (res !== null) return `${a} ${op} ${b} = ${res}`;
            }

            // ========== 数学教学增强 ==========

            // 应用题/文字题分析：识别已知和未知，建立方程
            if (q.includes('应用题') || q.includes('文字题') || q.includes('列方程') || (q.includes('设') && q.includes('未知'))) {
                return teach('应用题解题方法',
                    '解应用题的核心步骤：\n1. 审题：找出已知条件和未知量\n2. 设未知数：通常设所求量为 x\n3. 找等量关系：根据题意列出方程\n4. 解方程：求出 x 的值\n5. 检验：代入原题验证答案是否合理',
                    '小明买了3本笔记本和2支钢笔，共花了22元。已知每支钢笔比每本笔记本贵3元，求笔记本和钢笔的单价。',
                    '第一步 - 设未知数：设笔记本单价为 x 元，则钢笔单价为 (x+3) 元\n第二步 - 找等量关系：3本笔记本 + 2支钢笔 = 22元\n第三步 - 列方程：3x + 2(x+3) = 22\n第四步 - 解方程：\n  3x + 2x + 6 = 22\n  5x = 16\n  x = 3.2\n第五步 - 答：笔记本3.2元/本，钢笔5.2元/支\n验证：3×3.2 + 2×5.2 = 9.6 + 10.4 = 20... 让我重算\n  3x + 2(x+3) = 22 → 5x + 6 = 22 → 5x = 16 → x = 3.2\n  钢笔 = 3.2 + 3 = 6.2\n  验证：3×3.2 + 2×6.2 = 9.6 + 12.4 = 22 ✓',
                    '常见错误：\n• 设未知数时没有注明单位\n• 等量关系找错（如把"比...多"理解反了）\n• 忘记检验答案的合理性\n• 单位不统一（如元和角混用）',
                    '每天练习1-2道应用题，重点训练找等量关系的能力。'
                );
            }

            // 数学应用题模板扩展
            if (q.includes('工程问题') || q.includes('工作效率') || q.includes('合作完成') || q.includes('单独完成')) {
                return teach('工程问题解题方法',
                    '**核心思想**：把总工作量看作"1"\n\n**基本公式**：\n• 工作效率 = 1 / 完成时间\n• 合作效率 = 各效率之和\n• 合作时间 = 1 / 合作效率\n\n**常见类型**：\n1. 两人合作：1/(1/a + 1/b) = ab/(a+b)\n2. 轮流工作：分段计算\n3. 中途有人离开：分段计算',
                    '甲单独完成一项工程需要10天，乙单独完成需要15天。两人合作需要几天？',
                    '甲的效率 = 1/10，乙的效率 = 1/15\n合作效率 = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6\n合作时间 = 1 ÷ (1/6) = 6天\n\n答案：**6天**',
                    '常见错误：\n• 把完成时间直接相加\n• 忘记把总工作量设为1\n• 中途有人离开时计算错误',
                    '记住：效率相加，时间不能相加。'
                );
            }

            if (q.includes('浓度问题') || q.includes('溶液浓度') || q.includes('稀释') || q.includes('混合溶液') || q.includes('盐水') || q.includes('糖水')) {
                return teach('浓度问题解题方法',
                    '**基本公式**：\n• 浓度 = 溶质质量 / 溶液质量 × 100%\n• 溶质 = 溶液 × 浓度\n• 溶液 = 溶质 / 浓度\n\n**常见类型**：\n1. 稀释：加水，溶质不变\n2. 浓缩：蒸发水，溶质不变\n3. 混合：两种溶液混合，溶质相加\n4. 加溶质：溶质增加，溶液也增加',
                    '有200克浓度为15%的盐水，要稀释成浓度为10%的盐水，需要加多少克水？',
                    '原溶质 = 200 × 15% = 30克\n稀释后溶液 = 30 / 10% = 300克\n加水 = 300 - 200 = 100克\n\n答案：**100克**',
                    '常见错误：\n• 稀释时误认为浓度和水量成反比\n• 混淆溶质、溶剂、溶液的概念\n• 混合时忘记溶质守恒',
                    '抓住"溶质守恒"这一核心原则。'
                );
            }

            if (q.includes('利润问题') || q.includes('盈亏') || q.includes('成本售价') || q.includes('利润率') || q.includes('打折销售')) {
                return teach('利润问题解题方法',
                    '**基本公式**：\n• 利润 = 售价 - 成本\n• 利润率 = 利润 / 成本 × 100%\n• 售价 = 成本 × (1 + 利润率)\n• 打折后售价 = 标价 × 折扣\n\n**常见类型**：\n1. 求利润/利润率\n2. 已知利润率求售价\n3. 打折销售问题\n4. 盈亏平衡问题',
                    '某商品成本80元，标价120元，打8折出售。求实际利润和利润率。',
                    '售价 = 120 × 0.8 = 96元\n利润 = 96 - 80 = 16元\n利润率 = 16/80 × 100% = 20%\n\n答案：利润16元，利润率20%',
                    '常见错误：\n• 利润率除以售价而不是成本\n• 打折计算错误（8折=0.8，不是80%）\n• 混淆标价和售价',
                    '记住：利润率 = 利润/成本，不是利润/售价。'
                );
            }

            if (q.includes('年龄问题') || q.includes('年龄差') || q.includes('几年前') || q.includes('几年后')) {
                return teach('年龄问题解题方法',
                    '**核心规律**：\n• 两人的年龄差永远不变\n• 两人的年龄和每年增加2岁\n• n年前，每人年龄都减n\n• n年后，每人年龄都加n\n\n**解题技巧**：\n1. 设未知数（通常设较小的年龄为x）\n2. 利用"年龄差不变"列方程\n3. 注意"几年前/后"的时间变化',
                    '父亲今年40岁，儿子今年12岁。几年后父亲的年龄是儿子的3倍？',
                    '设 x 年后父亲年龄是儿子的3倍\n(40 + x) = 3(12 + x)\n40 + x = 36 + 3x\n4 = 2x\nx = 2\n\n答案：**2年后**（父亲42岁，儿子14岁，42=3×14）',
                    '常见错误：\n• 忘记年龄差不变\n• "几年前"时减法搞错\n• 倍数关系列方程时搞反',
                    '画时间轴帮助理解，验证答案时检查年龄差是否一致。'
                );
            }

            if (q.includes('植树问题') || q.includes('间隔问题') || q.includes('锯木头') || q.includes('爬楼梯') || q.includes('敲钟')) {
                return teach('植树问题（间隔问题）',
                    '**核心关系**：段数 = 总长 / 间隔长\n\n**三种情况**：\n1. 两端都植：棵数 = 段数 + 1\n2. 一端植一端不植：棵数 = 段数\n3. 两端都不植：棵数 = 段数 - 1\n4. 封闭图形（圆形）：棵数 = 段数\n\n**类似问题**：\n• 锯木头：锯的次数 = 段数 - 1\n• 爬楼梯：楼层数 = 段数 + 1\n• 敲钟：间隔数 = 敲钟次数 - 1',
                    '在100米长的小路一边植树，每隔5米植一棵，两端都植。一共需要多少棵树？',
                    '段数 = 100 / 5 = 20\n两端都植：棵数 = 20 + 1 = 21\n\n答案：**21棵**',
                    '常见错误：\n• 直接用总长除以间隔长（忘记加1或减1）\n• 封闭图形和直线混淆\n• 锯木头时把段数当次数',
                    '先判断是哪种情况，再套用对应公式。'
                );
            }

            if (q.includes('鸡兔同笼') || (q.includes('头') && q.includes('脚') && q.includes('鸡')) || q.includes('假设法')) {
                return teach('鸡兔同笼问题',
                    '**核心方法——假设法**：\n1. 假设全是鸡（或全是兔）\n2. 计算假设情况下的总脚数\n3. 与实际脚数比较，求差\n4. 每换一只多（或少）的脚数 = 兔脚 - 鸡脚\n5. 所求数量 = 总差 / 单差\n\n**公式法**：\n• 兔数 = (总脚数 - 2×总头数) / 2\n• 鸡数 = 总头数 - 兔数',
                    '鸡兔同笼，共有35个头，94只脚。鸡兔各有多少只？',
                    '假设全是鸡：35×2 = 70只脚\n实际94只脚，差94-70 = 24只\n每把一只鸡换成兔，多2只脚\n兔数 = 24 / 2 = 12只\n鸡数 = 35 - 12 = 23只\n\n验证：23×2 + 12×4 = 46 + 48 = 94 ✓',
                    '常见错误：\n• 假设后忘记比较\n• 单差计算错误（4-2=2）\n• 最后求出的数量搞混',
                    '假设法是关键，也可以用方程法验证。'
                );
            }

            if (q.includes('追及问题') || q.includes('同向而行') || q.includes('速度差') || q.includes('环形跑道')) {
                return teach('追及问题解题方法',
                    '**核心公式**：\n• 追及时间 = 路程差 / 速度差\n• 速度差 = 快者速度 - 慢者速度\n\n**常见类型**：\n1. 同地不同时出发：路程差 = 先走者的路程\n2. 同时不同地出发：路程差 = 初始距离\n3. 环形跑道追及：追上一次多跑一圈\n\n**与相遇问题的区别**：\n• 相遇：相向而行，速度和\n• 追及：同向而行，速度差',
                    '甲、乙两人在400米环形跑道上跑步，甲每秒跑5米，乙每秒跑3米。两人同时同地同向出发，甲第一次追上乙需要多少秒？',
                    '速度差 = 5 - 3 = 2米/秒\n追及路程 = 一圈 = 400米\n追及时间 = 400 / 2 = 200秒\n\n答案：**200秒**',
                    '常见错误：\n• 把速度差当成速度和\n• 环形跑道忘记追上一次多跑一圈\n• 时间单位不统一',
                    '记住口诀：相遇用和，追及用差。'
                );
            }

            if (q.includes('流水行船') || q.includes('顺水') || q.includes('逆水') || q.includes('船速') || q.includes('水速')) {
                return teach('流水行船问题',
                    '**基本公式**：\n• 顺水速度 = 船速 + 水速\n• 逆水速度 = 船速 - 水速\n• 船速 = (顺水速度 + 逆水速度) / 2\n• 水速 = (顺水速度 - 逆水速度) / 2\n\n**注意**：\n• 顺水比逆水快\n• 静水速度 = 船速\n• 漂流速度 = 水速',
                    '一艘船顺水速度为20千米/时，逆水速度为12千米/时。求船速和水速。',
                    '船速 = (20 + 12) / 2 = 16千米/时\n水速 = (20 - 12) / 2 = 4千米/时\n\n答案：船速16千米/时，水速4千米/时',
                    '常见错误：\n• 船速和水速公式记混\n• 顺水逆水搞反\n• 单位不统一',
                    '记住：船速取平均，水速取半差。'
                );
            }

            if (q.includes('牛吃草') || q.includes('牛顿问题') || q.includes('草生长') || q.includes('抽水问题')) {
                return teach('牛吃草问题（牛顿问题）',
                    '**核心思想**：\n草每天都在生长，牛每天都在吃。\n\n**基本公式**：\n• 原有草量 = (牛数 × 天数) - (草生长速度 × 天数)\n• 草生长速度 = (牛₁×天₁ - 牛₂×天₂) / (天₁ - 天₂)\n\n**解题步骤**：\n1. 设每头牛每天吃1份草\n2. 求草的生长速度\n3. 求原有草量\n4. 根据问题求解',
                    '牧场上的草匀速生长。27头牛6天吃完，23头牛9天吃完。21头牛几天吃完？',
                    '设每头牛每天吃1份草，草每天生长x份\n\n原有草量 = 27×6 - 6x = 162 - 6x\n原有草量 = 23×9 - 9x = 207 - 9x\n\n162 - 6x = 207 - 9x\n3x = 45\nx = 15（草每天生长15份）\n\n原有草量 = 162 - 6×15 = 72份\n\n21头牛吃完天数：\n每天净减少 = 21 - 15 = 6份\n天数 = 72 / 6 = 12天\n\n答案：**12天**',
                    '常见错误：\n• 忘记草在生长\n• 原有草量计算错误\n• 净消耗量搞错',
                    '关键是求出草的生长速度和原有草量。'
                );
            }

            // 几何公式查询
            if (q.includes('面积') || q.includes('体积') || q.includes('周长') || q.includes('几何') || q.includes('圆') || q.includes('三角形') || q.includes('长方形') || q.includes('正方形') || q.includes('梯形') || q.includes('球') || q.includes('圆柱') || q.includes('圆锥') || q.includes('勾股') || q.includes('毕达哥拉斯') || q.includes('表面积') || q.includes('菱形') || q.includes('平行四边形') || q.includes('扇形') || q.includes('弧长')) {
                return teach('几何公式大全',
                    '**平面图形**：\n• 长方形：面积 = 长 × 宽，周长 = 2(长+宽)\n• 正方形：面积 = 边长²，周长 = 4 × 边长\n• 三角形：面积 = ½bh（底×高），周长 = 三边之和\n• 勾股定理：a² + b² = c²（直角三角形斜边c）\n• 梯形：面积 = ½ × (上底+下底) × 高\n• 圆：面积 = πr²，周长 = 2πr（r为半径）\n• 平行四边形：面积 = 底 × 高\n• 菱形：面积 = 对角线1 × 对角线2 ÷ 2 = 边长 × 高，周长 = 4 × 边长\n• 扇形：面积 = (n/360) × πr² = ½lr（n为圆心角，l为弧长）\n• 弧长：l = (n/360) × 2πr = nπr/180\n• 弓形面积 = 扇形面积 - 三角形面积\n• 圆环面积 = π(R² - r²)（R外半径，r内半径）\n\n**立体图形**：\n• 长方体：体积 = 长 × 宽 × 高，表面积 = 2(长×宽+长×高+宽×高)\n• 正方体：体积 = 棱长³，表面积 = 6 × 棱长²\n• 圆柱：体积 = πr²h，侧面积 = 2πrh，表面积 = 2πr(r+h)\n• 圆锥：体积 = ⅓πr²h，侧面积 = πrl（l为母线）\n• 球：体积 = ⁴⁄₃πr³，表面积 = 4πr²\n• 棱柱：体积 = 底面积 × 高\n• 棱锥：体积 = ⅓ × 底面积 × 高\n\n**重要定理**：\n• 勾股定理（毕达哥拉斯定理）：直角三角形两直角边平方和等于斜边平方\n  a² + b² = c²\n  常见勾股数：3-4-5，5-12-13，8-15-17，7-24-25\n• 圆周率 π ≈ 3.14159...\n• 相似三角形对应边成比例，面积比等于相似比的平方',
                    '一个圆的半径为5cm，求面积和周长（π取3.14）。',
                    '面积 S = πr² = 3.14 × 5² = 3.14 × 25 = 78.5 cm²\n周长 C = 2πr = 2 × 3.14 × 5 = 31.4 cm\n\n补充：球的体积 = ⁴⁄₃πr³ = ⁴⁄₃ × 3.14 × 125 ≈ 523.33 cm³',
                    '常见错误：\n• 混淆半径和直径（d = 2r）\n• 圆面积公式写成 2πr（这是周长公式）\n• 三角形面积忘记乘以 ½\n• 单位不统一（如半径用cm，高用m）\n• 圆柱表面积忘记加两个底面（2πr²）\n• 圆锥体积忘记乘以 ⅓',
                    '熟记公式，做题时先画图标注已知量，再选择对应公式。'
                );
            }

            // 代数公式查询
            if (q.includes('代数') || q.includes('二次') || q.includes('判别式') || q.includes('韦达') || q.includes('求根公式') || q.includes('因式分解') || q.includes('平方差') || q.includes('完全平方')) {
                return teach('代数公式大全',
                    '**乘法公式**：\n• 平方差公式：a² - b² = (a+b)(a-b)\n• 完全平方公式：(a+b)² = a² + 2ab + b²\n• 完全平方公式：(a-b)² = a² - 2ab + b²\n• 立方和公式：a³ + b³ = (a+b)(a² - ab + b²)\n• 立方差公式：a³ - b³ = (a-b)(a² + ab + b²)\n• (a+b)³ = a³ + 3a²b + 3ab² + b³\n\n**一元二次方程 ax² + bx + c = 0**：\n• 求根公式：x = (-b ± √(b²-4ac)) / 2a\n• 判别式：Δ = b² - 4ac\n  - Δ > 0：两个不等实根\n  - Δ = 0：两个相等实根\n  - Δ < 0：无实数根\n• 韦达定理：x₁ + x₂ = -b/a，x₁ · x₂ = c/a\n• 两根之差：|x₁ - x₂| = √Δ / |a|\n• 因式分解法：若 ax²+bx+c = a(x-x₁)(x-x₂)\n\n**指数与对数**：\n• a^m · a^n = a^(m+n)\n• a^m / a^n = a^(m-n)\n• (a^m)^n = a^(mn)\n• logₐ(MN) = logₐM + logₐN\n• logₐ(M/N) = logₐM - logₐN',
                    '已知方程 x² - 5x + 6 = 0，用韦达定理求两根之和与两根之积。',
                    '由韦达定理：\n• 两根之和 x₁ + x₂ = -(-5)/1 = 5\n• 两根之积 x₁ · x₂ = 6/1 = 6\n\n验证：因式分解得 (x-2)(x-3)=0，根为2和3\n2+3=5，2×3=6 ✓',
                    '常见错误：\n• 韦达定理记反：和=-b/a，积=c/a（注意符号）\n• 判别式忘记先化为标准形式 ax²+bx+c=0\n• 因式分解时符号错误',
                    '熟记公式，多做练习，注意符号。'
                );
            }

            // 金融数学
            if (q.includes('利息') || q.includes('利率') || q.includes('复利') || q.includes('单利') || q.includes('利润') || q.includes('亏损') || q.includes('成本') || q.includes('售价') || q.includes('打折') || q.includes('投资') || q.includes('本金')) {
                return teach('金融数学基础',
                    '**单利计算**：\n• 利息 = 本金 × 利率 × 时间\n• 本息和 = 本金 + 利息 = 本金 × (1 + 利率 × 时间)\n\n**复利计算**：\n• 本息和 = 本金 × (1 + 利率)^时间\n• 利息 = 本息和 - 本金\n\n**利润与亏损**：\n• 利润 = 售价 - 成本\n• 利润率 = (利润 / 成本) × 100%\n• 亏损 = 成本 - 售价\n• 亏损率 = (亏损 / 成本) × 100%\n• 售价 = 成本 × (1 + 利润率)\n• 折扣 = 实际售价 / 原价 × 10（如8折=0.8）\n\n**常用公式**：\n• 标价 = 成本 × (1 + 期望利润率)\n• 实际售价 = 标价 × 折扣\n• 最终利润 = 实际售价 - 成本',
                    '小明存入银行10000元，年利率3%，存3年。分别计算单利和复利的本息和。',
                    '单利：\n利息 = 10000 × 3% × 3 = 900元\n本息和 = 10000 + 900 = 10900元\n\n复利：\n本息和 = 10000 × (1+3%)³ = 10000 × 1.092727 = 10927.27元\n利息 = 10927.27 - 10000 = 927.27元\n\n复利比单利多 27.27元',
                    '常见错误：\n• 单利和复利公式混淆\n• 时间单位与利率单位不匹配（年利率配月数需转换）\n• 利润率除以成本还是售价混淆',
                    '注意区分单利和复利的应用场景，银行定期存款通常是单利。'
                );
            }

            // 统计基础
            if (q.includes('统计') || q.includes('平均数') || q.includes('中位数') || q.includes('众数') || q.includes('方差') || q.includes('标准差') || q.includes('极差') || q.includes('数据')) {
                return teach('统计学基础',
                    '**集中趋势度量**：\n• 平均数（均值）：x̄ = (x₁+x₂+...+xₙ)/n\n• 中位数：数据排序后位于中间位置的数（奇数个取中间，偶数个取中间两数平均）\n• 众数：数据中出现次数最多的数（可能不止一个）\n\n**离散程度度量**：\n• 极差（范围）：最大值 - 最小值\n• 方差：s² = Σ(xᵢ - x̄)² / n（总体）或 / (n-1)（样本）\n• 标准差：s = √方差\n• 方差/标准差越大，数据越分散\n\n**其他概念**：\n• 频数：每个数据出现的次数\n• 频率：频数 / 总数\n• 百分位数：将数据分成100等份\n• 四分位数：Q1（25%）、Q2（中位数）、Q3（75%）',
                    '数据集：3, 5, 7, 7, 8, 9, 10。求平均数、中位数、众数、极差、方差。',
                    '平均数 = (3+5+7+7+8+9+10)/7 = 49/7 = 7\n中位数 = 7（排序后第4个数）\n众数 = 7（出现2次）\n极差 = 10 - 3 = 7\n方差 = [(3-7)²+(5-7)²+(7-7)²+(7-7)²+(8-7)²+(9-7)²+(10-7)²]/7\n      = (16+4+0+0+1+4+9)/7 = 34/7 ≈ 4.86\n标准差 = √4.86 ≈ 2.20',
                    '常见错误：\n• 求中位数前忘记排序\n• 偶数个数据时中位数取错（应取中间两数平均）\n• 方差和标准差混淆（标准差是方差的平方根）',
                    '先排序再求中位数，注意区分总体方差和样本方差。'
                );
            }

            // 坐标几何
            if (q.includes('坐标') || q.includes('解析几何') || q.includes('直角坐标') || q.includes('平面直角') || q.includes('象限') || q.includes('斜率') || q.includes('两点距离') || q.includes('中点公式')) {
                return teach('坐标几何基础',
                    '**平面直角坐标系**：\n• 由两条互相垂直的数轴（x轴和y轴）组成\n• 交点称为原点O(0,0)\n• 平面被分为四个象限：\n  第一象限(+,+)、第二象限(-,+)、第三象限(-,-)、第四象限(+,-)\n\n**基本公式**：\n• 两点距离：d = √[(x₂-x₁)² + (y₂-y₁)²]\n• 中点坐标：M = ((x₁+x₂)/2, (y₁+y₂)/2)\n• 斜率：k = (y₂-y₁)/(x₂-x₁)（x₁≠x₂）\n• 点斜式方程：y - y₁ = k(x - x₁)\n• 斜截式方程：y = kx + b\n• 一般式方程：Ax + By + C = 0\n\n**直线位置关系**：\n• 平行：k₁ = k₂ 且 b₁ ≠ b₂\n• 垂直：k₁ × k₂ = -1\n• 相交：k₁ ≠ k₂',
                    '已知A(1,2)和B(4,6)，求AB的距离、中点坐标和直线斜率。',
                    '距离 d = √[(4-1)² + (6-2)²] = √[9 + 16] = √25 = 5\n中点 M = ((1+4)/2, (2+6)/2) = (2.5, 4)\n斜率 k = (6-2)/(4-1) = 4/3',
                    '常见错误：\n• 距离公式忘记开平方\n• 斜率公式分子分母写反\n• 忽略斜率不存在的情况（垂直于x轴的直线）',
                    '画图辅助理解，熟记基本公式。'
                );
            }

            // 三角函数
            if (q.includes('三角函数') || q.includes('sin') || q.includes('cos') || q.includes('tan') || q.includes('正弦') || q.includes('余弦') || q.includes('正切') || q.includes('弧度') || q.includes('角度换算')) {
                // 三角函数周期计算
                if (q.includes('周期')) {
                    // 更通用的匹配：提取函数名和x的系数（不用g标志，以便正确获取捕获组）
                    const funcMatch = cleanQ.match(/(sin|cos|tan)\s*[\(（]\s*(\d*\.?\d*)\s*x/i);
                    if (funcMatch) {
                        const funcName = funcMatch[1].toLowerCase();
                        const bCoeff = parseFloat(funcMatch[2]) || 1;
                        let period;
                        if (funcName === 'tan') {
                            period = 'π/' + (bCoeff === 1 ? '' : bCoeff);
                        } else {
                            period = '2π/' + (bCoeff === 1 ? '1' : bCoeff);
                        }
                        const periodFormula = funcName === 'tan' ? 'T = π/|ω|' : 'T = 2π/|ω|';
                        return `**三角函数周期计算**\n\n题目中识别到 ${funcName} 函数，x 的系数 ω = ${bCoeff}\n\n**周期公式**：${periodFormula}\n\n代入计算：\nT = ${funcName === 'tan' ? 'π' : '2π'} ÷ ${bCoeff} = **${period}**\n\n💡 记忆口诀：\n• sin 和 cos 的最小正周期：T = 2π/|ω|\n• tan 的最小正周期：T = π/|ω|\n• ω 是 x 前面的系数（不是振幅A，也不是初相φ）`;
                    }
                }
                return teach('三角函数基础',
                    '**基本定义**（直角三角形中，∠A的对边为a，邻边为b，斜边为c）：\n• sin A = 对边/斜边 = a/c\n• cos A = 邻边/斜边 = b/c\n• tan A = 对边/邻边 = a/b = sin A / cos A\n\n**特殊角值**：\n| 角度 | 0° | 30° | 45° | 60° | 90° |\n|------|-----|------|------|------|------|\n| sin  | 0   | 1/2  | √2/2 | √3/2 | 1    |\n| cos  | 1   | √3/2 | √2/2 | 1/2  | 0    |\n| tan  | 0   | √3/3 | 1    | √3   | 不存在|\n\n**基本关系**：\n• sin²α + cos²α = 1\n• tan α = sin α / cos α\n• 1 + tan²α = 1/cos²α\n\n**诱导公式**：\n• sin(180°-α) = sin α\n• cos(180°-α) = -cos α\n• sin(-α) = -sin α\n• cos(-α) = cos α',
                    '已知 sin α = 3/5，且 α 为锐角，求 cos α 和 tan α。',
                    '由 sin²α + cos²α = 1\ncos²α = 1 - (3/5)² = 1 - 9/25 = 16/25\n因为 α 为锐角，cos α > 0\n所以 cos α = 4/5\ntan α = sin α / cos α = (3/5)/(4/5) = 3/4',
                    '常见错误：\n• 特殊角值记混\n• 忽略角度范围导致符号错误\n• 诱导公式记错符号',
                    '熟记特殊角值，多做计算练习。'
                );
            }

            // 二项式定理
            if (q.includes('二项式') || q.includes('展开') || (/\(\s*[\da-z]\s*[+\-]\s*[\da-z]\s*\)/.test(q) && q.includes('系数'))) {
                // 匹配 (a+b)^n 的形式，求某项系数
                const binomMatch = cleanQ.match(/\(\s*[\da-z]+\s*[+\-]\s*[\da-z]+\s*\)\s*[⁰¹²³⁴⁵⁶⁷⁸⁹\d]+\s*/);
                // 提取指数（支持上标数字和普通数字）
                const expMatch = cleanQ.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+|\^(\d+)/);
                // 提取求 x^k 的 k 值
                const powerMatch = cleanQ.match(/x\s*[²³⁴⁵⁶⁷⁸⁹\d]+|x\s*\^(\d+)/);
                if (expMatch && powerMatch) {
                    // 转换上标数字为普通数字
                    const superscriptMap = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
                    let expStr = expMatch[0];
                    if (expMatch[1]) expStr = expMatch[1]; // ^n 格式
                    else {
                        expStr = expStr.split('').map(c => superscriptMap[c] || c).join('');
                    }
                    const n = parseInt(expStr);
                    let powerStr = powerMatch[0];
                    let k;
                    if (powerMatch[1]) {
                        k = parseInt(powerMatch[1]);
                    } else {
                        // 提取上标
                        const powerDigits = powerStr.replace(/x\s*/, '').split('').map(c => superscriptMap[c] || c).join('');
                        k = parseInt(powerDigits);
                    }
                    if (!isNaN(n) && !isNaN(k) && k <= n) {
                        // 计算 C(n,k)
                        function combination(nn, kk) {
                            if (kk > nn - kk) kk = nn - kk;
                            let result = 1;
                            for (let i = 0; i < kk; i++) {
                                result = result * (nn - i) / (i + 1);
                            }
                            return Math.round(result);
                        }
                        const coeff = combination(n, k);
                        return `**二项式定理**\n\n公式：(a+b)^n = Σ C(n,k) · a^(n-k) · b^k\n\n本题：求展开式中 x^${k} 的系数\n\n即求第 ${k+1} 项的系数（从 k=0 开始计数）：\nC(${n}, ${k}) = ${n}! / (${k}! × ${n-k}!)\n\n计算：\nC(${n}, ${k}) = `;
                        // 展示计算过程
                        let calcParts = [];
                        for (let i = 0; i < k; i++) {
                            calcParts.push(`${n - i}`);
                        }
                        let calcStr = calcParts.join(' × ');
                        let denomParts = [];
                        for (let i = 1; i <= k; i++) {
                            denomParts.push(`${i}`);
                        }
                        calcStr += ' ÷ (' + denomParts.join(' × ') + ')';
                        return `**二项式定理**\n\n公式：(a+b)^n = Σ C(n,k) · a^(n-k) · b^k\n\n本题：求展开式中 x^${k} 的系数\n\n即求 C(${n}, ${k})：\nC(${n}, ${k}) = ${n}! / (${k}! × ${n-k}!)\n\n计算：\n${calcStr}\n= **${coeff}**\n\n💡 答案：x^${k} 的系数是 **${coeff}**`;
                    }
                }
                return teach('二项式定理',
                    '**二项式定理**：\n(a+b)^n = C(n,0)a^n + C(n,1)a^(n-1)b + C(n,2)a^(n-2)b² + ... + C(n,n)b^n\n\n**通项公式**：\nT(r+1) = C(n,r) · a^(n-r) · b^r\n\n**组合数公式**：\nC(n,r) = n! / [r!(n-r)!]\n\n**常用性质**：\n• C(n,r) = C(n, n-r)\n• C(n,0) + C(n,1) + ... + C(n,n) = 2^n\n• 展开式中各项系数之和：令 a=b=1\n• 奇数项系数和 = 偶数项系数和 = 2^(n-1)',
                    '求 (1+x)^6 展开式中 x² 的系数。',
                    'x² 出现在第 r+1 项，其中 r=2\nT(3) = C(6,2) · 1^(6-2) · x² = C(6,2) · x²\nC(6,2) = 6!/(2!×4!) = (6×5)/(2×1) = 15\n\n答案：x² 的系数是 **15**',
                    '常见错误：\n• 混淆 r 和项数（第 r+1 项对应 x^r）\n• 组合数计算错误\n• 忘记 a 和 b 的幂次',
                    '记住通项公式 T(r+1) = C(n,r)·a^(n-r)·b^r，先确定 r 再代入。'
                );
            }

            // 直线方程求解
            if (q.includes('直线方程') || q.includes('垂直') || (q.includes('直线') && q.includes('方程'))) {
                // 匹配过点(x0,y0)且与直线Ax+By+C=0垂直/平行
                const pointMatch = cleanQ.match(/点\s*[\(（]\s*(-?\d+\.?\d*)\s*[,，]\s*(-?\d+\.?\d*)\s*[\)）]/);
                const lineMatch = cleanQ.match(/直线\s*(-?\d*\.?\d*)\s*[xX]\s*([+\-])\s*(-?\d*\.?\d*)\s*[yY]\s*([+\-])\s*(-?\d+\.?\d*)\s*=\s*0/);
                const isPerpendicular = q.includes('垂直');
                const isParallel = q.includes('平行');

                if (pointMatch && lineMatch) {
                    const px = parseFloat(pointMatch[1]);
                    const py = parseFloat(pointMatch[2]);
                    // 解析原直线 Ax + By + C = 0
                    let A = parseFloat(lineMatch[1]) || 1;
                    const sign1 = lineMatch[2]; // y前的符号
                    let B = parseFloat(lineMatch[3]) || 1;
                    if (sign1 === '-') B = -B;
                    const sign2 = lineMatch[4]; // C的符号
                    let C = parseFloat(lineMatch[5]) || 0;
                    if (sign2 === '-') C = -C;

                    if (isPerpendicular) {
                        // 垂直直线：原直线斜率 k1 = -A/B，垂直直线斜率 k2 = B/A
                        // 垂直直线方程：Bx - Ay + D = 0，代入点求D
                        const D = -(B * px - A * py);
                        // 整理方程
                        let eqParts = [];
                        if (B === 1) eqParts.push('x');
                        else if (B === -1) eqParts.push('-x');
                        else if (B !== 0) eqParts.push(B + 'x');
                        if (-A === 1) eqParts.push('+ y');
                        else if (-A === -1) eqParts.push('- y');
                        else if (-A > 0) eqParts.push('+ ' + (-A) + 'y');
                        else if (-A < 0) eqParts.push('- ' + Math.abs(-A) + 'y');
                        let eq = eqParts.join(' ');
                        if (D > 0) eq += ' + ' + D;
                        else if (D < 0) eq += ' - ' + Math.abs(D);
                        eq += ' = 0';

                        // 也用点斜式验证
                        const k1 = (B !== 0) ? (-A / B) : Infinity;
                        let k2, explanation;
                        if (k1 === 0) {
                            k2 = '不存在（垂直线）';
                            explanation = `原直线斜率 k₁ = ${k1}（水平线），与其垂直的直线是竖直线\n\n过点(${px}, ${py})的竖直线方程为：x = ${px}`;
                            return `**直线方程求解**\n\n已知：过点(${px}, ${py})，与直线 ${A}x + ${B}y + ${C} = 0 垂直\n\n${explanation}\n\n💡 答案：**x = ${px}**`;
                        } else if (!isFinite(k1)) {
                            k2 = 0;
                            explanation = `原直线斜率不存在（竖直线），与其垂直的直线是水平线\n\n过点(${px}, ${py})的水平线方程为：y = ${py}`;
                            return `**直线方程求解**\n\n已知：过点(${px}, ${py})，与直线 ${A}x + ${B}y + ${C} = 0 垂直\n\n${explanation}\n\n💡 答案：**y = ${py}**`;
                        } else {
                            k2 = -1 / k1;
                            explanation = `原直线：${A}x + ${B}y + ${C} = 0\n原直线斜率 k₁ = -A/B = ${-A}/${B} = ${k1}\n\n垂直条件：k₁ × k₂ = -1\n所以 k₂ = -1/k₁ = ${k2}\n\n用点斜式：y - ${py} = ${k2}(x - ${px})`;
                            // 简化：用 Bx - Ay + D = 0，归一化使首系数为正
                            let normA = B, normB = -A, normC = D;
                            if (normA < 0) { normA = -normA; normB = -normB; normC = -normC; }
                            let simplified = '';
                            if (normA === 1) simplified = 'x';
                            else simplified = normA + 'x';
                            if (normB === 1) simplified += ' + y';
                            else if (normB === -1) simplified += ' - y';
                            else if (normB > 0) simplified += ' + ' + normB + 'y';
                            else if (normB < 0) simplified += ' - ' + Math.abs(normB) + 'y';
                            if (normC > 0) simplified += ' + ' + normC;
                            else if (normC < 0) simplified += ' - ' + Math.abs(normC);
                            simplified += ' = 0';

                            return `**直线方程求解**\n\n已知：过点(${px}, ${py})，与直线 ${A}x + ${B}y + ${C} = 0 垂直\n\n${explanation}\n\n展开整理：\n${simplified}\n\n💡 答案：**${simplified}**（或等价形式）`;
                        }
                    }
                    if (isParallel) {
                        // 平行直线：Ax + By + D = 0，代入点求D
                        const D = -(A * px + B * py);
                        let simplified = '';
                        if (A === 1) simplified = 'x';
                        else if (A === -1) simplified = '-x';
                        else simplified = A + 'x';
                        if (B === 1) simplified += ' + y';
                        else if (B === -1) simplified += ' - y';
                        else if (B > 0) simplified += ' + ' + B + 'y';
                        else if (B < 0) simplified += ' - ' + Math.abs(B) + 'y';
                        if (D > 0) simplified += ' + ' + D;
                        else if (D < 0) simplified += ' - ' + Math.abs(D);
                        simplified += ' = 0';

                        return `**直线方程求解**\n\n已知：过点(${px}, ${py})，与直线 ${A}x + ${B}y + ${C} = 0 平行\n\n平行条件：斜率相同，即 A、B 系数不变\n设平行直线为 ${A}x + ${B}y + D = 0\n\n代入点(${px}, ${py})：\n${A}×${px} + ${B}×${py} + D = 0\n${A*px} + ${B*py} + D = 0\nD = ${D}\n\n💡 答案：**${simplified}**`;
                    }
                }
                return teach('直线方程',
                    '**直线方程的几种形式**：\n• 点斜式：y - y₀ = k(x - x₀)\n• 斜截式：y = kx + b\n• 两点式：(y-y₁)/(y₂-y₁) = (x-x₁)/(x₂-x₁)\n• 一般式：Ax + By + C = 0\n• 截距式：x/a + y/b = 1\n\n**直线位置关系**：\n• 平行：k₁ = k₂（一般式中 A₁/B₁ = A₂/B₂）\n• 垂直：k₁ × k₂ = -1（一般式中 A₁A₂ + B₁B₂ = 0）\n• 相交：k₁ ≠ k₂\n\n**求直线方程的步骤**：\n1. 确定已知条件（点、斜率、平行/垂直关系）\n2. 选择合适的方程形式\n3. 代入条件求未知参数\n4. 化为一般式或最简形式',
                    '求过点(1,2)且与直线 x+y-1=0 垂直的直线方程。',
                    '原直线 x+y-1=0，斜率 k₁ = -1\n垂直直线斜率 k₂ = -1/k₁ = 1\n\n用点斜式：y - 2 = 1×(x - 1)\ny - 2 = x - 1\nx - y + 1 = 0\n\n答案：**x - y + 1 = 0**（即 x - y = -1）',
                    '常见错误：\n• 垂直条件记错（k₁×k₂=-1，不是k₁=k₂）\n• 平行条件记错（k₁=k₂，不是k₁=-k₂）\n• 代入点时符号出错',
                    '记住：垂直用"积为-1"，平行用"斜率相等"。'
                );
            }

            // 数论基础
            if (q.includes('质数') || q.includes('素数') || q.includes('因数') || q.includes('倍数') || q.includes('公约数') || q.includes('公倍数') || q.includes('gcd') || q.includes('lcm') || q.includes('最大公') || q.includes('最小公') || q.includes('整除') || q.includes('约数') || q.includes('数论')) {
                return teach('数论基础',
                    '**质数与合数**：\n• 质数（素数）：大于1的自然数，只有1和它本身两个因数\n  如：2, 3, 5, 7, 11, 13, 17, 19, 23...\n• 合数：大于1的自然数，除了1和本身还有其他因数\n  如：4, 6, 8, 9, 10, 12...\n• 1既不是质数也不是合数\n• 2是最小的质数，也是唯一的偶质数\n\n**因数与倍数**：\n• 因数：能整除某数的数。如12的因数：1, 2, 3, 4, 6, 12\n• 倍数：某数乘以整数得到的数。如12的倍数：12, 24, 36...\n• 最大公约数（GCD）：两个数共有的最大因数\n  求法：辗转相除法（欧几里得算法）\n  gcd(a,b) = gcd(b, a mod b)，直到余数为0\n• 最小公倍数（LCM）：两个数共有的最小倍数\n  公式：lcm(a,b) = |a×b| / gcd(a,b)\n\n**整除性质**：\n• 被2整除：末位是偶数\n• 被3整除：各位数字之和被3整除\n• 被5整除：末位是0或5\n• 被9整除：各位数字之和被9整除\n• 被11整除：奇数位和与偶数位和之差被11整除',
                    '求 48 和 180 的最大公约数和最小公倍数。',
                    '用辗转相除法：\ngcd(180, 48)：180 = 48×3 + 36\ngcd(48, 36)：48 = 36×1 + 12\ngcd(36, 12)：36 = 12×3 + 0\n所以 gcd(48, 180) = 12\n\nlcm(48, 180) = 48×180 / 12 = 8640 / 12 = 720',
                    '常见错误：\n• 1被认为是质数\n• 忘记2是唯一的偶质数\n• 求lcm时直接用两数相乘（忘记除以gcd）',
                    '熟记100以内的质数表，掌握辗转相除法。'
                );
            }

            // 方程解题步骤指导
            if (q.includes('怎么解') || q.includes('解题步骤') || q.includes('如何解方程') || q.includes('解方程步骤')) {
                return teach('方程解题步骤',
                    '**一元一次方程** ax + b = c 的通用解法：\n1. 去分母（如有分数系数）\n2. 去括号（展开）\n3. 移项：把含x的项移到左边，常数移到右边（移项变号）\n4. 合并同类项\n5. 系数化为1：两边同除以x的系数\n\n**一元二次方程** ax² + bx + c = 0：\n1. 计算判别式 Δ = b² - 4ac\n2. Δ > 0：两个不等实根 x = (-b ± √Δ) / 2a\n3. Δ = 0：两个相等实根 x = -b / 2a\n4. Δ < 0：无实数根',
                    '解方程：3(2x - 1) = 4x + 3',
                    '第一步 - 去括号：6x - 3 = 4x + 3\n第二步 - 移项：6x - 4x = 3 + 3\n第三步 - 合并：2x = 6\n第四步 - 化简：x = 3\n验证：3(2×3-1) = 3×5 = 15，4×3+3 = 15 ✓',
                    '常见错误：\n• 移项忘记变号（如 6x 移到右边变成 -6x）\n• 去括号时忘记分配律（漏乘某项）\n• 分数方程忘记检验增根\n• 二次方程忘记讨论 Δ 的三种情况',
                    '多做专项练习，每种类型至少练5道，确保步骤熟练。'
                );
            }

            // 常见数学错误
            if (q.includes('易错') || q.includes('常见错误') || q.includes('容易错') || q.includes('注意')) {
                return teach('数学常见易错点',
                    '**计算类**：\n• 运算顺序错误：先乘除后加减，有括号先算括号\n• 符号错误：负负得正，去括号注意变号\n• 小数点位置：乘法小数位数相加，除法移动小数点\n\n**概念类**：\n• 混淆"除以"和"除"：a除以b = a/b，a除b = b/a\n• 0不能作除数\n• 比和比例的区别：比是两个数的商，比例是两个比相等的式子\n\n**应用类**：\n• 单位换算：1km = 1000m，1m = 100cm，1kg = 1000g\n• 近似值：四舍五入看下一位，进一法和去尾法看实际需求',
                    '计算 (-3) × 2 + 8 ÷ (-4)',
                    '第一步 - 乘法：(-3) × 2 = -6\n第二步 - 除法：8 ÷ (-4) = -2\n第三步 - 加法：(-6) + (-2) = -8\n注意：先乘除后加减，不要从左到右依次计算！',
                    '最易犯的错误：\n• 从左到右算：(-3)×2 = -6，-6+8 = 2，2÷(-4) = -0.5（错误！）\n• 忘记负号：(-3)×2 = 6（错误！）',
                    '准备一个错题本，每次出错都记录原因，定期复习。'
                );
            }

            // 概率与统计
            if (q.includes('概率') || q.includes('统计') || q.includes('排列') || q.includes('组合') || q.includes('平均数') || q.includes('标准差') || q.includes('中位数') || q.includes('众数') || q.includes('permutation') || q.includes('combination')) {
                return teach('概率与统计基础',
                    '**排列组合公式**：\n• 排列 A(n,m) = n!/(n-m)! — 有顺序\n  例：从5人中选3人排队：A(5,3) = 5×4×3 = 60种\n• 组合 C(n,m) = n!/[m!(n-m)!] — 无顺序\n  例：从5人中选3人：C(5,3) = 5×4×3/(3×2×1) = 10种\n\n**概率公式**：\n• P(A) = 有利结果数 / 总结果数\n• 互斥事件：P(A或B) = P(A) + P(B)\n• 独立事件：P(A且B) = P(A) × P(B)\n• 对立事件：P(非A) = 1 - P(A)\n\n**概率树**：\n掷两枚硬币的概率树：\n第一枚：正面(1/2) → 第二枚：正(1/2)→正正(1/4)，反(1/2)→正反(1/4)\n第一枚：反面(1/2) → 第二枚：正(1/2)→反正(1/4)，反(1/2)→反反(1/4)\n\n**集中趋势**：\n• 平均数（均值）：所有数之和 ÷ 个数\n  例：(3+5+7+9) ÷ 4 = 6\n• 中位数：从小到大排列取中间值\n  例：3,5,7,9 → 中位数 = (5+7)/2 = 6\n• 众数：出现次数最多的数\n  例：3,5,5,7,9 → 众数 = 5\n\n**标准差**：\nσ = √[Σ(xi - x̄)² / n]\n步骤：1.求均值x̄  2.每个数减去均值  3.平方  4.求平均  5.开方',
                    '从6人中选3人组成委员会，有多少种选法？',
                    '这是组合问题（无顺序）：C(6,3) = 6!/(3!×3!) = (6×5×4)/(3×2×1) = 20种\n\n如果是选3人分别担任正副组长和记录员（有顺序），则是排列：A(6,3) = 6×5×4 = 120种',
                    '常见错误：\n• 混淆排列和组合（关键看是否有顺序要求）\n• 概率计算时分母忘记包含所有可能结果\n• 标准差公式中忘记平方或开方',
                    '多做概率题，画概率树帮助理解。'
                );
            }

            // 数列（等差数列、等比数列）
            if (q.includes('数列') || q.includes('等差') || q.includes('等比') || q.includes('通项') || q.includes('求和') || q.includes('sequence') || q.includes('arithmetic') || q.includes('geometric')) {
                return teach('数列基础——等差数列与等比数列',
                    '**等差数列**：\n• 定义：相邻两项的差为常数d（公差）\n• 通项公式：aₙ = a₁ + (n-1)d\n• 前n项和：Sₙ = n(a₁+aₙ)/2 = na₁ + n(n-1)d/2\n• 性质：aₘ + aₙ = aₚ + aᵧ（当m+n=p+q时）\n\n**等比数列**：\n• 定义：相邻两项的比为常数q（公比，q≠0）\n• 通项公式：aₙ = a₁ · q^(n-1)\n• 前n项和：Sₙ = a₁(1-qⁿ)/(1-q)（q≠1时）\n• 性质：aₘ · aₙ = aₚ · aᵧ（当m+n=p+q时）\n\n**常见数列求和**：\n• 1+2+3+...+n = n(n+1)/2\n• 1²+2²+...+n² = n(n+1)(2n+1)/6\n• 1³+2³+...+n³ = [n(n+1)/2]²',
                    '已知等差数列{aₙ}中，a₁=3，d=2，求a₁₀和S₁₀。',
                    'a₁₀ = a₁ + (10-1)d = 3 + 9×2 = 3 + 18 = 21\nS₁₀ = 10×(a₁+a₁₀)/2 = 10×(3+21)/2 = 10×12 = 120\n\n验证：3,5,7,9,11,13,15,17,19,21\nS₁₀ = 3+5+7+9+11+13+15+17+19+21 = 120 ✓',
                    '常见错误：\n• 等差数列通项公式写成 aₙ = a₁ + nd（应为 n-1）\n• 等比数列求和忘记 q≠1 的条件\n• 求和时项数计算错误',
                    '牢记通项公式和求和公式，做题时先判断是等差还是等比。'
                );
            }

            // 不等式
            if (q.includes('不等式') || q.includes('inequality') || q.includes('解集') || q.includes('一元一次不等式') || q.includes('一元二次不等式')) {
                return teach('不等式基础——一元一次不等式与一元二次不等式',
                    '**一元一次不等式 ax + b > 0**：\n• a > 0 时：x > -b/a\n• a < 0 时：x < -b/a（注意变号！）\n\n**一元二次不等式 ax² + bx + c > 0**：\n设 Δ = b² - 4ac\n• Δ < 0：\n  a > 0 时，解集为全体实数R\n  a < 0 时，解集为空集\n• Δ = 0：\n  a > 0 时，x ≠ -b/(2a)\n  a < 0 时，无解\n• Δ > 0：设两根 x₁ < x₂\n  a > 0 时，x < x₁ 或 x > x₂（"两根之外"）\n  a < 0 时，x₁ < x < x₂（"两根之间"）\n\n**不等式性质**：\n• a > b → a+c > b+c\n• a > b, c > 0 → ac > bc\n• a > b, c < 0 → ac < bc（注意变号！）',
                    '解不等式：x² - 5x + 6 < 0',
                    '第一步：因式分解 x² - 5x + 6 = (x-2)(x-3)\n第二步：求根 x₁=2, x₂=3\n第三步：a=1>0，开口向上\n第四步：不等式 < 0，取"两根之间"\n\n答案：2 < x < 3\n\n口诀：大于取两边，小于取中间',
                    '常见错误：\n• 两边同乘负数忘记变号\n• 二次不等式开口方向判断错误\n• "大于"和"小于"的取值范围搞反',
                    '画数轴帮助理解解集，牢记"大于取两边，小于取中间"。'
                );
            }

            // 圆锥曲线
            if (q.includes('圆锥曲线') || q.includes('椭圆') || q.includes('双曲线') || q.includes('抛物线') || q.includes('conic') || q.includes('ellipse') || q.includes('hyperbola') || q.includes('parabola')) {
                return teach('圆锥曲线基础——椭圆、双曲线、抛物线',
                    '**椭圆**：\n• 标准方程：x²/a² + y²/b² = 1（a > b > 0）\n• 焦点在x轴上，c² = a² - b²\n• 离心率：e = c/a（0 < e < 1）\n• e越小越接近圆，e越大越扁\n\n**双曲线**：\n• 标准方程：x²/a² - y²/b² = 1（a>0, b>0）\n• 焦点在x轴上，c² = a² + b²\n• 离心率：e = c/a（e > 1）\n• 渐近线：y = ±(b/a)x\n\n**抛物线**：\n• 标准方程（开口向右）：y² = 2px（p > 0）\n• 焦点：(p/2, 0)\n• 准线：x = -p/2\n\n**统一性质**：\n圆锥曲线上点到焦点的距离与到准线距离之比为离心率e',
                    '求椭圆 x²/25 + y²/16 = 1 的焦点坐标和离心率。',
                    'a² = 25, b² = 16\na = 5, b = 4\nc² = a² - b² = 25 - 16 = 9\nc = 3\n\n焦点坐标：F₁(-3, 0), F₂(3, 0)\n离心率：e = c/a = 3/5 = 0.6',
                    '常见错误：\n• 椭圆中 c² = a² - b²，双曲线中 c² = a² + b²，容易搞混\n• 焦点位置判断错误（看分母大的在x还是y）\n• 抛物线开口方向与方程符号对应错误',
                    '先判断是哪种圆锥曲线，再确定焦点在哪条轴上。'
                );
            }

            // 排列组合计数问题
            if (q.includes('排列组合') || q.includes('计数') || q.includes('组合数') || q.includes('排列数') || q.includes('阶乘') || q.includes('permutation') || q.includes('combination')) {
                return teach('排列组合计数问题',
                    '**排列 A(n,m)**（有顺序）：\n• 公式：A(n,m) = n!/(n-m)!\n• 含义：从n个不同元素中取m个，按顺序排列\n• 例：从5人中选3人排队 A(5,3) = 5×4×3 = 60种\n\n**组合 C(n,m)**（无顺序）：\n• 公式：C(n,m) = n!/[m!(n-m)!]\n• 含义：从n个不同元素中取m个，不计顺序\n• 例：从5人中选3人 C(5,3) = 10种\n\n**常用计数方法**：\n1. 分类加法原理：做一件事有n类方法，各类方法数分别为m₁,m₂,...,mₙ，则总方法数 = m₁+m₂+...+mₙ\n2. 分步乘法原理：做一件事分n步，各步方法数分别为m₁,m₂,...,mₙ，则总方法数 = m₁×m₂×...×mₙ\n3. 捆绑法：相邻元素视为一个整体\n4. 插空法：不相邻元素先排其他再插空\n5. 间接法：总数减去不符合条件的',
                    '从4男3女中选3人组成委员会，至少有1名女生，有多少种选法？',
                    '方法一（间接法）：\n总选法 C(7,3) = 35\n全是男生 C(4,3) = 4\n至少1名女生 = 35 - 4 = 31种\n\n方法二（直接法）：\n1女2男：C(3,1)×C(4,2) = 3×6 = 18\n2女1男：C(3,2)×C(4,1) = 3×4 = 12\n3女0男：C(3,3)×C(4,0) = 1×1 = 1\n合计：18 + 12 + 1 = 31种\n\n答案：31种',
                    '常见错误：\n• 混淆排列和组合（关键看是否有顺序要求）\n• "至少"问题直接加容易遗漏或重复，建议用间接法\n• 分类与分步搞混（分类用加法，分步用乘法）',
                    '先判断是排列还是组合，再确定用分类加法还是分步乘法。'
                );
            }

            return null;
        }

        // ========== 3. 英语智能处理 ==========
        function handleEnglish(question, cleanQ) {
            const q = question.toLowerCase();

            // ========== 新增：自我介绍模板 ==========
            if (/自我介绍|self.?introduction|介绍.*自己|introduce.*myself/i.test(cleanQ)) {
                return `📝 **英语自我介绍模板**\n\n**基础版（适合初学者）**：\nHello, everyone! My name is [你的名字]. I am [年龄] years old. I come from [城市]. I am a student at [学校名]. My favorite subject is English. I like [爱好] in my free time. Thank you!\n\n**进阶版（适合初中/高中）**：\nGood morning/afternoon, everyone. It's a great honor to introduce myself. My name is [你的名字]. I am [年龄] years old and I come from [城市]. Currently, I am studying at [学校名]. I am an outgoing and friendly person. In my spare time, I enjoy reading, playing basketball, and listening to music. My dream is to become a [理想职业] in the future. I believe that with hard work, anything is possible. Thank you for listening!\n\n**词汇替换**：\n• 性格：outgoing（外向的）、friendly（友好的）、confident（自信的）、hardworking（勤奋的）\n• 爱好：reading（阅读）、playing sports（运动）、traveling（旅行）、painting（画画）\n• 理想：doctor（医生）、teacher（教师）、engineer（工程师）、scientist（科学家）\n\n💡 提示：根据实际情况替换括号中的内容，注意时态一致。`;
            }

            // ========== 新增：常见动词过去式查询 ==========
            const pastTenseMatch = cleanQ.match(/past\s*tense\s*of\s*[""']?(\w+)[""']?|(\w+)\s*的过去式|(\w+)\s*的过去分词/);
            if (pastTenseMatch) {
                const verb = (pastTenseMatch[1] || pastTenseMatch[2] || pastTenseMatch[3] || '').toLowerCase();
                const irregularVerbs = {
                    'go': { past: 'went', participle: 'gone', meaning: '去' },
                    'went': { past: 'went', participle: 'gone', meaning: '去（过去式）' },
                    'come': { past: 'came', participle: 'come', meaning: '来' },
                    'do': { past: 'did', participle: 'done', meaning: '做' },
                    'did': { past: 'did', participle: 'done', meaning: '做（过去式）' },
                    'have': { past: 'had', participle: 'had', meaning: '有' },
                    'had': { past: 'had', participle: 'had', meaning: '有（过去式）' },
                    'make': { past: 'made', participle: 'made', meaning: '制作' },
                    'take': { past: 'took', participle: 'taken', meaning: '拿/带' },
                    'give': { past: 'gave', participle: 'given', meaning: '给' },
                    'see': { past: 'saw', participle: 'seen', meaning: '看见' },
                    'saw': { past: 'saw', participle: 'seen', meaning: '看见（过去式）' },
                    'know': { past: 'knew', participle: 'known', meaning: '知道' },
                    'think': { past: 'thought', participle: 'thought', meaning: '想' },
                    'say': { past: 'said', participle: 'said', meaning: '说' },
                    'tell': { past: 'told', participle: 'told', meaning: '告诉' },
                    'find': { past: 'found', participle: 'found', meaning: '找到' },
                    'leave': { past: 'left', participle: 'left', meaning: '离开' },
                    'feel': { past: 'felt', participle: 'felt', meaning: '感觉' },
                    'keep': { past: 'kept', participle: 'kept', meaning: '保持' },
                    'let': { past: 'let', participle: 'let', meaning: '让' },
                    'begin': { past: 'began', participle: 'begun', meaning: '开始' },
                    'show': { past: 'showed', participle: 'shown', meaning: '展示' },
                    'hear': { past: 'heard', participle: 'heard', meaning: '听见' },
                    'play': { past: 'played', participle: 'played', meaning: '玩' },
                    'run': { past: 'ran', participle: 'run', meaning: '跑' },
                    'ran': { past: 'ran', participle: 'run', meaning: '跑（过去式）' },
                    'move': { past: 'moved', participle: 'moved', meaning: '移动' },
                    'live': { past: 'lived', participle: 'lived', meaning: '生活' },
                    'believe': { past: 'believed', participle: 'believed', meaning: '相信' },
                    'bring': { past: 'brought', participle: 'brought', meaning: '带来' },
                    'buy': { past: 'bought', participle: 'bought', meaning: '买' },
                    'fight': { past: 'fought', participle: 'fought', meaning: '战斗' },
                    'teach': { past: 'taught', participle: 'taught', meaning: '教' },
                    'catch': { past: 'caught', participle: 'caught', meaning: '抓住' },
                    'write': { past: 'wrote', participle: 'written', meaning: '写' },
                    'wrote': { past: 'wrote', participle: 'written', meaning: '写（过去式）' },
                    'read': { past: 'read', participle: 'read', meaning: '读' },
                    'eat': { past: 'ate', participle: 'eaten', meaning: '吃' },
                    'drink': { past: 'drank', participle: 'drunk', meaning: '喝' },
                    'sleep': { past: 'slept', participle: 'slept', meaning: '睡觉' },
                    'drive': { past: 'drove', participle: 'driven', meaning: '驾驶' },
                    'ride': { past: 'rode', participle: 'ridden', meaning: '骑' },
                    'sing': { past: 'sang', participle: 'sung', meaning: '唱歌' },
                    'swim': { past: 'swam', participle: 'swum', meaning: '游泳' },
                    'sit': { past: 'sat', participle: 'sat', meaning: '坐' },
                    'stand': { past: 'stood', participle: 'stood', meaning: '站' },
                    'lose': { past: 'lost', participle: 'lost', meaning: '丢失' },
                    'win': { past: 'won', participle: 'won', meaning: '赢' },
                    'send': { past: 'sent', participle: 'sent', meaning: '发送' },
                    'build': { past: 'built', participle: 'built', meaning: '建造' },
                    'grow': { past: 'grew', participle: 'grown', meaning: '生长' },
                    'draw': { past: 'drew', participle: 'drawn', meaning: '画' },
                    'fly': { past: 'flew', participle: 'flown', meaning: '飞' },
                    'throw': { past: 'threw', participle: 'thrown', meaning: '扔' },
                    'fall': { past: 'fell', participle: 'fallen', meaning: '落下' },
                    'break': { past: 'broke', participle: 'broken', meaning: '打破' },
                    'speak': { past: 'spoke', participle: 'spoken', meaning: '说' },
                    'choose': { past: 'chose', participle: 'chosen', meaning: '选择' },
                    'forget': { past: 'forgot', participle: 'forgotten', meaning: '忘记' },
                    'meet': { past: 'met', participle: 'met', meaning: '遇见' },
                    'get': { past: 'got', participle: 'got/gotten', meaning: '得到' },
                    'put': { past: 'put', participle: 'put', meaning: '放' },
                    'set': { past: 'set', participle: 'set', meaning: '设置' },
                    'cut': { past: 'cut', participle: 'cut', meaning: '切' },
                    'hit': { past: 'hit', participle: 'hit', meaning: '打' },
                    'hurt': { past: 'hurt', participle: 'hurt', meaning: '伤害' },
                    'shut': { past: 'shut', participle: 'shut', meaning: '关闭' },
                    'cost': { past: 'cost', participle: 'cost', meaning: '花费' },
                    'become': { past: 'became', participle: 'become', meaning: '成为' },
                    'hold': { past: 'held', participle: 'held', meaning: '握住' },
                    'learn': { past: 'learned/learnt', participle: 'learned/learnt', meaning: '学习' },
                    'mean': { past: 'meant', participle: 'meant', meaning: '意味着' },
                    'pay': { past: 'paid', participle: 'paid', meaning: '支付' },
                    'sell': { past: 'sold', participle: 'sold', meaning: '卖' },
                    'spend': { past: 'spent', participle: 'spent', meaning: '花费' },
                    'wear': { past: 'wore', participle: 'worn', meaning: '穿' },
                    'lead': { past: 'led', participle: 'led', meaning: '领导' },
                    'understand': { past: 'understood', participle: 'understood', meaning: '理解' },
                    'wake': { past: 'woke', participle: 'woken', meaning: '醒来' },
                    'lie': { past: 'lay', participle: 'lain', meaning: '躺' },
                    'lay': { past: 'laid', participle: 'laid', meaning: '放置' },
                    'shine': { past: 'shone', participle: 'shone', meaning: '发光' },
                    'beat': { past: 'beat', participle: 'beaten', meaning: '打败' },
                    'rise': { past: 'rose', participle: 'risen', meaning: '升起' },
                    'arise': { past: 'arose', participle: 'arisen', meaning: '出现' },
                    'blow': { past: 'blew', participle: 'blown', meaning: '吹' },
                    'bind': { past: 'bound', participle: 'bound', meaning: '绑定' },
                    'dig': { past: 'dug', participle: 'dug', meaning: '挖' },
                    'feed': { past: 'fed', participle: 'fed', meaning: '喂养' },
                    'hang': { past: 'hung', participle: 'hung', meaning: '挂' },
                    'hide': { past: 'hid', participle: 'hidden', meaning: '隐藏' },
                    'lend': { past: 'lent', participle: 'lent', meaning: '借出' },
                    'light': { past: 'lit', participle: 'lit', meaning: '点燃' },
                    'seek': { past: 'sought', participle: 'sought', meaning: '寻找' },
                    'shoot': { past: 'shot', participle: 'shot', meaning: '射击' },
                    'strike': { past: 'struck', participle: 'struck', meaning: '罢工/击打' },
                    'swear': { past: 'swore', participle: 'sworn', meaning: '发誓' },
                    'tear': { past: 'tore', participle: 'torn', meaning: '撕' },
                    'wake': { past: 'woke', participle: 'woken', meaning: '唤醒' },
                    'weep': { past: 'wept', participle: 'wept', meaning: '哭泣' },
                };
                if (verb && irregularVerbs[verb]) {
                    const info = irregularVerbs[verb];
                    return `📝 **动词时态查询**\n\n**${verb}**（${info.meaning}）\n• 原形：${verb}\n• 过去式：**${info.past}**\n• 过去分词：${info.participle}\n\n**例句**：\n• 一般现在时：I **${verb}** to school every day.\n• 一般过去时：I **${info.past}** to school yesterday.\n• 现在完成时：I have **${info.participle}** to school.`;
                }
                // 规则动词
                if (verb) {
                    const past = verb.endsWith('e') ? verb + 'd' : verb.endsWith('y') && /[bcdfghjklmnpqrstvwxyz]y$/.test(verb) ? verb.slice(0, -1) + 'ied' : verb + 'ed';
                    return `📝 **动词时态查询**\n\n**${verb}** 是规则动词\n• 原形：${verb}\n• 过去式：**${past}**\n• 过去分词：${past}\n\n规则动词变化规律：\n• 一般情况：直接加 -ed\n• 以 e 结尾：加 -d\n• 以"辅音+y"结尾：变 y 为 i，加 -ed\n• 以重读闭音节结尾：双写末尾辅音字母，加 -ed`;
                }
            }

            // ========== 新增：不规则形容词变化规律讲解 ==========
            if (/比较级|最高级|good\s+better\s+best|不规则.*变化|形容词.*变化/.test(cleanQ)) {
                return `📝 **形容词不规则变化规律**\n\n英语中大部分形容词的比较级和最高级变化是有规律的（加 -er / -est），但有一些常用形容词是不规则变化，需要特别记忆：\n\n**不规则变化表**：\n| 原级 | 比较级 | 最高级 | 说明 |\n|------|--------|--------|------|\n| good/well | better | best | 好的 |\n| bad/ill | worse | worst | 坏的 |\n| many/much | more | most | 多的 |\n| little | less | least | 少的 |\n| far | farther/further | farthest/furthest | 远的 |\n| old | older/elder | oldest/eldest | 老的 |\n\n**变化规律总结**：\n1. **good → better → best**：完全变形，无规律可循，必须记忆\n2. **bad → worse → worst**：完全变形，与 good 系列类似\n3. **many/much → more → most**：完全变形\n4. **little → less → least**：词干变化，加 -ss/-st\n5. **far → farther/further → farthest/furthest**：\n   - farther/farthest 指实际距离更远\n   - further/furthest 指抽象的"进一步"\n6. **old → older/elder → oldest/eldest**：\n   - older/oldest 用于年龄比较\n   - elder/eldest 用于家庭辈分（不跟 than）\n\n**记忆口诀**：\n"好更好最好，坏更坏最坏，多更多最多，少更少最少"\ngood, better, best; bad, worse, worst; many, more, most; little, less, least.`;
            }

            // 翻译请求检测
            const transPatterns = [
                /翻译\s*[:：]?\s*([\s\S]+)/,
                /英译汉\s*[:：]?\s*([\s\S]+)/,
                /汉译英\s*[:：]?\s*([\s\S]+)/,
                /translate\s*[:：]?\s*([\s\S]+)/i,
                /(.+)\s*怎么?翻译/i,
                /(.+)\s*的英文是?什么/,
                /(.+)\s*的中文是?什么/,
            ];
            for (const pattern of transPatterns) {
                const m = cleanQ.match(pattern);
                if (m && m[1]) {
                    const text = m[1].trim();
                    const isChinese = /[\u4e00-\u9fa5]/.test(text);
                    if (isChinese) {
                        const trans = typeof getEnglishTranslation === 'function' ? getEnglishTranslation(text) : null;
                        if (trans) return `「${text}」的英文翻译：${trans}`;
                        return `「${text}」\n\n建议：这个词/句暂无本地翻译，可以开启联网搜索获取更准确的翻译。`;
                    } else {
                        const trans = typeof getChineseTranslation === 'function' ? getChineseTranslation(text) : null;
                        if (trans) return `「${text}」的中文翻译：${trans}`;
                        return `「${text}」\n\n建议：这个词/句暂无本地翻译，可以开启联网搜索获取更准确的翻译。`;
                    }
                }
            }

            // 单词查询（单个英文词）
            const wordMatch = cleanQ.match(/^\s*([a-zA-Z]+)\s*[?？]?\s*$/);
            if (wordMatch) {
                const word = wordMatch[1].toLowerCase();
                // 拼写纠错
                const fixes = {
                    'holle':'hello','teh':'the','taht':'that','waht':'what','becuase':'because',
                    'wich':'which','thier':'their','recieve':'receive','occured':'occurred',
                    'seperate':'separate','definately':'definitely','goverment':'government',
                    'enviroment':'environment','untill':'until','begining':'beginning',
                    'beleive':'believe','calender':'calendar','collegue':'colleague',
                    'commitee':'committee','concious':'conscious','curiousity':'curiosity',
                    'dissapoint':'disappoint','existance':'existence','foriegn':'foreign',
                    'gaurd':'guard','happend':'happened','immediatly':'immediately',
                    'importent':'important','knowlege':'knowledge','neccessary':'necessary',
                    'occurence':'occurrence','paralel':'parallel','privlege':'privilege',
                    'recomend':'recommend','refrence':'reference','succesful':'successful',
                    'suprise':'surprise','tommorow':'tomorrow','writting':'writing',
                    'adress':'address','agressive':'aggressive','aparent':'apparent',
                    'arguement':'argument','basicly':'basically','beautifull':'beautiful'
                };
                if (fixes[word]) {
                    return `你可能想拼写的是 **${fixes[word]}**。\n\n「${word}」是常见的拼写错误，建议记住正确拼写。`;
                }
                // 尝试翻译
                const trans = typeof getChineseTranslation === 'function' ? getChineseTranslation(word) : null;
                if (trans && !trans.includes('暂无精确翻译')) {
                    return `**${word}**\n\n中文释义：${trans}`;
                }
                return `**${word}**\n\n该词暂无本地释义。建议：\n• 检查拼写是否正确\n• 尝试用翻译功能查询完整句子\n• 开启联网搜索获取更多信息`;
            }

            // 语法询问
            if (q.includes('语法') || q.includes('grammar') || q.includes('时态') || q.includes('tense')) {
                if (/时态|tense/.test(cleanQ)) {
                    return renderTable(
                        ['时态', '结构', '例句', '用法'],
                        [
                            ['一般现在时', '主语+V原/V-s', 'I study English every day.', '习惯、事实'],
                            ['现在进行时', '主语+am/is/are+V-ing', 'She is reading now.', '正在进行'],
                            ['一般过去时', '主语+V-ed', 'They visited yesterday.', '过去发生'],
                            ['现在完成时', '主语+have/has+V-ed', 'I have finished.', '已完成'],
                            ['一般将来时', '主语+will+V原', 'We will go tomorrow.', '将来计划'],
                        ]
                    );
                }
                return teach('英语语法基础',
                    '**基本句型**（5种）：\n• S+V（主谓）：She sings.\n• S+V+O（主谓宾）：I love music.\n• S+V+P（主系表）：He is tall.\n• S+V+IO+O（主谓双宾）：She gave me a book.\n• S+V+O+C（主谓宾补）：We call him Tom.\n\n**常用时态**：\n• 一般现在时：主语 + 动词原形（三单加s/es）→ 表示习惯、事实\n• 一般过去时：主语 + 动词过去式 → 表示过去发生的事\n• 一般将来时：will/shall + 动词原形 → 表示将来\n• 现在进行时：am/is/are + doing → 表示正在发生\n• 现在完成时：have/has + done → 表示过去对现在的影响\n\n**句子结构分析**：\n每个英语句子都可以拆解为：主语（谁）+ 谓语（做什么）+ 宾语（对象）',
                    '分析句子："The clever student finished the difficult homework quickly."',
                    '主语（Subject）：The clever student（那个聪明的学生）\n谓语动词（Verb）：finished（完成了）\n宾语（Object）：the difficult homework（困难的作业）\n状语（Adverbial）：quickly（快速地）\n\n结构：S + V + O + Adv\n翻译：那个聪明的学生快速地完成了困难的作业。',
                    '常见错误：\n• 第三人称单数忘记加 s/es：He go → He goes\n• 过去式不规则动词记错：goed → went，buyed → bought\n• 进行时忘记 be 动词：He playing → He is playing\n• 完成时忘记 have/has：She went → She has gone',
                    '每天造3个不同句型的句子，练习时态转换。'
                );
            }

            // 句子结构分析
            if (q.includes('分析') || q.includes('句子结构') || q.includes('主谓宾') || q.includes('从句') || q.includes('clause')) {
                return teach('英语句子结构分析',
                    '**简单句成分**：\n• 主语（Subject）：动作的执行者\n• 谓语（Verb）：表示动作或状态\n• 宾语（Object）：动作的承受者\n• 表语（Predicative）：说明主语的身份/特征\n• 定语（Attributive）：修饰名词（如形容词、介词短语）\n• 状语（Adverbial）：修饰动词/形容词（如时间、地点、方式）\n• 补语（Complement）：补充说明宾语\n\n**复合句**：\n• 定语从句：修饰名词的从句（who/which/that引导）\n• 状语从句：表示时间/条件/原因/结果等\n• 名词性从句：充当主语/宾语/表语的从句',
                    '分析："The book that I bought yesterday is very interesting."',
                    '这是一个含有定语从句的复合句。\n\n主句：The book is very interesting.\n  主语：The book\n  系动词：is\n  表语：very interesting\n\n定语从句：that I bought yesterday\n  先行词：The book\n  关系代词：that（指物，在从句中作宾语）\n  从句主语：I\n  从句谓语：bought\n  从句状语：yesterday\n\n翻译：我昨天买的那本书非常有趣。',
                    '常见错误：\n• 定语从句中that/which混用：指人只能用who/that\n• 漏掉关系代词：The book I bought → 正确（宾语可省），但主语不能省\n• 从句语序错误：从句用陈述语序，不用疑问语序',
                    '找一篇英语短文，逐句分析句子成分，坚持一周就能掌握。'
                );
            }

            // 常见英语错误纠正
            if (q.includes('常见错误') || q.includes('易错') || q.includes('纠正') || q.includes('改错') || q.includes('mistake')) {
                return teach('英语常见错误纠正',
                    '**语法错误**：\n• 主谓不一致：He don\'t → He doesn\'t / The students is → The students are\n• 冠词误用：a apple → an apple / I am university student → I am a university student\n• 介词搭配错误：depend in → depend on / good in → good at\n\n**词汇错误**：\n• affect（动词，影响）/ effect（名词，效果）\n• its（它的）/ it\'s（it is）\n• their（他们的）/ there（那里）/ they\'re（they are）\n• than（比较）/ then（然后）\n\n**中式英语**：\n• "very like" → really like / like...very much\n• "open the light" → turn on the light\n• "play computer" → use the computer / play computer games',
                    '找出并改正错误：\n1. He don\'t like play football.\n2. I have went to Beijing last year.\n3. She is more taller than me.',
                    '1. He doesn\'t like playing football.\n   错误1：第三人称单数用 doesn\'t\n   错误2：like 后接动名词 doing\n\n2. I went to Beijing last year.\n   错误：last year 是过去时间标志，用一般过去时 went，不需要 have\n\n3. She is taller than me (或 I).\n   错误：taller 本身就是比较级，不需要 more',
                    '收集自己常犯的错误，做成纠错卡片，每周复习。',
                    '写作后通读一遍，重点检查主谓一致、时态、冠词。'
                );
            }

            // 词汇语境用法
            if (q.includes('词汇') || q.includes('用法') || q.includes('区别') || q.includes('辨析') || q.includes('usage')) {
                return teach('英语词汇语境用法',
                    '学单词不能只记中文意思，要掌握：\n1. **搭配**（collocation）：固定组合\n   - make a decision（做决定）/ do homework（做作业）\n   - take a break（休息）/ have a rest（休息）\n2. **语境**（context）：在不同场景中的含义\n   - run：跑步 / 经营 / 运行 / 褪色\n3. **词性**（part of speech）：名词/动词/形容词等\n   - success（名词）/ succeed（动词）/ successful（形容词）/ successfully（副词）\n4. **近义词辨析**：\n   - big vs large vs huge（程度递增）\n   - see vs look vs watch（看的方式不同）',
                    '辨析：look, see, watch 的区别',
                    'look（看）- 强调"看"的动作，常与 at 搭配\n  Look at the blackboard.（看黑板）\n\nsee（看见）- 强调"看"的结果\n  I can see a bird in the tree.（我能看到树上有只鸟）\n\nwatch（观看）- 强调持续关注、观看\n  Watch TV / watch a football game（看电视/看比赛）\n\n记忆口诀：look 是动作，see 是结果，watch 是持续关注。',
                    '常见错误：\n• look the picture → look at the picture\n• see TV → watch TV\n• look 和 see 混用',
                    '每学一个新单词，造3个不同语境的句子，加深理解。'
                );
            }

            // 词源 / 词根词缀
            if (q.includes('词源') || q.includes('词根') || q.includes('词缀') || q.includes('origin') || q.includes('etymology') || q.includes('prefix') || q.includes('suffix')) {
                return teach('英语词根词缀',
                    '**常见词根**：\n• spect（看）：inspect, respect, suspect, spectator\n• port（搬运）：transport, import, export, portable\n• dict（说）：dictionary, predict, contradict, dictate\n• struct（建造）：construct, structure, instruct, destroy\n• vis/vid（看）：visible, video, vision, evidence\n\n**常见前缀**：\n• un-/in-/dis-/im-（否定）：unhappy, incorrect, disagree, impossible\n• re-（再次）：rewrite, rebuild, return\n• pre-（之前）：preview, predict, prevent\n• over-（过度）：overwork, overflow, overlook\n\n**常见后缀**：\n• -tion/-sion（名词）：education, discussion\n• -ment（名词）：development, movement\n• -ful（形容词）：helpful, beautiful\n• -less（形容词）：careless, hopeless',
                    '分析 "uncomfortable" 的构词',
                    'un（前缀：不）+ comfort（词根：舒适）+ -able（后缀：可...的）\n= 不舒适的\n\n类似构词：unbelievable（难以置信的）、unforgettable（难忘的）',
                    '常见错误：\n• 混淆前缀 in- 和 un-（有时可互换，有时不行）\n• 忘记词缀会改变词性',
                    '积累常见词根词缀，可以快速推测生词含义。'
                );
            }

            // 同义词/反义词
            if (q.includes('同义词') || q.includes('反义词') || q.includes('synonym') || q.includes('antonym') || q.includes('近义词')) {
                return teach('英语同义词与反义词',
                    '**常见同义词对**：\n• big / large / huge（大的）\n• happy / glad / joyful（高兴的）\n• begin / start / commence（开始）\n• end / finish / conclude（结束）\n• fast / quick / rapid（快的）\n• good / great / excellent（好的）\n\n**常见反义词对**：\n• hot ↔ cold（热 ↔ 冷）\n• happy ↔ sad（高兴 ↔ 悲伤）\n• big ↔ small（大 ↔ 小）\n• fast ↔ slow（快 ↔ 慢）\n• rich ↔ poor（富 ↔ 穷）\n• love ↔ hate（爱 ↔ 恨）\n\n**辨析技巧**：\n同义词之间有细微差别：\n• 程度不同：good < great < excellent\n• 语域不同：begin（通用）/ commence（正式）\n• 搭配不同：big rain（大雨）/ heavy rain（暴雨）',
                    '写出 "beautiful" 的同义词和反义词',
                    '同义词：pretty, lovely, gorgeous, attractive, stunning\n反义词：ugly, plain, hideous, unattractive\n\n注意：beautiful 多用于女性容貌和风景，pretty 更口语化，gorgeous 程度更强。',
                    '常见错误：\n• 把反义词当成同义词\n• 不注意同义词的搭配差异',
                    '每学一个新词，同时查它的同义词和反义词，扩大词汇网络。'
                );
            }

            // 常用词汇扩展
            if (q.includes('常用词') || q.includes('高频词') || q.includes('必备词') || q.includes('核心词汇') || q.includes('基础词汇')) {
                return teach('英语核心高频词汇',
                    '**学术高频词（60个）**：\n1. environment 环境\n2. experience 经验/经历\n3. opportunity 机会\n4. necessary 必要的\n5. communicate 交流\n6. achievement 成就\n7. knowledge 知识\n8. responsibility 责任\n9. influence 影响\n10. technology 技术\n11. development 发展\n12. education 教育\n13. government 政府\n14. population 人口\n15. tradition 传统\n16. advantage 优势\n17. challenge 挑战\n18. recognize 认出/承认\n19. recommend 推荐\n20. participate 参加\n21. significant 重要的/有意义的\n22. contemporary 当代的\n23. phenomenon 现象\n24. perspective 观点/视角\n25. demonstrate 证明/展示\n26. fundamental 基础的/根本的\n27. substantial 大量的/实质的\n28. consequence 结果/后果\n29. establish 建立\n30. maintain 维持/维护\n31. obtain 获得\n32. require 要求/需要\n33. contribute 贡献\n34. approach 方法/接近\n35. evaluate 评估\n36. analyze 分析\n37. interpret 解释/口译\n38. implement 实施\n39. investigate 调查\n40. facilitate 促进\n41. acknowledge 承认/致谢\n42. advocate 提倡/拥护\n43. allocate 分配\n44. anticipate 预期\n45. assure 保证\n46. clarify 澄清\n47. coincide 同时发生/一致\n48. compile 汇编/编纂\n49. comply 遵守\n50. conceive 构想\n51. confine 限制\n52. consolidate 巩固\n53. contradict 反驳\n54. convert 转换\n55. deduce 推断\n56. denote 表示\n57. derive 得到/源于\n58. diminish 减少\n59. discriminate 区分/歧视\n60. displace 取代\n\n**常见短语/习语（10个）**：\n1. break the ice 打破僵局\n2. a piece of cake 小菜一碟\n3. hit the books 用功读书\n4. under the weather 身体不适\n5. once in a blue moon 千载难逢\n6. cost an arm and a leg 昂贵\n7. bite the bullet 咬紧牙关\n8. the ball is in your court 轮到你决定了\n9. burn the midnight oil 熬夜\n10. a blessing in disguise 因祸得福',
                    '用 "opportunity" 造句',
                    'This is a great opportunity to learn new skills.\n（这是一个学习新技能的好机会。）\n\nDon\'t let this opportunity slip away.\n（别让这个机会溜走。）',
                    '常见错误：\n• opportunity 和 chance 混用（opportunity 更正式）\n• experience 作"经验"时不可数，作"经历"时可数',
                    '每天背诵5个高频词，一周积累35个。用新词造句加深记忆。'
                );
            }

            // 英语歌曲
            if (q.includes('英语歌') || q.includes('英文歌') || q.includes('英文歌曲') || q.includes('歌词') || q.includes('song')) {
                return teach('经典英语歌曲推荐',
                    '**10首经典英语歌曲及歌词摘录**：\n\n1. **Yesterday - The Beatles**\n"Yesterday, all my troubles seemed so far away.\nNow it looks as though they\'re here to stay.\nOh, I believe in yesterday."\n\n2. **Let It Be - The Beatles**\n"When I find myself in times of trouble,\nMother Mary comes to me,\nSpeaking words of wisdom, let it be."\n\n3. **You Are My Sunshine**\n"You are my sunshine, my only sunshine.\nYou make me happy when skies are gray.\nYou\'ll never know, dear, how much I love you.\nPlease don\'t take my sunshine away."\n\n4. **Lemon Tree - Fool\'s Garden**\n"I\'m sitting here in the boring room.\nIt\'s just another rainy Sunday afternoon.\nI\'m wasting my time, I got nothing to do.\nI\'m hanging around, I\'m waiting for you."\n\n5. **Take Me Home, Country Roads - John Denver**\n"Country roads, take me home\nTo the place I belong\nWest Virginia, mountain mama\nTake me home, country roads."\n\n6. **My Heart Will Go On - Celine Dion**\n"Every night in my dreams\nI see you, I feel you\nThat is how I know you go on.\nFar across the distance\nAnd spaces between us\nYou have come to show you go on."\n\n7. **We Are the World**\n"We are the world, we are the children\nWe are the ones who make a brighter day\nSo let\'s start giving."\n\n8. **Edelweiss - The Sound of Music**\n"Edelweiss, edelweiss\nEvery morning you greet me\nSmall and white, clean and bright\nYou look happy to meet me."\n\n9. **Auld Lang Syne**\n"Should auld acquaintance be forgot\nAnd never brought to mind?\nShould auld acquaintance be forgot\nAnd auld lang syne?"\n\n10. **Do-Re-Mi - The Sound of Music**\n"Doe, a deer, a female deer\nRay, a drop of golden sun\nMe, a name I call myself\nFar, a long, long way to run."',
                    '学唱英语歌曲的好处',
                    '1. **提高听力**：歌曲节奏慢，发音清晰，适合练习听力\n2. **扩充词汇**：歌词中包含大量日常用语和情感表达\n3. **学习语法**：歌词中自然呈现各种时态和句型\n4. **培养语感**：旋律帮助记忆，培养英语语感\n5. **了解文化**：歌曲反映英语国家的文化和价值观',
                    '常见错误：\n• 只记旋律不记歌词\n• 不理解歌词含义就唱\n• 选择语速太快的歌曲初学',
                    '推荐从慢歌开始，先理解歌词含义，再跟唱。'
                );
            }

            // 英语写作技巧
            if (q.includes('英语写作') || q.includes('英语作文') || q.includes('essay') || q.includes('composition') || q.includes('英文写作')) {
                return teach('英语写作技巧',
                    '**议论文结构（Essay Structure）**：\n\n**Introduction（开头段）**：\n• Hook：吸引读者的开头（名言、问题、数据、故事）\n• Background：背景信息\n• Thesis Statement：中心论点\n\n**Body Paragraphs（主体段，通常2-3段）**：\n• Topic Sentence：主题句\n• Supporting Evidence：论据（例子、数据、引用）\n• Explanation：解释说明\n• Transition：过渡句\n\n**Conclusion（结尾段）**：\n• Restate Thesis：重申论点（换种说法）\n• Summary：总结要点\n• Final Thought：升华/展望/建议\n\n**常用连接词**：\n• 递进：furthermore, moreover, in addition, besides\n• 转折：however, nevertheless, on the contrary, although\n• 因果：therefore, consequently, as a result, thus\n• 举例：for example, for instance, such as\n• 总结：in conclusion, to sum up, in summary',
                    '以"The Importance of Reading"为题写开头段',
                    '**示例开头**：\n\n"Francis Bacon once said, \'Reading makes a full man.\' In today\'s digital age, where短视频 and social media dominate our attention, the habit of reading seems to be fading. However, reading remains one of the most valuable activities for personal growth. This essay will explore why reading is essential for students in the modern world."\n\n分析：\n• Hook：引用培根名言\n• Background：数字时代阅读习惯衰退\n• Thesis：探讨阅读对学生的重要性',
                    '常见错误：\n• 开头太长，迟迟不入题\n• 主体段缺少主题句\n• 论据和论点不相关\n• 结尾只是简单重复开头',
                    '每周写一篇英语作文，找老师或同学批改。'
                );
            }

            // 短语动词查询
            if (q.includes('短语动词') || q.includes('phrasal verb') || q.includes('动词短语')) {
                return teach('英语常用短语动词（25个）',
                    '**常用短语动词**：\n1. **give up** - 放弃：Don\'t give up!（别放弃！）\n2. **take off** - 脱下/起飞：Take off your shoes.（脱下鞋子。）\n3. **put on** - 穿上：Put on your coat.（穿上外套。）\n4. **look after** - 照顾：She looks after her little brother.（她照顾弟弟。）\n5. **turn on/off** - 打开/关闭：Turn on the light.（开灯。）\n6. **wake up** - 醒来：I wake up at 7 every day.（我每天7点醒来。）\n7. **find out** - 发现/查明：I need to find out the truth.（我需要查明真相。）\n8. **make up** - 编造/化妆：Don\'t make up stories.（别编故事。）\n9. **get up** - 起床：I get up early.（我起得早。）\n10. **go on** - 继续：Go on reading.（继续读。）\n11. **work out** - 锻炼/算出：I work out every morning.（我每天早上锻炼。）\n12. **set up** - 建立/设置：They set up a new company.（他们建立了一家公司。）\n13. **come across** - 偶遇：I came across an old friend.（我偶遇了一位老朋友。）\n14. **call back** - 回电话：I\'ll call you back later.（我稍后回电话。）\n15. **break down** - 坏了/崩溃：My car broke down.（我的车坏了。）\n16. **bring up** - 抚养/提出：She brought up an interesting point.（她提出了一个有趣的观点。）\n17. **carry on** - 继续：Carry on with your work.（继续你的工作。）\n18. **cut down** - 削减：We need to cut down expenses.（我们需要削减开支。）\n19. **figure out** - 弄清楚：I can\'t figure out this problem.（我弄不懂这道题。）\n20. **hold on** - 稍等/坚持：Hold on a minute.（稍等一下。）\n21. **look forward to** - 期待：I look forward to meeting you.（期待见到你。）\n22. **pick up** - 捡起/学会：I picked up some French in Paris.（我在巴黎学了一些法语。）\n23. **run out of** - 用完：We\'ve run out of milk.（我们的牛奶用完了。）\n24. **set off** - 出发/引爆：We set off early in the morning.（我们一大早出发。）\n25. **take care of** - 照顾：Take care of yourself.（照顾好自己。）',
                    '用 "look after" 造句',
                    'She looks after her grandmother every weekend.\n（她每个周末照顾奶奶。）\n\nThe nurse looked after the patients carefully.\n（护士细心地照顾病人。）',
                    '常见错误：\n• 把短语动词拆开：look the cat after（错误）→ look after the cat\n• 混淆相似短语：take off（脱）vs put on（穿）',
                    '每天学2个短语动词，造2个句子，坚持一个月就能掌握60个。'
                );
            }

            // 英语谚语
            if (q.includes('谚语') || q.includes('格言') || q.includes('proverb') || q.includes('saying')) {
                return teach('英语常见谚语（20条）',
                    '1. **Actions speak louder than words.**\n   行动胜于言辞\n\n2. **Where there is a will, there is a way.**\n   有志者事竟成\n\n3. **A friend in need is a friend indeed.**\n   患难见真情\n\n4. **All roads lead to Rome.**\n   条条大路通罗马\n\n5. **An apple a day keeps the doctor away.**\n   一天一苹果，医生远离我\n\n6. **Better late than never.**\n   迟做总比不做好\n\n7. **Don\'t count your chickens before they hatch.**\n   不要过早乐观\n\n8. **Every cloud has a silver lining.**\n   黑暗中总有一线光明\n\n9. **Honesty is the best policy.**\n   诚实为上策\n\n10. **It\'s never too late to learn.**\n    活到老学到老\n\n11. **Knowledge is power.**\n    知识就是力量\n\n12. **Look before you leap.**\n    三思而后行\n\n13. **No pain, no gain.**\n    不劳无获\n\n14. **Practice makes perfect.**\n    熟能生巧\n\n15. **Rome wasn\'t built in a day.**\n    罗马不是一天建成的\n\n16. **The early bird catches the worm.**\n    早起的鸟儿有虫吃\n\n17. **Time is money.**\n    时间就是金钱\n\n18. **Two heads are better than one.**\n    三个臭皮匠顶个诸葛亮\n\n19. **When in Rome, do as the Romans do.**\n    入乡随俗\n\n20. **You can\'t have your cake and eat it too.**\n    鱼与熊掌不可兼得',
                    '用 "Practice makes perfect" 造句',
                    'Don\'t worry about your poor English. Practice makes perfect. Just keep trying every day.\n（别担心你的英语不好。熟能生巧。只要每天坚持练习。）',
                    '常见错误：\n• 直译导致中式英语\n• 在正式写作中过度使用谚语',
                    '熟记常用谚语，在口语和写作中适当使用，能让表达更地道。'
                );
            }

            // 英语时态总结
            if (q.includes('时态') || q.includes('tense') || q.includes('时态表') || q.includes('时态总结')) {
                return teach('英语时态总结表',
                    '**一般时态**：\n• **一般现在时**：主语 + 动词原形（三单加s/es）\n  用法：习惯、事实、永恒真理\n  例：She **works** in Beijing. Water **boils** at 100°C.\n\n• **一般过去时**：主语 + 动词过去式\n  用法：过去发生的动作\n  例：I **visited** Paris last year.\n\n• **一般将来时**：will/shall + 动词原形 / be going to + 动词原形\n  用法：将来的动作或计划\n  例：I **will call** you tomorrow. It **is going to rain**.\n\n**进行时态**：\n• **现在进行时**：am/is/are + doing\n  用法：正在进行的动作\n  例：She **is reading** a book now.\n\n• **过去进行时**：was/were + doing\n  用法：过去某时正在进行的动作\n  例：I **was sleeping** when you called.\n\n• **将来进行时**：will be + doing\n  用法：将来某时正在进行的动作\n  例：This time tomorrow, I **will be flying** to London.\n\n**完成时态**：\n• **现在完成时**：have/has + done\n  用法：过去发生对现在有影响，或从过去持续到现在\n  例：I **have finished** my homework. She **has lived** here for 10 years.\n\n• **过去完成时**：had + done\n  用法：过去的过去\n  例：When I arrived, the train **had left**.\n\n• **将来完成时**：will have + done\n  用法：将来某时之前完成的动作\n  例：By next month, I **will have completed** the project.\n\n**完成进行时**：\n• **现在完成进行时**：have/has been + doing\n  用法：从过去持续到现在，强调持续性\n  例：I **have been waiting** for two hours.',
                    '选择正确的时态填空：\n1. I ___ (live) in Beijing since 2010.\n2. She ___ (cook) when I came home.\n3. By 2030, we ___ (build) a new school.',
                    '1. I **have lived** in Beijing since 2010.（从2010年持续到现在）\n2. She **was cooking** when I came home.（过去某时正在进行的动作）\n3. By 2030, we **will have built** a new school.（将来某时之前完成）',
                    '常见错误：\n• 一般过去时和现在完成时混淆\n• 忘记第三人称单数加s\n• 进行时态忘记be动词\n• 完成时态忘记have/has',
                    '制作时态对比表格，每天练习一种时态的转换。'
                );
            }

            // 常见搭配
            if (q.includes('搭配') || q.includes('collocation') || q.includes('固定搭配') || q.includes('动词名词') || q.includes('形容词名词')) {
                return teach('英语常见搭配',
                    '**动词 + 名词搭配**：\n• make a decision 做决定\n• do homework 做作业\n• take a break 休息\n• have a rest 休息\n• give a speech 发表演讲\n• pay attention 注意\n• catch a cold 感冒\n• keep a promise 信守承诺\n• break a record 打破纪录\n• hold a meeting 召开会议\n\n**形容词 + 名词搭配**：\n• heavy rain 大雨\n• strong wind 强风\n• bright light 明亮的光线\n• loud noise  loud noise\n• deep water 深水\n• high temperature 高温\n• low price 低价\n• big problem 大问题\n• great idea 好主意\n• main reason 主要原因\n\n**介词搭配**：\n• depend on 依赖\n• interested in 对...感兴趣\n• good at 擅长\n• afraid of 害怕\n• proud of 为...骄傲\n• similar to 与...相似\n• different from 与...不同\n• responsible for 对...负责\n• famous for 因...著名\n• full of 充满',
                    '用正确的搭配填空：\n1. I need to ___ a decision.\n2. She is ___ in playing the piano.\n3. The room was ___ of people.',
                    '1. I need to **make** a decision.\n2. She is **interested** in playing the piano.\n3. The room was **full** of people.',
                    '常见错误：\n• do a decision（错误）→ make a decision\n• interested on（错误）→ interested in\n• full with（错误）→ full of',
                    '积累搭配时不要孤立记单词，要记词组。'
                );
            }

            // 商务英语
            if (q.includes('商务') || q.includes('business') || q.includes('邮件') || q.includes('email') || q.includes('会议') || q.includes('meeting') || q.includes('职场')) {
                return teach('商务英语基础',
                    '**商务邮件常用短语**：\n• 开头：\n  - I am writing to inquire about...\n  - I am writing in reference to...\n  - Thank you for your email regarding...\n• 正文：\n  - Please find attached...\n  - I would like to confirm...\n  - Could you please clarify...\n• 结尾：\n  - I look forward to hearing from you.\n  - Please let me know if you have any questions.\n  - Best regards / Kind regards / Sincerely\n\n**会议词汇**：\n• agenda 议程\n• minutes 会议纪要\n• chairperson 主持人\n• proposal 提案\n• deadline 截止日期\n• follow up 跟进\n• action item 行动项\n• quarterly report 季度报告\n• stakeholder 利益相关者\n• brainstorm 头脑风暴\n\n**电话用语**：\n• May I speak to...? 我可以和...通话吗？\n• I\'d like to leave a message. 我想留言。\n• I\'ll put you through. 我帮您转接。\n• The line is busy. 电话占线。\n• Could you call back later? 您能稍后再打来吗？',
                    '写一封商务邮件请求延期提交报告',
                    'Subject: Request for Extension on Report Deadline\n\nDear Mr. Smith,\n\nI am writing to request an extension on the quarterly report deadline.\n\nDue to unforeseen circumstances, we need additional time to gather and verify the financial data. We would greatly appreciate it if the deadline could be extended to next Friday.\n\nPlease let me know if this is acceptable.\n\nBest regards,\nLi Ming',
                    '常见错误：\n• 邮件主题不清晰\n• 语气过于随意或过于生硬\n• 忘记附件或忘记提及附件',
                    '多阅读商务邮件模板，注意语气的礼貌和专业。'
                );
            }

            // 习语表格
            if (q.includes('习语') || q.includes('成语') || q.includes('idiom')) {
                return renderTable(
                    ['习语', '英文', '例句', '用法'],
                    [
                        ['打破僵局', 'break the ice', 'Let\'s play a game to break the ice.', '会议/聚会开始时'],
                        ['小菜一碟', 'a piece of cake', 'The exam was a piece of cake.', '形容事情很简单'],
                        ['用功读书', 'hit the books', 'I need to hit the books tonight.', '考前突击复习'],
                        ['身体不适', 'under the weather', 'I\'m feeling under the weather.', '委婉表达生病'],
                        ['千载难逢', 'once in a blue moon', 'He visits once in a blue moon.', '形容极少发生'],
                        ['非常昂贵', 'cost an arm and a leg', 'That car costs an arm and a leg.', '价格太高'],
                        ['咬牙坚持', 'bite the bullet', 'I had to bite the bullet and study.', '面对困难不退缩'],
                        ['熬夜学习', 'burn the midnight oil', 'She burned the midnight oil.', '深夜学习/工作'],
                        ['因祸得福', 'a blessing in disguise', 'Losing that job was a blessing.', '坏事变好事'],
                        ['全力以赴', 'go the extra mile', 'He always goes the extra mile.', '付出额外努力'],
                    ]
                );
            }

            // 信件/邮件模板下载
            if (q.includes('信件') || q.includes('邮件') || q.includes('letter') || q.includes('模板') || q.includes('template') || q.includes('写信')) {
                return '**英语信件/邮件模板**\n\n' +
                    renderFileDownload('english_letter_template.txt',
                        'English Letter Template\n========================\n\n1. Informal Letter (非正式信件)\n--------------------------------\nDear [Name],\n\nHow are you? I hope this letter finds you well.\n\nI am writing to tell you about [topic].\n[Body paragraph 1: Main content]\n\n[Body paragraph 2: Additional details]\n\nI look forward to hearing from you soon.\n\nBest wishes,\n[Your Name]\n\n\n2. Formal Letter (正式信件)\n--------------------------------\nDear Sir/Madam,\n\nI am writing to [state purpose].\n\n[Body paragraph 1: Introduction and main point]\n\n[Body paragraph 2: Supporting details]\n\n[Body paragraph 3: Conclusion and call to action]\n\nI would appreciate your prompt attention to this matter.\n\nYours faithfully,\n[Your Name]\n\n\n3. Email Template (邮件模板)\n--------------------------------\nSubject: [Clear and specific subject]\n\nDear [Name],\n\nI hope this email finds you well.\n\nI am writing regarding [topic].\n\n[Main content]\n\nPlease let me know if you have any questions.\n\nBest regards,\n[Your Name]\n[Your Contact Information]') +
                    '\n\n**信件类型**：\n• 非正式信件：写给朋友/家人\n• 正式信件：写给公司/机构\n• 邮件：商务/学术沟通';
            }

            // 日常对话句型
            if (q.includes('日常对话') || q.includes('口语') || q.includes('句型') || q.includes('conversation') || q.includes('daily')) {
                return teach('英语日常对话常用句型（10个）',
                    '**10个常用对话句型**：\n1. **How are you? / How\'s it going?** - 你好吗？\n   → I\'m fine, thank you. / Not bad.\n2. **What do you do?** - 你做什么工作？\n   → I\'m a student. / I work in a hospital.\n3. **Could you help me, please?** - 请帮帮我好吗？\n   → Sure, no problem. / Of course.\n4. **I\'d like to...** - 我想...\n   → I\'d like to order a coffee, please.\n5. **How much is this?** - 这个多少钱？\n   → It\'s 20 dollars.\n6. **Where is...?** - ...在哪里？\n   → Where is the nearest bank?\n7. **What time is it?** - 几点了？\n   → It\'s half past three.\n8. **Can I have...?** - 我能要...吗？\n   → Can I have the menu, please?\n9. **Nice to meet you.** - 很高兴认识你。\n   → Nice to meet you too.\n10. **See you later. / Take care.** - 回头见/保重。\n    → See you tomorrow. / You too.',
                    '在餐厅点餐的对话',
                    'A: Good evening. A table for two, please.\nB: Of course. This way, please.\nA: Can I see the menu, please?\nB: Here you are. Are you ready to order?\nA: I\'d like the chicken salad, please.\nB: Anything to drink?\nA: A glass of water, please.\nB: Your order will be ready soon.',
                    '常见错误：\n• 用 "How old are you?" 问候（不礼貌，应用 How are you?）\n• 忘记礼貌用语：直接说 "I want..."（应用 I\'d like...）',
                    '多看英语对话视频，模仿语音语调，每天练习3个场景。'
                );
            }

            // 英语书信格式
            if (q.includes('书信') || q.includes('letter') || q.includes('写信')) {
                return teach('英语书信/邮件写作格式',
                    '**正式书信格式**：\n\n[你的地址]\n[日期]\n\nDear [称呼],\n\n[正文第一段：说明写信目的]\n[正文第二段：详细内容]\n[正文第三段：期待回复/结尾]\n\nYours sincerely,（不认识）\n或 Yours faithfully,（认识）\n[你的名字]\n\n**非正式书信格式**：\n\nDear [名字],\n\n[正文：随意聊天]\n\nBest wishes, / Love,\n[你的名字]\n\n**常用开头**：\n• I\'m writing to tell you about...\n• Thank you for your letter.\n• I was so happy to hear from you.\n\n**常用结尾**：\n• I look forward to hearing from you.\n• Please write back soon.\n• Give my regards to your family.',
                    '写一封邀请朋友参加生日派对的信',
                    'Dear Tom,\n\nHow are you? I\'m writing to invite you to my birthday party.\n\nThe party will be held at my house on Saturday, June 20th, at 6 pm. There will be cake, games, and lots of fun! Many of our classmates will be there too.\n\nPlease let me know if you can come. I hope to see you there!\n\nBest wishes,\nLi Ming',
                    '常见错误：\n• 忘记写日期和地址（正式信件必须）\n• 称呼和结尾不匹配（Dear Mr. Smith 配 Yours sincerely）\n• 正文太长或太短',
                    '背熟书信格式模板，考试时直接套用。'
                );
            }

            // 语法规则补充
            if (q.includes('冠词') || q.includes('介词用法') || q.includes('连词') || q.includes('article') || q.includes('preposition') || q.includes('conjunction') || q.includes('语法规则')) {
                return teach('英语核心语法规则',
                    '**冠词用法（Articles）**：\n• 不定冠词 a/an：泛指，第一次提到\n  a book（一本书），an apple（一个苹果，元音前用an）\n• 定冠词 the：特指，再次提到\n  the book I bought（我买的那本书）\n• 零冠词：专有名词、抽象名词、复数泛指\n  China, love, dogs are loyal\n\n**常用介词（Prepositions）**：\n• 时间：at（时刻）, on（日期/星期）, in（月/年/季节）\n  at 8:00, on Monday, in January\n• 地点：at（点）, on（面）, in（内部）\n  at the door, on the table, in the room\n• 方向：to（到）, from（从）, into（进入）\n• 方式：by（通过）, with（用）, in（用...语言）\n\n**常用连词（Conjunctions）**：\n• 并列连词：and（和）, but（但是）, or（或者）, so（所以）, for（因为）\n• 从属连词：because（因为）, although（虽然）, if（如果）, when（当...时）, while（然而/当...时）\n• 关联连词：both...and（两者都）, either...or（要么...要么）, neither...nor（既不...也不）, not only...but also（不但...而且）',
                    '填空：I woke up ___ 7:00 ___ Monday ___ January.\nShe went to school ___ bus ___ her friend.',
                    'I woke up **at** 7:00 **on** Monday **in** January.\n（时刻用at，星期用on，月份用in）\n\nShe went to school **by** bus **with** her friend.\n（by bus 乘公交，with her friend 和朋友一起）',
                    '常见错误：\n• in the Monday → on Monday（星期用on）\n• by a bus → by bus（交通工具by+名词，不加冠词）\n• although...but... → although和but不能同时使用\n• because...so... → because和so不能同时使用',
                    '每天做5道介词/冠词填空题，培养语感。'
                );
            }

            // 句子纠错
            if (q.includes('改错') || q.includes('纠错') || q.includes('句子改错') || q.includes('correction') || q.includes('find the error')) {
                return teach('英语句子纠错技巧',
                    '**常见错误类型**：\n1. **主谓不一致**：He don\'t → He doesn\'t\n2. **时态错误**：Yesterday I go → Yesterday I went\n3. **冠词误用**：a apple → an apple\n4. **介词搭配**：depend in → depend on\n5. **拼写错误**：becuase → because\n\n**纠错步骤**：\n1. 通读全句，理解句意\n2. 检查主语和谓语是否一致\n3. 检查时态是否正确\n4. 检查冠词、介词搭配\n5. 检查拼写',
                    '找出错误并改正：\n1. She don\'t likes play football.\n2. He have went to Beijing yesterday.\n3. The sun rise in the east.',
                    '1. She doesn\'t like playing football.\n   错误1：第三人称单数用 doesn\'t\n   错误2：like 后接动名词 doing\n\n2. He went to Beijing yesterday.\n   错误1：have 不需要（过去时直接用 went）\n   错误2：yesterday 用过去时\n\n3. The sun rises in the east.\n   错误：客观事实用一般现在时，第三人称单数 rises',
                    '每天做3道改错题，培养语感。'
                );
            }

            // 常见英语缩写
            if (q.includes('缩写') || q.includes('abbreviation') || q.includes('asap') || q.includes('fyi') || q.includes('btw')) {
                return teach('常见英语缩写',
                    '**15个常见英语缩写**：\n1. ASAP — As Soon As Possible（尽快）\n2. FYI — For Your Information（供你参考）\n3. BTW — By The Way（顺便说一下）\n4. IMO — In My Opinion（在我看来）\n5. DIY — Do It Yourself（自己动手）\n6. VIP — Very Important Person（贵宾）\n7. ATM — At The Moment（此刻/目前）\n8. LOL — Laugh Out Loud（大笑）\n9. FAQ — Frequently Asked Questions（常见问题）\n10. RSVP — Please Reply（请回复，法语Répondez S\'il Vous Plaît）\n11. ETA — Estimated Time of Arrival（预计到达时间）\n12. PS — Postscript（附言/又及）\n13. TBD — To Be Determined（待定）\n14. N/A — Not Applicable（不适用）\n15. CEO — Chief Executive Officer（首席执行官）',
                    '用缩写写一封简短邮件通知会议时间。',
                    'Subject: Meeting Tomorrow\nHi team,\nBTW, the meeting has been moved to 3 PM. FYI, the agenda is attached. Please RSVP ASAP.\nPS: Don\'t forget to bring your laptops.\nThanks!',
                    '注意：\n• 缩写多用于非正式场合（邮件、聊天）\n• 正式写作中应使用完整表达\n• RSVP来自法语，注意发音',
                    '积累常见缩写，提高阅读效率。'
                );
            }

            // 英语习语
            if (q.includes('习语') || q.includes('idiom') || q.includes('谚语') || q.includes('俗语') || q.includes('proverb')) {
                return teach('常见英语习语',
                    '**10个常见英语习语**：\n1. "Break a leg" — 祝你好运（字面：打断腿）\n2. "Piece of cake" — 小菜一碟/很容易\n3. "Hit the nail on the head" — 一针见血/说到点子上\n4. "Under the weather" — 身体不舒服\n5. "Bite the bullet" — 咬紧牙关/硬着头皮面对\n6. "Cost an arm and a leg" — 非常昂贵\n7. "Once in a blue moon" — 千载难逢/极少发生\n8. "The ball is in your court" — 轮到你做决定了\n9. "Spill the beans" — 泄露秘密\n10. "Burn the midnight oil" — 熬夜工作/学习',
                    '用习语填空：\n1. The exam was a ___. I finished in 10 minutes.\n2. She\'s ___, so she can\'t come to school today.\n3. You need to ___ to pass the math test.',
                    '1. piece of cake（考试很简单）\n2. under the weather（身体不舒服）\n3. burn the midnight oil（需要熬夜学习）',
                    '注意：\n• 习语不能字面翻译，要理解其引申含义\n• 习语在口语和写作中使用频率很高\n• 不同文化背景的习语含义可能不同',
                    '每天学习一个习语，尝试在写作中使用。'
                );
            }

            // 英语标点规则
            if (q.includes('标点') || q.includes('punctuation') || q.includes('逗号') || q.includes('句号') || q.includes('引号')) {
                return teach('英语标点规则',
                    '**英语标点符号规则**：\n\n**句号（.）**：\n• 用于陈述句结尾：I like reading.\n• 缩写中：Mr. / Dr. / etc.\n\n**逗号（,）**：\n• 列举三个以上事物：apples, oranges, and bananas\n• 连接两个独立从句（加and/but/so）：I was tired, so I went to bed.\n• 引导短语后：In my opinion, this is correct.\n\n**问号（?）**：疑问句结尾\n\n**感叹号（!）**：感叹句/祈使句结尾\n\n**引号（""）**：\n• 直接引语：She said, "Hello!"\n• 文章/歌曲名：I read "The Great Gatsby".\n\n**撇号（\'）**：\n• 所有格：Tom\'s book\n• 缩写：don\'t / can\'t / it\'s',
                    '改正标点错误：\n1. she said "i am happy"\n2. I bought apples oranges and bananas\n3. Its a beautiful day',
                    '1. She said, "I am happy."\n   （首字母大写、加逗号引号、句号）\n2. I bought apples, oranges, and bananas.\n   （列举用逗号分隔，最后加and）\n3. It\'s a beautiful day.\n   （It\'s = It is，撇号不能少）',
                    '注意中英文标点区别：英文用.而不是。，英文用,而不是，',
                    '写作时注意标点规范，养成好习惯。'
                );
            }

            // 中国学生常见英语错误
            if (q.includes('中国学生') || q.includes('常见错误') || q.includes('chinese mistake') || q.includes('中式英语') || q.includes('chinglish')) {
                return teach('中国学生常见英语错误',
                    '**常见中式英语错误**：\n\n1. "I very like it" → "I like it very much"\n   （very不能直接修饰动词）\n\n2. "Although...but..." → "Although..." 或 "...but..."\n   （although和but不能同时使用）\n\n3. "Open the light" → "Turn on the light"\n   （开灯用turn on）\n\n4. "I was born in 2008 year" → "I was born in 2008"\n   （年份前不加year）\n\n5. "How to say this in English?" → "How do you say this in English?"\n   （how to不能单独作问句）\n\n6. "My English is very poor" → "My English needs improvement"\n   （poor过于消极）\n\n7. "Play computer" → "Use the computer" / "Play computer games"\n\n8. "Give you" → "Give it to you"\n   （give后需加it再加to somebody）',
                    '改正以下句子：\n1. I very like play basketball.\n2. Although he is young, but he is smart.\n3. How to spell this word?',
                    '1. I like playing basketball very much.\n   （very much修饰动词like；play后接-ing）\n2. Although he is young, he is smart.\n   （去掉but）\n3. How do you spell this word?\n   （改为完整疑问句）',
                    '建议：\n• 多读英文原版材料，培养语感\n• 记住固定搭配，不要逐字翻译\n• 写作后检查是否有时态、主谓一致等错误',
                    '建立自己的错误本，记录常犯错误并定期复习。'
                );
            }

            // 虚拟语气
            if (q.includes('虚拟语气') || q.includes('subjunctive') || q.includes('虚拟') || q.includes('wish') || q.includes('if only') || q.includes('would rather')) {
                return teach('英语虚拟语气（Subjunctive Mood）',
                    '**虚拟语气用于表达假设、愿望、建议等非真实情况**\n\n**与现在事实相反**（if从句用过去式）：\n• If I **were** you, I **would study** harder.\n• If he **had** time, he **would help** us.\n\n**与过去事实相反**（if从句用过去完成时）：\n• If I **had known** the answer, I **would have told** you.\n• If she **had studied** harder, she **would have passed**.\n\n**与将来事实相反**（if从句用should/were to + 动词原形）：\n• If it **should rain** tomorrow, we **would cancel** the trip.\n\n**其他虚拟语气用法**：\n• wish + 过去式：I wish I **were** taller.（与现在相反）\n• wish + 过去完成时：I wish I **had studied** harder.（与过去相反）\n• suggest/recommend/insist + (should) + 动词原形：\n  I suggest that he **(should) go** to bed early.\n• It is important that... + (should) + 动词原形：\n  It is important that everyone **(should) attend** the meeting.',
                    '用虚拟语气完成句子：If I ___ (be) a bird, I ___ (fly) to you.',
                    'If I **were** a bird, I **would fly** to you.\n\n解析：这是与现在事实相反的虚拟语气。\n• if从句用过去式（be动词一律用were）\n• 主句用 would/could/should/might + 动词原形',
                    '常见错误：\n• if从句中be动词用was而不是were（虚拟语气中be统一用were）\n• 与过去事实相反时，if从句忘记用过去完成时 had done\n• suggest后接should时忘记省略should\n• 混淆真实条件句和虚拟条件句',
                    '记住三种时间对应的动词形式：现在→过去式，过去→过去完成时，将来→should+原形。'
                );
            }

            // 被动语态
            if (q.includes('被动语态') || q.includes('passive voice') || q.includes('被动') || q.includes('be done') || q.includes('by')) {
                return teach('英语被动语态转换规则（Passive Voice）',
                    '**基本结构**：主语 + be + 过去分词 (+ by + 执行者)\n\n**各时态被动语态**：\n• 一般现在时：am/is/are + done\n  Active: She writes a letter. → Passive: A letter **is written** by her.\n• 一般过去时：was/were + done\n  Active: He broke the window. → Passive: The window **was broken** by him.\n• 一般将来时：will be + done\n  Active: They will finish it. → Passive: It **will be finished** by them.\n• 现在进行时：am/is/are being + done\n  Active: She is cleaning the room. → Passive: The room **is being cleaned** by her.\n• 现在完成时：have/has been + done\n  Active: He has eaten the cake. → Passive: The cake **has been eaten** by him.\n\n**不能用于被动语态的情况**：\n• 不及物动词（happen, appear, disappear）\n• 系动词（be, seem, look, feel）\n• 某些及物动词短语（belong to, take place）',
                    '将下列句子改为被动语态：\n1. Tom cleans the room every day.\n2. They built this bridge in 1990.\n3. She is writing a report now.',
                    '1. The room **is cleaned** by Tom every day.\n   （一般现在时被动：is + done）\n\n2. This bridge **was built** in 1990.\n   （一般过去时被动：was + done）\n\n3. A report **is being written** by her now.\n   （现在进行时被动：is being + done）',
                    '常见错误：\n• 忘记改变be动词的时态（被动语态时态由原句时态决定）\n• 过去分词拼写错误（break→broken，write→written）\n• 双宾语动词被动时遗漏一个宾语\n• get + done 是口语中的被动形式，正式写作中少用',
                    '主动转被动三步：①宾语变主语 ②谓语变be+过去分词 ③主语变by+宾语。'
                );
            }

            // 非谓语动词
            if (q.includes('非谓语') || q.includes('动名词') || q.includes('不定式') || q.includes('分词') || q.includes('gerund') || q.includes('infinitive') || q.includes('participle') || q.includes('to do') || q.includes('doing') || q.includes('done')) {
                return teach('英语非谓语动词（Non-finite Verbs）',
                    '**三种非谓语动词**：\n\n**1. 动名词（Gerund）doing**：\n• 作主语：**Swimming** is good exercise.\n• 作宾语：I enjoy **reading** books.\n• 作表语：My hobby is **collecting** stamps.\n• 只能接动名词的动词：enjoy, finish, avoid, mind, practice, suggest, consider, keep\n\n**2. 不定式（Infinitive）to do**：\n• 作主语：**To learn** English well is important.\n• 作宾语：I want **to travel** around the world.\n• 作目的状语：I study hard **to pass** the exam.\n• 作宾补：She asked me **to help** her.\n• 只能接不定式的动词：want, hope, decide, plan, agree, refuse, offer, promise\n\n**3. 分词（Participle）**：\n• 现在分词 doing（主动/进行）：\n  The **crying** baby needs milk.（正在哭的婴儿）\n• 过去分词 done（被动/完成）：\n  The **broken** window was fixed.（被打碎的窗户）\n\n**易混辨析**：\n• stop doing（停止正在做的事） vs stop to do（停下来去做另一件事）\n• remember doing（记得做过） vs remember to do（记得要去做）\n• forget doing（忘记做过） vs forget to do（忘记要去做）\n• try doing（尝试做） vs try to do（努力去做）',
                    '用正确形式填空：\n1. I enjoy ___ (play) basketball.\n2. She decided ___ (study) abroad.\n3. The ___ (break) glass is on the floor.',
                    '1. I enjoy **playing** basketball.\n   （enjoy后接动名词doing）\n\n2. She decided **to study** abroad.\n   （decide后接不定式to do）\n\n3. The **broken** glass is on the floor.\n   （glass与break是被动关系，用过去分词done）',
                    '常见错误：\n• enjoy/finish/avoid后接to do（应接doing）\n• want/hope/decide后接doing（应接to do）\n• 主动被动关系判断错误：\n  interesting（令人感兴趣的，主动）vs interested（感到有趣的，被动）',
                    '记住哪些动词只接doing，哪些只接to do，这是考试重点。'
                );
            }

            // 英语音标基础
            if (q.includes('音标') || q.includes('发音规则') || q.includes('phonetics') || q.includes('元音') || q.includes('辅音') || q.includes('vowel') || q.includes('consonant') || q.includes('读音规则')) {
                return teach('英语音标基础（Phonetics）',
                    '**元音（Vowels）——20个**：\n\n**单元音（12个）**：\n• 前元音：/iː/（see）, /ɪ/（sit）, /e/（bed）, /æ/（cat）\n• 中元音：/ʌ/（cup）, /ɜː/（bird）, /ə/（about）\n• 后元音：/uː/（too）, /ʊ/（put）, /ɔː/（door）, /ɒ/（hot）, /ɑː/（car）\n\n**双元音（8个）**：\n• /eɪ/（day）, /aɪ/（my）, /ɔɪ/（boy）\n• /aʊ/（now）, /əʊ/（go）, /ɪə/（near）\n• /eə/（hair）, /ʊə/（pure）\n\n**辅音（Consonants）——28个**：\n\n**清辅音（声带不振动，11个）**：\n/p/（pen）, /t/（ten）, /k/（cat）, /f/（fish）, /θ/（think）, /s/（sun）, /ʃ/（she）, /tʃ/（chair）, /h/（hat）, /ts/（cats）, /tr/（tree）\n\n**浊辅音（声带振动，17个）**：\n/b/（big）, /d/（dog）, /ɡ/（go）, /v/（very）, /ð/（this）, /z/（zoo）, /ʒ/（measure）, /dʒ/（jam）, /m/（man）, /n/（no）, /ŋ/（sing）, /l/（leg）, /r/（red）, /w/（we）, /j/（yes）, /dz/（beds）, /dr/（drink）\n\n**发音技巧**：\n• 元音发音时气流不受阻碍，声带振动\n• 辅音发音时气流受到不同程度阻碍\n• 清辅音送气强，声带不振动；浊辅音声带振动',
                    '写出下列单词的音标：\n1. cat  2. ship  3. book  4. think  5. this',
                    '1. cat → /kæt/\n2. ship → /ʃɪp/\n3. book → /bʊk/\n4. think → /θɪŋk/（th发清辅音/θ/）\n5. this → /ðɪs/（th发浊辅音/ð/）\n\n注意：think和this中的th发音不同！\n• think → /θ/（清辅音，舌尖轻触上齿）\n• this → /ð/（浊辅音，声带振动）',
                    '常见错误：\n• /θ/和/ð/混淆（think vs this）\n• /v/和/w/混淆（very vs we）\n• /ʃ/和/s/混淆（she vs see）\n• 长元音和短元音不分（/iː/ vs /ɪ/）\n• 双元音发音不饱满，只发了一个音',
                    '多听多模仿，对着镜子练习口型。重点区分易混音标。'
                );
            }

            return null;
        }

        // ========== 4. 语文智能处理 ==========
        function handleChinese(question, cleanQ) {
            const q = question.toLowerCase();

            // 常见诗句直接回答（优先处理，避免被虚词逻辑拦截）
            const poemLines = {
                '床前明月光': { title: '静夜思', author: '李白', dynasty: '唐', content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。', note: '这首诗表达了诗人对故乡的思念之情。' },
                '春眠不觉晓': { title: '春晓', author: '孟浩然', dynasty: '唐', content: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。', note: '这首诗描写了春天早晨的景色和诗人的感受。' },
                '白日依山尽': { title: '登鹳雀楼', author: '王之涣', dynasty: '唐', content: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。', note: '这首诗表达了积极向上、不断进取的精神。' },
                '日照香炉生紫烟': { title: '望庐山瀑布', author: '李白', dynasty: '唐', content: '日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。', note: '这首诗描绘了庐山瀑布的壮丽景色。' },
                '朝辞白帝彩云间': { title: '早发白帝城', author: '李白', dynasty: '唐', content: '朝辞白帝彩云间，千里江陵一日还。\n两岸猿声啼不住，轻舟已过万重山。', note: '这首诗写于李白被赦免后，表达了轻松愉快的心情。' },
                '两个黄鹂鸣翠柳': { title: '绝句', author: '杜甫', dynasty: '唐', content: '两个黄鹂鸣翠柳，一行白鹭上青天。\n窗含西岭千秋雪，门泊东吴万里船。', note: '这首诗描绘了生机勃勃的春天景色。' },
                '锄禾日当午': { title: '悯农', author: '李绅', dynasty: '唐', content: '锄禾日当午，汗滴禾下土。\n谁知盘中餐，粒粒皆辛苦。', note: '这首诗告诫人们要珍惜粮食，尊重劳动。' },
                '鹅鹅鹅': { title: '咏鹅', author: '骆宾王', dynasty: '唐', content: '鹅，鹅，鹅，曲项向天歌。\n白毛浮绿水，红掌拨清波。', note: '这是骆宾王七岁时写的诗，描绘了鹅在水中游动的姿态。' },
                '解落三秋叶': { title: '风', author: '李峤', dynasty: '唐', content: '解落三秋叶，能开二月花。\n过江千尺浪，入竹万竿斜。', note: '这首诗描写了风的力量和作用。' },
                '千山鸟飞绝': { title: '江雪', author: '柳宗元', dynasty: '唐', content: '千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。', note: '这首诗描绘了冬日江边的孤寂景象。' },
                '远上寒山石径斜': { title: '山行', author: '杜牧', dynasty: '唐', content: '远上寒山石径斜，白云生处有人家。\n停车坐爱枫林晚，霜叶红于二月花。', note: '这首诗描绘了秋天山林的美丽景色。' },
                '慈母手中线': { title: '游子吟', author: '孟郊', dynasty: '唐', content: '慈母手中线，游子身上衣。\n临行密密缝，意恐迟迟归。\n谁言寸草心，报得三春晖。', note: '这首诗歌颂了母爱的伟大。' },
                '岱宗夫如何': { title: '望岳', author: '杜甫', dynasty: '唐', content: '岱宗夫如何？齐鲁青未了。\n造化钟神秀，阴阳割昏晓。\n荡胸生曾云，决眦入归鸟。\n会当凌绝顶，一览众山小。', note: '这首诗表达了诗人攀登高峰、俯视一切的雄心壮志。' },
                '国破山河在': { title: '春望', author: '杜甫', dynasty: '唐', content: '国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。\n白头搔更短，浑欲不胜簪。', note: '这首诗写于安史之乱中，表达了诗人忧国忧民的情怀。' },
                '月落乌啼霜满天': { title: '枫桥夜泊', author: '张继', dynasty: '唐', content: '月落乌啼霜满天，江枫渔火对愁眠。\n姑苏城外寒山寺，夜半钟声到客船。', note: '这首诗描绘了秋夜泊船枫桥的所见所闻。' },
                '离离原上草': { title: '赋得古原草送别', author: '白居易', dynasty: '唐', content: '离离原上草，一岁一枯荣。\n野火烧不尽，春风吹又生。\n远芳侵古道，晴翠接荒城。\n又送王孙去，萋萋满别情。', note: '这首诗借草的生命力表达了离别之情。' },
                '明月几时有': { title: '水调歌头·明月几时有', author: '苏轼', dynasty: '宋', content: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。...但愿人长久，千里共婵娟。', note: '这首词表达了苏轼对弟弟苏辙的思念和美好祝愿。' },
                '大江东去': { title: '念奴娇·赤壁怀古', author: '苏轼', dynasty: '宋', content: '大江东去，浪淘尽，千古风流人物。...人生如梦，一尊还酹江月。', note: '这首词抒发了对历史英雄的缅怀和人生感慨。' },
            };
            for (const [line, info] of Object.entries(poemLines)) {
                if (cleanQ.includes(line)) {
                    return `📜 **${info.title}**（${info.dynasty}·${info.author}）\n\n${info.content}\n\n💡 ${info.note}`;
                }
            }

            // ========== 新增：诗词作者查询数据库 ==========
            const poemAuthorDB = {
                '念奴娇·赤壁怀古': { author: '苏轼', dynasty: '宋', type: '词' },
                '念奴娇': { author: '苏轼', dynasty: '宋', type: '词' },
                '赤壁怀古': { author: '苏轼', dynasty: '宋', type: '词' },
                '水调歌头': { author: '苏轼', dynasty: '宋', type: '词' },
                '水调歌头·明月几时有': { author: '苏轼', dynasty: '宋', type: '词' },
                '明月几时有': { author: '苏轼', dynasty: '宋', type: '词' },
                '声声慢': { author: '李清照', dynasty: '宋', type: '词' },
                '永遇乐·京口北固亭怀古': { author: '辛弃疾', dynasty: '宋', type: '词' },
                '永遇乐': { author: '辛弃疾', dynasty: '宋', type: '词' },
                '雨霖铃': { author: '柳永', dynasty: '宋', type: '词' },
                '将进酒': { author: '李白', dynasty: '唐', type: '诗' },
                '行路难': { author: '李白', dynasty: '唐', type: '诗' },
                '蜀道难': { author: '李白', dynasty: '唐', type: '诗' },
                '梦游天姥吟留别': { author: '李白', dynasty: '唐', type: '诗' },
                '静夜思': { author: '李白', dynasty: '唐', type: '诗' },
                '望庐山瀑布': { author: '李白', dynasty: '唐', type: '诗' },
                '早发白帝城': { author: '李白', dynasty: '唐', type: '诗' },
                '赠汪伦': { author: '李白', dynasty: '唐', type: '诗' },
                '望天门山': { author: '李白', dynasty: '唐', type: '诗' },
                '黄鹤楼送孟浩然之广陵': { author: '李白', dynasty: '唐', type: '诗' },
                '登高': { author: '杜甫', dynasty: '唐', type: '诗' },
                '春望': { author: '杜甫', dynasty: '唐', type: '诗' },
                '望岳': { author: '杜甫', dynasty: '唐', type: '诗' },
                '绝句': { author: '杜甫', dynasty: '唐', type: '诗' },
                '茅屋为秋风所破歌': { author: '杜甫', dynasty: '唐', type: '诗' },
                '春晓': { author: '孟浩然', dynasty: '唐', type: '诗' },
                '登鹳雀楼': { author: '王之涣', dynasty: '唐', type: '诗' },
                '凉州词': { author: '王之涣', dynasty: '唐', type: '诗' },
                '凉州词·黄河远上白云间': { author: '王之涣', dynasty: '唐', type: '诗' },
                '出塞': { author: '王昌龄', dynasty: '唐', type: '诗' },
                '芙蓉楼送辛渐': { author: '王昌龄', dynasty: '唐', type: '诗' },
                '送元二使安西': { author: '王维', dynasty: '唐', type: '诗' },
                '九月九日忆山东兄弟': { author: '王维', dynasty: '唐', type: '诗' },
                '山行': { author: '杜牧', dynasty: '唐', type: '诗' },
                '清明': { author: '杜牧', dynasty: '唐', type: '诗' },
                '江南春': { author: '杜牧', dynasty: '唐', type: '诗' },
                '泊秦淮': { author: '杜牧', dynasty: '唐', type: '诗' },
                '长恨歌': { author: '白居易', dynasty: '唐', type: '诗' },
                '琵琶行': { author: '白居易', dynasty: '唐', type: '诗' },
                '赋得古原草送别': { author: '白居易', dynasty: '唐', type: '诗' },
                '钱塘湖春行': { author: '白居易', dynasty: '唐', type: '诗' },
                '忆江南': { author: '白居易', dynasty: '唐', type: '诗' },
                '观沧海': { author: '曹操', dynasty: '东汉', type: '诗' },
                '龟虽寿': { author: '曹操', dynasty: '东汉', type: '诗' },
                '短歌行': { author: '曹操', dynasty: '东汉', type: '诗' },
                '饮酒': { author: '陶渊明', dynasty: '东晋', type: '诗' },
                '归园田居': { author: '陶渊明', dynasty: '东晋', type: '诗' },
                '悯农': { author: '李绅', dynasty: '唐', type: '诗' },
                '咏鹅': { author: '骆宾王', dynasty: '唐', type: '诗' },
                '游子吟': { author: '孟郊', dynasty: '唐', type: '诗' },
                '江雪': { author: '柳宗元', dynasty: '唐', type: '诗' },
                '枫桥夜泊': { author: '张继', dynasty: '唐', type: '诗' },
                '回乡偶书': { author: '贺知章', dynasty: '唐', type: '诗' },
                '咏柳': { author: '贺知章', dynasty: '唐', type: '诗' },
                '寻隐者不遇': { author: '贾岛', dynasty: '唐', type: '诗' },
                '题西林壁': { author: '苏轼', dynasty: '宋', type: '诗' },
                '饮湖上初晴后雨': { author: '苏轼', dynasty: '宋', type: '诗' },
                '泊船瓜洲': { author: '王安石', dynasty: '宋', type: '诗' },
                '元日': { author: '王安石', dynasty: '宋', type: '诗' },
                '游山西村': { author: '陆游', dynasty: '宋', type: '诗' },
                '示儿': { author: '陆游', dynasty: '宋', type: '诗' },
                '过零丁洋': { author: '文天祥', dynasty: '宋', type: '诗' },
                '满江红': { author: '岳飞', dynasty: '宋', type: '词' },
                '如梦令': { author: '李清照', dynasty: '宋', type: '词' },
                '一剪梅': { author: '李清照', dynasty: '宋', type: '词' },
                '破阵子': { author: '辛弃疾', dynasty: '宋', type: '词' },
                '青玉案·元夕': { author: '辛弃疾', dynasty: '宋', type: '词' },
                '天净沙·秋思': { author: '马致远', dynasty: '元', type: '曲' },
                '己亥杂诗': { author: '龚自珍', dynasty: '清', type: '诗' },
                '竹石': { author: '郑燮', dynasty: '清', type: '诗' },
                '石灰吟': { author: '于谦', dynasty: '明', type: '诗' },
                '赤壁赋': { author: '苏轼', dynasty: '宋', type: '文' },
                '岳阳楼记': { author: '范仲淹', dynasty: '宋', type: '文' },
                '醉翁亭记': { author: '欧阳修', dynasty: '宋', type: '文' },
                '出师表': { author: '诸葛亮', dynasty: '三国', type: '文' },
                '陈情表': { author: '李密', dynasty: '西晋', type: '文' },
                '兰亭集序': { author: '王羲之', dynasty: '东晋', type: '文' },
                '滕王阁序': { author: '王勃', dynasty: '唐', type: '文' },
                '阿房宫赋': { author: '杜牧', dynasty: '唐', type: '文' },
                '陋室铭': { author: '刘禹锡', dynasty: '唐', type: '文' },
                '爱莲说': { author: '周敦颐', dynasty: '宋', type: '文' },
                '小石潭记': { author: '柳宗元', dynasty: '唐', type: '文' },
                '记承天寺夜游': { author: '苏轼', dynasty: '宋', type: '文' },
                '马说': { author: '韩愈', dynasty: '唐', type: '文' },
                '师说': { author: '韩愈', dynasty: '唐', type: '文' },
                '劝学': { author: '荀子', dynasty: '战国', type: '文' },
                '过秦论': { author: '贾谊', dynasty: '西汉', type: '文' },
                '送东阳马生序': { author: '宋濂', dynasty: '明', type: '文' },
                '荷塘月色': { author: '朱自清', dynasty: '现代', type: '散文' },
                '背影': { author: '朱自清', dynasty: '现代', type: '散文' },
                '春': { author: '朱自清', dynasty: '现代', type: '散文' },
                '匆匆': { author: '朱自清', dynasty: '现代', type: '散文' },
                '从百草园到三味书屋': { author: '鲁迅', dynasty: '现代', type: '散文' },
                '故乡': { author: '鲁迅', dynasty: '现代', type: '小说' },
                '呐喊': { author: '鲁迅', dynasty: '现代', type: '小说集' },
                '骆驼祥子': { author: '老舍', dynasty: '现代', type: '小说' },
                '茶馆': { author: '老舍', dynasty: '现代', type: '话剧' },
                '边城': { author: '沈从文', dynasty: '现代', type: '小说' },
                '围城': { author: '钱钟书', dynasty: '现代', type: '小说' },
                '春江花月夜': { author: '张若虚', dynasty: '唐', type: '诗' },
                '虞美人': { author: '李煜', dynasty: '五代', type: '词' },
                '渔歌子': { author: '张志和', dynasty: '唐', type: '词' },
                '望洞庭': { author: '刘禹锡', dynasty: '唐', type: '诗' },
                '浪淘沙': { author: '刘禹锡', dynasty: '唐', type: '诗' },
                '乌衣巷': { author: '刘禹锡', dynasty: '唐', type: '诗' },
            };
            // 检测"XX是谁的作品/谁写的/作者"等查询
            if (/谁.*作品|谁.*写的|作者|是谁.*的/.test(cleanQ) || /《.+?》/.test(cleanQ)) {
                const titleMatch = cleanQ.match(/《(.+?)》/);
                if (titleMatch) {
                    const title = titleMatch[1].trim();
                    // 先查精确匹配
                    if (poemAuthorDB[title]) {
                        const info = poemAuthorDB[title];
                        return `📜 **《${title}》**\n\n**作者**：${info.dynasty} · ${info.author}\n**体裁**：${info.type}\n\n这是${info.dynasty}代${info.author}的经典${info.type}作。`;
                    }
                    // 模糊匹配（去掉副标题）
                    for (const [key, info] of Object.entries(poemAuthorDB)) {
                        if (title.includes(key) || key.includes(title)) {
                            return `📜 **《${title}》**\n\n**作者**：${info.dynasty} · ${info.author}\n**体裁**：${info.type}\n\n这是${info.dynasty}代${info.author}的经典${info.type}作。`;
                        }
                    }
                }
            }

            // ========== 新增：名句出处数据库 ==========
            const famousQuoteSource = {
                '落霞与孤鹜齐飞，秋水共长天一色': { title: '滕王阁序', author: '王勃', dynasty: '唐' },
                '落霞与孤鹜齐飞': { title: '滕王阁序', author: '王勃', dynasty: '唐' },
                '秋水共长天一色': { title: '滕王阁序', author: '王勃', dynasty: '唐' },
                '海内存知己，天涯若比邻': { title: '送杜少府之任蜀州', author: '王勃', dynasty: '唐' },
                '天生我材必有用，千金散尽还复来': { title: '将进酒', author: '李白', dynasty: '唐' },
                '天生我材必有用': { title: '将进酒', author: '李白', dynasty: '唐' },
                '长风破浪会有时，直挂云帆济沧海': { title: '行路难', author: '李白', dynasty: '唐' },
                '长风破浪会有时': { title: '行路难', author: '李白', dynasty: '唐' },
                '但愿人长久，千里共婵娟': { title: '水调歌头·明月几时有', author: '苏轼', dynasty: '宋' },
                '但愿人长久': { title: '水调歌头·明月几时有', author: '苏轼', dynasty: '宋' },
                '千里共婵娟': { title: '水调歌头·明月几时有', author: '苏轼', dynasty: '宋' },
                '大江东去，浪淘尽，千古风流人物': { title: '念奴娇·赤壁怀古', author: '苏轼', dynasty: '宋' },
                '大江东去': { title: '念奴娇·赤壁怀古', author: '苏轼', dynasty: '宋' },
                '人生自古谁无死，留取丹心照汗青': { title: '过零丁洋', author: '文天祥', dynasty: '宋' },
                '人生自古谁无死': { title: '过零丁洋', author: '文天祥', dynasty: '宋' },
                '留取丹心照汗青': { title: '过零丁洋', author: '文天祥', dynasty: '宋' },
                '先天下之忧而忧，后天下之乐而乐': { title: '岳阳楼记', author: '范仲淹', dynasty: '宋' },
                '先天下之忧而忧': { title: '岳阳楼记', author: '范仲淹', dynasty: '宋' },
                '醉翁之意不在酒': { title: '醉翁亭记', author: '欧阳修', dynasty: '宋' },
                '出淤泥而不染，濯清涟而不妖': { title: '爱莲说', author: '周敦颐', dynasty: '宋' },
                '出淤泥而不染': { title: '爱莲说', author: '周敦颐', dynasty: '宋' },
                '问君能有几多愁，恰似一江春水向东流': { title: '虞美人', author: '李煜', dynasty: '五代' },
                '问君能有几多愁': { title: '虞美人', author: '李煜', dynasty: '五代' },
                '恰似一江春水向东流': { title: '虞美人', author: '李煜', dynasty: '五代' },
                '寻寻觅觅，冷冷清清，凄凄惨惨戚戚': { title: '声声慢', author: '李清照', dynasty: '宋' },
                '莫等闲，白了少年头，空悲切': { title: '满江红', author: '岳飞', dynasty: '宋' },
                '莫等闲': { title: '满江红', author: '岳飞', dynasty: '宋' },
                '夕阳西下，断肠人在天涯': { title: '天净沙·秋思', author: '马致远', dynasty: '元' },
                '断肠人在天涯': { title: '天净沙·秋思', author: '马致远', dynasty: '元' },
                '落红不是无情物，化作春泥更护花': { title: '己亥杂诗', author: '龚自珍', dynasty: '清' },
                '落红不是无情物': { title: '己亥杂诗', author: '龚自珍', dynasty: '清' },
                '春风又绿江南岸': { title: '泊船瓜洲', author: '王安石', dynasty: '宋' },
                '千山鸟飞绝，万径人踪灭': { title: '江雪', author: '柳宗元', dynasty: '唐' },
                '同是天涯沦落人，相逢何必曾相识': { title: '琵琶行', author: '白居易', dynasty: '唐' },
                '同是天涯沦落人': { title: '琵琶行', author: '白居易', dynasty: '唐' },
                '春蚕到死丝方尽，蜡炬成灰泪始干': { title: '无题', author: '李商隐', dynasty: '唐' },
                '春蚕到死丝方尽': { title: '无题', author: '李商隐', dynasty: '唐' },
                '沉舟侧畔千帆过，病树前头万木春': { title: '酬乐天扬州初逢席上见赠', author: '刘禹锡', dynasty: '唐' },
                '海上升明月，天涯共此时': { title: '望月怀远', author: '张九龄', dynasty: '唐' },
                '海上生明月': { title: '望月怀远', author: '张九龄', dynasty: '唐' },
                '会当凌绝顶，一览众山小': { title: '望岳', author: '杜甫', dynasty: '唐' },
                '会当凌绝顶': { title: '望岳', author: '杜甫', dynasty: '唐' },
                '国破山河在，城春草木深': { title: '春望', author: '杜甫', dynasty: '唐' },
                '烽火连三月，家书抵万金': { title: '春望', author: '杜甫', dynasty: '唐' },
                '无边落木萧萧下，不尽长江滚滚来': { title: '登高', author: '杜甫', dynasty: '唐' },
                '两个黄鹂鸣翠柳，一行白鹭上青天': { title: '绝句', author: '杜甫', dynasty: '唐' },
                '离离原上草，一岁一枯荣': { title: '赋得古原草送别', author: '白居易', dynasty: '唐' },
                '野火烧不尽，春风吹又生': { title: '赋得古原草送别', author: '白居易', dynasty: '唐' },
                '谁言寸草心，报得三春晖': { title: '游子吟', author: '孟郊', dynasty: '唐' },
                '粉骨碎身浑不怕，要留清白在人间': { title: '石灰吟', author: '于谦', dynasty: '明' },
                '千磨万击还坚劲，任尔东西南北风': { title: '竹石', author: '郑燮', dynasty: '清' },
                '不识庐山真面目，只缘身在此山中': { title: '题西林壁', author: '苏轼', dynasty: '宋' },
                '欲穷千里目，更上一层楼': { title: '登鹳雀楼', author: '王之涣', dynasty: '唐' },
                '飞流直下三千尺，疑是银河落九天': { title: '望庐山瀑布', author: '李白', dynasty: '唐' },
                '举头望明月，低头思故乡': { title: '静夜思', author: '李白', dynasty: '唐' },
                '床前明月光': { title: '静夜思', author: '李白', dynasty: '唐' },
                '锄禾日当午，汗滴禾下土': { title: '悯农', author: '李绅', dynasty: '唐' },
                '谁知盘中餐，粒粒皆辛苦': { title: '悯农', author: '李绅', dynasty: '唐' },
            };
            // 检测名句出处查询
            if (/出自|出处|哪篇|哪首|哪篇文章|哪本书|哪部/.test(cleanQ) || /谁.*写的/.test(cleanQ)) {
                for (const [quote, info] of Object.entries(famousQuoteSource)) {
                    // 去掉标点后匹配
                    const quoteClean = quote.replace(/[，。、；：？！""''《》\s]/g, '');
                    const qClean = cleanQ.replace(/[，。、；：？！""''《》\s]/g, '');
                    if (qClean.includes(quoteClean) || cleanQ.includes(quote)) {
                        return `📜 **名句出处**\n\n**名句**：「${quote}」\n**出自**：《${info.title}》\n**作者**：${info.dynasty} · ${info.author}\n\n这是${info.dynasty}代${info.author}的名篇《${info.title}》中的千古名句。`;
                    }
                }
            }

            // ========== 新增：炼字分析 ==========
            const lianziAnalysis = {
                '绿': { poem: '泊船瓜洲', author: '王安石', original: '春风又绿江南岸，明月何时照我还。',
                    analysis: '**"绿"字的妙用分析**\n\n出处：王安石《泊船瓜洲》——"春风又绿江南岸，明月何时照我还。"\n\n1. **词性活用**："绿"字本为形容词，这里用作动词（形容词的使动用法），意为"使……变绿"。\n\n2. **化静为动**：一个"绿"字将春风拟人化，仿佛春风是一位画家，挥毫泼墨，将整个江南大地染成了绿色，充满了动态美。\n\n3. **色彩鲜明**：用"绿"字直接点出春天的主色调，给人以生机勃勃、春意盎然的视觉感受。\n\n4. **炼字过程**：据传王安石先后用了"到""过""入""满"等十多个字，最终才选定"绿"字，可见其用功之深。\n\n5. **情感表达**：以生机盎然的春景反衬思乡之情，乐景写哀，更添愁绪。' },
                '闹': { poem: '玉楼春', author: '宋祁', original: '红杏枝头春意闹。',
                    analysis: '**"闹"字的妙用分析**\n\n出处：宋祁《玉楼春》——"红杏枝头春意闹。"\n\n1. **以动写静**：用"闹"字写杏花，化静为动，赋予花朵以人的动作和情感。\n\n2. **通感手法**：视觉与听觉相通，仿佛能"听到"花开的热闹声音，生动传神。\n\n3. **境界全出**：王国维评价"着一\'闹\'字而境界全出"，一个字写出了春意盎然、百花争艳的繁盛景象。\n\n4. **拟人修辞**：将杏花比作嬉闹的孩童，活泼可爱，充满生命力。' },
                '推': { poem: '题李凝幽居', author: '贾岛', original: '鸟宿池边树，僧敲月下门。',
                    analysis: '**"推"字（与"敲"字）的妙用分析**\n\n出处：贾岛《题李凝幽居》——"鸟宿池边树，僧敲月下门。"\n\n1. **"推敲"典故**：贾岛最初想用"推"字，后经韩愈建议改为"敲"字，成为文学史上"推敲"典故的由来。\n\n2. **"敲"字之妙**：\n   - 以声衬静：月光下敲门的声音，反衬出夜的寂静\n   - 礼貌行为：敲门比推门更有礼貌，符合僧人身份\n   - 动作鲜明：比"推"字更具画面感\n\n3. **"推"字之妙**（若用推）：\n   - 更显幽居之僻静：说明门未闩，友人关系亲密\n   - 动作更轻柔：与月夜幽静的氛围更协调\n\n这个故事告诉我们炼字要结合语境反复推敲。' },
                '眼': { poem: '水龙吟·登建康赏心亭', author: '辛弃疾', original: '遥岑远目，献愁供恨，玉簪螺髻。落日楼头，断鸿声里，江南游子。把吴钩看了，栏杆拍遍，无人会，登临意。',
                    analysis: '**"看"与"拍"的妙用分析**\n\n出处：辛弃疾《水龙吟·登建康赏心亭》——"把吴钩看了，栏杆拍遍，无人会，登临意。"\n\n1. **"看"字**：反复端详宝刀（吴钩），表现了词人渴望杀敌报国却壮志难酬的苦闷。\n\n2. **"拍"字**：用力拍打栏杆，动作激烈，表现了内心无法抑制的愤懑与焦虑。\n\n3. **动作描写**：通过"看"和"拍"两个动作，生动刻画了一个英雄无用武之地的悲壮形象。' },
                '瘦': { poem: '如梦令', author: '李清照', original: '知否，知否？应是绿肥红瘦。',
                    analysis: '**"瘦"字的妙用分析**\n\n出处：李清照《如梦令》——"知否，知否？应是绿肥红瘦。"\n\n1. **拟人手法**：用"肥"和"瘦"描写叶子和花，赋予植物以人的体态特征。\n\n2. **对比鲜明**："绿肥"写叶子茂盛，"红瘦"写花朵凋零，对比中暗含惜春之情。\n\n3. **借代修辞**："绿"代指叶，"红"代指花，色彩鲜明，简洁凝练。\n\n4. **情感表达**：通过暮春花谢的景象，含蓄地表达了词人对春光流逝的感伤和惋惜。' },
                '多': { poem: '醉花阴', author: '李清照', original: '莫道不销魂，帘卷西风，人比黄花瘦。',
                    analysis: '**"瘦"字的妙用分析**\n\n出处：李清照《醉花阴》——"莫道不销魂，帘卷西风，人比黄花瘦。"\n\n1. **以花喻人**：将人比作菊花，突出清瘦憔悴的形象。\n\n2. **反衬手法**：菊花在秋风中傲立，人却因相思而消瘦，花与人形成对照。\n\n3. **情感含蓄**：不直接写思念之苦，而是通过"瘦"字暗示相思之深，含蓄蕴藉。' },
            };
            // 检测炼字分析请求
            // 先尝试提取引号中的目标字
            let lianziTargetChar = null;
            const lianziQuotedCharMatch = cleanQ.match(/[""「]([\u4e00-\u9fa5])[""」]字[的]?妙用|[""「]([\u4e00-\u9fa5])[""」]字[的]?用法/);
            if (lianziQuotedCharMatch) {
                lianziTargetChar = lianziQuotedCharMatch[1] || lianziQuotedCharMatch[2];
            }
            if (!lianziTargetChar) {
                const lianziMatch = cleanQ.match(/分析[""「]?([\u4e00-\u9fa5])[""」]?字[的]?妙用|分析[""「]?([\u4e00-\u9fa5])[""」]?字[的]?用法|[""「]([\u4e00-\u9fa5])[""」]字.*妙用/);
                if (lianziMatch) {
                    lianziTargetChar = lianziMatch[1] || lianziMatch[2] || lianziMatch[3];
                }
            }
            if (!lianziTargetChar) {
                const lianziFallbackMatch = cleanQ.match(/(.{1})字[的]?妙用|(.{1})字[的]?用法/);
                if (lianziFallbackMatch) {
                    lianziTargetChar = lianziFallbackMatch[1] || lianziFallbackMatch[2];
                }
            }
            if (lianziTargetChar) {
                if (lianziAnalysis[lianziTargetChar]) {
                    return `📝 **炼字分析**\n\n${lianziAnalysis[lianziTargetChar].analysis}`;
                }
                // 通用炼字分析方法指导
                return `📝 **炼字分析方法指导**\n\n分析「${lianziTargetChar}」字的妙用，建议从以下几个角度入手：\n\n1. **词性活用**：该字是否有词类活用？如形容词作动词、名词作动词等\n2. **修辞手法**：是否运用了比喻、拟人、通感、夸张等修辞\n3. **表达效果**：化静为动？以声衬静？化抽象为具体？\n4. **色彩与意象**：是否营造了鲜明的画面感\n5. **情感表达**：该字如何服务于全诗的情感表达\n6. **结构作用**：是否为全句的"诗眼"，统领全篇\n\n**答题模板**：\n"XX"字意为……，运用了……手法，生动形象地写出了……景象/情感，表达了作者……的思想感情。\n\n💡 请告诉我这个字出现在哪首诗/词中，我可以给出更具体的分析。`;
            }

            // ========== 新增：修辞手法比较 ==========
            const rhetoricCompare = {
                '比喻': { definition: '用相似的事物来打比方，要有本体和喻体', features: '必须有喻体（用来比喻的事物）', example: '月亮像一个大玉盘。', effect: '使描写更生动形象，化抽象为具体' },
                '拟人': { definition: '把事物当作人来写，赋予人的动作、情感', features: '没有喻体，直接用人的词语写物', example: '小草从土里探出头来。', effect: '使语言生动有趣，富有感情' },
                '排比': { definition: '三个或以上结构相似、语气一致的句子', features: '至少三个并列结构', example: '爱心是阳光，爱心是泉水，爱心是明月。', effect: '增强语势，表达强烈感情' },
                '夸张': { definition: '故意夸大或缩小事实', features: '有明显的夸大或缩小', example: '飞流直下三千尺。', effect: '突出特征，给人深刻印象' },
                '对偶': { definition: '字数相等、结构相同的两个短语或句子', features: '只有两个，字数结构完全对应', example: '两个黄鹂鸣翠柳，一行白鹭上青天。', effect: '音韵和谐，形式整齐' },
                '设问': { definition: '先提出问题，然后自己回答', features: '有问有答，自问自答', example: '谁是我们最可爱的人？我们的战士。', effect: '引起读者注意和思考' },
                '反问': { definition: '用疑问的形式表达确定的意思', features: '只问不答，答案在问句中', example: '难道我们不应该努力学习吗？', effect: '加强语气，比陈述句更有力' },
                '借代': { definition: '不直接说出名称，用相关特征代替', features: '用部分代整体、特征代人等', example: '红领巾搀扶老奶奶过马路。', effect: '形象生动，引发联想' },
            };
            // 检测修辞比较请求
            const rhetoricCompareMatch = cleanQ.match(/(.+?)和(.+?)(有什么|有啥)区别|(.+?)与(.+?)(有什么|有啥)区别|(.+?)跟(.+?)(有什么|有啥)区别|比较(.+?)和(.+?)/);
            if (rhetoricCompareMatch) {
                const r1 = rhetoricCompareMatch[1] || rhetoricCompareMatch[4] || rhetoricCompareMatch[7] || rhetoricCompareMatch[9];
                const r2 = rhetoricCompareMatch[2] || rhetoricCompareMatch[5] || rhetoricCompareMatch[8] || rhetoricCompareMatch[10];
                if (r1 && r2 && rhetoricCompare[r1] && rhetoricCompare[r2]) {
                    const a = rhetoricCompare[r1], b = rhetoricCompare[r2];
                    return `📝 **「${r1}」与「${r2}」的区别**\n\n**${r1}**：\n• 定义：${a.definition}\n• 特征：${a.features}\n• 例句：${a.example}\n• 作用：${a.effect}\n\n**${r2}**：\n• 定义：${b.definition}\n• 特征：${b.features}\n• 例句：${b.example}\n• 作用：${b.effect}\n\n**核心区别**：\n${r1}的核心在于${a.features}；而${r2}的核心在于${b.features}。\n\n**辨析技巧**：做题时抓住各自的核心特征来判断，不要混淆。`;
                }
                // 如果只匹配到一个修辞，给出该修辞的详细解释
                if (r1 && rhetoricCompare[r1]) {
                    const a = rhetoricCompare[r1];
                    return `📝 **「${r1}」详解**\n\n• 定义：${a.definition}\n• 特征：${a.features}\n• 例句：${a.example}\n• 作用：${a.effect}\n\n💡 如果你想比较两种修辞手法，可以告诉我具体的两种修辞名称。`;
                }
                if (r2 && rhetoricCompare[r2]) {
                    const a = rhetoricCompare[r2];
                    return `📝 **「${r2}」详解**\n\n• 定义：${a.definition}\n• 特征：${a.features}\n• 例句：${a.example}\n• 作用：${a.effect}\n\n💡 如果你想比较两种修辞手法，可以告诉我具体的两种修辞名称。`;
                }
            }

            // 古诗查询
            const poemNames = ['静夜思','春晓','登鹳雀楼','望庐山瀑布','早发白帝城','绝句','悯农','咏鹅','风','江雪',
                '寻隐者不遇','池上','小池','山行','赠汪伦','黄鹤楼送孟浩然之广陵','望天门山','饮湖上初晴后雨',
                '题西林壁','游山西村','送元二使安西','赋得古原草送别','凉州词','出塞','芙蓉楼送辛渐',
                '鹿柴','相思','九月九日忆山东兄弟','清明','元日','泊船瓜洲','春日','村居','所见',
                '回乡偶书','咏柳','竹石','石灰吟','己亥杂诗','望洞庭','忆江南','渔歌子','四时田园杂兴',
                '乡村四月','游园不值','宿新市徐公店','独坐敬亭山','望岳','春望','茅屋为秋风所破歌',
                '观沧海','龟虽寿','短歌行','归园田居','饮酒','将进酒','行路难','登高','长恨歌','琵琶行',
                '蜀道难','梦游天姥吟留别','赤壁赋','岳阳楼记','醉翁亭记','出师表','陈情表','兰亭集序',
                '滕王阁序','阿房宫赋','陋室铭','爱莲说','小石潭记','记承天寺夜游','与朱元思书','马说',
                '师说','劝学','过秦论','送东阳马生序','论语','孟子','荷塘月色','背影','春','匆匆',
                '从百草园到三味书屋'];
            for (const name of poemNames) {
                if (cleanQ.includes(name)) {
                    return `关于「${name}」，请直接告诉我你需要：\n• 背诵/默写原文\n• 翻译/译文\n• 赏析/分析\n• 作者背景\n\n我会为你提供对应的内容。`;
                }
            }

            // 拼音查询
            const pinyinMatch = cleanQ.match(/(.+?)的拼音/);
            if (pinyinMatch) {
                const word = pinyinMatch[1].trim();
                const pinyinMap = {
                    '你好':'nǐ hǎo','谢谢':'xiè xie','再见':'zài jiàn','早上好':'zǎo shang hǎo',
                    '晚上好':'wǎn shang hǎo','对不起':'duì bu qǐ','没关系':'méi guān xi',
                    '学习':'xué xí','老师':'lǎo shī','同学':'tóng xué','学校':'xué xiào',
                    '数学':'shù xué','英语':'yīng yǔ','语文':'yǔ wén','物理':'wù lǐ',
                    '化学':'huà xué','生物':'shēng wù','历史':'lì shǐ','政治':'zhèng zhì'
                };
                const py = pinyinMap[word];
                if (py) return `「${word}」的拼音是：**${py}**`;
                return `「${word}」的拼音建议查询字典确认。`;
            }

            // 多音字/读音
            if (q.includes('拼音') || q.includes('读音') || q.includes('怎么读')) {
                const polyphones = {
                    '差':'chā（差别）/ chà（差不多）/ chāi（出差）/ cī（参差）',
                    '和':'hé（和平）/ hè（附和）/ huó（和面）/ huò（和药）/ hú（和牌）',
                    '着':'zhe（看着）/ zháo（着火）/ zhuó（着手）/ zhāo（着数）',
                    '了':'le（好了）/ liǎo（了解）',
                    '只':'zhī（一只）/ zhǐ（只是）',
                    '长':'cháng（长短）/ zhǎng（长大）',
                    '行':'xíng（行走）/ háng（银行）',
                    '好':'hǎo（好坏）/ hào（爱好）',
                    '还':'hái（还有）/ huán（还书）',
                    '重':'zhòng（轻重）/ chóng（重复）',
                    '中':'zhōng（中间）/ zhòng（打中）',
                    '为':'wéi（成为）/ wèi（因为）',
                    '难':'nán（困难）/ nàn（灾难）'
                };
                for (const [char, readings] of Object.entries(polyphones)) {
                    if (cleanQ.includes(char)) return `「${char}」的读音：\n${readings}`;
                }
            }

            // 词语辨析
            const distPairs = [
                ['必须','必需','必须（副词，一定要）/ 必需（动词，不可缺少）'],
                ['反映','反应','反映（主动告知情况）/ 反应（被动回应刺激）'],
                ['启示','启事','启示（启发领悟）/ 启事（公开声明）'],
                ['化妆','化装','化妆（修饰容貌）/ 化装（扮演角色）'],
                ['截止','截至','截止（到一定期限停止，不带宾语）/ 截至（截止到某时，带宾语）'],
                ['权力','权利','权力（强制力量）/ 权利（合法利益）'],
                ['以至','以致','以至（延伸到某种程度）/ 以致（导致不好的结果）']
            ];
            for (const [a, b, explain] of distPairs) {
                if (cleanQ.includes(a) && cleanQ.includes(b)) return `「${a}」与「${b}」的区别：\n${explain}`;
            }

            // 成语故事查询
            if (q.includes('成语故事') || q.includes('成语典故') || q.includes('出处') || (q.includes('成语') && q.includes('故事'))) {
                const idiomStories = {
                    '纸上谈兵': { person: '赵括', story: '战国时期，赵国名将赵奢之子赵括，从小熟读兵书，谈论起军事来头头是道。赵王命他代替廉颇统率赵军抗秦。赵括只会死搬兵书，不会灵活运用，结果在长平之战中被秦将白起大败，赵军40万人被坑杀。', lesson: '理论必须联系实际，不能空谈理论。' },
                    '破釜沉舟': { person: '项羽', story: '秦朝末年，项羽率军渡过漳水后，下令把船全部凿沉，把做饭的锅全部砸碎，每人只带三天干粮，表示誓死决战。士兵们见退路已断，奋勇杀敌，以少胜多，大败秦军。', lesson: '下定决心，不顾一切干到底。' },
                    '四面楚歌': { person: '项羽', story: '楚汉之争末期，项羽被刘邦围困在垓下。夜里，刘邦军队在四面唱起楚地民歌，项羽以为楚地已被汉军占领，斗志全无。项羽突围至乌江，自觉无颜见江东父老，自刎而亡。', lesson: '比喻陷入四面受敌、孤立无援的绝境。' },
                    '卧薪尝胆': { person: '勾践', story: '春秋时期，越王勾践被吴王夫差打败后，忍辱负重去吴国当奴仆。回国后，他睡在柴草上（卧薪），每天尝苦胆（尝胆），以此激励自己不忘亡国之耻。经过十年生聚、十年教训，终于灭掉吴国。', lesson: '刻苦自励，发愤图强。' },
                    '三顾茅庐': { person: '刘备', story: '东汉末年，刘备为了请诸葛亮出山辅佐自己，三次亲自到南阳卧龙岗拜访。前两次诸葛亮不在家，第三次终于见到。诸葛亮被刘备诚意感动，提出"隆中对"战略，助刘备建立蜀汉。', lesson: '真心诚意地邀请别人。' },
                    '负荆请罪': { person: '廉颇', story: '战国时期，赵国蔺相如因完璧归赵、渑池之会立功被封为上卿，位在老将廉颇之上。廉颇不服，扬言要羞辱蔺相如。蔺相如以国家利益为重，处处避让。廉颇得知后深感惭愧，赤裸上身背着荆条到蔺相如门前请罪。', lesson: '主动向人认错赔罪。' },
                    '望梅止渴': { person: '曹操', story: '三国时期，曹操带兵讨伐张绣，行军途中找不到水源，士兵们渴得走不动了。曹操心生一计，用马鞭指着前方说："前面有一片梅林，梅子又酸又甜，可以解渴。"士兵们听了，想起梅子的酸味，口中生津，精神大振，终于走出了干旱地带。', lesson: '用空想安慰自己。' },
                    '愚公移山': { person: '愚公', story: '古代有位老人叫愚公，家门前有两座大山挡路。他决心带领子孙把山挖走。有个叫智叟的老人嘲笑他，愚公说："我死了有儿子，儿子死了有孙子，子子孙孙无穷尽，而山不会增高，终有一天能挖平。"感动了天帝，派神仙把山搬走了。', lesson: '坚持不懈地克服困难。' },
                    '精卫填海': { person: '精卫', story: '传说精卫是炎帝的女儿，名叫女娃。她在东海游玩时不幸溺水身亡，死后化为一只小鸟，名叫精卫。精卫每天从西山衔来木石，投入东海，想把东海填平。', lesson: '意志坚决，不畏艰难。' },
                    '悬梁刺股': { person: '孙敬、苏秦', story: '东汉孙敬读书时，为了防止打瞌睡，把头发系在房梁上，一打瞌睡就会被拉醒。战国苏秦读书困倦时，用锥子刺自己的大腿来保持清醒。', lesson: '发愤读书，刻苦学习。' },
                    '闻鸡起舞': { person: '祖逖', story: '东晋将领祖逖年轻时胸怀大志，每天清晨听到鸡叫就起床舞剑，刻苦练武。后来祖逖率军北伐，收复了大片失地。', lesson: '有志之人奋发努力。' },
                    '程门立雪': { person: '杨时', story: '北宋学者杨时去拜访老师程颐，正赶上程颐在午睡。杨时为了不打扰老师，就站在门外等候。等程颐醒来时，门外已经积雪一尺深了。', lesson: '尊师重道。' },
                    '胸有成竹': { person: '文与可', story: '北宋画家文与可擅长画竹。他在画竹之前，心中早已有了竹子的完整形象，所以画起来挥洒自如。', lesson: '做事之前已有充分的准备和把握。' },
                    '班门弄斧': { person: '李白', story: '传说唐代诗人李白在采石矶看到一位老妇人在磨铁棒，问其原因，老妇人说要磨成针。李白感叹其毅力。后来"班门弄斧"比喻在行家面前卖弄本领。', lesson: '在行家面前卖弄本领，不自量力。' },
                    '一鸣惊人': { person: '楚庄王', story: '春秋时期，楚庄王即位后三年不理朝政。大臣伍举用"三年不飞，一飞冲天；三年不鸣，一鸣惊人"来劝谏他。楚庄王听后幡然醒悟，励精图治，使楚国成为强国。', lesson: '平时没有突出的表现，一下子做出惊人的成绩。' }
                };
                let found = false;
                let result = '**成语故事**\n\n';
                for (const [idiom, info] of Object.entries(idiomStories)) {
                    if (cleanQ.includes(idiom)) {
                        result += `【${idiom}】\n**主人公**：${info.person}\n**故事**：${info.story}\n**寓意**：${info.lesson}\n\n`;
                        found = true;
                    }
                }
                if (found) return result;
                return '**成语故事集**\n\n请告诉我你想了解哪个成语的故事：\n• 纸上谈兵（赵括）\n• 破釜沉舟（项羽）\n• 四面楚歌（项羽）\n• 卧薪尝胆（勾践）\n• 三顾茅庐（刘备）\n• 负荆请罪（廉颇）\n• 望梅止渴（曹操）\n• 愚公移山\n• 精卫填海\n• 悬梁刺股\n• 闻鸡起舞\n• 程门立雪\n• 胸有成竹\n• 班门弄斧\n• 一鸣惊人';
            }

            // 古典诗词扩展
            if (q.includes('唐诗') || q.includes('宋词') || q.includes('古诗') || q.includes('诗词') || q.includes('诗歌')) {
                return teach('经典唐诗宋词选读',
                    '**唐诗十五首**：\n\n1. **静夜思**（李白）\n床前明月光，疑是地上霜。举头望明月，低头思故乡。\n\n2. **春晓**（孟浩然）\n春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。\n\n3. **登鹳雀楼**（王之涣）\n白日依山尽，黄河入海流。欲穷千里目，更上一层楼。\n\n4. **望庐山瀑布**（李白）\n日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。\n\n5. **早发白帝城**（李白）\n朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。\n\n6. **绝句**（杜甫）\n两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。\n\n7. **山行**（杜牧）\n远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月花。\n\n8. **游子吟**（孟郊）\n慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。谁言寸草心，报得三春晖。\n\n9. **登高**（杜甫）\n风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。\n\n10. **送元二使安西**（王维）\n渭城朝雨浥轻尘，客舍青青柳色新。劝君更尽一杯酒，西出阳关无故人。\n\n11. **望岳**（杜甫）\n岱宗夫如何？齐鲁青未了。造化钟神秀，阴阳割昏晓。\n荡胸生曾云，决眦入归鸟。会当凌绝顶，一览众山小。\n\n12. **春望**（杜甫）\n国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。白头搔更短，浑欲不胜簪。\n\n13. **江雪**（柳宗元）\n千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。\n\n14. **枫桥夜泊**（张继）\n月落乌啼霜满天，江枫渔火对愁眠。\n姑苏城外寒山寺，夜半钟声到客船。\n\n15. **赋得古原草送别**（白居易）\n离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。\n远芳侵古道，晴翠接荒城。又送王孙去，萋萋满别情。\n\n**宋词五首**：\n\n1. **水调歌头·明月几时有**（苏轼）\n明月几时有？把酒问青天。不知天上宫阙，今夕是何年。...但愿人长久，千里共婵娟。\n\n2. **念奴娇·赤壁怀古**（苏轼）\n大江东去，浪淘尽，千古风流人物。...人生如梦，一尊还酹江月。\n\n3. **声声慢**（李清照）\n寻寻觅觅，冷冷清清，凄凄惨惨戚戚。...这次第，怎一个愁字了得！\n\n4. **永遇乐·京口北固亭怀古**（辛弃疾）\n千古江山，英雄无觅孙仲谋处。...凭谁问：廉颇老矣，尚能饭否？\n\n5. **雨霖铃**（柳永）\n寒蝉凄切，对长亭晚，骤雨初歇。...多情自古伤离别，更那堪冷落清秋节！',
                    '赏析杜甫《登高》',
                    '《登高》被誉为"古今七律第一"。\n\n首联"风急天高猿啸哀，渚清沙白鸟飞回"：写景，风急天高，猿声哀鸣，渚清沙白，鸟儿盘旋。营造出萧瑟悲凉的氛围。\n\n颔联"无边落木萧萧下，不尽长江滚滚来"：写秋景，落叶无边，长江不尽。"无边""不尽"写出空间的广阔和时间的流逝，暗含人生短暂之感。\n\n颈联"万里悲秋常作客，百年多病独登台"：抒情，"万里"写漂泊之远，"悲秋"写时令之悲，"常作客"写漂泊之久，"百年"写人生之暮，"多病"写身体之衰，"独登台"写孤独之境。十四字包含八层悲意。\n\n尾联"艰难苦恨繁霜鬓，潦倒新停浊酒杯"：总结，国难家愁使白发增多，穷困潦倒连借酒消愁都不能。',
                    '常见错误：\n• 只翻译不分析艺术手法\n• 忽略作者生平和时代背景\n• 答题时遗漏要点',
                    '每天背诵一首古诗，理解其意境和情感。'
                );
            }

            // 更多诗词赏析
            if (q.includes('诗词赏析') || q.includes('赏析') || q.includes('古诗赏析') || q.includes('诗词分析')) {
                return renderTable(
                    ['诗名', '作者', '朝代', '名句', '主题'],
                    [
                        ['将进酒', '李白', '唐', '天生我材必有用，千金散尽还复来', '豪放洒脱'],
                        ['行路难', '李白', '唐', '长风破浪会有时，直挂云帆济沧海', '怀才不遇'],
                        ['琵琶行', '白居易', '唐', '同是天涯沦落人，相逢何必曾相识', '身世之感'],
                        ['春江花月夜', '张若虚', '唐', '春江潮水连海平，海上明月共潮生', '相思离别'],
                        ['虞美人', '李煜', '五代', '问君能有几多愁，恰似一江春水向东流', '亡国之痛'],
                        ['声声慢', '李清照', '宋', '寻寻觅觅，冷冷清清，凄凄惨惨戚戚', '孤寂愁苦'],
                        ['满江红', '岳飞', '宋', '莫等闲，白了少年头，空悲切', '精忠报国'],
                        ['过零丁洋', '文天祥', '宋', '人生自古谁无死，留取丹心照汗青', '视死如归'],
                        ['天净沙·秋思', '马致远', '元', '夕阳西下，断肠人在天涯', '羁旅思乡'],
                        ['己亥杂诗', '龚自珍', '清', '落红不是无情物，化作春泥更护花', '奉献精神'],
                    ]
                );
            }

            // 文学时期比较
            if (q.includes('文学时期') || q.includes('文学史') || q.includes('文学流派') || q.includes('文学发展')) {
                return renderTable(
                    ['时期', '代表体裁', '代表人物', '特点', '代表作'],
                    [
                        ['先秦', '诗歌/散文', '屈原、孔子、庄子', '百家争鸣，思想自由', '《诗经》《楚辞》《论语》'],
                        ['秦汉', '赋/散文', '司马迁、班固', '大一统，辞赋兴盛', '《史记》《汉书》'],
                        ['魏晋南北朝', '诗歌/骈文', '陶渊明、谢灵运', '田园山水，玄学清谈', '《桃花源记》《洛神赋》'],
                        ['唐代', '诗', '李白、杜甫、白居易', '诗歌巅峰，气象万千', '《将进酒》《春望》'],
                        ['宋代', '词', '苏轼、李清照、辛弃疾', '词的鼎盛，婉约豪放', '《水调歌头》《声声慢》'],
                        ['元代', '曲', '关汉卿、马致远', '戏曲繁荣，通俗生动', '《窦娥冤》《天净沙》'],
                        ['明清', '小说', '曹雪芹、罗贯中', '小说巅峰，反映社会', '《红楼梦》《三国演义》'],
                    ]
                );
            }

            // 古典汉语虚词详解
            if (q.includes('虚词') || q.includes('之') || q.includes('其') || q.includes('而') || q.includes('以') || q.includes('于') || q.includes('乎') || q.includes('者') || q.includes('也')) {
                return teach('文言文虚词用法详解',
                    '**之**：\n① 结构助词，的："赤壁之战"\n② 代词，他/她/它："学而时习之"\n③ 动词，去/往："吾欲之南海"\n④ 主谓之间取消独立性："孤之有孔明"\n⑤ 宾语前置的标志："何陋之有"\n\n**其**：\n① 代词，他的/她的/它的："其叶蓁蓁"\n② 代词，那/那个："其人视端容寂"\n③ 语气词，大概/难道："其真无马邪"\n④ 连词，如果："其业有不精"\n\n**而**：\n① 并列："敏而好学"\n② 转折："人不知而不愠"\n③ 顺承："温故而知新"\n④ 修饰："吾尝终日而思矣"\n⑤ 递进："君子博学而日参省乎己"\n\n**以**：\n① 介词，用/拿："以刀劈狼首"\n② 介词，因为："以中有足乐者"\n③ 连词，来/用来："以光先帝遗德"\n④ 连词，而："夫夷以近"\n⑤ 动词，认为："皆以美于徐公"\n\n**于**：\n① 介词，在："战于长勺"\n② 介词，对/向："万钟于我何加焉"\n③ 介词，比："冰，水为之，而寒于水"\n④ 介词，从："青，取之于蓝"\n⑤ 介词，被："受制于人"\n\n**乎**：\n① 语气词，吗/呢："不亦说乎"\n② 介词，相当于"于"："生乎吾前"\n③ 形容词词尾："恢恢乎其于游刃必有余地矣"\n\n**者**：\n① 代词，...的人/物："学者"\n② 语气词，表停顿："陈胜者，阳城人也"\n③ 定语后置的标志："马之千里者"\n\n**也**：\n① 判断语气："陈胜者，阳城人也"\n② 陈述语气："鱼，我所欲也"\n③ 疑问语气："何也"\n④ 感叹语气："嗟乎，燕雀安知鸿鹄之志哉"',
                    '分析"之"在以下句子中的用法：\n1. 学而时习之\n2. 水陆草木之花\n3. 何陋之有',
                    '1. "学而时习之"：代词，指代学过的知识\n2. "水陆草木之花"：结构助词，的\n3. "何陋之有"：宾语前置的标志，正常语序为"有何陋"',
                    '常见错误：\n• 不结合语境判断虚词用法\n• 忽略虚词的一词多义现象\n• 翻译时遗漏虚词的语气作用',
                    '整理虚词用法表格，结合例句记忆。'
                );
            }

            // 现代汉语语法
            if (q.includes('现代汉语') || q.includes('句子成分') || q.includes('复句') || q.includes('语法')) {
                return teach('现代汉语语法基础',
                    '**句子成分**：\n• 主语：句子陈述的对象\n• 谓语：陈述主语的成分\n• 宾语：动作的承受者\n• 定语：修饰名词的成分\n• 状语：修饰动词/形容词的成分\n• 补语：补充说明动词/形容词的成分\n\n**单句类型**：\n• 主谓句：主语+谓语（他来了）\n• 非主谓句：没有主语（下雨了）\n• 把字句：把+宾语+动词（我把书看完了）\n• 被字句：被+施事+动词（书被他看完了）\n\n**复句类型**：\n• 并列复句：既...又... / 一边...一边...\n• 递进复句：不但...而且... / 甚至...\n• 选择复句：要么...要么... / 或者...或者...\n• 转折复句：虽然...但是... / 尽管...却...\n• 因果复句：因为...所以... / 既然...就...\n• 假设复句：如果...就... / 即使...也...\n• 条件复句：只有...才... / 无论...都...',
                    '分析句子成分："勤劳的中国人民正在建设伟大的祖国。"',
                    '主语：人民\n定语：勤劳的、中国\n状语：正在\n谓语：建设\n宾语：祖国\n定语：伟大的\n\n结构：（勤劳的）（中国）人民 [正在] 建设 （伟大的）祖国。',
                    '常见错误：\n• 混淆定语和状语\n• 把补语当成宾语\n• 复句关系判断错误',
                    '多做句子成分划分练习，掌握六种句子成分的位置和功能。'
                );
            }

            // 著名作家与作品
            if (q.includes('作家') || q.includes('鲁迅') || q.includes('老舍') || q.includes('巴金') || q.includes('茅盾') || q.includes('作者')) {
                return teach('中国现代著名作家与作品',
                    '**鲁迅（1881-1936）**：原名周树人\n• 代表作：《呐喊》《彷徨》《朝花夕拾》\n• 名篇：《阿Q正传》《狂人日记》《孔乙己》《祝福》《从百草园到三味书屋》\n• 风格：深刻批判封建礼教和国民劣根性，语言犀利幽默\n\n**老舍（1899-1966）**：原名舒庆春\n• 代表作：《骆驼祥子》《四世同堂》《茶馆》《龙须沟》\n• 风格：京味文学代表，善于描写北京市民生活，语言生动幽默\n\n**巴金（1904-2005）**：原名李尧棠\n• 代表作："激流三部曲"《家》《春》《秋》\n• 风格：热情奔放，充满激情，关注青年命运和封建家庭的崩溃\n\n**茅盾（1896-1981）**：原名沈德鸿\n• 代表作：《子夜》《林家铺子》《春蚕》\n• 风格：善于描写社会全景，分析社会矛盾，具有史诗气魄\n\n**其他重要作家**：\n• 朱自清：《背影》《荷塘月色》《春》\n• 冰心：《繁星》《春水》《寄小读者》\n• 沈从文：《边城》\n• 钱钟书：《围城》\n• 张爱玲：《倾城之恋》《金锁记》',
                    '简述鲁迅《阿Q正传》的主题思想',
                    '《阿Q正传》通过描写阿Q这个落后农民的悲惨命运，深刻揭示了：\n\n1. 封建统治阶级对农民的压迫和剥削\n2. 国民的愚昧、麻木和精神胜利法\n3. 辛亥革命的不彻底性\n\n阿Q的"精神胜利法"——在失败和屈辱面前用自我安慰来获得心理上的胜利，是中国国民劣根性的典型表现。鲁迅通过阿Q的悲剧，呼唤国民觉醒。',
                    '常见错误：\n• 混淆作家和作品\n• 不了解作品的时代背景\n• 对作品主题理解片面',
                    '阅读经典名著原著，结合时代背景理解作品。'
                );
            }

            // 文言文经典段落
            if (q.includes('文言文段落') || q.includes('古文') || q.includes('经典文言') || (q.includes('文言文') && q.includes('翻译'))) {
                return teach('文言文经典段落选读',
                    '**1. 陋室铭（刘禹锡）节选**\n山不在高，有仙则名。水不在深，有龙则灵。斯是陋室，惟吾德馨。\n\n译文：山不在于有多高，有了仙人就出名。水不在于有多深，有了龙就显灵。这虽是简陋的屋子，只因我的品德高尚而芳香远播。\n\n**2. 爱莲说（周敦颐）节选**\n予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植，可远观而不可亵玩焉。\n\n译文：我唯独喜爱莲花从淤泥中长出却不被污染，在清水中洗涤过却不显得妖媚。它的茎中间贯通，外形挺直，不生枝蔓，不长枝节，香气传播得越远越清幽，笔直洁净地立在那里，只能在远处观赏而不能靠近把玩。\n\n**3. 论语·学而**\n学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？\n\n译文：学习了知识并按时复习，不也很高兴吗？有志同道合的朋友从远方来，不也很快乐吗？别人不了解我，我却不生气，不也是君子吗？\n\n**4. 醉翁亭记（欧阳修）节选**\n醉翁之意不在酒，在乎山水之间也。山水之乐，得之心而寓之酒也。\n\n译文：醉翁的情趣不在于喝酒，而在于欣赏山水之间的美景。欣赏山水的乐趣，领会在心中，寄托在酒里。\n\n**5. 岳阳楼记（范仲淹）节选**\n先天下之忧而忧，后天下之乐而乐。\n\n译文：在天下人忧虑之前先忧虑，在天下人快乐之后才快乐。',
                    '翻译"学而不思则罔，思而不学则殆"',
                    '翻译：只学习不思考就会迷惑，只思考不学习就会危险。\n\n字词分析：\n• 而：连词，表转折（却）\n• 罔（wang3）：迷惑、迷茫\n• 殆（dai4）：危险、有害',
                    '常见错误：\n• 不注意古今异义，用今义翻译古文\n• 虚词用法判断错误\n• 翻译时遗漏省略的主语或宾语',
                    '每天翻译一段文言文短文，积累虚词用法。'
                );
            }

            // 修辞手法详解
            if (q.includes('修辞详解') || q.includes('修辞手法详解') || (q.includes('修辞') && q.includes('详解'))) {
                return teach('八大修辞手法详解与示例',
                    '**1. 比喻（打比方）**\n定义：用相似的事物来打比方\n分类：明喻（像、如）、暗喻（是、成）、借喻（直接用喻体）\n例：月亮像一个大玉盘。（明喻）\n例：老师是辛勤的园丁。（暗喻）\n例：我抬头看见一弯银钩。（借喻，银钩=月亮）\n作用：使描写更生动形象\n\n**2. 拟人（当人写）**\n定义：把事物当作人来写，赋予人的动作、情感\n例：小草从土里探出头来。\n例：风儿轻轻地唱着歌。\n作用：使语言生动有趣，富有感情\n\n**3. 排比（三个以上）**\n定义：三个或以上结构相似、语气一致的句子\n例：爱心是一片冬日的阳光，爱心是一泓沙漠里的泉水，爱心是一夜星空中的明月。\n作用：增强语势，表达强烈感情\n\n**4. 夸张（故意放大/缩小）**\n定义：故意夸大或缩小事实\n例：飞流直下三千尺，疑是银河落九天。\n例：这巴掌大的地方怎么容得下这么多人？\n作用：突出特征，给人深刻印象\n\n**5. 对偶（对仗）**\n定义：字数相等、结构相同、意义相关的两个短语或句子\n例：两个黄鹂鸣翠柳，一行白鹭上青天。\n例：横眉冷对千夫指，俯首甘为孺子牛。\n作用：音韵和谐，形式整齐\n\n**6. 设问（自问自答）**\n定义：为了引起注意而先提出问题，然后自己回答\n例：谁是我们最可爱的人？我们的战士。\n作用：引起读者注意和思考\n\n**7. 反问（只问不答）**\n定义：用疑问的形式表达确定的意思，答案在问中\n例：难道我们不应该努力学习吗？（意思：我们应该努力学习）\n作用：加强语气，比陈述句更有力\n\n**8. 借代（部分代整体）**\n定义：不直接说出人或事物的名称，用相关特征代替\n例：无数革命先烈用鲜血染红了我们的旗帜。（"鲜血"代"生命"，"旗帜"代"国家"）\n例：红领巾搀扶着老奶奶过马路。（"红领巾"代"少先队员"）\n作用：形象生动，引发联想',
                    '判断修辞手法：\n1. "春天像小姑娘，花枝招展的。"\n2. "太阳公公露出了笑脸。"\n3. "书是钥匙，书是灯塔，书是阶梯。"',
                    '1. **比喻（明喻）** - 把春天比作小姑娘，有喻体"小姑娘"，比喻词"像"\n2. **拟人** - 太阳不会"露笑脸"，这是把太阳当人写\n3. **排比** - 三个"书是..."结构相同的句子\n\n💡 区分技巧：\n• 比喻有喻体，拟人无喻体\n• 排比三个以上，对偶两个\n• 设问有回答，反问无回答',
                    '常见错误：\n• 比喻和拟人混淆\n• 设问和反问混淆\n• 借喻和借代混淆\n• 排比和对偶混淆',
                    '多练习判断修辞手法，掌握每种修辞的特征和作用。'
                );
            }

            // 汉字笔画
            if (q.includes('笔画') || q.includes('笔顺') || q.includes('书写规则') || q.includes('汉字书写') || q.includes('笔划顺序')) {
                return teach('汉字笔画与笔顺规则',
                    '**基本笔画（8种）**：\n• 横（一）、竖（丨）、撇（丿）、捺（㇏）\n• 点（丶）、提（㇀）、钩（亅）、折（乛）\n\n**笔顺基本规则**：\n1. **先横后竖**：十、干、丰\n2. **先撇后捺**：人、八、入\n3. **从上到下**：三、早、星\n4. **从左到右**：川、做、湖\n5. **先外后里**：同、问、国\n6. **先外后里再封口**：日、目、田、国\n7. **先中间后两边**：小、水、办\n8. **先里头后封口**：日、目、回\n\n**补充规则**：\n• 点在上或左上，先写点：主、门、为\n• 点在右上或里面，后写点：犬、玉、书\n• 右上包围结构，先外后里：句、可、包\n• 左下包围结构，先里后外：建、连、起\n• 两边对称，先中间后两边：水、小、承',
                    '写出"国"字的正确笔顺',
                    '"国"字笔顺：\n1. 竖（丨）\n2. 横折（乛）\n3. 横（一）\n4. 横（一）\n5. 竖（丨）\n6. 横（一）\n7. 横（一）\n\n共7画。按照"先外后里再封口"的规则书写。',
                    '常见错误：\n• 笔顺错误导致书写不流畅\n• 笔画数计算错误\n• 忽略特殊规则（如先中间后两边）',
                    '按照正确笔顺书写，字体会更美观，书写速度也会提高。'
                );
            }

            // 成语查询
            if (q.includes('成语') || q.includes('idiom')) {
                const idioms = {
                    '守株待兔': '比喻不主动努力，存在侥幸心理，希望得到意外收获。',
                    '画蛇添足': '比喻做多余的事，反而不恰当。',
                    '亡羊补牢': '比喻出了问题后及时补救，还不算晚。',
                    '掩耳盗铃': '比喻自欺欺人。',
                    '杯弓蛇影': '比喻疑神疑鬼，自相惊扰。',
                    '刻舟求剑': '比喻办事刻板，不知道变通。',
                    '井底之蛙': '比喻见识短浅的人。',
                    '对牛弹琴': '比喻对不懂道理的人讲道理。',
                    '狐假虎威': '比喻借别人的威势来欺压人。',
                    '画龙点睛': '比喻在关键处加上精辟的话，使内容更生动。',
                    '叶公好龙': '比喻表面上喜欢某事物，实际上并不真正喜欢。',
                    '自相矛盾': '比喻自己的言行前后抵触。',
                    '卧薪尝胆': '比喻刻苦自励，发愤图强。',
                    '破釜沉舟': '比喻下定决心，不顾一切干到底。',
                    '四面楚歌': '比喻陷入四面受敌、孤立无援的境地。',
                    '负荆请罪': '比喻主动向人认错赔罪。',
                    '纸上谈兵': '比喻空谈理论，不能解决实际问题。',
                    '三顾茅庐': '比喻真心诚意地邀请别人。',
                    '望梅止渴': '比喻用空想安慰自己。',
                    '愚公移山': '比喻坚持不懈地改造自然和克服困难。',
                    '精卫填海': '比喻意志坚决，不畏艰难。',
                    '悬梁刺股': '比喻发愤读书，刻苦学习。',
                    '闻鸡起舞': '比喻有志之人奋发努力。',
                    '程门立雪': '比喻尊师重道。',
                    '胸有成竹': '比喻做事之前已有充分的准备和把握。',
                    '班门弄斧': '比喻在行家面前卖弄本领，不自量力。',
                    '一鸣惊人': '比喻平时没有突出的表现，一下子做出惊人的成绩。',
                    '鹤立鸡群': '比喻一个人的才能或仪表在一群人中显得特别突出。',
                    '画饼充饥': '比喻用空想来安慰自己，不能解决实际问题。',
                    '杞人忧天': '比喻不必要的或缺乏根据的忧虑和担心。',
                    '水滴石穿': '比喻只要坚持不懈，细微之力也能做出很难办的事。',
                    '指鹿为马': '比喻故意颠倒黑白，混淆是非。',
                    '鱼目混珠': '比喻拿假的东西冒充真的东西。',
                    '塞翁失马': '比喻坏事在一定条件下可以变为好事。',
                    '鹏程万里': '比喻前程远大。',
                    '百折不挠': '比喻意志坚强，无论受到多少挫折都不退缩。',
                    '锲而不舍': '比喻有恒心，有毅力，坚持不懈。',
                    '精益求精': '比喻已经很好了，还要求更好。',
                    '融会贯通': '比喻把各方面的知识或道理融合贯穿起来，从而得到系统透彻的理解。',
                    '举一反三': '比喻从一件事情类推而知道其他许多事情。',
                    '温故知新': '比喻温习旧的知识，得到新的理解和体会。',
                    '诲人不倦': '比喻教导人特别耐心，从不厌倦。',
                    '学无止境': '比喻学习是没有尽头的，应该不断进取。'
                };
                for (const [idiom, meaning] of Object.entries(idioms)) {
                    if (cleanQ.includes(idiom)) return `「${idiom}」：${meaning}`;
                }
                return '常用成语：\n• 守株待兔：不主动努力，心存侥幸\n• 画蛇添足：做多余的事，反而不恰当\n• 亡羊补牢：出了问题及时补救\n• 掩耳盗铃：自欺欺人\n• 杯弓蛇影：疑神疑鬼\n• 刻舟求剑：不知变通\n• 井底之蛙：见识短浅\n• 卧薪尝胆：刻苦自励\n• 破釜沉舟：下定决心干到底\n• 胸有成竹：做事有充分准备\n• 一鸣惊人：平时默默无闻，一举惊人\n• 鹤立鸡群：才能出众，超群拔萃\n• 塞翁失马：坏事可能变好事\n• 水滴石穿：坚持不懈终能成功\n• 百折不挠：意志坚强，不屈不挠\n• 锲而不舍：有恒心，有毅力\n• 精益求精：好了还要求更好\n• 融会贯通：知识融合贯通\n• 举一反三：类推而知其他\n• 温故知新：温习旧知获新解\n\n请告诉我你想了解哪个成语的详细解释。';
            }

            // 名言警句查询
            if (q.includes('名言') || q.includes('警句') || q.includes('格言') || q.includes('名句')) {
                const quotes = [
                    '学而不思则罔，思而不学则殆。——孔子',
                    '三人行，必有我师焉。——孔子',
                    '己所不欲，勿施于人。——孔子',
                    '千里之行，始于足下。——老子',
                    '天行健，君子以自强不息。——《周易》',
                    '路漫漫其修远兮，吾将上下而求索。——屈原',
                    '不积跬步，无以至千里。——荀子',
                    '宝剑锋从磨砺出，梅花香自苦寒来。',
                    '书山有路勤为径，学海无涯苦作舟。——韩愈',
                    '少壮不努力，老大徒伤悲。——汉乐府',
                    '先天下之忧而忧，后天下之乐而乐。——范仲淹',
                    '人生自古谁无死，留取丹心照汗青。——文天祥'
                ];
                return '经典名言警句：\n' + quotes.map((q, i) => `${i + 1}. ${q}`).join('\n');
            }

            // 作文技巧
            if (q.includes('作文') || q.includes('写作') || q.includes('写作文')) {
                return teach('作文写作技巧',
                    '**开头技巧**：\n• 开门见山法：直接点明主题\n• 引用名言法：用名句引出话题\n• 设问开头法：用问题引起读者兴趣\n\n**结构技巧**：\n• 总分总结构：首尾呼应，中间展开\n• 并列式结构：几个方面平行论述\n• 递进式结构：层层深入\n\n**结尾技巧**：\n• 总结升华法：归纳全文，提升主题\n• 首尾呼应法：与开头形成照应\n• 展望未来法：表达期望和愿景\n\n**语言技巧**：\n• 多用修辞：比喻、排比、拟人\n• 多用细节描写：动作、心理、环境\n• 注意过渡词的使用',
                    '以"春天的校园"为题写一段开头',
                    '示例1（开门见山）：春天来了，我们的校园焕然一新，处处生机勃勃。\n示例2（引用名言）："一年之计在于春"，当第一缕春风拂过校园，万物便开始了新的篇章。\n示例3（设问）：你见过春天的校园吗？那是一幅色彩斑斓的画卷。',
                    '常见错误：\n• 开头太长，迟迟不入正题\n• 结尾突然收束，没有呼应\n• 中间段落之间缺少过渡\n• 语言空洞，缺少具体细节',
                    '多读优秀范文，学习其结构和表达方式，每周至少写一篇完整作文。'
                );
            }

            // 字词解释
            if (q.includes('字词解释') || q.includes('字义') || q.includes('词义') || q.includes('释义') || q.includes('解释.*意思') || /「.+?」.*意思/.test(cleanQ) || /".+?".*意思/.test(cleanQ)) {
                const wordMatch = cleanQ.match(/[「""](.+?)[」""]\s*(的)?(意思|含义|释义|解释)/);
                if (wordMatch) {
                    const word = wordMatch[1];
                    return `「${word}」字词解释：\n\n请提供更完整的上下文，我可以帮你分析该字词在具体语境中的含义。\n\n💡 提示：你也可以直接查字典，或告诉我这个字词出现在哪篇课文中。`;
                }
                return teach('字词解释方法',
                    '**字词解释技巧**：\n1. **本义**：字词最初的意思\n2. **引申义**：由本义发展出来的意思\n3. **语境义**：在具体句子中的含义\n\n**常见文言实词**：\n• 去：离开 / 距离\n• 走：跑 / 步行\n• 汤：热水 / 汤汁\n• 妻：妻子 / 嫁给\n• 绝：断绝 / 极 / 非常\n\n**常见文言虚词**：\n• 之：的 / 去 / 往 / 取消独立性\n• 而：却 / 而且 / 然后 / 如果\n• 以：用 / 因为 / 按照 / 来\n• 于：在 / 对 / 到 / 从 / 比',
                    '解释"之"在"予独爱莲之出淤泥而不染"中的含义',
                    '这里的"之"是结构助词，用在主谓之间，取消句子的独立性。\n\n"莲之出淤泥而不染" = "莲花从淤泥中长出来却不被污染"这个句子作为"爱"的宾语。\n\n翻译：我唯独喜爱莲花从淤泥中长出却不被污染（的品质）。',
                    '常见错误：\n• 把引申义当成本义\n• 不注意古今异义（如"走"古义为"跑"）\n• 忽略虚词在句法中的作用',
                    '积累常见文言实词和虚词，注意归纳一词多义现象。'
                );
            }

            // 近义词/反义词
            if (q.includes('近义词') || q.includes('反义词') || (q.includes('同义词') && !/english|英语/.test(q))) {
                return teach('语文近义词与反义词',
                    '**辨析近义词方法**：\n1. **词义轻重**：失望 vs 绝望（程度不同）\n2. **范围大小**：战争 vs 战役（范围不同）\n3. **感情色彩**：果断 vs 武断（褒贬不同）\n4. **搭配习惯**：改进 vs 改善（搭配不同）\n\n**常见近义词对**：\n• 美丽/漂亮、快乐/高兴、巨大/庞大\n• 坚强/顽强、勇敢/英勇、聪明/智慧\n\n**常见反义词对**：\n• 美/丑、善/恶、真/假、大/小\n• 高/低、长/短、快/慢、新/旧\n• 喜欢/讨厌、勇敢/胆怯、谦虚/骄傲',
                    '辨析"安静"和"宁静"',
                    '安静：没有声音，没有吵闹（侧重环境）\n  例：教室里很安静。\n\n宁静：安宁平和，不仅没有声音，还有内心的平静（侧重心境）\n  例：宁静的夜晚。\n\n区别：安静强调"无声"，宁静强调"平和"。',
                    '常见错误：\n• 不注意近义词的感情色彩差异\n• 混淆近义词和反义词',
                    '准备一个近义词/反义词积累本，每天记录5组。'
                );
            }

            // 修辞手法识别
            if (q.includes('修辞手法') || q.includes('修辞') || q.includes('用了什么手法') || q.includes('什么修辞') || q.includes('比喻句') || q.includes('拟人句') || q.includes('排比句')) {
                return teach('修辞手法识别与运用',
                    '**八大修辞手法**：\n1. **比喻**：A是B / A像B（明喻、暗喻、借喻）\n   例：月亮像一个大玉盘。\n2. **拟人**：把事物当作人来写\n   例：小草从土里探出头来。\n3. **排比**：三个或以上结构相似的句子\n   例：书是钥匙，书是灯塔，书是阶梯。\n4. **夸张**：故意夸大或缩小\n   例：飞流直下三千尺。\n5. **对偶**：字数相等、结构相同\n   例：两个黄鹂鸣翠柳，一行白鹭上青天。\n6. **设问**：自问自答\n   例：谁是我们最可爱的人？我们的战士。\n7. **反问**：只问不答，答案在问中\n   例：难道我们不应该努力吗？\n8. **借代**：用部分代替整体\n   例：无数革命先烈用鲜血染红了我们的旗帜。',
                    '识别下列句子用了什么修辞手法：\n1. 桃花潭水深千尺，不及汪伦送我情。\n2. 春天像小姑娘，花枝招展的。\n3. 难道这不是真理吗？',
                    '1. **夸张 + 比喻**："深千尺"是夸张，以水深喻情深。\n2. **比喻（明喻）**：把春天比作小姑娘，"像"是比喻词。\n3. **反问**：用疑问的形式表达肯定的意思——这确实是真理。',
                    '常见错误：\n• 把比喻和拟人混淆\n• 把设问和反问混淆\n• 借喻和借代分不清',
                    '多练习给句子判断修辞手法，掌握每种修辞的特征和作用。'
                );
            }

            // 诗歌分析
            if (q.includes('赏析') || q.includes('分析') || q.includes('诗意') || q.includes('诗句') || q.includes('诗歌') || q.includes('古诗')) {
                return teach('古诗词赏析方法',
                    '**赏析四步法**：\n1. **知人论世**：了解作者生平和写作背景\n2. **诵读感知**：反复朗读，感受节奏韵律\n3. **逐句解读**：理解每句的字面意思和深层含义\n4. **综合鉴赏**：分析手法、情感、主旨\n\n**常见表现手法**：\n• 抒情方式：直抒胸臆、借景抒情、托物言志\n• 修辞手法：比喻、拟人、对偶、夸张、用典\n• 描写手法：动静结合、虚实相生、白描、工笔\n\n**答题模板**：\n"这首诗通过……（手法），描写了……（内容），表达了……（情感）。"',
                    '赏析李白《静夜思》：床前明月光，疑是地上霜。举头望明月，低头思故乡。',
                    '第一句：床前明月光\n  解读：诗人夜晚醒来，看到床前洒满月光。以"明月光"起笔，营造清冷的氛围。\n\n第二句：疑是地上霜\n  解读：恍惚间以为是地上铺了一层白霜。"疑"字写出了诗人的迷离状态，"霜"字暗示秋夜的寒冷和孤寂。\n\n第三句：举头望明月\n  解读：抬头仰望天上的明月。动作描写，由低头到举头，视线转移。\n\n第四句：低头思故乡\n  解读：低下头来思念远方的故乡。"举头"与"低头"形成对比，望月与思乡自然衔接。\n\n主旨：以月光引发思乡之情，语言朴素却情感真挚，千百年来引起无数游子共鸣。',
                    '常见错误：\n• 只翻译不分析，缺少对手法的鉴赏\n• 脱离背景空谈情感\n• 答题时遗漏要点（手法+内容+情感缺一不可）',
                    '每周赏析一首古诗，按"四步法"练习，积累常见意象的象征含义。'
                );
            }

            // 古诗背诵扩展
            if (q.includes('背诵') || q.includes('默写') || q.includes('全文') || q.includes('原文')) {
                const poems = {
                    '登高': '风急天高猿啸哀，渚清沙白鸟飞回。\n无边落木萧萧下，不尽长江滚滚来。\n万里悲秋常作客，百年多病独登台。\n艰难苦恨繁霜鬓，潦倒新停浊酒杯。\n——杜甫《登高》',
                    '将进酒': '君不见黄河之水天上来，奔流到海不复回。\n君不见高堂明镜悲白发，朝如青丝暮成雪。\n人生得意须尽欢，莫使金樽空对月。\n天生我材必有用，千金散尽还复来。\n——李白《将进酒》（节选）',
                    '水调歌头': '明月几时有？把酒问青天。\n不知天上宫阙，今夕是何年。\n我欲乘风归去，又恐琼楼玉宇，高处不胜寒。\n起舞弄清影，何似在人间。\n转朱阁，低绮户，照无眠。\n不应有恨，何事长向别时圆？\n人有悲欢离合，月有阴晴圆缺，此事古难全。\n但愿人长久，千里共婵娟。\n——苏轼《水调歌头·明月几时有》',
                    '念奴娇': '大江东去，浪淘尽，千古风流人物。\n故垒西边，人道是，三国周郎赤壁。\n乱石穿空，惊涛拍岸，卷起千堆雪。\n江山如画，一时多少豪杰。\n——苏轼《念奴娇·赤壁怀古》（节选）',
                    '声声慢': '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。\n乍暖还寒时候，最难将息。\n三杯两盏淡酒，怎敌他、晚来风急！\n雁过也，正伤心，却是旧时相识。\n——李清照《声声慢》（节选）',
                    '游子吟': '慈母手中线，游子身上衣。\n临行密密缝，意恐迟迟归。\n谁言寸草心，报得三春晖。\n——孟郊《游子吟》'
                };
                for (const [title, text] of Object.entries(poems)) {
                    if (cleanQ.includes(title)) return text;
                }
                return '请告诉我你想背诵哪首古诗的原文？\n\n常用古诗：\n• 静夜思、春晓、登鹳雀楼、望庐山瀑布\n• 登高、将进酒、水调歌头、念奴娇\n• 声声慢、游子吟、茅屋为秋风所破歌\n\n直接发送诗名即可获取全文。';
            }

            // 文言文虚词
            if (q.includes('文言文') || q.includes('虚词') || q.includes('实词') || q.includes('之乎者也') || q.includes('古今异义') || q.includes('词类活用')) {
                return teach('文言文基础知识',
                    '**常见文言虚词**：\n• 之：①结构助词，的（"赤壁之战"）②代词，他/它（"学而时习之"）③动词，去/往（"吾欲之南海"）④主谓之间取消独立性（"孤之有孔明"）\n• 乎：①语气词，吗/呢（"学而时习之，不亦说乎"）②介词，相当于"于"（"生乎吾前"）\n• 者：①代词，...的人（"学者"）②语气词，表停顿（"陈胜者，阳城人也"）\n• 也：①判断语气（"陈胜者，阳城人也"）②陈述语气（"鱼，我所欲也"）③疑问语气（"何也"）\n• 而：①并列（"敏而好学"）②转折（"人不知而不愠"）③顺承（"温故而知新"）④修饰（"吾尝终日而思矣"）\n• 以：①介词，用/拿（"以刀劈狼首"）②介词，因为（"以中有足乐者"）③连词，来（"以光先帝遗德"）\n• 于：①介词，在（"战于长勺"）②介词，对（"万钟于我何加焉"）③介词，比（"冰，水为之，而寒于水"）\n• 其：①代词，他的/它的（"其叶蓁蓁"）②语气词，大概/难道（"其真无马邪"）\n\n**常见古今异义**：\n• 走：古义=跑 / 今义=行走\n• 去：古义=离开 / 今义=前往\n• 汤：古义=热水 / 今义=汤汁\n• 妻子：古义=妻子和儿女 / 今义=仅指妻子\n• 交通：古义=交错相通 / 今义=运输往来\n\n**常见词类活用**：\n• 名词作动词："一鼓作气"（鼓=击鼓）\n• 名词作状语："斗折蛇行"（斗=像北斗星，蛇=像蛇）\n• 形容词作动词："穷其词"（穷=穷尽）\n• 使动用法："项伯杀人，臣活之"（活=使...活命）',
                    '翻译："学而不思则罔，思而不学则殆。"',
                    '翻译：只学习不思考就会迷惑，只思考不学习就会危险。\n\n字词分析：\n• 而：连词，表转折（却）\n• 罔（wǎng）：迷惑、迷茫\n• 殆（dài）：危险、有害\n\n语法：两个"而"字都是转折连词，构成对偶句式。',
                    '常见错误：\n• 不注意古今异义，用今义翻译古文\n• 虚词用法判断错误（如"之"有多种用法）\n• 翻译时遗漏省略的主语或宾语',
                    '每天翻译一段文言文短文，积累虚词用法。'
                );
            }

            // 写作手法
            if (q.includes('手法') || q.includes('修辞') || q.includes('技巧') || q.includes('表达方式') || q.includes('表现手法')) {
                return teach('语文常见写作手法',
                    '**修辞手法**：\n• 比喻：用相似事物打比方（明喻/暗喻/借喻）\n  例：月亮像一个大银盘。\n• 拟人：把物当作人来写\n  例：春风抚摸着大地。\n• 排比：三个以上结构相似的句子\n  例：爱心是一片照射在冬日的阳光，爱心是一泓出现在沙漠里的泉水。\n• 夸张：故意夸大或缩小\n  例：飞流直下三千尺。\n• 对偶：字数相等、结构相同的两个短语或句子\n  例：两个黄鹂鸣翠柳，一行白鹭上青天。\n\n**表达方式**：\n• 记叙、描写、说明、议论、抒情\n\n**表现手法**：\n• 对比、衬托、象征、欲扬先抑、借物喻人、卒章显志',
                    '判断以下句子使用了什么修辞手法：\n1. 桃花潭水深千尺，不及汪伦送我情。\n2. 问君能有几多愁？恰似一江春水向东流。',
                    '1. 夸张 + 对比（衬托）\n  "深千尺"是夸张，极言潭水之深；用潭水之深衬托友情之深，以景衬情。\n\n2. 比喻（明喻）+ 设问 + 夸张\n  先用设问引起注意，再用明喻将抽象的"愁"比作"一江春水"，化抽象为具体，写出愁绪的绵长不断。',
                    '常见错误：\n• 比喻和拟人混淆（比喻有喻体，拟人无喻体）\n• 排比和对偶混淆（排比三个以上，对偶两个）\n• 借喻和借代混淆（借喻重在相似，借代重在相关）',
                    '阅读时标注修辞手法，写作时有意识地运用至少两种修辞。'
                );
            }

            // 阅读理解策略
            if (q.includes('阅读') || q.includes('理解') || q.includes('阅读理解') || q.includes('答题')) {
                return teach('阅读理解答题策略',
                    '**记叙文阅读**：\n1. 概括文章内容：谁 + 在什么情况下 + 做了什么 + 结果如何\n2. 分析人物形象：从语言、动作、心理、神态描写中归纳\n3. 理解重点句子：结合上下文，从修辞、含义、作用三方面分析\n4. 品味语言：找出动词、形容词、修辞手法的表达效果\n\n**说明文阅读**：\n1. 找说明对象：文章主要介绍的事物或事理\n2. 理清说明顺序：时间顺序/空间顺序/逻辑顺序\n3. 分析说明方法：举例子/列数字/作比较/打比方/分类别\n4. 体会语言准确性：注意"大约""可能""之一"等限制词\n\n**议论文阅读**：\n1. 找中心论点：通常在标题、开头或结尾\n2. 分析论据：事实论据/道理论据\n3. 理清论证思路：提出问题→分析问题→解决问题\n4. 补写论据：要与论点一致，真实典型',
                    '阅读理解常见题型及答题模板：\n1. "这句话有什么作用？"\n   答：结构上（承上启下/总领全文/总结全文）+ 内容上（表现了.../突出了...）\n2. "加点词能否删去？"\n   答：不能。该词表示...，体现了说明文语言的准确性。删去后变成...，与事实不符。',
                    '常见错误：\n• 概括内容太简略或太啰嗦\n• 答题不完整，只答一个方面\n• 脱离文本主观臆断\n• 混淆说明方法和论证方法',
                    '每天做一篇阅读理解，限时训练，做完后对照答案分析失分原因。'
                );
            }

            // 更多成语及故事
            if (q.includes('成语故事') || q.includes('成语典故') || q.includes('更多成语') || q.includes('成语大全')) {
                return teach('成语故事精选',
                    '**10个经典成语及故事**：\n\n1. **破釜沉舟**：项羽率军渡河后，砸碎锅灶，沉掉船只，表示决不后退的决心。比喻下决心不顾一切干到底。\n\n2. **卧薪尝胆**：越王勾践战败后，睡在柴草上，每天尝苦胆，提醒自己不忘亡国之耻。后终于灭吴复国。\n\n3. **三顾茅庐**：刘备三次到草庐拜访诸葛亮，请其出山辅佐。比喻诚心诚意地邀请。\n\n4. **负荆请罪**：廉颇得知蔺相如以国为重的胸怀后，背着荆条上门请罪。表示主动向人认错赔罪。\n\n5. **纸上谈兵**：赵括只会读兵书，不会实际指挥，导致赵军大败。比喻空谈理论，不能解决实际问题。\n\n6. **指鹿为马**：赵高指着鹿说是马，试探群臣。比喻故意颠倒黑白，混淆是非。\n\n7. **完璧归赵**：蔺相如机智地将和氏璧完好无损地送回赵国。比喻把原物完好地归还本人。\n\n8. **四面楚歌**：项羽被围困时，听到四面唱起楚歌，以为楚地已失。比喻四面受敌，处于孤立无援的境地。\n\n9. **望梅止渴**：曹操行军时，告诉士兵前方有梅林，士兵想到梅子的酸味就不渴了。比喻用空想安慰自己。\n\n10. **愚公移山**：愚公决心搬走门前两座大山，子子孙孙不断努力。比喻坚持不懈地改造自然和克服困难。',
                    '请用"破釜沉舟"造句。',
                    '示例：\n• 面对这次重要的考试，他下定决心要破釜沉舟，全力以赴。\n• 公司已经到了生死存亡的时刻，我们必须破釜沉舟，背水一战。',
                    '注意：\n• 成语使用要注意语境和感情色彩\n• 不要望文生义（如"望梅止渴"不是真的去看梅子）\n• 成语故事是写作的好素材',
                    '每周学习5个成语，了解其故事和用法。'
                );
            }

            // 中文标点规则
            if (q.includes('中文标点') || q.includes('标点符号') || q.includes('顿号') || q.includes('书名号') || q.includes('省略号')) {
                return teach('中文标点符号规则',
                    '**中文标点符号用法**：\n\n**句号（。）**：陈述句末尾\n**问号（？）**：疑问句末尾\n**感叹号（！）**：感叹句/祈使句末尾\n**逗号（，）**：句子内部停顿\n**顿号（、）**：并列词语之间（词/短语级别）\n  例：语文、数学、英语都是主科。\n**分号（；）**：并列分句之间\n**冒号（：）**：提示语后（说、想、是等）\n**引号（""）**：直接引语/强调/特殊含义\n**书名号（《》）**：书名/文章名/歌曲名/电影名\n**省略号（......）**：六个点，表示省略或语意未尽\n**破折号（——）**：解释说明/话题转换/声音延长',
                    '给下面句子加标点：\n1. 老师说  同学们 今天我们学习古诗\n2. 我喜欢读 三国演义 和 西游记\n3. 春天来了 桃花 杏花 梨花都开了',
                    '1. 老师说："同学们，今天我们学习古诗。"\n   （冒号+引号，引语内部用逗号）\n2. 我喜欢读《三国演义》和《西游记》。\n   （书名用书名号）\n3. 春天来了，桃花、杏花、梨花都开了。\n   （并列词语用顿号）',
                    '注意：\n• 中文标点占一个汉字宽度\n• 不要混用中英文标点\n• 省略号是6个点，不是3个点',
                    '写作时注意标点规范。'
                );
            }

            // 常见中文错别字
            if (q.includes('错别字') || q.includes('常见错字') || q.includes('易错字') || q.includes('纠错') || q.includes('写错')) {
                return teach('常见中文错别字',
                    '**常见中文错别字及纠正**：\n\n1. "按部就班" ≠ "按步就班"（部：部门/类别）\n2. "川流不息" ≠ "穿流不息"（川：河流）\n3. "再接再厉" ≠ "再接再励"（厉：同"砺"，磨砺）\n4. "走投无路" ≠ "走头无路"（投：投奔）\n5. "一筹莫展" ≠ "一愁莫展"（筹：筹划）\n6. "迫不及待" ≠ "迫不急待"（及：来得及）\n7. "名副其实" ≠ "名符其实"（副：相称）\n8. "甘拜下风" ≠ "甘败下风"（拜：服从）\n9. "自暴自弃" ≠ "自爆自弃"（暴：糟蹋）\n10. "鸠占鹊巢" ≠ "鸠占雀巢"（鹊：喜鹊）\n11. "墨守成规" ≠ "墨守陈规"（成：已有的）\n12. "金碧辉煌" ≠ "金壁辉煌"（碧：翠绿色）',
                    '找出并改正下列错别字：\n1. 他按步就班地完成了作业。\n2. 街上的人川流不息。\n3. 遇到困难要再接再励。',
                    '1. 他按部就班地完成了作业。\n   （步→部，"部"指按类别/顺序）\n2. 街上的人川流不息。\n   （正确！川流不息指像河流一样不停流动）\n3. 遇到困难要再接再厉。\n   （励→厉，"厉"通"砺"，磨砺之意）',
                    '建议：\n• 理解字义，不要只记字形\n• 遇到不确定的字查字典确认\n• 建立自己的错字本',
                    '多读书、多写字，减少错别字。'
                );
            }

            // 古文经典
            if (q.includes('古文') || q.includes('文言文') || q.includes('经典') || q.includes('四书') || q.includes('五经') || q.includes('论语') || q.includes('孟子') || q.includes('大学') || q.includes('中庸')) {
                return teach('古文经典名篇',
                    '**四书五经经典名句**：\n\n【论语】\n• 学而时习之，不亦说乎？\n• 温故而知新，可以为师矣。\n• 三人行，必有我师焉。\n• 己所不欲，勿施于人。\n• 学而不思则罔，思而不学则殆。\n\n【孟子】\n• 生于忧患，死于安乐。\n• 富贵不能淫，贫贱不能移，威武不能屈。\n• 老吾老以及人之老，幼吾幼以及人之幼。\n\n【大学】\n• 大学之道，在明明德，在亲民，在止于至善。\n• 物有本末，事有终始，知所先后，则近道矣。\n\n【中庸】\n• 博学之，审问之，慎思之，明辨之，笃行之。\n\n【诗经】\n• 关关雎鸠，在河之洲。窈窕淑女，君子好逑。\n• 知我者谓我心忧，不知我者谓我何求。\n\n【道德经】\n• 上善若水，水善利万物而不争。\n• 千里之行，始于足下。',
                    '翻译：己所不欲，勿施于人。',
                    '翻译：自己不愿意做的事情，不要强加给别人。\n\n这是孔子关于"仁"的核心思想之一，强调推己及人、换位思考。在现代生活中，这提醒我们要尊重他人，理解他人的感受。',
                    '常见错误：\n• 古文翻译不准确，遗漏关键词\n• 不了解历史背景，误解文意\n• 虚词（之乎者也）翻译错误',
                    '每天背诵一段古文，积累文言词汇。'
                );
            }

            // 文言文实词虚词
            if (q.includes('文言文') || q.includes('实词') || q.includes('虚词') || q.includes('词类活用') || q.includes('古今异义') || q.includes('通假字')) {
                return teach('文言文实词虚词精讲',
                    '**常见虚词用法**：\n\n**之**：\n• 结构助词"的"：赤壁之战（的）\n• 代词：学而时习之（它，指知识）\n• 动词"到...去"：吾欲之南海\n• 取消句子独立性：孤之有孔明\n• 宾语前置标志：何陋之有\n\n**其**：\n• 代词（他/她/它/他们）：其文理皆有可观者\n• 指示代词"那"：其人视端容寂\n• 语气词（表推测/反问/祈使）：其如土石何？\n\n**而**：\n• 连词（并列）：黑质而白章\n• 连词（递进）：君子博学而日参省乎己\n• 连词（转折）：人不知而不愠\n• 连词（修饰）：吾尝终日而思矣\n\n**以**：\n• 介词"用/拿"：以刀劈狼首\n• 介词"凭借/按照"：何以战？\n• 连词"来/用来"：属予作文以记之\n• 介词"因为"：不以物喜，不以己悲\n\n**于**：\n• 介词"在"：战于长勺\n• 介词"对/向"：告之于帝\n• 介词"到"：指通豫南，达于汉阴\n• 介词"比"：苛政猛于虎\n\n**古今异义词举例**：\n• 走：古义=跑；今义=行走\n• 去：古义=离开；今义=到某处\n• 汤：古义=热水；今义=汤水\n• 妻子：古义=妻子和儿女；今义=仅指妻子',
                    '翻译下列文言句子中的虚词：\n1. "学而时习之"中的"而"和"之"\n2. "其真无马邪"中的"其"',
                    '1. "学而时习之"\n  而：连词，表顺承关系（然后）\n  之：代词，代指学过的知识\n  翻译：学习了知识，然后按时温习它。\n\n2. "其真无马邪"\n  其：副词，表反问语气（难道）\n  翻译：难道真的没有千里马吗？',
                    '常见错误：\n• "之"的用法判断错误，不知道何时是代词何时是助词\n• "以"和"于"的介词用法混淆\n• 古今异义词用今义翻译古文',
                    '每天积累5个文言虚词用法，结合课文例句记忆。'
                );
            }

            // 标点符号用法
            if (q.includes('标点符号') || q.includes('标点') || q.includes('逗号') || q.includes('句号') || q.includes('顿号') || q.includes('分号') || q.includes('冒号') || q.includes('引号') || q.includes('书名号') || q.includes('省略号') || q.includes('破折号')) {
                return teach('中文标点符号用法详解',
                    '**常用标点符号及用法**：\n\n**句号（。）**：\n• 陈述句末尾\n• 语气舒缓的祈使句末尾\n\n**逗号（，）**：\n• 句子内部主语与谓语之间（需要停顿时）\n• 句子内部动词与宾语之间\n• 句子内部状语后边\n• 复句内各分句之间的停顿\n\n**顿号（、）**：\n• 句子内部并列词语之间的停顿\n• 注意：并列的谓语、补语之间不用顿号，用逗号\n\n**分号（；）**：\n• 复句内部并列分句之间的停顿\n• 分行列举的各项之间\n\n**冒号（：）**：\n• 提示性话语之后的停顿\n• 注意：没有提示意味时不要用冒号\n\n**引号（""）**：\n• 行文中直接引用的话\n• 需要着重论述的对象\n• 具有特殊含义的词语\n\n**书名号（《》）**：\n• 书名、篇名、报刊名、文件名等\n\n**省略号（......）**：\n• 引文的省略\n• 话语的断续\n• 思维的跳跃\n\n**破折号（——）**：\n• 解释说明\n• 话题突然转变\n• 声音延长',
                    '改正下列标点错误：\n1. 我喜欢的水果有、苹果、香蕉和橘子。\n2. 他说："今天天气真好！"\n3. 《语文》课本、数学课本、英语课本。',
                    '1. 我喜欢的水果有苹果、香蕉和橘子。\n   （"有"后面不需要顿号，直接列举即可）\n\n2. 他说："今天天气真好。"\n   （引号内是陈述句，应用句号而不是感叹号）\n\n3. 《语文》课本、《数学》课本、《英语》课本。\n   （书名号只标书名，"课本"不在书名号内；或改为：语文课本、数学课本、英语课本）',
                    '常见错误：\n• 顿号和逗号混用\n• 冒号提示范围不清\n• 引号和句号的位置关系（句号在引号内还是外）\n• 书名号滥用（如给文章标题加书名号）',
                    '记住：顿号用于并列词语，逗号用于句子成分之间的停顿。'
                );
            }

            // 作文技巧
            if (q.includes('作文') || q.includes('写作技巧') || q.includes('开头') || q.includes('结尾') || q.includes('过渡') || q.includes('写作手法') || q.includes('作文技巧') || q.includes('essay') || q.includes('writing')) {
                return teach('作文写作技巧——开头、结尾、过渡',
                    '**开头技巧（凤头）**：\n1. 开门见山法：直接点明主题\n2. 引用名言法：以名言、诗句开头\n3. 设问开头法：以问题引起读者兴趣\n4. 场景描写法：用生动的场景引入\n5. 对比开头法：通过对比突出主题\n\n**结尾技巧（豹尾）**：\n1. 首尾呼应法：与开头相照应，结构完整\n2. 升华主题法：由具体到抽象，提升立意\n3. 引用名言法：以名言收束，增加文采\n4. 抒情结尾法：以感情收束，引发共鸣\n5. 反问结尾法：以反问引发思考\n\n**过渡技巧**：\n1. 过渡句：承上启下的句子\n2. 过渡段：独立的过渡段落\n3. 关联词：然而、因此、不仅如此、与此同时\n\n**常用修辞手法**：\n• 比喻：化抽象为具体\n• 拟人：赋予事物人的情感\n• 排比：增强气势和节奏\n• 夸张：突出特征，增强感染力\n• 对偶：句式整齐，朗朗上口\n• 反问：加强语气，引发思考',
                    '以"坚持"为主题，写一个开头和结尾。',
                    '**开头（引用名言法）**：\n"滴水穿石，非一日之功。"古人的智慧告诉我们，坚持的力量是无穷的。在人生的道路上，那些最终走向成功的人，往往不是最聪明的，而是最能坚持的。\n\n**结尾（首尾呼应+升华）**：\n滴水终能穿石，不是因为水的力量有多大，而是因为它从未停止。让我们以坚持为舟，以信念为帆，在人生的海洋中乘风破浪，驶向理想的彼岸。记住：成功没有捷径，唯有坚持到底。',
                    '常见错误：\n• 开头太长，迟迟不入题\n• 结尾草率，没有升华或呼应\n• 缺少过渡，段落之间生硬跳跃\n• 只用一种修辞手法，语言单调',
                    '多读优秀范文，积累开头结尾的模板和好词好句。'
                );
            }

            // 错别字辨析
            if (q.includes('错别字') || q.includes('易错字') || q.includes('辨析') || q.includes('的得地') || q.includes('做作') || q.includes('字形') || q.includes('字音') || q.includes('常见错别字')) {
                return teach('常见错别字辨析',
                    '**"的、得、地"的用法**：\n• 的（形容词/名词前）：美丽的花、我的书\n• 地（动词前，修饰动作）：认真地看、慢慢地走\n• 得（动词/形容词后，补充说明）：跑得快、好得很\n\n口诀：左边"土"来右边"也"，中间"白"来右边"勺"，双人"彳"来右边"也"\n\n**"做"与"作"的区分**：\n• 做（具体事物）：做饭、做事、做手工\n• 作（抽象事物）：作文、作业、作用、贡献\n\n**其他常见易混字**：\n• 即/既：立即（就）/ 既然（已经）\n• 在/再：现在（存在）/ 再见（又一次）\n• 带/戴：带东西（携带）/ 戴帽子（佩戴）\n• 厉/历：严厉（严格）/ 历史（经历）\n• 篇/遍：一篇文章（量词）/ 看一遍（次数）\n• 坐/座：坐下（动词）/ 座位（名词）\n• 查/察：检查（查看）/ 观察（细看）\n• 究/纠：研究（探究）/ 纠正（改正）\n• 意/义：意思（含义）/ 意义（价值）\n• 象/像：现象（事物表现）/ 好像（相似）\n\n**常见错别字举例**：\n• 按（安）装 → 正确：安装\n• 渡（度）假 → 正确：度假\n• 脉膊（搏） → 正确：脉搏\n• 鬼鬼崇崇（祟祟） → 正确：鬼鬼祟祟\n• 一愁（筹）莫展 → 正确：一筹莫展',
                    '改正下列错别字：\n1. 他认真的地完成了作业。\n2. 做为一名学生，应该好好学习。\n3. 这件事即然已经决定了，就不要再改变了。',
                    '1. 他**认真**地完成了作业。\n   （"认真"修饰"完成"，用"地"；"的"应改为"地"）\n\n2. **作**为一名学生，应该好好学习。\n   （"作为"是抽象含义，用"作"而非"做"）\n\n3. 这件事**既**然已经决定了，就不要再改变了。\n   （"既然"表示已经发生，用"既"而非"即"）',
                    '常见错误：\n• "的得地"混用是最常见的错误\n• "做作"不分\n• "即既"不分\n• 同音字替代导致错别字',
                    '建立自己的错别字本，每次出错都记录下来，定期复习。'
                );
            }

            return null;
        }
        // ========== 5. 理科智能处理 ==========
        function handleScience(subject, question, cleanQ) {
            const q = question.toLowerCase();
            const responses = {
                physics: {
                    '核物理': '**核物理基础**：\n\n**原子核结构**：\n• 质子：带正电，质量≈1u\n• 中子：不带电，质量≈1u\n• 核子：质子和中子的统称\n• 核电荷数 = 质子数 = 原子序数\n• 质量数 = 质子数 + 中子数\n\n**核反应类型**：\n• 核裂变：重核分裂成轻核（如铀235裂变）\n  应用：核电站、原子弹\n• 核聚变：轻核聚合成重核（如氢弹、太阳发光）\n  条件：超高温（上亿度）\n\n**质能方程**：E = mc²\n• E：能量（J）\n• m：质量（kg）\n• c：光速（3×10⁸ m/s）\n• 质量亏损：核反应中质量减少，转化为能量\n\n**放射性衰变**：\n• α衰变：放出氦核（⁴He）\n• β衰变：放出电子（e⁻）\n• γ衰变：放出高能光子\n• 半衰期：放射性元素衰变一半所需时间',
                    '牛顿': '牛顿三定律：\n1. 惯性定律（第一定律）：物体不受外力时保持静止或匀速直线运动状态\n   一切物体都有保持原来运动状态不变的性质，叫惯性\n2. 加速度定律（第二定律）：F = ma\n   物体的加速度与合外力成正比，与质量成反比\n   单位：力(N) = 质量(kg) × 加速度(m/s²)\n3. 作用力与反作用力定律（第三定律）：\n   两个物体之间的作用力和反作用力总是大小相等、方向相反、作用在同一直线上\n\n应用举例：\n• 汽车刹车时人往前倾（惯性）\n• 踢球时球加速飞出（F=ma）\n• 火箭升空利用反作用力',
                    '欧姆': '欧姆定律：U = IR\n• U：电压（伏特V）\n• I：电流（安培A）\n• R：电阻（欧姆Ω）\n\n推导：\n• 串联电路：I相同，U = U₁+U₂，R = R₁+R₂\n• 并联电路：U相同，I = I₁+I₂，1/R = 1/R₁+1/R₂\n• 电功率：P = UI = I²R = U²/R',
                    '功': '功 W = F·s·cosθ\n功率 P = W/t = F·v\n动能 Ek = ½mv²\n重力势能 Ep = mgh\n机械能守恒定律：在只有重力或弹力做功的情况下，物体的动能和势能可以相互转化，但机械能总量保持不变',
                    '动能': '动能公式：Ek = ½mv²\n• m：质量（kg）\n• v：速度（m/s）\n动能定理：合力做的功 = 动能的变化量\nW合 = ½mv₂² - ½mv₁²',
                    '势能': '重力势能：Ep = mgh\n弹性势能：Ep = ½kx²\n机械能守恒：Ek + Ep = 常量（只有重力做功时）',
                    '波': '波速公式：v = fλ\n• v：波速（m/s）\n• f：频率（Hz）\n• λ：波长（m）\n周期与频率：T = 1/f\n\n**声波**：需要介质传播，不能在真空中传播\n**光波**：电磁波，可在真空中传播\n**多普勒效应**：波源与观察者相对运动时，频率发生变化\n  靠近：频率变高（音调变高）\n  远离：频率变低（音调变低）',
                    '电路': '串联：电流相等，总电阻 R = R₁+R₂+...\n并联：电压相等，1/R = 1/R₁+1/R₂+...\n\n**电功率**：P = UI = I²R = U²/R\n**焦耳定律**：Q = I²Rt（电流热效应）\n**电能**：W = UIt = Pt',
                    '电路图|电路分析': function() {
                        return renderTable(
                            ['电路类型', '连接方式', '电流特点', '电压特点', '电阻关系', '应用'],
                            [
                                ['串联电路', '逐个连接', 'I = I₁ = I₂', 'U = U₁ + U₂', 'R = R₁ + R₂', '开关控制全部'],
                                ['并联电路', '并列连接', 'I = I₁ + I₂', 'U = U₁ = U₂', '1/R = 1/R₁ + 1/R₂', '各支路独立'],
                            ]
                        ) + '\n\n**电路元件符号**：\n• 电池(长短线) / 开关(小圆+线) / 电阻(锯齿线)\n• 电流表(A，串联) / 电压表(V，并联)\n• 灯泡(圆圈内X) / 导线(直线)';
                    },
                    '受力分析|力分析': function() {
                        return renderTable(
                            ['力的类型', '公式', '方向', '特点', '示例'],
                            [
                                ['重力', 'G = mg', '竖直向下', '始终存在', '苹果落地'],
                                ['弹力', 'F = kx', '与形变相反', '接触才有', '弹簧伸长'],
                                ['摩擦力', 'f = μN', '与运动相反', '接触+有压力', '推箱子'],
                                ['浮力', 'F浮 = ρ液gV排', '竖直向上', '在流体中', '木块浮在水面'],
                                ['支持力', 'N = mg(水平面)', '垂直接触面', '接触面产生', '桌面对书的力'],
                                ['拉力', 'F(外力)', '沿绳方向', '绳索产生', '悬挂物体'],
                            ]
                        );
                    },
                    '透镜': '凸透镜成像：\n• u > 2f：倒立缩小实像（照相机）\n• f < u < 2f：倒立放大实像（投影仪）\n• u < f：正立放大虚像（放大镜）\n\n**凹透镜**：总是成正立缩小的虚像（近视眼镜）\n\n**透镜公式**：1/u + 1/v = 1/f\n• u：物距，v：像距，f：焦距',
                    '反射': '光的反射定律：入射角 = 反射角，三线共面\n\n**镜面类型**：\n• 平面镜：成正立等大虚像\n• 凹面镜：会聚光线（太阳灶、手电筒）\n• 凸面镜：发散光线（汽车后视镜）',
                    '折射': '光的折射定律：n₁sinθ₁ = n₂sinθ₂\n光从光疏→光密介质，折射角 < 入射角\n\n**折射率**：n = c/v（真空中光速/介质中光速）\n**全反射**：光从光密→光疏介质，入射角大于临界角时发生\n  应用：光纤通信、棱镜',
                    '万有引力': '万有引力：F = GMm/r²\n重力加速度：g = GM/R²\n第一宇宙速度：v₁ = √(GM/R) ≈ 7.9 km/s\n第二宇宙速度：v₂ ≈ 11.2 km/s（脱离地球）\n第三宇宙速度：v₃ ≈ 16.7 km/s（脱离太阳系）',
                    '匀变速': '匀变速直线运动：\nv = v₀ + at\ns = v₀t + ½at²\nv² = v₀² + 2as\ns = ½(v₀+v)t',
                    '压强': '固体压强：P = F/S（压力÷受力面积）\n液体压强：P = ρgh（密度×重力加速度×深度）\n大气压强：标准大气压 = 1.013×10⁵ Pa ≈ 101.3 kPa\n帕斯卡原理：加在密闭液体上的压强能大小不变地向各个方向传递',
                    '浮力': '阿基米德原理：F浮 = ρ液gV排\n• 物体漂浮：F浮 = G物\n• 物体悬浮：F浮 = G物，ρ物 = ρ液\n• 物体沉底：F浮 < G物，ρ物 > ρ液',
                    '光学': '**光的反射**：入射角 = 反射角\n**光的折射**：n₁sinθ₁ = n₂sinθ₂\n**透镜成像**：1/u + 1/v = 1/f\n**光的色散**：白光通过棱镜分解成七色光\n**光的干涉**：两列相干光叠加产生明暗条纹\n**光的衍射**：光绕过障碍物传播\n**偏振光**：光振动方向被限制在某一平面',
                    '热学': '**热传递方式**：传导、对流、辐射\n**比热容**：单位质量物质升高1℃所需热量\n  水的比热容：4.2×10³ J/(kg·℃)\n**熔化**：固态→液态（吸热）\n**凝固**：液态→固态（放热）\n**汽化**：液态→气态（蒸发/沸腾）\n**液化**：气态→液态\n**升华**：固态→气态\n**凝华**：气态→固态',
                    '电磁': '**磁场**：磁体周围存在磁场，用磁感线描述\n**电流的磁效应**：通电导线周围存在磁场（奥斯特实验）\n**电磁感应**：闭合电路的一部分导体在磁场中做切割磁感线运动时产生电流（法拉第）\n**电动机原理**：通电导体在磁场中受力运动\n**发电机原理**：电磁感应\n**变压器原理**：电磁感应，U₁/U₂ = n₁/n₂',
                    '电学': '**电荷**：正电荷、负电荷，同种相斥异种相吸\n**电流**：电荷的定向移动\n**电压**：使电荷定向移动形成电流的原因\n**电阻**：导体对电流的阻碍作用\n**串联电路**：I = I₁ = I₂，U = U₁+U₂，R = R₁+R₂\n**并联电路**：I = I₁+I₂，U = U₁ = U₂，1/R = 1/R₁+1/R₂\n**电功率**：P = UI = I²R = U²/R\n**电能**：W = UIt = Pt',
                    '波|波长|频率|振幅': '**波的基本性质**：\n\n**波的参数**：\n• 波速 v = fλ（频率×波长）\n• 频率 f：单位时间内波振动的次数（Hz）\n• 波长 λ：相邻两个波峰/波谷之间的距离（m）\n• 振幅 A：波的最大位移，决定波的强度/响度\n• 周期 T = 1/f\n\n**波的分类**：\n• 横波：振动方向与传播方向垂直（如光波、绳波）\n• 纵波：振动方向与传播方向平行（如声波、弹簧波）\n\n**波的传播特性**：\n• 反射：波遇到障碍物返回\n• 折射：波从一种介质进入另一种介质时改变方向\n• 衍射：波绕过障碍物传播\n• 干涉：两列波叠加产生加强/减弱区域\n\n**声波**：\n• 频率范围：20Hz-20000Hz\n• 低于20Hz为次声波，高于20000Hz为超声波\n• 音调由频率决定，响度由振幅决定，音色由波形决定',
                    '光谱|颜色|色散|七色光': '**光的光谱与颜色理论**：\n\n**可见光谱**（波长从长到短）：\n红(620-750nm) → 橙(590-620nm) → 黄(570-590nm) → 绿(495-570nm) → 蓝(450-495nm) → 靛(420-450nm) → 紫(380-420nm)\n\n**三原色（光）**：红、绿、蓝（RGB）\n• 红+绿=黄，红+蓝=品红，绿+蓝=青\n• 红+绿+蓝=白\n\n**三原色（颜料）**：红、黄、蓝\n• 红+黄=橙，黄+蓝=绿，红+蓝=紫\n• 红+黄+蓝=黑（理论上）\n\n**光的色散**：白光通过棱镜分解成七色光（牛顿实验）\n• 彩虹是自然色散现象\n• 天空蓝色是瑞利散射（短波长光被散射更多）\n\n**不可见光**：\n• 红外线：热效应，遥控器、夜视仪\n• 紫外线：杀菌、荧光效应，防晒霜防UV',
                    '串联并联分析|串联并联详解': teach('电路分析——串联与并联',
                        '**串联电路**：\n• 连接方式：元件逐个顺次连接\n• 电流特点：I = I₁ = I₂ = ...（各处电流相等）\n• 电压特点：U = U₁ + U₂ + ...（总电压等于各部分之和）\n• 电阻特点：R = R₁ + R₂ + ...（总电阻等于各电阻之和）\n• 分压原理：U₁/U₂ = R₁/R₂（电压与电阻成正比）\n• 应用：开关控制全部用电器，一个断开全部断开\n\n**并联电路**：\n• 连接方式：元件并列连接在两点之间\n• 电流特点：I = I₁ + I₂ + ...（总电流等于各支路之和）\n• 电压特点：U = U₁ = U₂ = ...（各支路电压相等）\n• 电阻特点：1/R = 1/R₁ + 1/R₂ + ...（总电阻的倒数等于各倒数之和）\n• 分流原理：I₁/I₂ = R₂/R₁（电流与电阻成反比）\n• 应用：各支路独立，一个断开不影响其他\n\n**电功率公式**：\n• P = UI（通用）\n• P = I²R（串联时用，I相同）\n• P = U²/R（并联时用，U相同）\n\n**焦耳定律**：Q = I²Rt（电流产生的热量）',
                        '两个电阻R₁=6Ω和R₂=3Ω串联接在9V电源上，求各电阻的电压和电流。',
                        '串联电路：\n总电阻 R = R₁ + R₂ = 6 + 3 = 9Ω\n电流 I = U/R = 9/9 = 1A\nU₁ = IR₁ = 1×6 = 6V\nU₂ = IR₂ = 1×3 = 3V\n\n验证：U₁ + U₂ = 6 + 3 = 9V = U ✓\n分压比：U₁/U₂ = 6/3 = 2 = R₁/R₂ = 6/3 ✓',
                        '常见错误：\n• 串联和并联的电流、电压特点搞混\n• 并联总电阻计算错误（不是直接相加）\n• 分压和分流公式记反',
                        '串联记"电流等"，并联记"电压等"。串联分压正比，并联分流反比。'
                    ),
                    '万有引力天体|天体运动|卫星|宇宙速度': teach('万有引力与天体运动',
                        '**万有引力定律**：\n• 公式：F = GMm/r²\n  G：万有引力常量 = 6.67×10⁻¹¹ N·m²/kg²\n  M、m：两个物体的质量\n  r：两物体质心间的距离\n\n**重力加速度**：\n• g = GM/R²（R为星球半径）\n• 地表g ≈ 9.8 m/s²\n\n**三个宇宙速度**：\n• 第一宇宙速度（环绕速度）：v₁ = √(GM/R) ≈ 7.9 km/s\n  最小发射速度，最大环绕速度\n• 第二宇宙速度（脱离速度）：v₂ ≈ 11.2 km/s\n  克服地球引力，成为绕太阳运行的人造行星\n• 第三宇宙速度（逃逸速度）：v₃ ≈ 16.7 km/s\n  克服太阳引力，飞出太阳系\n\n**卫星运动规律**：\n• 万有引力提供向心力：GMm/r² = mv²/r = mω²r\n• 轨道越高，速度越小，周期越大\n• 同步卫星：轨道高度固定，周期=地球自转周期=24h\n• 近地卫星：轨道半径≈地球半径',
                        '已知地球质量M=6×10²⁴kg，半径R=6400km，求第一宇宙速度。',
                        '第一宇宙速度即近地卫星的环绕速度：\nGMm/R² = mv²/R\nv² = GM/R\nv = √(GM/R)\n\n代入数据：\nv = √(6.67×10⁻¹¹ × 6×10²⁴ / 6.4×10⁶)\nv = √(4.002×10⁸ / 6.4×10⁶)\nv = √(6.25×10⁷)\nv ≈ 7.9×10³ m/s = 7.9 km/s\n\n答案：第一宇宙速度约为 **7.9 km/s**',
                        '常见错误：\n• 混淆三个宇宙速度的数值和含义\n• 忘记万有引力提供向心力这一核心关系\n• 轨道越高速度越大（错误！应该是越小）',
                        '记住核心关系：万有引力=向心力。轨道越高，速度越小，周期越大。'
                    ),
                    '核物理基础|衰变|半衰期|核反应': teach('核物理基础——衰变与半衰期',
                        '**原子核结构**：\n• 质子（p）：带正电，质量≈1u\n• 中子（n）：不带电，质量≈1u\n• 核子数 = 质子数 + 中子数 = 质量数A\n• 核电荷数 = 质子数 = 原子序数Z\n• 原子符号：ᴬₓX（A为质量数，Z为质子数）\n\n**放射性衰变**：\n• α衰变：放出α粒子（⁴₂He），质量数减4，质子数减2\n  例：²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂He\n• β衰变：放出β粒子（⁰₋₁e），质量数不变，质子数加1\n  例：²³⁴₉₀Th → ²³⁴₉₁Pa + ⁰₋₁e\n• γ衰变：放出γ光子，质量数和质子数均不变\n\n**半衰期（T）**：\n• 定义：放射性元素半数原子核发生衰变所需时间\n• 公式：N = N₀ × (1/2)^(t/T)\n  N₀：初始原子核数，N：剩余原子核数\n  t：经过时间，T：半衰期\n• 半衰期由原子核内部结构决定，与外界条件无关\n\n**核反应方程**：\n• 质量数守恒：反应前后质量数之和相等\n• 电荷数守恒：反应前后电荷数之和相等\n\n**质能方程**：E = mc²\n• 质量亏损Δm → 释放能量ΔE = Δmc²',
                        '某放射性元素经过8天后，剩余的质量为原来的1/16，求该元素的半衰期。',
                        '设半衰期为T，经过时间t=8天\nN/N₀ = (1/2)^(t/T)\n1/16 = (1/2)^(8/T)\n1/16 = (1/2)⁴\n所以 8/T = 4\nT = 2天\n\n答案：该元素的半衰期为 **2天**',
                        '常见错误：\n• α衰变和β衰变的质子数、质量数变化记错\n• 核反应方程忘记检查质量数和电荷数守恒\n• 半衰期公式中指数计算错误',
                        '写核反应方程时，先检查质量数守恒，再检查电荷数守恒。'
                    )
                },
                chemistry: {
                    '元素周期表': function() {
                        const elements = [
                            {n:1,s:'H',name:'氢',type:'非金属',period:1},
                            {n:2,s:'He',name:'氦',type:'稀有气体',period:1},
                            {n:3,s:'Li',name:'锂',type:'金属',period:2},
                            {n:4,s:'Be',name:'铍',type:'金属',period:2},
                            {n:5,s:'B',name:'硼',type:'非金属',period:2},
                            {n:6,s:'C',name:'碳',type:'非金属',period:2},
                            {n:7,s:'N',name:'氮',type:'非金属',period:2},
                            {n:8,s:'O',name:'氧',type:'非金属',period:2},
                            {n:9,s:'F',name:'氟',type:'非金属',period:2},
                            {n:10,s:'Ne',name:'氖',type:'稀有气体',period:2},
                            {n:11,s:'Na',name:'钠',type:'金属',period:3},
                            {n:12,s:'Mg',name:'镁',type:'金属',period:3},
                            {n:13,s:'Al',name:'铝',type:'金属',period:3},
                            {n:14,s:'Si',name:'硅',type:'非金属',period:3},
                            {n:15,s:'P',name:'磷',type:'非金属',period:3},
                            {n:16,s:'S',name:'硫',type:'非金属',period:3},
                            {n:17,s:'Cl',name:'氯',type:'非金属',period:3},
                            {n:18,s:'Ar',name:'氩',type:'稀有气体',period:3},
                            {n:19,s:'K',name:'钾',type:'金属',period:4},
                            {n:20,s:'Ca',name:'钙',type:'金属',period:4}
                        ];
                        const typeColor = {
                            '金属': 'background:#4a90d9;color:#fff;',
                            '非金属': 'background:#5cb85c;color:#fff;',
                            '稀有气体': 'background:#f0ad4e;color:#fff;'
                        };
                        let html = '<p><strong>前20号元素周期表</strong></p>';
                        html += '<table class="ai-table"><thead><tr><th>周期</th><th>原子序数</th><th>元素符号</th><th>中文名称</th><th>元素类型</th></tr></thead><tbody>';
                        elements.forEach(function(el) {
                            const style = typeColor[el.type] || '';
                            html += '<tr><td>第' + el.period + '周期</td><td>' + el.n + '</td><td><strong>' + el.s + '</strong></td><td>' + el.name + '</td><td><span style="padding:2px 6px;border-radius:4px;font-size:12px;' + style + '">' + el.type + '</span></td></tr>';
                        });
                        html += '</tbody></table>';
                        html += '<p style="margin-top:8px;font-size:12px;color:var(--text-muted);">图例：<span style="padding:2px 6px;border-radius:4px;background:#4a90d9;color:#fff;">金属</span> <span style="padding:2px 6px;border-radius:4px;background:#5cb85c;color:#fff;">非金属</span> <span style="padding:2px 6px;border-radius:4px;background:#f0ad4e;color:#fff;">稀有气体</span></p>';
                        return html;
                    },
                    '周期': '元素周期表分区：\n• IA族（碱金属）：Li、Na、K — 易失去1个电子\n• IIA族（碱土金属）：Be、Mg、Ca\n• VIIA族（卤族）：F、Cl、Br、I — 易得到1个电子\n• 0族（稀有气体）：He、Ne、Ar — 化学性质稳定',
                    '周期表趋势': '**元素周期表规律与趋势**：\n\n**同周期（从左到右）**：\n• 原子半径：逐渐减小\n• 金属性：逐渐减弱\n• 非金属性：逐渐增强\n• 最高价氧化物对应水化物酸性：增强\n• 气态氢化物稳定性：增强\n• 第一电离能：总体增大（半满、全满特例）\n\n**同主族（从上到下）**：\n• 原子半径：逐渐增大\n• 金属性：逐渐增强\n• 非金属性：逐渐减弱\n• 最高价氧化物对应水化物碱性：增强（金属）\n• 气态氢化物稳定性：减弱\n\n**金属性与非金属性判断**：\n• 金属性越强：越易失电子，还原性越强，最高价氧化物水化物碱性越强\n• 非金属性越强：越易得电子，氧化性越强，最高价氧化物水化物酸性越强，氢化物越稳定',
                    '周期律': '**元素周期表规律与趋势**：\n\n**同周期（从左到右）**：\n• 原子半径：逐渐减小\n• 金属性：逐渐减弱\n• 非金属性：逐渐增强\n• 最高价氧化物对应水化物酸性：增强\n• 气态氢化物稳定性：增强\n\n**同主族（从上到下）**：\n• 原子半径：逐渐增大\n• 金属性：逐渐增强\n• 非金属性：逐渐减弱\n• 最高价氧化物对应水化物碱性：增强（金属）\n• 气态氢化物稳定性：减弱',
                    '酸碱': '酸的通性：使石蕊变红，与活泼金属反应生成H₂，与碱中和\n碱的通性：使石蕊变蓝、酚酞变红，与酸中和\n\n**pH值**：\n• pH < 7：酸性（pH越小酸性越强）\n• pH = 7：中性\n• pH > 7：碱性（pH越大碱性越强）\n\n**常见指示剂**：\n• 石蕊：酸红碱蓝\n• 酚酞：酸无碱红\n• 甲基橙：酸红碱黄',
                    '氧化还原': '氧化：失电子，化合价升高\n还原：得电子，化合价降低\n\n**氧化剂**：得电子，化合价降低，被还原\n**还原剂**：失电子，化合价升高，被氧化',
                    '摩尔': '物质的量 n = m/M = N/NA = V/Vm（标况）',
                    '反应': '四种基本反应类型：\n• 化合：A + B → AB（如 2H₂ + O₂ → 2H₂O）\n• 分解：AB → A + B（如 2H₂O₂ → 2H₂O + O₂↑）\n• 置换：A + BC → AC + B（如 Fe + CuSO₄ → FeSO₄ + Cu）\n• 复分解：AB + CD → AD + CB（如 NaOH + HCl → NaCl + H₂O）\n\n**常见化学方程式**：\n1. 2H₂ + O₂ → 2H₂O（氢气燃烧）\n2. C + O₂ → CO₂（碳燃烧）\n3. 2Mg + O₂ → 2MgO（镁燃烧）\n4. 4Fe + 3O₂ → 2Fe₂O₃（铁生锈）\n5. 2H₂O₂ → 2H₂O + O₂↑（过氧化氢分解）\n6. CaCO₃ → CaO + CO₂↑（石灰石分解）\n7. NaOH + HCl → NaCl + H₂O（中和反应）\n8. AgNO₃ + NaCl → AgCl↓ + NaNO₃（复分解）\n9. CH₄ + 2O₂ → CO₂ + 2H₂O（甲烷燃烧）\n10. 2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑（高锰酸钾分解）',
                    '有机': '**烃类**：\n• 烷烃：CnH₂n₊₂，单键，如甲烷CH₄、乙烷C₂H₆\n• 烯烃：CnH₂n，双键，如乙烯C₂H₄\n• 炔烃：CnH₂n₋₂，三键，如乙炔C₂H₂\n• 芳香烃：苯环结构，如苯C₆H₆\n\n**常见官能团**：\n• 羟基(-OH)：醇类，如乙醇C₂H₅OH\n• 醛基(-CHO)：醛类，如甲醛HCHO\n• 羧基(-COOH)：羧酸，如乙酸CH₃COOH\n• 酯基(-COO-)：酯类，如乙酸乙酯\n• 氨基(-NH₂)：胺类\n\n**常见有机物**：\n• 甲烷 CH₄（天然气主要成分）\n• 乙醇 C₂H₅OH（酒精）\n• 乙酸 CH₃COOH（醋酸）\n• 葡萄糖 C₆H₁₂O₆',
                    '元素': '常见元素性质：\n• 氢(H)：最轻元素，宇宙中含量最多\n• 氧(O)：地壳中含量最多的元素（约48.6%）\n• 碳(C)：有机物基础元素，有金刚石和石墨等同素异形体\n• 铁(Fe)：地壳中含量第四，常用金属\n• 铜(Cu)：紫红色金属，导电性仅次于银\n• 铝(Al)：地壳中含量最多的金属元素\n• 硅(Si)：半导体材料，地壳中含量第二\n• 钙(Ca)：人体骨骼和牙齿的主要成分\n• 氯(Cl)：黄绿色有毒气体，用于消毒\n• 硫(S)：黄色固体，火山附近常见',
                    '元素性质': function() {
                        return renderTable(
                            ['元素', '符号', '原子序数', '类型', '特点'],
                            [
                                ['氢', 'H', '1', '非金属', '最轻元素，宇宙最多'],
                                ['氧', 'O', '8', '非金属', '助燃，占空气21%'],
                                ['碳', 'C', '6', '非金属', '有机物基础'],
                                ['铁', 'Fe', '26', '金属', '常见金属，有磁性'],
                                ['金', 'Au', '79', '金属', '贵金属，化学稳定'],
                            ]
                        );
                    },
                    '溶液': '溶液相关概念：\n• 溶质：被溶解的物质\n• 溶剂：能溶解其他物质的物质（通常为水）\n• 饱和溶液：在一定温度下，不能再溶解某种溶质的溶液\n• 溶解度：在一定温度下，100g溶剂中最多能溶解的溶质质量\n• 影响溶解度的因素：温度（大多数固体随温度升高而增大）、压强（气体随压强增大而增大）',
                    '原子': '**原子结构**：\n• 原子核：质子（带正电）+ 中子（不带电）\n• 核外电子：带负电，绕核运动\n• 原子序数 = 质子数 = 核外电子数\n• 质量数 = 质子数 + 中子数\n\n**电子排布**：\n• 第一层最多2个电子\n• 第二层最多8个电子\n• 最外层不超过8个电子（第一层为最外层时不超过2个）',
                    '化学键': '**离子键**：阴阳离子间的静电作用（如NaCl）\n**共价键**：原子间共用电子对（如H₂O、CO₂）\n**金属键**：金属阳离子与自由电子间的作用\n\n**键的极性**：\n• 非极性键：同种原子间（H-H）\n• 极性键：不同种原子间（H-Cl）',
                    '方程式': '**常见化学方程式（20个）**：\n1. 2H₂ + O₂ → 2H₂O\n2. C + O₂ → CO₂\n3. 2Mg + O₂ → 2MgO\n4. 3Fe + 2O₂ → Fe₃O₄\n5. 4P + 5O₂ → 2P₂O₅\n6. S + O₂ → SO₂\n7. 2H₂O₂ → 2H₂O + O₂↑\n8. 2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑\n9. 2KClO₃ → 2KCl + 3O₂↑\n10. 2H₂O → 2H₂↑ + O₂↑\n11. CaCO₃ → CaO + CO₂↑\n12. CaO + H₂O → Ca(OH)₂\n13. CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O\n14. NaOH + HCl → NaCl + H₂O\n15. H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O\n16. Fe + CuSO₄ → FeSO₄ + Cu\n17. Zn + H₂SO₄ → ZnSO₄ + H₂↑\n18. AgNO₃ + NaCl → AgCl↓ + NaNO₃\n19. BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl\n20. CH₄ + 2O₂ → CO₂ + 2H₂O',
                    '反应方程式|化学方程式表': function() {
                        return renderTable(
                            ['反应类型', '方程式', '条件', '现象'],
                            [
                                ['化合', '2H₂ + O₂ → 2H₂O', '点燃', '产生淡蓝色火焰'],
                                ['分解', '2H₂O₂ → 2H₂O + O₂↑', 'MnO₂催化', '产生气泡'],
                                ['置换', 'Fe + CuSO₄ → FeSO₄ + Cu', '常温', '铁表面出现红色固体'],
                                ['复分解', 'NaOH + HCl → NaCl + H₂O', '常温', '无明显现象'],
                                ['燃烧', 'C + O₂ → CO₂', '点燃', '发出白光'],
                                ['中和', 'Ca(OH)₂ + 2HCl → CaCl₂ + 2H₂O', '常温', '放热'],
                            ]
                        );
                    },
                    '酸碱中和|中和反应': '**酸碱中和反应**：\n\n**定义**：酸与碱作用生成盐和水的反应\n**通式**：酸 + 碱 → 盐 + 水\n\n**常见中和反应**：\n• HCl + NaOH → NaCl + H₂O\n• H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O\n• HNO₃ + KOH → KNO₃ + H₂O\n• 2HCl + Ca(OH)₂ → CaCl₂ + 2H₂O\n\n**中和反应实质**：H⁺ + OH⁻ → H₂O\n\n**应用**：\n• 治疗胃酸过多（服用含Al(OH)₃的药物）\n• 改良酸性土壤（撒石灰）\n• 处理工厂酸性废水\n• 制作肥皂（油脂+碱）\n\n**指示剂**：\n• 石蕊：酸→红，碱→蓝\n• 酚酞：酸→无色，碱→红色\n• pH试纸：广泛测定酸碱度\n  pH < 7 酸性，pH = 7 中性，pH > 7 碱性',
                    '氧化还原|氧化还原反应': '**氧化还原反应**：\n\n**定义**：有电子转移（化合价变化）的化学反应\n\n**基本概念**：\n• 氧化：失去电子，化合价升高\n• 还原：得到电子，化合价降低\n• 氧化剂：得到电子（化合价降低）的物质\n• 还原剂：失去电子（化合价升高）的物质\n\n**判断方法**：化合价升降\n• 升失氧（化合价升高→失电子→被氧化→做还原剂）\n• 降得还（化合价降低→得电子→被还原→做氧化剂）\n\n**常见氧化还原反应**：\n• 2Na + Cl₂ → 2NaCl（Na被氧化，Cl₂被还原）\n• Fe + CuSO₄ → FeSO₄ + Cu（Fe被氧化，Cu²⁺被还原）\n• MnO₂ + 4HCl(浓) → MnCl₂ + Cl₂↑ + 2H₂O\n\n**应用**：\n• 金属冶炼（用还原剂还原金属氧化物）\n• 燃烧（氧化反应）\n• 腐蚀（铁生锈）\n• 电池（化学能→电能）',
                    '实验|实验室|器材|仪器|烧杯|试管': '**常见化学实验室仪器**：\n\n' + renderTable(
                        ['仪器名称', '用途', '使用注意事项'],
                        [
                            ['试管', '少量试剂反应、加热', '加热时用试管夹，先预热'],
                            ['烧杯', '配制溶液、较多量反应', '加热时垫石棉网'],
                            ['量筒', '量取液体体积', '读数时视线与凹液面最低处平齐'],
                            ['酒精灯', '加热', '用外焰加热，禁止向燃着的酒精灯添加酒精'],
                            ['托盘天平', '称量物质质量', '左物右码，精确到0.1g'],
                            ['漏斗', '过滤、引流', '过滤时引流，液面低于滤纸'],
                            ['蒸发皿', '蒸发浓缩溶液', '用坩埚钳夹取，加热时不断搅拌'],
                            ['集气瓶', '收集气体', '不能加热，瓶口磨砂'],
                            ['分液漏斗', '分离互不相溶液体', '上层液体从上口倒出'],
                            ['容量瓶', '配制一定浓度溶液', '不能加热，不能溶解固体'],
                        ]
                    ) + '\n\n**实验室安全**：\n• 浓酸溅到皮肤上：立即用大量水冲洗，再涂3-5%NaHCO₃\n• 浓碱溅到皮肤上：大量水冲洗，再涂硼酸\n• 酒精灯着火：用湿抹布盖灭，不能用水',
                    '化学方程式配平|配平方法|配平': teach('化学方程式配平方法',
                        '**化学方程式配平原则**：\n• 质量守恒：反应前后各元素原子个数相等\n• 化合价守恒：氧化还原反应中化合价升降总数相等\n\n**常用配平方法**：\n\n**1. 观察法（最小公倍数法）**：\n找左右两边出现次数最少的元素，用最小公倍数确定系数\n例：Fe + O₂ → Fe₃O₄\nFe：左边1个，右边3个 → 左边Fe配3\nO：左边2个，右边4个 → 左边O₂配2\n结果：3Fe + 2O₂ → Fe₃O₄\n\n**2. 奇数配偶法**：\n找出现次数为奇数的元素，将其配为偶数\n例：C₂H₆ + O₂ → CO₂ + H₂O\nH在H₂O中为2（偶数），在C₂H₆中为6\nO在O₂中为2（偶数），在CO₂中为2，在H₂O中为1（奇数）\n先将H₂O配为偶数系数\n\n**3. 化合价升降法（氧化还原反应）**：\n标出化合价变化，使升降总数相等\n例：MnO₂ + 4HCl(浓) → MnCl₂ + Cl₂↑ + 2H₂O\nMn：+4 → +2（降2）×1\nCl：-1 → 0（升1）×2\n\n**4. 代数法**：\n设未知数系数，列方程组求解',
                        '配平化学方程式：Al + Fe₃O₄ → Al₂O₃ + Fe',
                        '用化合价升降法：\nAl：0 → +3（升3）\nFe：+3 → 0（降3×3=降9，因为有3个Fe）\n\n为使升降总数相等：\nAl升3 × 3个 = 9\nFe降3 × 3个 = 9\n\n所以Al配8（8个Al，每个升3，共升24）\nFe配9（9个Fe，每个降3，共降24）\n\n8Al + 3Fe₃O₄ → 4Al₂O₃ + 9Fe\n\n验证：\nAl：左8=右4×2=8 ✓\nFe：左3×3=9=右9 ✓\nO：左3×4=12=右4×3=12 ✓',
                        '常见错误：\n• 配平后忘记检查所有元素\n• 氧化还原反应中升降总数不相等\n• 分数系数没有化为最小整数比',
                        '配平后一定要检查所有元素的原子个数是否相等！'
                    ),
                    '有机化学基础|烷烃命名|同分异构|有机命名': teach('有机化学基础——烷烃命名与同分异构',
                        '**烷烃**：\n• 通式：CₙH₂ₙ₊₂（n≥1）\n• 结构特点：碳碳单键，链状\n• 命名规则（系统命名法）：\n  ①选主链：选含碳原子最多的链\n  ②编号：从离支链最近的一端编号\n  ③写名称：支链位置-支链名称-主链名称\n  例：CH₃-CH(CH₃)-CH₂-CH₃ → 2-甲基丁烷\n\n**常见烷烃**：\n• 甲烷 CH₄（天然气主要成分）\n• 乙烷 C₂H₆\n• 丙烷 C₃H₈\n• 丁烷 C₄H₁₀\n\n**同分异构体**：\n• 定义：分子式相同，结构不同的化合物\n• 烷烃同分异构：碳链异构（支链位置不同）\n• 丁烷 C₄H₁₀：正丁烷、异丁烷（2种）\n• 戊烷 C₅H₁₂：3种同分异构体\n• 己烷 C₆H₁₄：5种同分异构体\n\n**同分异构体数规律**：\n碳原子数：1  2  3  4  5  6  7   8\n异构体数：1  1  1  2  3  5  9  18\n\n**烃类对比**：\n• 烷烃 CₙH₂ₙ₊₂：单键，饱和\n• 烯烃 CₙH₂ₙ：含双键，不饱和\n• 炔烃 CₙH₂ₙ₋₂：含三键，不饱和\n• 芳香烃：含苯环',
                        '写出C₅H₁₂（戊烷）的所有同分异构体。',
                        'C₅H₁₂有3种同分异构体：\n\n1. 正戊烷（直链）：\n   CH₃-CH₂-CH₂-CH₂-CH₃\n\n2. 2-甲基丁烷（一个支链在C2上）：\n   CH₃-CH(CH₃)-CH₂-CH₃\n\n3. 2,2-二甲基丙烷（两个支链在C2上）：\n   CH₃-C(CH₃)₂-CH₃\n\n记忆技巧：碳原子数越多，同分异构体越多',
                        '常见错误：\n• 命名时编号方向错误（应从离支链最近端编号）\n• 遗漏同分异构体（尤其是对称结构）\n• 混淆同分异构体和同素异形体',
                        '画碳骨架时从直链开始，逐步移动支链位置，注意不要遗漏。'
                    ),
                    '电化学|原电池|电解池|电池|电解': teach('电化学基础——原电池与电解池',
                        '**原电池（化学能→电能）**：\n• 原理：氧化还原反应在两个电极上分别进行，产生电流\n• 构成条件：\n  ① 两个活泼性不同的电极\n  ② 电解质溶液\n  ③ 形成闭合回路\n• 电极判断：\n  负极：较活泼金属，失去电子，发生氧化反应\n  正极：较不活泼金属/石墨，得到电子，发生还原反应\n\n**铜锌原电池**（Zn-Cu稀H₂SO₄）：\n• 负极（Zn）：Zn - 2e⁻ → Zn²⁺（氧化反应）\n• 正极（Cu）：2H⁺ + 2e⁻ → H₂↑（还原反应）\n• 总反应：Zn + 2H⁺ → Zn²⁺ + H₂↑\n• 电子方向：负极→导线→正极\n• 电流方向：正极→导线→负极（与电子相反）\n\n**电解池（电能→化学能）**：\n• 原理：外加电源使非自发的氧化还原反应进行\n• 电极判断：\n  阳极：接电源正极，发生氧化反应\n  阴极：接电源负极，发生还原反应\n\n**电解水**：\n• 阳极：2H₂O - 4e⁻ → O₂↑ + 4H⁺\n• 阴极：4H₂O + 4e⁻ → 2H₂↑ + 4OH⁻\n• 总反应：2H₂O →(电解) 2H₂↑ + O₂↑\n• 氢气与氧气体积比 = 2:1\n\n**应用**：\n• 原电池：干电池、蓄电池、燃料电池\n• 电解池：电镀、电解冶炼、氯碱工业',
                        '判断下列装置是原电池还是电解池，并写出电极反应式：\nZn片和Cu片插入稀H₂SO₄中，用导线连接。',
                        '这是**原电池**（自发的氧化还原反应产生电能）\n\n负极（Zn）：Zn - 2e⁻ → Zn²⁺（氧化反应）\n正极（Cu）：2H⁺ + 2e⁻ → H₂↑（还原反应）\n\n现象：\n• Zn片逐渐溶解\n• Cu片表面有气泡产生\n• 电流计指针偏转\n\n电子流向：Zn（负极）→ 导线 → Cu（正极）\n电流方向：Cu（正极）→ 导线 → Zn（负极）',
                        '常见错误：\n• 原电池和电解池混淆（原电池是自发反应，电解池需要外接电源）\n• 电极名称搞混（原电池叫正负极，电解池叫阴阳极）\n• 电子和电流方向搞反',
                        '口诀：原电池"负氧正还"，电解池"阳氧阴还"。电子方向与电流方向相反。'
                    )
                },
                biology: {
                    '微生物': '**微生物学基础**：\n\n**微生物分类**：\n• 细菌：单细胞原核生物，无核膜，有细胞壁（肽聚糖）\n  形态：球菌、杆菌、螺旋菌\n  代谢：自养/异养、需氧/厌氧\n  应用：发酵（酸奶、醋）、制药（抗生素）\n\n• 真菌：真核生物，有细胞核\n  酵母菌：单细胞，用于酿酒、发面\n  霉菌：多细胞（青霉、曲霉），产抗生素\n  蘑菇：大型真菌\n\n• 病毒：非细胞结构，由蛋白质外壳和核酸组成\n  必须寄生在活细胞内才能繁殖\n  类型：DNA病毒、RNA病毒\n  疾病：流感、艾滋病、新冠肺炎\n\n• 原生动物：单细胞真核生物\n  如草履虫、变形虫、疟原虫\n\n**微生物培养**：\n• 培养基：提供营养物质的基质\n• 灭菌：高温高压蒸汽灭菌（121°C，15-30分钟）\n• 接种：在无菌条件下将微生物转移到培养基上\n• 培养条件：温度、pH、氧气\n\n**微生物与人类关系**：\n• 有益：发酵、制药、分解有机物、固氮\n• 有害：致病、食物腐败',
                    '细菌': '**细菌基础知识**：\n• 单细胞原核生物，无核膜\n• 细胞壁成分：肽聚糖\n• 形态：球菌、杆菌、螺旋菌\n• 代谢类型多样：自养/异养、需氧/厌氧\n• 繁殖方式：二分裂\n• 应用：发酵、制药、环境修复',
                    '病毒': '**病毒基础知识**：\n• 非细胞结构，由蛋白质外壳和核酸（DNA或RNA）组成\n• 必须寄生在活细胞内才能繁殖\n• 常见病毒：流感病毒、HIV、新冠病毒\n• 预防：疫苗接种、个人卫生',
                    '细胞': '细胞基本结构：\n• 细胞膜（保护、控制物质进出）\n• 细胞质（含细胞器）\n• 细胞核（遗传信息库）\n植物细胞特有：细胞壁、叶绿体、大液泡',
                    '细胞器': '主要细胞器：\n• 线粒体：有氧呼吸主要场所，提供能量\n• 叶绿体：光合作用场所\n• 内质网：蛋白质加工运输\n• 高尔基体：加工分泌蛋白质\n• 核糖体：合成蛋白质\n• 溶酶体：分解废物',
                    '光合作用': '6CO₂ + 6H₂O →(光/叶绿体) C₆H₁₂O₆ + 6O₂\n光反应（类囊体）：水光解、ATP合成\n暗反应（基质）：CO₂固定、C₃还原',
                    '遗传': 'DNA双螺旋，碱基配对 A-T、G-C\n分离定律：杂合子自交 3:1\n自由组合定律：双杂合子自交 9:3:3:1\n\n**DNA结构**：\n• 脱氧核糖核酸，双螺旋结构\n• 碱基配对：A(腺嘌呤)-T(胸腺嘧啶)，G(鸟嘌呤)-C(胞嘧啶)\n\n**RNA类型**：\n• mRNA（信使RNA）：携带遗传信息\n• tRNA（转运RNA）：转运氨基酸\n• rRNA（核糖体RNA）：组成核糖体\n\n**蛋白质合成**：\n1. 转录：DNA→mRNA（细胞核中）\n2. 翻译：mRNA→蛋白质（核糖体上）',
                    '人体': '八大系统：消化、循环、呼吸、泌尿、神经、内分泌、生殖、运动\n\n**神经系统**：\n• 中枢神经系统：脑和脊髓\n• 周围神经系统：脑神经和脊神经\n• 神经元：细胞体、树突、轴突\n\n**内分泌系统**：\n• 垂体：生长激素\n• 甲状腺：甲状腺激素\n• 胰岛：胰岛素、胰高血糖素\n• 肾上腺：肾上腺素\n\n**免疫系统**：\n• 非特异性免疫：皮肤、黏膜、吞噬细胞\n• 特异性免疫：体液免疫（B细胞）和细胞免疫（T细胞）\n\n**生殖系统**：\n• 男性：睾丸产生精子，分泌雄性激素\n• 女性：卵巢产生卵子，分泌雌性激素',
                    '消化': '消化系统：\n• 口腔→食道→胃→小肠→大肠→肛门\n• 消化液：唾液（淀粉酶）、胃液（蛋白酶）、肠液、胰液、胆汁\n• 小肠是主要吸收场所（绒毛结构增大吸收面积）',
                    '循环': '血液循环：\n• 体循环：左心室→主动脉→全身毛细血管→上下腔静脉→右心房\n• 肺循环：右心室→肺动脉→肺部毛细血管→肺静脉→左心房\n• 血液成分：血浆、红细胞（运O₂）、白细胞（免疫）、血小板（凝血）',
                    '呼吸': '呼吸作用：\nC₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 能量\n呼吸系统：鼻腔→咽→喉→气管→支气管→肺\n肺泡是气体交换的场所',
                    '分裂': '细胞分裂：\n• 有丝分裂：体细胞分裂方式\n  前期→中期→后期→末期\n  特点：染色体复制后平均分配，子细胞与母细胞遗传信息相同\n  意义：生长、修复、繁殖\n• 减数分裂：生殖细胞（精子/卵子）分裂方式\n  染色体数目减半（2n→n）\n  意义：有性生殖中维持染色体数目稳定\n• 无丝分裂：不出现纺锤丝和染色体的变化（如蛙的红细胞）',
                    '基因': '遗传学基础：\n• DNA是主要的遗传物质\n• 基因是具有遗传效应的DNA片段\n• 基因在染色体上呈线性排列\n• 性状由基因控制\n• 显性基因（大写字母）和隐性基因（小写字母）\n• 基因型（如Aa）和表现型（如显性性状）\n\n孟德尔遗传实验：\n• 一对相对性状杂交：AA × aa → Aa（F1）→ 1AA:2Aa:1aa（F2）\n• 测交：Aa × aa → 1Aa:1aa（验证基因型）\n• 伴性遗传：X染色体上的基因遗传与性别相关（如色盲）',
                    '进化': '达尔文自然选择学说：\n• 过度繁殖\n• 生存斗争\n• 遗传变异\n• 适者生存\n\n**现代进化理论**：\n• 种群是进化的基本单位\n• 突变和基因重组产生进化的原材料\n• 自然选择决定进化方向\n• 隔离导致新物种形成\n\n**适应**：生物形态结构和生理功能与环境相适应\n**物种形成**：地理隔离→生殖隔离→新物种',
                    '生态': '生态系统组成：\n• 生产者（绿色植物）\n• 消费者（动物）\n• 分解者（细菌、真菌）\n\n食物链：生产者→初级消费者→次级消费者...\n能量流动：单向流动、逐级递减（约10%）\n\n**生物地球化学循环**：\n• 碳循环：CO₂→光合作用→有机物→呼吸/分解→CO₂\n• 氮循环：固氮→硝化→反硝化\n• 水循环：蒸发→降水→径流',
                    '植物': '植物组织：保护组织、营养组织、输导组织、分生组织\n植物激素：生长素、赤霉素、细胞分裂素、脱落酸、乙烯\n\n**植物生理**：\n• 蒸腾作用：水分通过叶片气孔散失\n• 植物激素：\n  - 生长素：促进细胞伸长，顶端优势\n  - 赤霉素：促进茎伸长和种子萌发\n  - 细胞分裂素：促进细胞分裂\n  - 脱落酸：抑制生长，促进休眠\n  - 乙烯：促进果实成熟',
                    '分类|生物分类': function() {
                        return renderTable(
                            ['界', '门/类', '代表生物', '特点', '细胞类型'],
                            [
                                ['动物界', '脊椎动物', '哺乳类（人、猫）', '胎生哺乳，恒温', '真核'],
                                ['动物界', '脊椎动物', '鸟类（鹰、麻雀）', '卵生，有羽毛，恒温', '真核'],
                                ['动物界', '脊椎动物', '爬行类（蛇、龟）', '卵生，变温', '真核'],
                                ['动物界', '脊椎动物', '两栖类（蛙、蝾螈）', '变态发育，水陆两栖', '真核'],
                                ['动物界', '脊椎动物', '鱼类（鲤鱼、鲨鱼）', '水生，用鳃呼吸', '真核'],
                                ['植物界', '被子植物', '双子叶（大豆、玫瑰）', '种子有果皮包被', '真核'],
                                ['植物界', '被子植物', '单子叶（水稻、玉米）', '种子有果皮包被', '真核'],
                                ['植物界', '裸子植物', '松树、银杏', '种子裸露无果皮', '真核'],
                                ['真菌界', '真菌', '蘑菇、酵母菌', '异养，孢子繁殖', '真核'],
                                ['原核生物', '细菌', '大肠杆菌、乳酸菌', '无核膜，微小', '原核'],
                            ]
                        );
                    },
                    '光合作用|photosynthesis': '**光合作用**：\n\n**总方程式**：6CO₂ + 6H₂O →(光照/叶绿体)→ C₆H₁₂O₆ + 6O₂\n\n**过程**：\n• 光反应阶段（在类囊体薄膜上）：\n  - 水的光解：2H₂O → 4[H] + O₂\n  - ATP的合成：ADP + Pi → ATP\n  - NADPH的生成\n• 暗反应/碳反应阶段（在叶绿体基质中）：\n  - CO₂固定：CO₂ + C₅ → 2C₃\n  - C₃还原：C₃ + [H] + ATP → (CH₂O) + C₅\n\n**影响因素**：\n• 光照强度（直接影响光反应）\n• CO₂浓度（影响暗反应）\n• 温度（影响酶活性，最适25-30°C）\n• 水分供应\n\n**意义**：\n• 将无机物转化为有机物\n• 将光能转化为化学能\n• 维持大气中O₂和CO₂的平衡',
                    '呼吸作用|cellular respiration': '**细胞呼吸**：\n\n**有氧呼吸总方程式**：\nC₆H₁₂O₆ + 6O₂ + 6H₂O → 6CO₂ + 12H₂O + 能量(38ATP)\n\n**三个阶段**：\n1. 糖酵解（细胞质基质）：\n   C₆H₁₂O₆ → 2丙酮酸 + 4[H] + 2ATP\n2. 柠檬酸循环（线粒体基质）：\n   丙酮酸 + H₂O → CO₂ + [H] + 2ATP\n3. 电子传递链（线粒体内膜）：\n   [H] + O₂ → H₂O + 34ATP\n\n**无氧呼吸**：\n• 酒精发酵：C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + 2ATP\n• 乳酸发酵：C₆H₁₂O₆ → 2C₃H₆O₃ + 2ATP\n\n**应用**：\n• 酿酒利用酒精发酵\n• 酸奶利用乳酸发酵\n• 运动后肌肉酸痛（乳酸积累）',
                    '消化系统|消化|肠胃': '**人体消化系统**：\n\n**消化道**：口腔 → 咽 → 食道 → 胃 → 小肠 → 大肠 → 肛门\n\n**消化腺**：\n• 唾液腺：分泌唾液（含淀粉酶），分解淀粉为麦芽糖\n• 胃腺：分泌胃液（含盐酸和胃蛋白酶），分解蛋白质\n• 肝脏：分泌胆汁（乳化脂肪，不含消化酶）\n• 胰腺：分泌胰液（含淀粉酶、蛋白酶、脂肪酶）\n• 肠腺：分泌肠液（含多种消化酶）\n\n**小肠是主要消化吸收场所**：\n• 含有多种消化酶\n• 内壁有大量环形皱襞和小肠绒毛，面积大\n• 绒毛内有毛细血管和毛细淋巴管\n\n**营养吸收**：\n• 葡萄糖、氨基酸 → 毛细血管 → 血液循环\n• 甘油、脂肪酸 → 毛细淋巴管 → 淋巴系统',
                    '植物细胞|动物细胞|细胞对比|细胞比较': function() {
                        return renderTable(
                            ['比较项目', '植物细胞', '动物细胞'],
                            [
                                ['细胞壁', '有（纤维素和果胶）', '无'],
                                ['细胞膜', '有', '有'],
                                ['细胞核', '有', '有'],
                                ['叶绿体', '有（绿色部分）', '无'],
                                ['大液泡', '有（成熟细胞）', '无（有小液泡）'],
                                ['线粒体', '有', '有'],
                                ['中心体', '低等植物有', '有'],
                                ['储能物质', '淀粉', '糖原'],
                                ['细胞分裂', '有细胞板', '有星射线'],
                            ]
                        ) + '\n\n**共同点**：都有细胞膜、细胞质、细胞核、线粒体、核糖体等\n**区别关键**：植物细胞有细胞壁、叶绿体、大液泡';
                    },
                    '心脏|血液循环|循环系统|体循环|肺循环': teach('人体循环系统——心脏结构与血液循环',
                        '**心脏结构**：\n• 四个腔：左心房、左心室、右心房、右心室\n• 左心室壁最厚（泵血到全身，需要最大压力）\n• 瓣膜：房室瓣（防止血液倒流）、动脉瓣\n• 左侧流动动脉血（含氧多，鲜红色）\n• 右侧流动静脉血（含氧少，暗红色）\n\n**血液循环路径**：\n\n**体循环（大循环）**：\n左心室 → 主动脉 → 全身毛细血管网 → 上下腔静脉 → 右心房\n• 在毛细血管处：O₂释放给组织细胞，CO₂进入血液\n• 动脉血 → 静脉血\n\n**肺循环（小循环）**：\n右心室 → 肺动脉 → 肺部毛细血管 → 肺静脉 → 左心房\n• 在肺部毛细血管处：CO₂释放，O₂进入血液\n• 静脉血 → 动脉血\n\n**血液成分**：\n• 血浆：淡黄色液体，运输营养物质和废物\n• 红细胞：运输O₂和部分CO₂（含血红蛋白）\n• 白细胞：免疫防御（吞噬病菌）\n• 血小板：凝血和止血\n\n**血管类型**：\n• 动脉：管壁厚、弹性大、血流快（离心方向）\n• 静脉：管壁薄、弹性小、血流慢（回心方向），有静脉瓣\n• 毛细血管：管壁最薄（一层细胞），最细，血流最慢，利于物质交换',
                        '简述血液从左心室出发，经过体循环回到右心房的完整路径。',
                        '左心室（泵出动脉血）\n→ 主动脉\n→ 各级动脉分支\n→ 全身组织毛细血管（O₂释放，CO₂进入，动脉血变静脉血）\n→ 各级静脉汇合\n→ 上下腔静脉\n→ 右心房\n\n整个过程中，血液在毛细血管处完成气体交换：\n• O₂ + 血红蛋白 → 氧合血红蛋白（在肺部相反方向）\n• 组织细胞产生的CO₂进入血液',
                        '常见错误：\n• 混淆体循环和肺循环的路径\n• 认为动脉里都是动脉血（肺动脉中是静脉血）\n• 左心和右心的功能搞反',
                        '记住：左心泵血到全身（体循环），右心泵血到肺部（肺循环）。'
                    ),
                    '生态系统|能量流动|物质循环|食物链|食物网': teach('生态系统——能量流动与物质循环',
                        '**生态系统组成**：\n• 非生物部分：阳光、空气、水、温度等\n• 生物部分：\n  - 生产者（自养生物）：绿色植物、藻类（光合作用）\n  - 消费者（异养生物）：动物\n    • 初级消费者：草食动物\n    • 次级消费者：肉食动物\n    • 三级消费者：顶级肉食动物\n  - 分解者：细菌、真菌（分解有机物为无机物）\n\n**能量流动特点**：\n• 单向流动、逐级递减\n• 相邻营养级之间的传递效率约10%-20%\n• 能量金字塔：底层（生产者）最多，顶层最少\n\n**物质循环（碳循环）**：\n• CO₂ →（光合作用）→ 有机物 →（呼吸作用/分解）→ CO₂\n• 化石燃料燃烧也释放CO₂\n• 碳在生物群落与无机环境之间循环\n\n**食物链与食物网**：\n• 食物链：生产者 → 初级消费者 → 次级消费者 → ...\n• 营养级越高，体内的有毒物质浓度越高（生物富集）\n• 食物网：多条食物链交织形成的网络\n\n**生态平衡**：\n• 生态系统具有一定的自我调节能力\n• 营养结构越复杂，自我调节能力越强\n• 外界干扰超过调节能力 → 生态失衡',
                        '在一个生态系统中，若有10000kJ的能量被生产者固定，按10%传递效率计算，第三营养级能获得多少能量？',
                        '第一营养级（生产者）：10000kJ\n第二营养级（初级消费者）：10000 × 10% = 1000kJ\n第三营养级（次级消费者）：1000 × 10% = 100kJ\n\n答案：第三营养级能获得约 **100kJ** 的能量\n\n能量流动逐级递减，越到高层可用能量越少，这就是为什么食物链一般不超过4-5个营养级。',
                        '常见错误：\n• 能量传递效率记错（是10%-20%，不是固定10%）\n• 食物链的起点不是生产者（错误，必须从生产者开始）\n• 分解者不参与食物链（分解者不在营养级中）\n• 混淆能量流动（单向）和物质循环（循环）',
                        '能量流动是单向递减的，物质循环是反复利用的。'
                    ),
                    '进化论|自然选择|适应辐射|达尔文|生物进化': teach('生物进化论——自然选择与适应辐射',
                        '**达尔文自然选择学说**（1859年《物种起源》）：\n\n**核心内容**：\n1. 过度繁殖：生物产生的后代数量远超环境承载能力\n2. 生存斗争：个体之间为生存资源而竞争\n3. 遗传变异：个体之间存在可遗传的差异\n4. 适者生存：适应环境的个体生存并繁殖后代\n\n**现代综合进化理论**：\n• 种群是进化的基本单位\n• 基因频率的改变是进化的实质\n• 突变和基因重组提供进化的原材料\n• 自然选择决定进化的方向\n• 隔离导致物种形成\n\n**物种形成过程**：\n地理隔离 → 生殖隔离 → 新物种\n\n**适应辐射**：\n• 定义：一个祖先物种在短时间内分化出多种不同形态的后代\n• 条件：进入新的、空的生态位（如岛屿）\n• 经典案例：达尔文雀（加拉帕戈斯群岛）\n  同一祖先的雀类因适应不同食物来源，喙的形态各异\n\n**进化证据**：\n• 化石证据：地层中不同年代的化石显示生物演变\n• 比较解剖学：同源器官（如人手、蝙蝠翼、鲸鳍）\n• 分子生物学：DNA序列比较，亲缘关系越近越相似\n• 胚胎学：早期胚胎相似（如人、鱼、鸡胚胎）',
                        '用自然选择学说解释长颈鹿的进化过程。',
                        '1. 遗传变异：远古长颈鹿群体中，脖子有长有短（遗传差异）\n2. 过度繁殖：长颈鹿产生的后代数量超过环境承载能力\n3. 生存斗争：食物（高处树叶）有限，个体间竞争\n4. 适者生存：脖子较长的个体能吃到更多高处树叶，生存和繁殖机会更大\n5. 遗传：长脖子性状传递给后代\n6. 经过许多代，长脖子基因频率增加，短脖子基因频率减少\n7. 最终形成现代长颈鹿\n\n关键：环境对变异起到了选择作用，不是个体"想要"变长脖子。',
                        '常见错误：\n• 认为进化是"用进废退"（拉马克主义，已被否定）\n• 混淆个体变异和种群进化\n• 认为进化有方向性（实际是环境选择的结果）\n• 忽略变异是随机的，选择是定向的',
                        '记住：变异是随机的，自然选择是定向的。进化是种群基因频率的改变。'
                    )
                }
            };

            const map = { '物理': 'physics', '化学': 'chemistry', '生物': 'biology' };
            const key = map[subject];
            if (!key || !responses[key]) return null;

            for (const [keyword, answer] of Object.entries(responses[key])) {
                if (q.includes(keyword.toLowerCase())) return typeof answer === 'function' ? answer() : answer;
            }

            // 通用回复
            const generics = {
                physics: '我可以帮你解答力学、电学、光学、热学问题。请把具体题目发给我，我会给出解题步骤。',
                chemistry: '我可以帮你解答元素、方程式、酸碱盐、有机化学问题。请把具体题目发给我。',
                biology: '我可以帮你解答细胞、遗传、生态系统、人体生理问题。请把具体题目发给我。'
            };
            return generics[key] || null;
        }

        // ========== 5b. 理科补充知识 ==========

        // ========== 6. 文科智能处理 ==========
        function handleHumanities(subject, question, cleanQ) {
            const q = question.toLowerCase();
            if (subject === '历史') {
                if (q.includes('朝代') && (q.includes('顺序') || q.includes('歌'))) {
                    return '中国朝代顺序：\n夏商与西周，东周分两段。\n春秋和战国，一统秦两汉。\n三分魏蜀吴，二晋前后沿。\n南北朝并立，隋唐五代传。\n宋元明清后，皇朝至此完。';
                }
                if (q.includes('事件') || q.includes('年份') || q.includes('时间')) {
                    return '**30个重要历史事件**：\n\n**中国古代**：\n• 前2070年 — 夏朝建立（中国第一个王朝）\n• 前1600年 — 商朝建立\n• 前1046年 — 武王伐纣，西周建立\n• 前770年 — 东周开始，春秋时期\n• 前475年 — 战国时期开始\n• 前221年 — 秦始皇统一六国\n• 前206年 — 秦亡，楚汉之争\n• 前138年 — 张骞出使西域\n• 208年 — 赤壁之战\n• 581年 — 隋朝建立\n• 618年 — 唐朝建立\n• 755年 — 安史之乱\n• 960年 — 北宋建立\n• 1069年 — 王安石变法\n• 1271年 — 元朝建立\n• 1368年 — 明朝建立\n• 1405年 — 郑和下西洋\n• 1644年 — 清朝建立\n\n**中国近现代**：\n• 1840年 — 鸦片战争\n• 1851年 — 太平天国运动\n• 1894年 — 甲午战争\n• 1898年 — 戊戌变法\n• 1911年 — 辛亥革命\n• 1919年 — 五四运动\n• 1921年 — 中国共产党成立\n• 1931年 — 九一八事变\n• 1937年 — 七七事变，全面抗战\n• 1945年 — 抗战胜利\n• 1949年 — 新中国成立\n\n**世界史**：\n• 14-17世纪 — 文艺复兴\n• 1640年 — 英国资产阶级革命\n• 1789年 — 法国大革命\n• 18世纪60年代 — 工业革命\n• 1914-1918年 — 第一次世界大战\n• 1939-1945年 — 第二次世界大战\n• 1947年 — 冷战开始\n• 1991年 — 苏联解体，冷战结束';
                }
                if (q.includes('文化') || q.includes('发明') || q.includes('四大')) {
                    return '中国古代四大发明：\n• 造纸术：东汉蔡伦改进\n• 印刷术：北宋毕昇发明活字印刷\n• 火药：唐代炼丹术发展而来\n• 指南针：战国时期司南\n\n文化成就：\n• 诗经 — 中国最早的诗歌总集\n• 史记 — 司马迁，第一部纪传体通史\n• 资治通鉴 — 司马光，编年体通史\n• 四大名著：三国演义、水浒传、西游记、红楼梦';
                }
                if (q.includes('古代') || q.includes('先秦') || q.includes('夏商周')) {
                    return '**中国古代史概览**：\n\n**先秦时期**：\n• 夏朝（前2070-前1600）：中国第一个王朝，禹传子启\n• 商朝（前1600-前1046）：甲骨文、青铜器鼎盛\n• 西周（前1046-前771）：分封制、宗法制、礼乐制\n• 春秋（前770-前476）：五霸争霸，孔子创立儒家\n• 战国（前475-前221）：七雄并立，百家争鸣\n\n**秦汉**：\n• 秦朝（前221-前206）：统一文字、度量衡、货币，修长城\n• 西汉（前206-公元8年）：文景之治、汉武帝独尊儒术、丝绸之路\n• 东汉（25-220）：光武中兴、蔡伦改进造纸术\n\n**魏晋南北朝**：\n• 三国（220-280）、西晋（265-316）、东晋（317-420）\n• 南北朝（420-589）：民族大融合\n\n**隋唐**：\n• 隋朝（581-618）：大运河、科举制创立\n• 唐朝（618-907）：贞观之治、开元盛世、安史之乱\n\n**宋元明清**：\n• 北宋（960-1127）、南宋（1127-1279）\n• 元朝（1271-1368）：行省制度\n• 明朝（1368-1644）：郑和下西洋、戚继光抗倭\n• 清朝（1644-1912）：康乾盛世、鸦片战争';
                }
                if (q.includes('近代') || q.includes('现代') || q.includes('鸦片战争') || q.includes('辛亥') || q.includes('抗战')) {
                    return '**中国近现代史**：\n\n**晚清时期（1840-1912）**：\n• 1840-1842：第一次鸦片战争，《南京条约》\n• 1851-1864：太平天国运动\n• 1856-1860：第二次鸦片战争\n• 1894-1895：甲午战争，《马关条约》\n• 1898：戊戌变法（百日维新）\n• 1900：义和团运动、八国联军侵华\n\n**民国时期（1912-1949）**：\n• 1911：辛亥革命，推翻清朝\n• 1912：中华民国成立\n• 1919：五四运动\n• 1921：中国共产党成立\n• 1924-1927：国民大革命\n• 1927-1937：国共十年对峙\n• 1931：九一八事变\n• 1937-1945：全面抗日战争\n• 1945-1949：解放战争\n\n**世界史**：\n• 文艺复兴（14-17世纪）：人文主义兴起\n• 工业革命（18世纪60年代）：蒸汽机、工厂制度\n• 一战（1914-1918）：帝国主义战争\n• 二战（1939-1945）：反法西斯战争\n• 冷战（1947-1991）：美苏两极对峙';
                }
                // 朝代对比表
                if (q.includes('朝代对比') || q.includes('朝代比较') || q.includes('朝代表') || q.includes('各朝代')) {
                    return renderTable(
                        ['朝代', '时间', '都城', '开国皇帝', '主要成就/特点'],
                        [
                            ['秦朝', '前221-前206', '咸阳', '秦始皇', '统一六国，统一文字度量衡'],
                            ['西汉', '前206-公元8', '长安', '刘邦', '文景之治，丝绸之路'],
                            ['东汉', '25-220', '洛阳', '刘秀', '光武中兴，蔡伦造纸'],
                            ['隋朝', '581-618', '大兴', '杨坚', '大运河，科举制'],
                            ['唐朝', '618-907', '长安', '李渊', '贞观之治，开元盛世'],
                            ['北宋', '960-1127', '开封', '赵匡胤', '王安石变法，经济繁荣'],
                            ['元朝', '1271-1368', '大都', '忽必烈', '行省制度，疆域最广'],
                            ['明朝', '1368-1644', '南京/北京', '朱元璋', '郑和下西洋'],
                            ['清朝', '1644-1912', '北京', '皇太极', '康乾盛世'],
                        ]
                    );
                }
                // 时间线数据
                if (q.includes('时间线') || q.includes('timeline') || q.includes('历史脉络')) {
                    const points = [
                        [0, 9, '前221 秦统一'],
                        [1, 8, '前206 西汉'],
                        [2, 7, '208 三国'],
                        [3, 6, '581 隋朝'],
                        [4, 8, '618 唐朝'],
                        [5, 5, '960 宋朝'],
                        [6, 7, '1271 元朝'],
                        [7, 6, '1368 明朝'],
                        [8, 4, '1644 清朝'],
                        [9, 9, '1949 新中国'],
                    ];
                    return '**中国历史时间线**\n\n' + renderCoordinate(points) + '\n\n横轴代表时间推移，纵轴代表综合国力（大致趋势）';
                }
                // 各朝代文化成就
                if (q.includes('文化成就') || q.includes('文学成就') || q.includes('科技成就') || q.includes('各朝代文化')) {
                    return renderTable(
                        ['朝代', '文学成就', '科技成就', '艺术成就'],
                        [
                            ['秦朝', '李斯《谏逐客书》', '统一文字度量衡、修长城', '兵马俑'],
                            ['汉朝', '汉赋（司马相如）、乐府诗', '造纸术改进、地动仪（张衡）', '汉画像石、马王堆帛画'],
                            ['魏晋', '建安文学（曹操）、陶渊明田园诗', '祖冲之圆周率、裴秀地图', '王羲之书法、顾恺之绘画'],
                            ['唐朝', '唐诗（李白、杜甫、白居易）', '雕版印刷术、火药配方', '敦煌壁画、唐三彩'],
                            ['宋朝', '宋词（苏轼、李清照）、话本', '活字印刷（毕昇）、指南针、火药', '清明上河图、汝窑瓷器'],
                            ['明朝', '小说（三国演义、水浒传、西游记）', '郑和航海、本草纲目（李时珍）', '明式家具、青花瓷'],
                            ['清朝', '红楼梦、儒林外史', '康熙字典、四库全书', '京剧形成、圆明园'],
                        ]
                    );
                }
                // 一战二战
                if (q.includes('一战') || q.includes('世界大战') || q.includes('二战') || q.includes('第一次世界大战') || q.includes('第二次世界大战')) {
                    return '**第一次世界大战（1914-1918）**：\n\n**起因**：\n• 帝国主义国家政治经济发展不平衡\n• 军备竞赛和同盟体系形成\n• 导火索：1914年萨拉热窝事件\n\n**两大阵营**：\n• 协约国：英、法、俄（后美、中等加入）\n• 同盟国：德、奥匈、奥斯曼、保加利亚\n\n**重要战役**：\n• 凡尔登战役（1916）："绞肉机"\n• 索姆河战役（1916）：首次使用坦克\n• 日德兰海战（1916）：最大海战\n\n**结果**：\n• 同盟国失败\n• 签订《凡尔赛和约》\n• 奥匈帝国解体、德国割地赔款\n\n---\n\n**第二次世界大战（1939-1945）**：\n\n**起因**：\n• 凡尔赛体系的不稳定\n• 1929年经济大萧条\n• 法西斯主义崛起（德、意、日）\n• 导火索：1939年德国入侵波兰\n\n**重要事件**：\n• 1940：法国投降，不列颠空战\n• 1941：德国入侵苏联（巴巴罗萨计划）\n• 1941：珍珠港事件，美国参战\n• 1942：中途岛海战（太平洋战场转折点）\n• 1942-1943：斯大林格勒战役（欧洲战场转折点）\n• 1944：诺曼底登陆（D-Day）\n• 1945：德国投降（5月），日本投降（8月）\n\n**结果**：\n• 联合国成立\n• 冷战格局形成\n• 殖民体系瓦解';
                }
                // 现代中国历史
                if (q.includes('新中国') || q.includes('建国后') || q.includes('改革开放') || q.includes('现代中国')) {
                    return '**新中国成立后重大事件**：\n\n**建国初期（1949-1956）**：\n• 1949.10.1：中华人民共和国成立\n• 1950-1953：抗美援朝\n• 1951：西藏和平解放\n• 1953-1956：三大改造（农业、手工业、资本主义工商业）\n• 1954：第一届全国人大，颁布《宪法》\n\n**探索时期（1956-1978）**：\n• 1958：大跃进运动\n• 1964：第一颗原子弹爆炸成功\n• 1966-1976：文化大革命\n• 1970：东方红一号卫星发射\n• 1971：恢复联合国合法席位\n\n**改革开放（1978至今）**：\n• 1978：十一届三中全会，改革开放开始\n• 1980：设立深圳等经济特区\n• 1997：香港回归\n• 1999：澳门回归\n• 2001：加入WTO\n• 2008：北京奥运会\n• 2010：GDP超越日本，成为世界第二\n• 2013：提出"一带一路"倡议\n• 2020：全面建成小康社会\n• 2021：建党100周年';
                }
                // 世界近代史
                if (q.includes('工业革命') || q.includes('法国大革命') || q.includes('文艺复兴') || q.includes('启蒙运动') || q.includes('世界近代') || q.includes('近代史') || q.includes('资产阶级革命')) {
                    return teach('世界近代史——工业革命与法国大革命',
                        '**文艺复兴（14-17世纪）**：\n• 发源地：意大利佛罗伦萨\n• 核心思想：人文主义（以人为中心）\n• 代表人物：但丁、达芬奇、米开朗基罗、莎士比亚\n• 意义：为资本主义发展奠定思想文化基础\n\n**启蒙运动（17-18世纪）**：\n• 核心思想：理性主义，反对封建专制和宗教迷信\n• 代表人物及主张：\n  - 伏尔泰：天赋人权、言论自由\n  - 孟德斯鸠：三权分立\n  - 卢梭：社会契约论、人民主权\n• 意义：为法国大革命提供思想武器\n\n**英国资产阶级革命（1640-1688）**：\n• 导火索：苏格兰人民起义\n• 重要事件：克伦威尔独裁、光荣革命\n• 结果：颁布《权利法案》，建立君主立宪制\n\n**法国大革命（1789-1799）**：\n• 导火索：三级会议召开\n• 重要事件：\n  - 1789.7.14：攻占巴士底狱\n  - 发布《人权宣言》：自由、平等、博爱\n  - 吉伦特派、雅各宾派执政\n  - 拿破仑政变（1799年雾月政变）\n• 意义：推翻封建专制，确立资本主义制度\n\n**工业革命（18世纪60年代-19世纪中期）**：\n• 发源地：英国\n• 标志：珍妮纺纱机（1765年）\n• 重大发明：\n  - 瓦特改良蒸汽机（1785年）\n  - 史蒂芬森发明火车（1814年）\n  - 富尔顿发明汽船（1807年）\n• 影响：生产力巨大飞跃，社会结构变化，城市化加速',
                        '简述法国大革命的主要进程和意义。',
                        '主要进程：\n1. 1789年5月：三级会议召开，第三等级要求改革\n2. 1789年7月14日：攻占巴士底狱，大革命爆发\n3. 1789年8月：颁布《人权宣言》\n4. 1792年：废除君主制，建立法兰西第一共和国\n5. 1793年：路易十六被处死\n6. 1799年：拿破仑发动雾月政变\n\n意义：\n• 推翻了波旁王朝的封建统治\n• 确立了资本主义民主共和制度\n• 《人权宣言》传播了自由平等思想\n• 对世界各国的革命运动产生了深远影响',
                        '常见错误：\n• 混淆文艺复兴和启蒙运动的核心思想\n• 工业革命的起止时间记错\n• 法国大革命中各派别执政顺序搞混',
                        '记住时间线：文艺复兴→启蒙运动→英国革命→美国独立→法国大革命→工业革命。'
                    );
                }
                // 中国近代史
                if (q.includes('洋务运动') || q.includes('戊戌变法') || q.includes('辛亥革命') || q.includes('五四运动') || q.includes('中国近代') || q.includes('近代中国') || q.includes('太平天国') || q.includes('甲午') || q.includes('鸦片战争')) {
                    return teach('中国近代史——洋务运动、戊戌变法、辛亥革命',
                        '**鸦片战争（1840-1842）**：\n• 原因：英国为打开中国市场，倾销鸦片\n• 结果：签订《南京条约》\n  - 割让香港岛\n  - 五口通商（广州、厦门、福州、宁波、上海）\n  - 赔款2100万银元\n• 意义：中国近代史的开端，开始沦为半殖民地半封建社会\n\n**洋务运动（1861-1895）**：\n• 代表人物：曾国藩、李鸿章、左宗棠、张之洞\n• 口号："师夷长技以自强"\n• 内容：\n  -创办军事工业（江南制造总局）\n  - 创办民用工业（轮船招商局、汉阳铁厂）\n  - 建立新式海军（北洋水师）\n  - 派遣留学生出国\n• 结果：甲午战争北洋水师全军覆没，运动失败\n• 评价：引进了西方技术，但没有改变封建制度\n\n**戊戌变法（1898）**：\n• 代表人物：康有为、梁启超、谭嗣同\n• 内容：废除八股、兴办学堂、训练新军、发展工商业\n• 结果：仅103天（百日维新），被慈禧太后发动政变镇压\n• 谭嗣同等"戊戌六君子"就义\n• 意义：起到了思想启蒙作用\n\n**辛亥革命（1911）**：\n• 领导人：孙中山\n• 结果：推翻清朝统治，结束两千多年的封建帝制\n• 建立中华民国（1912年元旦）\n• 意义：中国历史上第一次伟大的资产阶级民主革命',
                        '比较洋务运动和戊戌变法的异同。',
                        '相同点：\n• 都是在民族危机加剧的背景下产生\n• 都主张学习西方\n• 最终都失败了\n\n不同点：\n• 洋务运动：学习西方技术（器物层面），维护清朝统治\n  代表：封建官僚\n  方式：自上而下\n\n• 戊戌变法：学习西方制度（制度层面），改革政治体制\n  代表：资产阶级维新派\n  方式：自上而下（依靠没有实权的光绪帝）\n\n失败原因：\n• 洋务运动：只学技术不改制度，甲午战争检验失败\n• 戊戌变法：资产阶级力量弱小，封建顽固势力强大',
                        '常见错误：\n• 混淆各运动的代表人物和口号\n• 洋务运动和戊戌变法的层次分不清（器物vs制度）\n• 辛亥革命结束的是封建帝制而非封建制度',
                        '中国近代探索的三个层次：学技术（洋务）→学制度（戊戌、辛亥）→学思想（新文化运动）。'
                    );
                }
                // 文明古国对比
                if (q.includes('文明古国') || q.includes('四大文明') || q.includes('古埃及') || q.includes('古巴比伦') || q.includes('古印度') || q.includes('古代文明') || q.includes('古中国')) {
                    return teach('世界文明古国对比',
                        '**四大文明古国**：\n\n**古埃及（约前3500年）**：\n• 地理位置：尼罗河流域\n• 标志成就：金字塔、象形文字、太阳历\n• 代表法老：图坦卡蒙、拉美西斯二世\n• 灭亡原因：外族入侵（波斯、希腊、罗马）\n\n**古巴比伦（约前3500年）**：\n• 地理位置：两河流域（底格里斯河、幼发拉底河）\n• 标志成就：汉谟拉比法典、空中花园、楔形文字\n• 汉谟拉比法典：世界上最早的较为完整的成文法典\n\n**古印度（约前2500年）**：\n• 地理位置：印度河流域、恒河流域\n• 标志成就：种姓制度、佛教、阿拉伯数字（0-9）\n• 种姓制度：婆罗门、刹帝利、吠舍、首陀罗\n• 代表人物：释迦牟尼（佛陀）\n\n**古中国（约前2070年）**：\n• 地理位置：黄河流域、长江流域\n• 标志成就：甲骨文、青铜器、四大发明、长城\n• 朝代延续：夏→商→周→秦→汉→...\n• 特点：唯一延续至今的文明古国\n\n**共同特点**：\n• 都发源于大河流域（农业文明需要水源）\n• 都位于北纬20°-40°之间\n• 都有文字系统\n• 都建立了中央集权国家',
                        '为什么四大文明古国都发源于大河流域？',
                        '原因分析：\n1. 水源充足：大河提供灌溉用水，保障农业发展\n2. 土壤肥沃：河流冲积形成的平原土壤肥沃\n3. 交通便利：河流利于交通运输和贸易往来\n4. 气候适宜：温带和亚热带地区适合农作物生长\n\n这些条件使大河流域成为古代农业文明的摇篮。\n\n补充：古中国文明能延续至今的原因：\n• 地理环境相对封闭（东临大海，西有沙漠高山）\n• 文化传承不断（汉字系统延续）\n• 制度创新（科举制、郡县制等）\n• 民族融合（多元一体格局）',
                        '常见错误：\n• 混淆各文明古国的地理位置和成就\n• 认为古中国文明没有中断过（实际上政权更迭频繁，但文化延续）\n• 忘记古巴比伦的汉谟拉比法典',
                        '记忆口诀：埃及金字塔，巴比伦法典，印度种姓制，中国甲骨文。'
                    );
                }
                return '我可以帮你梳理历史事件、分析历史人物、解读历史材料。请把具体问题发给我。';
            }
            if (subject === '政治') {
                if (q.includes('核心价值观')) {
                    return '**社会主义核心价值观**（12个词）：\n\n**国家层面**：\n• 富强：国家繁荣昌盛\n• 民主：人民当家作主\n• 文明：社会进步状态\n• 和谐：人与人、人与自然和睦相处\n\n**社会层面**：\n• 自由：人的全面发展\n• 平等：公民在法律面前一律平等\n• 公正：社会公平正义\n• 法治：依法治国\n\n**个人层面**：\n• 爱国：热爱祖国\n• 敬业：忠于职守\n• 诚信：诚实守信\n• 友善：互帮互助';
                }
                if (q.includes('制度')) {
                    return renderTable(
                        ['制度类型', '国家代表', '权力结构', '选举方式', '特点'],
                        [
                            ['人民代表大会制', '中国', '全国人大为最高权力机关', '间接选举为主', '民主集中制'],
                            ['总统制', '美国', '总统为国家元首和政府首脑', '选举人团', '三权分立'],
                            ['议会制', '英国', '首相为政府首脑，议会至上', '普选', '君主立宪'],
                            ['半总统制', '法国', '总统和总理分享权力', '直选+任命', '双首长制'],
                            ['联邦制', '德国', '中央和地方分权', '联邦+州选举', '地方自治'],
                        ]
                    ) + '\n\n**中国政治制度**：\n• 人民代表大会制度（根本政治制度）\n• 中国共产党领导的多党合作和政治协商制度\n• 民族区域自治制度\n• 基层群众自治制度';
                }
                if (q.includes('经济') || q.includes('市场经济') || q.includes('宏观') || q.includes('gdp') || q.includes('通货膨胀')) {
                    return '**经济常识**：\n\n**市场经济**：\n• 市场在资源配置中起决定性作用\n• 价格由供求关系决定\n\n**宏观调控**：\n• 财政政策：税收、国债、政府支出\n• 货币政策：利率、存款准备金率、公开市场操作\n\n**经济指标**：\n• GDP：国内生产总值，衡量经济总量\n• CPI：消费者物价指数，衡量通货膨胀\n• 失业率：失业人口占劳动力的比例\n\n**经济现象**：\n• 通货膨胀：物价持续上涨，货币贬值\n• 通货紧缩：物价持续下跌\n• 供给侧改革：提高供给质量和效率\n• 需求侧管理：消费、投资、出口';
                }
                if (q.includes('哲学') || q.includes('唯物') || q.includes('辩证')) {
                    return '哲学常识：\n• 唯物论：物质决定意识，意识反作用于物质\n• 辩证法：联系、发展、矛盾（对立统一）\n• 认识论：实践是认识的基础\n• 价值观：正确的价值判断和价值选择';
                }
                if (q.includes('人大') || q.includes('政协') || q.includes('npc') || q.includes('cppcc')) {
                    return '**全国人民代表大会（NPC）**：\n• 最高国家权力机关\n• 职权：立法权、决定权、任免权、监督权\n• 代表由选举产生，每届任期5年\n\n**中国人民政治协商会议（CPPCC）**：\n• 爱国统一战线组织\n• 职能：政治协商、民主监督、参政议政\n• 由中国共产党、各民主党派、无党派人士等组成';
                }
                if (q.includes('国际') || q.includes('联合国') || q.includes('wto') || q.includes('一带一路') || q.includes('外交')) {
                    return '**国际组织与外交**：\n\n**联合国（UN）**：\n• 1945年成立，总部纽约\n• 宗旨：维护国际和平与安全\n• 安理会：中、美、俄、英、法为常任理事国\n\n**世界贸易组织（WTO）**：\n• 1995年成立，前身GATT\n• 宗旨：促进自由贸易\n• 中国2001年加入\n\n**一带一路**：\n• 丝绸之路经济带和21世纪海上丝绸之路\n• 2013年提出\n• 共商共建共享原则';
                }
                if (q.includes('法律') || q.includes('宪法') || q.includes('民法') || q.includes('刑法')) {
                    return '**中国法律体系**：\n\n**宪法**：\n• 国家的根本大法\n• 具有最高法律效力\n• 规定公民的基本权利和义务\n\n**民法**：\n• 调整平等主体之间的人身关系和财产关系\n• 包括合同法、物权法、婚姻法、继承法等\n\n**刑法**：\n• 规定犯罪和刑罚\n• 基本原则：罪刑法定、罪责刑相适应、刑法面前人人平等\n\n**行政法**：\n• 调整行政机关与公民之间的关系\n• 包括行政处罚法、行政许可法等';
                }
                // 政府结构
                if (q.includes('政府') || q.includes('国务院') || q.includes('机构') || q.includes('国家机构') || q.includes('组织')) {
                    return '**中国政府结构**：\n\n**国家权力机关**：\n• 全国人民代表大会（最高权力机关）\n• 地方各级人民代表大会\n\n**国家行政机关**：\n• 国务院（中央政府）\n  - 各部委（外交部、国防部、教育部、财政部等）\n• 地方各级人民政府\n\n**国家监察机关**：\n• 国家监察委员会\n• 地方各级监察委员会\n\n**国家司法机关**：\n• 最高人民法院（最高审判机关）\n• 最高人民检察院（最高检察机关）\n\n**国家主席**：\n• 国家元首，代表国家进行国事活动\n\n**中央军事委员会**：\n• 领导全国武装力量';
                }
                // 公民权利
                if (q.includes('公民') || q.includes('权利') || q.includes('义务') || q.includes('基本权利')) {
                    return '**公民的基本权利与义务**：\n\n**基本权利**：\n• 平等权：法律面前一律平等\n• 政治权利：选举权和被选举权\n• 人身自由：人身自由不受侵犯\n• 言论自由：言论、出版、集会、结社、游行、示威\n• 宗教信仰自由\n• 社会经济权利：劳动权、休息权、受教育权\n• 文化权利：科学研究、文学艺术创作自由\n\n**基本义务**：\n• 维护国家统一和民族团结\n• 遵守宪法和法律\n• 保守国家秘密\n• 维护国家安全、荣誉和利益\n• 依法服兵役和参加民兵组织\n• 依法纳税\n• 劳动和受教育（既是权利也是义务）';
                }
                // 经济常识
                if (q.includes('供求关系') || q.includes('市场调节') || q.includes('价格') || q.includes('供给') || q.includes('需求') || q.includes('通货膨胀') || q.includes('gdp') || q.includes('经济常识') || q.includes('市场经济')) {
                    return teach('经济常识——供求关系与市场调节',
                        '**供求关系**：\n• 供给：生产者在一定价格下愿意且能够提供的商品数量\n• 需求：消费者在一定价格下愿意且能够购买的商品数量\n• 供求定律：\n  - 供大于求 → 价格下降（买方市场）\n  - 供小于求 → 价格上升（卖方市场）\n  - 供求平衡 → 价格稳定\n\n**市场调节**：\n• 价格机制：价格信号引导资源配置\n• 竞争机制：优胜劣汰，促进效率\n• 供求机制：调节生产和消费\n\n**市场失灵**：\n• 垄断：少数企业控制市场\n• 外部性：正外部性（教育）和负外部性（污染）\n• 公共物品：国防、基础设施等\n• 信息不对称：买卖双方信息不均等\n\n**宏观调控**：\n• 财政政策：税收、政府支出、国债\n  - 扩张性：减税增支（经济低迷时）\n  - 紧缩性：增税减支（经济过热时）\n• 货币政策：利率、存款准备金率\n  - 扩张性：降息降准（刺激经济）\n  - 紧缩性：加息提准（抑制通胀）\n\n**经济指标**：\n• GDP（国内生产总值）：衡量经济总量\n• CPI（消费者物价指数）：衡量通胀水平\n• 基尼系数：衡量收入分配差距（0-1，越接近0越公平）',
                        '猪肉价格上涨，从供求关系角度分析原因及对策。',
                        '原因分析（供小于求）：\n1. 供给减少：非洲猪瘟导致生猪存栏量下降\n2. 饲料成本上升：养殖成本增加\n3. 周期性波动："猪周期"规律\n\n市场自动调节：\n• 价格上涨 → 养殖利润增加 → 养殖户增加 → 供给增加 → 价格回落\n\n政府调控对策：\n1. 财政补贴：对养殖户给予补贴，鼓励生产\n2. 储备投放：投放国家储备肉增加供给\n3. 信息引导：发布市场信息引导预期\n4. 疫病防控：加强动物疫病防控',
                        '常见错误：\n• 混淆财政政策和货币政策\n• 不理解"猪周期"等市场周期现象\n• 供给和需求的变化方向判断错误',
                        '记住：价格由供求决定，市场调节有滞后性，需要宏观调控弥补。'
                    );
                }
                // 哲学常识
                if (q.includes('唯物论') || q.includes('辩证法') || q.includes('认识论') || q.includes('哲学') || q.includes('唯物') || q.includes('矛盾') || q.includes('实践') || q.includes('价值观') || q.includes('哲学常识')) {
                    return teach('哲学常识——唯物论、辩证法、认识论',
                        '**唯物论（物质与意识）**：\n• 世界是物质的，物质决定意识\n• 意识对物质具有能动的反作用\n• 方法论：一切从实际出发，实事求是\n\n**辩证法（联系与发展）**：\n\n1. 联系的观点：\n• 事物是普遍联系的\n• 整体与部分相互依存\n• 方法论：用联系的观点看问题\n\n2. 发展的观点：\n• 事物是不断发展的\n• 发展是量变和质变的统一\n• 前途是光明的，道路是曲折的\n• 方法论：用发展的眼光看问题\n\n3. 矛盾的观点（核心）：\n• 矛盾的普遍性：事事有矛盾，时时有矛盾\n• 矛盾的特殊性：具体问题具体分析\n• 主次矛盾和矛盾的主次方面\n• 对立统一规律是唯物辩证法的实质和核心\n\n**认识论（实践与认识）**：\n• 实践是认识的基础（来源、动力、检验标准、目的）\n• 认识具有反复性、无限性、上升性\n• 真理是客观的、具体的、有条件的\n• 追求真理是一个永无止境的过程\n\n**价值观**：\n• 价值观具有导向作用\n• 正确的价值判断和价值选择\n  - 必须坚持真理，遵循社会发展的客观规律\n  - 必须自觉站在最广大人民的立场上',
                        '用矛盾分析法分析"网络对中学生的影响"。',
                        '运用矛盾分析法（对立统一）：\n\n1. 矛盾的普遍性：网络既有积极影响，也有消极影响，是一把"双刃剑"\n\n2. 矛盾的主次方面：\n• 主要方面：网络为学习提供了丰富的资源和便捷的工具\n  （积极影响是主流）\n• 次要方面：网络可能导致沉迷、信息过载、视力下降\n  （消极影响是支流）\n\n3. 方法论：\n• 承认矛盾，全面看待网络的影响\n• 分清主次，充分利用网络的积极面\n• 创造条件，促进矛盾向有利方向转化\n  （如制定上网时间限制、培养信息筛选能力）\n\n这体现了具体问题具体分析的辩证方法。',
                        '常见错误：\n• 混淆唯物论和辩证法的核心观点\n• 矛盾的主次方面和主次矛盾搞混\n• 认识论中"实践是检验真理的唯一标准"记不住',
                        '哲学答题模板：原理+方法论+结合材料分析。'
                    );
                }
                // 国际组织
                if (q.includes('国际组织') || q.includes('联合国') || q.includes('wto') || q.includes('欧盟') || q.includes('eu') || q.includes('国际关系') || q.includes('外交') || q.includes('一带一路') || q.includes('国际')) {
                    return teach('国际组织——联合国、WTO、EU',
                        '**联合国（UN）**：\n• 成立：1945年10月24日\n• 总部：美国纽约\n• 成员国：193个\n• 宗旨：维护国际和平与安全\n• 主要机构：\n  - 联合国大会（所有成员国参加）\n  - 安全理事会（15个理事国，5个常任理事国：中、美、俄、英、法）\n  - 经济及社会理事会\n  - 国际法院（荷兰海牙）\n  - 秘书处（秘书长为行政首长）\n• 安理会"大国一致"原则：5个常任理事国有否决权\n\n**世界贸易组织（WTO）**：\n• 成立：1995年1月1日（前身GATT）\n• 总部：瑞士日内瓦\n• 成员：164个\n• 宗旨：促进全球贸易自由化\n• 基本原则：\n  - 非歧视原则（最惠国待遇、国民待遇）\n  - 透明度原则\n  - 自由贸易原则\n  - 公平竞争原则\n• 中国加入时间：2001年12月11日\n\n**欧洲联盟（EU）**：\n• 成立：1993年（《马斯特里赫特条约》生效）\n• 总部：比利时布鲁塞尔\n• 成员：27国\n• 统一货币：欧元（Euro，19国使用）\n• 特点：超国家性质的区域性组织\n• 英国于2020年脱欧（Brexit）\n\n**其他重要国际组织**：\n• 世界卫生组织（WHO）：1948年，总部日内瓦\n• 北大西洋公约组织（NATO）：1949年，军事同盟\n• 世界银行（WB）：1944年，提供发展贷款\n• 国际货币基金组织（IMF）：1944年，维护金融稳定\n• 亚太经合组织（APEC）：1989年\n• 上海合作组织（SCO）：2001年',
                        '简述联合国安理会的"大国一致"原则及其意义。',
                        '大国一致原则（否决权制度）：\n• 安理会对实质性问题的表决，需要15个理事国中至少9票赞成\n• 且5个常任理事国（中、美、俄、英、法）均不投反对票\n• 任何一个常任理事国投反对票（即"否决"），决议即不能通过\n• 常任理事国投弃权票不算否决\n\n意义：\n• 积极方面：确保大国在重大国际问题上达成共识，维护大国合作\n• 消极方面：常任理事国可以使用否决权保护自身利益，影响安理会效率\n\n这一制度是二战后国际秩序的重要安排，反映了当时的大国力量对比。',
                        '常见错误：\n• 混淆联合国各机构的职能\n• 否决权制度理解错误（弃权不算否决）\n• WTO和WHO等国际组织的宗旨搞混',
                        '记住主要国际组织的英文缩写和总部所在地，这是常考知识点。'
                    );
                }
                return '我可以帮你解答政治制度、经济常识、法律基础、国情知识。请把具体问题发给我。';
            }
            return null;
        }

        // ========== 7. 法律咨询 ==========
        function handleLaw(question, cleanQ) {
            const q = question.toLowerCase();
            if (q.includes('劳动') || q.includes('工资') || q.includes('加班') || q.includes('社保') || q.includes('试用期')) {
                return '劳动法要点：\n• 试用期：3月~1年合同≤1个月；1~3年≤2个月；3年以上≤6个月\n• 加班费：平日150%、周末200%、法定假日300%\n• 辞职：正式工提前30日书面通知；试用期提前3日\n• 经济补偿：每满一年支付一个月工资\n\n⚠️ 仅供参考，具体问题请咨询专业律师或拨打12333。';
            }
            if (q.includes('消费') || q.includes('维权') || q.includes('退货')) {
                return '消费者权益：\n• 安全权、知情权、选择权、公平交易权、求偿权\n• 维权途径：协商→消协调解→行政部门申诉→仲裁→诉讼\n• 投诉热线：12315\n\n⚠️ 仅供参考，具体请咨询专业律师。';
            }
            if (q.includes('合同')) {
                return '合同法要点：\n• 合同要素：当事人、标的、内容\n• 订立：要约+承诺\n• 无效情形：欺诈胁迫、恶意串通、掩盖非法目的、损害公共利益\n• 违约责任：继续履行、补救措施、违约金、赔偿损失\n\n⚠️ 仅供参考，签订前建议咨询律师。';
            }
            if (q.includes('婚姻') || q.includes('离婚') || q.includes('继承')) {
                return '婚姻家庭法要点：\n• 结婚：男≥22岁，女≥20岁，双方自愿\n• 共同财产：工资、经营收益、知识产权收益等\n• 继承顺序：第一顺序（配偶、子女、父母）；第二顺序（兄弟姐妹、祖父母、外祖父母）\n\n⚠️ 仅供参考，具体请咨询专业律师。';
            }
            return '我可以帮你了解劳动法、消费者权益、合同法、婚姻家庭法等基础知识。请描述你的具体问题。\n\n⚠️ AI信息仅供参考，不能替代专业法律意见。';
        }

        // ========== 8. 心理健康 ==========
        function handleMental(question, cleanQ) {
            const q = question.toLowerCase();
            if (q.includes('考试') && (q.includes('焦虑') || q.includes('紧张'))) {
                return '考试焦虑应对：\n• 考前：制定计划、充足睡眠、适当运动\n• 考中：深呼吸（吸气4秒-屏息4秒-呼气6秒）、先易后难\n• 日常：模拟练习、积极暗示\n\n如果焦虑严重影响生活，建议寻求专业心理咨询。';
            }
            if (q.includes('情绪') || q.includes('压力') || q.includes('缓解')) {
                return '情绪管理技巧：\n• 深呼吸放松法\n• 正念冥想（每天5-10分钟）\n• 有氧运动（每周3次，每次30分钟）\n• 写日记或向信任的人倾诉\n• 积极思维：关注能做到的事，每天记录3件感恩的事';
            }
            if (q.includes('人际') || q.includes('朋友') || q.includes('沟通')) {
                return '人际关系建议：\n• 真诚待人，尊重差异\n• 学会倾听，不急于评判\n• 用"我"开头表达感受，避免指责\n• 维护个人边界，学会说"不"\n• 冲突时冷静下来，就事论事';
            }
            return '关注心理健康是很棒的事情。我可以帮你了解焦虑、压力、情绪管理、人际关系等方面的知识。\n\n如果困扰持续或严重影响生活，建议寻求专业帮助。';
        }

        // ========== 9. 编程知识处理 ==========
        function handleProgramming(question, cleanQ) {
            const q = question.toLowerCase();
            // 如果是判断题格式（陈述句+句号），不返回代码块，让上层判断题检测处理
            const isJudgmentFormat = /[。\.]$/.test(cleanQ) &&
                !/^(写|生成|创建|给我|请|帮我).*(代码|程序|网页|网站)/i.test(cleanQ) &&
                cleanQ.trim().length > 5 && cleanQ.trim().length < 50;
            if (isJudgmentFormat) return null;
            // HTML
            if (q.includes('html') || q.includes('网页') || q.includes('标签')) {
                return renderCodeBlock('html', '<!DOCTYPE html>\n<html lang="zh">\n<head>\n  <meta charset="UTF-8">\n  <title>我的网页</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; }\n    h1 { color: #6C5CE7; }\n  </style>\n</head>\n<body>\n  <h1>欢迎来到我的网页</h1>\n  <p>这是一个HTML基础模板。</p>\n  <nav>\n    <a href="#home">首页</a>\n    <a href="#about">关于</a>\n    <a href="#contact">联系</a>\n  </nav>\n  <main>\n    <article>\n      <h2>文章标题</h2>\n      <p>文章内容...</p>\n    </article>\n  </main>\n  <footer>版权所有 2026</footer>\n</body>\n</html>') +
                '\n\n**HTML5语义化标签**：header/nav/main/article/section/aside/footer\n**常用标签**：h1-h6/p/a/img/div/span/ul/ol/li/table/form/input/button';
            }
            // CSS
            if (q.includes('css') || q.includes('样式') || q.includes('flex') || q.includes('grid') || q.includes('布局')) {
                return renderCodeBlock('css', '/* Flexbox居中布局 */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n\n/* Grid网格布局 */\n.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n\n/* 响应式 */\n@media (max-width: 768px) {\n  .grid { grid-template-columns: 1fr; }\n}\n\n/* CSS3新特性 */\n.card {\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n  transition: all 0.3s ease;\n  background: linear-gradient(135deg, #667eea, #764ba2);\n}') +
                '\n\n**CSS选择器**：元素/.class/#id/后代/子元素/伪类\n**CSS3特性**：圆角/阴影/渐变/过渡/动画/Flex/Grid';
            }
            // JavaScript
            if (q.includes('javascript') || q.includes('js') || q.includes('dom') || q.includes('脚本')) {
                return renderCodeBlock('javascript', '// ES6+ JavaScript 基础\n\n// 变量声明\nlet name = "小明";\nconst PI = 3.14159;\n\n// 箭头函数\nconst add = (a, b) => a + b;\nconst greet = name => `你好，${name}`;\n\n// 解构赋值\nconst [x, y] = [1, 2];\nconst { age, city } = { age: 18, city: "北京" };\n\n// 数组方法\nconst nums = [1, 2, 3, 4, 5];\nconst doubled = nums.map(n => n * 2);\nconst evens = nums.filter(n => n % 2 === 0);\nconst sum = nums.reduce((a, b) => a + b, 0);\n\n// Promise异步\nfetch("/api/data")\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\n// async/await\nasync function getData() {\n  try {\n    const res = await fetch("/api/data");\n    return await res.json();\n  } catch (err) {\n    console.error(err);\n  }\n}') +
                '\n\n**核心概念**：变量(let/const)、箭头函数、解构、展开运算符、模板字符串、Promise、async/await、数组方法(map/filter/reduce)';
            }
            // Python
            if (q.includes('python') || q.includes('蟒蛇')) {
                return renderCodeBlock('python', '# Python 基础\n\n# 变量和数据类型\nname = "小明"\nage = 18\nscores = [95, 87, 92, 88]\n\n# 列表推导式\nsquares = [x**2 for x in range(10)]\nevens = [x for x in range(20) if x % 2 == 0]\n\n# 字典\nstudent = {"name": "小明", "age": 18, "grade": "A"}\n\n# 函数\ndef calculate_average(scores):\n    return sum(scores) / len(scores)\n\n# 条件判断\nscore = 85\nif score >= 90:\n    grade = "优秀"\nelif score >= 60:\n    grade = "及格"\nelse:\n    grade = "不及格"\n\n# 文件操作\nwith open("data.txt", "r", encoding="utf-8") as f:\n    content = f.read()\n    print(content)') +
                '\n\n**核心概念**：变量、列表推导式、字典、函数、条件判断、循环、文件操作、装饰器、生成器';
            }
            // 数据结构与算法
            if (q.includes('数据结构') || q.includes('算法') || q.includes('排序') || q.includes('搜索') || q.includes('链表') || q.includes('栈') || q.includes('队列') || q.includes('树') || q.includes('图')) {
                return '**数据结构与算法**：\n\n【数据结构】\n• 数组：连续内存存储，随机访问O(1)\n• 链表：节点+指针，插入删除O(1)\n• 栈：后进先出（LIFO）\n• 队列：先进先出（FIFO）\n• 树：层次结构，二叉树、二叉搜索树\n• 图：节点+边，有向图/无向图\n\n【排序算法】\n• 冒泡排序：O(n²)，两两比较交换\n• 选择排序：O(n²)，每次选最小\n• 插入排序：O(n²)，逐个插入有序区\n• 快速排序：O(n log n)，分治法\n• 归并排序：O(n log n)，分治合并\n• 堆排序：O(n log n)\n\n【搜索算法】\n• 线性搜索：O(n)，逐个比较\n• 二分搜索：O(log n)，要求有序数组\n\n【时间复杂度】\n• O(1)：常数时间\n• O(log n)：对数时间\n• O(n)：线性时间\n• O(n log n)：线性对数\n• O(n²)：平方时间';
            }
            // 数据库
            if (q.includes('数据库') || q.includes('sql') || q.includes('查询') || q.includes('select') || q.includes('insert')) {
                return '**SQL基础**：\n\n【查询数据】\nSELECT * FROM users;\nSELECT name, age FROM users WHERE age > 18;\nSELECT * FROM users ORDER BY age DESC;\nSELECT COUNT(*) FROM users;\n\n【插入数据】\nINSERT INTO users (name, age) VALUES ("小明", 18);\n\n【更新数据】\nUPDATE users SET age = 19 WHERE name = "小明";\n\n【删除数据】\nDELETE FROM users WHERE id = 1;\n\n【JOIN连接】\nSELECT * FROM orders\nJOIN users ON orders.user_id = users.id;\n\n【常用函数】\n• COUNT()：计数\n• SUM()：求和\n• AVG()：平均值\n• MAX()/MIN()：最大/最小值\n• GROUP BY：分组\n• HAVING：分组过滤';
            }
            // 通用编程概念
            if (q.includes('编程') || q.includes('代码') || q.includes('程序') || q.includes('变量') || q.includes('循环') || q.includes('函数')) {
                return '编程基础概念：\n\n【变量】存储数据的容器，如 name = "小明"\n【数据类型】数字、字符串、布尔值、列表/数组\n【条件判断】if-else，根据条件执行不同代码\n【循环】for/while，重复执行代码块\n【函数】封装可复用的代码块\n【数组/列表】存储多个数据的集合\n\n我可以帮你了解 HTML、CSS、JavaScript、Python 等语言的基础知识，以及数据结构与算法、数据库等内容。\n请告诉我你想学哪个方面。';
            }
            return null;
        }

        // ========== 9a-2. 音乐知识处理 ==========
        function handleMusic(question, cleanQ) {
            const q = question.toLowerCase();
            if (/节拍|拍子|节奏/.test(q)) {
                return teach('音乐基础——节拍与节奏',
                    '**节拍（Beat）**：音乐中规律出现的强弱交替，是音乐的基本脉动单位。\n• 2/4拍：强弱（进行曲风格）\n• 3/4拍：强弱弱（圆舞曲风格）\n• 4/4拍：强弱次强弱（最常用的拍号）',
                    '《义勇军进行曲》是2/4拍，《蓝色多瑙河》是3/4拍。',
                    null,
                    null
                );
            }
            if (/音符|音高|音阶/.test(q)) {
                return teach('音乐基础——音符与音阶',
                    '**基本音符**：全音符、二分音符、四分音符、八分音符、十六分音符\n**唱名**：Do Re Mi Fa Sol La Si（简谱1 2 3 4 5 6 7）\n**音阶**：\n• C大调：C D E F G A B C（无升降号）\n• G大调：G A B C D E F# G（1个升号）\n• F大调：F G A Bb C D E F（1个降号）',
                    null, null, null
                );
            }
            if (/乐器|钢琴|吉他|小提琴/.test(q)) {
                return teach('常见乐器介绍',
                    '**键盘乐器**：钢琴（88键）、电子琴、手风琴\n**弦乐器**：小提琴、中提琴、大提琴、吉他、二胡\n**管乐器**：长笛、单簧管、萨克斯、小号\n**打击乐器**：架子鼓、木琴、三角铁、锣\n**民族乐器**：二胡、琵琶、古筝、笛子、唢呐',
                    null, null, null
                );
            }
            if (/和弦|三和弦|七和弦/.test(q)) {
                return teach('和弦基础',
                    '**三和弦**：由三个音按三度关系叠置而成\n• 大三和弦：根音+大三度+纯五度（如C-E-G）\n• 小三和弦：根音+小三度+纯五度（如C-Eb-G）\n• 增三和弦：根音+大三度+增五度\n• 减三和弦：根音+小三度+减五度',
                    null, null, null
                );
            }
            return null;
        }

        // ========== 9a-3. 美术知识处理 ==========
        function handleArt(question, cleanQ) {
            const q = question.toLowerCase();
            if (/三原色|三间色|色彩|颜色/.test(q)) {
                return teach('美术基础——色彩理论',
                    '**颜料三原色**：红、黄、蓝\n• 红+黄=橙\n• 黄+蓝=绿\n• 红+蓝=紫\n\n**三间色**：橙、绿、紫\n\n**色彩三要素**：\n• 色相：颜色的名称（红、黄、蓝等）\n• 明度：颜色的明暗程度\n• 纯度（饱和度）：颜色的鲜艳程度',
                    null, null, null
                );
            }
            if (/素描|明暗|线条|构图/.test(q)) {
                return teach('素描基础',
                    '**素描五调子**：\n1. 亮面（受光面）\n2. 灰面（侧光面）\n3. 明暗交界线\n4. 暗面（背光面）\n5. 反光\n\n**构图原则**：\n• 三分法：画面分为九宫格，主体放在交点处\n• 对称构图：庄重稳定\n• 对角线构图：动感强烈',
                    null, null, null
                );
            }
            if (/透视|近大远小/.test(q)) {
                return teach('透视基础',
                    '**一点透视**：只有一个消失点，适合表现正面景物\n**两点透视**：有两个消失点，适合表现建筑转角\n**三点透视**：有三个消失点，适合表现仰视或俯视\n\n**基本规律**：近大远小、近实远虚、近明远暗',
                    null, null, null
                );
            }
            if (/画家|名画|达芬奇|梵高|毕加索/.test(q)) {
                return teach('世界著名画家与作品',
                    '**文艺复兴时期**：\n• 达芬奇：《蒙娜丽莎》《最后的晚餐》\n• 米开朗基罗：《大卫》雕塑、西斯廷天顶画\n• 拉斐尔：《雅典学院》《西斯廷圣母》\n\n**印象派**：\n• 莫奈：《日出·印象》《睡莲》\n• 梵高：《星月夜》《向日葵》\n• 雷诺阿：《煎饼磨坊的舞会》\n\n**现代艺术**：\n• 毕加索：《格尔尼卡》（立体派）',
                    null, null, null
                );
            }
            return null;
        }

        // ========== 9a-4. 体育知识处理 ==========
        function handlePE(question, cleanQ) {
            const q = question.toLowerCase();
            if (/热身|准备活动/.test(q)) {
                return teach('运动前热身',
                    '**热身的重要性**：\n• 提高体温，增加肌肉弹性\n• 激活神经系统，提高反应速度\n• 增加关节滑液，减少摩擦\n• 预防肌肉拉伤和关节扭伤\n\n**热身内容**：\n• 一般性热身：慢跑、高抬腿（5-10分钟）\n• 专项热身：针对即将进行的运动做相关动作\n• 动态拉伸：活动关节、拉伸肌肉',
                    null, null, null
                );
            }
            if (/整理活动|运动后|放松/.test(q)) {
                return teach('运动后整理活动',
                    '**整理活动的重要性**：\n• 帮助心率逐渐恢复正常\n• 促进乳酸代谢，减轻肌肉酸痛\n• 防止血液淤积在下肢导致头晕\n\n**整理活动内容**：\n• 慢走或慢跑5-10分钟\n• 静态拉伸主要肌群\n• 深呼吸放松',
                    null, null, null
                );
            }
            if (/跑步|跳远|跳高|投掷/.test(q)) {
                return teach('田径运动基础',
                    '**跑步技术**：\n• 起跑：蹲踞式起跑，"各就位-预备-跑"\n• 途中跑：身体稍前倾，摆臂自然\n• 冲刺：压线冲刺\n\n**跳远**：助跑→起跳→腾空→落地\n\n**跳高**：助跑→起跳→过杆→落地（背越式最常用）',
                    null, null, null
                );
            }
            if (/球类|足球|篮球|排球|乒乓球/.test(q)) {
                return teach('球类运动基础',
                    '**足球**：11人制，用脚踢球，不能用手（守门员除外）\n**篮球**：5人制，投篮得分，3分线外投中得3分\n**排球**：6人制，隔网击球，每队最多触球3次\n**乒乓球**：2人或4人，小球拍击球，11分制',
                    null, null, null
                );
            }
            if (/游泳|蛙泳|自由泳/.test(q)) {
                return teach('游泳基础',
                    '**泳姿种类**：\n• 自由泳（爬泳）：速度最快，交替划水打腿\n• 蛙泳：模仿青蛙动作，适合初学者\n• 仰泳：仰面游泳，呼吸方便\n• 蝶泳：最费力，双臂同时划水\n\n**安全注意事项**：\n• 游泳前充分热身\n• 不要单独游泳\n• 不在陌生水域游泳\n• 抽筋时保持冷静，呼救',
                    null, null, null
                );
            }
            return null;
        }

        // ========== 9a-5. 信息技术知识处理 ==========
        function handleIT(question, cleanQ) {
            const q = question.toLowerCase();
            if (/excel|表格|函数|公式/.test(q)) {
                return teach('Excel常用函数',
                    '**常用函数**：\n• SUM(范围)：求和\n• AVERAGE(范围)：求平均值\n• MAX(范围)：最大值\n• MIN(范围)：最小值\n• COUNT(范围)：计数\n• IF(条件,真值,假值)：条件判断\n• VLOOKUP(查找值,范围,列号)：查找匹配\n\n**示例**：\n=SUM(A1:A10) —— 求A1到A10的和\n=AVERAGE(B1:B10) —— 求B1到B10的平均值',
                    null, null, null
                );
            }
            if (/word|文档|排版/.test(q)) {
                return teach('Word基础操作',
                    '**常用操作**：\n• 字体设置：字号、字体、加粗、斜体\n• 段落设置：对齐方式、行距、段前段后\n• 页面设置：页边距、纸张大小、页眉页脚\n• 插入：图片、表格、页码、目录\n• 样式：标题1、标题2、正文等预设格式',
                    null, null, null
                );
            }
            if (/ppt|演示|幻灯片/.test(q)) {
                return teach('PPT制作技巧',
                    '**制作原则**：\n• 简洁：每页不超过6行文字\n• 对比：文字与背景对比明显\n• 对齐：元素对齐整齐\n• 重复：统一字体、颜色风格\n\n**常用功能**：\n• 幻灯片母版：统一整体风格\n• 动画：进入、强调、退出效果\n• 切换：幻灯片之间的过渡效果',
                    null, null, null
                );
            }
            if (/快捷键|ctrl|键盘/.test(q)) {
                return teach('常用快捷键',
                    '**通用快捷键**：\n• Ctrl+C：复制\n• Ctrl+V：粘贴\n• Ctrl+X：剪切\n• Ctrl+Z：撤销\n• Ctrl+S：保存\n• Ctrl+A：全选\n• Ctrl+F：查找\n• Ctrl+P：打印\n\n**Windows快捷键**：\n• Win+D：显示桌面\n• Win+E：打开资源管理器\n• Alt+Tab：切换窗口',
                    null, null, null
                );
            }
            if (/网络|互联网|ip|dns|浏览器/.test(q)) {
                return teach('计算机网络基础',
                    '**网络基础概念**：\n• IP地址：设备的网络标识，如192.168.1.1\n• DNS：域名系统，将网址转换为IP地址\n• HTTP/HTTPS：网页传输协议\n• 路由器：连接不同网络的设备\n• 带宽：网络传输速率，单位Mbps\n\n**上网安全**：\n• 不点击不明链接\n• 安装杀毒软件\n• 定期更新系统和软件',
                    null, null, null
                );
            }
            return null;
        }

        // ========== 9b. 地理知识处理 ==========
        function handleGeography(question, cleanQ) {
            const q = question.toLowerCase();
            // 世界地理 - 七大洲
            if (/七大洲|洲/.test(cleanQ)) {
                return '🌍 **世界七大洲**\n\n亚洲、非洲、北美洲、南美洲、南极洲、欧洲、大洋洲\n\n按面积排序：亚洲 > 非洲 > 北美洲 > 南美洲 > 南极洲 > 欧洲 > 大洋洲\n\n**各洲特点**：\n• 亚洲：面积最大，人口最多\n• 非洲：国家最多，赤道穿过中部\n• 北美洲：包含世界最大淡水湖群\n• 南美洲：亚马逊雨林，安第斯山脉\n• 南极洲：最寒冷，被冰雪覆盖\n• 欧洲：资本主义发源地，文化多样\n• 大洋洲：面积最小，以澳大利亚为主';
            }
            // 世界地理 - 四大洋
            if (/四大洋|洋/.test(cleanQ)) {
                return '🌊 **世界四大洋**\n\n太平洋、大西洋、印度洋、北冰洋\n\n按面积排序：太平洋 > 大西洋 > 印度洋 > 北冰洋\n\n**各洋特点**：\n• 太平洋：面积最大，最深处马里亚纳海沟11034m\n• 大西洋：世界第二大洋，S形\n• 印度洋：世界第三大洋，热带海洋\n• 北冰洋：面积最小，大部分被冰覆盖';
            }
            // 中国行政区划
            if (/中国.*省|省.*中国|行政区划/.test(cleanQ)) {
                return '🇨🇳 **中国行政区划**\n\n23个省、5个自治区、4个直辖市、2个特别行政区\n\n**四大直辖市**：北京、上海、天津、重庆\n\n**五个自治区**：内蒙古、广西、西藏、宁夏、新疆\n\n**两个特别行政区**：香港、澳门\n\n**省级行政单位共34个**：\n• 23省：河北、山西、辽宁、吉林、黑龙江、江苏、浙江、安徽、福建、江西、山东、河南、湖北、湖南、广东、海南、四川、贵州、云南、陕西、甘肃、青海、台湾\n• 5自治区：内蒙古、广西、西藏、宁夏、新疆\n• 4直辖市：北京、天津、上海、重庆\n• 2特别行政区：香港、澳门';
            }
            // 中国主要河流
            if (/长江|黄河|珠江|河流/.test(cleanQ)) {
                return '🏞️ **中国主要河流**\n\n• 长江：全长6300km，中国最长河流，世界第三\n• 黄河：全长5464km，中华文明发源地\n• 珠江：全长2320km，中国南方最大河流\n• 淮河：全长1000km，南北分界线\n• 海河：全长1090km，华北平原主要河流\n• 松花江：全长1927km，东北最大河流\n\n**外流河**：长江、黄河、珠江等（注入太平洋）\n**内流河**：塔里木河（中国最长内流河）';
            }
            // 世界最高峰
            if (/世界.*最高|最高.*山|珠穆朗玛|喜马拉雅/.test(cleanQ)) {
                return '🏔️ **世界最高峰**\n\n珠穆朗玛峰：8848.86米\n位于中国与尼泊尔边境，喜马拉雅山脉主峰\n\n**世界十大高峰**（均在喜马拉雅-喀喇昆仑山脉）：\n1. 珠穆朗玛峰 8848.86m\n2. 乔戈里峰（K2） 8611m\n3. 干城章嘉峰 8586m\n4. 洛子峰 8516m\n5. 马卡鲁峰 8485m';
            }
            // 气候
            if (/气候|气温|降水|季风/.test(cleanQ)) {
                if (/气候.*对比|气候.*比较|气候.*类型|气候带/.test(cleanQ)) {
                    return renderTable(
                        ['气候类型', '分布地区', '气温特点', '降水特点', '植被'],
                        [
                            ['热带雨林', '赤道附近', '全年高温>25°C', '全年多雨>2000mm', '热带雨林'],
                            ['热带季风', '东南亚', '全年高温', '分旱雨两季', '热带季雨林'],
                            ['亚热带季风', '长江以南', '夏季高温冬季温和', '夏季多雨冬季少雨', '亚热带常绿林'],
                            ['温带季风', '华北地区', '夏季高温冬季寒冷', '夏季多雨冬季干燥', '温带落叶林'],
                            ['温带大陆性', '西北内陆', '夏热冬冷，温差大', '降水稀少<400mm', '温带草原/荒漠'],
                            ['高原山地', '青藏高原', '终年低温', '降水较少', '高山草甸'],
                            ['地中海', '地中海沿岸', '夏季炎热冬季温和', '夏干冬雨', '硬叶常绿林'],
                        ]
                    );
                }
                return '🌡️ **中国气候类型**\n\n• 热带季风气候：海南、台湾南部\n• 亚热带季风气候：长江以南\n• 温带季风气候：华北地区\n• 温带大陆性气候：西北内陆\n• 高原山地气候：青藏高原\n• 高山高原气候：西南地区\n\n**季风特点**：\n• 夏季风：来自太平洋（东南季风）和印度洋（西南季风），温暖湿润\n• 冬季风：来自西伯利亚（西北季风），寒冷干燥';
            }
            // 地形地貌
            if (/地形|高原|盆地|平原|山地|丘陵/.test(cleanQ)) {
                return '🗺️ **中国地形**\n\n**四大高原**：青藏高原、内蒙古高原、黄土高原、云贵高原\n\n**四大盆地**：塔里木盆地、准噶尔盆地、柴达木盆地、四川盆地\n\n**三大平原**：东北平原、华北平原、长江中下游平原\n\n**主要山脉**：\n• 东西走向：天山-阴山、昆仑山-秦岭、南岭\n• 东北-西南走向：大兴安岭-太行山-巫山-雪峰山\n• 南北走向：贺兰山、横断山脉\n• 弧形山脉：喜马拉雅山脉';
            }
            // Default
            if (/人口|密度|人口分布/.test(cleanQ)) {
                return renderTable(
                    ['地区', '面积(万km\u00B2)', '人口(亿)', '密度(人/km\u00B2)', '特点'],
                    [
                        ['中国东部', '约360', '约11', '约305', '人口密集，经济发达'],
                        ['中国西部', '约640', '约3', '约47', '地广人稀，少数民族多'],
                        ['长三角', '约21', '约2.3', '约1095', '最密集，城市化高'],
                        ['珠三角', '约5.5', '约0.8', '约1455', '经济发达，外来人口多'],
                        ['京津冀', '约22', '约1.1', '约500', '政治文化中心'],
                        ['青藏高原', '约250', '约0.1', '约4', '人口最稀疏'],
                    ]
                );
            }
            // 中国地理分区
            if (/地理分区|南方北方|北方南方|南北方|东西部/.test(cleanQ)) {
                return renderTable(
                    ['分区', '范围', '气候', '地形', '农业', '文化特点'],
                    [
                        ['北方地区', '秦岭-淮河以北', '温带季风气候', '平原、高原为主', '旱地（小麦、玉米）', '面食为主，豪爽'],
                        ['南方地区', '秦岭-淮河以南', '亚热带/热带季风', '丘陵、平原、盆地', '水田（水稻）', '米饭为主，细腻'],
                        ['西北地区', '大兴安岭以西', '温带大陆性气候', '高原、盆地、沙漠', '绿洲农业（棉花、瓜果）', '游牧文化，瓜果之乡'],
                        ['青藏地区', '青藏高原', '高原山地气候', '高原、雪山', '高寒农业（青稞）', '藏传佛教，酥油茶'],
                    ]
                ) + '\n\n**秦岭-淮河一线的意义**：\n• 1月0°C等温线\n• 800mm等降水量线\n• 暖温带与亚热带分界线\n• 旱地与水田分界线\n• 温带落叶林与亚热带常绿林分界线';
            }
            // 世界主要河流和山脉
            if (/世界.*河流|世界.*山脉|世界.*大河|尼罗河|亚马逊|密西西比|阿尔卑斯|安第斯|落基/.test(cleanQ)) {
                return '**世界主要河流**：\n\n' + renderTable(
                    ['河流', '所在洲', '长度(km)', '注入海洋', '特点'],
                    [
                        ['尼罗河', '非洲', '6670', '地中海', '世界最长'],
                        ['亚马逊河', '南美洲', '6400', '大西洋', '世界流量最大'],
                        ['长江', '亚洲', '6300', '太平洋', '中国最长'],
                        ['密西西比河', '北美洲', '6020', '墨西哥湾', '北美最长'],
                        ['黄河', '亚洲', '5464', '太平洋', '中华文明发源地'],
                        ['鄂毕河', '亚洲', '5410', '北冰洋', '西伯利亚'],
                        ['湄公河', '亚洲', '4909', '南海', '流经六国'],
                        ['刚果河', '非洲', '4640', '大西洋', '非洲第二长'],
                    ]
                ) + '\n\n**世界主要山脉**：\n• 喜马拉雅山脉（亚洲）：世界最高，珠峰8848.86m\n• 安第斯山脉（南美洲）：世界最长，约7000km\n• 落基山脉（北美洲）：南北走向\n• 阿尔卑斯山脉（欧洲）：最高峰勃朗峰4808m\n• 乌拉尔山脉（欧亚分界线）';
            }
            // 气候带
            if (/气候带|气候区|热带.*温带|寒带|亚热带/.test(cleanQ) && !/气候.*对比|气候.*比较/.test(cleanQ)) {
                return '**世界气候带**：\n\n**热带（南北回归线之间）**：\n• 全年高温（>20°C）\n• 热带雨林气候：全年多雨\n• 热带草原气候：干湿季分明\n• 热带季风气候：雨热同期\n• 热带沙漠气候：全年少雨\n\n**温带（回归线与极圈之间）**：\n• 四季分明\n• 温带海洋性气候：全年温和多雨（如英国）\n• 温带季风气候：夏热冬冷，夏雨冬干\n• 温带大陆性气候：温差大，降水少\n• 地中海气候：夏干冬雨（如意大利）\n\n**寒带（极圈以内）**：\n• 全年寒冷\n• 极地苔原气候：最暖月>0°C\n• 极地冰原气候：全年<0°C\n\n**高原山地气候**：\n• 随海拔变化，垂直分布\n• 如青藏高原';
            }
            // 世界气候类型详解
            if (/气候详解|气候类型详解|世界气候详解|热带雨林气候|温带海洋性气候|地中海气候|苔原气候/.test(cleanQ)) {
                return teach('世界气候类型详解',
                    '**世界主要气候类型**：\n\n**热带气候（南北回归线之间）**：\n1. 热带雨林气候\n   分布：赤道附近（亚马逊、刚果、东南亚）\n   特点：全年高温多雨（>2000mm），无明显季节变化\n   植被：热带雨林\n\n2. 热带草原气候（萨瓦纳气候）\n   分布：热带雨林南北两侧（非洲、巴西、澳大利亚北部）\n   特点：全年高温，分明显干湿两季\n   植被：热带草原\n\n3. 热带季风气候\n   分布：南亚、东南亚（印度、孟加拉）\n   特点：全年高温，雨热同期，降水集中夏季\n   植被：热带季雨林\n\n4. 热带沙漠气候\n   分布：南北回归线附近大陆西岸（撒哈拉、阿拉伯）\n   特点：全年高温少雨，昼夜温差大\n   植被：荒漠\n\n**温带气候**：\n5. 地中海气候\n   分布：南北纬30°-40°大陆西岸\n   特点：夏季炎热干燥，冬季温和多雨（夏干冬雨）\n   植被：硬叶常绿林（橄榄、柑橘）\n\n6. 温带海洋性气候\n   分布：南北纬40°-60°大陆西岸（英国、新西兰）\n   特点：全年温和湿润，降水均匀，温差小\n   植被：温带落叶林\n\n7. 温带季风气候\n   分布：亚洲东部（华北、东北亚）\n   特点：夏季高温多雨，冬季寒冷干燥\n   植被：温带落叶林\n\n8. 温带大陆性气候\n   分布：温带内陆（中亚、北美内陆）\n   特点：温差大，降水少\n   植被：温带草原/荒漠\n\n**寒带气候**：\n9. 苔原气候：最暖月0-10°C，苔藓地衣\n10. 冰原气候：全年<0°C，冰雪覆盖',
                    '比较地中海气候和温带季风气候的异同。',
                    '相同点：\n• 都位于温带地区\n• 降水量都在400-800mm之间\n• 都有明显的季节变化\n\n不同点：\n• 地中海气候：夏干冬雨\n  原因：夏季受副热带高压控制（干燥），冬季受西风带影响（多雨）\n  分布：大陆西岸（30°-40°）\n  代表：意大利、希腊\n\n• 温带季风气候：夏雨冬干\n  原因：夏季受夏季风（来自海洋）影响，冬季受冬季风（来自大陆）影响\n  分布：大陆东岸（亚洲东部）\n  代表：北京、首尔\n\n记忆口诀：西岸地中海夏干冬雨，东岸季风夏雨冬干。',
                    '常见错误：\n• 混淆地中海气候和温带季风气候的降水季节\n• 混淆热带草原和热带季风的区别\n• 忘记温带海洋性气候的分布位置',
                    '画气候分布图帮助记忆，重点掌握地中海气候和季风气候的成因。'
                );
            }
            // 中国地理分区
            if (/四大区域|中国地理分区|北方地区|南方地区|西北地区|青藏地区|地理区域/.test(cleanQ)) {
                return teach('中国四大地理区域',
                    '**中国四大地理区域**：\n\n**北方地区**：\n• 范围：秦岭-淮河以北，大兴安岭以东\n• 气候：温带季风气候（夏热冬冷，降水集中夏季）\n• 地形：平原和高原为主（东北平原、华北平原、黄土高原）\n• 农业：旱地农业（小麦、玉米、大豆、高粱）\n• 文化：面食为主，豪爽直率\n• 城市：北京、天津、沈阳、哈尔滨\n\n**南方地区**：\n• 范围：秦岭-淮河以南，青藏高原以东\n• 气候：亚热带和热带季风气候（高温多雨）\n• 地形：丘陵、平原、盆地（长江中下游平原、四川盆地、东南丘陵）\n• 农业：水田农业（水稻、甘蔗、油菜、茶叶）\n• 文化：米饭为主，细腻温婉\n• 城市：上海、广州、成都、武汉\n\n**西北地区**：\n• 范围：大兴安岭以西，昆仑山-阿尔金山以北\n• 气候：温带大陆性气候（干旱少雨，温差大）\n• 地形：高原和盆地为主（内蒙古高原、塔里木盆地、准噶尔盆地）\n• 农业：绿洲农业和灌溉农业（棉花、瓜果、小麦）\n• 文化：游牧文化，瓜果之乡\n• 特征：深居内陆，距海远，降水少\n\n**青藏地区**：\n• 范围：青藏高原（昆仑山-祁连山以南，横断山脉以西）\n• 气候：高原山地气候（高寒，空气稀薄，太阳辐射强）\n• 地形：世界最高的大高原，雪山连绵\n• 农业：高寒农业（青稞、牦牛、藏绵羊）\n• 文化：藏传佛教，酥油茶\n• 特征："世界屋脊"，平均海拔4000米以上\n\n**秦岭-淮河一线的地理意义**：\n• 1月0°C等温线\n• 800mm等降水量线\n• 暖温带与亚热带分界线\n• 旱地与水田分界线\n• 温带落叶林与亚热带常绿林分界线',
                    '比较北方地区和南方地区的农业生产差异。',
                    '北方地区 vs 南方地区：\n\n耕地类型：旱地 vs 水田\n主要粮食：小麦 vs 水稻\n作物熟制：一年一熟/两年三熟 vs 一年两熟到三熟\n主要经济作物：大豆、花生、甜菜 vs 油菜、甘蔗、橡胶\n土地利用：耕地资源丰富 vs 耕地资源相对较少\n水源条件：灌溉农业 vs 靠天然降水\n\n差异原因：\n• 气候不同：北方降水少、温度低；南方降水多、温度高\n• 地形不同：北方平原多；南方丘陵多\n• 水文不同：北方河流有结冰期；南方河流水量大',
                    '常见错误：\n• 混淆四大区域的范围和特征\n• 秦岭-淮河一线的地理意义记不全\n• 青藏地区的高寒特征理解不深',
                    '用表格对比四大区域的气候、地形、农业和文化特征。'
                );
            }
            // 地图与地理信息系统
            if (/地图|比例尺|等高线|地理信息系统|gis|遥感|gps|地理信息/.test(cleanQ)) {
                return teach('地图与地理信息系统',
                    '**地图三要素**：\n\n**1. 比例尺**：\n• 定义：图上距离与实际距离的比\n• 表示方式：\n  - 数字式：1:500000（图上1cm代表实际5km）\n  - 线段式：0---5km---10km\n  - 文字式：图上1厘米代表实地5千米\n• 比例尺大小：\n  - 大比例尺（>1:10万）：表示范围小，内容详细\n  - 小比例尺（<1:100万）：表示范围大，内容简略\n\n**2. 方向**：\n• 一般地图：上北下南，左西右东\n• 有指向标的地图：按指向标确定方向\n• 经纬网地图：\n  - 经线指示南北方向\n  - 纬线指示东西方向\n\n**3. 图例和注记**：\n• 图例：地图上各种符号的含义\n• 注记：地图上的文字说明\n\n**等高线**：\n• 定义：海拔相同的各点连接成的线\n• 特点：\n  - 同一条等高线上各点海拔相同\n  - 等高线密集→坡陡；等高线稀疏→坡缓\n  - 等高线闭合→山峰（数值内高外低）或盆地（数值内低外高）\n  - 等高线凸向低处→山脊；凸向高处→山谷\n\n**地理信息技术（3S）**：\n• RS（遥感）：远距离探测，获取地表信息（卫星、航空摄影）\n  应用：资源调查、灾害监测、环境监测\n• GPS（全球定位系统）：确定地面点的经纬度和高程\n  应用：导航、定位、测量\n• GIS（地理信息系统）：存储、管理、分析地理空间数据\n  应用：城市规划、交通管理、灾害预警',
                    '读等高线地形图，判断地形类型。',
                    '判断方法：\n\n1. 山峰：等高线闭合，数值从外向内增大\n   例：等高线 100m-200m-300m，中心300m为山峰\n\n2. 盆地：等高线闭合，数值从外向内减小\n   例：等高线 300m-200m-100m，中心100m为盆地\n\n3. 山脊：等高线向低值方向凸出\n   （等高线凸向数值小的一侧）\n\n4. 山谷：等高线向高值方向凸出\n   （等高线凸向数值大的一侧）\n\n5. 鞍部：两组闭合等高线之间的低洼处\n\n6. 陡崖：多条等高线重叠处\n\n7. 坡度判断：\n   等高线密集 → 坡陡（适合攀岩）\n   等高线稀疏 → 坡缓（适合修路）',
                    '常见错误：\n• 比例尺大小和表示范围的关系搞反\n• 山脊和山谷的等高线凸出方向记反\n• 遥感、GPS、GIS的功能混淆',
                    '记住口诀：等高线密坡陡，疏坡缓；凸低是脊，凸高是谷。'
                );
            }
            return '🌍 **地理知识**\n\n我可以回答以下地理问题：\n• 七大洲四大洋\n• 中国行政区划\n• 主要河流/山脉/地形\n• 气候类型与特点\n• 人口分布与密度\n• 世界地理常识\n• 中国地理分区\n• 世界主要河流山脉\n• 世界气候类型详解\n• 地图与地理信息系统\n\n请告诉我你想了解什么？';
        }

        // ========== 10. 日常生活处理 ==========
        function handleDailyLife(question, cleanQ) {
            const q = question.toLowerCase();
            // 天气/自然
            if (q.includes('天气') || q.includes('温度') || q.includes('下雨') || q.includes('下雪') || q.includes('台风') || q.includes('地震')) {
                return '天气与自然知识：\n\n【天气现象】\n• 雨的形成：水蒸气上升遇冷凝结成水滴落下\n• 雪的形成：水蒸气在0°C以下凝华成冰晶\n• 彩虹：阳光经过水滴折射和反射形成\n• 雷电：云层中正负电荷放电\n\n【自然灾害】\n• 地震：地壳板块运动引起，震级每增加1级能量约32倍\n• 台风：热带气旋，风速≥32.7m/s\n• 洪水：暴雨或冰雪融化导致水位上涨\n\n⚠️ 遇到自然灾害请关注当地气象预警，听从官方指引。';
            }
            // 食物/烹饪
            if (q.includes('食物') || q.includes('做饭') || q.includes('烹饪') || q.includes('营养') || q.includes('菜') || q.includes('吃')) {
                return '食物与营养知识：\n\n【营养素】\n• 碳水化合物：主食（米、面），提供能量\n• 蛋白质：肉、蛋、奶、豆类，促进生长\n• 脂肪：食用油、坚果，储存能量\n• 维生素：蔬菜水果，维持生理功能\n• 矿物质：钙（牛奶）、铁（红肉）、碘（海带）\n\n【健康饮食建议】\n• 每天饮水1500-1700ml\n• 多吃蔬菜水果（每天500g蔬菜+200g水果）\n• 少油少盐少糖\n• 早餐要吃好，午餐要吃饱，晚餐要吃少\n• 不暴饮暴食，定时定量';
            }
            // 健康/运动
            if (q.includes('健康') || q.includes('运动') || q.includes('锻炼') || q.includes('睡眠') || q.includes('视力') || q.includes('保护')) {
                return '健康与运动建议：\n\n【运动建议】\n• 每天至少运动60分钟（学生）\n• 有氧运动：跑步、游泳、骑车（增强心肺）\n• 力量训练：俯卧撑、深蹲（增强肌肉）\n• 柔韧训练：拉伸、瑜伽（提高柔韧性）\n\n【健康习惯】\n• 保证每天8-9小时睡眠\n• 保护视力：每用眼40分钟休息10分钟，保持正确坐姿\n• 饭后不要立即剧烈运动\n• 运动前热身，运动后拉伸\n• 多喝水，少喝含糖饮料';
            }
            // 时间/日期
            if (q.includes('时间') || q.includes('日期') || q.includes('日历') || q.includes('星期') || q.includes('月份')) {
                const now = new Date();
                const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
                return `当前日期时间：\n• 日期：${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日\n• 星期：星期${weekdays[now.getDay()]}\n\n【时间换算】\n• 1年 = 365天（闰年366天）\n• 1个月 = 28/29/30/31天\n• 1周 = 7天\n• 1天 = 24小时 = 1440分钟\n• 1小时 = 60分钟 = 3600秒`;
            }
            return null;
        }

        // ========== 通用知识回退 ==========

        // ========== 功能咨询处理 ==========
        function handleFuncounsel(question) {
            const q = question.toLowerCase();
            
            // 功能介绍
            if (/功能|能做什么|介绍|有什么/.test(q)) {
                return `📋 **智学空间功能概览**\n\n` +
                    `**学习功能：**\n` +
                    `• 🤖 AI智能问答 - 16个科目全覆盖\n` +
                    `• 📝 错题本 - 自动收录错题，支持标记掌握\n` +
                    `• 🃏 学习卡片 - 间隔重复复习，8科49张预置知识点\n` +
                    `• 🎮 学习游戏 - 18种趣味游戏（速算/成语/数独/24点等）\n` +
                    `• 📊 学习统计 - 追踪学习进度\n\n` +
                    `**工具功能：**\n` +
                    `• 🧮 计算器 | 🎨 绘图板 | 📒 快速笔记\n` +
                    `• 📎 文件上传（支持txt/csv/json/doc/xls等）\n` +
                    `• 📸 图片问答（上传图片AI智能分析）\n\n` +
                    `**系统功能：**\n` +
                    `• 👤 个人中心（头像/头像框/等级/设置）\n` +
                    `• 💾 数据自动保存（localStorage）\n` +
                    `• 🌙 深色/浅色主题切换\n` +
                    `• ⌨️ 快捷键支持（Ctrl+Enter发送）\n\n` +
                    `**工作者模式：**\n` +
                    `• 📁 文件管理 | 📑 文档编辑器 | 📊 电子表格\n` +
                    `• 💻 项目开发 | 📊 PPT制作 | 🎬 视频制作\n` +
                    `• ✍️ 写作辅助 | 📋 方案生成\n\n` +
                    `输入具体功能名可查看详细使用说明！`;
            }
            
            // 快捷键
            if (/快捷键|键盘|shortcut/.test(q)) {
                return `⌨️ **快捷键指南**\n\n` +
                    `• **Ctrl + Enter** - 发送消息\n` +
                    `• **Ctrl + /** - 打开快捷键帮助\n` +
                    `• **Ctrl + B** - 加粗选中文字\n` +
                    `• **Ctrl + I** - 斜体选中文字\n` +
                    `• **Ctrl + U** - 下划线选中文字\n` +
                    `• **Esc** - 关闭弹窗`;
            }
            
            // 头像框
            if (/头像框|头像|avatar/.test(q)) {
                return `🎨 **头像框系统**\n\n` +
                    `目前共有 **29种** 头像框，其中大部分免费使用！\n\n` +
                    `**获取方式：**\n` +
                    `• 设置 → 个人中心 → 头像框\n` +
                    `• 大部分头像框直接免费使用\n` +
                    `• 特殊头像框通过等级/成就解锁\n\n` +
                    `**稀有头像框：**\n` +
                    `• 🌌 银河框（LV50）| 🐉 龙焰框（LV45）\n` +
                    `• 💎 钻石框（LV45）| ✨ 神圣框（LV40）\n` +
                    `• 👑 皇冠框（LV35）| 🌈 彩虹框（LV25）\n` +
                    `• 🔥 烈焰框（LV15）| 🏆 连胜框（游戏5连胜）`;
            }
            
            // 等级系统
            if (/等级|经验|升级|level|xp/.test(q)) {
                return `📊 **等级经验系统**\n\n` +
                    `**等级范围：** LV.0 ~ LV.50\n` +
                    `**升级公式：** XP = 100 × LV × (LV+1) / 2\n\n` +
                    `**获取经验的方式：**\n` +
                    `• 提问 +10 XP\n` +
                    `• 答对题目 +20 XP\n` +
                    `• 答错题目 +5 XP\n` +
                    `• 每日登录 +30 XP\n` +
                    `• 完成一局游戏 +15 XP\n` +
                    `• 游戏获胜 +30 XP\n` +
                    `• 复习闪卡 +8 XP\n` +
                    `• 连续登录7天 +50 XP\n\n` +
                    `**每周经验上限：** 5000 XP`;
            }
            
            // 游戏功能
            if (/游戏|game/.test(q)) {
                return `🎮 **学习游戏（18种）**\n\n` +
                    `**文字类：** 词语接龙 | 成语挑战 | 成语接龙 | 猜谜题 | 诗词飞花令\n` +
                    `**数学类：** 速算挑战 | 24点挑战 | 数独挑战\n` +
                    `**语言类：** 单词拼写 | 打字速度 | 英语语法填空\n` +
                    `**知识类：** 知识问答对战 | 地理问答 | 历史时间线 | 化学方程式配平\n` +
                    `**思维类：** 记忆测试 | 逻辑推理\n\n` +
                    `在聊天中输入"游戏"即可打开游戏选择！`;
            }
            
            // 数据保存
            if (/保存|存储|数据|备份/.test(q)) {
                return `💾 **数据存储说明**\n\n` +
                    `所有数据保存在浏览器 localStorage 中，关闭浏览器后数据不会丢失。\n\n` +
                    `**保存的数据：**\n` +
                    `• 账号信息（按用户ID隔离）\n` +
                    `• 聊天记录（按科目保存）\n` +
                    `• 错题本（按科目保存）\n` +
                    `• 学习卡片（含复习进度）\n` +
                    `• 等级经验（按用户ID隔离）\n` +
                    `• 设置偏好\n` +
                    `• 文件管理器数据\n\n` +
                    `⚠️ 清除浏览器缓存会删除所有数据，请谨慎操作。`;
            }
            
            // 默认回复
            return `💡 **功能咨询**\n\n` +
                `我可以帮你了解智学空间的各种功能！试试问我：\n\n` +
                `• "有哪些功能"\n• "快捷键有哪些"\n` +
                `• "头像框怎么获得"\n• "等级怎么升级"\n` +
                `• "有哪些游戏"\n• "数据怎么保存"\n\n` +
                `你也可以直接在聊天中使用以下命令：\n` +
                `• 出题、翻译、总结、对比、举例\n` +
                `• 画图、编题、划重点、做规划`;
        }

        // ========== 图片问答智能处理 ==========
        function handleImageQA(question, subject) {
            const q = question.toLowerCase();
            const cleanQ = question || '';

            // 根据用户文字问题推断图片内容类型
            // 数学类
            if (/方程|求解|计算|等于|证明|几何|函数|导数|积分|数列|概率|统计|三角|向量|矩阵|行列式|极限|微分|面积|体积|周长|角度|坐标|抛物线|椭圆|双曲线|圆|直线|平面|立体/.test(cleanQ)) {
                return `📸 **图片数学题分析**

我收到了你上传的数学题目图片。根据你的描述，这看起来是一道**数学问题**。

**我能帮你：**
• 解方程、计算数值
• 几何证明与推导
• 函数图像与性质分析
• 数列、概率、统计计算
• 微积分相关计算

**为了更准确地解答，你可以：**
1. 直接输入题目中的关键公式或表达式
2. 描述题目的已知条件和求解目标
3. 告诉我这是哪个知识点（如"二次函数"、"三角函数"等）

请补充题目内容，我会立即为你详细解答！`;
            }

            // 化学类
            if (/化学|元素|分子|原子|离子|化合价|化学式|方程式|反应|酸碱|氧化|还原|有机|无机|物质|溶液|浓度|摩尔|气体|沉淀|金属|非金属|周期表/.test(cleanQ)) {
                return `📸 **图片化学题分析**

我收到了你上传的化学题目图片。根据你的描述，这看起来是一道**化学问题**。

**我能帮你：**
• 配平化学方程式
• 计算物质的量、浓度
• 分析元素周期表规律
• 判断氧化还原反应
• 有机化学结构分析
• 化学实验现象解释

**为了更准确地解答，你可以：**
1. 输入题目中的化学方程式或化学式
2. 描述实验现象或反应条件
3. 告诉我需要求解的具体量

请补充题目内容，我会立即为你详细解答！`;
            }

            // 物理类
            if (/物理|力|速度|加速度|质量|能量|功|功率|压强|浮力|电场|磁场|电流|电压|电阻|电路|光学|热学|声学|运动|牛顿|动量|冲量|机械波|电磁波|相对论|量子/.test(cleanQ)) {
                return `📸 **图片物理题分析**

我收到了你上传的物理题目图片。根据你的描述，这看起来是一道**物理问题**。

**我能帮你：**
• 力学计算（牛顿定律、能量守恒）
• 电磁学分析（电路、场强）
• 光学问题（反射、折射、干涉）
• 热学计算（热量、温度变化）
• 运动学分析（匀速、匀加速）

**为了更准确地解答，你可以：**
1. 输入题目中的已知数据（质量、速度、力等）
2. 描述物理过程和受力情况
3. 告诉我需要求解的物理量

请补充题目内容，我会立即为你详细解答！`;
            }

            // 英语类
            if (/英语|english|翻译|grammar|语法|单词|词汇|阅读|作文|写作|听力|口语|时态|语态|从句|短语|搭配|完形|填空/.test(cleanQ)) {
                return `📸 **图片英语题分析**

我收到了你上传的英语题目图片。根据你的描述，这看起来是一道**英语问题**。

**我能帮你：**
• 翻译句子或文章
• 语法分析和纠错
• 词汇辨析和用法
• 阅读理解分析
• 作文写作指导
• 完形填空解答

**为了更准确地解答，你可以：**
1. 输入题目中的句子或段落
2. 告诉我题型（阅读、完形、语法等）
3. 指出你不确定的具体选项或句子

请补充题目内容，我会立即为你详细解答！`;
            }

            // 语文类
            if (/语文|古诗|文言文|阅读|作文|修辞|成语|字词|拼音|标点|段落|中心思想|主旨|写作|文学|名著|作者/.test(cleanQ)) {
                return `📸 **图片语文题分析**

我收到了你上传的语文题目图片。根据你的描述，这看起来是一道**语文问题**。

**我能帮你：**
• 古诗词鉴赏与翻译
• 文言文翻译与解析
• 阅读理解答题技巧
• 作文审题与立意
• 修辞手法分析
• 文学常识问答

**为了更准确地解答，你可以：**
1. 输入题目中的关键文本内容
2. 告诉我题型（阅读、古诗、作文等）
3. 描述你的困惑或需要分析的要点

请补充题目内容，我会立即为你详细解答！`;
            }

            // 生物类
            if (/生物|细胞|基因|DNA|蛋白质|酶|光合作用|呼吸|遗传|进化|生态|人体|植物|动物|微生物|病毒|细菌|有丝分裂|减数分裂/.test(cleanQ)) {
                return `📸 **图片生物题分析**

我收到了你上传的生物题目图片。根据你的描述，这看起来是一道**生物问题**。

**我能帮你：**
• 细胞结构与功能分析
• 遗传规律计算
• 光合作用与呼吸作用
• 生态系统分析
• 人体生理知识
• 进化论相关问题

**为了更准确地解答，你可以：**
1. 输入题目中的关键描述或数据
2. 描述图示中的结构或过程
3. 告诉我需要判断或计算的内容

请补充题目内容，我会立即为你详细解答！`;
            }

            // 如果用户没有文字问题，只有图片
            if (!cleanQ.trim() || cleanQ.trim().length < 3) {
                return `📸 **图片已收到**

我收到了你上传的图片！由于我是离线AI，无法直接识别图片中的文字内容。

**请告诉我：**
1. 这张图片是什么科目的题目？（数学/语文/英语/物理/化学/生物等）
2. 题目的大致内容是什么？
3. 你需要我帮你解答什么问题？

**或者你可以：**
• 直接输入题目中的关键文字或公式
• 描述题目要求和已知条件
• 拍照后用文字复述题目内容

我会根据你提供的信息，为你给出详细的解答！`;
            }

            // 通用图片问题引导
            return `📸 **图片题目分析**

我收到了你上传的图片。根据你的问题描述，我会尽力帮助你。

**建议操作：**
1. 用文字描述图片中的题目内容
2. 输入关键的公式、数据或选项
3. 告诉我题目所属科目和知识点

这样我就能为你提供准确的解答了！`;
        }

        // ========== 日常对话处理 ==========
        function handleDailyConversation(question) {
            const q = question.toLowerCase();
            const cleanQ = question;

            // 问候
            if (/^(你好|您好|嗨|hi|hello|hey|哈喽|早上好|下午好|晚上好|早安|午安|晚安)[\s!！。.？?~]*$/i.test(cleanQ.trim())) {
                const greetings = [
                    '你好呀！很高兴见到你。今天想学点什么呢？可以选一个科目开始学习，或者随便聊聊也可以。',
                    '你好！欢迎来到AI学习平台。有什么我可以帮你的吗？',
                    '嗨！今天状态怎么样？准备好学习了吗？'
                ];
                return greetings[Math.floor(Math.random() * greetings.length)];
            }

            // 情感交流/心情不好
            if (/心情不好|心情不太好|不开心|难过|伤心|郁闷|烦|焦虑|压力大|累|疲惫|无聊|失落|沮丧|低落|emo|心情差|不开心|心情.*不好|不好.*心情|心情.*差/.test(cleanQ)) {
                const comforts = [
                    '听到你心情不太好，先给你一个虚拟的拥抱。\n\n每个人都会有低落的时候，这很正常。建议你：\n1. 先休息一下，做点让自己开心的事\n2. 听一首喜欢的歌，或者出去走走\n3. 如果是学习压力，可以试着把任务拆小，一步一步来\n4. 和朋友或家人聊聊天\n\n等你心情好一些了，随时可以回来学习，我一直在这里。',
                    '别难过呀！生活中总有起起落落，重要的是不要放弃。\n\n给你一个小建议：试着写下三件今天让你感恩的小事，哪怕是很小的事情也可以。\n\n如果想转移注意力，可以选一个感兴趣的科目，做几道轻松的题目。',
                    '我能理解你的感受。心情不好的时候，不要勉强自己学习。\n\n先照顾好自己的情绪吧：\n• 深呼吸几次，放松一下\n• 喝杯温水，吃点甜的东西\n• 看看窗外的风景\n\n记住，暂时的低谷不代表什么，明天会更好的。'
                ];
                return comforts[Math.floor(Math.random() * comforts.length)];
            }

            // 笑话请求
            if (/笑话|讲个笑话|搞笑|逗我开心|开心一下|有趣的事|幽默/.test(cleanQ)) {
                const jokes = [
                    '好的，给你讲一个数学笑话：\n\n平行线最可怜了，因为它们有那么多相同点，却永远不能在一起。\n\n哈哈，学数学也要保持幽默感！',
                    '来一个：\n\n老师问小明："如果你有12块巧克力，有人问你要3块，你还剩多少？"\n小明："12块。"\n老师："你不懂数学吗？"\n小明："你不懂我，我更不懂分享。"\n\n哈哈，审题很重要！',
                    '给你讲一个冷笑话：\n\n为什么数学书总是很不开心？\n因为它有太多"问题"（problems）了。\n\n好了好了，笑完继续学习吧！'
                ];
                return jokes[Math.floor(Math.random() * jokes.length)];
            }

            // 礼貌回复
            if (/谢谢|感谢|多谢|thanks|thank you|太好了|你真棒|厉害|不错|很好|赞/.test(cleanQ)) {
                const replies = [
                    '不客气！能帮到你我很高兴。如果还有其他问题，随时问我！',
                    '谢谢你的反馈！学习之路我们一起走，加油！',
                    '很高兴能帮到你！保持好奇心，有问题随时来问！'
                ];
                return replies[Math.floor(Math.random() * replies.length)];
            }

            // 告别
            if (/^(再见|拜拜|bye|goodbye|走了|先走了|下课了|结束)[\s!！。.]*$/i.test(cleanQ.trim())) {
                return '再见！今天辛苦了，记得适当休息。明天继续加油，我随时在这里等你！';
            }

            // 自我介绍
            if (/你是谁|你叫什么|介绍一下你|你是什么/.test(cleanQ)) {
                return '我是AI学习助手，一个离线运行的智能学习平台。\n\n我可以帮你：\n• 解答数学、英语、语文、物理、化学、生物等学科问题\n• 提供详细的解题步骤和知识点讲解\n• 出题练习和错题分析\n• 陪你聊天、讲笑话、缓解压力\n\n选择上方的科目就可以开始学习了！';
            }

            // 购物/价格计算
            if (/买.*多少钱|价格|打.*折|折扣|优惠|性价比|划算|便宜|贵|预算|花费|消费|购物|买东西/.test(cleanQ)) {
                return `🛒 **购物与价格小贴士**

遇到价格问题可以这么思考：

**打折计算**：
• 原价 × 折扣 = 实付金额
• 例：200元打8折 = 200 × 0.8 = 160元
• 满减：先凑满减门槛，再算实际折扣率

**性价比判断**：
• 计算单位价格（总价 ÷ 数量）
• 考虑使用寿命和实际需求
• 不要为不需要的功能付费

**省钱技巧**：
• 列购物清单，避免冲动消费
• 大促期间囤货日用品（注意保质期）
• 对比线上线下价格

你有具体的购物计算问题吗？我可以帮你算！`;
            }

            // 交通/出行
            if (/怎么.*去|路线|交通|出行|坐车|地铁|公交|打车|自驾|堵车|路程|距离|时间.*到|多久.*到/.test(cleanQ)) {
                return `🚗 **出行小贴士**

**选择交通工具**：
• 短距离（<3km）：步行或共享单车
• 中距离（3-10km）：地铁或公交
• 长距离（>10km）：地铁/高铁/自驾
• 赶时间：打车或网约车

**时间估算**：
• 地铁：平均时速30-40km/h（含停站）
• 公交：平均时速15-25km/h（受路况影响大）
• 步行：约5km/h
• 自行车：约15km/h

**出行建议**：
• 高峰期预留额外时间
• 用地图APP查实时路况
• 下雨天提前出门

告诉我你的出发地和目的地，我可以帮你估算时间和推荐路线！`;
            }

            // 旅游/景点
            if (/旅游|旅行|景点|好玩|推荐.*地方|去哪.*玩|攻略|住宿|酒店|门票/.test(cleanQ)) {
                return `✈️ **旅行小贴士**

**行前准备**：
• 查天气预报，准备合适衣物
• 提前订机票/火车票（提前1-2周更便宜）
• 预订住宿，选择交通便利的位置
• 准备身份证、充电宝、常用药品

**省钱攻略**：
• 淡季出行，机票酒店更便宜
• 提前关注景点门票优惠
• 当地小吃比景区餐厅实惠
• 使用公共交通代替打车

**安全提醒**：
• 保管好贵重物品
• 告知家人行程安排
• 购买旅行保险

你想去哪里旅行？我可以帮你规划行程！`;
            }

            // 理财/储蓄
            if (/存钱|储蓄|理财|利息|投资|赚钱|零花钱|压岁钱|预算|记账/.test(cleanQ)) {
                return `💰 **理财小贴士**

**储蓄习惯**：
• 先存后花：收到钱先存10%-20%
• 记账：记录每笔支出，了解钱花哪了
• 目标储蓄：为想买的东西设定储蓄目标

**利息计算**：
• 单利：利息 = 本金 × 利率 × 时间
• 复利：利滚利，时间越长效果越明显
• 例：1000元存1年，年利率3%，利息 = 1000 × 0.03 = 30元

**消费原则**：
• 需要 vs 想要：先满足需要，再考虑想要
• 24小时法则：想买的东西等24小时再决定
• 不攀比：适合自己的才是最好的

你有具体的理财计算问题吗？我可以帮你算！`;
            }

            // 社交/人际关系
            if (/朋友|同学|相处|关系|人际|社交|聊天|说话|表达|沟通|矛盾|吵架|道歉/.test(cleanQ)) {
                return `🤝 **人际交往小贴士**

**沟通技巧**：
• 倾听比说更重要，先理解对方再表达自己
• 用"我"开头表达感受，而非指责对方
• 例："我觉得有点难过" 比 "你总是这样" 更有效

**处理矛盾**：
• 冷静后再沟通，不要在情绪激动时争论
• 换位思考：如果我是对方会怎么想？
• 寻找双赢方案，而不是争输赢

**建立友谊**：
• 真诚待人，不要虚伪
• 记住对方的小细节（生日、喜好）
• 在对方需要时给予帮助
• 尊重彼此的边界

**社交礼仪**：
• 守时是对他人的尊重
• 公共场合注意音量
• 收到礼物及时表达感谢

你在人际关系上遇到什么困扰了吗？可以跟我说说。`;
            }

            // 健康/BMI/运动
            if (/bmi|体重|减肥|增重|身高|体型|身材|跑步|健身|瑜伽|运动|锻炼|卡路里|热量/i.test(cleanQ)) {
                return `🏃 **健康与运动小贴士**

**BMI计算**：
• BMI = 体重(kg) ÷ 身高(m)²
• <18.5 偏瘦 | 18.5-24 正常 | 24-28 偏胖 | ≥28 肥胖
• 例：身高1.7m，体重65kg，BMI = 65÷(1.7×1.7) ≈ 22.5（正常）

**运动建议**：
• 学生每天至少运动60分钟
• 有氧运动（跑步、游泳）增强心肺
• 力量训练（俯卧撑、深蹲）增强肌肉
• 拉伸运动提高柔韧性

**健康饮食**：
• 每天饮水1500-1700ml
• 多吃蔬菜水果
• 少油少盐少糖
• 规律三餐，不要暴饮暴食

**护眼小贴士**：
• 每用眼40分钟休息10分钟
• 保持正确坐姿，眼睛离屏幕50-70cm
• 多眨眼，保持眼睛湿润

需要我帮你计算BMI或制定运动计划吗？`;
            }

            // 学习规划/时间管理
            if (/学习计划|时间管理|安排|规划|番茄|专注|拖延|效率|复习|备考|考试|作业/.test(cleanQ)) {
                return `📚 **学习规划小贴士**

**时间管理方法**：
• 番茄工作法：学习25分钟 + 休息5分钟
• 四象限法：重要紧急 > 重要不紧急 > 紧急不重要 > 不紧急不重要
• 任务拆分：大任务拆成小步骤，逐个完成

**制定学习计划**：
• 设定明确目标（例：本周掌握三角函数）
• 估算每项任务所需时间
• 留出缓冲时间应对突发情况
• 每天复盘，调整计划

**克服拖延**：
• 先做最难的任务（吃掉那只青蛙）
• 消除干扰源（手机放远点）
• 设定小奖励（完成一项任务奖励自己）
• 找学习伙伴互相监督

**复习策略**：
• 艾宾浩斯遗忘曲线：当天→3天后→7天后→30天复习
• 费曼学习法：用简单语言讲给别人听
• 错题本：记录错题，定期回顾

需要我帮你制定具体的学习计划吗？`;
            }

            // 家居/生活技巧
            if (/收纳|整理|清洁|打扫|家务|做饭|菜谱|食谱|洗衣|收纳|断舍离/.test(cleanQ)) {
                return `🏠 **家居生活小贴士**

**收纳整理**：
• 分类收纳：同类物品放在一起
• 常用物品放在容易拿到的地方
• 定期断舍离：不用的东西及时处理
• 利用垂直空间（置物架、挂钩）

**清洁技巧**：
• 每天花10分钟整理，比周末大扫除轻松
• 从上到下清洁（先擦桌子再扫地）
• 厨房油污用热水+洗洁精效果更好
• 定期清洗床单被套（建议1-2周一次）

**简单烹饪**：
• 番茄炒蛋：先炒蛋盛出，再炒番茄，最后混合
• 煮面：水开下面，中途加冷水更劲道
• 蒸蛋：蛋液和水比例1:1.5，盖保鲜膜蒸

**生活小窍门**：
• 白衣服发黄用柠檬汁+盐水浸泡
• 鞋子除臭放小苏打或茶包
• 切洋葱前冷藏10分钟减少流泪

有什么具体的生活问题需要帮忙吗？`;
            }

            // 天气/穿衣（排除购物场景）
            if (!/买.*多少钱|价格|打.*折|折扣|优惠|性价比|划算|便宜|贵|预算|花费|消费|购物|买东西/.test(cleanQ) &&
                /天气|气温|温度|冷热|穿衣|搭配|衣服|穿什么|季节/.test(cleanQ)) {
                const now = new Date();
                const month = now.getMonth() + 1;
                let season = '';
                if (month >= 3 && month <= 5) season = '春季';
                else if (month >= 6 && month <= 8) season = '夏季';
                else if (month >= 9 && month <= 11) season = '秋季';
                else season = '冬季';
                return `🌤️ **天气与穿衣建议**

当前季节：${season}（${month}月）

**${season}穿衣指南**：
• 春季：洋葱式穿搭，方便增减
• 夏季：透气棉麻，注意防晒
• 秋季：薄外套+长袖，早晚温差大
• 冬季：保暖为主，三层穿衣法（排汗+保暖+防风）

**温度参考**：
• >28°C：短袖、短裤
• 20-28°C：短袖+薄外套
• 10-20°C：长袖+外套
• <10°C：羽绒服/棉衣

**小贴士**：
• 看天气预报再决定穿衣
• 雨天记得带伞
• 空调房备一件薄外套

需要更具体的穿搭建议吗？`;
            }

            return null;
        }

        function handleGeneralKnowledge(question) {
            const q = question.toLowerCase();
            const cleanQ = question;

            // 常识性问题
            const commonKnowledge = {
                '太阳系八大行星': '太阳系八大行星（按距太阳远近）：水星、金星、地球、火星、木星、土星、天王星、海王星。',
                '太阳系': '太阳系八大行星（按距太阳远近）：\n1. 水星 - 最小，离太阳最近，表面温差最大（-173°C~427°C）\n2. 金星 - 最热行星（约465°C），自转方向与其他行星相反\n3. 地球 - 唯一已知有生命的行星，有液态水和大气层\n4. 火星 - 红色星球，有太阳系最高火山（奥林匹斯山）\n5. 木星 - 最大行星，大红斑是持续数百年的风暴\n6. 土星 - 有壮观的环系统，密度小于水\n7. 天王星 - 侧躺着自转，呈蓝绿色\n8. 海王星 - 最远的行星，风速最快\n\n矮行星：冥王星（2006年被重新分类）',
                '行星': '太阳系八大行星：水星、金星、地球、火星、木星、土星、天王星、海王星。\n\n按大小排列：木星 > 土星 > 天王星 > 海王星 > 地球 > 金星 > 火星 > 水星',
                '世界最高峰': '世界最高峰是珠穆朗玛峰，海拔8848.86米，位于中国与尼泊尔边境的喜马拉雅山脉。',
                '中国最长的河': '中国最长的河流是长江，全长约6300公里，是世界第三长河。',
                '地球有多大': '地球赤道周长约40075公里，表面积约5.1亿平方公里，年龄约46亿年。',
                '月球离地球多远': '月球到地球的平均距离约38.4万公里。',
                '一年多少天': '平年365天，闰年366天。闰年规则：能被4整除但不能被100整除，或能被400整除的年份是闰年。',
                '光速是多少': '光在真空中的速度约为3×10⁸ m/s（约30万公里/秒）。',
                '水的沸点': '在标准大气压下，水的沸点是100°C，冰点是0°C。',
                '人体有多少块骨头': '成年人有206块骨头，婴儿出生时约有270块骨头，随成长部分骨头会融合。',
                '血型有几种': '人类血型主要有ABO血型系统：A型、B型、AB型、O型。还有Rh血型系统：Rh阳性和Rh阴性。',
                '世界上最大的国家': '世界上面积最大的国家是俄罗斯（约1710万平方公里），其次是加拿大、中国、美国。',
                '世界上最多人口的国家': '中国和印度是世界上人口最多的两个国家，各有约14亿人口。',
                '四大发明': '中国古代四大发明：造纸术（蔡伦）、印刷术（毕昇）、火药、指南针。',
                '诺贝尔奖': '诺贝尔奖分为物理学、化学、生理学或医学、文学、和平、经济学6个奖项，每年在瑞典斯德哥尔摩颁发。',
                '七大洲': '世界七大洲（按面积）：亚洲（最大）、非洲、北美洲、南美洲、南极洲、欧洲、大洋洲（最小）。',
                '四大洋': '世界四大洋：太平洋（最大）、大西洋、印度洋、北冰洋（最小）。',
                '大洲': '世界七大洲：亚洲、非洲、北美洲、南美洲、南极洲、欧洲、大洋洲。',
                '大洋': '世界四大洋：太平洋、大西洋、印度洋、北冰洋。',
                '人体器官': '人体重要器官：\n• 大脑 - 思维控制中心\n• 心脏 - 血液循环泵\n• 肺 - 气体交换\n• 肝脏 - 解毒代谢\n• 胃 - 消化食物\n• 肾脏 - 过滤血液\n• 肠道 - 吸收营养\n• 皮肤 - 最大的器官',
                '人体系统': '人体八大系统：\n1. 消化系统 - 消化吸收营养\n2. 循环系统 - 输送血液\n3. 呼吸系统 - 气体交换\n4. 泌尿系统 - 排出废物\n5. 神经系统 - 感知和控制\n6. 内分泌系统 - 激素调节\n7. 生殖系统 - 繁殖后代\n8. 运动系统 - 支撑和运动',
                '发明': '常见发明和发明家：\n• 电话 - 贝尔（1876年）\n• 电灯 - 爱迪生（1879年）\n• 飞机 - 莱特兄弟（1903年）\n• 汽车 - 卡尔·本茨（1886年）\n• 互联网 - 蒂姆·伯纳斯-李（1989年）\n• 造纸术 - 蔡伦（东汉）\n• 活字印刷 - 毕昇（北宋）\n• 火药 - 中国古代炼丹家\n• 指南针 - 中国古代\n• 蒸汽机 - 瓦特（改良，1769年）\n• 电池 - 伏打（1800年）\n• X射线 - 伦琴（1895年）',
                '发明家': '著名发明家：\n• 爱迪生 - 电灯、留声机等（1093项专利）\n• 莱特兄弟 - 飞机\n• 贝尔 - 电话\n• 瓦特 - 蒸汽机（改良）\n• 诺贝尔 - 炸药\n• 蔡伦 - 改进造纸术\n• 毕昇 - 活字印刷术\n• 蒂姆·伯纳斯-李 - 万维网',
                '春节': '春节（农历正月初一）是中国最重要的传统节日。习俗：贴春联、放鞭炮、吃年夜饭、拜年、发红包、舞龙舞狮。传说"年"是一种怪兽，怕红色和响声，所以人们贴红对联、放鞭炮驱赶"年"。',
                '中秋节': '中秋节（农历八月十五）是团圆的节日。习俗：赏月、吃月饼、猜灯谜。传说嫦娥奔月，后羿思念妻子，在月下摆供品。',
                '端午节': '端午节（农历五月初五）纪念爱国诗人屈原。习俗：吃粽子、赛龙舟、挂艾草、佩香囊。屈原投汨罗江自尽，百姓划船打捞，投米团入江喂鱼。',
                '元宵节': '元宵节（农历正月十五），又称上元节。习俗：赏花灯、猜灯谜、吃元宵/汤圆。是春节的最后一个节日。',
                '清明节': '清明节（公历4月4-6日），祭扫祖先、踏青的节日。习俗：扫墓、踏青、放风筝、插柳。杜牧诗："清明时节雨纷纷，路上行人欲断魂。"',
                '重阳节': '重阳节（农历九月初九），登高、赏菊、敬老。又称"老人节"。王维诗："遥知兄弟登高处，遍插茱萸少一人。"',
                '七夕节': '七夕节（农历七月初七），中国的情人节。传说牛郎织女每年这天在鹊桥相会。习俗：乞巧、拜织女。',
                '国庆节': '国庆节（10月1日），纪念1949年中华人民共和国成立。习俗：升旗仪式、阅兵、烟花表演、放假7天。',
            };

            for (const [key, val] of Object.entries(commonKnowledge)) {
                if (cleanQ.includes(key) || q.includes(key.toLowerCase())) {
                    return `💡 **知识查询**\n\n${val}`;
                }
            }

            return null;
        }

        // ========== 11. 数学题目生成器 ==========
        function generateMathProblem(difficulty, type) {
            const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
            const d = difficulty || '中等';
            const t = type || '解答题';

            if (t === '选择题') {
                const topics = [
                    () => {
                        const a = rand(2, 20), b = rand(2, 20), op = ['+', '-', '×'][rand(0, 2)];
                        const ops = {'+': (x,y)=>x+y, '-': (x,y)=>x-y, '×': (x,y)=>x*y};
                        const correct = ops[op](a, b);
                        return { question: `${a} ${op} ${b} = ?`, answer: `${correct}`, hint: '直接计算', hasOptions: true,
                            options: `A. ${correct}\nB. ${correct + rand(1,5)}\nC. ${correct - rand(1,5)}\nD. ${correct + rand(2,8)}` };
                    },
                    () => {
                        const r = rand(2, 10);
                        const area = Math.round(Math.PI * r * r * 100) / 100;
                        return { question: `圆的半径为 ${r}cm，求面积（π≈3.14）。`, answer: `S = πr² = 3.14 × ${r}² ≈ ${area}cm²`, hint: 'S = πr²', hasOptions: true,
                            options: `A. ${area}cm²\nB. ${area + rand(5,20)}cm²\nC. ${2 * Math.round(Math.PI * r)}cm²\nD. ${Math.round(Math.PI * r)}cm²` };
                    },
                    () => {
                        const a = rand(10, 50), b = rand(10, 50);
                        return { question: `${a} 和 ${b} 的最大公约数是？`, answer: `gcd(${a},${b}) = ${gcd(a,b)}`, hint: '辗转相除法', hasOptions: true,
                            options: `A. ${gcd(a,b)}\nB. ${gcd(a,b)+1}\nC. ${gcd(a,b)-1 > 0 ? gcd(a,b)-1 : 1}\nD. ${a}` };
                    }
                ];
                return topics[rand(0, topics.length - 1)]();
            }

            if (t === '填空题') {
                const topics = [
                    () => {
                        const a = rand(10, 99), b = rand(10, 99);
                        return { question: `${a} + ___ = ${a+b}`, answer: `${b}`, hint: '和减已知数', hasOptions: false };
                    },
                    () => {
                        const a = rand(2, 12), b = rand(2, 12);
                        return { question: `${a} × ${b} = ___`, answer: `${a*b}`, hint: '乘法口诀', hasOptions: false };
                    },
                    () => {
                        const a = rand(1, 20), b = rand(1, 20);
                        return { question: `若 x + ${a} = ${a+b}，则 x = ___`, answer: `${b}`, hint: '移项', hasOptions: false };
                    }
                ];
                return topics[rand(0, topics.length - 1)]();
            }

            // 解答题
            const topics = [
                () => {
                    const a = rand(5, 30), b = rand(5, 30), c = rand(2, 5);
                    return { question: `小明有 ${a} 个苹果，小红有 ${b} 个。他们一共有多少个？平均分给 ${c} 人，每人几个？`,
                        answer: `一共：${a} + ${b} = ${a+b} 个\n每人：${a+b} ÷ ${c} = ${Math.floor((a+b)/c)} 余 ${(a+b)%c} 个`, hint: '先求和，再分配', hasOptions: false };
                },
                () => {
                    const price = rand(5, 20), count = rand(3, 10), money = rand(50, 200);
                    const total = price * count;
                    return { question: `一支笔 ${price} 元，买了 ${count} 支，付了 ${money} 元，应找回多少？`,
                        answer: `${price} × ${count} = ${total} 元\n${money} - ${total} = ${money - total} 元`, hint: '先算总价', hasOptions: false };
                },
                () => {
                    const speed = rand(30, 80), time = rand(2, 6);
                    return { question: `汽车以每小时 ${speed} 千米的速度行驶了 ${time} 小时，行驶了多少千米？`,
                        answer: `${speed} × ${time} = ${speed*time} 千米`, hint: '路程 = 速度 × 时间', hasOptions: false };
                }
            ];
            return topics[rand(0, topics.length - 1)]();
        }

        function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

        // ========== 回答检测与验证系统 ==========
        // 当用户输入很短（<20字符）且上下文中有上一道题时，判断这是对上一题的回答

        // 从上下文中获取最后一个AI出的问题/题目
        function getLastQuestion() {
            for (let i = studentContext.length - 1; i >= 0; i--) {
                if (studentContext[i].role === 'ai') {
                    return studentContext[i].text;
                }
            }
            return null;
        }

        function getLastUserMessage() {
            for (let i = studentContext.length - 1; i >= 0; i--) {
                if (studentContext[i].role === 'user') {
                    return studentContext[i].text;
                }
            }
            return null;
        }

        // 判断上一条AI消息是否包含一道题目（判断题/选择题/问答题）
        function isQuestionContext(aiText) {
            if (!aiText) return null;
            const t = aiText.toLowerCase();

            // 判断题关键词（更严格：必须包含明确的判断题格式）
            if (/判断题|判断[:：]|\?\s*对还是错|对还是错\?|，对吗\?|，正确吗\?/.test(t)) {
                return 'judgment';
            }
            // 选择题关键词（必须有至少3个选项）
            if (/[A-D][.．、]\s*.+?[A-D][.．、]\s*.+?[A-D][.．、]\s*.+?[A-D][.．、]/.test(aiText)) {
                return 'choice';
            }
            // 问答题关键词（更严格：必须是明确的出题格式）
            if (/📝.*题|✏️.*题|【题|题目[：:]/.test(t) ||
                /请回答|请计算|请求解|请判断|请选择|请填写/.test(t) ||
                /\?\s*\n.*[A-D][.．、]/.test(t)) {
                return 'qa';
            }
            return null;
        }

        // 从AI出题文本中提取题目核心内容
        function extractQuestionFromAI(aiText) {
            if (!aiText) return null;
            // 去掉格式标记，提取核心题目
            let core = aiText.replace(/[📝📋✅❌💡📐🧪🔬🎵🎨🏃‍♂️💻✨📌🎯📊🔍📖⭐🌟🔔💬📢]/g, '').trim();
            // 提取第一个问号/句号之前的内容作为题目
            const qMatch = core.match(/(?:\*\*[^*]+\*\*\s*\n*\n*)?(.+?[\?？。])/);
            if (qMatch) return qMatch[1].trim();
            // 如果没有问号，提取"题干"或"陈述"后的内容
            const stemMatch = core.match(/(?:题干|陈述|问题)[：:]\s*(.+)/);
            if (stemMatch) return stemMatch[1].trim();
            return core.substring(0, 200).trim();
        }

        // 从AI选择题文本中提取选项和正确答案
        function extractChoiceInfo(aiText) {
            const options = [];
            const optMatches = aiText.matchAll(/([A-D])[.．、]\s*([^\nA-D]+)/g);
            for (const m of optMatches) {
                options.push({ label: m[1], text: m[2].trim() });
            }
            // 提取正确答案
            let correctAnswer = null;
            const ansMatch = aiText.match(/正确答案[：:]\s*([A-D])/i);
            if (ansMatch) correctAnswer = ansMatch[1].toUpperCase();
            // 也检查"答案：X"格式
            if (!correctAnswer) {
                const ansMatch2 = aiText.match(/答案[：:]\s*([A-D])/i);
                if (ansMatch2) correctAnswer = ansMatch2[1].toUpperCase();
            }
            return { options, correctAnswer };
        }

        // 内置常见判断题知识库
        const answerJudgmentKnowledge = {
            '地球是太阳系的中心': { correct: false, explain: '太阳才是太阳系的中心，地球是围绕太阳运行的行星。' },
            '光年是时间单位': { correct: false, explain: '光年是距离单位，指光在真空中行进一年的距离，约9.46万亿千米。' },
            '水的化学式是h2o': { correct: true, explain: '水由2个氢原子和1个氧原子组成，化学式为H₂O。' },
            '水的化学式是h\u2082o': { correct: true, explain: '水由2个氢原子和1个氧原子组成，化学式为H₂O。' },
            '1+1=2': { correct: true, explain: '1加1等于2，这是最基本的加法运算。' },
            '1+1=3': { correct: false, explain: '1加1等于2，不等于3。' },
            '地球是平的': { correct: false, explain: '地球是一个近似球体的行星，不是平的。' },
            '太阳围绕地球转': { correct: false, explain: '地球围绕太阳转，不是太阳围绕地球转。' },
            '声音可以在真空中传播': { correct: false, explain: '声音传播需要介质，真空中没有介质，声音无法传播。' },
            '光可以在真空中传播': { correct: true, explain: '光是电磁波，不需要介质，可以在真空中传播。' },
            '所有偶数都是合数': { correct: false, explain: '2是偶数，但2是质数（只有1和2两个因数），不是合数。' },
            'dna是双螺旋结构': { correct: true, explain: 'DNA分子由两条反向平行的脱氧核苷酸链盘旋成双螺旋结构。' },
            '光合作用需要阳光': { correct: true, explain: '光合作用是植物利用光能将二氧化碳和水转化为有机物和氧气的过程。' },
            'html是一种编程语言': { correct: false, explain: 'HTML是标记语言，不是编程语言，它没有逻辑控制能力。' },
            '钢琴有88个键': { correct: true, explain: '标准钢琴有88个键，包括52个白键和36个黑键。' },
            '三原色是红黄蓝': { correct: true, explain: '美术颜料的三原色是红、黄、蓝。' },
            '勾股定理是a²+b²=c²': { correct: true, explain: '勾股定理（毕达哥拉斯定理）指出：在直角三角形中，两条直角边的平方和等于斜边的平方，即a²+b²=c²。' },
            '勾股定理是a2+b2=c2': { correct: true, explain: '勾股定理（毕达哥拉斯定理）指出：在直角三角形中，两条直角边的平方和等于斜边的平方，即a²+b²=c²。' },
            '氢气的化学式是h2': { correct: true, explain: '氢气的化学式确实是H₂，由2个氢原子组成。' },
            '氢气的化学式是h₂': { correct: true, explain: '氢气的化学式确实是H₂，由2个氢原子组成。' },
            '三原色是红黄绿': { correct: false, explain: '美术颜料的三原色是红、黄、蓝，红绿蓝是光的三原色。' },
            '植物细胞没有细胞壁': { correct: false, explain: '植物细胞有细胞壁（主要成分为纤维素），动物细胞没有细胞壁。' },
            '李白是宋代诗人': { correct: false, explain: '李白是唐代诗人，被称为"诗仙"。' },
            'ctrl+c是复制': { correct: true, explain: 'Ctrl+C是Windows系统中复制的快捷键。' },
            'ctrl+v是复制': { correct: false, explain: 'Ctrl+V是粘贴，Ctrl+C才是复制。' },
            '0.999...=1': { correct: true, explain: '0.999...（无限循环）等于1，可以用极限证明。' },
            '负数没有平方根': { correct: false, explain: '在实数范围内负数没有平方根，但在复数范围内有。' },
            'ph=7的溶液是中性': { correct: true, explain: '在常温下，pH=7的溶液呈中性。' },
            'python是编译型语言': { correct: false, explain: 'Python是解释型语言，代码由解释器逐行执行。' },
            '运动前不需要热身': { correct: false, explain: '运动前热身非常重要，可以有效降低运动损伤风险。' },
            '剧烈运动后应该马上坐下休息': { correct: false, explain: '剧烈运动后应进行慢走等整理活动，不应马上坐下。' },
            '游泳前应该做热身': { correct: true, explain: '游泳前热身可以预防抽筋和肌肉拉伤。' },
            '计算机病毒是生物病毒': { correct: false, explain: '计算机病毒是人为编写的恶意程序代码，不是生物病毒。' },
            'css是编程语言': { correct: false, explain: 'CSS是样式语言，用于描述网页的外观和格式，不是编程语言。' },
            '吉他是一种弦乐器': { correct: true, explain: '吉他通过拨动琴弦振动发声，属于弦乐器。' },
        };

        // 内置常见问答题知识库
        const answerQAKnowledge = {
            '中国的首都是哪里': { answers: ['北京', '北京市'], explain: '中华人民共和国的首都是北京。' },
            '中国最长的河流': { answers: ['长江', '长江'], explain: '长江是中国最长的河流，全长约6300千米，也是亚洲第一长河、世界第三长河。' },
            '世界最高峰': { answers: ['珠穆朗玛峰', '珠峰'], explain: '世界最高峰是珠穆朗玛峰，海拔8848.86米，位于中国和尼泊尔边境。' },
            '太阳系最大的行星': { answers: ['木星'], explain: '太阳系中最大的行星是木星，它的体积是地球的1300多倍。' },
            '水的化学式': { answers: ['H2O', 'h2o', 'H\u2082O'], explain: '水的化学式是H₂O，由2个氢原子和1个氧原子组成。' },
            '氢气的化学式': { answers: ['H2', 'h2'], explain: '氢气的化学式是H₂，由2个氢原子组成，是最简单的双原子分子。' },
            '氧气的化学式': { answers: ['O2', 'o2'], explain: '氧气的化学式是O₂，由2个氧原子组成。' },
            '二氧化碳的化学式': { answers: ['CO2', 'co2'], explain: '二氧化碳的化学式是CO₂，由1个碳原子和2个氧原子组成。' },
            '光速是多少': { answers: ['3×10⁸', '3e8', '300000000', '30万千米', '30万公里'], explain: '光在真空中的速度约为3×10⁸ m/s（即每秒约30万千米）。' },
            '圆周率是多少': { answers: ['3.14', '3.14159', '3.1415926', 'π'], explain: '圆周率π约等于3.1415926...，是一个无限不循环小数。' },
            '地球自转一周': { answers: ['24小时', '一天', '1天', '约24小时'], explain: '地球自转一周约需24小时（一天），产生了昼夜交替现象。' },
            '地球公转一周': { answers: ['365天', '一年', '1年', '约365天', '365.25天'], explain: '地球公转一周约需365.25天（一年），产生了四季变化。' },
            '人体最大的器官': { answers: ['皮肤'], explain: '人体最大的器官是皮肤，成人皮肤面积约1.5-2平方米。' },
            '铁的化学符号': { answers: ['Fe', 'fe'], explain: '铁的化学符号是Fe，来自拉丁文"Ferrum"。' },
            '金的化学符号': { answers: ['Au', 'au'], explain: '金的化学符号是Au，来自拉丁文"Aurum"。' },
            '氧气的化学式': { answers: ['O2', 'o2'], explain: '氧气的化学式是O₂，由两个氧原子组成。' },
        };

        // 验证用户对判断题的回答
        function validateJudgmentAnswer(aiText, userAnswer) {
            const ans = userAnswer.trim().toLowerCase();
            // 判断用户的回答是"对"还是"错"
            const isAffirmative = /^(对|正确|是的|没错|对的|true|正确|✓|✔|是)$/i.test(ans) ||
                                   /^(对|正确|是的|没错|对的|true)/.test(ans);
            const isNegative = /^(错|错误|不对|不是|不正确|false|错|✗|✘|否)$/i.test(ans) ||
                                /^(错|错误|不对|不是|不正确|false)/.test(ans);

            if (!isAffirmative && !isNegative) return null; // 无法判断用户意图

            // 从AI文本中提取判断题的陈述
            const statement = extractQuestionFromAI(aiText);
            if (!statement) return null;

            // 在知识库中查找
            const stmtNorm = statement.toLowerCase().replace(/[\s?？。!！,，""'']/g, '');
            for (const [key, fact] of Object.entries(answerJudgmentKnowledge)) {
                const keyNorm = key.toLowerCase().replace(/[\s?？。!！,，""'']/g, '');
                if (stmtNorm.includes(keyNorm) || keyNorm.includes(stmtNorm)) {
                    const userSaysCorrect = isAffirmative;
                    if (userSaysCorrect === fact.correct) {
                        return `✅ **回答正确！**\n\n"${statement}"确实是**${fact.correct ? '正确' : '错误'}**的。\n\n📖 **解析**：${fact.explain}`;
                    } else {
                        return `❌ **回答不对哦！**\n\n"${statement}"实际上是**${fact.correct ? '正确' : '错误'}**的。\n\n📖 **解析**：${fact.explain}`;
                    }
                }
            }

            // 如果知识库中没有匹配，尝试通用判断
            // 如果AI文本中已经包含了"正确"或"错误"的答案信息
            const aiCorrectMatch = aiText.match(/答案[：:]\s*(✅\s*正确|❌\s*错误|正确|错误)/);
            if (aiCorrectMatch) {
                const aiSaysCorrect = aiCorrectMatch[1].includes('正确') && !aiCorrectMatch[1].includes('错误');
                const userSaysCorrect = isAffirmative;
                if (userSaysCorrect === aiSaysCorrect) {
                    return `✅ **回答正确！**\n\n"${statement}"确实是**${aiSaysCorrect ? '正确' : '错误'}**的。`;
                } else {
                    return `❌ **回答不对哦！**\n\n"${statement}"实际上是**${aiSaysCorrect ? '正确' : '错误'}**的。`;
                }
            }

            // 无法验证时给出提示
            return `📝 你回答了"${userAnswer.trim()}"。\n\n这道判断题"${statement}"，我暂时无法自动验证你的答案。建议你查看上方的详细解析来确认。`;
        }

        // 验证用户对选择题的回答
        function validateChoiceAnswer(aiText, userAnswer) {
            const ans = userAnswer.trim().toUpperCase();
            // 提取用户选择的选项字母
            let userChoice = null;
            if (/^[A-D]$/.test(ans)) {
                userChoice = ans;
            } else if (/[A-D]/.test(ans)) {
                const m = ans.match(/([A-D])/);
                if (m) userChoice = m[1];
            }
            if (!userChoice) return null;

            // 从AI文本中提取正确答案
            const choiceInfo = extractChoiceInfo(aiText);
            if (!choiceInfo || !choiceInfo.correctAnswer) return null;

            if (userChoice === choiceInfo.correctAnswer) {
                // 提取解析
                let explain = '';
                const explainMatch = aiText.match(/解析[：:]\s*(.+)/);
                if (explainMatch) explain = explainMatch[1].trim();
                return `✅ **回答正确！**\n\n你选了 **${userChoice}**，这正是正确答案！${explain ? '\n\n📖 **解析**：' + explain : ''}`;
            } else {
                let explain = '';
                const explainMatch = aiText.match(/解析[：:]\s*(.+)/);
                if (explainMatch) explain = explainMatch[1].trim();
                // 找到用户选的选项内容
                const userOpt = choiceInfo.options.find(o => o.label === userChoice);
                const correctOpt = choiceInfo.options.find(o => o.label === choiceInfo.correctAnswer);
                return `❌ **回答不对哦！**\n\n你选了 **${userChoice}${userOpt ? '（' + userOpt.text.substring(0, 30) + '）' : ''}**，正确答案应该是 **${choiceInfo.correctAnswer}${correctOpt ? '（' + correctOpt.text.substring(0, 30) + '）' : ''}**。${explain ? '\n\n📖 **解析**：' + explain : ''}`;
            }
        }

        // 验证用户对问答题的回答
        function validateQAAnswer(aiText, userAnswer) {
            const ans = userAnswer.trim();
            const question = extractQuestionFromAI(aiText);
            if (!question) return null;

            // 1. 数学计算题：尝试从问题文本中提取数学表达式并计算
            // 支持格式：3×4=?、3乘4等于多少、3+4=?、3加4等于多少
            const cnOpMap = {'加':'+','减':'-','乘':'*','除':'/','加上':'+','减去':'-','乘以':'*','除以':'/'};
            let mathMatch = aiText.match(/(\d+(?:\.\d+)?)\s*[+\-×*÷/]\s*(\d+(?:\.\d+)?)\s*[=＝]\s*\?/);
            if (!mathMatch) {
                // 尝试中文运算符
                const cnMatch = aiText.match(/(\d+(?:\.\d+)?)\s*(加|减|乘|除|加上|减去|乘以|除以)\s*(\d+(?:\.\d+)?)\s*(等于|等于多少|=)/);
                if (cnMatch) {
                    const a = parseFloat(cnMatch[1]);
                    const cnOp = cnOpMap[cnMatch[2]] || '*';
                    const b = parseFloat(cnMatch[3]);
                    let correctResult;
                    switch(cnOp) {
                        case '+': correctResult = a + b; break;
                        case '-': correctResult = a - b; break;
                        case '*': correctResult = a * b; break;
                        case '/': correctResult = b !== 0 ? a / b : null; break;
                    }
                    if (correctResult !== null && Number.isFinite(correctResult)) {
                        const userNum = parseFloat(ans);
                        if (!isNaN(userNum)) {
                            if (Math.abs(userNum - correctResult) < 0.001) {
                                return `✅ **回答正确！**\n\n${a} ${cnMatch[2]} ${b} = **${correctResult}**\n\n你的计算完全正确！`;
                            } else {
                                return `❌ **回答不对哦！**\n\n${a} ${cnMatch[2]} ${b} = **${correctResult}**，不是 ${userNum}。\n\n再算算看？`;
                            }
                        }
                    }
                }
            }
            if (mathMatch) {
                const a = parseFloat(mathMatch[1]);
                const b = parseFloat(mathMatch[2]);
                const opMatch = aiText.match(/(\d+(?:\.\d+)?)\s*([+\-×*÷/])\s*(\d+(?:\.\d+)?)/);
                if (opMatch) {
                    const op = opMatch[2];
                    let correctResult;
                    switch(op) {
                        case '+': correctResult = a + b; break;
                        case '-': correctResult = a - b; break;
                        case '*': case '×': correctResult = a * b; break;
                        case '/': case '÷': correctResult = b !== 0 ? a / b : null; break;
                    }
                    if (correctResult !== null && Number.isFinite(correctResult)) {
                        const userNum = parseFloat(ans);
                        if (!isNaN(userNum)) {
                            if (Math.abs(userNum - correctResult) < 0.001) {
                                return `✅ **回答正确！**\n\n${a} ${op} ${b} = **${correctResult}**\n\n你的计算完全正确！`;
                            } else {
                                return `❌ **回答不对哦！**\n\n${a} ${op} ${b} = **${correctResult}**，不是 ${userNum}。\n\n再算算看？`;
                            }
                        }
                    }
                }
            }

            // 2. 从AI文本中提取"答案：XXX"并比较
            const aiAnswerMatch = aiText.match(/答案[：:]\s*(.+)/);
            if (aiAnswerMatch) {
                const aiAnswer = aiAnswerMatch[1].trim();
                // 比较数值答案
                const aiNum = parseFloat(aiAnswer.replace(/[^\d.\-]/g, ''));
                const userNum = parseFloat(ans.replace(/[^\d.\-]/g, ''));
                if (!isNaN(aiNum) && !isNaN(userNum)) {
                    if (Math.abs(aiNum - userNum) < 0.01) {
                        return `✅ **回答正确！**\n\n答案是 **${aiAnswer}**，你答对了！`;
                    } else {
                        return `❌ **回答不对哦！**\n\n正确答案是 **${aiAnswer}**，你答的是 ${ans}。\n\n再想想看？`;
                    }
                }
                // 比较文本答案（模糊匹配）
                const aiAnsNorm = aiAnswer.toLowerCase().replace(/[\s,，。.]/g, '');
                const userAnsNorm = ans.toLowerCase().replace(/[\s,，。.]/g, '');
                if (aiAnsNorm.includes(userAnsNorm) || userAnsNorm.includes(aiAnsNorm)) {
                    return `✅ **回答正确！**\n\n答案是 **${aiAnswer}**，你答对了！`;
                }
            }

            // 3. 在内置问答题知识库中查找
            const qNorm = question.toLowerCase().replace(/[\s?？。!！,，""'']/g, '');
            for (const [key, fact] of Object.entries(answerQAKnowledge)) {
                const keyNorm = key.toLowerCase().replace(/[\s?？。!！,，""'']/g, '');
                if (qNorm.includes(keyNorm) || keyNorm.includes(qNorm)) {
                    const ansNorm = ans.toLowerCase().replace(/[\s,，。.]/g, '');
                    for (const correctAns of fact.answers) {
                        const correctNorm = correctAns.toLowerCase().replace(/[\s,，。.]/g, '');
                        if (ansNorm === correctNorm || ansNorm.includes(correctNorm) || correctNorm.includes(ansNorm)) {
                            return `✅ **回答正确！**\n\n${key}的答案是 **${correctAns}**。\n\n📖 **解析**：${fact.explain}`;
                        }
                    }
                    return `❌ **回答不对哦！**\n\n${key}的正确答案是 **${fact.answers[0]}**。\n\n📖 **解析**：${fact.explain}`;
                }
            }

            // 4. 如果AI文本中有"提示"信息，用提示来引导
            const hintMatch = aiText.match(/提示[：:]\s*(.+)/);
            if (hintMatch) {
                return `📝 你回答了"${ans}"。\n\n💡 **提示**：${hintMatch[1].trim()}\n\n你可以根据提示再想想，或者告诉我你的解题思路，我来帮你分析。`;
            }

            return `📝 你回答了"${ans}"。\n\n这道题"${question.substring(0, 50)}"，我暂时无法自动验证你的答案。你可以查看上方的解析来确认是否正确。`;
        }

        // 主回答检测函数
        function detectAndValidateAnswer(question) {
            const cleanQ = question || '';
            const trimmed = cleanQ.trim();

            // 只对短回答（<25字符）触发检测
            if (trimmed.length > 25) return null;

            // 排除日常对话（这些永远不应该被当作回答检测）
            if (/^(你好|嗨|hi|hello|hey|谢谢|感谢|thanks|thank you|再见|拜拜|bye|晚安|早安|你是谁|你叫什么|好的|嗯|哦|啊|哈哈|呵呵|嘻嘻|不错|厉害|棒|加油|继续|再来一道|下一题|换一道|不会|不懂|不知道|太难了|太简单了|什么意思|为什么|怎么做|怎么办|教教我|帮帮我|记一下|提醒我|备忘|好的吧|行|可以|没问题|明白了|懂了|原来如此|这样啊|对啊|是的|没错|不是|不对|错了|好的好的|嗯嗯|哦哦|哈哈|666|牛|太强了|太厉害了|厉害了|牛啊|nb|牛批|6666|确实|好像|似乎|也许|可能|大概|应该|我想|我觉得|我认为|我以为|开始|开始游戏|退出|结束|提示|跳过|下一轮|下一关|重新开始|再来一次|再来|重玩|再玩一次|导入知识点|开始复习|展开|收起|创建卡片|复习卡片|导入|全部导入|从聊天导入)$/.test(trimmed)) {
                return null;
            }

            // 获取上一条用户消息和AI消息
            const lastUser = getLastUserMessage();
            const lastAI = getLastQuestion();

            // 策略1：检查上一条用户消息是否是问题格式
            // 如果用户之前问了判断题/选择题/问答题，现在给短回答，则视为对该题的回答
            if (lastUser) {
                const userQType = isUserQuestionFormat(lastUser);
                if (userQType) {
                    if (userQType === 'judgment') return validateJudgmentAnswer(lastUser, trimmed);
                    if (userQType === 'choice') return validateChoiceAnswer(lastUser, trimmed);
                    if (userQType === 'qa') return validateQAAnswer(lastUser, trimmed);
                }
            }

            // 策略2：检查上一条AI消息是否是出题格式
            if (lastAI) {
                const qType = isQuestionContext(lastAI);
                if (!qType) return null;
                if (qType === 'judgment') return validateJudgmentAnswer(lastAI, trimmed);
                if (qType === 'choice') return validateChoiceAnswer(lastAI, trimmed);
                if (qType === 'qa') return validateQAAnswer(lastAI, trimmed);
            }

            return null;
        }

        // 判断用户消息是否是问题格式（用于回答检测）
        function isUserQuestionFormat(userText) {
            if (!userText) return null;
            const t = userText.toLowerCase();

            // 判断题：包含"对还是错"、"对吗"、"正确吗"等
            if (/对还是错|对吗|正确吗|对不对|这句话对吗|对不对呢|是不是|吗[？?]$/.test(t)) {
                return 'judgment';
            }
            // 选择题：包含A/B/C/D选项
            if (/[A-D][.．、]\s*.+?[A-D][.．、]\s*.+?[A-D][.．、]/.test(userText)) {
                return 'choice';
            }
            // 问答题：包含"是什么"、"多少"、"哪个"、"哪条"等
            if (/是什么|是多少|等于多少|多少|哪个|哪条|谁.*发现|谁.*发明|化学式|化学名称|首都是|最长的|最高的|最大的/.test(t)) {
                return 'qa';
            }
            return null;
        }

        // ========== 10. 主应答函数 ==========
        function generateStudentResponse(question, subjectName, hasImage) {
            const cleanQ = question || '';
            const q = cleanQ.toLowerCase();
            const subject = subjectName || '';

            // ========== 回答检测（最高优先级，在图片处理和日常对话之前） ==========
            const answerResult = detectAndValidateAnswer(cleanQ);
            if (answerResult) {
                addToContext('user', cleanQ, subject);
                addToContext('ai', answerResult, subject || '回答验证');
                return answerResult;
            }

            // ========== 学段检测 ==========
            const levelKeywords = {
                kindergarten: /幼儿园/,
                primary: /小学[一二三四五六]?年级|小学/,
                junior: /初[一二三四]?|初中|七年级|八年级|九年级/,
                senior: /高[一二三]?|高中|高一|高二|高三/,
                vocational: /职高|职业高中|中职/,
                university: /大学|大专|本科|研究生|硕士|博士/
            };
            let detectedLevel = null;
            if (state.schoolLevel && state.schoolLevel !== 'auto') {
                detectedLevel = state.schoolLevel;
            } else {
                for (const [level, regex] of Object.entries(levelKeywords)) {
                    if (regex.test(cleanQ)) {
                        detectedLevel = level;
                        break;
                    }
                }
            }
            const levelNames = { kindergarten: '幼儿园', primary: '小学', junior: '初中', senior: '高中', vocational: '职高', university: '大学' };

            // 构建上下文对象
            const context = {
                level: detectedLevel,
                levelName: detectedLevel ? levelNames[detectedLevel] : null,
                question: cleanQ,
                subject: subject
            };

            // 记录上下文
            addToContext('user', cleanQ, subject);

            // ========== 图片问答处理（最高优先级） ==========
            if (hasImage) {
                const imgResult = handleImageQA(cleanQ, subject);
                if (imgResult) {
                    addToContext('ai', imgResult, subject || '图片问答');
                    return imgResult;
                }
            }

            // ========== 日常对话检测（优先于学科检测） ==========
            const dailyReply = handleDailyConversation(cleanQ);
            if (dailyReply) {
                addToContext('ai', dailyReply, subject || '');
                return dailyReply;
            }

            // ========== 翻译请求检测（优先于学科分发） ==========
            if (/翻译\s*[:：]?\s*[\s\S]|怎么?翻译|的英文是?什么|的中文是?什么|英译汉|汉译英|translate/i.test(cleanQ)) {
                // 优先尝试提取引号内的内容（处理"请把...翻译成英文"等模式）
                const quotedTransMatch = cleanQ.match(/[""「]([^""」]+)[""」]\s*翻译/);
                let transText = null;
                if (quotedTransMatch) {
                    transText = quotedTransMatch[1].trim();
                }
                if (!transText) {
                    // 尝试 "把XXX翻译" 模式（无引号）
                    const baTransMatch = cleanQ.match(/把\s*(.+?)\s*翻译/);
                    if (baTransMatch) {
                        transText = baTransMatch[1].trim();
                    }
                }
                if (transText) {
                    const isChinese = /[\u4e00-\u9fa5]/.test(transText);
                    let trans;
                    if (isChinese) {
                        trans = typeof getEnglishTranslation === 'function' ? getEnglishTranslation(transText) : null;
                        if (trans) {
                            addToContext('ai', `「${transText}」的英文翻译：${trans}`, '英语');
                            return `「${transText}」的英文翻译：${trans}`;
                        }
                    } else {
                        trans = typeof getChineseTranslation === 'function' ? getChineseTranslation(transText) : null;
                        if (trans) {
                            addToContext('ai', `「${transText}」的中文翻译：${trans}`, '英语');
                            return `「${transText}」的中文翻译：${trans}`;
                        }
                    }
                    if (!trans) {
                        addToContext('ai', `「${transText}」\n\n建议：这个词/句暂无本地翻译，可以开启联网搜索获取更准确的翻译。`, '英语');
                        return `「${transText}」\n\n建议：这个词/句暂无本地翻译，可以开启联网搜索获取更准确的翻译。`;
                    }
                }
                // 回退到原有模式匹配
                const transPatterns = [
                    /翻译\s*[:：]?\s*([\s\S]+)/,
                    /英译汉\s*[:：]?\s*([\s\S]+)/,
                    /汉译英\s*[:：]?\s*([\s\S]+)/,
                    /translate\s*[:：]?\s*([\s\S]+)/i,
                    /(.+)\s*怎么?翻译/i,
                    /(.+)\s*的英文是?什么/,
                    /(.+)\s*的中文是?什么/,
                ];
                for (const pattern of transPatterns) {
                    const m = cleanQ.match(pattern);
                    if (m && m[1]) {
                        const text = m[1].trim();
                        const isChinese = /[\u4e00-\u9fa5]/.test(text);
                        let trans;
                        if (isChinese) {
                            trans = typeof getEnglishTranslation === 'function' ? getEnglishTranslation(text) : null;
                            if (trans) {
                                addToContext('ai', `「${text}」的英文翻译：${trans}`, '英语');
                                return `「${text}」的英文翻译：${trans}`;
                            }
                        } else {
                            trans = typeof getChineseTranslation === 'function' ? getChineseTranslation(text) : null;
                            // 英文名言/常用语句本地翻译映射
                            if (!trans) {
                                const famousQuotes = {
                                    'knowledge is power': '知识就是力量',
                                    'time is money': '时间就是金钱',
                                    'practice makes perfect': '熟能生巧',
                                    'where there is a will there is a way': '有志者事竟成',
                                    'a friend in need is a friend indeed': '患难见真情',
                                    'actions speak louder than words': '行动胜于言辞',
                                    'all roads lead to rome': '条条大路通罗马',
                                    'an apple a day keeps the doctor away': '一天一苹果，医生远离我',
                                    'better late than never': '迟做总比不做好',
                                    'honesty is the best policy': '诚实为上策',
                                    "it's never too late to learn": '活到老学到老',
                                    'look before you leap': '三思而后行',
                                    'no pain no gain': '不劳无获',
                                    'rome was not built in a day': '罗马不是一天建成的',
                                    'the early bird catches the worm': '早起的鸟儿有虫吃',
                                    'two heads are better than one': '三个臭皮匠顶个诸葛亮',
                                    'when in rome do as the romans do': '入乡随俗',
                                    "you can't have your cake and eat it too": '鱼与熊掌不可兼得',
                                    'every cloud has a silver lining': '黑暗中总有一线光明',
                                    'don\'t count your chickens before they hatch': '不要过早乐观',
                                    'i think therefore i am': '我思故我在',
                                    'to be or not to be that is the question': '生存还是毁灭，这是一个问题',
                                    'easier said than done': '说起来容易做起来难',
                                    'seeing is believing': '眼见为实',
                                };
                                trans = famousQuotes[text.toLowerCase()] || null;
                            }
                            if (trans) {
                                addToContext('ai', `「${text}」的中文翻译：${trans}`, '英语');
                                return `「${text}」的中文翻译：${trans}`;
                            }
                        }
                        if (!trans) {
                            addToContext('ai', `「${text}」\n\n建议：这个词/句暂无本地翻译，可以开启联网搜索获取更准确的翻译。`, '英语');
                            return `「${text}」\n\n建议：这个词/句暂无本地翻译，可以开启联网搜索获取更准确的翻译。`;
                        }
                    }
                }
            }

            // ========== 判断题检测 ==========
            // 1. 显式判断题前缀："判断：..." 或 "判断题：..."
            const judgmentMatch = cleanQ.match(/^(判断[:：]?\s*|判断题[:：]?\s*)(.+)/);
            if (judgmentMatch) {
                const statement = judgmentMatch[2].trim();
                return handleJudgmentQuestion(statement, subject);
            }
            // 2. 隐式判断题：陈述句+句号/问号，且包含可判断的事实陈述
            // 排除数学计算题和显式的代码生成请求（如"给我写一段HTML代码"）
            const isImplicitJudgment = /[。\.]$/.test(cleanQ) &&
                !/[=＝\+\-\*\/\×\÷\^\√\d].*[=＝]/.test(cleanQ) &&
                !/^(写|生成|创建|给我|请|帮我).*(代码|程序|网页|网站)/i.test(cleanQ) &&
                cleanQ.trim().length > 5 && cleanQ.trim().length < 50;
            if (isImplicitJudgment) {
                // 检查是否匹配已知的事实判断库
                const knownFacts = [
                    '所有偶数都是合数', '0.999... = 1', '负数没有平方根',
                    '声音可以在真空中传播', '声音在真空中可以传播', '光可以在真空中传播',
                    'ph=7的溶液是中性', 'dna是双螺旋结构', '水的化学式是h2o',
                    '地球是平的', '光合作用需要阳光',
                    'html是一种编程语言', 'python是编译型语言', 'javascript只能在浏览器中运行',
                    'do,re,mi,fa,sol,la,si是简谱', '钢琴有88个键', '节拍是音乐的速度',
                    '三原色是红黄绿', '三原色是红黄蓝', '素描只用铅笔',
                    '运动前不需要热身', '剧烈运动后应该马上坐下休息', '游泳前应该做热身',
                    'excel中sum函数是求平均', '计算机病毒是生物病毒', 'ctrl+c是复制',
                    'ctrl+v是复制', '李白是宋代诗人', 'ph等于7是酸性', 'css是编程语言',
                    '吉他是一种弦乐器', '游泳前应该热身', '"i am"的过去式是"i was"',
                    '植物细胞没有细胞壁', '素描可以用彩色铅笔'
                ];
                const qNorm = cleanQ.toLowerCase().replace(/[。\.\s,，""'']/g, '');
                const matchedFact = knownFacts.find(f => qNorm.includes(f.toLowerCase().replace(/[。\.\s,，""'']/g, '')));
                if (matchedFact) {
                    return handleJudgmentQuestion(cleanQ.replace(/[。\.]$/, '').trim(), subject);
                }
            }

            // ========== 选择题检测 ==========
            const choiceMatch = cleanQ.match(/(.+?)[A-Da-d][.．、]\s*.+?[A-Da-d][.．、]\s*.+/);
            if (choiceMatch && /[A-D][.．、]/.test(cleanQ) && /[B-D][.．、]/.test(cleanQ)) {
                return handleChoiceQuestion(cleanQ, subject);
            }

            // ========== 上下文感知：处理"结果是什么"、"答案是什么"等追问 ==========
            // 排除明确的学科知识问题（包含学科关键词的"为什么/什么是/怎么"问题应由学科处理器处理）
            const isExplicitKnowledgeQuestion = /化学式|化学方程式|光合作用|牛顿|合力|加速度|质量.*速度|速度.*质量|密度|浮力|压强|电流|电压|电阻|元素|原子|分子|离子|化合物|有机物|无机物|细胞|dna|基因|染色体|生态系统|食物链|进化|遗传|新陈代谢|激素|免疫|有丝分裂|减数分裂|双螺旋|沃森|克里克|孟德尔|达尔文|中心法则|转录|翻译.*生物|蛋白质合成/.test(cleanQ) ||
                /热身|拉伸|肌肉|骨骼|关节|心率|呼吸|耐力|速度|力量|柔韧|协调|体能|跑步|跳远|跳高|投掷|球类|足球|篮球|排球|乒乓球|羽毛球|网球|游泳|体操|武术|田径/.test(cleanQ) ||
                /编程|代码|程序|html|css|javascript|python|java|变量|函数|循环|数组|网页|前端|后端|算法/.test(cleanQ) ||
                /音符|节拍|节奏|旋律|和弦|音阶|五线谱|乐器|钢琴|吉他|小提琴|声乐|合唱|指挥|作曲|乐理/.test(cleanQ) ||
                /画画|绘画|色彩|素描|油画|国画|水彩|速写|构图|透视|明暗|线条|三原色|三间色|色相|明度|纯度/.test(cleanQ) ||
                /excel|word|ppt|office|wps|文档|表格|演示|幻灯片|快捷键|键盘|鼠标|文件|文件夹|网络|互联网|浏览器|ip|dns/.test(cleanQ) ||
                /方程|函数|几何|代数|微积分|数列|概率|排列组合|三角函数|对数|指数|根号|平方|立方|面积|体积|周长|直径|半径|圆周率|正弦|余弦|正切|不等式|导数|积分|极限|向量|矩阵|行列式|鸡兔同笼|行程问题|工程问题|利润|浓度|折扣|百分比|分数|小数|约分|通分|最大公约数|最小公倍数|质数|合数|奇数|偶数/.test(cleanQ);
            if (!isExplicitKnowledgeQuestion && /结果是什么|答案是什么|是什么|是多少|对不对|对吗/.test(cleanQ) && cleanQ.trim().length < 15) {
                const lastAI = studentContext.filter(c => c.role === 'ai').pop();
                if (lastAI) {
                    addToContext('ai', lastAI.text, subject);
                    return `💡 **回顾**\n\n${lastAI.text.substring(0, 200)}${lastAI.text.length > 200 ? '...' : ''}\n\n请根据上面的内容来回答哦！`;
                }
            }

            // ========== 上下文感知：处理"继续"、"下一个"、"再来一道" ==========
            if (/继续|下一个|再来一道|再来一次|再出一道/.test(cleanQ) && cleanQ.trim().length < 15) {
                const lastSubj = getLastSubject() || subject;
                if (lastSubj) {
                    // 生成下一道题
                    const targetSubject = lastSubj;
                    let difficulty = '中等';
                    if (targetSubject === '数学') {
                        const prob = generateMathProblem(difficulty, '解答题');
                        const response = `📝 ${targetSubject}${difficulty}解答题\n\n${prob.question}\n\n${prob.hasOptions ? prob.options + '\n' : ''}💡 提示：${prob.hint}\n\n${prob.answer ? '答案：' + prob.answer : ''}`;
                        addToContext('ai', response, targetSubject);
                        return response;
                    }
                    if (targetSubject === '语文') {
                        const chineseProblems = [
                            { question: '请默写李白的《静夜思》。', answer: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。', hint: '这首诗描写了诗人在寂静的月夜思念家乡的情感。' },
                            { question: '"春眠不觉晓，处处闻啼鸟"出自哪首诗？作者是谁？', answer: '出自《春晓》，作者是唐代诗人孟浩然。', hint: '山水田园诗派的代表诗人。' },
                            { question: '请补全诗句："两个黄鹂鸣翠柳，_______"。', answer: '一行白鹭上青天。', hint: '杜甫的《绝句》。' },
                            { question: '请默写王之涣的《登鹳雀楼》。', answer: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。', hint: '积极向上、不断进取的精神。' },
                            { question: '"但愿人长久，千里共婵娟"出自哪首词？作者是谁？', answer: '出自苏轼的《水调歌头·明月几时有》。', hint: '与中秋节有关。' },
                        ];
                        const rand = Math.floor(Math.random() * chineseProblems.length);
                        const prob = chineseProblems[rand];
                        const response = `📝 语文${difficulty}古诗题\n\n${prob.question}\n\n💡 提示：${prob.hint}\n\n答案：${prob.answer}`;
                        addToContext('ai', response, targetSubject);
                        return response;
                    }
                    const response = `📝 ${targetSubject}练习题\n\n请告诉我你想练习的具体知识点，我来为你生成题目。`;
                    addToContext('ai', response, targetSubject);
                    return response;
                }
            }

            // 出题请求
            if (q.includes('出题') || q.includes('来道题') || q.includes('练习题') || q.includes('给我题') || q.includes('测试题') || q.includes('出一道') || q.includes('出个') || q.includes('出几道') || q.includes('随机出')) {
                const targetSubject = subject || getLastSubject() || '数学';
                let difficulty = '中等';
                if (q.includes('简单') || q.includes('容易')) difficulty = '简单';
                else if (q.includes('困难') || q.includes('难')) difficulty = '困难';
                let qType = '解答题';
                if (q.includes('选择')) qType = '选择题';
                else if (q.includes('填空')) qType = '填空题';
                else if (q.includes('判断')) qType = '判断题';
                else if (q.includes('古诗') || q.includes('诗词') || q.includes('默写')) qType = '古诗题';

                if (targetSubject === '数学') {
                    const prob = generateMathProblem(difficulty, qType);
                    const response = `📝 ${targetSubject}${difficulty}${qType}\n\n${prob.question}\n\n${prob.hasOptions ? prob.options + '\n' : ''}💡 提示：${prob.hint}\n\n${prob.answer ? '答案：' + prob.answer : ''}`;
                    addToContext('ai', response, targetSubject);
                    return response;
                }

                if (targetSubject === '语文' || q.includes('古诗') || q.includes('诗词') || q.includes('语文')) {
                    const chineseProblems = [
                        {
                            question: '请默写李白的《静夜思》。',
                            answer: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
                            hint: '这首诗描写了诗人在寂静的月夜思念家乡的情感。想想"月光"和"故乡"的意象。'
                        },
                        {
                            question: '《望庐山瀑布》是谁写的？请默写后两句。',
                            answer: '作者：李白\n飞流直下三千尺，疑是银河落九天。',
                            hint: '作者是唐代"诗仙"，诗中用了夸张的修辞手法。'
                        },
                        {
                            question: '"春眠不觉晓，处处闻啼鸟"出自哪首诗？作者是谁？',
                            answer: '出自《春晓》，作者是唐代诗人孟浩然。',
                            hint: '这首诗描写了春天早晨的景色，诗人是山水田园诗派的代表。'
                        },
                        {
                            question: '请补全诗句："两个黄鹂鸣翠柳，_______"。',
                            answer: '一行白鹭上青天。',
                            hint: '这是杜甫的《绝句》，对仗工整，色彩鲜明。'
                        },
                        {
                            question: '"但愿人长久，千里共婵娟"出自哪首词？作者是谁？表达了什么情感？',
                            answer: '出自苏轼的《水调歌头·明月几时有》。表达了作者对弟弟苏辙的思念和美好祝愿。',
                            hint: '这是宋词中的名篇，与中秋节有关。'
                        },
                        {
                            question: '请默写王之涣的《登鹳雀楼》。',
                            answer: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。',
                            hint: '这首诗表达了积极向上、不断进取的精神。后两句是千古名句。'
                        },
                        {
                            question: '"锄禾日当午，汗滴禾下土"出自哪首诗？这首诗告诉我们什么道理？',
                            answer: '出自李绅的《悯农》。告诉我们粮食来之不易，要珍惜劳动成果，尊重农民的辛勤劳动。',
                            hint: '诗名与"同情农民"有关，全诗共四句。'
                        },
                        {
                            question: '请说出三个唐代诗人的名字，并各写一句他们的名句。',
                            answer: '示例：\n1. 李白 - "举头望明月，低头思故乡"\n2. 杜甫 - "会当凌绝顶，一览众山小"\n3. 白居易 - "野火烧不尽，春风吹又生"',
                            hint: '唐代是诗歌的黄金时代，有很多著名诗人。'
                        },
                        {
                            question: '"千山鸟飞绝，万径人踪灭"描写的是什么季节的景色？作者是谁？',
                            answer: '描写的是冬季（雪天）的景色。作者是唐代诗人柳宗元，出自《江雪》。',
                            hint: '诗中描绘了一幅孤独、寂静的雪景图。'
                        },
                        {
                            question: '请解释"落霞与孤鹜齐飞，秋水共长天一色"这句名句的出处和含义。',
                            answer: '出自王勃的《滕王阁序》。含义：落日的晚霞与孤独的野鸭一起飞翔，秋天的江水和辽阔的天空连成一片。描绘了滕王阁前壮丽的秋景。',
                            hint: '这是初唐四杰之一的作品，被誉为千古名句。'
                        },
                    ];
                    const rand = Math.floor(Math.random() * chineseProblems.length);
                    const prob = chineseProblems[rand];
                    const response = `📝 语文${difficulty}${qType}\n\n${prob.question}\n\n💡 提示：${prob.hint}\n\n答案：${prob.answer}`;
                    addToContext('ai', response, '语文');
                    return response;
                }

                if (targetSubject === '英语') {
                    const englishProblems = [
                        {
                            question: '请将下面的句子翻译成中文：\n\nKnowledge is power.',
                            answer: '知识就是力量。',
                            hint: '这是一句著名的英语谚语，由培根提出。'
                        },
                        {
                            question: '请用英语写出"我每天早上七点起床"。',
                            answer: 'I get up at seven o\'clock every morning.',
                            hint: '注意主语是I，动词用原形get up。'
                        },
                        {
                            question: '请选择正确的单词填空：\n\nShe ___ (go/goes) to school by bus every day.',
                            answer: 'goes（第三人称单数用goes）',
                            hint: '主语是she，第三人称单数，一般现在时动词要加s/es。'
                        },
                        {
                            question: '请写出 "beautiful" 的反义词。',
                            answer: 'ugly',
                            hint: 'beautiful意为"美丽的"，反义词意为"丑陋的"。'
                        },
                    ];
                    const rand = Math.floor(Math.random() * englishProblems.length);
                    const prob = englishProblems[rand];
                    const response = `📝 英语${difficulty}练习题\n\n${prob.question}\n\n💡 提示：${prob.hint}\n\n答案：${prob.answer}`;
                    addToContext('ai', response, '英语');
                    return response;
                }

                if (targetSubject === '物理') {
                    const physicsProblems = [
                        {
                            question: '一个物体质量为5kg，受到的合力为20N，求加速度。',
                            answer: 'a = F/m = 20/5 = 4 m/s²',
                            hint: '使用牛顿第二定律 F = ma'
                        },
                        {
                            question: '光在真空中的传播速度是多少？',
                            answer: '约3×10⁸ m/s（每秒约30万千米）',
                            hint: '光速是物理学中重要的常数。'
                        },
                    ];
                    const rand = Math.floor(Math.random() * physicsProblems.length);
                    const prob = physicsProblems[rand];
                    const response = `📝 物理${difficulty}练习题\n\n${prob.question}\n\n💡 提示：${prob.hint}\n\n答案：${prob.answer}`;
                    addToContext('ai', response, '物理');
                    return response;
                }

                if (targetSubject === '化学') {
                    const chemistryProblems = [
                        {
                            question: '水的化学式是什么？由哪些元素组成？',
                            answer: '水的化学式是H₂O，由氢元素和氧元素组成。',
                            hint: '每个水分子含有2个氢原子和1个氧原子。'
                        },
                        {
                            question: '铁的化学符号是什么？属于什么元素？',
                            answer: '铁的化学符号是Fe，属于金属元素。',
                            hint: '化学符号来自拉丁文名称。'
                        },
                    ];
                    const rand = Math.floor(Math.random() * chemistryProblems.length);
                    const prob = chemistryProblems[rand];
                    const response = `📝 化学${difficulty}练习题\n\n${prob.question}\n\n💡 提示：${prob.hint}\n\n答案：${prob.answer}`;
                    addToContext('ai', response, '化学');
                    return response;
                }

                const response = `📝 ${targetSubject}练习题\n\n请告诉我你想练习的具体知识点，我来为你生成题目。`;
                addToContext('ai', response, targetSubject);
                return response;
            }

            // ========== 科目ID映射 ==========
            const subjectIdMap = { '数学': 'math', '英语': 'english', '语文': 'chinese', '物理': 'physics', '化学': 'chemistry', '生物': 'biology', '历史': 'history', '政治': 'politics', '地理': 'geography', '编程': 'programming', '音乐': 'music', '美术': 'art', '体育': 'pe', '信息技术': 'it' };
            const detectedSubjectId = subject ? subjectIdMap[subject] : detectSubjectFromQuestion(cleanQ);

            // ========== 优先使用内置具体问题处理器（数学/语文/物理/化学/生物/英语计算题等） ==========
            // 数学优先检查（集合运算、组合数C(n,k)、直线方程等具体计算）
            if (detectedSubjectId === 'math' || subject === '数学' ||
                /[∩∪]|交集|并集|补集|集合.*[交并]|A\s*=\s*\{/.test(cleanQ) ||
                /C\s*\(\s*\d+\s*,\s*\d+\s*\)|组合数|计算.*C\s*\(/.test(cleanQ) ||
                /直线方程|垂直.*直线|平行.*直线/.test(cleanQ)) {
                const preMathRes = handleMath(cleanQ, cleanQ);
                if (preMathRes) { addToContext('ai', preMathRes, '数学'); return preMathRes; }
            }
            // 语文优先检查（炼字分析、诗词等）
            if (detectedSubjectId === 'chinese' || subject === '语文' ||
                /炼字|妙用|分析.*字|古诗|诗词|文言文|成语|修辞/.test(cleanQ)) {
                const preChineseRes = handleChinese(cleanQ, cleanQ);
                if (preChineseRes) { addToContext('ai', preChineseRes, '语文'); return preChineseRes; }
            }
            if (detectedSubjectId === 'english' || subject === '英语') {
                const preEngRes = handleEnglish(cleanQ, cleanQ);
                if (preEngRes) { addToContext('ai', preEngRes, '英语'); return preEngRes; }
            }
            if (detectedSubjectId === 'physics' || subject === '物理') {
                const prePhysicsRes = handlePhysicsQuestion(cleanQ);
                if (prePhysicsRes) { addToContext('ai', prePhysicsRes, '物理'); return prePhysicsRes; }
            }
            if (detectedSubjectId === 'chemistry' || subject === '化学' ||
                /元素周期表|周期表|周期律|化学式|化学方程式|化合价|化学反应|酸碱|氧化还原|物质的量|摩尔质量|化学名称/.test(cleanQ)) {
                const preChemRes = handleChemistryQuestion(cleanQ);
                if (preChemRes) { addToContext('ai', preChemRes, '化学'); return preChemRes; }
            }
            if (detectedSubjectId === 'biology' || subject === '生物') {
                const preBioRes = handleBiologyQuestion(cleanQ);
                if (preBioRes) { addToContext('ai', preBioRes, '生物'); return preBioRes; }
            }

            // ========== 尝试 SubjectModules 委托 ==========
            if (window.SubjectModules && detectedSubjectId && window.SubjectModules[detectedSubjectId]) {
                try {
                    const moduleResult = window.SubjectModules[detectedSubjectId].handle(cleanQ, cleanQ, context);
                    if (moduleResult) {
                        addToContext('ai', moduleResult, subject || detectedSubjectId);
                        return moduleResult;
                    }
                } catch (e) {
                    console.warn('SubjectModule [' + detectedSubjectId + '] 处理出错，回退到内置处理器:', e);
                }
            }

            // ========== 内置处理器回退 ==========
            // 按学科分发
            if (subject === '数学' || detectSubjectFromQuestion(cleanQ) === 'math') {
                const mathRes = handleMath(cleanQ, cleanQ);
                if (mathRes) {
                    addToContext('ai', mathRes, '数学');
                    return mathRes;
                }
                return '这是一个数学问题。请提供更具体的算式或题目内容，我可以帮你逐步解答。';
            }

            if (subject === '英语' || detectSubjectFromQuestion(cleanQ) === 'english') {
                const engRes = handleEnglish(cleanQ, cleanQ);
                if (engRes) {
                    addToContext('ai', engRes, '英语');
                    return engRes;
                }
                return '我可以帮你翻译、查单词、分析语法。请把具体内容发给我。';
            }

            if (subject === '语文' || detectSubjectFromQuestion(cleanQ) === 'chinese') {
                const cnRes = handleChinese(cleanQ, cleanQ);
                if (cnRes) {
                    addToContext('ai', cnRes, '语文');
                    return cnRes;
                }
                return '我可以帮你背诵古诗、翻译文言文、分析作文。请把具体内容发给我。';
            }

            // 检测学科（用于subject为空的情况）
            let detectedSubj = detectSubjectFromQuestion(cleanQ);
            // 补充检测：短关键词（如dna）可能得分不够，额外检查生物相关词汇
            if (!detectedSubj && /dna|rna|蛋白质|酶|细胞|基因|染色体|有丝分裂|减数分裂|双螺旋|沃森|克里克|孟德尔|达尔文|光合作用|呼吸作用|遗传|进化|生态系统|食物链|激素|免疫|生物/.test(cleanQ.toLowerCase())) {
                detectedSubj = 'biology';
            }
            const effectiveSubject = subject || (detectedSubj === 'physics' ? '物理' : detectedSubj === 'chemistry' ? '化学' : detectedSubj === 'biology' ? '生物' : '');

            if (effectiveSubject === '物理' || effectiveSubject === '化学' || effectiveSubject === '生物') {
                // 物理具体题目处理
                if (effectiveSubject === '物理') {
                    const physicsRes = handlePhysicsQuestion(cleanQ);
                    if (physicsRes) return physicsRes;
                }

                // 化学具体题目处理
                if (effectiveSubject === '化学') {
                    const chemistryRes = handleChemistryQuestion(cleanQ);
                    if (chemistryRes) return chemistryRes;
                }

                // 生物具体题目处理
                if (effectiveSubject === '生物') {
                    const biologyRes = handleBiologyQuestion(cleanQ);
                    if (biologyRes) return biologyRes;
                }

                const sciRes = handleScience(effectiveSubject, cleanQ, cleanQ);
                if (sciRes) {
                    addToContext('ai', sciRes, effectiveSubject);
                    return sciRes;
                }
                return `我可以帮你解答${effectiveSubject}问题。请把具体题目发给我，我会给出解题步骤。`;
            }

            if (subject === '历史' || subject === '政治') {
                const humRes = handleHumanities(subject, cleanQ, cleanQ);
                if (humRes) {
                    addToContext('ai', humRes, subject);
                    return humRes;
                }
                return `我可以帮你梳理${subject}知识。请把具体问题发给我。`;
            }

            if (subject === '地理' || detectSubjectFromQuestion(cleanQ) === 'geography') {
                const geoRes = handleGeography(cleanQ, cleanQ);
                if (geoRes) {
                    addToContext('ai', geoRes, '地理');
                    return geoRes;
                }
                return '我可以帮你解答地理问题。请把具体题目发给我，我会给出详细解答。';
            }

            if (subject === '法律咨询' || detectSubjectFromQuestion(cleanQ) === 'law') {
                const lawRes = handleLaw(cleanQ, cleanQ);
                addToContext('ai', lawRes, '法律咨询');
                return lawRes;
            }

            if (subject === '心理咨询' || detectSubjectFromQuestion(cleanQ) === 'mental') {
                const mentalRes = handleMental(cleanQ, cleanQ);
                addToContext('ai', mentalRes, '心理咨询');
                return mentalRes;
            }

            // 编程处理 - 如果当前科目是编程，或问题明显属于编程
            const detectedProg = detectSubjectFromQuestion(cleanQ) === 'programming';
            if (subject === '编程' || (!subject && detectedProg)) {
                const progRes = handleProgramming(cleanQ, cleanQ);
                if (progRes) {
                    addToContext('ai', progRes, '编程');
                    return progRes;
                }
                if (subject === '编程') return '我可以帮你了解编程基础知识，包括 HTML、CSS、JavaScript、Python 等。请把具体问题发给我。';
            }

            // 音乐处理 - 如果当前科目是音乐，或问题明显属于音乐
            const detectedMusic = detectSubjectFromQuestion(cleanQ) === 'music';
            if (subject === '音乐' || (!subject && detectedMusic)) {
                const musicRes = handleMusic(cleanQ, cleanQ);
                if (musicRes) {
                    addToContext('ai', musicRes, '音乐');
                    return musicRes;
                }
                if (subject === '音乐') return '我可以帮你了解音乐基础知识，包括节拍、音符、乐器、和弦等。请把具体问题发给我。';
            }

            // 美术处理 - 如果当前科目是美术，或问题明显属于美术
            const detectedArt = detectSubjectFromQuestion(cleanQ) === 'art';
            if (subject === '美术' || (!subject && detectedArt)) {
                const artRes = handleArt(cleanQ, cleanQ);
                if (artRes) {
                    addToContext('ai', artRes, '美术');
                    return artRes;
                }
                if (subject === '美术') return '我可以帮你了解美术基础知识，包括色彩理论、素描、透视、名画欣赏等。请把具体问题发给我。';
            }

            // 体育处理 - 如果当前科目是体育，或问题明显属于体育
            const detectedPE = detectSubjectFromQuestion(cleanQ) === 'pe';
            if (subject === '体育' || (!subject && detectedPE)) {
                const peRes = handlePE(cleanQ, cleanQ);
                if (peRes) {
                    addToContext('ai', peRes, '体育');
                    return peRes;
                }
                if (subject === '体育') return '我可以帮你了解体育基础知识，包括热身、田径、球类、游泳等。请把具体问题发给我。';
            }

            // 信息技术处理 - 如果当前科目是信息技术，或问题明显属于信息技术
            const detectedIT = detectSubjectFromQuestion(cleanQ) === 'it';
            if (subject === '信息技术' || (!subject && detectedIT)) {
                const itRes = handleIT(cleanQ, cleanQ);
                if (itRes) {
                    addToContext('ai', itRes, '信息技术');
                    return itRes;
                }
                if (subject === '信息技术') return '我可以帮你了解信息技术基础知识，包括Excel、Word、PPT、快捷键、网络等。请把具体问题发给我。';
            }

            // 如果当前科目不匹配问题内容，尝试所有新科目的处理函数
            if (subject) {
                const artRes = handleArt(cleanQ, cleanQ);
                if (artRes) { addToContext('ai', artRes, '美术'); return artRes; }
                const peRes = handlePE(cleanQ, cleanQ);
                if (peRes) { addToContext('ai', peRes, '体育'); return peRes; }
                const itRes = handleIT(cleanQ, cleanQ);
                if (itRes) { addToContext('ai', itRes, '信息技术'); return itRes; }
                const musicRes = handleMusic(cleanQ, cleanQ);
                if (musicRes) { addToContext('ai', musicRes, '音乐'); return musicRes; }
            }

            // 未选择科目时的通用处理
            if (!subject) {
                // 尝试数学
                const mathRes = handleMath(cleanQ, cleanQ);
                if (mathRes) return mathRes;
                // 尝试英语
                const engRes = handleEnglish(cleanQ, cleanQ);
                if (engRes) return engRes;
                // 尝试语文
                const cnRes = handleChinese(cleanQ, cleanQ);
                if (cnRes) return cnRes;
                // 尝试编程
                const progRes = handleProgramming(cleanQ, cleanQ);
                if (progRes) return progRes;
                // 尝试音乐
                const musicRes = handleMusic(cleanQ, cleanQ);
                if (musicRes) return musicRes;
                // 尝试美术
                const artRes = handleArt(cleanQ, cleanQ);
                if (artRes) return artRes;
                // 尝试体育
                const peRes = handlePE(cleanQ, cleanQ);
                if (peRes) return peRes;
                // 尝试信息技术
                const itRes = handleIT(cleanQ, cleanQ);
                if (itRes) return itRes;
                // 尝试日常生活
                const dailyRes = handleDailyLife(cleanQ, cleanQ);
                if (dailyRes) return dailyRes;
                // 尝试通用知识
                const genRes = handleGeneralKnowledge(cleanQ);
                if (genRes) { addToContext('ai', genRes, ''); return genRes; }

                const detected = detectSubjectFromQuestion(cleanQ);
                if (detected) {
                    const map = { math:'数学', english:'英语', chinese:'语文', physics:'物理', chemistry:'化学', biology:'生物', history:'历史', politics:'政治', law:'法律', mental:'心理', programming:'编程', music:'音乐', art:'美术', pe:'体育', it:'信息技术' };
                    return `检测到你可能在问${map[detected] || detected}相关的问题。\n\n建议点击上方「${map[detected] || detected}」按钮进入专项模式，获得更精准的回答。`;
                }
            }

            // 通用知识回退（有科目但未匹配到处理器时也尝试）
            const genFallback = handleGeneralKnowledge(cleanQ);
            if (genFallback) { addToContext('ai', genFallback, subject || ''); return genFallback; }

            // 默认回复
            const defaultReply = `关于「${cleanQ.substring(0, 50)}${cleanQ.length > 50 ? '...' : ''}」：\n\n我可以帮你解答各学科问题。请：\n• 选择上方科目按钮进入专项模式\n• 或直接描述你的问题，我会自动识别`;
            addToContext('ai', defaultReply, subject || '');
            return defaultReply;
        }
