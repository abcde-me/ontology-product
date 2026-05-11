import React from 'react';
import { Cascader, Form, Popover, Radio } from '@arco-design/web-react';
import {
  IconInfoCircle,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import classNames from 'classnames';
import FieldImportUpload from '@/pages/ontologyScene/components/FieldImportUpload';
import { EllipsisPopover } from '@/pages/ontologyScene/components';
import { PrefixAimdp } from '@/api/endpoints';
import { openNewPage } from '@/utils/env';
import {
  CascaderOption,
  IntermediateTable,
  IntermediateTableType
} from '../types';
import { databaseTableCascaderFilterOption } from '../utils/linkFormUtils';

const FormItem = Form.Item;

interface IntermediateSourceSectionProps {
  form: any;
  styles: Record<string, string>;
  hasInitialId: boolean;
  intermediateTable: IntermediateTable;
  initialFileList: any[];
  cascaderValue: string[];
  cascaderOptions: CascaderOption[];
  onIntermediateTableTypeChange: (type: IntermediateTableType) => void;
  onLocalCsvFileChange: (file: any, markReUpload: boolean) => void;
  onCascaderChange: (value: string[] | undefined) => void;
  onCascaderLoadMore: (pathValue: string[], level: number) => Promise<any[]>;
}

export default function IntermediateSourceSection({
  form,
  styles,
  hasInitialId,
  intermediateTable,
  initialFileList,
  cascaderValue,
  cascaderOptions,
  onIntermediateTableTypeChange,
  onLocalCsvFileChange,
  onCascaderChange,
  onCascaderLoadMore
}: IntermediateSourceSectionProps) {
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
            <Radio value="data_lake_sync">数据湖同步</Radio>
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
        <FormItem
          label="数据库/表"
          field="databaseTable"
          rules={[
            {
              required: true,
              validator: (_value, callback) => {
                if (
                  intermediateTable.type === 'data_lake_sync' &&
                  (!cascaderValue || cascaderValue.length !== 2)
                ) {
                  callback('请选择数据库/表');
                } else {
                  callback();
                }
              }
            }
          ]}
        >
          <div className="flex items-center">
            <Cascader
              placeholder="请选择数据库/表"
              virtualListProps={{
                threshold: 100,
                isStaticItemHeight: true
              }}
              dropdownMenuClassName={styles['link-type-cascader-dropdown']}
              value={cascaderValue.length > 0 ? cascaderValue : undefined}
              options={cascaderOptions}
              onChange={(value) => {
                onCascaderChange(value as string[] | undefined);
              }}
              loadMore={onCascaderLoadMore}
              allowClear
              filterOption={databaseTableCascaderFilterOption}
              changeOnSelect
              renderFormat={(valueShow) => {
                if (valueShow.length === 0) return '';
                if (valueShow.length === 1) {
                  return valueShow[0];
                }
                return `${valueShow[0]}/${valueShow[1]}`;
              }}
              renderOption={(option) => {
                const isTableLevel = option.isLeaf === true;

                if (isTableLevel) {
                  return (
                    <div
                      className={classNames(
                        styles['table-option-with-icon'],
                        'flex w-full items-center justify-between'
                      )}
                    >
                      <EllipsisPopover
                        preferTypography
                        value={option.label}
                        className="min-w-0 flex-1"
                      />
                      <Popover content="详情" position="top" trigger="hover">
                        <IconInfoCircle
                          className="flex-shrink-0 cursor-pointer text-[16px] text-[#86909C] transition-colors hover:text-[#165DFF]"
                          onClick={(e) => {
                            e.stopPropagation();
                            openNewPage(
                              `/onto/tenant/compute/onto/metadataManagement/detail?id=${option.value}&metadataType=ICEBERG`
                            );
                          }}
                        />
                      </Popover>
                    </div>
                  );
                }

                return (
                  <EllipsisPopover preferTypography value={option.label} />
                );
              }}
              showSearch
              dropdownMenuColumnStyle={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            />
          </div>
        </FormItem>
      )}
    </>
  );
}
