import React, { useState } from 'react';
import { Modal, Radio, Button, Message } from '@arco-design/web-react';
import FieldImportUpload from './FieldImportUpload';

interface ImportFieldsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (importType: string, fileData: any) => void;
}

const ImportFieldsModal: React.FC<ImportFieldsModalProps> = ({
  visible,
  onClose,
  onConfirm
}) => {
  const [importType, setImportType] = useState('append');
  const [fileData, setFileData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);

  const handleFileChange = (data: any) => {
    setFileData(data);
    setCanConfirm(!!data);
  };

  const handleConfirm = () => {
    if (!fileData) {
      Message.error('请选择文件');
      return;
    }

    onConfirm(importType, fileData);

    // 重置状态
    setImportType('append');
    setFileData(null);
    setCanConfirm(false);
    onClose();
  };

  const handleCancel = () => {
    // 重置状态
    setImportType('append');
    setFileData(null);
    setCanConfirm(false);
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
      <div style={{ padding: '20px 0' }}>
        {/* 导入方式 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: '#F53F3F', marginRight: '4px' }}>*</span>
            <span>导入方式：</span>
          </div>
          <Radio.Group
            value={importType}
            onChange={(value) => setImportType(value)}
          >
            <Radio value="append">追加导入</Radio>
            <Radio value="overwrite">覆盖导入</Radio>
          </Radio.Group>
        </div>

        {/* 选择文件 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: '#F53F3F', marginRight: '4px' }}>*</span>
            <span>选择文件：</span>
          </div>
          <FieldImportUpload
            onFileChange={handleFileChange}
            onUploadingChange={setIsUploading}
          />
        </div>

        {/* 下载模板提示 */}
        <div
          style={{ marginBottom: '24px', fontSize: '14px', color: '#4E5969' }}
        >
          <span>按照格式准备数据，</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: 实现模板下载功能
              Message.info('模板下载功能待实现');
            }}
            style={{ color: '#165DFF' }}
          >
            下载模板
          </a>
        </div>

        {/* 操作按钮 */}
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}
        >
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            disabled={!canConfirm || isUploading}
          >
            确定
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportFieldsModal;
