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
import {
  getDepartmentTreeList,
  getIndividualList
} from '@/api/individualAndDepartment';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { IconCaretDown } from '@arco-design/web-react/icon';
import './IndividualModal.scss';

// 树节点处理工具函数
const processTreeNode = (node: any, isDetailMode: boolean): any => {
  return {
    ...node,
    disableCheckbox: isDetailMode,
    // 递归处理子节点，将childList转换为children
    children: node.childList?.map((child: any) =>
      processTreeNode(child, isDetailMode)
    )
  };
};

// 处理树数据的工具函数
const processTreeData = (data: any[], isDetailMode: boolean): any[] => {
  return data?.map((item) => processTreeNode(item, isDetailMode)) || [];
};

// 只保留有权限数据的节点
const filterTreeDataByPerms = (data: any[]): any[] => {
  if (!data?.length) return [];

  return data.reduce((result: any[], item) => {
    // 递归过滤子节点
    const filteredChildren = item.children?.length
      ? filterTreeDataByPerms(item.children)
      : undefined;

    // 如果当前节点有权限，保留该节点（即使子节点被过滤为空也要保留）
    if (item.isPermission) {
      result.push({
        ...item,
        children: filteredChildren
      });
    } else if (filteredChildren?.length) {
      // 如果当前节点没有权限但有过滤后的子节点，提升子节点层级
      result.push(...filteredChildren);
    }
    // 既没有权限也没有有效子节点的节点被忽略

    return result;
  }, []);
};

interface DataSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  getChildTreeSelectData: (data: any) => void;
  initialSelectedData?: any[]; // 添加初始选中数据参数
  getTreeIds: (data: any) => void;
  requirementDetail: any;
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
  requirementDetail,
  type,
  onConfirm,
  initialSelected = []
}) => {
  const tableRef = useRef<any>(null);
  const [treeData, setTreeData] = useState<any>([]);
  const [originalTreeData, setOriginalTreeData] = useState<any>([]);
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

  // 处理初始选中的数据
  useEffect(() => {
    if (initialSelected && initialSelected.length > 0) {
      setSelectedRowKeys(initialSelected);
    } else if (requirementDetail) {
      setSelectedRowKeys(
        requirementDetail?.label_operate &&
          requirementDetail?.label_operate?.user_id?.map((item) => item)
      );
      setCheckedKeys(
        requirementDetail?.label_operate &&
          requirementDetail?.label_operate?.org_id?.map((item) => item)
      );
    }
  }, [requirementDetail, initialSelected]);
  const getTreeData = () => {
    try {
      getDepartmentTreeList()
        .then((res) => {
          // 使用工具函数处理整个树结构
          const isDetailMode = type === 'detail';
          const newTreeData = processTreeData(res?.data || [], isDetailMode);
          setTreeData(filterTreeDataByPerms(newTreeData));
          setOriginalTreeData(filterTreeDataByPerms(newTreeData));
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (err) {
      console.log(err, 'err');
    }
  };
  useEffect(() => {
    if (visible) {
      getTreeData();
    }
  }, [visible]);
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

  const searchData = (searchValue, originalTreeData) => {
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

    return loop(originalTreeData);
  };

  useEffect(() => {
    if (!searchValue) {
      setTreeData(originalTreeData);
    } else {
      const result = searchData(searchValue, originalTreeData);
      setTreeData(result);
    }
  }, [searchValue]);

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
                getTreeData();
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
              checkboxProps: () => {
                return {
                  disabled: type === 'detail'
                };
              },
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
