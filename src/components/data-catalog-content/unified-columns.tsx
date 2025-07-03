import React, { useState } from 'react';
import { Button, Popover, DatePicker, Modal } from '@arco-design/web-react';
import { deleteFileById } from '@/api/dataCatalog';
import { Message } from '@arco-design/web-react';
import { IconStar, IconLaunch } from '@arco-design/web-react/icon';
import DocIcon from './icon/DOC.svg'; // 直接导入为组件
import PdfIcon from './icon/PDF.svg'; // 直接导入为组件
import TxtIcon from './icon/TXT.svg'; // 直接导入为组件
import { deleteTargetFile, deleteSourceFile } from '@/api/dataCatalog';
const { RangePicker } = DatePicker;

// 图标组件定义
const DOCIcon = ({ size = 16 }) => <DocIcon width={size} height={size} />;
const PDFIcon = ({ size = 16 }) => <PdfIcon width={size} height={size} />;
const TXTIcon = ({ size = 16 }) => <TxtIcon width={size} height={size} />;
// const [ids, setIds] = useState([]);
// 根据文件类型获取对应图标组件的函数
const getFileIcon = (type, size = 16) => {
  const iconMap = {
    pdf: <PDFIcon size={size} />,
    txt: <TXTIcon size={size} />,
    doc: <DOCIcon size={size} />
  };
  return iconMap[type?.toLowerCase()] || <TXTIcon size={size} />; // 默认使用TXT图标
};
//格式化时间函数
const formatDateTime = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return dateTimeString; // 如果格式化失败，返回原字符串
  }
};
// 工作流ID显示组件，用于管理悬浮状态（Target表格专用）
const WorkflowIdCell = ({ record, showIcon }) => {
  const handleWorkflowClick = () => {
    // 这里添加跳转逻辑，例如跳转到工作流详情页
    // 您可以根据实际需求修改跳转路径
    if (record.extras.workflow_id) {
      window.open(`/tenant/compute/modaforge/workflowConfig?workflow_id=${record.extras.workflow_id}`, '_blank');
    }
  };

  return (
    <div>
      <div>原文件: {record.extras.file_name}</div>
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
          {record.extras.workflow_id}
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
const renderActionColumn = (_, record, setVisible, refreshData, selectedKey, tableType) => (
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
      onClick={() => handleDelete(record, refreshData, selectedKey, tableType)}
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
  hoveredRowId = null,
  refreshData = () => {}, // 添加刷新数据的回调函数
  selectedKey?: string // 添加selectedKey参数
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
        dataIndex: 'file_name',
        ellipsis: true,
        width: 200,
        render: (_, record) => (
          <div>
            <Popover content={record.file_name}>
              <span
                style={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {record.file_name}
              </span>
            </Popover>
          </div>
        )
      },
      {
        title: '文件类型',
        dataIndex: 'file_type',
        width: 120,
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
            {getFileIcon(record.file_type, 16)}
            <span>{record.file_type}</span>
          </div>
        )
      },
      {
        title: '文件大小',
        // width: 180
        dataIndex: 'file_size',
        render: (_, record) => (
          <div>
            {record.file_size}
          </div>
        )
      },
      {
        title: '上传用户',
        dataIndex: 'upload_user',
        ellipsis: true,
        width: 100,
        render: (_, record) => (
          <div>
            {record.upload_user}
          </div>
        )
      },
      {
        title: '载入开始时间',
        dataIndex: 'task_load_start_time',
        width: 180,
        sorter: (a, b) =>
          new Date(a.task_load_start_time).getTime() - new Date(b.task_load_start_time).getTime(),
        onFilter: (value, record) => {
          if (!value || value.length !== 2) return true;
          if (!record.task_load_start_time) return false;

          const recordDate = new Date(record.task_load_start_time);
          const startDate = new Date(value[0]);
          const endDate = new Date(value[1]);

          return recordDate >= startDate && recordDate <= endDate;
        },
        render: (_, record) => formatDateTime(record.task_load_start_time)
      },
      {
        title: '连接器名称',
        dataIndex: 'connector_name',
        ellipsis: true,
        width: 160
      },
      {
        title: '操作',
        dataIndex: 'actions',
        fixed: 'right' as const,
        width: 112,
        render: (_, record) => renderActionColumn(_, record, setVisible, refreshData, selectedKey, tableType)
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
        dataIndex: 'short_content',
        ellipsis: true,
        width: 300,
        render: (_, record) => (
          <div>
            <Popover content={record.short_content}>
              <span
                style={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {record.short_content}
              </span>
            </Popover>
          </div>
        )
      },
      {
        title: '生成时间',
        dataIndex: 'created_at',
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
        render: (_, record) => formatDateTime(record.created_at),
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
            <span>{record.file_type}</span>
          </div>
        )
      },
      {
        title: '操作',
        dataIndex: 'actions',
        fixed: 'right' as const,
        width: 112,
        render: (_, record) => renderActionColumn(_, record, setVisible, refreshData, selectedKey, tableType)
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

// 处理导出操作
const handleDownload = (record, setVisible) => {
  console.log('导出', record);
  setVisible(true, record);
};

// 处理删除操作
const handleDelete = (data, refreshData, selectedKey, tableType: 'source' | 'target') => {
  const ids: Array<string> = []
  try {
    Modal.confirm({
      title: '确认删除文件吗?',
      content: '删除后，文件不可恢复',
      onOk: async () => {
        if(tableType === 'target'){
          ids.push(data.id);
        console.log('查看删除的数据和数组们', data, ids);
        await deleteTargetFile({
          full_path: data.full_path,
          file_ids: ids,
          path_id: selectedKey
        });
        Message.success('删除成功');
        }else{
          await deleteSourceFile(data.id);
          Message.success('删除成功');
        }
        // 删除成功后刷新数据
        if (typeof refreshData === 'function') {
          refreshData();
        }
      }
    });
  } catch {
    Message.error('删除失败，请重试');
  }
};
