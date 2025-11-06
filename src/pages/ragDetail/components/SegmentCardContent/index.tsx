import React, { useRef, useEffect, useState } from 'react';
import { useRagDetailStore, type Segment } from '../../store/ragDetailStore';
import SegmentMarkdown from '../SegmentMarkdown';
import styles from './SegmentCardContent.module.scss';

interface SegmentCardContentProps {
  segment: Segment;
  isEditing: boolean;
}

const SegmentCardContent: React.FC<SegmentCardContentProps> = ({
  segment,
  isEditing
}) => {
  const { updateSegmentContent, cancelEditingSegment } = useRagDetailStore();
  const [editContent, setEditContent] = useState(segment.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditContent(segment.content);
  }, [segment.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      if (isEditing && editContent !== segment.content) {
        updateSegmentContent(segment.id, editContent);
      } else {
        cancelEditingSegment();
      }
    }
  };

  useEffect(() => {
    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing, editContent, segment.content, segment.id]);

  return (
    <div ref={containerRef} className="px-3 pb-3">
      <div
        className={`max-h-[500px] overflow-y-auto ${styles.scrollContainer}`}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full resize-none rounded border border-[#007DFA] p-2 text-sm text-gray-700 focus:outline-none"
            rows={6}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <SegmentMarkdown
            content={segment.content}
            className="text-sm leading-relaxed text-gray-700"
          />
        )}
      </div>
    </div>
  );
};

export default SegmentCardContent;
