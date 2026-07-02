import { buildSensorReadingSampleData } from './sensorReadingSampleData';

/** 顺达物流集团（中等规模至大型运输公司）各表示例数据 */
export const DATA_RESOURCE_SAMPLE_DATA: Record<
  string,
  Record<string, unknown>[]
> = {
  '1': [
    {
      vin: 'LZZ1CLVB8RA123456',
      plate_number: '沪A·D12345',
      brand_model: '解放 J6P 9.6米冷藏车',
      purchase_date: '2021-03-15',
      current_mileage: '428560.50',
      engine_work_hours: '12840.00',
      fleet_code: 'FL-HD-001',
      vehicle_status: '运行'
    },
    {
      vin: 'LZZ1CLVB8RA234567',
      plate_number: '苏E·F67890',
      brand_model: '东风天龙 13米半挂',
      purchase_date: '2019-08-22',
      current_mileage: '612300.00',
      engine_work_hours: '18650.50',
      fleet_code: 'FL-GX-002',
      vehicle_status: '运行'
    },
    {
      vin: 'LZZ1CLVB8RA345678',
      plate_number: '粤B·G55667',
      brand_model: '福田欧马可 4.2米城配',
      purchase_date: '2022-11-08',
      current_mileage: '98520.30',
      engine_work_hours: '5620.00',
      fleet_code: 'FL-CP-003',
      vehicle_status: '运行'
    },
    {
      vin: 'LZZ1CLVB8RA456789',
      plate_number: '浙A·H88990',
      brand_model: '重汽豪沃 9.6米厢式',
      purchase_date: '2020-06-30',
      current_mileage: '356780.80',
      engine_work_hours: '10230.00',
      fleet_code: 'FL-HD-001',
      vehicle_status: '维修中'
    },
    {
      vin: 'LZZ1CLVB8RA567890',
      plate_number: '鲁Q·K11223',
      brand_model: '陕汽德龙 13米冷藏半挂（挂靠）',
      purchase_date: '2018-04-12',
      current_mileage: '758900.00',
      engine_work_hours: '22100.00',
      fleet_code: 'FL-GX-002',
      vehicle_status: '停用'
    }
  ],
  '2': [
    {
      component_no: 'CMP-ENG-20210315-001',
      serial_number: 'WD615.69-88234',
      component_type: '发动机',
      install_date: '2021-03-15',
      design_life: 800000,
      vehicle_vin: 'LZZ1CLVB8RA123456'
    },
    {
      component_no: 'CMP-GBX-20210315-002',
      serial_number: 'ZF-12TX2620-5567',
      component_type: '变速箱',
      install_date: '2021-03-15',
      design_life: 600000,
      vehicle_vin: 'LZZ1CLVB8RA123456'
    },
    {
      component_no: 'CMP-REF-20211108-003',
      serial_number: 'TK-450D-77891',
      component_type: '制冷机',
      install_date: '2022-11-08',
      design_life: 500000,
      vehicle_vin: 'LZZ1CLVB8RA345678'
    },
    {
      component_no: 'CMP-ENG-20190822-004',
      serial_number: 'DDi75-33456',
      component_type: '发动机',
      install_date: '2019-08-22',
      design_life: 800000,
      vehicle_vin: 'LZZ1CLVB8RA234567'
    },
    {
      component_no: 'CMP-REF-20180412-005',
      serial_number: 'SLX-400-22334',
      component_type: '制冷机',
      install_date: '2018-04-12',
      design_life: 500000,
      vehicle_vin: 'LZZ1CLVB8RA567890'
    }
  ],
  '3': [
    {
      failure_code: 'FM-001',
      failure_desc: '制冷机组压缩机过载',
      severity_level: '高',
      safety_risk_flag: false,
      typical_symptom: '冷藏箱温度持续上升，压缩机频繁启停'
    },
    {
      failure_code: 'FM-002',
      failure_desc: 'DPF 再生失败',
      severity_level: '中',
      safety_risk_flag: false,
      typical_symptom: '仪表盘 DPF 报警灯常亮，动力受限'
    },
    {
      failure_code: 'FM-003',
      failure_desc: '制动系统气压不足',
      severity_level: '高',
      safety_risk_flag: true,
      typical_symptom: '制动响应延迟，气压表读数低于标准值'
    },
    {
      failure_code: 'FM-004',
      failure_desc: '轮胎异常磨损',
      severity_level: '低',
      safety_risk_flag: false,
      typical_symptom: '胎面偏磨，长途干线车辆高发'
    },
    {
      failure_code: 'FM-005',
      failure_desc: '城配车辆离合器打滑',
      severity_level: '中',
      safety_risk_flag: false,
      typical_symptom: '频繁启停路段加速无力，离合器片过热'
    }
  ],
  '4': [
    {
      work_order_no: 'WO-20250601-0001',
      order_type: '计划',
      order_status: '已完成',
      created_at: '2025-06-01 08:30:00',
      closed_at: '2025-06-01 14:20:00',
      repair_duration: 350,
      downtime_flag: true,
      failure_code: 'FM-001'
    },
    {
      work_order_no: 'WO-20250603-0002',
      order_type: '突发',
      order_status: '处理中',
      created_at: '2025-06-03 22:15:00',
      closed_at: null,
      repair_duration: null,
      downtime_flag: true,
      failure_code: 'FM-003'
    },
    {
      work_order_no: 'WO-20250605-0003',
      order_type: '计划',
      order_status: '已完成',
      created_at: '2025-06-05 09:00:00',
      closed_at: '2025-06-05 11:45:00',
      repair_duration: 165,
      downtime_flag: false,
      failure_code: 'FM-004'
    },
    {
      work_order_no: 'WO-20250606-0004',
      order_type: '事故',
      order_status: '待配件',
      created_at: '2025-06-06 16:40:00',
      closed_at: null,
      repair_duration: null,
      downtime_flag: true,
      failure_code: 'FM-003'
    },
    {
      work_order_no: 'WO-20250607-0005',
      order_type: '突发',
      order_status: '已完成',
      created_at: '2025-06-07 06:20:00',
      closed_at: '2025-06-07 10:30:00',
      repair_duration: 250,
      downtime_flag: true,
      failure_code: 'FM-002'
    }
  ],
  '5': [
    {
      task_desc: '冷链车辆制冷机组年度保养',
      standard_hours: '4.00',
      parts_bom:
        '[{"part_no":"PT-REF-001","qty":1},{"part_no":"PT-REF-002","qty":2}]',
      skill_tags: '制冷维修,电气',
      sop_url: 'https://sop.shunda-logistics.com/maintenance/cold-chain-annual'
    },
    {
      task_desc: '干线半挂车轮胎换位及动平衡',
      standard_hours: '2.50',
      parts_bom: '[]',
      skill_tags: '轮胎工,动平衡',
      sop_url: 'https://sop.shunda-logistics.com/maintenance/tire-rotation'
    },
    {
      task_desc: '城配车辆 clutch 片更换',
      standard_hours: '3.00',
      parts_bom: '[{"part_no":"PT-CLT-001","qty":1}]',
      skill_tags: '传动系维修',
      sop_url: 'https://sop.shunda-logistics.com/maintenance/clutch-replace'
    },
    {
      task_desc: 'DPF 再生及后处理系统清洗',
      standard_hours: '2.00',
      parts_bom: '[{"part_no":"PT-DPF-001","qty":1}]',
      skill_tags: '排放系统,诊断',
      sop_url: 'https://sop.shunda-logistics.com/maintenance/dpf-regen'
    },
    {
      task_desc: '制动系统全面检查（含气路）',
      standard_hours: '1.50',
      parts_bom: '[{"part_no":"PT-BRK-003","qty":4}]',
      skill_tags: '制动系统,安全',
      sop_url: 'https://sop.shunda-logistics.com/maintenance/brake-check'
    }
  ],
  '6': [
    {
      part_no: 'PT-REF-001',
      part_name: '制冷压缩机滤芯',
      part_category: '制冷配件',
      unit_cost: '680.00',
      supplier: '开利冷链配件（上海）',
      stock_qty: 128,
      safety_stock: 50,
      replenish_cycle: 14
    },
    {
      part_no: 'PT-REF-002',
      part_name: '冷媒 R404A（10kg）',
      part_category: '制冷配件',
      unit_cost: '420.00',
      supplier: '杜邦制冷剂华东仓',
      stock_qty: 86,
      safety_stock: 30,
      replenish_cycle: 7
    },
    {
      part_no: 'PT-CLT-001',
      part_name: '离合器从动盘总成',
      part_category: '传动系统',
      unit_cost: '1580.00',
      supplier: '法士特配件中心',
      stock_qty: 45,
      safety_stock: 20,
      replenish_cycle: 21
    },
    {
      part_no: 'PT-DPF-001',
      part_name: 'DPF 清洗剂套装',
      part_category: '排放系统',
      unit_cost: '320.00',
      supplier: '康明斯后处理服务',
      stock_qty: 62,
      safety_stock: 25,
      replenish_cycle: 14
    },
    {
      part_no: 'PT-BRK-003',
      part_name: '刹车片（前桥）',
      part_category: '制动系统',
      unit_cost: '280.00',
      supplier: '威伯科制动',
      stock_qty: 210,
      safety_stock: 80,
      replenish_cycle: 10
    }
  ],
  '7': [
    {
      technician_no: 'TEC-10021',
      skill_tags: '制冷维修,电气,诊断',
      workshop_code: 'WS-SH-001',
      availability: true
    },
    {
      technician_no: 'TEC-10035',
      skill_tags: '传动系维修,轮胎工',
      workshop_code: 'WS-SH-001',
      availability: true
    },
    {
      technician_no: 'TEC-10048',
      skill_tags: '制动系统,安全,排放系统',
      workshop_code: 'WS-GZ-002',
      availability: false
    },
    {
      technician_no: 'TEC-10052',
      skill_tags: '发动机维修,一般保养',
      workshop_code: 'WS-JN-003',
      availability: true
    },
    {
      technician_no: 'TEC-10067',
      skill_tags: '制冷维修,城配快修',
      workshop_code: 'WS-HZ-004',
      availability: true
    }
  ],
  '8': [
    {
      location: '上海市嘉定区顺达物流维修中心（华东枢纽）',
      service_capability: '发动机维修,制冷维修,一般保养',
      hourly_rate: '185.00'
    },
    {
      location: '广州市白云区顺达华南维修站',
      service_capability: '一般保养,制动系统,轮胎工',
      hourly_rate: '165.00'
    },
    {
      location: '济南市历城区顺达干线维修基地',
      service_capability: '发动机维修,传动系维修,排放系统',
      hourly_rate: '175.00'
    },
    {
      location: '杭州市余杭区顺达城配快修点',
      service_capability: '一般保养,城配快修',
      hourly_rate: '150.00'
    },
    {
      location: '成都市双流区顺达西南冷链专修站',
      service_capability: '制冷维修,一般保养',
      hourly_rate: '170.00'
    }
  ],
  '9': [
    {
      route: '上海冷链枢纽 → 南京分拨 → 合肥客户门点',
      planned_departure: '2025-06-07 06:00:00',
      planned_arrival: '2025-06-07 18:30:00',
      customer_info: '华润万家华东冷链',
      priority: 1,
      vehicle_vin: 'LZZ1CLVB8RA123456'
    },
    {
      route: '广州 → 武汉 → 郑州（干线中转）',
      planned_departure: '2025-06-07 20:00:00',
      planned_arrival: '2025-06-08 14:00:00',
      customer_info: '京东物流干线合约',
      priority: 2,
      vehicle_vin: 'LZZ1CLVB8RA234567'
    },
    {
      route: '深圳福田 → 南山 → 宝安（城配循环）',
      planned_departure: '2025-06-07 07:30:00',
      planned_arrival: '2025-06-07 17:00:00',
      customer_info: '美团优选城配',
      priority: 3,
      vehicle_vin: 'LZZ1CLVB8RA345678'
    },
    {
      route: '杭州 → 宁波 → 温州（华东冷链）',
      planned_departure: '2025-06-08 05:00:00',
      planned_arrival: '2025-06-08 20:00:00',
      customer_info: '盒马鲜生冷链',
      priority: 1,
      vehicle_vin: 'LZZ1CLVB8RA456789'
    },
    {
      route: '济南 → 石家庄 → 北京（干线）',
      planned_departure: '2025-06-08 22:00:00',
      planned_arrival: '2025-06-09 10:00:00',
      customer_info: '顺丰速运干线',
      priority: 2,
      vehicle_vin: 'LZZ1CLVB8RA567890'
    }
  ],
  '10': [
    {
      asset_ref: 'LZZ1CLVB8RA123456',
      metric_name: '冷却液温度',
      sample_rate: '1次/30秒'
    },
    {
      asset_ref: 'LZZ1CLVB8RA123456',
      metric_name: '冷藏箱温度',
      sample_rate: '1次/10秒'
    },
    {
      asset_ref: 'LZZ1CLVB8RA234567',
      metric_name: '机油压力',
      sample_rate: '1次/60秒'
    },
    {
      asset_ref: 'LZZ1CLVB8RA234567',
      metric_name: 'DPF 压差',
      sample_rate: '1次/120秒'
    },
    {
      asset_ref: 'CMP-REF-20211108-003',
      metric_name: '制冷机排气温度',
      sample_rate: '1次/15秒'
    }
  ],
  '11': [
    {
      fleet_code: 'FL-HD-001',
      fleet_name: '华东冷链车队',
      parent_fleet_code: 'FL-ROOT',
      region: '华东',
      manager_name: '张明',
      vehicle_count: 856
    },
    {
      fleet_code: 'FL-GX-002',
      fleet_name: '全国干线车队',
      parent_fleet_code: 'FL-ROOT',
      region: '华东',
      manager_name: '李强',
      vehicle_count: 1240
    },
    {
      fleet_code: 'FL-CP-003',
      fleet_name: '华南城配车队',
      parent_fleet_code: 'FL-ROOT',
      region: '华南',
      manager_name: '王芳',
      vehicle_count: 680
    },
    {
      fleet_code: 'FL-HD-004',
      fleet_name: '西南冷链车队',
      parent_fleet_code: 'FL-ROOT',
      region: '西南',
      manager_name: '赵磊',
      vehicle_count: 420
    },
    {
      fleet_code: 'FL-CP-005',
      fleet_name: '华北城配车队',
      parent_fleet_code: 'FL-ROOT',
      region: '华北',
      manager_name: '刘洋',
      vehicle_count: 530
    }
  ],
  '12': [
    {
      driver_no: 'DRV-80001',
      driver_name: '陈建国',
      license_type: 'A2',
      license_expire_date: '2027-08-15',
      fleet_code: 'FL-HD-001',
      employment_status: '在岗',
      safety_score: '96.50'
    },
    {
      driver_no: 'DRV-80012',
      driver_name: '周伟',
      license_type: 'A2',
      license_expire_date: '2026-03-20',
      fleet_code: 'FL-GX-002',
      employment_status: '在岗',
      safety_score: '94.20'
    },
    {
      driver_no: 'DRV-80023',
      driver_name: '吴小军',
      license_type: 'C1',
      license_expire_date: '2028-11-05',
      fleet_code: 'FL-CP-003',
      employment_status: '在岗',
      safety_score: '98.00'
    },
    {
      driver_no: 'DRV-80034',
      driver_name: '孙海涛',
      license_type: 'A2',
      license_expire_date: '2025-12-30',
      fleet_code: 'FL-GX-002',
      employment_status: '休假',
      safety_score: '91.80'
    },
    {
      driver_no: 'DRV-80045',
      driver_name: '马志远',
      license_type: 'B2',
      license_expire_date: '2027-06-18',
      fleet_code: 'FL-CP-005',
      employment_status: '在岗',
      safety_score: '95.60'
    }
  ],
  '13': [
    {
      customer_code: 'CUS-001',
      customer_name: '华润万家华东冷链',
      customer_type: '战略客户',
      credit_level: 'A',
      settlement_cycle: 30,
      contact_phone: '021-66881234'
    },
    {
      customer_code: 'CUS-002',
      customer_name: '京东物流干线合约',
      customer_type: '合同客户',
      credit_level: 'A',
      settlement_cycle: 45,
      contact_phone: '010-89123456'
    },
    {
      customer_code: 'CUS-003',
      customer_name: '美团优选城配',
      customer_type: '合同客户',
      credit_level: 'B',
      settlement_cycle: 15,
      contact_phone: '0755-22334455'
    },
    {
      customer_code: 'CUS-004',
      customer_name: '盒马鲜生冷链',
      customer_type: '战略客户',
      credit_level: 'A',
      settlement_cycle: 30,
      contact_phone: '0571-88776655'
    },
    {
      customer_code: 'CUS-005',
      customer_name: '个体货主（散单）',
      customer_type: '散单客户',
      credit_level: 'C',
      settlement_cycle: 7,
      contact_phone: '13800138000'
    }
  ],
  '14': [
    {
      order_no: 'TO-202506070001',
      customer_code: 'CUS-001',
      cargo_name: '冷冻食品',
      cargo_weight_ton: '12.500',
      origin_site_code: 'SITE-SH-001',
      dest_site_code: 'SITE-NJ-002',
      order_status: '运输中',
      required_delivery_time: '2025-06-07 20:00:00'
    },
    {
      order_no: 'TO-202506070002',
      customer_code: 'CUS-002',
      cargo_name: '电商包裹',
      cargo_weight_ton: '28.000',
      origin_site_code: 'SITE-GZ-003',
      dest_site_code: 'SITE-WH-004',
      order_status: '待调度',
      required_delivery_time: '2025-06-08 12:00:00'
    },
    {
      order_no: 'TO-202506070003',
      customer_code: 'CUS-003',
      cargo_name: '生鲜蔬果',
      cargo_weight_ton: '3.200',
      origin_site_code: 'SITE-SZ-005',
      dest_site_code: 'SITE-SZ-006',
      order_status: '已签收',
      required_delivery_time: '2025-06-07 12:00:00'
    },
    {
      order_no: 'TO-202506070004',
      customer_code: 'CUS-004',
      cargo_name: '冷链医药',
      cargo_weight_ton: '1.800',
      origin_site_code: 'SITE-HZ-007',
      dest_site_code: 'SITE-NB-008',
      order_status: '运输中',
      required_delivery_time: '2025-06-08 08:00:00'
    },
    {
      order_no: 'TO-202506070005',
      customer_code: 'CUS-005',
      cargo_name: '建材',
      cargo_weight_ton: '15.000',
      origin_site_code: 'SITE-JN-009',
      dest_site_code: 'SITE-SJZ-010',
      order_status: '已取消',
      required_delivery_time: '2025-06-09 18:00:00'
    }
  ],
  '15': [
    {
      waybill_no: 'WB-202506070001',
      order_no: 'TO-202506070001',
      vehicle_vin: 'LZZ1CLVB8RA123456',
      driver_no: 'DRV-80001',
      dispatch_time: '2025-06-07 05:30:00',
      sign_time: null,
      waybill_status: '在途'
    },
    {
      waybill_no: 'WB-202506070002',
      order_no: 'TO-202506070002',
      vehicle_vin: 'LZZ1CLVB8RA234567',
      driver_no: 'DRV-80012',
      dispatch_time: '2025-06-07 19:45:00',
      sign_time: null,
      waybill_status: '已派车'
    },
    {
      waybill_no: 'WB-202506070003',
      order_no: 'TO-202506070003',
      vehicle_vin: 'LZZ1CLVB8RA345678',
      driver_no: 'DRV-80023',
      dispatch_time: '2025-06-07 07:00:00',
      sign_time: '2025-06-07 11:30:00',
      waybill_status: '已送达'
    },
    {
      waybill_no: 'WB-202506070004',
      order_no: 'TO-202506070004',
      vehicle_vin: 'LZZ1CLVB8RA456789',
      driver_no: 'DRV-80001',
      dispatch_time: '2025-06-07 04:30:00',
      sign_time: null,
      waybill_status: '在途'
    },
    {
      waybill_no: 'WB-202506060005',
      order_no: 'TO-202506060008',
      vehicle_vin: 'LZZ1CLVB8RA567890',
      driver_no: 'DRV-80034',
      dispatch_time: '2025-06-06 21:00:00',
      sign_time: null,
      waybill_status: '异常'
    }
  ],
  '16': [
    {
      route_code: 'RT-SH-NJ-HD',
      route_name: '上海-南京冷链干线',
      origin_city: '上海',
      dest_city: '南京',
      standard_mileage_km: '301.50',
      standard_transit_hours: '5.50',
      toll_fee_estimate: '280.00'
    },
    {
      route_code: 'RT-GZ-WH-GX',
      route_name: '广州-武汉全国干线',
      origin_city: '广州',
      dest_city: '武汉',
      standard_mileage_km: '1068.00',
      standard_transit_hours: '14.00',
      toll_fee_estimate: '920.00'
    },
    {
      route_code: 'RT-SZ-CP-01',
      route_name: '深圳城配循环线',
      origin_city: '深圳',
      dest_city: '深圳',
      standard_mileage_km: '85.00',
      standard_transit_hours: '8.00',
      toll_fee_estimate: '45.00'
    },
    {
      route_code: 'RT-HZ-NB-HD',
      route_name: '杭州-宁波冷链',
      origin_city: '杭州',
      dest_city: '宁波',
      standard_mileage_km: '158.00',
      standard_transit_hours: '3.00',
      toll_fee_estimate: '120.00'
    },
    {
      route_code: 'RT-JN-BJ-GX',
      route_name: '济南-北京干线',
      origin_city: '济南',
      dest_city: '北京',
      standard_mileage_km: '412.00',
      standard_transit_hours: '6.50',
      toll_fee_estimate: '350.00'
    }
  ],
  '17': [
    {
      site_code: 'SITE-SH-001',
      site_name: '上海冷链枢纽',
      site_type: '枢纽',
      address: '上海市嘉定区曹安公路 2888 号',
      geo_longitude: '121.265800',
      geo_latitude: '31.375600',
      operating_hours: '00:00-24:00'
    },
    {
      site_code: 'SITE-NJ-002',
      site_name: '南京分拨中心',
      site_type: '分拨',
      address: '南京市江宁区禄口街道物流大道 66 号',
      geo_longitude: '118.862300',
      geo_latitude: '31.742100',
      operating_hours: '06:00-22:00'
    },
    {
      site_code: 'SITE-GZ-003',
      site_name: '广州干线始发站',
      site_type: '枢纽',
      address: '广州市白云区太和镇大源北路 128 号',
      geo_longitude: '113.352100',
      geo_latitude: '23.286500',
      operating_hours: '00:00-24:00'
    },
    {
      site_code: 'SITE-SZ-005',
      site_name: '深圳福田城配站',
      site_type: '分拨',
      address: '深圳市福田区梅华路 108 号',
      geo_longitude: '114.055600',
      geo_latitude: '22.572800',
      operating_hours: '05:00-23:00'
    },
    {
      site_code: 'SITE-SZ-006',
      site_name: '南山客户门点（美团）',
      site_type: '客户门点',
      address: '深圳市南山区科技园南区 W1 栋',
      geo_longitude: '113.945200',
      geo_latitude: '22.538900',
      operating_hours: '07:00-21:00'
    }
  ],
  '18': [
    {
      settlement_no: 'ST-202506070001',
      waybill_no: 'WB-202506070003',
      customer_code: 'CUS-003',
      freight_amount: '1280.00',
      fuel_surcharge: '96.00',
      settlement_status: '已回款',
      settlement_date: '2025-06-07'
    },
    {
      settlement_no: 'ST-202506070002',
      waybill_no: 'WB-202506070001',
      customer_code: 'CUS-001',
      freight_amount: '5680.00',
      fuel_surcharge: '420.00',
      settlement_status: '待对账',
      settlement_date: null
    },
    {
      settlement_no: 'ST-202506060003',
      waybill_no: 'WB-202506060005',
      customer_code: 'CUS-002',
      freight_amount: '8920.00',
      fuel_surcharge: '680.00',
      settlement_status: '已开票',
      settlement_date: '2025-06-06'
    },
    {
      settlement_no: 'ST-202506050004',
      waybill_no: 'WB-202506050012',
      customer_code: 'CUS-004',
      freight_amount: '3450.00',
      fuel_surcharge: '260.00',
      settlement_status: '已回款',
      settlement_date: '2025-06-05'
    },
    {
      settlement_no: 'ST-202506040005',
      waybill_no: 'WB-202506040008',
      customer_code: 'CUS-005',
      freight_amount: '980.00',
      fuel_surcharge: '0.00',
      settlement_status: '已开票',
      settlement_date: '2025-06-04'
    }
  ],
  '19': [
    {
      record_id: 'FC-202506070001',
      vehicle_vin: 'LZZ1CLVB8RA123456',
      refuel_time: '2025-06-07 05:15:00',
      fuel_liters: '320.00',
      fuel_cost: '2432.00',
      mileage_at_refuel: '428560.50',
      fuel_station: '中石化嘉定曹安路站'
    },
    {
      record_id: 'FC-202506070002',
      vehicle_vin: 'LZZ1CLVB8RA234567',
      refuel_time: '2025-06-07 19:30:00',
      fuel_liters: '450.00',
      fuel_cost: '3420.00',
      mileage_at_refuel: '612300.00',
      fuel_station: '中石油广州太和站'
    },
    {
      record_id: 'FC-202506070003',
      vehicle_vin: 'LZZ1CLVB8RA345678',
      refuel_time: '2025-06-07 06:45:00',
      fuel_liters: '65.00',
      fuel_cost: '494.00',
      mileage_at_refuel: '98520.30',
      fuel_station: '壳牌深圳福田站'
    },
    {
      record_id: 'FC-202506060004',
      vehicle_vin: 'LZZ1CLVB8RA456789',
      refuel_time: '2025-06-06 04:20:00',
      fuel_liters: '280.00',
      fuel_cost: '2128.00',
      mileage_at_refuel: '356780.80',
      fuel_station: '中石化杭州余杭站'
    },
    {
      record_id: 'FC-202506060005',
      vehicle_vin: 'LZZ1CLVB8RA567890',
      refuel_time: '2025-06-06 20:50:00',
      fuel_liters: '380.00',
      fuel_cost: '2888.00',
      mileage_at_refuel: '758900.00',
      fuel_station: '中石油济南历城站'
    }
  ],
  '20': [
    {
      track_id: 'TRK-202506070001',
      vehicle_vin: 'LZZ1CLVB8RA123456',
      waybill_no: 'WB-202506070001',
      collect_time: '2025-06-07 08:30:00',
      longitude: '121.102300',
      latitude: '31.456700',
      speed_kmh: '78.50',
      heading: '285.00'
    },
    {
      track_id: 'TRK-202506070002',
      vehicle_vin: 'LZZ1CLVB8RA123456',
      waybill_no: 'WB-202506070001',
      collect_time: '2025-06-07 10:15:00',
      longitude: '120.856400',
      latitude: '31.623400',
      speed_kmh: '82.00',
      heading: '290.50'
    },
    {
      track_id: 'TRK-202506070003',
      vehicle_vin: 'LZZ1CLVB8RA345678',
      waybill_no: 'WB-202506070003',
      collect_time: '2025-06-07 09:00:00',
      longitude: '114.062100',
      latitude: '22.548900',
      speed_kmh: '35.00',
      heading: '180.00'
    },
    {
      track_id: 'TRK-202506070004',
      vehicle_vin: 'LZZ1CLVB8RA234567',
      waybill_no: 'WB-202506070002',
      collect_time: '2025-06-07 22:30:00',
      longitude: '113.521800',
      latitude: '23.812300',
      speed_kmh: '88.00',
      heading: '15.00'
    },
    {
      track_id: 'TRK-202506070005',
      vehicle_vin: 'LZZ1CLVB8RA456789',
      waybill_no: 'WB-202506070004',
      collect_time: '2025-06-07 07:45:00',
      longitude: '120.198700',
      latitude: '30.312400',
      speed_kmh: '72.50',
      heading: '120.00'
    }
  ],
  '21': buildSensorReadingSampleData(20),
  '22': [
    {
      student_no: '2024010101',
      name: '张明',
      gender: '男',
      birth_date: '2006-03-15',
      class_name: '计算机2401班',
      major: '计算机科学与技术',
      enrollment_date: '2024-09-01',
      phone: '13800138001',
      student_status: '在读'
    },
    {
      student_no: '2024010102',
      name: '李雪',
      gender: '女',
      birth_date: '2006-07-22',
      class_name: '计算机2401班',
      major: '计算机科学与技术',
      enrollment_date: '2024-09-01',
      phone: '13800138002',
      student_status: '在读'
    },
    {
      student_no: '2024010201',
      name: '王浩',
      gender: '男',
      birth_date: '2005-11-08',
      class_name: '软件工程2401班',
      major: '软件工程',
      enrollment_date: '2024-09-01',
      phone: '13800138003',
      student_status: '在读'
    },
    {
      student_no: '2024010202',
      name: '陈静',
      gender: '女',
      birth_date: '2006-01-30',
      class_name: '软件工程2401班',
      major: '软件工程',
      enrollment_date: '2024-09-01',
      phone: '13800138004',
      student_status: '在读'
    },
    {
      student_no: '2024020101',
      name: '刘洋',
      gender: '男',
      birth_date: '2006-05-18',
      class_name: '数据科学2401班',
      major: '数据科学与大数据技术',
      enrollment_date: '2024-09-01',
      phone: '13800138005',
      student_status: '在读'
    },
    {
      student_no: '2023010106',
      name: '赵婷',
      gender: '女',
      birth_date: '2005-09-12',
      class_name: '计算机2301班',
      major: '计算机科学与技术',
      enrollment_date: '2023-09-01',
      phone: '13800138006',
      student_status: '休学'
    },
    {
      student_no: '2021010107',
      name: '孙磊',
      gender: '男',
      birth_date: '2003-04-25',
      class_name: '计算机2101班',
      major: '计算机科学与技术',
      enrollment_date: '2021-09-01',
      phone: '13800138007',
      student_status: '毕业'
    },
    {
      student_no: '2024020108',
      name: '周敏',
      gender: '女',
      birth_date: '2006-08-03',
      class_name: '数据科学2401班',
      major: '数据科学与大数据技术',
      enrollment_date: '2024-09-01',
      phone: '13800138008',
      student_status: '在读'
    }
  ],
  '23': [
    {
      student_no: '2024010101',
      name: '张明',
      gender: '男',
      class_name: '计算机2401班',
      exam_batch: '2026春季新生体检',
      exam_date: '2026-03-10',
      exam_time_slot: '08:30-09:30',
      exam_location: '校医院一楼体检中心',
      check_status: '已体检',
      contact_phone: '13800138001',
      remark: ''
    },
    {
      student_no: '2024010102',
      name: '李雪',
      gender: '女',
      class_name: '计算机2401班',
      exam_batch: '2026春季新生体检',
      exam_date: '2026-03-10',
      exam_time_slot: '09:30-10:30',
      exam_location: '校医院一楼体检中心',
      check_status: '已体检',
      contact_phone: '13800138002',
      remark: ''
    },
    {
      student_no: '2024010201',
      name: '王浩',
      gender: '男',
      class_name: '软件工程2401班',
      exam_batch: '2026春季新生体检',
      exam_date: '2026-03-11',
      exam_time_slot: '08:30-09:30',
      exam_location: '校医院一楼体检中心',
      check_status: '已预约',
      contact_phone: '13800138003',
      remark: ''
    },
    {
      student_no: '2024010202',
      name: '陈静',
      gender: '女',
      class_name: '软件工程2401班',
      exam_batch: '2026春季新生体检',
      exam_date: '2026-03-11',
      exam_time_slot: '09:30-10:30',
      exam_location: '校医院一楼体检中心',
      check_status: '已预约',
      contact_phone: '13800138004',
      remark: ''
    },
    {
      student_no: '2024020101',
      name: '刘洋',
      gender: '男',
      class_name: '数据科学2401班',
      exam_batch: '2026春季新生体检',
      exam_date: '2026-03-12',
      exam_time_slot: '14:00-15:00',
      exam_location: '校医院一楼体检中心',
      check_status: '未到场',
      contact_phone: '13800138005',
      remark: '需改约至下一批次'
    },
    {
      student_no: '2024020108',
      name: '周敏',
      gender: '女',
      class_name: '数据科学2401班',
      exam_batch: '2026春季新生体检',
      exam_date: '2026-03-12',
      exam_time_slot: '15:00-16:00',
      exam_location: '校医院一楼体检中心',
      check_status: '已体检',
      contact_phone: '13800138008',
      remark: ''
    },
    {
      student_no: '2025010109',
      name: '吴凯',
      gender: '男',
      class_name: '人工智能2501班',
      exam_batch: '2026秋季入学体检',
      exam_date: '2026-09-05',
      exam_time_slot: '08:30-09:30',
      exam_location: '校医院二楼专项体检区',
      check_status: '已预约',
      contact_phone: '13800138009',
      remark: ''
    },
    {
      student_no: '2025010110',
      name: '郑琳',
      gender: '女',
      class_name: '人工智能2501班',
      exam_batch: '2026秋季入学体检',
      exam_date: '2026-09-05',
      exam_time_slot: '09:30-10:30',
      exam_location: '校医院二楼专项体检区',
      check_status: '已预约',
      contact_phone: '13800138010',
      remark: ''
    },
    {
      student_no: '2025010211',
      name: '黄杰',
      gender: '男',
      class_name: '网络工程2501班',
      exam_batch: '2026秋季入学体检',
      exam_date: '2026-09-06',
      exam_time_slot: '10:30-11:30',
      exam_location: '校医院二楼专项体检区',
      check_status: '放弃',
      contact_phone: '13800138011',
      remark: '已提交放弃体检说明'
    },
    {
      student_no: '2025010212',
      name: '林芳',
      gender: '女',
      class_name: '网络工程2501班',
      exam_batch: '2026秋季入学体检',
      exam_date: '2026-09-06',
      exam_time_slot: '14:00-15:00',
      exam_location: '校医院二楼专项体检区',
      check_status: '已预约',
      contact_phone: '13800138012',
      remark: ''
    }
  ],
  '24': [
    {
      book_no: 'BK-2024-00128',
      book_name: '西方哲学史（精装典藏版）',
      ban_time: '2026-01-15 09:00:00'
    },
    {
      book_no: 'BK-2023-00456',
      book_name: '机器学习实战（第2版）',
      ban_time: '2026-02-20 14:30:00'
    },
    {
      book_no: 'BK-2022-00987',
      book_name: '中国近代史纲要',
      ban_time: '2026-03-01 10:00:00'
    },
    {
      book_no: 'BK-2024-00203',
      book_name: '数据结构与算法分析',
      ban_time: '2026-03-18 16:45:00'
    },
    {
      book_no: 'BK-2021-00672',
      book_name: '红楼梦（人民文学出版社）',
      ban_time: '2026-04-05 08:30:00'
    },
    {
      book_no: 'BK-2023-01105',
      book_name: '计算机网络：自顶向下方法',
      ban_time: '2026-04-22 11:20:00'
    },
    {
      book_no: 'BK-2020-00341',
      book_name: '管理学原理（第13版）',
      ban_time: '2026-05-10 09:15:00'
    },
    {
      book_no: 'BK-2024-00589',
      book_name: '人工智能：一种现代的方法',
      ban_time: '2026-05-28 15:00:00'
    }
  ]
};
