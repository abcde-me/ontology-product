import React from 'react';
import { useColumns } from '../../hooks/useColumns';
import { useTable } from '../../hooks/useTable';
import { Table } from '@ccf2e/arco-material';
import NoDataPng from '@/assets/noData.svg';
import { useOrgEditor } from '../OrgProvider/Context';

export default function OrgTable() {
  const org = useOrgEditor();
  const { orgStore } = org;
  const { currentOrg } = orgStore.useGetState(['currentOrg']);
  console.log('OrgTable currentOrg: ', currentOrg);
  const columns = useColumns();

  // 总是调用 useTable，让它内部处理 organization_id 的逻辑
  const { tableProps, loading } = useTable({
    organization_id: currentOrg?.id
  });

  console.log('OrgTable loading:', loading, 'currentOrg?.id:', currentOrg?.id);

  return (
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
  );
}
