import UAPI from '@/api';


// 查询知识库文件列表
export function ListKnowledgeDocuments(params) {
    return UAPI.RES.ListKnowledgeDocuments({}).post(params).inRegion().do();
}
// 查询知识库文件目录层级
export function ListKnowledgeDocumentCatalogs(params) {
    return UAPI.RES.ListKnowledgeDocumentCatalogs({}).post(params).inRegion().do();
}
// 查询知识库分块列表
export function ListKnowledgeChunks(params) {
    return UAPI.RES.ListKnowledgeChunks({}).post(params).inRegion().do();
}
// 查询分块详情
export function GetKnowledgeChunk(params) {
    return UAPI.RES.GetKnowledgeChunk({}).post(params).inRegion().do();
}
// 编辑分块内容
export function UpdateKnowledgeChunk(params) {
    return UAPI.RES.UpdateKnowledgeChunk({}).post(params).inRegion().do();
}
// 编辑分块元素信息
export function UpdateKnowledgeChunkMaterials(params) {
    return UAPI.RES.UpdateKnowledgeChunkMaterials({}).post(params).inRegion().do();
}
// 编辑分块增强信息
export function UpdateKnowledgeChunkEnhancement(params) {
    return UAPI.RES.UpdateKnowledgeChunkEnhancement({}).post(params).inRegion().do();
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
    return UAPI.RES.ListKnowledgeHitTestingRecords({}).post(params).inRegion().do();
}
