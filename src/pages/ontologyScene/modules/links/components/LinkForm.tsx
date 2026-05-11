import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Form } from '@arco-design/web-react';
import classNames from 'classnames';
import { LinkType } from '../../../types/link';
import styles from './LinkForm.module.scss';
import { useAttributeFieldColumns } from './linkForm/hooks/useAttributeFieldColumns';
import { useIntermediateTableState } from './linkForm/hooks/useIntermediateTableState';
import { useLinkFormSubmitData } from './linkForm/hooks/useLinkFormSubmitData';
import { useObjectTypePrimaryAttributes } from './linkForm/hooks/useObjectTypePrimaryAttributes';
import AttributeMappingSection from './linkForm/sections/AttributeMappingSection';
import BasicInfoSection from './linkForm/sections/BasicInfoSection';
import IntermediateSourceSection from './linkForm/sections/IntermediateSourceSection';
import RelationMappingSection from './linkForm/sections/RelationMappingSection';
import { LinkFormProps, LinkFormRef } from './linkForm/types';

export type {
  AttributeField,
  LinkFormData,
  LinkFormRef
} from './linkForm/types';

const LinkForm = React.forwardRef<LinkFormRef, LinkFormProps>(
  (
    { initialValues, onSubmit, onCancel, loading = false, showFooter = true },
    ref
  ) => {
    const [form] = Form.useForm();
    const [linkType, setLinkType] = useState<LinkType>(LinkType.ONE_TO_ONE);
    const { id: OSId } = useParams<{ id: string }>();
    const ontologyModelID = OSId ? Number(OSId) : undefined;

    const sourceObjectType = Form.useWatch('sourceObjectType', form);
    const targetObjectType = Form.useWatch('targetObjectType', form);

    const intermediateState = useIntermediateTableState(form);
    const {
      intermediateTable,
      setIntermediateTable,
      setSelectedDatabase,
      setSelectedTable,
      cascaderOptions,
      cascaderValue,
      setCascaderValue,
      attributeFields,
      setAttributeFields,
      fieldsLoading,
      fileUploaded,
      setFileUploaded,
      isReUpload,
      setIsReUpload,
      initialFileList,
      setInitialFileList,
      getAttributeOptions,
      resetForLinkTypeChange,
      handleCascaderLoadMore,
      handleCascaderChange,
      handleIntermediateTableTypeChange,
      handleLocalCsvFileChange
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

    const attributeColumns = useAttributeFieldColumns({
      form,
      attributeFields,
      setAttributeFields,
      intermediateTable
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
      isReUpload
    });

    useEffect(() => {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          id: initialValues.id,
          sourceObjectType: initialValues.sourceObjectType,
          targetObjectType: initialValues.targetObjectType,
          targetObjectAttribute: initialValues.targetObjectAttribute,
          sourceAttribute: initialValues.sourceAttribute,
          targetAttribute: initialValues.targetAttribute,
          attributeFields: initialValues.attributeFields || []
        });

        if (initialValues.linkType) {
          setLinkType(initialValues.linkType);
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

          if (
            initialValues.intermediateTable.type === 'data_lake_sync' &&
            initialValues.intermediateTable.database &&
            initialValues.intermediateTable.table
          ) {
            setSelectedDatabase(initialValues.intermediateTable.database);
            setSelectedTable(initialValues.intermediateTable.table);
            setCascaderValue([
              initialValues.intermediateTable.database,
              initialValues.intermediateTable.table
            ]);
          }

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

        if (initialValues.attributeFields) {
          setAttributeFields(initialValues.attributeFields);
        }
      } else {
        form.setFieldsValue({
          linkType: LinkType.ONE_TO_ONE
        });
      }
    }, [
      form,
      initialValues,
      setAttributeFields,
      setCascaderValue,
      setFileUploaded,
      setInitialFileList,
      setIntermediateTable,
      setSelectedDatabase,
      setSelectedTable
    ]);

    const handleLinkTypeChange = (type: LinkType) => {
      setLinkType(type);
      const cachedName = form.getFieldValue('name');
      const cachedId = form.getFieldValue('id');
      form.resetFields();
      form.setFieldsValue({
        name: cachedName,
        id: cachedId,
        linkType: type
      });
      resetForLinkTypeChange();
    };

    const handleSubmit = async () => {
      try {
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
            wrapperCol={{ span: 18 }}
            labelAlign="left"
            className={styles['link-form']}
          >
            <BasicInfoSection
              form={form}
              styles={styles}
              initialValues={initialValues}
              linkType={linkType}
              ontologyModelID={ontologyModelID}
              sourceObjectType={sourceObjectType}
              targetObjectType={targetObjectType}
              sourcePrimaryAttribute={sourcePrimaryAttribute}
              setSourcePrimaryAttribute={setSourcePrimaryAttribute}
              targetPrimaryAttributeName={targetPrimaryAttributeName}
              targetObjectAttributeOptions={targetObjectAttributeOptions}
              targetPrimaryAttributeLoading={targetPrimaryAttributeLoading}
              onLinkTypeChange={handleLinkTypeChange}
            />

            {linkType === LinkType.MANY_TO_MANY && (
              <>
                <IntermediateSourceSection
                  form={form}
                  styles={styles}
                  hasInitialId={!!initialValues?.id}
                  intermediateTable={intermediateTable}
                  initialFileList={initialFileList}
                  cascaderValue={cascaderValue}
                  cascaderOptions={cascaderOptions}
                  onIntermediateTableTypeChange={
                    handleIntermediateTableTypeChange
                  }
                  onLocalCsvFileChange={handleLocalCsvFileChange}
                  onCascaderChange={handleCascaderChange}
                  onCascaderLoadMore={handleCascaderLoadMore}
                />

                <RelationMappingSection
                  form={form}
                  fileUploaded={fileUploaded}
                  attributeOptions={getAttributeOptions()}
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
