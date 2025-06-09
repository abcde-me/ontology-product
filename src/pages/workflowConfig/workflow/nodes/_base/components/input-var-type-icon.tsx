
import type { FC } from 'react'
import React from 'react'
import { RiAlignLeft, RiCheckboxMultipleLine, RiFileCopy2Line, RiFileList2Line, RiHashtag, RiTextSnippet } from '@remixicon/react'
import { InputVarType } from '../../../types'

type Props = {
  className?: string
  type: InputVarType,
  isTag?: boolean
}

const getIcon = (type: InputVarType) => {
  return ({
    [InputVarType.textInput]: RiTextSnippet,
    [InputVarType.paragraph]: RiAlignLeft,
    [InputVarType.select]: RiCheckboxMultipleLine,
    [InputVarType.number]: RiHashtag,
    [InputVarType.singleFile]: RiFileList2Line,
    [InputVarType.multiFiles]: RiFileCopy2Line,
  } as any)[type] || RiTextSnippet
}

const getTypeStr = (type: InputVarType) => {
  return ({
    [InputVarType.textInput]: 'String',
    [InputVarType.paragraph]: 'Text',
    [InputVarType.select]: 'Select',
    [InputVarType.number]: 'Number',
    [InputVarType.singleFile]: 'File',
    [InputVarType.multiFiles]: 'Files',
  } as any)[type] || RiTextSnippet
}

const InputVarTypeIcon: FC<Props> = ({
  className,
  type,
  isTag = false
}) => {
  const Icon = getIcon(type)
  const str = getTypeStr(type)
  return (
    isTag ?
      <div className='bg-[#E7ECF0] rounded-[4px] py-[2px] px-[4px] text-[#7F8C9F] text-[10px]/[12px]'>{str}</div>
      :
      <Icon className={className} />
  )
}
export default React.memo(InputVarTypeIcon)
