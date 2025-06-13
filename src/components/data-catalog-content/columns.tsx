import React from 'react';
import { Button } from '@arco-design/web-react';
import { deleteFileById } from '@/api/dataCatalog'
import { Message } from '@arco-design/web-react';

//数据源目录的卷中的数据格式
export const SourceData_Volume =(setVisible)=> [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 60,
  },
  {
    title: '数据内容',
    dataIndex: 'content',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: 80,
  },
  {
    title: '生成时间',
    dataIndex: 'createdAt',
    width: 180,
  },
  {
    title: '更多信息',
    dataIndex: 'meta',
    render: (_, record) => (
      <div>
        <div>原文件: {record.file}</div>
        <div>工作流ID: {record.workflowId}</div>
      </div>
    ),
  },
  {
    title: '操作',
    dataIndex: 'actions',
    width: 100,
    render: (_, record) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={() => Delete(record.id)}>删除</Button>
        <Button type="primary" onClick={() => Download(record,setVisible)}>下载</Button>
      </div>
    ),
  },

]
//数据源目录的数据库中的数据格式
export const SourceData_Database =(setVisible)=> [

]
//目标数据目录中的卷中的数据格式
export const TargetData_Volume =(setVisible)=> [

]
//目标数据目录中的数据库中的数据格式
export const TargetData_Database =(setVisible)=> [

]
const Download = (record,setVisible) => {
  // console.log('下载', id)
  setVisible(true,record)
}
const Delete = (id) => {
  console.log('删除', id)
  const token = localStorage.getItem('loginToken');
  if (!token) {
    Message.error('请先登录');
    // 跳转到登录页
    return;
  }
  deleteFileById(id)
}