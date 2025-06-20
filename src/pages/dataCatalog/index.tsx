import React from 'react';
import './index.css';
import { DatePicker} from '@arco-design/web-react';
import Table from '@/components/data-catalog-content/index'
import SourceDate from './components/sourceData';
import Eltable from './components/elTable';
const DataCatalog: React.FC = () => {
  const [active,setActive] = React.useState('1');

  return (
    <div style={{width: '100%',height:'100%',padding:'20px 20px 20px 0px'}}>
    <div
      style={{
        // border: '16px',
        padding: '24px 24px 27px 16px',
        borderRadius: '16px',
        backgroundColor: 'white',
        height:'100%',
        width:'100%',
        boxSizing: 'border-box',
        overflow:'hidden',
      }}
    >
      {/* <div className="data-catalog-content" style={{ width: '100%' }}>
        <Table />
      </div> */}
      <div style={{width:'100px',height:'30px',lineHeight:'30px',marginBottom:'16px'}}>
        <p style={{fontSize:'20px',fontWeight:500}}>数据集目录</p>
      </div>
      {/* 数据集和表格 */}
      <div style={{display:'flex',width:'100%',height: 'calc(100% - 43px)',overflow:'hidden'}}>
        <SourceDate onChanges={setActive}/>
        <Eltable active={active}/>
      </div>
    </div>
    </div>
  );
};

export default DataCatalog; 