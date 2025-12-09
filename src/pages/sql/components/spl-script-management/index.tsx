import React, { memo, useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import Processing from './processing';
import QueryScript from './query-script';

import styles from './index.module.scss';

interface SplScriptManagementProps {
  onToScriptList: (type: string) => void;
}

// SQL脚本管理组件
const SplScriptManagement: React.FC<SplScriptManagementProps> = memo(
  ({ onToScriptList }) => {
    const TabPane = Tabs.TabPane;
    const [curActiveTab, setCurActiveTab] = useState('processing');
    return (
      <div className={styles['spl-script-management']}>
        <div className={styles['spl-script-management-title']}>SQL脚本管理</div>
        <Tabs
          onChange={setCurActiveTab}
          defaultActiveTab="processing"
          className={styles['spl-tabs']}
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
