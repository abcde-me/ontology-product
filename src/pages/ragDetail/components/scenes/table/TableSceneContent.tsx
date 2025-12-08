/**
 * Table Scene Content Component
 * 表格分段场景：左侧表格 + 右侧分段表格
 */

import { Spin } from '@arco-design/web-react';
import React from 'react';
import { useRagDetailStore } from '../../../store/ragDetailStore';
import ContentHeader from '../../common/ContentHeader';
import SegmentList from '../../shared/SegmentList';
import TableViewer from './TableViewer';

interface TableSceneContentProps {
  loading: boolean;
}

const TableSceneContent: React.FC<TableSceneContentProps> = ({ loading }) => {
  const { segments, fileName, showPdfViewer } = useRagDetailStore();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="flex h-[calc(100%-70px)] items-center justify-center">
            <Spin />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={{ minHeight: 0 }}>
      {/* 顶部：文件名和操作按钮 */}
      <ContentHeader fileName={fileName} />

      {/* 下方：内容区域 */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* 表格查看器 */}
        {showPdfViewer && (
          <>
            <div className="flex-1 overflow-hidden rounded-[20px] bg-gray-50">
              <TableViewer />
            </div>
            <div className="w-[1px] flex-shrink-0 bg-gray-200" />
          </>
        )}

        {/* 分段列表 */}
        <div
          className={`h-full flex-1 overflow-hidden rounded-br-[20px] bg-white ${!showPdfViewer ? 'ml-4 rounded-bl-[20px]' : ''}`}
          style={{ minHeight: 0 }}
        >
          <SegmentList
            segments={segments}
            renderMode={'text'}
            hideHeader={false}
          />
        </div>
      </div>
    </div>
  );
};

export default TableSceneContent;
