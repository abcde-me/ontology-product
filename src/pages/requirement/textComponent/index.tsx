import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Tooltip,
  ColorPicker
} from '@arco-design/web-react';
import {
  IconDelete,
  IconPlus,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import './index.scss';
// 实体/实体关系 - 组件
const btnList = [
  {
    key: 1,
    label: '实体标签'
  },
  {
    key: 2,
    label: '关系标签'
  }
];

// "entity_relations": [ //文本标签-实体关系
//     {
//         "order_num": 1,
//         "relation_name_cn": "实体关系显示名称",
//         "relation_name_en": "实体关系存储名称",
//         "start_entity_labels": ["red", "green"],//标签的醋存储名称
//         "target_entity_labels": ["blue", "black"],
//         "colour": "AAAAA"
//     },
//     {
//         "order_num": 1,
//         "relation_name_cn": "实体关系显示名称2",
//         "relation_name_en": "实体关系存储名称2",
//         "start_entity_labels": ["red", "green"],
//         "target_entity_labels": ["blue", "black"],
//         "colour": "BBBBB"
//     }
// ],

interface TextSubstanceComponentProps {
  type: 'add' | 'detail';
  // publishData: any,
  // setPublishData: (data: any) => void
}
const TextSubstanceComponent = (props: TextSubstanceComponentProps) => {
  const { type } = props;
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const [entityRelations, setEntityRelations] = useState([
    {
      order_num: 1,
      relation_name_cn: '实体关系显示名称',
      relation_name_en: '实体关系存储名称',
      start_entity_labels: ['red', 'green'], //标签的醋存储名称
      target_entity_labels: ['blue', 'black'],
      colour: '#000000'
    },
    {
      order_num: 1,
      relation_name_cn: '实体关系显示名称2',
      relation_name_en: '实体关系存储名称2',
      start_entity_labels: ['red', 'green'],
      target_entity_labels: ['blue', 'black'],
      colour: '#f00000'
    }
  ]);
  const [selectedSubstanceValue, setSelectedSubstanceValue] = useState(1);
  // 关系标签内容
  const [relationTags, setRelationTags] = useState([
    {
      order_num: 1,
      relation_name_cn: '关系标签显示名称',
      relation_name_en: '关系标签存储名称',
      start_entity_labels: ['red', 'green'],
      target_entity_labels: ['blue', 'black'],
      colour: '#000000'
    }
  ]);

  // 处理基本字段变更
  const handleFieldChange = (index, field, value) => {
    const newData = [...entityRelations];
    newData[index][field] = value;
    setEntityRelations(newData);
  };

  // 处理数组字段变更
  const handleArrayItemChange = (index, arrayField, itemIndex, value) => {
    const newData = [...entityRelations];
    newData[index][arrayField][itemIndex] = value;
    setEntityRelations(newData);
  };

  // 添加数组项
  const addArrayItem = (index, arrayField) => {
    const newData = [...entityRelations];
    newData[index][arrayField] = [...newData[index][arrayField], ''];
    setEntityRelations(newData);
  };

  // 删除数组项
  const removeArrayItem = (itemIndex) => {
    const newEntityRelations = entityRelations.filter(
      (_, index) => index !== itemIndex
    );
    setEntityRelations(newEntityRelations);
  };
  return (
    <div className="text-component-warp">
      <div className="type-header">
        {btnList.map((item) => {
          return (
            <div
              className={[
                'item-base-class',
                selectedSubstanceValue === item.key ? 'active' : ''
              ].join(' ')}
              onClick={() => {
                setSelectedSubstanceValue(item.key);
              }}
              key={item.key}
            >
              {item.label}
            </div>
          );
        })}
      </div>
      <Form
        form={form}
        // disabled={type === 'detail'}
        onValuesChange={(_, val) => {
          // setPublishData({ ...publishData, val })
        }}
        layout="inline"
        labelAlign="right"
        labelCol={{ flex: 'none' }}
        wrapperCol={{ flex: 1 }}
      >
        {selectedSubstanceValue === 1 &&
          entityRelations.map((item, index) => {
            return (
              <div className="entity-relation-item" key={item.order_num}>
                <FormItem
                  style={{ paddingLeft: 16 }}
                  label="标签名称"
                  rules={[{ required: true, message: '请输入标签名称' }]}
                >
                  <Input
                    placeholder="请输入标签名称"
                    style={{ width: 260 }}
                    value={item.relation_name_cn}
                    onChange={(value) => {
                      handleFieldChange(index, 'relation_name_cn', value);
                    }}
                  />
                </FormItem>
                <FormItem
                  label={
                    <div>
                      展示名称
                      <Tooltip content="展示在标注页面的名称">
                        <IconQuestionCircle />
                      </Tooltip>
                    </div>
                  }
                  style={{ padding: 0 }}
                >
                  <Input
                    placeholder="请输入展示名称"
                    style={{ width: 250 }}
                    value={item.relation_name_en}
                    onChange={(value) => {
                      // 保存当前项的order_num用于精准匹配
                      const currentOrderNum = item.order_num;
                      handleFieldChange(index, 'relation_name_en', value);
                    }}
                  />
                </FormItem>
                <FormItem label={null}>
                  <ColorPicker defaultValue={'#165DFF'} showPreset />
                </FormItem>
                <FormItem label={null}>
                  {entityRelations?.length > 1 && (
                    <IconDelete
                      fontSize={18}
                      onClick={() => removeArrayItem(index)}
                    />
                  )}
                </FormItem>
              </div>
            );
          })}
      </Form>
      {selectedSubstanceValue === 1 && (
        <div className="add-btn">
          <Button
            onClick={() => {
              setEntityRelations([
                ...entityRelations,
                {
                  order_num: entityRelations.length + 1,
                  relation_name_cn: '',
                  relation_name_en: '',
                  start_entity_labels: [],
                  target_entity_labels: [],
                  colour: ''
                }
              ]);
            }}
          >
            <IconPlus />
            添加标签
          </Button>
        </div>
      )}
      {/* 关系标签内容 */}
      {selectedSubstanceValue === 2 && (
        <div className="relation-content">
          <div className="relation-content-body">
            <Form
              form={form}
              // disabled={type === 'detail'}
              onValuesChange={(_, val) => {
                // setPublishData({ ...publishData, val })
              }}
              layout="inline"
              labelAlign="right"
              labelCol={{ flex: 'none' }}
              wrapperCol={{ flex: 1 }}
            >
              {relationTags.map((item, index) => {
                return (
                  <div className="entity-relation-item" key={item.order_num}>
                    <FormItem
                      style={{ paddingLeft: 16 }}
                      label="关系名称"
                      rules={[{ required: true, message: '请输入标签名称' }]}
                    >
                      <Input
                        placeholder="用于储存标注结果"
                        style={{ width: 260 }}
                        value={item.relation_name_cn}
                        onChange={(value) => {
                          handleFieldChange(index, 'relation_name_cn', value);
                        }}
                      />
                    </FormItem>
                    <FormItem
                      label={
                        <div>
                          展示名称
                          <Tooltip content="展示在标注页面的名称">
                            <IconQuestionCircle />
                          </Tooltip>
                        </div>
                      }
                      style={{ padding: 0 }}
                    >
                      <Input
                        placeholder="展示在标注页面的名称"
                        style={{ width: 250 }}
                        value={item.relation_name_en}
                        onChange={(value) => {
                          // 保存当前项的order_num用于精准匹配
                          const currentOrderNum = item.order_num;
                          handleFieldChange(index, 'relation_name_en', value);
                        }}
                      />
                    </FormItem>
                    <FormItem label={null}>
                      {entityRelations?.length > 1 && (
                        <IconDelete onClick={() => removeArrayItem(index)} />
                      )}
                    </FormItem>
                  </div>
                );
              })}
            </Form>
          </div>
          <div>
            <Button>
              {' '}
              <IconPlus
                onClick={() => {
                  setRelationTags([
                    ...relationTags,
                    {
                      order_num: relationTags.length + 1,
                      relation_name_cn: '',
                      relation_name_en: '',
                      start_entity_labels: [],
                      target_entity_labels: [],
                      colour: ''
                    }
                  ]);
                }}
              />
              添加关系
            </Button>
            {relationTags.length > 0 && (
              <Button>
                {' '}
                <IconPlus
                  onClick={() => {
                    setRelationTags([
                      ...relationTags,
                      {
                        order_num: relationTags.length + 1,
                        relation_name_cn: '',
                        relation_name_en: '',
                        start_entity_labels: [],
                        target_entity_labels: [],
                        colour: ''
                      }
                    ]);
                  }}
                />
                添加标签对
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default TextSubstanceComponent;
