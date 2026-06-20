/**
 * 电工电子虚拟仿真教学软件 - 电路分析引擎
 * 实现直流电路的节点电压法分析
 */

class CircuitAnalyzer {
  constructor() {
    this.nodes = [];        // 电路节点
    this.components = [];   // 元件列表
    this.wires = [];        // 连线列表
    this.groundNode = null; // 接地节点
  }

  /**
   * 构建电路拓扑
   * 从元件和连线信息构建节点连接关系
   */
  buildTopology(components, wires) {
    this.components = components;
    this.wires = wires;
    this.nodes = [];

    // 为每个元件端子分配节点
    let nodeId = 0;
    const terminalNodeMap = new Map(); // 端子 -> 节点映射

    // 首先，为所有端子创建独立节点
    components.forEach(comp => {
      const terminals = getTerminalPositions(comp);
      comp.terminals = terminals;
      terminals.forEach(term => {
        const key = `${comp.id}_${term.id}`;
        terminalNodeMap.set(key, nodeId);
        nodeId++;
      });
    });

    // 根据连线合并节点
    wires.forEach(wire => {
      const fromKey = `${wire.fromComp}_${wire.fromTerm}`;
      const toKey = `${wire.toComp}_${wire.toTerm}`;
      const fromNode = terminalNodeMap.get(fromKey);
      const toNode = terminalNodeMap.get(toKey);

      if (fromNode !== undefined && toNode !== undefined) {
        // 合并两个节点（使用并查集思想）
        const minNode = Math.min(fromNode, toNode);
        const maxNode = Math.max(fromNode, toNode);
        
        // 将所有指向maxNode的映射改为minNode
        for (const [key, node] of terminalNodeMap.entries()) {
          if (node === maxNode) {
            terminalNodeMap.set(key, minNode);
          }
        }
      }
    });

    // 重新编号节点
    const nodeRemap = new Map();
    let newNodeId = 0;
    for (const node of terminalNodeMap.values()) {
      if (!nodeRemap.has(node)) {
        nodeRemap.set(node, newNodeId);
        newNodeId++;
      }
    }

    // 更新元件的节点信息
    components.forEach(comp => {
      comp.nodeMap = {};
      comp.terminals.forEach(term => {
        const key = `${comp.id}_${term.id}`;
        const oldNode = terminalNodeMap.get(key);
        comp.nodeMap[term.id] = nodeRemap.get(oldNode);
      });
    });

    this.nodeCount = newNodeId;
    return this.nodeCount;
  }

  /**
   * 直流电路分析 - 节点电压法
   */
  analyzeDC() {
    const n = this.nodeCount;
    if (n === 0) return;

    // 构建导纳矩阵 G 和电流向量 I
    const G = Array(n).fill(null).map(() => Array(n).fill(0));
    const I = Array(n).fill(0);

    // 遍历所有元件，填充矩阵
    this.components.forEach(comp => {
      const lib = ComponentLibrary[comp.type];
      if (!lib) return;

      switch (comp.type) {
        case 'resistor': {
          const r = comp.properties.resistance;
          if (r > 0) {
            const g = 1 / r;
            const n1 = comp.nodeMap[0];
            const n2 = comp.nodeMap[1];
            if (n1 !== undefined && n2 !== undefined) {
              G[n1][n1] += g;
              G[n2][n2] += g;
              G[n1][n2] -= g;
              G[n2][n1] -= g;
            }
          }
          break;
        }

        case 'dcSource': {
          const v = comp.properties.voltage;
          const n1 = comp.nodeMap[0]; // 正极
          const n2 = comp.nodeMap[1]; // 负极
          
          // 使用改进节点法处理电压源
          // 简化处理：将电压源转换为等效电流源（诺顿等效）
          // 或使用超节点法
          if (n1 !== undefined && n2 !== undefined) {
            // 假设内阻很小（理想电压源）
            const r_internal = 0.001; // 1mΩ 内阻
            const g = 1 / r_internal;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
            I[n1] += v * g;
            I[n2] -= v * g;
          }
          break;
        }

        case 'diode': {
          const n1 = comp.nodeMap[0]; // 阳极
          const n2 = comp.nodeMap[1]; // 阴极
          if (n1 !== undefined && n2 !== undefined) {
            // 简化的二极管模型：导通时等效为0.7V电压源+小电阻
            const vf = comp.properties.forwardVoltage || 0.7;
            const r_on = 1; // 导通电阻 1Ω
            const g_on = 1 / r_on;
            
            // 需要先判断导通状态，这里简化处理
            // 实际应该迭代求解
            G[n1][n1] += g_on;
            G[n2][n2] += g_on;
            G[n1][n2] -= g_on;
            G[n2][n1] -= g_on;
            I[n1] += vf * g_on;
            I[n2] -= vf * g_on;
          }
          break;
        }

        case 'led': {
          const n1 = comp.nodeMap[0]; // 阳极
          const n2 = comp.nodeMap[1]; // 阴极
          if (n1 !== undefined && n2 !== undefined) {
            const vf = comp.properties.forwardVoltage || 2.0;
            const r_on = 10; // LED导通电阻较大
            const g_on = 1 / r_on;
            
            G[n1][n1] += g_on;
            G[n2][n2] += g_on;
            G[n1][n2] -= g_on;
            G[n2][n1] -= g_on;
            I[n1] += vf * g_on;
            I[n2] -= vf * g_on;
          }
          break;
        }

        case 'switch': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const state = comp.properties.state;
            if (state === '闭合') {
              // 闭合时等效为很小电阻
              const r = 0.01;
              const g = 1 / r;
              G[n1][n1] += g;
              G[n2][n2] += g;
              G[n1][n2] -= g;
              G[n2][n1] -= g;
            } else {
              // 断开时等效为很大电阻
              const r = 1e9;
              const g = 1 / r;
              G[n1][n1] += g;
              G[n2][n2] += g;
              G[n1][n2] -= g;
              G[n2][n1] -= g;
            }
          }
          break;
        }

        case 'capacitor': {
          // 直流稳态下电容等效为开路
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const r = 1e9; // 开路
            const g = 1 / r;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
          }
          break;
        }

        case 'inductor': {
          // 直流稳态下电感等效为短路
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const r = 0.001; // 短路
            const g = 1 / r;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
          }
          break;
        }

        case 'potentiometer': {
          const r_total = comp.properties.resistance;
          const position = comp.properties.position / 100;
          const r1 = r_total * position;
          const r2 = r_total * (1 - position);
          
          const n_left = comp.nodeMap[0];
          const n_right = comp.nodeMap[1];
          const n_wiper = comp.nodeMap[2];
          
          if (n_left !== undefined && n_wiper !== undefined && r1 > 0) {
            const g1 = 1 / r1;
            G[n_left][n_left] += g1;
            G[n_wiper][n_wiper] += g1;
            G[n_left][n_wiper] -= g1;
            G[n_wiper][n_left] -= g1;
          }
          
          if (n_right !== undefined && n_wiper !== undefined && r2 > 0) {
            const g2 = 1 / r2;
            G[n_right][n_right] += g2;
            G[n_wiper][n_wiper] += g2;
            G[n_right][n_wiper] -= g2;
            G[n_wiper][n_right] -= g2;
          }
          break;
        }

        // 测量仪器 - 电压表（高内阻）
        case 'voltmeter': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const r = comp.properties.internalResistance || 1e7;
            const g = 1 / r;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
          }
          break;
        }

        // 测量仪器 - 电流表（低内阻）
        case 'ammeter': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const r = comp.properties.internalResistance || 0.01;
            const g = 1 / r;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
          }
          break;
        }

        // 万用表 - 根据模式选择内阻
        case 'multimeter': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            let r;
            switch (comp.properties.mode) {
              case '电压': r = 1e7; break;
              case '电流': r = 0.01; break;
              case '电阻': r = 1e7; break;
              default: r = 1e7;
            }
            const g = 1 / r;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
          }
          break;
        }

        // 稳压二极管
        case 'zenerDiode': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const vz = comp.properties.zenerVoltage || 5.1;
            const r_on = 1;
            const g_on = 1 / r_on;
            G[n1][n1] += g_on;
            G[n2][n2] += g_on;
            G[n1][n2] -= g_on;
            G[n2][n1] -= g_on;
            I[n1] += vz * g_on;
            I[n2] -= vz * g_on;
          }
          break;
        }

        // 熔断器
        case 'fuse': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            if (comp.properties.blown === '熔断') {
              const r = 1e9;
              const g = 1 / r;
              G[n1][n1] += g;
              G[n2][n2] += g;
              G[n1][n2] -= g;
              G[n2][n1] -= g;
            } else {
              const r = 0.001;
              const g = 1 / r;
              G[n1][n1] += g;
              G[n2][n2] += g;
              G[n1][n2] -= g;
              G[n2][n1] -= g;
            }
          }
          break;
        }

        // 接地
        case 'ground': {
          const n1 = comp.nodeMap[0];
          if (n1 !== undefined) {
            const r = 0.001;
            const g = 1 / r;
            G[n1][n1] += g;
            I[n1] += 0;
          }
          break;
        }

        // 蜂鸣器
        case 'buzzer': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const r = 50;
            const g = 1 / r;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
          }
          break;
        }

        // 热敏电阻
        case 'thermistor': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const r = comp.properties.resistance || 10000;
            const g = 1 / r;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
          }
          break;
        }

        // 光敏电阻
        case 'photoresistor': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const light = comp.properties.lightIntensity / 100;
            const r_dark = comp.properties.darkResistance || 1e6;
            const r_light = comp.properties.resistance || 1000;
            const r = r_light + (r_dark - r_light) * (1 - light);
            const g = 1 / r;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
          }
          break;
        }

        // 信号发生器（等效为交流电源）
        case 'signalGenerator': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const v = comp.properties.amplitude || 5;
            const r_internal = 0.001;
            const g = 1 / r_internal;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
            I[n1] += v * g;
            I[n2] -= v * g;
          }
          break;
        }

        // 脉冲源
        case 'pulseSource': {
          const n1 = comp.nodeMap[0];
          const n2 = comp.nodeMap[1];
          if (n1 !== undefined && n2 !== undefined) {
            const v = comp.properties.amplitude || 5;
            const r_internal = 0.001;
            const g = 1 / r_internal;
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
            I[n1] += v * g;
            I[n2] -= v * g;
          }
          break;
        }

        // 变压器（简化模型）
        case 'transformer': {
          const n_pri1 = comp.nodeMap[0];
          const n_pri2 = comp.nodeMap[1];
          const n_sec1 = comp.nodeMap[2];
          const n_sec2 = comp.nodeMap[3];
          const ratio = comp.properties.turnsRatio || 2;
          
          if (n_pri1 !== undefined && n_pri2 !== undefined) {
            const r_pri = 0.1;
            const g_pri = 1 / r_pri;
            G[n_pri1][n_pri1] += g_pri;
            G[n_pri2][n_pri2] += g_pri;
            G[n_pri1][n_pri2] -= g_pri;
            G[n_pri2][n_pri1] -= g_pri;
          }
          if (n_sec1 !== undefined && n_sec2 !== undefined) {
            const r_sec = 0.1;
            const g_sec = 1 / r_sec;
            G[n_sec1][n_sec1] += g_sec;
            G[n_sec2][n_sec2] += g_sec;
            G[n_sec1][n_sec2] -= g_sec;
            G[n_sec2][n_sec1] -= g_sec;
          }
          break;
        }

        // 继电器（简化模型）
        case 'relay': {
          const n_coil1 = comp.nodeMap[0];
          const n_coil2 = comp.nodeMap[1];
          const n_contact1 = comp.nodeMap[2];
          const n_contact2 = comp.nodeMap[3];
          
          if (n_coil1 !== undefined && n_coil2 !== undefined) {
            const r_coil = 100;
            const g_coil = 1 / r_coil;
            G[n_coil1][n_coil1] += g_coil;
            G[n_coil2][n_coil2] += g_coil;
            G[n_coil1][n_coil2] -= g_coil;
            G[n_coil2][n_coil1] -= g_coil;
          }
          
          if (n_contact1 !== undefined && n_contact2 !== undefined) {
            if (comp.properties.state === '闭合') {
              const r = 0.01;
              const g = 1 / r;
              G[n_contact1][n_contact1] += g;
              G[n_contact2][n_contact2] += g;
              G[n_contact1][n_contact2] -= g;
              G[n_contact2][n_contact1] -= g;
            } else {
              const r = 1e9;
              const g = 1 / r;
              G[n_contact1][n_contact1] += g;
              G[n_contact2][n_contact2] += g;
              G[n_contact1][n_contact2] -= g;
              G[n_contact2][n_contact1] -= g;
            }
          }
          break;
        }

        // PNP三极管
        case 'pnpTransistor': {
          const n_base = comp.nodeMap[0];
          const n_collector = comp.nodeMap[1];
          const n_emitter = comp.nodeMap[2];
          
          if (n_base !== undefined && n_collector !== undefined && n_emitter !== undefined) {
            const r_be = 1000;
            const g_be = 1 / r_be;
            G[n_base][n_base] += g_be;
            G[n_emitter][n_emitter] += g_be;
            G[n_base][n_emitter] -= g_be;
            G[n_emitter][n_base] -= g_be;
            
            const r_ce = 100;
            const g_ce = 1 / r_ce;
            G[n_collector][n_collector] += g_ce;
            G[n_emitter][n_emitter] += g_ce;
            G[n_collector][n_emitter] -= g_ce;
            G[n_emitter][n_collector] -= g_ce;
          }
          break;
        }

        // 场效应管
        case 'mosfet': {
          const n_gate = comp.nodeMap[0];
          const n_drain = comp.nodeMap[1];
          const n_source = comp.nodeMap[2];
          
          if (n_gate !== undefined && n_drain !== undefined && n_source !== undefined) {
            const r_gs = 1e9;
            const g_gs = 1 / r_gs;
            G[n_gate][n_gate] += g_gs;
            G[n_source][n_source] += g_gs;
            G[n_gate][n_source] -= g_gs;
            G[n_source][n_gate] -= g_gs;
            
            const r_ds = comp.properties.rdsOn || 0.1;
            const g_ds = 1 / r_ds;
            G[n_drain][n_drain] += g_ds;
            G[n_source][n_source] += g_ds;
            G[n_drain][n_source] -= g_ds;
            G[n_source][n_drain] -= g_ds;
          }
          break;
        }

        // 运算放大器（简化模型）
        case 'opAmp': {
          const n_inv = comp.nodeMap[0];
          const n_noninv = comp.nodeMap[1];
          const n_out = comp.nodeMap[2];
          
          if (n_inv !== undefined && n_noninv !== undefined && n_out !== undefined) {
            const r_in = 1e6;
            const g_in = 1 / r_in;
            G[n_inv][n_inv] += g_in;
            G[n_noninv][n_noninv] += g_in;
            
            const r_out = 50;
            const g_out = 1 / r_out;
            G[n_out][n_out] += g_out;
          }
          break;
        }

        // 555定时器（简化模型）
        case 'timer555': {
          const n_gnd = comp.nodeMap[0];
          const n_out = comp.nodeMap[2];
          const n_vcc = comp.nodeMap[4];
          
          if (n_vcc !== undefined && n_gnd !== undefined) {
            const r = 1000;
            const g = 1 / r;
            G[n_vcc][n_vcc] += g;
            G[n_gnd][n_gnd] += g;
            G[n_vcc][n_gnd] -= g;
            G[n_gnd][n_vcc] -= g;
          }
          
          if (n_out !== undefined && n_gnd !== undefined) {
            const v_out = comp.properties.supplyVoltage * 0.5 || 2.5;
            const r_out = 100;
            const g_out = 1 / r_out;
            G[n_out][n_out] += g_out;
            G[n_gnd][n_gnd] += g_out;
            G[n_out][n_gnd] -= g_out;
            G[n_gnd][n_out] -= g_out;
            I[n_out] += v_out * g_out;
            I[n_gnd] -= v_out * g_out;
          }
          break;
        }
      }
    });

    // 设置参考节点（接地）
    // 选择连接最多元件的节点作为接地，或选择第一个节点
    const groundNode = 0;
    
    // 移除接地节点对应的行和列
    const reducedG = [];
    const reducedI = [];
    for (let i = 0; i < n; i++) {
      if (i !== groundNode) {
        const row = [];
        for (let j = 0; j < n; j++) {
          if (j !== groundNode) {
            row.push(G[i][j]);
          }
        }
        reducedG.push(row);
        reducedI.push(I[i]);
      }
    }

    // 求解线性方程组 G*V = I
    const V_reduced = this.solveLinearSystem(reducedG, reducedI);
    if (!V_reduced) return;

    // 构建完整电压向量
    const V = Array(n).fill(0);
    let idx = 0;
    for (let i = 0; i < n; i++) {
      if (i !== groundNode) {
        V[i] = V_reduced[idx];
        idx++;
      }
    }

    // 计算各元件的电压和电流
    this.components.forEach(comp => {
      const n1 = comp.nodeMap[0];
      const n2 = comp.nodeMap[1];
      
      if (n1 !== undefined && n2 !== undefined) {
        const v1 = V[n1] || 0;
        const v2 = V[n2] || 0;
        const voltage = v1 - v2;
        
        let current = 0;
        
        switch (comp.type) {
          case 'resistor':
          case 'thermistor':
          case 'photoresistor':
            current = voltage / comp.properties.resistance;
            break;
          case 'dcSource':
            current = (comp.properties.voltage - voltage) / 0.001;
            break;
          case 'diode':
          case 'led':
            current = (voltage - (comp.properties.forwardVoltage || 0.7)) / 1;
            if (current < 0) current = 0;
            break;
          case 'zenerDiode':
            current = (voltage - (comp.properties.zenerVoltage || 5.1)) / 1;
            if (current < 0) current = 0;
            break;
          case 'switch':
            if (comp.properties.state === '闭合') {
              current = voltage / 0.01;
            } else {
              current = 0;
            }
            break;
          case 'capacitor':
            current = 0;
            break;
          case 'inductor':
            current = voltage / 0.001;
            break;
          case 'voltmeter':
            current = voltage / (comp.properties.internalResistance || 1e7);
            break;
          case 'ammeter':
            current = voltage / (comp.properties.internalResistance || 0.01);
            break;
          case 'multimeter':
            let mmR = 1e7;
            if (comp.properties.mode === '电流') mmR = 0.01;
            current = voltage / mmR;
            break;
          case 'fuse':
            if (comp.properties.blown === '熔断') {
              current = 0;
            } else {
              current = voltage / 0.001;
            }
            break;
          case 'buzzer':
            current = voltage / 50;
            break;
          case 'signalGenerator':
            current = (voltage - comp.properties.amplitude) / 0.001;
            break;
          case 'pulseSource':
            current = (voltage - comp.properties.amplitude) / 0.001;
            break;
          case 'ground':
            current = voltage / 0.001;
            break;
          case 'transformer':
            current = voltage / 0.1;
            break;
          case 'relay':
            if (comp.properties.state === '闭合') {
              current = voltage / 0.01;
            } else {
              current = 0;
            }
            break;
          case 'pnpTransistor':
            current = voltage / 100;
            break;
          case 'mosfet':
            current = voltage / (comp.properties.rdsOn || 0.1);
            break;
          case 'opAmp':
            current = voltage / 50;
            break;
          case 'timer555':
            current = voltage / 100;
            break;
        }
        
        comp.state.voltage = voltage;
        comp.state.current = current;
        comp.state.power = Math.abs(voltage * current);
      }
    });

    // 保存节点电压
    this.nodeVoltages = V;
    
    return {
      nodeVoltages: V,
      components: this.components
    };
  }

  /**
   * 使用高斯消元法求解线性方程组
   */
  solveLinearSystem(A, b) {
    const n = b.length;
    if (n === 0) return [];

    // 创建增广矩阵
    const M = [];
    for (let i = 0; i < n; i++) {
      M.push([...A[i], b[i]]);
    }

    // 前向消元
    for (let i = 0; i < n; i++) {
      // 寻找主元
      let maxRow = i;
      let maxVal = Math.abs(M[i][i]);
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > maxVal) {
          maxVal = Math.abs(M[k][i]);
          maxRow = k;
        }
      }

      // 交换行
      if (maxRow !== i) {
        [M[i], M[maxRow]] = [M[maxRow], M[i]];
      }

      // 检查奇异矩阵
      if (Math.abs(M[i][i]) < 1e-10) {
        console.warn('矩阵接近奇异，电路可能有开路');
        return null;
      }

      // 消元
      for (let k = i + 1; k < n; k++) {
        const factor = M[k][i] / M[i][i];
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }

    // 回代
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = M[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= M[i][j] * x[j];
      }
      x[i] /= M[i][i];
    }

    return x;
  }

  /**
   * 检查电路是否有效
   */
  validateCircuit() {
    const issues = [];

    // 检查是否有电源
    const hasSource = this.components.some(c => 
      c.type === 'dcSource' || c.type === 'acSource'
    );
    if (!hasSource) {
      issues.push('电路中缺少电源');
    }

    // 检查是否有接地（通过检查是否有闭合回路）
    const hasClosedLoop = this.checkClosedLoop();
    if (!hasClosedLoop) {
      issues.push('电路未形成闭合回路');
    }

    // 检查是否有悬空元件
    this.components.forEach(comp => {
      const connected = comp.terminals.some(term => {
        return this.wires.some(w => 
          (w.fromComp === comp.id && w.fromTerm === term.id) ||
          (w.toComp === comp.id && w.toTerm === term.id)
        );
      });
      if (!connected) {
        issues.push(`${comp.name} 未连接`);
      }
    });

    return {
      valid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * 检查是否存在闭合回路
   */
  checkClosedLoop() {
    // 简化的回路检测：检查是否所有元件通过连线连接在一起
    if (this.components.length === 0) return false;
    
    const visited = new Set();
    const queue = [this.components[0].id];
    visited.add(this.components[0].id);

    while (queue.length > 0) {
      const compId = queue.shift();
      
      // 找到所有与该元件相连的元件
      this.wires.forEach(wire => {
        if (wire.fromComp === compId && !visited.has(wire.toComp)) {
          visited.add(wire.toComp);
          queue.push(wire.toComp);
        }
        if (wire.toComp === compId && !visited.has(wire.fromComp)) {
          visited.add(wire.fromComp);
          queue.push(wire.fromComp);
        }
      });
    }

    return visited.size === this.components.length;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CircuitAnalyzer;
}
