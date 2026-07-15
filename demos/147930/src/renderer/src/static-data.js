export const staticWorkspaces = [
  {
    id: 'workspace-default',
    name: 'NLP 课程',
    path: 'F:/学习/AI学习/NLP课程'
  },
  {
    id: 'workspace-demo',
    name: 'Xoder 静态演示',
    path: 'F:/接单/qoder开源版本/Xcoder/xoder'
  }
]

export const staticDesktopNodeState = {
  node: {
    id: 'static-local-node',
    deviceName: '本地静态节点',
    status: 'idle',
    statusLabel: '本地待命 / 静态模式',
    serverConfigured: false
  },
  runtime: {
    queuedCount: 0,
    runningCount: 0,
    completedCount: 3
  },
  currentTask: null,
  tasks: [
    {
      id: 'static-task-1',
      title: '整理课程知识结构',
      status: 'completed',
      source: 'static-fixture',
      updatedAt: '2026-07-07T09:30:00.000Z',
      summary: '静态示例任务，不会入队或运行。'
    },
    {
      id: 'static-task-2',
      title: '生成章节验收清单',
      status: 'planned',
      source: 'static-fixture',
      updatedAt: '2026-07-07T10:20:00.000Z',
      summary: '用于展示桌面节点任务列表的固定数据。'
    }
  ],
  controlPlane: {
    status: 'static',
    statusLabel: '静态展示',
    remoteNodeId: '--',
    pulledTaskCount: 0,
    lastSuccessAt: '',
    lastPullAt: ''
  },
  controlPlaneOverview: {
    nodes: [
      {
        id: 'static-node-1',
        name: '研发-PC-01',
        status: 'idle',
        updatedAt: '2026-07-07T10:30:00.000Z',
        recentTasks: [],
        commands: [],
        recentCommandResults: [],
        logs: [
          {
            id: 'node-log-1',
            type: 'static.log',
            message: '节点已切换为静态模式。',
            createdAt: '2026-07-07T10:30:00.000Z'
          }
        ]
      }
    ],
    tasks: [
      {
        id: 'cp-static-task-1',
        title: '控制平面静态任务',
        prompt: '展示远程任务详情，但不会下发到任何节点。',
        status: 'preview',
        assignedNodeId: 'static-node-1',
        updatedAt: '2026-07-07T10:35:00.000Z',
        result: {
          handoff: {
            nextAction: '保持静态演示状态。',
            risks: ['已禁用远程同步', '不会启动 agent runtime']
          }
        }
      }
    ]
  },
  workspaceOverview: [],
  workspaceOverviewMap: {}
}

export const staticQuests = [
  {
    id: 'quest-static-course',
    title: '搭建新课程',
    time: '静态示例',
    workspaceId: 'workspace-default',
    project: 'NLP 课程',
    path: 'F:/学习/AI学习/NLP课程',
    prompt: '帮我搭建一套 NLP 课程的章节结构。',
    intentMode: 'auto',
    isEmpty: false
  },
  {
    id: 'quest-static-outline',
    title: '生成课程大纲',
    time: '昨天',
    workspaceId: 'workspace-default',
    project: 'NLP 课程',
    path: 'F:/学习/AI学习/NLP课程',
    prompt: '基于已有资料生成课程大纲。',
    intentMode: 'chat',
    isEmpty: false
  },
  {
    id: 'quest-static-knowledge',
    title: '整理课程知识库',
    time: '2 天前',
    workspaceId: 'workspace-default',
    project: 'NLP 课程',
    path: 'F:/学习/AI学习/NLP课程',
    prompt: '把课程资料整理成知识库条目。',
    intentMode: 'auto',
    isEmpty: false
  },
  {
    id: 'quest-static-empty',
    title: '新 Quest',
    time: '',
    workspaceId: 'workspace-demo',
    project: 'Xoder 静态演示',
    path: 'F:/接单/qoder开源版本/Xcoder/xoder',
    prompt: '',
    intentMode: 'auto',
    isEmpty: true
  }
]

export const staticMessages = {
  'quest-static-course': [
    {
      id: 'msg-course-user-1',
      role: 'user',
      content: '帮我搭建一套 NLP 课程的章节结构。'
    },
    {
      id: 'msg-course-assistant-1',
      role: 'assistant',
      variant: 'static-summary',
      status: 'completed',
      step: '静态示例已加载',
      content:
        '这是静态展示内容：课程可以拆成“基础概念、文本表示、序列模型、Transformer、检索增强、项目实战”六个模块。当前版本不会调用 agent，也不会写文件或运行命令。',
      bullets: ['固定聊天记录来自前端 fixture。', '发送按钮禁用。', '右侧任务、产物和日志都是静态示例。']
    }
  ],
  'quest-static-outline': [
    {
      id: 'msg-outline-user-1',
      role: 'user',
      content: '基于已有资料生成课程大纲。'
    },
    {
      id: 'msg-outline-assistant-1',
      role: 'assistant',
      variant: 'static-summary',
      status: 'completed',
      step: '静态示例已加载',
      content:
        '建议先用 4 周完成核心概念与练习，再安排 2 周做检索问答项目。这里仅展示固定文本，不会恢复历史或连接 runtime。'
    }
  ],
  'quest-static-knowledge': [
    {
      id: 'msg-knowledge-user-1',
      role: 'user',
      content: '把课程资料整理成知识库条目。'
    },
    {
      id: 'msg-knowledge-assistant-1',
      role: 'assistant',
      variant: 'static-summary',
      status: 'completed',
      step: '静态示例已加载',
      content:
        '知识库可以按主题、示例、练习、延伸阅读四类整理。当前面板只保留本地选择、搜索、折叠这类 UI 状态。'
    }
  ],
  default: [
    {
      id: 'msg-default-assistant-1',
      role: 'assistant',
      variant: 'static-summary',
      status: 'completed',
      step: '静态模式',
      content: '当前 Quest 处于静态模式。输入框保留展示，但不会发送到任何 agent。'
    }
  ]
}

export const staticEmployees = [
  {
    id: 'employee-product',
    employeeKey: 'product-manager',
    displayName: '产品经理',
    roleName: '需求拆解',
    status: 'active',
    unitType: 'employee',
    sortOrder: 1,
    description: '梳理目标、范围和验收标准。',
    skills: [{ name: '需求分析' }, { name: '任务拆分' }],
    coreCapabilities: {
      ZH: ['需求澄清', '里程碑规划', '验收标准']
    },
    defaultQuestion: {
      ZH: ['帮我把这个需求拆成可验收的任务。']
    }
  },
  {
    id: 'employee-frontend',
    employeeKey: 'frontend-developer',
    displayName: '前端工程师',
    roleName: '界面实现',
    status: 'active',
    unitType: 'employee',
    sortOrder: 2,
    description: '负责 Vue 页面、组件状态和视觉还原。',
    skills: [{ name: 'Vue' }, { name: '交互实现' }],
    coreCapabilities: {
      ZH: ['组件实现', '状态管理', '样式整理']
    },
    defaultQuestion: {
      ZH: ['帮我实现这个界面交互。']
    }
  },
  {
    id: 'employee-qa',
    employeeKey: 'qa-engineer',
    displayName: '测试工程师',
    roleName: '质量验证',
    status: 'active',
    unitType: 'employee',
    sortOrder: 3,
    description: '负责测试清单、回归风险和验证结论。',
    skills: [{ name: '测试计划' }, { name: '回归验证' }],
    coreCapabilities: {
      ZH: ['测试设计', '缺陷复核', '风险检查']
    },
    defaultQuestion: {
      ZH: ['帮我列出这次变更的测试点。']
    }
  }
]

export const staticRightPanel = {
  statusLabel: '静态模式',
  liveSummary: {
    source: 'fixture',
    stageLabel: '静态展示',
    status: 'completed',
    text: '右侧面板展示固定任务、产物和日志，不订阅 conversation 事件。'
  },
  progressTasks: [
    {
      id: 'progress-1',
      title: '确认静态化范围',
      detail: '移除 agent、workbench、desktop node、模型配置保存入口。',
      status: 'completed'
    },
    {
      id: 'progress-2',
      title: '保留本地 UI 交互',
      detail: '搜索、选择 Quest、折叠侧栏、切换设置分类仍在前端内存中工作。',
      status: 'completed'
    },
    {
      id: 'progress-3',
      title: '禁用发送',
      detail: '输入框可展示和编辑，提交不会触发 IPC。',
      status: 'completed'
    }
  ],
  artifacts: [
    {
      id: 'artifact-1',
      name: 'STATIC_MODE.md',
      path: 'docs/STATIC_MODE.md',
      diff: 'fixture'
    },
    {
      id: 'artifact-2',
      name: 'course-outline.json',
      path: 'fixtures/course-outline.json',
      diff: 'fixture'
    }
  ],
  references: [
    {
      id: 'ref-1',
      title: '静态 Quest 数据',
      detail: 'src/renderer/src/static-data.js'
    },
    {
      id: 'ref-2',
      title: '本地内存状态',
      detail: '刷新后恢复 fixture 初始值。'
    }
  ],
  logs: [
    {
      id: 'log-1',
      type: 'static.loaded',
      message: '加载固定 Quest、消息和设置页数据。',
      time: '10:30'
    },
    {
      id: 'log-2',
      type: 'agent.disabled',
      message: '发送、审批、trace、runtime 已在 UI 层禁用。',
      time: '10:31'
    },
    {
      id: 'log-3',
      type: 'ipc.removed',
      message: 'conversation/workbench/desktopNode/model 动态 IPC 不再暴露。',
      time: '10:32'
    }
  ]
}

export const staticSettings = {
  modelRows: [
    { key: 'pro', name: 'DeepSeek-V4-Pro', billing: '静态展示', provider: 'DeepSeek' },
    { key: 'flash', name: 'DeepSeek-V4-Flash', billing: '静态展示', provider: 'DeepSeek' }
  ],
  integrations: [
    {
      name: 'GitHub',
      detail: '静态入口，当前不会连接远程服务。'
    },
    {
      name: 'Supabase',
      detail: '静态入口，当前不会保存或同步配置。'
    }
  ],
  workbenchSummary: {
    visibleUnitCount: 3,
    employeeCount: 3,
    teamCount: 1,
    activeTaskCount: 0,
    handoffCount: 2,
    memoryCount: 4,
    rolePlanCount: 1,
    runSessionCount: 0,
    workLogCount: 3
  },
  tasks: [
    {
      id: 'settings-task-1',
      title: '静态化清理',
      status: 'completed',
      summary: '只展示固定任务，不进入队列。'
    },
    {
      id: 'settings-task-2',
      title: '界面回归检查',
      status: 'planned',
      summary: '本地切换和搜索可用。'
    }
  ]
}

export function getStaticMessagesForQuest(questId) {
  return staticMessages[questId] || staticMessages.default
}
