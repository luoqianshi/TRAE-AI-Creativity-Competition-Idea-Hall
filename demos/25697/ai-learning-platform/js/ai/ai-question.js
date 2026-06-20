        // ========== AI Question Generator ==========
        function generateQuestion(subject) {
            const subjects = subject ? [subject] : ['数学', '英语', '语文', '物理', '化学', '生物', '历史', '政治'];
            const chosenSubject = subjects[Math.floor(Math.random() * subjects.length)];

            if (chosenSubject === '数学' || chosenSubject === 'math') {
                const types = [
                    () => {
                        const a = Math.floor(Math.random() * 20) + 1;
                        const b = Math.floor(Math.random() * 20) + 1;
                        const ops = ['+', '-', '×'];
                        const op = ops[Math.floor(Math.random() * ops.length)];
                        let ans;
                        if (op === '+') ans = a + b;
                        else if (op === '-') ans = a - b;
                        else ans = a * b;
                        return { q: `${a} ${op} ${b} = ?`, a: `${ans}`, type: '计算题' };
                    },
                    () => {
                        const a = Math.floor(Math.random() * 10) + 1;
                        const b = Math.floor(Math.random() * 10) + 1;
                        const c = Math.floor(Math.random() * 20) - 10;
                        return { q: `求解方程：${a}x ${c >= 0 ? '+' : ''}${c} = ${a * b + c}`, a: `x = ${b}`, type: '方程题' };
                    },
                    () => {
                        const h = Math.floor(Math.random() * 10) + 5;
                        const w = Math.floor(Math.random() * 10) + 5;
                        return { q: `一个长方形的长为${h}cm，宽为${w}cm，求它的面积。`, a: `${h * w} cm²`, type: '几何题' };
                    },
                    () => {
                        const total = Math.floor(Math.random() * 20) + 10;
                        const legs = Math.floor(Math.random() * 40) + total * 2;
                        const rabbits = (legs - 2 * total) / 2;
                        const chickens = total - rabbits;
                        if (Number.isInteger(rabbits) && rabbits >= 0 && chickens >= 0) {
                            return { q: `鸡兔同笼，共有${total}个头，${legs}条腿。问鸡和兔各有多少只？`, a: `鸡${chickens}只，兔${rabbits}只`, type: '应用题' };
                        }
                        return { q: `小明有${total}元钱，买了3支笔，每支笔2元，还剩多少钱？`, a: `${total - 6}元`, type: '应用题' };
                    },
                    () => {
                        const n = Math.floor(Math.random() * 5) + 2;
                        const d = Math.floor(Math.random() * 5) + 2;
                        const a1 = Math.floor(Math.random() * 10) + 1;
                        const an = a1 + (n - 1) * d;
                        const sum = n * (a1 + an) / 2;
                        return { q: `等差数列首项为${a1}，公差为${d}，求前${n}项和。`, a: `${sum}`, type: '数列题' };
                    },
                    () => {
                        const speed = Math.floor(Math.random() * 40) + 20;
                        const time = Math.floor(Math.random() * 5) + 2;
                        return { q: `一辆汽车以每小时${speed}公里的速度行驶了${time}小时，求行驶的总路程。`, a: `${speed * time}公里`, type: '行程问题' };
                    },
                ];
                const gen = types[Math.floor(Math.random() * types.length)];
                return { ...gen(), subject: '数学' };
            } else if (chosenSubject === '英语' || chosenSubject === 'english') {
                const types = [
                    () => {
                        const words = [
                            { w: 'beautiful', m: '美丽的', p: '/ˈbjuːtɪfl/' },
                            { w: 'necessary', m: '必要的', p: '/ˈnesəsəri/' },
                            { w: 'environment', m: '环境', p: '/ɪnˈvaɪrənmənt/' },
                            { w: 'government', m: '政府', p: '/ˈɡʌvənmənt/' },
                            { w: 'knowledge', m: '知识', p: '/ˈnɒlɪdʒ/' },
                            { w: 'experience', m: '经验', p: '/ɪkˈspɪəriəns/' },
                            { w: 'opportunity', m: '机会', p: '/ˌɒpəˈtjuːnəti/' },
                            { w: 'responsibility', m: '责任', p: '/rɪˌspɒnsəˈbɪləti/' },
                        ];
                        const word = words[Math.floor(Math.random() * words.length)];
                        return { q: `单词拼写：根据音标和释义写出单词\n音标：${word.p}\n释义：${word.m}`, a: word.w, type: '词汇题' };
                    },
                    () => {
                        const verbs = [
                            { b: 'go', p: 'went', pp: 'gone' },
                            { b: 'take', p: 'took', pp: 'taken' },
                            { b: 'write', p: 'wrote', pp: 'written' },
                            { b: 'speak', p: 'spoke', pp: 'spoken' },
                            { b: 'break', p: 'broke', pp: 'broken' },
                        ];
                        const v = verbs[Math.floor(Math.random() * verbs.length)];
                        return { q: `不规则动词：写出 ${v.b} 的过去式和过去分词`, a: `过去式：${v.p}，过去分词：${v.pp}`, type: '语法题' };
                    },
                    () => {
                        const sentences = [
                            { e: 'The weather is very nice today.', c: '今天天气很好。' },
                            { e: 'I have finished my homework.', c: '我已经完成了作业。' },
                            { e: 'She has been living here for five years.', c: '她已经在这里住了五年了。' },
                        ];
                        const s = sentences[Math.floor(Math.random() * sentences.length)];
                        return { q: `翻译句子：\n${s.e}`, a: s.c, type: '翻译题' };
                    },
                ];
                const gen = types[Math.floor(Math.random() * types.length)];
                return { ...gen(), subject: '英语' };
            } else if (chosenSubject === '物理' || chosenSubject === 'physics') {
                const types = [
                    () => {
                        const v0 = Math.floor(Math.random() * 10) + 1;
                        const a = Math.floor(Math.random() * 5) + 1;
                        const t = Math.floor(Math.random() * 10) + 1;
                        const v = v0 + a * t;
                        return { q: `一个物体初速度为${v0}m/s，加速度为${a}m/s²，求${t}s后的末速度。`, a: `v = v₀ + at = ${v0} + ${a}×${t} = ${v}m/s`, type: '运动学题' };
                    },
                    () => {
                        const m = Math.floor(Math.random() * 10) + 1;
                        const a = Math.floor(Math.random() * 5) + 1;
                        const F = m * a;
                        return { q: `质量为${m}kg的物体，受到${F}N的合外力作用，求加速度。`, a: `a = F/m = ${F}/${m} = ${a}m/s²`, type: '力学题' };
                    },
                    () => {
                        const U = Math.floor(Math.random() * 20) + 5;
                        const I = (Math.floor(Math.random() * 10) + 1) / 10;
                        const R = U / I;
                        return { q: `一段电路两端电压为${U}V，通过的电流为${I}A，求电阻。`, a: `R = U/I = ${U}/${I} = ${R.toFixed(1)}Ω`, type: '电学题' };
                    },
                    () => {
                        const F = Math.floor(Math.random() * 50) + 10;
                        const s = Math.floor(Math.random() * 10) + 1;
                        const W = F * s;
                        return { q: `用${F}N的力将物体沿力的方向推动${s}m，求做的功。`, a: `W = Fs = ${F}×${s} = ${W}J`, type: '功的计算' };
                    },
                ];
                const gen = types[Math.floor(Math.random() * types.length)];
                return { ...gen(), subject: '物理' };
            } else if (chosenSubject === '化学' || chosenSubject === 'chemistry') {
                const types = [
                    () => {
                        const elements = [
                            { q: '元素符号Fe代表的元素是什么？', a: '铁（Iron）' },
                            { q: '元素符号Na代表的元素是什么？', a: '钠（Sodium）' },
                            { q: '元素符号Ca代表的元素是什么？', a: '钙（Calcium）' },
                            { q: '元素符号K代表的元素是什么？', a: '钾（Potassium）' },
                        ];
                        const el = elements[Math.floor(Math.random() * elements.length)];
                        return { q: el.q, a: el.a, type: '元素识别' };
                    },
                    () => {
                        const equations = [
                            { q: '写出铁和稀硫酸反应的化学方程式', a: 'Fe + H₂SO₄ = FeSO₄ + H₂↑' },
                            { q: '写出碳酸钙与盐酸反应的化学方程式', a: 'CaCO₃ + 2HCl = CaCl₂ + H₂O + CO₂↑' },
                            { q: '写出氢氧化钠与硫酸反应的化学方程式', a: '2NaOH + H₂SO₄ = Na₂SO₄ + 2H₂O' },
                        ];
                        const eq = equations[Math.floor(Math.random() * equations.length)];
                        return { q: eq.q, a: eq.a, type: '化学方程式' };
                    },
                    () => {
                        const n = Math.floor(Math.random() * 5) + 1;
                        const m = n * 32;
                        return { q: `${n}mol O₂的质量是多少克？（O的相对原子质量为16）`, a: `m = n × M = ${n} × 32 = ${m}g`, type: '摩尔计算' };
                    },
                ];
                const gen = types[Math.floor(Math.random() * types.length)];
                return { ...gen(), subject: '化学' };
            } else if (chosenSubject === '生物' || chosenSubject === 'biology') {
                const types = [
                    () => {
                        const questions = [
                            { q: '细胞中被称为"动力车间"的细胞器是什么？', a: '线粒体（是有氧呼吸的主要场所）' },
                            { q: '植物细胞特有的细胞器有哪些？', a: '叶绿体、液泡（动物细胞还有中心体）' },
                            { q: '细胞膜的主要功能是什么？', a: '保护细胞、控制物质进出（选择透过性）' },
                            { q: 'DNA主要存在于细胞的哪个结构中？', a: '细胞核中的染色质上' },
                        ];
                        const qs = questions[Math.floor(Math.random() * questions.length)];
                        return { q: qs.q, a: qs.a, type: '细胞结构' };
                    },
                    () => {
                        const questions = [
                            { q: 'Aa × Aa 的后代基因型比例是多少？', a: 'AA:Aa:aa = 1:2:1，表现型比例 3:1' },
                            { q: 'Aa × aa 的后代基因型比例是多少？', a: 'Aa:aa = 1:1（测交）' },
                            { q: 'AA × Aa 的后代基因型比例是多少？', a: 'AA:Aa = 1:1，表现型全部为显性' },
                        ];
                        const qs = questions[Math.floor(Math.random() * questions.length)];
                        return { q: qs.q, a: qs.a, type: '遗传概率' };
                    },
                    () => {
                        return { q: '写出光合作用的总反应方程式', a: '6CO₂ + 6H₂O →(光照/叶绿体) C₆H₁₂O₆ + 6O₂', type: '光合作用' };
                    },
                ];
                const gen = types[Math.floor(Math.random() * types.length)];
                return { ...gen(), subject: '生物' };
            } else if (chosenSubject === '历史' || chosenSubject === 'history') {
                const types = [
                    () => {
                        const questions = [
                            { q: '请按时间先后排列以下朝代：唐、宋、元、明、清', a: '唐 → 宋 → 元 → 明 → 清' },
                            { q: '请按时间先后排列以下朝代：夏、商、周、秦、汉', a: '夏 → 商 → 周 → 秦 → 汉' },
                            { q: '中国历史上第一个统一的中央集权封建国家是哪个朝代？', a: '秦朝（公元前221年，秦始皇嬴政建立）' },
                        ];
                        const qs = questions[Math.floor(Math.random() * questions.length)];
                        return { q: qs.q, a: qs.a, type: '朝代排序' };
                    },
                    () => {
                        const questions = [
                            { q: '鸦片战争爆发于哪一年？', a: '1840年（中国近代史的开端）' },
                            { q: '辛亥革命发生在哪一年？', a: '1911年（推翻了清朝统治）' },
                            { q: '中华人民共和国成立于哪一年？', a: '1949年10月1日' },
                            { q: '五四运动发生在哪一年？', a: '1919年' },
                        ];
                        const qs = questions[Math.floor(Math.random() * questions.length)];
                        return { q: qs.q, a: qs.a, type: '历史事件' };
                    },
                ];
                const gen = types[Math.floor(Math.random() * types.length)];
                return { ...gen(), subject: '历史' };
            } else if (chosenSubject === '政治' || chosenSubject === 'politics') {
                const types = [
                    () => {
                        const questions = [
                            { q: '我国的根本政治制度是什么？', a: '人民代表大会制度' },
                            { q: '社会主义核心价值观中，国家层面的内容是什么？', a: '富强、民主、文明、和谐' },
                            { q: '我国的基本经济制度是什么？', a: '公有制为主体、多种所有制经济共同发展' },
                            { q: '公民的基本义务有哪些？（至少列举3项）', a: '维护国家统一和民族团结、遵守宪法和法律、维护国家安全荣誉和利益、依法纳税、服兵役等' },
                        ];
                        const qs = questions[Math.floor(Math.random() * questions.length)];
                        return { q: qs.q, a: qs.a, type: '知识点判断' };
                    },
                ];
                const gen = types[Math.floor(Math.random() * types.length)];
                return { ...gen(), subject: '政治' };
            } else {
                const poems = [
                    { t: '静夜思', a: '李白', c: '床前明月光，疑是地上霜。举头望明月，低头思故乡。' },
                    { t: '春晓', a: '孟浩然', c: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。' },
                    { t: '登鹳雀楼', a: '王之涣', c: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。' },
                    { t: '悯农', a: '李绅', c: '锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。' },
                    { t: '咏鹅', a: '骆宾王', c: '鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。' },
                ];
                const poem = poems[Math.floor(Math.random() * poems.length)];
                const types = [
                    () => ({ q: `默写古诗《${poem.t}》（${poem.a}）\n请写出全诗：`, a: poem.c, type: '默写题' }),
                    () => ({ q: `《${poem.t}》的作者是谁？`, a: poem.a, type: '文学常识' }),
                    () => ({ q: `请背诵《${poem.t}》并解释"${poem.c.split('。')[0]}"的含义。`, a: `这首诗描写了...（请根据课堂所学作答）`, type: '赏析题' }),
                ];
                const gen = types[Math.floor(Math.random() * types.length)];
                return { ...gen(), subject: '语文' };
            }
        }
