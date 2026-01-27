import UAPI from '@/api';

// 需求列表
export async function getAnnotationList(params: {
  page: number; // 页码
  page_size: number; // 每页数量
  filters: {
    keyword: string; // 搜索关键词
  };
}) {
  return await UAPI.RES.getAnnotationListApi({}).post(params).inRegion().do();
}

// 标注下载结果
export async function getAnnotationDownload(params: {
  requirement_id: number; // 需求id
}) {
  return await UAPI.RES.getAnnotationDownloadApi({})
    .post(params)
    .inRegion()
    .do();
}

// 任务列表获取
export async function getAnnotationTaskList(params: {
  page: number; // 页码
  pageSize: number; // 每页数量
  filters: {
    name: string; // 需求名称
    type: number; // 创建人
    belong: number; // 创建人
  };
}) {
  return await UAPI.RES.getAnnotationTaskListApi({})
    .post(params)
    .inRegion()
    .do();
}

// 需求发布接口
export async function publishRequirement(params: {
  name: string;
  description: string;
  label_type: number | string; //文本1，图片2，音频3，视频4）
  label_count: number; //数据量（所有数据集之和）
  team_type: number | string; //1个人，2部门

  label_tool: {
    //标注工具配置
    label_tool_name: string;
    label_tool_code: string;
    image_out_of_bounds: number; //图片外标注，1是，0否
  };
  file_labels: [
    //文件分类标签配置
    {
      attribute_group_name: string; //属性组名称
      attribute_group_class: number; //1单选/2多选/3输入框
      attribute_group_type: number; //1必选/2非必选
      file_label_attribute: [
        {
          attribute_name_cn: string; //属性中文名称(展示名称)
          attribute_name_en: string; //属性英文名称(存储名称)
          input_type: number; //输入类型：1选项，2输入框
        }
      ];
    }
  ];
  label_data_set: [
    // 配置数据集
    {
      dir_name: string;
      load_start_time: string;
      load_end_time: string;
      load_num: number; //数据量,
      create_by: string; //创建人
      run_id: string; // 运行id
    }
  ];
  labels: [
    //配置标签
    {
      label_name_cn: string; //展示名称
      label_name_en: string; //存储名称
      label_shape: number; //标注形状，点1，线2，正方形3，多边形4
      label_colour: string; //标签颜色（如#FFFFFF）
      label_info_attribute_groups: [
        {
          attribute_group_name: string; //属性组名称
          attribute_group_class: number; //1单选/2多选/3输入框
          attribute_group_type: number; //1必选/2非必选
          label_info_attribute: [
            {
              attribute_name_cn: string; //属性中文名称(展示名称)
              attribute_name_en: string; //属性英文名称(存储名称)
              input_type: number; //输入类型：1选项，2输入框
            }
          ];
        }
      ];
    }
  ];
  entity_relations: [
    //文本标签-实体关系
    {
      relation_name_cn: string;
      relation_name_en: string;
      start_entity_labels: Array<string>; //起始标签，标签的存储名称
      target_entity_labels: Array<string>; //目标(结束)标签
      colour: string;
    },
    {
      relation_name_cn: string;
      relation_name_en: string;
      start_entity_labels: Array<string>;
      target_entity_labels: Array<string>;
      colour: string;
    }
  ];
  label_operate: [
    //配置标注人员
    {
      user_id?: Array<string>; //标注人员id，如果是“选择个人”，就传user_id
      org_id?: Array<string>; //组织id，如果是“选择部门”，就传org_id
    }
  ];
}) {
  return await UAPI.RES.publishRequirementApi({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 需求详情查看
export async function getRequirementDetail(params: { requirement_id: number }) {
  return await UAPI.RES.getRequirementDetailApi({})
    .post({ ...params })
    .inRegion()
    .do();
}

//  查询标注数据表格内容
export async function getAnnotationTabledData(params: {
  page: number;
  page_size: number;
  data_path_id: number;
  start: string;
  end: string;
  file_type: string[];
  sort_by: 'start_time'; // 或结束时间 "end_time"，默认按开始时间
  sort: 'asc'; // 排序方式("asc"升序,"desc"降序),默认desc
}) {
  return await UAPI.RES.getAnnotationTabledDataApi({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 模型列表
export async function getModelList(params) {
  return await UAPI.RES.getModelList({}).post(params).inRegion().do();
}

// 获取模型标签信息
export async function getModelLabelList(params) {
  return await UAPI.RES.getModelLabelList({}).post(params).inRegion().do();
}

// 编辑需求
export async function editRequirement(params) {
  return await UAPI.RES.editRequirementApi({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 需求进度
export async function getProgressRequirement(params: {
  req_id: number; // 需求id，从URL的id参数获取并转换为number
  page: number; // 页码
  page_size: number; // 每页数量
}) {
  return await UAPI.RES.getProgressRequirement({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 需求明细
export async function detailRequirement(params: {
  req_id: number; // 需求id，从URL的id参数获取并转换为number
  search_content: string; // 搜索内容
  page: number; // 页码
  page_size: number; // 每页数量
  sort?: Array<{ field: string; order: 'desc' | 'asc' }>; // 排序字段，可选
  filters?: {
    task_status_list?: number[]; // 任务状态列表
    task_process_list?: number[]; // 任务工序列表
  }; // 筛选条件，可选
}) {
  return await UAPI.RES.detailRequirement({})
    .post({ ...params })
    .inRegion()
    .do();
}
// 生成记录列表
export async function downloadRecord(params: {
  req_id: number; // 需求id
  page: number; // 页码
  page_size: number; // 每页数量
}) {
  return await UAPI.RES.downloadRecord({})
    .post({ ...params })
    .inRegion()
    .do();
}
// 质检任务列表
export async function listQualityControlTasks(params) {
  return await UAPI.RES.listQualityControlTasks({})
    .post({ ...params })
    .inRegion()
    .do();
}
// 设置抽检任务
export async function manageQCTaskBatch(params) {
  return await UAPI.RES.manageQCTaskBatch({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 获取质检任务包统计数据
export async function getQualityControlTaskStatistics(params) {
  return await UAPI.RES.getQualityControlTaskStatistics({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 批量处理抽检
export async function batchManageQCTaskBatch(params) {
  return await UAPI.RES.batchManageQCTaskBatch({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 批量管理抽检包任务
export async function manageQCTaskSampledBatch(params) {
  return await UAPI.RES.manageQCTaskSampledBatch({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 抽检任务列表
export async function listQualityControlTaskSamples(params) {
  return await UAPI.RES.listQualityControlTaskSamples({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 生成标注结果
export async function generateAnnotationResults(params) {
  return await UAPI.RES.generateResultPkg({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 生成纪录
export async function generateRecord(params) {
  return await UAPI.RES.generateResultListPkg({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 下载生成纪录
export async function downloadGenRecord(params) {
  return await UAPI.RES.downloadGenRecord({})
    .post({ ...params })
    .withConfig({ responseType: 'blob' })
    .inRegion()
    .do({ headers: { 'need-header-data': 'true' } });
}

// 删除需求
export async function deleteRequirement(params) {
  return await UAPI.RES.deleteRequirement({})
    .post({ ...params })
    .inRegion()
    .do();
}
