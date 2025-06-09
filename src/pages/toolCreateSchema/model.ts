import { collectionDetail, debugTool, updateTool } from '@/api/tools';
import { newSchema } from '@/utils/openApiSchema';
import { CustomCollectionBackend } from '@/utils/type';
import { goParams } from '@/utils/url';
import { applySnapshot, flow, getSnapshot, types } from 'mobx-state-tree';
import { DataType } from './ParamForm';
import { Message } from '@arco-design/web-react';

const ToolCreateStore = types
  .model({
    curStep: types.integer,
    formData: types.frozen(),
    inputParams: types.frozen<DataType[]>(),
    outputParams: types.frozen<DataType[]>(),
    collectionDetail: types.frozen<CustomCollectionBackend>(),
    toolPath: types.string,
    toolMethod: types.string,
    debuging: types.boolean,
    debugRequest: types.string,
    debugResponseError: types.maybe(types.string),
    debugResponseSuccess: types.maybe(types.string),
    saving: types.boolean,
    loading: types.boolean
  })
  .views((self) => {
    return {
      get urlPrefix() {
        return self.collectionDetail
          ? newSchema(self.collectionDetail.schema).getUrlPrefix()
          : '';
      },
      get toolName() {
        if (self.toolPath)
          return self.collectionDetail
            ? newSchema(self.collectionDetail.schema).getToolName(
                self.toolPath,
                self.toolMethod
              )
            : '';
        return '创建工具';
      }
    };
  })
  .actions((self) => {
    const save = async function () {
      let schema;
      if (self.curStep === 1) {
        const schemaUtils = newSchema(self.collectionDetail.schema);
        const { name, des, path, method } = self.formData;
        if (path !== self.toolPath || method !== self.toolMethod) {
          schemaUtils.deleteTool(self.toolPath, self.toolMethod);
        }
        schema = schemaUtils.setTool({ name, des, path, method });
      }
      if (self.curStep === 2) {
        const { parameters, bodyParameters } = serializeInputParams();
        const schemaUtils = newSchema(self.collectionDetail.schema);
        const { path, method } = self.formData;
        schema = schemaUtils.setToolInputParameters({
          path,
          method,
          parameters,
          requestBodyParameters: bodyParameters
        });
      }
      if (self.curStep === 3) {
        console.log(self.outputParams);
        const responseParameters = serializeOutputParams();
        const schemaUtils = newSchema(self.collectionDetail.schema);
        const { path, method } = self.formData;
        schema = schemaUtils.setToolOutputParameters({
          path,
          method,
          responseParameters: responseParameters
        });
      }
      if (schema) {
        await updateTool({
          ...self.collectionDetail,
          schema: JSON.stringify(schema),
          original_provider: self.collectionDetail.name,
          provider: self.collectionDetail.name
        });
      }
    };

    const parseSchema = (schema: Record<string, any>, method?): DataType[] => {
      const res: DataType[] = [];
      if (schema.type === 'object') {
        Object.entries<any>(schema.properties).forEach((item) => {
          res.push({
            name: item[0],
            des: item[1].description,
            type: item[1].type,
            required: (schema.required || []).includes(item[0]),
            method,
            children: parseSchema(item[1], method)
          });
        });
      }

      if (schema.type === 'array') {
        res.push({
          name: '[Array Item]',
          des: schema.items.description,
          type: schema.items.type,
          required: false,
          method,
          children:
            schema.items.type === 'object'
              ? parseSchema(schema.items, method)
              : []
        });
      }
      return res;
    };
    const initInputParams = () => {
      const tool = newSchema(self.collectionDetail.schema).getTool(
        self.toolPath,
        self.toolMethod
      );
      const parameters = tool.parameters || [];
      const bodyParameterSchema =
        tool.requestBody?.content?.['application/json']?.schema;
      const inputParams: DataType[] = [];

      parameters.forEach((p) => {
        inputParams.push({
          name: p.name,
          des: p.schema.description,
          type: p.schema.type,
          method: p.in,
          required: p.required,
          children:
            p.schema.type === 'object' || p.schema.type === 'array'
              ? parseSchema(p.schema, p.in)
              : []
        });
      });
      const bodyParams = bodyParameterSchema
        ? parseSchema(bodyParameterSchema, 'body')
        : [];
      inputParams.push(...bodyParams);
      self.inputParams = inputParams;
    };

    const initOutputParams = () => {
      const tool = newSchema(self.collectionDetail.schema).getTool(
        self.toolPath,
        self.toolMethod
      );
      const responseParameterSchema =
        tool.responses?.['200']?.content?.['application/json']?.schema;

      const responseParams = responseParameterSchema
        ? parseSchema(responseParameterSchema, 'body')
        : [];
      self.outputParams = responseParams;
    };

    const toSchema = (param: DataType) => {
      if (param.type === 'object') {
        return {
          type: 'object',
          required: param.children.filter((i) => i.required).map((i) => i.name),
          description: param.des,
          properties: param.children.reduce((acc, cur) => {
            acc[cur.name] = toSchema(cur);
            return acc;
          }, {})
        };
      }
      if (param.type === 'array') {
        return {
          type: 'array',
          description: param.des,
          items: toSchema(param.children[0])
        };
      }
      return {
        type: param.type,
        description: param.des
      };
    };

    const serializeInputParams = () => {
      const parameters = self.inputParams
        .filter((param) => {
          return param.method !== 'body';
        })
        .map((param) => {
          return {
            description: param.des,
            in: param.method,
            name: param.name,
            required: param.required,
            schema: toSchema(param)
          };
        });

      const bodyParams = self.inputParams.filter((param) => {
        return param.method === 'body';
      });
      const bodyParameters = {
        type: 'object',
        required: bodyParams.filter((i) => i.required).map((i) => i.name),
        properties: bodyParams.reduce((acc, cur) => {
          acc[cur.name] = toSchema(cur);
          return acc;
        }, {})
      };

      return { parameters, bodyParameters };
    };

    const serializeOutputParams = () => {
      const outputParams = self.outputParams;
      const outputParameters = {
        type: 'object',
        required: outputParams.filter((i) => i.required).map((i) => i.name),
        properties: outputParams.reduce((acc, cur) => {
          acc[cur.name] = toSchema(cur);
          return acc;
        }, {})
      };
      return outputParameters;
    };

    let initialState = {};

    const getDetail = flow(function* (provider: string) {
      self.loading = true;
      try {
        const res = yield collectionDetail(provider);
        self.collectionDetail = { ...res, name: provider };
        if (self.toolMethod && self.toolPath) {
          const tool = newSchema(self.collectionDetail.schema).getTool(
            self.toolPath,
            self.toolMethod
          );
          self.formData = {
            name: tool?.operationId,
            des: tool?.summary,
            path: self.toolPath,
            method: self.toolMethod
          };
          initInputParams();
          initOutputParams();
        }
      } catch (err) {
        Message.error(err?.message);
        console.error(err);
      } finally {
        self.loading = false;
      }
    });

    const actions = {
      publish: flow(function* () {}),
      setFormData(data) {
        self.formData = data;
      },
      setInputParams(data) {
        self.inputParams = data;
      },
      setOutParams(data) {
        self.outputParams = data;
      },
      next: flow(function* (history) {
        self.saving = true;
        try {
          yield save();
          if (self.curStep === 1) {
            const { path, method } = self.formData;
            self.toolMethod = method;
            self.toolPath = path;
          }
          yield getDetail(self.collectionDetail.name);
          if (self.curStep === 1) {
            goParams(history, {
              provider: self.collectionDetail.name,
              toolMethod: self.toolMethod,
              toolPath: self.toolPath,
              step: '2'
            });
            return;
          }
          self.curStep++;
          goParams(history, {
            step: self.curStep + ''
          });
        } catch (err) {
          console.error(err);
          Message.error(err?.message);
        } finally {
          self.saving = false;
        }
      }),
      prev(history) {
        self.curStep--;
        goParams(history, {
          step: self.curStep + ''
        });
      },
      getCollectionDetail: getDetail,
      setTool(toolPath: string, toolMethod: string) {
        self.toolPath = toolPath;
        self.toolMethod = toolMethod;
      },
      setStep(step) {
        self.curStep = step;
      },
      debugTool: flow(function* (paramsData) {
        self.debuging = true;
        self.debugRequest = JSON.stringify(paramsData, null, 4);
        try {
          const res = yield debugTool({
            provider_name: self.collectionDetail.name,
            tool_name: self.toolName,
            credentials: self.collectionDetail.credentials,
            schema_type: self.collectionDetail.schema_type,
            schema: self.collectionDetail.schema,
            parameters: paramsData
          });
          self.debugResponseError = res.error;
          self.debugResponseSuccess = res.result;
          console.log(res);
        } catch (err) {
          console.error(err);
          Message.error(err?.message);
        } finally {
          self.debuging = false;
        }
      }),
      afterCreate: () => {
        initialState = getSnapshot(self);
      },
      reset: () => {
        applySnapshot(self, initialState);
      },
      getTool(path: string, method: string) {
        const tool = newSchema(self.collectionDetail.schema).getTool(
          path,
          method
        );
        return tool;
      },
      getTools() {
        const tools = newSchema(self.collectionDetail.schema).getTools();
        return tools;
      }
    };
    return actions;
  });

export const toolCreateStore = ToolCreateStore.create({
  curStep: 1,
  toolMethod: '',
  toolPath: '',
  debuging: false,
  debugRequest: '',
  debugResponseError: '',
  debugResponseSuccess: '',
  saving: false,
  loading: false,
  formData: null,
  inputParams: [],
  outputParams: [],
  collectionDetail: null
});
