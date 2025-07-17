import { Spin, Button, Empty, Space, Typography } from '@arco-design/web-react';
import React from 'react';
import { useColumns } from '../../hooks/useColumns';
import { useTable } from '../../hooks/useTable';
import { Table } from '@ccf2e/arco-material';
import { useMemberEditor } from '../../components/MemberProvider/Context';
import NoDataPng from '@/assets/noData.svg';
import noDataElement from '@/components/no-data';

export default function MemberTable() {
  const columns = useColumns();
  const { tableProps } = useTable();
  return (
    <Table
      {...tableProps}
      columns={columns as any}
      scroll={{
        x: 1200
      }}
      noDataElement={noDataElement({ description: '暂无数据' })}
    />
  );
}
