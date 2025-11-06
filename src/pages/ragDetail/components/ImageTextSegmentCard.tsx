/**
 * Image-Text Segment Card Component
 * 显示包含图片的分段卡片
 */

import React, { useState } from 'react';
import { ImageTextSegment } from '../types';
import { useRagDetailStore } from '../store/ragDetailStore';
import SegmentCardActions from './SegmentCardActions';
import styles from './SegmentCardContent/SegmentCardContent.module.scss';

interface ImageTextSegmentCardProps {
  segment: ImageTextSegment;
  isSelected: boolean;
}

const ImageTextSegmentCard: React.FC<ImageTextSegmentCardProps> = ({
  segment,
  isSelected
}) => {
  const { selectSegment, editingSegmentId, openImageModal } =
    useRagDetailStore();
  const [isHovered, setIsHovered] = useState(false);

  const isEditing = editingSegmentId === segment.id;

  const handleImageClick = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片选中
    openImageModal(imageUrl);
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
      onClick={() => selectSegment(segment.id)}
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
      <div
        className={`max-h-[500px] overflow-y-auto px-3 pb-3 ${styles.scrollContainer}`}
      >
        {/* 文本内容 */}
        {isEditing ? (
          <textarea
            value={segment.content}
            className="w-full resize-none rounded border border-[#007DFA] p-2 text-sm text-gray-700 focus:outline-none"
            rows={6}
            onClick={(e) => e.stopPropagation()}
            readOnly
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {segment.content}
          </p>
        )}

        {/* 图片内容 */}
        {segment.images && segment.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {segment.images.map((image) => (
              <div
                key={image.id}
                className="group cursor-pointer"
                onClick={(e) => handleImageClick(image.url, e)}
              >
                <div className="h-[120px] w-[120px] overflow-hidden rounded border border-gray-200 transition-colors group-hover:border-[#007DFA]">
                  <img
                    src={image.url}
                    alt={image.caption || '分段图片'}
                    className="h-full w-full object-cover"
                  />
                </div>
                {image.caption && (
                  <p
                    className="mt-1 w-[120px] truncate text-xs text-gray-500"
                    title={image.caption}
                  >
                    {image.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageTextSegmentCard;
