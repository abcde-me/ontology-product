import React, { useMemo } from 'react';
import {
  DotStatus,
  CopyItemIcon,
  EllipsisPopover
} from '@ceai-front/arco-material';
import { TableColumnProps } from '@arco-design/web-react';
import { ObjectTypeTag } from '@/pages/ontologyScene/componens';
import { ContentWithCopy } from '@/pages/ontologyScene/componens';
import EllipsisTextWithTooltip from '../components/EllipsisTextWithTooltip';
import { BehaviorLogItem, RUN_STATUS_MAP } from '../types';

interface ObjectTypeFilter {
  text: string;
  value: number;
}

// 将毫秒转换为秒的辅助函数
const formatDuration = (duration: string | number | undefined): string => {
  if (!duration) return '-';
  const ms = typeof duration === 'string' ? parseFloat(duration) : duration;
  if (isNaN(ms)) return '-';
  return `${(ms / 1000).toFixed(2)}s`;
};

export const useColumns = (
  type: 'action' | 'function',
  onViewObjectTypeDetail?: (record: BehaviorLogItem) => void,
  onViewBehaviorDetail?: (record: BehaviorLogItem) => void,
  onViewExecutionDetail?: (record: BehaviorLogItem) => void,
  objectTypeFilters?: ObjectTypeFilter[],
  onViewFunctionDetail?: (record: BehaviorLogItem) => void
): TableColumnProps<BehaviorLogItem>[] => {
  return useMemo(() => {
    // 行为 tab 的列配置
    if (type === 'action') {
      return [
        {
          title: '执行id',
          dataIndex: 'id',
          width: 120,
          ellipsis: true,
          fixed: 'left',
          render: (value, record) => (
            <div
              onClick={() => {
                onViewExecutionDetail?.(record);
              }}
            >
              <EllipsisTextWithTooltip
                className="hover-blue min-w-0 cursor-pointer font-PingFangSc text-[14px] font-medium leading-[22px] text-[#23293b]"
                value={value || '-'}
                quiteMessage={false}
              />
            </div>
          )
        },
        {
          title: '来源',
          dataIndex: 'source',
          width: 120,
          render: (value) => {
            return <div>{value}</div>;
          }
        },
        {
          title: '行为名称',
          dataIndex: 'name',
          width: 180,
          render: (value, record) =>
            value ? (
              <div
                onClick={() => {
                  if (record.pk && record.pk !== 0) {
                    onViewBehaviorDetail?.(record);
                  }
                }}
                style={{ width: 180 }}
              >
                <EllipsisTextWithTooltip
                  className={`min-w-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969] ${record.pk && record.pk !== 0 ? 'hover-blue cursor-pointer' : ''}`}
                  value={value}
                />
              </div>
            ) : (
              '-'
            )
        },
        {
          title: '行为id',
          dataIndex: 'code',
          width: 180,
          ellipsis: true,
          render: (value) => (
            <div className="flex items-center gap-[8px]">
              <EllipsisPopover
                wrapperClassName="min-w-0 leading-[22px]"
                value={value || '-'}
              >
                {value}
              </EllipsisPopover>
              <ContentWithCopy value={value} />
            </div>
          )
        },
        {
          title: '描述说明',
          dataIndex: 'description',
          width: 200,
          render: (value) =>
            value ? (
              <EllipsisTextWithTooltip className="min-w-0" value={value} />
            ) : (
              '-'
            )
        },
        {
          title: '所属对象类型',
          dataIndex: 'associated_object_type',
          width: 180,
          filters: objectTypeFilters || [],
          filterMultiple: true,
          render: (value, record) => (
            <div>
              {value ? (
                <ObjectTypeTag
                  // @ts-ignore
                  ontologyObjectTypeIcon={record.associated_object_type_icon}
                  ontologyObjectTypeName={value}
                  ontologyObjectTypeId={String(
                    record.ontologyObjectTypeId || record.objectTypeID || ''
                  )}
                  onClick={() => onViewObjectTypeDetail?.(record)}
                />
              ) : (
                <span>-</span>
              )}
            </div>
          )
        },
        {
          title: '执行状态',
          dataIndex: 'run_status',
          width: 120,
          filters: [
            { text: '运行中', value: 1 },
            { text: '成功', value: 2 },
            { text: '失败', value: 3 },
            { text: '已停止', value: 4 }
          ],
          render: (value: 1 | 2 | 3 | 4) => {
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
          title: '执行耗时',
          dataIndex: 'duration',
          width: 120,
          render: (value) => (
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
              {formatDuration(value)}
            </div>
          )
        },
        {
          title: '开始时间',
          dataIndex: 'start_time',
          width: 180,
          sorter: true,
          render: (value) => (
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
              {value || '-'}
            </div>
          )
        },
        {
          title: '结束时间',
          dataIndex: 'end_time',
          width: 180,
          sorter: true,
          fixed: 'right',
          render: (value) => (
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
              {value || '-'}
            </div>
          )
        }
      ];
    }

    // 函数 tab 的列配置
    return [
      {
        title: '执行id',
        dataIndex: 'id',
        width: 120,
        ellipsis: true,
        fixed: 'left',
        render: (value, record) => (
          <div
            onClick={() => {
              onViewExecutionDetail?.(record);
            }}
          >
            <EllipsisTextWithTooltip
              className="hover-blue min-w-0 cursor-pointer font-PingFangSc text-[14px] font-medium leading-[22px] text-[#23293b]"
              value={value || '-'}
            />
          </div>
        )
      },
      {
        title: '来源',
        dataIndex: 'sources',
        width: 120,
        render: () => '函数测试'
      },
      {
        title: '显示名称',
        dataIndex: 'name',
        width: 180,
        ellipsis: true,
        render: (value, record) =>
          value ? (
            <div
              onClick={() => {
                if (record.pk) {
                  onViewFunctionDetail?.(record);
                }
              }}
            >
              <EllipsisTextWithTooltip
                className={`min-w-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969] ${record.pk ? 'hover-blue cursor-pointer' : ''}`}
                value={value}
              />
            </div>
          ) : (
            '-'
          )
      },
      {
        title: '函数名称(id)',
        dataIndex: 'code',
        width: 150,
        ellipsis: true,
        render: (value) => (
          <div className="flex items-center gap-[8px]">
            <ContentWithCopy value={value} />
          </div>
        )
      },
      {
        title: '描述说明',
        dataIndex: 'description',
        width: 200,
        render: (value) =>
          value ? (
            <EllipsisTextWithTooltip className="min-w-0" value={value} />
          ) : (
            '-'
          )
      },

      {
        title: '执行状态',
        dataIndex: 'run_status',
        width: 120,
        filters: [
          { text: '运行中', value: 1 },
          { text: '成功', value: 2 },
          { text: '失败', value: 3 },
          { text: '已停止', value: 4 }
        ],
        render: (value: 1 | 2 | 3 | 4) => {
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
        title: '执行耗时',
        dataIndex: 'duration',
        width: 120,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {formatDuration(value)}
          </div>
        )
      },
      {
        title: '开始时间',
        dataIndex: 'start_time',
        width: 180,
        sorter: true,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value || '-'}
          </div>
        )
      },
      {
        title: '结束时间',
        dataIndex: 'end_time',
        width: 180,
        sorter: true,
        fixed: 'right',
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value || '-'}
          </div>
        )
      }
    ];
  }, [
    type,
    onViewObjectTypeDetail,
    onViewBehaviorDetail,
    onViewExecutionDetail,
    objectTypeFilters,
    onViewFunctionDetail
  ]);
};
