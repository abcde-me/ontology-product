import type { ThoughtItem } from '@/pages/workflowConfig/chat/chat/type'
import type { FileEntity } from '@/pages/workflowConfig/components/file-uploader/types'
import type { VisionFile } from '@/pages/workflowConfig/types/app'

export const sortAgentSorts = (list: ThoughtItem[]) => {
  if (!list)
    return list
  if (list.some(item => item.position === undefined))
    return list
  const temp = [...list]
  temp.sort((a, b) => a.position - b.position)
  return temp
}

export const addFileInfos = (list: ThoughtItem[], messageFiles: (FileEntity | VisionFile)[]) => {
  if (!list || !messageFiles)
    return list
  return list.map((item) => {
    if (item.files && item.files?.length > 0) {
      return {
        ...item,
        message_files: item.files.map(fileId => messageFiles.find(file => file.id === fileId)) as FileEntity[],
      }
    }
    return item
  })
}
