import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import type { ImageParserNodeType } from './types';
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

const Node: FC<NodeProps<ImageParserNodeType>> = (props) => {
  const { selected_files_num } = props.data;

  const unmountedRef = useUnmountedRef();
  const { handleModelChange } = useConfig(props.id, props.data);

  useEffect(() => {
    getModelList().then((res: any) => {
      if (unmountedRef.current) return;
      const picList =
        res.data.find((d) => d.type === 'pic_model')?.model_data || [];
      const picEmbList =
        res.data.find((d) => d.type === 'pic_emb_model')?.model_data || [];

      const pic_model_id = picList[0]?.id || '';
      const pic_emb_model_id = picEmbList[0]?.id || '';

      const fields = {} as Record<string, any>;
      if (!props.data.pic_model_id) {
        fields.pic_model_id = pic_model_id;
      }
      if (!props.data.pic_emb_model_id) {
        fields.pic_emb_model_id = pic_emb_model_id;
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
            <div className="output-var-item !font-semibold">
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
