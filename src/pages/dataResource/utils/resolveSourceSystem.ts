/** 表 id ≥ 11 为大型运输公司业务域（车载传感采集数据除外） */
const VEHICLE_MAINTENANCE_TABLE_IDS = new Set(['21']);

export const resolveSourceSystem = (tableId: string): string => {
  if (VEHICLE_MAINTENANCE_TABLE_IDS.has(tableId)) {
    return '车辆运维平台';
  }
  const id = Number(tableId);
  return id >= 11 ? '运输管理系统' : '车辆运维平台';
};

export const SOURCE_SYSTEM_FILTERS = [
  { text: '车辆运维平台', value: '车辆运维平台' },
  { text: '运输管理系统', value: '运输管理系统' },
  { text: '教务管理系统', value: '教务管理系统' },
  { text: '图书馆管理系统', value: '图书馆管理系统' }
] as const;
