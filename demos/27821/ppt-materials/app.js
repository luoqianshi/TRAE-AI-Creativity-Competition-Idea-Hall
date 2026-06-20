// ===== 素材数据库 =====
const materialsDB = {
    // 基础形状
    shapes: {
        title: '基础形状',
        sections: [
            {
                name: '几何形状',
                items: [
                    { name: '圆形', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '正方形', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '圆角矩形', svg: '<svg viewBox="0 0 64 64"><rect x="6" y="12" width="52" height="40" rx="12" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '三角形', svg: '<svg viewBox="0 0 64 64"><polygon points="32,6 58,54 6,54" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '菱形', svg: '<svg viewBox="0 0 64 64"><polygon points="32,4 60,32 32,60 4,32" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '五边形', svg: '<svg viewBox="0 0 64 64"><polygon points="32,4 60,24 50,56 14,56 4,24" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '六边形', svg: '<svg viewBox="0 0 64 64"><polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '星形', svg: '<svg viewBox="0 0 64 64"><polygon points="32,4 38,24 58,24 42,36 48,56 32,44 16,56 22,36 6,24 26,24" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '心形', svg: '<svg viewBox="0 0 64 64"><path d="M32 56 C32 56 8 40 8 24 C8 14 16 8 24 8 C28 8 32 12 32 16 C32 12 36 8 40 8 C48 8 56 14 56 24 C56 40 32 56 32 56Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '水滴形', svg: '<svg viewBox="0 0 64 64"><path d="M32 8 C32 8 52 28 52 42 C52 54 42 58 32 58 C22 58 12 54 12 42 C12 28 32 8 32 8Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '月牙形', svg: '<svg viewBox="0 0 64 64"><path d="M46 10 C34 10 24 20 24 32 C24 44 34 54 46 54 C38 48 32 40 32 32 C32 24 38 16 46 10Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '十字形', svg: '<svg viewBox="0 0 64 64"><path d="M28 4 L36 4 L36 28 L60 28 L60 36 L36 36 L36 60 L28 60 L28 36 L4 36 L4 28 L28 28Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '椭圆', svg: '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="26" ry="18" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '梯形', svg: '<svg viewBox="0 0 64 64"><polygon points="16,8 48,8 56,48 8,48" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '平行四边形', svg: '<svg viewBox="0 0 64 64"><polygon points="16,8 52,8 44,48 8,48" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '扇形', svg: '<svg viewBox="0 0 64 64"><path d="M32 32 L32 6 A26 26 0 0 1 56 18Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' }
                ]
            },
            {
                name: '线条与边框',
                items: [
                    { name: '直线', svg: '<svg viewBox="0 0 64 64"><line x1="4" y1="32" x2="60" y2="32" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '波浪线', svg: '<svg viewBox="0 0 64 64"><path d="M4 32 Q16 16 28 32 Q40 48 52 32 Q58 26 60 24" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '锯齿线', svg: '<svg viewBox="0 0 64 64"><polyline points="4,32 12,20 20,44 28,20 36,44 44,20 52,44 60,32" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '虚线框', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6,4"/></svg>' },
                    { name: '双边框', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="36" height="36" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' },
                    { name: '圆环', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '弧形', svg: '<svg viewBox="0 0 64 64"><path d="M8 32 A24 24 0 0 1 56 32" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '螺旋', svg: '<svg viewBox="0 0 64 64"><path d="M32 32 m-24 0 a24 24 0 1 0 48 0 a18 18 0 1 1 -36 0 a12 12 0 1 0 24 0" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '点线圆', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4,4"/></svg>' },
                    { name: '双边线', svg: '<svg viewBox="0 0 64 64"><line x1="8" y1="28" x2="56" y2="28" stroke="currentColor" stroke-width="2"/><line x1="8" y1="36" x2="56" y2="36" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '粗边框', svg: '<svg viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="4" fill="none" stroke="currentColor" stroke-width="5"/></svg>' },
                    { name: '圆角双边框', svg: '<svg viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="52" rx="16" fill="none" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="36" height="36" rx="10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' }
                ]
            }
        ]
    },

    // 箭头与流程
    arrows: {
        title: '箭头与流程',
        sections: [
            {
                name: '基础箭头',
                items: [
                    { name: '右箭头', svg: '<svg viewBox="0 0 64 64"><path d="M8 32 L48 32 M36 20 L48 32 L36 44" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '左箭头', svg: '<svg viewBox="0 0 64 64"><path d="M56 32 L16 32 M28 20 L16 32 L28 44" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '上箭头', svg: '<svg viewBox="0 0 64 64"><path d="M32 56 L32 16 M20 28 L32 16 L44 28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '下箭头', svg: '<svg viewBox="0 0 64 64"><path d="M32 8 L32 48 M20 36 L32 48 L44 36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '双向箭头', svg: '<svg viewBox="0 0 64 64"><path d="M16 28 L4 32 L16 36 M48 28 L60 32 L48 36 M12 32 L52 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '粗箭头', svg: '<svg viewBox="0 0 64 64"><path d="M8 24 L40 24 L40 16 L56 32 L40 48 L40 40 L8 40Z" fill="currentColor"/></svg>' },
                    { name: '曲线箭头', svg: '<svg viewBox="0 0 64 64"><path d="M12 48 Q32 48 32 28 Q32 16 44 16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M36 10 L44 16 L36 22" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '转弯箭头', svg: '<svg viewBox="0 0 64 64"><path d="M12 52 L12 20 Q12 8 24 8 L44 8" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M38 2 L44 8 L38 14" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '双头箭头', svg: '<svg viewBox="0 0 64 64"><path d="M16 20 L4 32 L16 44 M48 20 L60 32 L48 44 M12 32 L52 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '虚线箭头', svg: '<svg viewBox="0 0 64 64"><path d="M8 32 L44 32" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6,4"/><path d="M36 24 L48 32 L36 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '分叉箭头', svg: '<svg viewBox="0 0 64 64"><path d="M8 32 L32 32 M32 32 L24 20 M32 32 L24 44 M32 32 L52 24 M32 32 L52 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '循环箭头', svg: '<svg viewBox="0 0 64 64"><path d="M48 20 A20 20 0 1 0 48 44" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M42 14 L48 20 L54 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' }
                ]
            },
            {
                name: '流程图形',
                items: [
                    { name: '开始/结束', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="16" width="48" height="32" rx="16" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '流程节点', svg: '<svg viewBox="0 0 64 64"><rect x="10" y="14" width="44" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '判断菱形', svg: '<svg viewBox="0 0 64 64"><polygon points="32,8 56,32 32,56 8,32" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '输入输出', svg: '<svg viewBox="0 0 64 64"><polygon points="16,14 56,14 48,50 8,50" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '圆形节点', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="4" fill="currentColor"/></svg>' },
                    { name: '文档', svg: '<svg viewBox="0 0 64 64"><path d="M16 8 L48 8 L48 52 Q48 56 44 56 L20 56 Q16 56 16 52Z" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="24" y1="20" x2="40" y2="20" stroke="currentColor" stroke-width="2"/><line x1="24" y1="28" x2="40" y2="28" stroke="currentColor" stroke-width="2"/><line x1="24" y1="36" x2="32" y2="36" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '数据库', svg: '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="14" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 14 L12 50 Q12 58 32 58 Q52 58 52 50 L52 14" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="32" x2="52" y2="32" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '连接线', svg: '<svg viewBox="0 0 64 64"><line x1="8" y1="32" x2="56" y2="32" stroke="currentColor" stroke-width="2" stroke-dasharray="4,4"/><circle cx="8" cy="32" r="3" fill="currentColor"/><circle cx="56" cy="32" r="3" fill="currentColor"/></svg>' },
                    { name: '子流程', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="10" width="48" height="44" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="14" y1="10" x2="14" y2="54" stroke="currentColor" stroke-width="2"/><line x1="50" y1="10" x2="50" y2="54" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '预定义流程', svg: '<svg viewBox="0 0 64 64"><rect x="12" y="14" width="40" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="16" y1="14" x2="16" y2="50" stroke="currentColor" stroke-width="1.5"/><line x1="48" y1="14" x2="48" y2="50" stroke="currentColor" stroke-width="1.5"/></svg>' },
                    { name: '延迟', svg: '<svg viewBox="0 0 64 64"><path d="M8 14 L44 14 Q56 14 56 32 Q56 50 44 50 L8 50Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '合并', svg: '<svg viewBox="0 0 64 64"><polygon points="8,14 56,14 32,50" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' }
                ]
            }
        ]
    },

    // 图标集合
    icons: {
        title: '图标集合',
        sections: [
            {
                name: '商务图标',
                items: [
                    { name: '目标', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="4" fill="currentColor"/></svg>' },
                    { name: '灯泡', svg: '<svg viewBox="0 0 64 64"><path d="M24 52 Q24 58 32 58 Q40 58 40 52" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 48 L42 48 M24 42 L40 42" stroke="currentColor" stroke-width="2.5"/><path d="M32 6 Q48 6 48 28 Q48 38 40 42 L24 42 Q16 38 16 28 Q16 6 32 6Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '奖杯', svg: '<svg viewBox="0 0 64 64"><path d="M16 12 L48 12 L48 20 Q48 36 32 40 Q16 36 16 20Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16 20 Q8 20 8 28 Q8 36 16 36 M48 20 Q56 20 56 28 Q56 36 48 36" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="40" x2="32" y2="52" stroke="currentColor" stroke-width="2.5"/><line x1="24" y1="52" x2="40" y2="52" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '火箭', svg: '<svg viewBox="0 0 64 64"><path d="M32 4 Q44 16 44 36 L32 44 L20 36 Q20 16 32 4Z" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="26" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M20 36 L16 52 L24 44 M44 36 L48 52 L40 44" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '齿轮', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="10" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M32 12 L32 18 M32 46 L32 52 M12 32 L18 32 M46 32 L52 32 M18 18 L22 22 M42 42 L46 46 M18 46 L22 42 M42 22 L46 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>' },
                    { name: '日历', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="14" width="48" height="42" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="8" y1="26" x2="56" y2="26" stroke="currentColor" stroke-width="2.5"/><line x1="22" y1="8" x2="22" y2="18" stroke="currentColor" stroke-width="2.5"/><line x1="42" y1="8" x2="42" y2="18" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '邮件', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="14" width="48" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M8 18 L32 34 L56 18" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '电话', svg: '<svg viewBox="0 0 64 64"><path d="M18 12 Q12 12 12 18 L12 46 Q12 52 18 52 L46 52 Q52 52 52 46 L52 18 Q52 12 46 12Z" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="28" y1="46" x2="36" y2="46" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '用户', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="20" r="10" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M14 52 Q14 36 32 36 Q50 36 50 52" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '团队', svg: '<svg viewBox="0 0 64 64"><circle cx="20" cy="22" r="7" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="44" cy="22" r="7" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="16" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 50 Q10 38 20 38 M54 50 Q54 38 44 38 M20 38 L44 38" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '搜索', svg: '<svg viewBox="0 0 64 64"><circle cx="28" cy="28" r="16" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="40" y1="40" x2="54" y2="54" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>' },
                    { name: '设置', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M32 8 L32 14 M32 50 L32 56 M8 32 L14 32 M50 32 L56 32 M16 16 L20 20 M44 44 L48 48 M16 48 L20 44 M44 20 L48 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>' },
                    { name: '公文包', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="18" width="48" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 18 L22 12 Q22 8 26 8 L38 8 Q42 8 42 12 L42 18" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="8" y1="30" x2="56" y2="30" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '时钟', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="32" x2="32" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="32" y1="32" x2="42" y2="32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' },
                    { name: '地球', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="2.5"/><ellipse cx="32" cy="32" rx="10" ry="24" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="32" x2="56" y2="32" stroke="currentColor" stroke-width="1.5"/><path d="M12 20 Q32 14 52 20" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 44 Q32 50 52 44" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' },
                    { name: '锁', svg: '<svg viewBox="0 0 64 64"><rect x="14" y="26" width="36" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M20 26 L20 18 Q20 8 32 8 Q44 8 44 18 L44 26" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="40" r="4" fill="currentColor"/></svg>' }
                ]
            },
            {
                name: '多媒体图标',
                items: [
                    { name: '播放', svg: '<svg viewBox="0 0 64 64"><polygon points="16,8 56,32 16,56" fill="currentColor"/></svg>' },
                    { name: '暂停', svg: '<svg viewBox="0 0 64 64"><rect x="14" y="8" width="12" height="48" rx="2" fill="currentColor"/><rect x="38" y="8" width="12" height="48" rx="2" fill="currentColor"/></svg>' },
                    { name: '图片', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="26" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 44 L24 30 L36 40 L48 28 L56 36 L56 48 Q56 52 52 52 L12 52 Q8 52 8 48Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '音乐', svg: '<svg viewBox="0 0 64 64"><path d="M24 44 L24 20 L44 14 L44 38" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="46" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="40" cy="40" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '视频', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="14" width="48" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><polygon points="28,24 28,40 42,32" fill="currentColor"/></svg>' },
                    { name: '相机', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="18" width="48" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="35" r="10" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 18 L26 12 L38 12 L42 18" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '麦克风', svg: '<svg viewBox="0 0 64 64"><rect x="24" y="6" width="16" height="28" rx="8" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16 30 Q16 44 32 44 Q48 44 48 30" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="44" x2="32" y2="54" stroke="currentColor" stroke-width="2.5"/><line x1="22" y1="54" x2="42" y2="54" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: 'WiFi', svg: '<svg viewBox="0 0 64 64"><path d="M8 24 Q32 8 56 24" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16 34 Q32 22 48 34" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M24 44 Q32 36 40 44" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="52" r="3" fill="currentColor"/></svg>' },
                    { name: '音量', svg: '<svg viewBox="0 0 64 64"><polygon points="12,20 24,20 40,8 40,56 24,44 12,44" fill="currentColor"/><path d="M44 20 Q52 28 52 32 Q52 36 44 44" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M48 14 Q58 24 58 32 Q58 40 48 50" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '下载', svg: '<svg viewBox="0 0 64 64"><path d="M32 8 L32 40 M20 32 L32 44 L44 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="8" y="46" width="48" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '上传', svg: '<svg viewBox="0 0 64 64"><path d="M32 48 L32 16 M20 24 L32 12 L44 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="8" y="46" width="48" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '链接', svg: '<svg viewBox="0 0 64 64"><path d="M24 40 Q16 40 16 32 Q16 24 24 24 L32 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M40 24 Q48 24 48 32 Q48 40 40 40 L32 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>' }
                ]
            },
            {
                name: '社交图标',
                items: [
                    { name: '点赞', svg: '<svg viewBox="0 0 64 64"><path d="M12 28 L12 52 L24 52 L24 28 Q24 20 16 20 Q12 20 12 28Z" fill="currentColor"/><path d="M28 52 L52 52 Q56 52 56 46 L56 28 Q56 22 50 22 L38 22 L40 12 Q40 8 36 8 Q32 8 30 12 L28 22Z" fill="currentColor"/></svg>' },
                    { name: '分享', svg: '<svg viewBox="0 0 64 64"><circle cx="48" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="16" cy="32" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="48" cy="48" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="22" y1="28" x2="42" y2="20" stroke="currentColor" stroke-width="2"/><line x1="22" y1="36" x2="42" y2="44" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '消息', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="36" rx="8" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16 40 L16 52 L28 40" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '通知', svg: '<svg viewBox="0 0 64 64"><path d="M12 44 L12 28 Q12 12 32 12 Q52 12 52 28 L52 44" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M8 44 L56 44" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M26 48 Q26 54 32 54 Q38 54 38 48" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '书签', svg: '<svg viewBox="0 0 64 64"><path d="M16 8 L48 8 L48 56 L32 44 L16 56Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '眼睛', svg: '<svg viewBox="0 0 64 64"><path d="M8 32 Q32 8 56 32 Q32 56 8 32Z" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="8" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '旗帜', svg: '<svg viewBox="0 0 64 64"><path d="M12 8 L12 56" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M12 10 L48 10 L40 24 L48 38 L12 38" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '定位', svg: '<svg viewBox="0 0 64 64"><path d="M32 8 Q48 8 48 28 Q48 42 32 54 Q16 42 16 28 Q16 8 32 8Z" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="26" r="6" fill="none" stroke="currentColor" stroke-width="2"/></svg>' }
                ]
            }
        ]
    },

    // 徽章与标签
    badges: {
        title: '徽章与标签',
        sections: [
            {
                name: '标签形状',
                items: [
                    { name: '圆角标签', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="20" width="48" height="24" rx="12" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '尖角标签', svg: '<svg viewBox="0 0 64 64"><polygon points="8,20 48,20 56,32 48,44 8,44" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '丝带', svg: '<svg viewBox="0 0 64 64"><path d="M16 8 L48 8 L48 36 L32 44 L16 36Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16 36 L8 52 L20 48 L32 56 L44 48 L56 52 L48 36" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '书签', svg: '<svg viewBox="0 0 64 64"><path d="M16 8 L48 8 L48 56 L32 44 L16 56Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '盾牌', svg: '<svg viewBox="0 0 64 64"><path d="M32 6 L52 14 L52 32 Q52 48 32 56 Q12 48 12 32 L12 14Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '印章', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="32" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' },
                    { name: '对话框', svg: '<svg viewBox="0 0 64 64"><path d="M12 12 L52 12 L52 40 L28 40 L16 52 L16 40 L12 40Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '爆炸形', svg: '<svg viewBox="0 0 64 64"><polygon points="32,4 40,16 52,12 48,24 60,32 48,40 52,52 40,48 32,60 24,48 12,52 16,40 4,32 16,24 12,12 24,16" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '横幅', svg: '<svg viewBox="0 0 64 64"><path d="M4 12 L60 12 L60 28 L32 36 L4 28Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '丝带标签', svg: '<svg viewBox="0 0 64 64"><rect x="12" y="16" width="32" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M44 20 L56 14 L56 42 L44 36" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '价格标签', svg: '<svg viewBox="0 0 64 64"><path d="M32 8 L52 12 L56 32 L32 56 L8 32 L12 12Z" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="24" r="3" fill="currentColor"/></svg>' },
                    { name: '奖牌', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="26" r="16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M24 38 L16 56 L32 48 L48 56 L40 38" fill="none" stroke="currentColor" stroke-width="2"/></svg>' }
                ]
            },
            {
                name: '标记符号',
                items: [
                    { name: '对勾', svg: '<svg viewBox="0 0 64 64"><path d="M10 34 L24 48 L54 14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '叉号', svg: '<svg viewBox="0 0 64 64"><path d="M14 14 L50 50 M50 14 L14 50" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>' },
                    { name: '感叹号', svg: '<svg viewBox="0 0 64 64"><line x1="32" y1="12" x2="32" y2="40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="50" r="3" fill="currentColor"/></svg>' },
                    { name: '问号', svg: '<svg viewBox="0 0 64 64"><path d="M24 24 Q24 12 32 12 Q40 12 40 20 Q40 26 34 30 Q30 33 30 38" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="30" cy="48" r="3" fill="currentColor"/></svg>' },
                    { name: '星标', svg: '<svg viewBox="0 0 64 64"><polygon points="32,6 38,24 56,24 42,34 48,52 32,42 16,52 22,34 8,24 26,24" fill="currentColor"/></svg>' },
                    { name: '爱心', svg: '<svg viewBox="0 0 64 64"><path d="M32 52 C32 52 8 38 8 24 C8 14 16 8 24 8 C28 8 32 12 32 16 C32 12 36 8 40 8 C48 8 56 14 56 24 C56 38 32 52 32 52Z" fill="currentColor"/></svg>' },
                    { name: '火焰', svg: '<svg viewBox="0 0 64 64"><path d="M32 56 Q16 48 16 32 Q16 20 24 12 Q22 24 28 28 Q28 16 32 8 Q36 16 36 28 Q42 24 40 12 Q48 20 48 32 Q48 48 32 56Z" fill="currentColor"/></svg>' },
                    { name: '闪电', svg: '<svg viewBox="0 0 64 64"><polygon points="36,4 20,30 32,30 28,56 44,28 32,28" fill="currentColor"/></svg>' },
                    { name: '加号', svg: '<svg viewBox="0 0 64 64"><line x1="32" y1="12" x2="32" y2="52" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="12" y1="32" x2="52" y2="32" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>' },
                    { name: '减号', svg: '<svg viewBox="0 0 64 64"><line x1="12" y1="32" x2="52" y2="32" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>' },
                    { name: '禁止', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="16" y1="16" x2="48" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>' },
                    { name: '信息', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="22" x2="32" y2="24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="32" y1="30" x2="32" y2="44" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>' }
                ]
            }
        ]
    },

    // 图表元素
    charts: {
        title: '图表元素',
        sections: [
            {
                name: '基础图表',
                items: [
                    { name: '柱状图', svg: '<svg viewBox="0 0 64 64"><rect x="10" y="36" width="10" height="20" rx="2" fill="currentColor"/><rect x="26" y="24" width="10" height="32" rx="2" fill="currentColor" opacity="0.7"/><rect x="42" y="16" width="10" height="40" rx="2" fill="currentColor" opacity="0.4"/></svg>' },
                    { name: '折线图', svg: '<svg viewBox="0 0 64 64"><polyline points="8,48 20,36 32,40 44,24 56,16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="48" r="3" fill="currentColor"/><circle cx="20" cy="36" r="3" fill="currentColor"/><circle cx="32" cy="40" r="3" fill="currentColor"/><circle cx="44" cy="24" r="3" fill="currentColor"/><circle cx="56" cy="16" r="3" fill="currentColor"/></svg>' },
                    { name: '饼图', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M32 32 L32 10 A22 22 0 0 1 50 42Z" fill="currentColor" opacity="0.5"/></svg>' },
                    { name: '环形图', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="80 60" opacity="0.5"/></svg>' },
                    { name: '面积图', svg: '<svg viewBox="0 0 64 64"><path d="M8 48 L20 36 L32 40 L44 24 L56 16 L56 52 L8 52Z" fill="currentColor" opacity="0.3"/><polyline points="8,48 20,36 32,40 44,24 56,16" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '散点图', svg: '<svg viewBox="0 0 64 64"><circle cx="16" cy="44" r="4" fill="currentColor"/><circle cx="28" cy="32" r="5" fill="currentColor" opacity="0.7"/><circle cx="40" cy="24" r="6" fill="currentColor" opacity="0.5"/><circle cx="50" cy="16" r="4" fill="currentColor" opacity="0.8"/><circle cx="22" cy="20" r="3" fill="currentColor"/></svg>' },
                    { name: '雷达图', svg: '<svg viewBox="0 0 64 64"><polygon points="32,8 50,20 50,44 32,56 14,44 14,20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/><polygon points="32,14 44,22 44,40 32,48 20,40 20,22" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5"/><line x1="32" y1="8" x2="32" y2="56" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="14" y1="20" x2="50" y2="44" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="50" y1="20" x2="14" y2="44" stroke="currentColor" stroke-width="1" opacity="0.3"/></svg>' },
                    { name: '气泡图', svg: '<svg viewBox="0 0 64 64"><circle cx="20" cy="40" r="10" fill="currentColor" opacity="0.4"/><circle cx="40" cy="28" r="14" fill="currentColor" opacity="0.3"/><circle cx="32" cy="44" r="6" fill="currentColor" opacity="0.6"/></svg>' },
                    { name: '水平条形图', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="12" width="36" height="10" rx="2" fill="currentColor"/><rect x="8" y="28" width="48" height="10" rx="2" fill="currentColor" opacity="0.7"/><rect x="8" y="44" width="24" height="10" rx="2" fill="currentColor" opacity="0.4"/></svg>' },
                    { name: '堆叠柱状图', svg: '<svg viewBox="0 0 64 64"><rect x="12" y="32" width="12" height="20" rx="1" fill="currentColor"/><rect x="12" y="18" width="12" height="12" rx="1" fill="currentColor" opacity="0.6"/><rect x="30" y="24" width="12" height="28" rx="1" fill="currentColor" opacity="0.7"/><rect x="30" y="10" width="12" height="12" rx="1" fill="currentColor" opacity="0.4"/><rect x="48" y="36" width="12" height="16" rx="1" fill="currentColor" opacity="0.5"/><rect x="48" y="16" width="12" height="18" rx="1" fill="currentColor" opacity="0.3"/></svg>' },
                    { name: '漏斗图', svg: '<svg viewBox="0 0 64 64"><polygon points="8,8 56,8 44,24 20,24" fill="currentColor" opacity="0.9"/><polygon points="20,24 44,24 36,40 28,40" fill="currentColor" opacity="0.6"/><polygon points="28,40 36,40 32,52 32,52" fill="currentColor" opacity="0.3"/></svg>' },
                    { name: '甘特图', svg: '<svg viewBox="0 0 64 64"><line x1="8" y1="16" x2="56" y2="16" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="8" y1="28" x2="56" y2="28" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="8" y1="40" x2="56" y2="40" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="8" y1="52" x2="56" y2="52" stroke="currentColor" stroke-width="1" opacity="0.3"/><rect x="12" y="12" width="20" height="6" rx="2" fill="currentColor"/><rect x="20" y="24" width="28" height="6" rx="2" fill="currentColor" opacity="0.7"/><rect x="8" y="36" width="16" height="6" rx="2" fill="currentColor" opacity="0.5"/></svg>' }
                ]
            },
            {
                name: '数据指标',
                items: [
                    { name: '仪表盘', svg: '<svg viewBox="0 0 64 64"><path d="M8 36 A24 24 0 0 1 56 36" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 36 A24 24 0 0 1 32 12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.5"/><line x1="32" y1="36" x2="20" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="32" cy="36" r="4" fill="currentColor"/></svg>' },
                    { name: '进度条', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="26" width="48" height="12" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="8" y="26" width="32" height="12" rx="6" fill="currentColor" opacity="0.6"/></svg>' },
                    { name: '圆形进度', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="4" opacity="0.2"/><circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="100 50" stroke-linecap="round"/></svg>' },
                    { name: '温度计', svg: '<svg viewBox="0 0 64 64"><rect x="26" y="8" width="12" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="48" r="10" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="29" y="24" width="6" height="20" rx="3" fill="currentColor"/></svg>' },
                    { name: '刻度尺', svg: '<svg viewBox="0 0 64 64"><line x1="8" y1="32" x2="56" y2="32" stroke="currentColor" stroke-width="2"/><line x1="8" y1="28" x2="8" y2="36" stroke="currentColor" stroke-width="2"/><line x1="20" y1="30" x2="20" y2="34" stroke="currentColor" stroke-width="1.5"/><line x1="32" y1="28" x2="32" y2="36" stroke="currentColor" stroke-width="2"/><line x1="44" y1="30" x2="44" y2="34" stroke="currentColor" stroke-width="1.5"/><line x1="56" y1="28" x2="56" y2="36" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '增长箭头', svg: '<svg viewBox="0 0 64 64"><polyline points="8,48 20,36 32,40 44,24 56,16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 16 L56 16 L56 28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '下降箭头', svg: '<svg viewBox="0 0 64 64"><polyline points="8,16 20,28 32,24 44,40 56,48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 48 L56 48 L56 36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    { name: '对比条', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="16" width="20" height="10" rx="2" fill="currentColor"/><rect x="8" y="30" width="36" height="10" rx="2" fill="currentColor" opacity="0.7"/><rect x="8" y="44" width="28" height="10" rx="2" fill="currentColor" opacity="0.4"/></svg>' },
                    { name: '电池', svg: '<svg viewBox="0 0 64 64"><rect x="10" y="20" width="40" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="14" y="24" width="24" height="16" rx="2" fill="currentColor" opacity="0.6"/><rect x="50" y="26" width="4" height="12" rx="1" fill="currentColor"/></svg>' },
                    { name: '信号', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="40" width="8" height="12" rx="1" fill="currentColor"/><rect x="20" y="32" width="8" height="20" rx="1" fill="currentColor" opacity="0.7"/><rect x="32" y="24" width="8" height="28" rx="1" fill="currentColor" opacity="0.5"/><rect x="44" y="16" width="8" height="36" rx="1" fill="currentColor" opacity="0.3"/></svg>' },
                    { name: '速度计', svg: '<svg viewBox="0 0 64 64"><path d="M8 40 A24 24 0 0 1 56 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M16 40 A16 16 0 0 1 48 40" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><line x1="32" y1="40" x2="24" y2="24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>' },
                    { name: '计数器', svg: '<svg viewBox="0 0 64 64"><rect x="8" y="14" width="48" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="8" y1="26" x2="56" y2="26" stroke="currentColor" stroke-width="1.5"/><circle cx="20" cy="20" r="2" fill="currentColor"/><circle cx="32" cy="20" r="2" fill="currentColor"/><circle cx="44" cy="20" r="2" fill="currentColor"/><rect x="16" y="32" width="32" height="12" rx="2" fill="currentColor" opacity="0.3"/></svg>' }
                ]
            }
        ]
    },

    // 装饰元素
    decorations: {
        title: '装饰元素',
        sections: [
            {
                name: '几何装饰',
                items: [
                    { name: '圆点阵列', svg: '<svg viewBox="0 0 64 64"><circle cx="16" cy="16" r="4" fill="currentColor"/><circle cx="32" cy="16" r="4" fill="currentColor" opacity="0.7"/><circle cx="48" cy="16" r="4" fill="currentColor" opacity="0.4"/><circle cx="16" cy="32" r="4" fill="currentColor" opacity="0.7"/><circle cx="32" cy="32" r="4" fill="currentColor"/><circle cx="48" cy="32" r="4" fill="currentColor" opacity="0.7"/><circle cx="16" cy="48" r="4" fill="currentColor" opacity="0.4"/><circle cx="32" cy="48" r="4" fill="currentColor" opacity="0.7"/><circle cx="48" cy="48" r="4" fill="currentColor"/></svg>' },
                    { name: '网格', svg: '<svg viewBox="0 0 64 64"><line x1="16" y1="8" x2="16" y2="56" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="32" y1="8" x2="32" y2="56" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="48" y1="8" x2="48" y2="56" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="8" y1="16" x2="56" y2="16" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="8" y1="32" x2="56" y2="32" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="8" y1="48" x2="56" y2="48" stroke="currentColor" stroke-width="1" opacity="0.5"/></svg>' },
                    { name: '对角线', svg: '<svg viewBox="0 0 64 64"><line x1="8" y1="16" x2="56" y2="16" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="8" y1="32" x2="56" y2="32" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="8" y1="48" x2="56" y2="48" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="16" y1="8" x2="16" y2="56" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="32" y1="8" x2="32" y2="56" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="48" y1="8" x2="48" y2="56" stroke="currentColor" stroke-width="1" opacity="0.3"/></svg>' },
                    { name: '同心圆', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/><circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/><circle cx="32" cy="32" r="10" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"/><circle cx="32" cy="32" r="4" fill="currentColor"/></svg>' },
                    { name: '放射线', svg: '<svg viewBox="0 0 64 64"><line x1="32" y1="32" x2="32" y2="4" stroke="currentColor" stroke-width="1.5"/><line x1="32" y1="32" x2="48" y2="8" stroke="currentColor" stroke-width="1.5" opacity="0.8"/><line x1="32" y1="32" x2="56" y2="24" stroke="currentColor" stroke-width="1.5" opacity="0.6"/><line x1="32" y1="32" x2="56" y2="40" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="32" y1="32" x2="48" y2="56" stroke="currentColor" stroke-width="1.5" opacity="0.2"/></svg>' },
                    { name: '波浪', svg: '<svg viewBox="0 0 64 64"><path d="M4 32 Q16 16 28 32 Q40 48 52 32 Q58 24 60 20" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 40 Q16 24 28 40 Q40 56 52 40" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/></svg>' },
                    { name: '三角形阵列', svg: '<svg viewBox="0 0 64 64"><polygon points="16,16 24,28 8,28" fill="currentColor" opacity="0.8"/><polygon points="40,12 50,26 30,26" fill="currentColor" opacity="0.5"/><polygon points="28,36 38,50 18,50" fill="currentColor" opacity="0.6"/></svg>' },
                    { name: '六边形网格', svg: '<svg viewBox="0 0 64 64"><polygon points="20,10 32,4 44,10 44,22 32,28 20,22" fill="none" stroke="currentColor" stroke-width="1.5"/><polygon points="8,28 20,22 32,28 32,40 20,46 8,40" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.6"/><polygon points="32,28 44,22 56,28 56,40 44,46 32,40" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/></svg>' },
                    { name: '菱形网格', svg: '<svg viewBox="0 0 64 64"><polygon points="32,8 40,16 32,24 24,16" fill="currentColor" opacity="0.6"/><polygon points="32,24 40,32 32,40 24,32" fill="currentColor" opacity="0.4"/><polygon points="32,40 40,48 32,56 24,48" fill="currentColor" opacity="0.2"/></svg>' },
                    { name: '斜纹', svg: '<svg viewBox="0 0 64 64"><line x1="0" y1="16" x2="16" y2="0" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="0" y1="32" x2="32" y2="0" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="0" y1="48" x2="48" y2="0" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="0" y1="64" x2="64" y2="0" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="16" y1="64" x2="64" y2="16" stroke="currentColor" stroke-width="1" opacity="0.3"/><line x1="32" y1="64" x2="64" y2="32" stroke="currentColor" stroke-width="1" opacity="0.3"/></svg>' },
                    { name: '圆环阵列', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="48" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.7"/><circle cx="48" cy="40" r="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><circle cx="32" cy="52" r="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><circle cx="16" cy="40" r="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><circle cx="16" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.7"/></svg>' },
                    { name: '十字阵列', svg: '<svg viewBox="0 0 64 64"><path d="M14 8 L14 20 M8 14 L20 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M32 8 L32 20 M26 14 L38 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.7"/><path d="M50 8 L50 20 M44 14 L56 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/><path d="M14 30 L14 42 M8 36 L20 36" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.7"/><path d="M32 30 L32 42 M26 36 L38 36" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/><path d="M50 30 L50 42 M44 36 L56 36" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.2"/></svg>' }
                ]
            },
            {
                name: '边框装饰',
                items: [
                    { name: '边角装饰', svg: '<svg viewBox="0 0 64 64"><path d="M8 24 L8 8 L24 8" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M56 40 L56 56 L40 56" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '花边', svg: '<svg viewBox="0 0 64 64"><path d="M8 32 Q16 24 24 32 Q32 40 40 32 Q48 24 56 32" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '分割线', svg: '<svg viewBox="0 0 64 64"><line x1="8" y1="32" x2="28" y2="32" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="32" r="3" fill="currentColor"/><line x1="36" y1="32" x2="56" y2="32" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '括号', svg: '<svg viewBox="0 0 64 64"><path d="M24 8 Q12 8 12 20 L12 44 Q12 56 24 56" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M40 8 Q52 8 52 20 L52 44 Q52 56 40 56" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
                    { name: '引号', svg: '<svg viewBox="0 0 64 64"><path d="M16 24 Q12 24 12 30 L12 40 Q12 46 18 46 L20 46 L20 36 L16 36 L16 30 Q16 28 18 28Z" fill="currentColor"/><path d="M36 24 Q32 24 32 30 L32 40 Q32 46 38 46 L40 46 L40 36 L36 36 L36 30 Q36 28 38 28Z" fill="currentColor"/></svg>' },
                    { name: '星芒', svg: '<svg viewBox="0 0 64 64"><path d="M32 4 L34 26 L56 20 L38 32 L56 44 L34 38 L32 60 L30 38 L8 44 L26 32 L8 20 L30 26Z" fill="currentColor"/></svg>' },
                    { name: '藤蔓', svg: '<svg viewBox="0 0 64 64"><path d="M8 56 Q20 40 32 48 Q44 56 56 32" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="44" r="3" fill="currentColor"/><circle cx="32" cy="48" r="3" fill="currentColor"/><circle cx="44" cy="40" r="3" fill="currentColor"/></svg>' },
                    { name: '几何框', svg: '<svg viewBox="0 0 64 64"><rect x="12" y="12" width="40" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="18" y="18" width="28" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><circle cx="32" cy="32" r="6" fill="currentColor" opacity="0.3"/></svg>' },
                    { name: '四角星', svg: '<svg viewBox="0 0 64 64"><path d="M32 4 L36 24 L56 24 L40 32 L48 48 L32 38 L16 48 L24 32 L8 24 L28 24Z" fill="currentColor" opacity="0.6"/></svg>' },
                    { name: '装饰线', svg: '<svg viewBox="0 0 64 64"><line x1="8" y1="32" x2="24" y2="32" stroke="currentColor" stroke-width="1.5"/><circle cx="32" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="40" y1="32" x2="56" y2="32" stroke="currentColor" stroke-width="1.5"/><circle cx="32" cy="32" r="2" fill="currentColor"/></svg>' },
                    { name: '波浪边框', svg: '<svg viewBox="0 0 64 64"><path d="M8 16 Q16 8 24 16 Q32 24 40 16 Q48 8 56 16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 48 Q16 56 24 48 Q32 40 40 48 Q48 56 56 48" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
                    { name: '角花', svg: '<svg viewBox="0 0 64 64"><path d="M8 20 L8 8 L20 8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="14" cy="14" r="3" fill="currentColor"/><path d="M44 8 L56 8 L56 20" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="14" r="3" fill="currentColor"/><path d="M8 44 L8 56 L20 56" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="14" cy="50" r="3" fill="currentColor"/><path d="M56 44 L56 56 L44 56" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="3" fill="currentColor"/></svg>' }
                ]
            }
        ]
    },

    // 文字底板
    'text-bases': {
        title: '文字底板',
        sections: [
            {
                name: '纯色底板',
                items: [
                    { name: '深蓝底板', desc: '稳重专业', bg: '#1e3a5f', text: '#ffffff', borderRadius: '8px', style: 'solid' },
                    { name: '科技蓝底板', desc: '现代科技感', bg: '#0066ff', text: '#ffffff', borderRadius: '12px', style: 'solid' },
                    { name: '活力橙底板', desc: '热情活力', bg: '#f97316', text: '#ffffff', borderRadius: '8px', style: 'solid' },
                    { name: '清新绿底板', desc: '自然环保', bg: '#10b981', text: '#ffffff', borderRadius: '8px', style: 'solid' },
                    { name: '优雅紫底板', desc: '高端优雅', bg: '#7c3aed', text: '#ffffff', borderRadius: '12px', style: 'solid' },
                    { name: '热情红底板', desc: '醒目警示', bg: '#ef4444', text: '#ffffff', borderRadius: '8px', style: 'solid' },
                    { name: '沉稳灰底板', desc: '简约低调', bg: '#4b5563', text: '#ffffff', borderRadius: '8px', style: 'solid' },
                    { name: '温暖黄底板', desc: '阳光积极', bg: '#f59e0b', text: '#1f2937', borderRadius: '8px', style: 'solid' },
                    { name: '粉色底板', desc: '温柔甜美', bg: '#ec4899', text: '#ffffff', borderRadius: '12px', style: 'solid' },
                    { name: '青色底板', desc: '清爽干净', bg: '#06b6d4', text: '#ffffff', borderRadius: '8px', style: 'solid' },
                    { name: '深绿底板', desc: '成熟稳重', bg: '#065f46', text: '#ffffff', borderRadius: '8px', style: 'solid' },
                    { name: '酒红底板', desc: '复古高级', bg: '#881337', text: '#ffffff', borderRadius: '12px', style: 'solid' }
                ]
            },
            {
                name: '渐变底板',
                items: [
                    { name: '日落渐变', desc: '温暖浪漫', bg: 'linear-gradient(135deg, #f97316, #ef4444)', text: '#ffffff', borderRadius: '12px', style: 'gradient' },
                    { name: '海洋渐变', desc: '深邃宁静', bg: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', text: '#ffffff', borderRadius: '12px', style: 'gradient' },
                    { name: '极光渐变', desc: '清新活力', bg: 'linear-gradient(135deg, #10b981, #06b6d4)', text: '#ffffff', borderRadius: '12px', style: 'gradient' },
                    { name: '紫霞渐变', desc: '梦幻优雅', bg: 'linear-gradient(135deg, #8b5cf6, #ec4899)', text: '#ffffff', borderRadius: '12px', style: 'gradient' },
                    { name: '暗夜渐变', desc: '神秘深邃', bg: 'linear-gradient(135deg, #1e1b4b, #4338ca)', text: '#ffffff', borderRadius: '12px', style: 'gradient' },
                    { name: '晨曦渐变', desc: '温柔明亮', bg: 'linear-gradient(135deg, #fef3c7, #fcd34d)', text: '#92400e', borderRadius: '12px', style: 'gradient' },
                    { name: '冰川渐变', desc: '冷冽纯净', bg: 'linear-gradient(135deg, #e0f2fe, #0ea5e9)', text: '#0c4a6e', borderRadius: '12px', style: 'gradient' },
                    { name: '珊瑚渐变', desc: '甜美柔和', bg: 'linear-gradient(135deg, #fff1f2, #f43f5e)', text: '#881337', borderRadius: '12px', style: 'gradient' },
                    { name: '森林渐变', desc: '自然生机', bg: 'linear-gradient(135deg, #064e3b, #10b981)', text: '#ffffff', borderRadius: '12px', style: 'gradient' },
                    { name: '火焰渐变', desc: '热烈激情', bg: 'linear-gradient(135deg, #dc2626, #f59e0b)', text: '#ffffff', borderRadius: '12px', style: 'gradient' },
                    { name: '星空渐变', desc: '浩瀚神秘', bg: 'linear-gradient(135deg, #0f0f13, #4c1d95)', text: '#ffffff', borderRadius: '12px', style: 'gradient' },
                    { name: '蜜桃渐变', desc: '温柔可爱', bg: 'linear-gradient(135deg, #fda4af, #fb923c)', text: '#7f1d1d', borderRadius: '12px', style: 'gradient' }
                ]
            },
            {
                name: '特效底板',
                items: [
                    { name: '毛玻璃效果', desc: '现代通透', bg: 'rgba(255,255,255,0.1)', text: '#ffffff', borderRadius: '16px', style: 'glass', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' },
                    { name: '霓虹发光', desc: '科技感', bg: '#0f0f13', text: '#00ffff', borderRadius: '12px', style: 'neon', boxShadow: '0 0 20px rgba(0,255,255,0.5), inset 0 0 20px rgba(0,255,255,0.1)', border: '2px solid #00ffff' },
                    { name: '立体浮雕', desc: '质感突出', bg: '#e5e7eb', text: '#374151', borderRadius: '12px', style: 'emboss', boxShadow: '4px 4px 8px rgba(0,0,0,0.2), -4px -4px 8px rgba(255,255,255,0.8)' },
                    { name: '内凹效果', desc: '嵌入感', bg: '#d1d5db', text: '#4b5563', borderRadius: '12px', style: 'inset', boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.2), inset -4px -4px 8px rgba(255,255,255,0.8)' },
                    { name: '边框强调', desc: '醒目突出', bg: '#ffffff', text: '#1f2937', borderRadius: '8px', style: 'bordered', border: '4px solid #3b82f6', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' },
                    { name: '虚线边框', desc: '活泼轻快', bg: '#fef3c7', text: '#92400e', borderRadius: '12px', style: 'dashed', border: '3px dashed #f59e0b' },
                    { name: '圆点边框', desc: '可爱俏皮', bg: '#fce7f3', text: '#9d174d', borderRadius: '16px', style: 'dotted', border: '4px dotted #ec4899' },
                    { name: '双层边框', desc: '精致层次', bg: '#ffffff', text: '#1f2937', borderRadius: '8px', style: 'double', border: '6px double #10b981' },
                    { name: '投影悬浮', desc: '轻盈浮起', bg: '#ffffff', text: '#374151', borderRadius: '16px', style: 'floating', boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)' },
                    { name: '金属质感', desc: '高端奢华', bg: 'linear-gradient(135deg, #d4d4d8, #f4f4f5, #a1a1aa)', text: '#27272a', borderRadius: '8px', style: 'metal', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
                    { name: '纸张纹理', desc: '自然质朴', bg: '#fafaf9', text: '#44403c', borderRadius: '4px', style: 'paper', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #e7e5e4' },
                    { name: '胶带效果', desc: '创意手工', bg: '#fef08a', text: '#713f12', borderRadius: '2px', style: 'tape', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transform: 'rotate(-2deg)' }
                ]
            },
            {
                name: '形状底板',
                items: [
                    { name: '圆角标签', desc: '通用标签', bg: '#3b82f6', text: '#ffffff', borderRadius: '24px', style: 'solid', padding: '8px 24px' },
                    { name: '胶囊形状', desc: '按钮风格', bg: '#10b981', text: '#ffffff', borderRadius: '50px', style: 'solid', padding: '8px 28px' },
                    { name: '左侧尖角', desc: '对话指向', bg: '#f97316', text: '#ffffff', borderRadius: '8px', style: 'solid', clipPath: 'polygon(0 50%, 12px 0, 100% 0, 100% 100%, 12px 100%)' },
                    { name: '右侧尖角', desc: '对话指向', bg: '#8b5cf6', text: '#ffffff', borderRadius: '8px', style: 'solid', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)' },
                    { name: '顶部尖角', desc: '提示气泡', bg: '#ef4444', text: '#ffffff', borderRadius: '8px', style: 'solid', clipPath: 'polygon(50% 0, 100% 12px, 100% 100%, 0 100%, 0 12px)' },
                    { name: '底部尖角', desc: '提示气泡', bg: '#06b6d4', text: '#ffffff', borderRadius: '8px', style: 'solid', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), 50% 100%, 0 calc(100% - 12px))' },
                    { name: '六边形底板', desc: '科技蜂巢', bg: '#1e3a5f', text: '#ffffff', borderRadius: '0', style: 'solid', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' },
                    { name: '菱形底板', desc: '独特个性', bg: '#ec4899', text: '#ffffff', borderRadius: '0', style: 'solid', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
                    { name: '平行四边形', desc: '动感速度', bg: '#f59e0b', text: '#1f2937', borderRadius: '0', style: 'solid', clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)' },
                    { name: '梯形底板', desc: '稳定厚重', bg: '#4b5563', text: '#ffffff', borderRadius: '0', style: 'solid', clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' },
                    { name: '旗帜形状', desc: '目标达成', bg: '#dc2626', text: '#ffffff', borderRadius: '0', style: 'solid', clipPath: 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)' },
                    { name: '丝带形状', desc: '荣誉表彰', bg: '#7c3aed', text: '#ffffff', borderRadius: '0', style: 'solid', clipPath: 'polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%, 10% 50%)' }
                ]
            }
        ]
    },

    // 主题配色
    'colors-themes': {
        title: '主题配色',
        sections: [
            {
                name: '专业主题',
                items: [
                    { name: '深海蓝', desc: '沉稳专业，适合商务汇报', colors: ['#0f172a', '#1e3a5f', '#3b82f6', '#60a5fa', '#dbeafe'] },
                    { name: '森林绿', desc: '自然清新，适合环保健康', colors: ['#064e3b', '#065f46', '#10b981', '#34d399', '#d1fae5'] },
                    { name: '石墨灰', desc: '简约现代，适合科技产品', colors: ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#f4f4f5'] },
                    { name: '暖橙金', desc: '活力温暖，适合营销促销', colors: ['#7c2d12', '#c2410c', '#f97316', '#fb923c', '#ffedd5'] },
                    { name: '紫罗兰', desc: '优雅神秘，适合创意艺术', colors: ['#4c1d95', '#6d28d9', '#8b5cf6', '#a78bfa', '#ede9fe'] },
                    { name: '玫瑰红', desc: '浪漫时尚，适合美妆时尚', colors: ['#881337', '#be123c', '#f43f5e', '#fb7185', '#ffe4e6'] },
                    { name: '青柠绿', desc: '活力年轻，适合教育科技', colors: ['#14532d', '#16a34a', '#84cc16', '#a3e635', '#ecfccb'] },
                    { name: '珊瑚橙', desc: '温暖亲和，适合社交生活', colors: ['#9a3412', '#ea580c', '#fb923c', '#fdba74', '#fff7ed'] }
                ]
            },
            {
                name: '季节主题',
                items: [
                    { name: '春日粉', desc: '柔和明媚，春意盎然', colors: ['#831843', '#db2777', '#f472b6', '#f9a8d4', '#fce7f3'] },
                    { name: '夏日青', desc: '清爽活力，夏日清凉', colors: ['#134e4a', '#0d9488', '#14b8a6', '#5eead4', '#ccfbf1'] },
                    { name: '秋日黄', desc: '温暖丰收，金秋时节', colors: ['#713f12', '#a16207', '#eab308', '#facc15', '#fef9c3'] },
                    { name: '冬日白', desc: '纯净冷冽，冬日雪景', colors: ['#1e293b', '#475569', '#94a3b8', '#cbd5e1', '#f8fafc'] },
                    { name: '樱花季', desc: '浪漫粉嫩，樱花盛开', colors: ['#9d174d', '#ec4899', '#f9a8d4', '#fbcfe8', '#fdf2f8'] },
                    { name: '薰衣草', desc: '优雅淡紫，花香四溢', colors: ['#5b21b6', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'] }
                ]
            }
        ]
    },

    // 渐变方案
    gradients: {
        title: '渐变方案',
        sections: [
            {
                name: '线性渐变',
                items: [
                    { name: '日落晚霞', desc: '温暖浪漫', gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #db2777 100%)' },
                    { name: '海洋之心', desc: '深邃宁静', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)' },
                    { name: '极光绿', desc: '清新活力', gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)' },
                    { name: '紫霞仙子', desc: '梦幻优雅', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%)' },
                    { name: '暗夜精灵', desc: '神秘深邃', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' },
                    { name: '晨曦微光', desc: '温柔明亮', gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)' },
                    { name: '冰川蓝', desc: '冷冽纯净', gradient: 'linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 50%, #0ea5e9 100%)' },
                    { name: '珊瑚粉', desc: '甜美柔和', gradient: 'linear-gradient(135deg, #fff1f2 0%, #fda4af 50%, #f43f5e 100%)' },
                    { name: '森林秘境', desc: '幽深静谧', gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #10b981 100%)' },
                    { name: '烈焰红唇', desc: '热烈奔放', gradient: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f97316 100%)' },
                    { name: '银河漫游', desc: '浩瀚宇宙', gradient: 'linear-gradient(135deg, #0f0f13 0%, #1e1b4b 50%, #4c1d95 100%)' },
                    { name: '蜜桃乌龙', desc: '温柔甜美', gradient: 'linear-gradient(135deg, #fda4af 0%, #fb923c 50%, #fcd34d 100%)' }
                ]
            },
            {
                name: '径向渐变',
                items: [
                    { name: '聚光灯', desc: '聚焦中心', gradient: 'radial-gradient(circle at center, #fbbf24 0%, #f59e0b 40%, #d97706 100%)' },
                    { name: '星空', desc: '深邃宇宙', gradient: 'radial-gradient(circle at 30% 30%, #4c1d95 0%, #1e1b4b 60%, #0f0f13 100%)' },
                    { name: '水滴', desc: '晶莹剔透', gradient: 'radial-gradient(circle at 40% 40%, #e0f2fe 0%, #7dd3fc 50%, #0284c7 100%)' },
                    { name: '花瓣', desc: '柔美绽放', gradient: 'radial-gradient(circle at center, #fce7f3 0%, #f9a8d4 40%, #ec4899 100%)' },
                    { name: '日出', desc: '希望新生', gradient: 'radial-gradient(circle at 50% 100%, #fcd34d 0%, #f97316 40%, #dc2626 100%)' },
                    { name: '极光', desc: '梦幻绚丽', gradient: 'radial-gradient(circle at 50% 0%, #10b981 0%, #06b6d4 40%, #3b82f6 100%)' }
                ]
            }
        ]
    },

    // 色彩搭配
    combinations: {
        title: '色彩搭配',
        sections: [
            {
                name: '经典搭配',
                items: [
                    { name: '经典蓝白', desc: '永恒优雅，商务首选', colors: ['#1e40af', '#3b82f6', '#93c5fd', '#dbeafe', '#ffffff'], tags: ['商务', '专业'] },
                    { name: '红黑力量', desc: '强烈对比，视觉冲击', colors: ['#7f1d1d', '#dc2626', '#fca5a5', '#1f2937', '#111827'], tags: ['运动', '科技'] },
                    { name: '绿白清新', desc: '自然健康，环保主题', colors: ['#14532d', '#16a34a', '#86efac', '#dcfce7', '#f0fdf4'], tags: ['环保', '健康'] },
                    { name: '金黑奢华', desc: '高端大气，奢华品质', colors: ['#92400e', '#d97706', '#fcd34d', '#1c1917', '#000000'], tags: ['奢侈', '高端'] },
                    { name: '粉灰温柔', desc: '柔和现代，女性主题', colors: ['#9d174d', '#ec4899', '#f9a8d4', '#6b7280', '#f3f4f6'], tags: ['时尚', '美妆'] },
                    { name: '橙蓝活力', desc: '互补对比，活力四射', colors: ['#c2410c', '#f97316', '#fed7aa', '#1d4ed8', '#1e3a8a'], tags: ['运动', '年轻'] },
                    { name: '紫金尊贵', desc: '高贵典雅，皇室风范', colors: ['#4c1d95', '#7c3aed', '#c4b5fd', '#d97706', '#fcd34d'], tags: ['高端', '庆典'] },
                    { name: '青橙对比', desc: '冷暖碰撞，现代前卫', colors: ['#134e4a', '#14b8a6', '#5eead4', '#f97316', '#ea580c'], tags: ['创意', '艺术'] }
                ]
            },
            {
                name: '现代搭配',
                items: [
                    { name: '薄荷清新', desc: '清凉舒爽，现代简约', colors: ['#0f766e', '#14b8a6', '#5eead4', '#ccfbf1', '#f8fafc'], tags: ['现代', '简约'] },
                    { name: '薰衣草梦', desc: '浪漫梦幻，温柔治愈', colors: ['#5b21b6', '#8b5cf6', '#c4b5fd', '#ede9fe', '#faf5ff'], tags: ['创意', '艺术'] },
                    { name: '珊瑚暖调', desc: '温暖活力，亲切友好', colors: ['#9f1239', '#e11d48', '#fda4af', '#fff1f2', '#ffffff'], tags: ['社交', '生活'] },
                    { name: '深空探索', desc: '深邃神秘，科技前沿', colors: ['#1e1b4b', '#4338ca', '#818cf8', '#c7d2fe', '#eef2ff'], tags: ['科技', '未来'] },
                    { name: '大地色系', desc: '自然质朴，温暖舒适', colors: ['#451a03', '#92400e', '#d97706', '#fde68a', '#fffbeb'], tags: ['自然', '生活'] },
                    { name: '霓虹夜色', desc: '炫酷潮流，都市夜生活', colors: ['#0f0f13', '#4c1d95', '#ec4899', '#06b6d4', '#10b981'], tags: ['潮流', '夜生活'] }
                ]
            }
        ]
    }
};

// ===== 状态管理 =====
let currentCategory = 'shapes';
let searchQuery = '';

// ===== DOM 元素 =====
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const searchInput = document.getElementById('search-input');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// ===== 渲染函数 =====
function renderContent() {
    const data = materialsDB[currentCategory];
    if (!data) return;

    pageTitle.textContent = data.title;
    contentArea.innerHTML = '';

    data.sections.forEach((section, sectionIndex) => {
        // 过滤搜索
        const items = searchQuery 
            ? section.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : section.items;

        if (items.length === 0) return;

        // 分类标题
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = section.name;
        contentArea.appendChild(sectionTitle);

        // 根据类型渲染不同网格
        if (currentCategory === 'colors-themes') {
            renderColorGrid(items);
        } else if (currentCategory === 'gradients') {
            renderGradientGrid(items);
        } else if (currentCategory === 'combinations') {
            renderComboGrid(items);
        } else if (currentCategory === 'text-bases') {
            renderTextBaseGrid(items);
        } else {
            renderMaterialsGrid(items);
        }
    });

    if (contentArea.innerHTML === '') {
        contentArea.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: var(--text-muted);"><p>未找到匹配的素材</p></div>';
    }
}

function renderMaterialsGrid(items) {
    const grid = document.createElement('div');
    grid.className = 'materials-grid';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'material-card';
        card.innerHTML = `
            <div class="preview">${item.svg}</div>
            <span class="name">${item.name}</span>
            <div class="copy-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
        `;
        card.addEventListener('click', () => copyToClipboard(item.svg, `${item.name} 已复制`));
        grid.appendChild(card);
    });

    contentArea.appendChild(grid);
}

function renderColorGrid(items) {
    const grid = document.createElement('div');
    grid.className = 'color-grid';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'color-card';
        
        const swatchesHtml = item.colors.map(color => 
            `<div class="color-swatch" style="background: ${color}">
                <span class="hex">${color}</span>
            </div>`
        ).join('');

        card.innerHTML = `
            <div class="color-preview">${swatchesHtml}</div>
            <div class="color-info">
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            const colorList = item.colors.join(', ');
            copyToClipboard(colorList, `${item.name} 配色已复制`);
        });
        
        grid.appendChild(card);
    });

    contentArea.appendChild(grid);
}

function renderGradientGrid(items) {
    const grid = document.createElement('div');
    grid.className = 'color-grid';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'color-card gradient-card';
        
        card.innerHTML = `
            <div class="color-preview" style="background: ${item.gradient}"></div>
            <div class="color-info">
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            copyToClipboard(item.gradient, `${item.name} 渐变已复制`);
        });
        
        grid.appendChild(card);
    });

    contentArea.appendChild(grid);
}

function renderComboGrid(items) {
    const grid = document.createElement('div');
    grid.className = 'combo-grid';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'combo-card';
        
        const colorsHtml = item.colors.map(color => 
            `<div class="combo-color" style="background: ${color}">
                <span class="tooltip">${color}</span>
            </div>`
        ).join('');

        const tagsHtml = item.tags.map(tag => `<span class="combo-tag">${tag}</span>`).join('');

        card.innerHTML = `
            <div class="combo-colors">${colorsHtml}</div>
            <div class="combo-info">
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
                <div class="combo-tags">${tagsHtml}</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            const colorList = item.colors.join(', ');
            copyToClipboard(colorList, `${item.name} 搭配已复制`);
        });
        
        grid.appendChild(card);
    });

    contentArea.appendChild(grid);
}

function renderTextBaseGrid(items) {
    const grid = document.createElement('div');
    grid.className = 'textbase-grid';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'textbase-card';
        
        const previewStyle = {
            background: item.bg,
            color: item.text,
            borderRadius: item.borderRadius || '8px',
            border: item.border || 'none',
            boxShadow: item.boxShadow || 'none',
            backdropFilter: item.backdropFilter || 'none',
            clipPath: item.clipPath || 'none'
        };
        
        const styleString = Object.entries(previewStyle)
            .filter(([k, v]) => v !== 'none')
            .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v}`)
            .join(';');

        card.innerHTML = `
            <div class="textbase-preview" style="${styleString}">
                <span class="textbase-sample">示例文字</span>
            </div>
            <div class="textbase-info">
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
            </div>
            <div class="copy-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
        `;
        
        card.addEventListener('click', () => {
            const cssCode = `.text-plate {
    background: ${item.bg};
    color: ${item.text};
    border-radius: ${item.borderRadius || '8px'};
    ${item.border && item.border !== 'none' ? `border: ${item.border};` : ''}
    ${item.boxShadow && item.boxShadow !== 'none' ? `box-shadow: ${item.boxShadow};` : ''}
    ${item.backdropFilter && item.backdropFilter !== 'none' ? `backdrop-filter: ${item.backdropFilter};` : ''}
    ${item.clipPath && item.clipPath !== 'none' ? `clip-path: ${item.clipPath};` : ''}
    padding: 12px 24px;
    font-weight: 600;
}`;
            copyToClipboard(cssCode, `${item.name} CSS 已复制`);
        });
        
        grid.appendChild(card);
    });

    contentArea.appendChild(grid);
}

// ===== 复制功能 =====
async function copyToClipboard(text, message) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(message || '已复制到剪贴板');
    } catch (err) {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(message || '已复制到剪贴板');
    }
}

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ===== 导航切换 =====
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 更新激活状态
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // 切换分类
        currentCategory = item.dataset.category;
        searchQuery = '';
        searchInput.value = '';
        
        // 渲染内容
        renderContent();
    });
});

// ===== 搜索功能 =====
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderContent();
});

// ===== 初始化 =====
renderContent();
