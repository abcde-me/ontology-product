import { Spin } from '@arco-design/web-react';
import React from 'react';
import { useColumns } from '../../hooks/useColumns';
import { useTable } from '../../hooks/useTable';
import { Table } from '@ccf2e/arco-material';
import NoDataPng from '@/assets/noData.svg';
import { useOrgEditor } from '../OrgProvider/Context'

export default function OrgTable() {
  const org = useOrgEditor();
  const { orgStore } = org;
  const {  currentOrg } = orgStore.useGetState([ 'currentOrg']);
  const columns = useColumns();
  const { tableProps, loading } = useTable({
    organization_id: currentOrg?.id || '1'
  });
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
