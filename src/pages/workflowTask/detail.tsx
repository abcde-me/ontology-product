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
import {
  getTaskDetail,
  getTaskDetailNode,
  taskRerun,
  taskStop
} from '@/api/taskDetail';
import { useUserInfo } from '@/store/userInfoStore';
import Workflow from '../workflowConfig/index';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;

// 枚举作业运行状态
enum TaskRunStatus {
  running = 1,
  success = 2,
  fail = 3,
  stop = 4
}

// 枚举节点运行状态
enum NodeRunStatus {
  running = 0,
  completeSuccess = 1,
  completeFail = 2,
  wait = 3
}

// 枚举节点类型
enum NodeType {
  text = 'text',
  pic = 'pic',
  audio = 'audio',
  video = 'video',
  cleaning = 'cleaning',
  enhancement = 'enhancement'
}

// 枚举节点类型中文名称
enum NodeTypeName {
  text = '文本解析',
  pic = '图片解析',
  audio = '音频解析',
  video = '视频解析',
  cleaning = '数据清洗',
  enhancement = '数据增强'
}

// 枚举开始时间结束时间字段
enum StartOrEnd {
  start_time = 'start_time',
  end_time = 'end_time'
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

// 定义nodeData值的类型
interface nodeDataObject {
  task_type: string;
  status: number | string;
}

export default function WorkflowTaskDetail() {
  const taskId = useParams('id');
  const history = useHistory();
  const userInfo = useUserInfo();
  // 初始化作业详情数据
  const [taskDetailData, setTaskDetailData] = useState<TaskDetailObject>({});
  // 初始化工作流名称
  const [workflowName, setWorkflowName] = useState('');
  // 初始化节点数据
  const [nodeData, setNodeData] = useState<nodeDataObject[]>([]);
  // 初始化解析节点数据
  const [parseNodeData, setParseNodeData] = useState({});
  // 初始化当前选中的节点
  const [activeNode, setActiveNode] = useState('');
  // 初始化当前节点是否是解析节点
  const [isParseNode, setIsParseNode] = useState(true);
  // 初始化数据清洗节点及数据增强节点数据
  const [cleaningAugmentNodeData, setCleaningAugmentNodeData] = useState({});
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 初始化分页数据
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 100
  });
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState({
    status: '',
    file_type: '',
    sort: '',
    sort_by: ''
  });

  // 初始化详情基本数据
  useEffect(() => {
    if (taskId) getDetailData(true);
    const intervalDetailData = setInterval(() => getDetailData(), 180000); // 每隔3分钟更新一次状态
    return () => clearInterval(intervalDetailData); // 组件卸载时清理
  }, [taskId]);

  // 确保activeNode以及sortValue数据变化后再调用getNodeDetail
  useEffect(() => {
    if (taskId && activeNode) getNodeDetail();
  }, [activeNode, sortValue]);

  const getDetailData = async (isSetActiveNode = false) => {
    setLoading(true);
    try {
      const res = await getTaskDetail(taskId!);
      if (res.status === 200 && res.data) {
        setTaskDetailData(res.data.base_info);
        setWorkflowName(res.data.workflow_name);
        isSetActiveNode && setActiveNode(res.data.result_info.task_type);
        // 判断第一个节点是否是解析数据节点
        const isParse =
          res.data.result_info.task_type === NodeType.text ||
          res.data.result_info.task_type === NodeType.pic ||
          res.data.result_info.task_type === NodeType.video ||
          res.data.result_info.task_type === NodeType.audio;
        setIsParseNode(isParse);
        // 将节点状态列表第一个运行中后面的状态都改为未开始
        const firstZeroIndex = res.data.result_info.task_type_list.findIndex(
          (item: { status: number }) => item.status === 0
        );
        const updatedData = res.data.result_info.task_type_list.map(
          (item: { status: number }, index: number) =>
            (res.data.base_info.run_status === TaskRunStatus.fail ||
              res.data.base_info.run_status === TaskRunStatus.stop ||
              index > firstZeroIndex) &&
            item.status === 0
              ? { ...item, status: 3 }
              : item
        );
        setNodeData(updatedData);
        if (isParse) {
          setParseNodeData(res.data.result_info.data_parse);
          setPagination({
            current: res.data.result_info.data_parse.page_info.page,
            pageSize: res.data.result_info.data_parse.page_info.page_size,
            total: res.data.result_info.data_parse.page_info.total
          });
        } else {
          setCleaningAugmentNodeData(res.data.result_info.data_dispose);
        }
      }
    } finally {
      setLoading(false);
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
                    handleRetryWorkflow(taskId!);
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
                    handleStopWorkflow(taskId!);
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
              <span className="item-content">
                {taskDetailData.time_size || '--'}
              </span>
            </div>
          </div>
          <div className="running-item">
            <span className="item-title">开始时间</span>
            <div className="item-content-box">
              <span className="item-content">
                {taskDetailData.start_time || '--'}
              </span>
            </div>
          </div>
          <div className="running-item">
            <span className="item-title">结束时间</span>
            <div className="item-content-box">
              <span className="item-content">
                {taskDetailData.end_time || '--'}
              </span>
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
  const getNodeName = (type: string) => {
    switch (type) {
      case NodeType.text:
        return NodeTypeName.text;
      case NodeType.pic:
        return NodeTypeName.pic;
      case NodeType.audio:
        return NodeTypeName.audio;
      case NodeType.video:
        return NodeTypeName.video;
      case NodeType.cleaning:
        return NodeTypeName.cleaning;
      case NodeType.enhancement:
        return NodeTypeName.enhancement;
    }
  };

  // 获取子组件的分页数据
  const handleChildData = (current: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current,
      pageSize
    }));
    getNodeDetail(current, pageSize);
  };

  // 获取子节点的筛选条件数据
  const handleChildSortData = (pagination, sorter, filters) => {
    setPagination((prev) => ({
      ...prev,
      current: 1
    }));
    const sortdata = {
      status: filters.status === undefined ? '' : filters.status.join(','),
      file_type:
        filters.file_type === undefined ? '' : filters.file_type.join(','),
      sort:
        sorter.direction === undefined
          ? ''
          : sorter.direction === 'ascend'
            ? 'asc'
            : 'desc',
      sort_by:
        sorter.field === undefined
          ? ''
          : sorter.field === StartOrEnd.start_time
            ? 'start_run_time'
            : 'end_run_time'
    };
    setSortValue(sortdata);
  };

  // 切换节点tab
  const handleChangeTab = (val: string) => {
    const isParse =
      val === NodeType.text ||
      val === NodeType.pic ||
      val === NodeType.video ||
      val === NodeType.audio;
    setIsParseNode(isParse);
    setActiveNode(val);
  };

  // 获取节点详情
  const getNodeDetail = async (current?: number, pageSize?: number) => {
    if (!taskId) return;
    const params = {
      id: taskId,
      task_type: activeNode,
      search_key: '',
      page: current || pagination.current,
      page_size: pageSize || pagination.pageSize,
      ...sortValue
    };
    const res = await getTaskDetailNode(params);
    if (!res?.data) return;
    if (isParseNode) {
      setParseNodeData(res.data.data_parse);
      setPagination({
        current: res.data.data_parse.page_info.page,
        pageSize: res.data.data_parse.page_info.page_size,
        total: res.data.data_parse.page_info.total
      });
    } else setCleaningAugmentNodeData(res.data.data_dispose);
  };

  // 获取作业内容区域dom
  const getTaskContentDom = () => {
    return (
      <div className="work-region">
        <Tabs
          key="card"
          tabPosition={'left'}
          onChange={(task_type) => handleChangeTab(task_type)}
          defaultActiveTab={activeNode || nodeData[0]?.task_type}
          activeTab={activeNode}
        >
          {nodeData.map((item) => {
            return (
              <TabPane
                key={item.task_type}
                disabled={item.status === NodeRunStatus.wait}
                title={
                  <span>
                    {item.status === NodeRunStatus.running ? (
                      <IconLoading style={{ marginRight: 6 }} />
                    ) : item.status === NodeRunStatus.completeSuccess ||
                      item.status === NodeRunStatus.completeFail ? (
                      <IconCheckCircle style={{ marginRight: 6 }} />
                    ) : (
                      <IconClockCircle style={{ marginRight: 6 }} />
                    )}
                    {getNodeName(item.task_type)}
                  </span>
                }
              >
                <Typography.Paragraph style={{ marginTop: 20 }}>
                  {isParseNode ? (
                    <ParseNode
                      dataSource={parseNodeData}
                      loading={loading}
                      onSendData={handleChildData}
                      pagination={pagination}
                      onSortData={handleChildSortData}
                    />
                  ) : item.task_type === NodeType.cleaning ? (
                    <DataCleaningNode
                      dataSource={cleaningAugmentNodeData}
                      loading={loading}
                    />
                  ) : (
                    <DataAugmentationNode
                      dataSource={cleaningAugmentNodeData}
                      loading={loading}
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
  const handleRetryWorkflow = async (id: string) => {
    const params = {
      id: id,
      uid: userInfo?.id
    };
    const res = await taskRerun(params);
    if (res.status === 200 && res.code === '') {
      Message.success({
        content: '提交成功！'
      });
      getDetailData();
    } else {
      Message.error({
        content: res.message || '提交失败，请稍后重试'
      });
    }
  };

  // 进行中状态下停止操作
  const handleStopWorkflow = async (id: string) => {
    const params = {
      id: id,
      uid: userInfo?.id
    };
    const res = await taskStop(params);
    if (res.status === 200 && res.code === '') {
      Message.success({
        content: '停止成功'
      });
      getDetailData();
    } else {
      Message.error({
        content: res.message || '停止失败，请稍后重试'
      });
    }
  };

  return (
    <div className="workflow-task-detail">
      <div className="head-breadcrumb-box">
        <IconArrowLeft
          style={{ cursor: 'pointer', width: 18, height: 18 }}
          onClick={() => history.goBack()}
        />
        <Breadcrumb style={{ fontSize: 20, marginLeft: '10px' }}>
          <BreadcrumbItem
            onClick={() =>
              history.push('/tenant/compute/modaforge/workflowTask')
            }
            className={'breadcrumb-text'}
          >
            作业详情
          </BreadcrumbItem>
          <BreadcrumbItem>{taskId}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      {/* 详情顶部状态区域 */}
      {getTaskDetailTopDom()}
      {/* 工作流拓扑图区域 */}
      <div className="topology-diagram">
        <div className="workflow-name">{workflowName}</div>
        <Workflow setHeight={true} />
      </div>
      {/* 作业内容区域 */}
      {getTaskContentDom()}
    </div>
  );
}
