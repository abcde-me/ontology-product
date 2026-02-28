import React, { useState, useCallback, useRef } from 'react';
import { Tabs } from '@arco-design/web-react';
import useUrlState from '@ahooksjs/use-url-state';
import NormalTable from './components/NormalTable';
import PublicTable, { PublicTableRef } from './components/PublicTable';
import styles from './list.module.scss';

export default function OntologySceneAttributesList() {
  const [urlState, setUrlState] = useUrlState({ tab: 'normal', search: '' });
  const [normalTableTotal, setNormalTableTotal] = useState<number>(0);
  const [publicTableTotal, setPublicTableTotal] = useState<number>(0);
  const publicTableRef = useRef<PublicTableRef>(null);

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

  // 公共属性创建成功后的回调 - 跳转到 public tab
  const handlePublicAttributeCreateSuccess = useCallback(() => {
    // 跳转到 public tab
    setUrlState({ tab: 'public', search: '' });
  }, [setUrlState]);

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
        destroyOnHide={false}
      >
        <Tabs.TabPane title={`属性 (${normalTableTotal})`} key="normal" />
        <Tabs.TabPane title={`公共属性 (${publicTableTotal})`} key="public" />
      </Tabs>
      {/* 将两个组件都渲染在 Tabs 外部，确保都会挂载，通过 CSS 控制显示/隐藏 */}
      <div className={styles['attributes-content']}>
        <div
          style={{
            display: activeTab === 'normal' ? 'block' : 'none'
          }}
        >
          <NormalTable onTotalChange={setNormalTableTotal} />
        </div>
        <div
          style={{
            display: activeTab === 'public' ? 'block' : 'none'
          }}
        >
          <PublicTable
            ref={publicTableRef}
            onTotalChange={setPublicTableTotal}
            onCreateSuccess={handlePublicAttributeCreateSuccess}
          />
        </div>
      </div>
    </div>
  );
}
