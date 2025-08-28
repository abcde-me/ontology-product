import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Typography, Tabs, Tree, Form, Input, DatePicker, Table, Popover, Pagination, Message } from '@arco-design/web-react';
import { getCatalogList, getSourceDataFileList, getSourceFileTypeList } from '@/api/dataCatalog';
import { format } from 'date-fns';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { OperationColumn } from '@ccf2e/arco-material';
import getFileIcon from '@/components/file-icon';
import './individualModal.scss';

interface DataSourceModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
    getChildTableSelectData: (data: any) => void;
    initialSelectedData?: any[]; // 添加初始选中数据参数
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
const IndividualModal: React.FC<DataSourceModalProps> = ({
    visible,
    onClose,
    title = '数据源',
    getChildTableSelectData,
    initialSelectedData = [], // 接收初始数据
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
    const [selectedRowsContent, setSelectedRowsContent] = useState<any[]>(initialSelectedData);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(10);
    // 在组件状态定义中添加
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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
                showLine
                autoExpandParent={false}
                treeData={treeData}
                // checkStrictly={checkStrictly}
                onSelect={(value) => {
                    setCurrent(1);
                    setPageSize(10);
                    setCheckedKeys(value);
                }}
            />
        )
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
            title: '姓名',
            dataIndex: 'name',
            ellipsis: true,
            width: 100
        },
        {
            title: '账号ID',
            dataIndex: 'id',
            width: 80
        },
    ];
    // 获取当前年份
    const currentYear = new Date().getFullYear();

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
            page: current,
            page_size: pageSize,
            file_name: '',
            data_path_id: Number(checkedKeys) // 优先使用选中ID 后期改成selectedKey
            // start: startTime, //后期改成startTime
            // end: endTime, //后期改成endTime
            // file_type: validFileTypes.length > 0 ? validFileTypes : [''] // 使用筛选条件中的文件类型
        };
        const res = await getSourceDataFileList(sourceParams);
        if (res.status === 200) {
            setTableData(res?.data?.items);
            setCurrent(res?.data?.page);
            setPageSize(res?.data?.page_size);
            setTotal(res?.data?.total);
        }
    };
    useEffect(() => {
        getTableData()
    }, [checkedKeys, activeTab, current, pageSize]);
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
        getChildTableSelectData(selectedRowsContent);
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
            style={{ width: '90vw', overflowY: 'auto' }}
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
                        </Form>
                    </div>
                    <Table
                        ref={tableRef}
                        rowKey='id'
                        columns={columns}
                        data={tableData}
                        pagination={false}
                        rowSelection={{
                            selectedRowKeys: selectedRowKeys,
                            preserveSelectedRowKeys: true,
                            onChange: (selectedRowKeys, selectedRows) => {
                                // 合并新旧选中数据并处理取消选中
                                const mergedMap = new Map<string, any>();

                                // 1. 保留仍处于选中状态的现有数据
                                selectedRowsContent
                                    .filter(item => selectedRowKeys.includes(item.id))
                                    .forEach(item => mergedMap.set(item.id, item));

                                // 2. 添加当前页新选中数据
                                selectedRows.forEach(item => mergedMap.set(item.id, item));

                                // 3. 更新状态
                                const mergedRows = Array.from(mergedMap.values());
                                if (mergedRows.length <= 200) {
                                    setSelectedRowsContent(mergedRows);
                                    setSelectedRowKeys(mergedRows.map(item => item.id));
                                } else {
                                    Message.error('选中的数量不能超过200条');
                                }
                            },
                        }}
                    />
                    {tableData && tableData.length > 0 && (
                        <Pagination
                            current={current}
                            pageSize={pageSize}
                            onPageSizeChange={(pageSize) => {
                                setPageSize(pageSize);
                                setCurrent(1);
                                // 保留选中状态，不重置selectedRowKeys
                            }}
                            onChange={(page) => {
                                setCurrent(page);
                                // 保留选中状态，不重置selectedRowKeys
                            }}
                            sizeOptions={[10, 20, 50, 100]}
                            showTotal
                            total={total}
                            showJumper
                            sizeCanChange
                            style={{ justifyContent: 'flex-end', marginTop: '10px' }}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

export {
    IndividualModal
}