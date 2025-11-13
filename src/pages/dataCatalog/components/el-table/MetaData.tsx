import React, { useState, useEffect, useMemo } from 'react';
import { Table, Pagination, Button, Space } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import { useRequest } from 'ahooks';
import {
  getMetaDataList,
  Field,
  FieldSearchItem,
  LoadTaskStatus
} from '@/api/dataCatalog';
import { useDataCatalog } from '../DataCatalogProvider/Context';
import SearchArea, { SearchField } from './MetaDataSearchArea';
import noDataElement from '@/components/no-data';

export default function MetaData() {
  const dataCatalog = useDataCatalog();
  const { catalogTreeStore } = dataCatalog;
  const { selectedKey, selectedParentId, extendsObj } =
    catalogTreeStore.useGetState([
      'selectedKey',
      'selectedParentId',
      'extendsObj'
    ]);

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [searchFields, setSearchFields] = useState<Field[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [fieldSearch, setFieldSearch] = useState<FieldSearchItem[]>([]);

  // 轮询获取元数据列表
  const { runAsync: pollMetaDataList, cancel: cancelPolling } = useRequest(
    async () => {
      if (!selectedKey) return;

      const res = await getMetaDataList({
        page: currentPage,
        pageSize: pageSize,
        fieldSearch: fieldSearch,
        queryLoadTaskInstance: true,
        path_id: selectedParentId ? Number(selectedParentId) : 0,
        db_name: (extendsObj?.db_name as string) || '',
        table_name: (extendsObj?.table_name as string) || ''
      });

      if (res.code === '' && res.status === 200) {
        const data = res.data || {};
        setTableData(data.records || []);
        setSearchFields(data.fields || []);
        setTotal(data.total || 0);

        return data.loadTaskStatus;
      }
      return null;
    },
    {
      pollingInterval: 5000,
      pollingWhenHidden: false,
      manual: true,
      onSuccess: (loadTaskStatus) => {
        if (loadTaskStatus === LoadTaskStatus.COMPLETED) {
          cancelPolling();
        }
      },
      onError: () => {
        cancelPolling();
      }
    }
  );

  // 获取列表数据
  const loadData = async () => {
    if (!selectedKey) return;

    setLoading(true);
    try {
      const res = await getMetaDataList({
        page: currentPage,
        pageSize: pageSize,
        fieldSearch: fieldSearch,
        queryLoadTaskInstance: false,
        path_id: selectedParentId ? Number(selectedParentId) : 0,
        db_name: (extendsObj?.db_name as string) || '',
        table_name: (extendsObj?.table_name as string) || ''
      });

      if (res.code === '' && res.status === 200) {
        const data = res.data || {};
        setTableData(data.records || []);
        setSearchFields(data.fields || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('获取元数据列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, selectedKey, selectedParentId, fieldSearch]);

  // 组件卸载时取消轮询
  useEffect(() => {
    return () => {
      cancelPolling();
    };
  }, [cancelPolling]);

  // 动态构建表格列
  const columns = useMemo(() => {
    return searchFields.map((field: Field) => ({
      title: field.nameZh || field.nameEn,
      dataIndex: field.nameEn,
      key: field.nameEn,
      ellipsis: true,
      render: (value: any) => {
        // 如果值是数组，转换为字符串显示
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value ?? '-';
      }
    }));
  }, [searchFields]);

  // 处理分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  // 处理每页大小变化
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // 处理刷新
  const handleRefresh = () => {
    // 如果已有轮询在进行，先取消
    cancelPolling();

    // 启动新的轮询
    pollMetaDataList();
  };

  // 处理字段搜索
  const handleFieldSearch = (fieldValues: Record<string, any>) => {
    console.log('字段搜索:', fieldValues);
    // 将搜索条件转换为 FieldSearchItem 格式
    const searchItems: FieldSearchItem[] = Object.entries(fieldValues).map(
      ([key, value]) => {
        const field = searchFields.find((f) => f.nameEn === key);
        return {
          nameEn: key,
          type: field?.type || 'string',
          queryValue: value
        };
      }
    );
    setFieldSearch(searchItems);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理重置
  const handleReset = () => {
    console.log('重置搜索条件');
    setFieldSearch([]);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* 搜索区域 */}
      {columns.length > 0 && (
        <SearchArea
          fields={searchFields.map((field: Field) => ({
            key: field.nameEn,
            label: field.nameZh || field.nameEn,
            type: 'input',
            paramKey: field.nameEn
          }))}
          onFieldSearch={handleFieldSearch}
          onReset={handleReset}
        />
      )}

      <div className="data-catalog-content">
        {/* 标题和刷新按钮 */}
        <div className="mb-[12px] mt-[12px] flex items-center justify-between">
          <div className="text-[16px] font-bold">数据湖目录({total})</div>
          <Space>
            <Button
              type="outline"
              icon={<IconRefresh />}
              onClick={handleRefresh}
              style={{
                width: 32,
                height: 32,
                padding: 0
              }}
            />
          </Space>
        </div>

        {/* 表格 */}
        {columns.length === 0 && !loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            {noDataElement({ description: '暂无载入数据' })}
          </div>
        ) : (
          <Table
            loading={loading}
            columns={columns}
            data={tableData}
            // rowKey={(record, index) => record.id || index}
            pagination={false}
            border={false}
            scroll={{ x: true }}
            noDataElement={noDataElement({ description: '暂无载入数据' })}
          />
        )}

        {/* 分页 */}
        {total > 0 && (
          <div className="mt-[16px] flex items-center justify-end">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              showTotal
              showJumper
              sizeCanChange
              sizeOptions={[10, 20, 50, 100]}
              onChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
