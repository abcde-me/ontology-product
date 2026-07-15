import React, { useCallback, useEffect, useState } from 'react';
import { Button, Message, Tag } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { useHistory, useParams } from 'react-router-dom';
import { AXIOM_SOURCE_COLOR, AXIOM_SOURCE_LABEL, LIST_PATH } from './constants';
import type { DomainAxiom } from './types';
import { getDomainAxiom } from './services/axiomStorage';
import styles from './index.module.scss';

export default function DomainAxiomDetail() {
  const history = useHistory();
  const { id = '' } = useParams<{ id: string }>();
  const [axiom, setAxiom] = useState<DomainAxiom | null>(null);

  const loadAxiom = useCallback(() => {
    const detail = getDomainAxiom(id);
    if (!detail) {
      Message.error('领域公理不存在');
      history.replace(LIST_PATH);
      return;
    }
    setAxiom(detail);
  }, [history, id]);

  useEffect(() => {
    loadAxiom();
  }, [loadAxiom]);

  if (!axiom) {
    return null;
  }

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderWrap}>
        <div className={styles.detailHeaderCard}>
          <div className={styles.detailHeaderMain}>
            <div className={styles.detailTitle}>{axiom.name}</div>
            <div className={styles.detailMeta}>
              {axiom.description ||
                axiom.domain ||
                '暂无说明，后续可在推理分析中引用'}
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
            <div className={styles.detailInfoLabel}>公理名称</div>
            <div className={styles.detailInfoValue}>{axiom.name}</div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>所属领域</div>
            <div className={styles.detailInfoValue}>{axiom.domain || '-'}</div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>创建方式</div>
            <div className={styles.detailInfoValue}>
              <Tag color={AXIOM_SOURCE_COLOR[axiom.sourceType]}>
                {AXIOM_SOURCE_LABEL[axiom.sourceType]}
              </Tag>
            </div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>启用状态</div>
            <div className={styles.detailInfoValue}>
              <Tag color={axiom.enabled ? 'green' : 'gray'}>
                {axiom.enabled ? '已启用' : '已停用'}
              </Tag>
            </div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>应用场景</div>
            <div className={styles.detailInfoValue}>
              {axiom.applicationScenarioName || '-'}
            </div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>关联本体场景</div>
            <div className={styles.detailInfoValue}>
              {axiom.ontologySceneName ||
                (axiom.ontologySceneId
                  ? `场景 #${axiom.ontologySceneId}`
                  : '-')}
            </div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>源文件</div>
            <div className={styles.detailInfoValue}>
              {axiom.sourceFileName || '-'}
            </div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>创建人</div>
            <div className={styles.detailInfoValue}>{axiom.creator || '-'}</div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>创建时间</div>
            <div className={styles.detailInfoValue}>
              {dayjs(axiom.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
          <div className={styles.detailInfoItem}>
            <div className={styles.detailInfoLabel}>更新时间</div>
            <div className={styles.detailInfoValue}>
              {dayjs(axiom.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailInfoLabel}>公理表达式</div>
          <div className={styles.detailBlockValue}>{axiom.expression}</div>
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailInfoLabel}>说明</div>
          <div className={styles.detailBlockValue}>
            {axiom.description || '暂无说明'}
          </div>
        </div>
      </div>
    </div>
  );
}
