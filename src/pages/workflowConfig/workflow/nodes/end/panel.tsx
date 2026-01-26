import type { FC } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useConfig from './use-config';
import type { EndNodeType } from './types';
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import {
  Checkbox,
  Form,
  Input,
  Select,
  Tag,
  Tooltip
} from '@arco-design/web-react';
import { getWorkflowTargetPath, knowledgeBaseNameCheck } from '@/api/workflow';
import { useUserInfo } from '@/store/userInfoStore';
import {
  getTagList,
  getDatasetSceneList,
  validateDatasetForSave,
  DatasetSource,
  ValidateDatasetStatus
} from '@/api/datasetManagement';
import './end.scss';
import { validateName } from '@/utils/valiate';

const Panel: FC<NodePanelProps<EndNodeType>> = ({ id, data }) => {
  const userInfo = useUserInfo();
  const { readOnly, inputs, onValuesChange } = useConfig(id, data);
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const Option = Select.Option;
  const searchParams = new URLSearchParams(location.search);
  const workflow_uuid = searchParams.get('workflow_uuid');

  const [dataSource, setDataSource]: Array<any> = useState([]);
  const [knowledgeBaseNameValid, setKnowledgeBaseNameValid] = useState(true);
  const [knowledgeBaseName, setKnowledgeBaseName] = useState(
    inputs?.knowledge_base_name || ''
  );
  const hasValidatedRef = useRef(false);
  // 数据集标签
  const [knowledgeBaseNameOptions, setKnowledgeBaseNameOptions] = useState<
    Record<string, any>[]
  >([]);
  // 场景分类
  const [sceneCategoryOptions, setSceneCategoryOptions] = useState<
    Record<string, any>[]
  >([]);
  useEffect(() => {
    getTagList().then((res) => {
      setKnowledgeBaseNameOptions(res.data || []);
    });
    getDatasetSceneList()?.then((res) => {
      setSceneCategoryOptions(res.data || []);
    });
  }, []);

  useEffect(() => {
    // 当sceneCategoryOptions有数据且Form已初始化，并且inputs.scene_id为空时设置默认值
    if (sceneCategoryOptions.length > 0 && form) {
      const currentSceneId = form.getFieldValue('scene_id');
      // 只有在当前没有值的情况下才设置默认值
      if (!currentSceneId && !inputs?.scene_id) {
        form.setFieldsValue({ scene_id: sceneCategoryOptions[0]?.id });
      }
    }
  }, [sceneCategoryOptions, form, inputs?.scene_id]);

  useEffect(() => {
    // 当名称校验状态变化时，更新 payload
    onValuesChange(
      { ...inputs, isKnowledgeBaseNameValid: knowledgeBaseNameValid },
      dataSource
    );
  }, [knowledgeBaseNameValid]);

  // 进入页面时自动校验一次数据集名称
  useEffect(() => {
    if (!hasValidatedRef.current && form && inputs?.name) {
      // 延迟执行，确保表单已完全初始化
      const timer = setTimeout(() => {
        form.validate(['name']).catch(() => {
          // 校验失败时静默处理，错误信息会显示在表单上
        });
        hasValidatedRef.current = true;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="wk-node-panel-content end-panel-content mt-[16px]">
      <Form
        layout="vertical"
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        disabled={readOnly}
        wrapperCol={{ span: 24 }}
        onValuesChange={(_, v: any) => {
          onValuesChange(
            {
              ...v,
              knowledge_base_name: knowledgeBaseName || '',
              isKnowledgeBaseNameValid: knowledgeBaseNameValid
            },
            dataSource
          );
        }}
        initialValues={{
          target_path_id: inputs?.target_path_id,
          is_embedding: inputs?.is_embedding,
          knowledge_base_name: inputs?.knowledge_base_name,
          scene_id: inputs?.scene_id,
          name: inputs?.name,
          description: inputs?.description,
          tag_names: inputs?.tag_names
        }}
      >
        <FormItem
          label="数据集名称："
          field="name"
          rules={[
            {
              required: true,
              validateTrigger: ['onBlur'],
              validator: async (value, callback) => {
                // 基本校验
                if (value === '' || value === undefined) {
                  setKnowledgeBaseNameValid(false);
                  return callback('请输入数据集名称');
                }

                if (!validateName(value).isValid) {
                  setKnowledgeBaseNameValid(false);
                  return callback(
                    validateName(value).errorMessage ?? '数据集名称格式不正确'
                  );
                }

                if (!workflow_uuid) {
                  setKnowledgeBaseNameValid(true);
                  return callback();
                }

                try {
                  const res = await validateDatasetForSave({
                    name: value.trim(),
                    src: DatasetSource.Workflow,
                    src_key: workflow_uuid
                  });

                  // 接口失败，跳过数据集名称重名校验
                  if (res.status !== 200) {
                    setKnowledgeBaseNameValid(true);
                    return callback();
                  }

                  if (res.data.status === ValidateDatasetStatus.Failed) {
                    setKnowledgeBaseNameValid(false);
                    return callback(res.data.reason);
                  } else {
                    setKnowledgeBaseNameValid(true);
                    return callback();
                  }
                } catch (error) {
                  console.log('数据集名称重名校验失败-----', error);
                  setKnowledgeBaseNameValid(true);
                  // 接口校验失败，跳过数据集名称重名校验
                  return callback();
                }
              }
            }
          ]}
          style={{ margin: 0, paddingBottom: 24 }}
        >
          <Input
            maxLength={50}
            value={knowledgeBaseName}
            placeholder="请输入数据集名称"
            style={{ width: '100%' }}
            allowClear
          />
        </FormItem>
        <FormItem
          label="数据集标签："
          field="tag_names"
          style={{ margin: 0, paddingBottom: 24 }}
        >
          <Select
            placeholder="请输入或选择标签"
            mode="multiple"
            options={knowledgeBaseNameOptions.map((item) => ({
              label: item?.name,
              value: item?.name
            }))}
            allowCreate
            style={{ width: '100%' }}
            maxTagCount={{
              count: 10,
              render: (invisibleTagCount) => {
                // 从当前表单值获取完整的标签列表
                const allTags = form.getFieldValue('tags') || [];
                const remainingTags = allTags.slice(10);
                // const remainingLabels = remainingTags.join(', ');
                return (
                  <Tooltip
                    content={remainingTags.map((item, i) => {
                      return (
                        <Tag
                          key={i}
                          style={{
                            height: '24px',
                            background: '#E7ECF0',
                            color: '#0F172A',
                            borderRadius: '2px',
                            fontSize: '12px',
                            // height: '18px',
                            alignItems: 'center',
                            margin: '0 2px'
                          }}
                        >
                          {item}
                        </Tag>
                      );
                    })}
                  >
                    <span>+{invisibleTagCount}</span>
                  </Tooltip>
                );
              }
            }}
          />
        </FormItem>
        <FormItem
          label="描述说明"
          field="description"
          style={{ margin: 0, paddingBottom: 24 }}
        >
          <Input.TextArea
            placeholder="可以描述数据集的用途、特点或其他相关信息"
            style={{ width: '100%', height: 62 }}
            allowClear
            maxLength={500}
            showWordLimit
          />
        </FormItem>
        <FormItem label="场景分类：" field="scene_id" style={{ margin: 0 }}>
          <Select placeholder="请选择场景分类" style={{ width: '100%' }}>
            {sceneCategoryOptions.map((option) => (
              <Option key={option.id} value={option.id}>
                <div className="scene-category-item">
                  <span className="item-text text-[14px]">{option.name}</span>
                  <span className="item-text text-[14px] text-[#6E7B8D]">
                    {option.description}
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);
