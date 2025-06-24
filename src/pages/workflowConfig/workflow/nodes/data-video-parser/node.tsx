import type { FC } from 'react';
import React, { useState } from 'react';
import type { VideoParserNodeType } from './types';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { useStoreApi } from 'reactflow';

const Node: FC<NodeProps<VideoParserNodeType>> = (props) => {
  const { selected_files_num } = props.data;

  const store = useStoreApi();
  const [totalFiles, setTotalFiles] = useState(10000);

  const findNode = (nodeId: string) => {
    const { getNodes, setNodes } = store.getState();

    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === nodeId)!;
    return currentNode;
  };

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
          {(selected_files_num < 0 || selected_files_num === undefined) && (
            <div className="output-var-item">已选择{totalFiles}个文件</div>
          )}
          {selected_files_num === 0 && (
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
