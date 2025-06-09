import type { FC } from 'react'
import React, {
  memo,
  useEffect,
} from 'react'
import {
  Background,
  useNodesInitialized,
  useViewport,
} from 'reactflow'
import { LoopStartNodeDumb } from '../loop-start'
import { useNodeLoopInteractions } from './use-interactions'
import type { LoopNodeType } from './types'
import AddBlock from './add-block'
import cn from '@/pages/workflowConfig/utils/classnames'

import type { NodeProps } from '@/pages/workflowConfig/workflow/types'

const Node: FC<NodeProps<LoopNodeType>> = ({
  id,
  data,
}) => {
  const { zoom } = useViewport()
  const nodesInitialized = useNodesInitialized()
  const { handleNodeLoopRerender } = useNodeLoopInteractions()

  useEffect(() => {
    if (nodesInitialized)
      handleNodeLoopRerender(id)
  }, [nodesInitialized, id, handleNodeLoopRerender])

  return (
    <div className={cn(
      'relative min-w-[240px] min-h-[90px] w-full h-full',
    )}>
      <Background
        id={`loop-background-${id}`}
        className='rounded-none !z-0'
        gap={[14 / zoom, 14 / zoom]}
        size={2 / zoom}
        color='#E4E5E7'
      />
      {
        data._isCandidate && (
          <LoopStartNodeDumb />
        )
      }
      {/* {
        data._children!.length === 1 && (
          <AddBlock
            loopNodeId={id}
            loopNodeData={data}
          />
        )
      } */}

    </div>
  )
}

export default memo(Node)
