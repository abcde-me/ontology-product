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
import { IconInfoCircle } from '@arco-design/web-react/icon';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { useTableList } from '../hooks/useTableList';
import ModalScriptDetail from './ModalScriptDetail';
import ModalDatasetDetail from './data-manager/ModalDatasetDetail';
import { ExportSqlResultItem, ExportSqlResultListParams } from '@/types/sqlApi';
import {
  calcelExportSqlTask,
  getExportSqlResultList,
  getSqlTaskDetail,
  retryExportSqlTask
} from '@/api/sql';
import { formatFileSize } from '@/utils/format';
import { formatDateTime } from '../utils';
import { SQL_PERMISSIONS } from '@/config/permissions';
import RefreshButton from '@/components/refreshButton';

const FormItem = Form.Item;

const DatasetsList: FC = () => {
  // 数据集详情Modal状态管理
  const [datasetDetailVisible, setDatasetDetailVisible] = useState(false);
  const [detailId, setDetailId] = useState('');

  const [scriptDetailVisible, setScriptDetailVisible] = useState(false);
  const [scriptFormOrigin, setScriptFormOrigin] = useState({});

  const {
    listData,
    pagination,
    loading,
    loadData,
    handleSearchChange,
    handleTableChange
  } = useTableList<ExportSqlResultItem, ExportSqlResultListParams>({
    onRequest: getExportSqlResultList,
    formatSorter: (sorter: any) => {
      let result = {};
      if (sorter.export_status) {
        result = {
          export_status: sorter.export_status.join(',')
        };
      } else {
        result = {
          export_status: undefined
        };
      }
      return result;
    },
    formatFilter: (filter: any) => {
      let result = {};
      if (filter.field === 'export_start_time') {
        result = {
          sort_field: filter?.field == undefined ? '' : filter?.field,
          sort_order:
            filter?.direction == undefined
              ? ''
              : filter?.direction == 'ascend'
                ? 'asc'
                : 'desc'
        };
      }
      return result;
    }
  });

  const columns: TableColumnProps[] = [
    {
      title: 'SQL脚本名称',
      dataIndex: 'script_name',
      className: 'hover-change',
      width: 230,
      render: (_, item) => {
        return (
          <EllipsisPopover
            className="text-[var(--color-text-2)]"
            value={item.script_name}
            isEdit={false}
            isLink
            handleLink={() => handleScriptDetail(item)}
          />
        );
      }
    },
    {
      title: '数据集名称',
      dataIndex: 'dataset_name',
      className: 'hover-change_normal',
      width: 230,
      render: (_, item) => {
        return (
          <EllipsisPopover
            className="text-[var(--color-text-2)]"
            value={item.dataset_name}
            isEdit={false}
            isLink
            handleLink={() => handleDatasetDetail(item.dataset_id)}
          />
        );
      }
    },
    {
      title: '存储表',
      dataIndex: 'dataset_table_name',
      width: 230,
      render: (_, item) => {
        return (
          <EllipsisPopover value={item.dataset_table_name} isEdit={false} />
        );
      }
    },
    {
      title: '导出状态',
      dataIndex: 'export_status',
      width: 180,
      render: (_, item) => {
        let text = '未知状态';
        let color = '#999999';
        let actionBtn: React.ReactNode = null;

        switch (item.export_status) {
          case 0:
            text = '导出中';
            color = '#007DFA';
            actionBtn = item?.perms?.includes(
              SQL_PERMISSIONS.CAN_EXPORT_TASK_STOP
            ) && <Link onClick={() => handleStopTask(item)}> 终止 </Link>;
            break;
          case 1:
            text = '导出成功';
            color = '#10B981';
            break;
          case 2:
            text = '导出失败';
            color = '#EF4444';
            actionBtn = item?.perms?.includes(
              SQL_PERMISSIONS.CAN_EXPORT_TASK_RETRY
            ) && (
                <>
                  <Tooltip content={item.failed_reason}>
                    <IconInfoCircle />
                  </Tooltip>
                  <Link href="#" onClick={() => handleRetryTask(item)}>
                    {' '}
                    重试{' '}
                  </Link>
                </>
              );
            break;
          case 3:
            text = '导出终止';
            color = '#FB923C';
            actionBtn = item?.perms?.includes(
              SQL_PERMISSIONS.CAN_EXPORT_TASK_RETRY
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
                borderRadius: '50%'
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
        },
        {
          text: '导出终止',
          value: 3
        }
      ]
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      width: 180,
      render: (_, item) => (
        <div className="fontMM">{formatFileSize(item.file_size)}</div>
      )
    },
    {
      title: '操作时间',
      dataIndex: 'export_start_time',
      width: 180,
      render: (_, item) => (
        <div className="fontMM">{formatDateTime(item.export_start_time)}</div>
      ),
      sorter: true
    }
  ];

  async function handleStopTask(item: ExportSqlResultItem) {
    if (!item.id || !item.script_id) {
      return;
    }

    const res = await calcelExportSqlTask(item.id, item.script_id);

    if (res.code == '' && res.status == 200) {
      Message.success('停止任务成功');
      loadData();
    } else {
      Message.error(res.message ?? '停止任务失败');
    }
  }

  async function handleRetryTask(item: ExportSqlResultItem) {
    if (!item.id || !item.script_id) {
      return;
    }

    const res = await retryExportSqlTask(item.id, item.script_id);

    if (res.code == '' && res.status == 200) {
      Message.success('重试任务成功');
      loadData();
    } else {
      Message.error(res.message ?? '重试任务失败');
    }
  }

  async function handleScriptDetail(item: ExportSqlResultItem) {
    if (!item.id || !item.script_id) {
      return;
    }

    const res = await getSqlTaskDetail(item.id, item.script_id);

    if (res.code == '' && res.status == 200) {
      setScriptFormOrigin({ ...res.data });
      setScriptDetailVisible(true);
    }
  }

  function handleDatasetDetail(id: number) {
    setDetailId(id.toString());
    setDatasetDetailVisible(true);
  }

  function closeDatasetDetail() {
    setDatasetDetailVisible(false);
    setDetailId('');
  }

  function closeScriptDetail() {
    setScriptDetailVisible(false);
    setScriptFormOrigin({});
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-[20px]">
      <h1 className="mb-[15px] text-[20px] font-bold">数据集导出任务</h1>
      <Form
        className="mb-[8px]"
        autoComplete="off"
        layout="inline"
        onValuesChange={handleSearchChange}
      >
        <FormItem field="search_content" style={{ marginRight: 12 }}>
          <Input.Search allowClear placeholder="输入数据集搜索" />
        </FormItem>
        <FormItem style={{ marginRight: 12 }}>
          <RefreshButton onClick={() => loadData()}></RefreshButton>
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
        scroll={{
          // y: 500,
          x: 'max-content'
        }}
        border={false}
      />

      <ModalScriptDetail
        formOrigin={scriptFormOrigin}
        visible={scriptDetailVisible}
        onCancel={closeScriptDetail}
      />

      <ModalDatasetDetail
        detailId={detailId}
        datasetDetailVisible={datasetDetailVisible}
        closeDatasetDetail={closeDatasetDetail}
      />
    </div>
  );
};

export default DatasetsList;
