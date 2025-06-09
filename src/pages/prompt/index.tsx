import { Button, Spin, Tabs } from '@arco-design/web-react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import PromptTpl from './promptTpl'
import PromptOpt from './promptOpt'
import './index.less'

const TabPane = Tabs.TabPane;

function PromptPage(props) {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('tpl');

  return (
    <Spin className="appforge-spin" block loading={false}>
      <div className="h-full py-[20px] pr-[20px] prompt-page">
        <div className="h-full rounded-[12px] bg-white px-[24px] py-[20px] page-content">
          <div className="mb-[20px] flex items-center justify-between">
            <div className="text-[20px] font-[500] leading-[32px] text-[var(--color-text-1)]">
              Prompt工程
            </div>
          </div>
          <Tabs activeTab={activeTab} onChange={setActiveTab}>
            <TabPane key='tpl' title='Prompt模板' />
            <TabPane key='opt' title='Prompt优化' />
          </Tabs>  
          <div className='content-part'>
            {activeTab === 'tpl' && <PromptTpl />}
            {activeTab === 'opt' && <PromptOpt />}
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default PromptPage;
