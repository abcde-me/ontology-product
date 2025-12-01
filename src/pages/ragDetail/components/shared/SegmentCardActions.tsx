import React from 'react';
import { useRagDetailStore, type Segment } from '../../store/ragDetailStore';
import { hasMarkdownImages } from '../../utils/imageUrlConverter';
import SegDetailSvg from '@/assets/rag/seg-detail.svg';
import SourceLogSvg from '@/assets/rag/source-log.svg';
import EditSvg from '@/assets/rag/edit.svg';

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

  // 检查是否包含 markdown 图片
  const containsImages = hasMarkdownImages(segment.content);

  const buttonBaseClass =
    'px-3 py-1 text-xs rounded transition-all border flex items-center gap-2';
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
      {/* 只有当不包含图片时，才显示编辑按钮 */}

      <button
        onClick={(e) => {
          e.stopPropagation();
          startEditingSegment(segment.id);
        }}
        className={getButtonClass('edit')}
        title="编辑分段"
      >
        <EditSvg />
        <span className="font-medium text-[#1E293B]">编辑分段</span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          openSegmentDrawer(segment.id, 'detail');
        }}
        className={getButtonClass('detail')}
        title="分段详情"
      >
        <SegDetailSvg />
        <span className="font-medium text-[#1E293B]">分段详情</span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          openSegmentDrawer(segment.id, 'trace');
        }}
        className={getButtonClass('trace')}
        title="溯源日志"
      >
        <SourceLogSvg />
        <span className="font-medium text-[#1E293B]">溯源日志</span>
      </button>
    </div>
  );
};

export default SegmentCardActions;
