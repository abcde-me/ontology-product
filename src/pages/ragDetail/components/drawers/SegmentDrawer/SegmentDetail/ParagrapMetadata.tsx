import React from 'react';

/**
 * 分段元数据组件
 */

export const ParagraphMetadata: React.FC<{
  metadata?: Record<string, string>;
}> = ({ metadata }) => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-900">分段元数据</h3>
      </div>
      <div className="space-y-2">
        {(metadata.parent_id || metadata.fatherParagraph) && (
          <div className="flex gap-2">
            <span className="w-[100px] text-sm  text-[#6E7B8D]">父分片：</span>
            <span className="w-full whitespace-pre-wrap text-sm text-[#475569]">
              {metadata.parent_id || metadata.fatherParagraph || '-'}
            </span>
          </div>
        )}
        {(metadata.left_chunk_id || metadata.leftParagraph) && (
          <div className="flex gap-2">
            <span className="w-[100px] text-sm  text-[#6E7B8D]">
              左邻分片：
            </span>
            <span className="w-full whitespace-pre-wrap text-sm text-[#475569]">
              {metadata.left_chunk_id || metadata.leftParagraph || '-'}
            </span>
          </div>
        )}
        {(metadata.right_chunk_id || metadata.rightParagraph) && (
          <div className="flex gap-2">
            <span className="w-[100px] text-sm  text-[#6E7B8D]">
              右邻分片：
            </span>
            <span className="w-full whitespace-pre-wrap text-sm text-[#475569]">
              {metadata.right_chunk_id || metadata.rightParagraph || '-'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
