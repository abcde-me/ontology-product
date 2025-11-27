import { Button, Modal, Table } from '@arco-design/web-react';
import React, { memo } from 'react';
import mockjs from 'mockjs';
import styles from './index.module.scss';
import { sort } from 'semver';
import {
  getVersionType,
  VersionType,
  VersionTypeEnum
} from '../version-status';

const SctipModalTable: React.FC<{
  isVisible: boolean;
  setChildStatus: (status: boolean) => void;
}> = memo(({ isVisible, setChildStatus }) => {
  const [visible, setVisible] = React.useState<boolean>(isVisible);
  React.useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);
  // TODO: 这里可以根据需要添加表格内容和逻辑
  // mock数据
  const mockData = mockjs.mock({
    script_name: '@cword(3, 5)',
    script_content: '@cparagraph(1, 3)',
    create_time: '@datetime',
    update_time: '@datetime',
    script_type: '@cword(2, 4)',
    script_status: '@cword(2, 4)',
    script_description: '@cparagraph(1, 3)',
    'list|5': [
      {
        'id|+1': 1,
        name: '@cword(3, 5)',
        type: '@cword(2, 4)',
        status: '@pick(["released",  "scheduled"])',
        created_at: '@datetime'
      }
    ]
  });
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
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '更新时间',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: () => (
        <>
          <Button type="text">详情</Button>
          <Button type="text">复制为新版本</Button>
          <Button type="text">删除</Button>
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
              script_name
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              最新版本：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              script_name
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              创建人：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              script_name
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              创建时间：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              script_name
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              所属工作流：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              script_name
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              所属任务节点：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              script_name
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              最新执行时间：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              script_name
            </div>
          </div>
        </div>
        <Table columns={columns} data={mockData.list} />;
      </div>
    </Modal>
  );
});

export default SctipModalTable;
