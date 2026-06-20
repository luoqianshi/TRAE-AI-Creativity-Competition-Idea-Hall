/* 首页 Hero — 绘制一幅示例年画 SVG */
(function () {
  const host = document.getElementById("heroPainting");
  if (!host) return;

  // 绘制"连年有余"风格：红色底 + 鱼 + 胖娃 + 印章
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 400 340");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.innerHTML = `
    <defs>
      <pattern id="paperTexture" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#fdf6e3"/>
        <circle cx="2" cy="2" r="0.5" fill="#d7c7a5" opacity="0.4"/>
      </pattern>
      <linearGradient id="redG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d9484e"/>
        <stop offset="100%" stop-color="#8a1c22"/>
      </linearGradient>
    </defs>
    <rect width="400" height="340" fill="url(#paperTexture)"/>

    <!-- 外圈装饰边 -->
    <rect x="14" y="14" width="372" height="312" fill="none" stroke="#8a1c22" stroke-width="2"/>
    <rect x="20" y="20" width="360" height="300" fill="none" stroke="#c9a24b" stroke-width="1"/>

    <!-- 胖娃脸 -->
    <g id="kid" style="transform-origin:center;">
      <circle cx="200" cy="150" r="70" fill="#f5cfb0" stroke="#1d1a16" stroke-width="2.5"/>
      <!-- 头发 -->
      <path d="M140 130 Q160 95 200 100 Q240 95 260 130 Q255 115 240 110 Q220 108 200 108 Q180 108 160 110 Q145 115 140 130 Z" fill="#1d1a16"/>
      <!-- 腮红 -->
      <ellipse cx="165" cy="160" rx="14" ry="8" fill="#e89088" opacity="0.7"/>
      <ellipse cx="235" cy="160" rx="14" ry="8" fill="#e89088" opacity="0.7"/>
      <!-- 眼 -->
      <path d="M165 145 Q175 138 185 145" stroke="#1d1a16" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M215 145 Q225 138 235 145" stroke="#1d1a16" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="175" cy="145" r="3" fill="#1d1a16"/>
      <circle cx="225" cy="145" r="3" fill="#1d1a16"/>
      <!-- 嘴 -->
      <path d="M185 175 Q200 185 215 175" stroke="#1d1a16" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- 头顶小辫子 -->
      <circle cx="200" cy="95" r="7" fill="#1d1a16"/>
    </g>

    <!-- 鱼 -->
    <g>
      <!-- 鱼身 -->
      <path d="M100 250 Q140 220 200 230 Q260 220 300 250 Q270 290 200 285 Q130 290 100 250 Z"
            fill="url(#redG)" stroke="#1d1a16" stroke-width="2.5"/>
      <!-- 鱼鳍 -->
      <path d="M170 235 Q160 255 175 270 Q190 260 185 245 Z" fill="#4f7a4a" stroke="#1d1a16" stroke-width="2"/>
      <!-- 鱼鳞 -->
      <g fill="none" stroke="#fdf6e3" stroke-width="1.2" opacity="0.8">
        <path d="M150 245 Q160 255 150 265"/>
        <path d="M170 245 Q180 255 170 265"/>
        <path d="M190 245 Q200 255 190 265"/>
        <path d="M210 245 Q220 255 210 265"/>
        <path d="M230 245 Q240 255 230 265"/>
        <path d="M250 245 Q260 255 250 265"/>
      </g>
      <!-- 鱼尾 -->
      <path d="M295 250 L335 230 L320 255 L340 260 L320 270 L335 285 L295 260 Z"
            fill="#b7282e" stroke="#1d1a16" stroke-width="2.5"/>
      <!-- 鱼眼 -->
      <circle cx="120" cy="245" r="5" fill="#fdf6e3" stroke="#1d1a16" stroke-width="2"/>
      <circle cx="119" cy="245" r="2" fill="#1d1a16"/>
    </g>

    <!-- 装饰莲花 -->
    <g>
      <path d="M70 300 Q75 270 90 280 Q105 270 110 300 Q90 310 70 300 Z" fill="#4f7a4a" stroke="#1d1a16" stroke-width="2"/>
      <circle cx="85" cy="295" r="8" fill="#e89088" stroke="#1d1a16" stroke-width="1.5"/>
      <circle cx="92" cy="292" r="7" fill="#d9484e" stroke="#1d1a16" stroke-width="1.5"/>
    </g>

    <!-- 右侧印章 -->
    <g transform="translate(320, 260)">
      <rect x="0" y="0" width="40" height="40" fill="#b7282e" stroke="#8a1c22" stroke-width="1.5"/>
      <text x="20" y="17" font-family="Ma Shan Zheng, serif" font-size="12" fill="#fdf6e3" text-anchor="middle">年年</text>
      <text x="20" y="33" font-family="Ma Shan Zheng, serif" font-size="12" fill="#fdf6e3" text-anchor="middle">有印</text>
    </g>

    <!-- 左侧小印 -->
    <g transform="translate(30, 40)">
      <rect x="0" y="0" width="30" height="30" fill="#b7282e" opacity="0.9"/>
      <text x="15" y="14" font-family="Ma Shan Zheng, serif" font-size="10" fill="#fdf6e3" text-anchor="middle">年</text>
      <text x="15" y="25" font-family="Ma Shan Zheng, serif" font-size="10" fill="#fdf6e3" text-anchor="middle">画</text>
    </g>
  `;
  host.appendChild(svg);
})();
