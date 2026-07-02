import type { OntologyApiCatalogItem } from '../types';

export const DEFAULT_ONTOLOGY_API_BASE_URL =
  process.env.REACT_APP_ONTOLOGY_HTTP_API_BASE_URL || 'https://api.onto.com';

const createExample = (value: unknown) => JSON.stringify(value, null, 2);

export const ONTOLOGY_API_CATALOG: OntologyApiCatalogItem[] = [
  {
    id: 'http-create-ontology',
    code: 'API-01',
    name: '创建对象实例',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpCreateOntology',
    category: '对象实例',
    description: '向指定对象类型批量写入对象实例数据。',
    useCase:
      '接收外部传感器上报的实时观测数据并入库；用户通过前端表单手动录入新的资产设备。',
    requestExample: createExample({
      ontology_object_type_code: 'gjx_1',
      columns: ['name', 'age', 'status'],
      values: [
        ['Alice111', 27, 'active'],
        ['Bob111', 18, 'inactive']
      ]
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        sql: 'INSERT INTO users (name, age, status) VALUES (?, ?, ?), (?, ?, ?)',
        args: ['Alice111', 27, 'active', 'Bob111', 18, 'inactive'],
        rowsAffected: 2
      }
    })
  },
  {
    id: 'http-delete-ontology-by-id',
    code: 'API-02',
    name: '删除对象实例',
    method: 'DELETE',
    path: '/http_rest_api/internal/v1/HttpDeleteOntology',
    category: '对象实例',
    description: '按条件删除单个对象实例。',
    useCase: '设备退役销毁；手动清除录入错误的垃圾测试数据。',
    notes: '路径参数 id 为对象实例 ID。',
    requestExample: createExample({
      ontology_object_type_code: 'gjx_1',
      where: {
        op: '=',
        left: { type: 'column', name: 'id' },
        right: { type: 'value', value: 60003 }
      }
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        sql: 'DELETE FROM users WHERE id = ?',
        args: [60003],
        rowsAffected: 1
      }
    })
  },
  {
    id: 'http-update-ontology',
    code: 'API-03',
    name: '更新对象实例属性',
    method: 'PUT',
    path: '/http_rest_api/internal/v1/HttpUpdateOntology',
    category: '对象实例',
    description: '更新对象实例的一个或多个属性值。',
    useCase:
      '更新设备当前的电量、状态等动态参数；修改业务资产的归口管理部门或负责人信息。',
    notes: '路径参数 id 为对象实例 ID。',
    requestExample: createExample({
      ontology_object_type_code: 'gjx_1',
      set: [
        {
          column: 'status',
          value: { type: 'value', value: 'inactive' }
        }
      ],
      where: {
        op: '=',
        left: { type: 'column', name: 'id' },
        right: { type: 'value', value: 15 }
      }
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        sql: 'UPDATE users SET status = ? WHERE id = ?',
        args: ['inactive', 15],
        rowsAffected: 0
      }
    })
  },
  {
    id: 'http-query-ontology-list',
    code: 'API-04',
    name: '查询对象实例列表',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpQueryOntology',
    category: '对象实例',
    description: '按条件查询对象实例列表，支持字段筛选。',
    useCase: '管理后台展示某一类对象的完整列表；支持前端的分页展示需求。',
    requestExample: createExample({
      ontology_object_type_code: 'gjx_1',
      select: [
        { type: 'column', name: 'id' },
        { type: 'column', name: 'name' }
      ],
      where: {
        op: '=',
        left: { type: 'column', name: 'status' },
        right: { type: 'value', value: 'active' }
      }
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        sql: 'SELECT id, name FROM users WHERE status = ?',
        args: ['active'],
        results: [
          { id: 9, name: 'Alice' },
          { id: 60001, name: 'Alice' }
        ]
      }
    })
  },
  {
    id: 'http-delete-ontology-batch',
    code: 'API-05',
    name: '批量删除对象实例',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpDeleteOntology',
    category: '对象实例',
    description: '按条件批量删除对象实例（不支持 where in 语法）。',
    useCase:
      '对过期的历史任务数据进行一键清理；通过后台任务定时清除无效的临时对象。',
    requestExample: createExample({
      ontology_object_type_code: 'gjx_1',
      where: {
        op: '=',
        left: { type: 'column', name: 'id' },
        right: { type: 'value', value: 60003 }
      }
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        sql: 'DELETE FROM users WHERE id = ?',
        args: [60003],
        rowsAffected: 1
      }
    })
  },
  {
    id: 'http-create-ontology-link',
    code: 'API-06',
    name: '创建对象实例关联',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpCreateOntologyLink',
    category: '关联关系',
    description: '创建对象实例之间的关联关系，仅支持 N:N 关联方式。',
    useCase:
      '建立“无人机”与“所属站点”的业务绑定关系；将“维修记录”挂载到具体的“设备”上。',
    requestExample: createExample({
      ontology_object_type_code: 'gjx-link-test',
      columns: ['name', 'age', 'status'],
      values: [
        ['Alice', 252222, 'active'],
        ['Bob', 172222, 'inactive']
      ]
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        sql: 'INSERT INTO users (name, age, status) VALUES (?, ?, ?), (?, ?, ?)',
        args: ['Alice', 252222, 'active', 'Bob', 172222, 'inactive'],
        rowsAffected: 2
      }
    })
  },
  {
    id: 'http-delete-ontology-link',
    code: 'API-07',
    name: '删除对象实例关联',
    method: 'DELETE',
    path: '/http_rest_api/internal/v1/HttpDeleteOntologyLink',
    category: '关联关系',
    description: '删除对象实例之间的关联关系。',
    useCase:
      '员工调岗解除与原部门的“所属”关系；更正由于操作失误建立的错误关联。',
    requestExample: createExample({
      ontology_object_type_code: 'gjx-link-test',
      where: {
        op: '=',
        left: { type: 'column', name: 'id' },
        right: { type: 'value', value: 60005 }
      }
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        sql: 'DELETE FROM users WHERE id = ?',
        args: [60005],
        rowsAffected: 1
      }
    })
  },
  {
    id: 'http-query-ontology-complex',
    code: 'API-08',
    name: '复杂对象实例检索',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpQueryOntology',
    category: '对象实例',
    description: '与查询对象实例列表共用接口，支持更复杂的筛选条件组合。',
    useCase:
      '精准检索（例如：找出所有“北京地区”且“剩余电量低于20%”的“小型无人机”）。',
    requestExample: createExample({
      ontology_object_type_code: 'gjx_1',
      select: [
        { type: 'column', name: 'id' },
        { type: 'column', name: 'name' }
      ],
      where: {
        op: '=',
        left: { type: 'column', name: 'status' },
        right: { type: 'value', value: 'active' }
      }
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        sql: 'SELECT id, name FROM users WHERE status = ?',
        args: ['active'],
        results: [{ id: 9, name: 'Alice' }]
      }
    })
  },
  {
    id: 'http-ontology-traverse',
    code: 'API-09',
    name: '多对象实例关联查询',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpOntologyTraverse',
    category: '图遍历',
    description: 'Graph Traversal，按起点对象展开关联网络。',
    useCase:
      '拓扑追踪与关联追踪。例如：从某架无人机出发，查询其所属的编队，以及该编队中所有其他关联目标。',
    notes: '使用 code + value 作为全局唯一 id。',
    requestExample: createExample({
      code: 'contract',
      key: 'mdp_contract_id',
      value: 'CT-2024-001',
      depth: 3
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        nodes: [
          {
            ElementId: '4:7b4dba65-c487-40e0-ae69-d8de9947b0e4:84',
            code: 'contract',
            key: 'mdp_contract_id',
            value: 'CT-2024-001'
          }
        ],
        edges: [
          {
            StartElementId: '4:7b4dba65-c487-40e0-ae69-d8de9947b0e4:84',
            EndElementId: '4:7b4dba65-c487-40e0-ae69-d8de9947b0e4:114'
          }
        ]
      }
    })
  },
  {
    id: 'http-query-ontology-aggregate',
    code: 'API-10',
    name: '聚合统计',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpQueryOntology',
    category: '对象实例',
    description: '对对象实例执行聚合统计查询。',
    useCase:
      '汇总统计（例如：按“在线状态”汇总各型号设备的分布总数；统计各区域资产的累计总价值）。',
    requestExample: createExample({
      ontology_object_type_code: 'Person',
      select: [
        {
          type: 'agg',
          func: 'COUNT',
          args: [{ type: 'column', name: '*' }],
          alias: 'count'
        }
      ],
      where: {
        op: '=',
        left: { type: 'column', name: 'city' },
        right: { type: 'value', value: '北京' }
      }
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        sql: 'SELECT COUNT(*) AS count FROM user1 WHERE city = ?',
        args: ['北京'],
        results: [{ count: 5 }]
      }
    })
  },
  {
    id: 'http-ontology-execute-action',
    code: 'API-11',
    name: '执行业务行为 (Action)',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpOntologyExecuteAction',
    category: '行为',
    description: '触发本体场景中定义的业务行为，仅支持 HTTP API 调用。',
    useCase:
      '触发外部系统逻辑。例如：由大模型确认指令后，调用 API 触发无人机“立即返航”的硬件控制逻辑。',
    notes: 'Action 只能通过 HTTP API 调用，不能在 Function 中使用。',
    requestExample: createExample({
      ontologyModelID: 46,
      projectId: 'proj-1ueyp96h',
      run_config: {
        arguments: {
          action123: { arg1: 'abc' },
          action456: { arg1: 'def' }
        },
        run_action_with_validate: true,
        run_type: 'action',
        target: ['action123', 'action456']
      }
    }),
    responseExample: createExample({
      code: 'success',
      requestId: 'ontology-dataset-0da6bca9-69d0-4f3b-9416-9cfc3affd31c',
      statusCode: 0,
      data: {
        code: 'success',
        data: [{ id: 598, run_status: 3, run_log: 'Code generation failed' }]
      }
    })
  },
  {
    id: 'http-ontology-object-type-meta',
    code: 'API-12',
    name: '查询对象类型元数据',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpOntologyObjecTypetMeta',
    category: '元数据',
    description: '获取指定对象类型的完整 Schema，包括属性列表和关联关系。',
    useCase:
      '获取指定对象类型的完整定义，常用于为大模型（LLM）提供建模上下文。',
    notes: 'code、id、ontologyTableName 三个参数任意组合，至少传入一个。',
    requestExample: createExample({
      code: 'RisktPoin',
      id: 0,
      ontologyTableName: ''
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        code: 'SUCCESS',
        data: {
          code: 'RisktPoin',
          id: 117,
          name: '风险点',
          ontologyPhysicalPropertiesList: [{ name: 'id', comment: 'id' }]
        }
      }
    })
  },
  {
    id: 'http-upload-file',
    code: 'API-13',
    name: '上传附件',
    method: 'POST',
    path: '/file/internal/v1/UploadFile',
    category: '文件',
    description: '为特定对象实例上传关联附件（如图片、PDF 文档等）。',
    useCase:
      '为无人机巡检记录上传现场抓拍的图片；为关键资产设备绑定 PDF 格式的电子维修手册。',
    notes: '请求体为 multipart/form-data，字段名为 file。',
    requestExample: 'multipart/form-data\nfile=<binary>',
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        endPoint: '10.252.216.24:30900',
        bucket: 'ontology-dataset-service-dev',
        path: 'ontology-dataset-service-dev/20260310/f782ed2b-2870-4639-bf7e-6f7a7bc709bf/upload.bin'
      }
    })
  },
  {
    id: 'http-ontology-scene-meta',
    code: 'API-14',
    name: '查询场景/全局元数据',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpOntologyObjecTypetMeta',
    category: '元数据',
    description:
      '按场景或全部场景（全局）粒度返回本体元数据，包括对象类型、链接类型、行为类型及描述。',
    useCase:
      '便于大模型在调用实例级 API 前，先理解当前有哪些对象类型、它们如何关联、哪些对象类型上有哪些可执行行为。',
    requestExample: createExample({ id: 1 }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        code: 'SUCCESS',
        data: {
          id: 1,
          name: '对象类型1',
          ontologyPhysicalPropertiesList: [{ name: '物理属性1' }]
        }
      }
    })
  },
  {
    id: 'http-list-ontology-model',
    code: 'API-15',
    name: '查询场景库列表',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpListOntologyModel',
    category: '元数据',
    description: '分页查询本体场景库列表，支持名称和描述模糊搜索。',
    useCase: '获取项目下可用的本体场景库清单，供外部系统集成选择。',
    requestExample: createExample({
      filter: '',
      order: 'desc',
      orderBy: 'name',
      pageNo: 1,
      pageSize: 10,
      projectID: 'proj-1ueyp96h'
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        code: 'SUCCESS',
        data: {
          result: [
            { id: 4, name: '本体场景别删除呀', projectID: 'proj-1ueyp96h' }
          ],
          totalCount: 20
        }
      }
    })
  },
  {
    id: 'http-multi-query-ontology',
    code: 'API-16',
    name: '多表关联查询',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpMultiQueryOntology',
    category: '关联查询',
    description: '支持一对多、多对多等跨对象类型关联查询。',
    useCase: '联合查询多个对象类型及其关联数据，例如船舶与其航迹记录。',
    notes: 'join 中 code_type 为 link 时表示关联表编码，默认为 object。',
    requestExample: createExample({
      from: { ontology_object_type_code: 'Ship', alias: 's' },
      joins: [
        {
          type: 'LEFT',
          ontology_object_type_code: 'RouteRecord',
          alias: 'r',
          on: {
            op: '=',
            left: { type: 'column', table: 's', name: 'ship_id' },
            right: { type: 'column', table: 'r', name: 'ship_id' }
          }
        }
      ],
      select: [
        { type: 'column', table: 's', name: 'ship_id', alias: 'ship_id' },
        { type: 'column', table: 's', name: 'name', alias: 'name' }
      ],
      limit: 20,
      offset: 0
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        sql: 'SELECT s.ship_id AS ship_id, s.name AS name FROM ship s LEFT JOIN RouteRecord r ON s.ship_id = r.ship_id LIMIT ? OFFSET ?',
        args: [20, 0],
        results: [{ ship_id: 'T_AGS62', name: '“鲍迪奇”号海洋测量船' }]
      }
    })
  },
  {
    id: 'http-list-ontology-object-type',
    code: 'API-17',
    name: '查询对象类型列表',
    method: 'POST',
    path: '/http_rest_api/internal/v1/HttpListOntologyObjectType',
    category: '元数据',
    description: '分页查询对象类型列表，可按场景过滤。',
    useCase: '获取项目或场景下已注册的对象类型清单。',
    requestExample: createExample({
      pageNo: 1,
      pageSize: 10
    }),
    responseExample: createExample({
      code: 'success',
      requestId: '',
      statusCode: 0,
      data: {
        code: 'SUCCESS',
        data: {
          result: [
            { id: 160, code: 'demo01', name: 'demo01', ontologyModelID: 54 }
          ],
          totalCount: 121
        }
      }
    })
  }
];

export const getCatalogItemById = (id: string) =>
  ONTOLOGY_API_CATALOG.find((item) => item.id === id);
