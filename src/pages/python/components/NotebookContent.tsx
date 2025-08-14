import React, { useState } from 'react';
import { Button, Card, Space, Typography } from '@arco-design/web-react';
import {
  IconStar,
  IconThunderbolt,
  IconBulb,
  IconArrowRight,
  IconPlus
} from '@arco-design/web-react/icon';
import CodeEditor from './CodeEditor';
import './NotebookContent.scss';

const { Title, Paragraph } = Typography;

interface NotebookCell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
}

const NotebookContent: React.FC = () => {
  const [cells, setCells] = useState<NotebookCell[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleAddCell = (type: 'code' | 'markdown') => {
    const newCell: NotebookCell = {
      id: Date.now().toString(),
      type,
      content:
        type === 'code' ? '# 在这里编写您的代码\n' : '# 在这里编写您的文档\n'
    };
    setCells([...cells, newCell]);
    setShowWelcome(false);
  };

  const handleCellChange = (cellId: string, content: string) => {
    setCells(
      cells.map((cell) => (cell.id === cellId ? { ...cell, content } : cell))
    );
  };

  const handleDeleteCell = (cellId: string) => {
    setCells(cells.filter((cell) => cell.id !== cellId));
    if (cells.length === 1) {
      setShowWelcome(true);
    }
  };

  if (showWelcome) {
    return (
      <div className="notebook-content">
        <div className="welcome-section">
          <Card className="welcome-card">
            <div className="welcome-header">
              <IconStar className="welcome-icon" />
              <Title heading={2}>欢迎使用多模态数据治理平台</Title>
            </div>

            <div className="welcome-content">
              <div className="quick-start">
                <div className="section-header">
                  <IconThunderbolt />
                  <Title heading={4}>快速开始</Title>
                </div>
                <Paragraph>
                  这里是您的笔记本工作区，您可以在这里进行数据分析和处理工作。
                </Paragraph>
              </div>

              <div className="usage-guide">
                <div className="section-header">
                  <IconBulb />
                  <Title heading={4}>使用指南</Title>
                </div>
                <ul className="guide-list">
                  <li>
                    创建新笔记本 -
                    在左侧文件面板点击&ldquo;+笔记本&rdquo;创建您的专属笔记本
                  </li>
                  <li>添加单元格 - 点击下方按钮添加代码或文档单元格</li>
                  <li>
                    导入数据源 - 在左侧&ldquo;开发工具&rdquo;中选择数据源并导入
                  </li>
                  <li>使用算子库 - 从算子库中选择预制的数据处理算子</li>
                </ul>
              </div>

              <div className="call-to-action">
                <IconArrowRight />
                <Title heading={3}>开始您的数据治理之旅！</Title>
              </div>
            </div>

            <div className="welcome-actions">
              <Space size={16}>
                <Button
                  type="primary"
                  size="large"
                  icon={<IconPlus />}
                  onClick={() => handleAddCell('code')}
                >
                  添加代码单元格
                </Button>
                <Button
                  size="large"
                  icon={<IconPlus />}
                  onClick={() => handleAddCell('markdown')}
                >
                  添加文档单元格
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="notebook-content">
      <div className="cells-container">
        {cells.map((cell, index) => (
          <div key={cell.id} className="cell-wrapper">
            <div className="cell-header">
              <span className="cell-index">[{index + 1}]</span>
              <Button
                type="text"
                size="mini"
                onClick={() => handleDeleteCell(cell.id)}
              >
                删除
              </Button>
            </div>
            <CodeEditor
              value={cell.content}
              onChange={(value) => handleCellChange(cell.id, value)}
              language={cell.type === 'code' ? 'python' : 'markdown'}
            />
          </div>
        ))}
      </div>

      <div className="add-cell-actions">
        <Space size={8}>
          <Button
            type="dashed"
            icon={<IconPlus />}
            onClick={() => handleAddCell('code')}
          >
            添加代码单元格
          </Button>
          <Button
            type="dashed"
            icon={<IconPlus />}
            onClick={() => handleAddCell('markdown')}
          >
            添加文档单元格
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default NotebookContent;
