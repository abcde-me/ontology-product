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
  // 初始化运行状态
  const [runningTime, setRunningTime] = useState('fail');
  // 初始化作业详情数据
  const [taskDetailData, setTaskDetailData] = useState({
    job_name: '',
    run_status: 1,
    cre_time: '',
    time_size: '10小时20分30秒',
    start_time: '1749627834576',
    end_time: '2749627999999',
    fail_content: '这是一条错误提示内容，这是一条错误提示内容，这是一条错误提示内容，这是一条错误提示内容，这是一条错误提示内容，这是一条错误提示内容。'
  });
  // 初始化解析节点数据
  const [parseNodeData, setParseNodeData] = useState({
    file: [
      {
        file_name: '文件1',
        status: true,
        file_type: 'pdf',
        start_time: '1749627834576',
        end_time: '1749627834576',
      }, {
        file_name: '文件2',
        status: false,
        file_type: 'txt',
        start_time: '1749627834576',
        end_time: '1749627834576',
      }, {
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
  // 初始化数据清洗节点数据
  const [dataCleaningNodeData, setDataCleaningNodeData] = useState({
    raw_data_num: 1250, // 原始数据量
    cleansed_data_num: 1120, // 清洗后数据量/ 增强后数据量
    remove_duplicates_num: 87, // 删除重复数据量
    missing_value_num: 32, // 缺失值处理
    abnormal_value_num: 11, // 异常值处理
    log: [],
  })

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
      <div
        className="running-box"
        style={runningTime === 'success' ?
          { backgroundColor: '#ECFDF5', border: '1px solid #10B981' } : runningTime === 'fail' ?
            { backgroundColor: '#FEF2F2', border: '1px solid #EF4444' } : runningTime === 'running' ?
              { backgroundColor: '#EEF6FF', border: '1px solid #007DFA' } : { backgroundColor: '#CBD5E1', border: '1px solid #CBD5E1' }
        }
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="running-item">
            <span className="item-title">状态</span>
            {
              runningTime === 'success' ?
                <div className="item-content-box">
                  <IconCheckCircleFill style={{ color: '#10B981', margin: '0 5px 0 0' }} />
                  <span className="item-content">运行成功</span>
                </div> : runningTime === 'fail' ?
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
                  </div> : runningTime === 'running' ?
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
          runningTime === 'fail' ?
            <span className="fail-tip">{taskDetailData.fail_content}</span> : <></>
        }
      </div>
      {/* 工作流拓扑图区域 */}
      <div className="topology-diagram">
        <span>工作流拓扑图</span>
      </div>
      {/* 作业内容区域 */}
      <div className="work-region">
        <Tabs key='card' tabPosition={'left'}>
          <TabPane key='1' title={
            <span>
              <IconCheckCircle style={{ marginRight: 6 }} />
              文本解析
            </span>
          }>
            <Typography.Paragraph style={{ marginTop: 20 }}>
              <ParseNode dataSource={parseNodeData} />
            </Typography.Paragraph>
          </TabPane>
          <TabPane key='2' title={
            <span>
              <IconCheckCircle style={{ marginRight: 6 }} />
              数据清洗
            </span>
          }>
            <Typography.Paragraph style={{ marginTop: 20 }}>
              <DataCleaningNode dataSource={dataCleaningNodeData} />
            </Typography.Paragraph>
          </TabPane>
          <TabPane key='3' title={
            <span>
              <IconCheckCircle style={{ marginRight: 6 }} />
              数据增强
            </span>
          }>
            <Typography.Paragraph style={{ marginTop: 20 }}>
              <DataAugmentationNode dataSource={dataCleaningNodeData} />
            </Typography.Paragraph>
          </TabPane>
        </Tabs>
      </div>
    </div >
  )
}