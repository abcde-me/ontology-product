import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import type { AudioParserNodeType } from './types';
import {
  BlockEnum,
  type NodeProps
} from '@/pages/workflowConfig/workflow/types';
import { useNodes, useStoreApi, type Node } from 'reactflow';
import { StartNodeType } from '../start/types';
import { getLoadTaskFiles } from '@/api/loadApi';

const Node: FC<NodeProps<AudioParserNodeType>> = (props) => {
  const { selected_files_num } = props.data;

  // const nodes = useNodes();
  // const startNode = nodes.find(
  //   (node: any) => node.data.type === BlockEnum.Start
  // ) as unknown as Node<StartNodeType>;
  // const [totalFiles, setTotalFiles] = useState(0);

  // useEffect(() => {
  //   const fileConfig = startNode.data.data_category.find(
  //     (c) => c.id === 3
  //   )!;
  //   if (fileConfig.enabled && fileConfig.format.length) {
  //     const formats = fileConfig.format
  //       .join('/')
  //       .split('/')
  //       .map((f) => f.toLowerCase());
  //     const sourcePath = startNode.data.source_path;
  //     getLoadTaskFiles({ data_path_id: sourcePath, file_type: formats, page_size: 1, page: 1 }).then((res: any) => {
  //       setTotalFiles(res.data.total)
  //     })
  //   }
  // }, [startNode.data.data_category, startNode.data.source_path])

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
