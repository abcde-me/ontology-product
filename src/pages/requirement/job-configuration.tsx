import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Typography, Tag } from '@arco-design/web-react';

const { Title } = Typography;

// 添加props接口定义
interface JobConfigurationProps {
    getJobTableContent: (content: Array<{ key: string, name: string, taskCount: number, type: 'dept' | 'person' }>) => void;
}

// 接收getJobTableContent方法作为props
const JobConfiguration: React.FC<JobConfigurationProps> = ({ getJobTableContent }) => {
    // 状态管理
    const [deptModalVisible, setDeptModalVisible] = useState(false);
    const [personModalVisible, setPersonModalVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedItems, setSelectedItems] = useState<Array<{ key: string, name: string, taskCount: number, type: 'dept' | 'person' }>>([]);
    const [currentModalType, setCurrentModalType] = useState<'dept' | 'person' | null>(null);

    // 新增：复选框相关状态
    const [selectedDeptKeys, setSelectedDeptKeys] = useState<string[]>([]);
    const [selectedPersonKeys, setSelectedPersonKeys] = useState<string[]>([]);
    const [deptViewMode, setDeptViewMode] = useState<'all' | 'selected'>('all');
    const [personViewMode, setPersonViewMode] = useState<'all' | 'selected'>('all');

    // 模拟数据 - 部门列表
    const deptData = [
        { key: '1', name: '技术部' },
        { key: '2', name: '产品部' },
        { key: '3', name: '设计部' },
        { key: '4', name: '市场部' },
        { key: '5', name: '财务部' },
    ];

    // 模拟数据 - 人员列表
    const personData = [
        { key: '1', name: '张三' },
        { key: '2', name: '李四' },
        { key: '3', name: '王五' },
        { key: '4', name: '赵六' },
        { key: '5', name: '钱七' },
    ];

    // 表格列定义 - 弹窗表格
    const modalTableColumns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        },
    ];

    // 表格列定义 - 主表格
    const mainTableColumns = [
        {
            title: '任务数量',
            dataIndex: 'taskCount',
            key: 'taskCount',
            sorter: (a: any, b: any) => a.taskCount - b.taskCount,
            render: (text: string) => (
                <Input
                    type="number"
                    min={0}
                    value={text}
                    onChange={(e) => handleTaskCountChange(e, a.key)}
                    style={{ width: 80 }}
                />
            )
        },
        {
            title: '标注人员',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <span>
                    {text}
                    <Tag color={record.type === 'dept' ? 'blue' : 'green'} style={{ marginLeft: 8 }}>
                        {record.type === 'dept' ? '部门' : '个人'}
                    </Tag>
                </span>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record: any) => (
                <Button
                    type="text"
                    onClick={() => handleRemoveItem(record.key)}
                >
                    删除
                </Button>
            ),
        },
    ];

    // 新增：处理任务数量变更
    const handleTaskCountChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const newCount = parseInt(e.target.value || '0', 10);
        setSelectedItems(
            selectedItems.map(item =>
                item.key === key ? { ...item, taskCount: newCount } : item
            )
        );
    };

    // 新增：移除已选项目
    const handleRemoveItem = (key: string) => {
        setSelectedItems(selectedItems.filter(item => item.key !== key));
    };

    // 打开部门选择弹窗
    const handleOpenDeptModal = () => {
        setCurrentModalType('dept');
        // 获取已选择的部门keys并设置到弹窗选中状态
        const existingDeptKeys = selectedItems
            .filter(item => item.type === 'dept')
            .map(item => item.key);
        setSelectedDeptKeys(existingDeptKeys);
        setDeptModalVisible(true);
    };

    // 打开个人选择弹窗
    const handleOpenPersonModal = () => {
        setCurrentModalType('person');
        // 获取已选择的个人keys并设置到弹窗选中状态
        const existingPersonKeys = selectedItems
            .filter(item => item.type === 'person')
            .map(item => item.key);
        setSelectedPersonKeys(existingPersonKeys);
        setPersonModalVisible(true);
    };

    // 关闭弹窗
    const handleCloseModal = () => {
        setDeptModalVisible(false);
        setPersonModalVisible(false);
        setSearchValue('');
        // 清空选中状态
        setSelectedDeptKeys([]);
        setSelectedPersonKeys([]);
    };

    // 处理搜索
    const handleSearch = (value: string) => {
        setSearchValue(value);
    };

    // 处理确定选择
    const handleConfirmSelection = () => {
        if (!currentModalType) return;

        // 获取选中的数据
        const isDept = currentModalType === 'dept';
        const selectedKeys = isDept ? selectedDeptKeys : selectedPersonKeys;
        const dataSource = isDept ? deptData : personData;

        // 筛选出选中的数据并添加到主表格
        const newItems = dataSource
            .filter(item => selectedKeys.includes(item.key))
            .map(item => ({
                ...item,
                taskCount: 0,
                type: isDept ? 'dept' : 'person'
            }));

        // 修改：保留不同类型的现有项，替换同类型项
        const existingItemsOfOtherType = selectedItems.filter(item => item.type !== currentModalType);
        setSelectedItems([...existingItemsOfOtherType, ...newItems]);
        handleCloseModal();
    };

    // 新增：获取当前视图数据
    const getCurrentViewData = (isDept: boolean) => {
        const dataSource = isDept ? deptData : personData;
        const selectedKeys = isDept ? selectedDeptKeys : selectedPersonKeys;
        const viewMode = isDept ? deptViewMode : personViewMode;

        // 先应用搜索过滤
        let filteredData = dataSource.filter(item =>
            item.name.toLowerCase().includes(searchValue.toLowerCase())
        );

        // 再应用视图过滤
        if (viewMode === 'selected') {
            filteredData = filteredData.filter(item => selectedKeys.includes(item.key));
        }

        return filteredData;
    };
    // 新增：获取表格内容
    useEffect(() => {
        // 调用父组件传递的方法，将表格内容传递出去
        getJobTableContent(selectedItems);
    }, [selectedItems, getJobTableContent]);

    return (
        <div className="job-configuration-container" style={{ padding: '20px' }}>
            {/* 标题 */}
            <Title>人员配置</Title>

            {/* 操作按钮 */}
            <Space style={{ marginBottom: '20px' }}>
                <Button type="primary" onClick={handleOpenDeptModal}>
                    选择部门
                </Button>
                <Button type="primary" onClick={handleOpenPersonModal}>
                    选择个人
                </Button>
            </Space>

            {/* 主表格 */}
            <Table
                columns={mainTableColumns}
                data={selectedItems}
                rowKey="key"
                pagination={false}
                locale={{ emptyText: '请从部门或个人中选择添加标注人员' }}
            />

            {/* 部门选择弹窗 */}
            <Modal
                title="选择部门"
                visible={deptModalVisible}
                onCancel={handleCloseModal}
                footer={null}
            >
                <div style={{ marginBottom: '16px' }}>
                    <Space>
                        <Input
                            placeholder="搜索部门"
                            value={searchValue}
                            onChange={(value) => handleSearch(value)}
                            style={{ width: 300 }}
                        />
                        <Button type="primary" onClick={handleConfirmSelection}>
                            确定
                        </Button>
                    </Space>
                </div>

                {/* 新增：视图切换按钮 */}
                <Space style={{ marginBottom: '16px' }}>
                    <Button
                        type={deptViewMode === 'all' ? 'primary' : 'default'}
                        onClick={() => setDeptViewMode('all')}
                    >
                        全部
                    </Button>
                    <Button
                        type={deptViewMode === 'selected' ? 'primary' : 'default'}
                        onClick={() => setDeptViewMode('selected')}
                    >
                        已选 ({selectedDeptKeys.length})
                    </Button>
                </Space>

                {/* 新增：带复选框的表格 */}
                <Table
                    columns={modalTableColumns}
                    data={getCurrentViewData(true)}
                    rowKey="key"
                    pagination={false}
                    rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys: selectedDeptKeys,
                        onChange: (keys) => setSelectedDeptKeys(keys as string[]),
                    }}
                />
            </Modal>

            {/* 个人选择弹窗 */}
            <Modal
                title="选择个人"
                visible={personModalVisible}
                onCancel={handleCloseModal}
                footer={null}
            >
                <div style={{ marginBottom: '16px' }}>
                    <Space>
                        <Input
                            placeholder="搜索人员"
                            value={searchValue}
                            onChange={(value) => handleSearch(value)}
                            style={{ width: 300 }}
                        />
                        <Button type="primary" onClick={handleConfirmSelection}>
                            确定
                        </Button>
                    </Space>
                </div>

                {/* 新增：视图切换按钮 */}
                <Space style={{ marginBottom: '16px' }}>
                    <Button
                        type={personViewMode === 'all' ? 'primary' : 'default'}
                        onClick={() => setPersonViewMode('all')}
                    >
                        全部
                    </Button>
                    <Button
                        type={personViewMode === 'selected' ? 'primary' : 'default'}
                        onClick={() => setPersonViewMode('selected')}
                    >
                        已选 ({selectedPersonKeys.length})
                    </Button>
                </Space>

                {/* 新增：带复选框的表格 */}
                <Table
                    columns={modalTableColumns}
                    data={getCurrentViewData(false)}
                    rowKey="key"
                    pagination={false}
                    rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys: selectedPersonKeys,
                        onChange: (keys) => setSelectedPersonKeys(keys as string[]),
                    }}
                />
            </Modal>
        </div>
    );
};


export default JobConfiguration;