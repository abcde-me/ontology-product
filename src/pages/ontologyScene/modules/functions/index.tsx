import React, { useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Space,
  TableColumnProps,
  Tabs
} from '@arco-design/web-react';
import styles from './index.module.scss';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import { ONTOLOGY_SCENE_MENU_ITEM_KEYS } from '@/common/constants';
import { useHistory, useParams } from 'react-router-dom';
import useArcoTable from '@/hooks/use-arco-table';
import { IconPlus, IconSearch } from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  ProButton,
  SearchTable
} from '@ceai-front/arco-material';
import { SafeTableCell } from '@/components/SafeTableCell';
import { OnFunctionItem } from '@/pages/ontologyScene/types/osFunction';
import { getFunctionList } from '@/api/ontologyScene/onFunction';

const MOCK_ACTIONS: BehaviorActionItem[] = [
  {
    id: 'action-1',
    name: '实体识别',
    description: '占位文字占位文字占位文字占位文字占位文字占位文字',
    objectType: '多媒体情报',
    functionName: '关联推理',
    identifier: 'ActionIdentify',
    params: 32
  },
  {
    id: 'action-2',
    name: '关联分析与印证',
    description: '占位文字占位文字占位文字占位文字占位文字占位文字',
    objectType: '战斗机',
    functionName: '多源情报融合',
    identifier: 'type',
    params: 24
  },
  {
    id: 'action-3',
    name: '威胁研判',
    description: '占位文字占位文字占位文字占位文字占位文字占位文字',
    objectType: '无人机',
    functionName: '威胁空间分析',
    identifier: 'source',
    params: 67
  },
  {
    id: 'action-4',
    name: '威胁研判',
    description: '占位文字占位文字占位文字占位文字占位文字占位文字',
    objectType: '无人机',
    functionName: '关联推理',
    identifier: 'source',
    params: 67
  }
];

const OBJECT_TYPE_FILTERS = Array.from(
  new Set(MOCK_ACTIONS.map((item) => item.objectType))
).map((type) => ({
  text: type,
  value: type
}));

// 函数
export default function OntologySceneFunctions() {
  const [form] = Form.useForm();
  const { id: OSId, moduleType = ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH } =
    useParams<{
      id: string;
      moduleType: string;
    }>();

  const history = useHistory();

  const { tableProps, onSubmit, refresh } = useArcoTable(
    ({ pagination, query, filters, sorter }) => {
      return getFunctionList({});
    },
    {
      defaultPageSize: 10,
      form
    }
  );

  const route2FunctionDetail = (
    type?: 'view' | 'edit' | 'create',
    data?: OnFunctionItem
  ) => {
    const baseUrl = '/tenant/compute/modaforge/ontologyScene/detail';
    history.push(
      `${baseUrl}/${OSId}/functions/${type}/${data ? data.id : '_NEW_'}`
    );
  };

  const columns: TableColumnProps<OnFunctionItem>[] = [
    {
      title: '显示名称',
      dataIndex: 'name',
      render: (value, record) => (
        <div
          className={
            'hover-blue font-PingFangSc text-[14px] font-medium leading-[22px] '
          }
          onClick={() => {
            // props.onViewDetail(record);
          }}
        >
          {value}
        </div>
      )
    },
    {
      title: '函数名称(id)',
      dataIndex: 'code',
      ellipsis: true,
      tooltip: true,
      width: 200,
      render(value) {
        return (
          <div className={'flex gap-2 overflow-hidden'}>
            <div
              className={
                'w-max overflow-hidden text-ellipsis whitespace-nowrap font-PingFangSc text-[14px] font-normal leading-[22px]'
              }
            >
              {value}
            </div>
            <CopyItemIcon
              className={'hover-blue hidden flex-shrink-0'}
              value={value}
            />
          </div>
        );
      }
    },
    {
      title: '最近修改时间',
      sorter: true,
      dataIndex: 'functionName',
      render: (value) => {
        return <SafeTableCell value={value} />;
      }
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (_, record) => (
        <Space size={16}>
          <Button
            type={'text'}
            className={
              'p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary'
            }
            onClick={() => {
              route2FunctionDetail('edit', record);
            }}
          >
            编辑
          </Button>
          <Button
            type={'text'}
            className={
              'p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary'
            }
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div
      className={`flex h-full w-full flex-col gap-4 overflow-hidden bg-white ${styles['function']}`}
    >
      <div className={styles['function-content']}>
        <div className={styles['function-list']}>
          <div>
            <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-default">
              函数
            </div>
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
              用于定义计算属性和行为逻辑的底层代码实现
            </div>
          </div>
          <SearchTable
            searchForm={
              <Form form={form}>
                <Form.Item noStyle>
                  <Input
                    className={'w-[220px]'}
                    placeholder={'请输入关键字'}
                    suffix={
                      <div
                        className={`mr-[-12px] flex h-full items-center border-l-[1px] border-solid border-l-[#C3C7D4] bg-[#F5F7FC] px-3 ${styles['search']}`}
                      >
                        <IconSearch />
                      </div>
                    }
                  />
                </Form.Item>
              </Form>
            }
            addButton={
              <ProButton
                icon={<IconPlus />}
                onClick={() => route2FunctionDetail('create')}
              >
                创建函数
              </ProButton>
            }
            tableProps={{
              ...tableProps,
              columns
            }}
            className={styles['function-table']}
          />
        </div>
      </div>
    </div>
  );
}
