import React, { useState, useEffect } from 'react';
import { Tabs } from '@arco-design/web-react';
import { useHistory, useLocation } from 'react-router-dom';
import NormalTable from './components/normalTable';
import PublicTable from './components/publicTable';
import styles from './list.module.scss';

export default function OntologySceneAttributesList() {
  const history = useHistory();
  const location = useLocation();

  // 从 URL 读取 tab 参数，默认为 'normal'
  const getTabFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    return tab === 'public' ? 'public' : 'normal';
  };

  const [activeTab, setActiveTab] = useState<string>(getTabFromUrl);

  // 当 URL 变化时，同步 tab 状态
  useEffect(() => {
    const tab = getTabFromUrl();
    setActiveTab(tab);
  }, [location.search]);

  // 处理 tab 切换，更新 URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const searchParams = new URLSearchParams(location.search);
    if (tab === 'normal') {
      // 如果是默认 tab，从 URL 中移除参数
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', tab);
    }
    const newSearch = searchParams.toString();
    history.replace({
      ...location,
      search: newSearch ? `?${newSearch}` : ''
    });
  };

  return (
    <div className={styles['attributes-list']}>
      <div>
        <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-default">
          属性
        </div>
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
          属性映射物理字段并关联公共属性以实现语义标准化,公共属性则定义统一的语义标准
        </div>
      </div>
      <Tabs
        className={styles['attributes-tabs']}
        activeTab={activeTab}
        onChange={handleTabChange}
      >
        <Tabs.TabPane title="属性 (500)" key="normal" />
        <Tabs.TabPane title="公共属性 (20)" key="public" />
      </Tabs>
      <div className={styles['attributes-content']}>
        {activeTab === 'normal' ? <NormalTable /> : <PublicTable />}
      </div>
    </div>
  );
}
