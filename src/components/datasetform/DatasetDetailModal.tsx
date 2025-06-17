import React from 'react';
import { Modal, Typography, Tag, Space, Descriptions, Button } from '@arco-design/web-react';
import { IconClose } from '@arco-design/web-react/icon';

const { Title, Text } = Typography;

// 数据集类型
interface Dataset {
    key: string;
    name: string;
    tags: string[];
    version: string;
    description: string;
    model: string;
    creator: string;
    createTime: string;
    updateTime: string;
    isDefault: boolean;
}

interface DatasetDetailModalProps {
    visible: boolean;
    dataset: Dataset | null;
    onClose: () => void;
}

const DatasetDetailModal: React.FC<DatasetDetailModalProps> = ({ visible, dataset, onClose }) => {
    if (!dataset) return null;
    console.log(dataset);
    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Title heading={5} style={{ margin: 0 }}>
                        数据集详情
                    </Title>
                </div>
            }
            visible={visible}
            onCancel={onClose}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Button onClick={onClose}>
                        关闭
                    </Button>
                </div>
            }
            style={{ width: '800px' }}
            maskClosable={false}
        >
            <div style={{ padding: '20px 0' }}>
                {/* 基本信息 */}
                <div style={{ marginBottom: '24px' }}>
                    <Title heading={6} style={{ marginBottom: '16px', color: '#1d2129' }}>
                        基本信息
                    </Title>
                    <Descriptions
                        column={2}
                        data={[
                            {
                                label: '数据集名称',
                                value: (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Text style={{ fontWeight: 500 }}>{dataset.name}</Text>
                                        {dataset.isDefault && (
                                            <Tag color="blue" size="small">
                                                默认数据集
                                            </Tag>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                label: '版本',
                                value: <Tag color="green">{dataset.version}</Tag>,
                            },
                            {
                                label: '创建人',
                                value: dataset.creator,
                            },
                            {
                                label: '生成模型',
                                value: <Tag color="purple">{dataset.model}</Tag>,
                            },
                            {
                                label: '创建时间',
                                value: dataset.createTime,
                            },
                            {
                                label: '最近更新',
                                value: dataset.updateTime,
                            },
                        ]}
                    />
                </div>

                {/* 标签 */}
                <div style={{ marginBottom: '24px' }}>
                    <Title heading={6} style={{ marginBottom: '12px', color: '#1d2129' }}>
                        标签
                    </Title>
                    <Space wrap>
                        {dataset.tags.map((tag) => (
                            <Tag key={tag} color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                                {tag}
                            </Tag>
                        ))}
                    </Space>
                </div>

                {/* 描述 */}
                <div style={{ marginBottom: '24px' }}>
                    <Title heading={6} style={{ marginBottom: '12px', color: '#1d2129' }}>
                        描述
                    </Title>
                    <div
                        style={{
                            background: '#f7f8fa',
                            border: '1px solid #e5e6eb',
                            borderRadius: '6px',
                            padding: '16px',
                            lineHeight: '1.6',
                        }}
                    >
                        <Text>{dataset.description || '暂无描述'}</Text>
                    </div>
                </div>

                {/* 数据集统计信息 */}
                <div>
                    <Title heading={6} style={{ marginBottom: '12px', color: '#1d2129' }}>
                        统计信息
                    </Title>
                    <div
                        style={{
                            background: '#f7f8fa',
                            border: '1px solid #e5e6eb',
                            borderRadius: '6px',
                            padding: '16px',
                        }}
                    >
                        <Descriptions
                            column={2}
                            data={[
                                {
                                    label: '数据总量',
                                    value: '1,234 条',
                                },
                                {
                                    label: '文件大小',
                                    value: '45.6 MB',
                                },
                                {
                                    label: '数据格式',
                                    value: 'JSON',
                                },
                                {
                                    label: '状态',
                                    value: (
                                        <Tag color="green" size="small">
                                            可用
                                        </Tag>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DatasetDetailModal; 