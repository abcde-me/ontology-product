import React, { useState, useEffect } from 'react';
import { Modal, Table, Pagination, Tooltip } from '@arco-design/web-react';
import { useCatalogTree } from '../../hooks/useCatalogTree';
import noDataElement from '@/components/no-data';
import dayjs from 'dayjs';

interface SelectedDataModalProps {
  visible: boolean;
  onClose: () => void;
  data: any[];
}

const SelectedDataModal: React.FC<SelectedDataModalProps> = ({
  visible,
  onClose,
  data
}) => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { fetchTreeData, getPath } = useCatalogTree(false);

  // 获取目录树数据
  useEffect(() => {
    if (visible && data.length > 0) {
      fetchTreeData();
    }
  }, [visible]);

  // 重置分页
  useEffect(() => {
    if (visible) {
      setCurrent(1);
    }
  }, [visible]);

  // 格式化时间函数
  const formatDateTime = (dateTimeString: string): string => {
    return dayjs(dateTimeString).format('YYYY-MM-DD HH:mm:ss');
  };

  // 已选数据的表格列定义
  const selectedColumns = [
    {
      title: '目录名称',
      dataIndex: 'dir_name',
      ellipsis: true,
      width: 230,
      render: (text: string) => {
        const path = getPath(text);
        return (
          <Tooltip content={path}>
            <div
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {path || '未知路径'}
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: '载入开始时间',
      dataIndex: 'load_start_time',
      width: 180,
      sorter: (a, b) =>
        dayjs(a.load_start_time).unix() - dayjs(b.load_start_time).unix(),
      sortDirections: ['ascend' as const, 'descend' as const],
      render: (text) => (text ? formatDateTime(text) : '-')
    },
    {
      title: '载入结束时间',
      dataIndex: 'load_end_time',
      width: 180,
      sorter: (a, b) =>
        dayjs(a.load_end_time).unix() - dayjs(b.load_end_time).unix(),
      sortDirections: ['ascend' as const, 'descend' as const],
      render: (text) => (text ? formatDateTime(text) : '-')
    },
    {
      title: '数据量',
      dataIndex: 'load_num',
      ellipsis: true,
      width: 100
    },
    {
      title: '创建人',
      dataIndex: 'create_by',
      ellipsis: true,
      width: 100
    }
  ];

  return (
    <Modal
      title="已选数据"
      visible={visible}
      onCancel={onClose}
      alignCenter={true}
      escToExit={true}
      maskClosable={true}
      style={{ width: '900px' }}
      footer={null}
    >
      <Table
        rowKey={(record: any) =>
          record.run_id || record.execution_id || record.id
        }
        columns={selectedColumns}
        data={data.slice((current - 1) * pageSize, current * pageSize)}
        loading={false}
        pagination={false}
        border={false}
        noDataElement={noDataElement({
          description: '暂无已选数据'
        })}
      />
      {data && data.length > 0 && (
        <Pagination
          current={current}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrent(1);
          }}
          onChange={(page) => {
            setCurrent(page);
          }}
          sizeOptions={[10, 20, 50, 100]}
          showTotal
          total={data.length}
          showJumper
          sizeCanChange
          style={{
            justifyContent: 'flex-end',
            margin: '10px 0 20px'
          }}
        />
      )}
    </Modal>
  );
};

export default SelectedDataModal;

