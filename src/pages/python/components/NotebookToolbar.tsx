import React from 'react';
import { Button, Space, Tag } from '@arco-design/web-react';
import {
  IconPlayArrow,
  IconUpload,
  IconList,
  IconSettings,
  IconFile,
  IconInfoCircle
} from '@arco-design/web-react/icon';
import './NotebookToolbar.scss';

interface NotebookToolbarProps {
  onRun?: () => void;
  onExportDataset?: () => void;
  onExportList?: () => void;
  onCallOperator?: () => void;
  onRunLog?: () => void;
}

const NotebookToolbar: React.FC<NotebookToolbarProps> = ({
  onRun,
  onExportDataset,
  onExportList,
  onCallOperator,
  onRunLog
}) => {
  return (
    <div className="notebook-toolbar">
      <div className="toolbar-left">
        <Space size={8}>
          <Button type="primary" icon={<IconPlayArrow />} onClick={onRun}>
            运行
          </Button>
          <Button icon={<IconUpload />} onClick={onExportDataset}>
            导出数据集
          </Button>
          <Button icon={<IconList />} onClick={onExportList}>
            导出列表
          </Button>
          <Button icon={<IconSettings />} onClick={onCallOperator}>
            调用算子
          </Button>
          <Button icon={<IconFile />} onClick={onRunLog}>
            运行日志
          </Button>
        </Space>
      </div>

      <div className="toolbar-right">
        <Space size={8}>
          <Tag color="blue">
            <IconInfoCircle />
            Kernel: PySpark
          </Tag>
        </Space>
      </div>
    </div>
  );
};

export default NotebookToolbar;
