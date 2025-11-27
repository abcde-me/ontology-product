/**
 * Loading States Component
 * 加载状态组件
 */

import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mb-2 text-gray-600">正在加载Excel文件...</div>
        <div className="text-sm text-gray-500">请稍候</div>
      </div>
    </div>
  );
};

export const ErrorState: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mb-2 text-red-600">加载失败</div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-gray-500">暂无表格数据</div>
    </div>
  );
};
