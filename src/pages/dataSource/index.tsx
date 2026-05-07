import React, { useState } from 'react';
import { Form, Pagination, Message, Modal } from '@arco-design/web-react';
import { SearchTable } from '@ceai-front/arco-material';
import {
  PageHeader,
  SearchForm,
  DataSourceDrawer,
  DataSourceDetailDrawer
} from './components';
import { useTable } from './hooks/useTable';
import { useColumns } from './hooks/useColumns';
import type { DataSourceItem } from './types';
import { DataSourceType, ConnectionStatus } from './types';
import {
  fetchDataSourceList,
  deleteDataSource,
  testConnection,
  getDataSourceDetail
} from './services/api';
import styles from './index.module.scss';

export default function DataSourceManagement() {
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataSourceItem | null>(
    null
  );
  const [testingIds, setTestingIds] = useState<Set<string>>(new Set());
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState<DataSourceItem | null>(null);

  // 筛选器状态
  const [dataSourceTypeFilter, setDataSourceTypeFilter] = useState<string[]>(
    []
  );
  const [connectionStatusFilter, setConnectionStatusFilter] = useState<
    string[]
  >([]);

  // 数据源类型筛选选项
  const dataSourceTypeFilters = [
    { text: 'MySQL', value: DataSourceType.MYSQL },
    { text: '达梦数据库', value: DataSourceType.DAMENG },
    { text: 'PostgreSQL', value: DataSourceType.POSTGRESQL }
  ];

  // 连接状态筛选选项
  const connectionStatusFilters = [
    { text: '成功', value: ConnectionStatus.SUCCESS },
    { text: '失败', value: ConnectionStatus.FAILED }
  ];

  // 使用 useTable hook
  const { data, loading, pagination, submit, onChange, refresh } = useTable<
    DataSourceItem,
    any
  >({
    service: async (params) => {
      const result = await fetchDataSourceList({
        pageNo: params.page || 1,
        pageSize: params.pageSize || 10,
        filter: params.keyword || '',
        dataSourceTypes:
          dataSourceTypeFilter.length > 0 ? dataSourceTypeFilter : undefined,
        connectionStatuses:
          connectionStatusFilter.length > 0 ? connectionStatusFilter : undefined
      });
      console.log('result', result);

      return {
        data: {
          items: result.items,
          total: result.total,
          page: result.pageNo,
          pageSize: result.pageSize
        }
      };
    },
    form,
    defaultPageSize: 10,
    deps: [dataSourceTypeFilter, connectionStatusFilter]
  });

  // 处理删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确认删除该数据源？删除后将无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDataSource(id);
          Message.success('删除成功');
          refresh();
        } catch (error: any) {
          // 显示后端返回的错误消息
          const errorMessage = error?.message || '删除失败';
          Message.error(errorMessage);
          console.error(error);
        }
      }
    });
  };

  // 处理连接测试
  const handleTestConnection = async (id: string) => {
    setTestingIds((prev) => new Set(prev).add(id));
    try {
      const result = await testConnection(id);
      if (result.success) {
        Message.success(result.message);
        // 连接测试成功后刷新列表，更新连接状态
        refresh();
      } else {
        Message.error(result.message);
      }
    } catch (error: any) {
      // 显示后端返回的错误消息
      const errorMessage = error?.message || '连接测试失败';
      Message.error(errorMessage);
      console.error(error);
    } finally {
      setTestingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // 处理编辑
  const handleEdit = async (record: DataSourceItem) => {
    try {
      // 调用详情接口获取完整数据（包括密码）
      const detail = await getDataSourceDetail(record.id);
      setEditingRecord(detail);
      setDrawerVisible(true);
    } catch (error: any) {
      // 显示后端返回的错误消息
      const errorMessage = error?.message || '获取数据源详情失败';
      Message.error(errorMessage);
      console.error(error);
    }
  };

  // 处理新增
  const handleAdd = () => {
    setEditingRecord(null);
    setDrawerVisible(true);
  };

  // 处理查看详情
  const handleViewDetail = async (record: DataSourceItem) => {
    try {
      // 调用接口获取详细信息
      const detail = await getDataSourceDetail(record.id);
      setDetailRecord(detail);
      setDetailVisible(true);
    } catch (error: any) {
      // 显示后端返回的错误消息
      const errorMessage = error?.message || '获取详情失败';
      Message.error(errorMessage);
      console.error(error);
    }
  };

  // 处理表格变化（筛选）
  const handleTableChange = (pag: any, sorter: any, filters: any) => {
    // 处理数据源类型筛选
    if (filters !== undefined) {
      if (filters.dataSourceType) {
        setDataSourceTypeFilter(filters.dataSourceType);
      } else {
        setDataSourceTypeFilter([]);
      }

      // 处理连接状态筛选
      if (filters.connectionStatus) {
        setConnectionStatusFilter(filters.connectionStatus);
      } else {
        setConnectionStatusFilter([]);
      }
    }

    // 调用 useTable 的 onChange
    onChange(pag, sorter, filters);
  };

  // 获取列配置
  const columns = useColumns({
    onDelete: handleDelete,
    onTestConnection: handleTestConnection,
    onEdit: handleEdit,
    onViewDetail: handleViewDetail,
    dataSourceTypeFilters,
    connectionStatusFilters,
    testingIds
  });

  // 处理抽屉关闭
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setEditingRecord(null);
  };

  // 处理抽屉成功
  const handleDrawerSuccess = () => {
    refresh();
  };

  return (
    <div className={styles['data-source-page']}>
      {/* 页面头部 */}
      <PageHeader />

      {/* 搜索表格 */}
      <SearchTable
        className="mt-4"
        searchForm={
          <SearchForm form={form} onSearch={submit} onAdd={handleAdd} />
        }
        tableProps={{
          columns,
          data,
          loading,
          rowKey: 'id',
          border: false,
          pagination: false,
          scroll: { x: true },
          onChange: handleTableChange
        }}
      />

      {/* 分页 */}
      {Number(pagination?.total) > 0 && (
        <div className="mt-[12px] flex items-center justify-end">
          <Pagination
            {...pagination}
            onChange={(page, pageSize) => {
              onChange(
                {
                  ...pagination,
                  current: page,
                  pageSize
                } as any,
                undefined,
                undefined
              );
            }}
          />
        </div>
      )}

      {/* 新增/编辑抽屉 */}
      <DataSourceDrawer
        visible={drawerVisible}
        editingRecord={editingRecord}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />

      {/* 详情抽屉 */}
      <DataSourceDetailDrawer
        visible={detailVisible}
        dataSource={detailRecord}
        onClose={() => setDetailVisible(false)}
      />
    </div>
  );
}
