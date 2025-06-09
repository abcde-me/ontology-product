import { FC, useCallback } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import MemoryConfig from '../_base/components/memory-config'
import VarReferencePicker from '../_base/components/variable/var-reference-picker'
import ConfigVision from '../_base/components/config-vision'
import useConfig from './use-config'
import { findVariableWhenOnLLMVision } from '../utils'
import type { LLMNodeType } from './types'
import ConfigPrompt from './components/config-prompt'
import VarList from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/var-list'
import AddButton2 from '@/pages/workflowConfig/components/button/add-button'
import Field from '@/pages/workflowConfig/workflow/nodes/_base/components/field'
import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split'
import ModelParameterModal from '@/pages/workflowConfig/app/model-parameter-modal'
import OutputVars, { VarItem } from '@/pages/workflowConfig/workflow/nodes/_base/components/output-vars'
import { InputVarType, type NodePanelProps } from '@/pages/workflowConfig/workflow/types'
import BeforeRunForm from '@/pages/workflowConfig/workflow/nodes/_base/components/before-run-form'
import type { Props as FormProps } from '@/pages/workflowConfig/workflow/nodes/_base/components/before-run-form/form'
import ResultPanel from '@/pages/workflowConfig/workflow/run/result-panel'
import Tooltip from '@/pages/workflowConfig/components/tooltip'
import Editor from '@/pages/workflowConfig/workflow/nodes/_base/components/prompt/editor'
import { aiGenerate } from '@/api/appsV2'

const i18nPrefix = 'workflow.nodes.llm'

const Panel: FC<NodePanelProps<LLMNodeType>> = ({
  id,
  data,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const {
    readOnly,
    inputs,
    isChatModel,
    isChatMode,
    isCompletionModel,
    shouldShowContextTip,
    isVisionModel,
    handleModelChanged,
    hasSetBlockStatus,
    handleCompletionParamsChange,
    handleContextVarChange,
    filterInputVar,
    filterVar,
    availableVars,
    availableNodesWithParent,
    isShowVars,
    handlePromptChange,
    handleAddEmptyVariable,
    handleAddVariable,
    handleVarListChange,
    handleVarNameChange,
    handleSyeQueryChange,
    handleMemoryChange,
    handleVisionResolutionEnabledChange,
    handleVisionResolutionChange,
    isShowSingleRun,
    hideSingleRun,
    inputVarValues,
    setInputVarValues,
    visionFiles,
    setVisionFiles,
    contexts,
    setContexts,
    runningStatus,
    handleRun,
    handleStop,
    varInputs,
    runResult,
    filterJinjia2InputVar,
  } = useConfig(id, data)

  const model = inputs.model

  const singleRunForms = (() => {
    const forms: FormProps[] = []

    if (varInputs.length > 0) {
      forms.push(
        {
          label: t(`${i18nPrefix}.singleRun.variable`)!,
          inputs: varInputs,
          values: inputVarValues,
          onChange: setInputVarValues,
        },
      )
    }

    if (inputs.context?.variable_selector && inputs.context?.variable_selector.length > 0) {
      forms.push(
        {
          label: t(`${i18nPrefix}.context`)!,
          inputs: [{
            label: '',
            variable: '#context#',
            type: InputVarType.contexts,
            required: false,
          }],
          values: { '#context#': contexts },
          onChange: keyValue => setContexts((keyValue as any)['#context#']),
        },
      )
    }

    if (isVisionModel && data.vision.enabled && data.vision.configs?.variable_selector) {
      const currentVariable = findVariableWhenOnLLMVision(data.vision.configs.variable_selector, availableVars)

      forms.push(
        {
          label: t(`${i18nPrefix}.vision`)!,
          inputs: [{
            label: currentVariable?.variable as any,
            variable: '#files#',
            type: currentVariable?.formType as any,
            required: false,
          }],
          values: { '#files#': visionFiles },
          onChange: keyValue => setVisionFiles((keyValue as any)['#files#']),
        },
      )
    }

    return forms
  })()

  const generatePrompt = useCallback(async () => {
    const result = await aiGenerate({
      app_name: data.title,
      app_description: data.desc,
      type: 'pre_prompt',
      pre_prompt: data.prompt_template[0].text,
      stream: false
    })
    return result.data
  }, [data.title, data.desc, data.prompt_template[0].text])

  return (
    // <div className='mt-2'>
    //   <div className='px-4 pb-4 space-y-4'>
    //     <Field
    //       title={t(`${i18nPrefix}.model`)}
    //     >
    //       <ModelParameterModal
    //         popupClassName='!w-[387px]'
    //         isInWorkflow
    //         isAdvancedMode={false}
    //         mode={model?.mode}
    //         provider={model?.provider}
    //         completionParams={model?.completion_params}
    //         modelId={model?.name}
    //         setModel={handleModelChanged}
    //         onCompletionParamsChange={handleCompletionParamsChange}
    //         hideDebugWithMultipleModel
    //         debugWithMultipleModel={false}
    //         readonly={readOnly}
    //         showMode={false}
    //         showFeatures={false}
    //       />
    //     </Field>

    //     {/* knowledge */}
    //     <Field
    //       title={t(`${i18nPrefix}.context`)}
    //       tooltip={t(`${i18nPrefix}.contextTooltip`)!}
    //     >
    //       <>
    //         <VarReferencePicker
    //           readonly={readOnly}
    //           nodeId={id}
    //           isShowNodeName
    //           value={inputs.context?.variable_selector || []}
    //           onChange={handleContextVarChange}
    //           filterVar={filterVar}
    //         />
    //         {shouldShowContextTip && (
    //           <div className='leading-[18px] text-xs font-normal text-[#DC6803]'>{t(`${i18nPrefix}.notSetContextInPromptTip`)}</div>
    //         )}
    //       </>
    //     </Field>

    //     {/* Prompt */}
    //     {model.name && (
    //       <Field
    //         title="提示词"
    //       >
    //         <ConfigPrompt
    //           readOnly={readOnly}
    //           nodeId={id}
    //           filterVar={filterInputVar}
    //           isChatModel={isChatModel}
    //           isChatApp={isChatMode}
    //           isShowContext
    //           payload={inputs.prompt_template}
    //           onChange={handlePromptChange}
    //           hasSetBlockStatus={hasSetBlockStatus}
    //           varList={inputs.prompt_config?.jinja2_variables || []}
    //           handleAddVariable={handleAddVariable}
    //           modelConfig={model}
    //         />
    //       </Field>
    //     )}

    //     {isShowVars && (
    //       <Field
    //         title={t('workflow.nodes.templateTransform.inputVars')}
    //         operations={
    //           !readOnly ? <AddButton2 onClick={handleAddEmptyVariable} /> : undefined
    //         }
    //       >
    //         <VarList
    //           nodeId={id}
    //           readonly={readOnly}
    //           list={inputs.prompt_config?.jinja2_variables || []}
    //           onChange={handleVarListChange}
    //           onVarNameChange={handleVarNameChange}
    //           filterVar={filterJinjia2InputVar}
    //           isSupportFileVar={false}
    //         />
    //       </Field>
    //     )}

    //     {/* Memory put place examples. */}
    //     {isChatMode && isChatModel && !!inputs.memory && (
    //       <div className='mt-4'>
    //         <div className='flex justify-between items-center h-8 pl-3 pr-2 rounded-lg bg-gray-100'>
    //           <div className='flex items-center space-x-1'>
    //             <div className='text-xs font-semibold text-gray-700 uppercase'>{t('workflow.nodes.common.memories.title')}</div>
    //             <Tooltip
    //               popupContent={t('workflow.nodes.common.memories.tip')}
    //               triggerClassName='w-4 h-4'
    //             />
    //           </div>
    //           <div className='flex items-center h-[18px] px-1 rounded-[5px] border border-black/8 text-xs font-semibold text-gray-500 uppercase'>{t('workflow.nodes.common.memories.builtIn')}</div>
    //         </div>
    //         {/* Readonly User Query */}
    //         <div className='mt-4'>
    //           <Editor
    //             title={<div className='flex items-center space-x-1'>
    //               <div className='text-xs font-semibold text-gray-700 uppercase'>user</div>
    //               <Tooltip
    //                 popupContent={
    //                   <div className='max-w-[180px]'>{t('workflow.nodes.llm.roleDescription.user')}</div>
    //                 }
    //                 triggerClassName='w-4 h-4'
    //               />
    //             </div>}
    //             value={inputs.memory.query_prompt_template || '{{#sys.query#}}'}
    //             onChange={handleSyeQueryChange}
    //             readOnly={readOnly}
    //             isShowContext={false}
    //             isChatApp
    //             isChatModel
    //             hasSetBlockStatus={hasSetBlockStatus}
    //             nodesOutputVars={availableVars}
    //             availableNodes={availableNodesWithParent}
    //             isSupportFileVar
    //           />

    //           {inputs.memory.query_prompt_template && !inputs.memory.query_prompt_template.includes('{{#sys.query#}}') && (
    //             <div className='leading-[18px] text-xs font-normal text-[#DC6803]'>{t(`${i18nPrefix}.sysQueryInUser`)}</div>
    //           )}
    //         </div>
    //       </div>
    //     )}

    //     {/* Memory */}
    //     {isChatMode && (
    //       <>
    //         <Split />
    //         <MemoryConfig
    //           readonly={readOnly}
    //           config={{ data: inputs.memory }}
    //           onChange={handleMemoryChange}
    //           canSetRoleName={isCompletionModel}
    //         />
    //       </>
    //     )}

    //     {/* Vision: GPT4-vision and so on */}
    //     <ConfigVision
    //       nodeId={id}
    //       readOnly={readOnly}
    //       isVisionModel={isVisionModel}
    //       enabled={inputs.vision?.enabled}
    //       onEnabledChange={handleVisionResolutionEnabledChange}
    //       config={inputs.vision?.configs}
    //       onConfigChange={handleVisionResolutionChange}
    //     />
    //   </div>
    //   <Split />
    //   <OutputVars>
    //     <>
    //       <VarItem
    //         name='text'
    //         type='string'
    //         description={t(`${i18nPrefix}.outputVars.output`)}
    //       />
    //     </>
    //   </OutputVars>
    //   {isShowSingleRun && (
    //     <BeforeRunForm
    //       nodeName={inputs.title}
    //       nodeType={inputs.type}
    //       onHide={hideSingleRun}
    //       forms={singleRunForms}
    //       runningStatus={runningStatus}
    //       onRun={handleRun}
    //       onStop={handleStop}
    //       result={<ResultPanel {...runResult} showSteps={false} />}
    //     />
    //   )}
    // </div>
    <div className='mt-[16px] wk-node-panel-content llm-panel-content'>
      <div className='mb-[8px] title-txt'>模型</div>
      <ModelParameterModal
        popupClassName='!w-full'
        isInWorkflow
        isAdvancedMode={false}
        mode={model?.mode}
        provider={model?.provider}
        completionParams={model?.completion_params}
        modelId={model?.name}
        setModel={handleModelChanged}
        onCompletionParamsChange={handleCompletionParamsChange}
        hideDebugWithMultipleModel
        debugWithMultipleModel={false}
        readonly={readOnly}
        showMode={false}
        showFeatures={false}
      />
      <Split className='my-[16px]' />
      <div className='mb-[16px] title-txt flex items-center'>
        <span>{t(`${i18nPrefix}.context`)}</span>
        <Tooltip
          popupContent={t(`${i18nPrefix}.contextTooltip`)!}
          popupClassName='ml-1'
          triggerClassName='w-4 h-4 ml-1'
        />
      </div>
      <div>
        <VarReferencePicker
          readonly={readOnly}
          nodeId={id}
          isShowNodeName
          value={inputs.context?.variable_selector || []}
          onChange={handleContextVarChange}
          filterVar={filterVar}
        />
        {shouldShowContextTip && (
          <div className='leading-[18px] text-xs font-normal text-[#DC6803]'>{t(`${i18nPrefix}.notSetContextInPromptTip`)}</div>
        )}
      </div>
      <Split className='my-[16px]' />
      {/* <div className='mb-[8px] title-txt'>提示词</div> */}
      <ConfigPrompt
        readOnly={readOnly}
        nodeId={id}
        filterVar={filterInputVar}
        isChatModel={isChatModel}
        isChatApp={isChatMode}
        isShowContext
        payload={inputs.prompt_template}
        onChange={handlePromptChange}
        hasSetBlockStatus={hasSetBlockStatus}
        varList={inputs.prompt_config?.jinja2_variables || []}
        handleAddVariable={handleAddVariable}
        modelConfig={model}
        promptGenerator={generatePrompt}
      />
      <Split className='my-[16px]' />
      <div className='mb-[8px] title-txt'>输出</div>
      <VarItem
        name='text'
        type='string'
        description={t(`${i18nPrefix}.outputVars.output`)}
      />
    </div>
  )
}

export default React.memo(Panel)
