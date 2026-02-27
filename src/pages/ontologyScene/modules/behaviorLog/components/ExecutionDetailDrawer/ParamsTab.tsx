import React from 'react';
import { Table, TableColumnProps } from '@arco-design/web-react';
import { NoDataCard, EllipsisPopover } from '@ceai-front/arco-material';
import { ObjectTypeTagList } from '@/pages/ontologyScene/componens';
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
      render: (value, record) => {
        // 如果数据类型是 ObjectSet 或 Attachment，使用 ObjectTypeTagList 渲染
        if (record.type === 'ObjectSet' || record.type === 'Attachment') {
          // value 应该是一个对象类型列表数组
          const objectTypeList = Array.isArray(value) ? value : [];

          if (objectTypeList.length === 0) {
            return <span>-</span>;
          }

          // 转换为 ObjectTypeTagList 需要的格式
          const tags = objectTypeList.map((item: any) => ({
            ontologyObjectTypeName:
              item.name || item.ontologyObjectTypeName || '',
            ontologyObjectTypeId: item.id || item.ontologyObjectTypeId,
            ontologyObjectTypeIcon: item.icon || item.ontologyObjectTypeIcon,
            onClick: () => {
              // 可以添加点击事件，跳转到对象类型详情
              console.log('Click object type:', item);
            }
          }));

          return <ObjectTypeTagList tags={tags} />;
        }

        // 其他类型的值渲染
        if (typeof value === 'object') {
          return (
            <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
          );
        }

        const stringValue = String(value);
        return <EllipsisPopover value={stringValue} isEdit={false} />;
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
