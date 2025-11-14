import React from 'react';

/**
 * 分段元数据组件
 */

export const ParagraphMetadata: React.FC<{
  metadata: Record<string, string>;
}> = ({ metadata }) => {
  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-900">分段元数据</h3>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <span className="w-[100px] text-sm font-medium text-[#0F172A]">
            父段落：
          </span>
          <span className="w-full whitespace-pre-wrap text-sm text-[#475569]">
            {metadata.fatherParagraph || '-'}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="w-[100px] text-sm font-medium text-[#0F172A]">
            左邻居段落：
          </span>
          <span className="w-full whitespace-pre-wrap text-sm text-[#475569]">
            {metadata.leftParagraph || '-'}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="w-[100px] text-sm font-medium text-[#0F172A]">
            右邻居段落：
          </span>
          <span className="w-full whitespace-pre-wrap text-sm text-[#475569]">
            {metadata.rightParagraph || '-'}
          </span>
        </div>
      </div>
    </div>
  );
};
