// 数据计算和面板更新模块 - 严谨科普版
// 核心物理定律：E=σT⁴（斯特藩-玻尔兹曼定律）
// 科学口诀：太阳定入口，地面定调性，大气定存留

function calculateData() {
  const { angle, cloud, dust, vapor, co2, time, surface } = state;
  
  // ========== 地面物理属性（精确值）==========
  // 反照率α：反射太阳短波的比例（0-1）
  const albedos = { 
    snow: 0.85,      // 冰雪：0.7~0.9，取中值0.85
    desert: 0.40,    // 沙漠：0.35~0.45，取中值0.40
    city: 0.20,      // 城市：0.15~0.25，取中值0.20
    farmland: 0.25,  // 农田：0.20~0.30，取中值0.25
    forest: 0.15,    // 森林：0.10~0.20，取中值0.15
    lake: 0.08       // 湖泊：0.05~0.10，取中值0.08
  };
  const albedo = albedos[surface] || 0.15;
  
  // 热容量C：储存热量的能力（相对值，水=4.2为基准）
  const heatCapacities = { 
    lake: 4.2,       // 湖泊：水体比热容最大
    forest: 3.5,     // 森林：植被+土壤含水量大
    city: 2.8,       // 城市：建材蓄热+人为热
    farmland: 2.0,   // 农田：中等
    desert: 0.8,     // 沙漠：沙土导热差，极低
    snow: 1.2        // 冰雪：较低
  };
  const heatCapacity = heatCapacities[surface] || 2.0;
  
  // ========== 第一阶段：太阳暖大地（短波辐射S↓）==========
  // 太阳定入口：太阳高度角和云尘决定输入多少热量
  
  // 太阳辐射强度S：由太阳高度角决定
  const solarConstant = 1361; // W/m²
  const angleFactor = Math.sin(angle * Math.PI / 180);
  const S = Math.round(solarConstant * angleFactor); // 到达大气上界的太阳辐射
  
  // 大气对短波的削弱比例α_weaken：由云量、尘埃、太阳高度角（路径长度）决定
  // 太阳高度角越小，穿越大气路径越长，削弱越强
  const pathLengthFactor = 1 / Math.max(0.3, angleFactor); // 大气路径长度因子
  // 云层反射 + 尘埃散射 + 路径长度影响
  const alphaWeaken = Math.min(0.90, (cloud * 0.005 + dust * 0.003 + (1 - angleFactor) * 0.20 * pathLengthFactor));
  
  // 到达地面的太阳辐射量（短波）
  const groundSolar = Math.round(S * (1 - alphaWeaken)); // W/m²
  
  // 地面实际吸收的太阳辐射（扣除反照率反射）
  // 地面定调性：地面类型决定热量如何转化和释放
  const groundAbsorbed = Math.round(groundSolar * (1 - albedo));
  
  // ========== 时间段耦合逻辑 ==========
  // 白天：短波主导，地面净获热
  // 傍晚：过渡期，短波衰减，长波逐渐主导
  // 夜晚：长波主导，无短波输入
  
  const timeFactors = { 
    day: { solar: 1.0, longwave: 0.3 },    // 白天：短波强，长波弱
    dusk: { solar: 0.3, longwave: 0.7 },   // 傍晚：短波衰减，长波增强
    night: { solar: 0.0, longwave: 1.0 }   // 夜晚：无短波，长波主导
  };
  const tf = timeFactors[time] || timeFactors.day;
  
  // ========== 第二阶段：大地暖大气（长波辐射R地↑）==========
  // 地面温度T地：由吸收的能量和热容量决定
  // 热容量越大，温度变化越慢（惯性越大）
  const T_ground_base = 15 + (groundAbsorbed / 100) / heatCapacity * tf.solar;
  
  // 地面长波辐射（斯特藩-玻尔兹曼定律：E=σT⁴）
  // 简化版：地面温度越高，长波辐射越强
  const groundLW = Math.round(groundAbsorbed * 0.65 * tf.longwave);
  
  // ========== 第三阶段：大气还大地（大气逆辐射R逆↓）==========
  // 大气定存留：水汽和CO₂决定热量能留存多久
  
  // 大气对地面长波辐射的吸收率β：由水汽、CO₂、云量决定
  // 水汽是强效温室气体，CO₂定向吸收，云层也吸收长波
  const beta = Math.min(0.85, (vapor * 0.005 + co2 * 0.004 + cloud * 0.003));
  
  // 大气吸收的地面长波辐射量
  const atmoAbsorbed = Math.round(groundLW * beta);
  
  // 大气温度T气：由吸收的地面长波辐射决定
  const T_air_base = 10 + (atmoAbsorbed / 150) * tf.longwave;
  
  // 大气辐射（斯特藩-玻尔兹曼定律简化）
  const atmoRadiation = Math.round(atmoAbsorbed * 0.85);
  
  // 大气逆辐射比例γ：射向地面的比例
  // 云层越多，向下辐射比例越大（保温作用越强）
  const gamma = 0.4 + cloud * 0.005; // 基础40% + 云层影响
  
  // 大气逆辐射（返还给地面的部分）
  const atmoIR = Math.round(atmoRadiation * gamma);
  const atmoIRPercent = Math.round(gamma * 100);
  
  // ========== 能量平衡与温度计算 ==========
  // 地面净能量 = 吸收的太阳辐射 + 大气逆辐射 - 地面长波辐射
  const groundNet = groundAbsorbed + atmoIR - groundLW;
  
  // 净辐射收支Q（用于仪表盘显示）
  const Q = groundNet;
  
  // 最终温度（考虑时间因子和热容量惯性）
  // 热容量越大，温度变化越平缓
  const surfaceTemp = (T_ground_base).toFixed(1);
  const airTemp = (T_air_base).toFixed(1);
  
  // 昼夜温差计算
  // 白天最高温：短波输入最大时
  const dayMax = 15 + (groundAbsorbed / 100) / heatCapacity;
  // 夜晚最低温：长波散失，逆辐射保温
  const nightLoss = groundLW - atmoIR;
  const nightMin = 15 - (nightLoss / 100) / heatCapacity * (1 - beta);
  const tempDiff = Math.max(0, dayMax - nightMin).toFixed(1);
  
  // ========== 瓶颈分析 ==========
  // 判断当前场景的"瓶颈环节"
  let bottleneck = '';
  let bottleneckDesc = '';
  
  if (surface === 'snow') {
    // 冰雪：反照率极高，吸收S↓极少
    bottleneck = '太阳暖大地（吃不进）';
    bottleneckDesc = '反照率高达' + (albedo * 100).toFixed(0) + '%，S↓被大量拒之门外，R地↑全天微弱，后续环节"无米下锅"。';
  } else if (surface === 'desert' && cloud < 30 && time === 'day') {
    // 沙漠晴天：白天R地↑极强，但R逆↓极弱
    bottleneck = '大气还大地（锁不住）';
    bottleneckDesc = '白天R地↑极强，但R逆↓极弱（云量仅' + cloud + '%），热量"来得快去得快"，昼夜温差大。';
  } else if (surface === 'lake' || (surface === 'forest' && cloud >= 40)) {
    // 湖泊/森林多云：三环通畅
    bottleneck = '无瓶颈（三环通畅）';
    bottleneckDesc = '吸收S↓高效，热容量' + heatCapacity.toFixed(1) + '缓冲剧烈波动，R逆↓强效补偿，温度变化平缓。';
  } else if (surface === 'city' && time === 'night') {
    // 城市夜晚：蓄热释放
    bottleneck = '大地暖大气（额外增强）';
    bottleneckDesc = '白天蓄积的热量在夜间集中释放，R地↑反常强劲，近似"人工热源"，延续大气加热。';
  } else {
    bottleneck = '正常流转';
    bottleneckDesc = '三环辐射正常传递，无明显瓶颈。';
  }
  
  // ========== 返回完整物理数据 ==========
  return {
    // 短波辐射参数
    S,                          // 太阳辐射强度（到达大气上界）
    alphaWeaken,                // 大气削弱比例（短波）
    groundSolar,                // 到达地面的太阳辐射
    groundAbsorbed,             // 地面实际吸收的太阳辐射（扣除反照率）
    albedo,                     // 地面反照率
    
    // 长波辐射参数
    T_ground: parseFloat(surfaceTemp),  // 地面温度
    groundLW,                   // 地面长波辐射
    beta,                       // 大气吸收率（长波）
    atmoAbsorbed,               // 大气吸收的地面辐射
    
    // 大气逆辐射参数
    T_air: parseFloat(airTemp), // 大气温度
    atmoRadiation,              // 大气总辐射
    gamma,                      // 向下分配比例
    atmoIR,                     // 大气逆辐射
    atmoIRPercent,              // 大气逆辐射比例
    
    // 能量平衡
    groundNet,                  // 地面净能量
    Q,                          // 净辐射收支
    tempDiff: parseFloat(tempDiff), // 昼夜温差
    heatCapacity,               // 热容量（辐射惯性）
    
    // 瓶颈分析
    bottleneck,                 // 瓶颈环节
    bottleneckDesc,             // 瓶颈描述
    
    // 兼容原有显示
    solarIntensity: S,
    groundRatio: Math.round((1 - alphaWeaken) * 100),
    atmoRatio: Math.round(alphaWeaken * 100),
    groundEnergy: groundAbsorbed,
    surfaceTemp,
    airTemp
  };
}

function updateDataPanel() {
  const d = calculateData();
  
  // 更新数据显示
  document.getElementById('solarIntensity').textContent = d.solarIntensity + ' W/m²';
  document.getElementById('groundRatio').textContent = d.groundRatio + '%';
  document.getElementById('groundRatioBar').style.width = d.groundRatio + '%';
  document.getElementById('atmoRatio').textContent = d.atmoRatio + '%';
  document.getElementById('atmoRatioBar').style.width = d.atmoRatio + '%';
  document.getElementById('groundEnergy').textContent = d.groundEnergy + ' W/m²';
  document.getElementById('groundLW').textContent = d.groundLW;
  document.getElementById('atmoIR').textContent = d.atmoIR + ' (' + d.atmoIRPercent + '%)';
  document.getElementById('surfaceTemp').textContent = d.surfaceTemp + '°C';
  document.getElementById('airTemp').textContent = d.airTemp + '°C';
  document.getElementById('tempDiff').textContent = d.tempDiff + '°C';
  
  // 更新净辐射收支Q（带正负号指示）
  const qElement = document.getElementById('netRadiationQ');
  if (qElement) {
    const qValue = d.Q;
    const qText = qValue >= 0 ? `+${qValue}` : `${qValue}`;
    qElement.textContent = qText + ' W/m²';
    qElement.className = qValue >= 0 ? 'data-highlight green' : 'data-highlight red';
    
    // 更新箭头指示
    const qArrow = document.getElementById('netRadiationArrow');
    if (qArrow) {
      qArrow.textContent = qValue >= 0 ? '↑ 升温' : '↓ 降温';
      qArrow.style.color = qValue >= 0 ? '#4caf50' : '#ff5252';
    }
  }
  
  // 更新瓶颈分析
  document.getElementById('bottleneckTitle').textContent = d.bottleneck;
  document.getElementById('bottleneckDesc').textContent = d.bottleneckDesc;
  
  // 更新温度曲线图
  updateTempChart(d);
}
