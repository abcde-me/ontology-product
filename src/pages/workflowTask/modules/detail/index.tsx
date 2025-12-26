import React, { useEffect, useState } from 'react';
import { useRequest, useUpdateEffect } from 'ahooks';
import {
  Breadcrumb,
  Message,
  Popconfirm,
  Tabs,
  Typography,
  Button,
  Modal
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
import { useHistory, useParams as useRouteParams } from 'react-router';
import { useParams as useQueryParams } from '@/utils/url';
import ParseNode from '../../components/parse-node';
import DataCleaningNode from '../../components/data-cleaning-node';
import DataAugmentationNode from '../../components/data-augmentation-node';
import { getTaskDetailNode, taskStop } from '@/api/taskDetail';
import { useUserInfo } from '@/store/userInfoStore';
import Workflow from '../../../workflowConfig/index';
import { WORKFLOW_TASK_PERMISSIONS } from '@/config/permissions';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { openNewPage } from '@/utils/env';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import ScriptingNode from '../../components/scripting-node';
import styles from './index.module.scss';
import { PermissionWrapper } from '@/components/PermissionGuard';
import {
  getTaskDetail,
  taskNodeRetry,
  workflowOperation
} from '@/api/workflowTask';
import {
  TaskDetailBaseInfo,
  WorkflowOperationType,
  WorkflowTaskStatus,
  WorkflowType
} from '@/types/workflowTaskApi';
import TaskNodeList from './TaskNodeList';
import { WORKFLOW_RUN_STATUS_MAP } from '../../common/constants';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;

// // 枚举作业运行状态
// enum TaskRunStatus {
//   running = 1,
//   success = 2,
//   fail = 3,
//   stop = 4
// }

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
  image = 'image',
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
  run_status?: WorkflowTaskStatus;
  cre_time?: string;
  time_size?: string;
  start_time?: string;
  end_time?: string;
  error_msg?: string;
}

// 定义nodeData值的类型
interface nodeDataObject {
  task_name: string;
  task_type: string;
  status: number | string;
  node_code: string;
}

export default function WorkflowTaskDetail() {
  const { id: taskId } = useRouteParams<{ id: string }>();
  const history = useHistory();
  const userInfo = useUserInfo();
  // 初始化作业详情数据
  const [taskDetailData, setTaskDetailData] =
    useState<TaskDetailBaseInfo | null>(null);
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
  const workflowUuid = useQueryParams('workflow_uuid') ?? '';
  const workflowVersion = useQueryParams('workflow_version') ?? '';
  const workflowId = useQueryParams('ds_workflow_id') ?? '';
  const workflowType = useQueryParams('workflow_type') ?? WorkflowType.STRUCT;

  // 使用 useRequest 实现轮询
  const { run: runGetDetailData, cancel: cancelPolling } = useRequest(
    async (isSetActiveNode = false) => {
      return await getDetailData(isSetActiveNode);
    },
    {
      pollingInterval: 180000, // 每隔3分钟轮询一次
      pollingWhenHidden: false, // 页面隐藏时停止轮询
      manual: true // 手动触发
    }
  );

  // 初始化详情基本数据
  useEffect(() => {
    if (taskId) {
      runGetDetailData(true); // 首次加载
    }
  }, [taskId, runGetDetailData]);

  // 根据任务状态动态控制轮询
  useUpdateEffect(() => {
    if (taskDetailData?.state === WorkflowTaskStatus.RUNNING_EXECUTION) {
      // 状态为运行中时，轮询会自动开始（pollingInterval 已设置）
      // 如果轮询已停止，需要重新触发一次请求来启动轮询
      runGetDetailData();
    } else {
      // 状态不是运行中时停止轮询
      cancelPolling();
    }
  }, [taskDetailData?.state, runGetDetailData, cancelPolling]);

  // 确保activeNode以及sortValue数据变化后再调用getNodeDetail
  useEffect(() => {
    if (workflowType === WorkflowType.STRUCT) return;

    if (taskId && activeNode) getNodeDetail();
  }, [
    workflowType,
    activeNode && isChangeTab,
    sortValue,
    taskDetailData?.state
  ]);

  const getDetailData = async (isSetActiveNode = false) => {
    setLoading(true);
    try {
      const res = await getTaskDetail({
        id: taskId
      });
      if (res.status === 200 && res.data) {
        setTaskDetailData(res.data?.base_info ?? null);
        setWorkflowName(res.data?.workflow_name ?? '');
        setActiveNodeType(res.data.result_info?.task_type ?? '');
        setActiveNode(res.data.result_info?.node_code ?? '');
        // 判断第一个节点是否是解析数据节点
        const isParse =
          res.data.result_info?.task_type === NodeType.text ||
          res.data.result_info?.task_type === NodeType.pic ||
          res.data.result_info?.task_type === NodeType.image ||
          res.data.result_info?.task_type === NodeType.video ||
          res.data.result_info?.task_type === NodeType.audio;

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
        setNodeData(res.data.result_info?.task_type_list ?? []);
        if (isParse) {
          setParseNodeData(res.data.result_info?.data_parse ?? {});
          setPagination({
            current: res.data.result_info?.data_parse?.page_info?.page ?? 1,
            pageSize:
              res.data.result_info?.data_parse?.page_info?.page_size ?? 10,
            total: res.data.result_info?.data_parse?.page_info?.total ?? 0
          });
        } else {
          setCleaningAugmentNodeData(res.data.result_info?.data_dispose ?? {});
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取顶部区域dom
  const getTaskDetailTopDom = () => {
    // 使用原始状态值（新的枚举值），如果不存在则使用 stateName，最后使用默认值
    const statusMap = taskDetailData?.state
      ? WORKFLOW_RUN_STATUS_MAP[taskDetailData.state]
      : {
          text: '未知状态',
          color: '#666',
          dotColor: '#666'
        };

    const renderStatus = () => {
      const statusIcon = () => {
        if (
          taskDetailData?.state === WorkflowTaskStatus.SUCCESS ||
          taskDetailData?.state === WorkflowTaskStatus.FAILURE
        ) {
          return (
            <IconCheckCircleFill
              style={{
                color: statusMap.color,
                width: 16,
                height: 16
              }}
            />
          );
        } else if (
          taskDetailData?.state === WorkflowTaskStatus.RUNNING_EXECUTION
        ) {
          return (
            <IconLoading
              style={{
                color: statusMap.color,
                width: 16,
                height: 16
              }}
            />
          );
        } else {
          return (
            <IconExclamationCircleFill
              style={{
                color: statusMap.color,
                width: 16,
                height: 16
              }}
            />
          );
        }
      };
      return (
        <div className="flex items-center gap-[8px]">
          {statusIcon()}
          <span
            style={{
              fontSize: '14px',
              color: statusMap.color,
              lineHeight: '22px'
            }}
          >
            {statusMap.text}
          </span>
        </div>
      );
    };

    const bgColor = () => {
      if (taskDetailData?.state === WorkflowTaskStatus.SUCCESS) {
        return 'bg-[#ECFDF5] border-[#10B981]';
      } else if (taskDetailData?.state === WorkflowTaskStatus.FAILURE) {
        return 'bg-[#FEF2F2] border-[#EF4444]';
      } else if (
        taskDetailData?.state === WorkflowTaskStatus.RUNNING_EXECUTION
      ) {
        return 'bg-[#EEF6FF] border-[#007DFA]';
      } else {
        return 'bg-[transparent] border-[#CBD5E1]';
      }
    };

    return (
      <div
        className={`my-[16px] rounded-[6px] border-[1px] px-[24px] py-[12px] ${bgColor()}`}
      >
        <div className="flex justify-between">
          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-[500] leading-[22px] text-[var(--color-text-2)]">
              状态
            </span>
            <div className="flex h-[22px] items-center gap-[8px]">
              {renderStatus()}
              {taskDetailData?.state === WorkflowTaskStatus.FAILURE && (
                <Popconfirm
                  title="确定重新运行吗？"
                  content="已处理数据将被覆盖"
                  onOk={() => handleRetryWorkflow(taskId)}
                >
                  <Button type="text" className="px-[0px]">
                    重试
                  </Button>
                </Popconfirm>
              )}
              {taskDetailData?.state ===
                WorkflowTaskStatus.RUNNING_EXECUTION && (
                <Popconfirm
                  title="确定停止运行吗？"
                  content="未处理完的数据将停止处理"
                  onOk={() => handleStopWorkflow(taskId)}
                >
                  <Button type="text" className="px-[0px]">
                    停止
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-[500] leading-[22px] text-[var(--color-text-2)]">
              总用时
            </span>
            <span className="text-[14px] leading-[22px] text-[var(--color-text-2)]">
              {taskDetailData?.time_size ?? '-'}
            </span>
          </div>
          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-[500] leading-[22px] text-[var(--color-text-2)]">
              开始时间
            </span>
            <span className="text-[14px] leading-[22px] text-[var(--color-text-2)]">
              {taskDetailData?.start_time ?? '-'}
            </span>
          </div>
          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-[500] leading-[22px] text-[var(--color-text-2)]">
              结束时间
            </span>
            <span className="text-[14px] leading-[22px] text-[var(--color-text-2)]">
              {taskDetailData?.end_time ?? '-'}
            </span>
          </div>
        </div>
        {taskDetailData?.state === WorkflowTaskStatus.FAILURE &&
          taskDetailData?.error_msg && <span>{taskDetailData.error_msg}</span>}
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
      type === NodeType.image ||
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
    try {
      const res = await workflowOperation({
        process_instance_id: Number(id),
        execute_type: WorkflowOperationType.REPEAT_RUNNING
      });

      if (res.status === 200) {
        Message.success({
          content: '重新运行成功'
        });

        runGetDetailData();
      } else {
        Message.error({
          content: res.message || '重新运行失败，请稍后重试'
        });
      }
    } catch (error) {
      Message.error({
        content: '重新运行失败，请稍后重试'
      });
    }
  };

  const handleStopWorkflow = async (id: string) => {
    try {
      const res = await workflowOperation({
        process_instance_id: Number(id),
        execute_type: WorkflowOperationType.STOP
      });

      if (res.status === 200) {
        Message.success({
          content: '停止成功'
        });

        runGetDetailData();
      } else {
        Message.error({
          content: res.message || '停止失败，请稍后重试'
        });
      }
    } catch (error) {
      Message.error({
        content: '停止失败，请稍后重试'
      });
    }
  };
  const handleClickWorkflow = () => {
    openNewPage(
      `/modaforge/tenant/compute/modaforge/workflowConfig/${workflowType}?workflow_uuid=${workflowUuid}&ds_workflow_id=${workflowId}&workflow_version=${workflowVersion}`
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
      {workflowType === WorkflowType.NO_STRUCT && getTaskContentDom()}
      {/* 节点列表区域 */}
      {workflowType === WorkflowType.STRUCT && <TaskNodeList />}
    </div>
  );
}
