import type { FC } from 'react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useConfig from './use-config';
import type { EndNodeType } from './types';
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import { Checkbox, Form, Input, Select } from '@arco-design/web-react';
import { getWorkflowTargetPath, knowledgeBaseNameCheck } from '@/api/workflow';
import { useUserInfo } from '@/store/userInfoStore';
import './end.scss';
import { getWorkflowList } from '@/api/workflowList';
const Panel: FC<NodePanelProps<EndNodeType>> = ({ id, data }) => {
  const userInfo = useUserInfo();
  const { readOnly, inputs, onValuesChange } = useConfig(id, data);
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const Option = Select.Option;
  const searchParams = new URLSearchParams(location.search);
  const workflow_uuid = searchParams.get('workflow_uuid');

  const [dataSource, setDataSource]: Array<any> = useState([]);
  const [isEmbedding, setIsEmbedding] = useState(inputs?.is_embedding || false);
  const [knowledgeBaseNameValid, setKnowledgeBaseNameValid] = useState(true);
  const [knowledgeBaseName, setKnowledgeBaseName] = useState(
    inputs?.knowledge_base_name || ''
  );

  useEffect(() => {
    getWorkflowTargetPath(2, '').then((res) => {
      const dirsArr: Record<string, any>[] = [];
      res.data.dst.forEach((catalog) => {
        // 重置name结构
        const restData = catalog.children?.volume?.map((item) => {
          return {
            ...item,
            parent_name: catalog.name
          };
        });
        dirsArr.push(...(restData || []));
      });
      setDataSource(dirsArr);
    });
  }, []);
  // 查询已被占用的目标目录id
  const usedCatalogIds = useCallback(async () => {
    if (!userInfo) return [];
    const params = {
      uid: userInfo?.id || '',
      search_content: '',
      page: 1,
      page_size: 1000,
      run_cycle: '',
      sort: ''
    };
    const res = await getWorkflowList(params);
    if (res.status === 200 && res.data) {
      return (res.data?.list || []).map((i) => i.target_path_id);
    }
    return [];
  }, [userInfo]);
  // 过滤掉已被占用的目标目录
  const [filteredDataSource, setFilteredDataSource] = useState<any[]>([]);

  useEffect(() => {
    const filterData = async () => {
      const usedIds = await usedCatalogIds();
      setFilteredDataSource(dataSource.filter((i) => !usedIds.includes(i.id)));
    };
    if (dataSource.length > 0) {
      filterData();
    }
  }, [dataSource, userInfo]);
  // 初始化时名称已回退为上一次输入合法名称，将名称校验设为true
  useEffect(() => {
    onValuesChange({ ...inputs, isKnowledgeBaseNameValid: true }, dataSource);
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
          knowledge_base_name: inputs?.knowledge_base_name
        }}
      >
        <FormItem
          label="目标数据目录"
          field="target_path_id"
          rules={[{ required: true, message: '目标数据目录不可为空' }]}
          style={{ margin: 0 }}
          extra="选择工作流处理后数据的目标数据"
        >
          <Select
            placeholder="请输入或选择目标数据目录"
            style={{ width: '100%' }}
            allowClear
            showSearch
            filterOption={(inputValue, option) => {
              return option?.props?.children?.includes(inputValue);
            }}
          >
            {filteredDataSource.map((option) => (
              <Option key={option.id} value={option.id}>
                {`${option.parent_name}/${option.name}`}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          extra="开启后会对输出数据执行向量化（Embedding）流程。"
          field="is_embedding"
        >
          <Checkbox
            className="mt-[8px] text-[14px]"
            checked={isEmbedding}
            value={isEmbedding}
            onChange={(value) => {
              setIsEmbedding(value);
            }}
          >
            是否进行Embedding
          </Checkbox>
        </FormItem>
        {isEmbedding && (
          <FormItem
            label="知识库名称"
            extra="为构建的知识库指定一个名称，用于后续的检索和管理"
            field="knowledge_base_name"
            rules={[
              {
                required: true,
                validateTrigger: 'onBlur',
                validator: async (value, callback) => {
                  const formData = form.getFieldsValue() as EndNodeType;
                  return knowledgeBaseNameCheck({
                    knowledgeName: value,
                    userId: userInfo?.id || '',
                    dsWorkflowUuid: workflow_uuid || ''
                  }).then((res) => {
                    if (
                      res.data &&
                      (res.msg === 'success' || res.msg === '成功')
                    ) {
                      setKnowledgeBaseName(value);
                      setKnowledgeBaseNameValid(true);
                      // 校验通过保存名称
                      onValuesChange(
                        { ...formData, isKnowledgeBaseNameValid: true },
                        dataSource
                      );
                    } else {
                      // 校验未通过名称重置为之前名称
                      setKnowledgeBaseNameValid(false);
                      onValuesChange(
                        {
                          ...formData,
                          isKnowledgeBaseNameValid: false,
                          knowledge_base_name: knowledgeBaseName,
                          knowledge_base_name_msg: res.msg
                        },
                        dataSource
                      );
                      callback(res.msg);
                    }
                  });
                }
              }
            ]}
          >
            <Input
              placeholder="请输入知识库名称（50字以内）"
              maxLength={50}
              value={knowledgeBaseName}
            />
          </FormItem>
        )}
      </Form>
    </div>
  );
};

export default React.memo(Panel);
