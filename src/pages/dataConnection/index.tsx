import { Button, Spin, Tabs } from '@arco-design/web-react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Catalog from './catalog';
import TextContent from './textContent'
import ImageContent from './imageContent'
import ExcelContent from './excelContent'
import './index.less'

const TabPane = Tabs.TabPane;

function DataConnectionPage(props) {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('text');
  const [selectedCatalog, setSelectedCatalog] = useState<Record<string, any>>({});

  return (
    <Spin className="appforge-spin" block loading={false}>
      <div className="h-full py-[20px] pr-[20px] data-connection-page">
        <div className="h-full rounded-[12px] bg-white px-[24px] py-[20px] page-content">
          <div className="mb-[20px] flex items-center justify-between">
            <div className="text-[20px] font-[500] leading-[32px] text-[var(--color-text-1)]">
              数据接入
            </div>
            <Button
              type="outline"
              className="primary"
              onClick={() => {
                history.push(`/tenant/compute/appforge/dataSource`);
              }}
            >
              数据源管理
            </Button>
          </div>
          <Tabs activeTab={activeTab} onChange={setActiveTab}>
            <TabPane key='text' title='文本' />
            <TabPane key='image' title='图像' />
            <TabPane key='excel' title='表格' />
          </Tabs>  
          <div className='content-part'>
            <div className="left overflow-auto">
              <Catalog selectItem={setSelectedCatalog}/>
            </div>
            <div className="right overflow-auto">
              <div className='selected-catalog-name'>{selectedCatalog.title ?? '选择的目录'}</div>
              {activeTab === 'text' && <TextContent selectedCatalog={selectedCatalog} />}
              {activeTab === 'image' && <ImageContent selectedCatalog={selectedCatalog}/>}
              {activeTab === 'excel' && <ExcelContent selectedCatalog={selectedCatalog}/>}
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default DataConnectionPage;
