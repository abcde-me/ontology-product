import React, { useState, useEffect } from 'react';
import { Table, TableColumnProps } from '@arco-design/web-react';
import { NoDataCard } from '@ceai-front/arco-material';
import {
  ObjectTypeTagList,
  ParamValueRenderer
} from '@/pages/ontologyScene/componens';
import { ParamItem, OutputParamItem } from './types';
import dayjs from 'dayjs';
import { getOntologyObjectTypeDetail } from '@/api/ontologySceneLibrary/objectType';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import EllipsisTextWithTooltip from '../EllipsisTextWithTooltip';
import styles from './index.module.scss';

const PAGE_SIZ6 = 6;

interface ParamsTabProps {
  params: ParamItem[];
  outputParams: OutputParamItem[];
  loading?: boolean;
}

export const ParamsTab: React.FC<ParamsTabProps> = ({
  params,
  outputParams,
  loading
}) => {
  const inputColumns: TableColumnProps<ParamItem>[] = [
    {
      title: '入参名称',
      dataIndex: 'name',
      width: 200,
      render: (value) => (
        <EllipsisTextWithTooltip value={value || '-'} className="min-w-0" />
      )
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      width: 150
    },
    {
      title: '试运行值',
      dataIndex: 'value',
      ellipsis: true,
      tooltip: true,
      width: 300,
      render: (value, record) => (
        <ParamValueRenderer value={value} record={record} />
      )
    }
  ];

  const outputColumns: TableColumnProps<OutputParamItem>[] = [
    {
      title: '出参名称',
      dataIndex: 'name',
      width: 200,
      render: (value) => (
        <EllipsisTextWithTooltip value={value || '-'} className="min-w-0" />
      )
    },
    {
      title: '出参类型',
      dataIndex: 'type',
      width: 150
    }
  ];

  return (
    <div className="mt-4 space-y-4">
      {/* 入参详情 */}
      <div>
        <div className="mb-4 text-[14px] font-medium text-[#1E293B]">
          入参详情
        </div>
        <Table
          loading={loading}
          columns={inputColumns}
          data={params}
          rowKey="name"
          border={false}
          pagination={{
            pageSize: PAGE_SIZ6,
            showTotal: false
          }}
          noDataElement={<NoDataCard title="暂无数据" />}
          className={styles['execution-simple-page']}
        />
      </div>

      {/* 出参详情 */}
      <div>
        <div className="mb-4 text-[14px] font-medium text-[#1E293B]">
          出参详情
        </div>
        <Table
          loading={loading}
          columns={outputColumns}
          data={outputParams}
          rowKey="name"
          border={false}
          pagination={{
            pageSize: PAGE_SIZ6,
            showTotal: false
          }}
          noDataElement={<NoDataCard title="暂无数据" />}
          className="[&_.arco-table-th]:bg-[#f7f8fa]"
        />
      </div>
    </div>
  );
};
