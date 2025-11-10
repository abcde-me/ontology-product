/**
 * PPT Segment Card Component
 * PPT分段卡片
 */

import React, { useState } from 'react';
import { PptSegment } from '../types';
import { useRagDetailStore } from '../store/ragDetailStore';

interface PptSegmentCardProps {
  segment: PptSegment;
  isSelected: boolean;
}

const PptSegmentCard: React.FC<PptSegmentCardProps> = ({
  segment,
  isSelected
}) => {
  const { selectSegment } = useRagDetailStore();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        cursor-pointer rounded-lg border-2 p-3 transition-all duration-200
        ${
          isSelected
            ? 'border-[#007DFA] bg-blue-50'
            : isHovered
              ? 'border-[#007DFA] bg-white'
              : 'border-gray-200 bg-white'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => selectSegment(segment.id)}
    >
      {/* 幻灯片号 */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          第 {segment.slideNumber} 页
        </span>
        <span className="text-xs text-gray-400">{segment.charCount} 字符</span>
      </div>

      {/* 幻灯片标题 */}
      {segment.slideTitle && (
        <h4 className="mb-2 text-sm font-semibold text-gray-900">
          {segment.slideTitle}
        </h4>
      )}

      {/* 幻灯片内容预览 */}
      <p className="line-clamp-3 text-sm text-gray-700">
        {segment.slideContent || segment.content}
      </p>
    </div>
  );
};

export default PptSegmentCard;
