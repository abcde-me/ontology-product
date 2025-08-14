import React, { useState } from 'react';
import { Input, Button, Tree, Typography } from '@arco-design/web-react';
import {
  IconSearch,
  IconPlus,
  IconFolder,
  IconFile
} from '@arco-design/web-react/icon';
import './NotebookTabContent.scss';

const { Title } = Typography;

interface NotebookTabContentProps {
  type: 'files' | 'tools' | 'data';
}

interface TreeNode {
  key: string;
  title: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
}

const NotebookTabContent: React.FC<NotebookTabContentProps> = ({ type }) => {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const getTabConfig = () => {
    switch (type) {
      case 'files':
        return {
          title: 'Notebook文件',
          placeholder: '输入搜索文件',
          buttonText: '新建',
          treeData: [
            {
              key: 'notebooks',
              title: '笔记本',
              icon: <IconFolder />,
              children: [
                {
                  key: 'notebook-1',
                  title: '我的第一个notebook',
                  icon: <IconFile />
                },
                {
                  key: 'notebook-2',
                  title: '数据分析项目',
                  icon: <IconFile />
                }
              ]
            }
          ]
        };
      case 'tools':
        return {
          title: '开发工具',
          placeholder: '搜索开发工具',
          buttonText: '添加工具',
          treeData: [
            {
              key: 'operators',
              title: '算子库',
              icon: <IconFolder />,
              children: [
                {
                  key: 'data-processing',
                  title: '数据处理',
                  icon: <IconFolder />,
                  children: [
                    { key: 'filter', title: '数据过滤', icon: <IconFile /> },
                    { key: 'transform', title: '数据转换', icon: <IconFile /> }
                  ]
                },
                {
                  key: 'ml',
                  title: '机器学习',
                  icon: <IconFolder />,
                  children: [
                    {
                      key: 'classification',
                      title: '分类算法',
                      icon: <IconFile />
                    },
                    { key: 'regression', title: '回归算法', icon: <IconFile /> }
                  ]
                }
              ]
            }
          ]
        };
      case 'data':
        return {
          title: '数据源',
          placeholder: '搜索数据源',
          buttonText: '添加数据源',
          treeData: [
            {
              key: 'databases',
              title: '数据库',
              icon: <IconFolder />,
              children: [
                { key: 'mysql', title: 'MySQL', icon: <IconFile /> },
                { key: 'postgresql', title: 'PostgreSQL', icon: <IconFile /> }
              ]
            },
            {
              key: 'files',
              title: '文件',
              icon: <IconFolder />,
              children: [
                { key: 'csv', title: 'CSV文件', icon: <IconFile /> },
                { key: 'excel', title: 'Excel文件', icon: <IconFile /> }
              ]
            }
          ]
        };
      default:
        return {
          title: '',
          placeholder: '',
          buttonText: '',
          treeData: []
        };
    }
  };

  const config = getTabConfig();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // 这里可以添加搜索逻辑
  };

  const handleNew = () => {
    // 这里可以添加新建逻辑
    console.log(`新建 ${config.buttonText}`);
  };

  const handleTreeSelect = (selectedKeys: string[]) => {
    console.log('选中的节点:', selectedKeys);
  };

  const handleTreeExpand = (keys: string[]) => {
    setExpandedKeys(keys);
  };

  return (
    <div className="notebook-tab-content">
      <div className="tab-header">
        <Title className="tab-title">{config.title}</Title>
      </div>

      <div className="tab-search">
        <div className="search-container">
          <Input
            placeholder={config.placeholder}
            value={searchValue}
            onChange={handleSearch}
            prefix={<IconSearch />}
            style={{ flex: 1 }}
          />
          <Button
            type="text"
            icon={<IconPlus />}
            onClick={handleNew}
            size="small"
          >
            {config.buttonText}
          </Button>
        </div>
      </div>

      <div className="tab-tree">
        <Tree
          treeData={config.treeData}
          selectedKeys={[]}
          expandedKeys={expandedKeys}
          onSelect={handleTreeSelect}
          onExpand={handleTreeExpand}
          showLine
        />
      </div>
    </div>
  );
};

export default NotebookTabContent;
