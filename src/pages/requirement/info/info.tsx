import React, { useState, useEffect } from 'react';
import { Breadcrumb, Tabs, Spin, Space, Button } from '@arco-design/web-react';
import { IconArrowLeft, IconEdit, IconCopy } from '@arco-design/web-react/icon';
import { useHistory, useLocation } from 'react-router';
import RequirementDetail from './detail';
import RequirementProgress from './progress';
import RequirementParticular from './particular';
import { useParams } from '@/utils/url';
import { useGetRequirementDetail } from '../hooks/useGetRequirementDetail';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;
import styles from './info.module.scss';

type TabKey = 'detail' | 'progress' | 'particular';
const defaultActiveTab: TabKey = 'detail';

function RequirementInfo() {
  const history = useHistory();
  const location = useLocation();
  const requirementId = useParams('id') as string;
  const [activeTab, setActiveTab] = useState<TabKey>(defaultActiveTab);

  // 从URL查询参数中解析activeTab
  const getActiveTabFromUrl = (): TabKey => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('activeTab');
    if (tab === 'detail' || tab === 'progress' || tab === 'particular') {
      return tab;
    }
    return defaultActiveTab;
  };

  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.search]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
    const searchParams = new URLSearchParams(location.search);

    // 更新activeTab参数
    searchParams.set('activeTab', key);

    // 使用history更新URL，不触发页面重载
    history.push({
      pathname: location.pathname,
      search: searchParams.toString()
    });
  };

  const { data: requirementDetail = {}, isLoading } = useGetRequirementDetail({
    requirement_id: Number(requirementId)
  });

  if (isLoading) {
    return (
      <div className={styles.spinContainer}>
        <Spin />
      </div>
    );
  }

  const handleToConfig = (type: 'copy' | 'edit') => {
    history.push(
      `/tenant/compute/modaforge/requirement/config?type=${type}&id=${requirementId}`
    );
  };

  return (
    <div className={styles.requirementInfo}>
      <div className={styles.headBreadcrumbBox}>
        <div className={styles.headBreadcrumb}>
          <IconArrowLeft
            style={{ cursor: 'pointer', fontSize: '14px', marginRight: 12 }}
            onClick={() => history.goBack()}
          />
          <Breadcrumb style={{ fontSize: 20 }}>
            <BreadcrumbItem
              onClick={() => history.goBack()}
              className="cursor-pointer hover:text-black"
            >
              需求管理
            </BreadcrumbItem>
            <BreadcrumbItem>{requirementDetail?.name || ''}</BreadcrumbItem>
          </Breadcrumb>
        </div>
        <div className={styles.headBreadcrumbExtra}>
          <Space>
            <Button
              type="outline"
              icon={<IconEdit />}
              onClick={() => handleToConfig('edit')}
            >
              编辑
            </Button>
            <Button
              type="outline"
              icon={<IconCopy />}
              onClick={() => handleToConfig('copy')}
            >
              复制
            </Button>
          </Space>
        </div>
      </div>
      <div className={styles.requirementInfoContent}>
        <Tabs
          inkBarSize={{ width: '40px' }}
          activeTab={activeTab}
          onChange={handleTabChange}
        >
          <TabPane key="detail" title="详情">
            <RequirementDetail requirementDetail={requirementDetail} />
          </TabPane>
          <TabPane key="progress" title="进度">
            <RequirementProgress isActive={activeTab === 'progress'} />
          </TabPane>
          <TabPane key="particular" title="明细">
            <RequirementParticular isActive={activeTab === 'particular'} />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
export default RequirementInfo;
