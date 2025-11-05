type GetFirstArgument<T> = T extends (
  first: infer FirstArgument,
  ...args: any[]
) => any
  ? FirstArgument
  : never;
type ImockFetch<T = any> = (data: T, delay?: number) => Promise<T>;
export const mockFetch: ImockFetch<GetFirstArgument<ImockFetch>> = (
  data,
  delay = 1000
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export const dataInit = () => {
  return mockFetch(
    {
      data: {
        result: [
          {
            category: 'string',
            createdAt: 'string',
            description: 'string',
            id: 'id1',
            latestVersion: {
              compression: {
                compute: {
                  booking: {
                    modules: ['string'],
                    projects: [
                      {
                        id: 'string'
                      }
                    ]
                  },
                  clusterID: 'string',
                  config: {},
                  createdAt: 'string',
                  credential: {
                    accessKey: 'string',
                    expiration: 'string',
                    secretKey: 'string',
                    token: 'string'
                  },
                  description: 'string',
                  gpuKind: 'string',
                  host: 'string',
                  id: 'string',
                  idleResources: {
                    cpu: 0,
                    gpu: {
                      property1: 0,
                      property2: 0
                    },
                    memory: 0
                  },
                  kind: 'string',
                  maxResources: {
                    cpu: 0,
                    gpu: {
                      property1: 0,
                      property2: 0
                    },
                    memory: 0
                  },
                  name: 'string',
                  namespace: 'string',
                  orgID: 'string',
                  queue: {
                    clusterID: 'string',
                    createTime: 'string',
                    deletedAt: 0,
                    id: 'string',
                    idleResources: {},
                    location: {
                      property1: 'string',
                      property2: 'string'
                    },
                    maxResources: {},
                    minResources: {},
                    name: 'string',
                    namespace: 'string',
                    queueID: 'string',
                    quotaType: 'string',
                    schedulingPolicy: ['string'],
                    status: 'string',
                    updateTime: 'string',
                    usedPodNumber: 0,
                    usedResources: {}
                  },
                  queueID: 'string',
                  status: 'string',
                  tags: {
                    property1: 'string',
                    property2: 'string'
                  },
                  updatedAt: 'string',
                  userID: 'string'
                },
                computeID: 'string',
                datasetID: 'string',
                flavour: {
                  cpu: 'string',
                  gpu: {
                    property1: 'string',
                    property2: 'string'
                  },
                  memory: 'string',
                  nodeCount: 0
                },
                method: 'string',
                policy: 'string',
                samplingEnabled: true,
                samplingRate: 0
              },
              createdAt: 'string',
              description: 'string',
              destFilesystemID: 'string',
              format: 'string',
              id: 'string',
              imageID: 'string',
              importKind: 'string',
              inferParameters: {
                command: 'string',
                port: 65535
              },
              inheritedVersion: 0,
              modelID: 'string',
              modelSource: 'string',
              notebookID: 'string',
              platform: 'string',
              projectID: 'string',
              sourceDir: 'string',
              sourceFilesystemID: 'string',
              sourceURIs: ['string'],
              status: 'string',
              trainJobID: 'string',
              trainMode: 'string',
              updatedAt: 'string',
              uri: 'string',
              userID: 'string',
              version: 0
            },
            name: 'name-1',
            projectID: 'string',
            updatedAt: 'string',
            userID: 'string'
          }
        ],
        totalCount: 10
      }
    },
    3000
  );
};

export const modelLabelDataInit = () => {
  return mockFetch(
    {
      data: {
        model_name: '模型名字',
        label_list: [
          {
            label_name: '标签名称',
            label_shape: 'bbox'
          }
        ]
      }
    },
    3000
  );
};
