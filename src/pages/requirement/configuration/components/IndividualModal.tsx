import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Button,
  Tree,
  Input,
  Table,
  Pagination,
  Message,
  Tooltip
} from '@arco-design/web-react';
import { getIndividualList } from '@/api/individualAndDepartment';
import { useDepartmentTree } from '../../hooks/useDepartmentTree';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { IconCaretDown } from '@arco-design/web-react/icon';
import './IndividualModal.scss';

interface DataSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  getChildTreeSelectData: (data: any) => void;
  initialSelectedData?: any[]; // 添加初始选中数据参数
  getTreeIds: (data: any) => void;
  type: any;
  onConfirm?: (selectedIds: string[]) => void; // 新增：确认回调
  initialSelected?: string[]; // 新增：初始选中的用户ID列表
}

const InputSearch = Input.Search;

const IndividualModal: React.FC<DataSourceModalProps> = ({
  visible,
  onClose,
  title = '请选个人',
  getChildTreeSelectData,
  initialSelectedData = [], // 接收初始数据
  getTreeIds,
  type,
  onConfirm,
  initialSelected = []
}) => {
  const tableRef = useRef<any>(null);
  const [tableData, setTableData] = useState<any>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [selectedRowsContent, setSelectedRowsContent] =
    useState<any[]>(initialSelectedData);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(10);
  // 在组件状态定义中添加
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { treeData, setSearchValue, fetchTreeData } = useDepartmentTree(false);

  // 处理初始选中的数据 - 当弹窗打开或初始选中数据变化时同步
  useEffect(() => {
    if (visible) {
      setSelectedRowKeys(initialSelected || []);
      fetchTreeData();
    }
  }, [visible, initialSelected]);
  // 树的内容
  const renderTreeContent = () => {
    return (
      <Tree
        blockNode={true}
        icons={{
          switcherIcon: <IconCaretDown />
        }}
        autoExpandParent={false}
        treeData={treeData}
        renderTitle={(node: any) => {
          return (
            <div
              style={{
                width: node?.childrenData?.length > 0 ? '170px' : '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#0F172A'
              }}
            >
              <Tooltip content={node.title}>{node.title}</Tooltip>
            </div>
          );
        }}
        onSelect={(value) => {
          setCurrent(1);
          setPageSize(10);
          setCheckedKeys(value);
          getTreeIds(value);
        }}
      />
    );
  };
  const renderEmptyPlaceholder = (value: string | null) => {
    return value === '' || value == null ? '-' : value;
  };
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      ellipsis: true,
      width: 327
    },
    {
      title: '账号ID',
      dataIndex: 'id',
      width: 327,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.id)}
          isEdit={false}
        />
      )
    }
  ];

  // 获取表格数据
  const getTableData = async () => {
    const sourceParams: any = {
      pageNo: current,
      pageSize: pageSize,
      organizationId: checkedKeys[0] || ''
    };
    try {
      const res = await getIndividualList({ ...sourceParams });
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
    }
  };
  useEffect(() => {
    if (checkedKeys?.length > 0) {
      getTableData();
    }
  }, [checkedKeys, current, pageSize]);
  // 表格选择内容

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={() => {
        onClose();
      }}
      alignCenter={true}
      escToExit={false}
      maskClosable={false}
      className="fulscreen-modal"
      style={{ width: '1000px', height: '800px' }}
      closeIcon={null}
      footer={
        <Button
          onClick={() => {
            if (onConfirm) {
              onConfirm(selectedRowKeys as string[]);
            }
            onClose();
          }}
          type="primary"
        >
          确定
        </Button>
      }
    >
      <div className="individual-modal-content">
        <div className="content-tree">
          <div>
            <InputSearch
              type="text"
              placeholder="请输入部门搜索"
              onChange={(value) => {
                setSearchValue(value);
              }}
              allowClear
              onClear={() => {
                setSearchValue('');
              }}
            />
          </div>
          {renderTreeContent()}
        </div>
        <div className="content-table">
          <Table
            ref={tableRef}
            rowKey="id"
            border={false}
            columns={columns}
            data={tableData}
            pagination={false}
            noDataElement={noDataElement({ description: '暂无数据' })}
            rowSelection={{
              selectedRowKeys: selectedRowKeys,
              preserveSelectedRowKeys: true,
              onChange: (selectedRowKeys: any, selectedRows: any) => {
                // 合并新旧选中数据并处理取消选中
                const mergedMap = new Map<string, any>();

                // 1. 保留仍处于选中状态的现有数据
                selectedRowsContent
                  .filter((item) => selectedRowKeys.includes(item.id))
                  .forEach((item) => mergedMap.set(item.id, item));

                // 2. 添加当前页新选中数据
                selectedRows.forEach((item) => mergedMap.set(item.id, item));

                // 3. 更新状态
                const mergedRows = Array.from(mergedMap.values());
                if (mergedRows.length <= 200) {
                  setSelectedRowsContent(mergedRows);
                  setSelectedRowKeys(mergedRows.map((item) => item.id));
                  getChildTreeSelectData(mergedRows.map((item) => item.id));
                } else {
                  Message.error('选中的数量不能超过200条');
                }
              }
            }}
          />
          {tableData && tableData.length > 0 && (
            <Pagination
              current={current}
              pageSize={pageSize}
              onPageSizeChange={(pageSize) => {
                setPageSize(pageSize);
                setCurrent(1);
                // 保留选中状态，不重置selectedRowKeys
              }}
              onChange={(page) => {
                setCurrent(page);
                // 保留选中状态，不重置selectedRowKeys
              }}
              sizeOptions={[10, 20, 50, 100]}
              showTotal
              total={total}
              showJumper
              sizeCanChange
              style={{
                justifyContent: 'flex-end',
                marginTop: '10px',
                marginRight: '16px'
              }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export { IndividualModal };
