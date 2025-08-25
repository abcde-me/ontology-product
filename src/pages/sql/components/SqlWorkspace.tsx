import { Alert, Space, Spin, Tabs } from '@arco-design/web-react';
import React, { FC, useState } from 'react';
import { SQL_EDITOR_TABS } from '../constant';
import SqlEditor from './SqlEdior';
import SqlResult from './SqlResult';

const TabPane = Tabs.TabPane;

const SqlWorkspace: FC = () => {
  const [tabs, setTabs] = useState(SQL_EDITOR_TABS);
  const [activeTab, setActiveTab] = useState('1');

  const handleDeleteTab = (key) => {
    console.log('SqlWorkspace handleDeleteTab key:', key);
  };

  return (
    <Tabs
      className="my-horizontal-tabs"
      editable
      type="card-gutter"
      activeTab={activeTab}
      onDeleteTab={handleDeleteTab}
      onChange={setActiveTab}
    >
      {tabs.map((x, i) => (
        <TabPane destroyOnHide key={x.key} title={x.title}>
          <div className="flex h-full flex-col overflow-hidden">
            <div className="max-h-[50%] border-b">
              <SqlEditor initialState={x.content} />
            </div>
            <div className="flex-1 overflow-auto">
              {x.status === 'process' && (
                <Alert
                  className="my-alert"
                  type="info"
                  title="操作提示"
                  content={
                    <Space>
                      <span>数据处理中，请稍后...</span>
                      <Spin dot />
                    </Space>
                  }
                />
              )}

              {x.error && (
                <Alert
                  className="my-alert"
                  type="error"
                  title="错误提示"
                  content={<span>{x.error.msg}</span>}
                />
              )}

              {x.status === 'done' && x.error === null && (
                <SqlResult initialState={x.content} />
              )}
            </div>
          </div>
        </TabPane>
      ))}
    </Tabs>
  );
};

export default SqlWorkspace;
