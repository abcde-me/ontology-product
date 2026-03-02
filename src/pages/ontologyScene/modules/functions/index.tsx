import React, { useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Message,
  Modal,
  Space,
  TableColumnProps,
  Tabs
} from '@arco-design/web-react';
import styles from './index.module.scss';
import { useHistory, useParams } from 'react-router-dom';
import useArcoTable from '@/hooks/use-arco-table';
import { IconPlus, IconSearch } from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  ProButton,
  SearchTable
} from '@ceai-front/arco-material';
import { SafeTableCell } from '@/components/SafeTableCell';
import { OntologyFunctionItem } from '@/pages/ontologyScene/types/ontologyFunction';
import {
  deleteFunction,
  getFunctionList
} from '@/api/ontologySceneLibrary/ontologyFunction';
import { isEmpty, isNil } from 'lodash-es';
import { OsEmptyStatusWrapper } from '@/pages/ontologyScene/componens';
import { FunctionDetailDrawer } from '@/pages/ontologyScene/modules/functionDetail/components';

// 函数
export default function OntologySceneFunctions() {
  const [form] = Form.useForm();
  const { id: ontologyModelID } = useParams<{
    id: string;
    moduleType: string;
  }>();
  // 当前查看的函数
  const [currentFunction, setCurrentFunction] =
    useState<OntologyFunctionItem>();
  const history = useHistory();
  const [functionsEmpty, setFunctionsEmpty] = useState(false);
  const { tableProps, onSubmit, refresh } = useArcoTable(
    ({ pagination, query, filters, sorter }) => {
      if (isNil(ontologyModelID))
        return Promise.resolve({
          items: [],
          total: 0
        });
      return getFunctionList({
        ontologyModelID: +ontologyModelID,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        ...query
      }).then((res) => {
        setFunctionsEmpty(!query?.filter && !res.items?.length);
        return res;
      });
    },
    {
      defaultPageSize: 10,
      form,
      deps: [ontologyModelID]
    }
  );

  const route2FunctionDetail = (
    type?: 'view' | 'edit' | 'create',
    data?: OntologyFunctionItem
  ) => {
    const baseUrl = '/tenant/compute/modaforge/ontologyScene/detail';
    history.push(
      `${baseUrl}/${ontologyModelID}/functions/${type}/${data ? data.id : '_NEW_'}`
    );
  };

  const handleDelete = (record: OntologyFunctionItem) => {
    Modal.confirm({
      title: `确定删除${record.name}吗？`,
      content: '删除后，不可恢复',
      onOk: () => {
        deleteFunction(record.id!).then((res) => {
          Message.success({
            content: '删除成功',
            duration: 0.5,
            onClose: refresh
          });
        });
      }
    });
  };

  const columns: TableColumnProps<OntologyFunctionItem>[] = [
    {
      title: '显示名称',
      dataIndex: 'name',
      render: (value, record) => (
        <div
          className={
            'hover-blue font-PingFangSc text-[14px] font-medium leading-[22px] '
          }
          onClick={() => {
            setCurrentFunction(record);
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
            onClick={() => {
              handleDelete(record);
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <OsEmptyStatusWrapper
      className={`flex h-full w-full flex-col gap-4 overflow-hidden bg-white ${styles['function']}`}
      onCreate={() => {
        route2FunctionDetail('create');
      }}
      title={'函数'}
      description={'函数的描述'}
      empty={functionsEmpty && !tableProps.loading}
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
              <Form form={form} autoComplete={'off'}>
                <Form.Item noStyle field={'filter'}>
                  <Input
                    className={'w-[220px]'}
                    placeholder={'请输入关键字'}
                    onChange={onSubmit}
                    allowClear
                    suffix={
                      <div
                        className={`mr-[-12px] flex h-full items-center border-l-[1px] border-solid border-l-[#C3C7D4] bg-[#F5F7FC] px-3 ${styles['search']}`}
                      >
                        <IconSearch onClick={onSubmit} />
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
      <FunctionDetailDrawer
        data={currentFunction?.id}
        visible={!!currentFunction}
        onEdit={() => route2FunctionDetail('edit', currentFunction)}
        onCancel={() => {
          setCurrentFunction(undefined);
        }}
      />
    </OsEmptyStatusWrapper>
  );
}
