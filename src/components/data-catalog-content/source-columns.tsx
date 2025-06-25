import React, { useState } from 'react';
import { Button, Popover, DatePicker } from '@arco-design/web-react';
import { deleteFileById } from '@/api/dataCatalog'
import { Message } from '@arco-design/web-react';
import DocIcon from './icon/DOC.svg'; // 直接导入为组件
import PdfIcon from './icon/PDF.svg'; // 直接导入为组件
import TxtIcon from './icon/TXT.svg'; // 直接导入为组件
// SVG图标组件 - 使用原始设计

const { RangePicker } = DatePicker;

// 根据文件类型获取对应图标组件的函数
const DOCIcon = ({ size = 16 }) => (
    <DocIcon width={size} height={size} />
);
const PDFIcon = ({ size = 16 }) => (
    <PdfIcon width={size} height={size} />
);
const TXTIcon = ({ size = 16 }) => (
    <TxtIcon width={size} height={size} />
);
const getFileIcon = (type, size = 16) => {
    const iconMap = {
        'pdf': <PDFIcon size={size} />,
        'txt': <TXTIcon size={size} />,
        'doc': <DOCIcon size={size} />,
    };
    return iconMap[type?.toLowerCase()] || <TXTIcon size={size} />; // 默认使用TXT图标
};

//数据源目录的卷中的数据格式
export const sourceDataVolume = (setVisible, hoveredRowId = null) => [
    {
        title: 'ID',
        dataIndex: 'id',
        width: 50,
    },
    {
        title: '文件名',
        dataIndex: 'content',
        ellipsis: true,
        width: 300,
        render: (_, record) => (
            <div>
                <Popover content={record.content}>
                    <span
                        style={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                        }}
                    >
                        {record.content}
                    </span>
                </Popover>
            </div>
        )
    },
    {
        title: '类型',
        dataIndex: 'type',
        width: 100,
        filters: [
            {
                text: 'pdf',
                value: 'pdf',
            },
            {
                text: 'txt',
                value: 'txt',
            },
            {
                text: 'doc',
                value: 'doc',
            },
        ],
        onFilter: (value, row) => row.type == value,
        render: (_, record) => (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}
            >
                {getFileIcon(record.type, 16)}
                <span>{record.type}</span>
            </div>
        )
    },
    {
        title: '文件大小',
        // dataIndex: 'createdAt',
        width: 180,
    },
    {
        title: '上传用户',
        dataIndex: 'meta',
        render: (_, record) => (
            <div>
                <div>原文件: {record.file}</div>
                <div>工作流ID: {record.workflowId}</div>
            </div>
        ),
    },
    {
        title: '载入开始时间',
        dataIndex: 'createdAt',
        width: 180,
        sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        onFilter: (value, record) => {
            if (!value || value.length !== 2) return true;
            if (!record.createdAt) return false;

            const recordDate = new Date(record.createdAt);
            const startDate = new Date(value[0]);
            const endDate = new Date(value[1]);

            return recordDate >= startDate && recordDate <= endDate;
        },
    },
    {
        title: '连接器名称',
        dataIndex: 'connectorName',
        ellipsis: true,
        width: 180,
    },
    {
        title: '操作',
        dataIndex: 'actions',
        fixed: 'right' as const,
        width: 112,
        render: (_, record) => (
            <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#165DFF', display: 'inline-block', width: '100%', textAlign: 'center' }} onClick={() => handleDownload(record, setVisible)}>导出</span>
                <span style={{ color: '#165DFF', display: 'inline-block', width: '100%', textAlign: 'center' }} onClick={() => handleDelete(record.id)}>删除</span>
            </div>
        ),
    },

]
//数据源目录的数据库中的数据格式
export const sourceDataDatabase = (setVisible, hoveredRowId = null) => [

]
//目标数据目录中的卷中的数据格式
export const targetDataVolume = (setVisible, hoveredRowId = null) => [

]
//目标数据目录中的数据库中的数据格式
export const targetDataDatabase = (setVisible, hoveredRowId = null) => [

]
const handleDownload = (record, setVisible) => {
    // console.log('下载', id)
    setVisible(true, record);
};
const handleDelete = (id) => {

    console.log('删除', id)
    const token = localStorage.getItem('loginToken');
    if (!token) {
        Message.error('请先登录');
        // 跳转到登录页
        return;
    }
    // deleteFileById(id)
}
