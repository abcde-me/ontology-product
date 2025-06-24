import React from 'react';
import { Button } from '@arco-design/web-react';
import { deleteFileById } from '@/api/dataCatalog'
import { Message } from '@arco-design/web-react';

//数据源目录的卷中的数据格式
export const sourceDataVolume = (setVisible) => [
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
    },
    {
        title: '文件类型',
        dataIndex: 'type',
        width: 80,
    },
    {
        title: '文件大小',
        dataIndex: 'createdAt',
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
    },
    {
        title: '连接器名称',
        dataIndex: 'createdAt',
        width: 180,
    },
    {
        title: '操作',
        dataIndex: 'actions',
        fixed: 'right' as const,
        width: 112,
        render: (_, record) => (
            <div style={{ display: 'flex', gap: 8 }}>
                <span style={{color:'#165DFF',display:'inline-block',width:'100%',textAlign:'center'}} onClick={() => handleDownload(record, setVisible)}>导出</span>
                <span style={{color:'#165DFF',display:'inline-block',width:'100%',textAlign:'center'}} onClick={() => handleDelete(record.id)}>操作</span>
            </div>
        ),
    },

]
//数据源目录的数据库中的数据格式
export const sourceDataDatabase = (setVisible) => [

]
//目标数据目录中的卷中的数据格式
export const targetDataVolume = (setVisible) => [

]
//目标数据目录中的数据库中的数据格式
export const targetDataDatabase = (setVisible) => [

]
const handleDownload = (record, setVisible) => {
    // console.log('下载', id)
    setVisible(true, record)
}
const handleDelete = (id) => {
    console.log('删除', id)
    const token = localStorage.getItem('loginToken');
    if (!token) {
        Message.error('请先登录');
        // 跳转到登录页
        return;
    }
    deleteFileById(id)
}