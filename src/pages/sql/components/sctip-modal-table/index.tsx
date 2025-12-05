import { Button, Modal, Popover, Table, Tooltip } from '@arco-design/web-react';
import React, { memo } from 'react';
import mockjs from 'mockjs';
import styles from './index.module.scss';
import { sort } from 'semver';
import {
  getVersionType,
  VersionType,
  VersionTypeEnum
} from '../version-status';
import { IconQuestionCircle } from '@arco-design/web-react/icon';

const SctipModalTable: React.FC<{
  isVisible: boolean;
  setChildStatus: (status: boolean) => void;
  tableData;
  rowData;
}> = memo(({ isVisible, setChildStatus, tableData, rowData }) => {
  const [visible, setVisible] = React.useState<boolean>(isVisible);
  React.useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);

  const columns = [
    {
      title: '版本号',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id
    },
    {
      title: '脚本状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => getVersionType(record.status),
      filters: [
        { text: VersionTypeEnum.RELEASED, value: VersionType.RELEASED },
        { text: VersionTypeEnum.SCHEDULED, value: VersionType.SCHEDULED }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: '版本说明',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: '更新人',
      dataIndex: 'visteon',
      key: 'visteon'
    },
    {
      title: '更新时间',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: (
        <Popover
          content="复制为新版本：以选择的脚本为基础迭代新版本"
          trigger="hover"
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'help'
            }}
          >
            操作
            <IconQuestionCircle fontSize={16} style={{ color: '#7F8C9F' }} />
          </span>
        </Popover>
      ),
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => (
        <>
          <span className={styles['option-btn']}>详情</span>
          <Tooltip
            content={record?.visteon === 'false' ? '当前已有未发版的脚本' : ''}
          >
            <span
              className={[
                styles['option-btn'],
                record?.visteon === 'false' && styles['is-disabled']
              ].join(' ')}
            >
              复制为新版本
            </span>
          </Tooltip>
          <Tooltip
            content={
              record?.status === VersionType.SCHEDULED ? '调度中不可删除' : ''
            }
          >
            <span
              className={[
                styles['option-btn'],
                record?.status === VersionType.SCHEDULED &&
                  styles['is-disabled']
              ].join(' ')}
            >
              删除
            </span>
          </Tooltip>
        </>
      )
    }
  ];
  return (
    <Modal
      title="历史版本"
      visible={visible}
      onCancel={() => {
        setVisible(false);
        // 通知父组件修改状态，修改父组件的isVisible属性
        setChildStatus(false);
      }}
      style={{
        width: 960
      }}
      footer={null}
    >
      <div className={styles['script-modal-table-wrapper']}>
        <div className={styles['script-modal-table-content']}>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              名称：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.script_name}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              最新版本：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.max_version_name}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              创建人：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.create_user}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              创建时间：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.create_time}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              所属工作流：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.process_name}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              所属任务节点：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.task_name}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              最新执行时间：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.update_time}
            </div>
          </div>
        </div>
        <Table rowKey={'id'} columns={columns} data={tableData} />;
      </div>
    </Modal>
  );
});

export default SctipModalTable;
