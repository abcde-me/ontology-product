import { useUserInfo } from '@/store/userInfoStore';
import getLabelByValue from '@/utils/getLabelByValue';
import { useParams } from '@/utils/url';
import {
  Breadcrumb,
  Button,
  Space,
  Spin,
  Tabs,
  Tooltip
} from '@arco-design/web-react';
import { IconArrowLeft, IconCopy, IconEdit } from '@arco-design/web-react/icon';
import { DotStatus } from '@ceai-front/arco-material';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { REQUIREMENT_STATUS_CONFIG } from '../common';
import { useGetRequirementDetail } from '../hooks/useGetRequirementDetail';
import RequirementDetail from './detail';
import styles from './info.module.scss';
import RequirementParticular from './particular';
import RequirementProgress from './progress';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;

type TabKey = 'detail' | 'progress' | 'particular';
const defaultActiveTab: TabKey = 'detail';

function RequirementInfo() {
  const history = useHistory();
  const location = useLocation();
  const requirementId = useParams('id') as string;
  const [activeTab, setActiveTab] = useState<TabKey>(defaultActiveTab);
  const userInfo = useUserInfo();
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

  const handleBack = () => {
    history.push('/tenant/compute/modaforge/requirement');
  };

  return (
    <div className={styles.requirementInfo}>
      <div className={styles.headBreadcrumbBox}>
        <div className={styles.headBreadcrumb}>
          <IconArrowLeft
            style={{ cursor: 'pointer', fontSize: '14px', marginRight: 12 }}
            onClick={() => handleBack()}
          />
          <Breadcrumb style={{ fontSize: 20 }}>
            <BreadcrumbItem
              onClick={() => handleBack()}
              className="cursor-pointer hover:text-black"
            >
              需求管理
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span style={{ marginRight: '8px' }}>
                {requirementDetail?.name || ''}
              </span>
              <span>
                <DotStatus
                  text={getLabelByValue(
                    REQUIREMENT_STATUS_CONFIG,
                    requirementDetail?.req_status
                  )}
                  color={getLabelByValue(
                    REQUIREMENT_STATUS_CONFIG,
                    requirementDetail?.req_status,
                    'color'
                  )}
                />
              </span>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
        <div className={styles.headBreadcrumbExtra}>
          <Space>
            {[2, 4].includes(requirementDetail?.req_status) && (
              <Tooltip
                content="仅需求创建人可操作"
                disabled={userInfo?.id === requirementDetail?.creator_id}
              >
                <Button
                  type="outline"
                  disabled={userInfo?.id !== requirementDetail?.creator_id}
                  icon={<IconEdit />}
                  onClick={() => handleToConfig('edit')}
                >
                  编辑
                </Button>
              </Tooltip>
            )}
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
