import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import type { VideoParserNodeType } from './types';
import {
  BlockEnum,
  type NodeProps
} from '@/pages/workflowConfig/workflow/types';
import { useNodes, useStoreApi, type Node } from 'reactflow';
import { StartNodeType } from '../start/types';
import { getLoadTaskFiles } from '@/api/loadApi';
import { useUnmountedRef } from 'ahooks';
import { getModelList } from '@/api/modelV2';
import useConfig from './use-config';

const Node: FC<NodeProps<VideoParserNodeType>> = (props) => {
  const { selected_files_num } = props.data;

  const unmountedRef = useUnmountedRef();
  const { handleModelChange } = useConfig(props.id, props.data);

  useEffect(() => {
    getModelList().then((res: any) => {
      if (unmountedRef.current) return;
      const audioList =
        res.data.find((d) => d.type === 'audio_model')?.model_data || [];

      const audio_model_id = audioList[0]?.id || '';

      const fields = {} as Record<string, any>;
      if (!props.data.audio_model_id) {
        fields.audio_model_id = audio_model_id;
      }
      handleModelChange(fields);
    });
  }, []);

  return (
    <div className={`wk-node-content`}>
      <div className={`output-section`}>
        <div className="output-header">
          <span className="txt">解析数据</span>
        </div>
        <div className="output-list">
          {selected_files_num > 0 && (
            <div className="output-var-item">
              已选择{selected_files_num}个文件
            </div>
          )}
          {/* {(selected_files_num < 0 || selected_files_num === undefined) && (
            <div className="output-var-item">已选择{totalFiles}个文件</div>
          )} */}
          {(selected_files_num <= 0 || selected_files_num === undefined) && (
            <div className="output-var-item">
              <span className="extra-info">未配置</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Node);
