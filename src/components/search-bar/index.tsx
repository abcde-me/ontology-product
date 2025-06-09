import { Button, Radio, Space, Tooltip } from '@arco-design/web-react';
import {
  IconApps,
  IconRefresh,
  IconUnorderedList
} from '@arco-design/web-react/icon';
import { SearchBox } from '@ccf2e/arco-material';
import type { SearchBoxType } from '@ccf2e/arco-material/es/components/SearchBox/interface';
import React, { ReactNode } from 'react';

export default function SearchBar(props: {
  onTypeChange: (type: 'table' | 'card') => void;
  onSearch: (val) => void;
  searchConfig: SearchBoxType['searchConfig'];
  rightPrefix?: ReactNode;
}) {
  const { onTypeChange, onSearch, searchConfig, rightPrefix } = props;
  const [searchResult, setSearchResult] = React.useState({});
  // 查询处理
  const doSearch = (val: any) => {
    setSearchResult(val);
    onSearch(val);
  };
  const [type, setType] = React.useState('card');
  return (
    <div className="custom-search-bar mb-[16px] flex justify-between">
      <SearchBox
        className="pb-[0px]"
        searchResult={searchResult}
        searchConfig={searchConfig}
        onSearch={doSearch}
      />
      <Space>
        {rightPrefix}
        <Radio.Group
          type="button"
          value={type}
          onChange={(val) => {
            setType(val);
            onTypeChange(val);
          }}
        >
          <Radio value={'card'}>
            <Tooltip content="卡片视图">
              <IconApps />
            </Tooltip>
          </Radio>
          <Radio value={'table'}>
            <Tooltip content="列表视图">
              <IconUnorderedList />
            </Tooltip>
          </Radio>
        </Radio.Group>
        <Button
          type="outline"
          icon={<IconRefresh />}
          onClick={() => onSearch(searchResult)}
        />
      </Space>
    </div>
  );
}
