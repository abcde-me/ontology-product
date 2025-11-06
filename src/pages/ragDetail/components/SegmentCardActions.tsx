import React from 'react';
import { useRagDetailStore, type Segment } from '../store/ragDetailStore';

interface SegmentCardActionsProps {
  segment: Segment;
  isEditing: boolean;
}

const SegmentCardActions: React.FC<SegmentCardActionsProps> = ({
  segment,
  isEditing
}) => {
  const {
    startEditingSegment,
    openSegmentDrawer,
    segmentDrawerVisible,
    segmentDrawerSegmentId
  } = useRagDetailStore();

  const buttonBaseClass = 'px-3 py-1 text-xs rounded transition-all border';
  const getButtonClass = (action: 'edit' | 'detail' | 'trace') => {
    // 检查当前分段的 drawer 是否打开
    const isDrawerOpenForThisSegment =
      segmentDrawerVisible && segmentDrawerSegmentId === segment.id;
    const isActive =
      action === 'edit'
        ? isEditing
        : isDrawerOpenForThisSegment &&
          (action === 'detail' || action === 'trace');
    return `${buttonBaseClass} ${
      isActive
        ? 'border-[#007DFA] bg-[#EEF6FF] text-[#007DFA]'
        : 'border-gray-200 text-gray-600 hover:border-[#007DFA] hover:bg-gray-50'
    }`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          startEditingSegment(segment.id);
        }}
        className={getButtonClass('edit')}
        title="编辑分段"
      >
        编辑分段
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          openSegmentDrawer(segment.id, 'detail');
        }}
        className={getButtonClass('detail')}
        title="分段详情"
      >
        分段详情
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          openSegmentDrawer(segment.id, 'trace');
        }}
        className={getButtonClass('trace')}
        title="溯源日志"
      >
        溯源日志
      </button>
    </div>
  );
};

export default SegmentCardActions;
