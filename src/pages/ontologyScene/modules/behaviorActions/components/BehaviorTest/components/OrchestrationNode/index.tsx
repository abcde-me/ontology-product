import React from 'react';
import { Modal, Tooltip } from '@arco-design/web-react';
import { OrchestrationNode as OrchestrationNodeType } from '../../types';
import { useBusinessStore } from '../../store/businessStore';
import { formatParamDisplayValue } from './utils';
import DeleteSvg from '@/assets/benti/delete.svg';

interface OrchestrationNodeProps {
  node: OrchestrationNodeType;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

// 参数显示项组件 - 处理异步显示值
interface ParamDisplayItemProps {
  paramName: string;
  displayValueOrPromise: string | Promise<string>;
}

const ParamDisplayItem: React.FC<ParamDisplayItemProps> = React.memo(
  ({ paramName, displayValueOrPromise }) => {
    const [displayValue, setDisplayValue] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
      if (typeof displayValueOrPromise === 'string') {
        setDisplayValue(displayValueOrPromise);
        setIsLoading(false);
      } else {
        // 如果是 Promise，等待解析
        setIsLoading(true);
        displayValueOrPromise
          .then((value) => {
            setDisplayValue(value);
            setIsLoading(false);
          })
          .catch(() => {
            setDisplayValue('加载失败');
            setIsLoading(false);
          });
      }
    }, [displayValueOrPromise]);

    return (
      <div className="flex flex-col gap-1">
        {/* Label */}
        <span className="text-[13px] font-semibold text-[rgba(15,19,31,1)]">
          {paramName}
        </span>
        {/* Value */}
        <div className="rounded bg-[#F7F8FA] px-3 py-2 text-[13px] font-normal text-[#86909C]">
          {isLoading ? '加载中...' : displayValue || '未配置'}
        </div>
      </div>
    );
  },
  // 自定义比较函数：只有当 paramName 变化或 displayValueOrPromise 的实际值变化时才重新渲染
  (prevProps, nextProps) => {
    if (prevProps.paramName !== nextProps.paramName) {
      return false; // 需要重新渲染
    }

    // 如果都是字符串，比较字符串值
    if (
      typeof prevProps.displayValueOrPromise === 'string' &&
      typeof nextProps.displayValueOrPromise === 'string'
    ) {
      return (
        prevProps.displayValueOrPromise === nextProps.displayValueOrPromise
      );
    }

    // 如果有 Promise，总是重新渲染（因为 Promise 对象每次都不同）
    // 但由于有缓存机制，实际上不会重复请求
    return false;
  }
);

export const OrchestrationNode: React.FC<OrchestrationNodeProps> = ({
  node,
  isSelected,
  onClick,
  onDelete
}) => {
  const [isDeleteHovered, setIsDeleteHovered] = React.useState(false);
  // 只订阅当前节点的配置，避免其他节点配置变化时重新渲染
  const config = useBusinessStore((state) => state.nodeConfigs[node.id] || {});

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '删除后该节点的配置将丢失，确认删除吗？',
      onOk: onDelete
    });
  };

  // 边框颜色：选中 > 默认
  const borderColor = isSelected
    ? 'border-[#184FF2]' // 蓝色边框表示选中
    : 'border-[rgba(236,240,243,1)]'; // 默认灰色边框

  return (
    <div
      className={`cursor-pointer rounded-lg border-2 bg-white px-4 pb-4 pt-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 ${borderColor}`}
      onClick={onClick}
    >
      {/* 节点头部：编号 + 行为名称 + 删除 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* 编号 */}
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[rgba(190,213,253,1)] bg-[rgba(242,248,255,1)] text-[10px] font-bold leading-none text-[rgba(64,115,245,1)]">
            {String(node.order + 1).padStart(2, '0')}
          </div>
          {/* 行为名称 */}
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-[#1d2129]">
            {node.behavior.name}
          </span>
        </div>
        {/* 删除图标 */}
        <Tooltip content="删除">
          <div
            className="flex-shrink-0 cursor-pointer"
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
            onClick={handleDelete}
          >
            <DeleteSvg
              className="transition-colors duration-200"
              style={{
                fill: isDeleteHovered ? '#F53F3F' : '#4A5169'
              }}
            />
          </div>
        </Tooltip>
      </div>

      {/* 表单项列表 */}
      {node.behavior.params && node.behavior.params.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          {node.behavior.params.map((param) => {
            const value = config[param.code];
            const displayValueOrPromise = formatParamDisplayValue(
              value,
              param.uiType
            );

            return (
              <ParamDisplayItem
                key={param.code}
                paramName={param.name}
                displayValueOrPromise={displayValueOrPromise}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
