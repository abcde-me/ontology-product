import React, { useMemo } from 'react';
import type { OntologyModelSchema } from '../../types/fileExtract';
import styles from '../../index.module.scss';

const SCHEMA_META_ROWS = [
  { key: 'name', label: '英文名称' },
  { key: 'type', label: '字段类型' },
  { key: 'comment', label: '中文名称' }
] as const;

interface OntologySchemaCsvTableProps {
  schema: OntologyModelSchema;
}

export const OntologySchemaCsvTable: React.FC<OntologySchemaCsvTableProps> = ({
  schema
}) => {
  const { columnList, typeList, commentList, instances } = schema;

  const metaRows = useMemo(
    () =>
      SCHEMA_META_ROWS.map((meta) => ({
        key: meta.key,
        label: meta.label,
        cells:
          meta.key === 'name'
            ? columnList
            : meta.key === 'type'
              ? typeList
              : commentList
      })),
    [columnList, typeList, commentList]
  );

  return (
    <div className={styles['ontology-schema-csv-table']}>
      <div className={styles['ontology-schema-csv-grid-wrap']}>
        <table className={styles['ontology-schema-csv-grid']}>
          <tbody>
            {metaRows.map((row) => (
              <tr
                key={row.key}
                className={styles['ontology-schema-csv-meta-row']}
              >
                <td className={styles['ontology-schema-csv-meta-label']}>
                  {row.label}
                </td>
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.key}-${columnList[index] || index}`}
                    className={styles['ontology-schema-csv-meta-cell']}
                    title={cell}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {instances.map((record, rowIndex) => (
              <tr
                key={`${record[columnList[0]] || 'row'}-${rowIndex}`}
                className={styles['ontology-schema-csv-data-row']}
              >
                <td className={styles['ontology-schema-csv-data-label']} />
                {columnList.map((columnName) => (
                  <td
                    key={columnName}
                    className={styles['ontology-schema-csv-data-cell']}
                    title={record[columnName]}
                  >
                    {record[columnName] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!instances.length ? (
        <div className={styles['ontology-schema-csv-empty']}>
          暂无提取到的实例数据
        </div>
      ) : null}
    </div>
  );
};
