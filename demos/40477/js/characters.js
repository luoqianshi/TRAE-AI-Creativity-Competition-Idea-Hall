// ========== 皮影角色素材库 ==========
// 每个角色使用 SVG 绘制，采用传统皮影配色：黑、红、金、米黄

const SHADOW_CHARACTERS = {
  scholar: {
    id: 'scholar',
    name: '书生',
    desc: '儒雅才子，诵读诗书',
    primaryColor: '#2d5a7b',
    accentColor: '#d4a84b',
    svg: `
      <svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
        <!-- 帽子 -->
        <ellipse cx="50" cy="18" rx="28" ry="8" fill="#1a1a1a" stroke="#d4a84b" stroke-width="1"/>
        <path d="M22 18 Q22 10 50 8 Q78 10 78 18 L72 20 L28 20 Z" fill="#2d2420" stroke="#d4a84b" stroke-width="1"/>
        <rect x="42" y="12" width="16" height="6" fill="#c1272d"/>
        <!-- 头 -->
        <ellipse cx="50" cy="35" rx="18" ry="20" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 面部表情 -->
        <ellipse cx="42" cy="33" rx="2" ry="3" fill="#1a1a1a"/>
        <ellipse cx="58" cy="33" rx="2" ry="3" fill="#1a1a1a"/>
        <path d="M45 43 Q50 46 55 43" stroke="#8b1a1f" stroke-width="1.5" fill="none"/>
        <!-- 胡须 -->
        <path d="M45 46 L43 55 M50 47 L50 57 M55 46 L57 55" stroke="#2d2420" stroke-width="1" fill="none"/>
        <!-- 脖子 -->
        <rect x="46" y="52" width="8" height="8" fill="#e8d9b8"/>
        <!-- 长袍身体 -->
        <path d="M25 60 Q25 58 30 58 L70 58 Q75 58 75 60 L80 130 L70 135 L30 135 L20 130 Z"
              fill="#2d5a7b" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 衣领 -->
        <path d="M40 58 L50 75 L60 58" fill="#8b1a1f" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 腰带 -->
        <rect x="22" y="100" width="56" height="8" fill="#d4a84b" stroke="#8b6914" stroke-width="0.5"/>
        <rect x="45" y="98" width="10" height="12" fill="#c1272d" stroke="#8b6914" stroke-width="0.5"/>
        <!-- 装饰纹样 -->
        <circle cx="50" cy="85" r="4" fill="#d4a84b" stroke="#8b6914" stroke-width="0.5"/>
        <path d="M42 85 L48 85 M52 85 L58 85 M50 77 L50 93 M44 79 L56 91 M56 79 L44 91"
              stroke="#d4a84b" stroke-width="0.5" stroke-opacity="0.6"/>
        <!-- 左手（持书） -->
        <ellipse cx="18" cy="85" rx="6" ry="8" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <rect x="10" y="78" width="16" height="12" fill="#f4e9d3" stroke="#8b1a1f" stroke-width="1"/>
        <line x1="12" y1="82" x2="24" y2="82" stroke="#8b1a1f" stroke-width="0.5"/>
        <line x1="12" y1="85" x2="24" y2="85" stroke="#8b1a1f" stroke-width="0.5"/>
        <!-- 右手 -->
        <ellipse cx="82" cy="85" rx="6" ry="8" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 脚 -->
        <ellipse cx="38" cy="145" rx="10" ry="6" fill="#1a1a1a"/>
        <ellipse cx="62" cy="145" rx="10" ry="6" fill="#1a1a1a"/>
        <!-- 关节阴影线 -->
        <line x1="50" y1="60" x2="50" y2="130" stroke="#1a1a1a" stroke-width="0.3" stroke-dasharray="3,3"/>
      </svg>
    `
  },

  lady: {
    id: 'lady',
    name: '佳人',
    desc: '温婉淑女，长袖善舞',
    primaryColor: '#c1272d',
    accentColor: '#d4a84b',
    svg: `
      <svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
        <!-- 头饰 -->
        <path d="M25 15 Q25 8 50 5 Q75 8 75 15 L75 22 L25 22 Z" fill="#1a1a1a" stroke="#d4a84b" stroke-width="1"/>
        <circle cx="50" cy="10" r="4" fill="#d4a84b"/>
        <circle cx="30" cy="15" r="3" fill="#c1272d"/>
        <circle cx="70" cy="15" r="3" fill="#c1272d"/>
        <!-- 流苏 -->
        <line x1="30" y1="18" x2="28" y2="28" stroke="#d4a84b" stroke-width="1"/>
        <line x1="70" y1="18" x2="72" y2="28" stroke="#d4a84b" stroke-width="1"/>
        <!-- 头 -->
        <ellipse cx="50" cy="38" rx="17" ry="20" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 头发 -->
        <path d="M33 28 Q33 22 50 20 Q67 22 67 28 L67 35 Q67 30 50 30 Q33 30 33 35 Z" fill="#1a1a1a"/>
        <!-- 面部 -->
        <ellipse cx="42" cy="36" rx="1.5" ry="2.5" fill="#1a1a1a"/>
        <ellipse cx="58" cy="36" rx="1.5" ry="2.5" fill="#1a1a1a"/>
        <ellipse cx="42" cy="38" rx="3" ry="1" fill="#f4b6b6" opacity="0.5"/>
        <ellipse cx="58" cy="38" rx="3" ry="1" fill="#f4b6b6" opacity="0.5"/>
        <path d="M46 46 Q50 48 54 46" stroke="#8b1a1f" stroke-width="1.5" fill="none"/>
        <!-- 脖子 -->
        <rect x="46" y="55" width="8" height="8" fill="#e8d9b8"/>
        <!-- 身体（飘逸长裙） -->
        <path d="M28 63 Q28 60 32 60 L68 60 Q72 60 72 63 L85 145 L75 150 L25 150 L15 145 Z"
              fill="#c1272d" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 衣领 -->
        <path d="M40 62 L50 78 L60 62" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 金色腰带 -->
        <rect x="18" y="105" width="64" height="6" fill="#d4a84b" stroke="#8b6914" stroke-width="0.5"/>
        <!-- 花纹装饰 -->
        <circle cx="35" cy="88" r="3" fill="#d4a84b" stroke="#8b6914" stroke-width="0.3"/>
        <circle cx="65" cy="88" r="3" fill="#d4a84b" stroke="#8b6914" stroke-width="0.3"/>
        <circle cx="50" cy="95" r="4" fill="#d4a84b" stroke="#8b6914" stroke-width="0.3"/>
        <path d="M45 95 Q50 100 55 95 Q50 90 45 95" fill="#f4e9d3" stroke="#8b6914" stroke-width="0.3"/>
        <!-- 水袖（左） -->
        <path d="M28 63 Q15 80 18 100 Q22 85 30 80 Z" fill="#c1272d" stroke="#1a1a1a" stroke-width="1" opacity="0.9"/>
        <path d="M18 100 Q10 115 15 130 Q20 115 25 110 Z" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 水袖（右） -->
        <path d="M72 63 Q85 80 82 100 Q78 85 70 80 Z" fill="#c1272d" stroke="#1a1a1a" stroke-width="1" opacity="0.9"/>
        <path d="M82 100 Q90 115 85 130 Q80 115 75 110 Z" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 裙褶 -->
        <path d="M30 110 L35 145 M50 110 L50 150 M70 110 L65 145 M40 110 L42 145 M60 110 L58 145"
              stroke="#8b1a1f" stroke-width="0.5" stroke-opacity="0.4"/>
        <!-- 脚 -->
        <ellipse cx="38" cy="153" rx="8" ry="4" fill="#1a1a1a"/>
        <ellipse cx="62" cy="153" rx="8" ry="4" fill="#1a1a1a"/>
      </svg>
    `
  },

  warrior: {
    id: 'warrior',
    name: '将军',
    desc: '威武猛将，手持长枪',
    primaryColor: '#8b1a1f',
    accentColor: '#d4a84b',
    svg: `
      <svg viewBox="0 0 100 170" xmlns="http://www.w3.org/2000/svg">
        <!-- 头盔 -->
        <path d="M22 20 Q22 8 50 5 Q78 8 78 20 L78 30 L22 30 Z" fill="#2d2420" stroke="#d4a84b" stroke-width="1.5"/>
        <path d="M45 5 Q50 0 55 5 L55 15 L45 15 Z" fill="#c1272d" stroke="#d4a84b" stroke-width="1"/>
        <!-- 护额 -->
        <rect x="28" y="22" width="44" height="8" fill="#8b1a1f" stroke="#d4a84b" stroke-width="0.5"/>
        <!-- 头 -->
        <ellipse cx="50" cy="42" rx="18" ry="18" fill="#e8c9a0" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 面部 -->
        <ellipse cx="42" cy="40" rx="2" ry="3" fill="#1a1a1a"/>
        <ellipse cx="58" cy="40" rx="2" ry="3" fill="#1a1a1a"/>
        <path d="M38 38 L46 40 M54 40 L62 38" stroke="#1a1a1a" stroke-width="1"/>
        <path d="M45 50 Q50 52 55 50" stroke="#8b1a1f" stroke-width="2" fill="none"/>
        <!-- 胡须 -->
        <path d="M40 52 L35 65 M50 54 L50 70 M60 52 L65 65" stroke="#1a1a1a" stroke-width="1" fill="none"/>
        <!-- 脖子 -->
        <rect x="45" y="58" width="10" height="10" fill="#c9a57b"/>
        <!-- 盔甲身体 -->
        <path d="M22 68 Q22 65 30 65 L70 65 Q78 65 78 68 L82 135 L75 140 L25 140 L18 135 Z"
              fill="#8b1a1f" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 胸甲 -->
        <path d="M35 72 L50 85 L65 72 L65 100 L50 115 L35 100 Z" fill="#2d2420" stroke="#d4a84b" stroke-width="1"/>
        <circle cx="50" cy="95" r="6" fill="#d4a84b" stroke="#8b6914" stroke-width="1"/>
        <circle cx="50" cy="95" r="3" fill="#c1272d"/>
        <!-- 肩甲 -->
        <ellipse cx="22" cy="72" rx="10" ry="8" fill="#2d2420" stroke="#d4a84b" stroke-width="1"/>
        <ellipse cx="78" cy="72" rx="10" ry="8" fill="#2d2420" stroke="#d4a84b" stroke-width="1"/>
        <!-- 盔甲片 -->
        <rect x="28" y="105" width="44" height="6" fill="#2d2420" stroke="#d4a84b" stroke-width="0.5"/>
        <rect x="28" y="115" width="44" height="6" fill="#2d2420" stroke="#d4a84b" stroke-width="0.5"/>
        <rect x="28" y="125" width="44" height="6" fill="#2d2420" stroke="#d4a84b" stroke-width="0.5"/>
        <!-- 左手（持长枪） -->
        <ellipse cx="15" cy="95" rx="6" ry="8" fill="#e8c9a0" stroke="#1a1a1a" stroke-width="1"/>
        <line x1="15" y1="30" x2="15" y2="160" stroke="#8b6914" stroke-width="3"/>
        <path d="M12 30 L18 30 L20 20 L10 20 Z" fill="#d4a84b" stroke="#8b6914" stroke-width="1"/>
        <!-- 右手 -->
        <ellipse cx="85" cy="95" rx="6" ry="8" fill="#e8c9a0" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 护腿 -->
        <rect x="30" y="140" width="16" height="25" fill="#2d2420" stroke="#d4a84b" stroke-width="0.5"/>
        <rect x="54" y="140" width="16" height="25" fill="#2d2420" stroke="#d4a84b" stroke-width="0.5"/>
        <!-- 战靴 -->
        <ellipse cx="38" cy="165" rx="12" ry="5" fill="#1a1a1a"/>
        <ellipse cx="62" cy="165" rx="12" ry="5" fill="#1a1a1a"/>
      </svg>
    `
  },

  immortal: {
    id: 'immortal',
    name: '仙人',
    desc: '道骨仙风，手持拂尘',
    primaryColor: '#f4e9d3',
    accentColor: '#d4a84b',
    svg: `
      <svg viewBox="0 0 100 170" xmlns="http://www.w3.org/2000/svg">
        <!-- 道冠 -->
        <path d="M35 12 Q50 0 65 12 L60 25 L40 25 Z" fill="#d4a84b" stroke="#8b6914" stroke-width="1"/>
        <circle cx="50" cy="12" r="3" fill="#c1272d"/>
        <!-- 头 -->
        <ellipse cx="50" cy="40" rx="18" ry="20" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 发髻 -->
        <ellipse cx="50" cy="22" rx="12" ry="10" fill="#2d2420"/>
        <!-- 面部 -->
        <ellipse cx="42" cy="38" rx="1.5" ry="2.5" fill="#1a1a1a"/>
        <ellipse cx="58" cy="38" rx="1.5" ry="2.5" fill="#1a1a1a"/>
        <path d="M45 48 Q50 50 55 48" stroke="#8b1a1f" stroke-width="1" fill="none"/>
        <!-- 长须 -->
        <path d="M40 52 Q35 75 38 100 M50 55 Q50 80 50 105 M60 52 Q65 75 62 100"
              stroke="#e8d9b8" stroke-width="2" fill="none" stroke-opacity="0.8"/>
        <!-- 脖子 -->
        <rect x="46" y="58" width="8" height="8" fill="#e8d9b8"/>
        <!-- 道袍 -->
        <path d="M20 66 Q20 62 30 62 L70 62 Q80 62 80 66 L88 150 L75 155 L25 155 L12 150 Z"
              fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 衣领 -->
        <path d="M38 62 L50 82 L62 62" fill="#d4a84b" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 太极图 -->
        <circle cx="50" cy="100" r="12" fill="#1a1a1a" stroke="#d4a84b" stroke-width="1"/>
        <path d="M50 88 A6 6 0 0 1 50 100 A6 6 0 0 0 50 112 A12 12 0 0 1 50 88" fill="#f4e9d3"/>
        <circle cx="50" cy="94" r="2" fill="#1a1a1a"/>
        <circle cx="50" cy="106" r="2" fill="#f4e9d3"/>
        <!-- 腰带 -->
        <rect x="18" y="120" width="64" height="5" fill="#d4a84b" stroke="#8b6914" stroke-width="0.5"/>
        <!-- 左手（持拂尘） -->
        <ellipse cx="15" cy="95" rx="6" ry="8" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <line x1="15" y1="100" x2="5" y2="140" stroke="#8b6914" stroke-width="2"/>
        <path d="M2 130 Q5 140 8 130 Q10 135 8 145 Q5 142 2 145 Q0 138 2 130" fill="#e8d9b8" stroke="#8b6914" stroke-width="0.5"/>
        <!-- 右手 -->
        <ellipse cx="85" cy="95" rx="6" ry="8" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 袍袖 -->
        <path d="M20 66 Q8 85 15 105 Q18 90 25 85 Z" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <path d="M80 66 Q92 85 85 105 Q82 90 75 85 Z" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 脚 -->
        <ellipse cx="38" cy="158" rx="10" ry="5" fill="#1a1a1a"/>
        <ellipse cx="62" cy="158" rx="10" ry="5" fill="#1a1a1a"/>
      </svg>
    `
  },

  clown: {
    id: 'clown',
    name: '丑角',
    desc: '诙谐幽默，逗乐观众',
    primaryColor: '#d4a84b',
    accentColor: '#8b1a1f',
    svg: `
      <svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
        <!-- 帽子 -->
        <path d="M25 18 Q25 5 50 2 Q75 5 75 18 L75 25 L25 25 Z" fill="#8b1a1f" stroke="#d4a84b" stroke-width="1"/>
        <rect x="42" y="8" width="16" height="12" fill="#d4a84b" stroke="#8b6914" stroke-width="0.5"/>
        <circle cx="50" cy="14" r="3" fill="#c1272d"/>
        <!-- 头 -->
        <ellipse cx="50" cy="42" rx="20" ry="22" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 丑角脸谱（白色斑块） -->
        <ellipse cx="50" cy="40" rx="12" ry="10" fill="#ffffff" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 眼睛 -->
        <ellipse cx="42" cy="38" rx="3" ry="4" fill="#ffffff" stroke="#1a1a1a" stroke-width="1"/>
        <ellipse cx="58" cy="38" rx="3" ry="4" fill="#ffffff" stroke="#1a1a1a" stroke-width="1"/>
        <circle cx="42" cy="39" r="1.5" fill="#1a1a1a"/>
        <circle cx="58" cy="39" r="1.5" fill="#1a1a1a"/>
        <!-- 红脸蛋 -->
        <ellipse cx="35" cy="48" rx="5" ry="3" fill="#f4b6b6" opacity="0.7"/>
        <ellipse cx="65" cy="48" rx="5" ry="3" fill="#f4b6b6" opacity="0.7"/>
        <!-- 大红嘴 -->
        <path d="M40 52 Q50 58 60 52 Q50 55 40 52" fill="#c1272d" stroke="#8b1a1f" stroke-width="1"/>
        <!-- 脖子 -->
        <rect x="45" y="62" width="10" height="8" fill="#e8d9b8"/>
        <!-- 身体（戏服） -->
        <path d="M20 70 Q20 66 30 66 L70 66 Q80 66 80 70 L85 140 L72 145 L28 145 L15 140 Z"
              fill="#d4a84b" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 衣领 -->
        <path d="M38 66 L50 85 L62 66" fill="#8b1a1f" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 大红补丁 -->
        <circle cx="35" cy="95" r="8" fill="#c1272d" stroke="#1a1a1a" stroke-width="0.5"/>
        <circle cx="65" cy="95" r="8" fill="#c1272d" stroke="#1a1a1a" stroke-width="0.5"/>
        <text x="35" y="98" text-anchor="middle" fill="#f4e9d3" font-size="8" font-weight="bold">福</text>
        <text x="65" y="98" text-anchor="middle" fill="#f4e9d3" font-size="8" font-weight="bold">喜</text>
        <!-- 腰带 -->
        <rect x="18" y="115" width="64" height="6" fill="#8b1a1f" stroke="#d4a84b" stroke-width="0.5"/>
        <!-- 左手（持扇） -->
        <ellipse cx="15" cy="100" rx="6" ry="8" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <rect x="5" y="95" width="18" height="3" fill="#8b1a1f" stroke="#1a1a1a" stroke-width="0.5" transform="rotate(-20 14 97)"/>
        <!-- 右手 -->
        <ellipse cx="85" cy="100" rx="6" ry="8" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 大袖 -->
        <path d="M20 70 Q5 90 15 115 Q20 95 28 88 Z" fill="#d4a84b" stroke="#1a1a1a" stroke-width="1"/>
        <path d="M80 70 Q95 90 85 115 Q80 95 72 88 Z" fill="#d4a84b" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 脚 -->
        <ellipse cx="38" cy="150" rx="10" ry="5" fill="#1a1a1a"/>
        <ellipse cx="62" cy="150" rx="10" ry="5" fill="#1a1a1a"/>
      </svg>
    `
  },

  princess: {
    id: 'princess',
    name: '公主',
    desc: '尊贵典雅，头戴凤冠',
    primaryColor: '#d4a84b',
    accentColor: '#c1272d',
    svg: `
      <svg viewBox="0 0 100 170" xmlns="http://www.w3.org/2000/svg">
        <!-- 凤冠 -->
        <path d="M20 18 Q20 5 50 0 Q80 5 80 18 L80 28 L20 28 Z" fill="#d4a84b" stroke="#8b6914" stroke-width="1.5"/>
        <!-- 凤凰装饰 -->
        <path d="M35 5 Q38 0 42 5 Q45 2 48 5 L48 12 L35 12 Z" fill="#c1272d" stroke="#8b6914" stroke-width="0.5"/>
        <path d="M52 5 Q55 2 58 5 Q62 0 65 5 L65 12 L52 12 Z" fill="#c1272d" stroke="#8b6914" stroke-width="0.5"/>
        <circle cx="50" cy="8" r="4" fill="#d4a84b" stroke="#8b6914" stroke-width="0.5"/>
        <!-- 垂珠 -->
        <line x1="28" y1="25" x2="26" y2="35" stroke="#d4a84b" stroke-width="1"/>
        <circle cx="26" cy="37" r="2" fill="#d4a84b"/>
        <line x1="72" y1="25" x2="74" y2="35" stroke="#d4a84b" stroke-width="1"/>
        <circle cx="74" cy="37" r="2" fill="#d4a84b"/>
        <line x1="50" y1="20" x2="50" y2="28" stroke="#c1272d" stroke-width="1"/>
        <circle cx="50" cy="30" r="2" fill="#c1272d"/>
        <!-- 头 -->
        <ellipse cx="50" cy="45" rx="17" ry="19" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 面部 -->
        <ellipse cx="42" cy="43" rx="1.5" ry="2.5" fill="#1a1a1a"/>
        <ellipse cx="58" cy="43" rx="1.5" ry="2.5" fill="#1a1a1a"/>
        <ellipse cx="40" cy="46" rx="3" ry="1.5" fill="#f4b6b6" opacity="0.5"/>
        <ellipse cx="60" cy="46" rx="3" ry="1.5" fill="#f4b6b6" opacity="0.5"/>
        <path d="M46 52 Q50 54 54 52" stroke="#8b1a1f" stroke-width="1.5" fill="none"/>
        <!-- 脖子 -->
        <rect x="46" y="62" width="8" height="8" fill="#e8d9b8"/>
        <!-- 华丽宫装 -->
        <path d="M20 70 Q20 66 32 66 L68 66 Q80 66 80 70 L90 155 L72 160 L28 160 L10 155 Z"
              fill="#d4a84b" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- 衣领 -->
        <path d="M40 66 L50 85 L60 66" fill="#c1272d" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 团花装饰 -->
        <circle cx="35" cy="100" r="10" fill="#c1272d" stroke="#8b1a1f" stroke-width="0.5"/>
        <circle cx="35" cy="100" r="6" fill="#d4a84b" stroke="#8b6914" stroke-width="0.3"/>
        <circle cx="35" cy="100" r="3" fill="#f4e9d3"/>
        <circle cx="65" cy="100" r="10" fill="#c1272d" stroke="#8b1a1f" stroke-width="0.5"/>
        <circle cx="65" cy="100" r="6" fill="#d4a84b" stroke="#8b6914" stroke-width="0.3"/>
        <circle cx="65" cy="100" r="3" fill="#f4e9d3"/>
        <!-- 腰带 -->
        <rect x="15" y="125" width="70" height="8" fill="#c1272d" stroke="#d4a84b" stroke-width="0.5"/>
        <!-- 飘带 -->
        <path d="M20 70 Q5 100 15 130 Q8 110 10 90" fill="#c1272d" stroke="#8b1a1f" stroke-width="0.5" opacity="0.8"/>
        <path d="M80 70 Q95 100 85 130 Q92 110 90 90" fill="#c1272d" stroke="#8b1a1f" stroke-width="0.5" opacity="0.8"/>
        <!-- 双手 -->
        <ellipse cx="18" cy="105" rx="6" ry="8" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <ellipse cx="82" cy="105" rx="6" ry="8" fill="#f4e9d3" stroke="#1a1a1a" stroke-width="1"/>
        <!-- 裙褶 -->
        <path d="M30 135 L32 160 M50 135 L50 160 M70 135 L68 160 M40 135 L41 160 M60 135 L59 160"
              stroke="#8b6914" stroke-width="0.5" stroke-opacity="0.4"/>
        <!-- 脚 -->
        <ellipse cx="38" cy="165" rx="8" ry="4" fill="#1a1a1a"/>
        <ellipse cx="62" cy="165" rx="8" ry="4" fill="#1a1a1a"/>
      </svg>
    `
  }
};

// ========== 道具素材库 ==========
const SHADOW_PROPS = {
  table: {
    id: 'table',
    name: '方桌',
    svg: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="15" width="90" height="10" fill="#8b4513" stroke="#1a1a1a" stroke-width="1.5"/>
        <rect x="10" y="25" width="80" height="5" fill="#a0522d" stroke="#1a1a1a" stroke-width="0.5"/>
        <rect x="12" y="30" width="6" height="40" fill="#8b4513" stroke="#1a1a1a" stroke-width="0.5"/>
        <rect x="82" y="30" width="6" height="40" fill="#8b4513" stroke="#1a1a1a" stroke-width="0.5"/>
        <rect x="20" y="8" width="15" height="8" fill="#c1272d" stroke="#1a1a1a" stroke-width="0.5"/>
      </svg>
    `
  },

  lantern: {
    id: 'lantern',
    name: '灯笼',
    svg: `
      <svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
        <line x1="40" y1="0" x2="40" y2="15" stroke="#1a1a1a" stroke-width="1"/>
        <rect x="25" y="12" width="30" height="5" fill="#d4a84b" stroke="#1a1a1a" stroke-width="0.5"/>
        <ellipse cx="40" cy="55" rx="30" ry="35" fill="#c1272d" stroke="#1a1a1a" stroke-width="1.5"/>
        <ellipse cx="40" cy="55" rx="25" ry="30" fill="#8b1a1f" stroke="#d4a84b" stroke-width="0.5"/>
        <text x="40" y="60" text-anchor="middle" fill="#d4a84b" font-size="16" font-weight="bold">福</text>
        <rect x="25" y="88" width="30" height="5" fill="#d4a84b" stroke="#1a1a1a" stroke-width="0.5"/>
        <line x1="40" y1="93" x2="40" y2="100" stroke="#d4a84b" stroke-width="2"/>
        <path d="M35 100 L30 115 M40 100 L40 118 M45 100 L50 115" stroke="#d4a84b" stroke-width="1"/>
      </svg>
    `
  },

  fan: {
    id: 'fan',
    name: '折扇',
    svg: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 90 Q10 50 20 20 Q35 40 50 90" fill="#f4e9d3" stroke="#8b1a1f" stroke-width="1.5"/>
        <path d="M50 90 Q90 50 80 20 Q65 40 50 90" fill="#f4e9d3" stroke="#8b1a1f" stroke-width="1.5"/>
        <path d="M50 90 L50 20" stroke="#8b1a1f" stroke-width="1"/>
        <path d="M50 90 L25 35 M50 90 L75 35 M50 90 L35 25 M50 90 L65 25" stroke="#8b1a1f" stroke-width="0.5"/>
        <circle cx="50" cy="90" r="4" fill="#d4a84b" stroke="#8b1a1f" stroke-width="1"/>
        <path d="M30 40 Q35 45 40 40" stroke="#c1272d" stroke-width="1" fill="none"/>
      </svg>
    `
  },

  sword: {
    id: 'sword',
    name: '宝剑',
    svg: `
      <svg viewBox="0 0 30 150" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="30" width="10" height="90" fill="#c0c0c0" stroke="#1a1a1a" stroke-width="1"/>
        <line x1="15" y1="30" x2="15" y2="120" stroke="#808080" stroke-width="0.5"/>
        <polygon points="10,30 20,30 15,5" fill="#c0c0c0" stroke="#1a1a1a" stroke-width="1"/>
        <rect x="5" y="120" width="20" height="5" fill="#d4a84b" stroke="#1a1a1a" stroke-width="0.5"/>
        <rect x="8" y="125" width="14" height="20" fill="#8b1a1f" stroke="#1a1a1a" stroke-width="0.5"/>
        <circle cx="15" cy="145" r="4" fill="#d4a84b" stroke="#1a1a1a" stroke-width="0.5"/>
      </svg>
    `
  },

  wine: {
    id: 'wine',
    name: '酒壶',
    svg: `
      <svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="40" cy="15" rx="12" ry="5" fill="#8b4513" stroke="#1a1a1a" stroke-width="1"/>
        <rect x="32" y="15" width="16" height="10" fill="#8b4513" stroke="#1a1a1a" stroke-width="0.5"/>
        <ellipse cx="40" cy="60" rx="30" ry="35" fill="#d4a84b" stroke="#1a1a1a" stroke-width="1.5"/>
        <ellipse cx="40" cy="60" rx="22" ry="27" fill="#e8c970" stroke="#8b6914" stroke-width="0.5"/>
        <text x="40" y="65" text-anchor="middle" fill="#8b1a1f" font-size="14" font-weight="bold">酒</text>
        <ellipse cx="40" cy="95" rx="28" ry="4" fill="#8b6914" stroke="#1a1a1a" stroke-width="0.5"/>
      </svg>
    `
  },

  moon: {
    id: 'moon',
    name: '明月',
    svg: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="35" fill="#f4e9d3" stroke="#d4a84b" stroke-width="1" opacity="0.9"/>
        <circle cx="50" cy="50" r="28" fill="#fff8e7" opacity="0.8"/>
        <circle cx="42" cy="42" r="5" fill="#e8d9b8" opacity="0.5"/>
        <circle cx="58" cy="55" r="3" fill="#e8d9b8" opacity="0.5"/>
        <circle cx="45" cy="60" r="2" fill="#e8d9b8" opacity="0.5"/>
      </svg>
    `
  },

  tree: {
    id: 'tree',
    name: '古树',
    svg: `
      <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="42" y="70" width="16" height="45" fill="#5d3a1a" stroke="#1a1a1a" stroke-width="1"/>
        <path d="M48 70 L45 115 M52 70 L55 115" stroke="#3d2410" stroke-width="0.5"/>
        <ellipse cx="50" cy="45" rx="40" ry="35" fill="#2d5a3d" stroke="#1a1a1a" stroke-width="1.5"/>
        <ellipse cx="35" cy="40" rx="18" ry="15" fill="#3d7a4d" opacity="0.8"/>
        <ellipse cx="65" cy="35" rx="20" ry="18" fill="#3d7a4d" opacity="0.8"/>
        <ellipse cx="50" cy="55" rx="22" ry="15" fill="#4d8a5d" opacity="0.6"/>
        <circle cx="40" cy="50" r="3" fill="#c1272d"/>
        <circle cx="60" cy="45" r="3" fill="#c1272d"/>
        <circle cx="55" cy="60" r="3" fill="#c1272d"/>
      </svg>
    `
  },

  flower: {
    id: 'flower',
    name: '牡丹',
    svg: `
      <svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
        <line x1="40" y1="50" x2="40" y2="95" stroke="#2d5a3d" stroke-width="3"/>
        <path d="M40 70 Q30 65 25 75 Q35 80 40 75" fill="#3d7a4d" stroke="#2d5a3d" stroke-width="0.5"/>
        <path d="M40 80 Q50 75 55 85 Q45 90 40 85" fill="#3d7a4d" stroke="#2d5a3d" stroke-width="0.5"/>
        <circle cx="40" cy="40" r="20" fill="#c1272d" stroke="#8b1a1f" stroke-width="1"/>
        <circle cx="40" cy="40" r="15" fill="#e63946" opacity="0.9"/>
        <circle cx="40" cy="40" r="10" fill="#ff6b6b" opacity="0.8"/>
        <circle cx="40" cy="40" r="5" fill="#d4a84b"/>
        <circle cx="32" cy="32" r="8" fill="#ff6b6b" stroke="#c1272d" stroke-width="0.5"/>
        <circle cx="48" cy="32" r="8" fill="#ff6b6b" stroke="#c1272d" stroke-width="0.5"/>
        <circle cx="32" cy="48" r="8" fill="#ff6b6b" stroke="#c1272d" stroke-width="0.5"/>
        <circle cx="48" cy="48" r="8" fill="#ff6b6b" stroke="#c1272d" stroke-width="0.5"/>
      </svg>
    `
  }
};

// ========== 场景背景 ==========
const SHADOW_SCENES = {
  default: {
    id: 'default',
    name: '默认幕布',
    bg: 'linear-gradient(180deg, rgba(244, 233, 211, 0.95) 0%, rgba(232, 217, 184, 0.95) 100%)'
  },
  palace: {
    id: 'palace',
    name: '宫廷',
    bg: 'linear-gradient(180deg, rgba(212, 168, 75, 0.3) 0%, rgba(139, 26, 31, 0.2) 100%)',
    hasDecor: true
  },
  garden: {
    id: 'garden',
    name: '花园',
    bg: 'linear-gradient(180deg, rgba(180, 200, 160, 0.4) 0%, rgba(139, 175, 139, 0.3) 100%)',
    hasDecor: true
  },
  mountain: {
    id: 'mountain',
    name: '山水',
    bg: 'linear-gradient(180deg, rgba(200, 210, 220, 0.3) 0%, rgba(150, 160, 170, 0.3) 100%)',
    hasDecor: true
  },
  night: {
    id: 'night',
    name: '月夜',
    bg: 'linear-gradient(180deg, rgba(50, 60, 100, 0.4) 0%, rgba(80, 70, 120, 0.3) 100%)',
    hasDecor: true
  }
};
