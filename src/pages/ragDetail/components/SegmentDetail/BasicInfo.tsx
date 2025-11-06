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
      <h3 className="mb-4 text-base font-medium text-gray-900">基本信息</h3>
      <div className="space-y-3 text-sm">
        <div className="flex">
          <span className="w-20 text-gray-500">分段编号:</span>
          <span className="text-gray-900">{segmentId}</span>
        </div>
        <div className="flex">
          <span className="w-20 text-gray-500">分段大小:</span>
          <span className="text-gray-900">{charCount}个字符</span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
