import { BehaviorLogItem, SearchParams } from '../types';

// 🔧 Mock 开关（开发时设为 true，接口就绪后设为 false）
export const USE_MOCK = true;

// 延迟函数（模拟网络请求）
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

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

// Mock 入参数据
const getMockInputParams = (id: string) => {
  return {
    media_id: 'IMG_RECON_001',
    location: '19.2, 122.5',
    confidence_threshold: 0.85,
    enable_cache: true,
    target_team: 'team_123',
    analysis_depth: 3,
    description: `执行记录 ${id} 的入参数据`
  };
};

// Mock 执行详情（SQL）
const getMockExecutionDetail = (id: string) => {
  return `-- 从公司信息表中抽取符合条件的数据
-- 执行记录ID: ${id}
-- 假设表结构：company_id(公司ID), company_name(公司名称), industry(行业), establish_year(成立年份),
--           employee_count(员工数量), annual_revenue(年收入, 单位：万元), city(所在城市)

SELECT
    company_id,
    company_name,
    industry,
    establish_year,
    employee_count,
    annual_revenue,
    city
FROM
    company_info
WHERE
    -- 筛选行业为科技或金融
    industry IN ('科技', '金融')
    -- 成立年份在2010年及以后
    AND establish_year >= 2010
    -- 员工数量超过500人
    AND employee_count > 500
    -- 年收入超过1亿元
    AND annual_revenue > 10000
    -- 所在城市为一线城市
    AND city IN ('北京', '上海', '广州', '深圳')
ORDER BY
    annual_revenue DESC
LIMIT 100;`;
};

// Mock API 函数
export const mockApi = {
  // 获取执行记录列表
  getBehaviorLogList: async (
    params: SearchParams
  ): Promise<{
    list: BehaviorLogItem[];
    total: number;
  }> => {
    await delay(500);
    let list = [...MOCK_BEHAVIOR_LOGS];

    // 关键词搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.type.toLowerCase().includes(keyword) ||
          item.id.toLowerCase().includes(keyword)
      );
    }

    // 分页
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const total = list.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedList = list.slice(start, end);

    return {
      list: paginatedList,
      total
    };
  },

  // 获取执行记录详情
  getBehaviorLogDetail: async (id: string): Promise<BehaviorLogItem> => {
    await delay(300);
    const item = MOCK_BEHAVIOR_LOGS.find((log) => log.id === id);
    if (!item) {
      throw new Error(`执行记录 ${id} 不存在`);
    }
    return item;
  },

  // 获取入参详情
  getBehaviorLogInputParams: async (
    id: string
  ): Promise<Record<string, any>> => {
    await delay(300);
    return getMockInputParams(id);
  },

  // 获取执行详情
  getBehaviorLogExecutionDetail: async (id: string): Promise<string> => {
    await delay(300);
    return getMockExecutionDetail(id);
  },

  // 删除执行记录
  deleteBehaviorLog: async (id: string): Promise<void> => {
    await delay(300);
    console.log(`[Mock] 删除执行记录: ${id}`);
    // 实际项目中这里可以从 MOCK_BEHAVIOR_LOGS 中移除
  },

  // 批量删除执行记录
  batchDeleteBehaviorLogs: async (ids: string[]): Promise<void> => {
    await delay(500);
    console.log(`[Mock] 批量删除执行记录: ${ids.join(', ')}`);
    // 实际项目中这里可以从 MOCK_BEHAVIOR_LOGS 中批量移除
  }
};
