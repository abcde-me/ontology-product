import React, { useMemo, useState } from 'react';
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
import { ProButton } from '@ceai-front/arco-material';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behavior_actions';

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

// 行为动作
export default function OntologySceneBehaviorActions() {
  const [keyword, setKeyword] = useState('');
  const [data] = useState<BehaviorActionItem[]>(MOCK_ACTIONS);

  const filteredData = useMemo(() => {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) return data;
    return data.filter((item) => item.name.includes(normalizedKeyword));
  }, [data, keyword]);

  const columns: TableColumnProps<BehaviorActionItem>[] = useMemo(
    () => [
      {
        title: '行为动作名称',
        dataIndex: 'name',
        render: (value) => (
          <div
            className={
              'hover-blue font-PingFangSc text-[14px] font-medium leading-[22px] '
            }
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
        dataIndex: 'identifier'
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
        render: () => (
          <Space size={16}>
            <Button
              type={'text'}
              className={
                'p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary'
              }
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
    ],
    []
  );

  return (
    <div
      className={`flex flex-col gap-4 ${styles['action-list']} h-full w-full bg-white p-6`}
    >
      <div>
        <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-default">
          行为动作
        </div>
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
          定义可在对象上执行的操作，封装业务逻辑与状态流转
        </div>
      </div>
      <div className={'flex items-center justify-between'}>
        <Form>
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
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          <ProButton type={'outline'} icon={<IconPlus />}>
            行为动作测试
          </ProButton>
          <ProButton icon={<IconPlus />}>创建动作行为</ProButton>
        </div>
      </div>
      <Table
        rowKey="id"
        border={false}
        columns={columns}
        className={styles['action-table']}
        data={filteredData}
        pagination={false}
        scroll={{ x: 960 }}
      />
    </div>
  );
}
