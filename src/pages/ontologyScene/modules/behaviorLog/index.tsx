import React, { useState } from 'react';
import { Form, Pagination } from '@arco-design/web-react';
import { SearchTable } from '@ceai-front/arco-material';
import { useTable } from './hooks/useTable';
import { useColumns } from './hooks/useColumns';
import { PageHeader, SearchForm, DetailDrawer } from './components';
import { BehaviorLogItem, SearchParams } from './types';
import { MOCK_BEHAVIOR_LOGS, mockDelay } from './mocks';
import styles from './list.module.scss';

export default function BehaviorLogList() {
  const [form] = Form.useForm();
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BehaviorLogItem | null>(
    null
  );

  // 处理查看详情
  const handleViewDetail = (record: BehaviorLogItem) => {
    setSelectedRecord(record);
    setDetailDrawerVisible(true);
  };

  // 关闭详情抽屉
  const handleCloseDetail = () => {
    setDetailDrawerVisible(false);
    setSelectedRecord(null);
  };

  // 获取表格列配置
  const columns = useColumns(handleViewDetail);

  // 使用 useTable hook
  const { data, loading, pagination, submit, onChange } = useTable<
    BehaviorLogItem,
    SearchParams
  >({
    service: async (params) => {
      // TODO: 替换为实际API调用
      await mockDelay(300);

      // 模拟筛选和分页
      let filteredData = [...MOCK_BEHAVIOR_LOGS];

      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filteredData = filteredData.filter(
          (item) =>
            item.name.toLowerCase().includes(keyword) ||
            item.id.toLowerCase().includes(keyword) ||
            item.type.toLowerCase().includes(keyword) ||
            item.objectType?.toLowerCase().includes(keyword) ||
            item.operator?.toLowerCase().includes(keyword)
        );
      }

      const page = params.page || 1;
      const pageSize = params.page_size || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        data: {
          items: filteredData.slice(start, end),
          total: filteredData.length,
          page,
          page_size: pageSize
        }
      };
    },
    form,
    defaultPageSize: 10
  });

  return (
    <div className={styles['behaviorLog-list']}>
      {/* 页面头部 */}
      <PageHeader />

      {/* 搜索表格 */}
      <SearchTable
        className={styles['behaviorLog-table']}
        searchForm={<SearchForm form={form} onSearch={submit} />}
        tableProps={{
          columns,
          data,
          loading,
          rowKey: 'id',
          border: false,
          pagination: false,
          scroll: { x: true },
          onChange: (pagination, sorter, filters) => {
            onChange(pagination, sorter, filters);
          }
        }}
      />

      {/* 分页 */}
      {Number(pagination?.total) > 0 && (
        <div className="mt-4 flex items-center justify-end">
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

      {/* 详情抽屉 */}
      <DetailDrawer
        visible={detailDrawerVisible}
        data={selectedRecord}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
