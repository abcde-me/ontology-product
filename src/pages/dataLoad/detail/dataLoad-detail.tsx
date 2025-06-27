import {
  Breadcrumb,
  Grid,
  Modal,
  Pagination,
  Switch
} from '@arco-design/web-react';
import { IconArrowLeft, IconEdit } from '@arco-design/web-react/icon';
import React, { useEffect, useState } from 'react';
import { Router } from 'react-router';
import TableDetail from './table-detail';
import './index.css';
import Edit from '../edit';
import {
  ApiResponse,
  ExecutionStatus,
  LoadType,
  SourceType,
  TaskStatus
} from '../type';
const Row = Grid.Row;
const Col = Grid.Col;
const BreadcrumbItem = Breadcrumb.Item;
const DataLoadDetail = () => {
  // 默认详情的数据
  const [listDetail, setListDetail] = useState<ApiResponse | null>({
    task_info: {
      id: 123,
      name: 'daily-image-import',
      source_type: SourceType.HDFS,
      connector: {
        id: 456,
        name: 'hdfs-prod-01',
        type: SourceType.HDFS
      },
      load_type: LoadType.Cron,
      cron_expression: '0 0 3 * * ?',
      dest_path: 'minio/vision-data',
      status: TaskStatus.Running,
      created_at: '2025-06-16 18:40:36',
      last_run_time: '2025-06-16 18:40:36',
      creator: 'user123'
    },
    execution_history: [
      {
        execution_id: 7891,
        execution_name: 'RUN-20250306-001',
        status: ExecutionStatus.Running,
        start_time: '2025-06-16 18:40:36',
        end_time: '2025-06-16 18:40:36',
        details: {
          success_files: 2451213213,
          failed_files: 21231232,
          error_message: null
        }
      },
      {
        execution_id: 7890,
        execution_name: 'RUN-20250306-002',
        status: ExecutionStatus.Failed,
        start_time: '2025-06-16 18:40:36',
        end_time: '2025-06-16 18:40:36',
        details: {
          success_files: 0,
          failed_files: 0,
          error_message: 'Connection timeout to HDFS server'
        }
      }
    ]
  });
  // 存在运行中的状态
  const [runningFlag, setRunningFlag] = useState<number | null>(null);

  // 判断任务中是否存在运行的任务
  const judgmentTask = () => {
    if (listDetail == null) {
      // 处理 listDetail 为空的情况，例如返回默认值或抛出错误
      return -1; // 这里假设返回 -1 表示没有运行中的任务，根据实际情况调整
    }

    const runningIndex = listDetail.execution_history.findIndex((item) => {
      return item.status === 'running';
    });
    setRunningFlag(runningIndex);
  };
  // 点击停止运行
  const stopehan = () => {
    listDetail?.execution_history.forEach((item: any) => {
      if (item.execution_id == 7891) {
        item.status = 'failed';
      }
    });
  };
  // 编辑弹框的状态
  const [editVisible, setEditVisible] = useState(false);
  // 点击编辑显示弹框
  const hideEditModal = () => {
    setEditVisible(false);
  };
  // 返回上一层的函数
  const OneLevelUpHan = () => {
    history.back();
  };
  useEffect(() => {
    judgmentTask();
  }, []);

  return (
    <div>
      <div
        style={{
          margin: '15px 0px',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <IconArrowLeft
          style={{ cursor: 'pointer' }}
          onClick={() => {
            OneLevelUpHan();
          }}
        />
        <Breadcrumb style={{ marginLeft: '15px', fontSize: '17px' }}>
          <BreadcrumbItem href="/tenant/compute/modaforge/dataLoad">
            数据载入
          </BreadcrumbItem>
          <BreadcrumbItem>新建成功的载入名称</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div
        style={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          margin: '10px 20px 10px 0px',
          borderRadius: '10px'
        }}
      >
        <div className="box">
          <div style={{ fontSize: '17px', fontWeight: '600' }}>任务信息</div>
          <div
            style={{
              color: runningFlag !== -1 ? '#ccc' : 'rgb(0, 125, 250)',
              pointerEvents: runningFlag !== -1 ? 'none' : undefined,
              cursor: 'pointer'
            }}
            onClick={() => {
              setEditVisible(true);
            }}
          >
            <IconEdit /> 编辑
          </div>
        </div>
        <div className="info-container">
          <div className="info-column">
            <Row
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Col span={3} style={{ fontWeight: 'bold', fontSize: '15px' }}>
                载入位置：
              </Col>
              <Col span={21}>
                {listDetail && listDetail.task_info.dest_path}
              </Col>
            </Row>
            <Row
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Col span={3} style={{ fontWeight: 'bold', fontSize: '15px' }}>
                创建人：
              </Col>
              <Col span={21}>{listDetail && listDetail.task_info.creator}</Col>
            </Row>
            <Row
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Col span={3} style={{ fontWeight: 'bold', fontSize: '15px' }}>
                创建时间：
              </Col>
              <Col span={21}>
                {listDetail && listDetail.task_info.created_at}
              </Col>
            </Row>
            <Row
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Col span={3} style={{ fontWeight: 'bold', fontSize: '15px' }}>
                更新时间：
              </Col>
              <Col span={21}>
                {listDetail && listDetail.task_info.last_run_time}
              </Col>
            </Row>
          </div>
          <div className="info-column">
            <Row
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Col span={4} style={{ fontWeight: 'bold', fontSize: '15px' }}>
                数据源类型：
              </Col>
              <Col span={20}>
                {listDetail && listDetail.task_info.source_type}
              </Col>
            </Row>
            <Row
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Col span={4} style={{ fontWeight: 'bold', fontSize: '15px' }}>
                连接器名称：
              </Col>
              <Col span={20}>
                {listDetail && listDetail.task_info.connector.name}
              </Col>
            </Row>
            <Row
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Col span={4} style={{ fontWeight: 'bold', fontSize: '15px' }}>
                载入形式：
              </Col>
              <Col span={20}>
                {listDetail && listDetail.task_info.load_type == 'once'
                  ? '单次载入'
                  : '周期载入'}
                {listDetail && listDetail.task_info.load_type == 'cron' && (
                  <Switch
                    checkedText="启用"
                    uncheckedText="停止"
                    style={{ marginLeft: '10px' }}
                    onChange={(val) => console.log(!val)}
                  />
                )}
              </Col>
            </Row>
            {listDetail && listDetail.task_info.load_type == 'cron' && (
              <Row
                style={{
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Col span={4} style={{ fontWeight: 'bold', fontSize: '15px' }}>
                  周期设置：
                </Col>
                <Col span={20}>{listDetail.task_info.cron_expression}</Col>
              </Row>
            )}
          </div>
        </div>
        <TableDetail
          data={listDetail && listDetail.execution_history}
          runningStatus={runningFlag}
          judgmentTaskHan={judgmentTask}
          tHan={stopehan}
        />
        <Modal
          style={{ width: '600px' }}
          title="编辑数据载入任务"
          visible={editVisible}
          onOk={() => setEditVisible(false)}
          onCancel={() => setEditVisible(false)}
          autoFocus={false}
          focusLock={true}
          footer={null}
          // maskClosable={false}
          unmountOnExit={true}
        >
          <Edit hideEditModalHan={hideEditModal} detailData={listDetail} />
        </Modal>
      </div>
    </div>
  );
};
export default DataLoadDetail;
