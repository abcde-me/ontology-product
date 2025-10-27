import React, { useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Grid,
  Input,
  Message
} from '@arco-design/web-react';
// import { Add, Upload } from '@arco-design/web-react/icon';
import { MetadataField, DataSource } from './DataAssetFormContainer';
import FieldRow from './FieldRow';
import ImportFieldsModal from './ImportFieldsModal';

interface Step1MetadataFieldsProps {
  metadataFields: MetadataField[];
  setMetadataFields: React.Dispatch<React.SetStateAction<MetadataField[]>>;
  dataSources: DataSource;
  setDataSources: React.Dispatch<React.SetStateAction<DataSource>>;
  onCancel: () => void;
  onNext: () => void;
}

export default function Step1MetadataFields({
  metadataFields,
  setMetadataFields,
  dataSources,
  setDataSources,
  onCancel,
  onNext
}: Step1MetadataFieldsProps) {
  const Row = Grid.Row;
  const Col = Grid.Col;
  const [showImportModal, setShowImportModal] = useState(false);

  // 添加字段行
  const handleAddField = () => {
    const newField: MetadataField = {
      id: `field_${Date.now()}`,
      sequence: metadataFields.length + 1,
      chineseName: '',
      englishName: '',
      fieldType: '',
      defaultValue: '默认null',
      required: true,
      editable: true
    };
    setMetadataFields([...metadataFields, newField]);
  };

  // 删除字段行
  const handleDeleteField = (id: string) => {
    setMetadataFields(metadataFields.filter((field) => field.id !== id));
  };

  // 更新字段
  const handleUpdateField = (id: string, updates: Partial<MetadataField>) => {
    setMetadataFields(
      metadataFields.map((field) => {
        if (field.id === id) {
          return { ...field, ...updates };
        }
        return field;
      })
    );
  };

  // 导入字段
  const handleImportFields = () => {
    setShowImportModal(true);
  };

  // 处理导入确认
  const handleImportConfirm = (importType: string, fileData: any) => {
    // TODO: 根据导入类型和文件数据，解析并更新字段列表
    console.log('导入类型:', importType);
    console.log('文件数据:', fileData);
    Message.success('字段导入成功');
  };

  // 数据源变更
  const handleDataSourceChange = (key: keyof DataSource, checked: boolean) => {
    setDataSources({ ...dataSources, [key]: checked });
  };

  // 下一步前验证
  const handleNextStep = () => {
    if (metadataFields.length === 0) {
      Message.error('请至少添加一个字段');
      return;
    }

    // 验证所有字段是否填写完整
    const incompleteFields = metadataFields.some(
      (field) => !field.chineseName || !field.englishName || !field.fieldType
    );

    if (incompleteFields) {
      Message.error('请填写完整的字段信息');
      return;
    }

    onNext();
  };

  return (
    <>
      {/* 导入字段模态框 */}
      <ImportFieldsModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onConfirm={handleImportConfirm}
      />

      {/* 数据资产字段列表 */}
      <Card
        className="mb-4"
        title={<span className="required">数据资产字段列表</span>}
      >
        <div className="mb-4">
          <Button
            type="text"
            className="cursor-pointer"
            // icon={<Upload />}
            onClick={handleImportFields}
          >
            导入字段
          </Button>
        </div>

        {/* 表头 */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[50px_2fr_2fr_200px_2fr_80px_80px_100px] gap-2 border-b pb-2 text-sm font-medium">
            <div>序号</div>
            <div>字段中文名称(展示名称)</div>
            <div>字段英文名称(存储名称)</div>
            <div>字段类型</div>
            <div>空值默认填充</div>
            <div className="text-center">必填</div>
            <div className="text-center">可修改</div>
            <div>操作</div>
          </div>

          {/* 字段行 */}
          {metadataFields.length === 0 ? (
            <div className="mt-8 text-center text-gray-400">
              <Button
                type="text"
                // icon={<Add />}
                className="cursor-pointer"
                onClick={handleAddField}
              >
                添加行
              </Button>
            </div>
          ) : (
            metadataFields.map((field) => (
              <FieldRow
                key={field.id}
                field={field}
                onUpdate={(updates) => handleUpdateField(field.id, updates)}
                onDelete={() => handleDeleteField(field.id)}
              />
            ))
          )}

          {/* 添加行按钮 */}
          {metadataFields.length > 0 && (
            <div className="mt-2">
              <Button
                type="text"
                className="cursor-pointer"
                onClick={handleAddField}
              >
                添加行
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 数据来源 */}
      <Card className="mb-4" title={<span className="required">数据来源</span>}>
        <Row gutter={24}>
          <Col span={8}>
            <Checkbox
              checked={dataSources.dataset}
              onChange={(checked) => handleDataSourceChange('dataset', checked)}
            >
              数据集
            </Checkbox>
          </Col>
          <Col span={8}>
            <Checkbox
              checked={dataSources.volume}
              onChange={(checked) => handleDataSourceChange('volume', checked)}
            >
              源数据目录-卷
            </Checkbox>
          </Col>
          <Col span={8}>
            <Checkbox
              checked={dataSources.database}
              onChange={(checked) =>
                handleDataSourceChange('database', checked)
              }
            >
              源数据目录-数据库
            </Checkbox>
          </Col>
          <Col span={8}>
            <Checkbox
              checked={dataSources.metadataDir}
              onChange={(checked) =>
                handleDataSourceChange('metadataDir', checked)
              }
            >
              源数据目录-元数据-目录
            </Checkbox>
          </Col>
        </Row>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" onClick={handleNextStep}>
          下一步
        </Button>
      </div>
    </>
  );
}
