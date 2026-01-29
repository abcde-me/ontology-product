import React, { useMemo } from 'react';
import { DotStatus } from '@ceai-front/arco-material';
import { TableColumnProps, Tag } from '@arco-design/web-react';
import { BehaviorLogItem, STATUS_CONFIG } from '../types';

// 格式化耗时
const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
};

export const useColumns = (
  onViewDetail?: (record: BehaviorLogItem) => void
): TableColumnProps<BehaviorLogItem>[] => {
  return useMemo(
    () => [
      {
        title: '类型',
        dataIndex: 'type',
        width: 150
      },
      {
        title: '名称',
        dataIndex: 'name',
        width: 200,
        ellipsis: true,
        render: (value, record) => (
          <div
            className="hover-blue font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]"
            onClick={() => onViewDetail?.(record)}
          >
            {value}
          </div>
        )
      },
      {
        title: '对象类型',
        dataIndex: 'objectType',
        width: 150,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value || '-'}
          </div>
        )
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        width: 180,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value}
          </div>
        )
      },
      {
        title: '结束时间',
        dataIndex: 'endTime',
        width: 180,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value}
          </div>
        )
      },
      {
        title: '耗时',
        dataIndex: 'duration',
        width: 120,
        render: (value, record) => {
          if (record.status === 'running') {
            return (
              <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#86909c]">
                -
              </div>
            );
          }
          return (
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
              {formatDuration(value)}
            </div>
          );
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (value: 'success' | 'running' | 'failed') => {
          const config = STATUS_CONFIG[value];
          return (
            <DotStatus
              key={config.text}
              text={config.text}
              color={config.color}
            />
          );
        }
      }
    ],
    [onViewDetail]
  );
};
