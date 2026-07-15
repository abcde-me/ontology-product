import React, { useCallback, useEffect, useState } from 'react';
import { Button, Message, Space, Tag } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { useHistory, useParams } from 'react-router-dom';
import { LIST_PATH, SYNONYM_TAG_COLORS } from './constants';
import type { SemanticMappingListItem } from './types';
import { getSemanticMapping } from './services/mappingStorage';
import styles from './index.module.scss';

export default function SemanticMappingDetail() {
  const history = useHistory();
  const { id = '' } = useParams<{ id: string }>();
  const [mapping, setMapping] = useState<SemanticMappingListItem | null>(null);

  const loadMapping = useCallback(() => {
    const detail = getSemanticMapping(id);
    if (!detail) {
      Message.error('语义映射不存在');
      history.replace(LIST_PATH);
      return;
    }
    setMapping(detail);
  }, [history, id]);

  useEffect(() => {
    loadMapping();
  }, [loadMapping]);

  if (!mapping) {
    return null;
  }

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderWrap}>
        <div className={styles.detailHeaderCard}>
          <div className={styles.detailHeaderMain}>
            <div className={styles.detailTitle}>{mapping.standardTerm}</div>
            <div className={styles.detailMeta}>
              {mapping.objectTypes?.length
                ? `关联对象类型：${mapping.objectTypes
                    .map((item) => item.name)
                    .join('、')}`
                : '未关联对象类型'}
            </div>
          </div>
          <div className={styles.detailHeaderActions}>
            <Button
              type="outline"
              size="small"
              icon={<IconLeft />}
              className={styles.detailBackBtn}
              onClick={() => history.push(LIST_PATH)}
            >
              返回列表
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.detailInfoGrid}>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>标准术语</div>
            <div className={styles.detailInfoValue}>{mapping.standardTerm}</div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>创建人</div>
            <div className={styles.detailInfoValue}>
              {mapping.creator || '-'}
            </div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>创建时间</div>
            <div className={styles.detailInfoValue}>
              {dayjs(mapping.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>更新时间</div>
            <div className={styles.detailInfoValue}>
              {dayjs(mapping.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailInfoLabel}>映射描述</div>
          {mapping.description ? (
            <div className={styles.detailBlockValue}>{mapping.description}</div>
          ) : (
            <div className={styles.detailEmpty}>暂无映射描述</div>
          )}
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailInfoLabel}>同义词 / 别名</div>
          {mapping.synonyms?.length ? (
            <div className={styles.detailTagWrap}>
              <Space size={8} wrap>
                {mapping.synonyms.map((item, index) => (
                  <Tag
                    key={item}
                    color={
                      SYNONYM_TAG_COLORS[index % SYNONYM_TAG_COLORS.length]
                    }
                  >
                    {item}
                  </Tag>
                ))}
              </Space>
            </div>
          ) : (
            <div className={styles.detailEmpty}>暂无同义词或别名</div>
          )}
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailInfoLabel}>关联对象类型</div>
          {mapping.objectTypes?.length ? (
            <div className={styles.detailObjectList}>
              {mapping.objectTypes.map((item) => (
                <div key={item.id} className={styles.detailObjectItem}>
                  <span>{item.name}</span>
                  <span className={styles.detailObjectMeta}>
                    {[
                      item.code ? `编码：${item.code}` : null,
                      item.sceneName ? `场景：${item.sceneName}` : null
                    ]
                      .filter(Boolean)
                      .join('  ·  ') || `ID：${item.id}`}
                  </span>
                  {item.attributes?.length ? (
                    <span className={styles.detailObjectMeta}>
                      关联属性：
                      {item.attributes
                        .map((attr) =>
                          attr.displayName &&
                          attr.displayName !== attr.fieldName
                            ? `${attr.displayName}（${attr.fieldName}）`
                            : attr.displayName || attr.fieldName
                        )
                        .join('、')}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.detailEmpty}>未关联对象类型</div>
          )}
        </div>
      </div>
    </div>
  );
}
