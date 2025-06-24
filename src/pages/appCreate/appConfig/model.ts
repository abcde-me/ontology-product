import { applySnapshot, flow, getSnapshot, types } from 'mobx-state-tree';
import { Message } from '@arco-design/web-react';
import * as _ from 'lodash';
import { getLLMParams } from '@/api/llm';
import {
  App,
  ModelConfig,
  Collection,
  DataSet,
  ModelModeType,
  ModelParameterRule,
  Tool,
  CollectionType
} from '@/utils/type';
import {
  modifyAppInfo,
  createApp as createAppRequest,
  getAppDetail,
  saveApp
} from '@/api/app';
import { stopResponding } from '@/api/chat';

type FormData = {
  pre_prompt: string;
  opening_statement: string;
  title: string;
  description: string;
  suggested_questions: string[];
};
export enum AgentStrategy {
  functionCall = 'function_call',
  react = 'react'
}
export const DEFAULT_AGENT_SETTING = {
  enabled: true,
  max_iteration: 5,
  strategy: AgentStrategy.react,
  tools: []
};

const AppConfig = types
  .model({
    //app原始对象
    app: types.frozen<App>(),
    //正在加载app信息
    loading: false,
    //用户输入
    userinput: types.frozen(),
    //展示添加工具抽屉
    showToolsDrawer: false,
    //发布中
    publishing: false,
    /**模型参数 */
    modelParams: types.model({
      params: types.map(types.frozen()),
      provider: types.string,
      model: types.string
    }),
    parameterRules: types.array(types.frozen<ModelParameterRule>()),
    parameterRulesLoading: false,
    /**表单输入 */
    formData: types.frozen<FormData>(),
    /**当前安装的tools */
    tools: types.array(
      types.model({
        tool_name: types.string,
        provider_id: types.string,
        provider_name: types.string,
        enabled: types.boolean,
        tool_parameters: types.frozen<Record<string, any>>(),
        provider_type: types.enumeration(Object.values(CollectionType))
      })
    ),
    /**当前使用的知识库 */
    knowledges: types.array(
      types.model({
        enabled: types.boolean,
        id: types.integer
      })
    ),
    /**选择知识库 */
    showKnowledgeDrawer: types.boolean,
    /**正在创建app */
    creating: types.boolean,
    /**头像 */
    avatar: types.string
  })
  .views((self) => {
    return {
      get newAppConfig() {
        const {
          pre_prompt = '',
          opening_statement = '',
          suggested_questions = []
        } = self.formData || {};
        const update = {
          pre_prompt,
          opening_statement,
          dataset_configs: {
            datasets: {
              datasets: []
            }
          },
          agent_mode: DEFAULT_AGENT_SETTING
        };
        const res: ModelConfig = _.merge({}, self.app?.model_config, update);
        res.suggested_questions = suggested_questions;
        res.model = {
          name: self.modelParams.model,
          provider: self.modelParams.provider,
          mode: ModelModeType.chat,
          completion_params: Object.fromEntries(
            self.modelParams.params.entries()
          ) as ModelConfig['model']['completion_params']
        };
        res.agent_mode.tools = self.tools;
        res.dataset_configs.datasets.datasets =
          self.knowledges.map((item) => ({
            dataset: { ...item }
          })) || [];
        return res;
      }
    };
  })
  .actions((self) => {
    let initialState = {};
    let history = null;

    /**创建app */
    const createApp = async () => {
      const res = await createAppRequest({
        name: self.formData.title
      });
      return res;
    };
    /**更改app的名称，标题等 */
    const updateApp = async () => {
      await modifyAppInfo({
        id: self.app.id,
        title: self.formData.title,
        des: self.formData.description,
        icon: self.avatar || ''
      });
    };

    const initFormData = (app) => {
      return {
        title: app.site.title,
        description: app.site.description,
        pre_prompt: app.model_config.pre_prompt,
        opening_statement: app.model_config.opening_statement,
        suggested_questions: app.model_config.suggested_questions || []
      };
    };

    const initModelParams = () => {
      self.modelParams.params.clear();
      const completion_params = self.app.model_config?.model
        ?.completion_params as Record<string, any>;
      //更新模型参数
      Object.entries(completion_params).forEach((entry) => {
        self.modelParams.params.set(entry[0], entry[1]);
      });
      const { name: curModelName = '', provider = '' } =
        self.app.model_config?.model || {};
      self.modelParams.model = curModelName;
      self.modelParams.provider = provider;
      actions.applyNewModelParams(false);
    };

    const initTools = () => {
      self.tools = (self.app.model_config?.agent_mode?.tools || []) as any;
    };
    const initDatasets = () => {
      // TODO: ts错误
      // @ts-expect-error
      self.knowledges =
        self.app.model_config.dataset_configs?.datasets?.datasets?.map(
          (item) => item.dataset
        ) || ([] as any);
    };

    const actions = {
      // 获取app配置
      getApp: flow(function* (id: string) {
        if (self.loading) return;
        self.loading = true;
        try {
          const res = yield getAppDetail({ id });
          self.app = res;
          self.formData = initFormData(res);
          self.avatar = res.icon || '';
          initModelParams();
          initTools();
          initDatasets();
        } catch (err: any) {
          console.error(err);
          Message.error(err?.message);
        } finally {
          self.loading = false;
        }
      }),

      /**标题修改会触发新建应用 */
      triggerCreateApp: flow(function* () {
        if (!self.app) {
          self.creating = true;
          try {
            const data = yield createApp();
            // TODO: ts错误
            // @ts-expect-error
            history.replace('/tenant/compute/appforge/appConfig?id=' + data.id);
            // const newApp = yield getAppDetail({ id: data.id });
            // self.app = newApp;
            // self.formData = initFormData(newApp);
            // initModelParams();
            // initTools();
            // initDatasets();
          } catch (err: any) {
            Message.error(err?.message);
          } finally {
            self.creating = false;
          }
        }
      }),
      // 更新来自于用户表单的内容
      updateFormData(formData) {
        self.formData = formData;
      },
      // 发布配置
      publish: flow(function* () {
        self.publishing = true;
        try {
          yield updateApp();
          const res = yield saveApp({
            id: self.app.id,
            data: self.newAppConfig
          });
          Message.success('保存成功');
          return res;
        } catch (err: any) {
          console.error(err);
          Message.error(err?.message);
        } finally {
          self.publishing = false;
        }
      }),
      //停止响应
      stopResponse: function (taskId: string) {
        return stopResponding({
          appId: self.app.id,
          taskId
        });
      },
      //是否展示添加工具抽屉
      toggleToolsDrawer() {
        self.showToolsDrawer = !self.showToolsDrawer;
      },
      afterCreate: () => {
        initialState = getSnapshot(self);
      },
      reset: () => {
        applySnapshot(self, initialState);
      },
      //更新模型参数
      setModelParam(key, value) {
        self.modelParams.params.set(key, value);
      },
      clearModelParams() {
        self.modelParams.params.clear();
      },
      //删除参数
      deleteModelParam(key: string) {
        self.modelParams.params.delete(key);
      },
      //更改provider
      setModelProvider: flow(function* (provider: string, model: string) {
        self.modelParams.provider = provider;
        self.modelParams.model = model;
        if (provider && model) {
          actions.clearModelParams();
          actions.applyNewModelParams();
        }
      }),
      //拉取新的模型参数
      applyNewModelParams: flow(function* (overwrite = true) {
        self.parameterRulesLoading = true;
        try {
          const data = yield getLLMParams(
            self.modelParams.provider,
            self.modelParams.model
          );
          self.parameterRules = data;
          if (overwrite) {
            data.forEach((item) => {
              if (item.default !== undefined && item.default !== null) {
                actions.setModelParam(item.name, item.default);
              }
            });
          }
        } catch (err) {
        } finally {
          self.parameterRulesLoading = false;
        }
      }),
      //工具启停
      toggleTool(tool_name: string, provider_id: string) {
        const tool = self.tools.find(
          (item) =>
            item.provider_id === provider_id && item.tool_name === tool_name
        );
        tool && (tool.enabled = !tool.enabled);
      },
      //添加工具
      addTool(tool: Tool, provider: Collection) {
        const parameters: Record<string, string> = {};
        if (tool.parameters) {
          tool.parameters.forEach((item) => {
            parameters[item.name] = '';
          });
        }
        self.tools.push({
          provider_id: provider.id,
          provider_type: provider.type,
          provider_name: provider.name,
          tool_name: tool.name,
          tool_parameters: parameters,
          enabled: true
        });
      },
      //删除工具
      removeTool(name: string) {
        const index = self.tools.findIndex((tool) => tool.tool_name === name);
        self.tools.splice(index, 1);
      },
      //展示知识库选择抽屉
      toggleKnowledgeDrawer() {
        self.showKnowledgeDrawer = !self.showKnowledgeDrawer;
      },
      //添加知识库
      addKnowledge(knowledge: DataSet) {
        self.knowledges.push({
          enabled: true,
          id: knowledge.id
        });
      },
      //选择或反选知识库
      toggleKnowledge(knowledgeId: number | string) {
        const knowledge = self.knowledges.find(
          (item) => item.id === knowledgeId
        );
        if (knowledge) knowledge.enabled = !knowledge.enabled;
      },
      //移除知识库
      removeKnowledge(index: number) {
        self.knowledges.splice(index, 1);
      },
      setHistory(h) {
        history = h;
      },
      setAvatar(avatar: string) {
        self.avatar = avatar;
      }
    };
    return actions;
  });

export const appConfigStore = AppConfig.create({
  // TODO: ts错误
  // @ts-expect-error
  app: null,
  loading: false,
  userinput: {
    inputs: {},
    promptVariables: []
  },
  modelParams: {
    provider: '',
    model: '',
    params: {}
  },
  parameterRules: [],
  parameterRulesLoading: false,
  // TODO: ts错误
  // @ts-expect-error
  formData: null,
  tools: [],
  knowledges: [],
  showKnowledgeDrawer: false,
  creating: false,
  avatar: ''
});
