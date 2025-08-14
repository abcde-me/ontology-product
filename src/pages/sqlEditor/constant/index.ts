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

export const SQL_EDITOR_TABS = [
  {
    title: 'SQL脚本名称1',
    key: '1',
    content: "SELECT * FROM users WHERE name = 'SQL脚本名称1';"
  },
  {
    title: 'SQL脚本名称2',
    key: '2',
    content: "SELECT * FROM users WHERE name = 'SQL脚本名称2';"
  },
  {
    title: 'SQL脚本名称3',
    key: '3',
    content: "SELECT * FROM users WHERE name = 'SQL脚本名称3';"
  }
];
