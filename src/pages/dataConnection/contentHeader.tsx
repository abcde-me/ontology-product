import { Button, Radio, Space, Tooltip } from '@arco-design/web-react';
import {
  IconApps,
  IconRefresh,
  IconUnorderedList
} from '@arco-design/web-react/icon';
import { SearchBox } from '@ccf2e/arco-material';
import type { SearchBoxType } from '@ccf2e/arco-material/es/components/SearchBox/interface';
import React from 'react';

export default function SearchBar(props: {
  onSearch: (val) => void;
  onImport: () => void;
  onBatch: () => void;
  searchConfig: SearchBoxType['searchConfig'];
}) {
  const { onSearch, onImport, onBatch, searchConfig } = props;
  const [searchResult, setSearchResult] = React.useState({});

  const doSearch = (val: any) => {
    setSearchResult(val);
    onSearch(val);
  };

  return (
    <div className="mb-[16px] flex justify-between">
      <SearchBox
        className="pb-[0px]"
        searchResult={searchResult}
        searchConfig={searchConfig}
        onSearch={doSearch}
      />
      <Space>
        <Button
          type="outline"
          className="primary"
          onClick={() => onSearch(searchResult)}
        >数据解析设置</Button>
        <Button
          type="outline"
          className="primary"
          onClick={() => onBatch()}
        >批量管理</Button>
        <Button
          type="primary"
          onClick={() => onImport()}
        >导入数据</Button>
        <Button
          type="outline"
          icon={<IconRefresh />}
          onClick={() => onSearch(searchResult)}
        />
      </Space>
    </div>
  );
}
