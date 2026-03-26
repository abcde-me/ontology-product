import { BehaviorItem, TestResult, HistoryItem } from '../types';

// 🔧 Mock 开关（开发时设为 true，接口就绪后设为 false）
export const USE_MOCK = process.env.NODE_ENV === 'development';

// 延迟函数（模拟网络请求）
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock 行为列表数据
export const mockBehaviorList: BehaviorItem[] = [
  {
    // TODO: 修复类型错误
    // @ts-expect-error
    id: '1',
    name: '实体识别',
    description:
      '从原始图片中识别 AF-101从原始图片中识别 AF-101从原始图片中识别 AF-101从原始图片中识别 AF-101',
    objectType: '多媒体情报',
    functionName: 'entityRecognition',
    identifier: 'entity_recognition',
    params: [],
    color: '#722ED1',
    icon: '🔍',
    configSchema: {
      fields: [
        {
          name: 'targetTeam',
          label: '目标编队',
          type: 'select',
          required: true,
          placeholder: '请选择目标编队',
          dataType: 'STRING',
          widget: '对象实例单选器',
          options: [
            { label: '目标编队123', value: 'team_123' },
            { label: '目标编队456', value: 'team_456' },
            { label: '目标编队789', value: 'team_789' }
          ]
        },
        {
          name: 'confidence',
          label: '置信度阈值',
          type: 'input',
          required: true,
          placeholder: '请输入置信度（0-1）',
          defaultValue: '0.8',
          dataType: 'NUMBER',
          widget: '高精度数字输入框',
          validation: (value: any) => {
            const num = parseFloat(value);
            if (isNaN(num)) return '请输入有效数字';
            if (num < 0 || num > 1) return '置信度必须在0-1之间';
            return true;
          }
        },
        {
          name: 'enableCache',
          label: '启用缓存',
          type: 'switch',
          required: false,
          defaultValue: true,
          dataType: 'BOOLEAN',
          widget: '切换开关'
        }
      ]
    },
    validationRules: [
      {
        id: 'rule_1',
        name: '置信度范围校验',
        description: '置信度必须在0-1之间',
        expression: 'confidence >= 0 && confidence <= 1'
      }
    ],
    functionCode: `function entityRecognition(targetTeam, confidence, enableCache) {
  // 实体识别逻辑
  return { entities: ['AF-101', 'AF-102'], confidence };
}`
  },
  {
    // TODO: 修复类型错误
    // @ts-expect-error
    id: '2',
    name: '关联分析与印证',
    description: '输入目标坐标与归属编...',
    objectType: '作战单元',
    functionName: 'correlationAnalysis',
    identifier: 'correlation_analysis',
    params: [],
    color: '#FA8C16',
    icon: '🔗',
    configSchema: {
      fields: [
        {
          name: 'infoSource',
          label: '情报源',
          type: 'select',
          required: true,
          placeholder: '请选择情报源',
          dataType: 'STRING',
          widget: '下拉选择',
          options: [
            { label: '卫星图像', value: 'satellite' },
            { label: '雷达数据', value: 'radar' },
            { label: '无人机侦察', value: 'drone' }
          ]
        },
        {
          name: 'position',
          label: '坐标位置',
          type: 'input',
          required: true,
          placeholder: '请输入坐标（格式：经度,纬度）',
          dataType: 'STRING',
          widget: '地图选择器'
        },
        {
          name: 'analysisDepth',
          label: '分析深度',
          type: 'input',
          required: true,
          placeholder: '请输入分析深度',
          defaultValue: '3',
          dataType: 'NUMBER',
          widget: '数字步进器',
          validation: (value: any) => {
            const num = parseInt(value);
            if (isNaN(num)) return '请输入有效数字';
            if (num < 1 || num > 10) return '分析深度必须在1-10之间';
            return true;
          }
        },
        {
          name: 'description',
          label: '备注说明',
          type: 'input',
          required: false,
          placeholder: '请输入备注说明',
          dataType: 'STRING',
          widget: '文本域'
        }
      ]
    },
    validationRules: [
      {
        id: 'rule_2',
        name: '坐标格式校验',
        description: '坐标必须符合经纬度格式',
        expression: 'position.match(/^\\d+\\.\\d+,\\d+\\.\\d+$/)'
      }
    ],
    functionCode: `function correlationAnalysis(infoSource, position, analysisDepth, description) {
  // 关联分析逻辑
  return { correlations: 5, verified: true };
}`
  },
  {
    // TODO: 修复类型错误
    // @ts-expect-error
    id: '3',
    name: '威胁研判',
    description: '划定 1000km 威胁圈，排...',
    objectType: '作战编队',
    functionName: 'threatAssessment',
    identifier: 'threat_assessment',
    params: [],
    color: '#EB2F96',
    icon: '⚠️',
    configSchema: {
      fields: [
        {
          name: 'targetTeam',
          label: '目标编队',
          type: 'select',
          required: true,
          placeholder: '请选择目标编队',
          dataType: 'STRING',
          widget: '对象搜索选择器',
          options: [
            { label: '目标编队123', value: 'team_123' },
            { label: '目标编队456', value: 'team_456' }
          ]
        },
        {
          name: 'radius',
          label: '威胁半径（km）',
          type: 'input',
          required: true,
          defaultValue: '1000',
          dataType: 'NUMBER',
          widget: '数字步进器',
          validation: (value: any) => {
            const num = parseInt(value);
            if (isNaN(num)) return '请输入有效数字';
            if (num < 1) return '威胁半径必须大于0';
            return true;
          }
        },
        {
          name: 'threatLevel',
          label: '威胁等级',
          type: 'select',
          required: true,
          placeholder: '请选择威胁等级',
          dataType: 'STRING',
          widget: '下拉选择',
          options: [
            { label: '高', value: 'high' },
            { label: '中', value: 'medium' },
            { label: '低', value: 'low' }
          ]
        },
        {
          name: 'assessmentTime',
          label: '评估时间',
          type: 'date',
          required: true,
          dataType: 'DATE',
          widget: '日期时间选择器'
        }
      ]
    },
    validationRules: [
      {
        id: 'rule_3',
        name: '威胁半径范围校验',
        description: '威胁半径必须大于0',
        expression: 'radius > 0'
      }
    ],
    functionCode: `function threatAssessment(targetTeam, radius, threatLevel, assessmentTime) {
  // 威胁研判逻辑
  return { threats: 3, level: threatLevel };
}`
  },
  {
    // TODO: 修复类型错误
    // @ts-expect-error
    id: '4',
    name: '执行下发',
    description: '下发 Plan A，实施实体火...',
    objectType: '战术预案',
    functionName: 'executePlan',
    identifier: 'execute_plan',
    params: [],
    color: '#13C2C2',
    icon: '🚀',
    configSchema: {
      fields: [
        {
          name: 'planName',
          label: '预案名称',
          type: 'select',
          required: true,
          placeholder: '请选择预案',
          dataType: 'STRING',
          widget: '下拉选择',
          options: [
            { label: 'Plan A', value: 'plan_a' },
            { label: 'Plan B', value: 'plan_b' },
            { label: 'Plan C', value: 'plan_c' }
          ]
        },
        {
          name: 'executeTime',
          label: '执行时间',
          type: 'date',
          required: true,
          dataType: 'DATETIME',
          widget: '日期时间选择器'
        },
        {
          name: 'priority',
          label: '优先级',
          type: 'input',
          required: true,
          defaultValue: '5',
          dataType: 'NUMBER',
          widget: '数字步进器',
          validation: (value: any) => {
            const num = parseInt(value);
            if (isNaN(num)) return '请输入有效数字';
            if (num < 1 || num > 10) return '优先级必须在1-10之间';
            return true;
          }
        },
        {
          name: 'attachments',
          label: '附件上传',
          type: 'upload',
          required: false,
          dataType: 'FILE',
          widget: '文件上传区域'
        }
      ]
    },
    validationRules: [
      {
        id: 'rule_4',
        name: '执行时间校验',
        description: '执行时间不能早于当前时间',
        expression: 'new Date(executeTime) > new Date()'
      }
    ],
    functionCode: `function executePlan(planName, executeTime, priority, attachments) {
  // 执行下发逻辑
  return { status: 'success', plan: planName };
}`
  }
];

// Mock 测试结果数据
export const mockTestResults: TestResult[] = [
  {
    nodeId: 'node_1',
    nodeName: '实体识别',
    status: 'success',
    output: {
      entities: ['AF-101', 'AF-102'],
      confidence: 0.95
    },
    duration: 1200
  },
  {
    nodeId: 'node_2',
    nodeName: '关联分析与印证',
    status: 'success',
    output: {
      correlations: 5,
      verified: true
    },
    duration: 800
  }
];

// Mock 历史记录数据
export const mockHistoryList: HistoryItem[] = [
  {
    id: 'history_1',
    createdAt: '2026-01-27 14:30:00',
    nodeCount: 3,
    status: 'success',
    duration: 2500,
    nodes: [
      {
        behaviorId: '1',
        config: { targetTeam: 'team_123', confidence: '0.8', enableCache: true }
      },
      {
        behaviorId: '2',
        config: {
          infoSource: 'satellite',
          position: '120.5,30.2',
          analysisDepth: '3'
        }
      }
    ],
    results: mockTestResults
  },
  {
    id: 'history_2',
    createdAt: '2026-01-27 10:15:00',
    nodeCount: 2,
    status: 'error',
    duration: 1800,
    nodes: [
      {
        behaviorId: '1',
        config: { targetTeam: 'team_456', confidence: '0.9' }
      }
    ],
    results: [
      {
        nodeId: 'node_1',
        nodeName: '实体识别',
        status: 'error',
        error: '目标编队不存在',
        duration: 500
      }
    ]
  }
];

// Mock API 函数
export const mockApi = {
  // 获取行为列表
  getBehaviorList: async (params: {
    keyword?: string;
    objectType?: string;
  }): Promise<BehaviorItem[]> => {
    await delay(500);
    let list = [...mockBehaviorList];

    // 搜索
    if (params.keyword) {
      list = list.filter(
        (item) =>
          item.name.includes(params.keyword!) ||
          item.description.includes(params.keyword!)
      );
    }

    // 筛选
    if (params.objectType) {
      list = list.filter((item) => item.objectType === params.objectType);
    }

    return list;
  },

  // 执行测试
  executeBehaviorTest: async (params: {
    nodes: {
      behaviorId: string;
      config: Record<string, any>;
    }[];
  }): Promise<TestResult[]> => {
    await delay(2000);

    // 根据传入的节点生成测试结果
    return params.nodes.map((node, index) => {
      const behavior = mockBehaviorList.find(
        (b) =>
          // TODO: 修复类型错误
          // @ts-expect-error
          b.id === node.behaviorId
      );
      const isSuccess = Math.random() > 0.2;

      return {
        nodeId: `node_${index + 1}`,
        nodeName: behavior?.name || '未知',
        status: isSuccess ? 'success' : 'error',
        output: isSuccess ? { result: 'mock output' } : undefined,
        error: isSuccess ? undefined : '模拟错误信息',
        duration: Math.floor(Math.random() * 2000) + 500
      };
    });
  },

  // 获取历史记录
  getBehaviorHistory: async (): Promise<HistoryItem[]> => {
    await delay(300);
    return mockHistoryList;
  }
};
