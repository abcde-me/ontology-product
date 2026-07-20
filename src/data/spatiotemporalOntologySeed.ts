/** 时空分析演示本体场景 — 数据与结构定义 */

export const SPATIOTEMPORAL_ONTOLOGY_NAME = '海峡时空态势演示';
export const SPATIOTEMPORAL_ONTOLOGY_DESC =
  '面向时空分析能力验证的演示场景，含移动目标轨迹、态势事件共现与区域演化样本数据';

export const SPATIOTEMPORAL_DEMO_STORAGE_KEY =
  'onto_spatiotemporal_demo_ontology_v1';

export interface SpatiotemporalObjectTypeSeed {
  code: string;
  name: string;
  description: string;
  properties: Array<{
    name: string;
    comment: string;
    columnType: string;
    isPrimary?: boolean;
  }>;
}

export const SPATIOTEMPORAL_OBJECT_TYPES: SpatiotemporalObjectTypeSeed[] = [
  {
    code: 'mobile_target',
    name: '移动目标',
    description: '具备轨迹编号的舰艇、航空器等移动目标观测记录',
    properties: [
      { name: 'id', comment: '实例ID', columnType: 'bigint', isPrimary: true },
      { name: 'name', comment: '目标名称', columnType: 'varchar' },
      { name: 'track_id', comment: '轨迹编号', columnType: 'varchar' },
      { name: 'target_type', comment: '目标类型', columnType: 'varchar' },
      { name: 'longitude', comment: '经度', columnType: 'double' },
      { name: 'latitude', comment: '纬度', columnType: 'double' },
      { name: 'event_time', comment: '观测时间', columnType: 'varchar' }
    ]
  },
  {
    code: 'situation_event',
    name: '态势事件',
    description: '区域内在特定时间发生的态势事件记录',
    properties: [
      { name: 'id', comment: '实例ID', columnType: 'bigint', isPrimary: true },
      { name: 'name', comment: '事件名称', columnType: 'varchar' },
      { name: 'event_type', comment: '事件类型', columnType: 'varchar' },
      { name: 'longitude', comment: '经度', columnType: 'double' },
      { name: 'latitude', comment: '纬度', columnType: 'double' },
      { name: 'event_time', comment: '发生时间', columnType: 'varchar' }
    ]
  }
];

const t = (day: number, hour: number, minute = 0) =>
  `2026-07-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

/** 移动目标：3 条轨迹 + 驻留 + 高速异常 */
export const MOBILE_TARGET_INSTANCES: Record<string, unknown>[] = [
  // 护卫舰 T-001：向东北机动，中段驻留
  {
    id: 101,
    name: '护卫舰-海狼',
    track_id: 'T-001',
    target_type: '护卫舰',
    longitude: 119.18,
    latitude: 25.62,
    event_time: t(18, 6)
  },
  {
    id: 102,
    name: '护卫舰-海狼',
    track_id: 'T-001',
    target_type: '护卫舰',
    longitude: 119.28,
    latitude: 25.72,
    event_time: t(18, 9)
  },
  {
    id: 103,
    name: '护卫舰-海狼',
    track_id: 'T-001',
    target_type: '护卫舰',
    longitude: 119.31,
    latitude: 25.74,
    event_time: t(18, 11)
  },
  {
    id: 104,
    name: '护卫舰-海狼',
    track_id: 'T-001',
    target_type: '护卫舰',
    longitude: 119.31,
    latitude: 25.74,
    event_time: t(18, 13, 20)
  },
  {
    id: 105,
    name: '护卫舰-海狼',
    track_id: 'T-001',
    target_type: '护卫舰',
    longitude: 119.48,
    latitude: 25.86,
    event_time: t(18, 16)
  },
  {
    id: 106,
    name: '护卫舰-海狼',
    track_id: 'T-001',
    target_type: '护卫舰',
    longitude: 119.62,
    latitude: 25.98,
    event_time: t(18, 19)
  },
  // 运输舰 T-002：自西向东
  {
    id: 201,
    name: '运输舰-远洋',
    track_id: 'T-002',
    target_type: '运输舰',
    longitude: 119.05,
    latitude: 25.55,
    event_time: t(18, 8)
  },
  {
    id: 202,
    name: '运输舰-远洋',
    track_id: 'T-002',
    target_type: '运输舰',
    longitude: 119.22,
    latitude: 25.58,
    event_time: t(18, 12)
  },
  {
    id: 203,
    name: '运输舰-远洋',
    track_id: 'T-002',
    target_type: '运输舰',
    longitude: 119.45,
    latitude: 25.62,
    event_time: t(18, 16)
  },
  {
    id: 204,
    name: '运输舰-远洋',
    track_id: 'T-002',
    target_type: '运输舰',
    longitude: 119.68,
    latitude: 25.7,
    event_time: t(18, 20)
  },
  // 侦察机 T-003：高速机动（易触发速度异常）
  {
    id: 301,
    name: '侦察机-猎鹰',
    track_id: 'T-003',
    target_type: '航空器',
    longitude: 119.4,
    latitude: 25.8,
    event_time: t(19, 7)
  },
  {
    id: 302,
    name: '侦察机-猎鹰',
    track_id: 'T-003',
    target_type: '航空器',
    longitude: 119.85,
    latitude: 26.05,
    event_time: t(19, 7, 25)
  },
  {
    id: 303,
    name: '侦察机-猎鹰',
    track_id: 'T-003',
    target_type: '航空器',
    longitude: 120.15,
    latitude: 26.22,
    event_time: t(19, 7, 50)
  },
  {
    id: 304,
    name: '侦察机-猎鹰',
    track_id: 'T-003',
    target_type: '航空器',
    longitude: 120.42,
    latitude: 26.35,
    event_time: t(19, 8, 10)
  },
  // 民船 T-004：慢速
  {
    id: 401,
    name: '民船-顺达',
    track_id: 'T-004',
    target_type: '民船',
    longitude: 119.55,
    latitude: 25.48,
    event_time: t(19, 10)
  },
  {
    id: 402,
    name: '民船-顺达',
    track_id: 'T-004',
    target_type: '民船',
    longitude: 119.58,
    latitude: 25.5,
    event_time: t(19, 14)
  },
  {
    id: 403,
    name: '民船-顺达',
    track_id: 'T-004',
    target_type: '民船',
    longitude: 119.62,
    latitude: 25.53,
    event_time: t(19, 18)
  },
  // 后期向东迁移（供迁徙分析）
  {
    id: 501,
    name: '巡逻艇-前锋',
    track_id: 'T-005',
    target_type: '巡逻艇',
    longitude: 119.12,
    latitude: 25.6,
    event_time: t(18, 10)
  },
  {
    id: 502,
    name: '巡逻艇-前锋',
    track_id: 'T-005',
    target_type: '巡逻艇',
    longitude: 119.15,
    latitude: 25.62,
    event_time: t(18, 14)
  },
  {
    id: 503,
    name: '巡逻艇-前锋',
    track_id: 'T-005',
    target_type: '巡逻艇',
    longitude: 119.72,
    latitude: 25.88,
    event_time: t(19, 15)
  },
  {
    id: 504,
    name: '巡逻艇-前锋',
    track_id: 'T-005',
    target_type: '巡逻艇',
    longitude: 119.95,
    latitude: 26.02,
    event_time: t(19, 19)
  }
];

/** 态势事件：两个共现簇 + 时间演化分布 */
export const SITUATION_EVENT_INSTANCES: Record<string, unknown>[] = [
  // 共现簇 A — 平潭以东海域
  {
    id: 1001,
    name: '雷达异常信号-A1',
    event_type: '电磁',
    longitude: 119.78,
    latitude: 25.72,
    event_time: t(19, 8, 10)
  },
  {
    id: 1002,
    name: '雷达异常信号-A2',
    event_type: '电磁',
    longitude: 119.8,
    latitude: 25.74,
    event_time: t(19, 8, 35)
  },
  {
    id: 1003,
    name: '海上会合-A3',
    event_type: '会合',
    longitude: 119.79,
    latitude: 25.73,
    event_time: t(19, 9, 5)
  },
  {
    id: 1004,
    name: '通信截获-A4',
    event_type: '通信',
    longitude: 119.81,
    latitude: 25.75,
    event_time: t(19, 9, 40)
  },
  {
    id: 1005,
    name: '补给活动-A5',
    event_type: '后勤',
    longitude: 119.77,
    latitude: 25.71,
    event_time: t(19, 10, 15)
  },
  // 共现簇 B — 台湾海峡北口
  {
    id: 1101,
    name: '舰艇集结-B1',
    event_type: '集结',
    longitude: 120.05,
    latitude: 25.95,
    event_time: t(19, 17)
  },
  {
    id: 1102,
    name: '舰艇集结-B2',
    event_type: '集结',
    longitude: 120.07,
    latitude: 25.97,
    event_time: t(19, 17, 30)
  },
  {
    id: 1103,
    name: '空中巡逻-B3',
    event_type: '航空',
    longitude: 120.06,
    latitude: 25.96,
    event_time: t(19, 18)
  },
  {
    id: 1104,
    name: '海上演习-B4',
    event_type: '演习',
    longitude: 120.08,
    latitude: 25.98,
    event_time: t(19, 18, 45)
  },
  // 分散事件 — 区域热度
  {
    id: 1201,
    name: '港口进出记录',
    event_type: '港口',
    longitude: 119.3,
    latitude: 25.45,
    event_time: t(18, 15)
  },
  {
    id: 1202,
    name: '渔场活动报告',
    event_type: '民用',
    longitude: 119.9,
    latitude: 25.35,
    event_time: t(18, 18)
  },
  {
    id: 1203,
    name: '气象预警发布',
    event_type: '气象',
    longitude: 119.5,
    latitude: 26.1,
    event_time: t(19, 6)
  },
  {
    id: 1204,
    name: '航道封锁提示',
    event_type: '管制',
    longitude: 120.2,
    latitude: 25.55,
    event_time: t(19, 12)
  },
  // 后期增多 — 演化
  {
    id: 1301,
    name: '夜间侦察报告-1',
    event_type: '侦察',
    longitude: 119.65,
    latitude: 25.82,
    event_time: t(19, 21)
  },
  {
    id: 1302,
    name: '夜间侦察报告-2',
    event_type: '侦察',
    longitude: 119.88,
    latitude: 25.9,
    event_time: t(19, 22)
  },
  {
    id: 1303,
    name: '夜间侦察报告-3',
    event_type: '侦察',
    longitude: 120.02,
    latitude: 26.0,
    event_time: t(19, 23)
  },
  {
    id: 1304,
    name: '凌晨态势更新-1',
    event_type: '态势',
    longitude: 120.1,
    latitude: 26.08,
    event_time: t(20, 1)
  },
  {
    id: 1305,
    name: '凌晨态势更新-2',
    event_type: '态势',
    longitude: 120.18,
    latitude: 26.12,
    event_time: t(20, 3)
  },
  {
    id: 1306,
    name: '凌晨态势更新-3',
    event_type: '态势',
    longitude: 120.25,
    latitude: 26.15,
    event_time: t(20, 5)
  }
];

export const SPATIOTEMPORAL_INSTANCES_BY_CODE: Record<
  string,
  Record<string, unknown>[]
> = {
  mobile_target: MOBILE_TARGET_INSTANCES,
  situation_event: SITUATION_EVENT_INSTANCES
};

export const buildSpatiotemporalFilePath = (code: string) =>
  `dev://spatiotemporal-demo/${code}.csv`;
