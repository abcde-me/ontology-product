import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Message, Tooltip } from '@arco-design/web-react';
import { IconQuestionCircle, IconRight } from '@arco-design/web-react/icon';
import cls from 'classnames';
import { useDebounceFn } from 'ahooks';
import type { ObjectType } from '@/types/objectType';
import { SEMANTIC_QUERY_EMPTY_INTENT } from '../constants';
import {
  DEFAULT_SEMANTIC_PAGE_SIZE,
  executeSemanticSql,
  getEmptyQueryIntent,
  parseSemanticQuery,
  searchBySemanticQuery
} from '../services/semanticQuery';
import { fetchQueryableProperties } from '../services/conditionQuery';
import { tryParseSqlToFieldList } from '../utils/semanticFieldMapping';
import { fetchAllObjectTypesWithScene } from '../services/objectTypeScope';
import { resolveObjectTypeCode } from '../utils/objectTypeOptions';
import type {
  InstanceQueryResult,
  ObjectTypeDataFieldFilter,
  SemanticQueryFormValues,
  SemanticSearchContext
} from '../types';
import { ObjectBrowseScopeFields } from './ObjectBrowseScopeFields';
import styles from '../index.module.scss';
const TextArea = Input.TextArea;

const defaultFormValues: SemanticQueryFormValues = {
  sceneId: undefined,
  objectTypeId: undefined,
  queryText: ''
};

interface SemanticQueryFormProps {
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onSearchComplete: (
    result: InstanceQueryResult,
    context: SemanticSearchContext
  ) => void;
  onReset?: () => void;
}

export const SemanticQueryForm: React.FC<SemanticQueryFormProps> = ({
  loading,
  onLoadingChange,
  onSearchComplete,
  onReset
}) => {
  const [form] = Form.useForm<SemanticQueryFormValues>();
  const sceneId = Form.useWatch('sceneId', form as any);
  const objectTypeId = Form.useWatch('objectTypeId', form as any);
  const queryText = Form.useWatch('queryText', form as any);
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [parseIntent, setParseIntent] = useState(SEMANTIC_QUERY_EMPTY_INTENT);
  const [generatedSql, setGeneratedSql] = useState('');
  const [parsedFieldList, setParsedFieldList] = useState<
    ObjectTypeDataFieldFilter[]
  >([]);
  const [sqlText, setSqlText] = useState('');
  const [parseLoading, setParseLoading] = useState(false);
  const [sqlPanelExpanded, setSqlPanelExpanded] = useState(false);

  const trimmedQuery = queryText?.trim() || '';
  const showSqlPanel = Boolean(trimmedQuery && sceneId && objectTypeId);
  const isSqlModified = Boolean(
    generatedSql && sqlText.trim() && sqlText.trim() !== generatedSql.trim()
  );

  useEffect(() => {
    fetchAllObjectTypesWithScene()
      .then(setObjectTypes)
      .catch((error) => {
        console.error('加载对象类型失败:', error);
        Message.error('加载对象类型失败');
      });
  }, []);

  const resetParseState = (nextIntent = getEmptyQueryIntent()) => {
    setParseIntent(nextIntent);
    setGeneratedSql('');
    setParsedFieldList([]);
    setSqlText('');
    setSqlPanelExpanded(false);
  };

  const applyGeneratedParse = (
    nextIntent?: string,
    nextSql?: string,
    nextFieldList?: ObjectTypeDataFieldFilter[]
  ) => {
    const normalizedSql = nextSql?.trim() || '';
    const normalizedFieldList = nextFieldList || [];
    setGeneratedSql(normalizedSql);
    setParsedFieldList(normalizedFieldList);
    setSqlText(normalizedSql);
    if (nextIntent) {
      setParseIntent(nextIntent);
    }
  };

  const { run: debouncedParse } = useDebounceFn(
    async (
      nextSceneId?: number,
      nextObjectTypeId?: number,
      nextQuery?: string
    ) => {
      const query = nextQuery?.trim() || '';
      if (!nextSceneId || !nextObjectTypeId || !query) {
        resetParseState();
        return;
      }

      setParseLoading(true);
      try {
        const result = await parseSemanticQuery({
          ontologyModelID: nextSceneId,
          objectTypeId: nextObjectTypeId,
          query
        });
        applyGeneratedParse(
          result.parseIntent || query,
          result.sql,
          result.fieldList
        );
      } catch (error) {
        console.error('解析语义失败:', error);
        applyGeneratedParse(query, '', []);
      } finally {
        setParseLoading(false);
      }
    },
    { wait: 500 }
  );

  useEffect(() => {
    debouncedParse(sceneId, objectTypeId, queryText);
  }, [sceneId, objectTypeId, queryText, debouncedParse]);

  const handleScopeChange = () => {
    form.setFieldValue('queryText', '');
    resetParseState();
  };

  const handleReset = () => {
    form.setFieldsValue(defaultFormValues);
    resetParseState();
    onReset?.();
  };

  const handleRestoreSql = () => {
    if (!generatedSql) {
      return;
    }
    setSqlText(generatedSql);
    Message.success('已恢复生成的 SQL');
  };

  const resolveSearchFieldList = async (params: {
    sceneId: number;
    objectTypeId: number;
    query?: string;
  }): Promise<ObjectTypeDataFieldFilter[] | undefined> => {
    const sql = sqlText.trim();
    if (!sql) {
      return undefined;
    }

    if (!isSqlModified && parsedFieldList.length) {
      return parsedFieldList;
    }

    const properties = await fetchQueryableProperties(
      params.sceneId,
      params.objectTypeId
    );
    const allowedFieldNames = properties.map((item) => item.fieldName);
    const parsedFromSql = tryParseSqlToFieldList(sql, allowedFieldNames);
    if (parsedFromSql?.length) {
      return parsedFromSql;
    }

    return parsedFieldList.length ? parsedFieldList : undefined;
  };

  const handleSearch = async () => {
    try {
      const values = await form.validate();
      onLoadingChange(true);
      const query = values.queryText?.trim();
      let fieldList = await resolveSearchFieldList({
        sceneId: values.sceneId!,
        objectTypeId: values.objectTypeId!
      });

      if (!fieldList?.length && query) {
        const parseResult = await parseSemanticQuery({
          ontologyModelID: values.sceneId!,
          objectTypeId: values.objectTypeId!,
          query
        });
        applyGeneratedParse(
          parseResult.parseIntent || query,
          parseResult.sql,
          parseResult.fieldList
        );
        fieldList = parseResult.fieldList;
      }

      const result = await searchBySemanticQuery({
        ontologyModelID: values.sceneId!,
        objectTypeId: values.objectTypeId!,
        query,
        fieldList,
        page: 1,
        pageSize: DEFAULT_SEMANTIC_PAGE_SIZE
      });

      if (result.parseIntent) {
        setParseIntent(result.parseIntent);
      } else if (!query) {
        setParseIntent(getEmptyQueryIntent());
      }

      if (result.sql) {
        applyGeneratedParse(
          result.parseIntent,
          result.sql,
          fieldList || parsedFieldList
        );
      } else if (!query) {
        applyGeneratedParse(getEmptyQueryIntent(), '', []);
      }

      onSearchComplete(
        {
          items: result.items,
          total: result.total,
          page: result.page,
          pageSize: result.pageSize
        },
        {
          ontologyModelID: values.sceneId!,
          objectTypeId: values.objectTypeId!,
          objectTypeCode: resolveObjectTypeCode(
            objectTypes,
            values.objectTypeId
          ),
          query,
          mode: 'query'
        }
      );
    } catch (error) {
      if (!(error as { errorFields?: unknown[] })?.errorFields) {
        console.error('语义检索失败:', error);
        const rawMessage =
          error instanceof Error
            ? error.message?.trim()
            : String(error || '').trim();
        Message.error(rawMessage || '语义检索失败');
      }
    } finally {
      onLoadingChange(false);
    }
  };

  const handleExecuteSql = async () => {
    try {
      const values = await form.validate(['sceneId', 'objectTypeId']);
      const sql = sqlText.trim();
      if (!sql) {
        Message.warning('请先生成或输入 SQL');
        return;
      }

      onLoadingChange(true);
      const fieldList = await resolveSearchFieldList({
        sceneId: values.sceneId!,
        objectTypeId: values.objectTypeId!
      });
      const result = await executeSemanticSql({
        ontologyModelID: values.sceneId!,
        objectTypeId: values.objectTypeId!,
        sql,
        fieldList,
        page: 1,
        pageSize: DEFAULT_SEMANTIC_PAGE_SIZE
      });

      if (result.parseIntent) {
        setParseIntent(result.parseIntent);
      }
      if (result.sql) {
        applyGeneratedParse(result.parseIntent, result.sql, fieldList);
      }

      onSearchComplete(
        {
          items: result.items,
          total: result.total,
          page: result.page,
          pageSize: result.pageSize
        },
        {
          ontologyModelID: values.sceneId!,
          objectTypeId: values.objectTypeId!,
          objectTypeCode: resolveObjectTypeCode(
            objectTypes,
            values.objectTypeId
          ),
          query: trimmedQuery,
          sql: result.sql || sql,
          mode: 'sql'
        }
      );
    } catch (error) {
      console.error('执行 SQL 失败:', error);
      Message.error(error instanceof Error ? error.message : '执行 SQL 失败');
    } finally {
      onLoadingChange(false);
    }
  };

  const sqlPlaceholder = useMemo(() => {
    if (parseLoading) {
      return '正在生成 SQL...';
    }
    return '输入问题描述后将自动生成 SQL';
  }, [parseLoading]);

  return (
    <Form
      form={form}
      layout="vertical"
      className={styles['semantic-form']}
      initialValues={defaultFormValues}
    >
      <ObjectBrowseScopeFields
        form={form as any}
        onObjectTypeChange={handleScopeChange}
        onSceneChange={handleScopeChange}
      />

      <Form.Item
        label={
          <span className={styles['label-with-tip']}>
            问题描述
            <Tooltip content="使用自然语言描述查询意图，系统将解析并生成 SQL 执行检索">
              <IconQuestionCircle className={styles['label-tip-icon']} />
            </Tooltip>
          </span>
        }
        field="queryText"
      >
        <TextArea
          placeholder="例如：高风险客户、可疑大额转账、壳公司商户..."
          autoSize={{ minRows: 4, maxRows: 6 }}
        />
      </Form.Item>

      <div className={styles['parse-intent-box']}>
        <div className={styles['parse-intent-label']}>解析意图</div>
        <div className={styles['parse-intent-content']}>
          {parseLoading ? '正在解析语义...' : parseIntent}
        </div>
      </div>

      {showSqlPanel && (
        <div className={styles['sql-panel']}>
          <button
            type="button"
            className={styles['sql-panel-header']}
            onClick={() => {
              setSqlPanelExpanded((expanded) => !expanded);
            }}
          >
            <IconRight
              className={cls(styles['sql-panel-arrow'], {
                [styles['sql-panel-arrow-expanded']]: sqlPanelExpanded
              })}
            />
            <span className={styles['sql-panel-title']}>SQL 查询</span>
            {sqlText ? (
              <span className={styles['sql-panel-preview']}>SELECT</span>
            ) : null}
          </button>
          {sqlPanelExpanded ? (
            <div className={styles['sql-panel-body']}>
              <div className={styles['sql-editor-wrap']}>
                <TextArea
                  className={styles['sql-editor']}
                  value={sqlText}
                  placeholder={sqlPlaceholder}
                  onChange={setSqlText}
                  autoSize={{ minRows: 8, maxRows: 14 }}
                />
              </div>
              <div className={styles['sql-actions']}>
                <Button
                  type="secondary"
                  disabled={!generatedSql || !isSqlModified}
                  onClick={handleRestoreSql}
                >
                  恢复生成 SQL
                </Button>
                <Button
                  type="primary"
                  loading={loading}
                  disabled={!sqlText.trim() || parseLoading}
                  onClick={handleExecuteSql}
                >
                  执行 SQL
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div className={styles['semantic-form-actions']}>
        <Button type="primary" loading={loading} onClick={handleSearch}>
          语义检索
        </Button>
        <Button type="secondary" onClick={handleReset}>
          重置
        </Button>
      </div>
    </Form>
  );
};
