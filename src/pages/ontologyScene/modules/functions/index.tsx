import React, { useState, useEffect } from 'react';
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
import useUrlState from '@ahooksjs/use-url-state';
import { SafeTableCell } from '@/components/SafeTableCell';
import {
  FunctionListQuery,
  OntologyFunctionItem
} from '@/pages/ontologyScene/types/ontologyFunction';
import {
  deleteFunction,
  getFunctionDetail,
  getFunctionList
} from '@/api/ontologySceneLibrary/ontologyFunction';
import { isEmpty, isNil } from 'lodash-es';
import { OsEmptyStatusWrapper } from '@/pages/ontologyScene/componens';
import { FunctionDetailDrawer } from '@/pages/ontologyScene/modules/functionDetail/components';
import { SorterInfo } from '@arco-design/web-react/lib/Table/interface';

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
  const [urlState, setUrlState] = useUrlState({ search: '' });
  const { tableProps, onSubmit, refresh } = useArcoTable(
    ({ pagination, query, filters, sorter }) => {
      if (isNil(ontologyModelID))
        return Promise.resolve({
          items: [],
          total: 0
        });
      const filterParams: FunctionListQuery = {
        ontologyModelID: +ontologyModelID,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        ...(query as Record<string, any>)
      };
      if (!isNil(sorter)) {
        filterParams.order =
          (sorter as SorterInfo).direction === 'ascend' ? 'asc' : 'desc';
        filterParams.orderBy = (sorter as SorterInfo).field as string;
      }
      return getFunctionList(filterParams).then((res) => {
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

  // 从 URL 的 search 参数同步到表单
  useEffect(() => {
    const currentFilter = form.getFieldValue('filter');
    const searchValue = urlState.search || '';
    if (searchValue !== '' && searchValue !== currentFilter) {
      form.setFieldsValue({ filter: searchValue });
      // 延迟提交，确保表单值已设置
      setTimeout(() => {
        onSubmit();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlState.search]);

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
    getFunctionDetail(record.id!).then((res) => {
      if (res.boundAction)
        return Message.warning('该函数已被行为绑定，请先解绑再删除');
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
    });
  };

  const columns: TableColumnProps<OntologyFunctionItem>[] = [
    {
      title: '显示名称',
      dataIndex: 'name',
      width: 200,
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
      title: '描述说明',
      dataIndex: 'description',
      ellipsis: true
    },
    {
      title: '函数名称(id)',
      dataIndex: 'code',
      ellipsis: true,
      tooltip: true,
      width: 250,
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
      dataIndex: 'updatedAt',
      render: (value) => {
        return <SafeTableCell value={value} />;
      },
      width: 250
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
      ),
      width: 150
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
              <Form form={form} autoComplete={'off'}>
                <Form.Item noStyle field={'filter'}>
                  <Input.Search
                    autoComplete="off"
                    className={'w-[220px]'}
                    placeholder={'请输入关键字'}
                    allowClear
                    onSearch={(value) => {
                      setUrlState({ search: value || '' });
                      onSubmit();
                    }}
                    onClear={() => {
                      setUrlState({ search: '' });
                      onSubmit();
                    }}
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
    </div>
  );
}
