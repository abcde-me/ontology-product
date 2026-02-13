import React, { useMemo, useState } from 'react';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
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
import { getActionList } from '@/api/ontologySceneLibrary/ontologyAction';
import { isEmpty, isNil } from 'lodash-es';

export const ActionList = (props: {
  onViewDetail: (data: BehaviorActionItem) => void;
}) => {
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();
  const { id: OSId, moduleType = ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH } =
    useParams<{
      id: string;
      moduleType: string;
    }>();

  const history = useHistory();

  const { tableProps, onSubmit, refresh } = useArcoTable(
    ({ pagination, query = {} }) => {
      if (isNil(OSId))
        return Promise.resolve({
          data: [],
          total: 0
        });
      const search = {
        pageNum: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
        ontologyModelID: +OSId,
        ...(query as any)
      };
      return getActionList(search);
    },
    {
      defaultPageSize: 10,
      form,
      deps: [OSId]
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
      title: '行为名称',
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
      title: '绑定对象类型',
      dataIndex: 'objectTypeName',
      filters: [],
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
      title: '行为id',
      dataIndex: 'id',
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
      title: '资源id',
      dataIndex: 'code',
      sorter: true,
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
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
          行为定义可在对象上执行的操作，封装业务逻辑与状态流转
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
