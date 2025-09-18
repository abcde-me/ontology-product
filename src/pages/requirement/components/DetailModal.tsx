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
  Message,
  Empty
} from '@arco-design/web-react';
import { getCatalogList } from '@/api/dataCatalog';
import { getAnnotationTabledData } from '@/api/dataAnnotation';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import './DetailModal.scss';
import { sunburst } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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
const DataSourceModal: React.FC<DataSourceModalProps> = ({
  fileType,
  visible,
  type,
  onClose,
  title = '数据源',
  getChildTableSelectData,
  initialSelectedData = [], // 接收初始数据
  getDetailObj
}) => {
  const FormItem = Form.Item;
  const [form] = Form.useForm();
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
  const [tableLoading, settableLoading] = useState(false);
  const [dir_path, setDir_path] = useState<React.Key[]>(['']);
  const time = Form.useWatch('time', form);

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

  useEffect(() => {
    let newTreeData: any[] = [];
    try {
      getCatalogList({
        root_type: 1
      }).then((res) => {
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
                children:
                  item?.children?.数据卷 && item.children.数据卷.length > 0
                    ? [
                        {
                          level: 2,
                          title: '数据卷',
                          key: String(item.id) + '数据卷',
                          allowClick: false,
                          children: item.children.数据卷.map((subItem) => ({
                            title: subItem.name,
                            key: `${item.id},${item.id}数据卷,${subItem.id}`,
                            id: subItem?.id,
                            level: 3
                          }))
                        }
                      ]
                    : undefined
              }
            : { title: item.name, key: item.id };
        });
        setTreeData(newTreeData);
      });
    } catch (err) {}
  }, [visible]);

  // 树的内容
  const renderTreeContent = () => {
    return (
      <div>
        {treeData && treeData.length > 0 ? (
          <Tree
            defaultExpandedKeys={getDetailObj?.label_data_set?.[0]?.dir_name.split(
              ','
            )}
            defaultSelectedKeys={[getDetailObj?.label_data_set?.[0]?.dir_name]}
            autoExpandParent={false}
            treeData={treeData}
            // checkStrictly={checkStrictly}
            onSelect={(value, e) => {
              if (e?.node?.props?.dataRef?.level === 3 && type !== 'detail') {
                setCurrent(1);
                setPageSize(10);
                setCheckedKeys([value[0]?.split(',')?.[2]]);
                setDir_path(value);
              }
            }}
          />
        ) : (
          <Empty description="暂无数据" />
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
      sorter: true,
      sortDirections: ['ascend' as const, 'descend' as const]
    },
    {
      title: '载入结束时间',
      dataIndex: 'end_time',
      width: 180,
      sorter: true,
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
      dataIndex: 'upload_user',
      ellipsis: true,
      width: 100
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
      page_size: pageSize,
      data_path_id: Number(checkedKeys), // 优先使用选中ID 后期改成selectedKey
      start: dateRange[0], //后期改成startTime
      end: dateRange[1], //后期改成endTime
      file_type: fileType, // 使用筛选条件中的文件类型
      sort_by: 'start_time',
      sort: 'asc'
    };
    try {
      const res = await getAnnotationTabledData(sourceParams);
      if (res.status === 200) {
        setTableData(res?.data?.items);
        setCurrent(res?.data?.page);
        setPageSize(res?.data?.page_size);
        setTotal(res?.data?.total);
        settableLoading(false);
      }
    } catch (error) {
      settableLoading(false);
    } finally {
      settableLoading(false);
    }
  };
  useEffect(() => {
    settableLoading(true);
    getTableData();
  }, [checkedKeys, current, pageSize]);
  const [dateRange, setDateRange] = useState([]); // 存储选择的日期范围 [start, end]
  // 处理日期范围变化
  const handleDateChange = (value) => {
    setDateRange(value);
    // 当选择了完整的日期范围（开始和结束），执行筛选
    if (value && value.length === 2) {
      const [start, end] = value;
      // 格式化日期为 YYYY-MM-DD（确保与数据格式一致）
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');
      // 筛选数据：createTime 在 [startStr, endStr] 之间
      const filteredData = tableData.filter((item) => {
        return item.createTime >= startStr && item.createTime <= endStr;
      });
      setTableData(filteredData);
    } else if (value === null || value === undefined || value === '') {
      // 清空日期选择时，恢复原始数据
      setTableData(tableData);
    }
  };
  const getTableSelectContent = () => {
    getChildTableSelectData(selectedRowsContent, dir_path);
    onClose();
  };

  useEffect(() => {
    if (type === 'detail') {
      setTableData(getDetailObj?.label_data_set);
      setSelectedRowKeys(
        getDetailObj?.label_data_set &&
          getDetailObj?.label_data_set?.map((item) => item.id)
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
      style={{ width: '90vw', overflowY: 'auto' }}
      footer={
        <Button
          disabled={type === 'detail'}
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
          <div className="content-table-form">
            <Form className="form-option" autoComplete="off" layout="inline">
              <div className="form-inputs">
                <FormItem field="time">
                  <DatePicker.RangePicker
                    onChange={handleDateChange}
                    style={{ width: 350 }}
                  />
                </FormItem>
              </div>
            </Form>
          </div>
          <Table
            ref={tableRef}
            rowKey="execution_id"
            columns={columns}
            data={tableData}
            loading={tableLoading}
            pagination={false}
            rowSelection={{
              selectedRowKeys: selectedRowKeys,
              preserveSelectedRowKeys: true,
              // checkboxProps: (record) => {
              //   return {
              //     disabled: type === 'detail'
              //   };
              // },
              onChange: (selectedRowKeys, selectedRows) => {
                // 合并新旧选中数据并处理取消选中
                const mergedMap = new Map<string, any>();

                // 1. 保留仍处于选中状态的现有数据
                selectedRowsContent
                  .filter((item) => selectedRowKeys.includes(item.id))
                  .forEach((item) => mergedMap.set(item.id, item));

                // 2. 添加当前页新选中数据
                selectedRows.forEach((item: any) =>
                  mergedMap.set(item.id, item)
                );

                // 3. 更新状态
                const mergedRows = Array.from(mergedMap.values());
                // if (mergedRows.length <= 200) {
                setSelectedRowsContent(mergedRows);
                setSelectedRowKeys(mergedRows.map((item) => item.execution_id));
                // } else {
                // Message.error('选中的数量不能超过200条');
                // }
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

export { DataSourceModal };
