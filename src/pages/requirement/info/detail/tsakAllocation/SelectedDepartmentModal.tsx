/**
 * 已选部门Modal组件 - 只读展示
 */

import React, { useState, useEffect } from 'react';
import { Table, Modal, Pagination, Tooltip } from '@arco-design/web-react';
import { getDepartmentTreeList } from '@/api/individualAndDepartment';
import {
  processTreeData,
  filterTreeDataByPerms
} from '../../../hooks/useDepartmentTree';
import noDataElement from '@/components/no-data';

// 获取部门完整路径标题
const getFullPathTitle = (
  nodes: any[],
  targetId: string,
  path: string[] = []
): string => {
  for (const node of nodes) {
    const currentPath = [...path, node.title];
    if (node.id === targetId) {
      return currentPath.join('-');
    }
    if (node.children) {
      const result = getFullPathTitle(node.children, targetId, currentPath);
      if (result) return result;
    }
  }
  return '';
};

export interface SelectedDepartmentModalProps {
  visible: boolean;
  onClose: () => void;
  departmentIds: string[];
}

const SelectedDepartmentModal: React.FC<SelectedDepartmentModalProps> = ({
  visible,
  onClose,
  departmentIds
}) => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableData, setTableData] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // 获取部门树并匹配部门信息
  const fetchDepartmentData = async () => {
    if (departmentIds.length === 0) {
      setTableData([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getDepartmentTreeList();
      const treeData = processTreeData(res?.data || []);
      const filteredData = filterTreeDataByPerms(treeData);

      // 根据部门ID查找完整路径名称
      const data = departmentIds.map((id) => {
        const fullPath = getFullPathTitle(filteredData, id);
        return {
          id,
          name: fullPath || id
        };
      });
      setTableData(data);
    } catch {
      // 获取失败时使用ID作为名称
      setTableData(departmentIds.map((id) => ({ id, name: id })));
    } finally {
      setLoading(false);
    }
  };

  const total = tableData.length;
  const paginatedData = tableData.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  const columns = [
    {
      title: '部门名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip content={text}>
          <div
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {text}
          </div>
        </Tooltip>
      )
    }
  ];

  useEffect(() => {
    if (visible) {
      setCurrent(1);
      fetchDepartmentData();
    }
  }, [visible]);

  return (
    <Modal
      title="已选部门"
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
          data={paginatedData}
          loading={loading}
          pagination={false}
          border={false}
          noDataElement={noDataElement({ description: '暂无已选部门' })}
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

export default SelectedDepartmentModal;
