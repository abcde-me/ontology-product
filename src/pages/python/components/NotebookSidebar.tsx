import React, { useState } from 'react';
import { Input, Button, List, Space } from '@arco-design/web-react';
import { IconSearch, IconPlus, IconFile } from '@arco-design/web-react/icon';
import './NotebookSidebar.scss';

interface NotebookFile {
  id: string;
  name: string;
  isActive?: boolean;
}

interface NotebookSidebarProps {
  files?: NotebookFile[];
  onFileSelect?: (fileId: string) => void;
  onNewFile?: () => void;
}

const NotebookSidebar: React.FC<NotebookSidebarProps> = ({
  files = [{ id: '1', name: '我的第一个notebook', isActive: true }],
  onFileSelect,
  onNewFile
}) => {
  const [searchValue, setSearchValue] = useState('');

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="notebook-sidebar">
      <div className="notebook-sidebar-header">
        <h3 className="sidebar-title">Notebook文件</h3>
      </div>

      <div className="notebook-sidebar-search">
        <div style={{ display: 'flex', gap: '8px' }}>
          <Input
            placeholder="输入搜索文件"
            value={searchValue}
            onChange={setSearchValue}
            prefix={<IconSearch />}
            style={{ flex: 1 }}
          />
          <Button type="primary" icon={<IconPlus />} onClick={onNewFile}>
            新建
          </Button>
        </div>
      </div>

      <div className="notebook-sidebar-files">
        <List
          dataSource={filteredFiles}
          render={(item) => (
            <List.Item
              key={item.id}
              className={`file-item ${item.isActive ? 'active' : ''}`}
              onClick={() => onFileSelect?.(item.id)}
            >
              <Space>
                <IconFile />
                <span>{item.name}</span>
              </Space>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default NotebookSidebar;
