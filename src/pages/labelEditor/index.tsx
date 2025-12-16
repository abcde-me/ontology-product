import React, { useEffect, useState } from 'react';
import { useParams } from '@/utils/url';
import { useHistory } from 'react-router-dom';
import {
  getTask,
  getImgJobMeta,
  getImgJobAnnotations,
  getImgJobLabels,
  saveImgJobAnnotations,
  submitImgJobAnnotations,
  getImgJobOverview,
  getTextEditorTask,
  getTextEditorResult,
  saveTextEditorResult,
  getTextEditorLabels,
  getTaskDetail,
  getQualityControlTask,
  getQualityControlTaskById,
  saveQualityControlTask,
  createQualityControlTaskComment,
  modifyQualityControlTaskComment,
  deleteQualityControlTaskComment
} from '@/api/labelEditor';
import WujieReact from 'wujie-react';
import { Message, Modal } from '@arco-design/web-react';
import { IconExclamationCircleFill } from '@arco-design/web-react/icon';
import { TEXT_DATA, LabelTypeMap, WujiePlugins, STAGE_MAP } from './const';
import { useHasPermission } from '@/store/userInfoStore';
import { ANNOTATION_TASK_PERMISSIONS } from '@/config/permissions';

const { bus } = WujieReact;

function LabelEditorPage() {
  const [loading, setLoading] = useState(true);
  const taskId = useParams('tId');
  const requirementId = useParams('rId');
  const labelType = useParams('type');
  const labelTool = useParams('tool');
  const toolKind = useParams('kind');
  const reqName = useParams('name');
  const taskCount = useParams('count');
  // 当前模式 LABEL 标注 RELABEL 改错 REVIEW 质检 PREVIEW 预览
  const stage = useParams('stage');
  // 质检任务id
  const qsId = useParams('qsId');
  const qcRound = useParams('qcRound');
  const pkgId = useParams('pkgId');
  // 0 表示可以不修改标注，1 表示可以修改标注
  const labelModifyEnable = useParams('labelModifyEnable');
  // 文本用
  const mode = useParams('mode');
  const deadlineTimestamp = useParams('deadlineTimestamp');
  const [labelUrl, setLabelUrl] = useState('');
  const history = useHistory();
  const hasSavePermission = useHasPermission(ANNOTATION_TASK_PERMISSIONS.SAVE);

  useEffect(() => {
    const init = async () => {
      if (['LABEL', 'RELABEL'].includes(stage!)) {
        if (taskId) {
          setLabelUrl(
            `/labeleditor/${LabelTypeMap[labelType!]}/requirement/${requirementId}/task/${taskId}?type=${labelType}&kind=${toolKind}&mode=${mode}&tool=${labelTool}&name=${reqName}&count=${taskCount}&stage=${stage}&pkgId=${pkgId}`
          );
          setLoading(false);
        } else {
          await getAvailableTask();
        }
      }
      if (['REVIEW'].includes(stage!)) {
        if (taskId) {
          setLabelUrl(
            `/labeleditor/${LabelTypeMap[labelType!]}/requirement/${requirementId}/task/${taskId}?type=${labelType}&kind=${toolKind}&mode=${mode}&tool=${labelTool}&name=${reqName}&count=${taskCount}&stage=${stage}&qsId=${qsId}&qcRound=${qcRound}&labelModifyEnable=${labelModifyEnable}&deadlineTimestamp=${deadlineTimestamp}&pkgId=${pkgId}`
          );
          setLoading(false);
        } else {
          await getCurQualityControlTask(Number(qsId));
        }
      }
    };
    init();
  }, [
    taskId,
    requirementId,
    labelType,
    toolKind,
    labelTool,
    reqName,
    qsId,
    stage,
    mode
  ]);

  // 质检跳转
  const getCurQualityControlTask = async (qsId: number) => {
    const qualityControlTaskInfo = await getQualityControlTask(qsId);
    if (!qualityControlTaskInfo?.data?.task_id) {
      Modal.destroyAll();
      Modal.info({
        escToExit: false,
        maskClosable: false,
        title: '当前已无新质检任务',
        content: (
          <span style={{ fontSize: '14px', color: '#1E293B' }}>
            点击确定将返回质检列表页
          </span>
        ),
        icon: (
          <IconExclamationCircleFill
            style={{ color: '#007DFA', fontSize: '20px' }}
          />
        ),
        onOk: () => {
          goBack();
        }
      });
      return;
    }
    const {
      task_id,
      req_id,
      qc_round,
      label_modify_enable,
      volumn_uninspected,
      deadline_timestamp
    } = qualityControlTaskInfo.data;
    const curMode = STAGE_MAP[`${stage!}${label_modify_enable}`];
    const taskInfo = await getTaskDetail(String(task_id));
    const {
      requirement_info: {
        name,
        label_type: type,
        label_tool: { label_tool_code: tool }
      }
    } = taskInfo.data;
    history.replace(
      `/tenant/compute/modaforge/labelEditor?rId=${req_id}&tId=${task_id}&type=${type}&kind=${TEXT_DATA[tool]}&mode=${curMode}&tool=${tool}&name=${name}&count=${volumn_uninspected}&qsId=${qsId}&qcRound=${qc_round}&labelModifyEnable=${label_modify_enable}&deadlineTimestamp=${deadline_timestamp}&stage=${stage}&pkgId=${pkgId}`
    );
  };

  const getAvailableTask = async () => {
    const taskInfo = await getTask(requirementId!);
    if (!taskInfo?.data?.task_id) {
      Modal.destroyAll();
      Modal.info({
        escToExit: false,
        maskClosable: false,
        title: '当前需求已无新任务',
        content: (
          <span style={{ fontSize: '14px', color: '#1E293B' }}>
            点击确定将返回需求列表页
          </span>
        ),
        icon: (
          <IconExclamationCircleFill
            style={{ color: '#007DFA', fontSize: '20px' }}
          />
        ),
        onOk: () => {
          goBack();
        }
      });
      return;
    }

    const {
      task_id,
      requirement_info: {
        not_started_num: count,
        name,
        label_type: type,
        label_tool: { label_tool_code: tool }
      }
    } = taskInfo.data;

    history.replace(
      `/tenant/compute/modaforge/labelEditor?rId=${requirementId}&tId=${task_id}&type=${type}&kind=${TEXT_DATA[tool]}&mode=${STAGE_MAP[stage!]}&tool=${tool}&name=${name}&count=${count}&stage=${stage}&pkgId=${pkgId}`
    );
  };

  const goBack = () => {
    // TODO这里也加一个吧
    bus.$emit('labeleditor-deactivated');
    history.push('/tenant/compute/modaforge/taskList');
  };

  const switchNextTask = () => {
    getAvailableTask();
  };

  const switchNextQualityControlTask = () => {
    getCurQualityControlTask(Number(qsId));
  };

  const saveTaskWrapper = async (...args: any[]) => {
    const result = await args[args.length - 1](...args.slice(0, -1));
    if (result.code !== 'success') {
      Message.clear();
      Modal.destroyAll();
      Modal.info({
        escToExit: false,
        maskClosable: false,
        title: '提示信息',
        content: (
          <span style={{ fontSize: '14px', color: '#1E293B' }}>
            {result.message}
          </span>
        ),
        icon: (
          <IconExclamationCircleFill
            style={{ color: '#007DFA', fontSize: '20px' }}
          />
        ),
        onOk: () => {
          goBack();
        }
      });
      throw new Error(result.message);
    }
    return result;
  };

  useEffect(() => {
    if (taskId && labelUrl && labelUrl.includes(`/task/${taskId}?`)) {
      bus.$emit('refresh', labelUrl.replace('/labeleditor', ''));
    }
  }, [taskId, labelUrl]);

  // TODO 很奇怪， 当前版本保活模式下， 第二张图片无法标注
  // 监听子应用的激活和失活（通过 labelUrl 变化，不依赖子应用生命周期改造）
  useEffect(() => {
    if (!labelUrl) return;

    // 子应用激活（挂载）
    console.log('子应用 labeleditor 已激活（挂载）🍉', { url: labelUrl });
    bus.$emit('labeleditor-activated');
    // 子应用失活（卸载或 URL 变化）
    return () => {
      console.log('子应用 labeleditor 已失活（卸载）🍉', { url: labelUrl });
      bus.$emit('labeleditor-deactivated');
    };
  }, [labelUrl]);

  return (
    <div className={`app-label-editor-page h-full w-full overflow-x-auto`}>
      {!loading && labelUrl && (
        <WujieReact
          width="100%"
          height="100%"
          name="labeleditor"
          url={labelUrl}
          sync={true}
          alive={false}
          loading={document.createElement('span') as any}
          plugins={WujiePlugins}
          props={{
            getImgJobMeta,
            getImgJobAnnotations,
            getImgJobLabels,
            saveImgJobAnnotations: (...args) =>
              saveTaskWrapper(...args, saveImgJobAnnotations),
            submitImgJobAnnotations: (...args) =>
              saveTaskWrapper(...args, submitImgJobAnnotations),
            getImgJobOverview,

            getTextEditorTask,
            getTextEditorResult,
            saveTextEditorResult: (...args) =>
              saveTaskWrapper(...args, saveTextEditorResult),
            getTextEditorLabels,
            getTaskDetail,

            goBack,
            switchNextTask,
            hasSavePermission,
            getQualityControlTask,
            getQualityControlTaskById,
            createQualityControlTaskComment,
            modifyQualityControlTaskComment,
            deleteQualityControlTaskComment,
            saveQualityControlTask: (...args) =>
              saveTaskWrapper(...args, saveQualityControlTask),
            switchNextQualityControlTask
          }}
        ></WujieReact>
      )}
    </div>
  );
}

export default LabelEditorPage;
