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

interface DataSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  getChildTreeSelectData: (data: any) => void;
  initialSelectedData?: any[]; // 添加初始选中数据参数
  getTreeIds: (data: any) => void;
  getDetailObj: any;
  type: any;
}

const InputSearch = Input.Search;

const IndividualModal: React.FC<DataSourceModalProps> = ({
  visible,
  onClose,
  title = '请选个人',
  getChildTreeSelectData,
  initialSelectedData = [], // 接收初始数据
  getTreeIds,
  getDetailObj,
  type
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

  useEffect(() => {
    if (getDetailObj) {
      setSelectedRowKeys(
        getDetailObj?.label_operate &&
          getDetailObj?.label_operate?.user_id?.map((item) => item)
      );
      setCheckedKeys(
        getDetailObj?.label_operate &&
          getDetailObj?.label_operate?.org_id?.map((item) => item)
      );
    }
  }, [getDetailObj]);
  // 递归处理部门树数据，支持任意层级
  const processTreeData = (data: any[], level = 1): any[] => {
    return (
      data?.map((item) => {
        const baseItem = {
          allowClick: false,
          title: item.name,
          key: String(item.id),
          disabled: type === 'detail',
          level: level,
          perms: item.perms
        };

        // 如果有子级数据，递归处理
        if (item?.children && item.children.length > 0) {
          return {
            ...baseItem,
            children: processTreeData(item.children, level + 1)
          };
        }

        // 没有子级数据，直接返回基础项
        return baseItem;
      }) || []
    );
  };

  // 递归过滤掉perms为null的节点，只保留有权限数据的节点
  const filterTreeDataByPerms = (data: any[]): any[] => {
    const result: any[] = [];

    data?.forEach((item) => {
      // 如果当前节点有权限数据，保留该节点
      if (item.perms && item.perms.length > 0) {
        const filteredItem = { ...item };
        // 如果有子节点，递归过滤子节点
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterTreeDataByPerms(item.children);
          filteredItem.children = filteredChildren;
        }
        result.push(filteredItem);
      } else if (item.children && item.children.length > 0) {
        // 如果当前节点没有权限数据，但有子节点，递归处理子节点
        const filteredChildren = filterTreeDataByPerms(item.children);
        // 将过滤后的子节点直接添加到结果中（提升层级）
        result.push(...filteredChildren);
      }
      // 既没有权限数据，也没有子节点的节点被忽略
    });

    return result;
  };

  const getTreeData = () => {
    try {
      getDepartmentTreeList({})
        .then((res) => {
          let newTreeDateList = processTreeData(res?.data || []);

          if (type === 'create') {
            // 删除所有perms为null的节点
            newTreeDateList = filterTreeDataByPerms(newTreeDateList);
          }

          setTreeData(newTreeDateList);
          setOriginalTreeData(newTreeDateList);
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (err) {
      console.log(err, 'err');
    }
  };
  useEffect(() => {
    getTreeData();
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
      dataIndex: 'username',
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
      page: current,
      size: pageSize,
      organization_id: checkedKeys[0] || ''
    };
    try {
      const res = await getIndividualList({ ...sourceParams });
      if (res.success) {
        setTableData(res?.data.data);
        setTotal(res?.data?.total);
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
