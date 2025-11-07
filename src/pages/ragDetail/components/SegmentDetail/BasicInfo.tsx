/**
 * Basic Info Component
 * 基本信息组件
 */

import React from 'react';

interface BasicInfoProps {
  segmentId: string;
  charCount: number;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ segmentId, charCount }) => {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-base font-medium text-gray-900">基本信息</h3>
      <div className="flex gap-8 text-sm">
        <div className="flex flex-1">
          <span className="text-[#6E7B8D]">分段编号:</span>
          <span className="ml-2 text-[#1E293B]">{segmentId}</span>
        </div>
        <div className="flex flex-1">
          <span className="text-[#6E7B8D]">分段大小:</span>
          <span className="ml-2 text-[#1E293B]">{charCount}个字符</span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
