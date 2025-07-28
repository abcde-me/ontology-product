import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from 'react';
import { Button, Popover, DatePicker, Modal } from '@arco-design/web-react';
import { Message } from '@arco-design/web-react';
import { IconLaunch } from '@arco-design/web-react/icon';
import DocIcon from './icon/DOC.svg';
import PdfIcon from './icon/PDF.svg';
import TxtIcon from './icon/TXT.svg';
import getFileIcon from '@/components/file-icon';
import {
  deleteTargetFile,
  deleteSourceFile,
  getTargetFileTypeList,
  getSourceFileTypeList as getSourceFileTypeListApi
} from '@/api/dataCatalog';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import styles from '../../pages/dataCatalog/modal.module.css';

// 图标组件定义
const DOCIcon = ({ size = 16 }) => <DocIcon width={size} height={size} />;
const PDFIcon = ({ size = 16 }) => <PdfIcon width={size} height={size} />;
const TXTIcon = ({ size = 16 }) => <TxtIcon width={size} height={size} />;

// 默认文件类型筛选器
let fileTypeFilters = [
  { text: 'pdf', value: 'pdf' },
  { text: 'txt', value: 'txt' },
  { text: 'doc', value: 'doc' }
];

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
//转换文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size}B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)}MB`;
  } else {
    return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
  }
};
// 从后端获取文件类型列表
const getFileTypeList = async () => {
  try {
    const res = await getTargetFileTypeList();
    if (
      res &&
      res.data &&
      res.data.dst_file_type &&
      Array.isArray(res.data.dst_file_type)
    ) {
      // 更新全局的fileTypeFilters变量
      fileTypeFilters = res.data.dst_file_type.map((type) => ({
        text: type,
        value: type
      }));
      console.log('更新后的文件类型筛选器:', fileTypeFilters);
    }
    return res;
  } catch (error) {
    console.error('获取文件类型列表失败:', error);
    return [];
  }
};

// 初始化文件类型筛选器
(async () => {
  try {
    await getFileTypeList();
    // await getFileTypeLists();
  } catch (error) {
    console.error('初始化文件类型筛选器失败:', error);
  }
})();

export const useFileTypeFilters = () => {
  const [filters, setFilters] = useState(fileTypeFilters);
  useEffect(() => {
    const fetchFileTypes = async () => {
      try {
        const fileTypes = await getFileTypeList();
        if (fileTypes && Array.isArray(fileTypes)) {
          // 将API返回的文件类型转换为筛选器格式
          const newFilters = fileTypes.map((type) => ({
            text: type,
            value: type
          }));
          setFilters(newFilters);
        }
      } catch (error) {
        console.error('获取文件类型列表失败:', error);
      }
    };

    fetchFileTypes();
  }, []);
  return filters;
};
// export const useSourceFileTypeFilters = () => {
//   const [sourceFilters, setSourceFilters] = useState(SourcefileTypeFilters);
//   useEffect(() => {
//     const fetchFileTypes = async () => {
//       try {
//         const fileTypes = await getFileTypeLists();
//         if (fileTypes && Array.isArray(fileTypes)) {
//           const newFilters = fileTypes
//             .filter((type) => type)
//             .map((type) => ({
//               text: type,
//               value: type
//             }));
//           setSourceFilters(newFilters);
//         }
//       } catch (error) {
//         console.error('获取文件类型列表失败:', error);
//       }
//     };

//     fetchFileTypes();
//   }, []);
//   return sourceFilters;
// };

// 工作流ID显示组件，用于管理悬浮状态（Target表格专用）
const WorkflowIdCell = ({ record, showIcon }) => {
  // 添加空值检查
  const extras = record?.extras || {};

  return (
    <div className="unified-columns-wrapper">
      <div className="unified-columns">
        <span className="unified-columns-label">原文件:&nbsp;</span>
        <span className="unified-columns-content unified-columns-file">
          {extras.file_name ?? '无文件名'}
        </span>
      </div>
      <div className="unified-columns">
        <span className="unified-columns-label unified-columns-workflow">
          工作流ID:&nbsp;
        </span>
        <span className="unified-columns-content" style={{ maxWidth: 170 }}>
          {extras.workflow_uuid ? (
            <>
              <a
                className="jump-workflow"
                target="_blank"
                rel="noreferrer"
                href={`/tenant/compute/modaforge/workflowConfig?workflow_uuid=${extras.workflow_uuid}&ds_workflow_id=${extras.ds_workflow_id}`}
              >
                {extras.workflow_uuid}
              </a>
              <span className="jump-workflow-icon"></span>
            </>
          ) : (
            '-'
          )}
        </span>
      </div>
    </div>
  );
};

// 通用的操作列渲染
const renderActionColumn = (
  _,
  record,
  setVisible,
  refreshData,
  selectedKey,
  tableType,
  selectedFullPath,
  handAllReset,
  resetPage
) => (
  <div style={{ display: 'flex' }}>
    <span
      style={{
        color: '#007DFA',
        display: 'inline-block',
        textAlign: 'center',
        cursor: 'pointer',
        marginRight: '16px',
      }}
      onClick={() => handleDownload(record, setVisible, selectedFullPath)}
    >
      导出
    </span>
    <span
      style={{
        color: '#007DFA',
        display: 'inline-block',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={() =>
        handleDelete(
          record,
          refreshData,
          selectedKey,
          tableType,
          handAllReset,
          resetPage
        )
      }
    >
      删除
    </span>
  </div>
);

export const getSourceFileTypeList = async (params) => {
  if (!params?.id) {
    return [];
  }

  try {
    const res = await getSourceFileTypeListApi(params);

    if (res.status !== 200 || !Array.isArray(res.data)) {
      return [];
    }

    return res.data
      .filter((type) => type)
      .map((type) => ({
        text: type,
        value: type
      }));
  } catch (error) {
    console.error('获取文件类型列表失败:', error);
    return [];
  }
};

// 统一的列配置生成函数
export const getUnifiedColumns = (
  tableType: 'source' | 'target',
  dataType: 'volume' | 'database',
  setVisible,
  hoveredRowId = null,
  refreshData = () => { }, // 添加刷新数据的回调函数
  selectedKey?: string, // 添加selectedKey参数
  selectedFullPath?: string, // 添加selectedFullPath参数
  customFileTypeFilters?: any[], // 新增参数，用于接收动态生成的文件类型筛选器
  handAllReset?: () => void, // 修改为函数类型而不是数组
  resetPage?: () => void,
  sourceFileTypeFilters?: any[]
) => {
  // 使用传入的自定义筛选器或全局变量中的筛选器
  const filters = customFileTypeFilters || fileTypeFilters;

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
          // 产品需求：文件名提示常驻
          <Popover content={record.file_sub_path}>
            <span>{record.file_name}</span>
          </Popover>
        )
      },
      {
        title: '文件类型',
        dataIndex: 'file_type',
        width: 120,
        filters: sourceFileTypeFilters,
        render: (_, record) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {getFileIcon(record.file_type)}
            <span>{record.file_type}</span>
          </div>
        )
      },
      {
        title: '文件大小',
        width: 120,
        dataIndex: 'file_size',
        render: (_, record) => <div>{formatFileSize(record.file_size)}</div>
      },
      {
        title: '上传用户',
        dataIndex: 'upload_user',
        ellipsis: true,
        width: 100
      },
      {
        title: '载入开始时间',
        dataIndex: 'task_load_start_time',
        width: 180,
        sorter: true,

        // sortOrder: 'ascend',
        // sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
        sortDirections: ['ascend' as const, 'descend' as const],
        render: (_, record) => formatDateTime(record.task_load_start_time)
      },
      {
        title: '连接器名称',
        dataIndex: 'connector_name',
        ellipsis: true,
        width: 160,
        render: (_, record) => (
          <EllipsisPopover
            value={record.connector_name}
            isEdit={false}
            preferTypography
          />
        )
      },
      {
        title: '操作',
        dataIndex: 'actions',
        fixed: 'right' as const,
        width: 104,
        render: (_, record) =>
          renderActionColumn(
            _,
            record,
            setVisible,
            refreshData,
            selectedKey,
            tableType,
            selectedFullPath,
            handAllReset,
            resetPage
          )
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
          <EllipsisPopover
            value={record.short_content}
            isEdit={false}
            preferTypography
          />
        )
      },
      {
        title: '生成时间',
        dataIndex: 'generated_at',
        width: 180,
        sorter: true,
        // sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
        render: (_, record) => formatDateTime(record.generated_at)
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
        filters: filters, // 使用动态获取的文件类型筛选器
        width: 134,
        render: (_, record) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {getFileIcon(record.type)}
            <span>{record.file_type}</span>
          </div>
        )
      },
      {
        title: '操作',
        dataIndex: 'actions',
        fixed: 'right' as const,
        width: 112,
        render: (_, record) =>
          renderActionColumn(
            _,
            record,
            setVisible,
            refreshData,
            selectedKey,
            tableType,
            selectedFullPath,
            handAllReset,
            resetPage
          )
      }
    ];
  }

  return [];
};

// 处理导出操作
const handleDownload = (record, setVisible, selectedFullPath) => {
  console.log('导出', record);
  // 如果record有full_path属性，优先使用它，否则使用selectedFullPath
  const filePath = record.full_path || selectedFullPath;
  const downloadData = { ...record, filePath };
  setVisible(true, downloadData);
};

// 处理删除操作
const handleDelete = (
  data,
  refreshData,
  selectedKey,
  tableType: 'source' | 'target',
  handAllReset,
  resetPage
) => {
  const ids: Array<string> = [];
  try {
    Modal.confirm({
      title: '确认删除文件吗?',
      content: '删除后，文件不可恢复',
      onOk: async () => {
        if (tableType === 'target') {
          ids.push(data.id);
          console.log('查看删除的数据和数组们', data, ids);
          const res = await deleteTargetFile({
            full_path: data.full_path,
            file_ids: ids,
            path_id: selectedKey
          });
          if (res.status === 200) {
            Message.success('删除成功');
            const event = new CustomEvent('resetPageToFirst', {
              detail: { tableType }
            });
            window.dispatchEvent(event);
            setTimeout(() => {
              handAllReset();
              refreshData();
            }, 200);
          } else {
            Message.error(res?.message ?? '删除失败，请稍后重试');
            return;
          }
        } else {
          const res = await deleteSourceFile(data.id);
          if (res.status === 200) {
            Message.success('删除成功');
            const event = new CustomEvent('resetPageToFirst', {
              detail: { tableType }
            });
            window.dispatchEvent(event);
            setTimeout(() => {
              handAllReset();
              refreshData();
            }, 200);
          } else {
            Message.error(res?.message ?? '删除失败，请稍后重试');
            return;
          }
        }
      },
      className: styles['modalWrapper']
    });
  } catch {
    Message.error('删除失败，请重试');
  }
};
