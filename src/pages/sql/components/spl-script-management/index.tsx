import React, { memo } from 'react';
import { Tabs } from '@arco-design/web-react';
import Processing from './processing';
import QueryScript from './query-script';

import styles from './index.module.scss';

// SQL脚本管理组件
const SplScriptManagement: React.FC = memo(() => {
  const TabPane = Tabs.TabPane;

  return (
    <div className={styles['spl-script-management']}>
      <div className={styles['spl-script-management-title']}>SQL脚本管理</div>
      <Tabs defaultActiveTab="processing" className={styles['spl-tabs']}>
        <TabPane key="processing" title="加工脚本">
          <Processing />
        </TabPane>
        <TabPane key="query" title="查询脚本">
          <QueryScript />
        </TabPane>
      </Tabs>
    </div>
  );
});

export default SplScriptManagement;
