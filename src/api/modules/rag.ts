import UAPI from '@/api';
import { newTreeData } from '@/pages/ragDetail/utils/newTreeData';
import { NewSegmentData } from '@/pages/ragDetail/utils/newSegmentData';

// 获取原始文件二进制数据
export interface GetFileBinaryDataParams {
  bucket_name: string;
  path: string;
}

// 预览图片
export interface PreviewUrlParams {
  path: string;
  bucket_name: string;
}

export function previewUrl(params: PreviewUrlParams) {
  return UAPI.RES.PreviewUrl({}).post(params).inRegion().do();
}

export function getFileBinaryData(params: GetFileBinaryDataParams) {
  return UAPI.RES.GetFileBinaryData({})
    .get(params)
    .withConfig({ responseType: 'arraybuffer' })
    .inRegion()
    .do();
}

// 查询知识库文件列表
export function ListKnowledgeDocuments(params) {
  return UAPI.RES.ListKnowledgeDocuments({}).post(params).inRegion().do();
}

// 查询知识库文件目录层级
export function ListKnowledgeDocumentCatalogs(params) {
  // TODO: 替换为真实API调用
  return UAPI.RES.ListKnowledgeDocumentCatalogs({})
    .post(params)
    .inRegion()
    .do();

  // 临时返回 mock 数据
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(newTreeData);
  //   }, 300);
  // });
}

// 查询知识库分块列表
export function ListKnowledgeChunks(params) {
  // TODO: 替换为真实API调用
  return UAPI.RES.ListKnowledgeChunks({}).post(params).inRegion().do();

  // 临时返回 mock 数据
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(NewSegmentData);
  //   }, 300);
  // });
}
// 查询分块详情
export function GetKnowledgeChunk(params) {
  return UAPI.RES.GetKnowledgeChunk({}).post(params).inRegion().do();
}
// 编辑分块内容
export function UpdateKnowledgeChunk(params) {
  console.log('编辑分块内容:', params);
  // TODO: 替换为真实API调用
  return UAPI.RES.UpdateKnowledgeChunk({}).post(params).inRegion().do();

  // 临时返回 mock 数据
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({
  //       code: 0,
  //       data: {
  //         id: params.chunk_id,
  //         chunk_index: 0,
  //         content: params.content,
  //         created_at: new Date().toISOString(),
  //         updated_at: new Date().toISOString()
  //       },
  //       message: 'Success'
  //     });
  //   }, 300);
  // });
}
// 编辑分块元素信息
export function UpdateKnowledgeChunkMaterials(params) {
  return UAPI.RES.UpdateKnowledgeChunkMaterials({})
    .post(params)
    .inRegion()
    .do();
}
// 编辑分块增强信息
export function UpdateKnowledgeChunkEnhancement(params) {
  return UAPI.RES.UpdateKnowledgeChunkEnhancement({})
    .post(params)
    .inRegion()
    .do();
}
// 查询分块溯源日志
export function GetKnowledgeChunkTraceLog(params) {
  return UAPI.RES.GetKnowledgeChunkTraceLog({}).post(params).inRegion().do();
}
// 运行命中测试
export function RunKnowledgeHitTesting(params) {
  return UAPI.RES.RunKnowledgeHitTesting({}).post(params).inRegion().do();
}
// 查询命中测试历史记录
export function ListKnowledgeHitTestingRecords(params) {
  return UAPI.RES.ListKnowledgeHitTestingRecords({})
    .post(params)
    .inRegion()
    .do();
}
