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
  IconEye,
  IconThumbUp,
  IconImage
} from '@arco-design/web-react/icon';
import {
  ExpandableProcessFlow,
  EllipsisPopover,
  ProcessStep,
  NoDataCard,
  NoResultCard
} from '@ceai-front/arco-material';
import { Link } from '@arco-design/web-react';
import initialBg from '../../assets/initial-bg.png';
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
    const IconComponent = matchedIcon?.icon ?? ICON_OPTIONS[0].icon;
    return <IconComponent />;
  };

  return (
    <div
      className={`relative flex h-full cursor-pointer flex-col gap-[12px] rounded-lg border border-[#EBEEF5] bg-white p-4 transition-all duration-200 ${
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
        <div className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center">
          {getIconComponent(item.icon ?? '')}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-[4px] mt-[6px] flex min-w-0 flex-1 justify-between text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
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
          {/* 更新日期 */}
          <div className="text-[14px] leading-[22px] text-[var(--color-text-4)]">
            更新于 {item.updateTime}
          </div>
        </div>
      </div>

      {/* 描述说明 */}
      <div className="flex-1">
        <EllipsisPopover
          value={item.description}
          preferTypography
          ellipsis={{
            rows: 2,
            cssEllipsis: true
          }}
          wrapperClassName="[&_.arco-typography]:text-sm [&_.arco-typography]:text-[#4e5969] [&_.arco-typography]:leading-[22px] [&_.arco-typography]:m-0"
        />
      </div>

      {/* 底部图标和数字 */}
      <div className="flex items-center justify-between">
        <Popover content="对象类型">
          <div
            className="flex cursor-pointer items-center gap-1 text-[14px] text-[var(--color-text-1)] transition-colors hover:text-[rgba(var(--primary-6))] [&:hover]:cursor-pointer"
            onClick={(e) =>
              handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE)
            }
          >
            <IconEye className="h-4 w-4" />
            <span>{item.ontologyObjectTypeCounts || 0}</span>
          </div>
        </Popover>

        <Popover content="链接">
          <div
            className="flex cursor-pointer items-center gap-1 text-[14px] text-[var(--color-text-1)] transition-colors hover:text-[rgba(var(--primary-6))]"
            onClick={(e) =>
              handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS)
            }
          >
            <IconEdit className="h-4 w-4" />
            <span>{item.ontologyLinkTypeCounts || 0}</span>
          </div>
        </Popover>
        <Popover content="行为">
          <div
            className="flex cursor-pointer items-center gap-1 text-[14px] text-[var(--color-text-1)] transition-colors hover:text-[rgba(var(--primary-6))]"
            onClick={(e) =>
              handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS)
            }
          >
            <IconThumbUp className="h-4 w-4" />
            <span>{item.ontologyActionCounts || 0}</span>
          </div>
        </Popover>
        <Popover content="函数">
          <div
            className="flex cursor-pointer items-center gap-1 text-[14px] text-[var(--color-text-1)] transition-colors hover:text-[rgba(var(--primary-6))]"
            onClick={(e) =>
              handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS)
            }
          >
            <IconImage className="h-4 w-4" />
            <span>{item.ontologyFunctionCounts || 0}</span>
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default function OntologySceneList() {
  const history = useHistory();
  const [filter, setFilter] = useState('');
  const [sceneList, setSceneList] = useState<SceneCardItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9999);
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
  const handleInitialBgClick = async () => {
    if (createInitialLoading) return;

    setCreateInitialLoading(true);
    try {
      const response = await createOntologyModel({
        name: '新建本体场景',
        description: '',
        icon: ICON_OPTIONS[0]?.value || 'ontology-scene-1',
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
    } catch (error) {
      Message.error('创建失败');
      console.error('创建场景失败:', error);
    } finally {
      setCreateInitialLoading(false);
    }
  };

  // 只在第一次进入页面请求接口并且返回数据是空的时候展示无数据背景图
  if (noData && sceneList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        {createInitialLoading ? (
          <Spin />
        ) : (
          <img
            src={initialBg}
            alt="initialBg"
            className="cursor-pointer"
            onClick={handleInitialBgClick}
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(384px,1fr))] gap-[20px]">
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
      {/* {totalCount > pageSize && (
        <div className="flex justify-end py-4 items-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            onChange={handlePageChange}
            showTotal
            showJumper
          />
        </div>
      )} */}

      {/* 创建/编辑弹窗 */}
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
    </div>
  );
}
