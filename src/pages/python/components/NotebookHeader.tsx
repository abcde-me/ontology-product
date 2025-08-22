import React from 'react';
import { Button, Space } from '@arco-design/web-react';
import { IconApps, IconClose, IconPlus } from '@arco-design/web-react/icon';
import './NotebookHeader.scss';

interface NotebookHeaderProps {
  currentNotebook?: string;
  onClose?: () => void;
  onNewTab?: () => void;
}

const NotebookHeader: React.FC<NotebookHeaderProps> = ({
  currentNotebook = '我的第一个notebook',
  onClose,
  onNewTab
}) => {
  return (
    <div className="notebook-header">
      <div className="notebook-header-left">
        <Space size={16}>
          <Button type="text" icon={<IconApps />} />
          <Button type="text" icon={<IconApps />} />
        </Space>
      </div>
      <div className="notebook-header-center">
        <h2 className="notebook-title">{currentNotebook}</h2>
      </div>
      <div className="notebook-header-right">
        <Space size={8}>
          <Button type="text" icon={<IconClose />} onClick={onClose} />
          <Button type="text" icon={<IconPlus />} onClick={onNewTab} />
        </Space>
      </div>
    </div>
  );
};

export default NotebookHeader;
