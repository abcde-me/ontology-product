import React, { memo, useState, useEffect } from 'react';
import { Tabs } from '@arco-design/web-react';
import Processing from './processing';
import QueryScript from './query-script';
import { useUrlState } from '../../hooks/useUrlState';

import styles from './index.module.scss';

interface SplScriptManagementProps {
  onToScriptList: (type: string) => void;
}

// SQL脚本管理组件
const SplScriptManagement: React.FC<SplScriptManagementProps> = memo(
  ({ onToScriptList }) => {
    const TabPane = Tabs.TabPane;
    const { urlState, updateUrlState } = useUrlState();

    // 从URL参数获取初始tab，如果没有则默认为'processing'
    const initialTab = urlState.scriptType || 'processing';
    const [curActiveTab, setCurActiveTab] = useState(initialTab);

    // 当URL参数变化时，同步更新curActiveTab
    useEffect(() => {
      if (urlState.scriptType && urlState.scriptType !== curActiveTab) {
        setCurActiveTab(urlState.scriptType);
      }
    }, [urlState.scriptType]);

    // 当tab切换时，更新URL参数
    const handleTabChange = (tab: string) => {
      setCurActiveTab(tab);
      updateUrlState({ scriptType: tab });
    };

    return (
      <div className={styles['spl-script-management']}>
        <div className={styles['spl-script-management-title']}>SQL脚本管理</div>
        <Tabs
          onChange={handleTabChange}
          activeTab={curActiveTab}
          defaultActiveTab="processing"
          className={styles['spl-tabs']}
          destroyOnHide
        >
          <TabPane key="processing" title="加工脚本">
            <Processing
              curActiveTab={curActiveTab}
              onToScriptList={onToScriptList}
            />
          </TabPane>
          <TabPane key="query" title="查询脚本">
            <QueryScript curActiveTab={curActiveTab} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
);

export default SplScriptManagement;
