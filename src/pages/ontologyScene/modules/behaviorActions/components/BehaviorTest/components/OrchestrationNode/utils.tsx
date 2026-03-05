import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { UiType } from '@/pages/ontologyScene/types/ontologyFunction';
import { getOntologyObjectTypeDetail } from '@/api/ontologySceneLibrary/objectType';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import { ObjectTypeTagList } from '@/pages/ontologyScene/componens';

// ObjectRef 渲染组件 - 用于显示对象引用
const ObjectRefRenderer: React.FC<{ objectTypeId: number; pk: string }> = ({
  objectTypeId,
  pk
}) => {
  const [displayContent, setDisplayContent] =
    useState<React.ReactNode>('加载中...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchObjectTypeDetail = async () => {
      try {
        // 调用 API 获取对象类型详情
        const response = await getOntologyObjectTypeDetail({
          id: objectTypeId
        });

        if (response.data) {
          const { icon, name } = response.data;

          // 匹配图标
          const iconOption = OBJECT_TYPE_ICON_OPTIONS.find(
            (option) => option.value === icon
          );
          const IconComponent =
            iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

          // 渲染：图标 + 名称 / pk
          setDisplayContent(
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              <span>
                {name} / {pk}
              </span>
            </div>
          );
        } else {
          setDisplayContent(`${objectTypeId} / ${pk}`);
        }
      } catch (error) {
        console.error('Failed to fetch ObjectRef detail:', error);
        setDisplayContent(`${objectTypeId} / ${pk}`);
      } finally {
        setLoading(false);
      }
    };

    fetchObjectTypeDetail();
  }, [objectTypeId, pk]);

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
    // 如果值是对象格式 { objectTypeID: 85, objInsID: "王五104" }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const objectTypeId =
        value.objectTypeID || value.object_type || value.objectType;
      const pk = value.objInsID || value.pk;

      if (objectTypeId && pk !== undefined && pk !== null) {
        // 返回 React 组件
        return (
          <ObjectRefRenderer
            objectTypeId={Number(objectTypeId)}
            pk={String(pk)}
          />
        );
      }

      // 如果对象格式不符合预期，尝试 JSON 序列化
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
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

    // 如果是对象格式 { objectTypeID: 85, objInsID: ['王五104', '王五103'] }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const objectTypeId =
        value.objectTypeID || value.object_type || value.objectType;
      const objInsIDs = value.objInsID || value.pks || [];

      if (objectTypeId && Array.isArray(objInsIDs) && objInsIDs.length > 0) {
        // 为每个 objInsID 创建一个对象
        objectTypeList = objInsIDs.map((pk: string) => ({
          name: pk,
          ontologyObjectTypeName: pk,
          id: objectTypeId,
          ontologyObjectTypeId: String(objectTypeId),
          ontologyObjectTypeIcon: value.icon || undefined
        }));
      }
    }
    // 如果是字符串格式，需要先解析
    else if (typeof value === 'string') {
      // 处理 ObjectSet([{...}]) 格式
      const objectSetMatch = value.match(/ObjectSet\((\[.+\])\)/);
      if (objectSetMatch) {
        try {
          // 解析 JSON 数组
          let jsonStr = objectSetMatch[1];

          // 修复 pk 值没有引号的问题
          // 将 "pk":值 替换为 "pk":"值"
          jsonStr = jsonStr.replace(/"pk":([^,}\]]+)/g, (match, pkValue) => {
            // 如果值已经有引号，不处理
            if (pkValue.trim().startsWith('"')) {
              return match;
            }
            // 否则给值加上引号
            return `"pk":"${pkValue.trim()}"`;
          });

          const parsedArray = JSON.parse(jsonStr);
          objectTypeList = parsedArray.map((item: any) => ({
            name: item.pk || '',
            ontologyObjectTypeName: item.pk || '',
            id: item.object_type,
            ontologyObjectTypeId: String(item.object_type),
            // icon 字段可以从 item 中获取，如果没有则不传
            ontologyObjectTypeIcon: item.icon || undefined
          }));
        } catch (error) {
          console.error('Failed to parse ObjectSet:', error);
          return String(value);
        }
      }
    }
    // 如果是数组格式
    else if (Array.isArray(value)) {
      objectTypeList = value.map((item: any) => {
        // 如果是对象格式 { objectTypeID: 85, objInsID: "王五104" }
        if (typeof item === 'object' && item !== null) {
          const objectTypeId =
            item.objectTypeID || item.object_type || item.objectType || item.id;
          const pk = item.objInsID || item.pk || item.name;
          const icon = item.icon || item.ontologyObjectTypeIcon;

          return {
            name: pk || '',
            ontologyObjectTypeName: pk || '',
            id: objectTypeId,
            ontologyObjectTypeId: String(objectTypeId),
            ontologyObjectTypeIcon: icon
          };
        }
        return item;
      });
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
