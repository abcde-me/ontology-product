import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { UiType } from '@/pages/ontologyScene/types/ontologyFunction';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import { ObjectTypeTagList } from '@/pages/ontologyScene/componens';
import EllipsisTextWithTooltip from '@/pages/ontologyScene/modules/behaviorLog/components/EllipsisTextWithTooltip';

// ObjectRef 渲染组件 - 用于显示对象引用
const ObjectRefRenderer: React.FC<{
  objectTypeId?: number;
  pk?: string;
  objectTypeData?: {
    name: string;
    icon: string;
    id: string;
  };
  objInsID?: number | string;
}> = ({ objectTypeId, pk, objectTypeData, objInsID }) => {
  const [displayContent, setDisplayContent] =
    useState<React.ReactNode>('加载中...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 如果有新的数据结构，直接使用
    if (objectTypeData && objInsID !== undefined) {
      // 检查数据完整性
      if (
        objectTypeData.name &&
        objectTypeData.icon &&
        objInsID !== null &&
        objInsID !== ''
      ) {
        const iconOption = OBJECT_TYPE_ICON_OPTIONS.find(
          (option) => option.value === objectTypeData.icon
        );
        const IconComponent =
          iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

        // 渲染：图标 + 名称 / pk
        setDisplayContent(
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4 flex-shrink-0" />
            <EllipsisTextWithTooltip
              value={`${objectTypeData.name} / ${objInsID}`}
              className="min-w-0 flex-1"
            />
          </div>
        );
      } else {
        // 数据不完整，显示未配置
        setDisplayContent('未配置');
      }
      setLoading(false);
      return;
    }

    // 如果没有新数据结构，使用原来的 API 调用逻辑
    if (!objectTypeId || !pk) {
      setDisplayContent('数据格式错误');
      setLoading(false);
      return;
    }
  }, [objectTypeId, pk, objectTypeData, objInsID]);

  if (loading) {
    return <span>加载中...</span>;
  }

  return <>{displayContent}</>;
};

// 对象类型名称缓存
const objectTypeNameCache: Record<number, string> = {};
// Promise 缓存，避免重复请求
const objectTypeNamePromiseCache: Record<number, Promise<string> | undefined> =
  {};

/**
 * 获取对象类型名称
 * @param objectTypeId 对象类型 ID
 * @returns 对象类型名称的 Promise
 */
export const getObjectTypeName = async (
  objectTypeId: number
): Promise<string> => {
  // 如果缓存中有结果，直接返回
  if (objectTypeNameCache[objectTypeId]) {
    return Promise.resolve(objectTypeNameCache[objectTypeId]);
  }

  // 如果正在请求中，返回同一个 Promise
  const cachedPromise = objectTypeNamePromiseCache[objectTypeId];
  if (cachedPromise) {
    return cachedPromise;
  }

  // 创建新的请求 Promise
  const promise = (async () => {
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
        const name = objectTypeNameCache[objectTypeId] || String(objectTypeId);

        // 清除 Promise 缓存
        delete objectTypeNamePromiseCache[objectTypeId];

        return name;
      }
    } catch (error) {
      console.error('获取对象类型名称失败:', error);
      // 清除 Promise 缓存
      delete objectTypeNamePromiseCache[objectTypeId];
    }

    return String(objectTypeId);
  })();

  // 缓存 Promise
  objectTypeNamePromiseCache[objectTypeId] = promise;

  return promise;
};

/**
 * 格式化参数显示值
 * @param value 参数值
 * @param uiType 参数的 UI 类型
 * @returns 格式化后的显示字符串、Promise<string> 或 React 组件
 */
export const formatParamDisplayValue = (
  value: any,
  uiType: UiType
): string | Promise<string> | React.ReactNode => {
  // 未配置的情况
  if (value === undefined || value === null || value === '') {
    // 对于 Switch 类型，false 也是有效配置
    if (uiType === UiType.Switch && value !== undefined && value !== null) {
      return value ? '是' : '否';
    }
    return '未配置';
  }

  // 处理 ObjectOne 类型 - 渲染为 ObjectRefRenderer 组件
  if (uiType === UiType.ObjectOne) {
    // 如果值是新的对象格式 { objInsID: 1, objectTypeData: { name: '物品库存1', icon: 'object-type-fighter', id: 'inventory' } }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 检查是否是新的数据结构
      if (value.objInsID !== undefined && value.objectTypeData) {
        return (
          <ObjectRefRenderer
            objectTypeData={value.objectTypeData}
            objInsID={value.objInsID}
          />
        );
      }

      // 如果对象格式不符合预期，返回未配置
      return '未配置';
    }

    // 如果值是 ObjectRef 格式的字符串
    if (typeof value === 'string' && value.includes('ObjectRef(')) {
      // 解析 ObjectRef 字符串: ObjectRef(object_type="85", pk=王五10)
      const match = value.match(
        /ObjectRef\(object_type="(\d+)",\s*pk=([^)]+)\)/
      );
      if (match) {
        const [, objectTypeId, pk] = match;
        // 返回 React 组件
        return (
          <ObjectRefRenderer objectTypeId={Number(objectTypeId)} pk={pk} />
        );
      }
    }

    // 如果是纯数字ID，获取对象类型名称
    const objectTypeId = typeof value === 'number' ? value : Number(value);
    if (!isNaN(objectTypeId)) {
      return getObjectTypeName(objectTypeId);
    }
    return String(value);
  }

  // 处理 ObjectSet 类型 - 渲染为 ObjectTypeTagList 组件
  if (uiType === UiType.ObjectSet) {
    let objectTypeList: any[] = [];

    // 如果是新的对象格式 { objInsID: ['17', '16'], objectTypeData: { name: 'objectType002', icon: 'object-type-civil-aviation', id: 'objectType002' } }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 检查是否是新的数据结构
      if (
        value.objInsID &&
        value.objectTypeData &&
        Array.isArray(value.objInsID)
      ) {
        const { objInsID, objectTypeData } = value;

        // 检查数据完整性
        if (
          objectTypeData.name &&
          objectTypeData.icon &&
          objectTypeData.id &&
          objInsID.length > 0
        ) {
          // 为每个 objInsID 创建一个对象
          objectTypeList = objInsID.map((pk: string) => ({
            name: `${objectTypeData.name}/${pk}`,
            ontologyObjectTypeName: `${objectTypeData.name}/${pk}`,
            id: objectTypeData.id,
            ontologyObjectTypeId: String(objectTypeData.id),
            ontologyObjectTypeIcon: objectTypeData.icon
          }));
        }
      }
    }

    if (objectTypeList.length === 0) {
      return '未配置';
    }

    // 转换为 ObjectTypeTagList 需要的格式
    const tags = objectTypeList.map((item: any) => ({
      ontologyObjectTypeName: item.name || item.ontologyObjectTypeName || '',
      ontologyObjectTypeId: item.id || item.ontologyObjectTypeId,
      ontologyObjectTypeIcon: item.icon || item.ontologyObjectTypeIcon,
      onClick: () => {
        console.log('Click object type:', item);
      }
    }));

    return <ObjectTypeTagList tags={tags} />;
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
