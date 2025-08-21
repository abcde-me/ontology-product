import UAPI from '@/api';
import { toISOStringWithMicroseconds } from '@/utils/timeFormatting';
import { LabelShapMap } from '@/utils/constants';

export async function saveTask(taskId: string, params: Record<string, any>) {
  // return await UAPI.RES.leSaveTask({})
  //   .post({ task_id: taskId, save_type: 1, ...params })
  //   .inRegion()
  //   .do();
  return Promise.resolve();
}
export async function submitTask(taskId: string, params: Record<string, any>) {
  // return await UAPI.RES.leSaveTask({})
  //   .post({ task_id: taskId, save_type: 2, ...params })
  //   .inRegion()
  //   .do();
  return Promise.resolve();
}
export async function saveJobAnnotations(
  taskId: string,
  params: Record<string, any>
) {
  handleAnnotationIds(params);
  await saveTask(taskId, params);
  return { data: params };
}
export async function submitJobAnnotations(
  taskId: string,
  params: Record<string, any>
) {
  handleAnnotationIds(params);
  await submitTask(taskId, params);
  return { data: params };
}

function handleAnnotationIds(params: Record<string, any>) {
  let counter = 1;
  if (params.shapes && Array.isArray(params.shapes)) {
    params.shapes.forEach((shape) => {
      shape.id = counter++;
    });
  }
  if (params.tags && Array.isArray(params.tags)) {
    params.tags.forEach((tag) => {
      tag.id = counter++;
    });
  }
  if (params.tracks && Array.isArray(params.tracks)) {
    params.tracks.forEach((track) => {
      track.id = counter++;
      if (track.shapes && Array.isArray(track.shapes)) {
        track.shapes.forEach((shape) => {
          shape.id = counter++;
        });
      }
    });
  }
}

export async function getTaskResult(taskId: string) {
  // return await UAPI.RES.leGetTaskReuslt({})
  //   .post({ task_id: taskId  })
  //   .inRegion()
  //   .do();
  const res = {
    task_id: taskId,
    task_status: 1,
    result: {
      version: 0,
      tags: [],
      shapes: [
        {
          type: 'rectangle',
          occluded: false,
          outside: false,
          z_order: 0,
          rotation: 0.0,
          points: [123.6142578125, 169.185546875, 308, 252.70000000000073],
          id: 28,
          frame: 0,
          label_id: 2,
          group: 0,
          source: 'manual',
          attributes: [
            {
              spec_id: 1,
              value: 'opt1'
            },
            {
              spec_id: 2,
              value: 'opt1'
            },
            {
              spec_id: 3,
              value: '1111'
            }
          ],
          elements: []
        },
        {
          type: 'rectangle',
          occluded: false,
          outside: false,
          z_order: 0,
          rotation: 0.0,
          points: [113.6142578125, 179.185546875, 318, 262.70000000000073],
          id: 29,
          frame: 0,
          label_id: 2,
          group: 0,
          source: 'manual',
          attributes: [
            {
              spec_id: 1,
              value: 'opt1'
            },
            {
              spec_id: 2,
              value: 'opt1'
            },
            {
              spec_id: 3,
              value: ''
            }
          ],
          elements: []
        }
      ],
      tracks: []
    }
  };
  return Promise.resolve({
    data: {
      data: res
    }
  });
}

export async function getJobAnnotations(taskId: string) {
  const result = await getTaskResult(taskId);
  return Promise.resolve({ data: result.data.data.result });
}

export async function getTask(requirementId?: string) {
  const searchParams = new URLSearchParams(location.search);
  const rId = requirementId || searchParams.get('rId');
  // const { data: res } = await UAPI.RES.leGetTask({}).post({requerment_id: rId}).inRegion().do();
  const res = {
    task_id: 5,
    item_path: 'https://dummyimage.com/600',
    item_type: 2,
    requerment_info: {
      name: '需求名称',
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

export async function getJobMeta(requirementId?: string) {
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

export async function getLabels(requirementId: string) {
  // const { data: res } = await UAPI.RES.leGetLabels({}).post({requerment_id: requirementId}).inRegion().do();
  const res = {
    file_labels: [],
    labels: [
      {
        id: 1,
        order_num: 1,
        label_name_cn: '标签1',
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
        label_name_cn: '标签2',
        label_name_en: '',
        label_shape: 3,
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
      }
    ]
  };
  return Promise.resolve({ data: { data: res } });
}

export async function getJobLabels(requirementId?: string) {
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
        values:
          attr.attribute_group_class === 3
            ? ['']
            : attr.label_info_attribute
                .filter((la) => la.input_type === 1)
                .map((la) => la.attribute_name_cn),
        keys: attr.label_info_attribute
          .filter((la) => la.input_type === 1)
          .map((la) => la.attribute_name_en)
      });
    }
    labels.push(labelTpl);
  }
  return Promise.resolve({
    data: { count: labels.length, next: null, previous: null, results: labels }
  });
}
