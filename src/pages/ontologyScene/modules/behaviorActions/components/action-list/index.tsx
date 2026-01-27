import React, { useMemo, useState } from 'react';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behavior_actions';
import {
  Button,
  Form,
  Input,
  Space,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import styles from './index.module.scss';
import { IconEdit, IconPlus, IconSearch } from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  ProButton,
  SearchTable
} from '@ceai-front/arco-material';
import { ONTOLOGY_SCENE_MENU_ITEM_KEYS } from '@/common/constants';
import { useHistory, useParams } from 'react-router-dom';
import useArcoTable from '@/hooks/use-arco-table';

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

const OBJECT_TYPE_COLORS: Record<string, string> = {
  多媒体情报: 'orangered',
  战斗机: 'arcoblue',
  无人机: 'green'
};

const OBJECT_TYPE_FILTERS = Array.from(
  new Set(MOCK_ACTIONS.map((item) => item.objectType))
).map((type) => ({
  text: type,
  value: type
}));

export const ActionList = (props: {
  onViewDetail: (data: BehaviorActionItem) => void;
}) => {
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();
  const [data] = useState<BehaviorActionItem[]>(MOCK_ACTIONS);
  const { id: OSId, moduleType = ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH } =
    useParams<{
      id: string;
      moduleType: string;
    }>();

  const history = useHistory();

  const { tableProps, onSubmit, refresh } = useArcoTable(
    () => {
      return Promise.resolve({
        items: MOCK_ACTIONS,
        total: MOCK_ACTIONS.length
      });
    },
    {
      defaultPageSize: 10,
      form
    }
  );

  const route2ActionDetail = (
    type?: 'view' | 'edit' | 'create',
    data?: BehaviorActionItem
  ) => {
    const baseUrl = '/tenant/compute/modaforge/ontologyScene/detail';
    history.push(
      `${baseUrl}/${OSId}/behaviorActions/${type}/${data ? data.id : '_NEW_'}`
    );
  };

  const columns: TableColumnProps<BehaviorActionItem>[] = [
    {
      title: '行为动作名称',
      dataIndex: 'name',
      render: (value, record) => (
        <div
          className={
            'hover-blue font-PingFangSc text-[14px] font-medium leading-[22px] '
          }
          onClick={() => {
            props.onViewDetail(record);
          }}
        >
          {value}
        </div>
      )
    },
    {
      title: '描述说明',
      dataIndex: 'description',
      ellipsis: true,
      tooltip: true,
      width: 200
    },
    {
      title: '所属对象类型',
      dataIndex: 'objectType',
      filters: OBJECT_TYPE_FILTERS,
      width: 200,
      onFilter: (value, record) => record.objectType === value,
      render: (value) => (
        <div className={'flex w-full items-center gap-2 overflow-hidden'}>
          {/*todo icon渲染占位*/}
          <IconEdit />
          <div
            className={
              'hover-blue overflow-hidden text-ellipsis whitespace-nowrap font-PingFangSc text-[14px] font-medium leading-[22px] '
            }
          >
            {value}
          </div>
        </div>
      )
    },
    {
      title: '函数',
      dataIndex: 'functionName',
      render: (value) => (
        <div
          className={
            'hover-blue w-full overflow-hidden text-ellipsis whitespace-nowrap font-PingFangSc text-[14px] font-normal leading-[22px] '
          }
        >
          {value}
        </div>
      )
    },
    {
      title: '唯一标识',
      dataIndex: 'identifier',
      render: (value, record) => {
        if (!value) return '-';
        return (
          <div className={'flex gap-2 overflow-hidden'}>
            <div
              className={
                'w-max overflow-hidden text-ellipsis whitespace-nowrap font-PingFangSc text-[14px] font-normal leading-[22px]'
              }
            >
              {value}
            </div>
            <CopyItemIcon className={'hidden flex-shrink-0'} value={value} />
          </div>
        );
      }
    },
    {
      title: '参数',
      dataIndex: 'params',
      render: (value) => (
        <div
          className={
            'hover-blue font-PingFangSc text-[14px] font-normal leading-[22px]'
          }
        >
          {value}
        </div>
      )
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
              route2ActionDetail('edit', record);
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
    <div className={styles['action-list']}>
      <div>
        <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-default">
          行为动作
        </div>
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
          定义可在对象上执行的操作，封装业务逻辑与状态流转
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
            onClick={() => route2ActionDetail('create')}
          >
            创建行为动作
          </ProButton>
        }
        tableProps={{
          ...tableProps,
          columns
        }}
        className={styles['action-table']}
      />
    </div>
  );
};
