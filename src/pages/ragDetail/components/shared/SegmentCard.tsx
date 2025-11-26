import React, { useState } from 'react';
import { useRagDetailStore, type Segment } from '../../store/ragDetailStore';
import SegmentCardContent from './SegmentCardContent';
import SegmentCardActions from './SegmentCardActions';

interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
  totalSegments?: number;
}

const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  isSelected,
  totalSegments
}) => {
  const { selectSegment, editingSegmentId, highlightPdfSegment } =
    useRagDetailStore();
  const [isHovered, setIsHovered] = useState(false);

  const isEditing = editingSegmentId === segment.id;

  const handleClick = () => {
    selectSegment(segment.id);
    // 如果分段有PDF坐标信息，高亮PDF
    if ('pdfCoordinate' in segment && segment.pdfCoordinate) {
      highlightPdfSegment(segment.id);
    }
  };

  return (
    <div
      className={`
        cursor-pointer rounded-lg border transition-all duration-200
        ${
          isSelected
            ? 'border-[#007DFA] bg-[#EEF6FF]'
            : isHovered
              ? 'border-[#007DFA] bg-white'
              : 'border-gray-200 bg-white'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
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
        {(isSelected || isHovered) && (
          <SegmentCardActions segment={segment} isEditing={isEditing} />
        )}
      </div>

      {/* Content area */}
      <SegmentCardContent segment={segment} isEditing={isEditing} />
    </div>
  );
};

export default SegmentCard;
