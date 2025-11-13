import { useMemo } from 'react'
import { useGetLanguage } from '@/pages/workflowConfig/context/i18n'
import { BlockEnum } from '@/pages/workflowConfig/workflow/types'

export const useNodeHelpLink = (nodeType: BlockEnum) => {
  const language = useGetLanguage()
  const prefixLink = useMemo(() => {
    if (language === 'zh_Hans')
      return 'https://docs.dify.ai/v/zh-hans/guides/workflow/node/'

    return 'https://docs.dify.ai/guides/workflow/node/'
  }, [language])
  const linkMap = useMemo(() => {
    if (language === 'zh_Hans') {
      return {
        [BlockEnum.Start]: 'start',
        [BlockEnum.End]: 'end',
      }
    }

    return {
      [BlockEnum.Start]: 'start',
      [BlockEnum.End]: 'end',
    }
  }, [language])

  return `${prefixLink}${linkMap[nodeType]}`
}
