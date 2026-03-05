import {
  BehaviorLogItem,
  BehaviorLogListParams,
  BehaviorLogListResponse
} from '../types';

// 🔧 Mock 开关（开发时设为 true，接口就绪后设为 false）
export const USE_MOCK = false;

// 延迟函数（模拟网络请求）
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// 生成随机状态
const randomStatus = (): 1 | 2 | 3 | 4 => {
  const statuses: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
  const weights = [0.1, 0.7, 0.15, 0.05]; // 10% 处理中, 70% 成功, 15% 失败, 5% kill
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) return statuses[i];
  }
  return 2;
};

// 生成时间字符串
const generateTime = (baseTime: Date, offsetMs: number): string => {
  const time = new Date(baseTime.getTime() + offsetMs);
  return time.toISOString().replace('T', ' ').substring(0, 19);
};

// 行为/函数名称列表
const actionNames = [
  '实体识别',
  '关联分析',
  '威胁研判',
  '执行下发',
  '数据同步',
  '规则匹配',
  '智能推荐',
  '异常检测'
];

const functionNames = [
  '数据清洗',
  '特征提取',
  '模型推理',
  '结果聚合',
  '数据转换',
  '格式校验',
  '数据加密',
  '日志记录'
];

// 描述说明列表
const descriptions = [
  '分布在边界区域的实时气象采集设备信息流映射',
  '自动识别文本中的关键实体信息',
  '基于规则引擎的智能匹配分析',
  '多维度数据关联分析处理',
  '实时数据流处理与转换',
  '异常行为模式识别与告警'
];

// 来源列表
const sources = ['manual', 'auto', 'api'];

// 对象类型列表
const objectTypes = [
  { id: '1001', name: '设备', icon: 'icon-device' },
  { id: '1002', name: '人员', icon: 'icon-person' },
  { id: '1003', name: '车辆', icon: 'icon-car' },
  { id: '1004', name: '事件', icon: 'icon-event' },
  { id: '1005', name: '地点', icon: 'icon-location' },
  { id: '1006', name: '组织', icon: 'icon-organization' }
];

// 生成 Mock 数据
export const generateMockData = (
  count = 50,
  type: 'action' | 'function' = 'action'
): BehaviorLogItem[] => {
  const data: BehaviorLogItem[] = [];
  const baseTime = new Date('2026-10-10T20:10:00');
  const names = type === 'action' ? actionNames : functionNames;

  for (let i = 0; i < count; i++) {
    const status = randomStatus();
    const startTimeOffset = i * 60000; // 每条记录间隔1分钟
    const startTime = generateTime(baseTime, startTimeOffset);

    // 根据状态生成耗时和结束时间
    let duration = '-';
    let endTime = '-';
    if (status === 2 || status === 3 || status === 4) {
      const durationMs = Math.floor(Math.random() * 5000) + 100; // 100ms - 5s
      if (durationMs < 1000) {
        duration = `${durationMs}ms`;
      } else {
        duration = `${(durationMs / 1000).toFixed(2)}s`;
      }
      endTime = generateTime(baseTime, startTimeOffset + durationMs);
    }

    // 随机选择一个对象类型
    const objectType =
      objectTypes[Math.floor(Math.random() * objectTypes.length)];

    data.push({
      id: String(i + 1).padStart(3, '0'),
      name: names[Math.floor(Math.random() * names.length)],
      code: `${type === 'action' ? 'Action' : 'Function'}_${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
      description:
        descriptions[Math.floor(Math.random() * descriptions.length)],
      sources: sources[Math.floor(Math.random() * sources.length)],
      run_status: status,
      duration,
      start_time: startTime,
      end_time: endTime,
      run_log:
        status === 1
          ? '运行中...'
          : `[信息] 执行完成\n[输出] 处理结果: 成功\n[信息] 执行统计: ${duration}`,
      ontologyObjectTypeName: objectType.name,
      ontologyObjectTypeIcon: objectType.icon,
      ontologyObjectTypeId: objectType.id,
      created_at: startTime,
      updated_at: endTime === '-' ? startTime : endTime,
      created_by: '系统管理员',
      updated_by: '系统管理员'
    });
  }

  return data.reverse(); // 最新的在前面
};

// 导出 Mock 数据
export const MOCK_ACTION_LOGS = generateMockData(30, 'action');
export const MOCK_FUNCTION_LOGS = generateMockData(20, 'function');

// Mock API 延迟
export const mockDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock 入参数据
const getMockInputParams = (id: string) => {
  return [
    {
      name: 'arg1',
      type: 'ObjectSet',
      value: ['beijing / Chaoyang', 'beijing / Haidian', 'shanghai / Jingansi']
    },
    {
      name: 'arg2',
      type: 'Attachment',
      value: ['我的文我的文件文件111...', '我的文件111...']
    },
    {
      name: 'arg3',
      type: 'Timestamp',
      value: '2023-12-25 14:30:00'
    },
    {
      name: 'arg4',
      type: 'GeoPoint',
      value: '[116.4074, 39.9042]'
    },
    {
      name: 'arg5',
      type: 'ObjectReference',
      value: '多媒体情报'
    },
    {
      name: 'arg6',
      type: 'Boolean',
      value: 'true'
    }
  ];
};

// Mock 出参数据
const getMockOutputParams = (id: string) => {
  return [
    {
      name: 'var_1',
      type: 'String',
      value: null
    },
    {
      name: 'var_2',
      type: 'Number',
      value: null
    }
  ];
};

// Mock 运行日志
const getMockRunLogs = (id: string) => {
  return `[信息] 沙箱环境就绪。
[信息] 注入参数: {"arg1":"","arg2":""}
[输出] 正在计算结果...
[输出] 处理逻辑节点 [Main]
返回值 RETURN VALUE:
74.28
[信息] 执行统计: 18ms, 4MB Mem
进程已退出, 代码 0
    -- 年收入大于1000万元
    AND annual_revenue > 1000
ORDER BY
    annual_revenue DESC  -- 按年收入从高到低排序
LIMIT 10;  -- 只返回前10条结果`;
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
    params: BehaviorLogListParams
  ): Promise<BehaviorLogListResponse> => {
    await delay(500);

    // 根据类型选择数据源
    let list =
      params.type === 'action'
        ? [...MOCK_ACTION_LOGS]
        : [...MOCK_FUNCTION_LOGS];

    // 关键词搜索
    if (params.filter) {
      const keyword = params.filter.toLowerCase();
      list = list.filter(
        (item) =>
          String(item.id).toLowerCase().includes(keyword) ||
          item.name.toLowerCase().includes(keyword) ||
          item.code.toLowerCase().includes(keyword) ||
          (item.description?.toLowerCase() || '').includes(keyword)
      );
    }

    // 来源过滤
    if (params.sources && params.sources.length > 0) {
      list = list.filter((item) => {
        const itemSource = item.sources || item.source;
        return itemSource && params.sources!.includes(itemSource);
      });
    }

    // 执行状态过滤
    if (params.run_status_list && params.run_status_list.length > 0) {
      list = list.filter((item) =>
        params.run_status_list!.includes(item.run_status)
      );
    }

    // 对象类型过滤
    if (
      params.associated_object_type_list &&
      params.associated_object_type_list.length > 0
    ) {
      list = list.filter(
        (item) =>
          item.ontologyObjectTypeId &&
          params.associated_object_type_list!.includes(
            String(item.ontologyObjectTypeId)
          )
      );
    }

    // 排序
    if (params.sort_by && params.sort) {
      list.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (params.sort_by === 'start_time') {
          aValue = new Date(a.start_time).getTime();
          bValue = new Date(b.start_time).getTime();
        } else if (params.sort_by === 'end_time') {
          aValue = new Date(a.end_time).getTime();
          bValue = new Date(b.end_time).getTime();
        } else {
          return 0;
        }

        if (params.sort === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    // 分页
    const page = params.pageNo || 1;
    const pageSize = params.pageSize || 20;
    const total = list.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedList = list.slice(start, end);

    return {
      items: paginatedList,
      total,
      pageNo: page,
      pageSize
    };
  },

  // 获取执行记录详情
  getBehaviorLogDetail: async (id: string): Promise<BehaviorLogItem> => {
    await delay(300);
    const allLogs = [...MOCK_ACTION_LOGS, ...MOCK_FUNCTION_LOGS];
    const item = allLogs.find((log) => log.id === id);
    if (!item) {
      throw new Error(`执行记录 ${id} 不存在`);
    }
    return item;
  },

  // 获取入参详情
  getBehaviorLogInputParams: async (id: string): Promise<any[]> => {
    await delay(300);
    return getMockInputParams(id);
  },

  // 获取出参详情
  getBehaviorLogOutputParams: async (id: string): Promise<any[]> => {
    await delay(300);
    return getMockOutputParams(id);
  },

  // 获取运行日志
  getBehaviorLogRunLogs: async (id: string): Promise<string> => {
    await delay(300);
    return getMockRunLogs(id);
  },

  // 获取执行详情（函数代码）
  getBehaviorLogExecutionDetail: async (id: string): Promise<string> => {
    await delay(300);
    return getMockExecutionDetail(id);
  },

  // 删除执行记录
  deleteBehaviorLog: async (id: string): Promise<void> => {
    await delay(300);
    console.log(`[Mock] 删除执行记录: ${id}`);
  },

  // 批量删除执行记录
  batchDeleteBehaviorLogs: async (ids: string[]): Promise<void> => {
    await delay(500);
    console.log(`[Mock] 批量删除执行记录: ${ids.join(', ')}`);
  }
};
