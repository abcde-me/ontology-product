import React from 'react';
import { IconArrowLeft } from '@arco-design/web-react/icon';
import {
  Breadcrumb,
  Descriptions,
  Tabs,
  Tooltip,
  Typography
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { useParams } from '@/utils/url';

import styles from './detail.module.scss';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;

export default function MetadataManagementDetail() {
  const history = useHistory();
  const metadataId = useParams('id');

  const data = [
    {
      label: '英文名称',
      value: 'BM_SS_ZYBM'
    },
    {
      label: '中文名称',
      value: '资源编目信息表（BM_SS_ZYBM）'
    },
    {
      label: '存储类型',
      value: '3C market'
    },
    {
      label: '元数据文件位置',
      value: 'Users\YourName\my_web_app\package.json'
    },
    {
      label: '所属数据库',
      value: '3C market'
    },
    {
      label: '分区字段',
      value: (
        <div>
          date, region 等{' '}
          <Tooltip content="date，region，name">
            <span className="text-[#007DFA]">{3}</span>
          </Tooltip>{' '}
          个
        </div>
      )
    },
    {
      label: '分区数',
      value: '15'
    },
    {
      label: '存储大小',
      value: '45TB'
    },
    {
      label: '文件数',
      value: '16'
    },
    {
      label: '更新时间',
      value: '2023-08-01 00:00:00'
    },
    {
      label: '最新访问时间',
      value: '2023-08-01 00:00:00'
    }
  ];

  return (
    <div className={styles.metadataManagementDetail}>
      <div className={styles.headBreadcrumbBox}>
        <IconArrowLeft
          style={{ cursor: 'pointer', fontSize: '14px' }}
          onClick={() => history.goBack()}
        />
        <Breadcrumb style={{ fontSize: 20, marginLeft: '21px' }}>
          <BreadcrumbItem
            onClick={() =>
              history.push('/tenant/compute/modaforge/metadataManagement')
            }
            className={styles.breadcrumbText}
          >
            元数据管理
          </BreadcrumbItem>
          <BreadcrumbItem>{metadataId}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div className={styles.contentBox}>
        <Tabs defaultActiveTab="baseInfo">
          <TabPane key="baseInfo" title="基本信息">
            <Typography.Paragraph>
              <Descriptions
                colon=" :"
                column={2}
                title="基本信息"
                data={data}
                className={styles.customDescriptions}
              />
            </Typography.Paragraph>
          </TabPane>
          <TabPane key="fieldInfo" title="字段信息">
            <Typography.Paragraph>Content of Tab Panel 2</Typography.Paragraph>
          </TabPane>
          <TabPane key="partitionInfo" title="分区信息">
            <Typography.Paragraph>Content of Tab Panel 3</Typography.Paragraph>
          </TabPane>
          <TabPane key="previewInfo" title="数据预览">
            <Typography.Paragraph>Content of Tab Panel 3</Typography.Paragraph>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
