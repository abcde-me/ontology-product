import React, { useState, useEffect } from 'react';
import { Table, Spin } from '@arco-design/web-react';

export default function Tables(props) {
  const { dataList } = props;
  const [loading, setLoading] = useState(true);
  //格式化时间函数
  // const formatDateTime = (dateTimeString: string): string => {
  //   try {
  //     const date = new Date(dateTimeString);
  //     const year = date.getFullYear();
  //     const month = String(date.getMonth() + 1).padStart(2, '0');
  //     const day = String(date.getDate()).padStart(2, '0');
  //     const hours = String(date.getHours()).padStart(2, '0');
  //     const minutes = String(date.getMinutes()).padStart(2, '0');
  //     const seconds = String(date.getSeconds()).padStart(2, '0');

  //     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  //   } catch (error) {
  //     return dateTimeString; // 如果格式化失败，返回原字符串
  //   }
  // };
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
          data={dataList.sample?.data.slice(0, 50) || []}
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
