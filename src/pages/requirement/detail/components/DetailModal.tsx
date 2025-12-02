import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Button,
  Tree,
  Input,
  DatePicker,
  Table,
  Pagination,
  Empty,
  Tooltip,
  Spin
} from '@arco-design/web-react';
import { CatalogItemType, getCatalogList } from '@/api/dataCatalog';
import { getAnnotationTabledData } from '@/api/dataAnnotation';
import dayjs from 'dayjs';
import noDataElement from '@/components/no-data';
import './DetailModal.scss';
interface TreeItem {
  id: number;
  parent_id: number;
  type: number;
  type_name: string;
  name: string;
  base_dir: string;
  children: Record<string, TreeItem[]>; // 子类型映射（如 {volume: [], db: []}）
  perms?: string[] | null;
  execution_id?: string;
}
interface DataSourceModalProps {
  fileType: Record<number, string[]>;
  visible: boolean;
  onClose: () => void;
  title?: string;
  type: string | null;
  getChildTableSelectData: (data: any, key) => void;
  initialSelectedData?: any[]; // 添加初始选中数据参数
  getDetailObj: any;
}

const InputSearch = Input.Search;

const DataSourceModal: React.FC<DataSourceModalProps> = ({
  fileType,
  visible,
  type,
  onClose,
  title = '选择数据',
  getChildTableSelectData,
  initialSelectedData = [], // 接收初始数据
  getDetailObj
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
  const [tableLoading, settableLoading] = useState(false);
  const [dir_path, setDir_path] = useState<React.Key[]>(['']);
  const [treeNodeName, setTreeNodeName] = useState('');
  const [treeLoading, setTreeLoading] = useState(false);
  const formatCatalogTree = (rawData: any[]): TreeItem[] => {
    // 递归处理单个节点的子层级
    const handleChildren = (
      children: TreeItem['children']
    ): TreeItem['children'] => {
      if (!children) return {};

      const newChildren: TreeItem['children'] = {};

      // 遍历所有子类型（如 volume、db、db_item 等）
      Object.entries(children).forEach(([childType, childItems]) => {
        // 核心逻辑：将 "volume" 类型替换为 "数据卷" 作为分类名
        const targetType = childType === 'volume' ? '数据卷' : childType;

        // 递归处理子节点的子层级（确保深层 volume 也能被替换）
        const formattedItems = childItems.map((item) => ({
          ...item,
          // 递归处理当前节点的子节点
          children: handleChildren(item.children)
        }));

        // 将处理后的子项挂载到新分类下
        newChildren[targetType] = formattedItems;
      });

      return newChildren;
    };

    // 处理最外层 catalog 节点
    return rawData.map((catalog) => ({
      ...catalog,
      // 处理每个 catalog 的子层级
      children: handleChildren(catalog.children)
    }));
  };
  const getTreeDataList = () => {
    let newTreeData: any[] = [];
    try {
      setTreeLoading(true);
      getCatalogList({ dir_type: CatalogItemType.Volume }).then((res) => {
        setTreeLoading(false);
        if (res.status !== 200) {
          return;
        }
        newTreeData = formatCatalogTree(res.data?.src).map((item) => {
          return item.children
            ? {
                allowClick: false,
                title: item.name,
                key: String(item.id),
                level: 1,
                actionOnClick: 'expand',
                children:
                  item?.children?.数据卷 && item.children.数据卷.length > 0
                    ? [
                        {
                          actionOnClick: 'expand',
                          level: 2,
                          title: '数据卷',
                          key: String(item.id) + '数据卷',
                          allowClick: false,
                          children: item.children.数据卷.map((subItem) => ({
                            title: subItem.name,
                            key: `${item.id},${item.id}数据卷,${subItem.id}`,
                            id: subItem?.id,
                            level: 3,
                            disabled: type === 'detail',
                            actionOnClick: 'select'
                          }))
                        }
                      ]
                    : undefined
              }
            : { title: item.name, key: item.id };
        });
        setTreeData(newTreeData);
        setOriginalTreeData(newTreeData);
      });
    } catch (err) {}
  };
  useEffect(() => {
    if (visible) {
      getTreeDataList();
    }
  }, [visible]);

  // 树的内容
  const renderTreeContent = () => {
    return (
      <div className="arco-tree">
        {treeData && treeData.length > 0 ? (
          <Tree
            actionOnClick={['select', 'expand']}
            blockNode={true}
            defaultExpandedKeys={getDetailObj?.label_data_set?.[0]?.dir_name.split(
              ','
            )}
            defaultSelectedKeys={[getDetailObj?.label_data_set?.[0]?.dir_name]}
            autoExpandParent={false}
            treeData={treeData}
            // checkStrictly={checkStrictly}
            renderTitle={(node: any) => {
              return (
                <Tooltip content={node.title}>
                  <div
                    style={{
                      width: node?.childrenData?.length > 0 ? '170px' : '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#0F172A'
                    }}
                  >
                    {node.title}
                  </div>
                </Tooltip>
              );
            }}
            onSelect={(value, e: any) => {
              if (e?.node?.props?.dataRef?.level === 3 && type !== 'detail') {
                setCurrent(1);
                setPageSize(10);
                setCheckedKeys([value[0]?.split(',')?.[2]]);
                setDir_path(value);
                getChildTableSelectData(selectedRowsContent, value);
                setTreeNodeName(e?.node?.props?.dataRef?.title);
              }
            }}
          />
        ) : (
          <div className="empty-content">
            <Empty description="暂无数据" />
          </div>
        )}
      </div>
    );
  };
  //格式化时间函数
  const formatDateTime = (dateTimeString: string): string => {
    return dayjs(dateTimeString).format('YYYY-MM-DD HH:mm:ss');
  };
  const columns = [
    {
      title: '载入开始时间',
      dataIndex: 'start_time',
      width: 180,
      sorter: (a, b) => dayjs(a.start_time).unix() - dayjs(b.start_time).unix(),
      sortDirections: ['ascend' as const, 'descend' as const],
      render: (text, record) =>
        type === 'detail' ? formatDateTime(record?.load_start_time) : text
    },
    {
      title: '载入结束时间',
      dataIndex: 'end_time',
      width: 180,
      sorter: (a, b) => dayjs(a.end_time).unix() - dayjs(b.end_time).unix(),
      sortDirections: ['ascend' as const, 'descend' as const],
      render: (text, record) =>
        type === 'detail' ? formatDateTime(record?.load_end_time) : text
    },
    {
      title: '数据量',
      dataIndex: 'load_num',
      ellipsis: true,
      width: 100
    },
    {
      title: '创建人',
      dataIndex: type === 'detail' ? 'create_by' : 'upload_user',
      ellipsis: true,
      width: 100
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
      page_size: pageSize,
      data_path_id: Number(checkedKeys),
      // start: dateRange[0], //后期改成startTime
      // end: dateRange[1], //后期改成endTime
      file_type: fileType, // 使用筛选条件中的文件类型
      sort_by: 'start_time',
      sort: 'asc'
    };
    try {
      const res = await getAnnotationTabledData(sourceParams);
      if (res.status === 200) {
        setTableData(res?.data?.items);
        setTotal(res?.data?.total);
        settableLoading(false);
      }
    } catch (error) {
      setTableData([]);
      setTotal(0);
      settableLoading(false);
    } finally {
      settableLoading(false);
    }
  };
  useEffect(() => {
    if (type === 'detail') {
      return;
    }
    if (checkedKeys?.length > 0) {
      settableLoading(true);
      getTableData();
    }
  }, [checkedKeys, current, pageSize]);
  // 处理日期范围变化
  const handleDateChange = (value) => {
    // 暂时这么处理吧， 1230版本变了
    if (type === 'detail') {
      if (value && value.length === 2) {
        const [start, end] = value;
        const filteredData = getDetailObj?.label_data_set.filter((item) => {
          return (
            formatDateTime(item.load_start_time) >= start + ' 00:00:00' &&
            formatDateTime(item.load_end_time) <= end + ' 23:59:59'
          );
        });
        setTableData(filteredData);
      }
      if (value === null || value === undefined || value === '') {
        setTableData(getDetailObj?.label_data_set);
      }
      return;
    }
    // 当选择了完整的日期范围（开始和结束），执行筛选
    if (value && value.length === 2) {
      const [start, end] = value;
      // 格式化日期为 YYYY-MM-DD（确保与数据格式一致）
      const filteredData = tableData.filter((item) => {
        return (
          item.start_time >= start + ' 00:00:00' &&
          item.end_time <= end + ' 23:59:59'
        );
      });
      setTableData(filteredData);
    } else if (value === null || value === undefined || value === '') {
      // 清空日期选择时，恢复原始数据
      getTableData();
    }
  };

  useEffect(() => {
    if (type === 'detail') {
      setTableData(getDetailObj?.label_data_set);
      setSelectedRowKeys(
        getDetailObj?.label_data_set &&
          getDetailObj?.label_data_set?.map((item) => item.execution_id) // 改为使用 execution_id
      );
    }
  }, [getDetailObj]);
  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onClose}
      alignCenter={true}
      escToExit={false}
      maskClosable={false}
      className="fullscreen-modal"
      style={{ width: '960px', height: '800px', overflowY: 'auto' }}
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
      <div className="detail-modal-content">
        <div className="content-tree">
          <div className="search-input">
            <InputSearch
              type="text"
              placeholder="请输入名称搜索"
              onChange={(value) => {
                setSearchValue(value);
              }}
              allowClear={true}
              onClear={() => {
                getTreeDataList();
              }}
            />
          </div>
          <Spin loading={treeLoading}>{renderTreeContent()}</Spin>
        </div>
        <div className="content-table">
          <div className="content-table-form">
            <div className="tree-node-name">{treeNodeName}</div>
            <DatePicker.RangePicker
              onChange={handleDateChange}
              style={{ width: 350 }}
              onClear={() => {
                if (type === 'detail') {
                  setTableData(getDetailObj?.label_data_set);
                } else {
                  getTableData();
                }
                // setDateRange([]);
              }}
            />
            {/* <div className="form-option">
            </div> */}
          </div>
          <Table
            ref={tableRef}
            rowKey="execution_id"
            columns={columns}
            data={tableData}
            loading={tableLoading}
            pagination={false}
            border={false}
            noDataElement={noDataElement({
              description: '暂无数据'
            })}
            rowSelection={{
              checkboxProps: () => {
                return {
                  disabled: type === 'detail'
                };
              },
              selectedRowKeys: selectedRowKeys,
              preserveSelectedRowKeys: true,
              onChange: (selectedRowKeys, selectedRows) => {
                // 合并新旧选中数据并处理取消选中
                const mergedMap = new Map<string, any>();

                // 1. 保留仍处于选中状态的现有数据 - 使用 execution_id 进行过滤
                selectedRowsContent
                  .filter((item) => selectedRowKeys.includes(item.execution_id))
                  .forEach((item) => mergedMap.set(item.execution_id, item));

                // 2. 添加当前页新选中数据 - 使用 execution_id 作为 key
                selectedRows.forEach((item: any) =>
                  mergedMap.set(item.execution_id, item)
                );

                // 3. 更新状态
                const mergedRows = Array.from(mergedMap.values());
                setSelectedRowsContent(mergedRows);
                setSelectedRowKeys(mergedRows.map((item) => item.execution_id));
                getChildTableSelectData(mergedRows, dir_path);
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
                marginRight: '12px'
              }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export { DataSourceModal };
