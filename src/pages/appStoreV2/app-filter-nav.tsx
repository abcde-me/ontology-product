import React, { useState } from 'react';
import {
  Tabs,
  Select,
  Input,
  Space,
  Button,
  Typography
} from '@arco-design/web-react';

const { TabPane } = Tabs;
const { Text } = Typography;
const Option = Select.Option;

export interface FilterParams {
  tab?: TabItemsKey;
  type?: TypeItemsKey;
  search?: string;
}

export enum TabItemsKey {
  /** 所有应用 */
  ALL = 'all',
  /** 应用样板 */
  TEMPLATE = 'tempalte',
  /** 我的组织 */
  ORG = 'org',
  /** 我收藏的 */
  FAVORITE = 'favorite'
}

export enum TypeItemsKey {
  /** 全部类型 */
  ALL = '0',
  /** 营销创作 */
  MARKETING = '1',
  /** 营销创作 */
  EDUCATION = '2',
  /** 营销创作 */
  ENTERPRIZE = '3',
  /** 营销创作 */
  PRODUCTIVITY = '4',
  /** 营销创作 */
  MANUFACTURE = '5',
  /** 营销创作 */
  OTHER = '6'
}

interface AppFilterNavProps {
  onFilterChange: (params: FilterParams) => void;
}

export const AppFilterNav: React.FC<AppFilterNavProps> = ({
  onFilterChange
}) => {
  const [activeTab, setActiveTab] = useState(TabItemsKey.ALL);
  const [activeType, setActiveType] = useState(TypeItemsKey.ALL);
  const [searchValue, setSearchValue] = useState('');

  // 分类选项
  const tabItems = [
    { key: TabItemsKey.ALL, label: '所有应用' },
    { key: TabItemsKey.TEMPLATE, label: '应用样板' },
    { key: TabItemsKey.ORG, label: '我的组织' },
    { key: TabItemsKey.FAVORITE, label: '我收藏的' }
  ];

  // 应用类型选项
  const typeItems = [
    { key: TypeItemsKey.ALL, label: '全部类型' },
    { key: TypeItemsKey.MARKETING, label: '营销创作' },
    { key: TypeItemsKey.EDUCATION, label: '学习教育' },
    { key: TypeItemsKey.ENTERPRIZE, label: '企业服务' },
    { key: TypeItemsKey.PRODUCTIVITY, label: '效率工具' },
    { key: TypeItemsKey.MANUFACTURE, label: '智能制造' },
    { key: TypeItemsKey.OTHER, label: '其他' }
  ];

  const handleTabChange = (value: TabItemsKey) => {
    setActiveTab(value);
    onFilterChange({ tab: value, type: activeType, search: searchValue });
  };

  const handleTypeChange = (value: TypeItemsKey) => {
    setActiveType(value);
    onFilterChange({
      tab: activeTab,
      type: value,
      search: searchValue
    });
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onFilterChange({ tab: activeTab, type: activeType, search: value });
  };

  return (
    <div
      style={{
        padding: '0px 14px',
        borderRadius: 4
      }}
      className="app-filter-nav"
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div className="app-filter-nav__top">
          {/* 分类标签 */}
          <Tabs activeTab={activeTab} onChange={handleTabChange} type="capsule">
            {tabItems.map((item) => (
              <TabPane key={item.key} title={item.label} />
            ))}
          </Tabs>

          {/* 搜索框 */}
          <Input.Search
            placeholder="搜索应用"
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            style={{ width: 200 }}
            allowClear
          />
        </div>

        {/* 应用类型标签 */}
        <Tabs activeTab={activeType} onChange={handleTypeChange} type="capsule">
          {typeItems.map((item) => (
            <TabPane key={item.key} title={item.label} />
          ))}
        </Tabs>
      </Space>

      <Space size={16} align="center"></Space>
    </div>
  );
};
