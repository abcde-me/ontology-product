import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Radio, Button, Message, Form } from '@arco-design/web-react';
import FieldImportUpload from './FieldImportUpload';
import { UploadItem } from '@arco-design/web-react/es/Upload';
import { ImportType, UploadStatus } from '../../types';
import { DataAssetField } from '@/types/dataAssetApi';

const FormItem = Form.Item;

interface ImportFieldsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (importType: ImportType, fileData: DataAssetField[]) => void;
}

const ImportFieldsModal: React.FC<ImportFieldsModalProps> = ({
  visible,
  onClose,
  onConfirm
}) => {
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [fileData, setFileData] = useState<UploadItem | null>(null);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setIsUploading(false);
      setFileData(null);
    }
  }, [visible, form]);

  const handleFileChange = useCallback(
    (data: UploadItem) => {
      setFileData(data);
      // 验证文件字段
      if (data?.status === UploadStatus.done) {
        form.setFieldValue('fileData', data);
        form.clearFields('fileData');
      } else {
        form.setFieldValue('fileData', null);
      }
    },
    [form]
  );

  const validateFileData = useCallback(
    (value: any, callback: any) => {
      if (!fileData) {
        // TODO: 联调放开验证
        // callback('请选择并上传文件');
        callback();
      } else {
        callback();
      }
    },
    [fileData]
  );

  const handleConfirm = async () => {
    try {
      const values = await form.validate();
      // TODO: 确认返回值,先写死
      // onConfirm(values.importType, fileData?.response?.data ?? []);
      onConfirm(values.importType, [
        {
          nameZh: '111',
          nameEn: '111',
          type: 'string',
          default: 'null',
          required: true,
          allowModify: true
        },
        {
          nameZh: '222',
          nameEn: '222',
          type: 'number',
          default: 'null',
          required: true,
          allowModify: true
        },
        {
          nameZh: '333',
          nameEn: '333',
          type: 'boolean',
          default: 'null',
          required: true,
          allowModify: true
        }
      ]);

      // 重置状态
      form.resetFields();
      setFileData(null);
      setIsUploading(false);
      onClose();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileData(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <Modal
      title="导入字段"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      style={{ width: 600 }}
      autoFocus={false}
      focusLock={true}
    >
      <Form
        form={form}
        initialValues={{
          importType: ImportType.append
        }}
        className="mb-[20px]"
      >
        {/* 导入方式 */}
        <FormItem
          label="导入方式:"
          labelCol={{ span: 4 }}
          field="importType"
          required
          rules={[{ required: true, message: '请选择导入方式' }]}
        >
          <Radio.Group>
            <Radio value={ImportType.append}>追加导入</Radio>
            <Radio value={ImportType.overwrite}>覆盖导入</Radio>
          </Radio.Group>
        </FormItem>

        {/* 选择文件 */}
        <FormItem
          label="选择文件:"
          labelCol={{ span: 4 }}
          field="fileData"
          required
          rules={[
            {
              required: true,
              validator: validateFileData
            }
          ]}
        >
          <FieldImportUpload
            onFileChange={handleFileChange}
            onUploadingChange={setIsUploading}
          />
        </FormItem>

        {/* 操作按钮 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            marginTop: '24px'
          }}
        >
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleConfirm} disabled={isUploading}>
            确定
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ImportFieldsModal;
