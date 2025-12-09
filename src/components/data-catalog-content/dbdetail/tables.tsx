import React, { useState, useEffect, useMemo } from 'react';
import { Table, Spin, Typography } from '@arco-design/web-react';
import { get } from 'lodash-es';
import EllipsisPopover from '@/components/ellipsis-popover-com';

export default function Tables(props) {
  const { dataList } = props;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载完成
    if (dataList && dataList?.sample) {
      setLoading(false);
    }
  }, [dataList]);

  const tableColumns = useMemo(() => {
    return (get(dataList, 'sample.columns', []) || []).map((item) => ({
      title: item,
      dataIndex: item,
      width: 260,
      render: (_, record) => {
        return <EllipsisPopover value={record[item]} preferTypography />;
      }
    }));
  }, [dataList]);

  const tableData = useMemo(() => {
    return (get(dataList, 'sample.data', []) || []).slice(0, 50);
  }, [dataList]);

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
          columns={tableColumns}
          data={tableData}
          pagination={false}
          border={false}
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
