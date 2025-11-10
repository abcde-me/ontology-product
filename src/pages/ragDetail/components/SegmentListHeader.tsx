import React, { useState } from 'react';
import { Input } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { useRagDetailStore } from '../store/ragDetailStore';

const SegmentListHeader: React.FC = () => {
  const { segments } = useRagDetailStore();
  const [searchText, setSearchText] = useState('');

  return (
    <div className="flex flex-shrink-0 items-center justify-between bg-white pb-3 pt-4">
      {/* 左侧：分段标题 */}
      <div className="text-[16px] font-medium text-gray-900">
        分段 ({segments.length})
      </div>

      {/* 右侧：搜索框 */}
      <div className="w-[280px]">
        <Input
          placeholder="搜索分段"
          value={searchText}
          onChange={setSearchText}
          prefix={<IconSearch />}
          allowClear
          size="small"
        />
      </div>
    </div>
  );
};

export default SegmentListHeader;
