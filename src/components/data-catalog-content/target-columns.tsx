import React, { useState } from 'react';
import { Button } from '@arco-design/web-react';
import { deleteFileById } from '@/api/dataCatalog'
import { Message, Popover } from '@arco-design/web-react';
import { sort } from 'semver';
import axios from 'axios';
import { rename } from 'fs';
import { IconStar, IconLaunch } from '@arco-design/web-react/icon';

// 工作流ID显示组件，用于管理悬浮状态
const WorkflowIdCell = ({ record, showIcon }) => {
  const handleWorkflowClick = () => {
    // 这里添加跳转逻辑，例如跳转到工作流详情页
    // 您可以根据实际需求修改跳转路径
    if (record.workflowId) {
      window.open(`/workflow/${record.workflowId}`, '_blank');
    }
  };

  return (
    <div>
      <div>原文件: {record.file}</div>
      <div>
        工作流ID: <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleWorkflowClick();
          }}
          style={{
            // color: '#165DFF',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLAnchorElement).style.color = '#0E42D2';
            (e.target as HTMLAnchorElement).style.textDecoration = 'none';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLAnchorElement).style.color = 'black';
            (e.target as HTMLAnchorElement).style.textDecoration = 'none';
          }}
        >
          {record.workflowId}
          {showIcon && (
            <>
              &nbsp;<IconLaunch />
            </>
          )}
        </a>

      </div>
    </div>
  );
};

//数据源目录的卷中的数据格式
export const targetDatacolumns = (setVisible, hoveredRowId = null) => [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 50
  },
  {
    title: '数据内容',
    dataIndex: 'content',
    ellipsis: true,
    width: 300,
    render: (_, record) => (
      <div>
        <Popover content={record.content}>
          <span style={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%'
          }}>
            {record.content}
          </span>
        </Popover>
      </div>
    )
  },
  {
    title: '生成时间',
    dataIndex: 'createdAt',
    sorter: (a, b) => a.creaetAt - b.creaetAt,
    width: 180,
  },
  {
    title: '其他信息',
    dataIndex: 'workflowId',
    width: 240,
    render: (_, record) => <WorkflowIdCell record={record} showIcon={hoveredRowId === record.id} />
  },
  {
    title: '原文件类型',
    dataIndex: 'type',
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
    width: 134,
    render: (_, record) => (
      <div>{record.type}</div>
    )
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

];

//数据源目录的数据库中的数据格式
export const sourceDataDatabase = (setVisible, hoveredRowId = null) => [

];

//目标数据目录中的卷中的数据格式
export const targetDataVolume = (setVisible, hoveredRowId = null) => [

];

//目标数据目录中的数据库中的数据格式
export const targetDataDatabase = (setVisible, hoveredRowId = null) => [

];

const handleDownload = (record, setVisible) => {
  // console.log('下载', id)
  setVisible(true, record);
};
const handleDelete = (id) => {
  console.log('删除', id);
  const token = localStorage.getItem('loginToken');
  if (!token) {
    Message.error('请先登录');
    // 跳转到登录页
    return;
  }
  // deleteFileById(id);
};
