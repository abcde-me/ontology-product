import React, { useCallback, useEffect, useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import PageHeader from '@/components/PageHeader';
import {
  ConditionQueryForm,
  ObjectListPanel,
  SemanticQueryForm,
  SemanticQuery2Form
} from './components';
import { OBJECT_BROWSE_QUERY_TABS } from './constants';
import {
  DEFAULT_CONDITION_PAGE_SIZE,
  fetchObjectBrowseFieldMeta,
  queryInstancesByCondition
} from './services/conditionQuery';
import {
  DEFAULT_SEMANTIC_PAGE_SIZE,
  executeSemanticSql,
  searchBySemanticQuery
} from './services/semanticQuery';
import type {
  ConditionSearchContext,
  InstanceQueryRow,
  ObjectBrowseQueryTabKey,
  ObjectBrowseSelectionContext,
  SemanticSearchContext
} from './types';
import type { FieldCommentMap } from './utils/fieldDisplayLabel';
import styles from './index.module.scss';

const isObjectBrowseQueryTabKey = (
  key: string
): key is ObjectBrowseQueryTabKey =>
  OBJECT_BROWSE_QUERY_TABS.some((tab) => tab.key === key);

export default function ObjectBrowse() {
  const [activeTab, setActiveTab] =
    useState<ObjectBrowseQueryTabKey>('condition');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resultData, setResultData] = useState<InstanceQueryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_CONDITION_PAGE_SIZE);
  const [conditionContext, setConditionContext] =
    useState<ConditionSearchContext | null>(null);
  const [semanticContext, setSemanticContext] =
    useState<SemanticSearchContext | null>(null);
  const [selectionContext, setSelectionContext] =
    useState<ObjectBrowseSelectionContext | null>(null);
  const [fieldCommentMap, setFieldCommentMap] = useState<FieldCommentMap>({});
  const [vectorFieldNames, setVectorFieldNames] = useState<Set<string>>(
    () => new Set()
  );
  const [instanceNameFieldNames, setInstanceNameFieldNames] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (!selectionContext) {
      setFieldCommentMap({});
      setVectorFieldNames(new Set());
      setInstanceNameFieldNames([]);
      return;
    }

    fetchObjectBrowseFieldMeta(
      selectionContext.sceneId,
      selectionContext.objectTypeId
    )
      .then(
        ({
          commentMap,
          vectorFieldNames: vectorFields,
          instanceNameFieldNames: nameFields
        }) => {
          setFieldCommentMap(commentMap);
          setVectorFieldNames(vectorFields);
          setInstanceNameFieldNames(nameFields);
        }
      )
      .catch(() => {
        setFieldCommentMap({});
        setVectorFieldNames(new Set());
        setInstanceNameFieldNames([]);
      });
  }, [selectionContext]);

  const resetResults = () => {
    setSearched(false);
    setResultData([]);
    setTotal(0);
    setPage(1);
    setPageSize(DEFAULT_CONDITION_PAGE_SIZE);
    setConditionContext(null);
    setSemanticContext(null);
    setSelectionContext(null);
  };

  const handleTabChange = (key: ObjectBrowseQueryTabKey) => {
    setActiveTab(key);
    resetResults();
  };

  const handleSemantic2SearchComplete = (
    rows: InstanceQueryRow[],
    context: ObjectBrowseSelectionContext
  ) => {
    setResultData(rows);
    setTotal(rows.length);
    setSearched(true);
    setConditionContext(null);
    setSemanticContext(null);
    setSelectionContext(context);
  };

  const handleConditionSearchComplete = (
    result: {
      items: InstanceQueryRow[];
      total: number;
      page: number;
      pageSize: number;
    },
    context: ConditionSearchContext
  ) => {
    setResultData(result.items);
    setTotal(result.total);
    setPage(result.page);
    setPageSize(result.pageSize);
    setConditionContext(context);
    setSemanticContext(null);
    setSelectionContext({
      sceneId: context.sceneId,
      objectTypeId: context.objectTypeId,
      objectTypeCode: context.objectTypeCode
    });
    setSearched(true);
  };

  const handleSemanticSearchComplete = (
    result: {
      items: InstanceQueryRow[];
      total: number;
      page: number;
      pageSize: number;
    },
    context: SemanticSearchContext
  ) => {
    setResultData(result.items);
    setTotal(result.total);
    setPage(result.page);
    setPageSize(result.pageSize);
    setSemanticContext(context);
    setConditionContext(null);
    setSelectionContext({
      sceneId: context.ontologyModelID,
      objectTypeId: context.objectTypeId,
      objectTypeCode: context.objectTypeCode
    });
    setSearched(true);
  };

  const handleConditionPageChange = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      if (!conditionContext) {
        return;
      }

      setLoading(true);
      try {
        const result = await queryInstancesByCondition({
          sceneId: conditionContext.sceneId,
          objectTypeId: conditionContext.objectTypeId,
          fieldList: conditionContext.fieldList,
          page: nextPage,
          pageSize: nextPageSize
        });
        setResultData(result.items);
        setTotal(result.total);
        setPage(result.page);
        setPageSize(result.pageSize);
      } catch (error) {
        console.error('分页查询失败:', error);
      } finally {
        setLoading(false);
      }
    },
    [conditionContext]
  );

  const handleSemanticPageChange = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      if (!semanticContext) {
        return;
      }

      setLoading(true);
      try {
        const result =
          semanticContext.mode === 'sql' && semanticContext.sql
            ? await executeSemanticSql({
                ontologyModelID: semanticContext.ontologyModelID,
                objectTypeId: semanticContext.objectTypeId,
                sql: semanticContext.sql,
                page: nextPage,
                pageSize: nextPageSize
              })
            : await searchBySemanticQuery({
                ontologyModelID: semanticContext.ontologyModelID,
                objectTypeId: semanticContext.objectTypeId,
                query: semanticContext.query,
                page: nextPage,
                pageSize: nextPageSize
              });
        setResultData(result.items);
        setTotal(result.total);
        setPage(result.page);
        setPageSize(result.pageSize);
      } catch (error) {
        console.error('语义分页查询失败:', error);
      } finally {
        setLoading(false);
      }
    },
    [semanticContext]
  );

  const handlePageChange = useCallback(
    (nextPage: number, nextPageSize: number) => {
      if (activeTab === 'condition') {
        handleConditionPageChange(nextPage, nextPageSize);
        return;
      }

      if (activeTab === 'semantic') {
        handleSemanticPageChange(nextPage, nextPageSize);
      }
    },
    [activeTab, handleConditionPageChange, handleSemanticPageChange]
  );

  return (
    <div className={styles['browse-page']}>
      <PageHeader className="flex-shrink-0" title="对象浏览" />

      <div className={styles['browse-body']}>
        <aside className={styles['query-panel']}>
          <div className={styles['query-panel-title']}>查询条件</div>
          <Tabs
            className={styles['query-tabs']}
            activeTab={activeTab}
            onChange={(key) => {
              if (isObjectBrowseQueryTabKey(key)) {
                handleTabChange(key);
              }
            }}
            type="line"
          >
            <Tabs.TabPane key="condition" title="条件查询">
              <ConditionQueryForm
                loading={loading}
                onLoadingChange={setLoading}
                onSearchComplete={handleConditionSearchComplete}
                onReset={resetResults}
              />
            </Tabs.TabPane>
            <Tabs.TabPane key="semantic" title="语义查询">
              <SemanticQueryForm
                loading={loading}
                onLoadingChange={setLoading}
                onSearchComplete={handleSemanticSearchComplete}
                onReset={resetResults}
              />
            </Tabs.TabPane>
            <Tabs.TabPane key="semantic2" title="相似性查询">
              <SemanticQuery2Form
                loading={loading}
                onLoadingChange={setLoading}
                onSearchComplete={handleSemantic2SearchComplete}
                onReset={resetResults}
              />
            </Tabs.TabPane>
          </Tabs>
        </aside>

        <ObjectListPanel
          queryMode={activeTab}
          loading={loading}
          searched={searched}
          data={resultData}
          selectionContext={selectionContext}
          fieldCommentMap={fieldCommentMap}
          vectorFieldNames={vectorFieldNames}
          instanceNameFieldNames={instanceNameFieldNames}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
