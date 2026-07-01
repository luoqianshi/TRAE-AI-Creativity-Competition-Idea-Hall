// ============================================================
// Guild - ui/guild.js
// 自动从 game.js 拆分
// ============================================================

const Guild = {
    currentRegStep: 1,
    selectedClass: null,
    selectedAppearance: 0,
    regStats: {},
    bonusPoints: 5,

    enter() {
        Game.showScreen('guild-screen');
        this.backToMain();
        this.updateSubtitle();
        this.updateBattleMeetingButton();
    },

    // 更新战斗会议按钮状态
    updateBattleMeetingButton() {
        const btn = document.getElementById('battle-meeting-btn');
        if (!btn) return;
        const evolvable = Battle.getEvolvableCharacters();

        // 计算队伍总经验进度
        let totalExp = 0;
        let totalMax = 0;
        Game.state.party.forEach(char => {
            Battle.ensureBattleData(char);
            totalExp += char.battleData.battleExp;
            totalMax += char.battleData.expToEvolve;
        });
        const avgPercent = totalMax > 0 ? Math.round(totalExp / totalMax * 100) : 0;

        if (evolvable.length === 0) {
            btn.style.opacity = '0.6';
            btn.title = `战斗经验 ${avgPercent}% - 继续探索积累经验`;
            // 更新按钮文字显示进度
            btn.innerHTML = `🧠 战斗会议 <span style="font-size:11px;color:#8a9aaa">${avgPercent}%</span>`;
        } else {
            btn.style.opacity = '1';
            btn.title = `${evolvable.length}名角色可以进化AI`;
            btn.innerHTML = `🧠 战斗会议 <span style="font-size:11px;color:#60c060">可进化!</span>`;
        }
    },

    // 开始战斗会议
    startBattleMeeting() {
        const evolvable = Battle.getEvolvableCharacters();
        if (evolvable.length === 0) {
            // 计算进度
            let html = '<div style="text-align:center;padding:10px">';
            html += '<div style="color:#c8a84e;font-size:18px;margin-bottom:15px">⚔️ 战斗经验不足</div>';
            html += '<div style="color:#8a9aaa;margin-bottom:20px">继续在迷宫中探索，积累战斗经验吧！</div>';

            // 显示每个角色的经验进度
            html += '<div style="display:flex;flex-direction:column;gap:8px">';
            Game.state.party.forEach(char => {
                const progress = Battle.getBattleExpProgress(char);
                html += `<div style="display:flex;align-items:center;gap:10px">
                    <span style="color:#c0d0e0;width:60px">${char.name}</span>
                    <div style="flex:1;height:8px;background:#2a3a4a;border-radius:4px;overflow:hidden">
                        <div style="width:${progress.percent}%;height:100%;background:linear-gradient(90deg,#60a0c0,#60c060)"></div>
                    </div>
                    <span style="color:#8a9aaa;font-size:12px;width:60px">${progress.current}/${progress.max}</span>
                </div>`;
            });
            html += '</div></div>';
            Dialog.show(html);
            return;
        }
        BattleMeeting.start();
    },

    getParty() {
        return Game.state ? Game.state.party : [];
    },

    getRoster() {
        return Game.state ? Game.state.roster : [];
    },

    updateSubtitle() {
        const roster = this.getRoster();
        const subtitle = document.getElementById('guild-subtitle');
        if (subtitle) {
            subtitle.textContent = `登记人数 ${roster.length}/30`;
        }
    },

    showPartyInfo() {
        document.getElementById('guild-main').style.display = 'none';
        document.getElementById('guild-party-info').style.display = 'block';
        document.getElementById('guild-registration').style.display = 'none';
        document.getElementById('guild-formation').style.display = 'none';
        this.renderRosterInfo();
    },

    renderRosterInfo() {
        const partyList = document.getElementById('guild-party-list');
        const roster = this.getRoster();

        const html = roster.length === 0 
            ? '<p style="color:#888;text-align:center;padding:40px;">仓库为空，请先登记冒险者</p>'
            : roster.map(char => {
                const hpPercent = char.maxStats.HP > 0 ? Math.floor(char.stats.HP / char.maxStats.HP * 100) : 0;
                const tpPercent = char.maxStats.TP > 0 ? Math.floor(char.stats.TP / char.maxStats.TP * 100) : 0;
                const hpColor = hpPercent > 50 ? '#40c040' : hpPercent > 25 ? '#c0c040' : '#c04040';
                return `
                <div class="roster-item">
                    <img src="${char.icon}" alt="${char.name}" style="width:48px;height:48px;border-radius:4px;flex-shrink:0">
                    <div class="roster-info" style="flex:1">
                        <div class="name">Lv.${char.level} ${char.name}
                            <span style="color:#888;font-size:12px;font-weight:normal">${char.className}</span>
                        </div>
                        <div style="font-size:12px;margin:3px 0">
                            <span style="color:${hpColor}">HP ${char.stats.HP}/${char.maxStats.HP}</span>
                            <span style="color:#4080c0;margin-left:8px">TP ${char.stats.TP}/${char.maxStats.TP}</span>
                        </div>
                        <div style="height:4px;background:#1a2a3a;border-radius:2px;overflow:hidden">
                            <div style="width:${hpPercent}%;height:100%;background:${hpColor};border-radius:2px;transition:width 0.3s"></div>
                        </div>
                    </div>
                    <div class="roster-actions">
                        <button class="roster-btn" onclick="Guild.showCharInfo('${char.id}')">角色信息</button>
                        <button class="roster-btn" onclick="Guild.deleteFromRoster('${char.id}')">除名</button>
                    </div>
                </div>`;
            }).join('');

        if (partyList) partyList.innerHTML = html;
    },

    // 显示角色详细信息（复用迷宫角色状态界面）
    showCharInfo(charId) {
        const roster = this.getRoster();
        const char = roster.find(c => c.id === charId);
        if (!char) return;
        Guild._returnToGuild = true;
        Menu.renderCharacterStatus(char);
        Game.showScreen('character-status-screen');
    },

    renderFormation() {
        this.renderRosterFormation();
        
        const slots = document.getElementById('formation-slots');
        const party = this.getParty();
        
        document.getElementById('formation-party-count').textContent = party.length;

        let html = '';
        for (let i = 0; i < 5; i++) {
            const char = party[i];
            if (char) {
                html += `
                    <div class="formation-slot filled">
                        <img src="${char.icon}" alt="${char.name}" style="width:40px;height:40px;border-radius:4px;margin-right:10px;">
                        <span>${char.name}</span>
                        <button class="roster-btn" onclick="Guild.removeFromParty('${char.id}')" style="margin-left:auto;">移除</button>
                    </div>
                `;
            } else {
                html += `<div class="formation-slot">空位 ${i + 1}</div>`;
            }
        }
        if (slots) slots.innerHTML = html;
    },

    // 编队界面的仓库列表（有"加入"按钮，无HP血条）
    renderRosterFormation() {
        const formationRoster = document.getElementById('formation-roster');
        const roster = this.getRoster();

        const html = roster.length === 0 
            ? '<p style="color:#888;text-align:center;padding:40px;">仓库为空，请先登记冒险者</p>'
            : roster.map(char => `
                <div class="roster-item">
                    <img src="${char.icon}" alt="${char.name}">
                    <div class="roster-info">
                        <div class="name">${char.name}</div>
                        <div class="class">Lv.${char.level} ${char.className}</div>
                    </div>
                    <div class="roster-actions">
                        <button class="roster-btn" onclick="Guild.addToParty('${char.id}')">加入</button>
                    </div>
                </div>
            `).join('');

        if (formationRoster) formationRoster.innerHTML = html;
    },

    showRegistration() {
        document.getElementById('guild-main').style.display = 'none';
        document.getElementById('guild-party-info').style.display = 'none';
        document.getElementById('guild-registration').style.display = 'block';
        document.getElementById('guild-formation').style.display = 'none';
        document.getElementById('reg-nav').style.display = 'flex';
        this.resetRegistration();
    },

    showFormation() {
        document.getElementById('guild-main').style.display = 'none';
        document.getElementById('guild-party-info').style.display = 'none';
        document.getElementById('guild-registration').style.display = 'none';
        document.getElementById('guild-formation').style.display = 'block';
        document.getElementById('reg-nav').style.display = 'none';
        this.renderFormation();
    },

    backToMain() {
        document.getElementById('guild-main').style.display = 'block';
        document.getElementById('guild-party-info').style.display = 'none';
        document.getElementById('guild-registration').style.display = 'none';
        document.getElementById('guild-formation').style.display = 'none';
        document.getElementById('reg-nav').style.display = 'none';
        this.updateSubtitle();
    },

    leave() {
        const roster = this.getRoster();
        if (roster.length === 0) {
            Dialog.show('请至少登记一名冒险者后再离开公会。', () => {
                this.showRegistration();
            });
            return;
        }
        // 检查是否有队伍成员
        const party = this.getParty();
        if (party.length === 0 && roster.length > 0) {
            // 自动将第一个仓库角色加入队伍
            Game.state.party = [roster[0]];
        }
        Game.showScreen('town-screen');
        Town.update();
    },

    resetRegistration() {
        this.currentRegStep = 1;
        this.selectedClass = 'warrior';
        this.selectedAppearance = 0;
        this.bonusPoints = 5;
        this.regStats = {};
        document.getElementById('reg-char-name').value = '';
        this.updateRegSteps();
        this.renderClassGrid();
        this.renderAppearanceOptions();
        this.renderStatAllocation();
        this.updateRegNav();
    },

    updateRegSteps() {
        document.querySelectorAll('.reg-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentRegStep);
        });
        document.querySelectorAll('.reg-step-content').forEach((content, index) => {
            content.classList.toggle('active', index + 1 === this.currentRegStep);
        });
    },

    regNextStep() {
        if (this.currentRegStep < 5) {
            this.currentRegStep++;
            this.updateRegSteps();
            this.updateRegNav();
            if (this.currentRegStep === 5) {
                this.renderConfirmCard();
            }
        }
    },

    regPrevStep() {
        if (this.currentRegStep > 1) {
            this.currentRegStep--;
            this.updateRegSteps();
            this.updateRegNav();
        }
    },

    regGoStep(step) {
        this.currentRegStep = step;
        this.updateRegSteps();
        this.updateRegNav();
    },

    updateRegNav() {
        document.getElementById('reg-prev-btn').style.display = this.currentRegStep > 1 ? 'inline-block' : 'none';
        const nextBtn = document.getElementById('reg-next-btn');
        if (this.currentRegStep === 5) {
            nextBtn.textContent = '确认创建';
            nextBtn.onclick = () => this.registerCharacter();
        } else {
            nextBtn.textContent = '下一步 →';
            nextBtn.onclick = () => this.regNextStep();
        }
    },

    renderClassGrid() {
        const grid = document.getElementById('reg-class-grid');
        // 当前只开放3个职业，其他暂不显示
        const classes = [
            { id: 'warrior', name: '战士', nameEn: 'Warrior', position: '前卫' },
            { id: 'mage', name: '法师', nameEn: 'Mage', position: '后卫' },
            { id: 'samurai', name: '武士', nameEn: 'Samurai', position: '前卫' }
        ];

        grid.innerHTML = classes.map(cls => {
            const gameData = GameData.classes[cls.id];
            const hasIcon = gameData && gameData.icon;
            const imgHtml = hasIcon
                ? `<img src="${gameData.icon}" alt="${cls.name}" onerror="this.style.display='none'">`
                : `<span class="class-icon-placeholder">${cls.name.charAt(0)}</span>`;
            return `
            <div class="class-card ${this.selectedClass === cls.id ? 'selected' : ''}" 
                 onclick="Guild.selectClass('${cls.id}')">
                ${imgHtml}
                <span class="class-name">${cls.name}</span>
            </div>`;
        }).join('');
    },

    selectClass(classId) {
        this.selectedClass = classId;
        this.selectedAppearance = 0;
        this.renderClassGrid();
        this.renderAppearanceOptions();
        // 重置属性
        const cls = GameData.classes[classId];
        if (cls) {
            this.regStats = { ...cls.baseStats };
        }
    },

    showLockedToast() {
        const guildScreen = document.getElementById('guild-screen');
        const container = guildScreen || document.body;
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = '暂未解锁';
        toast.style.cssText = 'position:absolute;top:40%;left:20%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);color:#e8d8a0;padding:14px 32px;border-radius:8px;z-index:9999;font-size:15px;font-weight:bold;border:1px solid #c8a84e;pointer-events:none;box-shadow:0 0 20px rgba(200,168,78,0.3);';
        container.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 1500);
    },

    renderAppearanceOptions() {
        const container = document.getElementById('appearance-options');
        const preview = document.getElementById('appearance-preview-img');
        const cls = GameData.classes[this.selectedClass];
        
        if (!cls || !cls.appearances) return;

        container.innerHTML = cls.appearances.map((app, index) => `
            <div class="appearance-option ${this.selectedAppearance === index ? 'selected' : ''}" 
                 onclick="Guild.selectAppearance(${index})">
                <img src="${app.icon}" alt="${app.desc}" 
                     onerror="this.src='${app.portrait}'">
            </div>
        `).join('');

        // 更新预览
        if (preview && cls.appearances[this.selectedAppearance]) {
            preview.src = cls.appearances[this.selectedAppearance].portrait;
        }
    },

    selectAppearance(index) {
        this.selectedAppearance = index;
        this.renderAppearanceOptions();
    },

    randomName() {
        const cls = GameData.classes[this.selectedClass];
        const app = cls && cls.appearances ? cls.appearances[this.selectedAppearance] : null;
        const gender = app && app.gender ? app.gender : 'N';
        document.getElementById('reg-char-name').value = this.generateName(gender);
    },

    // === 冒险者名称生成器（大规模词根组合，10万+种可能） ===
    // 设计理念：
    //   将汉字按声调/含义分组为「首音」「中音」「尾音」三类音素池，
    //   通过 首音+中音+尾音 的自由组合 + 多种命名模式，产生海量自然好听的中文冒险者名。
    //   同时提供一组纯随机「长尾名」确保极低重复率。
    generateName(gender) {
        // —— 基础中性首音池（约400字，通用） ——
        const onset = [
            '艾','奥','安','阿','埃','昂','敖','白','百','班','邦','包','宝','保','北',
            '贝','奔','本','比','毕','滨','波','伯','勃','布','才','苍','策','查','柴',
            '昌','常','朝','陈','成','程','赤','初','楚','川','传','创','春','淳','慈',
            '达','大','岱','丹','单','德','狄','迪','滇','点','丁','定','东','冬','董',
            '斗','独','笃','端','段','多','恩','尔','法','帆','凡','繁','方','飞',
            '分','丰','风','枫','封','峰','锋','逢','福','甫','辅','复','傅','盖','干',
            '甘','刚','钢','高','戈','格','葛','根','庚','耿','功','宫','恭','巩','共',
            '古','谷','顾','冠','光','广','归','桂','国','海','含','函','寒','汉','瀚',
            '航','豪','浩','皓','合','和','河','恒','衡','弘','宏','鸿','厚','华','化',
            '淮','环','焕','皇','辉','汇','惠','火','霍','基','嵇','吉','汲','即',
            '季','济','继','寂','稷','加','佳','家','嘉','甲','坚','间','简','建','健',
            '渐','鉴','江','姜','将','疆','杰','洁','结','捷','金','津','锦','晋','靳',
            '经','荆','晶','精','景','靖','镜','炯','九','久','居','驹','举','巨',
            '聚','觉','军','君','峻','骏','卡','开','凯','康','慷','柯','科','可','克',
            '空','孔','库','快','宽','匡','邝','旷','奎','魁','坤','扩','阔','拉','来',
            '莱','岚','蓝','览','朗','浪','劳','老','乐','雷','磊','类','黎','礼',
            '李','里','理','力','立','利','励','连','帘','联','廉','练','炼','良',
            '梁','粮','两','亮','谅','辽','寥','列','烈','林','临','霖','灵','岭',
            '凌','铃','陵','菱','零','翎','令','刘','流','柳','龙','隆','陇','楼','卢',
            '炉','庐','鲁','陆','鹿','路','旅','绿','栾','伦','论','罗','洛','骆','马',
            '玛','迈','满','曼','芒','莽','毛','矛','茂','梅','媒','蒙','盟','猛','孟',
            '迷','米','密','绵','勉','苗','淼','民','缗','闵','敏','明',
            '鸣','铭','名','摩','莫','墨','默','谋','木','目','牧','慕','穆','纳','乃',
            '奈','南','难','尼','年','念','宁','牛','农','诺','欧','偶','帕','拍',
            '排','派','潘','攀','盘','庞','培','裴','佩','彭','蓬','鹏','飘','频','品',
            '平','苹','凭','屏','坡','珀','朴','普','谱','浦','齐','祁','奇','歧',
            '启','起','气','千','迁','谦','前','钱','乾','潜','黔','强','桥','且','青',
            '轻','清','情','庆','丘','秋','求','球','曲','屈','驱','渠','全','权',
            '泉','劝','确','群','然','冉','染','让','饶','绕','热','人','仁','忍','韧',
            '日','戎','荣','容','融','儒','软','瑞','锐','润','若','弱','萨',
            '塞','赛','三','散','桑','色','森','沙','砂','山','杉','闪','善',
            '商','赏','上','尚','韶','少','绍','舍','社','设','申','伸','身','深','神',
            '审','甚','慎','升','生','声','圣','盛','师','诗','施','石','时','识','实',
            '拾','史','使','始','士','世','仕','示','式','势','事','侍','饰','室','是',
            '适','恃','守','首','寿','受','狩','书','叔','殊','梳','舒','疏','术','束',
            '树','数','双','霜','爽','水','顺','瞬','说','思','司','丝','死','四','寺',
            '松','嵩','宋','颂','苏','肃','素','速','宿','粟','溯','算','虽','随','岁',
            '孙','损','索','锁','他','塔','拓','踏','台','太','泰','潭','坦','探','唐',
            '堂','棠','涛','滔','韬','腾','藤','提','体','天','添','田','铁','听','亭',
            '廷','庭','霆','挺','通','同','桐','铜','统','透','图','涂','土','吐','团',
            '推','退','托','拓','瓦','外','完','宛','晚','万','汪','王','威','微','巍',
            '韦','围','唯','惟','维','伟','炜','卫','未','蔚','温','文','纹','闻','问',
            '翁','我','沃','卧','乌','无','吴','梧','五','午','武','舞','务','物','夕',
            '西','希','析','息','惜','溪','锡','习','席','袭','洗','喜','系','细','峡',
            '侠','夏','仙','先','鲜','贤','咸','显','险','县','现','限','线','宪','陷',
            '献','乡','相','香','厢','襄','详','祥','响','想','向','巷','象',
            '像','逍','萧','霄','小','晓','肖','效','啸','协','邪','斜','写','泄','谢',
            '心','辛','新','信','兴','星','星','行','形','省','幸','性','休','修',
            '虚','需','徐','许','序','叙','绪','续','轩','宣','玄','悬',
            '旋','选','薛','学','血','勋','寻','巡','汛','迅','逊','亚',
            '延','严','言','岩','炎','沿','研','盐','颜','衍','掩','眼','演','艳','晏',
            '宴','验','杨','阳','扬','洋','仰','养','遥','耀','叶','业','夜','一',
            '医','仪','夷','宜','移','遗','颐','疑','乙','以','矣','倚',
            '义','亿','艺','忆','议','亦','异','役','抑','译','易','奕','益','谊','逸',
            '意','毅','翼','因','阴','音','殷','吟','银','引','饮','隐','印','应','英',
            '婴','鹰','迎','盈','营','影','映','硬','拥','佣','永','咏','泳','勇','涌',
            '用','优','幽','悠','尤','由','犹','游','友','有','右','幼','于','余','鱼',
            '渔','愉','愚','舆','与','宇','羽','玉','育','郁','浴','预','域',
            '欲','御','裕','愈','誉','豫','元','园','员','原','圆','援','源','缘','远',
            '院','愿','曰','月','岳','悦','跃','越','云','匀','允','运','韵','杂','灾',
            '载','再','在','咱','暂','赞','脏','葬','早','造','则','泽','责','择','增',
            '曾','赠','扎','札','乍','诈','摘','宅','翟','瞻','斩','展','崭','战','站',
            '章','彰','张','掌','丈','仗','障','招','昭','朝','兆','照','召','遮','折',
            '哲','者','浙','针','侦','珍','真','甄','诊','枕','振','震','镇','争',
            '征','峥','蒸','拯','整','正','政','证','郑','之','支','知','织','执','直',
            '值','职','植','殖','止','旨','址','纸','志','制','质','治','致','秩','智',
            '置','中','忠','终','钟','衷','仲','众','重','舟','周','洲','轴','肘','骤',
            '朱','诸','竹','逐','主','住','助','注','驻','柱','祝','著','筑','铸',
            '抓','爪','专','转','撰','妆','庄','装','壮','状','追','坠','准','捉','卓',
            '灼','茁','酌','着','琢','咨','姿','资','滋','子','紫','字','自','宗','综',
            '棕','踪','总','纵','走','奏','租','足','族','组','祖','阻','组','钻','最',
            '尊','遵','昨','左','佐','作','坐','座'
        ];

        // —— 男偏首音增补池（约60个，偏硬朗/力量/阳刚） ——
        const onsetM = [
            '霸','彪','岑','赤','矗','岱','砥','烽','罡','戈','昊','赫','桓','焕','骥',
            '戬','绛','峤','旌','珏','浚','恺','馗','夔','琨','廓','雳','凛','陇','麓',
            '峦','莽','冕','淼','珉','岷','谟','楠','弩','磐','沛','彭','璞','戚','麒',
            '黔','戕','遒','仞','戎','嵘','睿','戍','朔','嵩','焘','滕','霆','拓','骁',
            '枭'
        ];

        // —— 女偏首音增补池（约50个，偏柔美/婉约/优雅） ——
        const onsetF = [
            '蓓','菡','蕙','芷','蘅','荇','荃','苒','苓','荑','莘','芙','蕖','蘩','葭',
            '筠','筱','箫','笙','筝','琵','琶','磬','铃','铛','钿','璎','珞','琳','琅',
            '琬','琰','璇','瑾','瑜','琪','琦','琮','琛','珈','珮','琇','璐','璘','珂',
            '薇','萱','蓉','茉','蕊','柔','如','雨','语','梦','弥','兰','欣','珠',
            '慧','静','丽','妙','琼','珊','湘','翔','绣','袖','雅','怡','贻','贞','秀',
            '琳','萍','纱','凝','菲','璇','依'
        ];

        // —— 基础中音池（约400字） ——
        const medial = [
            '阿','艾','安','昂','奥','巴','百','班','邦','贝','本','比','毕','滨','波',
            '勃','布','查','昌','常','朝','彻','辰','成','城','程','冲','崇','初','楚',
            '川','淳','慈','聪','从','达','岱','丹','德','狄','迪','典','殿','定','东',
            '冬','都','独','端','多','恩','尔','法','凡','繁','方','风','枫','封','锋',
            '福','甫','辅','盖','甘','冈','刚','高','戈','格','耿','宫','恭','古','谷',
            '关','观','冠','光','广','归','国','海','含','寒','汉','航','豪','合','和',
            '河','恒','衡','弘','宏','虹','鸿','厚','华','化','环','焕','辉','火',
            '基','吉','极','集','己','季','济','继','寂','加','佳','家','嘉','坚','建',
            '健','鉴','江','将','金','津','锦','进','经','晶','精','景','靖','镜',
            '九','久','居','举','聚','军','君','俊','开','凯','康','科','克','空','孔',
            '阔','拉','来','岚','蓝','朗','浪','劳','乐','雷','磊','黎','礼','李',
            '里','理','力','立','利','励','连','联','廉','练','良','梁','亮','临',
            '林','霖','灵','岭','凌','铃','隆','龙','路','伦','罗','洛','马','曼',
            '芒','莽','茂','梅','蒙','盟','猛','孟','弥','米','密','勉','苗',
            '民','明','鸣','铭','莫','墨','默','谋','木','目','慕','穆','纳','奈','南',
            '尼','年','宁','农','诺','欧','潘','盘','庞','培','彭','蓬','鹏','平','凭',
            '屏','珀','朴','普','浦','齐','祁','奇','启','起','千','谦','前','乾','强',
            '桥','青','清','情','庆','丘','秋','求','曲','全','权','泉','群','然',
            '戎','荣','融','儒','瑞','润','萨','森','沙','山','商','上','尚','韶',
            '少','绍','深','神','升','圣','盛','石','时','识','实','史','士','世','仕',
            '守','首','书','舒','术','双','霜','爽','水','顺','思','司','松','宋','颂',
            '苏','肃','素','宿','粟','孙','索','塔','泰','潭','坦','探','唐','堂','棠',
            '韬','腾','藤','天','田','铁','亭','廷','庭','霆','通','同','桐','铜','统',
            '图','涂','土','团','拓','瓦','外','完','万','汪','威','巍','韦','唯','维',
            '伟','炜','温','文','闻','翁','沃','乌','无','吴','五','武','舞','西','希',
            '锡','习','席','喜','系','峡','侠','夏','仙','先','贤','显','县','现','相',
            '香','祥','响','向','巷','象','萧','霄','晓','效','啸','协','谢',
            '心','辛','欣','新','信','兴','星','行','形','省','幸','性','休','修',
            '旭','绪','轩','宣','玄','旋','学','勋','巡','迅','亚','严','言',
            '岩','炎','研','盐','颜','衍','彦','阳','扬','洋','仰','养','耀',
            '叶','业','一','宜','移','义','艺','忆','易','奕','益','谊','逸',
            '毅','因','音','银','引','英','迎','盈','营','影','映','永','咏','勇','涌',
            '用','优','悠','尤','由','游','友','有','于','余','宇','羽','玉',
            '育','郁','域','御','裕','愈','元','园','原','圆','援','源','远','月','岳',
            '悦','跃','越','云','匀','运','韵','则','泽','增','瞻','展','章','彰','昭',
            '兆','哲','真','振','震','镇','争','征','正','政','郑','之','执','直','值',
            '职','志','制','治','致','智','中','忠','忠','终','钟','仲','众','重','舟',
            '周','洲','朱','珠','诸','竹','主','著','筑','庄','壮','卓','灼','琢','资',
            '子','宗','总','纵','尊','左','佐','作'
        ];

        // —— 女偏中音池（仅女名使用） ——
        const medialF = [
            '慧','静','兰','丽','琳','妙','梦','琼','如','湘','翔','秀','雪','雅','艳','瑶','怡','依'
        ];

        // —— 基础尾音池（约400字） ——
        const coda = [
            '安','昂','奥','白','百','邦','宝','保','北','本','比','毕','滨','波','伯',
            '布','才','苍','策','昌','常','朝','辰','城','程','冲','崇','初','楚','川',
            '淳','慈','聪','达','岱','丹','德','迪','典','定','东','冬','端','盾','铎',
            '恩','尔','法','帆','凡','繁','方','飞','风','丰','枫','封','峰','锋','福',
            '甫','辅','盖','甘','冈','刚','钢','高','戈','格','根','庚','功','宫','恭',
            '巩','古','谷','顾','冠','光','广','归','桂','国','海','寒','汉','瀚','航',
            '豪','浩','皓','合','和','河','恒','衡','弘','宏','鸿','厚','华','化','淮',
            '环','焕','煌','辉','火','基','吉','极','季','济','继','寂','稷','加',
            '佳','家','嘉','坚','建','健','鉴','江','将','疆','杰','洁','结','捷','金',
            '津','锦','晋','经','荆','晶','精','景','靖','镜','炯','九','久','驹',
            '举','聚','觉','军','君','峻','骏','凯','康','慷','柯','科','可','克','空',
            '孔','库','旷','奎','魁','坤','来','莱','岚','蓝','朗','浪','雷','磊',
            '黎','礼','里','理','力','立','利','励','连','联','廉','炼','良','梁',
            '亮','林','临','霖','灵','岭','凌','铃','翎','令','刘','流','柳','龙',
            '隆','楼','卢','鲁','陆','鹿','路','旅','绿','伦','罗','洛','马','满','曼',
            '茂','梅','蒙','盟','猛','孟','米','密','苗','民','明','鸣','铭',
            '摩','莫','墨','默','谋','木','目','牧','慕','穆','纳','奈','南','能','尼',
            '年','念','宁','凝','农','诺','欧','潘','盘','培','彭','蓬','鹏','品','平',
            '珀','朴','普','浦','齐','祁','奇','启','气','千','谦','前','钱','乾','强',
            '桥','且','青','轻','清','情','庆','丘','秋','求','球','曲','全','权',
            '泉','群','然','戎','荣','容','融','瑞','锐','润','萨','塞','赛',
            '三','桑','色','森','沙','山','杉','善','商','赏','上','尚','韶','绍','设',
            '申','深','神','审','升','生','圣','盛','诗','石','时','识','实','史','士',
            '世','仕','守','首','寿','受','书','舒','术','树','双','霜','爽','水','顺',
            '思','松','宋','颂','苏','肃','素','速','宿','粟','孙','索','塔','泰','潭',
            '坦','唐','堂','棠','涛','韬','腾','藤','天','田','铁','亭','廷','庭','霆',
            '通','同','桐','铜','统','图','土','团','拓','瓦','完','万','汪','旺','威',
            '微','巍','韦','唯','维','伟','炜','卫','尉','蔚','温','文','闻','翁','沃',
            '乌','无','吴','五','武','舞','西','希','溪','锡','席','喜','峡','侠','夏',
            '仙','先','贤','显','县','香','湘','祥','翔','向','象','萧','霄','晓','啸',
            '协','谢','心','辛','新','信','兴','星','行','形','幸','性','休','修',
            '旭','绪','轩','宣','玄','旋','学','勋','巡','迅','亚','严',
            '言','岩','炎','彦','阳','扬','洋','仰','养','耀','叶','业','一',
            '宜','仪','义','艺','忆','易','奕','益','谊','逸','毅','音','银',
            '引','英','迎','盈','营','影','映','永','咏','勇','涌','用','优','悠','尤',
            '由','游','友','有','于','余','宇','羽','玉','育','郁','域','御',
            '裕','愈','元','园','原','圆','源','远','月','岳','悦','跃','越','云','运',
            '韵','泽','则','增','展','章','彰','昭','兆','哲','真','震','镇','争','征',
            '正','政','郑','之','执','直','志','制','治','致','智','中','忠','终','钟',
            '仲','众','重','舟','周','洲','朱','竹','主','著','筑','庄','壮','卓',
            '灼','琢','子','宗','总','纵','尊','左','佐','作','座'
        ];

        // —— 基础双字头池（中性偏男，纯西式音译，男女通用但不会女性化） ——
        const head2 = [
            '艾尔','安布','奥克','巴洛','巴尔','伯恩',
            '达斯','达克','德鲁','迪恩','多恩','法尔','弗雷','盖尔',
            '格兰','格雷','海克','赫克','霍克','杰诺','杰姆','凯恩','雷奥',
            '罗格','洛克','马洛','蒙特','奈特','欧文','帕克',
            '佩恩','珀尔','雷文','瑞恩','瑞安','萨恩','索恩','塔克','泰尔','托尔',
            '特恩','瓦尔','维克','西格','西恩','亚文','易安','安之','行之','信之',
            '慕之','远之','明之','景之','文之','武之'
        ];

        // —— 女偏双字头池（女性化意象/音译，仅女名使用） ——
        const head2F = [
            '阿尔','奥拉','贝拉','菲恩','菲尔','洛兰','米拉','兰斯',
            '樱花','蝶舞','月影','雪莲','露珠','蔷薇','茉莉','百合','牡丹','芍药',
            '海棠','杜鹃','玉兰','桂花','梅花','兰花','菊花','芙蓉','紫薇','琳琅',
            '琼瑶','璇玑','珍珠','翡翠','玛瑙','琥珀','珊瑚','琉璃','水晶','钻石',
            '星辰','银河','月光','晨曦','晚霞','彩虹','云雾','霜雪','雨露','白羽',
            '碧波','紫电','孤烟','长歌','醉月','听风','映雪','凌云','追日','落霞',
            '苍穹','洪荒','万象','归一','明镜','止水','灵犀','无痕','绝尘'
        ];

        // —— 男偏双字头池（阳刚/力量/武侠意象，仅男名使用） ——
        const head2M = [
            '银月','霜刃','炎阳','星辉','风吟','雷鸣','冰晶','影刃','龙鳞','铁壁',
            '圣光','暗影','苍狼','赤焰','青峰','黑曜','金曦','玄铁','皓月','辰星',
            '幻云','流火','怒涛','烈风','磐石','神锋','天罡','地煞','无极','太初',
            '凌霄','御风','斩星','碎岳','惊雷','破军','绝影','飞霜','贯虹','屠龙',
            '铁血','狂龙','霸天','战魂','雷刃','罡风','雄狮','猛虎','苍龙','玄武',
            '朱雀','青龙','白虎','战神','武王','天剑','地刀','山岳','江河','瀚海',
            '雷霆','寒冰','暴风','疾电','金刚','罗汉','行者','猎人','游侠','剑客'
        ];

        // —— 双字尾池（中性偏男，西式硬朗音译为主） ——
        const tail2 = [
            '达恩','尔克','兰斯','奇姆','瑞恩','斯塔','安迪',
            '艾尔','尔文','克兰','洛姆','伊恩','英格','维尔','希尔','多尔','顿恩','玛尔',
            '汀克','格斯','洛克','瑞克','摩尔','威克','科尔','帕恩','迪安',
            '威尔','隆德','维特','伯克','莱特','亚瑟','罗德','昂德','摩根','海姆',
            '雷姆','沃克','希斯','托姆','布林','德林','克林','格林','普林',
            '巴德','加德','福德','索德','纳德','温德','尼尔','皮尔','赛尔','泰尔'
        ];

        // —— 女偏双字尾池（女性化音译，仅女名使用） ——
        const tail2F = [
            '莉亚','娜拉','妮丝','莎莉','丝琳','特莉','薇拉','琳达','拉文','露娜',
            '菲恩','莱恩','茵琪','琳娜','娜丝','妮安','瑞安','莎拉','斯特','薇安',
            '亚琳','洛芬'
        ];

        // —— 女偏尾音池（柔美/婉约结尾字，男名不用） ——
        const codaF = [
            '莉','娜','妮','琪','莎','丝','薇','琳','洛','姆','绮','露','芳','蕊',
            '蓉','萱','莹','瑶','馨','茜','妍','婷','嫣','姝','婧','婉','妩','媚',
            '璇','璐','玫','瑰','蝶','莲','萍','荷','芝','茵','岚','雯','菲','芊',
            '雪','艳','秀','慧','静','丽','琼','依','怡','妙'
        ];

        // —— 按性别分流池子的加权采样 ——
        // 男：首音60%男偏 / head2 60%男偏 / 尾音100%中性 / tail2 100%中性
        // 女：首音60%女偏 / head2 60%女偏 / 尾音50%女偏 / tail2 50%女偏
        // 中性：全用基础池
        const pickOnset = () => {
            if (gender === 'M') {
                return Math.random() < 0.6 ? onsetM[rand(onsetM)] : onset[rand(onset)];
            } else if (gender === 'F') {
                return Math.random() < 0.6 ? onsetF[rand(onsetF)] : onset[rand(onset)];
            }
            return onset[rand(onset)];
        };
        const pickHead2 = () => {
            if (gender === 'M') {
                return Math.random() < 0.6 ? head2M[rand(head2M)] : head2[rand(head2)];
            } else if (gender === 'F') {
                return Math.random() < 0.6 ? head2F[rand(head2F)] : head2[rand(head2)];
            }
            return head2[rand(head2)];
        };
        const pickCoda = () => {
            if (gender === 'F') {
                return Math.random() < 0.5 ? codaF[rand(codaF)] : coda[rand(coda)];
            }
            // 男和中性只用基础coda
            return coda[rand(coda)];
        };
        const pickTail2 = () => {
            if (gender === 'F') {
                return Math.random() < 0.5 ? tail2F[rand(tail2F)] : tail2[rand(tail2)];
            }
            // 男和中性只用中性tail2
            return tail2[rand(tail2)];
        };

        // —— 姓名模式定义 ——
        const patterns = [
            // ① 双字名
            () => pickOnset() + pickCoda(),

            // ② 三字名
            () => {
                const m = (gender === 'F' && Math.random() < 0.5) ? medialF[rand(medialF)] : medial[rand(medial)];
                return pickOnset() + m + pickCoda();
            },

            // ③ 三字名A：head2 × coda
            () => pickHead2() + pickCoda(),

            // ④ 三字名B：onset × tail2
            () => pickOnset() + pickTail2(),

            // ⑤ 四字名：head2 × tail2
            () => pickHead2() + pickTail2(),

            // ⑥ 三字名C：head2 × 单字尾
            () => {
                // 男用硬朗单字尾，女用偏柔单字尾
                const tailMale = ['德','昂','峰','昊','辉','杰','凯','朗','雷','龙',
                    '铭','宁','鹏','谦','然','朔','泰','天','威','翔','曜','宇','泽','昭','卓',
                    '安','达','恩','克','斯','塔','特','文','亚','伊','英'];
                const tailFemale = ['兰','琳','洛','姆','娜','妮','琪','瑞','莎','丝',
                    '薇','岚','绮','露','芳','蕊','蓉','萱','莹','瑶','馨','茜','妍','婷'];
                const tail = (gender === 'F') ? tailFemale : tailMale;
                return pickHead2() + tail[rand(tail)];
            },

            // ⑦ 双字名B
            () => pickOnset() + pickHead2().charAt(1),
        ];

        const rand = arr => Math.floor(Math.random() * arr.length);
        return patterns[rand(patterns)]();
    },

    renderStatAllocation() {
        const container = document.getElementById('stat-allocation');
        const cls = GameData.classes[this.selectedClass];
        if (!cls) return;

        const stats = [
            { key: 'HP', name: 'HP' },
            { key: 'TP', name: 'TP' },
            { key: 'STR', name: '力量' },
            { key: 'INT', name: '智力' },
            { key: 'VIT', name: '体质' },
            { key: 'AGI', name: '敏捷' },
            { key: 'LUC', name: '幸运' }
        ];

        container.innerHTML = stats.map(stat => `
            <div class="stat-row">
                <span class="stat-name">${stat.name}</span>
                <span class="stat-value" id="stat-${stat.key}">${this.regStats[stat.key] || cls.baseStats[stat.key]}</span>
                <div class="stat-controls">
                    <button class="stat-btn" onclick="Guild.adjustStat('${stat.key}', -1)" id="btn-minus-${stat.key}">-</button>
                    <button class="stat-btn" onclick="Guild.adjustStat('${stat.key}', 1)" id="btn-plus-${stat.key}">+</button>
                </div>
            </div>
        `).join('');

        this.updateStatButtons();
    },

    adjustStat(stat, delta) {
        if (this.bonusPoints <= 0 && delta > 0) return;
        
        const cls = GameData.classes[this.selectedClass];
        const baseValue = cls.baseStats[stat];
        const currentValue = this.regStats[stat] || baseValue;
        
        if (delta > 0 && this.bonusPoints > 0) {
            this.regStats[stat] = currentValue + 1;
            this.bonusPoints--;
        } else if (delta < 0 && currentValue > baseValue) {
            this.regStats[stat] = currentValue - 1;
            this.bonusPoints++;
        }

        document.getElementById(`stat-${stat}`).textContent = this.regStats[stat];
        document.getElementById('bonus-points').textContent = this.bonusPoints;
        this.updateStatButtons();
    },

    updateStatButtons() {
        const cls = GameData.classes[this.selectedClass];
        ['HP', 'TP', 'STR', 'INT', 'VIT', 'AGI', 'LUC'].forEach(stat => {
            const baseValue = cls.baseStats[stat];
            const currentValue = this.regStats[stat] || baseValue;
            const minusBtn = document.getElementById(`btn-minus-${stat}`);
            const plusBtn = document.getElementById(`btn-plus-${stat}`);
            if (minusBtn) minusBtn.disabled = currentValue <= baseValue;
            if (plusBtn) plusBtn.disabled = this.bonusPoints <= 0;
        });
    },

    autoAllocate() {
        const cls = GameData.classes[this.selectedClass];
        this.regStats = { ...cls.baseStats };
        
        // 根据职业特点自动分配
        const priority = {
            warrior: ['STR', 'VIT', 'HP'],
            mage: ['INT', 'TP', 'AGI'],
            medic: ['INT', 'TP', 'VIT'],
            ranger: ['AGI', 'STR', 'LUC']
        };

        const prefs = priority[this.selectedClass] || ['STR', 'VIT', 'HP'];
        let points = 5;
        let idx = 0;
        
        while (points > 0) {
            const stat = prefs[idx % prefs.length];
            this.regStats[stat]++;
            points--;
            idx++;
        }

        this.bonusPoints = 0;
        this.renderStatAllocation();
        document.getElementById('bonus-points').textContent = 0;
    },

    resetStats() {
        const cls = GameData.classes[this.selectedClass];
        this.regStats = { ...cls.baseStats };
        this.bonusPoints = 5;
        this.renderStatAllocation();
        document.getElementById('bonus-points').textContent = 5;
    },

    renderConfirmCard() {
        const container = document.getElementById('confirm-card');
        const cls = GameData.classes[this.selectedClass];
        if (!cls) return;
        const appearance = cls.appearances ? cls.appearances[this.selectedAppearance] : null;
        if (!appearance) return;
        const name = document.getElementById('reg-char-name').value || '未命名';

        container.innerHTML = `
            <img src="${appearance.portrait}" alt="${name}">
            <div class="confirm-info">
                <h4>${name}</h4>
                <p>职业: ${cls.name}</p>
                <p>外貌: ${appearance.desc}</p>
                <div class="confirm-stats">
                    <div class="confirm-stat"><span>HP</span><span>${this.regStats.HP}</span></div>
                    <div class="confirm-stat"><span>TP</span><span>${this.regStats.TP}</span></div>
                    <div class="confirm-stat"><span>力量</span><span>${this.regStats.STR}</span></div>
                    <div class="confirm-stat"><span>智力</span><span>${this.regStats.INT}</span></div>
                    <div class="confirm-stat"><span>体质</span><span>${this.regStats.VIT}</span></div>
                    <div class="confirm-stat"><span>敏捷</span><span>${this.regStats.AGI}</span></div>
                    <div class="confirm-stat"><span>幸运</span><span>${this.regStats.LUC}</span></div>
                </div>
            </div>
        `;
    },

    registerCharacter() {
        const nameInput = document.getElementById('reg-char-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            Dialog.show('请输入冒险者名称！');
            return;
        }

        const cls = GameData.classes[this.selectedClass];
        if (!cls) return;
        const appearance = cls.appearances ? cls.appearances[this.selectedAppearance] : null;
        if (!appearance) {
            Dialog.show('请先完成外貌选择！');
            return;
        }
        const roster = this.getRoster();

        if (roster.length >= 30) {
            Dialog.show('冒险者仓库已满！');
            return;
        }

        const character = {
            id: Date.now().toString(),
            name: name,
            classId: this.selectedClass,
            className: cls.name,
            level: 1,
            exp: 0,
            expToNext: 20,
            appearance: this.selectedAppearance,
            portrait: appearance.portrait,
            icon: appearance.icon,
            stats: { ...cls.baseStats, ...this.regStats },
            maxStats: { ...cls.baseStats, ...this.regStats },
            skills: cls.skills.filter(s => s.level <= 1).map(s => ({ ...s })),
            equipment: { weapon: null, armor: null, accessory: null },

            // AI战斗配置（默认平衡型）
            aiConfig: JSON.parse(JSON.stringify(GameData.aiPresets.balanced)),

            // 战斗数据收集（用于AI进化）
            battleData: {
                battleExp: 0,
                expToEvolve: 100,
                battles: 0,
                wins: 0,
                losses: 0,
                totalDamageDealt: 0,
                totalDamageTaken: 0,
                totalHealingDone: 0,
                deathCount: 0,
                actions: { attack: 0, defend: 0, flee: 0, skills: {}, items: {} },
                enemyTypes: {},
                criticalMoments: []
            }
        };

        roster.push(character);
        if (nameInput) nameInput.value = '';
        this.updateSubtitle();
        // 保存游戏状态
        Game.saveGame();
        // 返回主界面
        this.backToMain();
        this.renderRosterInfo();

        Dialog.show(`${name}（${cls.name}）已登记到冒险者仓库！`);
    },

    addToParty(charId) {
        const party = this.getParty();
        const roster = this.getRoster();
        
        if (party.length >= 5) {
            Dialog.show('队伍已满！');
            return;
        }

        const char = roster.find(c => c.id === charId);
        if (!char) return;

        if (party.find(c => c.id === charId)) {
            Dialog.show('该角色已在队伍中！');
            return;
        }

        party.push(char);
        Game.saveGame();
        this.renderFormation();
        Dialog.show(`${char.name} 已加入队伍！`);
    },

    removeFromParty(charId) {
        const party = this.getParty();
        const idx = party.findIndex(c => c.id === charId);
        if (idx >= 0) {
            const char = party[idx];
            party.splice(idx, 1);
            Game.saveGame();
            this.renderFormation();
            Dialog.show(`${char.name} 已从队伍中移除。`);
        }
    },

    deleteFromRoster(charId) {
        const roster = this.getRoster();
        const char = roster.find(c => c.id === charId);
        if (!char) return;

        Dialog.show(`确定要将 ${char.name} 从冒险者仓库中除名吗？`, () => {
            const idx = roster.findIndex(c => c.id === charId);
            if (idx >= 0) {
                roster.splice(idx, 1);
                // 刷新当前可见的视图
                if (document.getElementById('guild-party-info').style.display === 'block') {
                    this.renderRosterInfo();
                }
                if (document.getElementById('guild-formation').style.display === 'block') {
                    this.renderRosterFormation();
                }
                this.updateSubtitle();
                Game.saveGame();
                Dialog.show(`${char.name} 已从冒险者仓库中除名。`);
            }
        });
    }
};

export default Guild;
