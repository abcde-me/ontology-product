/** 车载传感采集数据（sensor_reading）示例数据生成 */

const READING_CONFIGS: Array<{
  channel_id: string;
  asset_ref: string;
  metric_name: string;
  unit: string;
  metric_value: string;
  quality_status: string;
  alarm_flag: boolean;
}> = [
  {
    channel_id: 'SC-001',
    asset_ref: 'LZZ1CLVB8RA123456',
    metric_name: '冷却液温度',
    unit: '℃',
    metric_value: '88.50',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-002',
    asset_ref: 'LZZ1CLVB8RA234567',
    metric_name: '机油压力',
    unit: 'kPa',
    metric_value: '420.00',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-003',
    asset_ref: 'LZZ1CLVB8RA345678',
    metric_name: 'DPF 压差',
    unit: 'kPa',
    metric_value: '18.60',
    quality_status: '异常',
    alarm_flag: true
  },
  {
    channel_id: 'SC-004',
    asset_ref: 'LZZ1CLVB8RA456789',
    metric_name: '冷藏箱温度',
    unit: '℃',
    metric_value: '-18.20',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-005',
    asset_ref: 'LZZ1CLVB8RA567890',
    metric_name: '制动气压',
    unit: 'bar',
    metric_value: '6.80',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-006',
    asset_ref: 'CMP-ENG-20210315-001',
    metric_name: '轮胎胎压',
    unit: 'bar',
    metric_value: '8.50',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-007',
    asset_ref: 'CMP-GBX-20210315-002',
    metric_name: '发动机转速',
    unit: 'rpm',
    metric_value: '1650.00',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-008',
    asset_ref: 'CMP-REF-20211108-003',
    metric_name: '油箱液位',
    unit: '%',
    metric_value: '62.00',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-009',
    asset_ref: 'CMP-ENG-20190822-004',
    metric_name: '电池电压',
    unit: 'V',
    metric_value: '24.80',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-010',
    asset_ref: 'CMP-REF-20180412-005',
    metric_name: '排气温度',
    unit: '℃',
    metric_value: '385.00',
    quality_status: '异常',
    alarm_flag: true
  },
  {
    channel_id: 'SC-011',
    asset_ref: 'LZZ1CLVB8RA123456',
    metric_name: '冷却液温度',
    unit: '℃',
    metric_value: '92.30',
    quality_status: '异常',
    alarm_flag: true
  },
  {
    channel_id: 'SC-012',
    asset_ref: 'LZZ1CLVB8RA234567',
    metric_name: '机油压力',
    unit: 'kPa',
    metric_value: '180.00',
    quality_status: '异常',
    alarm_flag: true
  },
  {
    channel_id: 'SC-013',
    asset_ref: 'LZZ1CLVB8RA345678',
    metric_name: 'DPF 压差',
    unit: 'kPa',
    metric_value: '8.20',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-014',
    asset_ref: 'LZZ1CLVB8RA456789',
    metric_name: '冷藏箱温度',
    unit: '℃',
    metric_value: '-2.50',
    quality_status: '异常',
    alarm_flag: true
  },
  {
    channel_id: 'SC-015',
    asset_ref: 'LZZ1CLVB8RA567890',
    metric_name: '制动气压',
    unit: 'bar',
    metric_value: '4.20',
    quality_status: '异常',
    alarm_flag: true
  },
  {
    channel_id: 'SC-016',
    asset_ref: 'CMP-ENG-20210315-001',
    metric_name: '轮胎胎压',
    unit: 'bar',
    metric_value: '7.10',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-017',
    asset_ref: 'CMP-GBX-20210315-002',
    metric_name: '发动机转速',
    unit: 'rpm',
    metric_value: '2100.00',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-018',
    asset_ref: 'CMP-REF-20211108-003',
    metric_name: '油箱液位',
    unit: '%',
    metric_value: '28.00',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-019',
    asset_ref: 'CMP-ENG-20190822-004',
    metric_name: '电池电压',
    unit: 'V',
    metric_value: '23.10',
    quality_status: '正常',
    alarm_flag: false
  },
  {
    channel_id: 'SC-020',
    asset_ref: 'CMP-REF-20180412-005',
    metric_name: '排气温度',
    unit: '℃',
    metric_value: '410.50',
    quality_status: '异常',
    alarm_flag: true
  }
];

const COLLECT_TIMES = [
  '2025-06-07 06:00:05',
  '2025-06-07 06:00:10',
  '2025-06-07 06:00:15',
  '2025-06-07 06:00:20',
  '2025-06-07 06:00:25',
  '2025-06-07 06:00:30',
  '2025-06-07 06:00:35',
  '2025-06-07 06:00:40',
  '2025-06-07 06:00:45',
  '2025-06-07 06:00:50',
  '2025-06-07 08:15:05',
  '2025-06-07 08:15:10',
  '2025-06-07 08:15:15',
  '2025-06-07 08:15:20',
  '2025-06-07 08:15:25',
  '2025-06-07 10:30:05',
  '2025-06-07 10:30:10',
  '2025-06-07 10:30:15',
  '2025-06-07 12:45:05',
  '2025-06-07 12:45:10'
];

export const buildSensorReadingSampleData = (
  count = 20
): Record<string, unknown>[] => {
  return READING_CONFIGS.slice(0, count).map((config, index) => ({
    reading_id: `SR-20250607-${String(index + 1).padStart(4, '0')}`,
    channel_id: config.channel_id,
    asset_ref: config.asset_ref,
    metric_name: config.metric_name,
    collect_time: COLLECT_TIMES[index],
    metric_value: config.metric_value,
    unit: config.unit,
    quality_status: config.quality_status,
    alarm_flag: config.alarm_flag
  }));
};
