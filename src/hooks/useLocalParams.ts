import { useState, useCallback, useMemo } from 'react';
import { ScriptParam } from '@/types/sqlDevelopApi';

// 扩展 ScriptParam 以支持内部排序
type ParameterWithOrder = ScriptParam & { _order?: number };

interface UseLocalParamsOptions {
  initialParams?: ScriptParam[]; // 初始参数列表（非必传）
  regex?: RegExp; // 正则规则（非必传，默认使用 /\$\{([^}]+)\}/g）
}

interface UseLocalParamsReturn {
  localParams: ScriptParam[]; // 当前的参数列表
  parseParams: (content: string) => ScriptParam[]; // 读操作：解析content，返回参数列表（会合并现有localParams，保留已有参数值）
  parseAndSetParams: (content: string) => void; // 写操作：解析content并设置到localParams（会合并现有localParams，保留已有参数值）
  updateParamValue: (paramKey: string, value: string) => void; // 写操作：更新参数的value
  setLocalParams: (params: ScriptParam[]) => void; // 直接设置参数列表
}

// 默认的正则表达式
const DEFAULT_REGEX = /\$\{([^}]+)\}/g;

/**
 * 围绕localParams的hook
 * @param options 配置选项
 * @returns hook返回值，包含localParams状态和操作方法
 */
export function useLocalParams(
  options: UseLocalParamsOptions = {}
): UseLocalParamsReturn {
  const { initialParams = [], regex = DEFAULT_REGEX } = options;

  // 初始化localParams，添加_order字段用于排序
  const [localParams, setLocalParams] = useState<ParameterWithOrder[]>(() => {
    const baseTimestamp = Date.now();
    return initialParams.map((p, index) => ({
      ...p,
      _order: (p as ParameterWithOrder)._order ?? baseTimestamp - index
    }));
  });

  /**
   * 内部函数：从内容中提取参数，并合并现有的localParams（保留已有参数值）
   * @param content 要解析的内容
   * @returns 解析出的参数列表（包含_order字段）
   */
  const parseParams = useCallback(
    (content: string): ParameterWithOrder[] => {
      // 重置正则的 lastIndex，避免全局匹配的问题
      const regexToUse = new RegExp(regex.source, regex.flags);
      regexToUse.lastIndex = 0;

      // 先将现有的localParams转换为Map，保留已有参数的值和描述
      const existingParamsMap = new Map<string, ParameterWithOrder>();
      localParams.forEach((param) => {
        existingParamsMap.set(param.config_key, {
          ...param,
          _order: param._order ?? 0
        });
      });

      const paramMap = new Map<string, ParameterWithOrder>();
      const matches = Array.from(content.matchAll(regexToUse));
      const baseTimestamp = Date.now();

      matches.forEach((match, index) => {
        const paramName = match[1]?.trim();
        if (paramName) {
          // 为每个参数分配时间戳，越后面的参数时间戳越大（越新）
          const timestamp = baseTimestamp + index;
          // 如果参数已存在，更新 order 为最新的时间戳
          if (paramMap.has(paramName)) {
            const existing = paramMap.get(paramName)!;
            existing._order = timestamp;
          } else {
            // 检查现有localParams中是否有该参数
            const existingParam = existingParamsMap.get(paramName);
            if (existingParam) {
              // 如果存在，保留其值、描述和原有order（如果新解析的优先级更高，则更新order）
              paramMap.set(paramName, {
                ...existingParam,
                _order: Math.max(existingParam._order || 0, timestamp)
              });
            } else {
              // 如果不存在，创建新参数
              paramMap.set(paramName, {
                config_key: paramName,
                config_value: '',
                config_desc: '',
                _order: timestamp
              });
            }
          }
        }
      });

      // 转换为数组并按 order 降序排列（最新的在顶部）
      return Array.from(paramMap.values()).sort(
        (a, b) => (b._order || 0) - (a._order || 0)
      );
    },
    [regex, localParams]
  );

  /**
   * 更新参数的value
   * @param paramKey 参数key
   * @param value 新的value值
   */
  const updateParamValue = useCallback((paramKey: string, value: string) => {
    setLocalParams((prev) => {
      return prev.map((p) =>
        p.config_key === paramKey ? { ...p, config_value: value } : p
      );
    });
  }, []);

  /**
   * 解析内容并设置到localParams（会合并现有localParams，保留已有参数值）
   * @param content 要解析的内容
   */
  const parseAndSetParams = useCallback(
    (content: string) => {
      const parsedParams = parseParams(content);
      setLocalParams(parsedParams);
    },
    [parseParams]
  );

  // 返回不包含_order字段的参数列表
  const paramsWithoutOrder = useMemo(() => {
    return localParams.map(({ _order, ...param }) => param);
  }, [localParams]);

  return {
    /** 不包含 _order 字段的参数列表 */
    localParams: paramsWithoutOrder,
    /** 设置参数列表 */
    setLocalParams,
    /** 解析参数（会合并现有localParams，保留已有参数值） */
    parseParams,
    /** 解析并设置参数（会合并现有localParams，保留已有参数值） */
    parseAndSetParams,
    /** 更新参数值 */
    updateParamValue
  };
}
