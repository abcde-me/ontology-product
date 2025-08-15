import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Typography, Tabs, Tree, Form, Input, DatePicker, Table, Popover } from '@arco-design/web-react';
import { useEdges } from 'reactflow';
import { getDirectoryList } from '@/api/loadApi';
import { A } from '@svgdotjs/svg.js';
import { getCatalogList, getSourceDataFileList, getSourceFileTypeList } from '@/api/dataCatalog';
import Mock from 'mockjs';
import { format } from 'date-fns';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { OperationColumn } from '@ccf2e/arco-material';

import './dataSourceModal.scss';
import { sort } from 'semver';
import getFileIcon from '@/components/file-icon';
interface DataSourceModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
    getChildTableSelectData: (data: any) => void;
}
const TabPane = Tabs.TabPane;
const style: React.CSSProperties = {
    textAlign: 'center',
    marginTop: 20,
};
// 树节点类型定义（用于Tree组件）
interface TreeNodeType {
    title: string;
    key: string;
    children?: TreeNodeType[];
    isLeaf?: boolean;
    rawData?: any; // 保存原始数据引用
}
const DataSourceModal: React.FC<DataSourceModalProps> = ({
    visible,
    onClose,
    title = '数据源',
    getChildTableSelectData,
    children
}) => {
    const FormItem = Form.Item;
    const [form] = Form.useForm();
    const tableRef = useRef<any>(null);
    const [activeTab, setActiveTab] = useState('src');
    const [treeData, setTreeData] = useState<any>([]);
    const [tableData, setTableData] = useState<any>([]);
    const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState<string>('')
    const [sourceFileTypeFilters, setSourceFileTypeFilters] = useState();
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };
    const time = Form.useWatch('time', form);
    // 取树的内容 格式化
    const transformData = (originalSrc) => {
        // 递归处理单条数据（支持目录/数据卷）
        const transformItem = (item) => {
            const transformed = { ...item };
            // 替换type_name（如果是数据卷）
            if (transformed.type_name === 'volume') {
                transformed.type_name = '数据卷';
            }
            // 处理children中的"volume"键为"数据卷"
            if (transformed.children && transformed.children.volume) {
                // 递归处理子数据卷
                transformed.children['数据卷'] = transformed.children.volume.map(vol => transformItem(vol));
                // 删除原始volume键
                delete transformed.children.volume;
            }
            return transformed;
        };

        // 处理整个src数组（目录列表）
        return originalSrc.map(catalog => transformItem(catalog));
    };

    useEffect(() => {
        let newTreeData: TreeNodeType[] = [];
        try {
            getCatalogList({
                root_type: activeTab === 'src' ? 1 : 2,
            }).then((res) => {
                if (res.status !== 200) {
                    return;
                }
                newTreeData = transformData(res.data?.src).map((item) => {
                    return item.children
                        ? {
                            allowClick: false,
                            title: item.name,
                            key: item.id,
                            children: item.children.数据卷.map((items, index) => {
                                return {
                                    title: '数据卷',
                                    key: `volume-${items.id}-${index}`,
                                    allowClick: false,
                                    children: [{
                                        title: items.name,
                                        key: items.id,
                                    }]
                                };
                            })
                        }
                        : { title: item.name, key: item.id };
                });
                setTreeData(newTreeData);
            });
        } catch (err) {
            console.log(err, 'err');
        }

    }, [activeTab, visible])

    // 树的内容
    const renderTreeContent = () => {
        return (
            <Tree
                autoExpandParent={false}
                treeData={treeData}
                // checkStrictly={checkStrictly}
                checkable
                onSelect={(value) => {
                    console.log(value, '----top');
                    setCheckedKeys(value);
                }}
            />
        )
    };
    //转换文件大小
    const formatFileSize = (size: number): string => {
        if (size < 1024) {
            return `${size}B`;
        } else if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)}KB`;
        } else if (size < 1024 * 1024 * 1024) {
            return `${(size / 1024 / 1024).toFixed(2)}MB`;
        } else {
            return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
        }
    };
    //格式化时间函数
    const formatDateTime = (dateTimeString: string): string => {
        try {
            const date = new Date(dateTimeString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
            return dateTimeString; // 如果格式化失败，返回原字符串
        }
    };
    // 通用的操作列渲染
    const renderActionColumn = (
        _,
        record,
    ) => {
        const params = record?.perms || [];
        const config: {
            label: string;
            onClick: () => void;
        }[] = [];
        if (1) {
            config.push({
                label: '详情',
                onClick: (() => { })
            });
        }

        return (
            <OperationColumn row={record} index={0} config={config} extendFont="更多" />
        );
    };
    useEffect(() => {
        getSourceFileTypeList({
            id: checkedKeys
        }).then((result) => {
            setSourceFileTypeFilters(result);
        });
    }, [checkedKeys]);
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 80
        },
        {
            title: '文件名',
            dataIndex: 'file_name',
            ellipsis: true,
            width: 200,
            render: (_, record) => (
                // 产品需求：文件名提示常驻
                <Popover content={record.file_sub_path}>
                    <span>{record.file_name}</span>
                </Popover>
            )
        },
        {
            title: '文件类型',
            dataIndex: 'file_type',
            width: 120,
            filters: sourceFileTypeFilters,
            render: (_, record) => (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    {getFileIcon(record.file_type)}
                    <span>{record.file_type}</span>
                </div>
            )
        },
        {
            title: '文件大小',
            width: 120,
            dataIndex: 'file_size',
            render: (_, record) => <div>{formatFileSize(record.file_size)}</div>
        },
        {
            title: '上传用户',
            dataIndex: 'upload_user',
            ellipsis: true,
            width: 100
        },
        {
            title: '载入开始时间',
            dataIndex: 'task_load_start_time',
            width: 180,
            sorter: true,

            // sortOrder: 'ascend',
            // sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
            sortDirections: ['ascend' as const, 'descend' as const],
            render: (_, record) => formatDateTime(record.task_load_start_time)
        },
        {
            title: '连接器名称',
            dataIndex: 'connector_name',
            ellipsis: true,
            width: 160,
            render: (_, record) => (
                <EllipsisPopover
                    value={record.connector_name}
                    isEdit={false}
                    preferTypography
                />
            )
        },
        {
            title: '操作',
            dataIndex: 'actions',
            fixed: 'right' as const,
            width: 88,
            render: (_, record) =>
                renderActionColumn(
                    _,
                    record,
                )
        }
    ];
    // 获取当前年份
    const currentYear = new Date().getFullYear();

    // 生成当前年份的随机日期（格式：YYYY-MM-DD）
    const generateCurrentYearDate = () => {
        // 月份范围：1-12（注意Mock.js的月份是从1开始）
        const month = Mock.Random.integer(1, 12)

        // 根据月份确定最大天数（处理2月和大/小月）
        const getMaxDay = (m) => {
            if ([4, 6, 9, 11].includes(m)) return 30;
            if (m === 2) return 28; // 简化处理，不考虑闰年
            return 31;
        };

        const maxDay = getMaxDay(month);
        const day = Mock.Random.integer(1, maxDay);

        // 格式化月份和日期为两位数
        const format = (num) => num.toString().padStart(2, '0');
        return `${currentYear}-${format(month)}-${format(day)}`;
    };
    const searchData = (searchValue) => {
        const loop = (data) => {
            const result: any = [];
            data.forEach((item) => {
                if (item.title.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
                    result.push({ ...item });
                } else if (item.children) {
                    const filterData = loop(item.children);

                    if (filterData.length) {
                        result.push({ ...item, children: filterData });
                    }
                }
            });
            return result;
        };

        return loop(treeData);
    }

    useEffect(() => {
        if (!searchValue || searchValue === '') {
            setTreeData(treeData);
        } else {
            const result = searchData(searchValue);
            setTreeData(result);
        }
    }, [searchValue]);

    // 获取表格数据
    const getTableData = async () => {
        const sourceParams: any = {
            page: 1,
            page_size: 10,
            file_name: '',
            data_path_id: Number(checkedKeys) // 优先使用选中ID 后期改成selectedKey
            // start: startTime, //后期改成startTime
            // end: endTime, //后期改成endTime
            // file_type: validFileTypes.length > 0 ? validFileTypes : [''] // 使用筛选条件中的文件类型
        };
        const res = await getSourceDataFileList(sourceParams);
        console.log(res, 'top-----res');
        if (res.status === 200) {
            setTableData(res?.data?.items)
        }
    };
    useEffect(() => {
        getTableData()
    }, [checkedKeys, activeTab]);
    const [dateRange, setDateRange] = useState([]); // 存储选择的日期范围 [start, end]
    // 处理日期范围变化
    const handleDateChange = (value) => {
        setDateRange(value);
        // 当选择了完整的日期范围（开始和结束），执行筛选
        if (value && value.length === 2) {
            const [start, end] = value;
            // 格式化日期为 YYYY-MM-DD（确保与数据格式一致）
            const startStr = format(start, 'yyyy-MM-dd');
            const endStr = format(end, 'yyyy-MM-dd');
            // 筛选数据：createTime 在 [startStr, endStr] 之间
            const filteredData = tableData.filter(item => {
                return item.createTime >= startStr && item.createTime <= endStr;
            });
            setTableData(filteredData);
        } else if (value === null || value === undefined || value === '') {
            // 清空日期选择时，恢复原始数据
            setTableData(tableData);
        }
    };
    const getTableSelectContent = () => {
        getChildTableSelectData(selectedRowKeys);
        onClose()
    }
    return (
        <Modal
            title={title}
            visible={visible}
            onCancel={onClose}
            alignCenter={true}
            escToExit={false}
            maskClosable={false}
            className='fullscreen-modal'
            style={{ width: '90vw' }}
            footer={
                <Button type='primary' onClick={() => { getTableSelectContent() }}>确定</Button>
            }
        >
            <div className="fullscreen-modal-content">
                <div className='content-tree'>
                    <div>
                        <Input type="text" placeholder='请输入名称搜索' onChange={(value) => {
                            setSearchValue(value)
                        }} />
                    </div>
                    {renderTreeContent()}
                </div>
                <div className='content-table'>
                    <div className='content-table-form'>
                        <Form className='form-option' autoComplete='off' layout='inline'>
                            <div className='form-inputs'>
                                <FormItem field='time'>
                                    <DatePicker.RangePicker onChange={handleDateChange} style={{ width: 350 }} />
                                </FormItem>
                            </div>
                            {/* <FormItem>
                                <Button type='primary' onClick={() => { getTableSelectContent() }}>确定</Button>
                            </FormItem> */}
                        </Form>
                    </div>
                    <Table
                        ref={tableRef}
                        rowKey='id'
                        columns={columns}
                        data={tableData}
                        rowSelection={{
                            onChange: (selectedRowKeys, selectedRows) => {
                                console.log('onChange:', selectedRowKeys, selectedRows);
                                setSelectedRowKeys(selectedRows);
                            },
                            // onSelect: (selected, record, selectedRows) => {
                            //     setSelectedRowKeys(selectedRowKeys);
                            //     console.log('onSelect:', selected, record, selectedRows);
                            // },
                        }}
                    />
                </div>
            </div>
        </Modal>
    );
};

export {
    DataSourceModal
}
