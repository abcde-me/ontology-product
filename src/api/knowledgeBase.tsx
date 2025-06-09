import UAPI from '@/api';

/**获取知识库列表 */
export async function getKnowledgeList(params) {
  return UAPI.RES.knowledgeBase({}).get(params).inRegion().do();
}

/**创建空知识库 */
export async function createKnowledge(params) {
  return UAPI.RES.knowledgeBase({}).post(params).inRegion().do();
}

/**创建知识库 */
export async function createKnowledgeInit(params) {
  return UAPI.RES.knowledgeBaseInit({}).post(params).inRegion().do();
}

/**编辑知识库 */
export async function editKnowledge(knowledgeId, params) {
  return UAPI.RES.knowledgeId({ knowledgeId }).patch(params).inRegion().do();
}

/**删除知识库 */
export async function deleteKnowledge(knowledgeId) {
  return UAPI.RES.knowledgeId({ knowledgeId }).delete().inRegion().do();
}

/**知识库文件进度 */
export async function fetchIndexingStatus(
  knowledgeId,
  batchId,
  action,
  abortController
) {
  const config = abortController ? { signal: abortController.signal } : {};
  return UAPI.RES.batchIdAction({ knowledgeId, batchId, action })
    .get()
    .withConfig(config)
    .inRegion()
    .do();
}

/**知识库文件进度 */
export async function fetchDocIndexingStatus(
  knowledgeId,
  documentId,
  action,
  abortController
) {
  const config = abortController ? { signal: abortController.signal } : {};
  return UAPI.RES.documentsIdAction({ knowledgeId, documentId, action })
    .get()
    .withConfig(config)
    .inRegion()
    .do();
}

/**查询规则 */
export async function fetchProcessRule(action, params) {
  return UAPI.RES.knowledgeAction({ action }).get(params).inRegion().do();
}

/**命中测试 */
export async function hitTesting(knowledgeId, params, abortController) {
  const TIMEOUT = null;
  const config = abortController
    ? { signal: abortController.signal, timeout: TIMEOUT }
    : { timeout: TIMEOUT };
  return UAPI.RES.knowledgeIdAction({ knowledgeId, action: 'hit-testing' })
    .post(params)
    .withConfig(config)
    .inRegion()
    .do();
}

/**查询命中纪录 */
export async function fetchTestingRecords(knowledgeId, params) {
  return UAPI.RES.knowledgeIdAction({ knowledgeId, action: 'queries' })
    .get(params)
    .withConfig({ timeout: null })
    .inRegion()
    .do();
}

/**知识库详情 */
export async function detailKnowledge(knowledgeId) {
  return UAPI.RES.knowledgeId({ knowledgeId }).get().inRegion().do();
}

/**文档列表 */
export async function getDocumentsList(knowledgeId, params) {
  return UAPI.RES.documentsList({ knowledgeId }).get(params).inRegion().do();
}

/**文档启用开关 */
export async function documentEnabled(knowledgeId, documentId, action) {
  return UAPI.RES.documentsIdAction({ knowledgeId, documentId, action })
    .patch()
    .inRegion()
    .do();
}

/**文档删除 */
export async function delDocument(knowledgeId, documentId) {
  return UAPI.RES.documentsId({ knowledgeId, documentId })
    .delete()
    .inRegion()
    .do();
}

/**文档上传 */
export async function uploadDocument(knowledgeId, params) {
  return UAPI.RES.documentsList({ knowledgeId }).post(params).inRegion().do();
}

/**文档详情 */
export async function detailDocument(knowledgeId, documentId) {
  return UAPI.RES.documentsId({ knowledgeId, documentId })
    .get()
    .inRegion()
    .do();
}

/**文档内容 */
export async function fileDocument(knowledgeId, documentId, params) {
  return UAPI.RES.documentsIdAction({
    knowledgeId,
    documentId,
    action: 'segments'
  })
    .get(params)
    .inRegion()
    .do();
}
