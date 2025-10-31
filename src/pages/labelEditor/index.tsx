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
  getTaskDetail
} from '@/api/labelEditor';
import WujieReact from 'wujie-react';
import { Message, Modal } from '@arco-design/web-react';
import { IconExclamationCircleFill } from '@arco-design/web-react/icon';
import { TEXT_DATA, LabelTypeMap } from './const';

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
  const [labelUrl, setLabelUrl] = useState('');
  const history = useHistory();

  useEffect(() => {
    const init = async () => {
      if (taskId) {
        setLabelUrl(
          `/labeleditor/${LabelTypeMap[labelType!]}/requirement/${requirementId}/task/${taskId}?type=${labelType}&kind=${toolKind}&tool=${labelTool}&name=${reqName}&count=${taskCount}`
        );
        setLoading(false);
      } else {
        await getAvailableTask();
      }
    };
    init();
  }, [taskId, requirementId, labelType, toolKind, labelTool, reqName]);

  const getAvailableTask = async () => {
    const taskInfo = await getTask(requirementId!);
    if (!taskInfo.data.task_id) {
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
      `/tenant/compute/modaforge/labelEditor?rId=${requirementId}&tId=${task_id}&type=${type}&kind=${TEXT_DATA[tool]}&tool=${tool}&name=${name}&count=${count}`
    );
  };

  const goBack = () => {
    history.push('/tenant/compute/modaforge/taskList');
  };

  const switchNextTask = () => {
    getAvailableTask();
  };

  const saveTaskWrapper = async (...args: any[]) => {
    const result = await args[args.length - 1](...args.slice(0, -1));
    if (result.code === 600) {
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

  return (
    <div className={`app-label-editor-page h-full w-full overflow-x-auto`}>
      {!loading && labelUrl && (
        <WujieReact
          width="100%"
          height="100%"
          name="labeleditor"
          url={labelUrl}
          sync={true}
          alive={true}
          loading={document.createElement('span') as any}
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
            switchNextTask
          }}
        ></WujieReact>
      )}
    </div>
  );
}

export default LabelEditorPage;
