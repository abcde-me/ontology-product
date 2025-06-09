import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useConfig from './use-config'
import type { EndNodeType } from './types'
import VarList from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/var-list'
import Field from '@/pages/workflowConfig/workflow/nodes/_base/components/field'
import AddButton from '@/pages/workflowConfig/components/button/add-button'
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types'
import { IconPlus } from '@arco-design/web-react/icon'

const i18nPrefix = 'workflow.nodes.end'

const Panel: FC<NodePanelProps<EndNodeType>> = ({
  id,
  data,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const {
    readOnly,
    inputs,
    handleVarListChange,
    handleAddVariable,
  } = useConfig(id, data)

  const outputs = inputs.outputs
  return (
    // <div className='mt-2'>
    //   <div className='px-4 pb-4 space-y-4'>

    //     <Field
    //       title={t(`${i18nPrefix}.output.variable`)}
    //       operations={
    //         !readOnly ? <AddButton onClick={handleAddVariable} /> : undefined
    //       }
    //     >
    //       <VarList
    //         nodeId={id}
    //         readonly={readOnly}
    //         list={outputs}
    //         onChange={handleVarListChange}
    //       />
    //     </Field>
    //   </div>
    // </div>
    <div className='mt-[16px] wk-node-panel-content end-panel-content'>
      <div className='mb-[16px] title-txt'>输出变量</div>
      <VarList
        nodeId={id}
        readonly={readOnly}
        list={outputs}
        onChange={handleVarListChange}
      />
      {!readOnly && <div className='add-btn w-full mt-[16px]' onClick={handleAddVariable}>
          <IconPlus className='size-[14px] mr-[4px] text-[#979797]'/>添加
        </div>
      }
    </div>
  )
}

export default React.memo(Panel)
