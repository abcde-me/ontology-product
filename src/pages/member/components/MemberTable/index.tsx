import { Spin } from '@arco-design/web-react';
import React from 'react';
import { useColumns } from '../../hooks/useColumns';
import { useTable } from '../../hooks/useTable';
import { Table } from '@ccf2e/arco-material';
import NoDataPng from '@/assets/noData.svg';

export default function MemberTable() {
  const columns = useColumns();
  const { tableProps, loading } = useTable();
  return (
    <Spin className="w-full" loading={loading} tip="加载中...">
      <Table
        {...tableProps}
        columns={columns as any}
        scroll={{
          x: 1200
        }}
        noDataElement={
          <div className="flex h-full min-h-[450px] w-full items-center justify-center">
            <NoDataPng />
          </div>
        }
      />
    </Spin>
  );
}
