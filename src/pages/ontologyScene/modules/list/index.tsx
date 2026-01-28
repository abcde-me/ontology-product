import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Input,
  Select,
  Message,
  Modal,
  Pagination,
  Popover
} from '@arco-design/web-react';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconDelete,
  IconEye,
  IconThumbUp,
  IconImage
} from '@arco-design/web-react/icon';
import {
  ExpandableProcessFlow,
  EllipsisPopover,
  ProcessStep
} from '@ceai-front/arco-material';
import { Link } from '@arco-design/web-react';
import initialBg from '../../assets/initial-bg.png';
import ObjectTypeCreateIcon from '../../assets/object-type-create.svg';
import LinkCreateIcon from '../../assets/link-create.svg';
import BehaviorCreateIcon from '../../assets/behavior-create.svg';
import TestCreateIcon from '../../assets/test-create.svg';
import { ONTOLOGY_SCENE_MENU_ITEM_KEYS } from '@/common/constants';

// 扩展 ProcessStep 类型，使 description 支持 ReactNode
interface SceneProcessStep extends Omit<ProcessStep, 'description'> {
  description: React.ReactNode;
}

// 场景卡片数据接口
export interface SceneCardItem {
  id: string;
  name: string;
  uniqueId: string;
  description: string;
  updateTime: string;
  viewCount: number;
  editCount: number;
  likeCount: number;
  imageCount: number;
  icon?: React.ReactNode;
}

// 模拟数据
const MOCK_SCENE_DATA: SceneCardItem[] = [
  {
    id: '1',
    name: '海上态势感知OODA闭环演示',
    uniqueId: 'maritime-ooda-demo',
    description: '用于演示从环境研判、装备调度到目标识别的全链路作战场景。',
    updateTime: '2026-01-01',
    viewCount: 12,
    editCount: 12,
    likeCount: 12,
    imageCount: 12
  },
  {
    id: '2',
    name: '海上态势感知OODA闭环演示',
    uniqueId: 'maritime-ooda-demo-2',
    description: '用于演示从环境研判、装备调度到目标识别的全链路作战场景。',
    updateTime: '2026-01-01',
    viewCount: 12,
    editCount: 12,
    likeCount: 12,
    imageCount: 12
  },
  {
    id: '3',
    name: '海上态势感知OODA闭环演示',
    uniqueId: 'maritime-ooda-demo-3',
    description: '用于演示从环境研判、装备调度到目标识别的全链路作战场景。',
    updateTime: '2026-01-01',
    viewCount: 12,
    editCount: 12,
    likeCount: 12,
    imageCount: 12
  }
];

// 场景卡片组件
interface SceneCardProps {
  item: SceneCardItem;
  onEdit?: (item: SceneCardItem) => void;
  onDelete?: (item: SceneCardItem) => void;
  onCardClick?: (item: SceneCardItem) => void;
  onIconClick?: (
    item: SceneCardItem,
    iconType: ValueOf<typeof ONTOLOGY_SCENE_MENU_ITEM_KEYS>
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
      iconType: ValueOf<typeof ONTOLOGY_SCENE_MENU_ITEM_KEYS>
    ) => {
      e.stopPropagation();
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${item.id}/${iconType}`
      );
    },
    [item, onIconClick]
  );

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
        <div className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center bg-[#DCDCDC]"></div>
        <div className="flex flex-1 flex-col">
          <div className="mb-[4px] mt-[6px] flex flex-1 justify-between text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
            <EllipsisPopover className="hover-blue" value={item.name} />

            <div className="flex items-center gap-[8px]">
              <IconEdit
                className="h-4 w-4 cursor-pointer text-[#4e5969] transition-colors hover:text-[#165dff]"
                onClick={handleEdit}
              />
              <IconDelete
                className="h-4 w-4 cursor-pointer text-[#4e5969] transition-colors hover:text-[#165dff]"
                onClick={handleDelete}
              />
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
            <span>{item.viewCount}</span>
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
            <span>{item.editCount}</span>
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
            <span>{item.likeCount}</span>
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
            <span>{item.imageCount}</span>
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default function OntologySceneList() {
  const history = useHistory();
  const [searchValue, setSearchValue] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [sceneList, setSceneList] = useState<SceneCardItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: 替换为实际API调用
    setSceneList(MOCK_SCENE_DATA);
  }, []);

  // 处理创建场景
  const handleCreate = () => {
    // TODO: 跳转到创建场景页面
    history.push('/tenant/compute/modaforge/ontologyScene/detail/create');
  };

  // 处理编辑场景
  const handleEdit = (item: SceneCardItem) => {
    // TODO: 打开编辑弹窗或跳转到编辑页面
    Message.info(`编辑场景: ${item.name}`);
  };

  // 处理删除场景
  const handleDelete = (item: SceneCardItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除场景"${item.name}"吗？`,
      onOk: () => {
        setSceneList(sceneList.filter((scene) => scene.id !== item.id));
        Message.success('删除成功');
      }
    });
  };

  // 处理卡片点击
  const handleCardClick = (item: SceneCardItem) => {
    history.push(`/tenant/compute/modaforge/ontologyScene/detail/${item.id}`);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    // TODO: 实现搜索逻辑
  };

  // 过滤后的场景列表
  const filteredSceneList = sceneList.filter((scene) => {
    if (searchValue) {
      return (
        scene.name.includes(searchValue) || scene.uniqueId.includes(searchValue)
      );
    }
    return true;
  });

  // 分页数据
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedList = filteredSceneList.slice(startIndex, endIndex);

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

  // 无数据时显示初始背景图
  if (filteredSceneList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <img
          src={initialBg}
          alt="initialBg"
          className="cursor-pointer"
          onClick={() => {
            history.push('/tenant/compute/modaforge/ontologyScene/detail/1');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-white p-[24px]">
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
        <Input.Group compact>
          <Select
            value={filterValue}
            onChange={setFilterValue}
            style={{
              width: 100,
              borderRight: '1px solid #E2E8F0'
            }}
          >
            <Select.Option value="all">全部</Select.Option>
            {/* TODO: 添加更多筛选选项 */}
          </Select>
          <Input.Search
            placeholder="请输入名称或唯一标识"
            value={searchValue}
            onChange={handleSearch}
            onSearch={handleSearch}
            allowClear
            style={{
              width: 300,
              marginLeft: '-1px'
            }}
          />
        </Input.Group>
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={handleCreate}
          className="rounded"
        >
          创建本体场景
        </Button>
      </div>

      {/* 场景卡片网格 */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(384px,1fr))] gap-[20px]">
        {paginatedList.map((item) => (
          <SceneCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {/* 分页 */}
      {filteredSceneList.length > pageSize && (
        <div className="flex justify-end py-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredSceneList.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showTotal
            showJumper
          />
        </div>
      )}
    </div>
  );
}
