import React, { useMemo, useState, useEffect } from 'react';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Space,
  Table,
  TableColumnProps,
  Tooltip
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
import useUrlState from '@ahooksjs/use-url-state';
import useArcoTable from '@/hooks/use-arco-table';
import {
  deleteAction,
  getActionList
} from '@/api/ontologySceneLibrary/ontologyAction';
import { isNil } from 'lodash-es';
import ObjectTypeTag from '@/pages/ontologyScene/components/ObjectTypeTag';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/components/ObjectTypeDetailDrawer';
import { FunctionDetailDrawer } from '@/pages/ontologyScene/components/FunctionDetailDrawer';
import {
  ContentWithCopy,
  EllipsisPopover,
  OntoModal
} from '@/pages/ontologyScene/components';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';
import { useRequest } from 'ahooks';
import { fetchSceneObjectTypes } from '@/utils/enrichLinkTypeObjectTypes';
import {
  buildBehaviorObjectTypeLookup,
  isGlobalBehaviorObjectType,
  resolveBehaviorObjectTypeDisplay
} from '@/pages/ontologyScene/modules/behaviorActions/services/resolveBehaviorObjectType';

const baseUrl = '/tenant/compute/onto/ontologyScene/detail';

export const ActionList = (props: {
  onViewDetail: (data?: BehaviorActionItem) => void;
}) => {
  // 查看的对象类型
  const [currentObj, setCurrentObj] = useState<string>();
  // 查看的函数
  const [currentFunction, setCurrentFunction] = useState<number>();
  const [form] = Form.useForm();
  const { id: OSId, moduleType = ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH } =
    useParams<{
      id: string;
      moduleType: string;
    }>();
  const [urlState, setUrlState] = useUrlState({ search: '' });

  const history = useHistory();

  const { data: objectTypeLookup } = useRequest(
    async () => {
      if (isNil(OSId)) {
        return new Map<number, { name: string; icon?: string }>();
      }
      const objectTypes = await fetchSceneObjectTypes(+OSId);
      return buildBehaviorObjectTypeLookup(objectTypes);
    },
    {
      refreshDeps: [OSId]
    }
  );

  const { tableProps, onSubmit, refresh } = useArcoTable(
    ({ pagination, query = {} }) => {
      if (isNil(OSId)) {
        return Promise.resolve({
          items: [] as BehaviorActionItem[],
          total: 0
        });
      }
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

  const closeDrawer = () => {
    setCurrentObj(undefined);
    setCurrentFunction(undefined);
    props.onViewDetail(undefined);
  };

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

  const route2ActionDetail = (
    type?: 'view' | 'edit' | 'create',
    data?: BehaviorActionItem
  ) => {
    history.push(
      `${baseUrl}/${OSId}/behaviorActions/${type}/${data ? data.id : '_NEW_'}`
    );
  };

  const columns: TableColumnProps<BehaviorActionItem>[] = [
    {
      title: '行为名称',
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
      render: (value, record) => (
        <div
          className={'max-w-full overflow-hidden'}
          onClick={() => {
            closeDrawer();
            props.onViewDetail(record);
          }}
        >
          <EllipsisPopover
            className={
              'hover-blue font-PingFangSc text-[14px] font-medium leading-[22px]'
            }
            value={value || '-'}
            preferTypography
            ellipsis={{
              showTooltip: {
                type: 'tooltip'
              }
            }}
          />
        </div>
      )
    },
    {
      title: '描述说明',
      dataIndex: 'description',
      ellipsis: true,
      tooltip: true,
      render(v) {
        return (
          <EllipsisPopover
            value={v || '-'}
            preferTypography
            ellipsis={{
              showTooltip: { type: 'tooltip' }
            }}
          />
        );
      }
    },
    {
      title: '绑定对象类型',
      dataIndex: 'objectTypeName',
      filters: [],
      width: 200,
      onFilter: (value, record) => record.objectType === value,
      render: (_, actionDetail) => {
        const objectTypeDisplay = resolveBehaviorObjectTypeDisplay(
          actionDetail,
          objectTypeLookup
        );

        const displayName =
          objectTypeDisplay.objectTypeName ||
          (isGlobalBehaviorObjectType(objectTypeDisplay.objectTypeId)
            ? '全局行为'
            : '-');

        return (
          <ObjectTypeTag
            ontologyObjectTypeIcon={objectTypeDisplay.objectTypeIcon || '-'}
            ontologyObjectTypeName={displayName}
            ontologyObjectTypeId={String(objectTypeDisplay.objectTypeId ?? '')}
            onClick={
              isGlobalBehaviorObjectType(objectTypeDisplay.objectTypeId)
                ? undefined
                : () => {
                    closeDrawer();
                    setCurrentObj(
                      (objectTypeDisplay.objectTypeId || '').toString()
                    );
                  }
            }
            className={styles['obj-tag']}
            showFullName
          />
        );
      }
    },
    {
      title: '函数',
      dataIndex: 'functionName',
      render: (value, record) => (
        <div
          className={'max-w-full overflow-hidden'}
          onClick={() => {
            closeDrawer();
            setCurrentFunction(record.functionId);
          }}
        >
          <EllipsisPopover
            className={'hover-blue text-[14px] font-normal leading-[22px] '}
            value={value}
            preferTypography
            ellipsis={{ showTooltip: { type: 'tooltip' } }}
          />
        </div>
      )
    },
    {
      title: '行为id',
      dataIndex: 'code',
      render: (value, record) => {
        if (!value) return '-';
        return <ContentWithCopy value={value} />;
      }
    },
    {
      title: '操作',
      dataIndex: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size={16}>
          <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
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
          </PermissionWrapper>
          <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.DELETE}>
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
          </PermissionWrapper>
        </Space>
      )
    }
  ];

  const handleDelete = (record: BehaviorActionItem) => {
    OntoModal.confirm({
      title: `确定删除${record.name}吗？`,
      content: '删除后，不可恢复',
      onOk: () => {
        deleteAction(record.id!).then((res) => {
          Message.success({
            content: '删除成功',
            duration: 3000
          });
          refresh();
        });
      }
    });
  };

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
            <Form.Item noStyle field={'filter'}>
              <Input.Search
                autoComplete="off"
                className={'w-[220px]'}
                placeholder={'请输入行为名称或行为id'}
                allowClear
                onClear={() => {
                  setUrlState({ search: '' });
                  onSubmit();
                }}
                onSearch={(value) => {
                  setUrlState({ search: value || '' });
                  onSubmit();
                }}
              />
            </Form.Item>
          </Form>
        }
        addButton={
          <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.CREATE}>
            <ProButton
              icon={<IconPlus />}
              onClick={() => route2ActionDetail('create')}
              type={'primary'}
            >
              创建行为动作
            </ProButton>
          </PermissionWrapper>
        }
        tableProps={{
          ...tableProps,
          columns,
          border: false,
          scroll: {
            x: 1000
          }
        }}
        className={styles['action-table']}
      />
      <ObjectTypeDetailDrawer
        visible={!!currentObj}
        onClose={() => {
          setCurrentObj(undefined);
        }}
        objectTypeId={currentObj}
      />
      <FunctionDetailDrawer
        data={currentFunction}
        visible={!!currentFunction}
        onEdit={() => {
          history.push(`${baseUrl}/${OSId}/functions/edit/${currentFunction}`);
        }}
        onCancel={() => {
          setCurrentFunction(undefined);
        }}
      />
    </div>
  );
};
