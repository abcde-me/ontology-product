import { getAnnotationTabledData } from '@/api/dataAnnotation';
import { CatalogItemType, getCatalogList } from '@/api/dataCatalog';
import noDataElement from '@/components/no-data';
import {
  Button,
  DatePicker,
  Empty,
  Input,
  Link,
  Modal,
  Pagination,
  Spin,
  Table,
  Tabs,
  Tooltip,
  Tree
} from '@arco-design/web-react';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  requirementDetail: any;
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
  requirementDetail
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
  const [activeTab, setActiveTab] = useState<string>('all');
  // 已选数据的分页状态
  const [selectedCurrent, setSelectedCurrent] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(10);
  // 存储每个已选数据对应的目录路径
  const [selectedDataPathMap, setSelectedDataPathMap] = useState<
    Map<string, string>
  >(new Map());
  // 使用 ref 来跟踪是否已经初始化，避免无限循环
  const initializedRef = useRef(false);
  const prevInitialSelectedDataRef = useRef<any[]>([]);
  const pathMapInitializedRef = useRef(false);
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

  // 根据 dir_path key 获取完整的目录路径
  const getDirectoryPath = (dirPathKey: string): string => {
    if (!dirPathKey || !originalTreeData.length) return '';

    const keys = dirPathKey.split(',');
    if (keys.length < 3) return '';

    const catalogId = keys[0];
    const volumeKey = keys[1];
    const volumeId = keys[2];

    // 在树形数据中查找路径
    const findPath = (nodes: any[], path: string[] = []): string[] | null => {
      for (const node of nodes) {
        const currentPath = [...path, node.title];

        if (node.key === catalogId) {
          // 找到 catalog，继续查找数据卷
          if (node.children) {
            for (const child of node.children) {
              if (child.key === volumeKey) {
                // 找到数据卷分类，继续查找具体的 volume
                if (child.children) {
                  for (const volume of child.children) {
                    if (volume.id === Number(volumeId)) {
                      return [...currentPath, child.title, volume.title];
                    }
                  }
                }
              }
            }
          }
        }

        if (node.children) {
          const found = findPath(node.children, currentPath);
          if (found) return found;
        }
      }
      return null;
    };

    const pathArray = findPath(originalTreeData);
    return pathArray ? pathArray.join('/') : '';
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
      // 重置初始化标志
      initializedRef.current = false;
      pathMapInitializedRef.current = false;
    } else {
      // modal 关闭时重置状态
      setActiveTab('all');
      setSelectedCurrent(1);
      setSelectedPageSize(10);
      initializedRef.current = false;
      pathMapInitializedRef.current = false;
      prevInitialSelectedDataRef.current = [];
    }
  }, [visible]);

  // 同步外部传入的 initialSelectedData 到内部状态（只在 modal 打开时或数据真正改变时）
  useEffect(() => {
    if (!visible) {
      initializedRef.current = false;
      prevInitialSelectedDataRef.current = [];
      return;
    }
  }, [visible]);

  // 当树形数据加载完成后，初始化已选数据的路径映射（只在树形数据加载完成且已选数据存在时执行一次）
  useEffect(() => {
    if (
      !visible ||
      !initializedRef.current ||
      originalTreeData.length === 0 ||
      !initialSelectedData ||
      initialSelectedData.length === 0 ||
      pathMapInitializedRef.current
    ) {
      return;
    }

    const newPathMap = new Map<string, string>();
    initialSelectedData.forEach((item) => {
      // 如果数据中有 dir_name，尝试解析路径
      if (item.dir_name) {
        const path = getDirectoryPath(item.dir_name);
        if (path) {
          newPathMap.set(item.execution_id || item.run_id, path);
        }
      }
    });
    if (newPathMap.size > 0) {
      setSelectedDataPathMap(newPathMap);
    }
    pathMapInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, originalTreeData.length]);

  // 编辑模式已选数据不可再选
  const disabledSelectedRowKeys = useMemo(() => {
    if (type === 'edit') {
      return requirementDetail?.label_data_set?.map(
        (item) => item?.execution_id || item?.run_id || item?.id
      );
    }
    return [];
  }, [type, requirementDetail]);

  // 树的内容
  const renderTreeContent = () => {
    return (
      <div className="arco-tree">
        {treeData && treeData.length > 0 ? (
          <Tree
            actionOnClick={['select', 'expand']}
            blockNode={true}
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
              if (e?.node?.props?.dataRef?.level === 3) {
                setCurrent(1);
                setPageSize(10);
                setCheckedKeys([value[0]?.split(',')?.[2]]);
                setDir_path(value);
                // 获取目录路径并更新映射
                const path = getDirectoryPath(value[0] || '');
                const newPathMap = new Map(selectedDataPathMap);
                // 更新当前选中数据的路径映射
                const getUniqueId = (item: any) =>
                  item.execution_id || item.run_id || item.id;
                selectedRowsContent.forEach((item) => {
                  const itemId = getUniqueId(item);
                  if (!newPathMap.has(itemId)) {
                    newPathMap.set(itemId, path);
                  }
                });
                setSelectedDataPathMap(newPathMap);
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
      sortDirections: ['ascend' as const, 'descend' as const]
    },
    {
      title: '载入结束时间',
      dataIndex: 'end_time',
      width: 180,
      sorter: (a, b) => dayjs(a.end_time).unix() - dayjs(b.end_time).unix(),
      sortDirections: ['ascend' as const, 'descend' as const]
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

  // 已选数据的表格列定义
  const selectedColumns = [
    {
      title: '目录名称',
      dataIndex: 'dir_path',
      ellipsis: true,
      width: 230,
      render: (text: string, record: any) => {
        const recordId = record.execution_id || record.run_id || record.id;
        const path = selectedDataPathMap.get(recordId) || text || '';
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
      dataIndex: 'start_time',
      width: 180,
      sorter: (a, b) => dayjs(a.start_time).unix() - dayjs(b.start_time).unix(),
      sortDirections: ['ascend' as const, 'descend' as const],
      render: (text) => formatDateTime(text)
    },
    {
      title: '载入结束时间',
      dataIndex: 'end_time',
      width: 180,
      sorter: (a, b) => dayjs(a.end_time).unix() - dayjs(b.end_time).unix(),
      sortDirections: ['ascend' as const, 'descend' as const],
      render: (text) => formatDateTime(text)
    },
    {
      title: '数据量',
      dataIndex: 'load_num',
      ellipsis: true,
      width: 100
    },
    {
      title: '创建人',
      dataIndex: 'upload_user',
      ellipsis: true,
      width: 100
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 100,
      render: (_: any, record: any) => {
        return (
          <Link
            onClick={() => {
              handleRemoveSelected(record.execution_id);
            }}
          >
            移除
          </Link>
        );
      }
    }
  ];

  // 移除已选数据
  const handleRemoveSelected = (executionId: string) => {
    const getUniqueId = (item: any) =>
      item.execution_id || item.run_id || item.id;
    const newSelectedData = selectedRowsContent.filter(
      (item) => getUniqueId(item) !== executionId
    );
    const newSelectedKeys = newSelectedData.map((item) => getUniqueId(item));
    const newPathMap = new Map(selectedDataPathMap);
    newPathMap.delete(executionId);

    setSelectedRowsContent(newSelectedData);
    setSelectedRowKeys(newSelectedKeys);
    setSelectedDataPathMap(newPathMap);
    getChildTableSelectData(newSelectedData, dir_path);
  };
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
    if (checkedKeys?.length > 0) {
      settableLoading(true);
      getTableData();
    }
  }, [checkedKeys, current, pageSize]);
  // 处理日期范围变化
  const handleDateChange = (value) => {
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

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onClose}
      alignCenter={true}
      escToExit={false}
      maskClosable={false}
      className="fullscreen-modal"
      style={{ width: '960px', height: '800px', overflow: 'hidden' }}
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
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        type="line"
        style={{ marginTop: '-16px' }}
      >
        <Tabs.TabPane title="全部数据" key="all">
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
                    getTableData();
                    // setDateRange([]);
                  }}
                />
                {/* <div className="form-option">
                </div> */}
              </div>
              <Table
                ref={tableRef}
                rowKey={(record: any) =>
                  record.execution_id || record.run_id || record.id
                }
                columns={columns}
                data={tableData}
                loading={tableLoading}
                pagination={false}
                border={false}
                noDataElement={noDataElement({
                  description: '暂无数据'
                })}
                rowSelection={{
                  checkboxProps: (record) => {
                    return {
                      disabled: disabledSelectedRowKeys.includes(
                        record?.execution_id || record?.run_id || record?.id
                      )
                    };
                  },
                  selectedRowKeys: selectedRowKeys,
                  preserveSelectedRowKeys: true,
                  onChange: (selectedRowKeys, selectedRows) => {
                    // 合并新旧选中数据并处理取消选中
                    const mergedMap = new Map<string, any>();
                    const currentPath = getDirectoryPath(
                      String(dir_path[0] || '')
                    );

                    // 辅助函数：获取唯一标识符
                    const getUniqueId = (item: any) => {
                      return item.execution_id || item.run_id || item.id;
                    };

                    // 1. 保留仍处于选中状态的现有数据 - 使用 execution_id/run_id 进行过滤
                    selectedRowsContent
                      .filter((item) => {
                        const itemId = getUniqueId(item);
                        return selectedRowKeys.includes(itemId);
                      })
                      .forEach((item) => {
                        const itemId = getUniqueId(item);
                        mergedMap.set(itemId, item);
                      });

                    // 2. 添加当前页新选中数据 - 统一数据格式并确保有 execution_id
                    selectedRows.forEach((item: any) => {
                      const itemId = getUniqueId(item);
                      // 统一数据格式，确保有 execution_id 字段
                      const normalizedItem = {
                        ...item,
                        execution_id:
                          item.execution_id || item.run_id || item.id,
                        start_time: item.start_time || item.load_start_time,
                        end_time: item.end_time || item.load_end_time,
                        load_num: item.load_num,
                        upload_user: item.upload_user || item.create_by
                      };
                      mergedMap.set(itemId, normalizedItem);
                    });

                    // 3. 更新状态
                    const mergedRows = Array.from(mergedMap.values());
                    const newPathMap = new Map(selectedDataPathMap);

                    // 更新路径映射：为新选中的数据添加路径，移除取消选中的数据路径
                    mergedRows.forEach((item) => {
                      const itemId = getUniqueId(item);
                      if (!newPathMap.has(itemId) && currentPath) {
                        newPathMap.set(itemId, currentPath);
                      }
                    });
                    // 移除取消选中的数据路径
                    selectedRowsContent.forEach((item) => {
                      const itemId = getUniqueId(item);
                      if (!mergedRows.find((r) => getUniqueId(r) === itemId)) {
                        newPathMap.delete(itemId);
                      }
                    });

                    setSelectedRowsContent(mergedRows);
                    setSelectedRowKeys(
                      mergedRows.map((item) => getUniqueId(item))
                    );
                    setSelectedDataPathMap(newPathMap);
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
        </Tabs.TabPane>
        <Tabs.TabPane title="已选数据" key="selected">
          <div className="detail-modal-content" style={{ border: 'none' }}>
            <div
              className="content-table no-scroll"
              style={{ width: '100%', paddingLeft: '12px' }}
            >
              <Table
                rowKey={(record: any) =>
                  record.execution_id || record.run_id || record.id
                }
                columns={selectedColumns}
                data={selectedRowsContent.slice(
                  (selectedCurrent - 1) * selectedPageSize,
                  selectedCurrent * selectedPageSize
                )}
                loading={false}
                pagination={false}
                border={false}
                scroll={{ y: false }}
                noDataElement={noDataElement({
                  description: '暂无已选数据'
                })}
              />
              {selectedRowsContent && selectedRowsContent.length > 0 && (
                <Pagination
                  current={selectedCurrent}
                  pageSize={selectedPageSize}
                  onPageSizeChange={(pageSize) => {
                    setSelectedPageSize(pageSize);
                    setSelectedCurrent(1);
                  }}
                  onChange={(page) => {
                    setSelectedCurrent(page);
                  }}
                  sizeOptions={[10, 20, 50, 100]}
                  showTotal
                  total={selectedRowsContent.length}
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
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export { DataSourceModal };
