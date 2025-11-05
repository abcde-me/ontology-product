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
  PositionBBox
} from '../types';
import { SegmentData } from '../utils/segmentData';
import { TreeData } from '../utils/treeData';

/**
 * 将后端的position_bbox转换为前端的PDFCoordinate数组
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
 * 将后端的ApiSegment转换为前端的Segment
 */
function transformSegment(apiSegment: any): Segment {
  return {
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
}

/**
 * 将后端的ApiCatalogNode转换为前端的DirectoryNode
 */
function transformCatalogNode(apiNode: any): DirectoryNode {
  const node: DirectoryNode = {
    id: apiNode.title_id,
    label: apiNode.title,
    level: apiNode.level,
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
    const transformedChildren = apiNode.children.map(transformCatalogNode);
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
  // 使用真实的Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const segmentResponse = SegmentData;
      const treeResponse = TreeData;

      // 转换分段数据
      const segments: Segment[] =
        segmentResponse.data.data.map(transformSegment);

      // 转换目录树数据
      let directory: DirectoryNode[] | undefined;
      if (treeResponse.data && treeResponse.data.catalog_content) {
        const rootNode = transformCatalogNode(
          treeResponse.data.catalog_content
        );
        // 将根节点作为directory的第一个元素
        directory = [rootNode];
      }

      const result: RagDetailData = {
        ragId,
        fileName: '有为政府如何促进中国产业政策演进.pdf',
        filePath: '/知识库/政策研究',
        sceneType: 'pdf',
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
        resolve(transformSegment(apiSegment));
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
