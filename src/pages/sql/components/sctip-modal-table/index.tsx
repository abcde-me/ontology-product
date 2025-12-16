import {
  Button,
  Message,
  Modal,
  Pagination,
  Popover,
  Table,
  Tooltip
} from '@arco-design/web-react';
import React, { memo } from 'react';
import styles from './index.module.scss';
import { VersionType } from '../version-status';
import VersionStatus from '../version-status';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { ScriptStatus, ScriptStatusName } from '@/types/sqlDevelopApi';
import { copyDevelopScript, deleteDevelopScript } from '@/api/sql-develop';
import { getDevelopScriptLogByScriptId } from '@/api/sql';
import classNames from 'classnames';
import noDataElement from '@/components/no-data';
import dayjs from 'dayjs';
import ScriptDetailModal from '../spl-script-management/ScriptDetailModal';

const SctipModalTable: React.FC<{
  isVisible: boolean;
  setChildStatus: (status: boolean) => void;
  rowData;
}> = memo(({ isVisible, setChildStatus, rowData }) => {
  const [visible, setVisible] = React.useState<boolean>(isVisible);
  const [detailVisible, setDetailVisible] = React.useState<boolean>(false);
  const [detailRecord, setDetailRecord] = React.useState<any>(null);
  const [tableData, setTableData] = React.useState<any[]>([]);
  const [current, setCurrent] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [total, setTotal] = React.useState<number>(0);
  const [statusFilter, setStatusFilter] = React.useState<number[]>([]);

  const handleCopyVersion = async (record: any) => {
    setChildStatus(true);
    const params = {
      version: record.version,
      script_id: record.script_id
    };
    try {
      const res = await copyDevelopScript({ ...params });
      if (res.status === 200) {
        Message.success({
          content: `复制成功`
        });
        // 刷新数据
        setChildStatus(false);
      }
      console.log(res);
    } catch (error) {
      Message.error({
        content: '复制失败'
      });
      console.log(error);
    }
  };
  const handleDeleteVersion = async (record: any) => {
    setChildStatus(true);
    const params = {
      version: record.version,
      script_id: record.script_id
    };
    try {
      const res = await deleteDevelopScript({ ...params });
      if (res.status === 200) {
        Message.success({
          content: `删除成功`
        });
        // 刷新历史版本数据
        fetchData();
      }
      console.log(res);
    } catch (error) {
      Message.error({
        content: '删除失败'
      });
      console.log(error);
    }
  };

  React.useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);

  // 获取历史版本数据
  const fetchData = React.useCallback(async () => {
    if (!rowData?.script_id) return;
    try {
      const res = await getDevelopScriptLogByScriptId({
        script_id: rowData.script_id,
        page: current,
        page_size: pageSize,
        status_list: statusFilter
      });
      if (res?.status === 200 && res?.data) {
        const items = res.data.items || [];
        setTableData(items);
        // 如果 API 返回了 total，使用它；否则使用 items.length
        setTotal((res.data as any).total ?? items.length);
      }
    } catch (error) {
      console.error('获取历史版本数据失败:', error);
      Message.error('获取历史版本数据失败');
    }
  }, [rowData?.script_id, current, pageSize, statusFilter]);

  // 当弹窗打开或 rowData 变化时，重置分页并获取数据
  React.useEffect(() => {
    if (visible && rowData?.script_id) {
      setCurrent(1);
      setStatusFilter([]);
    }
  }, [visible, rowData?.script_id]);

  // 当分页或筛选变化时，重新获取数据
  React.useEffect(() => {
    if (visible && rowData?.script_id) {
      fetchData();
    }
  }, [visible, rowData?.script_id, current, pageSize, statusFilter, fetchData]);

  // 处理表格筛选变化
  const handleTableChange = (
    pagination: any,
    sorter: any,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    if (filters.status && filters.status.length > 0) {
      // 如果有筛选，取第一个值并转换为字符串
      setStatusFilter(filters.status.map(Number));
    } else {
      setStatusFilter([]);
    }
    setCurrent(1); // 筛选时重置到第一页
  };

  const columns: any = [
    {
      title: '版本号',
      dataIndex: 'version_name',
      key: 'version',
      width: 100,
      sorter: true
    },
    {
      title: '脚本状态',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (_, record) => <VersionStatus status={record.status} />,
      filters: [
        {
          text: ScriptStatusName[ScriptStatus.Released],
          value: ScriptStatus.Released
        },
        {
          text: ScriptStatusName[ScriptStatus.Scheduling],
          value: ScriptStatus.Scheduling
        }
      ]
    },
    {
      title: '版本说明',
      dataIndex: 'state_name',
      key: 'state_name',
      width: 100
    },
    {
      title: '更新人',
      dataIndex: 'update_user',
      key: 'update_user',
      width: 120
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      key: 'update_time',
      width: 200,
      render: (_, record) => (
        <span>
          {dayjs(record.update_time).format('YYYY-MM-DD HH:mm:ss') || '-'}
        </span>
      )
    },
    {
      title: (
        <Popover
          content="复制为新版本：以选择的脚本为基础迭代新版本"
          trigger={['hover', 'click']}
        >
          <div className="flex items-center">
            <span className="mr-[4px]">操作</span>
            <IconQuestionCircle fontSize={16} style={{ color: '#7F8C9F' }} />
          </div>
        </Popover>
      ),
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => (
        <>
          <span
            className={styles['option-btn']}
            onClick={() => {
              setDetailRecord(record);
              setDetailVisible(true);
            }}
          >
            详情
          </span>
          <Tooltip
            content={record?.visteon === 'false' ? '当前已有未发版的脚本' : ''}
          >
            <span
              onClick={() => {
                handleCopyVersion(record);
              }}
              className={[
                styles['option-btn'],
                record?.visteon === 'false' && styles['is-disabled']
              ].join(' ')}
            >
              复制为新版本
            </span>
          </Tooltip>
          <Tooltip
            content={
              record?.status === VersionType.SCHEDULED ? '调度中不可删除' : ''
            }
          >
            <span
              onClick={() => {
                handleDeleteVersion(record);
              }}
              className={[
                styles['option-btn'],
                record?.status === VersionType.SCHEDULED &&
                  styles['is-disabled']
              ].join(' ')}
            >
              删除
            </span>
          </Tooltip>
        </>
      )
    }
  ];
  return (
    <Modal
      title="历史版本"
      visible={visible}
      onCancel={() => {
        setVisible(false);
        // 通知父组件修改状态，修改父组件的isVisible属性
        setChildStatus(false);
      }}
      style={{
        width: 960
      }}
      footer={null}
    >
      <div className={styles['script-modal-table-wrapper']}>
        <div className={styles['script-modal-table-content']}>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              名称：
            </div>
            <div
              className={classNames(
                styles['script-modal-table-content-item-value'],
                'w-[326px]'
              )}
            >
              <EllipsisPopover
                preferTypography
                value={rowData?.script_name || '-'}
              />
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              最新版本：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.max_version_name}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              创建人：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.create_user}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              创建时间：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.create_time}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              所属工作流：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.process_name || '-'}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              所属任务节点：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.task_name || '-'}
            </div>
          </div>
          <div className={styles['script-modal-table-content-item']}>
            <div className={styles['script-modal-table-content-item-label']}>
              最新更新时间：
            </div>
            <div className={styles['script-modal-table-content-item-value']}>
              {rowData?.update_time}
            </div>
          </div>
        </div>
        <Table
          className="mb-[24px]"
          columns={columns}
          data={tableData}
          rowKey={(record: any) => `${rowData?.script_id}-${record.version}`}
          noDataElement={noDataElement({ description: '暂无数据' })}
          pagination={false}
          onChange={handleTableChange}
        />
        {total > 0 && (
          <Pagination
            current={current}
            pageSize={pageSize}
            total={total}
            onChange={(page) => setCurrent(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrent(1);
            }}
            className="mb-[24px] mt-[-12px] justify-end"
            showJumper
            showTotal
            sizeCanChange
            sizeOptions={[10, 20, 50, 100]}
          />
        )}
      </div>
      {detailVisible && (
        <ScriptDetailModal
          visible={detailVisible}
          title={detailRecord?.script_name || rowData?.script_name}
          content={detailRecord?.script_context}
          onCancel={() => setDetailVisible(false)}
        />
      )}
    </Modal>
  );
});

export default SctipModalTable;
