import React, { useState, useCallback, memo } from 'react';
import { useRagDetailStore, type Segment } from '../../store/ragDetailStore';
import SegmentCardContent from './SegmentCardContent';
import SegmentCardActions from './SegmentCardActions';

interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
  totalSegments?: number;
}

const SegmentCard: React.FC<SegmentCardProps> = memo(
  ({ segment, isSelected, totalSegments }) => {
    const { selectSegment, editingSegmentId, highlightPdfSegment } =
      useRagDetailStore();
    const [isHovered, setIsHovered] = useState(false);

    const isEditing = editingSegmentId === segment.id;

    const handleClick = useCallback(() => {
      selectSegment(segment.id);
      // 如果分段有PDF坐标信息，高亮PDF
      if ('pdfCoordinate' in segment && segment.pdfCoordinate) {
        highlightPdfSegment(segment.id);
      }
    }, [segment.id, segment, selectSegment, highlightPdfSegment]);

    return (
      <div
        className={`
        cursor-pointer rounded-lg border transition-all duration-200
        ${
          isEditing
            ? 'bg-white'
            : isSelected
              ? 'border-[#007DFA] bg-[#EEF6FF]'
              : isHovered
                ? 'border-[#007DFA] bg-white'
                : 'border-gray-200 bg-white'
        }
      `}
        onMouseEnter={() => !isEditing && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Header with segment info and actions */}
        <div className="flex items-center justify-between px-3 pb-[7px] pt-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 text-xs font-medium text-[#6E7B8D]">
              <span>字符数: {segment.charCount}</span>
              <span>
                分段数: {segment.segmentIndex + 1}/{totalSegments ?? 0}
              </span>
            </div>
          </div>
          {/* 编辑态时隐藏按钮，使用 opacity 和 pointer-events 控制可见性，避免 hover 时布局抖动 */}
          <div
            className={`transition-opacity duration-200 ${
              !isEditing && (isSelected || isHovered)
                ? 'opacity-100'
                : 'pointer-events-none opacity-0'
            }`}
          >
            <SegmentCardActions segment={segment} isEditing={isEditing} />
          </div>
        </div>

        {/* Content area */}
        <SegmentCardContent segment={segment} isEditing={isEditing} />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数：返回 true 表示不需要重新渲染
    // 需要比较 segment 的关键字段，包括 content，以确保内容更新时能重新渲染
    return (
      prevProps.segment.id === nextProps.segment.id &&
      prevProps.segment.content === nextProps.segment.content &&
      prevProps.segment.charCount === nextProps.segment.charCount &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.totalSegments === nextProps.totalSegments
    );
  }
);

SegmentCard.displayName = 'SegmentCard';

export default SegmentCard;
