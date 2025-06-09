import type { FC, ReactNode } from 'react'
import React, { useCallback, useRef } from 'react'
import copy from 'copy-to-clipboard'
import { IconExpand, IconShrink } from '@arco-design/web-react/icon'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'ahooks'
import { BlockEnum, EditionType } from '../../../../types'
import type {
  ModelConfig,
  Node,
  NodeOutPutVar,
  Variable,
} from '../../../../types'

import Wrap from '../editor/wrap'
import { CodeLanguage } from '../../../code/types'
import PromptGeneratorBtn from '../../../llm/components/prompt-generator-btn'
import cn from '@/pages/workflowConfig/utils/classnames'
import ToggleExpandBtn from '@/pages/workflowConfig/workflow/nodes/_base/components/toggle-expand-btn'
import useToggleExpend from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-toggle-expend'
import PromptEditor from '@/pages/workflowConfig/components/prompt-editor'
import {
  RiDeleteBinLine,
  RiClipboardLine,
  RiClipboardFill,
  RiBracesLine
} from '@remixicon/react'
import s from '@/pages/workflowConfig/app/config-prompt/style.module.css'
import { useEventEmitterContextContext } from '@/pages/workflowConfig/context/event-emitter'
import { PROMPT_EDITOR_INSERT_QUICKLY } from '@/pages/workflowConfig/components/prompt-editor/plugins/update-block'
// import { Variable02 } from '@/app/components/base/icons/src/vender/solid/development'
import ActionButton from '@/pages/workflowConfig/components/action-button'
import Tooltip from '@/pages/workflowConfig/components/tooltip'
import CodeEditor from '@/pages/workflowConfig/workflow/nodes/_base/components/editor/code-editor/editor-support-vars'
// import Switch from '@/app/components/base/switch'
// import { Jinja } from '@/app/components/base/icons/src/vender/workflow'
import { useStore } from '@/pages/workflowConfig/workflow/store'
import AiGenerateIcon from '@/pages/workflowConfig/styles/images/op-icons/ai-gen.svg'
import VarIcon from '@/pages/workflowConfig/styles/images/op-icons/var.svg'

type Props = {
  label?: string
  className?: string
  headerClassName?: string
  instanceId?: string
  title?: string | JSX.Element
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  showRemove?: boolean
  onRemove?: () => void
  justVar?: boolean
  isChatModel?: boolean
  isChatApp?: boolean
  isShowContext?: boolean
  hasSetBlockStatus?: {
    context: boolean
    history: boolean
    query: boolean
  }
  nodesOutputVars?: NodeOutPutVar[]
  availableNodes?: Node[]
  isSupportFileVar?: boolean
  isSupportPromptGenerator?: boolean
  onGenerated?: (prompt: string) => void
  modelConfig?: ModelConfig
  // for jinja
  isSupportJinja?: boolean
  editionType?: EditionType
  onEditionTypeChange?: (editionType: EditionType) => void
  varList?: Variable[]
  handleAddVariable?: (payload: any) => void
  containerBackgroundClassName?: string
  containerWrapperClassName?: string
  gradientBorder?: boolean
  titleTooltip?: ReactNode
  inputClassName?: string
  editorContainerClassName?: string
  placeholderClassName?: string
  placeholder?: string
  titleClassName?: string
  required?: boolean
  promptGenerator?: () => Promise<string>
  showAIGenerator?: boolean
}

const Editor: FC<Props> = ({
  label = '提示词',
  className,
  headerClassName,
  instanceId,
  title,
  value,
  onChange,
  readOnly,
  showRemove,
  onRemove,
  justVar,
  isChatModel,
  isChatApp,
  isShowContext,
  hasSetBlockStatus,
  nodesOutputVars,
  availableNodes = [],
  isSupportFileVar,
  isSupportPromptGenerator,
  isSupportJinja,
  editionType,
  onEditionTypeChange,
  varList = [],
  handleAddVariable,
  onGenerated,
  modelConfig,
  containerBackgroundClassName: containerClassName,
  containerWrapperClassName,
  gradientBorder = true,
  titleTooltip,
  inputClassName,
  placeholder,
  placeholderClassName,
  titleClassName,
  editorContainerClassName,
  required,
  promptGenerator,
  showAIGenerator = true,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const { eventEmitter } = useEventEmitterContextContext()
  const controlPromptEditorRerenderKey = useStore(s => s.controlPromptEditorRerenderKey)

  const isShowHistory = !isChatModel && isChatApp

  const ref = useRef<HTMLDivElement>(null)
  const {
    wrapClassName,
    wrapStyle,
    isExpand,
    setIsExpand,
    editorExpandHeight,
  } = useToggleExpend({ ref, isInNode: true })
  const [isCopied, setIsCopied] = React.useState(false)
  const handleCopy = useCallback(() => {
    copy(value)
    setIsCopied(true)
  }, [value])

  const [isFocus, {
    setTrue: setFocus,
    setFalse: setBlur,
  }] = useBoolean(false)

  const handleInsertVariable = () => {
    setFocus()
    eventEmitter?.emit({ type: PROMPT_EDITOR_INSERT_QUICKLY, instanceId } as any)
  }

  const generatePrompt = async() => {
    if (promptGenerator) {
      const prompt = await promptGenerator()
      onGenerated(prompt)
    }
  }

  return (
    <Wrap className={cn(className, wrapClassName)} style={wrapStyle} isInNode isExpand={isExpand}>
      <div ref={ref} className={cn('bg-gray-100', isExpand && 'h-full', 'prompt-editor-wrapper', containerWrapperClassName)}>
        <div className={cn(isFocus ? 'bg-gray-50' : 'bg-gray-100', isExpand && 'h-full flex flex-col', 'prompt-editor', containerClassName)}>
          <div className={cn('flex justify-between items-center prompt-editor-header', headerClassName)}>
            <span className='prompt-label'>{label}</span>
            <div className='prompt-operations *:size-[16px]'>
              {!readOnly && showAIGenerator && (
                <Tooltip
                  popupContent={`提示词优化`}
                >
                  {isSupportPromptGenerator && <AiGenerateIcon onClick={generatePrompt}/>}
                </Tooltip>
              )}
              {!readOnly && (
                <Tooltip
                  popupContent={`${t('workflow.common.insertVarTip')}`}
                >
                  <VarIcon className='size-[16px]' onClick={handleInsertVariable}/>
                </Tooltip>
              )}
              {isExpand ? <IconShrink onClick={() => setIsExpand(false)}/> : <IconExpand onClick={() => setIsExpand(true)}/>}
            </div>
          </div>

          {/* Min: 80 Max: 560. Header: 24 */}
          <div className={cn('pb-2 prompt-editor-content', isExpand && 'flex flex-col grow')}>
            {!(isSupportJinja && editionType === EditionType.jinja2)
              ? (
                <div className={cn(isExpand ? 'grow' : 'max-h-[536px]', 'relative p-[8px] min-h-[56px]  overflow-y-auto', editorContainerClassName)}>
                  <PromptEditor
                    key={controlPromptEditorRerenderKey}
                    placeholder={placeholder}
                    placeholderClassName={placeholderClassName}
                    instanceId={instanceId}
                    compact
                    className={cn('min-h-[56px]', inputClassName)}
                    style={isExpand ? { height: editorExpandHeight - 5 } : {}}
                    value={value}
                    contextBlock={{
                      show: justVar ? false : isShowContext,
                      selectable: !hasSetBlockStatus?.context,
                      canNotAddContext: true,
                    }}
                    historyBlock={{
                      show: justVar ? false : isShowHistory,
                      selectable: !hasSetBlockStatus?.history,
                      history: {
                        user: 'Human',
                        assistant: 'Assistant',
                      },
                    }}
                    queryBlock={{
                      show: false, // use [sys.query] instead of query block
                      selectable: false,
                    }}
                    workflowVariableBlock={{
                      show: true,
                      variables: nodesOutputVars || [],
                      workflowNodesMap: availableNodes.reduce((acc, node) => {
                        acc[node.id] = {
                          title: node.data.title,
                          type: node.data.type,
                        }
                        if (node.data.type === BlockEnum.Start) {
                          acc.sys = {
                            title: t('workflow.blocks.start'),
                            type: BlockEnum.Start,
                          }
                        }
                        return acc
                      }, {} as any),
                    }}
                    onChange={onChange}
                    onBlur={setBlur}
                    onFocus={setFocus}
                    editable={!readOnly}
                    isSupportFileVar={isSupportFileVar}
                  />
                  {/* to patch Editor not support dynamic change editable status */}
                  {readOnly && <div className='absolute inset-0 z-10'></div>}
                </div>
              )
              : (
                <div className={cn(isExpand ? 'grow' : 'max-h-[536px]', 'relative px-3 min-h-[56px]  overflow-y-auto', editorContainerClassName)}>
                  <CodeEditor
                    availableVars={nodesOutputVars || []}
                    varList={varList}
                    onAddVar={handleAddVariable}
                    isInNode
                    readOnly={readOnly}
                    language={CodeLanguage.python3}
                    value={value}
                    onChange={onChange}
                    noWrapper
                    isExpand={isExpand}
                    className={inputClassName}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </Wrap>

  )
}
export default React.memo(Editor)
