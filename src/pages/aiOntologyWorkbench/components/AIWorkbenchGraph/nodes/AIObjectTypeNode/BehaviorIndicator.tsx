import React, { useEffect, useState } from 'react';
import { Popover } from '@arco-design/web-react';
import { useBehaviorData } from '../../hooks/useBehaviorData';
import { useAIWorkbenchStore } from '@/pages/aiOntologyWorkbench/store';
import BehaviorTooltip from './BehaviorTooltip';
import ActionIcon from '@/pages/aiOntologyWorkbench/assets/action.svg';
import type { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

interface BehaviorIndicatorProps {
  objectTypeId: number;
  onBehaviorClick: (behavior: BehaviorActionItem) => void;
}

/**
 * 行为指示器组件
 * 显示行为图标 + 行为数量
 */
const BehaviorIndicator: React.FC<BehaviorIndicatorProps> = ({
  objectTypeId,
  onBehaviorClick
}) => {
  const { currentOntology } = useAIWorkbenchStore();
  const { totalCount, loadBehaviorList } = useBehaviorData();
  const [popoverVisible, setPopoverVisible] = useState(false);

  /**
   * 加载行为数量
   */
  useEffect(() => {
    if (objectTypeId && currentOntology?.id) {
      loadBehaviorList(objectTypeId, Number(currentOntology.id));
    }
  }, [objectTypeId, currentOntology?.id, loadBehaviorList]);

  return (
    <Popover
      content={
        <BehaviorTooltip
          objectTypeId={objectTypeId}
          ontologyModelID={Number(currentOntology?.id || 0)}
          totalCount={totalCount}
          onBehaviorClick={(behavior) => {
            setPopoverVisible(false);
            onBehaviorClick(behavior);
          }}
        />
      }
      trigger="hover"
      position="top"
      popupVisible={popoverVisible}
      onVisibleChange={setPopoverVisible}
      // 移除 Popover 的默认样式
      style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}
      // 使用 getPopupContainer 来控制渲染位置，并通过 className 控制样式
      className="behavior-tooltip-popover"
    >
      <div className="flex cursor-pointer items-center gap-[4px]">
        <ActionIcon className="h-[16px] w-[16px] flex-shrink-0" />
        <span className="text-[12px] leading-[18px] text-[var(--color-text-2)]">
          {totalCount}
        </span>
      </div>
    </Popover>
  );
};

export default BehaviorIndicator;
