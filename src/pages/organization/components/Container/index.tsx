import React from 'react';
import { Tooltip, Typography } from '@arco-design/web-react';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { useOrgEditor } from '../OrgProvider/Context';
import OrgTable from '../OrgTable';
import OrgTree from '../OrgTree';
import Search from '../Search';
import PreDelUserModal from '../PreDelUserModal';

export default function Container() {
  const org = useOrgEditor();
  const { orgStore } = org;
  const { currentOrg, total } = orgStore.useGetState();

  const renderOrgName = (text: string) => {
    const orgName = currentOrg?.name || '';

    // 判断字符长度，8个字符以下用普通span，超过8个字符用EllipsisPopover
    if (orgName.length <= 8) {
      return (
        <span className="inline-block text-[20px] font-[500] text-[#0F172A]">
          {orgName}
        </span>
      );
    } else {
      return (
        <EllipsisPopover
          preferTypography
          className="inline-block w-[180px] text-[20px] font-[500] text-[#0F172A]"
          content={orgName}
          value={orgName}
          ellipsis={{
            rows: 1,
            showTooltip: true
          }}
        ></EllipsisPopover>
      );
    }
  };

  return (
    <div className="ai-page-content-wrap">
      <div className="ai-page-content-lr flex items-stretch">
        <div className="ai-page-content-left">
          <OrgTree />
        </div>
        <div className="ai-page-content-right ai-page-content-right-scroll">
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-baseline gap-5">
              {/* 部门区域 - 动态宽度，8个字符以下缩小，8个字符以上省略 */}
              {renderOrgName(currentOrg?.name)}

              {/* 人数统计区域 - 固定宽度 */}
              <span className="flex-shrink-0 text-right">{total} 人</span>

              {/* 描述区域 - 弹性占据剩余空间 */}
              <div className="min-w-0 flex-1">
                <EllipsisPopover
                  preferTypography
                  className="w-full text-[14px] font-[400] text-[#0F172A]"
                  content={currentOrg?.desc || ''}
                  value={currentOrg?.desc}
                ></EllipsisPopover>
              </div>
            </div>
            <Search />
            <div className="mt-4">
              <OrgTable />
            </div>
          </div>
        </div>
      </div>
      <PreDelUserModal />
    </div>
  );
}
