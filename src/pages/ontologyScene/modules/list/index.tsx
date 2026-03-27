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
import { IconPlus, IconDelete } from '@arco-design/web-react/icon';
import {
  ExpandableProcessFlow,
  ProcessStep,
  NoDataCard,
  NoResultCard,
  GlobalTooltip
} from '@ceai-front/arco-material';
import ObjectSmallIcon from '../../assets/object-small.svg';
import LinkSmallIcon from '../../assets/link-small.svg';
import BehaviorSmallIcon from '../../assets/behavior-small.svg';
import FunctionSmallIcon from '../../assets/function-small.svg';
import ObjectTypeCreateIcon from '../../assets/object-type-create.png';
import LinkCreateIcon from '../../assets/link-create.png';
import BehaviorCreateIcon from '../../assets/behavior-create.png';
import TestCreateIcon from '../../assets/test-create.png';
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
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/store/userInfoStore';
import { EllipsisPopover } from '@/pages/ontologyScene/componens';

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

  const hasDetailPermission = useHasPermission(ONTOLOGY_PERMISSIONS.GET);

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
        `/tenant/compute/onto/ontologyScene/detail/${item.id || ''}/${iconType}`
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
      className="relative flex h-full cursor-pointer flex-col gap-[12px] rounded-lg border border-[#EBEEF5] p-[24px] transition-all duration-200"
      style={{
        backgroundColor:
          isHovered && hasDetailPermission ? '#F8FAFD' : '#FFFFFF',
        boxShadow:
          isHovered && hasDetailPermission
            ? '0 6px 16px 0 rgba(100, 108, 133, 0.12)'
            : '0px 5px 8px 0px #646C850A'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={hasDetailPermission ? handleCardClick : undefined}
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

            {isHovered && (
              <div className="ml-[16px] flex items-center gap-[8px]">
                {/* <Popover content="编辑">
                  <IconEdit
                    className="h-4 w-4 cursor-pointer text-[#4e5969] transition-colors hover:text-[#165dff]"
                    onClick={handleEdit}
                  />
                </Popover> */}
                <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.DELETE}>
                  <Popover content="删除">
                    <IconDelete
                      className="h-4 w-4 cursor-pointer text-[#4e5969] transition-colors hover:text-[#165dff]"
                      onClick={handleDelete}
                    />
                  </Popover>
                </PermissionWrapper>
              </div>
            )}
          </div>

          {/* 描述说明 */}
          <div className="flex-1 text-[14px] leading-[22px] text-[var(--color-text-5)]">
            {item.description ? (
              <EllipsisPopover preferTypography value={item.description} />
            ) : (
              '-'
            )}
          </div>
        </div>
      </div>

      {/* 底部图标和数字 */}
      <div className="flex items-center justify-between gap-[8px]">
        <div
          className="group flex flex-1 cursor-pointer flex-col gap-[3px] rounded-[4px] border border-[var(--color-border-2)] p-[8px] text-[14px] text-[var(--color-text-1)] [&:hover]:cursor-pointer [&:hover]:border-[rgba(var(--primary-6))]"
          onClick={(e) =>
            handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE)
          }
        >
          <ObjectSmallIcon className="h-[16px] w-[16px] text-[var(--color-text-4)] group-hover:text-[#184FF2]" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] leading-[18px] text-[var(--color-text-3)]">
              对象
            </span>
            <span className="font-DINAlternate text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
              {item.ontologyObjectTypeCounts || 0}
            </span>
          </div>
        </div>

        <div
          className="group flex flex-1 cursor-pointer flex-col gap-[3px] rounded-[4px] border border-[var(--color-border-2)] p-[8px] text-[14px] text-[var(--color-text-1)] transition-colors [&:hover]:border-[rgba(var(--primary-6))]"
          onClick={(e) =>
            handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS)
          }
        >
          <LinkSmallIcon className="h-[16px] w-[16px] text-[var(--color-text-4)] group-hover:text-[#184FF2]" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] leading-[18px] text-[var(--color-text-3)]">
              链接
            </span>
            <span className="font-DINAlternate text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
              {item.ontologyLinkTypeCounts || 0}
            </span>
          </div>
        </div>

        <div
          className="group flex flex-1 cursor-pointer flex-col gap-[3px] rounded-[4px] border border-[var(--color-border-2)] p-[8px] text-[14px] text-[var(--color-text-1)] transition-colors [&:hover]:border-[rgba(var(--primary-6))]"
          onClick={(e) =>
            handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS)
          }
        >
          <BehaviorSmallIcon className="h-[16px] w-[16px] text-[var(--color-text-4)] group-hover:text-[#184FF2]" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] leading-[18px] text-[var(--color-text-3)]">
              行为
            </span>
            <span className="font-DINAlternate text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
              {item.ontologyActionCounts || 0}
            </span>
          </div>
        </div>

        <div
          className="group flex flex-1 cursor-pointer flex-col gap-[3px] rounded-[4px] border border-[var(--color-border-2)] p-[8px] text-[14px] text-[var(--color-text-1)] transition-colors [&:hover]:border-[rgba(var(--primary-6))]"
          onClick={(e) =>
            handleIconClick(e, ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS)
          }
        >
          <FunctionSmallIcon className="h-[16px] w-[16px] text-[var(--color-text-4)] group-hover:text-[#184FF2]" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] leading-[18px] text-[var(--color-text-3)]">
              函数
            </span>
            <span className="font-DINAlternate text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
              {item.ontologyFunctionCounts || 0}
            </span>
          </div>
        </div>
      </div>
      {/* 更新日期 */}
      <div className="flex items-center">
        {item.updateUser && (
          <GlobalTooltip.Ellipsis
            className="min-w-0 max-w-[200px] text-[14px] leading-[22px] text-[var(--color-text-4)]"
            text={item.updateUser}
          />
        )}
        <span className="text-[14px] leading-[22px] text-[var(--color-text-4)]">
          更新于{dayjs(item.updateTime).format('YYYY-MM-DD')}
        </span>
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
  const [totalCount, setTotalCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingScene, setEditingScene] = useState<SceneCardItem | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 加载场景列表
  const loadSceneList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listOntologyModel({
        pageNo: currentPage,
        pageSize: pageSize,
        filter: filter ?? '',
        orderBy: 'create_time',
        order: 'desc'
      });

      if (response.status === 200 && response.code === '') {
        const result = response.data?.result || [];
        setSceneList(result);
        setTotalCount(response.data?.totalCount || 0);
      } else {
        Message.error(response.message || '加载失败');
      }
    } catch (error) {
      console.error('加载场景列表失败:', error);
      Message.error('加载场景列表失败');
    } finally {
      setLoading(false);
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
            `/tenant/compute/onto/ontologyScene/detail/${response.data.id}`
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
      title: '确定删除此本体场景吗？',
      content: `请谨慎操作，删除该数据将删除对象、链接、行为、函数等所有数据，且不可恢复。`,
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
    history.push(`/tenant/compute/onto/ontologyScene/detail/${item.id || ''}`);
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

  // 流程步骤配置
  const processSteps: SceneProcessStep[] = [
    {
      icon: <img src={ObjectTypeCreateIcon} />,
      title: '定义对象',
      description: (
        <>
          <span>将现实业务中的人员、设备等要素，转化为标准的数字模型</span>
        </>
      )
    },
    {
      icon: <img src={LinkCreateIcon} />,
      title: '建立链接',
      description: (
        <>
          <span>配置对象之间的逻辑关联，将数据节点连接成清晰的业务关系网</span>
        </>
      )
    },
    {
      icon: <img src={BehaviorCreateIcon} />,
      title: '配置行为',
      description: (
        <>
          <span>
            定义对象的业务指令与动作，让静态的数字模型具备执行任务的能力
          </span>
        </>
      )
    },
    {
      icon: <img src={TestCreateIcon} />,
      title: '仿真模拟',
      description: (
        <>
          <span>引入规则模拟运行，验证业务流程的自动化判断与决策效果</span>
        </>
      )
    }
  ];

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
        toggleText="操作引导"
        defaultExpanded={true}
        steps={processSteps as any}
      />

      {/* 搜索和创建区域 */}
      <div className="flex items-center justify-between gap-4 rounded-lg bg-white pb-[20px] pt-[24px]">
        <Input.Search
          placeholder="请输入名称或描述"
          onClear={handleClear}
          onSearch={handleSearch}
          allowClear
          style={{
            width: 200
          }}
        />
        <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.CREATE}>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={handleCreate}
            className="rounded"
          >
            创建本体场景
          </Button>
        </PermissionWrapper>
      </div>

      {loading ? (
        <div className="flex h-full w-full flex-1 items-center justify-center">
          <Spin />
        </div>
      ) : sceneList.length > 0 ? (
        <div className="grid grid-cols-4 gap-[16px] [@media(max-width:1440px)]:grid-cols-2 [@media(min-width:1440px)]:grid-cols-3 [@media(min-width:1920px)]:grid-cols-4">
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
          {filter ? <NoResultCard title="暂无搜索结果" /> : <NoDataCard />}
        </div>
      )}

      {/* 分页 */}
      {totalCount > 20 && (
        <div className="flex items-center justify-end py-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            sizeCanChange
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
