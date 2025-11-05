export const allData = [
  {
    key: '1',
    name: 'Jane Doe',
    salary: 23000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'jane.doe@example.com'
  },
  {
    key: '2',
    name: 'Alisa Ross',
    salary: 25000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'alisa.ross@example.com'
  },
  {
    key: '3',
    name: 'Kevin Sandra',
    salary: 22000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'kevin.sandra@example.com'
  },
  {
    key: '4',
    name: 'Ed Hellen',
    salary: 17000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'ed.hellen@example.com'
  },
  {
    key: '5',
    name: 'William Smith',
    salary: 27000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'william.smith@example.com'
  },
  {
    key: '14',
    name: 'William Smith',
    salary: 27000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'william.smith@example.com'
  },
  {
    key: '13',
    name: 'William Smith',
    salary: 27000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'william.smith@example.com'
  },
  {
    key: '6',
    name: 'William Smith',
    salary: 27000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'william.smith@example.com'
  },
  {
    key: '7',
    name: 'William Smith',
    salary: 27000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'william.smith@example.com'
  },
  {
    key: '8',
    name: 'William Smith',
    salary: 27000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'william.smith@example.com'
  },
  {
    key: '9',
    name: 'William Smith',
    salary: 27000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'william.smith@example.com'
  },
  {
    key: '10',
    name: 'William Smith',
    salary: 27000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'william.smith@example.com'
  },
  {
    key: '11',
    name: 'William Smith',
    salary: 27000,
    address: ['标签值1', '标签值2', '标签值3'],
    email: 'william.smith@example.com'
  },
  {
    key: '12',
    name: 'William Smith',
    salary: 27000,
    address: '72 Park Road, London',
    email: 'william.smith@example.com'
  }
];
export const TAG_ELEMT = {
  CREATE: 'CREATE_TAG',
  EDIT: 'EDIT_TAG',
  DEL: 'DEL_TAG'
};
// 新增模态框
export const AddCalTitle = {
  title: '确定取消吗？',
  text: '取消后已填写的内容将被清空且无法恢复，请问是否继续？'
};
// 编辑确认模态框
export const DelTitle = {
  title: '确定删除标签吗？',
  text: '删除后将会影响所有已关联该标签的文件，是否确定当前操作？'
};
// 删除确认模态框
export const EditOkTitle = {
  title: '确定修改标签设置吗？',
  text: '确认后将会影响所有已关联该标签的文件，是否继续当前操作？'
};
export const dataList = {
  total_count: 24,
  tag_type_dtos: [
    {
      id: 'tagkey_env_001',
      key_name: 'env',
      description: '环境标签',
      value_type: 1,
      values: [
        { id: 'tag_env_dev_001', value: 'dev' },
        { id: 'tag_env_test_001', value: 'test' },
        { id: 'tag_env_prod_001', value: 'prod' },
        { id: 'tag_env_staging_001', value: 'staging' },
        { id: 'tag_env_qa_001', value: 'qa' },
        { id: 'tag_env_preview_001', value: 'preview' },
        { id: 'tag_env_beta_001', value: 'beta' },
        { id: 'tag_env_canary_001', value: 'canary' },
        { id: 'tag_env_hotfix_001', value: 'hotfix' },
        { id: 'tag_env_maintenance_001', value: 'maintenance' }
      ]
    },
    {
      id: 'tagkey_priority_001',
      key_name: 'priority',
      description: '优先级标签',
      value_type: 1,
      values: [
        { id: 'tag_priority_high_001', value: 'high' },
        { id: 'tag_priority_medium_001', value: 'medium' },
        { id: 'tag_priority_low_001', value: 'low' },
        { id: 'tag_priority_critical_001', value: 'critical' },
        { id: 'tag_priority_urgent_001', value: 'urgent' }
      ]
    },
    {
      id: 'tagkey_status_001',
      key_name: 'status',
      description: '状态标签',
      value_type: 1,
      values: [
        { id: 'tag_status_active_001', value: 'active' },
        { id: 'tag_status_inactive_001', value: 'inactive' },
        { id: 'tag_status_pending_001', value: 'pending' },
        { id: 'tag_status_completed_001', value: 'completed' },
        { id: 'tag_status_cancelled_001', value: 'cancelled' }
      ]
    },
    {
      id: 'tagkey_region_001',
      key_name: 'region',
      description: '地域标签',
      value_type: 1,
      values: [
        { id: 'tag_region_us_east_001', value: 'us-east' },
        { id: 'tag_region_cn_beijing_001', value: 'cn-beijing' },
        { id: 'tag_region_eu_west_001', value: 'eu-west' },
        { id: 'tag_region_ap_south_001', value: 'ap-south' },
        { id: 'tag_region_us_west_001', value: 'us-west' },
        { id: 'tag_region_sg_singapore_001', value: 'sg-singapore' },
        { id: 'tag_region_kr_seoul_001', value: 'kr-seoul' },
        { id: 'tag_region_cn_shanghai_001', value: 'cn-shanghai' },
        { id: 'tag_region_us_central_001', value: 'us-central' },
        { id: 'tag_region_au_sydney_001', value: 'au-sydney' },
        { id: 'tag_region_eu_central_001', value: 'eu-central' },
        { id: 'tag_region_ca_toronto_001', value: 'ca-toronto' },
        { id: 'tag_region_in_mumbai_001', value: 'in-mumbai' },
        { id: 'tag_region_jp_tokyo_001', value: 'jp-tokyo' },
        { id: 'tag_region_tw_taipei_001', value: 'tw-taipei' },
        { id: 'tag_region_br_saopaulo_001', value: 'br-saopaulo' },
        { id: 'tag_region_hk_hongkong_001', value: 'hk-hongkong' },
        { id: 'tag_region_fr_paris_001', value: 'fr-paris' },
        { id: 'tag_region_uk_london_001', value: 'uk-london' },
        { id: 'tag_region_de_frankfurt_001', value: 'de-frankfurt' }
      ]
    }
  ]
};
