/**
 * 已选个人Modal组件 - 只读展示
 */

import React, { useState, useEffect } from 'react';
import { Table, Modal, Pagination, Tooltip } from '@arco-design/web-react';
import { getIndividualList } from '@/api/individualAndDepartment';
import noDataElement from '@/components/no-data';

export interface SelectedPersonModalProps {
  visible: boolean;
  onClose: () => void;
  personIds: string[];
}

const SelectedPersonModal: React.FC<SelectedPersonModalProps> = ({
  visible,
  onClose,
  personIds
}) => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableData, setTableData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 获取已选个人数据
  const fetchPersonData = async () => {
    if (personIds.length === 0) {
      setTableData([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await getIndividualList({
        pageNo: current,
        pageSize: pageSize,
        ids: personIds
      });
      if (res.code === 'Success') {
        setTableData(res?.data?.result || []);
        setTotal(res?.data?.totalCount || 0);
      } else {
        setTableData([]);
        setTotal(0);
      }
    } catch {
      setTableData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setCurrent(1);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && personIds.length > 0) {
      fetchPersonData();
    }
  }, [visible, current, pageSize]);

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      ellipsis: true,
      width: 150
    },
    {
      title: '账号ID',
      dataIndex: 'id',
      width: 200,
      render: (_: any, record: any) => (
        <Tooltip content={record.id}>
          <div
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {record.id || '-'}
          </div>
        </Tooltip>
      )
    },
    {
      title: '所在部门',
      dataIndex: 'organization',
      ellipsis: true,
      render: (_: any, record: any) => {
        const fullOrgPath = record?.organization?.fullOrgPath || '-';
        return (
          <Tooltip content={fullOrgPath}>
            <div
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {fullOrgPath}
            </div>
          </Tooltip>
        );
      }
    }
  ];

  return (
    <Modal
      title="已选个人"
      visible={visible}
      onCancel={onClose}
      alignCenter={true}
      escToExit={true}
      maskClosable={true}
      style={{ width: '800px' }}
      footer={null}
    >
      <div style={{ padding: '0 12px' }}>
        <Table
          rowKey="id"
          columns={columns}
          data={tableData}
          loading={loading}
          pagination={false}
          border={false}
          noDataElement={noDataElement({ description: '暂无已选个人' })}
        />
        {total > 0 && (
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
            total={total}
            showJumper
            sizeCanChange
            style={{
              justifyContent: 'flex-end',
              marginTop: '10px'
            }}
          />
        )}
      </div>
    </Modal>
  );
};

export default SelectedPersonModal;
