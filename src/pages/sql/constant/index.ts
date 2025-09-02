export const SQL_EDITOR_HEIGHT = '300px';

export const DATAFRAMES_LIST = [
  {
    id: 'root_001',
    name: '管理机器人项目',
    type: 'folder',
    children: [
      {
        id: 'ds_001',
        name: '销售管理平台',
        type: 'database',
        children: [
          {
            id: 'schema_001',
            name: 'custom',
            type: 'schema',
            children: [
              {
                id: 'tbl_001',
                name: 'users',
                type: 'table',
                comment: '用户信息表',
                children: [
                  {
                    id: 'tbl_001_001',
                    name: '字段1',
                    type: 'field'
                  },
                  {
                    id: 'tbl_001_002',
                    name: '字段2',
                    type: 'field'
                  }
                ]
              },
              {
                id: 'tbl_002',
                name: 'orders',
                type: 'table',
                comment: '订单表'
              }
            ]
          }
        ]
      },
      {
        id: 'ds_002',
        name: '经营报表系统',
        type: 'database',
        children: [
          {
            id: 'schema_002',
            name: 'custom',
            type: 'schema',
            children: [
              {
                id: 'tbl_003',
                name: 'products',
                type: 'table',
                comment: '产品表'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'root_002',
    name: '测试环境',
    type: 'folder',
    children: [
      {
        id: 'ds_test_001',
        name: '测试数据库',
        type: 'database',
        children: []
      }
    ]
  }
];

export const DATASETS_LIST = [
  {
    id: 'tbl_001',
    name: 'users',
    type: 'table',
    comment: '用户信息表',
    children: [
      {
        id: 'tbl_001_001',
        name: '字段1',
        type: 'field'
      },
      {
        id: 'tbl_001_002',
        name: '字段2',
        type: 'field'
      }
    ]
  },
  {
    id: 'tbl_002',
    name: 'products',
    type: 'table',
    comment: '产品表',
    children: [
      {
        id: 'tbl_002_001',
        name: '字段1',
        type: 'field'
      },
      {
        id: 'tbl_002_002',
        name: '字段2',
        type: 'field'
      }
    ]
  }
];

export const SCRIPTS_LIST = [
  {
    id: '1',
    name: '全部',
    type: 'all',
    children: [
      {
        id: '1_1',
        name: 'SQL脚本名称1',
        type: 'script'
      },
      {
        id: '1_2',
        name: 'SQL脚本名称2',
        type: 'script'
      },
      {
        id: '1_3',
        name: 'SQL脚本名称3',
        type: 'script'
      }
    ]
  }
];

export const SQL_EDITOR_TABS = [
  {
    title: 'SQL脚本名称1',
    key: '1',
    status: 'done',
    error: null,
    content: "SELECT * FROM users WHERE name = 'SQL脚本名称1';"
  },
  {
    title: 'SQL脚本名称2',
    key: '2',
    status: 'process',
    error: null,
    content: "SELECT * FROM users WHERE name = 'SQL脚本名称2';"
  },
  {
    title: 'SQL脚本名称3',
    key: '3',
    status: 'done',
    error: { msg: 'SQL脚本语法错误' },
    content: "SELECT * FROM users WHERE name = 'SQL脚本名称3';"
  },
  {
    title: 'SQL脚本名称4',
    key: '4',
    status: 'init',
    error: null,
    content: ''
  }
];

export const DATASET_LIST_MOCK = [
  {
    id: 1,
    script_name: 'SQL脚本名称1',
    dataset_name: '数据集名称1',
    dataset_table_name: '存储表名称1',
    export_status: 1,
    export_start_time: '2024-10-01 10:05:00'
  },
  {
    id: 2,
    script_name: 'SQL脚本名称2',
    dataset_name: '数据集名称2',
    dataset_table_name: '存储表名称2',
    export_status: 0,
    export_start_time: '2024-10-02 11:15:00'
  },
  {
    id: 3,
    script_name: 'SQL脚本名称3',
    dataset_name: '数据集名称3',
    dataset_table_name: '存储表名称3',
    export_status: 2,
    export_start_time: '2024-10-03 14:20:00'
  },
  {
    id: 4,
    script_name: 'SQL脚本名称4',
    dataset_name: '数据集名称4',
    dataset_table_name: '存储表名称4',
    export_status: 1,
    export_start_time: '2024-10-04 09:30:00'
  },
  {
    id: 5,
    script_name: 'SQL脚本名称5',
    dataset_name: '数据集名称5',
    dataset_table_name: '存储表名称5',
    export_status: 0,
    export_start_time: '2024-10-05 16:45:00'
  }
];

interface DatasetListParams {
  page?: number;
  page_size?: number;
  search_content?: string;
}

interface DatasetItem {
  id: number;
  script_name: string;
  dataset_name: string;
  dataset_table_name: string;
  /** 0: 导出中, 1: 导出成功, 2: 导出失败 */
  export_status: number;
  export_start_time: string;
}

interface DatasetListRes {
  data: {
    items: DatasetItem[];
    total: number;
    page: number;
    page_size: number;
  };
}

export function getDatasetList(
  params: DatasetListParams
): Promise<DatasetListRes> {
  console.log('getDatasetList params:', params);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          items: DATASET_LIST_MOCK,
          total: 3,
          page: params?.page || 1,
          page_size: params?.page_size || 10
        }
      });
    }, 500);
  });
}

export const DATASET_SOURCE_LIST = [
  {
    id: 1,
    name: 'nationkey',
    c_name: '国家编号',
    comment: '国家编号，主键'
  },
  {
    id: 2,
    name: 'name',
    c_name: '名称',
    comment: '国家名称'
  },
  {
    id: 3,
    name: 'regionkey',
    c_name: '区域编号',
    comment: '区域编号，外键，关联region表'
  },
  {
    id: 4,
    name: 'comment',
    c_name: '备注',
    comment: '国家备注信息'
  }
];

export const DATASET_STORAGE_TYPE_LIST = [
  { label: '数据库表', value: 'table' }
];

export const DATASET_TAG_LIST = [];

export const DATASET_LIST = [];
