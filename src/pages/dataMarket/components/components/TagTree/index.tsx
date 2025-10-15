import { TreeSelect, Divider, Button } from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import { IconPlus } from '@arco-design/web-react/icon';
import useTagEment from '../../../store/useTagEment';
import TagEment from '../TagEment/indes';
import './index.less';
const TagTree = (props) => {
  const { value, onChange } = props;
  const {
    treeTagList,
    docTagLiist,
    tagListArr,
    onTagVisible,
    onHandTreeTag,
    onHandToTreeTag
  } = useTagEment();

  // 本地状态管理当前选中的值
  const [localSelectedValues, setLocalSelectedValues] = useState<string[]>([]);

  // 控制下拉框的显示状态
  const [popupVisible, setPopupVisible] = useState(true);
  useEffect(() => {
    setPopupVisible(false);
  }, []);
  // 当 treeTagList 变化时，更新本地状态
  useEffect(() => {
    const ids = getSelectedIds(treeTagList);
    setLocalSelectedValues(ids);
    if (ids.length > 0 && onChange) {
      const processedValue = processSelectedValues(ids);
      onChange(processedValue);
    }
  }, [treeTagList]);

  const onTreeSelect = (newValue) => {
    // 更新本地状态
    setLocalSelectedValues(newValue);

    // 处理选中的值，构建 tag_type-id: {is_all: false, ids: []} 格式
    const processedValue = processSelectedValues(newValue);
    onHandToTreeTag(processedValue);
    if (onChange) {
      onChange(processedValue);
    }
  };

  // 处理选中的值，构建所需的数据结构
  const processSelectedValues = (selectedValues) => {
    const resultArray = [] as any[];
    tagListArr.forEach((tagType) => {
      const tagTypeId = tagType.id;
      const selectedIds = [] as string[];
      let isAll = false;
      const allChildIds = tagType.values.map((child) => child.id);
      const selectedChildIds = selectedValues.filter((selectedId) =>
        allChildIds.includes(selectedId)
      );
      // 判断是否全选
      isAll =
        selectedChildIds.length === allChildIds.length &&
        allChildIds.length > 0;
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
      if (selectedChildIds.length > 0) {
        if (isAll) {
          resultArray.push({
            tag_key_id: tagTypeId,
            is_all: true
          });
        } else {
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
  function convertTagDataToTreeFormat(tagTypeDtos) {
    const result = tagTypeDtos.map((tagType, tagIndex) => ({
      title: tagType.key_name,
      value: tagType.id, // 使用 ID 作为 value
      key: tagType.id,
      children: tagType.values.map((value, valueIndex) => ({
        title: value.value,
        value: value.id, // 使用 ID 作为 value
        key: value.id
      }))
    }));
    return result;
  }
  function newconvertTagDataToTreeFormat(tagTypeDtos) {
    return tagTypeDtos.map((tagType, tagIndex) => {
      // 检查当前标签类型是否在第一个选择器中已被选择
      const selectedTagType = docTagLiist.find(
        (item) => item.id === tagType.id
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
  const EditStructure = newconvertTagDataToTreeFormat(tagListArr);
  // 自定义搜索函数，根据 title 进行搜索而不是 value
  const filterTreeNode = (inputText: string, node: any) => {
    if (!inputText) return true;

    const searchValue = inputText.toLowerCase();

    // 搜索节点标题
    const nodeTitle = node.props?.title || node.title || '';
    if (nodeTitle.toLowerCase().includes(searchValue)) {
      return true;
    }

    // 如果有子节点，也检查子节点是否匹配
    if (node.props?.children || node.children) {
      const children = node.props?.children || node.children;
      return children.some((child: any) => {
        const childTitle = child.props?.title || child.title || '';
        return childTitle.toLowerCase().includes(searchValue);
      });
    }

    return false;
  };

  // 从 treeTagList 中提取 values 的 ID 数组用于回显
  const getSelectedIds = (tagList) => {
    if (!tagList || !Array.isArray(tagList)) return [];
    const selectedIds = [] as string[];
    tagList.forEach((item) => {
      if (item.values && Array.isArray(item.values)) {
        item.values.forEach((value) => {
          selectedIds.push(value.id); // 提取 ID
        });
      }
    });
    return selectedIds;
  };

  return (
    <div>
      <TreeSelect
        placeholder="请选择标签"
        className="treeselecttag"
        loading={false}
        showSearch
        allowClear
        treeCheckable
        maxTagCount={4}
        treeData={EditStructure}
        value={localSelectedValues}
        treeCheckStrictly={false}
        popupVisible={popupVisible}
        onVisibleChange={setPopupVisible}
        onChange={onTreeSelect}
        filterTreeNode={filterTreeNode}
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
                  style={{ border: '1px solid gray', color: '#1E293B' }}
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
    </div>
  );
};

export default TagTree;
