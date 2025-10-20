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
import {
  getTaskDetail,
  getTaskDetailNode,
  taskRerun,
  taskStop
} from '@/api/taskDetail';
import { useUserInfo } from '@/store/userInfoStore';
import Workflow from '../workflowConfig/index';
import { WORKFLOW_TASK_PERMISSIONS } from '@/config/permissions';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { openNewPage } from '@/utils/env';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import ScriptingNode from './components/scripting-node';
import styles from './detail.module.scss';

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
  wait = 0,
  completeSuccess = 1,
  completeFail = 2,
  running = 3
}

// 枚举节点类型
enum NodeType {
  text = 'text',
  pic = 'pic',
  audio = 'audio',
  video = 'video',
  cleaning = 'cleaning',
  enhancement = 'enhancement',
  scripting = 'scripting'
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
  perms?: string[];
}

// 定义nodeData值的类型
interface nodeDataObject {
  task_name: string;
  task_type: string;
  status: number | string;
  node_code: string;
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
  // 初始化当前选中的节点类型
  const [activeNodeType, setActiveNodeType] = useState('');
  // 初始化当前节点是否是解析节点
  const [isParseNode, setIsParseNode] = useState(false);
  // 初始化是否切换了tab
  const [isChangeTab, setIsChangeTab] = useState(false);
  // 初始化数据清洗节点及数据增强节点数据
  const [cleaningAugmentNodeData, setCleaningAugmentNodeData] = useState({
    raw_data_num: 0,
    processed_data_num: 0,
    log: ''
  });
  // 初始化脚本节点数据
  const [scriptingNodeData, setScriptingNodeData] = useState({
    run_log: '',
    output_file_num: 0,
    input_file_num: 0,
    input_file_size: '',
    output_file_size: ''
  });

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
  const workflowUuid = useParams('workflow_uuid');
  const workflowVersion = useParams('workflow_version');
  const workflowId = useParams('ds_workflow_id');
  let intervalDetailData: string | number | NodeJS.Timeout | undefined;
  // 初始化详情基本数据
  useEffect(() => {
    if (taskId) getDetailData(true);
    intervalDetailData = setInterval(() => getDetailData(), 180000); // 每隔3分钟更新一次状态
    return () => clearInterval(intervalDetailData); // 组件卸载时清理
  }, [taskId]);

  // 确保activeNode以及sortValue数据变化后再调用getNodeDetail
  useEffect(() => {
    if (taskId && activeNode) getNodeDetail();
  }, [activeNode && isChangeTab, sortValue, taskDetailData.run_status]);

  const getDetailData = async (isSetActiveNode = false) => {
    setLoading(true);
    try {
      const res = await getTaskDetail(taskId!);
      if (res.status === 200 && res.data) {
        setTaskDetailData(res.data.base_info);
        // 当前状态不是运行中时清空定时器
        if (res.data.base_info.run_status !== TaskRunStatus.running) {
          clearInterval(intervalDetailData);
        }
        // 运行中状态定时刷新防止节点数据重新渲染
        if (
          !isSetActiveNode &&
          res.data.base_info.run_status === TaskRunStatus.running
        )
          return;
        setWorkflowName(res.data.workflow_name);
        setActiveNodeType(res.data.result_info.task_type);
        setActiveNode(res.data.result_info.node_code);
        // 判断第一个节点是否是解析数据节点
        const isParse =
          res.data.result_info.task_type === NodeType.text ||
          res.data.result_info.task_type === NodeType.pic ||
          res.data.result_info.task_type === NodeType.video ||
          res.data.result_info.task_type === NodeType.audio;
        setIsParseNode(isParse);
        // 将节点状态列表第一个运行中后面的状态都改为未开始
        // const firstZeroIndex = res.data.result_info.task_type_list.findIndex(
        //   (item: { status: number }) => item.status === 0
        // );
        // const updatedData = res.data.result_info.task_type_list.map(
        //   (item: { status: number }, index: number) =>
        //     (res.data.base_info.run_status === TaskRunStatus.fail ||
        //       res.data.base_info.run_status === TaskRunStatus.stop ||
        //       index > firstZeroIndex) &&
        //       item.status === 0
        //       ? { ...item, status: 3 }
        //       : item
        // );
        setNodeData(res.data.result_info.task_type_list);
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
        className={styles['running-box']}
        style={
          taskDetailData.run_status === TaskRunStatus.success
            ? { backgroundColor: '#ECFDF5', border: '1px solid #10B981' }
            : taskDetailData.run_status === TaskRunStatus.fail
              ? {
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #EF4444',
                  minHeight: 106
                }
              : taskDetailData.run_status === TaskRunStatus.running
                ? { backgroundColor: '#EEF6FF', border: '1px solid #007DFA' }
                : { border: '1px solid #CBD5E1' }
        }
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className={styles['running-item']}>
            <span className={styles['item-title']}>状态</span>
            {taskDetailData.run_status === TaskRunStatus.success ? (
              <div className={styles['item-content-box']}>
                <IconCheckCircleFill
                  style={{
                    color: '#10B981',
                    margin: '0 8px 0 0',
                    width: 16,
                    height: 16
                  }}
                />
                <span className={styles['item-content']}>运行成功</span>
              </div>
            ) : taskDetailData.run_status === TaskRunStatus.fail ? (
              <div className={styles['item-content-box']}>
                <IconCloseCircleFill
                  style={{
                    color: '#EF4444',
                    margin: '0 8px 0 0',
                    width: 16,
                    height: 16
                  }}
                />
                <span className={styles['item-content']}>运行失败</span>
                {taskDetailData.perms &&
                  taskDetailData.perms.includes(
                    WORKFLOW_TASK_PERMISSIONS.CAN_UPDATE
                  ) && (
                    <Popconfirm
                      focusLock
                      title="确定重新运行吗？"
                      content="已处理数据将被覆盖"
                      onOk={() => {
                        handleRetryWorkflow(taskId!);
                      }}
                    >
                      <span className={styles['operate-text']}>重试</span>
                    </Popconfirm>
                  )}
              </div>
            ) : taskDetailData.run_status === TaskRunStatus.running ? (
              <div className={styles['item-content-box']}>
                <IconLoading
                  style={{
                    color: '#007DFA',
                    margin: '0 8px 0 0',
                    width: 16,
                    height: 16
                  }}
                />
                <span className={styles['item-content']}>运行中</span>
                {taskDetailData.perms &&
                  taskDetailData.perms.includes(
                    WORKFLOW_TASK_PERMISSIONS.CAN_UPDATE
                  ) && (
                    <Popconfirm
                      focusLock
                      title="确定停止吗？"
                      content="未处理完的数据将停止处理"
                      onOk={() => {
                        handleStopWorkflow(taskId!);
                      }}
                    >
                      <span className={styles['operate-text']}>停止</span>
                    </Popconfirm>
                  )}
              </div>
            ) : (
              <div className={styles['item-content-box']}>
                <IconExclamationCircleFill
                  style={{
                    color: '#6E7B8D',
                    margin: '0 8px 0 0',
                    width: 16,
                    height: 16
                  }}
                />
                <span className={styles['item-content']}>已停止</span>
              </div>
            )}
          </div>
          <div className={styles['running-item']}>
            <span className={styles['item-title']}>总用时</span>
            <div className={styles['item-content-box']}>
              <span className={styles['item-content']}>
                {taskDetailData?.time_size === ''
                  ? '-'
                  : (taskDetailData?.time_size ?? '-')}
              </span>
            </div>
          </div>
          <div className={styles['running-item']}>
            <span className={styles['item-title']}>开始时间</span>
            <div className={styles['item-content-box']}>
              <span className={styles['item-content']}>
                {taskDetailData?.start_time === ''
                  ? '-'
                  : (taskDetailData?.start_time ?? '-')}
              </span>
            </div>
          </div>
          <div className={styles['running-item']}>
            <span className={styles['item-title']}>结束时间</span>
            <div className={styles['item-content-box']}>
              <span className={styles['item-content']}>
                {taskDetailData?.end_time === ''
                  ? '-'
                  : (taskDetailData?.end_time ?? '-')}
              </span>
            </div>
          </div>
        </div>
        {taskDetailData.run_status === TaskRunStatus.fail ? (
          <span className={styles['fail-tip']}>{taskDetailData.error_msg}</span>
        ) : (
          <></>
        )}
      </div>
    );
  };

  // 获取子组件的分页数据
  const handleChildData = (
    current: number,
    pageSize: number,
    value: {
      sorter: SorterInfo;
      filters: Partial<Record<string | number | symbol, string[]>>;
    }
  ) => {
    setPagination((prev) => ({
      ...prev,
      current,
      pageSize
    }));
    handleChildSortData(value.sorter, value.filters, false);
  };

  // 获取子节点的筛选条件数据
  const handleChildSortData = (
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>,
    isSetPage = true
  ) => {
    if (isSetPage) {
      setPagination((prev) => ({
        ...prev,
        current: 1
      }));
    }
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
    const type =
      nodeData.find((item) => item.node_code === val)?.task_type ?? '';
    const isParse =
      type === NodeType.text ||
      type === NodeType.pic ||
      type === NodeType.video ||
      type === NodeType.audio;
    setActiveNodeType(type);
    setIsParseNode(isParse);
    setActiveNode(val);
    setIsChangeTab(!isChangeTab);
  };

  // 获取节点详情
  const getNodeDetail = async () => {
    if (!taskId) return;
    const params = {
      id: taskId,
      node_code: activeNode,
      task_type: activeNodeType,
      search_key: '',
      page: pagination.current,
      page_size: pagination.pageSize,
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
    } else if (activeNodeType === NodeType.scripting) {
      setScriptingNodeData(res.data.data_scripting);
    } else setCleaningAugmentNodeData(res.data.data_dispose);
  };

  // 获取作业内容区域dom
  const getTaskContentDom = () => {
    return (
      <div className={styles['work-region']}>
        <Tabs
          key="card"
          tabPosition={'left'}
          onChange={(node_code) => handleChangeTab(node_code)}
          defaultActiveTab={activeNode || nodeData[0]?.node_code}
          activeTab={activeNode}
        >
          {nodeData.map((item) => {
            return (
              <TabPane
                key={item.node_code}
                disabled={item.status === NodeRunStatus.wait}
                title={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span>
                      {item.status === NodeRunStatus.running ? (
                        <IconLoading
                          style={{ marginRight: 8, width: 14, height: 14 }}
                        />
                      ) : item.status === NodeRunStatus.completeSuccess ||
                        item.status === NodeRunStatus.completeFail ? (
                        <IconCheckCircle
                          style={{ marginRight: 8, width: 14, height: 14 }}
                        />
                      ) : (
                        <IconClockCircle
                          style={{ marginRight: 8, width: 14, height: 14 }}
                        />
                      )}
                    </span>
                    <EllipsisPopover value={item.task_name} isEdit={false} />
                  </span>
                }
              >
                <Typography.Paragraph>
                  {isParseNode ? (
                    <ParseNode
                      dataSource={parseNodeData}
                      loading={loading}
                      onSendData={handleChildData}
                      pagination={pagination}
                      onSortData={handleChildSortData}
                      status={item?.status}
                    />
                  ) : item.task_type === NodeType.cleaning ? (
                    <DataCleaningNode
                      dataSource={cleaningAugmentNodeData}
                      loading={loading}
                      status={item?.status}
                    />
                  ) : item.task_type === NodeType.enhancement ? (
                    <DataAugmentationNode
                      dataSource={cleaningAugmentNodeData}
                      loading={loading}
                      status={item?.status}
                    />
                  ) : (
                    <ScriptingNode
                      dataSource={scriptingNodeData}
                      loading={loading}
                      status={item?.status}
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
    const params: any = {
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
    const params: any = {
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

  const handleClickWorkflow = () => {
    openNewPage(
      `/modaforge/tenant/compute/modaforge/workflowConfig?workflow_uuid=${workflowUuid}&ds_workflow_id=${workflowId}&workflow_version=${workflowVersion}`
    );
  };

  return (
    <div className={styles['workflow-task-detail']}>
      <div className={styles['head-breadcrumb-box']}>
        <IconArrowLeft
          style={{ cursor: 'pointer', fontSize: '14px' }}
          onClick={() => history.goBack()}
        />
        <Breadcrumb style={{ fontSize: 20, marginLeft: '21px' }}>
          <BreadcrumbItem
            onClick={() =>
              history.push('/tenant/compute/modaforge/workflowTask')
            }
            className={styles['breadcrumb-text']}
          >
            作业详情
          </BreadcrumbItem>
          <BreadcrumbItem>{taskId}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      {/* 详情顶部状态区域 */}
      {getTaskDetailTopDom()}
      {/* 工作流拓扑图区域 */}
      <div className={styles['topology-diagram']}>
        <div className={styles['workflow-name']} onClick={handleClickWorkflow}>
          {workflowName}
        </div>
        <Workflow setHeight={true} />
      </div>
      {/* 作业内容区域 */}
      {getTaskContentDom()}
    </div>
  );
}
