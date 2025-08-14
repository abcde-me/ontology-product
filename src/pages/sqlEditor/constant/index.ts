export const SQL_EDITOR_HEIGHT = '300px';

export const DATAFRAMES_LIST = [
  {
    id: 'root_001',
    name: '生产环境',
    type: 'folder',
    children: [
      {
        id: 'ds_001',
        name: '用户数据库',
        type: 'database',
        icon: 'database',
        children: [
          {
            id: 'schema_001',
            name: 'public',
            type: 'schema',
            children: [
              {
                id: 'tbl_001',
                name: 'users',
                type: 'table',
                icon: 'table',
                comment: '用户信息表'
              },
              {
                id: 'tbl_002',
                name: 'orders',
                type: 'table',
                icon: 'table',
                comment: '订单表'
              }
            ]
          }
        ]
      },
      {
        id: 'ds_002',
        name: '订单数据库',
        type: 'database',
        icon: 'database',
        children: [
          {
            id: 'schema_002',
            name: 'public',
            type: 'schema',
            children: [
              {
                id: 'tbl_003',
                name: 'products',
                type: 'table',
                icon: 'table',
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
        icon: 'database',
        children: []
      }
    ]
  }
];

export const DATASETS_LIST = [{}];

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
