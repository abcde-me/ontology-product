import { Model } from '@/models';
import { AgentEditor } from '../compontents/AgentProvider/Agent';
import { getDatasetsList } from '@/api/datasetsV2';
import { aiGenerate } from '@/api/appsV2';
import {
  updateApp,
  getAppDetail,
  updateAppConfig,
  getAppsList
} from '@/api/appsV2';
import {
  ROLE_INSTRUCTION_TEMPLATE,
  AGENT_CONFIG_DEFAULT,
  KNOW_CONFIG_DEFAULT,
  WORKFLOW_CONFIG_DEFAULT,
  SYSTEM_PROMPT
} from '../constants';
import {
  getIdsAsString,
  transformArray,
  formatWorkflowData,
  getProviderIdsAsString
} from '../utils';
interface InfoStoreState {
  agentName: string;
  agentDesc: string;
  agentRole: string;
  agentRoleOptimized: string;
  roleStatus: boolean;
  currentTime: string;
  modelConfigId?: string | number; // 模型配置ID
  showThinking: boolean; // 是否展示思考过程
}
export class InfoStore extends Model<InfoStoreState> {
  constructor(public agent: AgentEditor) {
    super({
      state: {
      showThinking: false,
        agentName: '我的智能体应用',
        agentDesc: '我的智能体应用描述',
        agentRole: ROLE_INSTRUCTION_TEMPLATE,
        // 优化后的提示词
        agentRoleOptimized: '',
        roleStatus: false,
        // 改成时分秒
        currentTime: new Date().toLocaleTimeString(),
        modelConfigId: undefined // 模型配置ID
      }
    });
  }

  // 设置展示思考过程
  setShowThinking(status: boolean) {
    this.setState({
      showThinking: status
    });
  }

  // 设置初始数据
  setAgentInfoData(data: any) {
    this.setState({
      ...this.state,
      ...data
    });
  }
  // 实时更新基础信息
  updateAgentInfoData(id: string | number) {
    const { agentName, agentDesc } = this.state;
    updateApp({
      id,
      name: agentName,
      description: agentDesc,
      mode: 'agent-chat'
    });
    this.setState({
      currentTime: new Date().toLocaleTimeString()
    });
  }
  // 实时更新配置
  async updateAgentConfigData(id: string | number) {
    const { agentRole } = this.state;
    const { prologue, recommend } = this.agent.abilityStore.getState();
    const { modelName, provider, top_p, temperature } =
      this.agent.modelStore.getState();
    const { selectedList, policyValues } = this.agent.knowStore.getState();
    const { selectedList: workflowSelectedList } =
      this.agent.workflowStore.getState();
    console.log('prologue', prologue);
    console.log('recommend', recommend);
    console.log('policyValues', policyValues)

    // 大模型配置
    const modelConfig = {
      model: {
        name: modelName,
        provider: provider,
        mode: 'chat',
        completion_params: {
          // top k与温度等配置
          temperature: temperature,
          top_p: top_p
        }
      }
    };
    const res = await updateAppConfig(id, {
      agent_mode: {
        // 智能体工具调用相关：工具和工作流
        ...WORKFLOW_CONFIG_DEFAULT,
        tools: formatWorkflowData(workflowSelectedList)
      },
      dataset_configs: {
        // ...KNOW_CONFIG_DEFAULT,
        ...policyValues,
        datasets: {
          datasets: transformArray(selectedList)
        }
      },
      pre_prompt: agentRole,
      opening_statement: prologue, // 开场白
      suggested_questions: recommend?.map((item) => item.value), // 推荐问
      ...AGENT_CONFIG_DEFAULT, // 默认配置
      ...modelConfig // 大模型配置
    });
    if(res.code === 'Success') {
      console.log('模型配置更新成功', res);
      this.setState({
        currentTime: new Date().toLocaleTimeString(),
        modelConfigId: res.data?.model_config?.id // 更新模型配置ID
      })
    }
    return res
  
  }
  // 替换模版
  replaceTemplate() {
    this.setState({
      ...this.state,
      agentRole: ROLE_INSTRUCTION_TEMPLATE
    });
  }

  // 设置开场白状态
  setRoleStatus(status: boolean) {
    this.setState({
      roleStatus: status
    });
  }

  fetchData(options?: { showLoading?: boolean }) {
    const { showLoading = true } = options || {};
    this.setRoleStatus(true);
    return this.asyncManager('fetchData', {
      showLoading
    }).exec(() => {
      const { agentName, agentDesc, agentRole } =
        this.agent.infoStore.getState();
      const data = {
        app_name: agentName,
        app_description: agentDesc,
        type: 'pre_prompt',
        pre_prompt: agentRole,
        stream: false
      };
      return aiGenerate(data).then((res) => {
        console.log('res', res);
        this.setRoleStatus(false);
        return {
          agentRoleOptimized: res.data
        };
      });
    });
  }

  getAgentInfoData(options?: { showLoading?: boolean; id: string | number }) {
    const { showLoading = true, id } = options || {};
    return this.asyncManager('fetchData', {
      showLoading
    }).exec(() => {
      return getAppDetail(id).then((res) => {
        console.log('res222', res);
        this.setDefaultKnowledgeBase(res);
        this.setDefaultWorkflow(res);
        this.setDefaultPrologue(res);
        this.setDefaultRecommend(res);

        this.setDefaultModel(res);
        this.setDefaultPolicy(res)
        return {
          modelConfigId: res?.data?.model_config?.id,
          agentName: res.data.name,
          agentDesc: res.data.description,
          agentRole:
            res.data.model_config?.pre_prompt || ROLE_INSTRUCTION_TEMPLATE
        };
      });
    });
  }

  // 设置默认知识库
  setDefaultKnowledgeBase(res) {
    const KnowData = res.data.model_config?.dataset_configs.datasets.datasets;
    console.log('KnowData', KnowData);
    if (KnowData?.length > 0) {
      const ids = getIdsAsString(KnowData);
      getDatasetsList({
        ids
      }).then((res) => {
        this.agent.knowStore.setSelectedList(res.data.data);
      });
    } else {
      this.agent.knowStore.setSelectedList([]);
    }
  }
  // 设置默认工作流
  setDefaultWorkflow(res) {
    const workflowData = res.data.model_config?.agent_mode.tools;
    if (workflowData?.length > 0) {
      const ids = getProviderIdsAsString(workflowData);
      getAppsList('', { ids: ids, mode: 'workflow' }).then((res) => {
        this.agent.workflowStore.setSelectedList(res.data.data);
      });
    } else {
      this.agent.workflowStore.setSelectedList([]);
    }
  }
  // 设置默认开场白
  setDefaultPrologue(res) {
    const prologue = res.data.model_config?.opening_statement;
    this.agent.abilityStore.setPrologue(prologue);
  }
  // 设置默认推荐问
  setDefaultRecommend(res) {
    const recommend = res.data.model_config?.suggested_questions;
    const recommendList = recommend?.map((item) => ({
      value: item,
      id: Date.now().toString() + Math.random()
    }));
    this.agent.abilityStore.setRecommend(recommendList);
  }
  // 设置默认模型
  setDefaultModel(res) {
    const modelData = res.data.model_config?.model;
    const { modelName} = this.agent.modelStore.getState();
    const data = {
      modelName: modelData?.name || modelName,
      top_p: modelData?.completion_params?.top_p,
      temperature: modelData?.completion_params?.temperature,
      provider: modelData?.provider
    };
    this.agent.modelStore.setModelFormData(data);
  }
  // 设置默认策略配置
  setDefaultPolicy(res){
       const policyData = res.data.model_config?.dataset_configs;
       console.log('policyData', policyData);

       // 获取当前的默认值
       const currentPolicyValues = this.agent.knowStore.getState().policyValues;

       // 合并默认值和接口返回的值，接口返回的值优先
       const mergedPolicyValues = {
         ...currentPolicyValues,
         ...policyData
       };

       console.log('mergedPolicyValues', mergedPolicyValues);
       this.agent.knowStore.setPolicyValues(mergedPolicyValues);
  }
}
