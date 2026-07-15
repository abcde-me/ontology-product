import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Pagination,
  Select
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { GlobalTooltip, SearchTable } from '@ceai-front/arco-material';
import { useHistory } from 'react-router-dom';
import LinkDetailDrawer from '@/pages/ontologyScene/modules/links/components/LinkDetailDrawer';
import { getLinkTypeText } from '@/pages/ontologyScene/utils';
import { LinkType } from '@/types/graphApi';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';
import {
  LINK_TYPE_QUERY_OPTIONS,
  SCENE_QUERY_ALL_VALUE
} from '@/pages/exploreAnalysis/ontologyQuery/constants';
import { SceneQuerySelect } from '@/pages/exploreAnalysis/ontologyQuery/components/SceneQuerySelect';
import {
  formatLinkEndpoint,
  loadLinkQueryCache,
  queryLinks
} from '@/pages/exploreAnalysis/ontologyQuery/services/linkQuery';
import type {
  LinkQueryFormValues,
  LinkQueryRow
} from '@/pages/exploreAnalysis/ontologyQuery/types';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import { SceneSelectModal } from './SceneSelectModal';
import { QueryFilterToolbar } from './QueryFilterToolbar';
import styles from '@/pages/exploreAnalysis/ontologyQuery/index.module.scss';
import pageStyles from '../index.module.scss';

const Option = Select.Option;

const defaultFormValues: LinkQueryFormValues = {
  linkId: '',
  linkName: '',
  sceneName: SCENE_QUERY_ALL_VALUE,
  sourceEndpoint: '',
  targetEndpoint: '',
  linkType: 'all'
};

export const LinkListTab: React.FC = () => {
  const history = useHistory();
  const [form] = Form.useForm<LinkQueryFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LinkQueryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkQueryRow | null>(null);
  const [sceneSelectVisible, setSceneSelectVisible] = useState(false);
  const fetchList = useCallback(
    async (page = pageNo, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const result = await queryLinks({
          ...values,
          pageNo: page,
          pageSize: size
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(result.pageNo);
        setPageSize(result.pageSize);
      } catch (error) {
        console.error('加载链接列表失败:', error);
        Message.error('加载链接列表失败');
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [form, pageNo, pageSize]
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadLinkQueryCache(true);
        form.setFieldsValue(defaultFormValues);
        const result = await queryLinks({
          ...defaultFormValues,
          pageNo: 1,
          pageSize: 10
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(1);
        setPageSize(10);
      } catch (error) {
        console.error('加载链接列表失败:', error);
        Message.error('加载链接列表失败');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      removeStaleArcoOverlays();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPageNo(1);
    fetchList(1, pageSize);
  };

  const handleReset = () => {
    form.setFieldsValue(defaultFormValues);
    setPageNo(1);
    fetchList(1, pageSize);
  };

  const handleViewLink = (record: LinkQueryRow) => {
    setSelectedLink(record);
    setDetailVisible(true);
  };

  const handleViewScene = (record: LinkQueryRow) => {
    history.push(`/tenant/compute/onto/ontologyScene/detail/${record.sceneId}`);
  };

  const handleEdit = (record: LinkQueryRow) => {
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${record.sceneId}/links/edit/${record.id}`
    );
  };

  const handleSceneSelectConfirm = (sceneId: number) => {
    setSceneSelectVisible(false);
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${sceneId}/links/create`
    );
  };

  const columns: ColumnProps<LinkQueryRow>[] = useMemo(
    () => [
      {
        title: '链接ID',
        dataIndex: 'code',
        width: 160,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '链接名称',
        dataIndex: 'name',
        width: 200,
        ellipsis: true,
        render: (value, record) => (
          <div
            className="hover:cursor-pointer"
            onClick={() => handleViewLink(record)}
          >
            <GlobalTooltip.Ellipsis
              text={value || '-'}
              className={styles['link-text']}
            />
          </div>
        )
      },
      {
        title: '本体场景库',
        dataIndex: 'sceneName',
        width: 200,
        ellipsis: true,
        render: (value, record) => (
          <div
            className="hover:cursor-pointer"
            onClick={() => handleViewScene(record)}
          >
            <GlobalTooltip.Ellipsis
              text={value || '-'}
              className={styles['link-text']}
            />
          </div>
        )
      },
      {
        title: '源对象类型-属性',
        dataIndex: 'sourceEndpoint',
        width: 200,
        ellipsis: true,
        render: (_, record) => (
          <GlobalTooltip.Ellipsis
            text={formatLinkEndpoint(
              record.sourceObjectTypeName,
              record.linkSourceColumnName
            )}
          />
        )
      },
      {
        title: '目标对象类型-属性',
        dataIndex: 'targetEndpoint',
        width: 200,
        ellipsis: true,
        render: (_, record) => (
          <GlobalTooltip.Ellipsis
            text={formatLinkEndpoint(
              record.targetObjectTypeName,
              record.linkTargetColumnName
            )}
          />
        )
      },
      {
        title: '链接类型',
        dataIndex: 'type',
        width: 100,
        render: (value: LinkType) => (
          <GlobalTooltip.Ellipsis text={getLinkTypeText(value) || '-'} />
        )
      },
      {
        title: '描述说明',
        dataIndex: 'description',
        width: 140,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '操作',
        dataIndex: 'actions',
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
            <Button type="text" size="small" onClick={() => handleEdit(record)}>
              编辑
            </Button>
          </PermissionWrapper>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className={pageStyles['elements-list-tab']}>
      <SearchTable
        className={`${styles['query-search-table']} ${pageStyles['elements-search-table']}`}
        searchForm={
          <QueryFilterToolbar
            actions={
              <>
                <Button type="text" size="small" onClick={handleSearch}>
                  查询
                </Button>
                <Button type="text" size="small" onClick={handleReset}>
                  重置
                </Button>
                <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.CREATE}>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setSceneSelectVisible(true)}
                  >
                    新建链接
                  </Button>
                </PermissionWrapper>
              </>
            }
          >
            <Form
              form={form}
              layout="inline"
              className={`${styles['query-form']} ${pageStyles['elements-query-form']}`}
              initialValues={defaultFormValues}
            >
              <Form.Item
                field="linkId"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="链接 ID" />
              </Form.Item>
              <Form.Item
                field="linkName"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="链接名称" />
              </Form.Item>
              <Form.Item
                field="sceneName"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']} ${pageStyles['elements-query-form-field-scene']}`}
              >
                <SceneQuerySelect loading={loading} />
              </Form.Item>
              <Form.Item
                field="sourceEndpoint"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="源对象类型-属性" />
              </Form.Item>
              <Form.Item
                field="targetEndpoint"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="目标对象类型-属性" />
              </Form.Item>
              <Form.Item
                field="linkType"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']} ${pageStyles['elements-query-form-field-sync']}`}
              >
                <Select placeholder="链接类型">
                  {LINK_TYPE_QUERY_OPTIONS.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </QueryFilterToolbar>
        }
        tableProps={{
          columns,
          data,
          loading,
          rowKey: (record) => `${record.sceneId}-${record.id}`,
          border: false,
          pagination: false,
          scroll: { x: 1200 }
        }}
      />

      {total > 0 && (
        <div
          className={`${styles['query-pagination']} ${pageStyles['elements-pagination']}`}
        >
          <Pagination
            current={pageNo}
            pageSize={pageSize}
            total={total}
            showTotal
            showJumper
            sizeCanChange
            onChange={(page, size) => {
              setPageNo(page);
              setPageSize(size);
              fetchList(page, size);
            }}
          />
        </div>
      )}

      <SceneSelectModal
        visible={sceneSelectVisible}
        title="选择场景库以新建链接"
        onCancel={() => setSceneSelectVisible(false)}
        onConfirm={handleSceneSelectConfirm}
      />

      {detailVisible && selectedLink?.id && (
        <LinkDetailDrawer
          visible={detailVisible}
          linkId={String(selectedLink.id)}
          data={{
            id: String(selectedLink.id),
            name: selectedLink.name || '',
            linkType: selectedLink.type as LinkType,
            sourceObjectType: {
              id: selectedLink.sourceObjectTypeID
                ? String(selectedLink.sourceObjectTypeID)
                : undefined,
              name: selectedLink.sourceObjectTypeName || ''
            },
            targetObjectType: {
              id: selectedLink.targetObjectTypeID
                ? String(selectedLink.targetObjectTypeID)
                : undefined,
              name: selectedLink.targetObjectTypeName || ''
            },
            instanceCount: 0,
            attributeCount: selectedLink.ontologyLinkTypeColumnList?.length || 0
          }}
          onClose={() => {
            setDetailVisible(false);
            setSelectedLink(null);
            removeStaleArcoOverlays();
          }}
        />
      )}
    </div>
  );
};
