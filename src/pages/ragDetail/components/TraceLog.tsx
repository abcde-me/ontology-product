/**
 * Trace Log Component
 * 溯源日志组件
 */

import React from 'react';
import {
  mockTraceLogStatistics,
  mockNodeDetails
} from '../utils/traceLogMockData';
import CollapsibleNodePanel from './CollapsibleNodePanel';
import AllNodeIconSvg from '@/assets/rag/all-node-icon.svg';
import SuccessNodeIconSvg from '@/assets/rag/success-node-icon.svg';
import AllTimeIconSvg from '@/assets/rag/all-time-icon.svg';

const TraceLog: React.FC = () => {
  const statistics = mockTraceLogStatistics;
  const nodeDetails = mockNodeDetails;

  return (
    <div className="flex h-full flex-col">
      {/* Statistics Cards */}
      <div className="mb-5 grid grid-cols-3 gap-4  pt-6">
        {/* Total Nodes Card */}
        <div
          className="relative flex items-center overflow-hidden rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(24, 79, 242, 0.2) 0%, rgba(106, 149, 246, 0.1) 100%)',
            paddingTop: '18.5px',
            paddingBottom: '18.5px',
            paddingLeft: '24px',
            paddingRight: '16px'
          }}
        >
          <div
            className="flex-shrink-0"
            style={{ width: '56px', height: '56px', marginRight: '16px' }}
          >
            <AllNodeIconSvg style={{ width: '100%', height: '100%' }} />
          </div>
          <div>
            <div className="text-sm font-medium text-[#0F131F]">总节点量</div>
            <div className="text-3xl font-semibold text-[#0F131F]">
              {statistics.totalNodes}
            </div>
          </div>
        </div>

        {/* Success Nodes Card */}
        <div
          className="relative flex items-center overflow-hidden rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(12, 191, 146, 0.2) 0%, rgba(87, 217, 175, 0.1) 100%)',
            paddingTop: '18.5px',
            paddingBottom: '18.5px',
            paddingLeft: '24px',
            paddingRight: '16px'
          }}
        >
          <div
            className="flex-shrink-0"
            style={{ width: '56px', height: '56px', marginRight: '16px' }}
          >
            <SuccessNodeIconSvg style={{ width: '100%', height: '100%' }} />
          </div>
          <div>
            <div className="text-sm font-medium text-[#0F131F]">成功节点</div>
            <div className="text-3xl font-semibold text-[#0F131F]">
              {statistics.successNodes}
            </div>
          </div>
        </div>

        {/* Total Time Card */}
        <div
          className="relative flex items-center overflow-hidden rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(79, 24, 242, 0.2) 0%, rgba(150, 105, 247, 0.1) 100%)',
            paddingTop: '18.5px',
            paddingBottom: '18.5px',
            paddingLeft: '24px',
            paddingRight: '16px'
          }}
        >
          <div
            className="flex-shrink-0"
            style={{ width: '56px', height: '56px', marginRight: '16px' }}
          >
            <AllTimeIconSvg style={{ width: '100%', height: '100%' }} />
          </div>
          <div>
            <div className="text-sm font-medium text-[#0F131F]">总处理时间</div>
            <div className="text-3xl font-semibold text-[#0F131F]">
              {statistics.totalTime}
            </div>
          </div>
        </div>
      </div>

      {/* Node Details Section */}
      <div className="flex-1 overflow-hidden  pb-6">
        <div className="mb-3 text-base font-medium text-[#0F131F]">
          节点详情
        </div>
        <div className="scrollbar-hide h-[calc(100%-2rem)] overflow-y-auto rounded-lg  bg-white">
          {nodeDetails.map((node) => (
            <CollapsibleNodePanel key={node.id} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TraceLog;
