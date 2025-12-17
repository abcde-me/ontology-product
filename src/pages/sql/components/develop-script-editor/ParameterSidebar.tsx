import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Input, Popover } from '@arco-design/web-react';
import classNames from 'classnames';
import ParameterIcon from '../../assets/parameter-icon.svg';
import ArrowRightIcon from '../../assets/arrow-right-icon.svg';
import { ScriptParam } from '@/types/sqlDevelopApi';

// 扩展 ScriptParam 以支持内部排序
type ParameterWithOrder = ScriptParam & { _order?: number };

interface ParameterSidebarProps {
  content: string;
  canEdit: boolean;
  onParameterChange?: (params: ScriptParam[]) => void;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  onParameterHover?: (paramName: string | null) => void;
  initialParams?: ScriptParam[]; // 初始参数值（从后端加载）
  systemParamKeys?: Set<string>; // 系统参数名列表
}

// 提取参数的正则表达式
const PARAM_REGEX = /\$\{([^}]+)\}/g;

// 检测是否有 ${} 模式（包括未完成的）
const hasParameterPattern = (content: string): boolean => {
  // 检测是否有 ${ 或完整的 ${param}
  return /\$\{/.test(content);
};

// 从内容中提取所有参数
const extractParameters = (content: string): ParameterWithOrder[] => {
  // 重置正则的 lastIndex，避免全局匹配的问题
  PARAM_REGEX.lastIndex = 0;
  const paramMap = new Map<string, ParameterWithOrder>();
  const matches = Array.from(content.matchAll(PARAM_REGEX));
  const baseTimestamp = Date.now();

  matches.forEach((match, index) => {
    const paramName = match[1].trim();
    if (paramName) {
      // 为每个参数分配时间戳，越后面的参数时间戳越大（越新）
      const timestamp = baseTimestamp + index;
      // 如果参数已存在，更新 order 为最新的时间戳
      if (paramMap.has(paramName)) {
        const existing = paramMap.get(paramName)!;
        existing._order = timestamp;
      } else {
        paramMap.set(paramName, {
          config_key: paramName,
          config_value: '',
          config_desc: '',
          _order: timestamp
        });
      }
    }
  });

  // 转换为数组并按 order 降序排列（最新的在顶部）
  return Array.from(paramMap.values()).sort(
    (a, b) => (b._order || 0) - (a._order || 0)
  );
};

// 检查参数名是否与系统参数冲突（支持 ${} 和 $[] 两种格式）
const isParamNameConflict = (
  paramName: string,
  systemParamKeys: Set<string> | Set<unknown>
): boolean => {
  if (!paramName || systemParamKeys.size === 0) {
    return false;
  }

  const formattedWithBrace = `\${${paramName}}`;
  const formattedWithBracket = `$[${paramName}]`;

  return (
    systemParamKeys.has(formattedWithBrace) ||
    systemParamKeys.has(formattedWithBracket)
  );
};

const ParameterSidebar: React.FC<ParameterSidebarProps> = memo(
  ({
    content,
    canEdit,
    onParameterChange,
    visible: controlledVisible,
    onVisibleChange,
    onCollapsedChange,
    onParameterHover,
    initialParams,
    systemParamKeys = new Set()
  }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [localParams, setLocalParams] = useState<ParameterWithOrder[]>(
      initialParams?.map((p, index) => ({
        ...p,
        _order: (p as ParameterWithOrder)._order ?? Date.now() - index // 如果已有时间戳则保留，否则使用当前时间戳递减
      })) || []
    );
    // 用于标记是否已经初始化完成（initialParams 已经设置过）
    const isInitializedRef = useRef(false);
    // 记录上一次 extractedParams 的长度，用于判断是否从有值变为空
    const prevExtractedParamsLengthRef = useRef<number>(-1);

    // 从内容中提取参数
    const extractedParams = useMemo(() => {
      return extractParameters(content);
    }, [content]);

    // 检测是否有第一个 ${}（检测是否有参数模式）
    const hasFirstParam = useMemo(() => {
      return hasParameterPattern(content);
    }, [content]);

    // 内部可见性状态（如果外部没有控制，则根据是否有参数来决定）
    const isVisible =
      controlledVisible !== undefined ? controlledVisible : hasFirstParam;

    // 通知外部可见性变化
    useEffect(() => {
      if (onVisibleChange) {
        onVisibleChange(isVisible);
      }
    }, [isVisible, onVisibleChange]);

    // 通知外部收起状态变化
    useEffect(() => {
      if (onCollapsedChange) {
        onCollapsedChange(isCollapsed);
      }
    }, [isCollapsed, onCollapsedChange]);

    // 当 initialParams 变化时，更新本地状态并标记为已初始化
    useEffect(() => {
      // 无论 initialParams 是否有值，都标记为已初始化（即使是空数组也表示已经初始化完成）
      if (initialParams !== undefined) {
        const baseTimestamp = Date.now();
        setLocalParams(
          initialParams.map((p, index) => ({
            ...p,
            _order: (p as ParameterWithOrder)._order ?? baseTimestamp - index // 如果已有时间戳则保留，否则使用当前时间戳递减
          }))
        );
        isInitializedRef.current = true;
      }
    }, [initialParams]);

    // 同步提取的参数到本地状态，同时保留已输入的值和初始参数值
    useEffect(() => {
      // 如果还没有初始化完成，不处理 extractedParams（避免覆盖 initialParams）
      if (!isInitializedRef.current) {
        // 记录当前的 extractedParams 长度，但不处理
        prevExtractedParamsLengthRef.current = extractedParams.length;
        return;
      }

      if (extractedParams.length > 0) {
        setLocalParams((prevParams) => {
          const paramMap = new Map<string, string>();

          // 保留已有参数的值
          prevParams.forEach((p) => {
            if (p.config_key && p.config_value) {
              paramMap.set(p.config_key, p.config_value);
            }
          });

          // 合并新提取的参数，保留已有的值，并按时间戳排序（最新的在顶部）
          const merged = extractedParams
            .map((param) => ({
              ...param,
              config_value: paramMap.get(param.config_key) || param.config_value
            }))
            .sort((a, b) => (b._order || 0) - (a._order || 0));

          // 检查参数是否真的变化了，避免无限循环
          const hasChanged =
            prevParams.length !== merged.length ||
            prevParams.some(
              (prev, index) =>
                prev.config_key !== merged[index]?.config_key ||
                prev.config_value !== merged[index]?.config_value
            );

          // 只有当参数实际变化时才通知外部（移除内部 _order 字段）
          if (hasChanged && onParameterChange) {
            const paramsToNotify = merged.map(({ _order, ...param }) => param);
            onParameterChange(paramsToNotify);
          }

          return merged;
        });
        // 更新记录的长度
        prevExtractedParamsLengthRef.current = extractedParams.length;
      } else {
        // 只有当 extractedParams 从有值变为空时才清空（避免初始化阶段误清空）
        const wasEmpty = prevExtractedParamsLengthRef.current <= 0;
        if (!wasEmpty) {
          // 从有值变为空，清空参数
          setLocalParams((prevParams) => {
            if (prevParams.length > 0 && onParameterChange) {
              onParameterChange([]);
            }
            return [];
          });
        }
        // 更新记录的长度
        prevExtractedParamsLengthRef.current = 0;
      }
    }, [extractedParams, onParameterChange]);

    // 处理参数值变化
    const handleValueChange = (paramKey: string, value: string) => {
      setLocalParams((prev) => {
        const updated = prev.map((p) =>
          p.config_key === paramKey ? { ...p, config_value: value } : p
        );
        if (onParameterChange) {
          // 移除内部 _order 字段
          const paramsToNotify = updated.map(({ _order, ...param }) => param);
          onParameterChange(paramsToNotify);
        }
        return updated;
      });
    };

    if (!isVisible) {
      return null;
    }

    return (
      <div
        className={classNames(
          'z-1 absolute right-0 top-0 h-full transition-transform duration-300 ease-in-out',
          isCollapsed ? 'w-auto' : 'w-[240px]'
        )}
      >
        {isCollapsed ? (
          /* 收起状态：显示图标，hover 时显示完整信息 */
          <div className="mt-[8px] h-[32px] w-[32px] cursor-pointer">
            <Popover content="打开引用参数列表" position="left">
              <ParameterIcon onClick={() => setIsCollapsed(false)} />
            </Popover>
          </div>
        ) : (
          <div className="flex h-full flex-col border-l bg-white">
            {/* 标题栏 */}
            <div className="flex h-[48px] items-center justify-between p-[12px]">
              <span className="text-[14px] font-bold">引用参数</span>
              <Popover content="收起" position="left">
                <ArrowRightIcon
                  className="h-[24px] w-[18px] cursor-pointer"
                  onClick={() => setIsCollapsed(true)}
                />
              </Popover>
            </div>

            <div className="flex-1 overflow-y-auto px-[12px] py-[4px]">
              {localParams.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center">
                  <div className="text-sm text-slate-400">暂无参数名</div>
                </div>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  {localParams.map((param, index) => (
                    <div
                      key={`${param.config_key}-${index}`}
                      className="flex flex-col rounded-[4px] border border-[#E2E8F0] p-[8px] hover:bg-[#EEF6FF]"
                      onMouseEnter={() => {
                        if (onParameterHover) {
                          onParameterHover(param.config_key);
                        }
                      }}
                      onMouseLeave={() => {
                        if (onParameterHover) {
                          onParameterHover(null);
                        }
                      }}
                    >
                      <div className="mb-[4px] text-[14px] text-[var(--color-text-2)]">
                        参数名:
                      </div>
                      <Input
                        value={param.config_key}
                        readOnly
                        disabled
                        className="mb-[8px] w-full"
                        placeholder="暂无参数"
                        status={
                          isParamNameConflict(param.config_key, systemParamKeys)
                            ? 'error'
                            : undefined
                        }
                      />
                      {isParamNameConflict(
                        param.config_key,
                        systemParamKeys
                      ) && (
                        <div className="mb-[8px] text-[12px] text-[#F53F3F]">
                          自定义参数不能和系统参数重名
                        </div>
                      )}
                      <div className="mb-[4px] text-[14px] text-[var(--color-text-2)]">
                        参数值:
                      </div>
                      <Input
                        value={param.config_value}
                        disabled={!canEdit}
                        onChange={(value) =>
                          handleValueChange(param.config_key, value)
                        }
                        className="w-full"
                        placeholder="请输入参数值"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ParameterSidebar.displayName = 'ParameterSidebar';

export default ParameterSidebar;
