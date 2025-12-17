import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Input, Popover } from '@arco-design/web-react';
import classNames from 'classnames';
import ParameterIcon from '../../assets/parameter-icon.svg';
import ArrowRightIcon from '../../assets/arrow-right-icon.svg';
import { ScriptParam } from '@/types/sqlDevelopApi';
import { useLocalParams } from '../../hooks/useLocalParams';

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

// 检测是否有 ${} 模式（包括未完成的）
const hasParameterPattern = (content: string): boolean => {
  // 检测是否有 ${ 或完整的 ${param}
  return /\$\{/.test(content);
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
    const [isInitialized, setIsInitialized] = useState(false);

    // 使用 useLocalParams hook
    const { localParams, parseParams, updateParamValue, setLocalParams } =
      useLocalParams({
        initialParams,
        regex: /\$\{([^}]+)\}/g
      });

    // 检测是否有第一个 ${}（检测是否有参数模式）
    const hasFirstParam = useMemo(() => {
      return hasParameterPattern(content);
    }, [content]);

    // 内部可见性状态（如果外部没有控制，则根据是否有参数来决定）
    const isVisible =
      controlledVisible !== undefined ? controlledVisible : hasFirstParam;

    // 处理参数值变化
    const handleValueChange = (paramKey: string, value: string) => {
      updateParamValue(paramKey, value);
    };

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

    // 参数列表变化时，通知外部更新 scriptParams
    useEffect(() => {
      onParameterChange?.(localParams);
    }, [localParams]);

    // 编辑器内容变化时，解析参数
    useEffect(() => {
      const parsedParams = parseParams(content);
      setLocalParams(parsedParams);
    }, [content]);

    useEffect(() => {
      if (isInitialized) {
        return;
      }
      setIsInitialized(true);
      setLocalParams(initialParams || []);
    }, [initialParams]);

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
