import React, { FC, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Link,
  PaginationProps,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { getDatasetList } from '@/pages/sql/constant';
import { useTableList } from '../../hooks/useTableList';
// import { useSqlIndexStore, SqlIndexStore } from '../store';

const FormItem = Form.Item;

interface DatasetListParams {
  page?: number;
  page_size?: number;
  search_content?: string;
}

interface DatasetItem {
  id: number;
  script_name: string;
  dataset_name: string;
  dataset_table_name: string;
  /** 0: 导出中, 1: 导出成功, 2: 导出失败 */
  export_status: number;
  export_start_time: string;
}

const DatasetsList: FC = () => {
  // const showScriptDetail = useSqlIndexStore(
  //   (state: SqlIndexStore) => state.showScriptDetail
  // );

  // const showDatasetDetail = useSqlIndexStore(
  //   (state: SqlIndexStore) => state.showDatasetDetail
  // );

  const {
    listData,
    pagination,
    loading,
    handleSearchChange,
    handleTableChange
  } = useTableList<DatasetItem, DatasetListParams>({
    onRequest: getDatasetList,
    formatSorter: (sorter: any) => {
      let result = {};
      if (sorter.export_status) {
        result = {
          export_status: sorter.export_status
        };
      }
      return result;
    }
  });

  const columns: TableColumnProps[] = [
    {
      title: 'PySpark文件名称',
      dataIndex: 'script_name',
      width: 230,
      render: (_, item) => {
        return (
          <EllipsisPopover
            className="text-[var(--color-text-2)]"
            value={item.script_name}
            isEdit={false}
            isLink
            // handleLink={() => handleScriptDetail(item.id)}
          />
        );
      }
    },
    {
      title: '数据集名称',
      dataIndex: 'dataset_name',
      width: 230,
      render: (_, item) => {
        return (
          <EllipsisPopover
            className="text-[var(--color-text-2)]"
            value={item.dataset_name}
            isEdit={false}
            isLink
            // handleLink={() => handleDatasetDetail(item.id)}
          />
        );
      }
    },
    {
      title: '导出状态',
      dataIndex: 'export_status',
      width: 130,
      render: (_, item) => {
        let text = '未知状态';
        let color = '#999999';
        let actionBtn: React.ReactNode = null;

        switch (item.export_status) {
          case 0:
            text = '导出中';
            color = '#1890ff';
            actionBtn = (
              <Link href="#" onClick={() => handleStopTask(item.id)}>
                {' '}
                停止{' '}
              </Link>
            );
            break;
          case 1:
            text = '导出成功';
            color = '#52c41a';
            break;
          case 2:
            text = '导出失败';
            color = '#ff4d4f';
            actionBtn = (
              <Link href="#" onClick={() => handleRetryTask(item.id)}>
                {' '}
                重试{' '}
              </Link>
            );
            break;

          default:
            break;
        }

        return (
          <div className="flex items-center gap-[8px]">
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: color,
                borderRadius: '50%',
                marginRight: '5px'
              }}
            ></div>
            <span>{text}</span>
            {actionBtn}
          </div>
        );
      },
      filters: [
        {
          text: '导出中',
          value: 0
        },
        {
          text: '导出成功',
          value: 1
        },
        {
          text: '导出失败',
          value: 2
        }
      ]
    },
    {
      title: '操作时间',
      dataIndex: 'export_start_time',
      width: 180,
      render: (_, item) => (
        <div className="fontMM">{item.export_start_time}</div>
      ),
      sorter: (a, b) => a.export_start_time.localeCompare(b.export_start_time)
    }
  ];

  function handleStopTask(id: number) {
    console.log('停止任务', id);
  }

  function handleRetryTask(id: number) {
    console.log('重试任务', id);
  }

  // function handleScriptDetail(id: number) {
  //   showScriptDetail && showScriptDetail();
  // }

  // function handleDatasetDetail(id: number) {
  //   showDatasetDetail && showDatasetDetail();
  // }

  return (
    <div className="flex h-full flex-col overflow-y-hidden p-[20px]">
      <h1 className="mb-[15px] text-[20px] font-bold">数据集导出任务</h1>
      <Form
        autoComplete="off"
        layout="inline"
        onValuesChange={handleSearchChange}
      >
        <FormItem field="search_content" style={{ marginRight: 12 }}>
          <Input.Search allowClear placeholder="输入文件名搜索" />
        </FormItem>
      </Form>
      <Table
        style={{
          width: '100%',
          height: '100%'
        }}
        columns={columns}
        data={listData}
        pagination={pagination}
        loading={loading}
        rowKey="id"
        onChange={handleTableChange}
        scroll={{ y: 500 }}
      />
    </div>
  );
};

export default DatasetsList;
