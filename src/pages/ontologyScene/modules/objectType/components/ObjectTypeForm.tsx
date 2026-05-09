import React, { useEffect, useState } from 'react';
import { Form, Input, Button } from '@arco-design/web-react';
import classNames from 'classnames';
import styles from './ObjectTypeForm.module.scss';
import {
  DATA_SOURCE_TYPE,
  DataSourceType,
  OBJECT_TYPE_ICON_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import ObjectTypeIconSelector from './ObjectTypeIconSelector';
import DataSourceSection from './ObjectTypeFormSections/DataSourceSection';
import AttributeMappingSection from './ObjectTypeFormSections/AttributeMappingSection';
import {
  AttributeField,
  ObjectTypeDataSourceState,
  ObjectTypeFormData
} from './ObjectTypeFormUtils/types';
import { mergeOntologyPhysicalPropertiesForForm } from './ObjectTypeFormUtils/attributeFields';
import { buildObjectTypeFormData } from './ObjectTypeFormHooks/useObjectTypeSubmit';

export type { ObjectTypeFormData } from './ObjectTypeFormUtils/types';

const FormItem = Form.Item;
const { TextArea } = Input;

interface ObjectTypeFormProps {
  initialValues?: Partial<ObjectTypeFormData>;
  onSubmit: (data: ObjectTypeFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  showFooter?: boolean;
  isEdit?: boolean;
}

export interface ObjectTypeFormRef {
  submit: () => void;
}

const ObjectTypeForm = React.forwardRef<ObjectTypeFormRef, ObjectTypeFormProps>(
  (
    {
      initialValues,
      onSubmit,
      onCancel,
      loading = false,
      showFooter = true,
      isEdit = false
    },
    ref
  ) => {
    const [form] = Form.useForm();
    const [selectedIcon, setSelectedIcon] = useState<string>(
      initialValues?.icon || ''
    );
    const [dataSource, setDataSource] = useState<ObjectTypeDataSourceState>({
      type: DATA_SOURCE_TYPE.LOCAL_CSV
    });
    const [attributeFields, setAttributeFields] = useState<AttributeField[]>(
      []
    );
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const [, setFileUploaded] = useState(false);
    const [isReUpload, setIsReUpload] = useState(false);
    const [initialFileList, setInitialFileList] = useState<any[]>([]);

    useEffect(() => {
      if (initialValues) {
        const formData = form.getFieldsValue();

        if (isEdit) {
          form.setFieldsValue({
            ...formData,
            ...initialValues,
            dataSourceType:
              initialValues._dataSource?.type || DATA_SOURCE_TYPE.LOCAL_CSV,
            database: initialValues._dataSource?.database,
            table: initialValues._dataSource?.table
          });
        } else {
          form.setFieldsValue({
            ...formData,
            ...initialValues,
            dataSourceType:
              formData.dataSourceType || DATA_SOURCE_TYPE.LOCAL_CSV
          });
        }

        if (initialValues.icon) {
          setSelectedIcon(initialValues.icon);
        }
        if (initialValues._dataSource) {
          setDataSource({
            ...initialValues._dataSource,
            type:
              initialValues._dataSource.type ||
              (DATA_SOURCE_TYPE.LOCAL_CSV as DataSourceType)
          });
          setFileUploaded(!!initialValues._dataSource.file);
        }
        if (initialValues.ontologyPhysicalPropertiesList) {
          setAttributeFields(
            mergeOntologyPhysicalPropertiesForForm(
              initialValues.ontologyPhysicalPropertiesList
            )
          );
        }
        if (initialValues.filePath && initialValues.filePath.trim()) {
          const fileName = initialValues.filePath.split('/').pop() || '';
          if (fileName && fileName.trim()) {
            setInitialFileList([
              {
                uid: `initial-object-file-${initialValues.code ?? fileName}`,
                name: fileName
              }
            ]);
          }
          const dataSourceType =
            initialValues._dataSource?.type || DATA_SOURCE_TYPE.LOCAL_CSV;
          if (dataSourceType === DATA_SOURCE_TYPE.LOCAL_CSV) {
            setDataSource((prev) => ({
              ...prev,
              type: DATA_SOURCE_TYPE.LOCAL_CSV,
              filePath: initialValues.filePath
            }));
            setFileUploaded(true);
          }
        }
      } else {
        form.setFieldsValue({
          dataSourceType: DATA_SOURCE_TYPE.LOCAL_CSV
        });
      }
    }, [initialValues, form, isEdit]);

    const handleIconChange = (iconValue: string) => {
      setSelectedIcon(iconValue);
      form.setFieldValue('icon', iconValue);
    };

    const handleSubmit = async () => {
      try {
        const values = await form.validate();
        const formData = buildObjectTypeFormData({
          values,
          selectedIcon,
          initialOntologyModelID: initialValues?.ontologyModelID,
          dataSource,
          attributeFields,
          isReUpload
        });

        if (!formData) {
          return;
        }

        onSubmit(formData);
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
          showFooter ? 'flex-1 pb-24' : ''
        )}
      >
        <div className={showFooter ? 'flex-1' : ''}>
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 22 }}
            labelAlign="left"
            className={styles['object-type-form']}
          >
            <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
              基本信息
            </div>

            <FormItem
              label="对象类型名称"
              field="name"
              rules={[
                { required: true, message: '请输入对象类型名称' },
                { maxLength: 50, message: '名称不能超过50个字符' }
              ]}
            >
              <Input
                placeholder="请输入对象类型名称。用于在界面上展示，如：传感器"
                maxLength={50}
                showWordLimit
                allowClear
              />
            </FormItem>

            <FormItem
              label="对象类型id"
              field="code"
              rules={[
                { required: true, message: '请输入id' },
                {
                  validator: (value, callback) => {
                    if (!value) {
                      callback();
                      return;
                    }
                    if (!/^[a-zA-Z]/.test(value)) {
                      callback('首字符必须为英文字母');
                      return;
                    }
                    if (!/^[a-zA-Z0-9]+$/.test(value)) {
                      callback('仅允许英文字母与数字(不允许下划线及特殊符号)');
                      return;
                    }
                    callback();
                  }
                }
              ]}
              extra={
                <div className="text-[12px] text-[var(--color-text-4)]">
                  首字符必须为英文字母;仅允许英文字母与数字(不允许下划线及特殊符号)
                </div>
              }
            >
              <Input
                placeholder="请输入id。用于 API 调用，全局唯一"
                allowClear
                disabled={!!initialValues?.code}
              />
            </FormItem>

            <FormItem label="描述说明" field="description">
              <TextArea
                placeholder="请输入描述说明，详述该实体的业务边界与逻辑范围"
                autoSize={{ minRows: 3 }}
                maxLength={500}
                showWordLimit
              />
            </FormItem>

            <FormItem label="图标" field="icon">
              <ObjectTypeIconSelector
                initialValue={selectedIcon}
                onChange={handleIconChange}
                options={OBJECT_TYPE_ICON_OPTIONS}
              />
            </FormItem>

            <DataSourceSection
              form={form}
              initialCode={initialValues?.code}
              dataSource={dataSource}
              setDataSource={setDataSource}
              setAttributeFields={setAttributeFields}
              setFieldsLoading={setFieldsLoading}
              setFileUploaded={setFileUploaded}
              setIsReUpload={setIsReUpload}
              initialFileList={initialFileList}
              setInitialFileList={setInitialFileList}
              styles={styles}
            />

            <AttributeMappingSection
              form={form}
              dataSourceType={dataSource.type}
              attributeFields={attributeFields}
              setAttributeFields={setAttributeFields}
              fieldsLoading={fieldsLoading}
              styles={styles}
            />
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

ObjectTypeForm.displayName = 'ObjectTypeForm';

export default ObjectTypeForm;
