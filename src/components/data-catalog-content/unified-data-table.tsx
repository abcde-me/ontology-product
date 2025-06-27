import React, { useEffect, useState, useRef } from 'react';
import useStore from '@/pages/dataCatalog/store';
import { Tree, Typography, Button, Message, Modal } from '@arco-design/web-react';
import { IconFolder } from '@arco-design/web-react/icon';

// 导入统一的组件
import UnifiedTable from './unified-table';
import Pages from './components/pages';
import FormComponent from './components/dataset-form';
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
}

// 将日期字符串转换为时间戳的工具函数
function toUnixTimestamp(dateString: string) {
    const date = new Date(dateString.replace(' ', 'T'));
    return Math.floor(date.getTime() / 1000);
}

// 模拟数据
const mockData = [
    {
        id: 4,
        content: '插图展示唐僧与孙悟空在火焰山对战红孩儿的场景...',
        type: 'pdf',
        createdAt: '2025-02-25 09:18:45',
        file: '西游插图.jpg',
        workflowId: 'WF-20250225-001'
    },
    {
        id: 5,
        content: '音频片段包含经典西游记电视剧主题曲《敢不敢》的部分片段...',
        type: 'txt',
        createdAt: '2025-02-25 10:40:18',
        file: '西游配乐.mp3',
        workflowId: 'WF-20250225-002'
    },
    {
        id: 6,
        content: '视频片段展示1986年版西游记电视剧中孙悟空大闹天宫的经典场景...',
        type: 'doc',
        createdAt: '2025-02-25 15:05:32',
        file: '西游片段.mp4',
        workflowId: 'WF-20250225-003'
    },
    {
        id: 0,
        content: '第一回 灵根子守山神，孙悟空开石洞。一日，花果山顶突然石破天惊...',
        type: 'pdf',
        createdAt: '2025-02-24 17:40:22',
        file: '西游.pdf',
        workflowId: 'WF-20250224-001'
    },
    {
        id: 1,
        content: '唐僧取经路上遭遇了九九八十一难，其中最著名的是白骨精三打...',
        type: 'doc',
        createdAt: '2025-02-24 17:42:15',
        file: '西游.pdf',
        workflowId: 'WF-20250224-001'
    },
    {
        id: 2,
        content: '网络安全防护包括防火墙配置、入侵检测系统、加密措施等核心内容...',
        type: 'txt',
        createdAt: '2025-02-26 10:30:45',
        file: '信息安全必知.pdf',
        workflowId: 'WF-20250226-002'
    },
    {
        id: 3,
        content: '2025年第一季度销售数据显示，电子产品类别同比增长12.7%...',
        type: 'pdf',
        createdAt: '2025-03-10 12:20:18',
        file: '数据报告.pdf',
        workflowId: 'WF-20250310-003'
    }
];

// 统一数据表格组件属性类型
interface UnifiedDataTableProps {
    selectedNode?: any;
    onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: any[]) => void;
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
}

/**
 * 统一的数据表格组件
 */
function UnifiedDataTable(props: UnifiedDataTableProps) {
    const {
        selectedNode,
        onSelectionChange,
        searchValue = '',
        searchCondition = { type: '数据内容', keyword: '', isActive: false },
        startTime = '',
        endTime = '',
        tableType,
        dataType = 'volume'
    } = props;

    // 添加调试信息
    console.log(`UnifiedDataTable (${tableType}) 接收到的 props:`, {
        searchValue,
        searchCondition,
        startTime,
        endTime,
        tableType,
        dataType,
        selectedNode: selectedNode ? 'has value' : 'null'
    });

    // 使用zustand获取路径
    const selectedPath = useStore((state: any) => state.selectedPath);

    // 基础状态管理
    const [visible, setVisible] = useState(false); // 下载弹框控制
    const [downloadData, setDownloadData] = useState([]); // 下载的数据
    const [selectedFilePath, setSelectedFilePath] = useState(''); // 选中的文件路径
    const [tableData, setTableData] = useState<TableDataItem[]>([]); // 表格数据

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

    // 监听选中路径变化
    useEffect(() => {
        if (selectedPath) {
            console.log(`UnifiedDataTable (${tableType}) - selectedPath:`, selectedPath);
            // 获取到路径后直接传递给后端，然后前端根据路径获取数据
        }
    }, [selectedPath, tableType]);

    // 控制下载弹框的显示和隐藏 - 使用useCallback避免重新创建
    const downloadShow = React.useCallback((visible: boolean, downloaddata?: any) => {
        setVisible(visible);
        if (downloaddata) {
            console.log(`UnifiedDataTable (${tableType}) - downloadData:`, downloaddata);
            setDownloadData(downloaddata);
        }
    }, [tableType]);

    // 动态生成列配置 - 仅在表格类型和数据类型变化时重新生成
    const baseColumns = React.useMemo(() => {
        return getUnifiedColumns(tableType, dataType, downloadShow, null);
    }, [tableType, dataType, downloadShow]);

    // 处理带有hoveredRowId的列配置
    const columns = React.useMemo(() => {
        if (tableType === 'target' && dataType === 'volume') {
            // 只有Target表格才需要动态更新hoveredRowId
            return getUnifiedColumns(tableType, dataType, downloadShow, hoveredRowId);
        }
        return baseColumns;
    }, [baseColumns, tableType, dataType, downloadShow, hoveredRowId]);

    // 处理表格选择变化 - 使用useCallback避免重新创建
    const handleSelectionChange = React.useCallback((
        selectedRowKeys: React.Key[],
        selectedRows: any[]
    ) => {
        setSelectedRowKeys(selectedRowKeys);
        setSelectedRows(selectedRows);
        console.log(`UnifiedDataTable (${tableType}) - 表格选择变化:`, selectedRowKeys, selectedRows);

        // 调用外部传入的回调函数
        if (onSelectionChange) {
            console.log(`UnifiedDataTable (${tableType}) - 调用外部回调函数`);
            onSelectionChange(selectedRowKeys, selectedRows);
        }
    }, [tableType, onSelectionChange]);

    // 处理从外部传入的selectedNode
    useEffect(() => {
        if (selectedNode) {
            console.log(`UnifiedDataTable (${tableType}) - Selected node changed:`, selectedNode);
            // 这里可以根据selectedNode来更新表格数据
        }
    }, [selectedNode, tableType]);

    // 页码变化处理 - 使用useCallback避免重新创建
    const handlePageChange = React.useCallback((page: number, size: number) => {
        console.log(`UnifiedDataTable (${tableType}) - 页码变化:`, page, '每页条数:', size);
        setCurrentPage(page);
        setPageSize(size);
        // 这里可以添加获取数据的逻辑
    }, [tableType]);

    // 每页条数变化处理 - 使用useCallback避免重新创建
    const handlePageSizeChange = React.useCallback((page: number, size: number) => {
        console.log(`UnifiedDataTable (${tableType}) - 每页条数变化:`, page, '每页条数:', size);
        setCurrentPage(page);
        setPageSize(size);
        // 这里可以添加获取数据的逻辑
    }, [tableType]);

    // 分解searchCondition对象，避免引用比较导致的无限循环
    const searchConditionType = searchCondition?.type || '';
    const searchConditionKeyword = searchCondition?.keyword || '';
    const searchConditionIsActive = searchCondition?.isActive || false;

    // 监听搜索条件变化 - 根据表格类型使用不同的搜索逻辑
    useEffect(() => {
        console.log(`UnifiedDataTable (${tableType}) - 搜索条件变化`);

        // 这里可以调用真实的API
        // getDataCatalogList({
        //   start_time: startTime ? toUnixTimestamp(startTime) : undefined,
        //   end_time: endTime ? toUnixTimestamp(endTime) : undefined,
        //   file_name: tableType === 'source' ? searchValue : searchConditionKeyword,
        //   file_path: selectedFilePath,
        //   page: currentPage,
        //   page_size: pageSize,
        // }).then(res => {
        //   console.log('API返回数据:', res);
        //   setTableData(res.data.list || []);
        //   setTotal(res.data.total || 0);
        // })

        // 测试用的本地数据过滤逻辑
        let filteredData = [...mockData];

        // 根据表格类型使用不同的搜索逻辑
        if (tableType === 'source') {
            // Source表格：简单关键词搜索
            if (searchValue) {
                filteredData = filteredData.filter(
                    (item) =>
                        item.content.includes(searchValue) ||
                        item.file.includes(searchValue) ||
                        item.workflowId.includes(searchValue)
                );
            }
        } else if (tableType === 'target') {
            // Target表格：高级搜索（按类型搜索）
            if (searchConditionIsActive && searchConditionKeyword) {
                if (searchConditionType === '数据内容') {
                    filteredData = filteredData.filter(item =>
                        item.content.includes(searchConditionKeyword)
                    );
                } else if (searchConditionType === 'ID') {
                    filteredData = filteredData.filter(item =>
                        item.id.toString().includes(searchConditionKeyword)
                    );
                }
            }
        }

        // 根据日期范围过滤（通用逻辑）
        if (startTime && endTime) {
            filteredData = filteredData.filter((item) => {
                const itemDate = new Date(item.createdAt);
                const start = new Date(startTime);
                const end = new Date(endTime);
                return itemDate >= start && itemDate <= end;
            });
        }

        // 根据文件路径过滤（如果需要）
        if (selectedFilePath) {
            console.log(`UnifiedDataTable (${tableType}) - 根据文件路径过滤:`, selectedFilePath);
        }

        console.log(`UnifiedDataTable (${tableType}) - 过滤后的数据:`, filteredData);
        setTableData(filteredData);
        setTotal(filteredData.length);
    }, [
        searchValue,
        searchConditionType,
        searchConditionKeyword,
        searchConditionIsActive,
        startTime,
        endTime,
        selectedFilePath,
        currentPage,
        pageSize,
        tableType
    ]);

    return (
        <>
            <div>
                {/* 使用统一的表格组件 */}
                <UnifiedTable
                    columns={columns}
                    data={tableData}
                    onSelectionChange={handleSelectionChange}
                    tableType={tableType}
                    // Target表格特有的悬浮功能
                    hoveredRowId={tableType === 'target' ? hoveredRowId : undefined}
                    onRowHover={tableType === 'target' ? setHoveredRowId : undefined}
                />

                {/* 分页组件 */}
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
            </div>

            {/* 导出设置表单组件 - 通过visible属性控制弹框显示 */}
            <FormComponent
                downloadData={downloadData}
                onCancel={() => setVisible(false)}
                visible={visible}
            />
        </>
    );
}

export default UnifiedDataTable; 