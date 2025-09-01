import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Typography, Tabs, Tree, Form, Input, DatePicker, Table, Popover, Pagination, Message } from '@arco-design/web-react';
import { getCatalogList, getSourceDataFileList, getSourceFileTypeList } from '@/api/dataCatalog';
import { format } from 'date-fns';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { OperationColumn } from '@ccf2e/arco-material';
import getFileIcon from '@/components/file-icon';
import './departmentModal.scss';

interface DataSourceModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
    getChildTreeSelectData: (data: any) => void;
    initialSelectedData?: any[]; // 添加初始选中数据参数
}

// 树节点类型定义（用于Tree组件）
interface TreeNodeType {
    title: string;
    key: string;
    children?: TreeNodeType[];
    isLeaf?: boolean;
    rawData?: any; // 保存原始数据引用
}
const DepartmentModal: React.FC<DataSourceModalProps> = ({
    visible,
    onClose,
    title = '数据源',
    getChildTreeSelectData,
    children
}) => {
    const FormItem = Form.Item;
    const [form] = Form.useForm();
    const tableRef = useRef<any>(null);
    const [activeTab, setActiveTab] = useState('src');
    const [treeData, setTreeData] = useState<any>([]);
    const [originalTreeData, setOriginalTreeData] = useState<any>([]); // 添加原始数据状态
    const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState<string>('')
    const [sourceFileTypeFilters, setSourceFileTypeFilters] = useState();
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(10);
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
                    Message.error('数据加载失败');
                    return;
                }
                if (!res.data?.src || res.data.src.length === 0) {
                    Message.warning('没有找到数据');
                    setTreeData([]);
                    setOriginalTreeData([]);
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
                setOriginalTreeData(newTreeData); // 保存原始数据
            }).catch((err) => {
                Message.error('接口调用失败');
                console.error(err);
            });
        } catch (err) {
            console.log(err, 'err');
        }

    }, [activeTab, visible])

    const searchData = (searchValue, treeData) => {
        const loop = (data) => {
            const result: any = [];
            data.forEach((item) => {
                const isMatch = item.title?.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
                const childrenResult = item.children ? loop(item.children) : [];
                if (isMatch || childrenResult.length > 0) {
                    result.push({
                        ...item,
                        children: childrenResult.length > 0 ? childrenResult : undefined
                    });
                }
            });
            return result;
        };
        return loop(treeData);
    }

    useEffect(() => {
        if (!searchValue || searchValue === '' || searchValue === null || searchValue === undefined) {
            console.log(1, treeData);
            setTreeData(treeData);
        } else {
            const result = searchData(searchValue, treeData);
            console.log(2, result);
            setTreeData(result);
        }
    }, [searchValue]);

    const getTableSelectContent = () => {
        getChildTreeSelectData(checkedKeys);
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
            className='dataSource-modal'
            style={{ width: '90vw', height: '80vh' }}
            footer={
                <>
                    <Button onClick={() => { oncancel }}>取消</Button>
                    <Button type='primary' onClick={() => { getTableSelectContent() }}>确定</Button>
                </>
            }
        >
            <div className="dataSource-modal-content">
                <div>
                    <Input type="text" allowClear placeholder='请输入名称搜索' onClear={() => {
                        setTreeData(treeData)
                    }} onChange={(value) => {
                        setSearchValue(value)
                    }} />
                </div>
                <Tree
                    showLine
                    checkable
                    autoExpandParent={false}
                    style={{
                        height: '60vh',
                        overflowY: 'auto',
                    }}
                    renderTitle={({ title }: any) => {
                        return (
                            <span>
                                <span style={{ width: '300px', whiteSpace: 'nowrap' }}>
                                    {title}
                                </span>
                            </span>
                        );

                    }}
                    treeData={treeData}
                    // checkStrictly={checkStrictly}
                    onSelect={(value) => {
                        setCurrent(1);
                        setPageSize(10);
                    }}
                    onCheck={(key, val) => {
                        console.log(key, val, '=====');
                        setCheckedKeys(key);
                    }}
                />
            </div>
        </Modal>
    );
};

export {
    DepartmentModal
}