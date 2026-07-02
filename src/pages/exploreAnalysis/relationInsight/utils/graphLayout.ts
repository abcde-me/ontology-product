import dagre from '@dagrejs/dagre';
import type {
  GraphLayoutKey,
  RelationGraphEdge,
  RelationGraphNode
} from '../types';

const NODE_SIZE = 64;
const FOCUS_SIZE = 88;
const FOCUS_NODE_GAP = 120;

const getNodeRadius = (node: RelationGraphNode) =>
  node.data?.isFocus ? FOCUS_SIZE / 2 : NODE_SIZE / 2;

const getFocusNodes = (nodes: RelationGraphNode[]) =>
  nodes.filter((node) => node.data?.isFocus);

const spreadFocusNodesOnCircle = (
  focusNodes: RelationGraphNode[],
  gap = FOCUS_NODE_GAP
): Map<string, { x: number; y: number }> => {
  const positions = new Map<string, { x: number; y: number }>();

  if (focusNodes.length === 0) {
    return positions;
  }

  if (focusNodes.length === 1) {
    positions.set(focusNodes[0].id, { x: 0, y: 0 });
    return positions;
  }

  const radius = Math.max(gap * 1.5, (focusNodes.length * gap) / (2 * Math.PI));

  focusNodes.forEach((node, index) => {
    const angle = (index / focusNodes.length) * Math.PI * 2 - Math.PI / 2;
    positions.set(node.id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  });

  return positions;
};

const withCenterPosition = (
  node: RelationGraphNode,
  centerX: number,
  centerY: number
): RelationGraphNode => {
  const radius = getNodeRadius(node);
  return {
    ...node,
    position: { x: centerX - radius, y: centerY - radius }
  };
};

const buildAdjacency = (
  nodes: RelationGraphNode[],
  edges: RelationGraphEdge[]
) => {
  const adjacency = new Map<string, Set<string>>();
  nodes.forEach((node) => adjacency.set(node.id, new Set()));

  edges.forEach((edge) => {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  });

  return adjacency;
};

const buildBfsLayers = (
  focusIds: string[],
  nodes: RelationGraphNode[],
  edges: RelationGraphEdge[]
): Map<number, RelationGraphNode[]> => {
  const adjacency = buildAdjacency(nodes, edges);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const depths = new Map<string, number>();
  const queue: string[] = [];

  focusIds.forEach((focusId) => {
    if (nodeMap.has(focusId)) {
      depths.set(focusId, 0);
      queue.push(focusId);
    }
  });

  if (queue.length === 0 && nodes[0]) {
    depths.set(nodes[0].id, 0);
    queue.push(nodes[0].id);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDepth = depths.get(current) ?? 0;

    adjacency.get(current)?.forEach((neighborId) => {
      if (!depths.has(neighborId) && nodeMap.has(neighborId)) {
        depths.set(neighborId, currentDepth + 1);
        queue.push(neighborId);
      }
    });
  }

  nodes.forEach((node) => {
    if (!depths.has(node.id)) {
      depths.set(node.id, 1);
    }
  });

  const layers = new Map<number, RelationGraphNode[]>();
  nodes.forEach((node) => {
    const depth = depths.get(node.id) ?? 0;
    const list = layers.get(depth) ?? [];
    list.push(node);
    layers.set(depth, list);
  });

  return layers;
};

const layoutForce = (
  nodes: RelationGraphNode[],
  edges: RelationGraphEdge[]
): RelationGraphNode[] => {
  if (nodes.length <= 1) {
    return nodes.map((node) => withCenterPosition(node, 0, 0));
  }

  interface SimNode {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    isFocus: boolean;
    mass: number;
    anchorX: number;
    anchorY: number;
  }

  const focusNodes = getFocusNodes(nodes);
  const focusPositions = spreadFocusNodesOnCircle(focusNodes);
  const pinSingleFocus = focusNodes.length === 1;
  const simNodes = new Map<string, SimNode>();
  const nonFocusNodes = nodes.filter((node) => !node.data?.isFocus);

  nodes.forEach((node, index) => {
    const isFocus = Boolean(node.data?.isFocus);
    const spread = focusPositions.get(node.id);

    if (isFocus && spread) {
      simNodes.set(node.id, {
        id: node.id,
        x: spread.x,
        y: spread.y,
        vx: 0,
        vy: 0,
        isFocus: true,
        mass: 4,
        anchorX: spread.x,
        anchorY: spread.y
      });
      return;
    }

    const angle = (index / Math.max(nonFocusNodes.length, 1)) * Math.PI * 2;
    const radius = 220 + Math.random() * 40;

    simNodes.set(node.id, {
      id: node.id,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      isFocus: false,
      mass: 1,
      anchorX: 0,
      anchorY: 0
    });
  });

  const iterations = 180;
  const repulsion = 12000;
  const attraction = 0.028;
  const idealLength = 200;
  const focusAnchorStrength = 0.015;

  for (let step = 0; step < iterations; step += 1) {
    simNodes.forEach((nodeA) => {
      simNodes.forEach((nodeB) => {
        if (nodeA.id === nodeB.id) {
          return;
        }

        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        nodeA.vx += fx / nodeA.mass;
        nodeA.vy += fy / nodeA.mass;
        nodeB.vx -= fx / nodeB.mass;
        nodeB.vy -= fy / nodeB.mass;
      });
    });

    edges.forEach((edge) => {
      const source = simNodes.get(edge.source);
      const target = simNodes.get(edge.target);
      if (!source || !target) {
        return;
      }

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const displacement = distance - idealLength;
      const force = attraction * displacement;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    });

    const cooling = 0.88 - (step / iterations) * 0.2;
    simNodes.forEach((node) => {
      if (node.isFocus) {
        if (pinSingleFocus) {
          node.x = 0;
          node.y = 0;
          node.vx = 0;
          node.vy = 0;
          return;
        }

        node.vx += (node.anchorX - node.x) * focusAnchorStrength;
        node.vy += (node.anchorY - node.y) * focusAnchorStrength;
      }

      node.vx *= cooling;
      node.vy *= cooling;
      node.x += node.vx;
      node.y += node.vy;
    });
  }

  return nodes.map((node) => {
    const sim = simNodes.get(node.id);
    return withCenterPosition(node, sim?.x ?? 0, sim?.y ?? 0);
  });
};

const layoutHierarchical = (
  nodes: RelationGraphNode[],
  edges: RelationGraphEdge[]
): RelationGraphNode[] => {
  if (edges.length === 0 && getFocusNodes(nodes).length > 1) {
    return layoutGrid(nodes);
  }

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 90, ranksep: 140 });

  nodes.forEach((node) => {
    const size = getNodeRadius(node) * 2;
    g.setNode(node.id, { width: size, height: size });
  });

  edges.forEach((edge) => {
    if (edge.source && edge.target) {
      g.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const nodeWithPos = g.node(node.id);
    if (!nodeWithPos) {
      return withCenterPosition(node, 0, 0);
    }

    return withCenterPosition(node, nodeWithPos.x, nodeWithPos.y);
  });
};

const layoutCircular = (nodes: RelationGraphNode[]): RelationGraphNode[] => {
  const focusNodes = getFocusNodes(nodes);
  const others = nodes.filter((node) => !node.data?.isFocus);
  const focusPositions = spreadFocusNodesOnCircle(focusNodes);
  const outerRadius = Math.max(220, 80 + others.length * 22);

  return nodes.map((node) => {
    const focusPosition = focusPositions.get(node.id);
    if (focusPosition) {
      return withCenterPosition(node, focusPosition.x, focusPosition.y);
    }

    const index = others.findIndex((item) => item.id === node.id);
    const angle =
      (index / Math.max(others.length, 1)) * Math.PI * 2 - Math.PI / 2;

    return withCenterPosition(
      node,
      Math.cos(angle) * outerRadius,
      Math.sin(angle) * outerRadius
    );
  });
};

const layoutGrid = (nodes: RelationGraphNode[]): RelationGraphNode[] => {
  const focusNodes = getFocusNodes(nodes);
  const others = nodes.filter((node) => !node.data?.isFocus);
  const ordered = [...focusNodes, ...others];
  const cols = Math.ceil(Math.sqrt(ordered.length));
  const gap = Math.max(130, FOCUS_NODE_GAP);
  const totalWidth = (cols - 1) * gap;
  const rows = Math.ceil(ordered.length / cols);
  const totalHeight = (rows - 1) * gap;

  return ordered.map((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const centerX = col * gap - totalWidth / 2;
    const centerY = row * gap - totalHeight / 2;
    return withCenterPosition(node, centerX, centerY);
  });
};

const layoutLayerNodes = (
  layerNodes: RelationGraphNode[],
  depth: number,
  layerGap: number,
  nodeGap: number,
  sortedDepths: number[]
) => {
  const layerSize = layerNodes.length;

  if (depth === 0 && layerNodes.every((node) => node.data?.isFocus)) {
    const focusPositions = spreadFocusNodesOnCircle(layerNodes, nodeGap);
    return layerNodes.map((node) => {
      const position = focusPositions.get(node.id) ?? { x: 0, y: 0 };
      return withCenterPosition(node, position.x, position.y);
    });
  }

  const centerX = depth * layerGap - ((sortedDepths.length - 1) * layerGap) / 2;

  return layerNodes.map((node, indexInLayer) => {
    const centerY = (indexInLayer - (layerSize - 1) / 2) * nodeGap;
    return withCenterPosition(node, centerX, centerY);
  });
};

const layoutNeural = (
  nodes: RelationGraphNode[],
  edges: RelationGraphEdge[]
): RelationGraphNode[] => {
  const focusNodes = getFocusNodes(nodes);
  const focusIds = focusNodes.map((node) => node.id);
  const layers = buildBfsLayers(focusIds, nodes, edges);
  const sortedDepths = Array.from(layers.keys()).sort((a, b) => a - b);
  const layerGap = 220;
  const nodeGap = 110;
  const positionMap = new Map<string, RelationGraphNode>();

  sortedDepths.forEach((depth) => {
    const layerNodes = layers.get(depth) ?? [];
    layoutLayerNodes(
      layerNodes,
      depth,
      layerGap,
      nodeGap,
      sortedDepths
    ).forEach((node) => {
      positionMap.set(node.id, node);
    });
  });

  return nodes.map(
    (node) => positionMap.get(node.id) ?? withCenterPosition(node, 0, 0)
  );
};

const layoutRadiation = (
  nodes: RelationGraphNode[],
  edges: RelationGraphEdge[]
): RelationGraphNode[] => {
  const focusNodes = getFocusNodes(nodes);
  const focusIds = focusNodes.map((node) => node.id);
  const focusPositions = spreadFocusNodesOnCircle(focusNodes);
  const layers = buildBfsLayers(focusIds, nodes, edges);
  const sortedDepths = Array.from(layers.keys()).sort((a, b) => a - b);

  return nodes.map((node) => {
    const focusPosition = focusPositions.get(node.id);
    if (focusPosition) {
      return withCenterPosition(node, focusPosition.x, focusPosition.y);
    }

    let depth = 1;
    let indexInLayer = 0;
    let layerSize = 1;

    sortedDepths.forEach((layerDepth) => {
      if (layerDepth === 0) {
        return;
      }
      const layerNodes = layers.get(layerDepth) ?? [];
      const foundIndex = layerNodes.findIndex((item) => item.id === node.id);
      if (foundIndex >= 0) {
        depth = layerDepth;
        indexInLayer = foundIndex;
        layerSize = layerNodes.length;
      }
    });

    const radius = 120 + depth * 130;
    const angle =
      (indexInLayer / Math.max(layerSize, 1)) * Math.PI * 2 - Math.PI / 2;

    return withCenterPosition(
      node,
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
  });
};

export const layoutRelationGraph = (
  nodes: RelationGraphNode[],
  edges: RelationGraphEdge[],
  layout: GraphLayoutKey
): RelationGraphNode[] => {
  if (nodes.length === 0) {
    return nodes;
  }

  switch (layout) {
    case 'force':
      return layoutForce(nodes, edges);
    case 'hierarchical':
      return layoutHierarchical(nodes, edges);
    case 'circular':
      return layoutCircular(nodes);
    case 'grid':
      return layoutGrid(nodes);
    case 'neural':
      return layoutNeural(nodes, edges);
    case 'radiation':
      return layoutRadiation(nodes, edges);
    default:
      return layoutForce(nodes, edges);
  }
};
