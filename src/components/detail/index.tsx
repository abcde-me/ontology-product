import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
    Typography,
    Button,
    Space,
    Card,
    Descriptions,
    Tag,
    Modal,
    Message,
    Tabs,
    Table,
    Input,
    Select,
    Pagination,
    Tooltip
} from '@arco-design/web-react';
import {
    IconArrowLeft,
    IconEdit,
    IconSearch,
    IconPlayArrow,
    IconHistory,
    IconRefresh
} from '@arco-design/web-react/icon';
import { Breadcrumb } from "@arco-design/web-react";
import { getDatasetDetail, updateDataset } from '@/api/datasetManagement';
import EditDatasetForm from '@/components/datasetform/EditDatasetForm';
import './style.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 测试数据
const csdatasetDetail = {
    "id": 0,
    "name": "西游三打白骨精",
    "description": "liuxiaoyu-test",
    "latest_version": "v1.10",
    "src": 0,
    "creator_id": "user_001",
    "creator_name": "张三",
    "created_at": "2025-05-05 05:05:05",
    "updated_at": "2025-05-05 05:05:05",
    "deleted_at": null,
    "tags": ["小说情节"],
    "model": "GPT-4o"
}

// 内容数据测试数据
const contentData = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    introduction: `场景${index + 1}：${['战斗场景', '对话场景', '探索场景', '剧情场景'][index % 4]}`,
    content: `这是第${index + 1}个剧情内容的原始文本，描述了一个${['激烈的战斗', '重要的对话', '神秘的探索', '转折的剧情'][index % 4]}...`,
    reply: `AI生成的第${index + 1}个回复内容，为用户提供了${['战斗策略建议', '对话选项指导', '探索方向提示', '剧情发展预测'][index % 4]}...`,
    status: ['正常', '待优化', '已完成'][index % 3]
}));

// 版本历史测试数据
const versionHistory = [
    { version: 'v1.10', date: '2025-06-23', description: '当前版本', status: 'current', changes: 15 },
    { version: 'v1.09', date: '2025-06-20', description: '重新版本', status: 'archived', changes: 8 },
    { version: 'v1.08', date: '2025-06-18', description: '优化内容', status: 'archived', changes: 12 },
    { version: 'v1.07', date: '2025-06-15', description: '修复问题', status: 'archived', changes: 5 },
];



// 内容数据表格列定义
const contentColumns = (handleEditContent: any, handleContinue: any) => [
    {
        title: 'ID',
        dataIndex: 'id',
        width: 80,
        fixed: 'left' as const,
    },
    {
        title: '介绍',
        dataIndex: 'introduction',
        width: 200,
        ellipsis: true,
    },
    {
        title: '内容',
        dataIndex: 'content',
        width: 300,
        ellipsis: true,
        render: (text: string) => (
            <Tooltip content={text}>
                <div style={{
                    maxHeight: '60px',
                    overflow: 'hidden',
                    lineHeight: '20px'
                }}>
                    {text}
                </div>
            </Tooltip>
        ),
    },
    {
        title: '回复',
        dataIndex: 'reply',
        width: 300,
        ellipsis: true,
        render: (text: string) => (
            <Tooltip content={text}>
                <div style={{
                    maxHeight: '60px',
                    overflow: 'hidden',
                    lineHeight: '20px'
                }}>
                    {text}
                </div>
            </Tooltip>
        ),
    },
    {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status: string) => (
            <Tag color={
                status === '正常' ? 'green' :
                    status === '待优化' ? 'orange' : 'blue'
            }>
                {status}
            </Tag>
        ),
    },
    {
        title: '操作',
        dataIndex: 'actions',
        width: 112,
        fixed: 'right' as const,
        render: (_: any, record: any) => (
            <Space>
                <Button
                    type="text"
                    size="small"
                    // icon={<IconEdit />}
                    onClick={() => handleEditContent(record)}
                    className="action-btn"
                >
                    编辑
                </Button>
                <Button
                    type="text"
                    size="small"
                    // icon={<IconPlayArrow />}  
                    onClick={() => handleContinue(record)}
                    className="action-btn"
                >
                    操作
                </Button>
            </Space>
        ),
    },
];

// 版本历史表格列定义
const versionColumns = (handleVersionRollback: any) => [
    {
        title: '版本号',
        dataIndex: 'version',
        render: (version: string, record: any) => (
            <Space>
                <Text style={{ fontWeight: record.status === 'current' ? 'bold' : 'normal' }}>
                    {version}
                </Text>
                {record.status === 'current' && (
                    <span className="version-current-tag">当前版本</span>
                )}
            </Space>
        ),
    },
    {
        title: '日期',
        dataIndex: 'date',
    },
    {
        title: '描述',
        dataIndex: 'description',
    },
    {
        title: '更改数量',
        dataIndex: 'changes',
        render: (changes: number) => `${changes} 项更改`,
    },
    {
        title: '操作',
        dataIndex: 'actions',
        render: (_: any, record: any) => (
            <Space>
                {record.status !== 'current' && (
                    <Button
                        type="text"
                        size="small"
                        icon={<IconRefresh />}
                        onClick={() => handleVersionRollback(record.version)}
                        className="action-btn"
                    >
                        回滚
                    </Button>
                )}
                <Button
                    type="text"
                    size="small"
                    icon={<IconHistory />}
                    className="action-btn"
                >
                    查看详情
                </Button>
            </Space>
        ),
    },
];



const DatasetDetail: React.FC = () => {
    const [datasetDetail, setDatasetDetail] = React.useState<any>(null);
    const [editModalVisible, setEditModalVisible] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('content');

    // 内容数据状态
    const [searchValue, setSearchValue] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize] = React.useState(10);
    const [filteredData, setFilteredData] = React.useState(contentData);

    const { id } = useParams<{ id: string }>();
    const history = useHistory();

    // 返回按钮
    const handleBack = () => {
        window.history.back();
    };

    // 跳转到数据集管理页面
    const handleGoToDatasetList = () => {
        history.push('/tenant/compute/modaforge/datasetManagement');
    };

    // 打开编辑弹窗
    const handleEdit = () => {
        setEditModalVisible(true);
    };

    // 关闭编辑弹窗
    const handleCloseEditModal = () => {
        setEditModalVisible(false);
    };

    // 处理编辑提交
    const handleEditSubmit = (formData: any) => {
        console.log('编辑数据集:', formData);

        updateDataset(formData).then(res => {
            console.log(res)
            Message.success('数据集更新成功');
            setEditModalVisible(false);
        }).catch(err => {
            Message.error('数据集更新失败');
        })
    };



    // 处理搜索输入变化
    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        setCurrentPage(1);

        if (!value.trim()) {
            setFilteredData(contentData);
            return;
        }

        const searchTerm = value.trim();
        const filtered = contentData.filter(item => {
            // 如果输入的是纯数字，则搜索ID
            if (/^\d+$/.test(searchTerm)) {
                return item.id.toString() === searchTerm;
            }
            // 否则搜索关键字
            return (
                item.introduction.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reply.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        setFilteredData(filtered);
    };

    // 编辑内容
    const handleEditContent = (record: any) => {
        console.log('编辑内容:', record);
        Message.info(`编辑第${record.id}条内容`);
    };

    // 继续生成
    const handleContinue = (record: any) => {
        console.log('继续生成:', record);
        Message.info(`为第${record.id}条内容生成后续文本`);
    };

    // 版本回滚
    const handleVersionRollback = (version: string) => {
        Modal.confirm({
            title: '确认回滚',
            content: `确定要回滚到版本 ${version} 吗？`,
            onOk: () => {
                Message.success(`已回滚到版本 ${version}`);
            }
        });
    };

    // 格式化日期
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 获取数据来源文本
    const getDataSourceText = (src: number) => {
        switch (src) {
            case 0: return '示例数据';
            case 1: return '数据目录卷';
            case 2: return '连接器';
            default: return '未知';
        }
    };


    React.useEffect(() => {
        // 测试数据
        setDatasetDetail(csdatasetDetail)
    }, [])

    // 分页数据
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="dataset-detail">
            {/* 面包屑导航区域 */}
            <div className="breadcrumb-wrapper">
                <Button
                    type="text"
                    icon={<IconArrowLeft style={{ color: '#000' }} />}
                    onClick={handleBack}
                />
                <Breadcrumb style={{ fontSize: 18 }}>
                    <Breadcrumb.Item>
                        <span
                            // style={{ cursor: 'pointer', color: '#165dff' }}
                            onClick={handleGoToDatasetList}
                        >
                            数据集管理
                        </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>数据集详情</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* 数据集详情面板 */}
            <Card
                className="basic-info-card"
                bordered={false}
            >
                {/* 基本信息区域 */}
                {datasetDetail && (
                    <>
                        {/* 标题区域 */}
                        <div className="basic-info-header">
                            <Title heading={4}>
                                基本信息
                            </Title>
                            <Button
                                type="text"
                                icon={<IconEdit />}
                                onClick={handleEdit}
                                className="edit-btn"
                            >
                                编辑
                            </Button>
                        </div>

                        {/* 内容区域 */}
                        <div className="basic-info-content" style={{ marginBottom: 24 }}>
                            <div>
                                <Descriptions
                                    data={[
                                        { label: '名称', value: datasetDetail.name },
                                        { label: '标签', value: datasetDetail.tags?.join('、') || '-' },
                                        { label: '创建人', value: datasetDetail.creator_name },
                                        { label: '生成模型', value: datasetDetail.model },
                                    ]}
                                    column={1}
                                    labelStyle={{
                                        width: 80,
                                        fontWeight: 'normal',
                                        color: '#666666'
                                    }}
                                    valueStyle={{
                                        color: '#333333',
                                        fontWeight: 'normal'
                                    }}
                                />
                            </div>

                            <div>
                                <Descriptions
                                    data={[
                                        {
                                            label: '当前版本',
                                            value: (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span>{datasetDetail.latest_version}</span>
                                                    <span className="version-tag">
                                                        最新版本
                                                    </span>
                                                </span>
                                            )
                                        },
                                        { label: '创建时间', value: formatDate(datasetDetail.created_at) },
                                        { label: '更新时间', value: formatDate(datasetDetail.updated_at) },
                                        { label: '描述说明', value: datasetDetail.description || '-' },
                                    ]}
                                    column={1}
                                    labelStyle={{
                                        width: 80,
                                        fontWeight: 'normal',
                                        color: '#666666'
                                    }}
                                    valueStyle={{
                                        color: '#333333',
                                        fontWeight: 'normal'
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* 数据管理标签页 */}
                <Tabs activeTab={activeTab} onChange={setActiveTab}>
                    <TabPane key="content" title="内容数据">
                        {/* 搜索系统 */}
                        <div className="search-section">
                            <Input
                                placeholder="输入ID、关键字搜索"
                                value={searchValue}
                                onChange={handleSearchChange}
                                style={{ width: 300 }}
                                allowClear
                                suffix={<IconSearch style={{ color: '#999' }} />}
                            />
                            <Text type="secondary" className="search-count">
                                共 {filteredData.length} 条数据
                            </Text>
                        </div>

                        {/* 内容数据表格 */}
                        <Table
                            columns={contentColumns(handleEditContent, handleContinue)}
                            data={paginatedData}
                            pagination={false}
                            scroll={{ x: 1200 }}
                            stripe
                            border
                        />

                        {/* 分页控件 */}
                        <div className="pagination-wrapper">
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={filteredData.length}
                                onChange={setCurrentPage}
                                showTotal={(total, range) =>
                                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据`
                                }
                                showJumper
                                sizeCanChange={false}
                            />
                        </div>
                    </TabPane>

                    <TabPane key="version" title="版本历史">
                        <div className="version-history-header">
                            <Text className="title">版本管理</Text>
                            <Text type="secondary" className="subtitle">
                                当前版本：{datasetDetail?.latest_version} | 总计 {versionHistory.length} 个版本
                            </Text>
                        </div>

                        <Table
                            columns={versionColumns(handleVersionRollback)}
                            data={versionHistory}
                            pagination={false}
                            border
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* 编辑弹窗 */}
            <Modal
                title="编辑基本信息"
                visible={editModalVisible}
                onCancel={handleCloseEditModal}
                footer={null}
                style={{ width: 600 }}
                autoFocus={false}
                focusLock={true}
            >
                {datasetDetail && (
                    <EditDatasetForm
                        initialData={{
                            key: datasetDetail.id.toString(),
                            name: datasetDetail.name,
                            description: datasetDetail.description || '',
                            version: datasetDetail.latest_version || 'v1.0.0',
                            tags: datasetDetail.tags || [],
                            model: datasetDetail.model || 'GPT-4o',
                            creator: datasetDetail.creator_name || '',
                        }}
                        onSubmit={handleEditSubmit}
                        onCancel={handleCloseEditModal}
                    />
                )}
            </Modal>
        </div>
    );
};

export default DatasetDetail; 