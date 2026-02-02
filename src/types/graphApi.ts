/**
 * ontologymetadataservicev1.GetOntologyTopologyResponse
 */
export interface GetOntologyTopologyResponse {
  /**
   * 边列表
   */
  edges?: Ontologymetadataservicev1TopologyEdge[];
  /**
   * 节点列表
   */
  nodes?: Ontologymetadataservicev1TopologyNode[];
}

/**
 * ontologymetadataservicev1.TopologyEdge
 */
export interface Ontologymetadataservicev1TopologyEdge {
  /**
   * 边代码
   */
  code?: string;
  /**
   * 边描述
   */
  description?: string;
  /**
   * 边ID
   */
  id?: number;
  /**
   * 边名称
   */
  name?: string;
  /**
   * 源节点ID
   */
  sourceId?: number;
  /**
   * 目标节点ID
   */
  targetId?: number;
  /**
   * 边类型
   */
  type?: number;
}

/**
 * ontologymetadataservicev1.TopologyNode
 */
export interface Ontologymetadataservicev1TopologyNode {
  /**
   * 节点代码
   */
  code?: string;
  /**
   * 节点描述
   */
  description?: string;
  /**
   * 节点ID
   */
  id?: number;
  /**
   * 节点名称
   */
  name?: string;
  /**
   * 节点类型
   */
  type?: string;
}
