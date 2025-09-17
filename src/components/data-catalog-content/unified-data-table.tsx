import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react';
import { Modal, Tabs, Typography } from '@arco-design/web-react';
import {
  getTargetDataFileList,
  getSourceDataFileList,
  getDbItemList
} from '@/api/dataCatalog';
// 导入统一的组件
import UnifiedTable, { UnifiedTableRef } from './unified-table';
import Pages from './components/pages';
import FormComponent from './components/popups-form';
import { getUnifiedColumns, getSourceFileTypeList } from './unified-columns';
import './index.scss';
import { PopupsFormFrom } from './components/popups-form/types';
import DbModal from './components/popups-form/dbmodal';
const { Text } = Typography;

// 数据类型接口定义
interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
}

interface TableDataItem {
  id: number;
  content: string;
  type: string;
  createdAt: string;
  file: string;
  workflowId: string;
  full_path?: string;
}

// 将日期字符串转换为时间戳的工具函数
function toUnixTimestamp(dateString: string) {
  const date = new Date(dateString.replace(' ', 'T'));
  return Math.floor(date.getTime() / 1000);
}

// 统一数据表格组件属性类型
interface UnifiedDataTableProps {
  selectedNode?: any;
  onSelectionChange?: (
    selectedRowKeys: React.Key[],
    selectedRows: any[]
  ) => void;
  // Source表格专用属性
  searchValue?: string;
  // Target表格专用属性
  searchCondition?: {
    type: string;
    keyword: string;
    isActive: boolean;
  };
  // 通用属性
  startTime?: string;
  endTime?: string;
  // 表格类型标识
  tableType: 'source' | 'target';
  // 数据类型标识
  dataType?: 'volume' | 'database';
  // 选中节点的完整路径
  selectedFullPath?: string;
  selectedKey?: string;
  // 选中节点的类型
  selectedNodeType?: string;
  // 选中节点的父节点ID
  selectedParentId?: string;
}

/**
 * 统一的数据表格组件
 */
const UnifiedDataTable = forwardRef((props: UnifiedDataTableProps, ref) => {
  const {
    selectedNode,
    onSelectionChange,
    searchValue = '',
    searchCondition = { type: '数据内容', keyword: '', isActive: false },
    startTime = '',
    endTime = '',
    tableType,
    dataType = 'volume',
    selectedFullPath,
    selectedKey,
    selectedNodeType,
    selectedParentId
  } = props;
  // 基础状态管理
  const [visible, setVisible] = useState(false); // 下载弹框控制
  const [visibleDbmodel, setVisibleDbmodel] = useState(false); // 数据详情弹框控制
  const [downloadData, setDownloadData] = useState(null); // 下载的数据
  const [selectedFilePath, setSelectedFilePath] = useState(''); // 选中的文件路径
  const [currentDbDetails, setCurrentDbDetails] = useState<{
    databaseName: string;
    tableName: string;
    path_id: number;
    table_id: number;
  } | null>(null); // 当前选中的数据库详情
  const [tableData, setTableData] = useState<TableDataItem[]>([]); // 表格数据
  const [loading, setLoading] = useState(false); // 添加加载状态
  const [fileTypeFilters, setFileTypeFilters] = useState<string[]>([]); // 文件类型筛选条件
  const [sortField, setSortField] = useState<string>(''); // 排序字段
  const [sortOrder, setSortOrder] = useState<string>(''); // 排序方向 asc/desc
  const [dbFilterType, setDbFilterType] = useState<string[]>([]); // 数据库类型筛选条件

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(100);

  // 表格选择状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // 跨页选中状态
  const [crossPageSelectedKeys, setCrossPageSelectedKeys] = useState<
    React.Key[]
  >([]);
  const [crossPageSelectedRows, setCrossPageSelectedRows] = useState<any[]>([]);
  const [sourceFileTypeFilters, setSourceFileTypeFilters] = useState<string[]>(
    []
  );

  // Target表格特有的行悬浮状态
  const [hoveredRowId, setHoveredRowId] = useState<any>(null);
  const childRef = useRef(null);

  // 表格组件引用，用于调用表格内部方法
  const tableRef = useRef<UnifiedTableRef>(null);
  // 分解searchCondition对象，避免引用比较导致的无限循环
  const searchConditionType = searchCondition?.type || '';
  const searchConditionKeyword = searchCondition?.keyword || '';
  const searchConditionIsActive = searchCondition?.isActive || false;
  const isFirstRender = useRef(true);
  // 防止重复请求
  const isDataFetching = useRef(false);

  // 组件挂载时的初始化处理
  useEffect(() => {
    isFirstRender.current = false;
    // 组件卸载时清理
    return () => {
      console.log(`${tableType}表格组件卸载`);
      isDataFetching.current = false;
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    setCurrentPage(1);
    if (window) {
      const resetEvent = new CustomEvent('resetSearchInputs', {
        detail: { tableType }
      });
      window.dispatchEvent(resetEvent);
    }
    // 重置选择状态和过滤条件
    if (typeof handAllReset === 'function') {
      handAllReset();
    } else {
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setCrossPageSelectedKeys([]);
      setCrossPageSelectedRows([]);
      setFileTypeFilters([]);
      if (tableRef.current) {
        tableRef.current.resetSelection();
      }
    }
  }, [selectedKey, selectedFullPath, selectedNodeType, selectedParentId]);
  // 监听搜索类型变化
  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    if (searchConditionType && tableType === 'target') {
      const resetSearchEvent = new CustomEvent('resetSearchKeyword', {
        detail: { tableType, searchType: searchConditionType }
      });
      window.dispatchEvent(resetSearchEvent);
      setCurrentPage(1);
    }
  }, [searchConditionType, tableType]);
  // 将方法暴露给父组件
  useImperativeHandle(ref, () => ({
    getTableList,
    resetSelection: () => {
      // 重置表格内部的选择状态
      if (tableRef.current) {
        tableRef.current.resetSelection();
      }
      // 同时重置当前组件的选择状态
      setSelectedRowKeys([]);
      setSelectedRows([]);
      // 重置跨页选择状态
      setCrossPageSelectedKeys([]);
      setCrossPageSelectedRows([]);
    },
    // 导出跨页选择的数据
    getSelectedData: () => {
      return {
        selectedRowKeys: crossPageSelectedKeys,
        selectedRows: crossPageSelectedRows
      };
    },
    // 清除所有选择状态（包括跨页）
    clearAllSelections: () => {
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setCrossPageSelectedKeys([]);
      setCrossPageSelectedRows([]);
      if (tableRef.current) {
        tableRef.current.resetSelection();
      }
    },
    // 重置页码到第一页
    resetPage: () => {
      setCurrentPage(1);
    }
  }));

  const getTableList = async () => {
    // 防止重复请求
    if (isDataFetching.current) {
      return;
    }

    // 检查目标表格是否有有效路径
    if (tableType === 'target' && !selectedFullPath) {
      setTableData([]);
      setTotal(0);
      return;
    }

    try {
      // 标记开始加载
      isDataFetching.current = true;
      setLoading(true);

      const validFileTypes = fileTypeFilters || [];
      // 目标数据表参数
      const params = {
        full_path: selectedFullPath, // 使用选中的完整路径
        page: currentPage,
        limit: pageSize,
        start_time: startTime || '',
        end_time: endTime || '',
        search_content:
          searchConditionType === '数据内容' ? searchConditionKeyword : '',
        search_id: searchConditionType === 'ID' ? searchConditionKeyword : '',
        sort_field: 'generated_at',
        sort_order: sortOrder || 'desc',
        path_id: Number(selectedKey)
        // file_type: validFileTypes || []// 使用筛选条件中的文件类型
      };

      // 源数据表参数
      const sourceParams = {
        page: currentPage,
        page_size: pageSize,
        file_name: searchValue || '',
        data_path_id: Number(selectedKey) // 优先使用选中ID 后期改成selectedKey
        // start: startTime, //后期改成startTime
        // end: endTime, //后期改成endTime
        // file_type: validFileTypes.length > 0 ? validFileTypes : [''] // 使用筛选条件中的文件类型
      };
      const newParams: any = { ...params };
      const newSourceParams: any = { ...sourceParams };

      // 添加排序参数
      if (sortField && sortOrder) {
        // newParams.sort = sortOrder;
        newSourceParams.sort = sortOrder;
      }

      if (validFileTypes.length > 0) {
        newParams.file_type = validFileTypes;
        newSourceParams.file_type = validFileTypes;
      }
      if (startTime) {
        newSourceParams.start = startTime;
      }
      if (endTime) {
        newSourceParams.end = endTime;
      }
      let res;
      console.log(tableType, '查看tableType11111111');
      console.log(selectedNodeType, '查看selectedNodeType');

      // 根据节点类型决定调用哪个API
      if (selectedNodeType === 'db_item') {
        let databaseName = '';
        if (selectedFullPath) {
          const pathParts = selectedFullPath.split('/');
          if (pathParts.length >= 2) {
            databaseName = pathParts[pathParts.length - 1];
          }
        }
        const dbParams = {
          path_id: Number(selectedParentId || selectedKey), // 使用父节点ID（数据库ID），如果没有则使用selectedKey
          search:
            tableType === 'source'
              ? searchValue || ''
              : searchConditionKeyword || '',
          page: currentPage,
          limit: pageSize,
          database: databaseName, // 使用提取的数据库名称
          db_type: dbFilterType
        };
        res = await getDbItemList(dbParams);
        console.log('调用数据库表API，参数:', dbParams);
      } else if (tableType === 'target') {
        // 调用目标数据API
        console.log(newParams, 'top----111111');
        res = await getTargetDataFileList(newParams);
        console.log('调用目标数据API，参数:', newParams);
      } else {
        // 调用源数据API
        console.log(newSourceParams, 'top-------2222');
        res = await getSourceDataFileList(newSourceParams);
        console.log('调用源数据API，参数:', newSourceParams);
      }

      // 处理API响应
      if (res && res.data) {
        // 先检查有没有list数据结构
        if (
          res.data.list &&
          Array.isArray(res.data.list) &&
          res.data.list.length > 0
        ) {
          setTableData(res.data.list);
          setTotal(res.data.total || res.data.list.length || 0);
          // console.log(`获取${tableType}表格数据成功:`, res.data);
        }
        // 再检查有没有items数据结构
        else if (
          res.data.items &&
          Array.isArray(res.data.items) &&
          res.data.items.length > 0
        ) {
          setTableData(res.data.items);
          setTotal(res.data.total || res.data.items.length || 0);
          // console.log(`获取${tableType}表格数据成功:`, res.data);
        }
        // 无数据的情况
        else {
          // 无数据情况，设置为空数组
          setTableData([]);
          setTotal(0);
          console.log(`${tableType}表格无数据`);
        }
      } else {
        // 响应异常，设置为空数组
        setTableData([]);
        setTotal(0);
        console.log(`获取${tableType}表格数据响应异常`);
      }
    } catch (error) {
      // 发生错误，设置为空数组
      setTableData([]);
      setTotal(0);
      console.error(`获取${tableType}表格数据失败:`, error);
    } finally {
      // 结束加载状态
      setLoading(false);
      // 标记请求完成
      isDataFetching.current = false;
    }
  };
  //重置选中数据
  const handAllReset = () => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
    setCrossPageSelectedKeys([]);
    setCrossPageSelectedRows([]);
    if (tableRef.current) {
      tableRef.current.resetSelection();
      tableRef.current.updateSelection([]);
    } else {
      console.log('不存在');
    }
    setTimeout(() => {
      if (crossPageSelectedKeys.length > 0 || selectedRowKeys.length > 0) {
        setSelectedRowKeys([]);
        setSelectedRows([]);
        setCrossPageSelectedKeys([]);
        setCrossPageSelectedRows([]);
      } else {
        console.log('unified-data-table - 选中状态已正确清除');
      }
    }, 100);
  };
  // 重置页码
  const resetPage = () => {
    setCurrentPage(1);
  };

  // 合并的useEffect处理所有数据获取逻辑
  useEffect(() => {
    // 首次渲染标记
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // getTableList(); // 首次渲染也获取数据
      return;
    }
    // 防止在没有路径的情况下请求目标数据
    if (tableType === 'target' && !selectedFullPath) {
      return;
    }
    const timer = setTimeout(() => {
      getTableList();
    }, 50);
    return () => clearTimeout(timer);
  }, [
    searchValue,
    searchConditionKeyword,
    searchConditionIsActive,
    selectedKey,
    startTime,
    endTime,
    selectedFilePath,
    currentPage,
    pageSize,
    selectedFullPath,
    fileTypeFilters,
    tableType,
    sortField,
    sortOrder,
    selectedNodeType,
    selectedParentId
  ]);

  // 当tableType变化时重置相关状态，不再重复调用getTableList
  useEffect(() => {
    // 重置页码和选择状态
    setCurrentPage(1);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    setHoveredRowId(null);
    // 重置文件类型筛选条件
    setFileTypeFilters([]);
    // 重置跨页选择状态
    setCrossPageSelectedKeys([]);
    setCrossPageSelectedRows([]);
    if (tableRef.current) {
      tableRef.current.resetSelection();
    }
  }, [tableType]);

  useEffect(() => {
    console.log('查看table是什么类型', tableType);

    const handleResetPage = (event) => {
      const { tableType: eventTableType } = event.detail;
      if (eventTableType === tableType) {
        setCurrentPage(1);
      }
    };
    window.addEventListener('resetPageToFirst', handleResetPage);
    return () => {
      window.removeEventListener('resetPageToFirst', handleResetPage);
    };
  }, [tableType]);

  // 控制下载弹框的显示和隐藏 - 使用useCallback避免重新创建
  const downloadShow = React.useCallback(
    (visible: boolean, downloaddata?: any) => {
      setVisible(visible);
      if (downloaddata) {
        console.log(
          `UnifiedDataTable (${tableType}) - downloadData:`,
          downloaddata
        );
        setDownloadData(downloaddata);
      }
    },
    [tableType]
  );

  useEffect(() => {
    if (!!selectedKey && dataType === 'volume') {
      getSourceFileTypeList({
        id: selectedKey
      }).then((result) => {
        setSourceFileTypeFilters(result);
      });
    }
  }, [selectedKey, dataType]);

  // 动态生成列配置 - 仅在表格类型和数据类型变化时重新生成
  const baseColumns = React.useMemo(() => {
    return getUnifiedColumns(
      tableType,
      dataType,
      downloadShow,
      setVisibleDbmodel,
      null, // hoveredRowId
      getTableList, // refreshData
      selectedKey,
      selectedFullPath,
      undefined, // customFileTypeFilters
      handAllReset,
      resetPage,
      sourceFileTypeFilters,
      selectedNodeType,
      (data) => {
        setCurrentDbDetails(data); // 存储当前的数据库详情
      },
      selectedParentId // 传递父节点ID
    );
  }, [
    tableType,
    dataType,
    downloadShow,
    selectedKey,
    selectedFullPath,
    handAllReset,
    resetPage,
    sourceFileTypeFilters,
    selectedNodeType
  ]);

  // 处理带有hoveredRowId的列配置
  const columns = React.useMemo(() => {
    if (tableType === 'target' && dataType === 'volume') {
      // 只有Target表格才需要动态更新hoveredRowId
      return getUnifiedColumns(
        tableType,
        dataType,
        downloadShow,
        setVisibleDbmodel,
        hoveredRowId,
        getTableList,
        selectedKey,
        selectedFullPath,
        undefined,
        handAllReset,
        resetPage,
        sourceFileTypeFilters,
        selectedNodeType,
        (data) => {
          setCurrentDbDetails(data); // 存储当前的数据库详情
        },
        selectedParentId // 传递父节点ID
      );
    }
    return baseColumns;
  }, [
    baseColumns,
    tableType,
    dataType,
    downloadShow,
    hoveredRowId,
    selectedKey,
    selectedFullPath,
    handAllReset,
    resetPage,
    sourceFileTypeFilters,
    selectedNodeType
  ]);

  // 处理表格选择变化 - 支持跨页选择
  const handleSelectionChange = React.useCallback(
    (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
      console.log(
        `UnifiedDataTable (${tableType}) - 表格选择变化:`,
        selectedRowKeys,
        selectedRows
      );
      const currentPageDataIds = tableData.map((item) => item.id);
      const remainingKeys = crossPageSelectedKeys.filter(
        (key) =>
          !currentPageDataIds.includes(Number(key)) ||
          selectedRowKeys.includes(key)
      );
      const remainingRows = crossPageSelectedRows.filter(
        (row) =>
          !currentPageDataIds.includes(Number(row.id)) ||
          selectedRowKeys.includes(row.id)
      );
      const newKeys = [...remainingKeys];
      const newRows = [...remainingRows];

      selectedRows.forEach((row) => {
        if (!newKeys.includes(row.id)) {
          newKeys.push(row.id);
          newRows.push(row);
        }
      });

      // 更新跨页选择状态
      setCrossPageSelectedKeys(newKeys);
      setCrossPageSelectedRows(newRows);

      // 调用外部传入的回调函数，传递跨页选择的结果
      if (onSelectionChange) {
        console.log(
          `UnifiedDataTable (${tableType}) - 调用外部回调函数，传递跨页选择结果`
        );
        onSelectionChange(newKeys, newRows);
      }
    },
    [
      tableType,
      onSelectionChange,
      tableData,
      crossPageSelectedKeys,
      crossPageSelectedRows
    ]
  );

  // 页码变化处理 - 使用useCallback避免重新创建
  const handlePageChange = React.useCallback(
    (page: number, size: number) => {
      console.log(
        `UnifiedDataTable (${tableType}) - 页码变化:`,
        page,
        '每页条数:',
        size
      );
      setCurrentPage(page);
      setPageSize(size);
    },
    [tableType]
  );

  // 每页条数变化处理 - 使用useCallback避免重新创建
  const handlePageSizeChange = React.useCallback(
    (page: number, size: number) => {
      console.log(
        `UnifiedDataTable (${tableType}) - 每页条数变化:`,
        page,
        '每页条数:',
        size
      );
      setCurrentPage(page);
      setPageSize(size);
    },
    [tableType]
  );
  const handleTableChange = (pagination, filters, sorter) => {
    console.log('Table changed:123456789', {
      pagination,
      filters,
      sorter,
      tableType
    });
    let newFileTypes: string[] = [];
    // 处理排序参数
    let newSortField = '';
    let newSortOrder = '';
    if (filters && filters.field) {
      newSortField = filters.field;
      newSortOrder = filters.direction === 'ascend' ? 'asc' : 'desc';
      setSortField(newSortField);
      setSortOrder(newSortOrder);
    } else {
      setSortField('');
      setSortOrder('');
    }

    if (sorter && sorter.file_type && Array.isArray(sorter.file_type)) {
      newFileTypes = sorter.file_type;
      // console.log('从sorter.file_type获取筛选条件:', newFileTypes);
    } else if (sorter && sorter.type && Array.isArray(sorter.type)) {
      newFileTypes = sorter.type;
      // console.log('从sorter.type获取筛选条件:', newFileTypes);
    } else if (sorter && typeof sorter.file_type === 'string') {
      newFileTypes = [sorter.file_type];
      // console.log('从sorter.file_type字符串获取筛选条件:', newFileTypes);
    } else if (sorter && typeof sorter.type === 'string') {
      newFileTypes = [sorter.type];
      // console.log('从sorter.type字符串获取筛选条件:', newFileTypes);
    }

    // 设置文件类型筛选条件
    // console.log(`${tableType}表格设置文件类型筛选条件:`, newFileTypes);
    setFileTypeFilters(newFileTypes);
    if (sorter && sorter.db_type && Array.isArray(sorter.db_type)) {
      setDbFilterType(sorter.db_type);
    } else if (sorter && typeof sorter.db_type === 'string') {
      setDbFilterType([sorter.db_type]);
    } else {
      setDbFilterType([]);
    }
    // 当筛选条件变化时，重置到第一页
    if (
      (filters && Object.keys(filters).length > 0) ||
      (sorter && Object.keys(sorter).length > 0)
    ) {
      setCurrentPage(1);
    }
    // 重新获取数据
    // getTableList();
  };

  // 在数据加载完成后，设置当前页中应该被选中的行
  useEffect(() => {
    if (tableData.length > 0 && crossPageSelectedKeys.length > 0) {
      const currentPageSelectedKeys = crossPageSelectedKeys.filter((key) =>
        tableData.some((item) => item.id === Number(key))
      );
      setSelectedRowKeys(currentPageSelectedKeys);
      const currentPageSelectedRows = tableData.filter((item) =>
        currentPageSelectedKeys.includes(item.id)
      );
      setSelectedRows(currentPageSelectedRows);
      if (tableRef.current) {
        tableRef.current.updateSelection(currentPageSelectedKeys);
      }
    }
  }, [tableData, crossPageSelectedKeys]);

  return (
    <>
      <div style={{ height: '100%' }}>
        {/* 使用统一的表格组件 */}
        <UnifiedTable
          ref={tableRef}
          columns={columns}
          data={tableData as any}
          onSelectionChange={handleSelectionChange}
          onChange={handleTableChange}
          tableType={tableType}
          selectedRowKeys={selectedRowKeys}
          // Target表格特有的悬浮功能
          hoveredRowId={tableType === 'target' ? hoveredRowId : undefined}
          onRowHover={tableType === 'target' ? setHoveredRowId : undefined}
          loading={loading} // 添加加载状态
        />
        {/* 分页组件 - 只有在有数据时才显示 */}
        {tableData.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px'
            }}
          >
            <span></span>
            <Pages
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>

      {/* 导出设置表单组件 - 通过visible属性控制弹框显示 */}
      <FormComponent
        from={
          tableType === 'source'
            ? PopupsFormFrom.SourceData
            : PopupsFormFrom.TargetData
        }
        downloadData={downloadData}
        onCancel={() => setVisible(false)}
        visible={visible}
        resetSelectedData={handAllReset}
      />
      {/* 数据详情弹框 */}
      <DbModal
        visible={visibleDbmodel}
        onCancel={() => {
          setVisibleDbmodel(false);
          setCurrentDbDetails(null); // 清除当前数据库详情
        }}
        data={currentDbDetails} // 传递当前数据库详情
      />
    </>
  );
});

export default UnifiedDataTable;
