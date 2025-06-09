
import type { FC } from 'react'
import React, { useCallback, useRef, useState } from 'react'
import copy from 'copy-to-clipboard'
import ToggleExpandBtn from '../toggle-expand-btn'
import CodeGeneratorButton from '../code-generator-button'
import type { CodeLanguage } from '../../../code/types'
import Wrap from './wrap'
import cn from '@/pages/workflowConfig/utils/classnames'
import PromptEditorHeightResizeWrap from '@/pages/workflowConfig/app/config-prompt/prompt-editor-height-resize-wrap'
import {
  RiClipboardLine,
  RiClipboardFill,
} from '@remixicon/react'
import useToggleExpend from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-toggle-expend'
import type { FileEntity } from '@/pages/workflowConfig/components/file-uploader/types'
import FileListInLog from '@/pages/workflowConfig/components/file-uploader/file-list-in-log'
import { IconCopy, IconExpand, IconShrink } from '@arco-design/web-react/icon'
import { Message, Tooltip } from '@arco-design/web-react'

interface Props {
  className?: string
  title: JSX.Element | string
  headerRight?: JSX.Element
  children: JSX.Element
  minHeight?: number
  value: string
  isFocus: boolean
  isInNode?: boolean
  onGenerated?: (prompt: string) => void
  codeLanguages?: CodeLanguage
  fileList?: {
    varName: string
    list: FileEntity[]
  }[]
  showFileList?: boolean
  showCodeGenerator?: boolean
  tip?: JSX.Element
}

const Base: FC<Props> = ({
  className,
  title,
  headerRight,
  children,
  minHeight = 120,
  value,
  isFocus,
  isInNode,
  onGenerated,
  codeLanguages,
  fileList = [],
  showFileList,
  showCodeGenerator = false,
  tip,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const {
    wrapClassName,
    wrapStyle,
    isExpand,
    setIsExpand,
    editorExpandHeight,
  } = useToggleExpend({ ref, hasFooter: false, isInNode })

  const editorContentMinHeight = minHeight - 28
  const [editorContentHeight, setEditorContentHeight] = useState(editorContentMinHeight)

  const [isCopied, setIsCopied] = React.useState(false)
  const handleCopy = useCallback(() => {
    copy(value)
    Message.success('复制成功')
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }, [value])

  return (
    <Wrap className={cn(wrapClassName)} style={wrapStyle} isInNode={isInNode} isExpand={isExpand}>
      <div ref={ref} className={cn(className, isExpand && 'h-full', 'rounded-[4px] border code-editor', isFocus ? 'bg-components-input-bg-normal border-transparent' : 'bg-components-input-bg-hover border-components-input-border-hover overflow-hidden')}>
        <div className='flex justify-between items-center h-7 pt-1 pl-3 pr-2 editor-header'>
          <div className='system-xs-semibold text-text-secondary'>{title}</div>
          <div className='flex items-center' onClick={(e) => {
            e.nativeEvent.stopImmediatePropagation()
            e.stopPropagation()
          }}>
            {headerRight}
            {showCodeGenerator && codeLanguages && (
              <div className='ml-1'>
                <CodeGeneratorButton onGenerated={onGenerated} codeLanguages={codeLanguages}/>
              </div>
            )}
            {/* {!isCopied
              ? (
                <RiClipboardLine className='mx-1 w-3.5 h-3.5 text-text-tertiary cursor-pointer' onClick={handleCopy} />
              )
              : (
                <RiClipboardFill className='mx-1 w-3.5 h-3.5 text-text-tertiary' />
              )
            } */}
            <Tooltip content="复制">
              <div className='op-icon'>
                <IconCopy className='mx-1 w-[16px] h-[16px] text-text-tertiary cursor-pointer' onClick={handleCopy} />
              </div>
            </Tooltip>
            

            {/* <div className='ml-1 expand-btn'>
              <ToggleExpandBtn isExpand={isExpand} onExpandChange={setIsExpand} />
            </div> */}
            <Tooltip content={isExpand ? "缩小" : "放大"}>
              <div className='op-icon ml-1'>
                {isExpand  ? <IconShrink onClick={() => setIsExpand(false)}/> : <IconExpand onClick={() => setIsExpand(true)}/>}
              </div>
            </Tooltip>
          </div>
        </div>
        {tip && <div className='px-1 py-0.5'>{tip}</div>}
        <PromptEditorHeightResizeWrap
          height={isExpand ? editorExpandHeight : editorContentHeight}
          minHeight={editorContentMinHeight}
          onHeightChange={setEditorContentHeight}
          hideResize={isExpand}
        >
          <div className='h-full pb-2'>
            {children}
          </div>
        </PromptEditorHeightResizeWrap>
        {showFileList && fileList.length > 0 && (
          <FileListInLog fileList={fileList} />
        )}
      </div>
    </Wrap>
  )
}
export default React.memo(Base)
