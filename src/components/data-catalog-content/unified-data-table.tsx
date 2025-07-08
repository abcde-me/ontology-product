import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react';
import useStore from '@/pages/dataCatalog/store';
import {
  Tree,
  Typography,
  Button,
  Message,
  Modal
} from '@arco-design/web-react';
import { IconFolder } from '@arco-design/web-react/icon';
import {
  getTargetDataFileList,
  getDataCatalogList,
  getSourceDataFileList
} from '@/api/dataCatalog';
// 导入统一的组件
import UnifiedTable, { UnifiedTableRef } from './unified-table';
import Pages from './components/pages';
import FormComponent from './components/popups-form';
import { getUnifiedColumns } from './unified-columns';
import './index.css';

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
    selectedKey
  } = props;

  // 基础状态管理
  const [visible, setVisible] = useState(false); // 下载弹框控制
  const [downloadData, setDownloadData] = useState([]); // 下载的数据
  const [selectedFilePath, setSelectedFilePath] = useState(''); // 选中的文件路径
  const [tableData, setTableData] = useState<TableDataItem[]>([]); // 表格数据
  const [loading, setLoading] = useState(false); // 添加加载状态
  const [fileTypeFilters, setFileTypeFilters] = useState<string[]>([]); // 文件类型筛选条件

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

  useEffect(() => {
    isFirstRender.current = false;
  }, []);
  // 监听选中路径变化
  useEffect(() => {
    console.log('选中的路径selectedFullPath9999999999999', selectedFullPath);
    // 获取到路径后直接传递给后端，然后前端根据路径获取数据
  }, [selectedFullPath]);
  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    console.log(
      '数据卷发生变化，重置输入框内容',
      selectedKey,
      selectedFullPath
    );
    // 重置页码
    setCurrentPage(1);
    // 触发自定义事件通知父组件重置搜索输入
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
  }, [selectedKey, selectedFullPath]);
  // 监听搜索类型变化
  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    if (searchConditionType && tableType === 'target') {
      console.log('搜索类型发生变化:', searchConditionType);
      const resetSearchEvent = new CustomEvent('resetSearchKeyword', {
        detail: { tableType, searchType: searchConditionType }
      });
      window.dispatchEvent(resetSearchEvent);
      setCurrentPage(1);
      setTableData([]);
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
    }
  }));

  const getTableList = async () => {
    // 防止重复请求
    if (isDataFetching.current) {
      console.log(`${tableType}表格 - 已有请求正在进行，跳过`);
      return;
    }

    try {
      // 标记开始加载
      isDataFetching.current = true;
      setLoading(true);

      const validFileTypes = fileTypeFilters || [];
      // 目标数据表参数
      const params = {
        full_path: selectedFullPath, // 使用默认路径,后续修改为selectedFullPath
        page: currentPage,
        limit: pageSize,
        start_time: startTime || '',
        end_time: endTime || '',
        search_content:
          searchConditionType === '数据内容' ? searchConditionKeyword : '',
        search_id: searchConditionType === 'ID' ? searchConditionKeyword : ''
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
      if (tableType === 'target') {
        // 调用目标数据API
        res = await getTargetDataFileList(newParams);
        console.log('调用目标数据API，参数:', newParams);
      } else {
        // 调用源数据API
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
  // 合并的useEffect处理所有数据获取逻辑
  useEffect(() => {
    // 首次渲染标记
    if (isFirstRender.current) {
      isFirstRender.current = false;
      getTableList(); // 首次渲染也获取数据
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
    tableType
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

  // 动态生成列配置 - 仅在表格类型和数据类型变化时重新生成
  const baseColumns = React.useMemo(() => {
    return getUnifiedColumns(
      tableType,
      dataType,
      downloadShow,
      null,
      getTableList,
      selectedKey,
      selectedFullPath,
      undefined,
      handAllReset
    );
  }, [
    tableType,
    dataType,
    downloadShow,
    selectedKey,
    selectedFullPath,
    handAllReset
  ]);

  // 处理带有hoveredRowId的列配置
  const columns = React.useMemo(() => {
    if (tableType === 'target' && dataType === 'volume') {
      // 只有Target表格才需要动态更新hoveredRowId
      return getUnifiedColumns(
        tableType,
        dataType,
        downloadShow,
        hoveredRowId,
        getTableList,
        selectedKey,
        selectedFullPath,
        undefined,
        handAllReset
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
    handAllReset
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

  // 处理从外部传入的selectedNode
  useEffect(() => {
    if (selectedNode) {
      console.log(
        `UnifiedDataTable (${tableType}) - Selected node changed:`,
        selectedNode
      );
      // 这里可以根据selectedNode来更新表格数据
    }
  }, [selectedNode, tableType]);

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
    // console.log('Table changed:', { pagination, filters, sorter, tableType });
    let newFileTypes: string[] = [];
    if (sorter && sorter.file_type && Array.isArray(sorter.file_type)) {
      newFileTypes = sorter.file_type;
      // console.log('从sorter.file_type获取筛选条件:', newFileTypes);
    } else if (sorter && sorter.type && Array.isArray(sorter.type)) {
      newFileTypes = sorter.type;
      // console.log('从sorter.type获取筛选条件:', newFileTypes);
    }
    // // 检查filters中的file_type
    // else if (filters && filters.file_type && Array.isArray(filters.file_type) && filters.file_type.length > 0) {
    //   newFileTypes = filters.file_type;
    //   console.log('从filters.file_type获取筛选条件:', newFileTypes);
    // }
    // // 检查filters中的type
    // else if (filters && filters.type && Array.isArray(filters.type) && filters.type.length > 0) {
    //   newFileTypes = filters.type;
    //   console.log('从filters.type获取筛选条件:', newFileTypes);
    // }
    else if (sorter && typeof sorter.file_type === 'string') {
      newFileTypes = [sorter.file_type];
      // console.log('从sorter.file_type字符串获取筛选条件:', newFileTypes);
    } else if (sorter && typeof sorter.type === 'string') {
      newFileTypes = [sorter.type];
      // console.log('从sorter.type字符串获取筛选条件:', newFileTypes);
    }

    // 设置文件类型筛选条件
    // console.log(`${tableType}表格设置文件类型筛选条件:`, newFileTypes);
    setFileTypeFilters(newFileTypes);

    // 当筛选条件变化时，重置到第一页
    if (
      (filters && Object.keys(filters).length > 0) ||
      (sorter && Object.keys(sorter).length > 0)
    ) {
      setCurrentPage(1);
    }
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
      <div>
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
        downloadData={downloadData}
        onCancel={() => setVisible(false)}
        visible={visible}
        resetSelectedData={handAllReset}
      />
    </>
  );
});

export default UnifiedDataTable;
