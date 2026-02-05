import React, { useMemo } from 'react';
import { DotStatus } from '@ceai-front/arco-material';
import { TableColumnProps } from '@arco-design/web-react';
import { BehaviorLogItem, RUN_STATUS_MAP } from '../types';

// 格式化耗时（根据开始和结束时间计算）
const formatDuration = (startTime: string, endTime: string): string => {
  if (endTime === '-') return '-';

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const ms = end - start;

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
  type: 'action' | 'function',
  onViewDetail?: (record: BehaviorLogItem) => void
): TableColumnProps<BehaviorLogItem>[] => {
  return useMemo(() => {
    // 行为 tab 的列配置
    if (type === 'action') {
      return [
        {
          title: 'Session ID',
          dataIndex: 'session_id',
          width: 200,
          ellipsis: true,
          render: (value, record) => (
            <div
              className="hover-blue cursor-pointer font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]"
              onClick={() => onViewDetail?.(record)}
            >
              {value || '-'}
            </div>
          )
        },
        {
          title: 'Action ID',
          dataIndex: 'action_id',
          width: 120,
          render: (value) => (
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
              {value}
            </div>
          )
        },
        {
          title: '开始时间',
          dataIndex: 'start_time',
          width: 180,
          render: (value) => (
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
              {value}
            </div>
          )
        },
        {
          title: '结束时间',
          dataIndex: 'end_time',
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
          render: (_, record) => {
            const duration = formatDuration(record.start_time, record.end_time);
            return (
              <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
                {duration}
              </div>
            );
          }
        },
        {
          title: '状态',
          dataIndex: 'run_status',
          width: 120,
          render: (value: 1 | 2 | 3) => {
            const config = RUN_STATUS_MAP[value];
            if (!config) return '-';
            return (
              <DotStatus
                key={config.text}
                text={config.text}
                color={config.color}
              />
            );
          }
        },
        {
          title: '操作人',
          dataIndex: 'created_by',
          width: 120,
          render: (value) => (
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
              {value || '-'}
            </div>
          )
        }
      ];
    }

    // 函数 tab 的列配置（可以根据实际需求调整字段）
    return [
      {
        title: 'Session ID',
        dataIndex: 'session_id',
        width: 200,
        ellipsis: true,
        render: (value, record) => (
          <div
            className="hover-blue cursor-pointer font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]"
            onClick={() => onViewDetail?.(record)}
          >
            {value || '-'}
          </div>
        )
      },
      {
        title: 'Function ID',
        dataIndex: 'action_id', // 后端字段可能相同，只是展示名称不同
        width: 120,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value}
          </div>
        )
      },
      {
        title: '函数名称',
        dataIndex: 'run_log', // 假设函数名称存在 run_log 字段，根据实际调整
        width: 180,
        ellipsis: true,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value || '-'}
          </div>
        )
      },
      {
        title: '开始时间',
        dataIndex: 'start_time',
        width: 180,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value}
          </div>
        )
      },
      {
        title: '结束时间',
        dataIndex: 'end_time',
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
        render: (_, record) => {
          const duration = formatDuration(record.start_time, record.end_time);
          return (
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
              {duration}
            </div>
          );
        }
      },
      {
        title: '状态',
        dataIndex: 'run_status',
        width: 120,
        render: (value: 1 | 2 | 3) => {
          const config = RUN_STATUS_MAP[value];
          if (!config) return '-';
          return (
            <DotStatus
              key={config.text}
              text={config.text}
              color={config.color}
            />
          );
        }
      },
      {
        title: '操作人',
        dataIndex: 'created_by',
        width: 120,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value || '-'}
          </div>
        )
      }
    ];
  }, [type, onViewDetail]);
};
