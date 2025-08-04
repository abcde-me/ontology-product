import type { FC } from 'react';
import React from 'react';
import { TextParserNodeType } from '../data-text-parser/types';
import { NodeProps } from 'reactflow';

const Node: FC<NodeProps<TextParserNodeType>> = () => {
  return (
    <div className={`wk-node-content`}>
      <div className={`output-section`}>
        <div className="output-header">
          <span className="txt">自定义</span>
        </div>
        <div className="output-list">
          <div className="output-var-item">
            <span className="extra-info !font-semibold">未配置</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Node);
