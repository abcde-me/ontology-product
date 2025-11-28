import React from 'react';
import { Input } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { useRagDetailStore } from '../../store/ragDetailStore';

interface SegmentListHeaderProps {
  totalCount: number; // 总分段数
  filteredCount: number; // 过滤后的分段数
}

const SegmentListHeader: React.FC<SegmentListHeaderProps> = ({
  totalCount,
  filteredCount
}) => {
  const { segmentSearchText, setSegmentSearchText } = useRagDetailStore();

  return (
    <div className="flex flex-shrink-0 items-center justify-between bg-white pb-3 pt-4">
      {/* 左侧：分段标题 */}
      <div className="text-[16px] font-medium text-gray-900">
        分段 ({totalCount})
      </div>

      {/* 右侧：搜索框 */}
      <div className="w-[280px]">
        <Input
          placeholder="搜索分段"
          value={segmentSearchText}
          onChange={setSegmentSearchText}
          suffix={<IconSearch />}
          allowClear
          size="small"
        />
      </div>
    </div>
  );
};

export default SegmentListHeader;
