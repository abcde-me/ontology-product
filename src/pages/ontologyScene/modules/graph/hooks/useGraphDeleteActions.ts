import { useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { useStoreApi } from 'reactflow';
import { deleteOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { deleteOntologyLinkType } from '@/api/ontologySceneLibrary/links';
import { deleteRelatedLinkTypesForObjectTypes } from '@/api/ontologySceneLibrary/deleteObjectTypeRelatedLinks';
import { OntoModal } from '@/pages/ontologyScene/components';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import {
  GraphLinkPick,
  GraphObjectTypePick,
  useGraphCreate
} from '../context/GraphCreateContext';
import { useDemoStore } from '../common/store';

export function useGraphDeleteActions() {
  const store = useStoreApi();
  const {
    sceneId,
    canDeleteNode,
    activeObjectType,
    setActiveObjectType,
    activeLink,
    setActiveLink,
    onGraphChanged,
    buildPickFromWorkflowNode,
    buildPickFromWorkflowEdge
  } = useGraphCreate();
  const setShowCustomEdgePanel = useDemoStore((s) => s.setShowCustomEdgePanel);
  const setSelectedEdgeId = useDemoStore((s) => s.setSelectedEdgeId);
  const deletingRef = useRef(false);
  const activeObjectTypeRef = useRef(activeObjectType);
  const activeLinkRef = useRef(activeLink);

  activeObjectTypeRef.current = activeObjectType;
  activeLinkRef.current = activeLink;

  const clearLinkSelection = useCallback(() => {
    setActiveLink(null);
    setShowCustomEdgePanel(false);
    setSelectedEdgeId(null);
  }, [setActiveLink, setSelectedEdgeId, setShowCustomEdgePanel]);

  const getDeleteNodeTargets = useCallback(() => {
    const targets = new Map<number, GraphObjectTypePick>();

    const addTarget = (pick: GraphObjectTypePick | null | undefined) => {
      if (pick) {
        targets.set(pick.id, pick);
      }
    };

    addTarget(activeObjectTypeRef.current);

    store
      .getState()
      .getNodes()
      .filter((node) => node.selected || node.data?.selected)
      .forEach((node) => {
        addTarget(buildPickFromWorkflowNode(node));
      });

    return Array.from(targets.values());
  }, [buildPickFromWorkflowNode, store]);

  const getDeleteLinkTargets = useCallback(() => {
    const targets = new Map<number, GraphLinkPick>();

    const addTarget = (pick: GraphLinkPick | null | undefined) => {
      if (pick) {
        targets.set(pick.id, pick);
      }
    };

    addTarget(activeLinkRef.current);

    store
      .getState()
      .edges.filter((edge) => edge.selected || edge.data?.selected)
      .forEach((edge) => {
        addTarget(buildPickFromWorkflowEdge(edge));
      });

    return Array.from(targets.values());
  }, [buildPickFromWorkflowEdge, store]);

  const deleteObjectTypes = useCallback(
    async (
      picks: GraphObjectTypePick[],
      options?: { skipRelatedLinkDeletion?: boolean }
    ) => {
      if (!picks.length) {
        return true;
      }

      if (!options?.skipRelatedLinkDeletion) {
        await deleteRelatedLinkTypesForObjectTypes(
          picks.map((pick) => pick.id),
          sceneId
        );
      }

      for (const pick of picks) {
        const response = await deleteOntologyObjectType({
          id: pick.id,
          ontologyModelID: sceneId,
          skipRelatedLinkDeletion: true
        });

        if (!isOntologyApiSuccess(response)) {
          Message.error(response.message || '删除失败');
          return false;
        }

        if (activeObjectTypeRef.current?.id === pick.id) {
          setActiveObjectType(null);
        }
      }

      return true;
    },
    [sceneId, setActiveObjectType]
  );

  const deleteLink = useCallback(
    async (pick: GraphLinkPick) => {
      const response = await deleteOntologyLinkType({ id: pick.id });

      if (isOntologyApiSuccess(response)) {
        if (activeLinkRef.current?.id === pick.id) {
          clearLinkSelection();
        }
        return true;
      }

      Message.error(response.message || '删除失败');
      return false;
    },
    [clearLinkSelection]
  );

  const confirmDeleteNodes = useCallback(
    (selected: GraphObjectTypePick[]) => {
      if (selected.length === 0 || deletingRef.current) {
        return;
      }

      if (!canDeleteNode) {
        Message.warning('暂无删除权限');
        return;
      }

      const target = selected[0];
      const content =
        selected.length === 1
          ? `确认删除对象类型「${target.name}」吗？与其相关的链接将一并删除，且不可恢复。`
          : `确认删除选中的 ${selected.length} 个对象类型吗？与其相关的链接将一并删除，且不可恢复。`;

      OntoModal.confirm({
        title: '确认删除对象类型吗？',
        content,
        onOk: async () => {
          deletingRef.current = true;
          try {
            const success = await deleteObjectTypes(selected);
            if (!success) {
              return;
            }

            Message.success('删除成功');
            clearLinkSelection();
            onGraphChanged?.(['objectType', 'link']);
          } catch (error) {
            console.error(error);
            Message.error('删除失败');
          } finally {
            deletingRef.current = false;
          }
        }
      });
    },
    [canDeleteNode, clearLinkSelection, deleteObjectTypes, onGraphChanged]
  );

  const confirmDeleteLinks = useCallback(
    (selected: GraphLinkPick[]) => {
      if (selected.length === 0 || deletingRef.current) {
        return;
      }

      if (!canDeleteNode) {
        Message.warning('暂无删除权限');
        return;
      }

      const target = selected[0];
      const content =
        selected.length === 1
          ? `确认删除链接「${target.name}」吗？删除后不可恢复。`
          : `确认删除选中的 ${selected.length} 条链接吗？删除后不可恢复。`;

      OntoModal.confirm({
        title: '确认删除链接吗？',
        content,
        onOk: async () => {
          deletingRef.current = true;
          try {
            for (const pick of selected) {
              const success = await deleteLink(pick);
              if (!success) {
                return;
              }
            }

            Message.success('删除成功');
            onGraphChanged?.(['link']);
          } catch (error) {
            console.error(error);
            Message.error('删除失败');
          } finally {
            deletingRef.current = false;
          }
        }
      });
    },
    [canDeleteNode, deleteLink, onGraphChanged]
  );

  const confirmDeleteSelection = useCallback(() => {
    const nodeTargets = getDeleteNodeTargets();
    const linkTargets = getDeleteLinkTargets();

    if (nodeTargets.length === 0 && linkTargets.length === 0) {
      return;
    }

    if (nodeTargets.length > 0 && linkTargets.length > 0) {
      OntoModal.confirm({
        title: '确认删除选中项吗？',
        content: `确认删除选中的 ${nodeTargets.length} 个对象类型和 ${linkTargets.length} 条链接吗？对象类型相关的其余链接也将一并删除，且不可恢复。`,
        onOk: async () => {
          if (!canDeleteNode) {
            Message.warning('暂无删除权限');
            return;
          }

          deletingRef.current = true;
          try {
            const success = await deleteObjectTypes(nodeTargets);
            if (!success) {
              return;
            }

            for (const pick of linkTargets) {
              const success = await deleteLink(pick);
              if (!success) {
                return;
              }
            }

            Message.success('删除成功');
            setActiveObjectType(null);
            clearLinkSelection();
            onGraphChanged?.(['objectType', 'link']);
          } catch (error) {
            console.error(error);
            Message.error('删除失败');
          } finally {
            deletingRef.current = false;
          }
        }
      });
      return;
    }

    if (nodeTargets.length > 0) {
      confirmDeleteNodes(nodeTargets);
      return;
    }

    confirmDeleteLinks(linkTargets);
  }, [
    canDeleteNode,
    clearLinkSelection,
    confirmDeleteLinks,
    confirmDeleteNodes,
    deleteLink,
    deleteObjectTypes,
    getDeleteLinkTargets,
    getDeleteNodeTargets,
    onGraphChanged,
    setActiveObjectType
  ]);

  return {
    canDeleteNode,
    confirmDeleteSelection,
    confirmDeleteNodes,
    confirmDeleteLinks,
    getDeleteNodeTargets,
    getDeleteLinkTargets
  };
}
