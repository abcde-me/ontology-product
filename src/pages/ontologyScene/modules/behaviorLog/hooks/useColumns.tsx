import React, { useMemo } from 'react';
import {
  DotStatus,
  CopyItemIcon,
  EllipsisPopover
} from '@ceai-front/arco-material';
import { TableColumnProps } from '@arco-design/web-react';
import { ObjectTypeTag } from '@/pages/ontologyScene/componens';
import { BehaviorLogItem, RUN_STATUS_MAP } from '../types';

interface ObjectTypeFilter {
  text: string;
  value: string;
}

export const useColumns = (
  type: 'action' | 'function',
  onViewObjectTypeDetail?: (record: BehaviorLogItem) => void,
  onViewBehaviorDetail?: (record: BehaviorLogItem) => void,
  onViewExecutionDetail?: (record: BehaviorLogItem) => void,
  objectTypeFilters?: ObjectTypeFilter[]
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
              className="hover-blue cursor-pointer font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]"
              onClick={() => {
                onViewExecutionDetail?.(record);
              }}
            >
              {value || '-'}
            </div>
          )
        },
        {
          title: '来源',
          dataIndex: 'sources',
          width: 120,
          filters: [
            { text: '手动触发', value: 'manual' },
            { text: '自动触发', value: 'auto' },
            { text: 'API调用', value: 'api' }
          ],
          render: (value) => {
            const sourceMap: Record<string, { text: string }> = {
              manual: { text: '手动触发' },
              auto: { text: '自动触发' },
              api: { text: 'API调用' }
            };
            const config = sourceMap[value] || { text: value };
            return <div>{config.text}</div>;
          }
        },
        {
          title: '行为名称',
          dataIndex: 'name',
          width: 180,
          ellipsis: true,
          render: (value, record) =>
            value ? (
              <div
                onClick={() => {
                  onViewBehaviorDetail?.(record);
                }}
                className="hover-blue cursor-pointer font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]"
              >
                {value}
              </div>
            ) : (
              '-'
            )
        },
        {
          title: '行为id',
          dataIndex: 'code',
          width: 150,
          ellipsis: true,
          render: (value) => (
            <div className="flex items-center gap-2">
              <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
                {value || '-'}
              </div>
              {value && (
                <CopyItemIcon className="hidden flex-shrink-0" value={value} />
              )}
            </div>
          )
        },
        {
          title: '描述说明',
          dataIndex: 'description',
          ellipsis: true,
          tooltip: true,
          width: 200,
          render: (value) => (
            <div>
              {value ? (
                <EllipsisPopover
                  value={value}
                  isEdit={false}
                  preferTypography
                />
              ) : (
                '-'
              )}
            </div>
          )
        },
        {
          title: '所属对象类型',
          dataIndex: 'ontologyObjectTypeName',
          width: 180,
          filters: objectTypeFilters || [],
          render: (value, record) => (
            <div>
              {value ? (
                <ObjectTypeTag
                  ontologyObjectTypeIcon={record.ontologyObjectTypeIcon}
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
            { text: '处理中', value: 1 },
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
              {value || '-'}
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
            className="hover-blue cursor-pointer font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]"
            onClick={() => {
              onViewExecutionDetail?.(record);
            }}
          >
            {value || '-'}
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
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value || '-'}
          </div>
        )
      },
      {
        title: '函数名称(id)',
        dataIndex: 'code',
        width: 150,
        ellipsis: true,
        render: (value) => (
          <div className="flex items-center gap-2">
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
              {value || '-'}
            </div>
            {value && (
              <CopyItemIcon className="hidden flex-shrink-0" value={value} />
            )}
          </div>
        )
      },
      {
        title: '描述说明',
        dataIndex: 'description',
        width: 200,
        ellipsis: true,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
            {value || '-'}
          </div>
        )
      },

      {
        title: '执行状态',
        dataIndex: 'run_status',
        width: 120,
        filters: [
          { text: '处理中', value: 1 },
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
            {value || '-'}
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
    objectTypeFilters
  ]);
};
