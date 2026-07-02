import type { DataResourceTable } from '../types';

/** 数据资源元数据目录（车辆运维 + 大型运输公司标准化主数据） */
export const DATA_RESOURCE_CATALOG: DataResourceTable[] = [
  {
    id: '1',
    databaseType: 'PostgreSQL',
    tableName: 'vehicle',
    tableComment: '车辆基础主数据',
    fields: [
      { fieldName: 'vin', fieldComment: 'VIN 码', fieldType: 'varchar(32)' },
      {
        fieldName: 'plate_number',
        fieldComment: '车牌号码',
        fieldType: 'varchar(20)'
      },
      {
        fieldName: 'brand_model',
        fieldComment: '品牌型号',
        fieldType: 'varchar(100)'
      },
      {
        fieldName: 'purchase_date',
        fieldComment: '车辆购置日期',
        fieldType: 'date'
      },
      {
        fieldName: 'current_mileage',
        fieldComment: '当前行驶里程',
        fieldType: 'decimal(12,2)'
      },
      {
        fieldName: 'engine_work_hours',
        fieldComment: '发动机累计工作小时',
        fieldType: 'decimal(10,2)'
      },
      {
        fieldName: 'fleet_code',
        fieldComment: '归属车队编码',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'vehicle_status',
        fieldComment: '车辆当前状态（枚举：运行 / 停用 / 维修中）',
        fieldType: 'enum'
      }
    ]
  },
  {
    id: '2',
    databaseType: 'PostgreSQL',
    tableName: 'asset_component',
    tableComment: '总成及车载部件主数据',
    fields: [
      {
        fieldName: 'component_no',
        fieldComment: '部件编号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'serial_number',
        fieldComment: '出厂序列号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'component_type',
        fieldComment: '部件类型（枚举：发动机 / 变速箱 / 制冷机）',
        fieldType: 'enum'
      },
      {
        fieldName: 'install_date',
        fieldComment: '部件装车安装日期',
        fieldType: 'date'
      },
      {
        fieldName: 'design_life',
        fieldComment: '部件设计使用寿命',
        fieldType: 'int'
      },
      {
        fieldName: 'vehicle_vin',
        fieldComment: '所属车辆 VIN（外键关联 vehicle 表）',
        fieldType: 'varchar(32)'
      }
    ]
  },
  {
    id: '3',
    databaseType: 'PostgreSQL',
    tableName: 'failure_mode',
    tableComment: '故障模式标准字典',
    fields: [
      {
        fieldName: 'failure_code',
        fieldComment: '故障编码',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'failure_desc',
        fieldComment: '故障文字描述',
        fieldType: 'text'
      },
      {
        fieldName: 'severity_level',
        fieldComment: '故障严重级别',
        fieldType: 'varchar(16)'
      },
      {
        fieldName: 'safety_risk_flag',
        fieldComment: '是否涉及安全隐患（布尔标识）',
        fieldType: 'boolean'
      },
      {
        fieldName: 'typical_symptom',
        fieldComment: '故障典型症状',
        fieldType: 'text'
      }
    ]
  },
  {
    id: '4',
    databaseType: 'PostgreSQL',
    tableName: 'work_order',
    tableComment: '维修工单业务单据',
    fields: [
      {
        fieldName: 'work_order_no',
        fieldComment: '工单编号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'order_type',
        fieldComment: '工单类型（枚举：计划 / 突发 / 事故）',
        fieldType: 'enum'
      },
      {
        fieldName: 'order_status',
        fieldComment: '工单处理状态',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'created_at',
        fieldComment: '工单创建时间',
        fieldType: 'timestamp'
      },
      {
        fieldName: 'closed_at',
        fieldComment: '工单关闭时间',
        fieldType: 'timestamp'
      },
      {
        fieldName: 'repair_duration',
        fieldComment: '实际维修时长',
        fieldType: 'int'
      },
      {
        fieldName: 'downtime_flag',
        fieldComment: '是否造成车辆停运（布尔标识）',
        fieldType: 'boolean'
      },
      {
        fieldName: 'vin',
        fieldComment: '问题车辆（VIN）（外键关联 vehicle 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'technician_no',
        fieldComment: '指派技师（技师工号）（外键关联 technician 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'failure_code',
        fieldComment: '关联故障编码（外键关联 failure_mode 表）',
        fieldType: 'varchar(32)'
      }
    ]
  },
  {
    id: '5',
    databaseType: 'PostgreSQL',
    tableName: 'maintenance_task',
    tableComment: '标准维修作业主数据',
    fields: [
      {
        fieldName: 'task_desc',
        fieldComment: '作业内容描述',
        fieldType: 'text'
      },
      {
        fieldName: 'standard_hours',
        fieldComment: '标准核定工时',
        fieldType: 'decimal(8,2)'
      },
      {
        fieldName: 'parts_bom',
        fieldComment: '配套备件物料清单',
        fieldType: 'jsonb'
      },
      {
        fieldName: 'skill_tags',
        fieldComment: '作业所需技能标签',
        fieldType: 'varchar(256)'
      },
      {
        fieldName: 'sop_url',
        fieldComment: 'SOP 标准作业程序链接地址',
        fieldType: 'varchar(512)'
      }
    ]
  },
  {
    id: '6',
    databaseType: 'PostgreSQL',
    tableName: 'part',
    tableComment: '备品备件库存主数据',
    fields: [
      {
        fieldName: 'part_no',
        fieldComment: '零件编号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'part_name',
        fieldComment: '备件名称',
        fieldType: 'varchar(128)'
      },
      {
        fieldName: 'part_category',
        fieldComment: '备件品类',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'unit_cost',
        fieldComment: '单件采购成本',
        fieldType: 'decimal(12,2)'
      },
      {
        fieldName: 'supplier',
        fieldComment: '合作供应商',
        fieldType: 'varchar(128)'
      },
      {
        fieldName: 'stock_qty',
        fieldComment: '现有库存数量',
        fieldType: 'int'
      },
      {
        fieldName: 'safety_stock',
        fieldComment: '安全库存阈值',
        fieldType: 'int'
      },
      {
        fieldName: 'replenish_cycle',
        fieldComment: '备件补货周期',
        fieldType: 'int'
      }
    ]
  },
  {
    id: '7',
    databaseType: 'PostgreSQL',
    tableName: 'technician',
    tableComment: '维修技师人员主数据',
    fields: [
      {
        fieldName: 'technician_no',
        fieldComment: '技师工号',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'skill_tags',
        fieldComment: '技能标签',
        fieldType: 'varchar(256)'
      },
      {
        fieldName: 'workshop_code',
        fieldComment: '所属维修厂编码（外键关联 workshop 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'availability',
        fieldComment: '当前在岗可用性',
        fieldType: 'boolean'
      }
    ]
  },
  {
    id: '8',
    databaseType: 'PostgreSQL',
    tableName: 'workshop',
    tableComment: '维修场站资源主数据',
    fields: [
      {
        fieldName: 'workshop_code',
        fieldComment: '所属维修厂编码',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'location',
        fieldComment: '站点地理位置',
        fieldType: 'varchar(256)'
      },
      {
        fieldName: 'service_capability',
        fieldComment: '维修服务能力（可选：发动机维修 / 一般保养）',
        fieldType: 'varchar(128)'
      },
      {
        fieldName: 'hourly_rate',
        fieldComment: '场站工时费率',
        fieldType: 'decimal(10,2)'
      }
    ]
  },
  {
    id: '9',
    databaseType: 'PostgreSQL',
    tableName: 'trip',
    tableComment: '运输调度任务单据',
    fields: [
      {
        fieldName: 'route',
        fieldComment: '运输路线',
        fieldType: 'varchar(512)'
      },
      {
        fieldName: 'planned_departure',
        fieldComment: '计划出发时间',
        fieldType: 'timestamp'
      },
      {
        fieldName: 'planned_arrival',
        fieldComment: '计划到达时间',
        fieldType: 'timestamp'
      },
      {
        fieldName: 'customer_info',
        fieldComment: '合作客户信息',
        fieldType: 'varchar(256)'
      },
      {
        fieldName: 'priority',
        fieldComment: '任务优先级',
        fieldType: 'int'
      },
      {
        fieldName: 'vehicle_vin',
        fieldComment: '指派车辆 VIN（外键关联 vehicle 表）',
        fieldType: 'varchar(32)'
      }
    ]
  },
  {
    id: '10',
    databaseType: 'PostgreSQL',
    tableName: 'sensor_channel',
    tableComment: '车载传感采集配置主数据',
    fields: [
      {
        fieldName: 'channel_id',
        fieldComment: '传感通道编号',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'asset_ref',
        fieldComment: '关联车辆 / 总成编号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'metric_name',
        fieldComment: '监测指标名称（冷却液温度 / 机油压力 / DPF 压差）',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'sample_rate',
        fieldComment: '传感数据采样频率',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'unit',
        fieldComment: '监测指标单位',
        fieldType: 'varchar(16)'
      }
    ]
  },
  // —— 大型运输公司（顺达物流集团）业务域 ——
  {
    id: '11',
    databaseType: 'PostgreSQL',
    tableName: 'fleet_org',
    tableComment: '车队组织主数据',
    fields: [
      {
        fieldName: 'fleet_code',
        fieldComment: '车队编码',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'fleet_name',
        fieldComment: '车队名称',
        fieldType: 'varchar(128)'
      },
      {
        fieldName: 'parent_fleet_code',
        fieldComment: '上级车队编码',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'region',
        fieldComment: '所属区域（枚举：华东 / 华南 / 华北 / 西南）',
        fieldType: 'enum'
      },
      {
        fieldName: 'manager_name',
        fieldComment: '车队负责人',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'vehicle_count',
        fieldComment: '在编车辆数',
        fieldType: 'int'
      }
    ]
  },
  {
    id: '12',
    databaseType: 'PostgreSQL',
    tableName: 'driver',
    tableComment: '驾驶员主数据',
    fields: [
      {
        fieldName: 'driver_no',
        fieldComment: '驾驶员工号',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'driver_name',
        fieldComment: '驾驶员姓名',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'license_type',
        fieldComment: '准驾车型（枚举：A2 / B2 / C1）',
        fieldType: 'enum'
      },
      {
        fieldName: 'license_expire_date',
        fieldComment: '驾驶证有效期',
        fieldType: 'date'
      },
      {
        fieldName: 'fleet_code',
        fieldComment: '所属车队编码（外键关联 fleet_org 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'employment_status',
        fieldComment: '在岗状态（枚举：在岗 / 休假 / 离职）',
        fieldType: 'enum'
      },
      {
        fieldName: 'safety_score',
        fieldComment: '安全驾驶评分',
        fieldType: 'decimal(5,2)'
      }
    ]
  },
  {
    id: '13',
    databaseType: 'PostgreSQL',
    tableName: 'shipper_customer',
    tableComment: '托运客户主数据',
    fields: [
      {
        fieldName: 'customer_code',
        fieldComment: '客户编码',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'customer_name',
        fieldComment: '客户名称',
        fieldType: 'varchar(256)'
      },
      {
        fieldName: 'customer_type',
        fieldComment: '客户类型（枚举：合同客户 / 散单客户 / 战略客户）',
        fieldType: 'enum'
      },
      {
        fieldName: 'credit_level',
        fieldComment: '信用等级（枚举：A / B / C）',
        fieldType: 'enum'
      },
      {
        fieldName: 'settlement_cycle',
        fieldComment: '结算周期（天）',
        fieldType: 'int'
      },
      {
        fieldName: 'contact_phone',
        fieldComment: '业务联系电话',
        fieldType: 'varchar(20)'
      }
    ]
  },
  {
    id: '14',
    databaseType: 'PostgreSQL',
    tableName: 'transport_order',
    tableComment: '运输订单业务单据',
    fields: [
      {
        fieldName: 'order_no',
        fieldComment: '运输订单号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'customer_code',
        fieldComment: '托运客户编码（外键关联 shipper_customer 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'cargo_name',
        fieldComment: '货物名称',
        fieldType: 'varchar(128)'
      },
      {
        fieldName: 'cargo_weight_ton',
        fieldComment: '货物重量（吨）',
        fieldType: 'decimal(12,3)'
      },
      {
        fieldName: 'origin_site_code',
        fieldComment: '发货站点编码（外键关联 loading_site 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'dest_site_code',
        fieldComment: '收货站点编码（外键关联 loading_site 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'route',
        fieldComment: '运输路线',
        fieldType: 'varchar(512)'
      },
      {
        fieldName: 'vehicle_vin',
        fieldComment: '车辆（VIN）（外键关联 vehicle 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'order_status',
        fieldComment: '订单状态（枚举：待调度 / 运输中 / 已签收 / 已取消）',
        fieldType: 'enum'
      },
      {
        fieldName: 'required_delivery_time',
        fieldComment: '要求送达时间',
        fieldType: 'timestamp'
      }
    ]
  },
  {
    id: '15',
    databaseType: 'PostgreSQL',
    tableName: 'waybill',
    tableComment: '运单业务单据',
    fields: [
      {
        fieldName: 'waybill_no',
        fieldComment: '运单号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'order_no',
        fieldComment: '关联运输订单号（外键关联 transport_order 表）',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'vehicle_vin',
        fieldComment: '承运车辆 VIN（外键关联 vehicle 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'driver_no',
        fieldComment: '承运驾驶员工号（外键关联 driver 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'dispatch_time',
        fieldComment: '派车时间',
        fieldType: 'timestamp'
      },
      {
        fieldName: 'departure_time',
        fieldComment: '实际发车时间',
        fieldType: 'timestamp'
      },
      {
        fieldName: 'sign_time',
        fieldComment: '签收时间',
        fieldType: 'timestamp'
      },
      {
        fieldName: 'waybill_status',
        fieldComment: '运单状态（枚举：已派车 / 在途 / 已送达 / 异常）',
        fieldType: 'enum'
      },
      {
        fieldName: 'exception_reason',
        fieldComment: '异常原因说明（仅异常状态填写）',
        fieldType: 'varchar(512)'
      }
    ]
  },
  {
    id: '16',
    databaseType: 'PostgreSQL',
    tableName: 'route_plan',
    tableComment: '运输线路主数据',
    fields: [
      {
        fieldName: 'route_code',
        fieldComment: '线路编码',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'route_name',
        fieldComment: '线路名称',
        fieldType: 'varchar(128)'
      },
      {
        fieldName: 'origin_city',
        fieldComment: '始发城市',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'dest_city',
        fieldComment: '目的城市',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'standard_mileage_km',
        fieldComment: '标准里程（公里）',
        fieldType: 'decimal(10,2)'
      },
      {
        fieldName: 'standard_transit_hours',
        fieldComment: '标准在途时长（小时）',
        fieldType: 'decimal(8,2)'
      },
      {
        fieldName: 'toll_fee_estimate',
        fieldComment: '预估过路费（元）',
        fieldType: 'decimal(10,2)'
      }
    ]
  },
  {
    id: '17',
    databaseType: 'PostgreSQL',
    tableName: 'loading_site',
    tableComment: '装卸站点主数据',
    fields: [
      {
        fieldName: 'site_code',
        fieldComment: '站点编码',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'site_name',
        fieldComment: '站点名称',
        fieldType: 'varchar(128)'
      },
      {
        fieldName: 'site_type',
        fieldComment: '站点类型（枚举：枢纽 / 分拨 / 客户门点）',
        fieldType: 'enum'
      },
      {
        fieldName: 'address',
        fieldComment: '详细地址',
        fieldType: 'varchar(512)'
      },
      {
        fieldName: 'geo_longitude',
        fieldComment: '经度',
        fieldType: 'decimal(10,6)'
      },
      {
        fieldName: 'geo_latitude',
        fieldComment: '纬度',
        fieldType: 'decimal(10,6)'
      },
      {
        fieldName: 'operating_hours',
        fieldComment: '营业时段',
        fieldType: 'varchar(64)'
      }
    ]
  },
  {
    id: '18',
    databaseType: 'PostgreSQL',
    tableName: 'freight_settlement',
    tableComment: '运费结算单据',
    fields: [
      {
        fieldName: 'settlement_no',
        fieldComment: '结算单号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'waybill_no',
        fieldComment: '关联运单号（外键关联 waybill 表）',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'customer_code',
        fieldComment: '客户编码（外键关联 shipper_customer 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'freight_amount',
        fieldComment: '应收运费（元）',
        fieldType: 'decimal(12,2)'
      },
      {
        fieldName: 'fuel_surcharge',
        fieldComment: '燃油附加费（元）',
        fieldType: 'decimal(10,2)'
      },
      {
        fieldName: 'settlement_status',
        fieldComment: '结算状态（枚举：待对账 / 已开票 / 已回款）',
        fieldType: 'enum'
      },
      {
        fieldName: 'settlement_date',
        fieldComment: '结算日期',
        fieldType: 'date'
      }
    ]
  },
  {
    id: '19',
    databaseType: 'PostgreSQL',
    tableName: 'fuel_consumption',
    tableComment: '车辆油耗记录',
    fields: [
      {
        fieldName: 'record_id',
        fieldComment: '记录编号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'vehicle_vin',
        fieldComment: '车辆 VIN（外键关联 vehicle 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'refuel_time',
        fieldComment: '加油时间',
        fieldType: 'timestamp'
      },
      {
        fieldName: 'fuel_liters',
        fieldComment: '加油量（升）',
        fieldType: 'decimal(10,2)'
      },
      {
        fieldName: 'fuel_cost',
        fieldComment: '加油金额（元）',
        fieldType: 'decimal(10,2)'
      },
      {
        fieldName: 'mileage_at_refuel',
        fieldComment: '加油时里程表读数',
        fieldType: 'decimal(12,2)'
      },
      {
        fieldName: 'fuel_station',
        fieldComment: '加油站名称',
        fieldType: 'varchar(128)'
      }
    ]
  },
  {
    id: '20',
    databaseType: 'PostgreSQL',
    tableName: 'gps_track',
    tableComment: '车辆轨迹采集事实表',
    fields: [
      {
        fieldName: 'track_id',
        fieldComment: '轨迹点编号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'vehicle_vin',
        fieldComment: '车辆 VIN（外键关联 vehicle 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'waybill_no',
        fieldComment: '关联运单号（外键关联 waybill 表）',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'collect_time',
        fieldComment: '采集时间',
        fieldType: 'timestamp'
      },
      {
        fieldName: 'longitude',
        fieldComment: '经度',
        fieldType: 'decimal(10,6)'
      },
      {
        fieldName: 'latitude',
        fieldComment: '纬度',
        fieldType: 'decimal(10,6)'
      },
      {
        fieldName: 'speed_kmh',
        fieldComment: '瞬时速度（km/h）',
        fieldType: 'decimal(6,2)'
      },
      {
        fieldName: 'heading',
        fieldComment: '行驶方向角（度）',
        fieldType: 'decimal(5,2)'
      }
    ]
  },
  {
    id: '21',
    databaseType: 'PostgreSQL',
    tableName: 'sensor_reading',
    tableComment: '车载传感采集数据',
    fields: [
      {
        fieldName: 'reading_id',
        fieldComment: '采集记录编号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'channel_id',
        fieldComment: '传感通道编号（外键关联 sensor_channel 表）',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'asset_ref',
        fieldComment: '关联车辆 / 总成编号',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'metric_name',
        fieldComment: '监测指标名称（冷却液温度 / 机油压力 / DPF 压差）',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'collect_time',
        fieldComment: '采集时间',
        fieldType: 'timestamp'
      },
      {
        fieldName: 'metric_value',
        fieldComment: '采集数值',
        fieldType: 'decimal(12,4)'
      },
      {
        fieldName: 'unit',
        fieldComment: '监测指标单位',
        fieldType: 'varchar(16)'
      },
      {
        fieldName: 'quality_status',
        fieldComment: '数据质量状态（枚举：正常 / 异常 / 缺失）',
        fieldType: 'enum'
      },
      {
        fieldName: 'alarm_flag',
        fieldComment: '是否触发告警（布尔标识）',
        fieldType: 'boolean'
      }
    ]
  },
  {
    id: '22',
    databaseType: 'MySQL',
    tableName: 'student_info',
    tableComment: '学生信息表',
    sourceSystem: '教务管理系统',
    primaryKeyFields: ['student_no'],
    fields: [
      {
        fieldName: 'student_no',
        fieldComment: '学号',
        fieldType: 'varchar(20)',
        isPrimary: true
      },
      {
        fieldName: 'name',
        fieldComment: '姓名',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'gender',
        fieldComment: '性别（枚举：男 / 女）',
        fieldType: 'enum'
      },
      {
        fieldName: 'birth_date',
        fieldComment: '出生日期',
        fieldType: 'date'
      },
      {
        fieldName: 'class_name',
        fieldComment: '班级名称',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'major',
        fieldComment: '专业',
        fieldType: 'varchar(128)'
      },
      {
        fieldName: 'enrollment_date',
        fieldComment: '入学日期',
        fieldType: 'date'
      },
      {
        fieldName: 'phone',
        fieldComment: '联系电话',
        fieldType: 'varchar(20)'
      },
      {
        fieldName: 'student_status',
        fieldComment: '学籍状态（枚举：在读 / 休学 / 毕业 / 退学）',
        fieldType: 'enum'
      }
    ]
  },
  {
    id: '23',
    databaseType: 'MySQL',
    tableName: 'student_physical_exam_2026',
    tableComment: '2026年学生参加体检名单表',
    sourceSystem: '教务管理系统',
    primaryKeyFields: ['student_no'],
    fields: [
      {
        fieldName: 'student_no',
        fieldComment: '学号',
        fieldType: 'varchar(20)',
        isPrimary: true
      },
      {
        fieldName: 'name',
        fieldComment: '姓名',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'gender',
        fieldComment: '性别（枚举：男 / 女）',
        fieldType: 'enum'
      },
      {
        fieldName: 'class_name',
        fieldComment: '班级名称',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'exam_batch',
        fieldComment: '体检批次',
        fieldType: 'varchar(64)'
      },
      {
        fieldName: 'exam_date',
        fieldComment: '预约体检日期',
        fieldType: 'date'
      },
      {
        fieldName: 'exam_time_slot',
        fieldComment: '预约时段',
        fieldType: 'varchar(32)'
      },
      {
        fieldName: 'exam_location',
        fieldComment: '体检地点',
        fieldType: 'varchar(128)'
      },
      {
        fieldName: 'check_status',
        fieldComment: '参检状态（枚举：已预约 / 已体检 / 未到场 / 放弃）',
        fieldType: 'enum'
      },
      {
        fieldName: 'contact_phone',
        fieldComment: '联系电话',
        fieldType: 'varchar(20)'
      },
      {
        fieldName: 'remark',
        fieldComment: '备注',
        fieldType: 'varchar(256)'
      }
    ]
  },
  {
    id: '24',
    databaseType: 'MySQL',
    tableName: 'library_banned_book',
    tableComment: '图书馆禁止借阅图书名单',
    sourceSystem: '图书馆管理系统',
    primaryKeyFields: ['book_no'],
    fields: [
      {
        fieldName: 'book_no',
        fieldComment: '图书编号',
        fieldType: 'varchar(32)',
        isPrimary: true
      },
      {
        fieldName: 'book_name',
        fieldComment: '书名',
        fieldType: 'varchar(256)'
      },
      {
        fieldName: 'ban_time',
        fieldComment: '禁止借阅时间',
        fieldType: 'datetime'
      }
    ]
  }
];
