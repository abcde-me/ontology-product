import UAPI from '@/api';
import { string } from 'mobx-state-tree/dist/internal';

/**获取知识库列表 */
export async function getDatasetsList(params) {
  // @ts-expect-error
  const result = await UAPI.RES.datasets({}).get(params).inRegion().do();
  // 适配dify字段
  result.data.data?.forEach((d) => {
    d.indexing_technique = 'high_quality';
    d.embedding_available = true;
    d.retrieval_model_dict = {};
  });
  return Promise.resolve(result);
}
//知识库列表接口
export async function getknowledgeBaseRootList(params: any = {}) {
  return UAPI.RES.knowledgeBaseList({}).get(params).inRegion().do();
}
//知识库目录列表接口, 返回所有根目录get
export async function getknowledgeBaseRootTree(Id?: string, params: any = {}) {
  return UAPI.RES.knowledgeBaseRoot(Id ? { Id } : {})
    .get()
    .inRegion()
    .do();
}
//知识库目录创建接口post
export async function postknowledgeBaseRootTree(Id: string, params: any = {}) {
  return UAPI.RES.knowledgeBaseRoot({ Id }).post(params).inRegion().do();
}
//知识库目录删除接口, 含有子目录或者知识库时不能删除delete
export async function deleteknowledgeBaseRootTree(
  id: string,
  params: any = {}
) {
  return UAPI.RES.knowledgeBaseRoot({ id }).delete().inRegion().do();
}
//知识库目录修改接口, 只能更新名称put
export async function putknowledgeBaseRootTree(id: string, params: any = {}) {
  return UAPI.RES.knowledgeBaseRoot({ id }).put(params).inRegion().do();
}
//知识库目录详情接口, 返回知识库目录下面的下一层目录和知识库
export async function getknowledgeBaseRootTreeChild(id, params: any = {}) {
  return UAPI.RES.knowledgeBaseRoot({ id }).get(params).inRegion().do();
}
//知识库列表创建接口, 带文件上传post
export async function postknowledgeBaseCreate(params: any = {}) {
  return UAPI.RES.knowledgeBaseCreate({}).post(params).inRegion().do();
}
//知识库列表删除接口
export async function deleteknowledgeBaseList(id: string, params: any = {}) {
  return UAPI.RES.knowledgeBaseList({ id }).delete().inRegion().do();
}
//知识库列表修改接口
export async function putknowledgeBaseList(id: string, params: any = {}) {
  return UAPI.RES.knowledgeBaseList({ id }).put(params).inRegion().do();
}
//知识库详情接口
export async function getknowledgeBaseDetails(id: string, params: any = {}) {
  return UAPI.RES.knowledgeBaseList({ id }).get().inRegion().do();
}
//知识库文档列表接口
export async function getdocumentList(dataset_id: string, params: any = {}) {
  return UAPI.RES.documentList({ dataset_id }).get(params).inRegion().do();
}
//知识库文档列表接口
export async function postdocumentList(dataset_id: string, params: any = {}) {
  return UAPI.RES.documentList({ dataset_id }).post(params).inRegion().do();
}
// 知识库策略配置， patch请求
export async function patchknowledgeBasePolicy(id: string, params: any = {}) {
  return UAPI.RES.knowledgeBaseList({ id }).patch(params).inRegion().do();
}
//文档分段列表接口
export async function getdocSegmentation(
  dataset_id: string,
  document_id: string,
  params: any
) {
  return UAPI.RES.docSegmentation({ dataset_id, document_id })
    .get(params)
    .inRegion()
    .do();
}
//文档操作接口,如：启用，禁用
export async function putdocSwitch(
  dataset_id: string,
  document_id: string,
  action: string
) {
  return UAPI.RES.docSwitch({ dataset_id, document_id, action })
    .put()
    .inRegion()
    .do();
}
//文档操作接口,如：启用，禁用  分段
export async function putdocSwitchSegmentation(
  dataset_id: string,
  document_id: string,
  action: string,
  segment_id: string
) {
  return UAPI.RES.docSwitchSegmentation({
    dataset_id,
    document_id,
    action,
    segment_id
  })
    .put()
    .inRegion()
    .do();
}
//文档编辑、上传新文档接口
export async function postdocEditList(dataset_id: string, action: any) {
  return UAPI.RES.docEditList({ dataset_id }).post(action).inRegion().do();
}
//文档删除接口
export async function deletedocEditList(
  dataset_id: string,
  document_id: string
) {
  return UAPI.RES.docdeleteList({ dataset_id, document_id })
    .delete()
    .inRegion()
    .do();
}
//文档详情接口
export async function getdocDetail(dataset_id: string, document_id: string) {
  return UAPI.RES.doxdetailData({ dataset_id, document_id })
    .get()
    .inRegion()
    .do();
}
//文档索引状态接口
export async function getdocIndex(dataset_id: string, document_id: string) {
  return UAPI.RES.docIndex({ dataset_id, document_id }).get().inRegion().do();
}
//知识库命中测试接口
export async function postHitTest(dataset_id: string, params: any) {
  return UAPI.RES.hitTestapi({ dataset_id }).post(params).inRegion().do();
}
//	文档分段删除接口
export async function deletedocsublevel(
  dataset_id: string,
  document_id: string,
  segment_id: string
) {
  return UAPI.RES.docDeleteSublevel({ dataset_id, document_id, segment_id })
    .delete()
    .inRegion()
    .do();
}
//添加文档分段接口
export async function AddDocsublevel(
  dataset_id: string,
  document_id: string,
  params: any
) {
  return UAPI.RES.docAddSublevel({ dataset_id, document_id })
    .post(params)
    .inRegion()
    .do();
}
//编辑文档分段接口
export async function editDocsublevel(
  dataset_id: string,
  document_id: string,
  segment_id: string,
  params: any
) {
  return UAPI.RES.docEditSublevel({ dataset_id, document_id, segment_id })
    .post(params)
    .inRegion()
    .do();
}
//	知识库命中测试记录列表接口
export async function getHitRecord(dataset_id: string, params: any) {
  return UAPI.RES.HitRecordList({ dataset_id }).get(params).inRegion().do();
}
//知识库文档内容获取
export async function getDocContent(file_id: string) {
  const response = await UAPI.RES.docContent({ file_id }).get().inRegion().do();

  return response;
}
//知识库层级目录接口
export function apiHierarchicalCatalog(
  dataset_id: string,
  document_id: string
) {
  return UAPI.RES.HierarchicalCatalog({ dataset_id, document_id })
    .get()
    .inRegion()
    .do();
}
//知识库层级目录编辑接口
export function apiHierarchicalCatalogEdit(
  dataset_id: string,
  document_id: string,
  params: any
) {
  return UAPI.RES.HierarchicalCatalogEdit({ dataset_id, document_id })
    .put(params)
    .inRegion()
    .do();
}
//知识库sheet信息与默认表头获取
export function apiTableConfiguration(params: any) {
  return UAPI.RES.TableConfiguration({}).get(params).inRegion().do();
}
//知识库表头信息获取
export function apiTableHeaderConfiguration(params: any) {
  return UAPI.RES.TableHeaderConfiguration({}).get(params).inRegion().do();
}
export function getdatasetstree(Id?: string, params: any = {}) {
  return UAPI.RES.datasetstree(Id ? { Id } : {})
    .get()
    .inRegion()
    .do();
}
