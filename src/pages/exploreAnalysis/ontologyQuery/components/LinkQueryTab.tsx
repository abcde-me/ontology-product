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
import { LINK_TYPE_QUERY_OPTIONS, SCENE_QUERY_ALL_VALUE } from '../constants';
import {
  formatLinkEndpoint,
  loadLinkQueryCache,
  queryLinks
} from '../services/linkQuery';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import type { LinkQueryFormValues, LinkQueryRow } from '../types';
import { SceneQuerySelect } from './SceneQuerySelect';
import styles from '../index.module.scss';

const Option = Select.Option;

const defaultFormValues: LinkQueryFormValues = {
  linkId: '',
  linkName: '',
  sceneName: SCENE_QUERY_ALL_VALUE,
  sourceEndpoint: '',
  targetEndpoint: '',
  linkType: 'all'
};

export const LinkQueryTab: React.FC = () => {
  const history = useHistory();
  const [form] = Form.useForm<LinkQueryFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LinkQueryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkQueryRow | null>(null);

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
        console.error('查询链接失败:', error);
        Message.error('查询链接失败');
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
        console.error('加载链接数据失败:', error);
        Message.error('加载链接数据失败');
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

  const columns: ColumnProps<LinkQueryRow>[] = useMemo(
    () => [
      {
        title: '链接id',
        dataIndex: 'code',
        width: 180,
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
        width: 220,
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
        width: 220,
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
        width: 220,
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
        render: (value) => (
          <GlobalTooltip.Ellipsis text={getLinkTypeText(value) || '-'} />
        )
      },
      {
        title: '描述说明',
        dataIndex: 'description',
        width: 160,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <SearchTable
        className={styles['query-search-table']}
        searchForm={
          <div className={styles['query-toolbar']}>
            <Form
              form={form}
              layout="inline"
              className={styles['query-form']}
              initialValues={defaultFormValues}
            >
              <Form.Item
                field="linkId"
                className={`${styles['query-form-field']} ${styles['query-form-field-id']}`}
              >
                <Input allowClear placeholder="链接 ID" />
              </Form.Item>
              <Form.Item
                field="linkName"
                className={`${styles['query-form-field']} ${styles['query-form-field-name']}`}
              >
                <Input allowClear placeholder="链接名称" />
              </Form.Item>
              <Form.Item
                field="sceneName"
                className={`${styles['query-form-field']} ${styles['query-form-field-scene']}`}
              >
                <SceneQuerySelect loading={loading} />
              </Form.Item>
              <Form.Item
                field="sourceEndpoint"
                className={`${styles['query-form-field']} ${styles['query-form-field-endpoint']}`}
              >
                <Input allowClear placeholder="源对象类型-属性" />
              </Form.Item>
              <Form.Item
                field="targetEndpoint"
                className={`${styles['query-form-field']} ${styles['query-form-field-endpoint']}`}
              >
                <Input allowClear placeholder="目标对象类型-属性" />
              </Form.Item>
              <Form.Item
                field="linkType"
                className={`${styles['query-form-field']} ${styles['query-form-field-sync']}`}
              >
                <Select placeholder="链接类型">
                  {LINK_TYPE_QUERY_OPTIONS.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <div className={styles['query-form-actions']}>
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button type="secondary" onClick={handleReset}>
                  重置
                </Button>
              </div>
            </Form>
          </div>
        }
        tableProps={{
          columns,
          data,
          loading,
          rowKey: (record) => `${record.sceneId}-${record.id}`,
          border: false,
          pagination: false,
          scroll: { x: 1300 }
        }}
      />

      {total > 0 && (
        <div className={styles['query-pagination']}>
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
    </>
  );
};
