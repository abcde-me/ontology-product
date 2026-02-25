import React, { useState } from 'react';
import { Form, Pagination, Tabs } from '@arco-design/web-react';
import { SearchTable } from '@ceai-front/arco-material';
import { useTable } from './hooks/useTable';
import { useColumns } from './hooks/useColumns';
import { PageHeader, SearchForm, ExecutionDetailDrawer } from './components';
import { BehaviorLogItem } from './types';
import { fetchBehaviorLogList } from './services/behaviorLogApi';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/componens/ObjectTypeDetailDrawer';
import { BehaviorDetail } from '@/pages/ontologyScene/modules/behaviorActions/components';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import styles from './index.module.scss';

export default function BehaviorLogList() {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<'action' | 'function'>('action');
  const [actionTotal, setActionTotal] = useState(0);
  const [functionTotal, setFunctionTotal] = useState(0);
  const [sourcesFilter, setSourcesFilter] = useState<string[]>([]); // 来源过滤
  const [statusFilter, setStatusFilter] = useState<number[]>([]); // 执行状态过滤
  const [objectTypeFilter, setObjectTypeFilter] = useState<string[]>([]); // 对象类型过滤
  const [objectTypeFilters, setObjectTypeFilters] = useState<
    Array<{ text: string; value: string }>
  >([]); // 对象类型过滤选项
  const [sortField, setSortField] = useState<string>(); // 排序字段
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>(); // 排序方向
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState<{
    id: string;
  } | null>(null);
  const [objectTypeActiveTab, setObjectTypeActiveTab] = useState<
    'instances' | 'attributes' | 'links'
  >('instances');
  const [showBehaviorDetail, setShowBehaviorDetail] = useState(false);
  const [behaviorData, setBehaviorData] = useState<BehaviorActionItem>();
  const [showExecutionDetail, setShowExecutionDetail] = useState(false);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>();

  // 获取对象类型列表用于过滤
  React.useEffect(() => {
    const fetchObjectTypes = async () => {
      try {
        const response = await listOntologyObjectType({
          pageNo: 1,
          pageSize: 100 // 获取所有对象类型
        });
        if (response.data?.result) {
          const filters = response.data.result.map((item) => ({
            text: item.name || '',
            value: String(item.id)
          }));
          setObjectTypeFilters(filters);
        }
      } catch (error) {
        console.error('获取对象类型列表失败:', error);
      }
    };
    fetchObjectTypes();
  }, []);

  // 初始化时获取另一个 tab 的总数（当前 tab 的 total 会由 useTable 自动获取）
  React.useEffect(() => {
    const fetchOtherTabTotal = async () => {
      try {
        // 只获取非当前 tab 的 total
        const otherType = activeTab === 'action' ? 'function' : 'action';
        const result = await fetchBehaviorLogList({
          page_num: 1,
          page_size: 1,
          query: '',
          type: otherType
        });

        if (otherType === 'action') {
          setActionTotal(result.total);
        } else {
          setFunctionTotal(result.total);
        }
      } catch (error) {
        console.error('获取总数失败:', error);
      }
    };
    fetchOtherTabTotal();
  }, []); // 只在初始化时执行一次

  // 处理查看对象类型详情
  const handleViewObjectTypeDetail = (record: BehaviorLogItem) => {
    const objectTypeId = String(
      record.ontologyObjectTypeId || record.objectTypeID || ''
    );
    if (objectTypeId) {
      setSelectedObjectType({ id: objectTypeId });
      setObjectTypeActiveTab('instances');
      setDetailDrawerVisible(true);
    }
  };

  // 处理查看行为详情
  const handleViewBehaviorDetail = (record: BehaviorLogItem) => {
    // 将 BehaviorLogItem 转换为 BehaviorActionItem
    // 注意：这里需要根据实际的数据结构进行映射
    const behaviorActionData: BehaviorActionItem = {
      id: Number(record.id),
      name: record.name,
      code: record.code,
      description: record.description,
      objectTypeName: record.ontologyObjectTypeName,
      objectTypeId: Number(record.ontologyObjectTypeId || 0)
    };
    setBehaviorData(behaviorActionData);
    setShowBehaviorDetail(true);
  };

  // 处理查看执行详情
  const handleViewExecutionDetail = (record: BehaviorLogItem) => {
    setSelectedExecutionId(record.id);
    setShowExecutionDetail(true);
  };

  // 根据当前 tab 获取对应的列配置
  const columns = useColumns(
    activeTab,
    handleViewObjectTypeDetail,
    handleViewBehaviorDetail,
    handleViewExecutionDetail,
    objectTypeFilters
  );

  // 使用 useTable hook
  const { data, loading, pagination, submit, onChange } = useTable<
    BehaviorLogItem,
    any
  >({
    service: async (params) => {
      // 调用 API 服务，带上当前 activeTab 和过滤条件
      const result = await fetchBehaviorLogList({
        page_num: params.page || 1,
        page_size: params.page_size || 10,
        query: params.keyword || '',
        type: activeTab, // 搜索时会带上当前 tab 的类型
        sources: sourcesFilter.length > 0 ? sourcesFilter : undefined, // 来源过滤
        run_status: statusFilter.length > 0 ? statusFilter : undefined, // 执行状态过滤
        ontology_object_type_ids:
          objectTypeFilter.length > 0 ? objectTypeFilter : undefined, // 对象类型过滤
        sort_field: sortField, // 排序字段
        sort_order: sortOrder // 排序方向
      });

      // 更新对应 tab 的总数
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
    // 重置表单和过滤条件
    form.resetFields();
    setSourcesFilter([]);
    setStatusFilter([]);
    setObjectTypeFilter([]);
    setSortField(undefined);
    setSortOrder(undefined);
    setTimeout(() => {
      submit();
    }, 0);
  };

  // 处理表格变化（包括过滤和排序）
  const handleTableChange = (pag: any, sorter: any, filters: any) => {
    // 处理来源过滤
    if (filters && filters.sources) {
      setSourcesFilter(filters.sources);
    } else {
      setSourcesFilter([]);
    }

    // 处理执行状态过滤
    if (filters && filters.run_status) {
      setStatusFilter(filters.run_status);
    } else {
      setStatusFilter([]);
    }

    // 处理对象类型过滤
    if (filters && filters.ontologyObjectTypeName) {
      setObjectTypeFilter(filters.ontologyObjectTypeName);
    } else {
      setObjectTypeFilter([]);
    }

    // 处理排序
    if (sorter && sorter.field && sorter.direction) {
      setSortField(sorter.field);
      setSortOrder(sorter.direction);
    } else {
      setSortField(undefined);
      setSortOrder(undefined);
    }

    // 调用原有的 onChange
    onChange(pag, sorter, filters);
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
          onChange: handleTableChange
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

      {/* 对象类型详情抽屉 */}
      {selectedObjectType && detailDrawerVisible && (
        <ObjectTypeDetailDrawer
          visible={detailDrawerVisible}
          onClose={() => {
            setDetailDrawerVisible(false);
            setSelectedObjectType(null);
          }}
          objectTypeId={selectedObjectType?.id}
          defaultActiveTab={objectTypeActiveTab}
        />
      )}

      {/* 行为详情抽屉 */}
      <BehaviorDetail
        show={showBehaviorDetail}
        onClose={() => {
          setShowBehaviorDetail(false);
          setBehaviorData(undefined);
        }}
        data={behaviorData}
      />

      {/* 执行详情抽屉 */}
      <ExecutionDetailDrawer
        visible={showExecutionDetail}
        onClose={() => {
          setShowExecutionDetail(false);
          setSelectedExecutionId(undefined);
        }}
        executionId={selectedExecutionId}
        mode={activeTab}
      />
    </div>
  );
}
