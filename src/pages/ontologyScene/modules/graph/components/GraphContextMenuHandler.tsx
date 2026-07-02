import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Message } from '@arco-design/web-react';
import { useStoreApi } from 'reactflow';
import { useGraphCreate } from '../context/GraphCreateContext';
import { useGraphDeleteActions } from '../hooks/useGraphDeleteActions';
import { resolveLinkTypeIdFromEdge } from '../utils/resolveLinkTypeId';
import { resolveObjectTypePickFromNodeElement } from '../utils/resolveObjectTypePickFromNode';
import graphStyles from '../index.module.scss';
import styles from './GraphContextMenu.module.scss';

type GraphContextMenuState =
  | {
      x: number;
      y: number;
      type: 'pane';
    }
  | {
      x: number;
      y: number;
      type: 'node';
      pick: { id: number; name: string; code: string };
      isSelected: boolean;
    }
  | {
      x: number;
      y: number;
      type: 'edge';
      pick: { id: number; name: string };
      isSelected: boolean;
    };

const getFlowElement = () =>
  document.querySelector(`.${graphStyles['ai-workflow']} .react-flow`);

const isWorkflowNodeSelected = (nodeEl: Element) => {
  const el = nodeEl.closest('.react-flow__node') ?? nodeEl;
  return el.classList.contains('selected');
};

const isWorkflowEdgeSelected = (edgeEl: Element) => {
  const el = edgeEl.closest('.react-flow__edge') ?? edgeEl;
  return el.classList.contains('selected');
};

export default function GraphContextMenuHandler() {
  const store = useStoreApi();
  const {
    canCreate,
    canDeleteNode,
    topologyData,
    resolveObjectTypePick,
    openCreateObjectType,
    openCreateLinkFromSource,
    buildPickFromWorkflowEdge
  } = useGraphCreate();
  const { confirmDeleteNodes, confirmDeleteLinks } = useGraphDeleteActions();
  const [menu, setMenu] = useState<GraphContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = useCallback(() => {
    setMenu(null);
  }, []);

  const resolvePickFromNodeElement = useCallback(
    (nodeEl: Element) =>
      resolveObjectTypePickFromNodeElement(
        nodeEl,
        topologyData,
        resolveObjectTypePick
      ),
    [resolveObjectTypePick, topologyData]
  );

  const resolvePickFromEdgeElement = useCallback(
    (edgeEl: Element) => {
      const edgeId = edgeEl.getAttribute('data-id');
      if (!edgeId) {
        return null;
      }

      const edge = store.getState().edges.find((item) => item.id === edgeId);
      if (edge) {
        return buildPickFromWorkflowEdge(edge);
      }

      const linkId = resolveLinkTypeIdFromEdge(undefined, edgeId);
      if (linkId == null) {
        return null;
      }

      return {
        id: linkId,
        name: String(linkId)
      };
    },
    [buildPickFromWorkflowEdge, store]
  );

  useEffect(() => {
    let flowEl: Element | null = null;
    let frameId = 0;
    let cancelled = false;

    const handleContextMenu = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as HTMLElement | null;
      if (!target?.closest(`.${graphStyles['ai-workflow']}`)) {
        return;
      }

      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();

      const edgeEl = target.closest('.react-flow__edge');
      if (edgeEl) {
        const pick = resolvePickFromEdgeElement(edgeEl);
        if (!pick) {
          return;
        }

        setMenu({
          x: mouseEvent.clientX,
          y: mouseEvent.clientY,
          type: 'edge',
          pick,
          isSelected: isWorkflowEdgeSelected(edgeEl)
        });
        return;
      }

      const nodeEl = target.closest('.react-flow__node');
      if (nodeEl) {
        const pick = resolvePickFromNodeElement(nodeEl);
        if (!pick) {
          return;
        }

        setMenu({
          x: mouseEvent.clientX,
          y: mouseEvent.clientY,
          type: 'node',
          pick,
          isSelected: isWorkflowNodeSelected(nodeEl)
        });
        return;
      }

      if (target.closest('.react-flow__pane')) {
        setMenu({
          x: mouseEvent.clientX,
          y: mouseEvent.clientY,
          type: 'pane'
        });
      }
    };

    const attach = () => {
      if (cancelled) {
        return;
      }

      flowEl = getFlowElement();
      if (!flowEl) {
        frameId = window.requestAnimationFrame(attach);
        return;
      }

      flowEl.addEventListener('contextmenu', handleContextMenu, true);
    };

    attach();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      flowEl?.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [resolvePickFromEdgeElement, resolvePickFromNodeElement]);

  useEffect(() => {
    if (!menu) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as HTMLElement)) {
        return;
      }
      closeMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    const handleScroll = () => closeMenu();

    window.addEventListener('mousedown', handlePointerDown, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [closeMenu, menu]);

  if (!menu) {
    return null;
  }

  const handleCreateObjectType = () => {
    if (!canCreate) {
      Message.warning('暂无创建权限');
      closeMenu();
      return;
    }
    openCreateObjectType();
    closeMenu();
  };

  const handleCreateLink = () => {
    if (!canCreate) {
      Message.warning('暂无创建权限');
      closeMenu();
      return;
    }

    if (menu.type !== 'node') {
      return;
    }

    if (!menu.isSelected) {
      Message.info('请先点击选中该对象类型节点');
      closeMenu();
      return;
    }

    openCreateLinkFromSource(menu.pick);
    closeMenu();
  };

  const handleDelete = () => {
    if (!canDeleteNode) {
      Message.warning('暂无删除权限');
      closeMenu();
      return;
    }

    if (menu.type === 'node') {
      if (!menu.isSelected) {
        Message.info('请先点击选中该对象类型节点');
        closeMenu();
        return;
      }
      confirmDeleteNodes([menu.pick]);
      closeMenu();
      return;
    }

    if (menu.type === 'edge') {
      if (!menu.isSelected) {
        Message.info('请先点击选中该链接');
        closeMenu();
        return;
      }
      confirmDeleteLinks([menu.pick]);
      closeMenu();
    }
  };

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ left: menu.x, top: menu.y }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {menu.type === 'pane' ? (
        <button
          type="button"
          className={styles.menuItem}
          disabled={!canCreate}
          onClick={handleCreateObjectType}
        >
          新建对象类型
        </button>
      ) : null}
      {menu.type === 'node' ? (
        <>
          <button
            type="button"
            className={styles.menuItem}
            disabled={!canCreate || !menu.isSelected}
            onClick={handleCreateLink}
          >
            新建链接
          </button>
          <button
            type="button"
            className={styles.menuItem}
            disabled={!canDeleteNode || !menu.isSelected}
            onClick={handleDelete}
          >
            删除
          </button>
        </>
      ) : null}
      {menu.type === 'edge' ? (
        <button
          type="button"
          className={styles.menuItem}
          disabled={!canDeleteNode || !menu.isSelected}
          onClick={handleDelete}
        >
          删除
        </button>
      ) : null}
    </div>
  );
}
