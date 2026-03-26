import React, { useMemo, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  MarkerType,
  Node,
  Edge,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Popover } from '@arco-design/web-react';
import { OBJECT_TYPE_ICON_OPTIONS } from '../../common/constants';
import GraphEmptyIcon from '@/pages/ontologyScene/assets/graph-empty.svg';
import GraphLinkIcon from '@/pages/ontologyScene/assets/graph-link-icon.svg';
import MenuObjectTypeIcon from '@/pages/ontologyScene/assets/menu-object.svg';
import MenuBehaviorIcon from '@/pages/ontologyScene/assets/menu-behavior.svg';
import MenuLinkIcon from '@/pages/ontologyScene/assets/menu-link.svg';
import styles from './index.module.scss';

const NODE_WIDTH = 244;
const NODE_HEIGHT = 54;
const LINK_HEIGHT = 42;
const MENU_WIDTH = 200;

type TooltipType = 'objectType' | 'behavior' | 'link';

const GraphEmptyTooltipContent = ({
  OSId,
  history,
  type
}: {
  OSId: string;
  history: ReturnType<typeof useHistory>;
  type: TooltipType;
}) => {
  const isObjectType = type === 'objectType';
  const isBehavior = type === 'behavior';
  const isLink = type === 'link';

  const getTitle = () => {
    if (isObjectType) return '对象类型';
    if (isBehavior) return '行为';
    if (isLink) return '链接';
    return '';
  };

  const getDescription = () => {
    if (isObjectType)
      return '核心数据模型的原子单位, 描述系统中可独立存在的实体。';
    if (isBehavior)
      return '行为定义可在对象上执行的操作,封装业务逻辑与状态流转。';
    if (isLink) return '描述不同实体对象之间的语义联系与数据拓扑结构。';
    return '';
  };

  const getRoute = () => {
    if (isObjectType)
      return `/tenant/compute/onto/ontologyScene/detail/${OSId}/objectType/create`;
    if (isBehavior)
      return `/tenant/compute/onto/ontologyScene/detail/${OSId}/behaviorActions/create/_NEW_`;
    if (isLink)
      return `/tenant/compute/onto/ontologyScene/detail/${OSId}/links/create`;
    return '';
  };

  const getIcon = () => {
    if (isObjectType)
      return <MenuObjectTypeIcon className="h-[20px] w-[20px]" />;
    if (isBehavior) return <MenuBehaviorIcon className="h-[20px] w-[20px]" />;
    if (isLink) return <MenuLinkIcon className="h-[20px] w-[20px]" />;
    return null;
  };

  return (
    <div className="w-[280px]">
      <div className="mb-[4px] flex items-center gap-[4px] text-[16px] font-[600] text-[var(--color-text-2)]">
        {getIcon()}
        <span>{getTitle()}</span>
      </div>
      <div className="mb-[16px] text-[14px] leading-[22px] text-[var(--color-text-4)]">
        {getDescription()}
      </div>
      <Button
        type="primary"
        onClick={() => {
          if (OSId) {
            history.push(getRoute());
          }
        }}
      >
        去创建
      </Button>
    </div>
  );
};

// 对象节点组件
const ObjectNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const [activePopover, setActivePopover] = useState<
    'objectType' | 'behavior' | null
  >(null);
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();

  const iconItem =
    OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === data.icon) ||
    OBJECT_TYPE_ICON_OPTIONS[0];
  const IconComponent = iconItem?.icon;

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-[8px] rounded-[4px] bg-[#fff] px-[14px] py-[11px] shadow-sm transition-shadow hover:shadow-md">
        <Popover
          content={
            <GraphEmptyTooltipContent
              OSId={OSId}
              history={history}
              type="objectType"
            />
          }
          position="top"
          trigger="hover"
          popupVisible={activePopover === 'objectType'}
          onVisibleChange={(visible) => {
            setActivePopover(visible ? 'objectType' : null);
          }}
        >
          <div className="flex flex-1 items-center gap-[8px]">
            <IconComponent className="h-[26px] w-[26px] flex-shrink-0" />
            <span className="text-[14px] font-[600] text-[var(--color-text-2)]">
              对象示意
            </span>
          </div>
        </Popover>
        <Popover
          content={
            <GraphEmptyTooltipContent
              OSId={OSId}
              history={history}
              type="behavior"
            />
          }
          position="top"
          trigger="hover"
          popupVisible={activePopover === 'behavior'}
          onVisibleChange={(visible) => {
            setActivePopover(visible ? 'behavior' : null);
          }}
        >
          <div className="ml-auto">
            <GraphEmptyIcon className="h-[32px] w-[32px] flex-shrink-0 cursor-pointer" />
          </div>
        </Popover>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

// 链接节点组件
const LinkNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();

  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <Popover
        content={
          <GraphEmptyTooltipContent OSId={OSId} history={history} type="link" />
        }
        position="top"
        trigger="hover"
      >
        <div className="flex items-center gap-[8px] rounded-[4px] bg-[#fff] px-[14px] py-[7px] shadow-sm">
          <GraphLinkIcon className="h-[26px] w-[26px] flex-shrink-0" />
          <span className="text-[14px] font-[600] text-[var(--color-text-2)]">
            链接示意
          </span>
        </div>
      </Popover>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

// 节点类型映射
const nodeTypes = {
  object: ObjectNode,
  link: LinkNode
};

export default function EmptyStateGraph() {
  // 计算节点位置
  const centerX = useMemo(() => {
    if (typeof window !== 'undefined') {
      return (window.innerWidth - MENU_WIDTH) / 2;
    }
    return (1920 - MENU_WIDTH) / 2;
  }, []);

  const centerY = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight / 2;
    }
    return 540;
  }, []);

  // 创建节点数据
  const nodes: Node[] = useMemo(
    () => [
      {
        id: 'empty-object-left',
        type: 'object',
        position: { x: centerX - 400, y: centerY - NODE_HEIGHT / 2 },
        data: { icon: 'object-type-1' }
      },
      {
        id: 'empty-link-top',
        type: 'link',
        position: { x: centerX - 100, y: centerY - 120 - LINK_HEIGHT / 2 },
        data: {}
      },
      {
        id: 'empty-link-bottom',
        type: 'link',
        position: { x: centerX - 100, y: centerY + 120 - LINK_HEIGHT / 2 },
        data: {}
      },
      {
        id: 'empty-object-top-right',
        type: 'object',
        position: { x: centerX + 200, y: centerY - 120 - NODE_HEIGHT / 2 },
        data: { icon: 'object-type-1' }
      },
      {
        id: 'empty-object-bottom-right',
        type: 'object',
        position: { x: centerX + 200, y: centerY + 120 - NODE_HEIGHT / 2 },
        data: { icon: 'object-type-1' }
      }
    ],
    [centerX, centerY]
  );

  // 创建边数据
  const edges: Edge[] = useMemo(
    () => [
      {
        id: 'empty-edge-1',
        source: 'empty-object-left',
        target: 'empty-link-top',
        type: 'default',
        style: {
          stroke: '#C3C7D4',
          strokeWidth: 1,
          strokeDasharray: '4 4'
        }
      },
      {
        id: 'empty-edge-2',
        source: 'empty-object-left',
        target: 'empty-link-bottom',
        type: 'default',
        style: {
          stroke: '#C3C7D4',
          strokeWidth: 1,
          strokeDasharray: '4 4'
        }
      },
      {
        id: 'empty-edge-3',
        source: 'empty-link-top',
        target: 'empty-object-top-right',
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: '#C3C7D4'
        },
        style: {
          stroke: '#C3C7D4',
          strokeWidth: 1,
          strokeDasharray: '4 4'
        }
      },
      {
        id: 'empty-edge-4',
        source: 'empty-link-bottom',
        target: 'empty-object-bottom-right',
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: '#C3C7D4'
        },
        style: {
          stroke: '#C3C7D4',
          strokeWidth: 1,
          strokeDasharray: '4 4'
        }
      }
    ],
    []
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          className={styles['edge-style']}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background color="#A7BEE54D" gap={14} size={2} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
