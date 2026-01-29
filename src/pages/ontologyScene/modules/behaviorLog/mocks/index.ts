import { BehaviorLogItem } from '../types';

// 生成随机耗时（100ms - 5000ms）
const randomDuration = () => Math.floor(Math.random() * 4900) + 100;

// 生成随机状态
const randomStatus = (): 'success' | 'running' | 'failed' => {
  const statuses: Array<'success' | 'running' | 'failed'> = [
    'success',
    'running',
    'failed'
  ];
  const weights = [0.7, 0.2, 0.1]; // 70% 成功, 20% 运行中, 10% 失败
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) return statuses[i];
  }
  return 'success';
};

// 生成时间字符串
const generateTime = (baseTime: Date, offsetMs: number): string => {
  const time = new Date(baseTime.getTime() + offsetMs);
  return time.toISOString().replace('T', ' ').substring(0, 19);
};

// 行为类型列表
const behaviorTypes = [
  '实体识别',
  '关联分析',
  '威胁研判',
  '执行下发',
  '数据同步',
  '规则匹配',
  '智能推荐',
  '异常检测'
];

// 对象类型列表
const objectTypes = [
  '多媒体情报',
  '作战单元',
  '作战编队',
  '战术预案',
  '情报源',
  '目标对象'
];

// 操作人列表
const operators = ['张三', '李四', '王五', '赵六', '系统管理员', '数据分析师'];

// 错误信息列表
const errorMessages = [
  '网络连接超时',
  '参数验证失败',
  '数据源不可用',
  '权限不足',
  '系统资源不足',
  '依赖服务异常'
];

// 生成 Mock 数据
export const generateMockData = (count = 50): BehaviorLogItem[] => {
  const data: BehaviorLogItem[] = [];
  const baseTime = new Date('2026-01-29T10:00:00');

  for (let i = 0; i < count; i++) {
    const duration = randomDuration();
    const status = randomStatus();
    const startTimeOffset = i * 60000; // 每条记录间隔1分钟
    const startTime = generateTime(baseTime, startTimeOffset);
    const endTime =
      status === 'running'
        ? '-'
        : generateTime(baseTime, startTimeOffset + duration);

    data.push({
      id: `log_${String(i + 1).padStart(4, '0')}`,
      type: behaviorTypes[Math.floor(Math.random() * behaviorTypes.length)],
      name: `${behaviorTypes[Math.floor(Math.random() * behaviorTypes.length)]}_${i + 1}`,
      startTime,
      endTime,
      duration,
      status,
      objectType: objectTypes[Math.floor(Math.random() * objectTypes.length)],
      operator: operators[Math.floor(Math.random() * operators.length)],
      errorMessage:
        status === 'failed'
          ? errorMessages[Math.floor(Math.random() * errorMessages.length)]
          : undefined
    });
  }

  return data.reverse(); // 最新的在前面
};

// 导出 Mock 数据
export const MOCK_BEHAVIOR_LOGS = generateMockData(50);

// Mock API 延迟
export const mockDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));
