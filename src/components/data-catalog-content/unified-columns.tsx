import React, { useState } from 'react';
import { Button, Popover, DatePicker } from '@arco-design/web-react';
import { deleteFileById } from '@/api/dataCatalog';
import { Message } from '@arco-design/web-react';
import { IconStar, IconLaunch } from '@arco-design/web-react/icon';
import DocIcon from './icon/DOC.svg'; // 直接导入为组件
import PdfIcon from './icon/PDF.svg'; // 直接导入为组件
import TxtIcon from './icon/TXT.svg'; // 直接导入为组件

const { RangePicker } = DatePicker;

// 图标组件定义
const DOCIcon = ({ size = 16 }) => <DocIcon width={size} height={size} />;
const PDFIcon = ({ size = 16 }) => <PdfIcon width={size} height={size} />;
const TXTIcon = ({ size = 16 }) => <TxtIcon width={size} height={size} />;

// 根据文件类型获取对应图标组件的函数
const getFileIcon = (type, size = 16) => {
  const iconMap = {
    pdf: <PDFIcon size={size} />,
    txt: <TXTIcon size={size} />,
    doc: <DOCIcon size={size} />
  };
  return iconMap[type?.toLowerCase()] || <TXTIcon size={size} />; // 默认使用TXT图标
};

// 工作流ID显示组件，用于管理悬浮状态（Target表格专用）
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
        工作流ID:{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleWorkflowClick();
          }}
          style={{
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
              &nbsp;
              <IconLaunch />
            </>
          )}
        </a>
      </div>
    </div>
  );
};

// 通用的操作列渲染
const renderActionColumn = (_, record, setVisible) => (
  <div style={{ display: 'flex', gap: 8 }}>
    <span
      style={{
        color: '#165DFF',
        display: 'inline-block',
        width: '100%',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={() => handleDownload(record, setVisible)}
    >
      导出
    </span>
    <span
      style={{
        color: '#165DFF',
        display: 'inline-block',
        width: '100%',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={() => handleDelete(record.id)}
    >
      删除
    </span>
  </div>
);

// 统一的列配置生成函数
/**
 * 根据表格类型和活动状态生成对应的列配置
 */
export const getUnifiedColumns = (
  tableType: 'source' | 'target',
  dataType: 'volume' | 'database',
  setVisible,
  hoveredRowId = null
) => {
  // Source表格的卷数据列配置
  if (tableType === 'source' && dataType === 'volume') {
    return [
      {
        title: 'ID',
        dataIndex: 'id',
        width: 50
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
          { text: 'pdf', value: 'pdf' },
          { text: 'txt', value: 'txt' },
          { text: 'doc', value: 'doc' }
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
        width: 180
      },
      {
        title: '上传用户',
        dataIndex: 'meta',
        render: (_, record) => (
          <div>
            <div>原文件: {record.file}</div>
            <div>工作流ID: {record.workflowId}</div>
          </div>
        )
      },
      {
        title: '载入开始时间',
        dataIndex: 'createdAt',
        width: 180,
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        onFilter: (value, record) => {
          if (!value || value.length !== 2) return true;
          if (!record.createdAt) return false;

          const recordDate = new Date(record.createdAt);
          const startDate = new Date(value[0]);
          const endDate = new Date(value[1]);

          return recordDate >= startDate && recordDate <= endDate;
        }
      },
      {
        title: '连接器名称',
        dataIndex: 'connectorName',
        ellipsis: true,
        width: 180
      },
      {
        title: '操作',
        dataIndex: 'actions',
        fixed: 'right' as const,
        width: 112,
        render: (_, record) => renderActionColumn(_, record, setVisible)
      }
    ];
  }

  // Target表格的卷数据列配置
  if (tableType === 'target' && dataType === 'volume') {
    return [
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
        title: '生成时间',
        dataIndex: 'createdAt',
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        onFilter: (value, record) => {
          if (!value || value.length !== 2) return true;
          if (!record.createdAt) return false;

          const recordDate = new Date(record.createdAt);
          const startDate = new Date(value[0]);
          const endDate = new Date(value[1]);

          return recordDate >= startDate && recordDate <= endDate;
        },
        width: 180
      },
      {
        title: '其他信息',
        dataIndex: 'workflowId',
        width: 240,
        render: (_, record) => (
          <WorkflowIdCell
            record={record}
            showIcon={hoveredRowId === record.id}
          />
        )
      },
      {
        title: '原文件类型',
        dataIndex: 'type',
        filters: [
          { text: 'pdf', value: 'pdf' },
          { text: 'txt', value: 'txt' },
          { text: 'doc', value: 'doc' }
        ],
        onFilter: (value, row) => row.type == value,
        width: 134,
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
        title: '操作',
        dataIndex: 'actions',
        fixed: 'right' as const,
        width: 112,
        render: (_, record) => renderActionColumn(_, record, setVisible)
      }
    ];
  }

  // Source表格的数据库列配置（目前为空，可根据需要扩展）
  if (tableType === 'source' && dataType === 'database') {
    return [
      // 可根据实际需求添加数据库相关列配置
    ];
  }

  // Target表格的数据库列配置（目前为空，可根据需要扩展）
  if (tableType === 'target' && dataType === 'database') {
    return [
      // 可根据实际需求添加数据库相关列配置
    ];
  }

  // 默认返回空数组
  return [];
};

// 处理下载操作
const handleDownload = (record, setVisible) => {
  console.log('下载', record);
  setVisible(true, record);
};

// 处理删除操作
const handleDelete = (id) => {
  console.log('删除', id);
  const token = localStorage.getItem('loginToken');
  if (!token) {
    Message.error('请先登录');
    return;
  }
  // deleteFileById(id)
};
