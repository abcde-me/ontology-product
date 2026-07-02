/** 车载传感采集配置主数据（sensor_channel）示例数据生成 */

const VEHICLE_ASSETS = [
  'LZZ1CLVB8RA123456',
  'LZZ1CLVB8RA234567',
  'LZZ1CLVB8RA345678',
  'LZZ1CLVB8RA456789',
  'LZZ1CLVB8RA567890'
];

const COMPONENT_ASSETS = [
  'CMP-ENG-20210315-001',
  'CMP-GBX-20210315-002',
  'CMP-REF-20211108-003',
  'CMP-ENG-20190822-004',
  'CMP-REF-20180412-005'
];

const METRIC_CONFIGS = [
  { metric_name: '冷却液温度', unit: '℃' },
  { metric_name: '机油压力', unit: 'kPa' },
  { metric_name: 'DPF 压差', unit: 'kPa' },
  { metric_name: '冷藏箱温度', unit: '℃' },
  { metric_name: '制动气压', unit: 'bar' },
  { metric_name: '轮胎胎压', unit: 'bar' },
  { metric_name: '发动机转速', unit: 'rpm' },
  { metric_name: '油箱液位', unit: '%' },
  { metric_name: '电池电压', unit: 'V' },
  { metric_name: '排气温度', unit: '℃' }
];

const SAMPLE_RATES = [
  '1次/5秒',
  '1次/10秒',
  '1次/15秒',
  '1次/30秒',
  '1次/60秒',
  '1次/120秒'
];

export const buildSensorChannelSampleData = (
  count = 50
): Record<string, unknown>[] => {
  const assets = [...VEHICLE_ASSETS, ...COMPONENT_ASSETS];
  const rows: Record<string, unknown>[] = [];

  for (let index = 0; index < count; index += 1) {
    const metric = METRIC_CONFIGS[index % METRIC_CONFIGS.length];
    const asset = assets[index % assets.length];

    rows.push({
      channel_id: `SC-${String(index + 1).padStart(3, '0')}`,
      asset_ref: asset,
      metric_name: metric.metric_name,
      sample_rate: SAMPLE_RATES[index % SAMPLE_RATES.length],
      unit: metric.unit
    });
  }

  return rows;
};
