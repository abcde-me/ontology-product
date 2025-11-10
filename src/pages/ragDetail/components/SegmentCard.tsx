import React, { useState } from 'react';
import { useRagDetailStore, type Segment } from '../store/ragDetailStore';
import SegmentCardContent from './SegmentCardContent';
import SegmentCardActions from './SegmentCardActions';

interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ segment, isSelected }) => {
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
          <div className="text-xs text-gray-500">
            字符数: {segment.charCount} 分段数: {segment.segmentIndex}/100
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
