/**
 * Segment Drawer Component
 * 分段信息抽屉组件
 */

import React, { useState } from 'react';
import { Drawer } from '@arco-design/web-react';
import { IconLeft, IconRight } from '@arco-design/web-react/icon';
import TraceLog from './TraceLog';
import SegmentDetail from './SegmentDetail';

interface SegmentDrawerProps {
  visible: boolean;
  onClose: () => void;
  defaultActiveTab?: 'detail' | 'trace';
  currentSegmentIndex?: number;
  totalSegments?: number;
}

const SegmentDrawer: React.FC<SegmentDrawerProps> = ({
  visible,
  onClose,
  defaultActiveTab = 'trace',
  currentSegmentIndex = 1,
  totalSegments = 100
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [segmentIndex, setSegmentIndex] = useState(currentSegmentIndex);

  const handlePrevSegment = () => {
    if (segmentIndex > 1) {
      setSegmentIndex(segmentIndex - 1);
    }
  };

  const handleNextSegment = () => {
    if (segmentIndex < totalSegments) {
      setSegmentIndex(segmentIndex + 1);
    }
  };

  // Reset active tab when defaultActiveTab changes
  React.useEffect(() => {
    setActiveTab(defaultActiveTab);
  }, [defaultActiveTab]);

  return (
    <Drawer
      width={900}
      title={null}
      visible={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      maskClosable={false}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="relative flex h-16 items-center">
          {/* Left: Title */}
          <div className="absolute left-0 text-lg font-semibold text-gray-900">
            分段信息
          </div>

          {/* Center: Segment Navigation */}
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
            <button
              onClick={handlePrevSegment}
              disabled={segmentIndex === 1}
              className={`flex h-8 w-8 items-center justify-center rounded border ${
                segmentIndex === 1
                  ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IconLeft />
            </button>
            <span className="text-sm font-medium text-[#0F172A]">
              分段数: <span className="text-gray-900">{segmentIndex}</span>/
              {totalSegments}
            </span>
            <button
              onClick={handleNextSegment}
              disabled={segmentIndex === totalSegments}
              className={`flex h-8 w-8 items-center justify-center rounded border ${
                segmentIndex === totalSegments
                  ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IconRight />
            </button>
          </div>

          {/* Right: Close Button */}
          <button
            onClick={onClose}
            className="absolute right-0 flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('detail')}
              className={`relative  py-3 text-sm font-medium transition-colors ${
                activeTab === 'detail'
                  ? 'text-[#165DFF]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              分段详情
              {activeTab === 'detail' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#165DFF]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('trace')}
              className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'trace'
                  ? 'text-[#165DFF]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              溯源日志
              {activeTab === 'trace' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#165DFF]"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'detail' && (
              <SegmentDetail segmentId={`segment_${segmentIndex}`} />
            )}
            {activeTab === 'trace' && <TraceLog />}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default SegmentDrawer;
