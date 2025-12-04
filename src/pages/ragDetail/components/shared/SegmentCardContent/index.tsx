import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRagDetailStore, type Segment } from '../../../store/ragDetailStore';
import SegmentMarkdown from '../../common/SegmentMarkdown';
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
  // 用于保存最新的编辑内容，避免闭包问题
  const editContentRef = useRef(editContent);

  useEffect(() => {
    setEditContent(segment.content);
  }, [segment.content]);

  useEffect(() => {
    editContentRef.current = editContent;
  }, [editContent]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      // 检查点击目标是否是其他切片的编辑按钮
      const target = e.target as HTMLElement;
      const isEditButton = target
        .closest('button')
        ?.textContent?.includes('编辑分段');

      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // 如果点击的是其他切片的编辑按钮，只需要保存当前编辑内容（如果有变化）
        // 不需要调用 cancelEditingSegment，因为新的 startEditingSegment 会覆盖状态
        if (editContentRef.current !== segment.content) {
          updateSegmentContent(segment.id, editContentRef.current);
        } else if (!isEditButton) {
          // 只有在不是点击编辑按钮时才取消编辑状态
          cancelEditingSegment();
        }
        // 如果是点击编辑按钮，让新的 startEditingSegment 来处理状态切换
      }
    },
    [segment.id, segment.content, updateSegmentContent, cancelEditingSegment]
  );

  useEffect(() => {
    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing, handleClickOutside]);

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
