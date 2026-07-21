import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Form } from '@arco-design/web-react';
import classNames from 'classnames';
import { LinkDirection, LinkType } from '../../../types/link';
import styles from './LinkForm.module.scss';
import { useAttributeFieldColumns } from './linkForm/hooks/useAttributeFieldColumns';
import { useIntermediateTableState } from './linkForm/hooks/useIntermediateTableState';
import { useLinkFormSubmitData } from './linkForm/hooks/useLinkFormSubmitData';
import { useObjectTypePrimaryAttributes } from './linkForm/hooks/useObjectTypePrimaryAttributes';
import AttributeMappingSection from './linkForm/sections/AttributeMappingSection';
import BasicInfoSection from './linkForm/sections/BasicInfoSection';
import LinkPairsSection from './linkForm/sections/LinkPairsSection';
import IntermediateSourceSection from './linkForm/sections/IntermediateSourceSection';
import RelationMappingSection from './linkForm/sections/RelationMappingSection';
import { LinkFormProps, LinkFormRef } from './linkForm/types';
import {
  mapFormLinkTypeToLinkDirection,
  mapLinkDirectionToFormLinkType
} from './linkForm/constants';
import { createEmptyLinkPairItem } from './linkForm/linkPairUtils';
import { LinkCreateFormData } from './linkForm/types';
import { useAutoOntologyIdentifierFromName } from '@/pages/ontologyScene/hooks/useAutoOntologyIdentifierFromName';

export type {
  AttributeField,
  LinkCreateFormData,
  LinkFormData,
  LinkFormRef,
  LinkPairFormItem
} from './linkForm/types';

const LinkForm = React.forwardRef<LinkFormRef, LinkFormProps>(
  (
    {
      initialValues,
      onSubmit,
      onCancel,
      loading = false,
      showFooter = true,
      ontologyModelID: ontologyModelIDProp,
      restrictManyToManyEditToNameOnly = false,
      createMode = false
    },
    ref
  ) => {
    const [form] = Form.useForm();
    const [linkDirection, setLinkDirection] = useState<LinkDirection>(() => {
      if (createMode) {
        return LinkDirection.UNIDIRECTIONAL;
      }
      if (initialValues?.linkType) {
        return mapFormLinkTypeToLinkDirection(initialValues.linkType);
      }
      return LinkDirection.UNIDIRECTIONAL;
    });
    const [linkType, setLinkType] = useState<LinkType>(() => {
      if (createMode) {
        return mapLinkDirectionToFormLinkType(LinkDirection.UNIDIRECTIONAL);
      }
      return initialValues?.linkType ?? LinkType.ONE_TO_ONE;
    });
    const { id: OSId } = useParams<{ id: string }>();
    const ontologyModelID =
      ontologyModelIDProp ?? (OSId ? Number(OSId) : undefined);

    const sourceObjectType = Form.useWatch('sourceObjectType', form);
    const targetObjectType = Form.useWatch('targetObjectType', form);

    useAutoOntologyIdentifierFromName({
      form,
      ontologyModelID,
      nameField: 'name',
      idField: 'id',
      enabled: !createMode && !initialValues?.id
    });

    const intermediateState = useIntermediateTableState(form);
    const {
      intermediateTable,
      setIntermediateTable,
      attributeFields,
      setAttributeFields,
      fieldsLoading,
      fileUploaded,
      setFileUploaded,
      isReUpload,
      setIsReUpload,
      initialFileList,
      setInitialFileList,
      syncSourceDataStrategy,
      setSyncSourceDataStrategy,
      getAttributeOptions,
      resetForLinkTypeChange,
      handleIntermediateTableTypeChange,
      handleLocalCsvFileChange,
      handleSyncSourceDataInfoChange,
      handleDatabaseSourceTableSelected,
      handleSqlColumnsParsed,
      updateSyncSourceDataStrategy
    } = intermediateState;

    const {
      sourcePrimaryAttribute,
      setSourcePrimaryAttribute,
      targetPrimaryAttributeName,
      targetObjectAttributeOptions,
      targetPrimaryAttributeLoading
    } = useObjectTypePrimaryAttributes({
      form,
      sourceObjectType,
      targetObjectType,
      ontologyModelID,
      linkType
    });

    const nnNameOnlyEdit =
      !createMode &&
      restrictManyToManyEditToNameOnly &&
      linkType === LinkType.MANY_TO_MANY;

    const allowLocalCsvReUpload =
      nnNameOnlyEdit && intermediateTable.type === 'local_csv';
    const localCsvReUploadActive = allowLocalCsvReUpload && isReUpload;

    const attributeColumns = useAttributeFieldColumns({
      form,
      attributeFields,
      setAttributeFields,
      intermediateTable,
      readOnly: nnNameOnlyEdit && !localCsvReUploadActive
    });

    const { buildSubmitData } = useLinkFormSubmitData({
      form,
      linkType,
      sourceObjectType,
      targetObjectType,
      intermediateTable,
      fileUploaded,
      attributeFields,
      sourcePrimaryAttribute,
      isReUpload,
      syncSourceDataStrategy,
      initialValues,
      restrictManyToManyEditToNameOnly
    });

    useEffect(() => {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          id: initialValues.id,
          linkType: initialValues.linkType ?? LinkType.ONE_TO_ONE,
          linkDirection:
            initialValues.linkType != null
              ? mapFormLinkTypeToLinkDirection(initialValues.linkType)
              : LinkDirection.UNIDIRECTIONAL,
          sourceObjectType: initialValues.sourceObjectType,
          targetObjectType: initialValues.targetObjectType,
          targetObjectAttribute: initialValues.targetObjectAttribute,
          sourceAttribute: initialValues.sourceAttribute,
          targetAttribute: initialValues.targetAttribute,
          attributeFields: initialValues.attributeFields || [],
          syncMode: initialValues.syncSourceDataStrategy?.mode,
          conflictStrategy:
            initialValues.syncSourceDataStrategy?.conflictStrategy,
          syncScope: initialValues.syncSourceDataStrategy?.syncScope,
          pollFetchSize: initialValues.syncSourceDataStrategy?.pollFetchSize,
          parallelism: initialValues.syncSourceDataStrategy?.parallelism ?? 1,
          exceptionStrategy:
            initialValues.syncSourceDataStrategy?.exceptionStrategy,
          jdbcCheckpointField:
            initialValues.syncSourceDataStrategy?.jdbcCheckpointField,
          jdbcIncrementalTimeField:
            initialValues.syncSourceDataStrategy?.jdbcIncrementalTimeField,
          jdbcPollingIntervalSeconds:
            initialValues.syncSourceDataStrategy?.jdbcPollingIntervalSeconds,
          jdbcSyncSqlFull:
            initialValues.syncSourceDataStrategy?.jdbcSyncSqlFull,
          jdbcSyncSqlIncrement:
            initialValues.syncSourceDataStrategy?.jdbcSyncSqlIncrement,
          linkSourceConnector:
            initialValues.syncSourceDataStrategy?.sourceDataInfo?.connectorId,
          linkSourceQueryMode:
            initialValues.syncSourceDataStrategy?.sourceDataInfo?.queryMode,
          linkSourceDatabaseTable:
            initialValues.syncSourceDataStrategy?.sourceDataInfo
              ?.databaseName &&
            initialValues.syncSourceDataStrategy?.sourceDataInfo?.tableName
              ? [
                  initialValues.syncSourceDataStrategy.sourceDataInfo
                    .databaseName,
                  initialValues.syncSourceDataStrategy.sourceDataInfo.tableName
                ]
              : undefined,
          linkSourceSql:
            initialValues.syncSourceDataStrategy?.sourceDataInfo?.sql
        });

        if (initialValues.linkType) {
          setLinkType(initialValues.linkType);
          setLinkDirection(
            mapFormLinkTypeToLinkDirection(initialValues.linkType)
          );
        }

        if (initialValues.intermediateTable) {
          setIntermediateTable(initialValues.intermediateTable);
          setFileUploaded(
            !!(
              initialValues.intermediateTable.file ||
              initialValues.intermediateTable.filePath ||
              (initialValues.intermediateTable.database &&
                initialValues.intermediateTable.table)
            )
          );

          if (initialValues.intermediateTable.filePath) {
            const fileName =
              initialValues.intermediateTable.filePath.split('/').pop() || '';
            if (fileName && fileName.trim()) {
              setInitialFileList([
                {
                  uid: `initial-link-file-${initialValues.id ?? 'new'}`,
                  name: fileName
                }
              ]);
            }
          }
        }

        if (initialValues.syncSourceDataStrategy) {
          setSyncSourceDataStrategy({
            ...initialValues.syncSourceDataStrategy,
            sourceDataInfo: {
              ...initialValues.syncSourceDataStrategy.sourceDataInfo,
              queryMode:
                initialValues.syncSourceDataStrategy.sourceDataInfo
                  ?.queryMode === 'sql'
                  ? 'sql'
                  : 'selected'
            },
            parallelism: initialValues.syncSourceDataStrategy.parallelism ?? 1
          });
        }

        if (initialValues.attributeFields) {
          setAttributeFields(initialValues.attributeFields);
        }
      } else if (createMode) {
        form.setFieldsValue({
          linkPairs: [createEmptyLinkPairItem()]
        });
      } else {
        form.setFieldsValue({
          linkType: LinkType.ONE_TO_ONE
        });
      }
    }, [
      createMode,
      form,
      initialValues,
      setAttributeFields,
      setFileUploaded,
      setInitialFileList,
      setIntermediateTable,
      setSyncSourceDataStrategy
    ]);

    const handleLinkTypeChange = (type: LinkType) => {
      setLinkType(type);
      setLinkDirection(mapFormLinkTypeToLinkDirection(type));
      const cachedName = form.getFieldValue('name');
      const cachedId = form.getFieldValue('id');
      form.resetFields();
      form.setFieldsValue({
        name: cachedName,
        id: cachedId,
        linkType: type,
        linkDirection: mapFormLinkTypeToLinkDirection(type)
      });
      resetForLinkTypeChange();
    };

    const handleLinkDirectionChange = (direction: LinkDirection) => {
      const nextLinkType = mapLinkDirectionToFormLinkType(direction);
      setLinkDirection(direction);
      setLinkType(nextLinkType);
      form.setFieldsValue({
        linkDirection: direction,
        linkType: nextLinkType
      });
    };

    const handleSubmit = async () => {
      try {
        if (createMode) {
          await form.validate();
          const values = form.getFieldsValue();
          const linkPairs = values.linkPairs || [];
          if (!linkPairs.length) {
            return;
          }
          onSubmit({ linkPairs } as LinkCreateFormData);
          return;
        }

        const formData = await buildSubmitData();
        if (formData) {
          onSubmit(formData);
        }
      } catch (error) {
        console.error('Form validation failed:', error);
      }
    };

    React.useImperativeHandle(ref, () => ({
      submit: handleSubmit
    }));

    return (
      <div
        className={classNames(
          'flex flex-col px-[24px] pb-[16px]',
          showFooter ? 'flex-1 pb-24' : '',
          styles['link-form']
        )}
      >
        <div className={showFooter ? 'flex-1' : ''}>
          <Form
            form={form}
            autoComplete="off"
            requiredSymbol={createMode ? false : undefined}
            wrapperCol={{ span: 18 }}
            labelAlign="left"
            className={styles['link-form']}
          >
            {createMode ? (
              <LinkPairsSection
                form={form}
                ontologyModelID={ontologyModelID}
                styles={styles}
              />
            ) : (
              <BasicInfoSection
                form={form}
                styles={styles}
                initialValues={initialValues}
                linkType={linkType}
                linkDirection={linkDirection}
                ontologyModelID={ontologyModelID}
                sourceObjectType={sourceObjectType}
                targetObjectType={targetObjectType}
                sourcePrimaryAttribute={sourcePrimaryAttribute}
                setSourcePrimaryAttribute={setSourcePrimaryAttribute}
                targetPrimaryAttributeName={targetPrimaryAttributeName}
                targetObjectAttributeOptions={targetObjectAttributeOptions}
                targetPrimaryAttributeLoading={targetPrimaryAttributeLoading}
                onLinkTypeChange={handleLinkTypeChange}
                onLinkDirectionChange={handleLinkDirectionChange}
                nnNameOnlyEdit={nnNameOnlyEdit}
              />
            )}

            {!createMode && linkType === LinkType.MANY_TO_MANY && (
              <>
                <IntermediateSourceSection
                  form={form}
                  styles={styles}
                  hasInitialId={!!initialValues?.id}
                  intermediateTable={intermediateTable}
                  initialFileList={initialFileList}
                  syncSourceDataStrategy={syncSourceDataStrategy}
                  readOnly={nnNameOnlyEdit}
                  allowLocalCsvReUpload={allowLocalCsvReUpload}
                  onIntermediateTableTypeChange={
                    handleIntermediateTableTypeChange
                  }
                  onLocalCsvFileChange={handleLocalCsvFileChange}
                  onSyncSourceDataInfoChange={handleSyncSourceDataInfoChange}
                  onDatabaseSourceTableSelected={
                    handleDatabaseSourceTableSelected
                  }
                  onSqlColumnsParsed={handleSqlColumnsParsed}
                  onSyncSourceDataStrategyChange={updateSyncSourceDataStrategy}
                />

                <RelationMappingSection
                  form={form}
                  fileUploaded={fileUploaded}
                  attributeOptions={getAttributeOptions()}
                  readOnly={nnNameOnlyEdit && !localCsvReUploadActive}
                />

                <AttributeMappingSection
                  styles={styles}
                  fieldsLoading={fieldsLoading}
                  attributeFields={attributeFields}
                  attributeColumns={attributeColumns}
                />
              </>
            )}
          </Form>
        </div>

        {showFooter && (
          <div className="fixed bottom-0 z-10 border-t border-[#E5E6EB] bg-white px-6 py-4">
            <div className="flex justify-end gap-3">
              <Button onClick={onCancel} disabled={loading}>
                取消
              </Button>
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                确定
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

LinkForm.displayName = 'LinkForm';

export default LinkForm;
