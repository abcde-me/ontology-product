// import ModelName from '../model-name'
import React from 'react'

type ModelDisplayProps = {
  currentModel: any
  modelId: string
}

const ModelDisplay = ({ currentModel, modelId }: ModelDisplayProps) => {
  return currentModel ? (
    // <ModelName
    //   className="flex px-1 py-[3px] items-center gap-1 grow"
    //   modelItem={currentModel}
    //   showMode
    //   showFeatures
    // />
    <div>{currentModel.label['zh_Hans'] || currentModel.label.en_US}</div>
  ) : (
    <div className="flex py-[3px] px-1 items-center gap-1 grow opacity-50 truncate">
      <div className="text-components-input-text-filled text-ellipsis overflow-hidden system-sm-regular">
        {modelId}
      </div>
    </div>
  )
}

export default ModelDisplay
