import React, { useEffect, useState } from 'react';

import {
  Form,
  Input,
  Message,
  Modal,
  Radio,
  Checkbox
} from '@arco-design/web-react';

import { useAutoOntologyObjectTypeCodeFromName } from '@/pages/ontologyScene/hooks/useAutoOntologyObjectTypeCodeFromName';

import {
  createObjectTypeOnGraph,
  createObjectTypesOnGraphFromTables,
  fetchSceneObjectTypeCodes,
  fetchSceneObjectTypes
} from '../services/graphCreateServices';

import { isOntologyApiSuccess } from '@/utils/apiResponse';
import {
  OBJECT_TYPE_CODE_EXTRA,
  validateObjectTypeCode
} from '@/utils/generateOntologyObjectTypeCodeName';

import DataResourceTableSelector from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormSteps/common/DataResourceTableSelector';

import { collectUsedDataResourceTableIds } from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';

import type { DataResourceTable } from '@/pages/dataResource/types';

const CREATE_MODE_MANUAL = 'manual';

const CREATE_MODE_DATA_RESOURCE = 'data_resource';

interface CreateObjectTypeOnGraphModalProps {
  visible: boolean;

  sceneId: number;

  onClose: () => void;

  onSuccess?: () => void;
}

function buildBatchCreateMessage(
  result: Awaited<ReturnType<typeof createObjectTypesOnGraphFromTables>>
) {
  const { created, skipped, failed } = result;

  if (
    created.length &&
    !skipped.length &&
    !failed.length &&
    !result.linksCreated &&
    !result.linksFailed
  ) {
    return `成功创建 ${created.length} 个对象类型`;
  }

  const parts: string[] = [];

  if (created.length) {
    parts.push(`成功创建 ${created.length} 个对象类型`);
  }

  if (skipped.length) {
    parts.push(
      `跳过 ${skipped.length} 个已在画布中的表（${skipped

        .map((item) => item.tableName)

        .join('、')}）`
    );
  }

  if (failed.length) {
    parts.push(
      `${failed.length} 个创建失败（${failed

        .map((item) => item.tableName)

        .join('、')}）`
    );
  }

  if (result.linksCreated) {
    parts.push(`智能创建 ${result.linksCreated} 个链接`);
  }

  if (result.linksFailed) {
    parts.push(`${result.linksFailed} 个链接创建失败`);
  }

  return parts.join('；');
}

export default function CreateObjectTypeOnGraphModal({
  visible,

  sceneId,

  onClose,

  onSuccess
}: CreateObjectTypeOnGraphModalProps) {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const [existingCodes, setExistingCodes] = useState<string[]>([]);

  const [existingTableIds, setExistingTableIds] = useState<string[]>([]);

  const [createMode, setCreateMode] = useState(CREATE_MODE_MANUAL);

  const [selectedTables, setSelectedTables] = useState<DataResourceTable[]>([]);

  useAutoOntologyObjectTypeCodeFromName({
    form,
    ontologyModelID: visible ? sceneId : undefined,
    nameField: 'name',
    codeField: 'code',
    enabled: visible && createMode === CREATE_MODE_MANUAL
  });

  useEffect(() => {
    if (!visible || !sceneId) {
      return;
    }

    form.resetFields();

    setCreateMode(CREATE_MODE_MANUAL);

    setSelectedTables([]);

    Promise.all([
      fetchSceneObjectTypeCodes(sceneId),

      fetchSceneObjectTypes(sceneId)
    ])

      .then(([codes, objectTypes]) => {
        setExistingCodes(codes);

        setExistingTableIds(
          Array.from(collectUsedDataResourceTableIds(objectTypes))
        );
      })

      .catch(() => {
        setExistingCodes([]);

        setExistingTableIds([]);
      });
  }, [visible, sceneId, form]);

  const handleCreateModeChange = (mode: string) => {
    setCreateMode(mode);

    setSelectedTables([]);

    form.setFieldValue('dataResourceTableId', undefined);

    if (mode === CREATE_MODE_MANUAL) {
      form.setFieldsValue({
        name: undefined,

        description: undefined
      });
    }
  };

  const handleDataResourceTablesChange = (tables: DataResourceTable[]) => {
    setSelectedTables(tables);

    form.setFieldValue(
      'dataResourceTableId',

      tables.length ? tables.map((table) => table.id) : undefined
    );
  };

  const handleOk = async () => {
    try {
      if (createMode === CREATE_MODE_DATA_RESOURCE) {
        if (!selectedTables.length) {
          form.setFields({
            dataResourceTableId: {
              error: { message: '请选择数据资源表' }
            }
          });

          return;
        }

        await form.validate(['dataResourceTableId', 'description']);

        setLoading(true);

        const result = await createObjectTypesOnGraphFromTables({
          ontologyModelID: sceneId,

          tables: selectedTables,

          description: form.getFieldValue('description'),

          smartCreateLinks: form.getFieldValue('smartCreateLinks')
        });

        if (result.created.length) {
          Message.success(buildBatchCreateMessage(result));

          onSuccess?.();

          onClose();

          return;
        }

        if (result.skipped.length && !result.failed.length) {
          Message.warning(buildBatchCreateMessage(result));

          return;
        }

        Message.error(
          result.failed[0]?.message ||
            buildBatchCreateMessage(result) ||
            '创建失败'
        );

        return;
      }

      const values = await form.validate();

      if (
        existingCodes
          .map((code) => code.toLowerCase())
          .includes(
            String(values.code || '')
              .trim()
              .toLowerCase()
          )
      ) {
        Message.warning('对象类型 id 已存在于当前画布，请修改后重试');

        return;
      }

      setLoading(true);

      const { response } = await createObjectTypeOnGraph({
        name: values.name,

        code: values.code,

        ontologyModelID: sceneId,

        description: values.description
      });

      if (isOntologyApiSuccess(response)) {
        Message.success('对象类型创建成功');

        onSuccess?.();

        onClose();

        return;
      }

      Message.error(response.message || '创建失败');
    } catch (error) {
      if (error) {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="新建对象类型"
      visible={visible}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={onClose}
      unmountOnExit
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="创建方式"
          field="createMode"
          initialValue={CREATE_MODE_MANUAL}
        >
          <Radio.Group value={createMode} onChange={handleCreateModeChange}>
            <Radio value={CREATE_MODE_MANUAL}>手动填写</Radio>

            <Radio value={CREATE_MODE_DATA_RESOURCE}>从数据资源选择</Radio>
          </Radio.Group>
        </Form.Item>

        {createMode === CREATE_MODE_DATA_RESOURCE && (
          <>
            <Form.Item
              label="数据资源表"
              field="dataResourceTableId"
              extra="每张表将创建一个对象类型；已在画布中的表不可重复选择"
              rules={[
                {
                  required: true,

                  validator: (value, callback) => {
                    const ids = Array.isArray(value)
                      ? value
                      : value
                        ? [value]
                        : [];

                    if (!ids.length) {
                      callback('请选择数据资源表');
                    } else {
                      callback();
                    }
                  }
                }
              ]}
            >
              <DataResourceTableSelector
                variant="list"
                filterByTableCommentOnly
                showSelectAll
                disabledTableIds={existingTableIds}
                value={selectedTables.map((table) => table.id)}
                onChange={handleDataResourceTablesChange}
              />
            </Form.Item>

            <Form.Item
              field="smartCreateLinks"
              triggerPropName="checked"
              initialValue={true}
            >
              <Checkbox>智能创建链接</Checkbox>
            </Form.Item>
          </>
        )}

        {createMode === CREATE_MODE_MANUAL ? (
          <>
            <Form.Item
              label="对象类型名称"
              field="name"
              rules={[
                { required: true, message: '请输入名称' },

                { maxLength: 50, message: '名称不能超过50个字符' }
              ]}
            >
              <Input placeholder="如：作战单元" maxLength={50} showWordLimit />
            </Form.Item>

            <Form.Item
              label="对象类型 id"
              field="code"
              extra={OBJECT_TYPE_CODE_EXTRA}
              rules={[
                { required: true, message: '请输入 id' },

                {
                  validator: (value, callback) => {
                    validateObjectTypeCode(value, (message) => {
                      if (message) {
                        callback(message);

                        return;
                      }

                      if (
                        existingCodes.includes(
                          String(value || '')
                            .trim()
                            .toLowerCase()
                        )
                      ) {
                        callback('该 id 已在当前场景中存在');

                        return;
                      }

                      callback();
                    });
                  }
                }
              ]}
            >
              <Input placeholder="自动生成" maxLength={50} />
            </Form.Item>
          </>
        ) : null}

        <Form.Item label="描述" field="description">
          <Input.TextArea
            placeholder="可选，辅助智能创建链接信息"
            maxLength={200}
            showWordLimit
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
