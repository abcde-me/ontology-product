import React, {
  memo,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useNodes } from 'reactflow'
import { ComparisonOperator } from '../types'
import {
  comparisonOperatorNotRequireValue,
  isComparisonOperatorNeedTranslate,
} from '../utils'
import { FILE_TYPE_OPTIONS, TRANSFER_METHOD } from '../../constants'
// import { Variable02 } from '@/app/components/base/icons/src/vender/solid/development'
// import { BubbleX, Env } from '@/app/components/base/icons/src/vender/line/others'
import cn from '@/pages/workflowConfig/utils/classnames'
import { isConversationVar, isENV, isSystemVar } from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/utils'
import { isExceptionVariable } from '@/pages/workflowConfig/workflow/utils'
import type {
  CommonNodeType,
  Node,
} from '@/pages/workflowConfig/workflow/types'

type ConditionValueProps = {
  variableSelector: string[]
  labelName?: string
  operator: ComparisonOperator
  value: string | string[]
}
const ConditionValue = ({
  variableSelector,
  labelName,
  operator,
  value,
}: ConditionValueProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const nodes = useNodes()
  const variableName = labelName || (isSystemVar(variableSelector) ? variableSelector.slice(0).join('.') : variableSelector.slice(1).join('.'))
  // const operatorName = isComparisonOperatorNeedTranslate(operator) ? t(`workflow.nodes.ifElse.comparisonOperator.${operator}`) : operator
  const operatorName = t(`workflow.nodes.ifElse.comparisonOperator.${operator}`)
  const notHasValue = comparisonOperatorNotRequireValue(operator)
  const isEnvVar = isENV(variableSelector)
  const isChatVar = isConversationVar(variableSelector)
  const node: Node<CommonNodeType> | undefined = nodes.find(n => n.id === variableSelector[0]) as Node<CommonNodeType>
  const isException = isExceptionVariable(variableName, node?.data.type)
  const formatValue = useMemo(() => {
    if (notHasValue)
      return ''

    if (Array.isArray(value)) // transfer method
      return value[0]

    return value.replace(/{{#([^#]*)#}}/g, (a, b) => {
      const arr: string[] = b.split('.')
      if (isSystemVar(arr))
        return `{{${b}}}`

      return `{{${arr.slice(1).join('.')}}}`
    })
  }, [notHasValue, value])

  const isSelect = operator === ComparisonOperator.in || operator === ComparisonOperator.notIn
  const selectName = useMemo(() => {
    if (isSelect) {
      const name = [...FILE_TYPE_OPTIONS, ...TRANSFER_METHOD].filter(item => item.value === (Array.isArray(value) ? value[0] : value))[0]
      return name
        ? t(`workflow.nodes.ifElse.optionName.${name.i18nKey}`).replace(/{{#([^#]*)#}}/g, (a, b) => {
          const arr: string[] = b.split('.')
          if (isSystemVar(arr))
            return `{{${b}}}`

          return `{{${arr.slice(1).join('.')}}}`
        })
        : ''
    }
    return ''
  }, [isSelect, t, value])

  return (
    <>
      <span className='key-txt shrink-0'>
        <span className='node-type'>{node?.data.title}</span>
        <span className='node-name-separator'>/</span>
        <span className='var-name'>{variableName}</span>
      </span>
      <span className='node-type shrink-0'>{operatorName}</span>
      {!notHasValue && <span className='node-value truncate' title={formatValue}>{isSelect ? selectName : formatValue}</span>}
    </>
    // <div className='flex items-center px-1 h-6 rounded-md'>
    //   <div
    //     className={cn(
    //       'shrink-0 ml-0.5 truncate text-xs font-medium text-text-accent name',
    //       !notHasValue && 'max-w-[70px]',
    //       isException && 'text-text-warning',
    //     )}
    //     title={variableName}
    //   >
    //     {variableName}
    //   </div>
    //   <div
    //     className='shrink-0 mx-1 text-xs font-medium text-text-primary'
    //     title={operatorName}
    //   >
    //     {operatorName}
    //   </div>
    //   {
    //     !notHasValue && (
    //       <div className='truncate text-xs text-text-secondary' title={formatValue}>{isSelect ? selectName : formatValue}</div>
    //     )
    //   }
    // </div>
  )
}

export default memo(ConditionValue)
