import React, { useEffect, useState } from 'react';
import {
  Breadcrumb,
  Message,
  Popconfirm,
  Tabs,
  Typography
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconCheckCircle,
  IconCheckCircleFill,
  IconClockCircle,
  IconCloseCircleFill,
  IconExclamationCircleFill,
  IconLoading
} from '@arco-design/web-react/icon';
import { useParams } from '@/utils/url';
import { useHistory } from 'react-router';
import ParseNode from './components/parse-node';
import DataCleaningNode from './components/data-cleaning-node';
import DataAugmentationNode from './components/data-augmentation-node';
import './detail.css';
import { getTaskDetail } from '@/api/taskDetail';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;

// 枚举作业运行状态
enum TaskRunStatus {
  success = 1,
  fail = 2,
  running = 3,
  stop = 4
}

// 枚举节点运行状态
enum NodeRunStatus {
  running = 1,
  success = 2,
  fail = 3
}

// 枚举节点类型
enum NodeType {
  text = 1,
  img = 2,
  music = 3,
  video = 4,
  dataClean = 5,
  dataAugment = 6
}

// 枚举节点类型中文名称
enum NodeTypeName {
  text = '文本解析',
  img = '图片解析',
  music = '音频解析',
  video = '视频解析',
  dataClean = '数据清洗',
  dataAugment = '数据增强'
}

// 定义taskDetailData值的类型
interface TaskDetailObject {
  job_name?: string;
  run_status?: number;
  cre_time?: string;
  time_size?: string;
  start_time?: string;
  end_time?: string;
  error_msg?: string;
}

export default function WorkflowTaskDetail() {
  const taskId = useParams('id');
  const history = useHistory();
  // 初始化作业详情数据
  const [taskDetailData, setTaskDetailData] = useState<TaskDetailObject>({});
  // 初始化节点数据
  const [nodeData, setNodeData] = useState([
    {
      task_type: 1, // 1-文本、2-图片、3-视频、4-音频
      status: 1 //1-运行中、2-完成、3-失败
    },
    {
      task_type: 2,
      status: 2
    },
    {
      task_type: 6,
      status: 3
    },
    {
      task_type: 5,
      status: 2
    }
  ]);
  // 初始化解析节点数据
  const [parseNodeData, setParseNodeData] = useState({
    file: [
      {
        id: '123',
        file_name: '文件1',
        status: true,
        file_type: 'pdf',
        start_time: '1749627834576',
        end_time: '1749627834576'
      },
      {
        id: '234',
        file_name: '文件2',
        status: false,
        file_type: 'txt',
        start_time: '1749627834576',
        end_time: '1749627834576'
      },
      {
        id: '456',
        file_name: '文件3',
        status: false,
        file_type: 'epub',
        start_time: '1749627834576',
        end_time: '1749627834576'
      }
    ], // 成功文件列表
    total: 100, //总数
    success_total: 99,
    fail_total: 1
  });
  // 初始化数据清洗节点及数据增强节点数据
  const [cleaningAugmentNodeData, setCleaningAugmentNodeData] = useState({
    raw_data_num: 1250, // 原始数据量
    cleansed_data_num: 1120, // 清洗后数据量/ 增强后数据量
    remove_duplicates_num: 87, // 删除重复数据量
    missing_value_num: 32, // 缺失值处理
    abnormal_value_num: 11, // 异常值处理
    log: []
  });

  // 初始化详情基本数据
  useEffect(() => {
    if (taskId) getDetailData();
  }, [taskId]);

  const getDetailData = async () => {
    const res = await getTaskDetail(taskId!);
    if (res.status === 200 && res.data) {
      setTaskDetailData(res.data.base_info);
    }
  };

  // 获取顶部区域dom
  const getTaskDetailTopDom = () => {
    return (
      <div
        className="running-box"
        style={
          taskDetailData.run_status === TaskRunStatus.success
            ? { backgroundColor: '#ECFDF5', border: '1px solid #10B981' }
            : taskDetailData.run_status === TaskRunStatus.fail
              ? { backgroundColor: '#FEF2F2', border: '1px solid #EF4444' }
              : taskDetailData.run_status === TaskRunStatus.running
                ? { backgroundColor: '#EEF6FF', border: '1px solid #007DFA' }
                : { backgroundColor: '#CBD5E1', border: '1px solid #CBD5E1' }
        }
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="running-item">
            <span className="item-title">状态</span>
            {taskDetailData.run_status === TaskRunStatus.success ? (
              <div className="item-content-box">
                <IconCheckCircleFill
                  style={{ color: '#10B981', margin: '0 5px 0 0' }}
                />
                <span className="item-content">运行成功</span>
              </div>
            ) : taskDetailData.run_status === TaskRunStatus.fail ? (
              <div className="item-content-box">
                <IconCloseCircleFill
                  style={{ color: '#EF4444', margin: '0 5px 0 0' }}
                />
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
              </div>
            ) : taskDetailData.run_status === TaskRunStatus.running ? (
              <div className="item-content-box">
                <IconLoading
                  style={{ color: '#007DFA', margin: '0 5px 0 0' }}
                />
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
              </div>
            ) : (
              <div className="item-content-box">
                <IconExclamationCircleFill
                  style={{ color: '#6E7B8D', margin: '0 5px 0 0' }}
                />
                <span className="item-content">已停止</span>
              </div>
            )}
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
              <span className="item-content">{taskDetailData.start_time}</span>
            </div>
          </div>
          <div className="running-item">
            <span className="item-title">结束时间</span>
            <div className="item-content-box">
              <span className="item-content">{taskDetailData.end_time}</span>
            </div>
          </div>
        </div>
        {taskDetailData.run_status === TaskRunStatus.fail ? (
          <span className="fail-tip">{taskDetailData.error_msg}</span>
        ) : (
          <></>
        )}
      </div>
    );
  };

  // 获取节点name
  const getNodeName = (type: number) => {
    switch (type) {
      case NodeType.text:
        return NodeTypeName.text;
      case NodeType.img:
        return NodeTypeName.img;
      case NodeType.music:
        return NodeTypeName.music;
      case NodeType.video:
        return NodeTypeName.video;
      case NodeType.dataClean:
        return NodeTypeName.dataClean;
      case NodeType.dataAugment:
        return NodeTypeName.dataAugment;
    }
  };

  // 切换节点tab
  const handleChangeTab = (val: string) => {
    console.log(val, 'task_type');
  };

  // 获取作业内容区域dom
  const getTaskContentDom = () => {
    return (
      <div className="work-region">
        <Tabs
          key="card"
          tabPosition={'left'}
          onChange={(task_type) => handleChangeTab(task_type)}
        >
          {nodeData.map((item) => {
            return (
              <TabPane
                key={item.task_type}
                disabled={item.status === NodeRunStatus.fail}
                title={
                  <span>
                    {item.status === NodeRunStatus.running ? (
                      <IconLoading style={{ marginRight: 6 }} />
                    ) : item.status === NodeRunStatus.success ? (
                      <IconCheckCircle style={{ marginRight: 6 }} />
                    ) : (
                      <IconClockCircle style={{ marginRight: 6 }} />
                    )}
                    {getNodeName(item.task_type)}
                  </span>
                }
              >
                <Typography.Paragraph style={{ marginTop: 20 }}>
                  {item.task_type < NodeType.video ? (
                    <ParseNode dataSource={parseNodeData} />
                  ) : item.task_type === NodeType.dataClean ? (
                    <DataCleaningNode dataSource={cleaningAugmentNodeData} />
                  ) : (
                    <DataAugmentationNode
                      dataSource={cleaningAugmentNodeData}
                    />
                  )}
                </Typography.Paragraph>
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  };

  // 运行失败状态下重试操作
  const handleRetryWorkflow = (id: string | null) => {
    console.log('重试', id);
  };

  // 进行中状态下停止操作
  const handleStopWorkflow = (id: string | null) => {
    console.log('停止', id);
  };

  return (
    <div className="workflow-task-detail">
      <div className="head-breadcrumb-box">
        <IconArrowLeft
          style={{ cursor: 'pointer' }}
          onClick={() => history.goBack()}
        />
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
    </div>
  );
}
