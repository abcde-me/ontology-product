import { Alert, Modal, Tabs } from '@arco-design/web-react';
import TabPane from '@arco-design/web-react/es/Tabs/tab-pane';
import React, { useState } from 'react';
import Tables from '../../dbdetail/tables';
import AutoDefine from '../../dbdetail/auto-define';
import Details from '../../dbdetail/details';
export default function DbModal(props: any) {
  const { visible, onCancel } = props;
  const [activeTab, setActiveTab] = useState('1');
  const renderTabContent = (key) => {
    switch (key) {
      case '1':
        return (
          <div style={{}}>
            <Alert
              type="info"
              content="仅展示前50行示例数据"
              style={{ margin: '16px 0px' }}
            />
            <Tables />
          </div>
        );
      case '2':
        return (
          <div style={{}}>
            <AutoDefine />
          </div>
        );
      case '3':
        return (
          <div style={{}}>
            <Details />
          </div>
        );
      default:
        return null;
    }
  };
  const tabList = [
    { key: '1', title: '示例数据' },
    { key: '2', title: '表定义' },
    { key: '3', title: '载入信息' }
  ];
  return (
    <div>
      <Modal
        className="detailModal"
        style={{ width: '960px', height: '700px' }}
        title={<div style={{ textAlign: 'left' }}>表详情</div>}
        visible={visible}
        onCancel={onCancel}
        footer={null}
      >
        <div className="modal-content-container">
          {/* 固定的Tab头部 */}
          <div className="tabs-header-wrapper">
            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              type="line"
              size="default"
            >
              {tabList.map((tab) => (
                <TabPane key={tab.key} title={tab.title} />
              ))}
            </Tabs>
          </div>

          {/* 可滚动的内容区域 */}
          <div className="scrollable-content">
            <div className="tab-content-wrapper">
              {renderTabContent(activeTab)}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
