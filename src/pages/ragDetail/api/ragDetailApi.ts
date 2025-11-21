/**
 * RAG Detail API
 *
 * 使用真实的Mock数据进行渲染测试
 */

import type {
  RagDetailData,
  Segment,
  DirectoryNode,
  ApiSegment,
  ApiCatalogNode,
  PDFCoordinate,
  PositionBBox,
  ApiPosition,
  ApiSegmentDetail,
  SegmentDetailData,
  Element,
  TextElement,
  ImageElement,
  TableElement,
  FormulaElement,
  EnhancementInfo
} from '../types';
import { SegmentData } from '../utils/segmentData';
import { LogData } from '../utils/logData';
import { SegDetailData } from '../utils/segDetailData';
import {
  ListKnowledgeDocumentCatalogs,
  ListKnowledgeChunks,
  UpdateKnowledgeChunk,
  GetKnowledgeChunkTraceLog,
  GetKnowledgeChunk
} from '@/api/modules/rag';

/**
 * 将新的后端 positions 数组转换为前端的 PDFCoordinate 数组
 */
function transformApiPositions(positions: ApiPosition[]): PDFCoordinate[] {
  return positions.map((pos) => ({
    page: pos.page_id + 1, // 后端0-based,前端1-based
    x1: pos.bbox[0],
    y1: pos.bbox[1],
    x2: pos.bbox[2],
    y2: pos.bbox[3]
  }));
}

/**
 * 将旧的后端 position_bbox 转换为前端的 PDFCoordinate 数组（保留以兼容旧数据）
 */
function transformPositionBBox(positionBbox: PositionBBox): PDFCoordinate[] {
  const coordinates: PDFCoordinate[] = [];

  for (const [pageStr, bbox] of Object.entries(positionBbox)) {
    const page = parseInt(pageStr, 10) + 1; // 后端0-based,前端1-based
    const [x1, y1, x2, y2] = bbox;
    coordinates.push({ page, x1, y1, x2, y2 });
  }

  return coordinates;
}

/**
 * 将新的后端 ApiSegment 转换为前端的 Segment
 */
function transformSegment(apiSegment: ApiSegment): Segment {
  const baseSegment: Segment = {
    id: apiSegment.id,
    content: apiSegment.content,
    charCount: apiSegment.char_count,
    segmentIndex: apiSegment.chunk_index,
    pdfCoordinates: transformApiPositions(apiSegment.positions),
    parentTitle: apiSegment.parent_title || undefined,
    parentTitleId: apiSegment.parent_title_id || undefined,
    type: apiSegment.type,
    enabled: apiSegment.enabled,
    source: apiSegment.source,
    isEdit: apiSegment.is_edit
  };

  return baseSegment;
}

/**
 * 将旧的后端 ApiSegmentOld 转换为前端的 Segment（保留以兼容旧数据）
 */
function transformSegmentOld(apiSegment: any): Segment {
  const baseSegment: any = {
    id: apiSegment.id,
    content: apiSegment.content,
    charCount: apiSegment.word_count,
    segmentIndex: apiSegment.position,
    createdAt: apiSegment.created_at,
    updatedAt: apiSegment.updated_at,
    pdfCoordinates: transformPositionBBox(apiSegment.position_bbox),
    parentTitle: apiSegment.title || undefined,
    fullTitle: apiSegment.full_title || undefined,
    level: apiSegment.level
  };

  // 如果是PPT分段，添加PPT特有字段
  if (apiSegment.slideNumber !== undefined) {
    baseSegment.slideNumber = apiSegment.slideNumber;
    baseSegment.slideTitle = apiSegment.slideTitle;
    baseSegment.slideContent = apiSegment.slideContent;
  }

  // 如果是表格分段，添加表格特有字段
  if (apiSegment.tableData !== undefined) {
    baseSegment.tableData = apiSegment.tableData;
  }

  return baseSegment;
}

/**
 * 将新的后端 ApiCatalogNode 转换为前端的 DirectoryNode
 */
function transformCatalogNode(apiNode: ApiCatalogNode): DirectoryNode {
  const node: DirectoryNode = {
    id: apiNode.chunk_id,
    label: apiNode.content,
    level: apiNode.level,
    type: apiNode.type,
    position: transformApiPositions(apiNode.positions),
    children: []
  };

  // 根据 type 设置 segmentIds
  if (apiNode.type === 'text') {
    // type 为 text 时，chunk_id 就是分段的 id
    node.segmentIds = [apiNode.chunk_id];
  } else if (apiNode.type === 'title') {
    // type 为 title 时，需要找到所有子节点中 type 为 text 的 chunk_id
    // 这里先不设置，后面递归处理完 children 后再收集
    node.segmentIds = [];
  }

  // 递归转换 children
  if (apiNode.children && apiNode.children.length > 0) {
    node.children = apiNode.children.map(transformCatalogNode);

    // 如果是 title 类型，收集所有子节点的 segmentIds
    if (apiNode.type === 'title') {
      const collectSegmentIds = (nodes: DirectoryNode[]): string[] => {
        const ids: string[] = [];
        nodes.forEach((child) => {
          if (child.segmentIds) {
            ids.push(...child.segmentIds);
          }
          if (child.children && child.children.length > 0) {
            ids.push(...collectSegmentIds(child.children));
          }
        });
        return ids;
      };
      node.segmentIds = collectSegmentIds(node.children);
    }
  }

  return node;
}

/**
 * 将旧的后端 ApiCatalogNodeOld 转换为前端的 DirectoryNode（保留以兼容旧数据）
 */
function transformCatalogNodeOld(apiNode: any): DirectoryNode {
  const node: DirectoryNode = {
    id: apiNode.title_id,
    label: apiNode.title,
    level: apiNode.level,
    type: 'title', // 旧数据默认为 title 类型
    segmentIds: apiNode.segment_ids || undefined,
    children: []
  };

  // 转换position
  if (apiNode.position) {
    const positions: PDFCoordinate[] = [];
    for (const [pageStr, posStr] of Object.entries(apiNode.position)) {
      const page = parseInt(pageStr, 10) + 1; // 后端0-based,前端1-based
      // posStr格式: "[73,109,481,137]"
      if (typeof posStr === 'string') {
        const coords = JSON.parse(posStr) as number[];
        if (coords.length === 4) {
          const [x1, y1, x2, y2] = coords;
          positions.push({ page, x1, y1, x2, y2 });
        }
      }
    }
    if (positions.length > 0) {
      node.position = positions;
    }
  }

  // 处理short_texts，将它们添加为children（参考实现）
  if (apiNode.short_texts && apiNode.short_texts.length > 0) {
    apiNode.short_texts.forEach((text: string, index: number) => {
      const segmentId = Object.keys(apiNode.short_text_positions)[index];
      const posStr: any =
        Object.values(apiNode.short_text_positions)[index] || '{}';

      // 解析short text的position
      let position: PDFCoordinate[] | undefined;
      try {
        const posObj = JSON.parse(posStr);
        position = [];
        for (const [pageStr, bbox] of Object.entries(posObj)) {
          const page = parseInt(pageStr, 10) + 1;
          const [x1, y1, x2, y2] = bbox as number[];
          position.push({ page, x1, y1, x2, y2 });
        }
      } catch (e) {
        console.error('Failed to parse short_text position:', e);
      }

      const shortNode: DirectoryNode = {
        id: segmentId,
        label: text,
        level: apiNode.level + 1,
        type: 'text', // short text 为 text 类型
        isShort: true, // 标记为short text节点
        position,
        segmentIds: [segmentId],
        children: []
      };

      // 添加到children的开头（像参考实现中的unshift）
      node.children!.unshift(shortNode);
    });
  }

  // 递归转换children
  if (apiNode.children && apiNode.children.length > 0) {
    const transformedChildren = apiNode.children.map(transformCatalogNodeOld);
    node.children = [...node.children!, ...transformedChildren];
  }

  return node;
}

/**
 * 获取分块列表数据
 * @param datasetId - 数据集ID
 * @param documentId - 文档ID
 * @returns 分块列表数据
 */
export async function fetchSegments(
  datasetId: string,
  documentId: string
): Promise<Segment[]> {
  try {
    const response = await ListKnowledgeChunks({
      datasetId,
      documentId
    });

    // 检查响应格式
    if (response && response.data && response.data) {
      const segments = (response.data as ApiSegment[]).map(transformSegment);
      return segments;
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch segments:', error);
    return [];
  }
}

/**
 * 获取目录树数据
 * @param datasetId - 数据集ID
 * @param documentId - 文档ID
 * @returns 目录树数据
 */
export async function fetchCatalog(
  datasetId: string,
  documentId: string
): Promise<DirectoryNode[] | undefined> {
  try {
    const response = await ListKnowledgeDocumentCatalogs({
      datasetId,
      documentId
    });
    console.log(response, 'response2222');

    // 检查响应格式
    if (response && response.data && response.data.catalogs) {
      const rootNode = transformCatalogNode(response.data.catalogs);
      return [rootNode];
    }

    return undefined;
  } catch (error) {
    console.error('Failed to fetch catalog:', error);
    return undefined;
  }
}

/**
 * 获取RAG详情数据
 * @param datasetId - 数据集ID
 * @param documentId - 文档ID
 * @returns RAG详情数据
 */
export async function fetchRagDetail(
  datasetId: string,
  documentId: string
): Promise<RagDetailData> {
  // 调用接口获取分段数据
  const segments = await fetchSegments(datasetId, documentId);

  // 调用接口获取目录树数据
  const directory = await fetchCatalog(datasetId, documentId);

  // sceneType 默认为 pdf，实际会在 store 中根据 documentFormat 进行映射
  const sceneType: 'pdf' | 'ppt' | 'excel' = 'pdf';

  // 默认值（这些值会在 store 中被 getKnowledgeDocument 接口返回的真实数据覆盖）
  const fileName = '';
  const filePath = '';
  const bucket = 'datasource-dev';
  const path = '/10/10/orginal/用户权限.pdf';

  const result: RagDetailData = {
    ragId: documentId, // 使用 documentId 作为 ragId
    fileName,
    filePath,
    sceneType,
    segments,
    directory,
    bucket,
    path
  };

  return result;
}

/**
 * 更新分段内容
 * @param datasetId - 数据集ID
 * @param documentId - 文档ID
 * @param chunkId - 分块ID
 * @param content - 新的内容
 * @returns Promise<void> - 更新成功后不返回数据，调用方应该重新获取分段列表
 */
export async function updateSegmentContent(
  datasetId: string,
  documentId: string,
  chunkId: string,
  content: string
): Promise<void> {
  try {
    console.log('📤 调用更新分段接口:', {
      datasetId,
      documentId,
      chunkId,
      content
    });

    const response = await UpdateKnowledgeChunk({
      dataset_id: datasetId,
      document_id: documentId,
      chunk_id: chunkId,
      content
    });

    console.log('✅ 更新分段接口调用成功:', response);

    // 更新成功，不返回数据
    // 调用方应该重新调用 fetchSegments 来获取最新的分段列表
  } catch (error) {
    console.error('❌ 更新分段内容失败:', error);
    throw error;
  }
}

/**
 * 获取分段详情
 * @param _ragId - RAG ID (未使用)
 * @param segmentId - 分段ID
 * @returns 分段详情
 */
export async function fetchSegmentDetail(
  _ragId: string,
  segmentId: string
): Promise<Segment> {
  // TODO: 替换为真实API调用
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const segmentResponse = SegmentData;
      const apiSegment = segmentResponse.data.data.find(
        (s: any) => s.id === segmentId
      );
      if (apiSegment) {
        // 使用旧的转换函数，因为 SegmentData 是旧格式
        resolve(transformSegmentOld(apiSegment));
      } else {
        reject(new Error('Segment not found'));
      }
    }, 300);
  });
}

/**
 * 获取溯源日志
 * @param datasetId - 数据集ID
 * @param chunkId - 分块ID
 * @returns 溯源日志数据
 */
export async function fetchSegmentTraceLog(
  datasetId: string,
  chunkId: string
): Promise<any> {
  try {
    // 调用真实API
    const response = await GetKnowledgeChunkTraceLog({
      dataset_id: datasetId,
      chunk_id: chunkId
    });

    // 检查响应格式
    if (response && response.data) {
      return response.data;
    }

    // 如果响应格式不符合预期，返回 mock 数据
    return LogData.data;
  } catch (error) {
    console.error('Failed to fetch segment trace log:', error);
    // 降级处理：返回 mock 数据
    return LogData.data;
  }
}

/**
 * 删除分段
 * @param ragId - RAG ID
 * @param segmentId - 分段ID
 */
export async function deleteSegment(
  ragId: string,
  segmentId: string
): Promise<void> {
  // TODO: 替换为真实API调用
  // const response = await fetch(`/api/rag/${ragId}/segments/${segmentId}`, {
  //   method: 'DELETE'
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to delete segment');
  // }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 300);
  });
}

/**
 * 批量更新分段
 * @param ragId - RAG ID
 * @param segments - 分段列表
 */
export async function batchUpdateSegments(
  ragId: string,
  segments: Segment[]
): Promise<Segment[]> {
  // TODO: 替换为真实API调用
  // const response = await fetch(`/api/rag/${ragId}/segments/batch`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ segments })
  // });
  // const data = await response.json();
  // return data;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(segments);
    }, 500);
  });
}

/**
 * 将后端返回的 ApiMaterial 转换为前端的 Element
 */
function transformApiMaterialToElement(material: any): Element {
  const baseElement = {
    id: material.id,
    type: material.type === 'title' ? 'text' : material.type // 将 title 转换为 text
  };

  // 提取位置信息
  let positionType: string | undefined;
  let positionInfo: string | undefined;
  let pageId: number | undefined;

  if (material.positions && material.positions.length > 0) {
    const position = material.positions[0];
    if (position.bbox && position.bbox.length === 4) {
      positionType = '坐标';
      // 显示两个坐标点: (x1, y1) 和 (x2, y2)
      positionInfo = `(${position.bbox[0]}, ${position.bbox[1]}) - (${position.bbox[2]}, ${position.bbox[3]})`;
    }
    pageId = position.page_id;
  }

  switch (material.type) {
    case 'text':
    case 'title':
      return {
        ...baseElement,
        type: 'text',
        content: material.text,
        positionType,
        positionInfo,
        pageId
      } as TextElement & { pageId?: number };

    case 'image':
      return {
        ...baseElement,
        type: 'image',
        url: material.text || material.uri,
        positionType,
        positionInfo,
        pageId,
        bucketName: material.bucket_name,
        path: material.path
      } as ImageElement & { pageId?: number };

    case 'table':
      try {
        const tableData = JSON.parse(material.text);
        return {
          ...baseElement,
          type: 'table',
          headers: Object.keys(tableData),
          rows: [tableData],
          positionType,
          positionInfo,
          pageId
        } as TableElement & { pageId?: number };
      } catch {
        return {
          ...baseElement,
          type: 'table',
          headers: [],
          rows: [],
          positionType,
          positionInfo,
          pageId
        } as TableElement & { pageId?: number };
      }

    case 'formula':
      return {
        ...baseElement,
        type: 'formula',
        content: material.text,
        positionType,
        positionInfo,
        pageId
      } as FormulaElement & { pageId?: number };

    default:
      return {
        ...baseElement,
        type: 'text',
        content: material.text,
        positionType,
        positionInfo,
        pageId
      } as TextElement & { pageId?: number };
  }
}

/**
 * 将后端返回的 ApiSegmentDetail 转换为前端的 SegmentDetailData
 */
function transformApiSegmentDetail(
  apiData: ApiSegmentDetail
): SegmentDetailData {
  // 转换元素列表
  const elements: Element[] = (apiData.materials || []).map((material) =>
    transformApiMaterialToElement(material)
  );

  // 转换增强信息
  let enhancement: EnhancementInfo | undefined;
  if (apiData.ai_data) {
    enhancement = {
      summary: apiData.ai_data.summaries || '',
      hypotheticalAnswer: apiData.ai_data.questions || '',
      extractionEntity: apiData.ai_data.keywords,
      tags: apiData.ai_data.tags?.map((tag) => tag.name)
    };
  }

  // 转换元数据
  const metadata: Record<string, string> = {};
  if (apiData.parent_id) {
    metadata['parent_id'] = apiData.parent_id;
  }
  if (apiData.left_chunk_id) {
    metadata['left_chunk_id'] = apiData.left_chunk_id;
  }
  if (apiData.right_chunk_id) {
    metadata['right_chunk_id'] = apiData.right_chunk_id;
  }

  return {
    segmentId: apiData.id,
    charCount: apiData.char_count,
    elements,
    enhancement,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined
  };
}

/**
 * 获取分段的详细信息（包括元素、增强信息等）
 * @param datasetId - 数据集ID
 * @param chunkId - 分块ID
 */
export async function fetchSegmentDetailInfo(
  datasetId: string,
  chunkId: string
): Promise<SegmentDetailData> {
  try {
    // 调用真实API
    const response = await GetKnowledgeChunk({
      dataset_id: datasetId,
      chunk_id: chunkId
    });

    // 检查响应格式
    if (response && response.data) {
      const apiData = response.data as ApiSegmentDetail;
      return transformApiSegmentDetail(apiData);
    }

    // 如果响应格式不符合预期，返回 mock 数据
    const mockData = SegDetailData.data as ApiSegmentDetail;
    return transformApiSegmentDetail(mockData);
  } catch (error) {
    console.error('Failed to fetch segment detail:', error);
    // 降级处理：返回 mock 数据
    const mockData = SegDetailData.data as ApiSegmentDetail;
    return transformApiSegmentDetail(mockData);
  }
}
