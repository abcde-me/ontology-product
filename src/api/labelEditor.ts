import { cloneDeep } from 'lodash-es';
import UAPI from '@/api';
import { toISOStringWithMicroseconds } from '@/utils/timeFormatting';
import { LabelShapMap, EmptyImgLabelResult } from '@/utils/constants';

export async function saveTask(taskId: string, params: Record<string, any>) {
  console.log('saveTask', taskId, params);
  return UAPI.RES.leSaveTask({})
    .post({
      task_id: taskId,
      save_type: 1,
      result_type: params.has_result,
      result: params
    })
    .inRegion()
    .do();
}
export async function submitTask(taskId: string, params: Record<string, any>) {
  console.log('submitTask', taskId, params);
  return UAPI.RES.leSaveTask({})
    .post({
      task_id: taskId,
      save_type: 2,
      result_type: params.has_result,
      result: params
    })
    .inRegion()
    .do();
}

export async function getTaskResult(taskId: string) {
  return await UAPI.RES.leGetTaskReuslt({})
    .post({ task_id: taskId })
    .inRegion()
    .do();
}
export async function getTask(requirementId?: string) {
  const searchParams = new URLSearchParams(location.search);
  const rId = requirementId || searchParams.get('rId');
  return await UAPI.RES.leGetTask({})
    .post({ requirement_id: Number(rId) })
    .inRegion()
    .do();
}
export async function getTaskDetail(taskId?: string) {
  const searchParams = new URLSearchParams(location.search);
  const rId = taskId || searchParams.get('rId');
  return await UAPI.RES.leGetTaskById({})
    .post({ task_id: Number(rId) })
    .inRegion()
    .do();
}

export async function getLabels(requirementId: string) {
  return await UAPI.RES.leGetLabels({})
    .post({ requirement_id: +requirementId })
    .inRegion()
    .do();
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
    stage: 'annotation',
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
export async function getTextEditorTask(requirement_id: number) {
  return UAPI.RES.leGetTask({}).post({ requirement_id }).inRegion().do();
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
  return UAPI.RES.leSaveTask({}).post(params).inRegion().do();
}
