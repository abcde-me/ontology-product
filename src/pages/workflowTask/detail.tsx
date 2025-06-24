import React, { useState } from "react";
import { Breadcrumb, Message, Popconfirm, Tabs, Typography } from "@arco-design/web-react";
import { IconArrowLeft, IconCheckCircle, IconCheckCircleFill, IconClockCircle, IconCloseCircleFill, IconExclamationCircleFill, IconLoading } from "@arco-design/web-react/icon";
import { useParams } from '@/utils/url'
import { useHistory } from "react-router";
import TimeFormatting from '@/utils/timeFormatting'
import ParseNode from "./components/parse-node";
import DataCleaningNode from "./components/data-cleaning-node";
import DataAugmentationNode from "./components/data-augmentation-node";
import './detail.css'

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;

export default function WorkflowTaskDetail() {
  const taskId = useParams('id');
  const history = useHistory();
  // 初始化作业详情数据
  const [taskDetailData, setTaskDetailData] = useState({
    job_name: '',
    run_status: 1,
    cre_time: '',
    time_size: '10小时20分30秒',
    start_time: '1749627834576',
    end_time: '2749627999999',
    error_msg: '这是一条错误提示内容，这是一条错误提示内容，这是一条错误提示内容，这是一条错误提示内容，这是一条错误提示内容，这是一条错误提示内容。'
  });
  // 初始化节点数据
  const [nodeData, setNodeData] = useState([
    {
      task_type: 1, // 1-文本、2-图片、3-视频、4-音频
      status: 1, //1-运行中、2-完成、3-失败
    }, {
      task_type: 2,
      status: 2,
    }, {
      task_type: 6,
      status: 3,
    }, {
      task_type: 5,
      status: 2,
    }
  ])
  // 初始化解析节点数据
  const [parseNodeData, setParseNodeData] = useState({
    file: [
      {
        id: '123',
        file_name: '文件1',
        status: true,
        file_type: 'pdf',
        start_time: '1749627834576',
        end_time: '1749627834576',
      }, {
        id: '234',
        file_name: '文件2',
        status: false,
        file_type: 'txt',
        start_time: '1749627834576',
        end_time: '1749627834576',
      }, {
        id: '456',
        file_name: '文件3',
        status: false,
        file_type: 'epub',
        start_time: '1749627834576',
        end_time: '1749627834576',
      }
    ], // 成功文件列表
    total: 100, //总数
    success_total: 99,
    fail_total: 1
  })
  // 初始化数据清洗节点及数据增强节点数据
  const [cleaningAugmentNodeData, setCleaningAugmentNodeData] = useState({
    raw_data_num: 1250, // 原始数据量
    cleansed_data_num: 1120, // 清洗后数据量/ 增强后数据量
    remove_duplicates_num: 87, // 删除重复数据量
    missing_value_num: 32, // 缺失值处理
    abnormal_value_num: 11, // 异常值处理
    log: [],
  })

  // 获取顶部区域dom
  const getTaskDetailTopDom = () => {
    return (
      <div
        className="running-box"
        style={taskDetailData.run_status === 1 ?
          { backgroundColor: '#ECFDF5', border: '1px solid #10B981' } : taskDetailData.run_status === 2 ?
            { backgroundColor: '#FEF2F2', border: '1px solid #EF4444' } : taskDetailData.run_status === 3 ?
              { backgroundColor: '#EEF6FF', border: '1px solid #007DFA' } : { backgroundColor: '#CBD5E1', border: '1px solid #CBD5E1' }
        }
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="running-item">
            <span className="item-title">状态</span>
            {
              taskDetailData.run_status === 1 ?
                <div className="item-content-box">
                  <IconCheckCircleFill style={{ color: '#10B981', margin: '0 5px 0 0' }} />
                  <span className="item-content">运行成功</span>
                </div> : taskDetailData.run_status === 2 ?
                  <div className="item-content-box">
                    <IconCloseCircleFill style={{ color: '#EF4444', margin: '0 5px 0 0' }} />
                    <span className="item-content">运行失败</span>
                    <Popconfirm
                      focusLock
                      title="确定重新运行吗？"
                      content="已处理数据将被覆盖"
                      onOk={() => {
                        handleRetryWorkflow(taskId);
                        Message.success({
                          content: '提交成功'
                        });
                      }}
                      onCancel={() => {
                        Message.error({
                          content: '提交失败，请稍后重试'
                        });
                      }}
                    >
                      <span className="operate-text">重试</span>
                    </Popconfirm>
                  </div> : taskDetailData.run_status === 3 ?
                    <div className="item-content-box">
                      <IconLoading style={{ color: '#007DFA', margin: '0 5px 0 0' }} />
                      <span className="item-content">运行中</span>
                      <Popconfirm
                        focusLock
                        title="确定停止吗？"
                        content="未处理完的数据将停止处理"
                        onOk={() => {
                          handleStopWorkflow(taskId);
                          Message.success({
                            content: '停止成功'
                          });
                        }}
                        onCancel={() => {
                          Message.error({
                            content: '停止失败，请稍后重试'
                          });
                        }}
                      >
                        <span className="operate-text">停止</span>
                      </Popconfirm>
                    </div> :
                    <div className="item-content-box">
                      <IconExclamationCircleFill style={{ color: '#6E7B8D', margin: '0 5px 0 0' }} />
                      <span className="item-content">已停止</span>
                    </div>
            }
          </div>
          <div className="running-item">
            <span className="item-title">总用时</span>
            <div className="item-content-box">
              <span className="item-content">{taskDetailData.time_size}</span>
            </div>
          </div>
          <div className="running-item">
            <span className="item-title">开始时间</span>
            <div className="item-content-box">
              <span className="item-content">{TimeFormatting(taskDetailData.start_time)}</span>
            </div>
          </div>
          <div className="running-item">
            <span className="item-title">结束时间</span>
            <div className="item-content-box">
              <span className="item-content">{TimeFormatting(taskDetailData.end_time)}</span>
            </div>
          </div>
        </div>
        {
          taskDetailData.run_status === 2 ?
            <span className="fail-tip">{taskDetailData.error_msg}</span> : <></>
        }
      </div>
    )
  }

  // 获取节点name
  const getNodeName = (type) => {
    switch (type) {
      case 1: return '文本解析';
      case 2: return '图片解析';
      case 3: return '音频解析';
      case 4: return '视频解析';
      case 5: return '数据清洗';
      case 6: return '数据增强';
    }
  }

  // 切换节点tab
  const handleChangeTab = (val) => {
    console.log(val, 'task_type');
  }

  // 获取作业内容区域dom
  const getTaskContentDom = () => {
    return (
      <div className="work-region">
        <Tabs key='card' tabPosition={'left'} onChange={(task_type) => handleChangeTab(task_type)}>
          {nodeData.map(item => {
            return (
              <TabPane key={item.task_type} disabled={item.status === 3} title={
                <span>
                  {
                    item.status === 1 ? <IconLoading style={{ marginRight: 6 }} /> :
                      item.status === 2 ? <IconCheckCircle style={{ marginRight: 6 }} /> :
                        <IconClockCircle style={{ marginRight: 6 }} />
                  }
                  {getNodeName(item.task_type)}
                </span>
              }>
                <Typography.Paragraph style={{ marginTop: 20 }}>
                  {item.task_type < 4 ? <ParseNode dataSource={parseNodeData} /> :
                    item.task_type === 5 ? <DataCleaningNode dataSource={cleaningAugmentNodeData} /> : <DataAugmentationNode dataSource={cleaningAugmentNodeData} />}
                </Typography.Paragraph>
              </TabPane>
            )
          })}
        </Tabs>
      </div>
    )
  }

  // 运行失败状态下重试操作
  const handleRetryWorkflow = (id) => {
    console.log('重试', id)
  }

  // 进行中状态下停止操作
  const handleStopWorkflow = (id) => {
    console.log('停止', id)
  }

  return (
    <div className="workflow-task-detail">
      <div className="head-breadcrumb-box">
        <IconArrowLeft style={{ cursor: 'pointer' }} onClick={() => history.goBack()} />
        <Breadcrumb style={{ fontSize: 12, marginLeft: '10px' }}>
          <BreadcrumbItem>作业详情</BreadcrumbItem>
          <BreadcrumbItem>{taskId}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      {/* 详情顶部状态区域 */}
      {getTaskDetailTopDom()}
      {/* 工作流拓扑图区域 */}
      <div className="topology-diagram">
        <span>工作流拓扑图</span>
      </div>
      {/* 作业内容区域 */}
      {getTaskContentDom()}
    </div >
  )
}