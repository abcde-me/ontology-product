import React, { useMemo } from 'react';
import {
  Input,
  Popover,
  Space,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import {
  DEFAULT_KAFKA_DEFAULT_RULE_MAX_FLATTEN_DEPTH,
  KAFKA_ARRAY_HANDLE_MODE
} from '@/pages/ontologyScene/common/constants';
import {
  buildDefaultRulePreviewRows,
  DefaultRulePreviewRow,
  formatDefaultRuleDemoSample
} from '../../../services/kafkaJsonPathRule/defaultKafkaRulePreview';
import styles from './KafkaMessageParseSettings.module.scss';

const TextArea = Input.TextArea;

export default function KafkaDefaultRulePreview() {
  const sampleText = useMemo(() => formatDefaultRuleDemoSample(), []);

  const previewRows = useMemo(
    () =>
      buildDefaultRulePreviewRows({
        maxFlattenDepth: DEFAULT_KAFKA_DEFAULT_RULE_MAX_FLATTEN_DEPTH,
        arrayHandleMode: KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN
      }),
    []
  );

  const columns: TableColumnProps<DefaultRulePreviewRow>[] = [
    {
      title: '字段名',
      dataIndex: 'name',
      width: 140,
      ellipsis: true
    },
    {
      title: '解析值',
      dataIndex: 'valueText',
      ellipsis: true,
      render: (value: string) => value || '-'
    },
    {
      title: '说明',
      dataIndex: 'limitation',
      width: 220,
      ellipsis: true,
      render: (value: string) =>
        value ? (
          <span className={styles['default-rule-preview-limitation']}>
            {value}
          </span>
        ) : (
          '-'
        )
    }
  ];

  return (
    <div className={styles['default-rule-preview']}>
      <div className={styles['default-rule-preview-board']}>
        <div className={styles['default-rule-preview-card']}>
          <div className={styles['default-rule-preview-card-head']}>
            <div className={styles['default-rule-preview-card-title']}>
              样例数据
            </div>
          </div>
          <TextArea
            className={styles['default-rule-preview-sample']}
            value={sampleText}
            readOnly
          />
        </div>

        <div className={styles['default-rule-preview-card']}>
          <div className={styles['default-rule-preview-card-head']}>
            <Space size={4} align="center">
              <div className={styles['default-rule-preview-card-title']}>
                解析结果
              </div>
              <Popover
                position="right"
                trigger="hover"
                content={
                  <div className={styles['default-rule-preview-help']}>
                    标红说明为默认规则难以覆盖的场景，建议使用 AI 生成或路径解析
                  </div>
                }
              >
                <IconQuestionCircle
                  className={styles['default-rule-preview-help-icon']}
                  aria-label="解析结果说明"
                />
              </Popover>
            </Space>
          </div>
          <div className={styles['default-rule-preview-result']}>
            <Table
              className={styles['default-rule-preview-table']}
              size="small"
              rowKey="name"
              columns={columns}
              data={previewRows}
              pagination={false}
              border={false}
              scroll={{ y: 300 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
