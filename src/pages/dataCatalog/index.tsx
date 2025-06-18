import React from 'react';
import './index.css';
import { DatePicker} from '@arco-design/web-react';
import Table from '@/components/data-catalog-content/index'

const DataCatalog: React.FC = () => {
  return (
      <div style={{border:'16px',padding:'16px 8px 16px 8px',borderRadius: '16px', backgroundColor: 'white',height:'100%' }}>
        <div className='data-catalog-content'>
          <Table></Table>
        </div>
    </div>
  );
};

export default DataCatalog; 