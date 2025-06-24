import React from 'react';
import { Button, Space, Descriptions } from '@arco-design/web-react';
import { exportFile } from '@/api/dataCatalog';

interface FormProps {
  downloadData?: any;
  onCancel?: () => void;
}

const FormComponent: React.FC<FormProps> = ({ downloadData, onCancel }) => {
  const handleExport = () => {
    //导出逻辑
    exportFile({});
    onCancel && onCancel();
  };

  return (
    <div style={{ padding: '20px' }}>
      <Descriptions
        title="文件信息"
        data={[
          {
            label: '文件名称',
            value: downloadData?.file || '-'
          },
          {
            label: '文件类型',
            value: downloadData?.type || '-'
          },
          {
            label: '创建时间',
            value: downloadData?.createdAt || '-'
          },
          {
            label: '工作流ID',
            value: downloadData?.workflowId || '-'
          },
          {
            label: '数据内容',
            value: downloadData?.content || '-'
          }
        ]}
        column={1}
      />

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleExport}>
            导出文件
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default FormComponent;
