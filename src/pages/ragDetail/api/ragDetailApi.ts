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
  ApiSegmentOld,
  ApiCatalogNodeOld
} from '../types';
import { SegmentData } from '../utils/segmentData';
import { TreeData, getTreeDataByRagId } from '../utils/treeData';
import { getSegmentDataByRagId } from '../utils/segmentDataByRagId';
import { NewSegmentData } from '../utils/newSegmentData';
import { newTreeData } from '../utils/newTreeData';

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
    title: apiSegment.title || undefined,
    titleId: apiSegment.title_id || undefined,
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
    title: apiSegment.title || undefined,
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
 * 获取RAG详情数据
 * @param ragId - RAG ID
 * @returns RAG详情数据
 */
export async function fetchRagDetail(ragId: string): Promise<RagDetailData> {
  // 根据ragId获取对应的Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      let segments: Segment[] = [];
      let directory: DirectoryNode[] | undefined;
      let fileName = '有为政府如何促进中国产业政策演进.pdf';
      let filePath = '/知识库/政策研究';
      let sceneType: 'pdf' | 'ppt' | 'excel' = 'pdf';

      // 使用新的数据格式（ragId=1002 使用新数据）
      if (ragId === '1002') {
        // 使用新的数据源
        const newSegmentResponse = NewSegmentData;
        const newTreeResponse = newTreeData;

        // 转换分段数据（添加类型断言）
        segments = (newSegmentResponse.data.list as ApiSegment[]).map(
          transformSegment
        );

        // 转换目录树数据（添加类型断言）
        if (
          newTreeResponse &&
          newTreeResponse.data &&
          newTreeResponse.data.catalogs
        ) {
          const rootNode = transformCatalogNode(
            newTreeResponse.data.catalogs as any
          );
          directory = [rootNode];
        }

        fileName = '带目录树的文档（新格式）.pdf';
        filePath = '/知识库/结构化文档';
        sceneType = 'pdf';
      } else {
        // 使用旧的数据格式（其他 ragId）
        const segmentResponse = getSegmentDataByRagId(ragId);
        const treeResponse = getTreeDataByRagId(ragId);

        // 转换分段数据（使用旧的转换函数）
        segments = segmentResponse.data.data.map(transformSegmentOld);

        // 转换目录树数据（使用旧的转换函数）
        if (
          treeResponse &&
          treeResponse.data &&
          treeResponse.data.catalog_content
        ) {
          const rootNode = transformCatalogNodeOld(
            treeResponse.data.catalog_content
          );
          directory = [rootNode];
        }

        // 根据ragId设置不同的文件名和场景类型
        if (ragId === '1001') {
          fileName = '纯文本分段示例.pdf';
          filePath = '/知识库/示例文档';
        } else if (ragId === '1003') {
          fileName = '图文混排文档.pdf';
          filePath = '/知识库/多媒体文档';
        } else if (ragId === '1004') {
          fileName = '2024年度工作总结.pptx';
          filePath =
            'https://view.officeapps.live.com/op/embed.aspx?src=https://scholar.harvard.edu/files/torman_personal/files/samplepptx.pptx';
          sceneType = 'ppt';
        } else if (ragId === '1005') {
          fileName = '销售数据统计.xlsx';
          filePath = '/知识库/数据表格';
          sceneType = 'excel';
        }
      }

      const result: RagDetailData = {
        ragId,
        fileName,
        filePath,
        sceneType,
        segments,
        directory
      };

      resolve(result);
    }, 300);
  });
}

/**
 * 更新分段内容
 * @param _ragId - RAG ID (未使用)
 * @param segmentId - 分段ID
 * @param content - 新的内容
 * @returns 更新后的分段
 */
export async function updateSegmentContent(
  _ragId: string,
  segmentId: string,
  content: string
): Promise<Segment> {
  // TODO: 替换为真实API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: segmentId,
        content,
        charCount: content.length,
        segmentIndex: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }, 300);
  });
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
 * @param ragId - RAG ID
 * @param segmentId - 分段ID
 * @returns 溯源日志列表
 */
export async function fetchSegmentTraceLog(
  ragId: string,
  segmentId: string
): Promise<any[]> {
  // TODO: 替换为真实API调用
  // const response = await fetch(`/api/rag/${ragId}/segments/${segmentId}/trace-log`);
  // const data = await response.json();
  // return data;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          action: 'created',
          timestamp: new Date().toISOString(),
          operator: 'system'
        },
        {
          id: '2',
          action: 'updated',
          timestamp: new Date().toISOString(),
          operator: 'user'
        }
      ]);
    }, 300);
  });
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
