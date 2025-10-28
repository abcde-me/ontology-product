import React, { useState, useCallback } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Grid,
  Input,
  Message,
  Form,
  Upload,
  Table,
  Select,
  Space
} from '@arco-design/web-react';
// import { Add, Upload } from '@arco-design/web-react/icon';
import { MetadataField, DataSource } from './DataAssetFormContainer';
import ImportFieldsModal from './ImportFieldsModal';
import styles from './Step1MetadataFields.module.scss';
import { IconDownload, IconUpload } from '@arco-design/web-react/icon';

const FormItem = Form.Item;

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
  const [form] = Form.useForm();

  // Table列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'sequence',
      width: 80,
      align: 'center' as const
    },
    {
      title: '字段中文名称',
      dataIndex: 'chineseName',
      width: 200,
      render: (_: any, record: MetadataField) => (
        <Input
          placeholder="请输入中文名称"
          value={record.chineseName}
          onChange={(value) =>
            handleUpdateField(record.id, { chineseName: value })
          }
        />
      )
    },
    {
      title: '字段英文名称',
      dataIndex: 'englishName',
      width: 200,
      render: (_: any, record: MetadataField) => (
        <Input
          placeholder="请输入英文名称"
          value={record.englishName}
          onChange={(value) =>
            handleUpdateField(record.id, { englishName: value })
          }
        />
      )
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      width: 150,
      render: (_: any, record: MetadataField) => (
        <Select
          placeholder="请选择"
          value={record.fieldType}
          onChange={(value) =>
            handleUpdateField(record.id, { fieldType: value })
          }
        >
          <Select.Option value="string">字符串</Select.Option>
          <Select.Option value="number">数字</Select.Option>
          <Select.Option value="boolean">布尔值</Select.Option>
          <Select.Option value="date">日期</Select.Option>
          <Select.Option value="object">对象</Select.Option>
        </Select>
      )
    },
    {
      title: '空值默认填充',
      dataIndex: 'defaultValue',
      width: 200,
      render: (_: any, record: MetadataField) => (
        <Input
          value={record.defaultValue}
          onChange={(value) =>
            handleUpdateField(record.id, { defaultValue: value })
          }
        />
      )
    },
    {
      title: '必填',
      dataIndex: 'required',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: MetadataField) => (
        <Checkbox
          checked={record.required}
          onChange={(checked) =>
            handleUpdateField(record.id, { required: checked })
          }
        />
      )
    },
    {
      title: '可修改',
      dataIndex: 'editable',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: MetadataField) => (
        <Checkbox
          checked={record.editable}
          onChange={(checked) =>
            handleUpdateField(record.id, { editable: checked })
          }
        />
      )
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: MetadataField) => (
        <Space>
          <Button
            type="text"
            size="small"
            onClick={() => handleAddField()}
            className="cursor-pointer text-red-500"
          >
            添加行
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => handleDeleteField(record.id)}
            className="cursor-pointer text-red-500"
          >
            删除行
          </Button>
        </Space>
      )
    }
  ];

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
    const updatedFields = [...metadataFields, newField];
    setMetadataFields(updatedFields);
    form.setFieldValue('metadataFields', updatedFields);
    form.validate(['metadataFields']);
  };

  // 删除字段行
  const handleDeleteField = (id: string) => {
    const updatedFields = metadataFields.filter((field) => field.id !== id);
    setMetadataFields(updatedFields);
    form.setFieldValue('metadataFields', updatedFields);
    form.validate(['metadataFields']);
  };

  // 更新字段
  const handleUpdateField = (id: string, updates: Partial<MetadataField>) => {
    const updatedFields = metadataFields.map((field) => {
      if (field.id === id) {
        return { ...field, ...updates };
      }
      return field;
    });
    setMetadataFields(updatedFields);
    form.setFieldValue('metadataFields', updatedFields);
  };

  // 导入字段
  const handleImportFields = () => {
    console.log('导入字段', showImportModal);
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
    const updatedDataSources = { ...dataSources, [key]: checked };
    setDataSources(updatedDataSources);
    form.setFieldValue('dataSources', updatedDataSources);
    // 触发表单验证
    form.validate(['dataSources']);
  };

  // 验证字段列表的自定义验证器
  const validateMetadataFields = useCallback(
    (value: any, callback: any) => {
      if (metadataFields.length === 0) {
        callback('请至少添加一个字段');
      } else {
        // 验证所有字段是否填写完整
        const incompleteFields = metadataFields.some(
          (field) =>
            !field.chineseName || !field.englishName || !field.fieldType
        );
        if (incompleteFields) {
          callback('请填写完整的字段信息');
        } else {
          callback();
        }
      }
    },
    [metadataFields]
  );

  // 验证数据来源的自定义验证器
  const validateDataSource = useCallback(
    (value: any, callback: any) => {
      const hasAnySource =
        dataSources.dataset ||
        dataSources.volume ||
        dataSources.database ||
        dataSources.metadataDir;
      if (!hasAnySource) {
        callback('请至少选择一个数据来源');
      } else {
        callback();
      }
    },
    [dataSources]
  );

  // 下一步前验证
  const handleNextStep = async () => {
    // 同步metadataFields和dataSources到form
    form.setFieldValue('metadataFields', metadataFields);
    form.setFieldValue('dataSources', dataSources);

    try {
      await form.validate();
      onNext();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <>
      {/* 导入字段模态框 */}
      <ImportFieldsModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onConfirm={handleImportConfirm}
      />

      <Form
        form={form}
        initialValues={{
          metadataFields,
          dataSources
        }}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        labelAlign="left"
        style={{ width: '100%' }}
        className={styles.formContainer}
      >
        {/* 数据资产字段列表 */}
        <div className={styles.importFieldsButton}>
          <Button
            type="text"
            icon={<IconDownload />}
            onClick={handleImportFields}
          >
            导入字段
          </Button>
        </div>
        <FormItem
          label="数据资产字段列表："
          required
          // labelAlign="left"
          field="metadataFields"
          rules={[{ validator: validateMetadataFields }]}
        >
          <div className="w-full">
            <Table
              columns={columns}
              className="w-full"
              data={metadataFields}
              pagination={false}
              border={false}
            />

            {/* {metadataFields.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Button type="text" onClick={handleAddField}>
                  添加行
                </Button>
              </div>
            )} */}
          </div>
        </FormItem>

        {/* 数据来源 */}
        <FormItem
          label="数据来源："
          required
          // labelAlign="left"
          // labelCol={{ span: 24 }}
          field="dataSources"
          rules={[{ validator: validateDataSource }]}
          className="mb-4"
        >
          <Row gutter={24}>
            <Col span={8}>
              <Checkbox
                checked={dataSources.dataset}
                onChange={(checked) =>
                  handleDataSourceChange('dataset', checked)
                }
              >
                数据集
              </Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox
                checked={dataSources.volume}
                onChange={(checked) =>
                  handleDataSourceChange('volume', checked)
                }
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
        </FormItem>
      </Form>

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
