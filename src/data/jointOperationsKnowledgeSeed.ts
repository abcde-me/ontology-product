import type {
  JointAxiom,
  JointSceneRule
} from '@/types/jointOperationsKnowledge';

export const buildJointOperationsKnowledgeSeed = (
  sceneId: number
): { axioms: JointAxiom[]; sceneRules: JointSceneRule[] } => {
  const now = new Date().toISOString();

  const axioms: JointAxiom[] = [
    {
      id: `axiom-action-commander-${sceneId}`,
      sceneId,
      name: '军事行动指挥约束',
      expression: '每个军事行动必须关联至少一个指挥单元',
      description: '联合作战指挥链基础公理',
      domain: '指挥控制',
      sourceObjectTypeCodes: ['military_action'],
      targetObjectTypeCodes: ['military_unit'],
      enabled: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `axiom-platform-weapon-${sceneId}`,
      sceneId,
      name: '平台武器挂载',
      expression: '海军/空中/地面平台可通过装备关系关联武器系统',
      description: '跨域平台与武器关联公理',
      domain: '装备体系',
      sourceObjectTypeCodes: [
        'naval_platform',
        'air_platform',
        'ground_platform'
      ],
      targetObjectTypeCodes: ['weapon'],
      enabled: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `axiom-location-action-${sceneId}`,
      sceneId,
      name: '地理位置作战关联',
      expression: '军事行动可关联地理位置作为目标或区域',
      description: '地理空间与作战行动关联',
      domain: '战场环境',
      sourceObjectTypeCodes: ['geographic_location'],
      targetObjectTypeCodes: ['military_action'],
      enabled: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  const sceneRules: JointSceneRule[] = [
    {
      id: `rule-cross-domain-strike-${sceneId}`,
      sceneId,
      name: '跨域打击链路',
      condition: '当查询涉及「打击」且同时命中军事行动、平台、武器时',
      action: '聚合展示行动→平台→武器→地理位置的关联路径',
      description: '支持海空陆联合作战打击场景查询',
      priority: 10,
      enabled: true,
      linkedAxiomIds: [
        `axiom-action-commander-${sceneId}`,
        `axiom-platform-weapon-${sceneId}`
      ],
      createdAt: now,
      updatedAt: now
    },
    {
      id: `rule-unit-action-${sceneId}`,
      sceneId,
      name: '单元执行行动',
      condition: '当对象类型为军事单位与军事行动时',
      action: '按单位编制层级展开可执行行动列表',
      description: '指挥控制域与应用域联动',
      priority: 20,
      enabled: true,
      linkedAxiomIds: [`axiom-action-commander-${sceneId}`],
      createdAt: now,
      updatedAt: now
    }
  ];

  return { axioms, sceneRules };
};
