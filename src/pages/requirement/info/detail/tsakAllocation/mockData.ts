/**
 * 任务分配 Mock 数据
 */

export const mockRequirementDetail = {
  pkg_infos: [
    {
      front_pkg_id: 1,
      pkg_name: '内容文案 C',
      pkg_task_cnt: 1000,
      label_operate: {
        own_type: 2, // 2-部门
        org_id: ['org_1', 'org_2', 'org_3'],
        org_names: ['标注3组', '标注2组', '标注1组'],
        user_id: [],
        user_names: []
      },
      qc_operate: [
        {
          own_type: 1, // 1-个人
          org_id: [],
          org_names: [],
          user_id: ['user_1', 'user_2', 'user_3'],
          user_names: ['张三', '李四', '王五']
        },
        {
          own_type: 1, // 1-个人
          org_id: [],
          org_names: [],
          user_id: ['user_1', 'user_2', 'user_3'],
          user_names: ['张三', '李四', '王五']
        }
      ]
    },
    {
      front_pkg_id: 2,
      pkg_name: '内容文案 C',
      pkg_task_cnt: 1000,
      label_operate: {
        own_type: 2,
        org_id: ['org_1', 'org_2', 'org_3'],
        org_names: ['标注3组', '标注2组', '标注1组'],
        user_id: [],
        user_names: []
      },
      qc_operate: [
        {
          own_type: 1,
          org_id: [],
          org_names: [],
          user_id: ['user_1', 'user_2', 'user_3'],
          user_names: ['张三', '李四', '王五']
        },
        {
          own_type: 1,
          org_id: [],
          org_names: [],
          user_id: ['user_1', 'user_2', 'user_3'],
          user_names: ['张三', '李四', '王五']
        }
      ]
    }
  ]
};
