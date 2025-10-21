import React, { FC, useState } from 'react';
import {
  Form,
  Input,
  Link,
  Message,
  Table,
  TableColumnProps,
  Tooltip
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
import { IconInfoCircle } from '@arco-design/web-react/icon';
import ModalDatasetDetail from '../data-manager/ModalDatasetDetail';
import { PermissionWrapper } from '@/components/PermissionGuard';

const FormItem = Form.Item;

const DatasetsList: FC = () => {
  const {
    listData,
    pagination,
    loading,
    loadData,
    handleSearchChange,
    handleTableChange
  } = useTableList<GetExportDatasetListItem, GetExportDatasetListReq>({
    onRequest: getExportDatasetList,
    formatFilter: (filters: any) => {
      let result: any = {
        status: undefined
      };
      if (filters.status) {
        result = {
          status: filters.status
        };
      }
      return result;
    },
    formatSorter: (sorter: any) => {
      let result: any = {
        sort_field: undefined,
        sort_order: undefined
      };
      if (sorter.field && sorter.direction) {
        result = {
          sort_field: sorter.field,
          sort_order: sorter.direction === 'ascend' ? 'asc' : 'desc'
        };
      }
      return result;
    }
  });

  // 数据集详情Modal状态管理
  const [datasetDetailVisible, setDatasetDetailVisible] = useState(false);
  const [detailId, setDetailId] = useState('');

  function handleDatasetDetail(id: number) {
    setDetailId(id.toString());
    setDatasetDetailVisible(true);
  }

  function closeDatasetDetail() {
    setDatasetDetailVisible(false);
    setDetailId('');
  }

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
            isLink={true}
            handleLink={() => handleDatasetDetail(item.dataset_id || 0)}
          />
        );
      }
    },
    {
      title: '导出状态',
      dataIndex: 'status',
      width: 140,
      render: (_, item) => {
        let text = '未知状态';
        let color = '#999999';
        let actionBtn: React.ReactNode = null;

        switch (item.status) {
          case ExportStatus.Exporting:
            text = '导出中';
            color = '#1890ff';
            actionBtn = (
              <PermissionWrapper
                permission={PYSPARK_PERMISSIONS.CAN_EXPORT_STOP}
              >
                <Link href="#" onClick={() => handleStopTask(item)}>
                  {' '}
                  停止{' '}
                </Link>
              </PermissionWrapper>
            );
            break;
          case ExportStatus.ExportSuccess:
            text = '导出成功';
            color = '#52c41a';
            break;
          case ExportStatus.ExportFailed:
            text = '导出失败';
            color = '#ff4d4f';
            actionBtn = (
              <PermissionWrapper
                permission={PYSPARK_PERMISSIONS.CAN_EXPORT_RETRY}
              >
                <Tooltip content={item.err_reason}>
                  <IconInfoCircle />
                </Tooltip>
              </PermissionWrapper>
            );
            break;
          case ExportStatus.ExportTerminated:
            text = '导出终止';
            color = '#FB923C';
            actionBtn = (
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
                borderRadius: '50%'
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
        },
        {
          text: '导出终止',
          value: ExportStatus.ExportTerminated
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
        <div className="fontMM">
          {item.status === ExportStatus.ExportFailed ||
          item.status === ExportStatus.ExportTerminated
            ? '-'
            : formatFileSize(item.size)}
        </div>
      )
    },
    {
      title: '操作时间',
      dataIndex: 'created_at',
      width: 180,
      render: (_, item) => <div className="fontMM">{item.created_at}</div>,
      sorter: (a, b) => a.created_at.localeCompare(b.created_at)
    }
  ];

  async function handleStopTask(item: GetExportDatasetListItem) {
    const res = await stopExportDataset(item.id, {
      pyspark_id: item.pyspark_id
    });

    if (res.code == '' && res.status == 200) {
      Message.success('停止任务成功');
      loadData();
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
      loadData();
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
    <div className="flex h-full flex-col overflow-y-auto p-[20px]">
      <h1 className="mb-[15px] text-[20px] font-bold">数据集导出任务</h1>
      <Form autoComplete="off" layout="inline">
        <FormItem field="file_name" style={{ marginRight: 12 }}>
          <Input.Search
            allowClear
            placeholder="输入数据集名称搜索"
            onSearch={(value) => {
              handleSearchChange({ name: value });
            }}
            onClear={() => {
              handleSearchChange({ name: '' });
            }}
          />
        </FormItem>
      </Form>
      <Table
        // style={{
        //   width: '100%',
        //   height: '100%'
        // }}
        columns={columns}
        data={listData}
        pagination={pagination}
        loading={loading}
        rowKey="id"
        onChange={handleTableChange}
        scroll={{ y: 500 }}
        noDataElement={noDataElement({ description: '暂无数据' })}
      />

      {datasetDetailVisible && (
        <ModalDatasetDetail
          detailId={detailId}
          datasetDetailVisible={datasetDetailVisible}
          closeDatasetDetail={closeDatasetDetail}
        />
      )}
    </div>
  );
};

export default DatasetsList;
