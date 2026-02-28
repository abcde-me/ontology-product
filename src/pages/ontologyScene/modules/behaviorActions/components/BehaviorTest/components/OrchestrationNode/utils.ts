import dayjs from 'dayjs';
import { UiType } from '@/pages/ontologyScene/types/ontologyFunction';

// 对象类型名称缓存
const objectTypeNameCache: Record<number, string> = {};

/**
 * 获取对象类型名称
 * @param objectTypeId 对象类型 ID
 * @returns 对象类型名称的 Promise
 */
export const getObjectTypeName = async (
  objectTypeId: number
): Promise<string> => {
  // 如果缓存中有，直接返回
  if (objectTypeNameCache[objectTypeId]) {
    return objectTypeNameCache[objectTypeId];
  }

  try {
    // 动态导入 API 函数以避免循环依赖
    const { listOntologyObjectType } = await import(
      '@/api/ontologySceneLibrary/objectType'
    );

    const response = await listOntologyObjectType({
      pageNo: 1,
      pageSize: 100
    });

    if (response.status === 200 && response.data?.result) {
      // 缓存所有对象类型名称
      response.data.result.forEach((item) => {
        if (item.id && item.name) {
          objectTypeNameCache[item.id] = item.name;
        }
      });

      // 返回目标对象类型名称
      return objectTypeNameCache[objectTypeId] || String(objectTypeId);
    }
  } catch (error) {
    console.error('获取对象类型名称失败:', error);
  }

  return String(objectTypeId);
};

/**
 * 格式化参数显示值
 * @param value 参数值
 * @param uiType 参数的 UI 类型
 * @returns 格式化后的显示字符串或 Promise<string>
 */
export const formatParamDisplayValue = (
  value: any,
  uiType: UiType
): string | Promise<string> => {
  // 未配置的情况
  if (value === undefined || value === null || value === '') {
    // 对于 Switch 类型，false 也是有效配置
    if (uiType === UiType.Switch && value !== undefined && value !== null) {
      return value ? '是' : '否';
    }
    return '未配置';
  }

  // 处理 ObjectOne 类型 - 异步获取对象类型名称
  if (uiType === UiType.ObjectOne) {
    const objectTypeId = typeof value === 'number' ? value : Number(value);
    if (!isNaN(objectTypeId)) {
      return getObjectTypeName(objectTypeId);
    }
    return String(value);
  }

  // 处理 Uploader 类型 - 显示文件名列表
  if (uiType === UiType.Uploader) {
    if (Array.isArray(value) && value.length > 0) {
      // 提取文件名并用逗号分隔
      const fileNames = value
        .map((file) => file.name || file.fileName || '未知文件')
        .join(', ');
      return fileNames;
    }
    return '未上传文件';
  }

  // 处理 Timestamp 类型 - 格式化为 YYYY-MM-DD HH:mm:ss
  if (uiType === UiType.Timestamp) {
    // 检查是否是 dayjs 对象
    if (dayjs.isDayjs(value)) {
      return value.format('YYYY-MM-DD HH:mm:ss');
    }
    // 检查是否是 Date 对象
    if (value instanceof Date) {
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
    }
    // 如果是字符串或时间戳，也尝试格式化
    if (typeof value === 'string' || typeof value === 'number') {
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
    }
    return String(value);
  }

  // 处理 Geopoint 类型 - 格式化为 "lng,lat"
  if (uiType === UiType.Geopoint) {
    if (
      typeof value === 'object' &&
      value !== null &&
      'lng' in value &&
      'lat' in value
    ) {
      return `${value.lng},${value.lat}`;
    }
    return String(value);
  }

  // 处理布尔值
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }

  // 处理数组
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // 处理对象（避免显示 [object Object]）
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  // 其他类型直接转字符串
  return String(value);
};

/**
 * 检查参数是否已配置
 * @param value 参数值
 * @param uiType 参数的 UI 类型
 * @returns 是否已配置
 */
export const isParamConfigured = (value: any, uiType: UiType): boolean => {
  // 对于 Switch 类型，false 也是有效配置
  if (uiType === UiType.Switch) {
    return value !== undefined && value !== null;
  }

  // 其他类型需要有非空值
  return value !== undefined && value !== null && value !== '';
};
