import { create } from './../../integration-tests-cypress/support/index';
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

// 任务列表获取
export async function getAnnotationTaskList(params: {
  page: number; // 页码
  page_size: number; // 每页数量
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
    // image_out_of_bounds: number //图片外标注，1是，0否
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
