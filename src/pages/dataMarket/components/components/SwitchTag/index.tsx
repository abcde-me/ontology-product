import {
  TreeSelect,
  Divider,
  Button,
  Switch,
  Form,
  Tooltip
} from '@arco-design/web-react';
import React from 'react';
import { useState, useEffect } from 'react';
import { IconPlus, IconQuestionCircle } from '@arco-design/web-react/icon';
import useTagEment from '../../../store/useTagEment';
import TagEment from '../TagEment/indes';
import './index.less';
import TagContent from '../../configurationpage/compontents/tagContent';

const SwitchTag = (props) => {
  const FormItem = Form.Item;
  const { value, onChange, switchList } = props;
  const {
    swirchTagList,
    switchTag,
    switchTagVisible,
    tagListArr,
    toTreeTagList,
    onTagVisible,
    onHandSwitchTreeTag
  } = useTagEment();
  const [switchValue, setSwitchValue] = useState(false);

  // 初始化：如果表单未提供值，则写入默认值
  useEffect(() => {
    if (!value && onChange) {
      if (switchTagVisible) {
        // 对于display模式，使用switchTagVisible作为switchValue
        const payload = { switchValue: switchTagVisible } as any;

        // 如果有switchList数据，将其转换为treeValue格式
        if (switchList && switchList.length > 0) {
          // 将switchList转换为treeValue格式
          const ids = switchList.flatMap((item) =>
            item.values.map((value) => value.id)
          );
          const treeValueData = processSelectedValues(ids);
          payload.treeValue = treeValueData;
        }

        onChange(payload);
      } else {
        onChange({ switchValue: false });
      }
    }
  }, [onChange, value]);

  // 同步本地开关状态与表单值
  useEffect(() => {
    if (value && typeof value.switchValue === 'boolean') {
      setSwitchValue(value.switchValue);
    }
  }, [value]);

  const onTreeSelect = (newValue) => {
    // 拿到的是标签的id   拿到之后再去查询  查询完拿到所有的标签添加到数据里面去
    onHandSwitchTreeTag(newValue);

    // 处理选中的值，构建 tag_type-id: {is_all: false, ids: []} 格式
    const processedValue = processSelectedValues(newValue);

    // 将值传递给表单
    if (switchTag === 'display') {
      if (onChange) {
        const payload = { switchValue: switchTagVisible } as any;
        if (switchValue) {
          payload.treeValue = processedValue;
        }
        onChange(payload);
      }
    } else {
      if (onChange) {
        const payload = { switchValue: switchValue || false } as any;
        if (switchValue) {
          payload.treeValue = processedValue;
        }
        onChange(payload);
      }
    }
  };

  // 处理选中的值，构建所需的数据结构
  const processSelectedValues = (selectedValues) => {
    const resultArray = [] as any[];
    // 遍历原始数据，为每个标签类型构建数据结构
    tagListArr.forEach((tagType) => {
      const tagTypeId = tagType.id;
      const selectedIds = [] as string[];
      let isAll = false;

      // 检查是否选中了该标签类型下的所有子项
      const allChildIds = tagType.values.map((child) => child.id);
      const selectedChildIds = selectedValues.filter((selectedId) =>
        allChildIds.includes(selectedId)
      );

      // 判断是否全选
      isAll =
        selectedChildIds.length === allChildIds.length &&
        allChildIds.length > 0;

      // 如果不是全选收集选中的子项ID
      if (!isAll) {
        selectedChildIds.forEach((selectedId) => {
          const childItem = tagType.values.find(
            (child) => child.id === selectedId
          );
          if (childItem) {
            selectedIds.push(childItem.id);
          }
        });
      }

      // 只有当有选中项时才添加到结果中
      if (selectedChildIds.length > 0) {
        if (isAll) {
          // 全选时，只传 is_all: true
          resultArray.push({
            tag_key_id: tagTypeId,
            is_all: true
          });
        } else {
          // 非全选时，传具体的 ids
          resultArray.push({
            tag_key_id: tagTypeId,
            is_all: false,
            tag_ids: selectedIds
          });
        }
      }
    });

    return resultArray;
  };

  const onSwitchChange = (checked) => {
    setSwitchValue(checked);
    // 将值传递给表单
    if (onChange) {
      const payload = { switchValue: checked || false } as any;
      if (checked) {
        payload.treeValue = value?.treeValue || {};
      }
      onChange(payload);
    }
  };

  function convertTagDataToTreeFormat(tagTypeDtos) {
    return tagTypeDtos.map((tagType, tagIndex) => {
      // 检查当前标签类型是否在第一个选择器中已被选择
      const selectedTagType = toTreeTagList.find(
        (item) => item.tag_key_id === tagType.id
      );

      // 如果该标签类型在第一个选择器中被选择了（无论全选还是部分选择），则父节点和所有子节点都禁用
      const isParentDisabled = !!selectedTagType;

      return {
        title: tagType.key_name,
        value: tagType.key_name,
        key: tagType.id,
        disabled: isParentDisabled, // 父节点禁用
        children: tagType.values.map((value, valueIndex) => {
          return {
            title: value.value,
            value: value.value,
            key: value.id,
            disabled: isParentDisabled // 所有子节点都禁用
          };
        })
      };
    });
  }

  const newStructure = convertTagDataToTreeFormat(tagListArr);
  return (
    <div>
      {switchTag === 'display' ? (
        <>
          <div className={`${switchTagVisible === false ? '' : 'docTag'}`}>
            <Form className="formCol" style={{ width: 800 }} autoComplete="off">
              <FormItem
                label={
                  <>
                    自动标签：
                    <Tooltip content="使用大模型依据已配置的标签目录自动匹配标签；仅从目录内选择，不会生成新标签">
                      <IconQuestionCircle
                        className="w-[14px h-[14px]"
                        style={{ color: '#7F8C9F' }}
                      />
                    </Tooltip>
                  </>
                }
              >
                <Switch
                  disabled={true}
                  checkedText="开"
                  uncheckedText="关"
                  className="switchtag flex h-[18px] w-[36px] items-center"
                  checked={switchTagVisible}
                  onChange={onSwitchChange}
                />
              </FormItem>
              <FormItem
                label={
                  <>
                    标签范围：
                    <Tooltip content="使用大模型依据已配置的标签目录自动匹配标签；仅从目录内选择，不会生成新标签">
                      <IconQuestionCircle
                        className="w-[14px h-[14px]"
                        style={{ color: '#7F8C9F' }}
                      />
                    </Tooltip>
                  </>
                }
              >
                <div className="flex flex-wrap content-center items-center gap-2 self-stretch">
                  <TagContent tagList={switchList} />
                </div>
              </FormItem>
            </Form>
          </div>
        </>
      ) : (
        <>
          <div className="h-[24px] w-[44px] px-1 py-[3px]">
            <Switch
              checkedText="开"
              uncheckedText="关"
              className="switchtag flex h-[18px] w-[36px] items-center"
              checked={value?.switchValue ?? switchValue}
              onChange={onSwitchChange}
            />
          </div>
          <div className="font-pingfang mb-1 mt-1 text-[12px] font-normal leading-[18px] text-[#6E7B8D]">
            开启后针对所选的标签范围，大模型对文档所有切片自动选择标签
          </div>
          {switchValue ? (
            <TreeSelect
              placeholder="请选择标签"
              className="treeselecttag"
              loading={false}
              showSearch
              allowClear
              treeCheckable
              maxTagCount={4}
              treeData={newStructure}
              value={swirchTagList}
              treeCheckStrictly={false}
              //   treeDefaultExpandedKeys={[]}
              onChange={onTreeSelect}
              style={{ width: 480 }}
              dropdownMenuStyle={{
                maxHeight: 250,
                display: 'flex',
                flexDirection: 'column'
              }}
              dropdownRender={(menu) => (
                <>
                  <div style={{ flex: 1, overflow: 'auto' }}>{menu}</div>
                  <div>
                    <Divider style={{ margin: 0 }} />
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 12px'
                      }}
                    >
                      <Button
                        className="h-8 rounded text-sm"
                        icon={<IconPlus />}
                        style={{
                          border: '1px solid gray',
                          color: '#1E293B'
                        }}
                        onClick={() => {
                          onTagVisible(true);
                        }}
                      >
                        标签管理
                      </Button>
                      <div style={{ display: 'none' }}>
                        <TagEment />
                      </div>
                    </div>
                  </div>
                </>
              )}
            />
          ) : null}
        </>
      )}
    </div>
  );
};

export default SwitchTag;
