import React, { useEffect, useState } from 'react';
import { useParams } from '@/utils/url';
import { useHistory } from 'react-router-dom';
import {
  getTask,
  getJobMeta,
  getJobAnnotations,
  getJobLabels,
  saveJobAnnotations,
  submitJobAnnotations
} from '@/api/labelEditor';
import WujieReact from 'wujie-react';

const LabelTypeMap = {
  '1': 'text',
  '2': 'image'
};
function WorkflowConfig() {
  const [loading, setLoading] = useState(true);
  const taskId = useParams('tId');
  const requirementId = useParams('rId');
  const labelType = useParams('type');
  const labelTool = useParams('tool');
  const [labelUrl, setLabelUrl] = useState('');
  const history = useHistory();

  useEffect(() => {
    const init = async () => {
      if (taskId) {
        setLabelUrl(
          `/labeleditor/${LabelTypeMap[labelType!]}/requirement/${requirementId}/task/${taskId}?type=${labelType}&tool=${labelTool}`
        );
        setLoading(false);
      } else {
        const taskInfo = await getTask(requirementId!);
        const {
          task_id,
          requerment_info: {
            label_type: type,
            label_tool: { label_tool_code: tool }
          }
        } = taskInfo.data.data;

        history.push(
          `/tenant/compute/modaforge/labelEditor?rId=${requirementId}&tId=${task_id}&type=${type}&tool=${tool}`
        );
      }
    };
    init();
  }, [taskId, requirementId, labelType, labelTool, history]);

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
          props={{
            getJobMeta,
            getJobAnnotations,
            getJobLabels,
            saveJobAnnotations,
            submitJobAnnotations
          }}
        ></WujieReact>
      )}
    </div>
  );
}

export default WorkflowConfig;
