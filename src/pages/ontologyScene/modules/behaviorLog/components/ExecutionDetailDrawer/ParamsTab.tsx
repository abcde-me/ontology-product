import React from 'react';
import { Table, TableColumnProps } from '@arco-design/web-react';
import { NoDataCard } from '@ceai-front/arco-material';
import { ParamItem, OutputParamItem } from './types';

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
      width: 200
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      width: 150
    },
    {
      title: '值',
      dataIndex: 'value',
      render: (value) => {
        if (typeof value === 'object') {
          return (
            <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
          );
        }
        return String(value);
      }
    }
  ];

  const outputColumns: TableColumnProps<OutputParamItem>[] = [
    {
      title: '出参名称',
      dataIndex: 'name',
      width: 200
    },
    {
      title: '出参类型',
      dataIndex: 'type',
      width: 150
    },
    {
      title: '值',
      dataIndex: 'value',
      render: (value) => {
        if (!value) return '-';
        if (typeof value === 'object') {
          return (
            <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
          );
        }
        return String(value);
      }
    }
  ];

  return (
    <div className="mt-4 space-y-6">
      {/* 入参详情 */}
      <div>
        <div className="mb-3 text-[14px] font-medium text-[#1E293B]">
          入参详情
        </div>
        <Table
          loading={loading}
          columns={inputColumns}
          data={params}
          rowKey="name"
          border={false}
          pagination={{
            pageSize: 5,
            showTotal: false,
            simple: false
          }}
          noDataElement={<NoDataCard title="暂无数据" />}
          className="[&_.arco-table-th]:bg-[#f7f8fa]"
        />
      </div>

      {/* 出参详情 */}
      <div>
        <div className="mb-3 text-[14px] font-medium text-[#1E293B]">
          出参详情
        </div>
        <Table
          loading={loading}
          columns={outputColumns}
          data={outputParams}
          rowKey="name"
          border={false}
          pagination={{
            pageSize: 5,
            showTotal: false,
            simple: false
          }}
          noDataElement={<NoDataCard title="暂无数据" />}
          className="[&_.arco-table-th]:bg-[#f7f8fa]"
        />
      </div>
    </div>
  );
};
