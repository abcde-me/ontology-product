import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  Popover,
  Radio,
  Space
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import FieldImportUpload from '@/pages/ontologyScene/components/FieldImportUpload';
import { PrefixAimdp } from '@/api/endpoints';
import SqlSourceSelector from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormSteps/common/SqlSourceSelector';
import { IntermediateTable, IntermediateTableType } from '../types';
import {
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';

const FormItem = Form.Item;
const { TextArea } = Input;

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
    >
  ) => void;
  onSqlColumnsParsed: (columns: string[]) => void;
  onSyncSourceDataStrategyChange: (
    updates: Partial<SyncSourceDataStrategyFormState>
  ) => void;
}

export default function IntermediateSourceSection({
  form,
  styles,
  hasInitialId,
  intermediateTable,
  initialFileList,
  syncSourceDataStrategy,
  onIntermediateTableTypeChange,
  onLocalCsvFileChange,
  onSyncSourceDataInfoChange,
  onDatabaseSourceTableSelected,
  onSqlColumnsParsed,
  onSyncSourceDataStrategyChange
}: IntermediateSourceSectionProps) {
  const isPollingMode = syncSourceDataStrategy.mode === 'JDBC_POLLING';
  const isSqlPolling =
    isPollingMode && syncSourceDataStrategy.sourceDataInfo.queryMode === 'sql';

  const updateStrategy = (
    updates: Partial<SyncSourceDataStrategyFormState>
  ) => {
    onSyncSourceDataStrategyChange(updates);
    Object.entries(updates).forEach(([key, value]) => {
      const fieldMap: Record<string, string> = {
        mode: 'syncMode',
        conflictStrategy: 'conflictStrategy',
        syncScope: 'syncScope',
        pollFetchSize: 'pollFetchSize',
        parallelism: 'parallelism',
        exceptionStrategy: 'exceptionStrategy',
        jdbcCheckpointField: 'jdbcCheckpointField',
        jdbcIncrementalTimeField: 'jdbcIncrementalTimeField',
        jdbcPollingIntervalSeconds: 'jdbcPollingIntervalSeconds',
        jdbcSyncSqlFull: 'jdbcSyncSqlFull',
        jdbcSyncSqlIncrement: 'jdbcSyncSqlIncrement'
      };
      const field = fieldMap[key];
      if (field) {
        form.setFieldValue(field, value);
      }
    });
  };

  return (
    <>
      <div className="my-[16px] flex items-center gap-[8px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        <span>中间表</span>
        <Popover content="中间表用于存储N:N关系的关联数据">
          <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
        </Popover>
      </div>

      <FormItem
        label="上传中间表"
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
          <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
            数据源
          </div>
          <SqlSourceSelector
            form={form}
            value={syncSourceDataStrategy.sourceDataInfo}
            onChange={onSyncSourceDataInfoChange}
            onTableSelected={onDatabaseSourceTableSelected}
            onSqlColumnsParsed={onSqlColumnsParsed}
            fieldPrefix="linkSource"
            styles={styles}
          />

          <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
            同步策略
          </div>
          <FormItem
            label={
              <span className="inline-flex items-center gap-[4px]">
                同步模式
                <Popover content="选择链接数据同步的触发方式">
                  <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
                </Popover>
              </span>
            }
            field="syncMode"
            rules={[{ required: true, message: '请选择同步模式' }]}
          >
            <Radio.Group
              value={syncSourceDataStrategy.mode}
              onChange={(mode) => updateStrategy({ mode })}
            >
              <Radio value="BINLOG_CDC">CDC</Radio>
              <Radio value="JDBC_POLLING">轮询</Radio>
            </Radio.Group>
          </FormItem>

          {isSqlPolling && (
            <>
              <FormItem label="全量SQL" field="jdbcSyncSqlFull">
                <TextArea
                  placeholder="请输入全量SQL，例如 SELECT source_id,target_id FROM ods_link"
                  value={syncSourceDataStrategy.jdbcSyncSqlFull}
                  autoSize={{ minRows: 5 }}
                  onChange={(jdbcSyncSqlFull) =>
                    updateStrategy({ jdbcSyncSqlFull })
                  }
                />
              </FormItem>
              <FormItem label="增量SQL" field="jdbcSyncSqlIncrement">
                <TextArea
                  placeholder="请输入增量SQL，例如 SELECT source_id,target_id FROM ods_link WHERE update_time > ?"
                  value={syncSourceDataStrategy.jdbcSyncSqlIncrement}
                  autoSize={{ minRows: 5 }}
                  onChange={(jdbcSyncSqlIncrement) =>
                    updateStrategy({ jdbcSyncSqlIncrement })
                  }
                />
              </FormItem>
            </>
          )}

          {isPollingMode && (
            <>
              <FormItem
                label="轮询间隔"
                field="jdbcPollingIntervalSeconds"
                rules={[{ required: true, message: '请输入轮询间隔' }]}
              >
                <Space size={8}>
                  <InputNumber
                    min={1}
                    step={1}
                    value={syncSourceDataStrategy.jdbcPollingIntervalSeconds}
                    onChange={(jdbcPollingIntervalSeconds) =>
                      updateStrategy({
                        jdbcPollingIntervalSeconds:
                          Number(jdbcPollingIntervalSeconds) || 1
                      })
                    }
                  />
                  <span>秒</span>
                </Space>
              </FormItem>
              <FormItem
                label="单次拉取数量"
                field="pollFetchSize"
                rules={[{ required: true, message: '请输入单次拉取数量' }]}
              >
                <InputNumber
                  min={1}
                  step={1}
                  value={syncSourceDataStrategy.pollFetchSize}
                  onChange={(pollFetchSize) =>
                    updateStrategy({
                      pollFetchSize: Number(pollFetchSize) || 1
                    })
                  }
                />
              </FormItem>
              <FormItem label="增量时间列" field="jdbcIncrementalTimeField">
                <Input
                  placeholder="如 update_time, last_modified"
                  value={syncSourceDataStrategy.jdbcIncrementalTimeField}
                  onChange={(jdbcIncrementalTimeField) =>
                    updateStrategy({ jdbcIncrementalTimeField })
                  }
                />
              </FormItem>
              <FormItem label="断点辅助列" field="jdbcCheckpointField">
                <Input
                  placeholder="如 id、主键或组合列名"
                  value={syncSourceDataStrategy.jdbcCheckpointField}
                  onChange={(jdbcCheckpointField) =>
                    updateStrategy({ jdbcCheckpointField })
                  }
                />
              </FormItem>
            </>
          )}

          <FormItem
            label="冲突策略"
            field="conflictStrategy"
            rules={[{ required: true, message: '请选择冲突策略' }]}
          >
            <Radio.Group
              value={syncSourceDataStrategy.conflictStrategy}
              onChange={(conflictStrategy) =>
                updateStrategy({ conflictStrategy })
              }
            >
              <Radio value="KEEP_SOURCE">保留数据源</Radio>
              <Radio value="KEEP_TARGET">保留目标表</Radio>
            </Radio.Group>
          </FormItem>

          <FormItem
            label="同步范围"
            field="syncScope"
            rules={[{ required: true, message: '请选择同步范围' }]}
          >
            <Radio.Group
              value={syncSourceDataStrategy.syncScope}
              onChange={(syncScope) => updateStrategy({ syncScope })}
            >
              <Radio value="INCREMENTAL">增量</Radio>
              <Radio value="FULL">全量</Radio>
              <Radio value="FULL_THEN_INCREMENTAL">增量+全量</Radio>
            </Radio.Group>
          </FormItem>

          <FormItem label="并行数" field="parallelism">
            <InputNumber
              min={1}
              step={1}
              value={syncSourceDataStrategy.parallelism}
              onChange={(parallelism) =>
                updateStrategy({ parallelism: Number(parallelism) || 1 })
              }
            />
          </FormItem>

          <FormItem
            label={
              <span className="inline-flex items-center gap-[4px]">
                异常策略
                <Popover content="同步出现异常时的处理方式">
                  <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
                </Popover>
              </span>
            }
            field="exceptionStrategy"
            rules={[{ required: true, message: '请选择异常策略' }]}
          >
            <Radio.Group
              value={syncSourceDataStrategy.exceptionStrategy}
              onChange={(exceptionStrategy) =>
                updateStrategy({ exceptionStrategy })
              }
            >
              <Radio value="STOP_ON_ERROR">立即停止</Radio>
              <Radio value="LOG_ERROR_AND_CONTINUE">继续消费</Radio>
            </Radio.Group>
          </FormItem>
        </>
      )}
    </>
  );
}
