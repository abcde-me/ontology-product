import { Alert, Modal, Tabs } from '@arco-design/web-react';
import TabPane from '@arco-design/web-react/es/Tabs/tab-pane';
import React, { useState, useEffect } from 'react';
import Tables from '../../dbdetail/tables';
import AutoDefine from '../../dbdetail/auto-define';
import Details from '../../dbdetail/details';
import { getDbItemDetail } from '@/api/dataCatalog';

interface DbModalProps {
  visible: boolean;
  onCancel: () => void;
  data?: {
    databaseName: string;
    tableName: string;
    path_id: number;
    table_id: number;
  } | null;
}

export default function DbModal(props: DbModalProps) {
  const { visible, onCancel, data } = props;
  const [activeTab, setActiveTab] = useState('1');
  const [dataList, setDataList] = useState({});
  console.log(data, data?.path_id, '查看点击详情后传递过来的数据ID');
  const getDataList = async () => {
    const params = {
      detail_type:
        activeTab == '1' ? 'sample' : activeTab == '2' ? 'ddl' : 'loader',
      database: data ? data.databaseName : '',
      table: data ? data.tableName : '',
      path_id: data ? data.path_id : 0,
      table_id: data ? data.table_id : 0
    };
    try {
      const res = await getDbItemDetail(params);
      // 调用获取数据的接口
      console.log(res, '查看接口返回的数据123456789');
      if (res.data) {
        setDataList(res.data);
      }
    } catch (error) {
      console.log(error, '查看接口返回的错误');
    }
  };
  useEffect(() => {
    if (!!data?.databaseName) {
      getDataList();
    }
  }, [activeTab, data]);
  const renderTabContent = (key: string) => {
    switch (key) {
      case '1':
        return (
          <div style={{ width: '100%' }}>
            <div className="table-wrapper">
              <Tables
                dataList={dataList}
                // tableName={data?.tableName}
              />
            </div>
          </div>
        );
      case '2':
        return (
          <div style={{}}>
            <AutoDefine dataList={dataList} />
          </div>
        );
      case '3':
        return (
          <div style={{}}>
            <Details dataList={dataList} />
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

          {/* 固定的Alert提示信息 - 仅在示例数据tab显示 */}
          {activeTab === '1' && (
            <Alert
              type="info"
              content="仅展示前50行示例数据"
              style={{ margin: '16px 0px' }}
            />
          )}

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
