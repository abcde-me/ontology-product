import React, { memo, useEffect, useMemo, useState } from 'react';
import { Input, Button, Popover } from '@arco-design/web-react';
import { IconCaretRight } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import ParameterIcon from '../../assets/parameter-icon.svg';
import ArrowRightIcon from '../../assets/arrow-right-icon.svg';

export interface Parameter {
  name: string;
  value: string;
  order: number; // 用于保持最新参数在顶部
}

interface ParameterSidebarProps {
  content: string;
  onParameterChange?: (params: Parameter[]) => void;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  onParameterHover?: (paramName: string | null) => void;
}

// 提取参数的正则表达式
const PARAM_REGEX = /\$\{([^}]+)\}/g;

// 检测是否有 ${} 模式（包括未完成的）
const hasParameterPattern = (content: string): boolean => {
  // 检测是否有 ${ 或完整的 ${param}
  return /\$\{/.test(content);
};

// 从内容中提取所有参数
const extractParameters = (content: string): Parameter[] => {
  // 重置正则的 lastIndex，避免全局匹配的问题
  PARAM_REGEX.lastIndex = 0;
  const paramMap = new Map<string, Parameter>();
  const matches = Array.from(content.matchAll(PARAM_REGEX));

  matches.forEach((match, index) => {
    const paramName = match[1].trim();
    if (paramName) {
      // 如果参数已存在，更新 order 为最新（数字越大表示越新）
      if (paramMap.has(paramName)) {
        const existing = paramMap.get(paramName)!;
        existing.order = matches.length - index; // 最新的在最前面，所以 order 更大
      } else {
        paramMap.set(paramName, {
          name: paramName,
          value: '',
          order: matches.length - index
        });
      }
    }
  });

  // 转换为数组并按 order 降序排列（最新的在顶部）
  return Array.from(paramMap.values()).sort((a, b) => b.order - a.order);
};

const ParameterSidebar: React.FC<ParameterSidebarProps> = memo(
  ({
    content,
    onParameterChange,
    visible: controlledVisible,
    onVisibleChange,
    onCollapsedChange,
    onParameterHover
  }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [localParams, setLocalParams] = useState<Parameter[]>([]);

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

    // 同步提取的参数到本地状态，同时保留已输入的值
    useEffect(() => {
      if (extractedParams.length > 0) {
        setLocalParams((prevParams) => {
          const paramMap = new Map<string, string>();
          // 保留已有参数的值
          prevParams.forEach((p) => {
            if (p.name && p.value) {
              paramMap.set(p.name, p.value);
            }
          });

          // 合并新提取的参数，保留已有的值
          const merged = extractedParams.map((param) => ({
            ...param,
            value: paramMap.get(param.name) || param.value
          }));

          // 通知外部
          if (onParameterChange) {
            onParameterChange(merged);
          }

          return merged;
        });
      } else {
        // 如果没有参数了，清空
        setLocalParams([]);
        if (onParameterChange) {
          onParameterChange([]);
        }
      }
    }, [extractedParams, onParameterChange]);

    // 处理参数值变化
    const handleValueChange = (paramName: string, value: string) => {
      setLocalParams((prev) => {
        const updated = prev.map((p) =>
          p.name === paramName ? { ...p, value } : p
        );
        if (onParameterChange) {
          onParameterChange(updated);
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
          'absolute right-0 top-0 z-10 h-full transition-transform duration-300 ease-in-out',
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
                      key={`${param.name}-${index}`}
                      className="flex flex-col rounded-[4px] border border-[#E2E8F0] p-[8px] hover:bg-[#EEF6FF]"
                      onMouseEnter={() => {
                        if (onParameterHover) {
                          onParameterHover(param.name);
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
                        value={param.name}
                        readOnly
                        disabled
                        className="mb-[8px] w-full"
                        placeholder="暂无参数"
                      />
                      <div className="mb-[4px] text-[14px] text-[var(--color-text-2)]">
                        参数值:
                      </div>
                      <Input
                        value={param.value}
                        onChange={(value) =>
                          handleValueChange(param.name, value)
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
