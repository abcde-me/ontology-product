import React from 'react';
import { Form, Popover, Radio } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import FieldImportUpload from '@/pages/ontologyScene/components/FieldImportUpload';
import { PrefixAimdp } from '@/api/endpoints';
import SqlSourceSelector from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormSteps/common/SqlSourceSelector';
import SyncSourceDataStrategyFormSection, {
  STRATEGY_FORM_FIELD_MAP
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormSteps/common/SyncSourceDataStrategyFormSection';
import { IntermediateTable, IntermediateTableType } from '../types';
import type { ConnectorAnalyseFinkSqlColumnItem } from '@/types/objectType';
import {
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';

const FormItem = Form.Item;

interface IntermediateSourceSectionProps {
  form: any;
  styles: Record<string, string>;
  hasInitialId: boolean;
  intermediateTable: IntermediateTable;
  initialFileList: any[];
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onIntermediateTableTypeChange: (type: IntermediateTableType) => void;
  onLocalCsvFileChange: (file: any, markReUpload: boolean) => void;
  onSyncSourceDataInfoChange: (sourceDataInfo: SqlSourceDataInfo) => void;
  onDatabaseSourceTableSelected: (
    value: Required<
      Pick<SqlSourceDataInfo, 'connectorId' | 'databaseName' | 'tableName'>
    > & { projectID: string }
  ) => void;
  onSqlColumnsParsed: (columns: ConnectorAnalyseFinkSqlColumnItem[]) => void;
  onSyncSourceDataStrategyChange: (
    updates: Partial<SyncSourceDataStrategyFormState>
  ) => void;
  /** N:N 仅改名称：中间表与同步策略只读 */
  readOnly?: boolean;
}

export default function IntermediateSourceSection({
  form,
  styles,
  hasInitialId,
  intermediateTable,
  initialFileList,
  syncSourceDataStrategy,
  readOnly = false,
  onIntermediateTableTypeChange,
  onLocalCsvFileChange,
  onSyncSourceDataInfoChange,
  onDatabaseSourceTableSelected,
  onSqlColumnsParsed,
  onSyncSourceDataStrategyChange
}: IntermediateSourceSectionProps) {
  const updateStrategy = (
    updates: Partial<SyncSourceDataStrategyFormState>
  ) => {
    if (readOnly) return;
    onSyncSourceDataStrategyChange(updates);
    Object.entries(updates).forEach(([key, value]) => {
      const field =
        STRATEGY_FORM_FIELD_MAP[key as keyof SyncSourceDataStrategyFormState];
      if (field) {
        form.setFieldValue(field, value);
      }
    });
  };

  return (
    <>
      <div className="my-[16px] flex items-center gap-[8px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        <span>中间表来源</span>
        <Popover content="中间表用于存储N:N关系的关联数据">
          <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
        </Popover>
      </div>

      <FormItem
        label="数据来源类型"
        field="intermediateTable"
        rules={[
          {
            required: true,
            validator: (_value, callback) => {
              if (
                intermediateTable.type === 'local_csv' &&
                !intermediateTable.filePath
              ) {
                callback('请上传中间表文件');
              }
            }
          }
        ]}
      >
        <div className="space-y-4">
          <Radio.Group
            disabled={readOnly}
            value={intermediateTable.type}
            onChange={onIntermediateTableTypeChange}
          >
            <Radio value="local_csv">本地CSV导入</Radio>
            <Radio value="data_lake_sync">数据库同步</Radio>
          </Radio.Group>

          {intermediateTable.type === 'local_csv' && (
            <div>
              <FieldImportUpload
                from="link_type"
                accept=".csv"
                fileType="csv"
                maxSize={100}
                disabled={readOnly}
                customAction={`${PrefixAimdp}/UploadOntologyEntityDataFile`}
                fileList={initialFileList}
                onFileChange={(file) =>
                  onLocalCsvFileChange(file, hasInitialId)
                }
                onUploadingChange={() => {
                  // 保留上传状态回调位置，等价于拆分前未使用的实现。
                }}
              />
            </div>
          )}
        </div>
      </FormItem>

      {intermediateTable.type === 'data_lake_sync' && (
        <>
          <SqlSourceSelector
            form={form}
            value={syncSourceDataStrategy.sourceDataInfo}
            onChange={onSyncSourceDataInfoChange}
            onTableSelected={onDatabaseSourceTableSelected}
            onSqlColumnsParsed={onSqlColumnsParsed}
            fieldPrefix="linkSource"
            styles={styles}
            ontologySqlTestTaskType="TABLE_REALTIME_SYNC"
            syncSourceDataStrategyForSqlTest={syncSourceDataStrategy}
            readOnly={readOnly}
          />

          <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
            中间表同步策略
          </div>

          <SyncSourceDataStrategyFormSection
            styles={styles}
            syncSourceDataStrategy={syncSourceDataStrategy}
            onStrategyUpdate={updateStrategy}
            syncModePopover="选择链接数据同步的触发方式"
            pollFetchSizePopover="单次从数据源拉取的最大行数"
            fullSqlPlaceholder="请输入全量SQL，例如 SELECT source_id,target_id FROM ods_link"
            incrementSqlPlaceholder="请输入增量SQL，例如 SELECT source_id,target_id FROM ods_link WHERE update_time > ?"
            readOnly={readOnly}
          />
        </>
      )}
    </>
  );
}
