import * as _ from 'lodash';
export function newSchema(originSchema?: string) {
  const schema = originSchema
    ? JSON.parse(originSchema)
    : {
        openapi: '3.1.0',
        info: {
          title: '',
          description: '',
          version: 'v1.0.0'
        },
        servers: [
          {
            url: ''
          }
        ],
        paths: {},
        components: {
          schemas: {}
        }
      };
  const util = {
    getString() {
      return JSON.stringify(schema);
    },
    title(title: string) {
      schema.info.title = title;
      return util;
    },
    getTitle() {
      return schema.info.title;
    },
    description(description: string) {
      schema.info.description = description;
      return util;
    },
    getDescription() {
      return schema.info.description;
    },
    url(url: string) {
      schema.servers[0].url = url;
      return util;
    },
    setTool(params: {
      name?: string;
      des?: string;
      path: string;
      method: string;
    }) {
      const { name, method, path, des } = params;
      _.merge(schema, {
        paths: {
          [path]: {
            [method]: {
              operationId: name,
              summary: des
            }
          }
        }
      });
      return schema;
    },
    setToolInputParameters(params: {
      path: string;
      method: string;
      parameters: any;
      requestBodyParameters: any;
    }) {
      const { method, path, parameters, requestBodyParameters } = params;
      _.merge(schema, {
        paths: {
          [path]: {
            [method]: {
              parameters: [],
              requestBody: {
                content: {
                  'application/json': {}
                }
              }
            }
          }
        }
      });

      const tool = schema.paths[path][method];
      tool.parameters = parameters;
      tool.requestBody.content['application/json'].schema =
        requestBodyParameters;

      return schema;
    },
    setToolOutputParameters(params: {
      path: string;
      method: string;
      responseParameters: any;
    }) {
      const { method, path, responseParameters } = params;
      _.merge(schema, {
        paths: {
          [path]: {
            [method]: {
              responses: {
                '200': {
                  content: {
                    'application/json': {}
                  }
                }
              }
            }
          }
        }
      });
      schema.paths[path][method].responses['200'].content[
        'application/json'
      ].schema = responseParameters;
      return schema;
    },
    hasTool(path: string, method: string) {
      const has = _.get(schema, ['paths', path, method]);
      return !!has;
    },
    getTool(path: string, method: string) {
      return _.get(schema, ['paths', path, method]);
    },
    getToolName(path: string, method: string) {
      const toolName = util.getTool(path, method)?.operationId || '';
      return toolName;
    },
    getTools() {
      const tools = _.get(schema, 'paths');
      const res = [];
      Object.entries(tools).forEach((tool) => {
        Object.entries(tool[1]).forEach((item) => {
          const t = tool[1][item[0]];
          const nonBodyParams = (t.parameters || []).map((i) => i.name);
          const bodyParams = Object.keys(
            _.get(
              t,
              [
                'requestBody',
                'content',
                'application/json',
                'schema',
                'properties'
              ],
              {}
            )
          );
          res.push({
            path: tool[0],
            method: item[0],
            name: item[1].operationId,
            des: item[1].summary,
            params: nonBodyParams.concat(bodyParams)
          });
        });
      });
      return res;
    },
    getUrlPrefix(): string {
      return schema.servers[0]?.url;
    },
    deleteTool(path: string, method: string) {
      _.set(schema, ['paths', path, method], undefined);
      return schema;
    }
  };
  return util;
}
