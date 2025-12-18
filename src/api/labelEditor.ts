import { cloneDeep } from 'lodash-es';
import UAPI from '@/api';
import { toISOStringWithMicroseconds } from '@/utils/timeFormatting';
import { LabelShapMap, EmptyImgLabelResult } from '@/utils/constants';

export async function saveTask(taskId: string, params: Record<string, any>) {
  const searchParams = new URLSearchParams(location.search);
  const data: Record<string, any> = {
    task_id: taskId,
    save_type: 1,
    result_type: params.has_result,
    result: params,
    element_cnt: params?.shapes?.length || 0
  };
  const op = searchParams.get('stage');
  if (op === 'LABEL' || op === 'RELABEL') {
    data.op = op;
    data.is_qc_modify = 0;
  } else {
    data.is_qc_modify = 1;
  }
  return UAPI.RES.leSaveTask({}).post(data).inRegion().do();
}

export async function submitTask(taskId: string, params: Record<string, any>) {
  const searchParams = new URLSearchParams(location.search);
  const data: Record<string, any> = {
    task_id: taskId,
    save_type: 2,
    result_type: params.has_result,
    result: params,
    element_cnt: params?.shapes?.length || 0
  };
  const op = searchParams.get('stage');
  if (op === 'LABEL' || op === 'RELABEL') {
    data.op = op;
    data.is_qc_modify = 0;
  } else {
    data.is_qc_modify = 1;
  }
  return UAPI.RES.leSaveTask({}).post(data).inRegion().do();
}

export async function getTaskResult(taskId: string) {
  return await UAPI.RES.leGetTaskReuslt({})
    .post({ task_id: taskId })
    .inRegion()
    .do();
}
export async function getTask(requirementId?: string, pkgId?: string) {
  const searchParams = new URLSearchParams(location.search);
  const rId = requirementId || searchParams.get('rId');
  const pkg_Id = pkgId || searchParams.get('pkgId');
  const op = searchParams.get('stage');
  const params: Record<string, any> = {
    requirement_id: Number(rId),
    pkg_id: Number(pkg_Id)
  };
  if (op === 'LABEL' || op === 'RELABEL') {
    params.op = op;
  }
  return await UAPI.RES.leGetTask({}).post(params).inRegion().do();
}

export async function getTaskDetail(taskId?: string, pkgId?: string) {
  const searchParams = new URLSearchParams(location.search);
  const tId = taskId || searchParams.get('tId');
  const pkg_Id = pkgId || searchParams.get('pkgId');
  const op = searchParams.get('stage');
  const params: Record<string, any> = {
    task_id: Number(tId),
    pkg_id: Number(pkg_Id)
  };
  if (op === 'LABEL' || op === 'RELABEL') {
    params.op = op;
  }
  return await UAPI.RES.leGetTaskById({}).post(params).inRegion().do();
}

export async function getLabels(requirementId: string) {
  return await UAPI.RES.leGetLabels({})
    .post({ requirement_id: +requirementId })
    .inRegion()
    .do();
}

// =================================== 质检任务API =======================================
// 进入质检、获取质检任务信息（需求id、 taskid==）
export async function getQualityControlTask(qsId?: number) {
  const searchParams = new URLSearchParams(location.search);
  const qs_Id = qsId || searchParams.get('qsId');
  return await UAPI.RES.leGetQualityControlTask({})
    .post({ qs_id: Number(qs_Id) })
    .inRegion()
    .do();
}

// 改错、预览用，获取质检信息（评论==）
export async function getQualityControlTaskById(
  taskId?: string,
  flowId?: string
) {
  const searchParams = new URLSearchParams(location.search);
  const tId = taskId || searchParams.get('tId');
  const stage = taskId || searchParams.get('stage');
  const flow_Id = flowId || searchParams.get('flowId');
  const params: Record<string, any> = {
    task_id: Number(tId)
  };
  if (stage === 'PREVIEW') {
    params.flow_id = Number(flow_Id);
    params.history = true;
  }
  return await UAPI.RES.leGetQualityControlTaskById({})
    .post(params)
    .inRegion()
    .do();
}

// 提交单个质检任务, save_type: 1 - 通过；2 - 驳回
export async function saveQualityControlTask({
  taskId,
  qcRound,
  save_type
}: {
  taskId?: string;
  qcRound?: string;
  save_type: number;
}) {
  const searchParams = new URLSearchParams(location.search);
  const tId = taskId || searchParams.get('tId');
  const qc_Round = qcRound || searchParams.get('qcRound');

  return await UAPI.RES.leSaveQualityControlTask({})
    .post({
      task_id: Number(tId),
      qc_round: Number(qc_Round),
      save_type
    })
    .inRegion()
    .do();
}

// 新建单个评论, comment_type: more - 多标；less - 漏标；error - 错标
export async function createQualityControlTaskComment({
  taskId,
  qcRound,
  comment_type,
  comment_content
}: {
  taskId?: string;
  qcRound?: string;
  comment_type: string;
  comment_content: any;
}) {
  const searchParams = new URLSearchParams(location.search);
  const tId = taskId || searchParams.get('tId');
  const qc_Round = qcRound || searchParams.get('qcRound');

  return await UAPI.RES.leCreateQualityControlTaskComment({})
    .post({
      task_id: Number(tId),
      qc_round: Number(qc_Round),
      comment_type,
      comment_content
    })
    .inRegion()
    .do();
}

// 修改单个评论
export async function modifyQualityControlTaskComment({
  taskId,
  qcRound,
  comment_id,
  comment_type,
  comment_content
}: {
  taskId?: string;
  qcRound?: string;
  comment_id: string;
  comment_type: string;
  comment_content: any;
}) {
  const searchParams = new URLSearchParams(location.search);
  const tId = taskId || searchParams.get('tId');
  const qc_Round = qcRound || searchParams.get('qcRound');
  return await UAPI.RES.leModifyQualityControlTaskComment({})
    .post({
      task_id: Number(tId),
      qc_round: Number(qc_Round),
      comment_id,
      comment_type,
      comment_content
    })
    .inRegion()
    .do();
}

// 删除单个评论
export async function deleteQualityControlTaskComment({
  taskId,
  qcRound,
  comment_id
}: {
  taskId?: string;
  qcRound?: string;
  comment_id: string;
}) {
  const searchParams = new URLSearchParams(location.search);
  const tId = taskId || searchParams.get('tId');
  const qc_Round = qcRound || searchParams.get('qcRound');
  return await UAPI.RES.leDeleteQualityControlTaskComment({})
    .post({
      task_id: Number(tId),
      qc_round: Number(qc_Round),
      comment_id
    })
    .inRegion()
    .do();
}

// 获取任务流水
export async function getFlowListTask({
  taskId,
  pkgId,
  rId
}: {
  taskId?: string;
  pkgId?: string;
  rId?: string;
}) {
  const searchParams = new URLSearchParams(location.search);
  const tId = taskId || searchParams.get('tId');
  const pkg_Id = pkgId || searchParams.get('pkgId');
  const r_Id = rId || searchParams.get('rId');
  const params: Record<string, any> = {
    task_id: Number(tId),
    pkg_id: Number(pkg_Id),
    req_id: Number(r_Id)
  };
  return await UAPI.RES.getFlowListTask({}).post(params).inRegion().do();
}

// 任务预览切换
export async function switchPreview({
  taskId,
  pkgId,
  op
}: {
  taskId?: string;
  pkgId?: string;
  op: string;
}) {
  const searchParams = new URLSearchParams(location.search);
  const tId = taskId || searchParams.get('tId');
  const pkg_Id = pkgId || searchParams.get('pkgId');
  const params: Record<string, any> = {
    task_id: Number(tId),
    pkg_id: Number(pkg_Id),
    op
  };
  return await UAPI.RES.switchPreview({}).post(params).inRegion().do();
}

// 预览用标注结果，结构同getTaskResult
export async function previewTaskResult(id: number) {
  return await UAPI.RES.previewTaskResult({}).post({ id }).inRegion().do();
}

// =================================== 下面为适配CVAT图片，视频标注API ===============================
export async function saveImgJobAnnotations(
  taskId: string,
  params: Record<string, any>
) {
  handleImgAnnotationIds(params);
  const result = await saveTask(taskId, params);
  return { ...result, data: params };
}
export async function submitImgJobAnnotations(
  taskId: string,
  params: Record<string, any>
) {
  handleImgAnnotationIds(params);
  const result = await submitTask(
    taskId,
    !params.has_result
      ? { ...params, ...cloneDeep(EmptyImgLabelResult) }
      : params
  );
  return { ...result, data: params };
}

// LABEL 标注、RELABLE 改错、REVIEW 质检、PREVIEW 预览
const STAGE_MAP = {
  LABEL: 'annotation',
  RELABEL: 'annotation',
  REVIEW: 'validation',
  PREVIEW: 'preview'
};
export async function getImgJobOverview(taskId: string) {
  const searchParams = new URLSearchParams(location.search);
  const overviewTpl = {
    url: '',
    id: +taskId,
    task_id: +taskId,
    project_id: +searchParams.get('rId')!,
    assignee: {
      url: '',
      id: 1,
      username: 'admin',
      first_name: '',
      last_name: ''
    },
    guide_id: null,
    dimension: '2d',
    bug_tracker: '',
    status: 'annotation',
    stage: STAGE_MAP[searchParams.get('stage')!],
    state: 'in progress',
    mode: 'annotation',
    frame_count: 1,
    start_frame: 0,
    stop_frame: 0,
    data_chunk_size: 72,
    data_compressed_chunk_type: 'imageset',
    data_original_chunk_type: 'imageset',
    created_date: toISOStringWithMicroseconds(new Date()),
    updated_date: toISOStringWithMicroseconds(new Date()),
    issues: {},
    labels: {},
    type: 'annotation',
    organization: null,
    target_storage: {},
    source_storage: {},
    assignee_updated_date: toISOStringWithMicroseconds(new Date()),
    parent_job_id: null,
    consensus_replicas: 0
  };
  return Promise.resolve({ data: overviewTpl });
}

export async function getImgJobAnnotations(taskId: string) {
  const result = await getTaskResult(taskId);
  const annotations = result.data.result ?? cloneDeep(EmptyImgLabelResult);
  return Promise.resolve({
    data: {
      ...annotations,
      update_time: result.data.update_time,
      has_result: result.data.result_type
    }
  });
}

export async function getImgJobPreviewAnnotations(id: number) {
  const result = await previewTaskResult(id);
  const annotations = result.data.result ?? cloneDeep(EmptyImgLabelResult);
  return Promise.resolve({
    data: {
      ...annotations,
      update_time: result.data.update_time,
      has_result: result.data.result_type
    }
  });
}

export async function getImgJobMeta(taskId?: string) {
  const { data: res } = await getTaskDetail(taskId);

  const cvatData = {
    chunks_updated_date: toISOStringWithMicroseconds(new Date()),
    chunk_size: 72,
    size: 1,
    image_quality: 70,
    start_frame: 0,
    stop_frame: 0,
    frame_filter: '',
    frames: [
      {
        width: res.task_info.pic.width,
        height: res.task_info.pic.height,
        url: res.item_path,
        //   : res.item_path, // 'https://temp.im/600x600',
        name: res.task_info.pic.name,
        related_files: 0,
        has_related_context: false
      }
    ],
    deleted_frames: [],
    included_frames: null
  };
  return Promise.resolve({ data: cvatData });
}

export async function getImgJobLabels(requirementId?: string) {
  const searchParams = new URLSearchParams(location.search);
  const rId = requirementId || searchParams.get('rId');
  const { data: res } = await getLabels(rId!);

  const labels: any[] = [];
  for (let i = 0; i < res.labels.length; i++) {
    const label = res.labels[i];
    const labelTpl = {
      color: label.label_colour,
      has_parent: false,
      id: label.id,
      name: label.label_name_cn || label.label_name_en,
      parent_id: null,
      sublabels: [],
      task_id: rId,
      type: LabelShapMap[label.label_shape],
      attributes: [] as any[]
    };

    label.label_info_attribute_groups = Array.isArray(
      label.label_info_attribute_groups
    )
      ? label.label_info_attribute_groups
      : [];
    for (let j = 0; j < label.label_info_attribute_groups.length; j++) {
      const attr = label.label_info_attribute_groups[j];
      labelTpl.attributes.push({
        default_value: '',
        id: attr.id,
        input_type:
          attr.attribute_group_class === 1
            ? 'radio'
            : attr.attribute_group_class === 2
              ? 'checkbox'
              : 'text',
        mutable: false,
        name: attr.attribute_group_name,
        isRequired: attr.attribute_group_type === 1,
        values:
          attr.attribute_group_class === 3
            ? ['']
            : attr.label_info_attribute.map((la) => la.attribute_name_cn),
        keys:
          attr.attribute_group_class === 3
            ? ['']
            : attr.label_info_attribute.map((la) => la.attribute_name_en)
      });
    }
    labels.push(labelTpl);
  }
  return Promise.resolve({
    data: { count: labels.length, next: null, previous: null, results: labels }
  });
}

function handleImgAnnotationIds(params: Record<string, any>) {
  const ids = new Set<number | undefined>();
  if (Array.isArray(params.shapes)) {
    params.shapes.forEach((shape) => {
      ids.add(shape.id);
    });
  }
  if (Array.isArray(params.tags)) {
    params.tags.forEach((tag) => {
      ids.add(tag.id);
    });
  }
  if (Array.isArray(params.tracks)) {
    params.tracks.forEach((track) => {
      ids.add(track.id);
      if (Array.isArray(track.shapes)) {
        track.shapes.forEach((shape) => {
          ids.add(shape.id);
        });
      }
    });
  }

  const idNums = Array.from(ids).filter(
    (id) => id !== undefined && id !== null
  ) as number[];
  let counter = (idNums.length ? Math.max(...idNums) : 0) + 1;
  if (Array.isArray(params.shapes)) {
    params.shapes.forEach((shape) => {
      !shape.id && (shape.id = counter++);
    });
  }
  if (Array.isArray(params.tags)) {
    params.tags.forEach((tag) => {
      !tag.id && (tag.id = counter++);
    });
  }
  if (Array.isArray(params.tracks)) {
    params.tracks.forEach((track) => {
      !track.id && (track.id = counter++);
      if (Array.isArray(track.shapes)) {
        track.shapes.forEach((shape) => {
          !shape.id && (shape.id = counter++);
        });
      }
    });
  }
}

// ========================================== 文本标注API =================================

// 获取任务
export async function getTextEditorTask(
  requirementId?: string,
  pkgId?: string
) {
  const searchParams = new URLSearchParams(location.search);
  const rId = requirementId || searchParams.get('rId');
  const pkg_Id = pkgId || searchParams.get('pkgId');
  const op = searchParams.get('stage');
  const params: Record<string, any> = {
    requirement_id: Number(rId),
    pkg_id: Number(pkg_Id)
  };
  if (op === 'LABEL' || op === 'RELABEL') {
    params.op = op;
  }
  return UAPI.RES.leGetTask({}).post(params).inRegion().do();
}

// 文本标注，获取结果
export async function getTextEditorResult(task_id?: number) {
  const searchParams = new URLSearchParams(location.search);
  const taskId = searchParams.get('tId') || task_id;
  return UAPI.RES.leGetTaskReuslt({})
    .post({ task_id: Number(taskId) })
    .inRegion()
    .do();
}

// 获取标签
export async function getTextEditorLabels(requirement_id: number) {
  return UAPI.RES.leGetLabels({}).post({ requirement_id }).inRegion().do();
}

// 保存结果
export async function saveTextEditorResult(params: Record<string, any>) {
  const searchParams = new URLSearchParams(location.search);
  const op = searchParams.get('stage');
  if (op === 'LABEL' || op === 'RELABEL') {
    params.op = op;
    params.is_qc_modify = 0;
  } else {
    params.is_qc_modify = 1;
  }
  return UAPI.RES.leSaveTask({}).post(params).inRegion().do();
}

// 新建质检评论
export async function CreateQualityControlTaskComment(params) {
  return await UAPI.RES.leCreateQualityControlTaskComment({})
    .post(params)
    .inRegion()
    .do();
}

// 获取质检模式的质检数据
export async function GetQualityControlTask(params) {
  return await UAPI.RES.leGetQualityControlTask({})
    .post(params)
    .inRegion()
    .do();
}

// 修改单个评论
export async function ModifyQualityControlTaskComment(params) {
  return await UAPI.RES.leModifyQualityControlTaskComment({})
    .post(params)
    .inRegion()
    .do();
}

// 删除单个评论
export async function DeleteQualityControlTaskComment(params) {
  return await UAPI.RES.leDeleteQualityControlTaskComment({})
    .post(params)
    .inRegion()
    .do();
}

// 改错、预览用，获取质检信息（评论==）
export async function GetQualityControlTaskById(params) {
  return await UAPI.RES.leGetQualityControlTaskById({})
    .post(params)
    .inRegion()
    .do();
}

// 提交单个质检任务, save_type: 1 - 通过；2 - 驳回
export async function SaveQualityControlTask(params) {
  return await UAPI.RES.leSaveQualityControlTask({})
    .post(params)
    .inRegion()
    .do();
}

// 获取任务流水
export async function GetFlowListTask(params) {
  return await UAPI.RES.getFlowListTask({}).post(params).inRegion().do();
}

// 任务最新操作信息
export async function GetTaskLatestOperation(params) {
  return await UAPI.RES.getTaskLatestOperation({}).post(params).inRegion().do();
}
