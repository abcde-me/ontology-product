import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Pagination,
  Tooltip
} from '@arco-design/web-react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import RefreshIcon from '@/assets/refresh.svg';
import {
  IconArrowLeft,
  IconDelete,
  IconEdit,
  IconExclamationCircle,
  IconPlus
} from '@arco-design/web-react/icon';
import useTagEment from '../../../store/useTagEment';
import { TAG_ELEMT, AddCalTitle, EditOkTitle, DelTitle } from './tegMock';
import {
  createTagElementList,
  delTagElementList,
  EditTagElementList,
  getTagElementList,
  putTagElementList
} from '@/api/tabElements';
import TextTruncate from '../TextTruncate';
import NoDataEmpty from '@/components/NoDataEmpty';
import './indes.less';
function TagEment() {
  const InputSearch = Input.Search;
  const {
    tagVisible,
    tagList,
    editId,
    onTagVisible,
    ControlVisible,
    onControlVisible,
    onHandTagList,
    onHandTagArrList
  } = useTagEment();
  // 分页状态
  const [pageCurrent, setPageCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  // 头部变量
  const [name, setName] = useState('');
  // 控制新增弹窗的确认框
  const [createVisible, setCreateVisible] = useState(false);
  const [form] = Form.useForm();
  const [formItems, setFormItems] = useState<{
    key_name: string;
    description: string;
    key_value_list: any;
  }>({
    key_name: '',
    description: '',
    key_value_list: []
  });

  // 标记是否是初始数据加载
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  // 标记是否已经初始化过新增模式
  const [isCreateInitialized, setIsCreateInitialized] = useState(false);
  // 跟踪鼠标悬停的标签ID
  const [hoveredTagId, setHoveredTagId] = useState(null);
  // 跟踪每个标签的展开状态 {tagId: isExpanded}
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({});
  // 跟踪哪些标签需要显示展开按钮 {tagId: needsExpand}
  const [tagsNeedExpand, setTagsNeedExpand] = useState<Record<string, boolean>>(
    {}
  );
  // 存储各个标签内容区域的 ref
  const tagContentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 获取标签列表数据
  const fetchTagList = async (
    pageNum = pageCurrent,
    pageSizeParam = pageSize,
    searchName = name
  ) => {
    try {
      const params: any = {
        page_num: pageNum,
        page_size: pageSizeParam
      };

      // 如果有搜索条件，添加搜索参数
      if (searchName) {
        params.tag_value_fuzzy_query = searchName;
      }
      const paramsAll = {
        page_num: 1,
        page_size: 10000
      };
      const res = await getTagElementList(params);
      const resAll = await getTagElementList(paramsAll);
      onHandTagArrList(resAll?.data?.tag_types || []);
      onHandTagList(res?.data?.tag_types || []);
      setTotalItems(res?.data?.total_count || 0);
    } catch (error) {
      console.error('获取标签列表失败:', error);
      onHandTagList([]);
      setTotalItems(0);
    }
  };
  useEffect(() => {
    fetchTagList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ControlVisible]);

  // 检测各个标签内容区域是否需要展开按钮
  useEffect(() => {
    if (tagList.length === 0) return;

    const checkHeights = () => {
      const newTagsNeedExpand: Record<string, boolean> = {};

      tagList.forEach((item) => {
        const el = tagContentRefs.current[item.id];

        if (el && item?.values?.length > 0) {
          // 临时移除高度限制来获取真实高度
          const originalMaxHeight = el.style.maxHeight;
          const originalOverflow = el.style.overflow;
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';

          // 获取真实高度
          const scrollHeight = el.scrollHeight;
          const needsExpand = scrollHeight > 115;

          // 恢复原始样式
          el.style.maxHeight = originalMaxHeight;
          el.style.overflow = originalOverflow;

          newTagsNeedExpand[item.id] = needsExpand;
        } else {
          newTagsNeedExpand[item.id] = false;
        }
      });

      setTagsNeedExpand(newTagsNeedExpand);
    };

    // 使用 requestAnimationFrame 确保在下一帧检测
    const timer1 = setTimeout(() => {
      requestAnimationFrame(() => {
        checkHeights();
      });
    }, 100);

    const timer2 = setTimeout(() => {
      requestAnimationFrame(() => {
        checkHeights();
      });
    }, 500);

    const timer3 = setTimeout(() => {
      requestAnimationFrame(() => {
        checkHeights();
      });
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [tagList]);

  // 当数据更新时也触发检测
  useEffect(() => {
    if (tagList.length === 0) return;

    const timer = setTimeout(() => {
      const newTagsNeedExpand: Record<string, boolean> = {};

      tagList.forEach((item) => {
        const el = tagContentRefs.current[item.id];
        if (el && item?.values?.length > 0) {
          // 临时移除高度限制来获取真实高度
          const originalMaxHeight = el.style.maxHeight;
          const originalOverflow = el.style.overflow;
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';

          const scrollHeight = el.scrollHeight;
          const needsExpand = scrollHeight > 115;

          // 恢复原始样式
          el.style.maxHeight = originalMaxHeight;
          el.style.overflow = originalOverflow;

          newTagsNeedExpand[item.id] = needsExpand;
        } else {
          newTagsNeedExpand[item.id] = false;
        }
      });

      setTagsNeedExpand(newTagsNeedExpand);
    }, 115);

    return () => clearTimeout(timer);
  }, [tagList, pageCurrent, pageSize, name]);

  // 刷新按钮刷新列表
  const refreshList = () => {
    fetchTagList(pageCurrent, pageSize, name);
  };
  useEffect(() => {
    if (ControlVisible === TAG_ELEMT.EDIT) {
      setIsInitialLoad(true); // 标记为初始数据加载
      EditTagElementList({ tag_id: editId })
        .then((res) => {
          if (res.code === 'Success') {
            const newFormItems = {
              key_name: res?.data?.key_name,
              description: res?.data?.description,
              key_value_list: res?.data?.values
            };
            setFormItems(newFormItems);
          }
        })
        .catch((err) => {
          console.log('编辑接口错误:', err);
        })
        .finally(() => {
          setIsInitialLoad(false); // 数据加载完成
        });
    }
  }, [editId]);

  // 只在编辑模式下且是初始数据加载时更新表单值
  useEffect(() => {
    if (ControlVisible === TAG_ELEMT.EDIT && editId && isInitialLoad) {
      // 处理 key_value_list 数据格式：从对象数组转换为字符串数组用于表单显示
      const processedKeyValueList = formItems.key_value_list.map(
        (item: any) => {
          // 如果 item 是对象且有 value 属性，取 value；否则直接取 item
          if (
            typeof item === 'object' &&
            item !== null &&
            item.value !== undefined
          ) {
            return item.value;
          }
          return item;
        }
      );

      form.setFieldsValue({
        key_name: formItems.key_name,
        description: formItems.description,
        key_value_list: processedKeyValueList
      });
    } else if (ControlVisible === TAG_ELEMT.CREATE && !isCreateInitialized) {
      // 新增模式：只在首次进入时清空表单并设置默认值
      console.log('新增模式 - 首次初始化表单');
      form.resetFields();
      setFormItems({
        key_name: '',
        description: '',
        key_value_list: [''] // 新增时使用字符串数组格式
      });
      setIsCreateInitialized(true);
    }
  }, [
    ControlVisible,
    editId,
    isInitialLoad,
    isCreateInitialized,
    formItems.key_name,
    formItems.description,
    formItems.key_value_list.length,
    form
  ]);
  const SearchName = (e: string) => {
    setName(e);
    setPageCurrent(1); // 搜索时重置到第一页
    fetchTagList(1, pageSize, e);
  };
  const CreateBtn = () => {
    setIsCreateInitialized(false);
    onControlVisible(TAG_ELEMT.CREATE);
  };
  // 第一层关闭时默认页面
  const handOnCancel = () => {
    onTagVisible(false);
    onControlVisible('');
  };

  // 处理表单提交
  const handleSubmit = () => {
    // 编辑
    // 编辑需要edit
    // setFormItems()
    if (ControlVisible === TAG_ELEMT.EDIT) {
      form
        .validate()
        .then((values) => {
          const data = {
            key_name: values.key_name,
            description: values.description,
            key_value_list: formItems.key_value_list
          };
          setFormItems(data);
          setCreateVisible(true);
        })
        .catch((errorInfo) => {
          console.log('表单验证失败：', errorInfo);
        });
    } else if (ControlVisible === TAG_ELEMT.CREATE) {
      // 确认创建的操作
      form.validate().then((values) => {
        // 新增模式：直接使用字符串数组格式
        createTagElementList(values)
          .then((res) => {
            console.log(res);
            if (res.code === 'Success') {
              Message.success('添加成功！');
            }
          })
          .catch((err) => {
            console.log(err);
          });
        form.resetFields();
        onControlVisible('');
        fetchTagList(pageCurrent, pageSize, name);

        // 重置表单为下一个添加或编辑做准备
        setFormItems({
          key_name: '',
          description: '',
          key_value_list: []
        });
        setIsInitialLoad(false);
        setIsCreateInitialized(false);
        // 刷新数据
      });
    }
  };

  // 添加标签值
  const addFormItem = () => {
    if (formItems.key_value_list.length >= 15) {
      Message.error('最多只能添加15条标签值');
    } else {
      if (ControlVisible === TAG_ELEMT.CREATE) {
        // 新增模式：添加空字符串
        setFormItems({
          ...formItems,
          key_value_list: [...formItems.key_value_list, '']
        });
      } else {
        // 编辑模式：添加对象结构
        setFormItems({
          ...formItems,
          key_value_list: [...formItems.key_value_list, { value: '' }]
        });
      }
    }
  };

  // 更新标签值
  const handleTextChange = (index, value) => {
    const newKeyValueList = [...formItems.key_value_list];

    if (ControlVisible === TAG_ELEMT.CREATE) {
      // 新增模式：直接使用字符串数组
      newKeyValueList[index] = value;
    } else {
      // 编辑模式：使用对象数组格式
      if (
        newKeyValueList[index] &&
        typeof newKeyValueList[index] === 'object' &&
        newKeyValueList[index] !== null
      ) {
        // 保持原有结构（包括id），只更新value
        newKeyValueList[index] = {
          ...newKeyValueList[index],
          value: value
        };
      } else {
        // 新添加的项或字符串项，创建新对象
        newKeyValueList[index] = { value: value };
      }
    }

    setFormItems({ ...formItems, key_value_list: newKeyValueList });
  };
  // 删除标签值
  const deleTagList = (index) => {
    if (formItems.key_value_list.length <= 1) {
      Message.error('至少需要保留一个标签值');
      return;
    }

    const newKeyValueList = formItems.key_value_list.filter(
      (_, i) => i !== index
    );
    setFormItems({ ...formItems, key_value_list: newKeyValueList });

    // 同时更新表单字段
    let processedKeyValueList;
    if (ControlVisible === TAG_ELEMT.CREATE) {
      // 新增模式：直接使用字符串数组
      processedKeyValueList = newKeyValueList;
    } else {
      // 编辑模式：从对象数组中提取value
      processedKeyValueList = newKeyValueList.map((item) => {
        if (
          typeof item === 'object' &&
          item !== null &&
          item.value !== undefined
        ) {
          return item.value;
        }
        return item;
      });
    }

    form.setFieldsValue({
      key_value_list: processedKeyValueList
    });
  };
  // 取消编辑或者新增
  const hancelDel = () => {
    if (ControlVisible === TAG_ELEMT.CREATE) {
      setCreateVisible(true);
    } else {
      onControlVisible('');
    }
  };
  // 新增标签确认框
  const onCreateOk = () => {
    if (ControlVisible === TAG_ELEMT.CREATE) {
      Message.success('取消创建成功！');
      setCreateVisible(false);
      onControlVisible('');
    } else if (ControlVisible === TAG_ELEMT.EDIT) {
      // 从表单获取最新数据
      form
        .validate()
        .then((values) => {
          // 将表单的字符串数组转换为对象数组格式
          const processedValues = values.key_value_list.map((value) => {
            // 查找原始数据中是否有对应的ID
            const originalItem = formItems.key_value_list.find(
              (item) => typeof item === 'object' && item.value === value
            );

            if (originalItem && originalItem.id) {
              // 如果有ID，保持原有结构
              return { id: originalItem.id, value: value };
            } else {
              // 如果没有ID，只传value
              return { value: value };
            }
          });

          const data = {
            key_id: editId,
            key_name: values.key_name,
            description: values.description,
            values: processedValues
          };

          putTagElementList(data)
            .then((res) => {
              if (res.code === 'Success') {
                Message.success('编辑成功！');
                fetchTagList(pageCurrent, pageSize, name);
                onControlVisible('', '');
                setCreateVisible(false);
                form.resetFields();

                // 重置表单为下一个添加做准备
                setFormItems({
                  key_name: '',
                  description: '',
                  key_value_list: []
                });
                setIsInitialLoad(false);
                setIsCreateInitialized(false);
              }
            })
            .catch((err) => {
              console.log('编辑失败:', err);
            });
        })
        .catch((errorInfo) => {
          console.log('表单验证失败：', errorInfo);
        });
    } else if (ControlVisible === TAG_ELEMT.DEL) {
      delTagElementList({ tag_type_id: editId })
        .then((res) => {
          console.log(res);
          if (res.code === 'Success') {
            Message.success(`删除成功！`);
            onControlVisible('', '');
          }
        })
        .catch((err) => {
          console.log(err);
        });
      fetchTagList(pageCurrent, pageSize, name);

      setCreateVisible(false);
      onControlVisible('');
      // 刷新数据
    }
  };
  // modal头部文案
  const tagElementTitle = (
    <div className="flex items-end gap-1">
      <p className="font-pingfang text-center text-[16px] font-medium leading-[24px] text-[#0F172A]">
        标签管理
      </p>
    </div>
  );
  // 创建时文案
  const createTagElementTitle = (
    <div className="flex items-center">
      <IconArrowLeft
        onClick={() => onControlVisible('')}
        className="cursor-pointer"
      />
      <p className="font-pingfang text-[16px] font-semibold leading-[24px] text-[#7F8C9F]">
        标签管理
      </p>
      <span className="ml-2 mr-2 text-[#7F8C9F]">/</span>
      <p className="font-pingfang text-[16px] font-semibold leading-[24px] text-[#0F172A]">
        新增标签
      </p>
    </div>
  );
  // 编辑时文案
  const editTagElementTitle = (
    <div className="flex items-center">
      <IconArrowLeft
        onClick={() => onControlVisible('')}
        className="cursor-pointer"
      />
      <p className="font-pingfang text-[16px] font-semibold leading-[24px] text-[#7F8C9F]">
        标签管理
      </p>
      <span className="ml-2 mr-2 text-[#7F8C9F]">/</span>
      <p className="font-pingfang text-[16px] font-semibold leading-[24px] text-[#0F172A]">
        编辑标签
      </p>
    </div>
  );
  const TagTable = (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InputSearch
            allowClear={true}
            placeholder="请输入标签名称或标签值"
            style={{ width: 240 }}
            value={name}
            onChange={SearchName}
          />
          <button
            className="ml-1 flex h-8 cursor-pointer items-center rounded border border-gray-200 bg-white px-2 text-gray-700 hover:bg-gray-100"
            onClick={refreshList}
            type="button"
          >
            <RefreshIcon />
          </button>
        </div>
        <Button type="primary" onClick={CreateBtn} icon={<IconPlus />}>
          新建标签
        </Button>
      </div>
      {tagList.length === 0 ? (
        <NoDataEmpty />
      ) : (
        <>
          <div className="h-[450px] overflow-auto">
            {tagList.map((item, index) => {
              const isHovered = hoveredTagId === item.id;
              return (
                <div
                  key={item.id}
                  className="mb-3 flex flex-col items-start gap-3 self-stretch rounded-[12px] border border-[#E2E8F0] p-4 transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-sm"
                  onMouseEnter={() => setHoveredTagId(item.id)}
                  onMouseLeave={() => setHoveredTagId(null)}
                >
                  {/* 头部 */}
                  <div className="flex w-full flex-row justify-between">
                    <div>
                      <p className="font-pingfang text-[14px] font-semibold leading-[22px] text-[#0F172A]">
                        {item.key_name}
                      </p>
                      <p className="font-pingfang text-[12px] font-normal leading-[18px] text-[#6E7B8D]">
                        {item.description}
                      </p>
                    </div>
                    <div
                      className={`transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <Tooltip content="编辑">
                        <IconEdit
                          onClick={() =>
                            onControlVisible(TAG_ELEMT.EDIT, item.id)
                          }
                          className="mr-5 h-4 w-4 cursor-pointer text-[#0F172A] transition-colors duration-200 hover:text-[#1890FF]"
                        />
                      </Tooltip>
                      <Tooltip content="删除">
                        <IconDelete
                          onClick={() => {
                            (onControlVisible(TAG_ELEMT.DEL, item.id),
                              setCreateVisible(true));
                          }}
                          className="h-4 w-4 cursor-pointer text-[#0F172A] transition-colors duration-200 hover:text-[#FF4D4F]"
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <div className="relative w-full">
                    <div
                      ref={(el) => {
                        tagContentRefs.current[item.id] = el;
                        // 在元素挂载后立即检测高度
                        if (el && item?.values?.length > 0) {
                          setTimeout(() => {
                            const originalMaxHeight = el.style.maxHeight;
                            const originalOverflow = el.style.overflow;
                            el.style.maxHeight = 'none';
                            el.style.overflow = 'visible';

                            const scrollHeight = el.scrollHeight;
                            const needsExpand = scrollHeight > 115;

                            el.style.maxHeight = originalMaxHeight;
                            el.style.overflow = originalOverflow;

                            if (tagsNeedExpand[item.id] !== needsExpand) {
                              setTagsNeedExpand((prev) => ({
                                ...prev,
                                [item.id]: needsExpand
                              }));
                            }
                          }, 50);
                        }
                      }}
                      className="flex flex-wrap items-start gap-2"
                      style={{
                        maxHeight: expandedTags[item.id] ? 'none' : '115px',
                        overflow: 'hidden',
                        alignContent: 'flex-start'
                      }}
                    >
                      {item?.values.map((v, i) => {
                        return (
                          <div
                            key={v.id}
                            className="flex max-w-[240px] items-center gap-1 rounded-[4px] bg-[#E7ECF0] p-[1px_4px]"
                          >
                            <TextTruncate
                              key={i}
                              maxW="240px"
                              text={v.value}
                            ></TextTruncate>
                          </div>
                        );
                      })}
                    </div>
                    {/* 展开/收起按钮，只在真正需要时显示 */}
                    {tagsNeedExpand[item.id] && (
                      <div
                        className="relative z-10 mt-2 cursor-pointer text-sm text-[#1890FF] hover:text-[#40a9ff]"
                        style={{ float: 'right' }}
                        onClick={() => {
                          setExpandedTags((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id]
                          }));
                        }}
                      >
                        {expandedTags[item.id] ? '收起' : '展开'}
                      </div>
                    )}
                    {/* 渐变遮罩，只在未展开且需要展开时显示 */}
                    {tagsNeedExpand[item.id] && !expandedTags[item.id] && (
                      <div
                        className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-12"
                        style={{
                          background:
                            'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,1) 100%)'
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <Pagination
              size="small"
              total={totalItems}
              current={pageCurrent}
              pageSize={pageSize}
              showTotal
              showJumper
              sizeCanChange
              onChange={(current, size) => {
                setPageCurrent(current);
                setPageSize(size);
                // 分页变化时重新获取数据
                fetchTagList(current, size, name);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
  const editTag = (
    <div>
      <Form form={form} autoComplete="off" className="formCol">
        <Form.Item
          label="标签名称"
          field="key_name"
          rules={[
            {
              required: true,
              message: '标签名称不可为空'
            },
            {
              min: 1,
              max: 50,
              message: '标签名称长度必须在1到50个字符之间'
            }
          ]}
        >
          <Input placeholder="请输入标签名称" showWordLimit maxLength={50} />
        </Form.Item>

        <Form.Item
          label="标签描述"
          field="description"
          rules={[
            {
              required: true,
              message: '标签描述不可为空'
            },
            {
              min: 1,
              max: 50,
              message: '标签描述长度必须在1到50个字符之间'
            }
          ]}
        >
          <Input.TextArea
            placeholder="请输入标签描述"
            showWordLimit
            maxLength={50}
          />
        </Form.Item>
        <Form.Item label={`标签值`} field="key_value_list" required={true}>
          <div
            className="p-4"
            style={{
              height: '330px',
              overflow: 'auto',
              borderRadius: '4px',
              border: '1px solid var(--LineLine-color-border-1, #CBD5E1)'
            }}
          >
            {formItems?.key_value_list.map((item, index) => {
              return (
                <div key={index} className="mb-3 flex">
                  <div className="flex h-[32px] w-7 items-center">
                    {index + 1}：
                  </div>
                  <Form.Item
                    style={{ marginBottom: 0, flex: 1 }}
                    field={`key_value_list.${index}`}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      { required: true, message: '标签值不可为空' },
                      {
                        min: 1,
                        max: 50,
                        message: '标签值长度必须在1到50个字符之间'
                      }
                    ]}
                  >
                    <Input
                      width={490}
                      className="ml-[5px]"
                      placeholder="请输入标签值"
                      showWordLimit
                      maxLength={50}
                      onChange={(value) => handleTextChange(index, value)}
                    />
                  </Form.Item>
                  <div className="ml-[19px] flex h-[32px] w-[32px] cursor-pointer items-center">
                    <IconDelete
                      onClick={() => deleTagList(index)}
                      className="h-[14px] w-[14px]"
                    />
                  </div>
                </div>
              );
            })}
            <Button
              icon={<IconPlus />}
              disabled={formItems?.key_value_list.length >= 15 ? true : false}
              onClick={addFormItem}
            >
              新增标签值
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );

  const getTitle = () => {
    if (ControlVisible === TAG_ELEMT.EDIT) {
      return editTagElementTitle;
    } else if (ControlVisible === TAG_ELEMT.CREATE) {
      return createTagElementTitle;
    } else {
      return tagElementTitle;
    }
  };
  const getBox = () => {
    if (
      ControlVisible === TAG_ELEMT.EDIT ||
      ControlVisible === TAG_ELEMT.CREATE
    ) {
      return editTag;
    } else {
      return TagTable;
    }
  };
  const getokModal = () => {
    if (ControlVisible === TAG_ELEMT.EDIT) {
      return EditOkTitle;
    } else if (ControlVisible === TAG_ELEMT.CREATE) {
      return AddCalTitle;
    } else if (ControlVisible === TAG_ELEMT.DEL) {
      return DelTitle;
    }
  };
  return (
    <div className="mr-2">
      <Button
        className="h-8 rounded text-sm"
        style={{ border: '1px solid gray', color: '#1E293B' }}
        onClick={() => onTagVisible(true)}
      >
        标签管理
      </Button>
      <Modal
        className="h-[650px] max-h-[650px] w-[800px] pb-3 "
        onOk={handleSubmit}
        title={getTitle()}
        visible={tagVisible}
        onCancel={handOnCancel}
        autoFocus={false}
        focusLock={true}
        footer={
          ControlVisible === TAG_ELEMT.EDIT ||
          ControlVisible === TAG_ELEMT.CREATE ? (
            <>
              <Button onClick={hancelDel}>取消</Button>
              <Button onClick={handleSubmit}>确定</Button>
            </>
          ) : null
        }
      >
        {getBox()}
      </Modal>
      <Modal
        title={
          <div className="flex items-center">
            <IconExclamationCircle className="h-5 w-5 text-[#FF7D00]" />
            {getokModal()?.title}
          </div>
        }
        visible={createVisible}
        onOk={onCreateOk}
        onCancel={() => {
          setCreateVisible(false);
          onControlVisible('', '');
        }}
        autoFocus={false}
        focusLock={true}
      >
        <p>{getokModal()?.text}</p>
      </Modal>
    </div>
  );
}

export default TagEment;
