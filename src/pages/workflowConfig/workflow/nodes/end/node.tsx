import { FC, useState } from 'react';
import React from 'react';
import cn from 'classnames';
import type { EndNodeType } from './types';
import type {
  NodeProps,
  Variable
} from '@/pages/workflowConfig/workflow/types';
import {
  isConversationVar,
  isENV,
  isSystemVar
} from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/utils';
import {
  useIsChatMode,
  useWorkflow,
  useWorkflowVariables
} from '@/pages/workflowConfig/workflow/hooks';
// import { VarBlockIcon } from '@/pages/workflowConfig/workflow/block-icon'
// import { Line3 } from '@/app/components/base/icons/src/public/common'
// import { Variable02 } from '@/app/components/base/icons/src/vender/solid/development'
// import { BubbleX, Env } from '@/app/components/base/icons/src/vender/line/others'
import { BlockEnum } from '@/pages/workflowConfig/workflow/types';
import { RiArrowDownSFill } from '@remixicon/react';

const Node: FC<NodeProps<EndNodeType>> = ({ id, data }) => {
  const { getBeforeNodesInSameBranch } = useWorkflow();
  const availableNodes = getBeforeNodesInSameBranch(id);
  const { getCurrentVariableType } = useWorkflowVariables();
  const isChatMode = useIsChatMode();

  const startNode = availableNodes.find((node: any) => {
    return node.data.type === BlockEnum.Start;
  });

  const getNode = (id: string) => {
    return availableNodes.find((node) => node.id === id) || startNode;
  };

  const { outputs } = data;
  const filteredOutputs = outputs.filter(
    ({ value_selector }) => value_selector.length > 0
  );

  const [show, setShow] = useState(true);

  const toggleVars = () => {
    setShow((s) => !s);
  };

  // if (!filteredOutputs.length)
  //   return null

  // return (
  //   <div className='mb-1 px-3 py-1 space-y-[8px] wk-node-content'>
  //     {filteredOutputs.map(({ value_selector }, index) => {
  //       const node = getNode(value_selector[0])
  //       const isSystem = isSystemVar(value_selector)
  //       const isEnv = isENV(value_selector)
  //       const isChatVar = isConversationVar(value_selector)
  //       const varName = isSystem ? `sys.${value_selector[value_selector.length - 1]}` : value_selector[value_selector.length - 1]
  //       const varType = getCurrentVariableType({
  //         valueSelector: value_selector,
  //         availableNodes,
  //         isChatMode,
  //       })
  //       return (
  //         <div key={index} className='flex items-center h-6 justify-between bg-gray-100 rounded-md  px-1 space-x-1 text-xs font-normal text-gray-700 item-bg'>
  //           <div className='flex items-center text-xs font-medium text-gray-500'>
  //             {!isEnv && !isChatVar && (
  //               <>
  //                 {/* <div className='p-[1px]'>
  //                   <VarBlockIcon
  //                     className='!text-gray-900'
  //                     type={node?.data.type || BlockEnum.Start}
  //                   />
  //                 </div> */}
  //                 <div className='max-w-[75px] truncate'>{node?.data.title}</div>
  //                 {/* <Line3 className='mx-0.5'></Line3> */}
  //               </>
  //             )}
  //             <div className='flex items-center text-primary-600'>
  //               {/* {!isEnv && !isChatVar && <Variable02 className='shrink-0 w-3.5 h-3.5 text-primary-500' />}
  //               {isEnv && <Env className='shrink-0 w-3.5 h-3.5 text-util-colors-violet-violet-600' />}
  //               {isChatVar && <BubbleX className='w-3.5 h-3.5 text-util-colors-teal-teal-700' />} */}

  //               <div className={cn('name max-w-[50px] ml-0.5 text-xs font-medium truncate', (isEnv || isChatVar) && '!max-w-[70px] text-gray-900')}>{varName}</div>
  //             </div>
  //           </div>
  //           <div className='text-xs font-normal text-gray-700'>
  //             <div className='max-w-[42px] ml-0.5 text-xs font-normal text-gray-500 capitalize truncate bg-[#E7ECF0] rounded-[4px] py-[2px] px-[4px] text-[#7F8C9F] text-[10px]/[12px]' title={varType}>
  //               {varType}
  //             </div>
  //           </div>
  //         </div>
  //       )
  //     })}

  //   </div>
  // )
  return (
    <div className={`wk-node-content`}>
      <div className={`output-section ${!show ? 'collapsed' : ''}`}>
        <div className="output-header" onClick={toggleVars}>
          <span className="txt">输出</span>
          <RiArrowDownSFill className="icon" />
        </div>
        <div className="output-list">
          {filteredOutputs.map(({ value_selector, variable }, index) => {
            const node = getNode(value_selector[0]);
            const isSystem = isSystemVar(value_selector);
            const isEnv = isENV(value_selector);
            const isChatVar = isConversationVar(value_selector);
            const varName = isSystem
              ? `sys.${value_selector[value_selector.length - 1]}`
              : value_selector[value_selector.length - 1];
            const varType = getCurrentVariableType({
              valueSelector: value_selector,
              availableNodes,
              isChatMode
            });
            return (
              <div className="output-var-item" key={index}>
                <div className="left-part">
                  <span className="key-txt-origin">{variable}</span>
                  <span className="extra-info">
                    <span className="type-txt">{varType}</span>
                  </span>
                </div>
                <span className="key-txt">
                  <span className="node-type">{node?.data.title}</span>
                  <span className="node-name-separator">/</span>
                  <span className="var-name">{varName || '未命名'}</span>
                </span>
              </div>
            );
          })}
          {!filteredOutputs.length && (
            <div className="output-var-item">
              <span className="extra-info">未配置变量</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Node);
