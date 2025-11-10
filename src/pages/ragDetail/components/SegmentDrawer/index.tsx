/**
 * Segment Drawer Component
 * 分段信息抽屉组件 - 使用 Zustand 统一管理状态
 */

import React, { useEffect } from 'react';
import { Drawer } from '@arco-design/web-react';
import TraceLog from '../TraceLog';
import SegmentDetail from '../SegmentDetail';
import DrawerHeader from './DrawerHeader';
import DrawerTabs from './DrawerTabs';
import { useSegmentDrawerStore } from './store/segmentDrawerStore';

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
  const {
    activeTab,
    currentSegmentIndex: storeSegmentIndex,
    openDrawer,
    closeDrawer,
    setTotalSegments
  } = useSegmentDrawerStore();

  // 当外部 props 变化时，同步到 store
  useEffect(() => {
    if (visible) {
      setTotalSegments(totalSegments);
      openDrawer(currentSegmentIndex, defaultActiveTab);
    }
  }, [visible, currentSegmentIndex, defaultActiveTab, totalSegments]);

  // 关闭抽屉时调用外部 onClose
  const handleClose = () => {
    closeDrawer();
    onClose();
  };

  return (
    <Drawer
      width={900}
      title={null}
      visible={visible}
      onCancel={handleClose}
      footer={null}
      closable={false}
      maskClosable={false}
    >
      <div className="flex h-full flex-col">
        {/* Header - 使用独立组件 */}
        <DrawerHeader onClose={handleClose} />

        {/* Custom Tabs */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tab Headers - 使用独立组件 */}
          <DrawerTabs />

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'detail' && (
              <SegmentDetail segmentId={`segment_${storeSegmentIndex}`} />
            )}
            {activeTab === 'trace' && <TraceLog />}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default SegmentDrawer;
