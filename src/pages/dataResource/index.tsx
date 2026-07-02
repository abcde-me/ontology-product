import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Form, Input, Message, Tabs } from '@arco-design/web-react';
import { IconFile, IconStorage } from '@arco-design/web-react/icon';
import { SearchTable } from '@ceai-front/arco-material';
import { FileResourceTab } from './components/FileResourceTab';
import { DataResourceStatsCards } from './components/DataResourceStatsCards';
import { IconSearch } from '@ceai-front/svg-icons';
import { useHistory } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { OntoModal } from '@/components/OSModal';
import { useArcoTable } from '@/hooks';
import { useColumns } from './hooks/useColumns';
import type { DataQueryPermission, DataResourceListItem } from './types';
import {
  applyDataQueryPermission,
  fetchDataResourceList
} from './services/api';
import {
  DEFAULT_DATA_RESOURCE_STATS,
  fetchDataResourceStats,
  type DataResourceStats
} from './services/stats';
import { buildDataResourcePagination } from './utils/tablePagination';
import styles from './index.module.scss';

const LIST_PATH = '/tenant/compute/onto/dataConnection/dataResource';

const LIST_TAB_DATABASE = 'database';
const LIST_TAB_FILE = 'file';

export default function DataResourceManagement() {
  const history = useHistory();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState(LIST_TAB_DATABASE);
  const [stats, setStats] = useState<DataResourceStats>(
    DEFAULT_DATA_RESOURCE_STATS
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchDataResourceStats();
      setStats(data);
    } catch (error) {
      console.error('获取数据资源统计失败:', error);
      setStats(DEFAULT_DATA_RESOURCE_STATS);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleViewDetail = (record: DataResourceListItem) => {
    history.push(`${LIST_PATH}/detail/${record.id}`);
  };

  const { onSubmit, tableProps, refresh } = useArcoTable<DataResourceListItem>(
    async ({ query, pagination, filters }) => {
      const result = await fetchDataResourceList({
        pageNo: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
        filter: (query as unknown as { filter?: string })?.filter,
        databaseType: filters?.databaseType?.[0],
        sourceSystem: filters?.sourceSystem?.[0],
        queryPermission: filters?.queryPermission?.[0] as
          | DataQueryPermission
          | undefined
      });

      return {
        items: result.items,
        total: result.total
      };
    },
    {
      form,
      defaultPageSize: 10
    }
  );

  const handleApplyQueryPermission = useCallback(
    (record: DataResourceListItem) => {
      OntoModal.confirm({
        title: '申请数据权限',
        content: `确认为数据表「${record.tableName}」申请数据查询权限？`,
        okText: '提交申请',
        onOk: async () => {
          await applyDataQueryPermission(record.id);
          Message.success('数据查询权限申请已提交');
          refresh();
        }
      });
    },
    [refresh]
  );

  const columns = useColumns({
    onViewDetail: handleViewDetail,
    onApplyQueryPermission: handleApplyQueryPermission
  });

  return (
    <div className={styles['data-resource-page']} ref={containerRef}>
      <PageHeader
        className="flex-shrink-0"
        title="数据资源"
        subTitle="浏览标准化数据表元数据，查看表结构及字段定义"
      />

      <div className={styles['data-resource-page-content']}>
        <DataResourceStatsCards stats={stats} />

        <div className={styles['data-resource-main-panel']}>
          <Tabs
            activeTab={activeTab}
            className={styles['list-tabs']}
            onChange={setActiveTab}
            type="rounded"
          >
            <Tabs.TabPane
              key={LIST_TAB_DATABASE}
              title={
                <span className={styles['data-resource-tab-title']}>
                  <IconStorage />
                  <span>数据库资源</span>
                  <Badge
                    count={stats.databaseTableCount}
                    maxCount={999}
                    className={styles['data-resource-tab-badge']}
                  />
                </span>
              }
            >
              <div className={styles['data-resource-table-card']}>
                <SearchTable
                  className={styles['data-resource-search-table']}
                  searchForm={
                    <Form
                      form={form}
                      autoComplete="off"
                      className={styles['data-resource-search-form']}
                    >
                      <Form.Item noStyle field="filter">
                        <Input
                          placeholder="请输入表名、表注释或来源系统"
                          allowClear
                          onChange={onSubmit}
                          prefix={<IconSearch />}
                          className={styles['data-resource-search-input']}
                        />
                      </Form.Item>
                    </Form>
                  }
                  tableProps={{
                    columns,
                    ...tableProps,
                    rowKey: 'id',
                    border: false,
                    scroll: { x: true },
                    className: styles['data-resource-table'],
                    pagination: buildDataResourcePagination(
                      tableProps.pagination
                    )
                  }}
                />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              key={LIST_TAB_FILE}
              title={
                <span className={styles['data-resource-tab-title']}>
                  <IconFile />
                  <span>文件资源</span>
                  <Badge
                    count={stats.fileResourceCount}
                    maxCount={999}
                    className={styles['data-resource-tab-badge']}
                  />
                </span>
              }
            >
              <FileResourceTab onStatsChange={loadStats} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
