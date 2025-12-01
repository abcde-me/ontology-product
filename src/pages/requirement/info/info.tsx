import React from 'react';
import { Breadcrumb, Tabs, Spin, Space, Button } from '@arco-design/web-react';
import { IconArrowLeft, IconEdit, IconCopy } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router';
import RequirementDetail from './detail';
import RequirementProgress from './progress';
import RequirementParticular from './particular';
import { useParams } from '@/utils/url';
import { useGetRequirementDetail } from '../hooks/useGetRequirementDetail';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;
import styles from './info.module.scss';
function RequirementInfo() {
  const history = useHistory();
  const requirementId = useParams('id') as string;

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
            <Button type="outline" icon={<IconEdit />}>
              编辑
            </Button>
            <Button type="outline" icon={<IconCopy />}>
              复制
            </Button>
          </Space>
        </div>
      </div>
      <div className={styles.requirementInfoContent}>
        <Tabs inkBarSize={{ width: '40px' }}>
          <TabPane key="detail" title="详情">
            <RequirementDetail requirementDetail={requirementDetail} />
          </TabPane>
          <TabPane key="progress" title="进度">
            <RequirementProgress />
          </TabPane>
          <TabPane key="particular" title="明细">
            <RequirementParticular />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
export default RequirementInfo;
