import React, { useState, useEffect } from 'react';
import { Table, Spin } from '@arco-design/web-react';

export default function Tables(props) {
  const { dataList } = props;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载完成
    if (dataList && dataList.sample) {
      setLoading(false);
    }
  }, [dataList]);

  const columns = () => {
    if (dataList && dataList.sample && dataList.sample.columns) {
      return dataList.sample.columns.map((item) => ({
        title: item,
        dataIndex: item,
        width: 260
      }));
    }
    return []; // 如果数据不存在，返回空数组
  };

  return (
    <div>
      {loading ? (
        <Spin
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px'
          }}
        />
      ) : (
        <Table
          columns={columns()}
          data={dataList.sample?.data || []}
          pagination={false}
          scroll={{ x: '100%' }}
        />
      )}
      {/* <Table 
          columns={columns()} 
          data={dataList.sample?.data || []} 
          pagination={false} 
          scroll={{ x: '100%' }}
        /> */}
    </div>
  );
}
