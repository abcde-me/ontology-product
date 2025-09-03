import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Tooltip,
  ColorPicker,
  Select
} from '@arco-design/web-react';
import {
  IconDelete,
  IconPlus,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import './TextEntity.scss';
import { uuid } from '@/models/utils';
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

// "labels": [//配置标签
//   {
//     "order_num": 1// 排序
//             "label_name_cn": "",//展示名称
//     "label_name_en": "",//存储名称
//     "label_shape": 1//标注形状，点1，线2，正方形3，多边形4
//             "label_colour": ""//标签颜色（如#FFFFFF）
//             "label_info_attribute_groups": [
//       {
//         "order_num": 1// 排序
//                     "attribute_group_name": "",//属性组名称
//         "attribute_group_class": 1,//1单选/2多选/3输入框
//         "attribute_group_type": 1,//1必选/2非必选
//         "label_info_attribute": [
//           {
//             "order_num": 1,//排序
//             "attribute_name_cn": ""//属性中文名称(展示名称)
//                         "attribute_name_en": ""//属性英文名称(存储名称)
//                         "input_type": 1//输入类型：1选项，2输入框
//           }
//         ]

//       }
//     ]
//   }
// ],
interface TextSubstanceComponentProps {
  type: 'add' | 'detail';
  // publishData: any,
  // setPublishData: (data: any) => void
}
const TextSubstanceComponent = (props: TextSubstanceComponentProps) => {
  const { type } = props;
  const [form] = Form.useForm();
  const Option = Select.Option;
  const FormItem = Form.Item;
  // 实体标签内容
  const [entityRelations, setEntityRelations] = useState([
    {
      id: uuid(),
      order_num: 1, // 排序
      label_name_cn: '', //展示名称
      label_name_en: '', //存储名称
      label_colour: '' //标签颜色（如#FFFFFF）
    }
  ]);
  // 关系标签内容
  const [relationRelations, setRelationRelations] = useState([
    {
      id: uuid(),
      order_num: 1,
      relation_name_cn: '实体关系显示名称',
      relation_name_en: '实体关系存储名称',
      start_entity_labels: ['red', 'green'], //标签的醋存储名称
      target_entity_labels: ['blue', 'black'],
      colour: '#000000'
    }
  ]);
  // 选中的标签类型
  const [selectedSubstanceValue, setSelectedSubstanceValue] = useState(2);
  // 处理基本字段变更
  const handleFieldChange = (index, field, value) => {
    const newData = [...entityRelations];
    newData[index][field] = value;
    setEntityRelations(newData);
  };

  // 处理关系标签字段变更
  const handleRelationFieldChange = (index, field, value) => {
    const newData = [...relationRelations];
    newData[index][field] = value;
    setRelationRelations(newData);
  };

  const removeRelationArrayItem = (itemIndex) => {
    const newRelationRelations = relationRelations.filter(
      (_, index) => index !== itemIndex
    );
    setRelationRelations(newRelationRelations);
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
                    value={item.label_name_cn}
                    onChange={(value) => {
                      handleFieldChange(index, 'label_name_cn', value);
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
                    value={item.label_name_en}
                    onChange={(value) => {
                      // 保存当前项的order_num用于精准匹配
                      const currentOrderNum = item.order_num;
                      handleFieldChange(index, 'label_name_en', value);
                    }}
                  />
                </FormItem>
                <FormItem label={null}>
                  <ColorPicker
                    defaultValue={item.label_colour}
                    showPreset
                    onChange={(value) => {
                      handleFieldChange(index, 'label_colour', value);
                    }}
                  />
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
                  id: uuid(),
                  order_num: 1, // 排序
                  label_name_cn: '', //展示名称
                  label_name_en: '', //存储名称
                  label_colour: '' //标签颜色（如#FFFFFF）
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
              onValuesChange={(_, val) => {}}
              layout="inline"
              labelAlign="right"
              labelCol={{ flex: 'none' }}
              wrapperCol={{ flex: 1 }}
            >
              {relationRelations.map((item, index) => {
                return (
                  <div className="entity-relation-item" key={item.id}>
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
                          handleRelationFieldChange(
                            index,
                            'relation_name_cn',
                            value
                          );
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
                          handleRelationFieldChange(
                            index,
                            'relation_name_en',
                            value
                          );
                        }}
                      />
                    </FormItem>
                    <FormItem label={null}>
                      {relationRelations?.length > 1 && (
                        <IconDelete
                          onClick={() => removeRelationArrayItem(index)}
                        />
                      )}
                    </FormItem>
                    <div className="relation-tag">
                      <div className="tag-title">标签对</div>
                      <div className="tag-content">
                        <FormItem
                          style={{ paddingLeft: 16 }}
                          label="起始标签:"
                          rules={[
                            { required: true, message: '请输入标签名称' }
                          ]}
                        >
                          <Select
                            mode="multiple"
                            allowClear
                            placeholder="请选择起始标签"
                            style={{ width: 154 }}
                            onChange={(value) => {
                              handleRelationFieldChange(
                                index,
                                'start_entity_labels',
                                value
                              );
                            }}
                          >
                            {entityRelations.map((option, index) => (
                              <Option
                                key={option.label_name_cn}
                                disabled={index === 4}
                                value={option.label_name_cn}
                              >
                                {option.label_name_cn}
                              </Option>
                            ))}
                          </Select>
                        </FormItem>
                        <FormItem label="目标标签:" style={{ padding: 0 }}>
                          <Select
                            mode="multiple"
                            allowClear
                            placeholder="请选择起始标签"
                            style={{ width: 154 }}
                            onChange={(value) => {
                              handleRelationFieldChange(
                                index,
                                'target_entity_labels',
                                value
                              );
                            }}
                          >
                            {entityRelations.map((option, index) => (
                              <Option
                                key={option.label_name_cn}
                                disabled={index === 4}
                                value={option.label_name_cn}
                              >
                                {option.label_name_cn}
                              </Option>
                            ))}
                          </Select>
                        </FormItem>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Form>
          </div>
          <div className="add-btn">
            <Button
              onClick={() => {
                console.log(123);
                setRelationRelations([
                  ...relationRelations,
                  {
                    id: uuid(),
                    order_num: relationRelations.length + 1,
                    relation_name_cn: '',
                    relation_name_en: '',
                    start_entity_labels: [],
                    target_entity_labels: [],
                    colour: '#0000000'
                  }
                ]);
              }}
            >
              <IconPlus />
              添加关系
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default TextSubstanceComponent;
