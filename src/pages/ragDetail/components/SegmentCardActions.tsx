import React, { useState } from 'react';
import { useRagDetailStore, type Segment } from '../store/ragDetailStore';

interface SegmentCardActionsProps {
  segment: Segment;
  isEditing: boolean;
}

const SegmentCardActions: React.FC<SegmentCardActionsProps> = ({
  segment,
  isEditing
}) => {
  const { startEditingSegment } = useRagDetailStore();
  const [activeAction, setActiveAction] = useState<
    'edit' | 'detail' | 'trace' | null
  >(isEditing ? 'edit' : null);

  const buttonBaseClass = 'px-3 py-1 text-xs rounded transition-all border';
  const getButtonClass = (action: 'edit' | 'detail' | 'trace') => {
    const isActive = action === 'edit' ? isEditing : activeAction === action;
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
          setActiveAction('edit');
        }}
        className={getButtonClass('edit')}
        title="编辑分段"
      >
        编辑分段
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setActiveAction('detail');
        }}
        className={getButtonClass('detail')}
        title="分段详情"
      >
        分段详情
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setActiveAction('trace');
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
