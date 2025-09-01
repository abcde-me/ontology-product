import React from 'react';
import { Typography } from '@arco-design/web-react';
import DataDirectoryTree from '@/components/data-directory-tree';
import './index.scss';

const { Title } = Typography;

const PythonTabContent: React.FC<{}> = () => {
  return (
    <div className="python-tab-content">
      <div className="tab-header">
        <Title className="tab-title">数据目录</Title>
      </div>

      <div className="tab-tree">
        <DataDirectoryTree />
      </div>
    </div>
  );
};

export default PythonTabContent;
