/**
 * RAG Detail API
 *
 * 这个文件用于集成真实的API接口。
 * 当前使用Mock数据，可以根据实际API进行替换。
 */

import { RagDetailData, Segment } from '../types';
import { mockRagDetailData } from '../utils/mockData';

/**
 * 获取RAG详情数据
 * @param ragId - RAG ID
 * @returns RAG详情数据
 */
export async function fetchRagDetail(ragId: string): Promise<RagDetailData> {
  // TODO: 替换为真实API调用
  // const response = await fetch(`/api/rag/${ragId}`);
  // const data = await response.json();
  // return data;

  // 当前使用Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRagDetailData(ragId));
    }, 500);
  });
}

/**
 * 更新分段内容
 * @param ragId - RAG ID
 * @param segmentId - 分段ID
 * @param content - 新的内容
 * @returns 更新后的分段
 */
export async function updateSegmentContent(
  ragId: string,
  segmentId: string,
  content: string
): Promise<Segment> {
  // TODO: 替换为真实API调用
  // const response = await fetch(`/api/rag/${ragId}/segments/${segmentId}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ content })
  // });
  // const data = await response.json();
  // return data;

  // 当前使用Mock数据
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
 * @param ragId - RAG ID
 * @param segmentId - 分段ID
 * @returns 分段详情
 */
export async function fetchSegmentDetail(
  ragId: string,
  segmentId: string
): Promise<Segment> {
  // TODO: 替换为真实API调用
  // const response = await fetch(`/api/rag/${ragId}/segments/${segmentId}`);
  // const data = await response.json();
  // return data;

  return new Promise((resolve) => {
    setTimeout(() => {
      const data = mockRagDetailData(ragId);
      const segment = data.segments.find((s) => s.id === segmentId);
      if (segment) {
        resolve(segment);
      } else {
        throw new Error('Segment not found');
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
