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
import { TEXT_DATA, LabelTypeMap } from './const';

const { bus } = WujieReact;

function WorkflowConfig() {
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
      Modal.warning({
        title: '提示信息',
        content: '当前需求已无新任务，点击确定将返回需求列表页',
        afterClose: () => {
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

  useEffect(() => {
    // 由于是alive模式，更改labelUrl并不会导致wujie子应用刷新页面，所以需要手工刷新
    if (taskId && labelUrl && labelUrl.includes(`/task/${taskId}?`)) {
      // 由于需要子应用内部刷新页面，所以去掉子应用前缀
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
          loading={null}
          props={{
            getImgJobMeta,
            getImgJobAnnotations,
            getImgJobLabels,
            saveImgJobAnnotations,
            submitImgJobAnnotations,
            getImgJobOverview,
            goBack,
            switchNextTask,
            getTextEditorTask,
            getTextEditorResult,
            saveTextEditorResult,
            getTextEditorLabels,
            getTaskDetail
          }}
        ></WujieReact>
      )}
    </div>
  );
}

export default WorkflowConfig;
