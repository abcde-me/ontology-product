import React from 'react';
import { Button, Message, Table, Tabs } from '@arco-design/web-react';
import { IconDownload } from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import MarkdownContent from '@/components/MarkdownContent';
import {
  buildOntologySchemaCsvFromParsed,
  downloadCsvTemplate
} from '@/utils/ontologyCsvTemplate';
import type { OntologyModelExtractResult } from '../../types/fileExtract';
import { ExtractResultSection } from './ExtractResultSection';
import { OntologySchemaCsvTable } from './OntologySchemaCsvTable';
import styles from '../../index.module.scss';

interface OntologyModelResultPanelProps {
  result: OntologyModelExtractResult;
}

export const OntologyModelResultPanel: React.FC<
  OntologyModelResultPanelProps
> = ({ result }) => {
  const objectTypes = result.objectTypes || [];
  const links = result.links || [];

  const linkColumns: ColumnProps<(typeof links)[number]>[] = [
    { title: '链接名称', dataIndex: 'name', width: 160 },
    { title: '源对象类型 ID', dataIndex: 'sourceObjectTypeId', width: 160 },
    { title: '目标对象类型 ID', dataIndex: 'targetObjectTypeId', width: 160 },
    { title: '说明', dataIndex: 'description', ellipsis: true }
  ];

  const handleDownloadSchema = (
    code: string,
    schema: (typeof objectTypes)[number]['schema']
  ) => {
    const csvContent = buildOntologySchemaCsvFromParsed(schema);
    downloadCsvTemplate(csvContent, `${code || 'object_type'}_schema.csv`);
    Message.success('CSV 模板已下载');
  };

  return (
    <div className={styles['extract-result-panel']}>
      {result.summary ? (
        <ExtractResultSection title="提取摘要">
          {result.summary}
        </ExtractResultSection>
      ) : null}

      <ExtractResultSection
        title="对象类型"
        stats={`${objectTypes.length} 个对象类型`}
      >
        {objectTypes.length ? (
          <Tabs defaultActiveTab={objectTypes[0]?.id}>
            {objectTypes.map((objectType) => (
              <Tabs.TabPane
                key={objectType.id}
                title={`${objectType.name} (${objectType.code})`}
              >
                <div className={styles['ontology-schema-csv-panel']}>
                  <div className={styles['ontology-schema-csv-toolbar']}>
                    <span className={styles['ontology-schema-csv-desc']}>
                      {objectType.description || '—'}
                    </span>
                    <Button
                      type="outline"
                      size="small"
                      icon={<IconDownload />}
                      onClick={() =>
                        handleDownloadSchema(objectType.code, objectType.schema)
                      }
                    >
                      下载 CSV 模板
                    </Button>
                  </div>
                  <OntologySchemaCsvTable schema={objectType.schema} />
                </div>
              </Tabs.TabPane>
            ))}
          </Tabs>
        ) : (
          <div className={styles['extract-result-empty']}>未提取到对象类型</div>
        )}
      </ExtractResultSection>

      {links.length ? (
        <ExtractResultSection title="链接" stats={`${links.length} 条链接`}>
          <Table
            rowKey="id"
            columns={linkColumns}
            data={links}
            pagination={false}
            border={false}
          />
        </ExtractResultSection>
      ) : null}

      {result.markdown ? (
        <ExtractResultSection title="原始输出">
          <div className={styles['file-extract-result-content']}>
            <MarkdownContent content={result.markdown} />
          </div>
        </ExtractResultSection>
      ) : null}
    </div>
  );
};
