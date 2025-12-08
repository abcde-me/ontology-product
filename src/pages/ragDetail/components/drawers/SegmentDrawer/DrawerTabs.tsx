/**
 * Drawer Tabs Component
 * 抽屉标签页组件 - 分段详情和溯源日志切换
 */

import React from 'react';
import { useSegmentDrawerStore } from './store/segmentDrawerStore';

const DrawerTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useSegmentDrawerStore();

  return (
    <div className="flex gap-6 border-b border-gray-200">
      <button
        onClick={() => setActiveTab('detail')}
        className={`relative py-3 text-sm font-medium transition-colors ${
          activeTab === 'detail'
            ? 'text-[#165DFF]'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        分段详情
        {activeTab === 'detail' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#165DFF]"></span>
        )}
      </button>
      <button
        onClick={() => setActiveTab('trace')}
        className={`relative py-3 text-sm font-medium transition-colors ${
          activeTab === 'trace'
            ? 'text-[#165DFF]'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        溯源日志
        {activeTab === 'trace' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#165DFF]"></span>
        )}
      </button>
    </div>
  );
};

export default DrawerTabs;
