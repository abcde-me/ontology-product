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
import { useTranslation } from 'react-i18next'
import { IterationStartNodeDumb } from '../iteration-start'
import { useNodeIterationInteractions } from './use-interactions'
import type { IterationNodeType } from './types'
import AddBlock from './add-block'
import cn from '@/pages/workflowConfig/utils/classnames'
import type { NodeProps } from '@/pages/workflowConfig/workflow/types'
import Toast from '@/pages/workflowConfig/components/toast'

const i18nPrefix = 'workflow.nodes.iteration'

const Node: FC<NodeProps<IterationNodeType>> = ({
  id,
  data,
}) => {
  const { zoom } = useViewport()
  const nodesInitialized = useNodesInitialized()
  const { handleNodeIterationRerender } = useNodeIterationInteractions()
  const { t } = useTranslation('plugin__console-plugin-appforge')

  useEffect(() => {
    if (nodesInitialized)
      handleNodeIterationRerender(id)
    if (data.is_parallel && data._isShowTips) {
      Toast.notify({
        type: 'warning',
        message: t(`${i18nPrefix}.answerNodeWarningDesc`),
        duration: 5000,
      })
      data._isShowTips = false
    }
  }, [nodesInitialized, id, handleNodeIterationRerender, data, t])

  return (
    <div className={cn(
      'relative min-w-[240px] min-h-[90px] w-full h-full rounded-none bg-workflow-canvas-workflow-bg',
    )}>
      <Background
        id={`iteration-background-${id}`}
        className='rounded-none !z-0 -m-1'
        gap={[14 / zoom, 14 / zoom]}
        size={2 / zoom}
        color='var(--color-workflow-canvas-workflow-dot-color)'
      />
      {
        data._isCandidate && (
          <IterationStartNodeDumb />
        )
      }
      {/* {
        data._children!.length === 1 && (
          <AddBlock
            iterationNodeId={id}
            iterationNodeData={data}
          />
        )
      } */}
    </div>
  )
}

export default memo(Node)
