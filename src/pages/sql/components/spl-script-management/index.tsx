import React, { memo, useState, useEffect } from 'react';
import { Tabs } from '@arco-design/web-react';
import Processing from './processing';
import QueryScript from './query-script';
import { useUrlState } from '../../hooks/useUrlState';

import styles from './index.module.scss';
import classNames from 'classnames';
import { SQL_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/hooks/usePermission';

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
      <div className={classNames('p-[16px]', styles['spl-script-management'])}>
        <div className="mb-[16px] text-[20px] font-[500] leading-[30px] text-[var(--text-color-text-1)]">
          SQL脚本管理
        </div>
        <Tabs
          onChange={handleTabChange}
          activeTab={curActiveTab}
          defaultActiveTab="processing"
          className={styles['spl-tabs']}
          destroyOnHide
        >
          {useHasPermission(SQL_PERMISSIONS.DEVELOP_SCIPT_LIST) && (
            <TabPane key="processing" title="加工脚本">
              <Processing
                curActiveTab={curActiveTab}
                onToScriptList={onToScriptList}
              />
            </TabPane>
          )}
          {useHasPermission(SQL_PERMISSIONS.QUERY_SCRIPT_LIST) && (
            <TabPane key="query" title="查询脚本">
              <QueryScript curActiveTab={curActiveTab} />
            </TabPane>
          )}
        </Tabs>
      </div>
    );
  }
);

export default SplScriptManagement;
