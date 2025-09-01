import React, { FC, useEffect, useState } from 'react';
import { Input, Pagination, Table } from '@arco-design/web-react';
import { IconFile } from '@arco-design/web-react/icon';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';

const Datasets: FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [listData, setListData] = useState([]);
  const [loading, setLoding] = React.useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const columns: any = [
    {
      title: 'SQL文件名称',
      dataIndex: 'name',
      width: 230,
      ellipsis: true,
      render: (_, item) => {
        return <EllipsisPopover value={item.name} isEdit={false} />;
      }
    },
    {
      title: '数据集名称',
      dataIndex: 'name',
      width: 230,
      ellipsis: true,
      render: (_, item) => {
        return <EllipsisPopover value={item.name} isEdit={false} />;
      }
    },
    {
      title: '导出状态',
      dataIndex: 'status',
      width: 130,
      render: (_, item) => {
        const text = '未知状态';
        const color = '#999999';
        return (
          <div className="flex items-center">
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: color,
                borderRadius: '50%',
                marginRight: '5px'
              }}
            ></div>
            <div>{text}</div>
          </div>
        );
      },
      filters: [
        {
          text: '导出中',
          value: 1
        },
        {
          text: '导出成功',
          value: 2
        }
      ]
    },
    {
      title: '文件大小',
      width: 120,
      render: (_, item) => {
        return '24KB';
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
      render: (_, item) => <div className="fontMM">{item.created_at}</div>,
      sorter: (a, b) => a.created_at.localeCompare(b.created_at)
    },
    {
      title: '操作',
      width: 130,
      fixed: 'right',
      render: (_, record) => {
        const perms = record?.perms || [];
        const config = [] as any;
        config.push({
          label: '详情',
          onClick: () => handleDetail(record)
        });
        return null;
      }
    }
  ];

  const handlePressEnter = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
      name: searchValue
    }));
  };

  function handleDetail(record) {
    console.log('查看详情', record);
  }

  function handlePageChange(page) {
    setPagination((prev) => ({
      ...prev,
      current: page
    }));
  }

  return (
    <div className="flex h-full flex-col overflow-y-hidden p-[20px]">
      <h1 className="mb-[15px] text-[20px] font-bold">数据集导出任务</h1>
      <div className="flex w-full justify-between">
        <Input.Search
          allowClear
          placeholder="输入数据集搜索"
          style={{ width: 220 }}
          onPressEnter={handlePressEnter}
          defaultValue={searchValue}
          onChange={(value) => setSearchValue(value)}
          onClear={() => {}}
        />
      </div>
      <Table
        border={false}
        columns={columns}
        data={listData}
        noDataElement={noDataElement({ description: '暂无数据' })}
        style={{ padding: '16px 0px' }}
        pagination={false}
        rowKey="id"
        loading={loading}
        onChange={(pagination, sorter, filters) => {
          console.log(
            'pagination, sorter, filters',
            pagination,
            sorter,
            filters
          );
        }}
      />

      {/* 分页 */}
      {listData && listData.length > 0 && (
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          onPageSizeChange={(pageSize) => {
            setPagination((prev) => ({
              ...prev,
              pageSize,
              current: 1
            }));
          }}
          onChange={handlePageChange}
          sizeOptions={[10, 20, 50, 100]}
          showTotal
          total={pagination.total}
          showJumper
          sizeCanChange
          style={{ marginBottom: '20px' }}
        />
      )}
    </div>
  );
};

export default Datasets;

function formatApiData(data: any[]): any[] {
  const addIcon = (item: any): any => {
    const newItem = { ...item };

    // 根据类型设置图标
    switch (item.type) {
      case 'table':
        newItem.icon = <IconFile className="text-gray-500" />;
        break;
      default:
        newItem.icon = <IconFile className="text-gray-500" />;
    }

    // 递归处理子节点
    if (item.children && item.children.length > 0) {
      newItem.children = item.children.map(addIcon);
    }

    return newItem;
  };

  return data.map(addIcon);
}
