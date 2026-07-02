/**
 * 联合作战本体种子数据
 * 来源：docs/联合作战.txt（JSON-LD @context + @graph）
 */
import { LinkType } from '@/types/graphApi';

export interface JointOpsPropertySeed {
  name: string;
  comment: string;
  columnType: string;
  isPrimary?: boolean;
}

export interface JointOpsObjectTypeSeed {
  code: string;
  name: string;
  description: string;
  icon: string;
  properties: JointOpsPropertySeed[];
}

export interface JointOpsLinkSeed {
  code: string;
  name: string;
  description?: string;
  type: LinkType;
  /** 源对象类型 code（链接 1:N 时为一端） */
  sourceCode: string;
  /** 目标对象类型 code */
  targetCode: string;
}

const prop = (
  name: string,
  comment: string,
  columnType: string,
  isPrimary = false
): JointOpsPropertySeed => ({
  name,
  comment,
  columnType,
  isPrimary
});

/** 与 docs/联合作战.txt 中 @type 对齐的 7 类对象 */
export const JOINT_OPERATIONS_OBJECT_TYPES: JointOpsObjectTypeSeed[] = [
  {
    code: 'military_action',
    name: '军事行动',
    description:
      '对应 JSON-LD MilitaryAction（Mission），含任务、打击与效果评估属性',
    icon: 'combat-scene',
    properties: [
      prop('id', '主键', 'int', true),
      prop('object_name', '对象名称', 'varchar(200)'),
      prop('object_category', '对象分类', 'varchar(100)'),
      prop('mission_id', '任务编号', 'varchar(64)'),
      prop('mission_subtype', '任务子类型', 'varchar(100)'),
      prop('target_location_id', '目标位置ID', 'int'),
      prop('executor_unit_id', '执行单位ID', 'int'),
      prop('assigned_platform_id', '分配平台ID', 'int'),
      prop('weapon_id', '武器ID', 'int'),
      prop('start_time', '开始时间', 'datetime(6)'),
      prop('planned_end_time', '计划结束时间', 'datetime(6)'),
      prop('effect_radius_m', '效果半径(米)', 'float'),
      prop('intensity_level', '强度等级', 'int'),
      prop('actual_effect_score', '实际效果评分', 'int'),
      prop('status', '状态', 'varchar(32)')
    ]
  },
  {
    code: 'naval_platform',
    name: '海军平台',
    description: '对应 JSON-LD NavalPlatform（NavalVehicle）',
    icon: 'object-type-warship',
    properties: [
      prop('id', '主键', 'int', true),
      prop('object_name', '对象名称', 'varchar(200)'),
      prop('object_category', '对象分类', 'varchar(100)'),
      prop('platform_code', '平台编码', 'varchar(64)'),
      prop('platform_class', '平台型号', 'varchar(100)'),
      prop('commission_date', '服役日期', 'date'),
      prop('current_location_id', '当前位置ID', 'int'),
      prop('max_speed_knots', '最大航速(节)', 'float'),
      prop('crew_size', '编制人数', 'int'),
      prop('armament_config', '武器配置', 'varchar(500)'),
      prop('fuel_capacity_tons', '燃油容量(吨)', 'float'),
      prop('combat_status', '作战状态', 'varchar(32)')
    ]
  },
  {
    code: 'air_platform',
    name: '空中平台',
    description: '对应 JSON-LD AirPlatform（AirVehicle）',
    icon: 'object-type-fighter',
    properties: [
      prop('id', '主键', 'int', true),
      prop('object_name', '对象名称', 'varchar(200)'),
      prop('object_category', '对象分类', 'varchar(100)'),
      prop('platform_code', '平台编码', 'varchar(64)'),
      prop('platform_model', '平台型号', 'varchar(100)'),
      prop('first_flight_date', '首飞日期', 'date'),
      prop('current_location_id', '当前位置ID', 'int'),
      prop('max_speed_kmh', '最大速度(km/h)', 'float'),
      prop('combat_radius_km', '作战半径(km)', 'float'),
      prop('armament_capacity_kg', '载弹量(kg)', 'float'),
      prop('crew_size', '编制人数', 'int'),
      prop('combat_status', '作战状态', 'varchar(32)')
    ]
  },
  {
    code: 'ground_platform',
    name: '地面平台',
    description: '对应 JSON-LD GroundPlatform（GroundVehicle）',
    icon: 'object-type-drone',
    properties: [
      prop('id', '主键', 'int', true),
      prop('object_name', '对象名称', 'varchar(200)'),
      prop('object_category', '对象分类', 'varchar(100)'),
      prop('platform_code', '平台编码', 'varchar(64)'),
      prop('platform_model', '平台型号', 'varchar(100)'),
      prop('max_range_km', '最大射程(km)', 'float'),
      prop('rate_of_fire_rpm', '射速(发/分)', 'int'),
      prop('current_location_id', '当前位置ID', 'int'),
      prop('max_speed_kmh', '最大速度(km/h)', 'float'),
      prop('crew_size', '编制人数', 'int'),
      prop('combat_status', '作战状态', 'varchar(32)')
    ]
  },
  {
    code: 'weapon',
    name: '武器弹药',
    description: '对应 JSON-LD Weapon（WeaponSystem）',
    icon: 'object-type-2',
    properties: [
      prop('id', '主键', 'int', true),
      prop('object_name', '对象名称', 'varchar(200)'),
      prop('object_category', '对象分类', 'varchar(100)'),
      prop('weapon_code', '武器编码', 'varchar(64)'),
      prop('weapon_type', '武器类型', 'varchar(64)'),
      prop('caliber_mm', '口径(mm)', 'float'),
      prop('max_range_km', '最大射程(km)', 'float'),
      prop('cep_m', '圆概率误差(m)', 'float'),
      prop('warhead_type', '战斗部类型', 'varchar(64)'),
      prop('warhead_weight_kg', '战斗部重量(kg)', 'float'),
      prop('compatible_platforms', '兼容平台', 'varchar(500)')
    ]
  },
  {
    code: 'military_unit',
    name: '军事单位',
    description: '对应 JSON-LD MilitaryUnit（Organization）',
    icon: 'object-type-office',
    properties: [
      prop('id', '主键', 'int', true),
      prop('object_name', '对象名称', 'varchar(200)'),
      prop('object_category', '对象分类', 'varchar(100)'),
      prop('unit_code', '单位编码', 'varchar(64)'),
      prop('unit_level', '单位级别', 'varchar(32)'),
      prop('parent_unit_id', '上级单位ID', 'int'),
      prop('commander_name', '指挥员', 'varchar(64)'),
      prop('unit_strength', '编制实力', 'int'),
      prop('station_location_id', '驻地位置ID', 'int'),
      prop('combat_readiness', '战备等级', 'varchar(32)')
    ]
  },
  {
    code: 'geographic_location',
    name: '地理位置',
    description: '对应 JSON-LD GeographicLocation（Location）',
    icon: 'object-type-location',
    properties: [
      prop('id', '主键', 'int', true),
      prop('object_name', '对象名称', 'varchar(200)'),
      prop('object_category', '对象分类', 'varchar(100)'),
      prop('location_code', '位置编码', 'varchar(64)'),
      prop('longitude', '经度', 'decimal(12,6)'),
      prop('latitude', '纬度', 'decimal(12,6)'),
      prop('altitude_m', '海拔(米)', 'float'),
      prop('terrain_type', '地形类型', 'varchar(64)'),
      prop('control_side', '控制方', 'varchar(32)'),
      prop('strategic_importance', '战略重要性', 'int')
    ]
  }
];

/**
 * 由 @graph 内外键关系推导的链接类型
 * ONE_TO_MANY：源端 1，目标端 N
 */
export const JOINT_OPERATIONS_LINK_TYPES: JointOpsLinkSeed[] = [
  {
    code: 'location_target_of_action',
    name: '行动目标位置',
    description: 'targetLocationId：地理位置 → 军事行动',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'geographic_location',
    targetCode: 'military_action'
  },
  {
    code: 'unit_executes_action',
    name: '单位执行行动',
    description: 'executorUnitId：军事单位 → 军事行动',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'military_unit',
    targetCode: 'military_action'
  },
  {
    code: 'weapon_used_in_action',
    name: '行动使用武器',
    description: 'weaponId：武器弹药 → 军事行动',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'weapon',
    targetCode: 'military_action'
  },
  {
    code: 'unit_parent_child',
    name: '单位隶属',
    description: 'parentUnitId：上级军事单位 → 下级军事单位',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'military_unit',
    targetCode: 'military_unit'
  },
  {
    code: 'location_station_of_unit',
    name: '单位驻地',
    description: 'stationLocationId：地理位置 → 军事单位',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'geographic_location',
    targetCode: 'military_unit'
  },
  {
    code: 'location_current_naval',
    name: '海军平台当前位置',
    description: 'currentLocationId（海军）',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'geographic_location',
    targetCode: 'naval_platform'
  },
  {
    code: 'location_current_air',
    name: '空中平台当前位置',
    description: 'currentLocationId（空中）',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'geographic_location',
    targetCode: 'air_platform'
  },
  {
    code: 'location_current_ground',
    name: '地面平台当前位置',
    description: 'currentLocationId（地面）',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'geographic_location',
    targetCode: 'ground_platform'
  },
  {
    code: 'naval_platform_assigned_action',
    name: '海军平台参与行动',
    description: 'assignedPlatformId（海军平台实例）',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'naval_platform',
    targetCode: 'military_action'
  },
  {
    code: 'air_platform_assigned_action',
    name: '空中平台参与行动',
    description: 'assignedPlatformId（空中平台实例）',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'air_platform',
    targetCode: 'military_action'
  },
  {
    code: 'ground_platform_assigned_action',
    name: '地面平台参与行动',
    description: 'assignedPlatformId（地面平台实例）',
    type: LinkType.ONE_TO_MANY,
    sourceCode: 'ground_platform',
    targetCode: 'military_action'
  }
];

export const JOINT_OPERATIONS_ONTOLOGY_NAME = '联合作战';

export const isJointOperationsOntologyName = (name?: string) =>
  !!name && name.includes(JOINT_OPERATIONS_ONTOLOGY_NAME);
