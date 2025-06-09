import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import RemoveEffectVarConfirm from '../_base/components/remove-effect-var-confirm'
import useConfig from './use-config'
import type { CodeNodeType } from './types'
import { CodeLanguage } from './types'
import { extractFunctionParams, extractReturnType } from './code-parser'
import VarList from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/var-list'
import OutputVarList from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/output-var-list'
import AddButton from '@/pages/workflowConfig/components/button/add-button'
import Field from '@/pages/workflowConfig/workflow/nodes/_base/components/field'
import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split'
import CodeEditor from '@/pages/workflowConfig/workflow/nodes/_base/components/editor/code-editor'
import TypeSelector from '@/pages/workflowConfig/workflow/nodes/_base/components/selector'
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types'
import BeforeRunForm from '@/pages/workflowConfig/workflow/nodes/_base/components/before-run-form'
import ResultPanel from '@/pages/workflowConfig/workflow/run/result-panel'
import { Tooltip } from '@arco-design/web-react'
import { RiAddLine } from '@remixicon/react'
const i18nPrefix = 'workflow.nodes.code'

const codeLanguages = [
  {
    label: 'Python3',
    value: CodeLanguage.python3,
  },
  {
    label: 'JavaScript',
    value: CodeLanguage.javascript,
  },
]
const Panel: FC<NodePanelProps<CodeNodeType>> = ({
  id,
  data,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const {
    readOnly,
    inputs,
    outputKeyOrders,
    handleCodeAndVarsChange,
    handleVarListChange,
    handleAddVariable,
    handleRemoveVariable,
    handleCodeChange,
    handleCodeLanguageChange,
    handleVarsChange,
    handleAddOutputVariable,
    filterVar,
    isShowRemoveVarConfirm,
    hideRemoveVarConfirm,
    onRemoveVarConfirm,
    // single run
    isShowSingleRun,
    hideSingleRun,
    runningStatus,
    handleRun,
    handleStop,
    runResult,
    varInputs,
    inputVarValues,
    setInputVarValues,
  } = useConfig(id, data)

  const handleGeneratedCode = (value: string) => {
    const params = extractFunctionParams(value, inputs.code_language)
    const codeNewInput = params.map((p) => {
      return {
        variable: p,
        value_selector: [],
      }
    })
    const returnTypes = extractReturnType(value, inputs.code_language)
    handleCodeAndVarsChange(value, codeNewInput, returnTypes)
  }

  return (
    // <div className='mt-2'>
    //   <div className='px-4 pb-4 space-y-4'>
    //     <Field
    //       title={t(`${i18nPrefix}.inputVars`)}
    //       operations={
    //         !readOnly ? <AddButton onClick={handleAddVariable} /> : undefined
    //       }
    //     >
    //       <VarList
    //         readonly={readOnly}
    //         nodeId={id}
    //         list={inputs.variables}
    //         onChange={handleVarListChange}
    //         filterVar={filterVar}
    //         isSupportFileVar={false}
    //       />
    //     </Field>
    //     <Split />
    //     <CodeEditor
    //       isInNode
    //       readOnly={readOnly}
    //       title={
    //         <TypeSelector
    //           options={codeLanguages}
    //           value={inputs.code_language}
    //           onChange={handleCodeLanguageChange}
    //         />
    //       }
    //       language={inputs.code_language}
    //       value={inputs.code}
    //       onChange={handleCodeChange}
    //       onGenerated={handleGeneratedCode}
    //       showCodeGenerator={true}
    //     />
    //   </div>
    //   <Split />
    //   <div className='px-4 pt-4 pb-2'>
    //     <Field
    //       title={t(`${i18nPrefix}.outputVars`)}
    //       operations={
    //         <AddButton onClick={handleAddOutputVariable} />
    //       }
    //     >

    //       <OutputVarList
    //         readonly={readOnly}
    //         outputs={inputs.outputs}
    //         outputKeyOrders={outputKeyOrders}
    //         onChange={handleVarsChange}
    //         onRemove={handleRemoveVariable}
    //       />
    //     </Field>
    //   </div>
    //   {
    //     isShowSingleRun && (
    //       <BeforeRunForm
    //         nodeName={inputs.title}
    //         onHide={hideSingleRun}
    //         forms={[
    //           {
    //             inputs: varInputs,
    //             values: inputVarValues,
    //             onChange: setInputVarValues,
    //           },
    //         ]}
    //         runningStatus={runningStatus}
    //         onRun={handleRun}
    //         onStop={handleStop}
    //         result={<ResultPanel {...runResult} showSteps={false} />}
    //       />
    //     )
    //   }
    //   <RemoveEffectVarConfirm
    //     isShow={isShowRemoveVarConfirm}
    //     onCancel={hideRemoveVarConfirm}
    //     onConfirm={onRemoveVarConfirm}
    //   />
    // </div>
    <div className='mt-[16px] wk-node-panel-content code-panel-content'>
      <div className='mb-[16px] flex justify-between items-center'>
        <div className='title-txt'>输入</div>
        {!readOnly && <div
          className='rounded-[4px] size-[24px] border-[1px] border-[#CBD5E1] flex items-center justify-center cursor-pointer hover:border-[#7F8C9F]'
          onClick={handleAddVariable}
        >
            <RiAddLine className='w-4 h-4 text-text-tertiary'/>
          </div>
        }
      </div>
      <div className='flex font-medium text-[#151B26] text-[12px]/[16px] mb-[8px] font-pf-medium'>
        <div className='w-[166px] mr-[8px] flex items-center'>变量名</div>
        <div className='grow flex items-center'>变量值</div>
      </div>
      <VarList
        readonly={readOnly}
        nodeId={id}
        list={inputs.variables}
        onChange={handleVarListChange}
        filterVar={filterVar}
        isSupportFileVar={false}
      />
      <Split className='my-[16px]'/>
      <div className='title-txt mb-[8px]'>代码</div>
      <CodeEditor
        isInNode
        readOnly={readOnly}
        title={
          <TypeSelector
            options={codeLanguages}
            value={inputs.code_language}
            triggerClassName='font-medium text-[#334155] text-[12px]/[18px] mr-[8px]'
            onChange={handleCodeLanguageChange}
          />
        }
        height={360}
        language={inputs.code_language}
        value={inputs.code}
        onChange={handleCodeChange}
        onGenerated={handleGeneratedCode}
        showCodeGenerator={true}
      />
      <Split className='my-[16px]'/>
      <div className='mb-[16px] flex justify-between items-center'>
        <div className='title-txt'>输出</div>
        {!readOnly && <div className='rounded-[4px] size-[24px] border-[1px] border-[#CBD5E1] flex items-center justify-center cursor-pointer' onClick={handleAddOutputVariable}>
            <RiAddLine className='w-4 h-4 text-text-tertiary'/>
          </div>
        }
      </div>
      <OutputVarList
        readonly={readOnly}
        outputs={inputs.outputs}
        outputKeyOrders={outputKeyOrders}
        onChange={handleVarsChange}
        onRemove={handleRemoveVariable}
      />
      <RemoveEffectVarConfirm
        isShow={isShowRemoveVarConfirm}
        onCancel={hideRemoveVarConfirm}
        onConfirm={onRemoveVarConfirm}
      />
    </div>
  )
}

export default React.memo(Panel)
