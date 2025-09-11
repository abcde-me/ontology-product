import UAPI from '@/api';
import { toISOStringWithMicroseconds } from '@/utils/timeFormatting';
import { LabelShapMap } from '@/utils/constants';

export async function saveTask(taskId: string, params: Record<string, any>) {
  console.log('saveTask', taskId);
  // return await UAPI.RES.leSaveTask({})
  //   .post({ task_id: taskId, save_type: 1, ...params })
  //   .inRegion()
  //   .do();
  return Promise.resolve();
}
export async function submitTask(taskId: string, params: Record<string, any>) {
  console.log('submitTask', taskId);
  // return await UAPI.RES.leSaveTask({})
  //   .post({ task_id: taskId, save_type: 2, ...params })
  //   .inRegion()
  //   .do();
  return Promise.resolve();
}

const taskResult = {
  task_id: 1,
  task_status: 1,
  update_time: '2025-08-23 09:09:23',
  result_type: 1,
  result: {
    version: 0,
    tags: [],
    shapes: [
      // {
      //   type: 'rectangle',
      //   occluded: false,
      //   outside: false,
      //   z_order: 0,
      //   rotation: 0.0,
      //   points: [123.6142578125, 169.185546875, 308, 252.70000000000073],
      //   id: 28,
      //   frame: 0,
      //   label_id: 2,
      //   group: 0,
      //   source: 'manual',
      //   attributes: [
      //     {
      //       spec_id: 1,
      //       value: 'opt1'
      //     },
      //     {
      //       spec_id: 2,
      //       value: 'opt1,other|dddddd'
      //     },
      //     {
      //       spec_id: 3,
      //       value: '1111'
      //     }
      //   ],
      //   elements: []
      // },
      // {
      //   type: 'rectangle',
      //   occluded: false,
      //   outside: false,
      //   z_order: 0,
      //   rotation: 0.0,
      //   points: [113.6142578125, 179.185546875, 318, 262.70000000000073],
      //   id: 29,
      //   frame: 0,
      //   label_id: 2,
      //   group: 0,
      //   source: 'manual',
      //   attributes: [
      //     {
      //       spec_id: 1,
      //       value: 'opt1'
      //     },
      //     {
      //       spec_id: 2,
      //       value: 'opt1'
      //     },
      //     {
      //       spec_id: 3,
      //       value: ''
      //     }
      //   ],
      //   elements: []
      // }
    ],
    tracks: []
  }
};
export async function getTaskResult(taskId: string) {
  // return await UAPI.RES.leGetTaskReuslt({})
  //   .post({ task_id: taskId  })
  //   .inRegion()
  //   .do();
  taskResult.task_id = +taskId;
  const taskResultCopy = JSON.parse(JSON.stringify(taskResult));
  taskResultCopy.result_type = 1;
  if (taskResult.task_id % 2) {
    taskResultCopy.result.shapes.splice(1, 1);
  }
  return Promise.resolve({
    data: {
      data: taskResultCopy
    }
  });
}
export async function getTask(requirementId?: string) {
  const searchParams = new URLSearchParams(location.search);
  const rId = requirementId || searchParams.get('rId');
  // const { data: res } = await UAPI.RES.leGetTask({}).post({requirement_id: rId}).inRegion().do();
  const res = {
    task_id: Math.floor(1 + Math.random() * 10),
    item_path: 'https://temp.im/600x600',
    item_type: 2,
    requirement_info: {
      name: '需求名称' + Math.random(),
      not_started_num: 123,
      description: '描述',
      label_type: 2,
      label_tool: {
        label_tool_name: '标注工具名称',
        label_tool_code: 'aaa',
        image_out_of_bounds: 1
      },
      label_count: 100,
      usage_scenario: 1
    },
    task_info: {
      pic: {
        name: 'test.png',
        width: 600,
        height: 600
      }
    }
  };
  return Promise.resolve({ data: { data: res } });
}

export async function getLabels(requirementId: string) {
  // const { data: res } = await UAPI.RES.leGetLabels({}).post({requirement_id: requirementId}).inRegion().do();
  const idx = Math.floor(1 + Math.random() * 100);
  const res = {
    file_labels: [],
    labels: [
      {
        id: 1,
        order_num: 1,
        label_name_cn: '点标签1',
        label_name_en: '',
        label_shape: 1,
        label_colour: '#FFFFFF',
        label_info_attribute_groups: [
          {
            id: 1,
            order_num: 1,
            attribute_group_name: '单选属性',
            attribute_group_class: 1,
            attribute_group_type: 1,
            label_info_attribute: [
              {
                order_num: 1,
                attribute_name_cn: '选项1',
                attribute_name_en: 'opt1',
                input_type: 1
              },
              {
                order_num: 2,
                attribute_name_cn: '选项2',
                attribute_name_en: 'opt2',
                input_type: 1
              },
              {
                order_num: 3,
                attribute_name_cn: '其他',
                attribute_name_en: 'other',
                input_type: 2
              }
            ]
          },
          {
            id: 2,
            order_num: 1,
            attribute_group_name: '多选属性',
            attribute_group_class: 2,
            attribute_group_type: 1,
            label_info_attribute: [
              {
                order_num: 1,
                attribute_name_cn: '选项1',
                attribute_name_en: 'opt1',
                input_type: 1
              },
              {
                order_num: 2,
                attribute_name_cn: '选项2',
                attribute_name_en: 'opt2',
                input_type: 1
              },
              {
                order_num: 3,
                attribute_name_cn: '其他',
                attribute_name_en: 'other',
                input_type: 2
              }
            ]
          },
          {
            id: 3,
            order_num: 1,
            attribute_group_name: '输入框属性',
            attribute_group_class: 3,
            attribute_group_type: 1,
            label_info_attribute: []
          }
        ]
      },
      {
        id: 2,
        order_num: 2,
        label_name_cn: '线标签1',
        label_name_en: '',
        label_shape: 2,
        label_colour: '#FF0000',
        label_info_attribute_groups: [
          {
            id: 1,
            order_num: 1,
            attribute_group_name: '单选属性',
            attribute_group_class: 1,
            attribute_group_type: 1,
            label_info_attribute: [
              {
                order_num: 1,
                attribute_name_cn: '选项1',
                attribute_name_en: 'opt1',
                input_type: 1
              },
              {
                order_num: 2,
                attribute_name_cn: '选项2',
                attribute_name_en: 'opt2',
                input_type: 1
              },
              {
                order_num: 3,
                attribute_name_cn: '其他',
                attribute_name_en: 'other',
                input_type: 2
              }
            ]
          }
        ]
      },
      {
        id: 21,
        order_num: 2,
        label_name_cn: '线标签2',
        label_name_en: '',
        label_shape: 2,
        label_colour: '#FFFF00',
        label_info_attribute_groups: [
          {
            id: 1,
            order_num: 1,
            attribute_group_name: '单选属性',
            attribute_group_class: 1,
            attribute_group_type: 1,
            label_info_attribute: [
              {
                order_num: 1,
                attribute_name_cn: '选项1',
                attribute_name_en: 'opt1',
                input_type: 1
              },
              {
                order_num: 2,
                attribute_name_cn: '选项2',
                attribute_name_en: 'opt2',
                input_type: 1
              },
              {
                order_num: 3,
                attribute_name_cn: '其他',
                attribute_name_en: 'other',
                input_type: 2
              }
            ]
          }
        ]
      },
      {
        id: 3,
        order_num: 3,
        label_name_cn: '矩形标签1',
        label_name_en: '',
        label_shape: 3,
        label_colour: '#00FF00',
        label_info_attribute_groups: [
          {
            id: 1,
            order_num: 1,
            attribute_group_name: '单选属性',
            attribute_group_class: 1,
            attribute_group_type: 1,
            label_info_attribute: [
              {
                order_num: 1,
                attribute_name_cn: '选项1',
                attribute_name_en: 'opt1',
                input_type: 1
              },
              {
                order_num: 2,
                attribute_name_cn: '选项2',
                attribute_name_en: 'opt2',
                input_type: 1
              },
              {
                order_num: 3,
                attribute_name_cn: '其他',
                attribute_name_en: 'other',
                input_type: 2
              }
            ]
          },
          {
            id: 2,
            order_num: 1,
            attribute_group_name: '多选属性',
            attribute_group_class: 2,
            attribute_group_type: 1,
            label_info_attribute: [
              {
                order_num: 1,
                attribute_name_cn: '选项1',
                attribute_name_en: 'opt1',
                input_type: 1
              },
              {
                order_num: 2,
                attribute_name_cn: '选项2',
                attribute_name_en: 'opt2',
                input_type: 1
              },
              {
                order_num: 3,
                attribute_name_cn: '其他',
                attribute_name_en: 'other',
                input_type: 2
              }
            ]
          },
          {
            id: 3,
            order_num: 1,
            attribute_group_name: '输入框属性',
            attribute_group_class: 3,
            attribute_group_type: 1,
            label_info_attribute: []
          }
        ]
      },
      {
        id: 31,
        order_num: 31,
        label_name_cn: '矩形标签2',
        label_name_en: '',
        label_shape: 3,
        label_colour: '#00FFFF',
        label_info_attribute_groups: [
          {
            id: 1,
            order_num: 1,
            attribute_group_name: '单选属性',
            attribute_group_class: 1,
            attribute_group_type: 2,
            label_info_attribute: [
              {
                order_num: 1,
                attribute_name_cn: '选项1',
                attribute_name_en: 'opt1',
                input_type: 1
              },
              {
                order_num: 2,
                attribute_name_cn: '选项2',
                attribute_name_en: 'opt2',
                input_type: 1
              },
              {
                order_num: 3,
                attribute_name_cn: '其他',
                attribute_name_en: 'other',
                input_type: 2
              }
            ]
          },
          {
            id: 2,
            order_num: 1,
            attribute_group_name: '多选属性',
            attribute_group_class: 2,
            attribute_group_type: 2,
            label_info_attribute: [
              {
                order_num: 1,
                attribute_name_cn: '选项1',
                attribute_name_en: 'opt1',
                input_type: 1
              },
              {
                order_num: 2,
                attribute_name_cn: '选项2',
                attribute_name_en: 'opt2',
                input_type: 1
              },
              {
                order_num: 3,
                attribute_name_cn: '其他',
                attribute_name_en: 'other',
                input_type: 2
              }
            ]
          },
          {
            id: 3,
            order_num: 1,
            attribute_group_name: '输入框属性',
            attribute_group_class: 3,
            attribute_group_type: 2,
            label_info_attribute: []
          }
        ]
      },
      {
        id: 4,
        order_num: 4,
        label_name_cn: '多边形标签1',
        label_name_en: '',
        label_shape: 4,
        label_colour: '#0000FF',
        label_info_attribute_groups: [
          {
            id: 1,
            order_num: 1,
            attribute_group_name: '单选属性',
            attribute_group_class: 1,
            attribute_group_type: 1,
            label_info_attribute: [
              {
                order_num: 1,
                attribute_name_cn: '选项1',
                attribute_name_en: 'opt1',
                input_type: 1
              },
              {
                order_num: 2,
                attribute_name_cn: '选项2',
                attribute_name_en: 'opt2',
                input_type: 1
              },
              {
                order_num: 3,
                attribute_name_cn: '其他',
                attribute_name_en: 'other',
                input_type: 2
              }
            ]
          }
        ]
      },
      {
        id: 5,
        order_num: 5,
        label_name_cn: '椭圆形标签1',
        label_name_en: '',
        label_shape: 5,
        label_colour: '#FF00FF',
        label_info_attribute_groups: [
          {
            id: 1,
            order_num: 1,
            attribute_group_name: '单选属性',
            attribute_group_class: 1,
            attribute_group_type: 1,
            label_info_attribute: [
              {
                order_num: 1,
                attribute_name_cn: '选项1',
                attribute_name_en: 'opt1',
                input_type: 1
              },
              {
                order_num: 2,
                attribute_name_cn: '选项2',
                attribute_name_en: 'opt2',
                input_type: 1
              },
              {
                order_num: 3,
                attribute_name_cn: '其他',
                attribute_name_en: 'other',
                input_type: 2
              }
            ]
          }
        ]
      }
    ]
  };
  return Promise.resolve({ data: { data: res } });
}

// 下面为适配CVAT图片，视频标注API

export async function saveImgJobAnnotations(
  taskId: string,
  params: Record<string, any>
) {
  handleImgAnnotationIds(params);
  taskResult.result_type = params.has_result;
  await saveTask(taskId, params);
  return { data: params };
}
export async function submitImgJobAnnotations(
  taskId: string,
  params: Record<string, any>
) {
  handleImgAnnotationIds(params);
  taskResult.result_type = params.has_result;
  await submitTask(taskId, params);
  return { data: params };
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
  const annotations = result.data.data.result ?? {
    version: 0,
    tags: [],
    shapes: [],
    tracks: []
  };
  return Promise.resolve({
    data: {
      ...annotations,
      update_time: result.data.data.update_time,
      has_result: result.data.data.result_type
    }
  });
}

export async function getImgJobMeta(requirementId?: string) {
  const {
    data: { data: res }
  } = await getTask(requirementId);

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
  const {
    data: { data: res }
  } = await getLabels(rId!);

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
        keys: attr.label_info_attribute.map((la) => la.attribute_name_en)
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
  );
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
