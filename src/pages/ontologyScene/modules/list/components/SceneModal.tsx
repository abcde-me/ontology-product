import React, { useEffect, useMemo, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Radio,
  Upload,
  Message
} from '@arco-design/web-react';
import { IconUpload } from '@arco-design/web-react/icon';
import { OntoModal } from '@/components/OSModal';
import { ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import IconSelector from '@/pages/ontologyScene/components/IconSelector';
import type { OntologySceneExportPackage } from '@/types/ontologySceneMigration';
import { parseOntologySceneExportFile } from '@/pages/ontologyScene/services/importOntologyScene';

const { TextArea } = Input;

export type SceneCreateMode = 'blank' | 'import';

export interface SceneFormData {
  name: string;
  description: string;
  icon?: string;
  createMode?: SceneCreateMode;
  importPackage?: OntologySceneExportPackage;
}

interface SceneModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<SceneFormData>;
  onSubmit: (data: SceneFormData) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
  existingSceneIcons?: string[];
}

const getRandomIcon = (excludeIcons: string[] = []): string => {
  const availableIcons = ICON_OPTIONS.filter(
    (opt) => !excludeIcons.includes(opt.value)
  );
  if (availableIcons.length === 0) {
    return ICON_OPTIONS[0].value;
  }
  const randomIndex = Math.floor(Math.random() * availableIcons.length);
  return availableIcons[randomIndex].value;
};

const SceneModal: React.FC<SceneModalProps> = ({
  visible,
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  existingSceneIcons = []
}) => {
  const [form] = Form.useForm();
  const [selectedIcon, setSelectedIcon] = useState<string>(
    ICON_OPTIONS[0].value
  );
  const [createMode, setCreateMode] = useState<SceneCreateMode>('blank');
  const [importPackage, setImportPackage] =
    useState<OntologySceneExportPackage>();
  const [importFileName, setImportFileName] = useState('');

  const importSummary = useMemo(() => {
    if (!importPackage) {
      return null;
    }

    return {
      objectTypes: importPackage.objectTypes.length,
      linkTypes: importPackage.linkTypes.length,
      actions: importPackage.actions.length,
      functions: importPackage.functions.length
    };
  }, [importPackage]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (mode === 'create') {
      const randomIcon = getRandomIcon(existingSceneIcons);
      setSelectedIcon(randomIcon);
      setCreateMode('blank');
      setImportPackage(undefined);
      setImportFileName('');
      form.setFieldsValue({
        name: '',
        description: ''
      });
    } else if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        name: initialValues.name || '',
        description: initialValues.description || ''
      });
      setSelectedIcon(initialValues.icon || ICON_OPTIONS[0].value);
      setCreateMode('blank');
      setImportPackage(undefined);
      setImportFileName('');
    }
  }, [visible, mode, initialValues, existingSceneIcons, form]);

  const applyImportPackage = (
    pkg: OntologySceneExportPackage,
    fileName: string
  ) => {
    setImportPackage(pkg);
    setImportFileName(fileName);

    const currentName = String(form.getFieldValue('name') || '').trim();
    const currentDescription = String(
      form.getFieldValue('description') || ''
    ).trim();

    form.setFieldsValue({
      name: currentName || pkg.scene.name || '',
      description: currentDescription || pkg.scene.description || ''
    });

    if (pkg.scene.icon) {
      setSelectedIcon(pkg.scene.icon);
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const pkg = await parseOntologySceneExportFile(file);
      applyImportPackage(pkg, file.name);
      Message.success('导入文件解析成功');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '导入文件解析失败';
      Message.error(message);
    }
    return false;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      const sceneName = String(values.name || '').trim();
      const sceneDescription = String(values.description || '').trim();

      if (mode === 'create' && createMode === 'import' && !importPackage) {
        Message.warning('请先上传本体场景导出文件');
        return;
      }

      const resolvedImportPackage =
        mode === 'create' && createMode === 'import' && importPackage
          ? {
              ...importPackage,
              scene: {
                ...importPackage.scene,
                name: sceneName,
                description: sceneDescription,
                icon: selectedIcon
              }
            }
          : undefined;

      await onSubmit({
        name: sceneName,
        description: sceneDescription,
        icon: selectedIcon,
        createMode: mode === 'create' ? createMode : undefined,
        importPackage: resolvedImportPackage
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedIcon(ICON_OPTIONS[0].value);
    setCreateMode('blank');
    setImportPackage(undefined);
    setImportFileName('');
    onCancel();
  };

  if (!visible) {
    return null;
  }

  return (
    <OntoModal
      title={mode === 'create' ? '创建本体场景' : '编辑本体场景'}
      visible={visible}
      unmountOnExit
      onCancel={handleCancel}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            确定
          </Button>
        </div>
      }
      getPopupContainer={() => document.getElementById('root') || document.body}
      style={{ width: 600 }}
      closable
    >
      <Form form={form} autoComplete="off" labelAlign="left">
        {mode === 'create' && (
          <Form.Item label="创建方式：">
            <Radio.Group
              value={createMode}
              onChange={(value) => {
                setCreateMode(value);
                if (value === 'blank') {
                  setImportPackage(undefined);
                  setImportFileName('');
                }
              }}
            >
              <Radio value="blank">空白创建</Radio>
              <Radio value="import">外部导入</Radio>
            </Radio.Group>
          </Form.Item>
        )}

        {mode === 'create' && createMode === 'import' && (
          <Form.Item label="导入文件：">
            <div className="flex flex-col gap-[8px]">
              <Upload
                accept=".json,application/json"
                showUploadList={false}
                beforeUpload={handleImportFile}
              >
                <Button icon={<IconUpload />} type="outline">
                  选择导出文件
                </Button>
              </Upload>
              {importFileName ? (
                <div className="text-[13px] leading-[20px] text-[var(--color-text-3)]">
                  已选择：{importFileName}
                </div>
              ) : (
                <div className="text-[13px] leading-[20px] text-[var(--color-text-3)]">
                  请上传从其他环境导出的 JSON 文件
                </div>
              )}
              {importSummary && (
                <div className="rounded-[4px] bg-[#F7F8FA] px-[12px] py-[8px] text-[13px] leading-[20px] text-[var(--color-text-2)]">
                  将导入 {importSummary.objectTypes} 个对象、
                  {importSummary.linkTypes} 个链接、
                  {importSummary.actions} 个行为、
                  {importSummary.functions} 个函数
                </div>
              )}
            </div>
          </Form.Item>
        )}

        <Form.Item
          label="本体场景名称："
          field="name"
          rules={[
            { required: true, message: '请输入本体场景名称' },
            { maxLength: 50, message: '名称最多50个字符' }
          ]}
        >
          <Input
            placeholder="请输入本体场景名称"
            maxLength={50}
            showWordLimit
          />
        </Form.Item>

        <Form.Item label="描述说明：" field="description">
          <TextArea
            placeholder="请输入描述说明"
            autoSize={{ minRows: 3 }}
            maxLength={500}
            showWordLimit
          />
        </Form.Item>

        <Form.Item label="图标：" field="icon">
          <IconSelector
            initialValue={selectedIcon}
            onChange={setSelectedIcon}
            options={ICON_OPTIONS}
          />
        </Form.Item>
      </Form>
    </OntoModal>
  );
};

export default SceneModal;
