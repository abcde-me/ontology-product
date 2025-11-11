/**
 * Drawer Header Component
 * 抽屉头部组件 - 包含标题、分段导航和关闭按钮
 */

import React from 'react';
import { IconLeft, IconRight } from '@arco-design/web-react/icon';
import { useSegmentDrawerStore } from './store/segmentDrawerStore';

interface DrawerHeaderProps {
  onClose?: () => void;
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ onClose }) => {
  const {
    currentSegmentIndex,
    totalSegments,
    goToPrevSegment,
    goToNextSegment,
    closeDrawer
  } = useSegmentDrawerStore();

  const handleClose = () => {
    closeDrawer();
    onClose?.();
  };

  return (
    <div className="relative flex h-16 items-center">
      {/* Left: Title */}
      <div className="absolute left-0 text-lg font-semibold text-gray-900">
        分段信息
      </div>

      {/* Center: Segment Navigation */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
        <button
          onClick={goToPrevSegment}
          disabled={currentSegmentIndex === 1}
          className={`flex h-8 w-8 items-center justify-center rounded border ${
            currentSegmentIndex === 1
              ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <IconLeft />
        </button>
        <span className="text-sm font-medium text-[#0F172A]">
          分段数: <span className="text-gray-900">{currentSegmentIndex}</span>/
          {totalSegments}
        </span>
        <button
          onClick={goToNextSegment}
          disabled={currentSegmentIndex === totalSegments}
          className={`flex h-8 w-8 items-center justify-center rounded border ${
            currentSegmentIndex === totalSegments
              ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <IconRight />
        </button>
      </div>

      {/* Right: Close Button */}
      <button
        onClick={handleClose}
        className="absolute right-0 flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
      >
        ✕
      </button>
    </div>
  );
};

export default DrawerHeader;
