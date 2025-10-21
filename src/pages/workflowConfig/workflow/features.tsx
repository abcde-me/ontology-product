import React, { memo } from 'react'

const Features = () => {

  // const { handleAddVariable } = useConfig(id, data)

  // const handleAddOpeningStatementVariable = (variables: PromptVariable[]) => {
  //   const newVariable = variables[0]
  //   const startNodeVariable: InputVar = {
  //     variable: newVariable.key,
  //     label: newVariable.name,
  //     type: InputVarType.textInput,
  //     max_length: newVariable.max_length,
  //     required: newVariable.required || false,
  //     options: [],
  //   }
  //   handleAddVariable(startNodeVariable)
  // }

  return (
    // <NewFeaturePanel
    //   show
    //   isChatMode={isChatMode}
    //   disabled={nodesReadOnly}
    //   onChange={handleFeaturesChange}
    //   onClose={() => setShowFeaturesPanel(false)}
    //   onAutoAddPromptVariable={handleAddOpeningStatementVariable}
    //   workflowVariables={data.variables}
    // />
    <div>new features panel</div>
  )
}

export default memo(Features)
