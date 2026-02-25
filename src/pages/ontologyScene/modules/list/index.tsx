import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Input,
  Message,
  Modal,
  Pagination,
  Popover,
  Spin
} from '@arco-design/web-react';
import {
  IconPlus,
  IconEdit,
  IconDelete,
  IconStorage,
  IconSwap,
  IconFolder
} from '@arco-design/web-react/icon';
import {
  ExpandableProcessFlow,
  EllipsisPopover,
  ProcessStep,
  NoDataCard,
  NoResultCard
} from '@ceai-front/arco-material';
import { Link } from '@arco-design/web-react';
// import initialBg from '../../assets/initial-bg.png';
import ObjectSmallIcon from '../../assets/object-small.svg';
import LinkSmallIcon from '../../assets/link-small.svg';
import BehaviorSmallIcon from '../../assets/behavior-small.svg';
import FunctionSmallIcon from '../../assets/function-small.svg';
import ObjectTypeCreateIcon from '../../assets/object-type-create.svg';
import LinkCreateIcon from '../../assets/link-create.svg';
import BehaviorCreateIcon from '../../assets/behavior-create.svg';
import TestCreateIcon from '../../assets/test-create.svg';
import { ONTOLOGY_SCENE_MENU_ITEM_KEYS } from '@/common/constants';
import SceneModal, { SceneFormData } from './components/SceneModal';
import styles from './index.module.scss';
import classNames from 'classnames';
import {
  listOntologyModel,
  createOntologyModel,
  updateOntologyModel,
  deleteOntologyModel
} from '@/api/ontologySceneLibrary/ontologyScene';
import { OntologScene } from '@/types/ontologySceneApi';
import { ICON_OPTIONS } from '../../common/constants';
import dayjs from 'dayjs';

// 扩展 ProcessStep 类型，使 description 支持 ReactNode
interface SceneProcessStep extends Omit<ProcessStep, 'description'> {
  description: React.ReactNode;
}

// 场景卡片数据接口，直接使用 OntologScene
export type SceneCardItem = OntologScene;

// 场景卡片组件
interface SceneCardProps {
  item: SceneCardItem;
  onEdit?: (item: SceneCardItem) => void;
  onDelete?: (item: SceneCardItem) => void;
  onCardClick?: (item: SceneCardItem) => void;
  onIconClick?: (
    item: SceneCardItem,
    iconType: (typeof ONTOLOGY_SCENE_MENU_ITEM_KEYS)[keyof typeof ONTOLOGY_SCENE_MENU_ITEM_KEYS]
  ) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({
  item,
  onEdit,
  onDelete,
  onCardClick,
  onIconClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const history = useHistory();

  const handleCardClick = useCallback(() => {
    onCardClick?.(item);
  }, [item, onCardClick]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(item);
    },
    [item, onEdit]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(item);
    },
    [item, onDelete]
  );

  const handleIconClick = useCallback(
    (
      e: React.MouseEvent,
      iconType: (typeof ONTOLOGY_SCENE_MENU_ITEM_KEYS)[keyof typeof ONTOLOGY_SCENE_MENU_ITEM_KEYS]
    ) => {
      e.stopPropagation();
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${item.id || ''}/${iconType}`
      );
    },
    [item, onIconClick]
  );

  const getIconComponent = (icon: string) => {
    const matchedIcon = ICON_OPTIONS.find((option) => option.value === icon);
    const iconSource = matchedIcon?.icon ?? ICON_OPTIONS[0].icon;

    // 如果是字符串（图片路径），使用 img 标签
    if (typeof iconSource === 'string') {
      return (
        <img src={iconSource} alt="" className="h-full w-full object-contain" />
      );
    }

    // 如果是 React 组件（SVG），直接使用组件
    return iconSource
      ? React.createElement(iconSource, { style: { width: 49, height: 49 } })
      : null;
  };

  return (
    <div
      className={`relative flex h-full cursor-pointer flex-col gap-[12px] rounded-lg border border-[#EBEEF5] bg-white p-[24px] transition-all duration-200 ${
        isHovered
          ? 'border-[#165dff] shadow-[0_4px_12px_rgba(22,93,255,0.1)]'
          : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* 卡片头部 */}
      <div className="flex items-start gap-[12px]">
        <div className="flex h-[49px] w-[49px] flex-shrink-0 items-center justify-center">
          {getIconComponent(item.icon ?? '')}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-[4px] flex min-w-0 flex-1 justify-between text-[18px] font-[500] leading-[24px] text-[var(--color-text-1)]">
            <EllipsisPopover
              wrapperClassName="flex-1 min-w-0"
              value={item.name}
            />

            <div className="flex items-center gap-[8px]">
              <Popover content="编辑">
                <IconEdit
                  className="h-4 w-4 cursor-pointer text-[#4e5969] transition-colors hover:text-[#165dff]"
                  onClick={handleEdit}
                />
              </Popover>
              <Popover content="删除">
                <IconDelete
                  className="h-4 w-4 cursor-pointer text-[#4e5969] transition-colors hover:text-[#165dff]"
                  onClick={handleDelete}
                />
              </Popover>
            </div>
          </div>

          {/* 描述说明 */}
          <div className="flex-1 text-[14px] leading-[22px] text-[var(--color-text-5)]">
            {item.description ? (
              <EllipsisPopover value={item.description} />
            ) : (
              '-'
            )}
          </div>
        </div>
      </div>

      {/* 底部图标和数字 */}
      <div className="flex items-center justify-between gap-[8px]">
        <div
          className="flex flex-1 cursor-pointer flex-col gap-[3px] rounded-[4px] border border-[var(--color-border-2)] p-[8px] text-[14px] text-[var(--color-text-1)] [&:hover]:cursor-pointer"
          onClick={(e) =>
            handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE)
          }
        >
          <ObjectSmallIcon className="h-[16px] w-[16px]" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] leading-[18px] text-[var(--color-text-3)]">
              对象
            </span>
            <span className="text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
              {item.ontologyObjectTypeCounts || 0}
            </span>
          </div>
        </div>

        <div
          className="hover:text-[rgba(var(--primary-6)) flex flex-1 cursor-pointer flex-col gap-[3px] rounded-[4px] border border-[var(--color-border-2)] p-[8px] text-[14px] text-[var(--color-text-1)] transition-colors"
          onClick={(e) =>
            handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS)
          }
        >
          <LinkSmallIcon className="h-[16px] w-[16px]" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] leading-[18px] text-[var(--color-text-3)]">
              链接
            </span>
            <span className="text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
              {item.ontologyLinkTypeCounts || 0}
            </span>
          </div>
        </div>

        <div
          className="hover:text-[rgba(var(--primary-6)) flex flex-1 cursor-pointer flex-col gap-[3px] rounded-[4px] border border-[var(--color-border-2)] p-[8px] text-[14px] text-[var(--color-text-1)] transition-colors"
          onClick={(e) =>
            handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS)
          }
        >
          <BehaviorSmallIcon className="h-[16px] w-[16px]" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] leading-[18px] text-[var(--color-text-3)]">
              行为
            </span>
            <span className="text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
              {item.ontologyActionCounts || 0}
            </span>
          </div>
        </div>

        <div
          className="hover:text-[rgba(var(--primary-6)) flex flex-1 cursor-pointer flex-col gap-[3px] rounded-[4px] border border-[var(--color-border-2)] p-[8px] text-[14px] text-[var(--color-text-1)] transition-colors"
          onClick={(e) =>
            handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS)
          }
        >
          <FunctionSmallIcon className="h-[16px] w-[16px]" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] leading-[18px] text-[var(--color-text-3)]">
              函数
            </span>
            <span className="text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
              {item.ontologyFunctionCounts || 0}
            </span>
          </div>
        </div>
      </div>
      {/* 更新日期 */}
      <div className="text-[14px] leading-[22px] text-[var(--color-text-4)]">
        更新于 {dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss')}
      </div>
    </div>
  );
};

export default function OntologySceneList() {
  const history = useHistory();
  const [filter, setFilter] = useState('');
  const [sceneList, setSceneList] = useState<SceneCardItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingScene, setEditingScene] = useState<SceneCardItem | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [createInitialLoading, setCreateInitialLoading] = useState(false);
  const isFirstLoadRef = useRef(true);

  // 加载场景列表
  const loadSceneList = useCallback(async () => {
    const isFirstLoad = isFirstLoadRef.current;
    if (isFirstLoad) {
      setInitialLoading(true);
      isFirstLoadRef.current = false;
    } else {
      setLoading(true);
    }
    try {
      const response = await listOntologyModel({
        pageNo: currentPage,
        pageSize: pageSize,
        filter: filter ?? ''
      });

      if (response.status === 200 && response.code === '') {
        const result = response.data?.result || [];
        setSceneList(result);
        setTotalCount(response.data?.totalCount || 0);
        // 只在首次加载且数据为空时设置 noData
        if (isFirstLoad && result.length === 0) {
          setNoData(true);
        } else if (result.length > 0) {
          // 如果有数据了，重置 noData
          setNoData(false);
        }
      } else {
        Message.error(response.message || '加载失败');
      }
    } catch (error) {
      console.error('加载场景列表失败:', error);
      Message.error('加载场景列表失败');
    } finally {
      if (isFirstLoad) {
        setInitialLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, filter]);

  useEffect(() => {
    loadSceneList();
  }, [loadSceneList]);

  // 处理创建场景
  const handleCreate = () => {
    console.log('handleCreate');
    setModalMode('create');
    setEditingScene(null);
    setModalVisible(true);
  };

  // 处理编辑场景
  const handleEdit = (item: SceneCardItem) => {
    setModalMode('edit');
    setEditingScene(item);
    setModalVisible(true);
  };

  // 处理弹窗提交
  const handleModalSubmit = async (data: SceneFormData) => {
    setSubmitLoading(true);
    try {
      if (modalMode === 'create') {
        const response = await createOntologyModel({
          name: data.name,
          description: data.description || '',
          icon: data.icon || '',
          tagIdList: []
        });

        if (response.status === 200 && response.code === '') {
          Message.success('创建成功');
          // 创建成功后跳转到详情页
          history.push(
            `/tenant/compute/modaforge/ontologyScene/detail/${response.data.id}`
          );
        } else {
          Message.error(response.message || '创建失败');
        }
      } else if (editingScene && editingScene.id) {
        const response = await updateOntologyModel({
          id: editingScene.id,
          name: data.name,
          description: data.description || '',
          icon: data.icon || ''
        });

        if (response.status === 200 && response.code === '') {
          Message.success('修改成功');
          // 重新加载列表
          await loadSceneList();
        } else {
          Message.error(response.message || '修改失败');
        }
      }
      setModalVisible(false);
    } catch (error) {
      Message.error(modalMode === 'create' ? '创建失败' : '修改失败');
      console.error('提交失败:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // 处理弹窗取消
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingScene(null);
  };

  // 处理删除场景
  const handleDelete = (item: SceneCardItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除场景"${item.name || ''}"吗？`,
      onOk: async () => {
        try {
          if (!item.id) {
            Message.error('场景ID无效');
            return;
          }

          const response = await deleteOntologyModel({ id: item.id });

          if (response.status === 200 && response.code === '') {
            Message.success('删除成功');
            // 重新加载列表
            await loadSceneList();
          } else {
            Message.error(response.message || '删除失败');
          }
        } catch (error) {
          Message.error('删除失败');
          console.error('删除失败:', error);
        }
      }
    });
  };

  // 处理卡片点击
  const handleCardClick = (item: SceneCardItem) => {
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${item.id || ''}`
    );
  };

  // 处理搜索（回车或点击搜索图标时触发）
  const handleSearch = (value: string) => {
    setFilter(value);
    setCurrentPage(1); // 搜索时重置到第一页
  };

  // 处理清除搜索
  const handleClear = () => {
    setFilter('');
    setCurrentPage(1); // 清除时重置到第一页
  };

  // 处理分页变化
  // const handlePageChange = (page: number, size: number) => {
  //   setCurrentPage(page);
  //   setPageSize(size);
  // };

  // 流程步骤配置
  const processSteps: SceneProcessStep[] = [
    {
      icon: <ObjectTypeCreateIcon />,
      title: '定义对象类型',
      description: (
        <>
          <span>将业务中的设备、人映射为标准数字对象,构筑数据模型的基石</span>
          <Link
            type="text"
            onClick={() => {
              history.push(
                `/tenant/compute/modaforge/ontologyScene/detail/create/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE}/create`
              );
            }}
            className="ml-1 text-xs"
          >
            创建对象类型
          </Link>
        </>
      )
    },
    {
      icon: <LinkCreateIcon />,
      title: '建立链接',
      description: (
        <>
          <span>定义对象间的业务关联,将离散数据编织成可探索的关系网络</span>
          <Link
            type="text"
            onClick={() => {
              history.push(
                `/tenant/compute/modaforge/ontologyScene/detail/create/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS}/create`
              );
            }}
            className="ml-1 text-xs"
          >
            创建链接
          </Link>
        </>
      )
    },
    {
      icon: <BehaviorCreateIcon />,
      title: '配置行为',
      description: (
        <>
          <span>安全的业务操作指令封装,使系统升级为可操作的工作台</span>
          <Link
            type="text"
            onClick={() => {
              history.push(
                `/tenant/compute/modaforge/ontologyScene/detail/create/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS}/create/_NEW_`
              );
            }}
            className="ml-1 text-xs"
          >
            创建动作
          </Link>
          <span className="mx-1 text-xs">或</span>
          <Link
            type="text"
            onClick={() => {
              history.push(
                `/tenant/compute/modaforge/ontologyScene/detail/create/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS}/create`
              );
            }}
            className="text-xs"
          >
            创建函数
          </Link>
        </>
      )
    },
    {
      icon: <TestCreateIcon />,
      title: '测试行为',
      description: (
        <>
          <span>文案待提供</span>
          <Link
            type="text"
            onClick={() => {
              history.push(
                `/tenant/compute/modaforge/ontologyScene/detail/create/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS}`
              );
            }}
            className="ml-1 text-xs"
          >
            去测试
          </Link>
        </>
      )
    }
  ];

  // 首次加载时显示全页 loading
  if (initialLoading) {
    return (
      <div
        className={classNames(
          'flex min-h-full flex-col items-center justify-center bg-white p-[24px]',
          styles['ontology-scene-list']
        )}
      >
        <Spin />
      </div>
    );
  }

  // 处理初始背景图点击创建场景
  // const handleInitialBgClick = async () => {
  //   if (createInitialLoading) return;

  //   setCreateInitialLoading(true);
  //   try {
  //     const response = await createOntologyModel({
  //       name: '新建本体场景',
  //       description: '',
  //       icon: ICON_OPTIONS[0]?.value || 'ontology-scene-1',
  //       tagIdList: []
  //     });

  //     if (response.status === 200 && response.code === '') {
  //       Message.success('创建成功');
  //       // 创建成功后跳转到详情页
  //       history.push(
  //         `/tenant/compute/modaforge/ontologyScene/detail/${response.data.id}`
  //       );
  //     } else {
  //       Message.error(response.message || '创建失败');
  //     }
  //   } catch (error) {
  //     Message.error('创建失败');
  //     console.error('创建场景失败:', error);
  //   } finally {
  //     setCreateInitialLoading(false);
  //   }
  // };

  // 只在第一次进入页面请求接口并且返回数据是空的时候展示无数据背景图
  if (noData && sceneList.length === 0) {
    return (
      <div
        className={classNames(
          styles['ontology-scene-list-initial-page'],
          'flex h-full w-full overflow-hidden bg-white'
        )}
      >
        {createInitialLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spin />
          </div>
        ) : (
          <>
            {/* 内容区域 */}
            <div className="relative mx-auto flex h-full w-full min-w-[1000px] max-w-[1220px] flex-1 flex-col items-center">
              <div className="mt-[118px] w-full">
                {/* 大标题 - 入场动效 */}
                <h1
                  className={classNames(
                    'mb-[12px] text-[40px] font-[600] leading-[54px] text-[var(--color-text-1)]',
                    styles['fade-in-up']
                  )}
                  style={{
                    animationDelay: '0ms'
                  }}
                >
                  企业级{' '}
                  <span className={classNames(styles['primary-color'])}>
                    本体
                  </span>{' '}
                  构建中心
                </h1>

                {/* 说明文字 - 入场动效 */}
                <p
                  className={classNames(
                    'mb-[36px] w-[429px] text-[16px] leading-[24px] text-[var(--color-text-3)]',
                    styles['fade-in-up']
                  )}
                  style={{
                    animationDelay: '50ms'
                  }}
                >
                  将离散的底层数据映射为可视、可管、可执行的业务对象, 构建面向
                  AI 时代的语义基础设施
                </p>

                {/* 按钮 - 入场动效和悬停动效 */}
                <div
                  className={classNames(styles['fade-in-up'])}
                  style={{
                    animationDelay: '100ms'
                  }}
                >
                  <Button
                    type="primary"
                    size="large"
                    className={classNames(styles['create-button'])}
                    onClick={handleCreate}
                  >
                    <span className="mr-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                      立即创建本体场景
                    </span>
                    <span className="inline-block">→</span>
                  </Button>
                </div>

                {/* 本体介绍 */}
                <div
                  className={classNames(
                    'absolute bottom-[16px] left-0 right-0 flex w-full gap-[20px] rounded-[4px] bg-white p-[32px]',
                    styles['fade-in-up']
                  )}
                  style={{ animationDelay: '150ms' }}
                >
                  {/* 统一数据语言 */}
                  <div className="flex flex-1 gap-[12px]">
                    <div className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center rounded-lg bg-[#EBF0FA]">
                      <IconStorage className="h-6 w-6 text-[#165dff]" />
                    </div>
                    <div className="flex flex-col gap-[8px]">
                      <h3 className="text-[16px] font-[600] leading-[24px] text-[var(--color-text-1)]">
                        统一数据语言
                      </h3>
                      <p className="text-[12px] leading-[22px] text-[var(--color-text-4)]">
                        打通底层数据孤岛,将晦涩的数据与代码转化为统一的业务语言,让业务人员无需懂技术也能看懂数据、使用数据。
                      </p>
                    </div>
                  </div>

                  {/* 构筑可信AI */}
                  <div className="flex flex-1 gap-[12px]">
                    <div className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center rounded-lg bg-[#EBF0FA]">
                      <IconSwap className="h-6 w-6 text-[#165dff]" />
                    </div>
                    <div className="flex flex-col gap-[8px]">
                      <h3 className="text-[16px] font-[600] leading-[24px] text-[var(--color-text-1)]">
                        构筑可信AI
                      </h3>
                      <p className="text-[12px] leading-[22px] text-[var(--color-text-4)]">
                        为大模型建立严谨的知识围栏,确保AI在业务场景中回答精准、可控、无虚假,让企业放心应用生成式
                        AI。
                      </p>
                    </div>
                  </div>

                  {/* 经验资产数字化 */}
                  <div className="flex flex-1 gap-[12px]">
                    <div className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center rounded-lg bg-[#EBF0FA]">
                      <IconFolder className="h-6 w-6 text-[#165dff]" />
                    </div>
                    <div className="flex flex-col gap-[8px]">
                      <h3 className="text-[16px] font-[600] leading-[24px] text-[var(--color-text-1)]">
                        经验资产数字化
                      </h3>
                      <p className="text-[12px] leading-[22px] text-[var(--color-text-4)]">
                        将原本在专家脑中的行业经验,固化为可复用的数字资产,支持在各类业务场景中随时调用,降低重复建设成本。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {/* 创建/编辑弹窗 */}
        {modalVisible && (
          <SceneModal
            visible={modalVisible}
            mode={modalMode}
            onSubmit={handleModalSubmit}
            onCancel={handleModalCancel}
            loading={submitLoading}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'flex min-h-full flex-col bg-white p-[24px]',
        styles['ontology-scene-list']
      )}
    >
      {/* 头部流程 */}
      <ExpandableProcessFlow
        title="本体场景库"
        description="将离散的底层数据映射为可视、可管、可执行的业务对象,构建面向AI时代的语义基础设施"
        toggleText="收起"
        defaultExpanded={true}
        steps={processSteps as any}
      />

      {/* 搜索和创建区域 */}
      <div className="flex items-center justify-between gap-4 rounded-lg bg-white py-[16px]">
        <Input.Search
          placeholder="请输入名称或描述"
          onClear={handleClear}
          onSearch={handleSearch}
          allowClear
          style={{
            width: 200
          }}
        />
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={handleCreate}
          className="rounded"
        >
          创建本体场景
        </Button>
      </div>

      {loading ? (
        <div className="flex h-full w-full flex-1 items-center justify-center">
          <Spin />
        </div>
      ) : sceneList.length > 0 ? (
        <div className="grid grid-cols-2 gap-[20px] [@media(min-width:1440px)]:grid-cols-3 [@media(min-width:1920px)]:grid-cols-4">
          {sceneList.map((item) => (
            <SceneCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-full w-full flex-1 items-center justify-center">
          <NoResultCard title="暂无搜索结果" />
        </div>
      )}

      {/* 分页 */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-end py-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            sizeOptions={[20, 40, 60, 80]}
            onChange={(page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            }}
            showTotal
            showJumper
          />
        </div>
      )}

      {/* 创建/编辑弹窗 */}
      {modalVisible && (
        <SceneModal
          visible={modalVisible}
          mode={modalMode}
          initialValues={
            editingScene
              ? {
                  name: editingScene.name || '',
                  description: editingScene.description || '',
                  icon: editingScene.icon || ''
                }
              : undefined
          }
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
          loading={submitLoading}
          existingSceneIcons={sceneList
            .map((scene) => scene.icon)
            .filter((icon): icon is string => !!icon)}
        />
      )}
    </div>
  );
}
