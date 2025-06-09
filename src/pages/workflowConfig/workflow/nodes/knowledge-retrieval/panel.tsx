import type { FC } from 'react'
import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import VarReferencePicker from '../_base/components/variable/var-reference-picker'
import useConfig from './use-config'
// import RetrievalConfig from './components/retrieval-config'
import AddKnowledge from './components/add-dataset'
import DatasetList from './components/dataset-list'
import type { KnowledgeRetrievalNodeType } from './types'
import Field from '@/pages/workflowConfig/workflow/nodes/_base/components/field'
import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split'
import OutputVars, { VarItem } from '@/pages/workflowConfig/workflow/nodes/_base/components/output-vars'
import { InputVarType, type NodePanelProps } from '@/pages/workflowConfig/workflow/types'
import BeforeRunForm from '@/pages/workflowConfig/workflow/nodes/_base/components/before-run-form'
import ResultPanel from '@/pages/workflowConfig/workflow/run/result-panel'
import { RiAddLine } from '@remixicon/react'
import { Modal, Tooltip } from '@arco-design/web-react'
import SelectDataset from '@/pages/workflowConfig/app/select-dataset'
import { useBoolean } from 'ahooks'
import { DataSet } from '@/pages/workflowConfig/models/datasets'
import KbConfigIcon from '@/pages/workflowConfig/styles/images/op-icons/kb-strategy.svg';
import PolicyForm from '@/components/policyFrom/index';

const i18nPrefix = 'workflow.nodes.knowledgeRetrieval'

const Panel: FC<NodePanelProps<KnowledgeRetrievalNodeType>> = ({
  id,
  data,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const {
    readOnly,
    inputs,
    handleQueryVarChange,
    filterVar,
    handleModelChanged,
    handleCompletionParamsChange,
    handleRetrievalModeChange,
    handleMultipleRetrievalConfigChange,
    selectedDatasets,
    handleOnDatasetsChange,
    isShowSingleRun,
    hideSingleRun,
    runningStatus,
    handleRun,
    handleStop,
    query,
    setQuery,
    runResult,
    rerankModelOpen,
    setRerankModelOpen,
    handleretrievalModelChanged,
  } = useConfig(id, data)

  const [isShowModal, {
    setTrue: showModal,
    setFalse: hideModal,
  }] = useBoolean(false)

  const handleSelect = useCallback((datasets: DataSet[]) => {
    handleOnDatasetsChange(datasets)
    hideModal()
  }, [handleOnDatasetsChange, hideModal])

  const [editPolicy, seteditPolicy] = useState(false);
  const childRef = useRef<any>();
  const submitEditeditPolicy = () => {
    childRef.current.submitEditeditPolicy();
  };
  const clearEditeditPolicy = () => {
    childRef.current.clearEditeditPolicy();
    seteditPolicy(false);
  };

  const initParams = useMemo(() => {
    const result = {
      retrievalV: 'hybrid_search',
      weightSettings: 0.6,
      reordering: true,
      topK: 6,
      scoreSwitch: true,
      scoreValue: 0.6,
    }
    if (inputs.retrieval_model) {
      result.retrievalV = inputs.retrieval_model.search_method
      result.weightSettings = inputs.retrieval_model.weights
      result.reordering = inputs.retrieval_model.reranking_enable
      result.topK = inputs.retrieval_model.top_k
      result.scoreSwitch = inputs.retrieval_model.score_threshold_enabled
      result.scoreValue = inputs.retrieval_model.score_threshold
    }
    return result
  }, [inputs.retrieval_model])

  const handleRetrievalConfigChange = (fromdata: any) => {
    handleretrievalModelChanged({
      search_method: fromdata.retrievalV,
      reranking_enable: fromdata.reordering,
      reranking_model: {
        reranking_provider_name: '',
        reranking_model_name: ''
      },
      top_k: fromdata.topK, // 召回topk
      weights: fromdata.weightSettings,
      score_threshold_enabled: fromdata.scoreSwitch,
      score_threshold: fromdata.scoreValue // 匹配分
    })
  }
  

  // const handleOpenFromPropsChange = useCallback((openFromProps: boolean) => {
  //   setRerankModelOpen(openFromProps)
  // }, [setRerankModelOpen])

  return (
    <div className='mt-[16px] wk-node-panel-content kb-panel-content'>
      <div className='mb-[8px] flex justify-between items-center'>
        <div className='title-txt'>知识库</div>
        <div className='flex items-center gap-x-[8px]'>
          <Tooltip content="知识库配置">
            <KbConfigIcon className='size-[16px] cursor-pointer hover:text-[#007DFA]' onClick={() => seteditPolicy(true)}/>
          </Tooltip>
          <Tooltip content='添加知识库'>
            {!readOnly && <RiAddLine className='w-4 h-4 text-text-tertiary cursor-pointer hover:text-[#007DFA]' onClick={showModal}/>}
          </Tooltip>
        </div>
      </div>
      <DatasetList
        list={selectedDatasets}
        onChange={handleOnDatasetsChange}
        readonly={readOnly}
      />
      <div className='h-[1px] bg-[#E8E9EB] w-full my-[16px]'></div>
      <div className='title-txt mb-[16px]'>输入变量</div>
      <div className='input-vars'>
        <div className='var-name'>
          <span className='txt'>变量名</span>
          <span className='grow flex items-center'>query</span>
        </div>
        <div className='var-value'>
          <span className='txt'>变量值</span>
          <VarReferencePicker
            nodeId={id}
            readonly={readOnly}
            isShowNodeName
            value={inputs.query_variable_selector}
            onChange={handleQueryVarChange}
            filterVar={filterVar}
          />
        </div>
      </div>
      <div className='h-[1px] bg-[#E8E9EB] w-full my-[16px]'></div>
      <div className='title-txt'>输出</div>
      <VarItem
        name='result'
        type='Array[Object]'
        description={t(`${i18nPrefix}.outputVars.output`)}
        subItems={[
          {
            name: 'content',
            type: 'string',
            description: t(`${i18nPrefix}.outputVars.content`),
          },
          // url, title, link like bing search reference result: link, link page title, link page icon
          {
            name: 'title',
            type: 'string',
            description: t(`${i18nPrefix}.outputVars.title`),
          },
          {
            name: 'url',
            type: 'string',
            description: t(`${i18nPrefix}.outputVars.url`),
          },
          {
            name: 'icon',
            type: 'string',
            description: t(`${i18nPrefix}.outputVars.icon`),
          },
          {
            name: 'metadata',
            type: 'object',
            description: t(`${i18nPrefix}.outputVars.metadata`),
          },
        ]}
      />
      {isShowModal && (
        <SelectDataset
          isShow={isShowModal}
          onClose={hideModal}
          selectedIds={inputs.dataset_ids}
          onSelect={handleSelect}
        />
      )}
      <Modal
        title="策略配置"
        visible={editPolicy}
        onOk={() => submitEditeditPolicy()}
        onCancel={() => clearEditeditPolicy()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: 800
        }}
      >
        <PolicyForm
          FuncChildFrom={handleRetrievalConfigChange}
          ref={childRef}
          seteditPolicy={seteditPolicy}
          initParams={initParams}
        ></PolicyForm>
      </Modal>
    </div>
  )
}

export default memo(Panel)
