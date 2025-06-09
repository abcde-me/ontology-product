import { useEffect, useState } from 'react'

type Params = {
  ref: React.RefObject<HTMLDivElement>
  hasFooter?: boolean
  isInNode?: boolean
}

const useToggleExpend = ({ ref, hasFooter = true, isInNode }: Params) => {
  const [isExpand, setIsExpand] = useState(false)
  const [wrapHeight, setWrapHeight] = useState(ref.current?.clientHeight)
  const editorExpandHeight = isExpand ? wrapHeight! - (hasFooter ? 56 : 29) : 0
  useEffect(() => {
    setWrapHeight(ref.current?.clientHeight)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpand])

  const wrapClassName = (() => {
    if (!isExpand)
      return ''

    if (isInNode)
      return 'expanded-panel is-in-node fixed z-10 !w-[400px] right-[10px] top-[170px] bottom-[26px] p-[16px] pb-[0px] bg-white rounded-[0px]'

    return 'expanded-panel fixed z-10 !w-[400px] right-[10px] top-[170px] bottom-[10px] p-[16px] pb-[0px] bg-white rounded-[0px]'
  })()
  const wrapStyle = isExpand
    ? {
      boxShadow: '0px 0px 12px -4px rgba(16, 24, 40, 0.05), 0px -3px 6px -2px rgba(16, 24, 40, 0.03)',
    }
    : {}
  return {
    wrapClassName,
    wrapStyle,
    editorExpandHeight,
    isExpand,
    setIsExpand,
  }
}

export default useToggleExpend
