import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Menu,
  Modal,
  Pagination,
  PaginationProps,
  Select,
  Table
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import noDataElement from '@/components/no-data';
import { getWorkflowList } from '@/api/workflowList';
import { useUserInfo } from '@/store/userInfoStore';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { WORKFLOW_LIST_PERMISSIONS } from '@/config/permissions';
import { openNewPage } from '@/utils/env';
import ColumnSettingIcon from '@/assets/metadata/column-setting.svg';
import StorageIcon from '@/assets/metadata/storage.svg';
import { IconPlus, IconRefresh, IconSearch } from '@arco-design/web-react/icon';
import { getColumns, getColumnsSetting } from './getColumns';
import ColumnSettingModal, {
  ColumnField
} from '../dataAsset/components/ColumnSettingModal';
import SearchArea from './components/SearchArea';
import styles from './index.module.scss';

enum MetadataType {
  Iceberg = 'Iceberg',
  Doris = 'Doris',
  MinIO = 'MinIO',
  Milvus = 'Milvus'
}

export default function MetadataManagement() {
  const userInfo = useUserInfo();
  const history = useHistory();
  const MenuItem = Menu.Item;
  const TextArea = Input.TextArea;

  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化工作流列表数据
  const [workflowData, setWorkflowData] = useState([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 总数据量
  const [total, setTotal] = useState(10);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 区分是否点击按钮清空搜索框
  const [isClickClear, setIsClickClear] = useState(false);
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState({
    run_cycle: '',
    sort: ''
  });
  // 初始化筛选的元数据类型
  const [activeMetadataType, setActiveMetadataType] = useState<
    MetadataType | string
  >(MetadataType.Iceberg);
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
  // 创建物理数据库弹窗是否打开
  const [createPhysicalTableModalOpen, setCreatePhysicalTableModalOpen] =
    useState(false);

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

  // 组件初始化
  useEffect(() => {
    if (userInfo) getList();
  }, [userInfo, current, pageSize, sortValue]);

  // 清空搜索框
  useEffect(() => {
    if (isClickClear && searchValue === '') {
      getList();
      setIsClickClear(false);
    }
  }, [isClickClear]);

  const getList = async () => {
    setLoading(true);
    try {
      const params: any = {
        uid: userInfo?.id,
        search_content: searchValue,
        page: current, //第几页
        page_size: pageSize, //每页个数
        ...sortValue
      };
      const res = await getWorkflowList(params);
      if (res.status === 200 && res.data) {
        setWorkflowData(res.data.list);
        setCurrent(res.data.page_info?.page);
        setPageSize(res.data.page_info?.page_size);
        setTotal(res.data.page_info?.total || 10);
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
    console.log(values, 'vvvvv');
    // setSearchValue(values.search_content);
    // setCurrent(1);
  };

  // 处理字段搜索
  const handleFieldSearch = (fieldValues, commonSearch: string) => {
    console.log(fieldValues, commonSearch);
  };

  // 处理重置
  const handleReset = () => {
    // setSearchParams({ ...searchParams, fieldSearch: [], commonSearch: '' });
    // setCurrentPage(1);
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

  // 筛选元数据类型操作
  const handleTableTypeChange = (key: MetadataType | string) => {
    console.log(key, 'kkkkkk');
    tableForm.setFieldsValue({
      ddl: key
    });
  };

  // 创建数据库弹窗回调
  const handleCreateTableModalOk = () => {
    tableForm.validate().then((values) => {
      console.log(values, '创建数据库');
      setCreateTableModalOpen(false);
      tableForm.resetFields();
    });
  };

  // 创建物理数据库弹窗回调
  const handleCreatePhysicalTableModalOk = () => {
    physicalTableForm.validate().then((values) => {
      console.log(values, '创建物理数据库');
      setCreatePhysicalTableModalOpen(false);
      physicalTableForm.resetFields();
    });
  };

  return (
    <div className={styles['metadataManagement']}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>元数据管理</h1>
      <div className="mt-4 flex">
        <div className={styles['leftBox']}>
          <Menu
            defaultSelectedKeys={[activeMetadataType]}
            onClickMenuItem={(key) => {
              setSelectedColumns(getColumnsSetting(key));
              setActiveMetadataType(key);
            }}
          >
            <MenuItem key="Iceberg">数据湖</MenuItem>
            <MenuItem key="Doris">在线分析库</MenuItem>
            <MenuItem key="MinIO">对象存储</MenuItem>
            <MenuItem key="Milvus">向量数据库</MenuItem>
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
            <h1 className="text-base font-semibold">数据列表(500)</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6E7B8D]">
                2025-12-12 00:00:00 更新
              </span>
              <Button
                className={styles['refreshBtn']}
                icon={<IconRefresh className="text-[#1E293B]" />}
              />
              {(activeMetadataType === MetadataType.Iceberg ||
                activeMetadataType === MetadataType.Doris) && (
                <>
                  <Button
                    className={styles['refreshBtn']}
                    icon={<StorageIcon />}
                  >
                    表转API
                  </Button>

                  <Button
                    className={styles['refreshBtn']}
                    icon={<IconPlus className="text-[#1E293B]" />}
                    onClick={() => {
                      setCreateTableModalOpen(true);
                    }}
                  >
                    创建数据库
                  </Button>
                  <Button
                    className={styles['refreshBtn']}
                    icon={<IconPlus className="text-[#1E293B]" />}
                    onClick={() => {
                      setCreatePhysicalTableModalOpen(true);
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
            data={workflowData}
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
          {workflowData && workflowData.length > 0 && (
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
          >
            <Select
              placeholder="请选择数据库类型"
              options={[
                { label: '数据湖', value: 'Iceberg' },
                { label: '在线分析库', value: 'Doris' },
                { label: '对象存储', value: 'MinIO' },
                { label: '向量数据库', value: 'Milvus' }
              ]}
              onChange={handleTableTypeChange}
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
            disabled
            rules={[
              {
                required: true,
                message: '请先选择数据库类型，并输入数据库名称'
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
                  options={[
                    { label: '数据湖', value: 'Iceberg' },
                    { label: '在线分析库', value: 'Doris' },
                    { label: '对象存储', value: 'MinIO' },
                    { label: '向量数据库', value: 'Milvus' }
                  ]}
                />
              }
            />
          </Form.Item>
          <Form.Item
            field="ddl"
            label="DDL语句"
            disabled
            rules={[
              {
                required: true,
                message: '请先选择数据库类型，并输入数据库名称'
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
    </div>
  );
}
