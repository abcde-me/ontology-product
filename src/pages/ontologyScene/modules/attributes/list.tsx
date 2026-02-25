import React, { useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import useUrlState from '@ahooksjs/use-url-state';
import NormalTable from './components/NormalTable';
import PublicTable from './components/PublicTable';
import styles from './list.module.scss';

export default function OntologySceneAttributesList() {
  const [urlState, setUrlState] = useUrlState({ tab: 'normal', search: '' });
  const [normalTableTotal, setNormalTableTotal] = useState<number>(0);

  // 从 URL 的 tab 参数获取当前 tab，默认为 'normal'
  const activeTab = urlState.tab === 'public' ? 'public' : 'normal';

  // 处理 tab 切换，更新 URL 并清空 search 参数
  const handleTabChange = (tab: string) => {
    if (tab === 'normal') {
      // 如果是默认 tab，从 URL 中移除参数，并清空 search
      setUrlState({ tab: '', search: '' });
    } else {
      // 切换 tab 时清空 search 参数
      setUrlState({ tab, search: '' });
    }
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
        <Tabs.TabPane title={`属性 (${normalTableTotal})`} key="normal">
          <div className={styles['attributes-content']}>
            <NormalTable onTotalChange={setNormalTableTotal} />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane title="公共属性 (20)" key="public">
          <div className={styles['attributes-content']}>
            <PublicTable />
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
