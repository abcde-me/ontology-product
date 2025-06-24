import React from 'react';
import './index.css';
import { DatePicker } from '@arco-design/web-react';
import SourceDate from './components/source-data';
import Eltable from './components/el-table';

const DataCatalog: React.FC = () => {
  const [active, setActive] = React.useState('source');
  const [selectedNode, setSelectedNode] = React.useState('');

  // 处理标签页切换
  const handleTabChange = (tabValue: string) => {
    setActive(tabValue);
  };

  // 处理树节点选择
  const handleNodeSelect = (nodeKey: string) => {
    setSelectedNode(nodeKey);
  };

  return (
    <div
      style={{ width: '100%', height: '100%', padding: '20px 20px 20px 0px' }}
    >
      <div
        style={{
          // border: '16px',
          padding: '24px 24px 27px 16px',
          borderRadius: '16px',
          backgroundColor: 'white',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box'
          // overflow: 'auto',
        }}
      >
        {/* <div className="data-catalog-content" style={{ width: '100%' }}>
        <Table />
      </div> */}
        <div
          style={{
            width: '100px',
            height: '30px',
            lineHeight: '30px',
            marginBottom: '16px'
          }}
        >
          <p style={{ fontSize: '20px', fontWeight: 500 }}>数据集目录</p>
        </div>
        {/* 数据集和表格 */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: 'calc(100% - 43px)'
          }}
        >
          <SourceDate
            onTabChange={handleTabChange}
            onNodeSelect={handleNodeSelect}
            activeTab={active}
          />
          <Eltable active={active} selectedNode={selectedNode} />
        </div>
      </div>
    </div>
  );
};

export default DataCatalog;
