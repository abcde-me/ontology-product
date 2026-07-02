import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import type { Edge, Node } from 'reactflow';
import CreateLinkOnGraphModal from '../components/CreateLinkOnGraphModal';
import CreateObjectTypeOnGraphModal from '../components/CreateObjectTypeOnGraphModal';
import type { GetOntologyTopologyResponse } from '@/types/graphApi';
import {
  notifyOntologySceneDataChanged,
  type OntologySceneMutationType
} from '@/pages/ontologyScene/services/ontologySceneDataSync';
import { resolveLinkIdentityFromEdge } from '../utils/resolveLinkTypeId';

export interface GraphObjectTypePick {
  id: number;
  name: string;
  code: string;
}

export interface GraphLinkPick {
  id?: number;
  code?: string;
  name: string;
}

interface GraphCreateContextValue {
  sceneId: number;
  topologyData?: GetOntologyTopologyResponse | null;
  activeObjectType: GraphObjectTypePick | null;
  setActiveObjectType: React.Dispatch<
    React.SetStateAction<GraphObjectTypePick | null>
  >;
  activeLink: GraphLinkPick | null;
  setActiveLink: React.Dispatch<React.SetStateAction<GraphLinkPick | null>>;
  canCreate: boolean;
  canDeleteNode: boolean;
  onGraphChanged?: (mutationTypes?: OntologySceneMutationType[]) => void;
  resolveObjectTypePick: (objectTypeId: number) => GraphObjectTypePick | null;
  buildPickFromWorkflowNode: (node: Node) => GraphObjectTypePick | null;
  buildPickFromWorkflowEdge: (edge: Edge) => GraphLinkPick | null;
  openCreateObjectType: () => void;
  openCreateLinkFromSource: (source: GraphObjectTypePick) => void;
}

const GraphCreateContext = createContext<GraphCreateContextValue | null>(null);

export const useGraphCreate = () => {
  const context = useContext(GraphCreateContext);
  if (!context) {
    throw new Error('useGraphCreate must be used within GraphCreateProvider');
  }
  return context;
};

export const useOptionalGraphCreate = () => useContext(GraphCreateContext);

interface GraphCreateProviderProps {
  sceneId: number;
  canCreate: boolean;
  canDeleteNode: boolean;
  topologyData?: GetOntologyTopologyResponse | null;
  onCreated?: () => void;
  children: React.ReactNode;
}

const buildObjectTypePickMap = (
  topologyData?: GetOntologyTopologyResponse | null
) => {
  const map = new Map<number, GraphObjectTypePick>();

  topologyData?.nodes?.forEach((node) => {
    if (node.id == null) {
      return;
    }

    map.set(node.id, {
      id: node.id,
      name: node.name || node.code || String(node.id),
      code: node.code || ''
    });
  });

  return map;
};

const buildLinkPickMap = (
  topologyData?: GetOntologyTopologyResponse | null
) => {
  const map = new Map<string, GraphLinkPick>();

  topologyData?.edges?.forEach((edge) => {
    const linkIdentity = resolveLinkIdentityFromEdge(
      { id: edge.id, linkTypeId: edge.id, code: edge.code },
      edge.id != null ? String(edge.id) : undefined
    );
    if (linkIdentity == null) {
      return;
    }

    const pick: GraphLinkPick = {
      name: edge.name || String(linkIdentity),
      ...(typeof linkIdentity === 'number'
        ? { id: linkIdentity }
        : { code: linkIdentity })
    };

    map.set(String(linkIdentity), pick);
    if (edge.code?.trim()) {
      map.set(edge.code.trim(), pick);
    }
  });

  return map;
};

export function GraphCreateProvider({
  sceneId,
  canCreate,
  canDeleteNode,
  topologyData,
  onCreated,
  children
}: GraphCreateProviderProps) {
  const [activeObjectType, setActiveObjectType] =
    useState<GraphObjectTypePick | null>(null);
  const [activeLink, setActiveLink] = useState<GraphLinkPick | null>(null);
  const [objectTypeModalVisible, setObjectTypeModalVisible] = useState(false);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkSource, setLinkSource] = useState<GraphObjectTypePick | null>(
    null
  );

  const openCreateObjectType = useCallback(() => {
    if (!canCreate) {
      return;
    }
    setObjectTypeModalVisible(true);
  }, [canCreate]);

  const openCreateLinkFromSource = useCallback(
    (source: GraphObjectTypePick) => {
      if (!canCreate) {
        return;
      }
      setLinkSource(source);
      setLinkModalVisible(true);
    },
    [canCreate]
  );

  const handleCloseObjectTypeModal = useCallback(() => {
    setObjectTypeModalVisible(false);
  }, []);

  const handleCloseLinkModal = useCallback(() => {
    setLinkModalVisible(false);
    setLinkSource(null);
  }, []);

  const handleCreated = useCallback(() => {
    setObjectTypeModalVisible(false);
    setLinkModalVisible(false);
    setLinkSource(null);
    notifyOntologySceneDataChanged(sceneId, ['objectType', 'link']);
    onCreated?.();
  }, [onCreated, sceneId]);

  const handleGraphChanged = useCallback(
    (mutationTypes: OntologySceneMutationType[] = ['objectType', 'link']) => {
      notifyOntologySceneDataChanged(sceneId, mutationTypes);
      onCreated?.();
    },
    [onCreated, sceneId]
  );

  const objectTypePickMap = useMemo(
    () => buildObjectTypePickMap(topologyData),
    [topologyData]
  );

  const linkPickMap = useMemo(
    () => buildLinkPickMap(topologyData),
    [topologyData]
  );

  const resolveObjectTypePick = useCallback(
    (objectTypeId: number) => objectTypePickMap.get(objectTypeId) ?? null,
    [objectTypePickMap]
  );

  const buildPickFromWorkflowNode = useCallback(
    (node: Node) => {
      const numericId = Number(node.id);
      if (Number.isFinite(numericId) && numericId > 0) {
        const fromTopology = resolveObjectTypePick(numericId);
        if (fromTopology) {
          return fromTopology;
        }

        const data = node.data as { title?: string; code?: string };
        return {
          id: numericId,
          name: data.title || data.code || String(numericId),
          code: data.code || ''
        };
      }

      const data = node.data as { title?: string; code?: string };
      const topologyNode = topologyData?.nodes?.find(
        (item) =>
          String(item.code ?? '') === String(data.code ?? node.id) ||
          String(item.code ?? '') === String(node.id)
      );

      if (topologyNode?.id != null) {
        return {
          id: topologyNode.id,
          name:
            topologyNode.name ||
            topologyNode.code ||
            data.title ||
            String(topologyNode.id),
          code: topologyNode.code || data.code || ''
        };
      }

      return null;
    },
    [resolveObjectTypePick, topologyData?.nodes]
  );

  const buildPickFromWorkflowEdge = useCallback(
    (edge: Edge) => {
      const linkIdentity = resolveLinkIdentityFromEdge(
        edge.data as { id?: unknown; linkTypeId?: unknown; code?: unknown },
        edge.id
      );
      if (linkIdentity == null) {
        return null;
      }

      const fromTopology = linkPickMap.get(String(linkIdentity));
      if (fromTopology) {
        return fromTopology;
      }

      const data = edge.data as { name?: string; code?: string } | undefined;
      return {
        name: data?.name || String(linkIdentity),
        ...(typeof linkIdentity === 'number'
          ? { id: linkIdentity }
          : { code: linkIdentity })
      };
    },
    [linkPickMap]
  );

  const value = useMemo(
    () => ({
      sceneId,
      topologyData,
      activeObjectType,
      setActiveObjectType,
      activeLink,
      setActiveLink,
      canCreate,
      canDeleteNode,
      onGraphChanged: handleGraphChanged,
      resolveObjectTypePick,
      buildPickFromWorkflowNode,
      buildPickFromWorkflowEdge,
      openCreateObjectType,
      openCreateLinkFromSource
    }),
    [
      activeLink,
      activeObjectType,
      buildPickFromWorkflowEdge,
      buildPickFromWorkflowNode,
      canCreate,
      canDeleteNode,
      handleGraphChanged,
      openCreateLinkFromSource,
      openCreateObjectType,
      resolveObjectTypePick,
      sceneId,
      topologyData
    ]
  );

  return (
    <GraphCreateContext.Provider value={value}>
      {children}
      <CreateObjectTypeOnGraphModal
        visible={objectTypeModalVisible}
        sceneId={sceneId}
        onClose={handleCloseObjectTypeModal}
        onSuccess={handleCreated}
      />
      <CreateLinkOnGraphModal
        visible={linkModalVisible}
        sceneId={sceneId}
        onClose={handleCloseLinkModal}
        onSuccess={handleCreated}
        presetSource={linkSource}
      />
    </GraphCreateContext.Provider>
  );
}

/** @deprecated 使用 useGraphCreate */
export const useGraphLinkPick = useGraphCreate;

/** @deprecated 使用 GraphCreateProvider */
export const GraphLinkPickProvider = GraphCreateProvider;
