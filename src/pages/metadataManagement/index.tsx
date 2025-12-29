import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Menu,
  Message,
  Modal,
  Pagination,
  PaginationProps,
  Select,
  Table
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import noDataElement from '@/components/no-data';
import { useUserInfo } from '@/store/userInfoStore';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { WORKFLOW_LIST_PERMISSIONS } from '@/config/permissions';
import ColumnSettingIcon from '@/assets/metadata/column-setting.svg';
import StorageIcon from '@/assets/metadata/storage.svg';
import { IconPlus, IconRefresh } from '@arco-design/web-react/icon';
import { getColumns, getColumnsSetting } from './getColumns';
import ColumnSettingModal, {
  ColumnField
} from '../dataAsset/components/ColumnSettingModal';
import SearchArea from './components/SearchArea';
import {
  createMetadataDorisDatabase,
  createMetadataDorisTable,
  createMetadataIcebergDatabase,
  createMetadataIcebergTable,
  listMetadataDataSource,
  listMetadataDorisDatabaseName,
  listMetadataDorisTable,
  listMetadataIcebergDatabaseName,
  listMetadataIcebergTable,
  listMetadataMilvusCollection,
  listMetadataMinioBucket,
  MetadataMenuItem
} from '@/api/metadata';
import styles from './index.module.scss';
import { useParams } from '@/utils/url';

enum MetadataType {
  Iceberg = 'ICEBERG',
  Doris = 'DORIS',
  Kafka = 'KAFKA',
  MinIO = 'MINIO',
  Milvus = 'MILVUS'
}

interface RangeFilter {
  field: string;
  start: string;
  end: string;
}

export default function MetadataManagement() {
  const userInfo = useUserInfo();
  const history = useHistory();
  const urlMetadataType = useParams('metadataType');
  const MenuItem = Menu.Item;
  const TextArea = Input.TextArea;

  // 初始化元数据菜单数据
  const [metadataMenuData, setMetadataMenuData] = useState([]);
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState({
    filters: {},
    range: [] as RangeFilter[]
  });
  // 初始化元数据列表数据
  const [metadataData, setMetadataData] = useState([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 总数据量
  const [total, setTotal] = useState(10);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState({
    run_cycle: '',
    sort: ''
  });
  // 初始化筛选的元数据类型
  const [activeMetadataType, setActiveMetadataType] = useState<
    MetadataType | string
  >(urlMetadataType || MetadataType.Iceberg);
  // 初始化筛选的元数据ID
  const [activeMetadataId, setActiveMetadataId] = useState<number | null>(null);
  // 初始化更新时间
  const [updateTime, setUpdateTime] = useState('');
  // 列设置弹窗是否打开
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  // 初始化表格列
  const [columns, setColumns] = useState<ColumnProps[]>([]);
  // 列设置弹窗选中的列
  const [selectedColumns, setSelectedColumns] = useState<ColumnField[]>(
    getColumnsSetting(activeMetadataType)
  );
  // 创建数据库弹窗是否打开
  const [createTableModalOpen, setCreateTableModalOpen] = useState(false);
  // 初始化数据库名称
  const [databaseName, setDatabaseName] = useState('');
  // 创建物理数据库弹窗是否打开
  const [createPhysicalTableModalOpen, setCreatePhysicalTableModalOpen] =
    useState(false);
  // 初始化iceberg数据库名称下拉列表
  const [databaseNameOptions, setDatabaseNameOptions] = useState<
    { databaseName: string; id: number }[]
  >([]);

  // 创建数据库弹窗表单
  const [tableForm] = Form.useForm();
  // 创建物理数据库弹窗表单
  const [physicalTableForm] = Form.useForm();

  useEffect(() => {
    setColumns(
      getColumns(
        selectedColumns,
        viewDetail,
        current,
        pageSize
      ) as ColumnProps[]
    );
  }, [activeMetadataType, selectedColumns]);

  useEffect(() => {
    getMenuData();
  }, []);

  const getMenuName = (type: string) => {
    switch (type) {
      case MetadataType.Iceberg:
        return '数据湖';
      case MetadataType.Doris:
        return '在线分析库';
      case MetadataType.Kafka:
        return 'Kafka';
      case MetadataType.MinIO:
        return '对象存储';
      case MetadataType.Milvus:
        return '向量数据库';
      default:
        return type;
    }
  };

  // 组件初始化
  useEffect(() => {
    if (userInfo) getList();
  }, [userInfo, current, pageSize, searchValue, sortValue, activeMetadataType]);

  const getMenuData = async () => {
    const res = await listMetadataDataSource();
    if (res.status === 200 && res.code === '') {
      if (res.data.data) {
        setMetadataMenuData(res.data.data);
        setActiveMetadataType(
          urlMetadataType ||
            res.data.data[0]?.datasourceType ||
            MetadataType.Iceberg
        );
        setActiveMetadataId(Number(res.data.data[0]?.id) || null);
        setUpdateTime(res.data.data[0]?.updateTime || '');
      }
    } else {
      Message.error(res.message || '获取元数据菜单数据失败');
    }
  };

  const getList = async () => {
    setLoading(true);
    try {
      const params = {
        pageNum: current,
        pageSize: pageSize,
        ...searchValue
      };
      const res =
        activeMetadataType === MetadataType.Iceberg
          ? await listMetadataIcebergTable(params)
          : activeMetadataType === MetadataType.MinIO
            ? await listMetadataMinioBucket(params)
            : activeMetadataType === MetadataType.Milvus
              ? await listMetadataMilvusCollection(params)
              : await listMetadataDorisTable(params);
      if (res.status === 200 && res.code === '') {
        if (res.data.data?.list) {
          setMetadataData(res.data.data.list);
          setCurrent(res.data.data?.pageNum);
          setPageSize(res.data.data?.pageSize);
          setTotal(res.data.data?.total || 10);
        }
      } else {
        Message.error(res.message || '获取元数据列表数据失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 查看详情
  const viewDetail = (id) => {
    history.push(
      `/tenant/compute/modaforge/metadataManagement/detail?id=${id}&metadataType=${activeMetadataType}`
    );
  };

  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata = {
      run_cycle:
        filters.run_cycle === undefined ? '' : filters.run_cycle.join(','),
      is_online:
        filters.is_online === undefined ? '' : filters.is_online.join(','),
      sort:
        sorter.direction === undefined
          ? ''
          : sorter.direction === 'ascend'
            ? 'create_time:ASC'
            : 'create_time:DESC'
    };

    setSortValue(sortdata);
  };

  // 搜索表单提交
  const handleSearch = (values: any) => {
    console.log(values, 'values');
    // setCurrent(1);
  };

  // 处理字段搜索
  const handleFieldSearch = (fieldValues, commonSearch: string) => {
    console.log(fieldValues, commonSearch);
    const newSearchValue = {
      filters: {},
      range: [] as RangeFilter[]
    };
    fieldValues.forEach((item) => {
      if (item.type === 'string') {
        newSearchValue.filters[item.nameEn] = item.searchContent[0];
      } else if (item.type === 'datetime') {
        newSearchValue.range.push({
          field: item.nameEn,
          start: item.searchContent[0].split('_')[0],
          end: item.searchContent[0].split('_')[1]
        });
      }
    });
    setSearchValue(newSearchValue);
    setCurrent(1);
  };

  // 处理重置
  const handleReset = () => {
    setSearchValue({
      filters: {},
      range: [] as RangeFilter[]
    });
    setCurrent(1);
  };

  const columnSettingsFields: ColumnField[] =
    getColumnsSetting(activeMetadataType);

  // 列设置弹窗回调
  const handleModalOk = (
    selectedIds: string[],
    displayFields: ColumnField[]
  ) => {
    const selectedFields = selectedIds
      .map((nameEn) =>
        displayFields.find(
          (field) => field.nameEn === nameEn || field.id === nameEn
        )
      )
      .filter(Boolean) as ColumnField[];
    setSelectedColumns(selectedFields);
    setColumnModalOpen(false);
  };

  const handleModalCancel = () => setColumnModalOpen(false);
  const handleColumnChange = (list: ColumnField[]) => {
    console.log('列设置变化:', list);
  };

  // 创建数据库弹窗回调
  const handleCreateTableModalOk = () => {
    tableForm.validate().then(async (values) => {
      console.log(values, '创建数据库');
      const params = {
        instanceId: activeMetadataId,
        databaseName: values.tableName,
        ddl: values.ddl
      };
      if (activeMetadataType === MetadataType.Iceberg) {
        const res = await createMetadataIcebergDatabase(params);
        if (res.status === 200 && res.code === '') {
          if (res.data.success) {
            Message.success('创建数据库成功');
          } else Message.error(res.data.msg || '创建数据库失败');
        } else {
          Message.error(res.message || '创建数据库失败');
        }
      } else {
        const res = await createMetadataDorisDatabase(params);
        if (res.status === 200 && res.code === '') {
          if (res.data.success) {
            Message.success('创建数据库成功');
          } else Message.error(res.data.msg || '创建数据库失败');
        } else {
          Message.error(res.message || '创建数据库失败');
        }
      }

      tableForm.resetFields();
      setCreateTableModalOpen(false);
    });
  };

  const handleCreatePhysicalTable = async () => {
    if (activeMetadataType === MetadataType.Iceberg) {
      const res = await listMetadataIcebergDatabaseName({
        instanceId: activeMetadataId
      });
      if (res.status === 200 && res.code === '') {
        if (res.data.success) {
          setDatabaseNameOptions(res.data?.data || []);
        } else Message.error(res.data.msg || '获取数据库列表失败');
      } else {
        Message.error(res.message || '获取数据库列表失败');
      }
    } else {
      const res = await listMetadataDorisDatabaseName({
        instanceId: activeMetadataId
      });
      if (res.status === 200 && res.code === '') {
        if (res.data.success) {
          setDatabaseNameOptions(res.data?.data || []);
        } else Message.error(res.data.msg || '获取数据库列表失败');
      } else {
        Message.error(res.message || '获取数据库列表失败');
      }
    }
    physicalTableForm.setFieldsValue({
      ddl:
        activeMetadataType === MetadataType.Iceberg
          ? `CREATE TABLE iceberg_db_example.iceberg_table_example (
  id INT COMMENT '主键ID',
  name STRING COMMENT '示例1',
  create_time TIMESTAMP COMMENT '创建时间'
)
USING iceberg
COMMENT '创建Iceberg表示例'`
          : `CREATE TABLE IF NOT EXISTS db_example.table_example (
  \`id_example\` BIGINT COMMENT '主键ID',
  \`name_example\` VARCHAR(64) COMMENT '姓名示例',
  \`create_time\` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  \`update_time\` DATETIME DEFAULT CURRENT_TIMESTAMP  COMMENT '更新时间',
  \`create_by\` VARCHAR(64) COMMENT '创建人'
) ENGINE=OLAP
DUPLICATE KEY(\`id_example\`)
COMMENT '表描述'
DISTRIBUTED BY HASH(\`id_example\`) BUCKETS 10
PROPERTIES (
  "replication_allocation" = "tag.location.default: 1"
)`
    });
    setCreatePhysicalTableModalOpen(true);
  };

  // 创建物理数据库弹窗回调
  const handleCreatePhysicalTableModalOk = () => {
    physicalTableForm.validate().then(async (values) => {
      const params = {
        databaseId: values.tableType,
        ddl: values.ddl
      };

      if (activeMetadataType === MetadataType.Iceberg) {
        const res = await createMetadataIcebergTable(params);
        if (res.status === 200 && res.code === '') {
          if (res.data.success) {
            Message.success('创建物理表成功');
          } else Message.error(res.data.msg || '创建物理表失败');
        } else {
          Message.error(res.message || '创建物理表失败');
        }
      } else {
        const res = await createMetadataDorisTable(params);
        if (res.status === 200 && res.code === '') {
          if (res.data.success) {
            Message.success('创建物理表成功');
          } else Message.error(res.data.msg || '创建物理表失败');
        } else {
          Message.error(res.message || '创建物理表失败');
        }
      }
      setCreatePhysicalTableModalOpen(false);
      physicalTableForm.resetFields();
    });
  };

  const handleToDataApi = () => {
    history.push(`/tenant/compute/modaforge/dataApi`);
  };

  return (
    <div className={styles['metadataManagement']}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>元数据管理</h1>
      <div className="mt-4 flex">
        <div className={styles['leftBox']}>
          <Menu
            defaultSelectedKeys={[activeMetadataType]}
            onClickMenuItem={(key, event, keyPath) => {
              setSelectedColumns(getColumnsSetting(key));
              setActiveMetadataType(key);
              const selectMenuItem =
                metadataMenuData.find(
                  (item: MetadataMenuItem) => item?.datasourceType === key
                ) || ({} as MetadataMenuItem);
              setUpdateTime(selectMenuItem?.updateTime || '');
              setActiveMetadataId(selectMenuItem?.id || null);
            }}
          >
            {metadataMenuData.map((item: MetadataMenuItem) => (
              <MenuItem key={item?.datasourceType}>
                {getMenuName(item?.datasourceType)}
              </MenuItem>
            ))}
          </Menu>
        </div>
        <div className={styles['rightBox']}>
          <SearchArea
            fields={selectedColumns}
            onMainSearch={handleSearch}
            onFieldSearch={handleFieldSearch}
            onReset={handleReset}
          />
          <div className="mb-3 mt-4 flex items-center justify-between">
            <h1 className="text-base font-semibold">{`数据列表(${total})`}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6E7B8D]">{updateTime} 更新</span>
              {/* <Button
                className={styles['refreshBtn']}
                icon={<IconRefresh className="text-[#1E293B]" />}
              /> */}
              {(activeMetadataType === MetadataType.Iceberg ||
                activeMetadataType === MetadataType.Doris) && (
                <>
                  <Button
                    className={styles['refreshBtn']}
                    icon={<StorageIcon />}
                    onClick={() => {
                      handleToDataApi();
                    }}
                  >
                    表转API
                  </Button>

                  <Button
                    className={styles['refreshBtn']}
                    icon={<IconPlus className="text-[#1E293B]" />}
                    onClick={() => {
                      tableForm.setFieldsValue({
                        ddl:
                          activeMetadataType === MetadataType.Iceberg
                            ? `CREATE DATABASE IF NOT EXISTS iceberg_db_example COMMENT 'Iceberg创建库示例'`
                            : `CREATE DATABASE IF NOT EXISTS db_example`
                      });
                      setCreateTableModalOpen(true);
                    }}
                  >
                    创建数据库
                  </Button>
                  <Button
                    className={styles['refreshBtn']}
                    icon={<IconPlus className="text-[#1E293B]" />}
                    onClick={() => {
                      handleCreatePhysicalTable();
                    }}
                  >
                    创建物理表
                  </Button>
                </>
              )}
              <Button
                className={styles['refreshBtn']}
                icon={<ColumnSettingIcon />}
                onClick={() => setColumnModalOpen(true)}
              >
                列设置
              </Button>
            </div>
          </div>
          <Table
            border={false}
            columns={columns}
            data={metadataData}
            pagination={false}
            noDataElement={noDataElement({
              description: '暂无数据',
              perms: WORKFLOW_LIST_PERMISSIONS.CREATE
            })}
            rowKey="id"
            loading={loading}
            onChange={(pagination, sorter, filters) =>
              // @ts-expect-error
              handleTableChange(pagination, sorter, filters)
            }
            scroll={{
              x: true
            }}
          />
          {/* 分页 */}
          {metadataData && metadataData.length > 0 && (
            <Pagination
              current={current}
              pageSize={pageSize}
              onPageSizeChange={(pageSize) => {
                setPageSize(pageSize);
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
              style={{ justifyContent: 'flex-end', marginTop: '10px' }}
            />
          )}
        </div>
      </div>

      {/* 列设置弹窗 */}
      <ColumnSettingModal
        visible={columnModalOpen}
        fields={
          columnSettingsFields.length > 0 ? columnSettingsFields : undefined
        }
        isShowEnum={false}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        onChange={handleColumnChange}
      />
      {/* 创建数据库弹窗 */}
      <Modal
        className={styles.createTableModal}
        visible={createTableModalOpen}
        title="创建数据库"
        okText="执行DDL语句"
        onOk={() => tableForm?.submit()}
        onCancel={() => {
          setCreateTableModalOpen(false);
          tableForm?.resetFields();
        }}
      >
        <Form
          form={tableForm}
          onSubmit={handleCreateTableModalOk}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
        >
          <Form.Item
            field="tableType"
            label="数据库类型"
            rules={[{ required: true, message: '请选择数据库类型' }]}
            initialValue={activeMetadataType}
          >
            <Select
              placeholder="请选择数据库类型"
              options={[
                {
                  label: getMenuName(MetadataType.Iceberg),
                  value: MetadataType.Iceberg
                },
                {
                  label: getMenuName(MetadataType.Doris),
                  value: MetadataType.Doris
                }
              ]}
              disabled
            />
          </Form.Item>
          <Form.Item
            field="tableName"
            label="数据库名称"
            rules={[{ required: true, message: '请输入数据库名称' }]}
          >
            <Input placeholder="请输入数据库名称" />
          </Form.Item>
          <Form.Item
            field="ddl"
            label="DDL语句"
            rules={[
              {
                required: true,
                message: '请输入DDL语句'
              }
            ]}
          >
            <TextArea
              style={{ minHeight: 400 }}
              placeholder="请先选择数据库类型，并输入数据库名称"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建物理表弹窗 */}
      <Modal
        className={styles.createTableModal}
        visible={createPhysicalTableModalOpen}
        title="创建物理表"
        okText="执行DDL语句"
        onOk={() => physicalTableForm?.submit()}
        onCancel={() => {
          setCreatePhysicalTableModalOpen(false);
          physicalTableForm?.resetFields();
        }}
      >
        <Form
          form={physicalTableForm}
          onSubmit={handleCreatePhysicalTableModalOk}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
        >
          <Form.Item
            field="tableType"
            label="保存位置"
            rules={[{ required: true, message: '请选择保存位置' }]}
          >
            <Select
              placeholder="请选择数据库"
              className={styles.selectTable}
              style={{ display: 'flex', alignItems: 'center' }}
              addBefore={
                <Select
                  placeholder="请选择数据库类型"
                  style={{ width: 160 }}
                  className={styles.selectAddBefore}
                  value={activeMetadataType}
                  disabled
                  options={[
                    {
                      label: getMenuName(MetadataType.Iceberg),
                      value: MetadataType.Iceberg
                    },
                    {
                      label: getMenuName(MetadataType.Doris),
                      value: MetadataType.Doris
                    }
                  ]}
                />
              }
            >
              {databaseNameOptions.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.databaseName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            field="ddl"
            label="DDL语句"
            rules={[
              {
                required: true,
                message: '请输入DDL语句'
              }
            ]}
          >
            <TextArea
              style={{ minHeight: 400 }}
              placeholder="请先选择保存位置"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
