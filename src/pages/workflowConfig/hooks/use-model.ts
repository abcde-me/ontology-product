import { useProviderContext } from "@/pages/workflowConfig/context/provider-context"
import type {
  CustomConfigurationModelFixedFields,
  DefaultModel,
  DefaultModelResponse,
  Model,
  ModelProvider,
  ModelTypeEnum,
} from '@/pages/workflowConfig/models/model'
import {
  ConfigurationMethodEnum,
  CustomConfigurationStatusEnum,
  ModelStatusEnum,
} from '@/pages/workflowConfig/models/model'
import { getDifyDefaultModel, getDifyModelList, getDifyProversList } from '@/api/workflowV2'
// import defaultModelLLM from '@/pages/workflowConfig/mockData/defaultModelLLM.json'
// import llmModelsJson from '@/pages/workflowConfig/mockData/llmModels.json'
import { useCallback, useEffect, useState } from "react"

export const useCurrentProviderAndModel = (modelList: Model[], defaultModel?: DefaultModel) => {
  // console.log('useCurrentProviderAndModel', modelList, defaultModel)
  const currentProvider = modelList.find(provider => provider.provider === defaultModel?.provider)
  const currentModel = currentProvider?.models.find(model => model.model === defaultModel?.model)

  return {
    currentProvider,
    currentModel,
  }
}

export const useTextGenerationCurrentProviderAndModelAndModelList = (defaultModel?: DefaultModel) => {
  const { textGenerationModelList } = useProviderContext()
  const activeTextGenerationModelList = textGenerationModelList.filter(model => model.status === ModelStatusEnum.active)
  const {
    currentProvider,
    currentModel,
  } = useCurrentProviderAndModel(textGenerationModelList, defaultModel)

  return {
    currentProvider,
    currentModel,
    textGenerationModelList,
    activeTextGenerationModelList,
  }
}

export const useModelList = (type: ModelTypeEnum) => {
  const [models, setModels] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const mutate = useCallback(() => {
    setIsLoading(true)
    getDifyModelList(type).then(modelsList => {
      setModels(modelsList)
    }).finally(() => {
      setIsLoading(false)
    })
  }, [type])

  useEffect(() => {
    mutate()
  }, [mutate])

  return {
    data: models || [],
    mutate,
    isLoading,
  }
}

export const useProviderList = () => {
  const [providers, setProviders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const mutate = useCallback(() => {
    setIsLoading(true)
    getDifyProversList().then(providerList => {
      setProviders(providerList)
    }).finally(() => {
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    mutate()
  }, [mutate])

  return {
    data: providers || [],
    mutate,
    isLoading,
  }
}

export const useDefaultModel = (type: ModelTypeEnum) => {
  const [model, setModel] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const mutate = useCallback(() => {
    setIsLoading(true)
    getDifyDefaultModel(type).then(model => {
      setModel(model)
    }).finally(() => {
      setIsLoading(false)
    })
  }, [type])

  useEffect(() => {
    mutate()
  }, [mutate])

  return {
    data: model || {},
    mutate,
    isLoading,
  }
}

export const useModelListAndDefaultModel = (type: ModelTypeEnum) => {
  const { data: modelList } = useModelList(type)
  const { data: defaultModel } = useDefaultModel(type)

  return {
    modelList,
    defaultModel,
  }
}

export const useModelListAndDefaultModelAndCurrentProviderAndModel = (type: ModelTypeEnum) => {
  const { modelList, defaultModel } = useModelListAndDefaultModel(type)
  const { currentProvider, currentModel } = useCurrentProviderAndModel(
    modelList,
    { provider: defaultModel?.provider?.provider || '', model: defaultModel?.model || '' },
  )

  return {
    modelList,
    defaultModel,
    currentProvider,
    currentModel,
  }
}