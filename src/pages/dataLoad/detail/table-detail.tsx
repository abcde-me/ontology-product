import { Message, Modal, Table } from '@arco-design/web-react';
import { RunState, RunStateType } from '../list/list';
import React, { useEffect, useState } from 'react';
import './index.css';
import { useHistory } from 'react-router-dom';
import { ExecutionHistory } from '../type';
import { stopeLoad } from '@/api/loadApi';
const TableDetail = (props) => {
  const history = useHistory();
  const columns: any = [
    {
      title: '运行ID',
      dataIndex: 'execution_name',
      width: 240,
      ellipsis: true
    },
    {
      title: '状态',
      width: 250,
      dataIndex: 'status',
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background:
                item.status == 'succeed'
                  ? 'green'
                  : item.status == 'failed'
                    ? 'red'
                    : item.status == 'running'
                      ? 'rgb(0, 125, 250)'
                      : 'rgb(148, 163, 184)'
            }}
          ></div>
          <div style={{ marginLeft: '7px' }}>
            {item.status == RunStateType[RunState.SUCCEED].value &&
              RunStateType[RunState.SUCCEED].text}
            {item.status == RunStateType[RunState.FAILED].value &&
              RunStateType[RunState.FAILED].text}
            {item.status == RunStateType[RunState.RUNNING].value &&
              RunStateType[RunState.RUNNING].text}
            {item.status == RunStateType[RunState.STOPPED].value &&
              RunStateType[RunState.STOPPED].text}
          </div>
          {item.status == 'running' && (
            <span
              style={{
                color: 'rgb(0, 125, 250)',
                marginLeft: '7px',
                cursor: 'pointer'
              }}
              onClick={() => {
                stopTaskHan(item.execution_id);
              }}
            >
              停止
            </span>
          )}
        </div>
      ),
      filters: [
        {
          text: '成功',
          value: RunState.SUCCEED
        },
        {
          text: '失败',
          value: RunState.FAILED
        },
        {
          text: '运行中',
          value: RunState.RUNNING
        }
      ]
    },
    {
      title: '载入结果',
      width: 200,
      render: (_, item) => (
        <div style={{ display: 'flex' }}>
          <div
            style={{ color: 'green' }}
          >{`成功：${item.success_files.toLocaleString()}`}</div>
          <div
            style={{ color: 'red', marginLeft: '10px' }}
          >{`失败：${item.failed_files.toLocaleString()}`}</div>
        </div>
      )
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      sorter: (a, b) => a.start_time.localeCompare(b.start_time)
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      sorter: (a, b) => a.end_time.localeCompare(b.end_time)
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      render: (_, item) => (
        <span
          style={{ color: 'rgb(0, 125, 250)', cursor: 'pointer' }}
          onClick={() => {
            history.push(
              `/tenant/compute/modaforge/dataLoad/access?execution_id=${item.execution_id}&name=${encodeURIComponent(props.name)}`
            );
          }}
        >
          详情
        </span>
      )
    }
  ];
  const [data, setData] = useState<ExecutionHistory[]>();

  // 改变数据的逻辑
  const onchangeTable = (pagination, sorter, filters) => {
    const newTable = {
      status: filters.status ? filters.status : [],
      sort:
        sorter.direction == 'ascend'
          ? 'asc'
          : sorter.direction == 'descend'
            ? 'desc'
            : '',
      order_by: sorter.field == undefined ? '' : sorter.field
    };
    props.change(newTable);
  };
  // 模态框的值
  const [visible, setVisible] = useState(false);
  // 停止单个运行任务

  // 存放id
  const [executionId, setExecutionId] = useState(0);
  const stopTaskHan = (id) => {
    setVisible(true);
    setExecutionId(id);
  };
  // 模态框点击确认的按钮
  const modalOk = async () => {
    try {
      const res = await stopeLoad({
        task_id: props.taskId,
        execution_id: executionId
      });
      if (res.message == 'ok') {
        props.judgmentTaskHan();
        Message.success('操作成功,停止运行');
      } else {
        Message.error(res.message);
      }
      setVisible(false);
    } catch (error) {
      console.log(error);
    }
    // 请求接口
  };
  // 模态框点击取消
  const modalNo = () => {
    setVisible(false);
  };
  useEffect(() => {
    setData(props.datalist);
  }, [props.datalist]);
  return (
    <div>
      <div
        style={{
          margin: '15px 0px 15px 15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'end'
        }}
      >
        <Table
          columns={columns}
          data={data}
          border={false}
          pagination={false}
          style={{ width: '100%', padding: '0px 30px 0px 0px' }}
          rowKey="seatunnel_job_id"
          loading={props.loading}
          onChange={(pagination, filters, sorter) => {
            onchangeTable(pagination, filters, sorter);
          }}
        />
        <Modal
          visible={visible}
          onOk={modalOk}
          onCancel={modalNo}
          autoFocus={false}
          focusLock={true}
          closable={false}
        >
          <div
            style={{
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              margin: '15px'
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgb(255, 125, 0)',
                marginRight: '10px',
                color: 'white'
              }}
            >
              !
            </div>
            <div style={{ fontSize: '15px' }}>停止运行</div>
          </div>
          <div style={{ padding: '0px 30px 0px 40px' }}>
            该操作会停止当前数据载入运行任务，停止后将无法恢复运行，是否要继续当前操作?
          </div>
        </Modal>
      </div>
    </div>
  );
};
export default TableDetail;
