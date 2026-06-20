/**
 * 电工电子虚拟仿真教学软件 - 实验课程内容
 * 包含多个教学实验，引导学生学习电路知识
 */

const LessonData = [
  {
    id: 'lesson1',
    title: '实验一：欧姆定律验证',
    category: '基础电路',
    difficulty: '入门',
    description: '通过搭建简单电路，验证欧姆定律 V = IR，理解电压、电流、电阻之间的关系。',
    objectives: [
      '理解欧姆定律的基本概念',
      '学会使用直流电源和电阻',
      '掌握电压表和电流表的读数方法',
      '验证电压与电流的正比关系'
    ],
    steps: [
      {
        text: '从元件面板拖动一个直流电源到画布上',
        check: (components) => components.some(c => c.type === 'dcSource')
      },
      {
        text: '拖动一个电阻到画布上',
        check: (components) => components.some(c => c.type === 'resistor')
      },
      {
        text: '使用连线工具连接电源和电阻，形成闭合回路',
        check: (components, wires) => wires.length >= 2
      },
      {
        text: '设置电源电压为 12V',
        check: (components) => {
          const source = components.find(c => c.type === 'dcSource');
          return source && source.properties.voltage === 12;
        }
      },
      {
        text: '设置电阻值为 1kΩ',
        check: (components) => {
          const r = components.find(c => c.type === 'resistor');
          return r && r.properties.resistance === 1000;
        }
      },
      {
        text: '点击"运行仿真"按钮，观察电流值',
        check: (components) => {
          const r = components.find(c => c.type === 'resistor');
          return r && Math.abs(r.state.current - 0.012) < 0.001;
        }
      }
    ],
    questions: [
      {
        question: '当电阻为1kΩ，电压为12V时，电流应为多少？',
        options: ['12mA', '1.2mA', '120mA', '0.12mA'],
        correct: 0,
        explanation: '根据欧姆定律 I = V/R = 12V/1000Ω = 0.012A = 12mA'
      },
      {
        question: '如果将电阻改为2kΩ，电流会如何变化？',
        options: ['不变', '变为原来2倍', '变为原来一半', '变为0'],
        correct: 2,
        explanation: '电阻增大一倍，电流减半，I = 12V/2000Ω = 6mA'
      }
    ],
    tips: [
      '注意电流方向：从电源正极流出，经过电阻，回到电源负极',
      '如果电流为0，检查电路是否形成闭合回路',
      '可以通过修改电阻值观察电流的变化'
    ]
  },
  {
    id: 'lesson2',
    title: '实验二：串联与并联电路',
    category: '基础电路',
    difficulty: '入门',
    description: '学习电阻的串联和并联连接方式，理解等效电阻的计算方法。',
    objectives: [
      '掌握电阻串联电路的特点',
      '掌握电阻并联电路的特点',
      '理解等效电阻的概念',
      '学会分析简单混联电路'
    ],
    steps: [
      {
        text: '搭建串联电路：电源 + 两个电阻串联',
        check: (components, wires) => {
          const resistors = components.filter(c => c.type === 'resistor');
          return resistors.length >= 2 && wires.length >= 3;
        }
      },
      {
        text: '设置两个电阻均为 1kΩ，观察总电流',
        check: (components) => {
          const resistors = components.filter(c => c.type === 'resistor');
          return resistors.length >= 2 && 
                 resistors[0].properties.resistance === 1000 &&
                 resistors[1].properties.resistance === 1000;
        }
      },
      {
        text: '计算串联等效电阻，验证 R总 = R1 + R2',
        check: (components) => {
          const source = components.find(c => c.type === 'dcSource');
          return source && Math.abs(source.state.current - 0.006) < 0.001;
        }
      },
      {
        text: '重新搭建并联电路：两个电阻并联后接电源',
        check: (components, wires) => {
          const resistors = components.filter(c => c.type === 'resistor');
          return resistors.length >= 2;
        }
      },
      {
        text: '观察并联后的总电流，验证 1/R总 = 1/R1 + 1/R2',
        check: (components) => {
          const source = components.find(c => c.type === 'dcSource');
          return source && Math.abs(source.state.current - 0.024) < 0.002;
        }
      }
    ],
    questions: [
      {
        question: '两个1kΩ电阻串联，等效电阻是多少？',
        options: ['500Ω', '1kΩ', '2kΩ', '4kΩ'],
        correct: 2,
        explanation: '串联电阻相加：R总 = R1 + R2 = 1kΩ + 1kΩ = 2kΩ'
      },
      {
        question: '两个1kΩ电阻并联，等效电阻是多少？',
        options: ['500Ω', '1kΩ', '2kΩ', '4kΩ'],
        correct: 0,
        explanation: '并联电阻：1/R总 = 1/1k + 1/1k = 2/1k，所以 R总 = 500Ω'
      }
    ],
    tips: [
      '串联电路中，电流处处相等',
      '并联电路中，各支路电压相等',
      '并联后的总电阻小于任何一个分电阻'
    ]
  },
  {
    id: 'lesson3',
    title: '实验三：二极管单向导电性',
    category: '半导体器件',
    difficulty: '中级',
    description: '通过实验观察二极管的单向导电特性，理解正向导通和反向截止的概念。',
    objectives: [
      '理解二极管的工作原理',
      '观察二极管的单向导电性',
      '了解正向压降的概念',
      '学会判断二极管的导通状态'
    ],
    steps: [
      {
        text: '搭建电路：电源 + 二极管 + 电阻（串联）',
        check: (components) => {
          return components.some(c => c.type === 'diode') &&
                 components.some(c => c.type === 'resistor');
        }
      },
      {
        text: '确保二极管正向连接（阳极接电源正极）',
        check: (components, wires) => {
          // 简化检查：只要有二极管即可
          return components.some(c => c.type === 'diode');
        }
      },
      {
        text: '设置电源电压为 5V，运行仿真',
        check: (components) => {
          const source = components.find(c => c.type === 'dcSource');
          return source && source.properties.voltage === 5;
        }
      },
      {
        text: '观察电流值，记录二极管正向导通状态',
        check: (components) => {
          const diode = components.find(c => c.type === 'diode');
          return diode && diode.state.current > 0;
        }
      },
      {
        text: '将二极管反接，观察电流变化',
        check: (components) => {
          // 反接后电流应接近0
          const diode = components.find(c => c.type === 'diode');
          return diode && diode.state.current < 0.001;
        }
      }
    ],
    questions: [
      {
        question: '硅二极管的正向压降约为多少？',
        options: ['0.2V', '0.7V', '1.4V', '2.0V'],
        correct: 1,
        explanation: '硅二极管的典型正向压降约为0.6-0.7V'
      },
      {
        question: '二极管反向连接时，电路中的电流如何？',
        options: ['很大', '很小（接近0）', '不变', '变为负值'],
        correct: 1,
        explanation: '二极管反向截止，只有极小的反向漏电流'
      }
    ],
    tips: [
      '二极管有极性，注意区分阳极（正）和阴极（负）',
      '正向导通时，二极管两端有约0.7V的压降',
      'LED也是二极管，但正向压降更大（约2V）'
    ]
  },
  {
    id: 'lesson4',
    title: '实验四：LED限流电路设计',
    category: '应用电路',
    difficulty: '中级',
    description: '学习如何为LED设计合适的限流电阻，保护LED并使其正常工作。',
    objectives: [
      '理解LED的工作特性',
      '学会计算限流电阻值',
      '掌握电路设计的基本方法',
      '了解功率计算'
    ],
    steps: [
      {
        text: '搭建电路：电源 + 限流电阻 + LED（串联）',
        check: (components) => {
          return components.some(c => c.type === 'led') &&
                 components.some(c => c.type === 'resistor');
        }
      },
      {
        text: '设置电源电压为 9V',
        check: (components) => {
          const source = components.find(c => c.type === 'dcSource');
          return source && source.properties.voltage === 9;
        }
      },
      {
        text: 'LED正向压降设为 2V，工作电流设为 20mA',
        check: (components) => {
          const led = components.find(c => c.type === 'led');
          return led && led.properties.forwardVoltage === 2.0;
        }
      },
      {
        text: '计算限流电阻：R = (V电源 - VLED) / I = (9-2)/0.02 = 350Ω',
        check: (components) => {
          const r = components.find(c => c.type === 'resistor');
          return r && Math.abs(r.properties.resistance - 350) < 50;
        }
      },
      {
        text: '运行仿真，验证LED电流是否接近20mA',
        check: (components) => {
          const led = components.find(c => c.type === 'led');
          return led && Math.abs(led.state.current - 0.02) < 0.005;
        }
      }
    ],
    questions: [
      {
        question: '电源9V，LED压降2V，要得到20mA电流，限流电阻应为？',
        options: ['100Ω', '350Ω', '450Ω', '1kΩ'],
        correct: 1,
        explanation: 'R = (9V-2V)/0.02A = 7/0.02 = 350Ω'
      },
      {
        question: '如果不加限流电阻直接接电源，LED会怎样？',
        options: ['更亮', '正常工作', '烧毁', '闪烁'],
        correct: 2,
        explanation: '没有限流电阻，电流过大，LED会因过热而烧毁'
      }
    ],
    tips: [
      'LED必须串联限流电阻使用',
      '限流电阻的功率也要考虑，P = I²R',
      '不同颜色的LED正向压降不同'
    ]
  },
  {
    id: 'lesson5',
    title: '实验五：电位器分压电路',
    category: '应用电路',
    difficulty: '中级',
    description: '学习电位器的工作原理，理解分压电路的应用。',
    objectives: [
      '理解电位器的工作原理',
      '掌握分压电路的计算',
      '学会使用电位器调节电压',
      '了解音量控制等实际应用'
    ],
    steps: [
      {
        text: '搭建电路：电源 + 电位器',
        check: (components) => {
          return components.some(c => c.type === 'potentiometer');
        }
      },
      {
        text: '设置电源电压为 10V，电位器总阻值为 10kΩ',
        check: (components) => {
          const pot = components.find(c => c.type === 'potentiometer');
          return pot && pot.properties.resistance === 10000;
        }
      },
      {
        text: '将滑动位置设为50%，测量中间抽头电压',
        check: (components) => {
          const pot = components.find(c => c.type === 'potentiometer');
          return pot && pot.properties.position === 50;
        }
      },
      {
        text: '验证输出电压是否为电源电压的一半（5V）',
        check: (components) => {
          // 通过检查电位器各部分电压
          return true; // 简化验证
        }
      },
      {
        text: '改变滑动位置，观察输出电压的变化',
        check: (components) => {
          const pot = components.find(c => c.type === 'potentiometer');
          return pot && pot.properties.position !== 50;
        }
      }
    ],
    questions: [
      {
        question: '电位器滑动端在中间位置时，输出电压是输入电压的？',
        options: ['1/4', '1/2', '3/4', '1'],
        correct: 1,
        explanation: '分压公式：Vout = Vin × R2/(R1+R2)，中间位置时R1=R2，所以Vout=Vin/2'
      },
      {
        question: '电位器在电路中主要起什么作用？',
        options: ['限流', '分压', '滤波', '放大'],
        correct: 1,
        explanation: '电位器主要作为可变分压器使用，可以调节输出电压'
      }
    ],
    tips: [
      '电位器有三个端子，中间是滑动端',
      '作为分压器使用时，三个端子都要连接',
      '电位器也常用作可变电阻（只接两个端子）'
    ]
  }
];

/**
 * 获取实验列表
 */
function getLessonList() {
  return LessonData.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    category: lesson.category,
    difficulty: lesson.difficulty
  }));
}

/**
 * 获取实验详情
 */
function getLesson(id) {
  return LessonData.find(l => l.id === id);
}

/**
 * 检查实验步骤完成情况
 */
function checkStep(lessonId, stepIndex, components, wires) {
  const lesson = getLesson(lessonId);
  if (!lesson || stepIndex >= lesson.steps.length) return false;
  
  const step = lesson.steps[stepIndex];
  return step.check(components, wires);
}

/**
 * 获取实验进度
 */
function getLessonProgress(lessonId, components, wires) {
  const lesson = getLesson(lessonId);
  if (!lesson) return { completed: 0, total: 0, percentage: 0 };
  
  let completed = 0;
  lesson.steps.forEach((step, index) => {
    if (step.check(components, wires)) {
      completed++;
    }
  });
  
  return {
    completed: completed,
    total: lesson.steps.length,
    percentage: Math.round((completed / lesson.steps.length) * 100)
  };
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LessonData, getLessonList, getLesson, checkStep, getLessonProgress };
}
