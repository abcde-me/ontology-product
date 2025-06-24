import React from 'react';
import { Tooltip, Typography } from '@arco-design/web-react';
import { useOrgEditor } from '../OrgProvider/Context';
import OrgTable from '../OrgTable';
import OrgTree from '../OrgTree';
import Search from '../Search';

export default function Container() {
  const org = useOrgEditor();
  const { orgStore } = org;
  const { orgData, currentOrg, total } = orgStore.useGetState();
  const data = currentOrg?.currentOrg || currentOrg;

  return (
    <div className="m-2 flex rounded-lg bg-white p-6">
      <div className="w-[240px] min-w-[240px] flex-shrink-0">
        {
          // TODO: ts错误
          // @ts-expect-error
          orgData.length > 0 ? <OrgTree /> : '暂无数据'
        }
      </div>
      <div className="mx-4 w-px bg-gray-200" />
      <div className="min-w-0 flex-1">
        <div className="mb-2">
          <span className="mb-5 mr-5 text-2xl font-bold text-[#0F172A]">
            {data?.name}
          </span>
          <span className="mr-5">{total} 人</span>
          {/* 使用 CSS 控制省略号 */}
          <Tooltip content={data?.desc || ''}>
            <span
              style={{
                maxWidth: '220px', // 根据实际布局调整
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {data?.desc || ''}
            </span>
          </Tooltip>
        </div>
        <Search />
        <div className="mt-4">
          <OrgTable />
        </div>
      </div>
    </div>
  );
}
