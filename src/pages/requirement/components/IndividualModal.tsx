import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Button,
  Typography,
  Tabs,
  Tree,
  Form,
  Input,
  DatePicker,
  Table,
  Popover,
  Pagination,
  Message
} from '@arco-design/web-react';
import {
  getDepartmentTreeList,
  getIndividualList
} from '@/api/individualAndDepartment';
import './IndividualModal.scss';

interface DataSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  getChildTreeSelectData: (data: any) => void;
  initialSelectedData?: any[]; // 添加初始选中数据参数
  getTreeIds: (data: any) => void;
}
const IndividualModal: React.FC<DataSourceModalProps> = ({
  visible,
  onClose,
  title = '数据源',
  getChildTreeSelectData,
  initialSelectedData = [], // 接收初始数据
  getTreeIds
}) => {
  const tableRef = useRef<any>(null);
  const [treeData, setTreeData] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedRowsContent, setSelectedRowsContent] =
    useState<any[]>(initialSelectedData);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(10);
  // 在组件状态定义中添加
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  useEffect(() => {
    try {
      getDepartmentTreeList({})
        .then((res) => {
          console.log(res?.data, 'res');
          setTreeData(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (err) {
      console.log(err, 'err');
    }
  }, [visible]);

  // 树的内容
  const renderTreeContent = () => {
    return (
      <Tree
        showLine
        autoExpandParent={false}
        treeData={treeData}
        // checkStrictly={checkStrictly}
        onSelect={(value) => {
          console.log(value);
          setCurrent(1);
          setPageSize(10);
          setCheckedKeys(value);
        }}
      />
    );
  };
  const columns = [
    {
      title: '姓名',
      dataIndex: 'username',
      ellipsis: true,
      width: 100
    },
    {
      title: '账号ID',
      dataIndex: 'tenant_id',
      width: 80
    }
  ];

  const searchData = (searchValue) => {
    const loop = (data) => {
      const result: any = [];
      data.forEach((item) => {
        if (item.title.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
          result.push({ ...item });
        } else if (item.children) {
          const filterData = loop(item.children);

          if (filterData.length) {
            result.push({ ...item, children: filterData });
          }
        }
      });
      return result;
    };

    return loop(treeData);
  };

  useEffect(() => {
    if (!searchValue || searchValue === '') {
      setTreeData(treeData);
    } else {
      const result = searchData(searchValue);
      setTreeData(result);
    }
  }, [searchValue]);

  // 获取表格数据
  const getTableData = async () => {
    const sourceParams: any = {
      page: current,
      size: pageSize,
      organization_id: checkedKeys[0] || ''
    };
    const res = await getIndividualList({ ...sourceParams });
    console.log(res?.data.data, 'res======132');
    if (res.success) {
      setTableData(res?.data.data);
      setCurrent(res?.data?.page);
      setPageSize(res?.data?.size);
      setTotal(res?.data?.total);
    }
  };
  useEffect(() => {
    getTableData();
  }, [checkedKeys, current, pageSize]);
  // 表格选择内容
  const getTableSelectContent = () => {
    getChildTreeSelectData(selectedRowKeys);
    getTreeIds(checkedKeys);
    onClose();
  };
  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onClose}
      alignCenter={true}
      escToExit={false}
      maskClosable={false}
      className="fulscreen-modal"
      style={{ width: '90vw', overflowY: 'auto' }}
      footer={
        <Button
          type="primary"
          onClick={() => {
            getTableSelectContent();
          }}
        >
          确定
        </Button>
      }
    >
      <div className="fullscreen-modal-content">
        <div className="content-tree">
          <div>
            <Input
              type="text"
              placeholder="请输入名称搜索"
              onChange={(value) => {
                setSearchValue(value);
              }}
            />
          </div>
          {renderTreeContent()}
        </div>
        <div className="content-table">
          <Table
            ref={tableRef}
            rowKey="id"
            columns={columns}
            data={tableData}
            pagination={false}
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
              style={{ justifyContent: 'flex-end', marginTop: '10px' }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export { IndividualModal };
