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
import { getTargetDataFileList, getDataCatalogList, getSourceDataFileList } from '@/api/dataCatalog';
// 导入统一的组件
import UnifiedTable from './unified-table';
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

  // 添加调试信息
  console.log(`UnifiedDataTable (${tableType}) 接收到的 props:`, {
    searchValue,
    searchCondition,
    startTime,
    endTime,
    tableType,
    dataType,
    selectedFullPath,
    selectedKey,
    selectedNode: selectedNode ? 'has value' : 'null'
  });

  // 使用zustand获取路径
  const selectedPath = useStore((state: any) => state.selectedPath);
  // 基础状态管理
  const [visible, setVisible] = useState(false); // 下载弹框控制
  const [downloadData, setDownloadData] = useState([]); // 下载的数据
  const [selectedFilePath, setSelectedFilePath] = useState(''); // 选中的文件路径
  const [tableData, setTableData] = useState<TableDataItem[]>([]); // 表格数据
  const [loading, setLoading] = useState(false); // 添加加载状态

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(100);

  // 表格选择状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Target表格特有的行悬浮状态
  const [hoveredRowId, setHoveredRowId] = useState<any>(null);
  const childRef = useRef(null);
  // 分解searchCondition对象，避免引用比较导致的无限循环
  const searchConditionType = searchCondition?.type || '';
  const searchConditionKeyword = searchCondition?.keyword || '';
  const searchConditionIsActive = searchCondition?.isActive || false;
  const isFirstRender = useRef(true);
  // 监听选中路径变化
  useEffect(() => {
    console.log('选中的路径selectedFullPath9999999999999', selectedFullPath);
    // 获取到路径后直接传递给后端，然后前端根据路径获取数据
  }, [selectedFullPath]);
  // 将getTableList方法暴露给父组件
  useImperativeHandle(ref, () => ({
    getTableList
  }));

  const getTableList = async () => {
    try {
      // 开始加载
      setLoading(true);
      // 构建请求参数
      const params = {
        full_path: '/src/test1/volume/test11',  // 使用默认路径,后续修改为selectedFullPath
        page: currentPage,
        limit: pageSize,
        start_time: startTime,
        end_time: endTime,
        search_content: searchValue,
        search_id: searchConditionKeyword,
        file_type:[]
      }
      const sourceParams = {
        page: currentPage,
        page_size: pageSize,
        file_name: searchValue,
        data_path_id: Number(122), //后续修改为selectedKey
        start: startTime,
        end: endTime,
        file_type:['json1']
      }
      // 修复类型报错，先扩展params类型
      const newParams: any = { ...params };
      const newSourceParams: any = { ...sourceParams };
      // 添加搜索条件
      // if (searchConditionIsActive && searchConditionKeyword) {
      //   if (searchConditionType === '数据内容') {
      //     newParams.search_content = searchConditionKeyword;
      //   } else if (searchConditionType === 'ID') {
      //     newParams.search_id = searchConditionKeyword;
      //   }
      // }
      // 添加时间范围
      // if(startTime){
      //   newParams.start_time = startTime
      //   newSourceParams.start = startTime
      // }
      // if(endTime){
      //   newParams.end_time = endTime
      //   newSourceParams.end = endTime
      // }
      // if(selectedKey){
      //   newSourceParams.data_path_id = selectedKey
      // }
      // 根据表格类型调用不同的API
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
        if (res.data.list && res.data.list.length > 0) {
          // 有数据
          setTableData(res.data.list || []);
          setTotal(res.data.total || 0);
          console.log(`获取${tableType}表格数据成功:`, res.data);
        } else {
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
    }
  };
  
  // 监听依赖项变化，重新获取数据
  useEffect(() => {
    if(isFirstRender.current){
      isFirstRender.current = false;
      return;
    }
    getTableList();
  }, [
    searchValue,
    // searchConditionType,
    searchConditionKeyword,
    searchConditionIsActive,
    selectedKey,
    startTime,
    endTime,
    selectedFilePath,
    currentPage,
    pageSize,
    tableType, // 当表格类型变化时重新获取数据
    selectedFullPath // 当选中路径变化时重新获取数据
  ]);
  
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
    return getUnifiedColumns(tableType, dataType, downloadShow, null, getTableList, selectedKey);
  }, [tableType, dataType, downloadShow, selectedKey]);

  // 处理带有hoveredRowId的列配置
  const columns = React.useMemo(() => {
    if (tableType === 'target' && dataType === 'volume') {
      // 只有Target表格才需要动态更新hoveredRowId
      return getUnifiedColumns(tableType, dataType, downloadShow, hoveredRowId, getTableList, selectedKey);
    }
    return baseColumns;
  }, [baseColumns, tableType, dataType, downloadShow, hoveredRowId, selectedKey]);

  // 处理表格选择变化 - 使用useCallback避免重新创建
  const handleSelectionChange = React.useCallback(
    (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
      console.log(
        `UnifiedDataTable (${tableType}) - 表格选择变化:`,
        selectedRowKeys,
        selectedRows
      );

      // 调用外部传入的回调函数
      if (onSelectionChange) {
        console.log(`UnifiedDataTable (${tableType}) - 调用外部回调函数`);
        onSelectionChange(selectedRowKeys, selectedRows);
      }
    },
    [tableType, onSelectionChange]
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
      // 这里可以添加获取数据的逻辑
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
      // 这里可以添加获取数据的逻辑
    },
    [tableType]
  );

  return (
    <>
      <div>
        {/* 使用统一的表格组件 */}
        <UnifiedTable
          columns={columns}
          data={tableData as any}
          onSelectionChange={handleSelectionChange}
          tableType={tableType}
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
      />
    </>
  );
});

export default UnifiedDataTable;
