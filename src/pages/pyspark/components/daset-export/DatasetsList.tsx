import React, { FC, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Link,
  Message,
  PaginationProps,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import {
  getExportDatasetList,
  retryExportDataset,
  stopExportDataset
} from '@/api/pyspark';
import { useTableList } from '../../hooks/useTableList';
import {
  ExportStatus,
  GetExportDatasetListItem,
  GetExportDatasetListReq
} from '@/types/pythonApi';
import { formatFileSize } from '@/utils/format';
import noDataElement from '@/components/no-data';
import { PYSPARK_PERMISSIONS } from '@/config/permissions';

const FormItem = Form.Item;

const DatasetsList: FC = () => {
  const {
    listData,
    pagination,
    loading,
    handleSearchChange,
    handleTableChange
  } = useTableList<GetExportDatasetListItem, GetExportDatasetListReq>({
    onRequest: getExportDatasetList,
    formatFilter: (filters: any) => {
      let result = {};
      if (filters.status) {
        result = {
          status: filters.status
        };
      }
      return result;
    },
    formatSorter: (sorter: any) => {
      let result = {};
      if (sorter.field && sorter.direction) {
        result = {
          sort_field: sorter.field,
          sort_order: sorter.direction === 'ascend' ? 'asc' : 'desc'
        };
      }
      return result;
    }
  });

  const columns: TableColumnProps[] = [
    {
      title: 'PySpark文件名称',
      dataIndex: 'pyspark_name',
      width: 230,
      render: (_, item) => {
        return (
          <EllipsisPopover
            className="text-[var(--color-text-2)]"
            value={item.pyspark_name}
            isEdit={false}
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
          />
        );
      }
    },
    {
      title: '导出状态',
      dataIndex: 'status',
      width: 130,
      render: (_, item) => {
        let text = '未知状态';
        let color = '#999999';
        let actionBtn: React.ReactNode = null;

        switch (item.status) {
          case ExportStatus.Exporting:
            text = '导出中';
            color = '#1890ff';
            actionBtn = item.perms?.includes(
              PYSPARK_PERMISSIONS.CAN_EXPORT_STOP
            ) && (
              <Link href="#" onClick={() => handleStopTask(item)}>
                {' '}
                停止{' '}
              </Link>
            );
            break;
          case ExportStatus.ExportSuccess:
            text = '导出成功';
            color = '#52c41a';
            break;
          case ExportStatus.ExportFailed:
            text = '导出失败';
            color = '#ff4d4f';
            actionBtn = item.perms?.includes(
              PYSPARK_PERMISSIONS.CAN_EXPORT_RETRY
            ) && (
              <Link href="#" onClick={() => handleRetryTask(item)}>
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
      filterMultiple: true,
      filters: [
        {
          text: '导出中',
          value: ExportStatus.Exporting
        },
        {
          text: '导出成功',
          value: ExportStatus.ExportSuccess
        },
        {
          text: '导出失败',
          value: ExportStatus.ExportFailed
        }
      ],
      onFilter: (value, record) => {
        return value.includes(record.status);
      }
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      width: 180,
      render: (_, item) => (
        <div className="fontMM">{formatFileSize(item.size)}</div>
      )
    },
    {
      title: '操作时间',
      dataIndex: 'created_at',
      width: 180,
      render: (_, item) => <div className="fontMM">{item.created_at}</div>,
      sorter: (a, b) => a.export_start_time.localeCompare(b.export_start_time)
    }
  ];

  async function handleStopTask(item: GetExportDatasetListItem) {
    const res = await stopExportDataset(item.id, {
      pyspark_id: item.pyspark_id
    });

    if (res.code == '' && res.status == 200) {
      Message.success('停止任务成功');
    } else {
      Message.error(res.message ?? '停止任务失败');
    }
  }

  async function handleRetryTask(item: GetExportDatasetListItem) {
    const res = await retryExportDataset(item.id, {
      pyspark_id: item.pyspark_id
    });
    if (res.code == '' && res.status == 200) {
      Message.success('重试任务成功');
    } else {
      Message.error(res.message ?? '重试任务失败');
    }
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
      <Form autoComplete="off" layout="inline">
        <FormItem field="file_name" style={{ marginRight: 12 }}>
          <Input.Search
            allowClear
            placeholder="输入文件名搜索"
            onSearch={(value) => {
              handleSearchChange({ file_name: value });
            }}
            onClear={() => {
              handleSearchChange({ file_name: '' });
            }}
          />
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
        noDataElement={noDataElement({ description: '暂无数据' })}
      />
    </div>
  );
};

export default DatasetsList;
