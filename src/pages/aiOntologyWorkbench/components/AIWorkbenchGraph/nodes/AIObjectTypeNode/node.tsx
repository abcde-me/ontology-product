import { Tooltip } from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import { useAIWorkbenchGraphStore } from '../../store';
import { useAIWorkbenchStore } from '@/pages/aiOntologyWorkbench/store';
import { useBehaviorData } from '../../hooks/useBehaviorData';
import BehaviorTooltip from './BehaviorTooltip';
import ActionIcon from '@/pages/aiOntologyWorkbench/assets/action.svg';
import type { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

const Node = ({ id, data }) => {
  const { openBottomPanel, highlightedNodeCode } = useAIWorkbenchGraphStore();
  const { currentOntology } = useAIWorkbenchStore();
  const { totalCount, loadBehaviorList } = useBehaviorData();

  // 判断当前节点是否被高亮
  const isHighlighted = highlightedNodeCode === data.code;

  /**
   * 点击行为
   */
  const handleBehaviorClick = (behavior: BehaviorActionItem) => {
    openBottomPanel({
      type: 'behavior',
      id: behavior.id!,
      data: behavior
    });
  };

  /**
   * 加载行为数量
   */
  useEffect(() => {
    if (data.id && currentOntology?.id) {
      loadBehaviorList(data.id, Number(currentOntology.id));
    }
  }, [data.id, currentOntology?.id, loadBehaviorList]);

  // 获取对象类型图标
  const iconItem = OBJECT_TYPE_ICON_OPTIONS.find(
    (option) => option.value === data.icon
  );
  const IconComponent = iconItem?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

  return (
    <div
      className="flex w-[200px] items-center gap-[8px] p-[16px]"
      style={{
        width: '200px',
        backgroundColor: isHighlighted ? '#e6f4ff' : 'transparent',
        border: isHighlighted ? '2px solid #1890ff' : 'none',
        borderRadius: isHighlighted ? '4px' : '0',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 左侧：图标 + 名称 */}
      <div className="flex min-w-0 flex-1 items-center gap-[8px]">
        {/* 对象类型图标 */}
        <div className="relative h-[24px] w-[24px] flex-shrink-0 overflow-hidden">
          <div className="absolute inset-[2.4px] flex items-center justify-center">
            <IconComponent
              className="h-[19.2px] w-[19.2px] text-white"
              style={{ border: 'none', outline: 'none' }}
            />
          </div>
        </div>

        {/* 对象名称 - 支持省略和 tooltip */}
        <Tooltip content={data.title} position="top">
          <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
            {data.title}
          </div>
        </Tooltip>

        {/* 同步状态点 */}
        {data.syncStatus === 'SYNCED' && (
          <div className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#10b981]" />
        )}
      </div>

      {/* 右侧：行为指示器 - 使用 Tooltip 包裹 */}
      <Tooltip
        content={
          <BehaviorTooltip
            objectTypeId={data.id}
            ontologyModelID={Number(currentOntology?.id || 0)}
            totalCount={totalCount}
            onBehaviorClick={handleBehaviorClick}
          />
        }
        trigger="hover"
        position="top"
        className="behavior-tooltip"
      >
        <div className="flex cursor-pointer items-center gap-[4px]">
          <ActionIcon className="h-[16px] w-[16px] flex-shrink-0" />
          <span className="text-[12px] leading-[18px] text-[#184FF2]">
            {totalCount}
          </span>
        </div>
      </Tooltip>
    </div>
  );
};

export default React.memo(Node);
