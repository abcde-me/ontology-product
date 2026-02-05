import React, { useState } from 'react';
import { Form, Pagination, Tabs } from '@arco-design/web-react';
import { SearchTable } from '@ceai-front/arco-material';
import { useTable } from './hooks/useTable';
import { useColumns } from './hooks/useColumns';
import { PageHeader, SearchForm, DetailDrawer } from './components';
import { BehaviorLogItem } from './types';
import { fetchBehaviorLogList } from './services/behaviorLogApi';
import styles from './index.module.scss';

export default function BehaviorLogList() {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<'action' | 'function'>('action');
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BehaviorLogItem | null>(
    null
  );
  const [actionTotal, setActionTotal] = useState(0);
  const [functionTotal, setFunctionTotal] = useState(0);

  // 初始化时获取两个 tab 的总数
  React.useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [actionResult, functionResult] = await Promise.all([
          fetchBehaviorLogList({
            page_num: 1,
            page_size: 1,
            query: '',
            type: 'action'
          }),
          fetchBehaviorLogList({
            page_num: 1,
            page_size: 1,
            query: '',
            type: 'function'
          })
        ]);
        setActionTotal(actionResult.total);
        setFunctionTotal(functionResult.total);
      } catch (error) {
        console.error('获取总数失败:', error);
      }
    };
    fetchTotals();
  }, []);

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

  // 根据当前 tab 获取对应的列配置
  const columns = useColumns(activeTab, handleViewDetail);

  // 使用 useTable hook
  const { data, loading, pagination, submit, onChange } = useTable<
    BehaviorLogItem,
    any
  >({
    service: async (params) => {
      // 调用 API 服务，带上当前 activeTab
      const result = await fetchBehaviorLogList({
        page_num: params.page || 1,
        page_size: params.page_size || 10,
        query: params.keyword || '',
        type: activeTab // 搜索时会带上当前 tab 的类型
      });

      // 更新对应 tab 的总数（搜索时可能会变化）
      if (activeTab === 'action') {
        setActionTotal(result.total);
      } else {
        setFunctionTotal(result.total);
      }

      return {
        data: {
          items: result.items,
          total: result.total,
          page: result.page,
          page_size: result.page_size
        }
      };
    },
    form,
    defaultPageSize: 10
  });

  // Tab 切换时重新加载数据
  const handleTabChange = (key: string) => {
    setActiveTab(key as 'action' | 'function');
    // 重置表单并重新提交
    form.resetFields();
    setTimeout(() => {
      submit();
    }, 0);
  };

  return (
    <div className={styles['behaviorLog-list']}>
      {/* 页面头部 */}
      <PageHeader />

      {/* Tab 切换 */}
      <Tabs
        className="flex-shrink-0"
        activeTab={activeTab}
        onChange={handleTabChange}
      >
        <Tabs.TabPane title={`行为(${actionTotal})`} key="action" />
        <Tabs.TabPane title={`函数(${functionTotal})`} key="function" />
      </Tabs>

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
