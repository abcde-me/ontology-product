import {
  Breadcrumb,
  Grid,
  Modal,
  Pagination,
  Switch
} from '@arco-design/web-react';
import { IconArrowLeft, IconEdit } from '@arco-design/web-react/icon';
import React, { useEffect, useState } from 'react';
import TableDetail from './table-detail';
import './index.css';
import Edit from '../edit';
import { ExecutionHistory, TaskInfo } from '../type';
import { useParams } from '@/utils/url';
import { getLoad } from '@/api/loadApi';
const Row = Grid.Row;
const Col = Grid.Col;
const BreadcrumbItem = Breadcrumb.Item;

const DataLoadDetail = () => {
  const loadId = useParams('task_id');
  // 默认详情的数据
  const [listDetail, setListDetail] = useState<TaskInfo | null>(null);
  // 相切页面的例表数据
  const [detailList, setDetailList] = useState<ExecutionHistory[] | null>(null);
  // 存在运行中的状态
  const [runningFlag, setRunningFlag] = useState<number | null>(null);

  // 判断任务中是否存在运行的任务
  const judgmentTask = () => {
    if (listDetail == null) {
      // 处理 listDetail 为空的情况，例如返回默认值或抛出错误
      return -1; // 这里假设返回 -1 表示没有运行中的任务，根据实际情况调整
    }

    const runningIndex = detailList?.findIndex((item) => {
      return item.status === 'running';
    });
    setRunningFlag(runningIndex && runningIndex > -1 ? runningIndex : null);
  };
  // 点击停止运行
  const stopehan = () => {
    // listDetail?.execution_history.forEach((item: any) => {
    //   if (item.execution_id == 7891) {
    //     item.status = 'failed';
    //   }
    // });
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
  // 通过路由id获取数据
  const getTask_idHan = async () => {
    try {
      const res = await getLoad(loadId);
      console.log(res.data);
      setListDetail(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    getTask_idHan();
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
          <BreadcrumbItem>{listDetail?.name}</BreadcrumbItem>
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
              <Col span={21}>{listDetail && listDetail.data_path_name}</Col>
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
              <Col span={21}>{listDetail && listDetail.createor}</Col>
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
              <Col span={21}>{listDetail && listDetail.created_at}</Col>
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
              <Col span={21}>{listDetail && listDetail.last_run_time}</Col>
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
              <Col span={20}>{listDetail && listDetail.source_type}</Col>
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
              <Col span={20}>{listDetail && listDetail.connector_name}</Col>
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
                {listDetail && listDetail.load_type == 'once'
                  ? '单次载入'
                  : '周期载入'}
                {listDetail && listDetail.load_type == 'cron' && (
                  <Switch
                    checkedText="启用"
                    uncheckedText="停止"
                    style={{ marginLeft: '10px' }}
                    onChange={(val) => console.log(!val)}
                  />
                )}
              </Col>
            </Row>
            {listDetail && listDetail.load_type == 'cron' && (
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
                <Col span={20}>{listDetail.cron_expression}</Col>
              </Row>
            )}
          </div>
        </div>
        <TableDetail
          id={listDetail && listDetail.task_id}
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
