/**
 * docs/联合作战.txt 中 @graph 实例数据（JSON-LD → 对象类型 code + 蛇形字段）
 */

const camelToSnake = (key: string) =>
  key
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');

const jsonLdTypeToObjectCode: Record<string, string> = {
  MilitaryAction: 'military_action',
  NavalPlatform: 'naval_platform',
  AirPlatform: 'air_platform',
  GroundPlatform: 'ground_platform',
  Weapon: 'weapon',
  MilitaryUnit: 'military_unit',
  GeographicLocation: 'geographic_location'
};

const graphNodes: Record<string, unknown>[] = [
  {
    '@type': 'MilitaryAction',
    id: 1,
    objectName: '台海高地火力压制',
    objectCategory: '军事行动-压制',
    missionId: 'MIS-SUP-001',
    missionSubtype: '舰炮火力支援',
    targetLocationId: 2,
    executorUnitId: 1,
    assignedPlatformId: 1,
    weaponId: 1,
    startTime: '2026-05-28T08:30:00',
    plannedEndTime: '2026-05-28T09:15:00',
    effectRadiusM: 200.0,
    intensityLevel: 8,
    actualEffectScore: 92,
    status: '已完成'
  },
  {
    '@type': 'MilitaryAction',
    id: 2,
    objectName: '敌方阵地覆盖打击',
    objectCategory: '军事行动-压制',
    missionId: 'MIS-SUP-002',
    missionSubtype: '远程火箭炮压制',
    targetLocationId: 2,
    executorUnitId: 3,
    assignedPlatformId: 6,
    weaponId: 2,
    startTime: '2026-05-28T10:00:00',
    plannedEndTime: '2026-05-28T10:10:00',
    effectRadiusM: 500.0,
    intensityLevel: 10,
    actualEffectScore: 88,
    status: '已完成'
  },
  {
    '@type': 'MilitaryAction',
    id: 3,
    objectName: '前沿近距离支援',
    objectCategory: '军事行动-压制',
    missionId: 'MIS-SUP-003',
    missionSubtype: '近距离空中支援',
    targetLocationId: 2,
    executorUnitId: 2,
    assignedPlatformId: 4,
    weaponId: 4,
    startTime: '2026-05-28T14:00:00',
    plannedEndTime: '2026-05-28T14:20:00',
    effectRadiusM: 300.0,
    intensityLevel: 9,
    actualEffectScore: 95,
    status: '执行中'
  },
  {
    '@type': 'NavalPlatform',
    id: 1,
    objectName: '052D型驱逐舰-172舰',
    objectCategory: '平台-海军平台',
    platformCode: 'SHIP-D-052D-1',
    platformClass: '052D型驱逐舰',
    commissionDate: '2018-04-12',
    currentLocationId: 1,
    maxSpeedKnots: 32.0,
    crewSize: 280,
    armamentConfig: '130mm舰炮, 海红旗-9B, 鹰击-18导弹',
    fuelCapacityTons: 600.0,
    combatStatus: '巡航中'
  },
  {
    '@type': 'NavalPlatform',
    id: 2,
    objectName: '054A型护卫舰-575舰',
    objectCategory: '平台-海军平台',
    platformCode: 'SHIP-F-054A-1',
    platformClass: '054A型护卫舰',
    commissionDate: '2015-11-20',
    currentLocationId: 5,
    maxSpeedKnots: 27.0,
    crewSize: 180,
    armamentConfig: '76mm舰炮, 红旗-16, 反潜火箭深弹',
    fuelCapacityTons: 400.0,
    combatStatus: '战备巡逻'
  },
  {
    '@type': 'AirPlatform',
    id: 1,
    objectName: '直-10武装直升机-01',
    objectCategory: '平台-空中平台',
    platformCode: 'AIR-H-Z10-01',
    platformModel: '直-10武装直升机',
    firstFlightDate: '2003-04-29',
    currentLocationId: 4,
    maxSpeedKmh: 300.0,
    combatRadiusKm: 450.0,
    armamentCapacityKg: 1500.0,
    crewSize: 2,
    combatStatus: '待命中'
  },
  {
    '@type': 'AirPlatform',
    id: 2,
    objectName: '歼-10C战斗机-05',
    objectCategory: '平台-空中平台',
    platformCode: 'AIR-F-J10C-01',
    platformModel: '歼-10C战斗机',
    firstFlightDate: '2015-01-15',
    currentLocationId: 3,
    maxSpeedKmh: 1850.0,
    combatRadiusKm: 1200.0,
    armamentCapacityKg: 6600.0,
    crewSize: 1,
    combatStatus: '战备值班'
  },
  {
    '@type': 'GroundPlatform',
    id: 1,
    objectName: 'PLZ-05自行火炮-01',
    objectCategory: '平台-地面平台',
    platformCode: 'GND-ART-PLZ05-01',
    platformModel: 'PLZ-05自行火炮',
    maxRangeKm: 50.0,
    rateOfFireRpm: 6,
    currentLocationId: 4,
    maxSpeedKmh: 60.0,
    crewSize: 5,
    combatStatus: '机动部署中'
  },
  {
    '@type': 'GroundPlatform',
    id: 2,
    objectName: 'PHL-191火箭炮-02',
    objectCategory: '平台-地面平台',
    platformCode: 'GND-ROK-PHL191-01',
    platformModel: 'PHL-191火箭炮',
    maxRangeKm: 500.0,
    rateOfFireRpm: 10,
    currentLocationId: 4,
    maxSpeedKmh: 80.0,
    crewSize: 3,
    combatStatus: '待命中'
  },
  {
    '@type': 'Weapon',
    id: 1,
    objectName: '130mm舰炮高爆弹',
    objectCategory: '武器/弹药',
    weaponCode: 'WPN-G-130',
    weaponType: '舰炮弹药',
    caliberMm: 130.0,
    maxRangeKm: 29.5,
    cepM: 15.0,
    warheadType: '高爆弹',
    warheadWeightKg: 33.4,
    compatiblePlatforms: '052D驱逐舰, 055驱逐舰'
  },
  {
    '@type': 'Weapon',
    id: 2,
    objectName: '300mm远程火箭弹',
    objectCategory: '武器/弹药',
    weaponCode: 'WPN-R-300',
    weaponType: '火箭炮弹药',
    caliberMm: 300.0,
    maxRangeKm: 150.0,
    cepM: 30.0,
    warheadType: '子母弹',
    warheadWeightKg: 240.0,
    compatiblePlatforms: 'PHL-191火箭炮'
  },
  {
    '@type': 'Weapon',
    id: 3,
    objectName: '105mm武装直升机火箭弹',
    objectCategory: '武器/弹药',
    weaponCode: 'WPN-H-105',
    weaponType: '航空火箭弹',
    caliberMm: 105.0,
    maxRangeKm: 8.0,
    cepM: 25.0,
    warheadType: '破甲/高爆双用',
    warheadWeightKg: 17.5,
    compatiblePlatforms: '直-10武装直升机'
  },
  {
    '@type': 'Weapon',
    id: 4,
    objectName: '250kg航空炸弹',
    objectCategory: '武器/弹药',
    weaponCode: 'WPN-AIR-250',
    weaponType: '航空炸弹',
    caliberMm: 0.0,
    maxRangeKm: 15.0,
    cepM: 10.0,
    warheadType: '高爆弹',
    warheadWeightKg: 250.0,
    compatiblePlatforms: '歼-10C, 歼-16多用途战斗机'
  },
  {
    '@type': 'MilitaryUnit',
    id: 1,
    objectName: '东部战区海军驱逐舰支队',
    objectCategory: '组织单位',
    unitCode: 'UNIT-N-01',
    unitLevel: '支队',
    parentUnitId: 0,
    commanderName: '王大校',
    unitStrength: 1200,
    stationLocationId: 1,
    combatReadiness: '一级战备'
  },
  {
    '@type': 'MilitaryUnit',
    id: 2,
    objectName: '南部战区空军航空兵某旅',
    objectCategory: '组织单位',
    unitCode: 'UNIT-A-01',
    unitLevel: '旅',
    parentUnitId: 0,
    commanderName: '李上校',
    unitStrength: 850,
    stationLocationId: 3,
    combatReadiness: '二级战备'
  },
  {
    '@type': 'MilitaryUnit',
    id: 3,
    objectName: '东部战区陆军合成某营',
    objectCategory: '组织单位',
    unitCode: 'UNIT-G-01',
    unitLevel: '营',
    parentUnitId: 0,
    commanderName: '张少校',
    unitStrength: 450,
    stationLocationId: 4,
    combatReadiness: '一级战备'
  },
  {
    '@type': 'GeographicLocation',
    id: 1,
    objectName: '东南某海域A点',
    objectCategory: '地理位置',
    locationCode: 'LOC-001',
    longitude: 119.523456,
    latitude: 25.123456,
    altitudeM: -120.5,
    terrainType: '近海海域',
    controlSide: '我方控制',
    strategicImportance: 5
  },
  {
    '@type': 'GeographicLocation',
    id: 2,
    objectName: '台海某高地B点',
    objectCategory: '地理位置',
    locationCode: 'LOC-002',
    longitude: 120.876543,
    latitude: 24.654321,
    altitudeM: 350.2,
    terrainType: '山地',
    controlSide: '敌方控制',
    strategicImportance: 4
  },
  {
    '@type': 'GeographicLocation',
    id: 3,
    objectName: '东部沿海某机场C点',
    objectCategory: '地理位置',
    locationCode: 'LOC-003',
    longitude: 118.345678,
    latitude: 32.876543,
    altitudeM: 15.6,
    terrainType: '平原机场',
    controlSide: '我方控制',
    strategicImportance: 5
  }
];

export const graphNodeToInstance = (
  node: Record<string, unknown>
): Record<string, unknown> => {
  const instance: Record<string, unknown> = {};

  Object.entries(node).forEach(([key, value]) => {
    if (key.startsWith('@')) {
      return;
    }
    instance[camelToSnake(key)] = value;
  });

  return instance;
};

const buildInstancesByCode = () => {
  const map: Record<string, Record<string, unknown>[]> = {};

  graphNodes.forEach((node) => {
    const type = String(node['@type'] || '');
    const code = jsonLdTypeToObjectCode[type];
    if (!code) {
      return;
    }
    if (!map[code]) {
      map[code] = [];
    }
    map[code].push(graphNodeToInstance(node));
  });

  return map;
};

export const JOINT_OPERATIONS_GRAPH_INSTANCES = buildInstancesByCode();

export const getJointOperationsInstances = (objectTypeCode: string) =>
  JOINT_OPERATIONS_GRAPH_INSTANCES[objectTypeCode] || [];
