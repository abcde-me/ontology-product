import {
  getOntologyTopology,
  listOntologyPhysicalProperties
} from '@/api/ontologySceneLibrary/graph';
import {
  getOntologyLinkType,
  listOntologyLinkTypeData
} from '@/api/ontologySceneLibrary/links';
import {
  queryObjectTypeInstances,
  resolveRowFieldValue
} from '@/pages/exploreAnalysis/objectBrowse/services/instanceQuery';
import type {
  GetOntologyTopologyResponse,
  Ontologymetadataservicev1TopologyEdge,
  Ontologymetadataservicev1TopologyNode,
  PhysicalProperties
} from '@/types/graphApi';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import type {
  InstanceInferenceHit,
  InstanceInferenceResult,
  ResolvedAttributeValue,
  RelationshipInferenceStep,
  ThinkingProgressCallbacks
} from '../types';
import { fetchFieldCommentMap } from '@/pages/exploreAnalysis/objectBrowse/services/conditionQuery';
import {
  boostNodeScoreBySemanticNames,
  resolveRelationshipInferenceIntent,
  type RelationshipInferenceSemanticIntent
} from './relationshipInferenceSemantic';

const LOOKUP_QUERY_PATTERN =
  /多少|是什么|想知道|查询|获取|找出|查找|告诉我|怎么样|数值|的值|用多少|消耗|有没有|有哪些/;

const ENTITY_STOP_WORDS =
  /^(我想|知道|某|某辆|一辆|一个|这辆|那辆|这个|那个|的|是|多少|什么|有|在|吗|呢|请|帮|我|如何|怎么|想要|需要|根据|通过|以及|并且|然后|其中|相关|具体|信息|数据|记录|对象|类型|实例|图谱|关系|推理|分析|车辆|车|车牌|号码|基础|主数据)$/;

const VIN_PATTERN = /[A-HJ-NPR-Z0-9]{11,17}/i;

const TARGET_CONCEPT_ALIASES: Record<string, string[]> = {
  油耗: [
    '油耗',
    'fuel',
    '燃油',
    '升',
    'liters',
    'fuel_liters',
    'fuel_consumption',
    'refuel',
    '加油'
  ],
  车队: [
    '车队',
    'fleet',
    'fleet_code',
    'fleet_name',
    'fleet_org',
    '归属车队',
    '所属车队'
  ],
  里程: ['里程', 'mileage', '公里', 'km', 'odometer'],
  维修: ['维修', 'repair', 'maintain', '工单', 'work_order'],
  工单: ['工单', 'work_order', 'order_status', '维修单'],
  品牌: [
    '品牌',
    'brand',
    'manufacturer',
    'make',
    '厂商',
    '生产厂家',
    '车型品牌'
  ],
  位置: ['位置', 'location', 'gps', '经纬', '坐标', 'address', '地址'],
  费用: ['费用', 'cost', 'price', '金额', 'cost'],
  司机: ['司机', '驾驶员', 'driver', 'driver_name']
};

/** 必须通过链接跳转到其他对象类型才能完整回答的概念 */
const CROSS_TYPE_CONCEPTS = new Set([
  '油耗',
  '车队',
  '维修',
  '工单',
  '司机',
  '运单',
  '轨迹'
]);

const JOIN_KEY_ALIASES = [
  'id',
  '_id',
  'instanceId',
  'instance_id',
  'vin',
  'vehicle_vin',
  'plate_number',
  'plateNumber',
  'license_plate',
  'fleet_code',
  'fleetCode'
];

const CN_PLATE_PATTERN =
  /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][·•.\-]?[A-HJ-NPR-Z0-9]{4,6}/i;

const normalizeMatchText = (value: string) =>
  value.toLowerCase().replace(/[··•.\-_\s]/g, '');

const extractPlateHints = (query: string) => {
  const match = query.match(CN_PLATE_PATTERN);
  if (!match?.[0]) {
    return [];
  }

  const raw = match[0];
  const compact = raw.replace(/[··•.\-]/g, '').toUpperCase();
  return [...new Set([raw, raw.toUpperCase(), compact])];
};

const tokenizeEntityHints = (query: string) => {
  const normalized = query.trim();
  const hints = new Set<string>();

  extractPlateHints(normalized).forEach((item) => hints.add(item));

  const vinMatch = normalized.match(VIN_PATTERN);
  if (vinMatch?.[0]) {
    hints.add(vinMatch[0].toUpperCase());
  }

  normalized
    .split(/[\s,，;；、。：:？?！!的]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && !ENTITY_STOP_WORDS.test(item))
    .forEach((item) => hints.add(item));

  Object.keys(TARGET_CONCEPT_ALIASES).forEach((concept) => {
    if (normalized.includes(concept)) {
      hints.delete(concept);
    }
    TARGET_CONCEPT_ALIASES[concept].forEach((alias) => {
      if (normalized.toLowerCase().includes(alias.toLowerCase())) {
        hints.delete(alias);
      }
    });
  });

  return [...hints];
};

export const prefersRelationshipInference = (query: string) => {
  const targetConcepts = extractTargetConcepts(query);
  if (targetConcepts.some((concept) => CROSS_TYPE_CONCEPTS.has(concept))) {
    return true;
  }
  if (/车队|油耗|维修记录|工单|驾驶员|司机|所属|关联|归属|加油/.test(query)) {
    return true;
  }
  if (extractPlateHints(query).length > 0 && targetConcepts.length > 0) {
    return true;
  }
  return (
    extractPlateHints(query).length > 0 &&
    /的.{2,20}(?:信息|数据|记录|情况|多少|是什么)/.test(query)
  );
};

const extractTargetConcepts = (query: string) => {
  const normalized = query.toLowerCase();
  const concepts = new Set<string>();

  Object.entries(TARGET_CONCEPT_ALIASES).forEach(([concept, aliases]) => {
    if (
      normalized.includes(concept) ||
      aliases.some((alias) => normalized.includes(alias.toLowerCase()))
    ) {
      concepts.add(concept);
    }
  });

  if (!concepts.size && LOOKUP_QUERY_PATTERN.test(query)) {
    const afterDe = query.split(/的/);
    const tail = afterDe[afterDe.length - 1] || '';
    const tailToken = tail.replace(/[是多少什么吗呢？?！!]+/g, '').trim();
    if (tailToken.length >= 2 && !ENTITY_STOP_WORDS.test(tailToken)) {
      concepts.add(tailToken);
    }
  }

  return [...concepts];
};

const scoreTextByTokens = (text: string, tokens: string[]) => {
  const normalized = text.toLowerCase();
  return tokens.reduce(
    (score, token) =>
      normalized.includes(token.toLowerCase()) ? score + 1 : score,
    0
  );
};

const mergeUniqueStrings = (...groups: string[][]) => {
  const merged = new Set<string>();
  groups.forEach((group) => {
    group.forEach((item) => {
      const trimmed = item.trim();
      if (trimmed) {
        merged.add(trimmed);
      }
    });
  });
  return [...merged];
};

const buildConceptTokensFromSources = (
  targetConcepts: string[],
  semanticIntent: RelationshipInferenceSemanticIntent
) => {
  const concepts = mergeUniqueStrings(
    targetConcepts,
    semanticIntent.targetConcepts,
    semanticIntent.targetFieldKeywords
  );
  return buildConceptTokens(concepts.length ? concepts : ['']);
};

const buildConceptTokens = (concepts: string[]) => {
  const tokens = new Set<string>();
  concepts.forEach((concept) => {
    tokens.add(concept.toLowerCase());
    (TARGET_CONCEPT_ALIASES[concept] || []).forEach((alias) =>
      tokens.add(alias.toLowerCase())
    );
  });
  return [...tokens];
};

const instanceMatchesHints = (
  row: Record<string, unknown>,
  hints: string[]
) => {
  if (!hints.length) {
    return true;
  }

  const text = Object.values(row)
    .map((value) => (value == null ? '' : String(value)))
    .join(' ')
    .toLowerCase();

  return hints.some((hint) => {
    const normalizedHint = hint.toLowerCase();
    const compactHint = normalizeMatchText(hint);
    return (
      text.includes(normalizedHint) ||
      normalizeMatchText(text).includes(compactHint) ||
      Object.entries(row).some(([key, value]) => {
        const rawValue = String(value ?? '');
        return (
          key.toLowerCase().includes(normalizedHint) ||
          rawValue.toLowerCase().includes(normalizedHint) ||
          normalizeMatchText(rawValue).includes(compactHint)
        );
      })
    );
  });
};

const scoreInstanceMatch = (row: Record<string, unknown>, hints: string[]) => {
  const text = Object.values(row)
    .map((value) => (value == null ? '' : String(value)))
    .join(' ')
    .toLowerCase();

  return hints.reduce((score, hint) => {
    const normalizedHint = hint.toLowerCase();
    if (text.includes(normalizedHint)) {
      return score + (normalizedHint.length >= 8 ? 3 : 1);
    }
    return score;
  }, 0);
};

interface LinkDetail {
  id: number;
  name?: string;
  sourceObjectTypeID?: number;
  targetObjectTypeID?: number;
  linkSourceColumnName?: string;
  linkTargetColumnName?: string;
}

interface GraphPathStep {
  edge: Ontologymetadataservicev1TopologyEdge;
  link: LinkDetail;
  fromTypeId: number;
  toTypeId: number;
  forward: boolean;
}

const loadLinkDetail = async (
  edge: Ontologymetadataservicev1TopologyEdge,
  cache: Map<number, LinkDetail>
): Promise<LinkDetail | null> => {
  const edgeId = Number(edge.id);
  if (!Number.isFinite(edgeId)) {
    return null;
  }

  if (cache.has(edgeId)) {
    return cache.get(edgeId) || null;
  }

  try {
    const res = await getOntologyLinkType({ id: edgeId });
    if (!isOntologyApiSuccess(res) || !res.data) {
      cache.set(edgeId, null as unknown as LinkDetail);
      return null;
    }

    const detail: LinkDetail = {
      id: edgeId,
      name: res.data.name || edge.name,
      sourceObjectTypeID: res.data.sourceObjectTypeID ?? edge.sourceId,
      targetObjectTypeID: res.data.targetObjectTypeID ?? edge.targetId,
      linkSourceColumnName: res.data.linkSourceColumnName,
      linkTargetColumnName: res.data.linkTargetColumnName
    };
    cache.set(edgeId, detail);
    return detail;
  } catch {
    cache.set(edgeId, null as unknown as LinkDetail);
    return null;
  }
};

const findPaths = (
  topology: GetOntologyTopologyResponse,
  startTypeId: number,
  targetTypeId: number,
  maxDepth = 3
): Ontologymetadataservicev1TopologyEdge[][] => {
  if (startTypeId === targetTypeId) {
    return [[]];
  }

  const edges = topology.edges || [];
  const queue: Array<{
    typeId: number;
    path: Ontologymetadataservicev1TopologyEdge[];
  }> = [{ typeId: startTypeId, path: [] }];
  const results: Ontologymetadataservicev1TopologyEdge[][] = [];

  while (queue.length && results.length < 5) {
    const current = queue.shift()!;
    if (current.path.length >= maxDepth) {
      continue;
    }

    for (const edge of edges) {
      if (edge.sourceId == null || edge.targetId == null || edge.id == null) {
        continue;
      }

      let nextTypeId: number | undefined;
      if (edge.sourceId === current.typeId) {
        nextTypeId = edge.targetId;
      } else if (edge.targetId === current.typeId) {
        nextTypeId = edge.sourceId;
      } else {
        continue;
      }

      if (current.path.some((item) => item.id === edge.id)) {
        continue;
      }

      const nextPath = [...current.path, edge];
      if (nextTypeId === targetTypeId) {
        results.push(nextPath);
        continue;
      }

      queue.push({ typeId: nextTypeId, path: nextPath });
    }
  }

  return results;
};

const resolveNodeName = (node?: Ontologymetadataservicev1TopologyNode) =>
  node?.name || node?.code || '未命名对象类型';

const normalizeJoinKey = (value: string) =>
  value.toLowerCase().replace(/[··•.\-_\s]/g, '');

const resolveJoinKeys = (
  instance: Record<string, unknown>,
  ...columns: (string | undefined)[]
) => {
  const keys = new Set<string>();

  columns.forEach((column) => {
    if (!column) {
      return;
    }
    const value = resolveRowFieldValue(instance, column);
    if (value != null && String(value).trim()) {
      keys.add(String(value).trim());
    }
  });

  JOIN_KEY_ALIASES.forEach((field) => {
    const value = resolveRowFieldValue(instance, field);
    if (value != null && String(value).trim()) {
      keys.add(String(value).trim());
    }
  });

  return [...keys];
};

const buildJoinKeySet = (joinKeys: string[]) =>
  new Set([
    ...joinKeys.map((key) => key.toLowerCase()),
    ...joinKeys.map((key) => normalizeJoinKey(key))
  ]);

const rowMatchesJoinKeys = (
  row: Record<string, unknown>,
  fields: string[],
  joinKeySet: Set<string>
) =>
  fields.some((field) => {
    const raw = resolveRowFieldValue(row, field);
    if (raw == null) {
      return false;
    }
    const text = String(raw);
    const lower = text.toLowerCase();
    const compact = normalizeJoinKey(text);
    return joinKeySet.has(lower) || joinKeySet.has(compact);
  });

const filterInstancesByJoinKeys = (
  rows: Record<string, unknown>[],
  column: string | undefined,
  joinKeys: string[]
) => {
  if (!joinKeys.length) {
    return [];
  }

  const joinKeySet = buildJoinKeySet(joinKeys);
  const columns = column
    ? [column, ...JOIN_KEY_ALIASES]
    : [...JOIN_KEY_ALIASES, ...Object.keys(rows[0] || {})];

  return rows.filter((row) => rowMatchesJoinKeys(row, columns, joinKeySet));
};

const filterLinkRowsByJoinKeys = (
  rows: Record<string, unknown>[],
  column: string | undefined,
  joinKeys: string[]
) => {
  if (!joinKeys.length) {
    return [];
  }

  const joinKeySet = buildJoinKeySet(joinKeys);
  const columns = column
    ? [column]
    : [...JOIN_KEY_ALIASES, ...Object.keys(rows[0] || {})];

  return rows.filter((row) => rowMatchesJoinKeys(row, columns, joinKeySet));
};

const pickTargetFields = (
  properties: PhysicalProperties[],
  conceptTokens: string[]
) => {
  const matched = properties.filter((property) => {
    const text =
      `${property.name || ''} ${property.comment || ''}`.toLowerCase();
    return conceptTokens.some((token) => text.includes(token));
  });

  if (matched.length) {
    return matched.map((property) => property.name!).filter(Boolean);
  }

  return properties
    .map((property) => property.name)
    .filter((name): name is string => Boolean(name))
    .slice(0, 3);
};

const scoreNodeForConcepts = (
  node: Ontologymetadataservicev1TopologyNode,
  conceptTokens: string[],
  extraText = ''
) => {
  const nodeText = `${node.name || ''} ${node.code || ''} ${node.description || ''}`;
  const propertyText = (node.ontologyPhysicalPropertiesList || [])
    .map((property) => `${property.name || ''} ${property.type || ''}`)
    .join(' ');
  return scoreTextByTokens(
    `${nodeText} ${propertyText} ${extraText}`,
    conceptTokens.filter(Boolean)
  );
};

const getEdgesForType = (
  topology: GetOntologyTopologyResponse,
  typeId: number
) =>
  (topology.edges || []).filter(
    (edge) => edge.sourceId === typeId || edge.targetId === typeId
  );

const resolveNeighborTypeId = (
  edge: Ontologymetadataservicev1TopologyEdge,
  currentTypeId: number
) => {
  if (edge.sourceId === currentTypeId) {
    return edge.targetId;
  }
  if (edge.targetId === currentTypeId) {
    return edge.sourceId;
  }
  return undefined;
};

const buildGraphStep = async (
  edge: Ontologymetadataservicev1TopologyEdge,
  fromTypeId: number,
  linkCache: Map<number, LinkDetail>
): Promise<GraphPathStep | null> => {
  const neighborTypeId = resolveNeighborTypeId(edge, fromTypeId);
  if (neighborTypeId == null) {
    return null;
  }

  const link = await loadLinkDetail(edge, linkCache);
  const resolvedLink: LinkDetail = link || {
    id: Number(edge.id),
    name: edge.name,
    sourceObjectTypeID: edge.sourceId,
    targetObjectTypeID: edge.targetId
  };

  const forward =
    resolvedLink.sourceObjectTypeID === fromTypeId ||
    edge.sourceId === fromTypeId;
  const toTypeId = forward
    ? Number(resolvedLink.targetObjectTypeID ?? neighborTypeId)
    : Number(resolvedLink.sourceObjectTypeID ?? neighborTypeId);

  if (!Number.isFinite(toTypeId)) {
    return null;
  }

  return {
    edge,
    link: resolvedLink,
    fromTypeId,
    toTypeId,
    forward
  };
};

const loadTargetInstancesByKeys = async (
  objectTypeId: number,
  joinColumn: string | undefined,
  joinKeys: string[]
) => {
  const targetRes = await queryObjectTypeInstances({
    objectTypeId,
    page: 1,
    pageSize: 200
  });

  return filterInstancesByJoinKeys(targetRes.items, joinColumn, joinKeys);
};

const traverseViaLinkTable = async (params: {
  currentInstances: Record<string, unknown>[];
  step: GraphPathStep;
}): Promise<Record<string, unknown>[] | null> => {
  const { currentInstances, step } = params;
  const linkTypeId = Number(step.edge.id ?? step.link.id);
  if (!Number.isFinite(linkTypeId)) {
    return null;
  }

  const sourceColumn = step.forward
    ? step.link.linkSourceColumnName
    : step.link.linkTargetColumnName;
  const targetColumn = step.forward
    ? step.link.linkTargetColumnName
    : step.link.linkSourceColumnName;

  const anchorKeys = currentInstances.flatMap((instance) =>
    resolveJoinKeys(instance, sourceColumn)
  );
  if (!anchorKeys.length) {
    return null;
  }

  try {
    const linkDataRes = await listOntologyLinkTypeData({
      id: linkTypeId,
      page: 1,
      pageSize: 500
    });

    if (
      !isOntologyApiSuccess(linkDataRes) ||
      !linkDataRes.data?.result?.length
    ) {
      return null;
    }

    const matchedLinkRows = filterLinkRowsByJoinKeys(
      linkDataRes.data.result,
      sourceColumn,
      anchorKeys
    );
    if (!matchedLinkRows.length) {
      return null;
    }

    const targetKeys = [
      ...new Set(
        matchedLinkRows.flatMap((row) => {
          const value = targetColumn
            ? resolveRowFieldValue(row, targetColumn)
            : undefined;
          return value == null || String(value).trim() === ''
            ? []
            : [String(value).trim()];
        })
      )
    ];

    if (!targetKeys.length) {
      return matchedLinkRows;
    }

    return loadTargetInstancesByKeys(step.toTypeId, targetColumn, targetKeys);
  } catch {
    return null;
  }
};

const traverseSingleLink = async (params: {
  currentInstances: Record<string, unknown>[];
  step: GraphPathStep;
}): Promise<Record<string, unknown>[] | null> => {
  const viaLinkTable = await traverseViaLinkTable(params);
  if (viaLinkTable?.length) {
    return viaLinkTable;
  }

  const { currentInstances, step } = params;
  const sourceColumn = step.forward
    ? step.link.linkSourceColumnName
    : step.link.linkTargetColumnName;
  const targetColumn = step.forward
    ? step.link.linkTargetColumnName
    : step.link.linkSourceColumnName;

  const joinKeys = currentInstances.flatMap((instance) =>
    resolveJoinKeys(instance, sourceColumn, targetColumn)
  );

  if (!joinKeys.length) {
    return null;
  }

  try {
    return await loadTargetInstancesByKeys(
      step.toTypeId,
      targetColumn,
      joinKeys
    ).then((matched) => (matched.length ? matched : null));
  } catch {
    return null;
  }
};

const loadTargetProperties = async (
  ontologySceneId: number,
  targetTypeId: number,
  targetNode?: Ontologymetadataservicev1TopologyNode
) => {
  let properties: PhysicalProperties[] =
    targetNode?.ontologyPhysicalPropertiesList?.map((property) => ({
      name: property.name,
      comment: property.name,
      type: property.type
    })) || [];

  try {
    const propertyRes = await listOntologyPhysicalProperties({
      ontologyModelID: ontologySceneId,
      objectTypeIdList: [targetTypeId],
      pageNo: 1,
      pageSize: 200,
      isUse: 1
    });
    if (isOntologyApiSuccess(propertyRes) && propertyRes.data?.result?.length) {
      properties = propertyRes.data.result;
    }
  } catch {
    // ignore property fetch errors
  }

  return properties;
};

const buildResolvedValues = (
  instances: Record<string, unknown>[],
  properties: PhysicalProperties[],
  conceptTokens: string[],
  targetTypeName: string,
  requireConceptMatch = false
) => {
  const conceptMatched = properties.filter((property) => {
    const text =
      `${property.name || ''} ${property.comment || ''}`.toLowerCase();
    return conceptTokens.some((token) => text.includes(token));
  });

  if (requireConceptMatch && !conceptMatched.length) {
    return [];
  }

  const targetFields = conceptMatched.length
    ? conceptMatched.map((property) => property.name!).filter(Boolean)
    : pickTargetFields(properties, conceptTokens);
  const resolvedValues: ResolvedAttributeValue[] = [];

  instances.forEach((instance) => {
    targetFields.forEach((fieldName) => {
      const value = instance[fieldName];
      if (value == null || String(value).trim() === '') {
        return;
      }

      const property = properties.find((item) => item.name === fieldName);
      resolvedValues.push({
        objectTypeName: targetTypeName,
        fieldName,
        fieldLabel: property?.comment || fieldName,
        value: String(value),
        instance
      });
    });
  });

  return resolvedValues;
};

const filterPropertiesMatchingConcepts = (
  properties: PhysicalProperties[],
  conceptTokens: string[]
) => {
  const tokens = conceptTokens.filter(Boolean);
  if (!tokens.length) {
    return [];
  }

  return properties.filter((property) => {
    const text =
      `${property.name || ''} ${property.comment || ''}`.toLowerCase();
    return tokens.some((token) => text.includes(token.toLowerCase()));
  });
};

const buildResolvedValuesFromInstanceFields = (
  instance: Record<string, unknown>,
  fieldLabels: Record<string, string>,
  conceptTokens: string[],
  typeName: string
) => {
  const tokens = conceptTokens.filter(Boolean);
  if (!tokens.length) {
    return [] as ResolvedAttributeValue[];
  }

  const resolvedValues: ResolvedAttributeValue[] = [];

  Object.entries(instance).forEach(([fieldName, value]) => {
    if (value == null || String(value).trim() === '') {
      return;
    }

    const text = `${fieldName} ${fieldLabels[fieldName] || ''}`.toLowerCase();
    if (!tokens.some((token) => text.includes(token.toLowerCase()))) {
      return;
    }

    resolvedValues.push({
      objectTypeName: typeName,
      fieldName,
      fieldLabel: fieldLabels[fieldName] || fieldName,
      value: String(value),
      instance
    });
  });

  return resolvedValues;
};

const buildAnchorLocateDescription = (
  anchorTypeName: string,
  anchorInstance: Record<string, unknown>
) =>
  `在「${anchorTypeName}」中定位实体：${Object.entries(anchorInstance)
    .slice(0, 4)
    .map(([key, value]) => `${key}=${String(value ?? '')}`)
    .join('，')}`;

const buildSameTypeInferenceResult = async (params: {
  ontologySceneId: number;
  query: string;
  sceneName?: string;
  anchorTypeId: number;
  anchorTypeName: string;
  anchorInstance: Record<string, unknown>;
  resolvedValues: ResolvedAttributeValue[];
  matchedFieldLabels: string[];
  semanticIntent?: RelationshipInferenceSemanticIntent;
}): Promise<InstanceInferenceResult> => {
  const {
    ontologySceneId,
    query,
    sceneName,
    anchorTypeId,
    anchorTypeName,
    anchorInstance,
    resolvedValues,
    matchedFieldLabels,
    semanticIntent
  } = params;

  const anchorFieldLabels = await fetchFieldCommentMap(
    ontologySceneId,
    anchorTypeId
  ).catch(() => ({}) as Record<string, string>);

  const valueLines = resolvedValues
    .slice(0, 8)
    .map(
      (item) =>
        `${item.fieldLabel || item.fieldName}：${item.value}（${item.objectTypeName}）`
    )
    .join('\n');

  const semanticLines = semanticIntent?.parseIntent
    ? [
        `语义理解：${semanticIntent.parseIntent}（${semanticIntent.source === 'llm' ? '大模型' : '启发式'}）`,
        semanticIntent.anchorObjectTypeNames.length
          ? `起点对象类型：${semanticIntent.anchorObjectTypeNames.join('、')}`
          : '',
        matchedFieldLabels.length
          ? `命中属性：${matchedFieldLabels.join('、')}`
          : ''
      ].filter(Boolean)
    : matchedFieldLabels.length
      ? [`命中属性：${matchedFieldLabels.join('、')}`]
      : [];

  const inferencePath = [
    `查询语句：${query}`,
    '推理模式：语义理解 + 同对象类型属性命中（未命中规则）',
    ...semanticLines,
    `步骤 1：${buildAnchorLocateDescription(anchorTypeName, anchorInstance)}`,
    `步骤 2：当前对象类型「${anchorTypeName}」已包含目标属性，直接返回字段值`,
    `解析结果：\n${valueLines}`
  ].join('\n');

  return {
    query,
    summary: `在图谱「${sceneName || ontologySceneId}」中，未命中规则，已在「${anchorTypeName}」定位实体；目标信息存在于当前对象类型属性中，直接返回 ${resolvedValues.length} 项结果。`,
    hits: [
      {
        objectTypeId: anchorTypeId,
        objectTypeName: anchorTypeName,
        instanceCount: 1,
        matchedRuleNames: [],
        sampleInstances: [anchorInstance],
        fieldLabels: anchorFieldLabels
      }
    ],
    appliedRules: [],
    inferenceMode: 'relationship',
    inferencePath,
    resolvedValues
  };
};

const requiresLinkTraversal = (
  targetConcepts: string[],
  semanticIntent: RelationshipInferenceSemanticIntent | undefined,
  anchorTypeName: string
) => {
  if (targetConcepts.some((concept) => CROSS_TYPE_CONCEPTS.has(concept))) {
    return true;
  }

  const anchorText = [
    anchorTypeName,
    ...(semanticIntent?.anchorObjectTypeNames || [])
  ]
    .join(' ')
    .toLowerCase();
  const targetNames = semanticIntent?.targetObjectTypeNames || [];

  if (!targetNames.length) {
    return false;
  }

  return targetNames.some((name) => {
    const normalized = name.toLowerCase();
    return (
      normalized &&
      !anchorText.includes(normalized) &&
      !normalized.includes(anchorText)
    );
  });
};

const tryResolveFromAnchorTypeProperties = async (params: {
  ontologySceneId: number;
  query: string;
  sceneName?: string;
  anchorTypeId: number;
  anchorTypeName: string;
  anchorInstance: Record<string, unknown>;
  anchorNode?: Ontologymetadataservicev1TopologyNode;
  conceptTokens: string[];
  semanticIntent?: RelationshipInferenceSemanticIntent;
}): Promise<InstanceInferenceResult | null> => {
  if (
    requiresLinkTraversal(
      params.conceptTokens.filter(Boolean),
      params.semanticIntent,
      params.anchorTypeName
    )
  ) {
    return null;
  }

  const meaningfulConceptTokens = params.conceptTokens.filter(Boolean);
  if (!meaningfulConceptTokens.length) {
    return null;
  }

  const properties = await loadTargetProperties(
    params.ontologySceneId,
    params.anchorTypeId,
    params.anchorNode
  );
  const conceptMatchedProperties = filterPropertiesMatchingConcepts(
    properties,
    meaningfulConceptTokens
  );

  const fieldLabels = await fetchFieldCommentMap(
    params.ontologySceneId,
    params.anchorTypeId
  ).catch(() => ({}) as Record<string, string>);

  if (conceptMatchedProperties.length) {
    const resolvedValues = buildResolvedValues(
      [params.anchorInstance],
      properties,
      meaningfulConceptTokens,
      params.anchorTypeName,
      true
    );

    if (!resolvedValues.length) {
      return null;
    }

    return buildSameTypeInferenceResult({
      ontologySceneId: params.ontologySceneId,
      query: params.query,
      sceneName: params.sceneName,
      anchorTypeId: params.anchorTypeId,
      anchorTypeName: params.anchorTypeName,
      anchorInstance: params.anchorInstance,
      resolvedValues,
      matchedFieldLabels: conceptMatchedProperties.map(
        (property) => property.comment || property.name || ''
      ),
      semanticIntent: params.semanticIntent
    });
  }

  const resolvedValues = buildResolvedValuesFromInstanceFields(
    params.anchorInstance,
    fieldLabels,
    meaningfulConceptTokens,
    params.anchorTypeName
  );

  if (!resolvedValues.length) {
    return null;
  }

  return buildSameTypeInferenceResult({
    ontologySceneId: params.ontologySceneId,
    query: params.query,
    sceneName: params.sceneName,
    anchorTypeId: params.anchorTypeId,
    anchorTypeName: params.anchorTypeName,
    anchorInstance: params.anchorInstance,
    resolvedValues,
    matchedFieldLabels: resolvedValues.map(
      (item) => item.fieldLabel || item.fieldName
    ),
    semanticIntent: params.semanticIntent
  });
};

const buildRelationshipInferenceResult = async (params: {
  ontologySceneId: number;
  query: string;
  sceneName?: string;
  anchorTypeId: number;
  anchorTypeName: string;
  anchorInstance: Record<string, unknown>;
  targetTypeId: number;
  targetTypeName: string;
  targetInstances: Record<string, unknown>[];
  relationshipSteps: RelationshipInferenceStep[];
  conceptTokens: string[];
  targetNode?: Ontologymetadataservicev1TopologyNode;
  requireConceptMatch?: boolean;
  semanticIntent?: RelationshipInferenceSemanticIntent;
}): Promise<InstanceInferenceResult | null> => {
  const {
    ontologySceneId,
    query,
    sceneName,
    anchorTypeId,
    anchorTypeName,
    anchorInstance,
    targetTypeId,
    targetTypeName,
    targetInstances,
    relationshipSteps,
    conceptTokens,
    targetNode,
    requireConceptMatch = false,
    semanticIntent
  } = params;

  const properties = await loadTargetProperties(
    ontologySceneId,
    targetTypeId,
    targetNode
  );
  let resolvedValues = buildResolvedValues(
    targetInstances,
    properties,
    conceptTokens,
    targetTypeName,
    requireConceptMatch
  );

  if (!resolvedValues.length && requireConceptMatch) {
    resolvedValues = buildResolvedValues(
      targetInstances,
      properties,
      conceptTokens,
      targetTypeName,
      false
    );
  }

  if (!resolvedValues.length) {
    return null;
  }

  const [anchorFieldLabels, targetFieldLabels] = await Promise.all([
    fetchFieldCommentMap(ontologySceneId, anchorTypeId).catch(
      () => ({}) as Record<string, string>
    ),
    fetchFieldCommentMap(ontologySceneId, targetTypeId).catch(
      () => ({}) as Record<string, string>
    )
  ]);

  const hits: InstanceInferenceHit[] = [
    {
      objectTypeId: anchorTypeId,
      objectTypeName: anchorTypeName,
      instanceCount: 1,
      matchedRuleNames: [],
      sampleInstances: [anchorInstance],
      fieldLabels: anchorFieldLabels
    },
    {
      objectTypeId: targetTypeId,
      objectTypeName: targetTypeName,
      instanceCount: targetInstances.length,
      matchedRuleNames: [],
      sampleInstances: targetInstances,
      fieldLabels: targetFieldLabels
    }
  ];

  const valueLines = resolvedValues
    .slice(0, 8)
    .map(
      (item) =>
        `${item.fieldLabel || item.fieldName}：${item.value}（${item.objectTypeName}）`
    )
    .join('\n');

  const semanticLines = semanticIntent?.parseIntent
    ? [
        `语义理解：${semanticIntent.parseIntent}（${semanticIntent.source === 'llm' ? '大模型' : '启发式'}）`,
        semanticIntent.anchorObjectTypeNames.length
          ? `起点对象类型：${semanticIntent.anchorObjectTypeNames.join('、')}`
          : '',
        semanticIntent.targetObjectTypeNames.length
          ? `目标对象类型：${semanticIntent.targetObjectTypeNames.join('、')}`
          : ''
      ].filter(Boolean)
    : [];

  const inferencePath = [
    `查询语句：${query}`,
    '推理模式：语义理解 + 图谱关系链推理（未命中规则）',
    ...semanticLines,
    ...relationshipSteps.map(
      (step) => `步骤 ${step.step}：${step.description}`
    ),
    `目标对象类型：${targetTypeName}`,
    `解析结果：\n${valueLines}`
  ].join('\n');

  return {
    query,
    summary: `在图谱「${sceneName || ontologySceneId}」中，未命中规则，已通过语义理解定位对象类型并沿关系链推理：先在「${anchorTypeName}」定位实体，再关联到「${targetTypeName}」，得到 ${resolvedValues.length} 项结果。`,
    hits,
    appliedRules: [],
    inferenceMode: 'relationship',
    inferencePath,
    resolvedValues
  };
};

export const shouldUseRelationshipInference = (
  _query: string,
  matchedRuleCount: number
) => matchedRuleCount === 0;

const buildQueryContextTokens = (query: string, entityHints: string[]) => {
  const tokens = new Set(entityHints);
  query
    .split(/[\s,，;；、。：:？?！!查询检索搜索这个那个信息]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && !ENTITY_STOP_WORDS.test(item))
    .forEach((item) => tokens.add(item));
  return [...tokens];
};

const executeDirectGraphLookup = async (params: {
  ontologySceneId: number;
  query: string;
  sceneName?: string;
  topology: GetOntologyTopologyResponse;
  entityHints: string[];
}): Promise<InstanceInferenceResult | null> => {
  const { ontologySceneId, query, sceneName, topology, entityHints } = params;
  const contextTokens = buildQueryContextTokens(query, entityHints);
  const hasConcreteHints = entityHints.some(
    (hint) =>
      hint.length >= 4 || VIN_PATTERN.test(hint) || CN_PLATE_PATTERN.test(hint)
  );

  const scoredNodes = (topology.nodes || [])
    .filter((node) => node.id != null)
    .map((node) => {
      const nodeText = `${node.name || ''} ${node.code || ''} ${node.description || ''}`;
      let score = scoreTextByTokens(nodeText, contextTokens);
      if (
        /车|vehicle|vin|plate|车牌/i.test(nodeText) &&
        /车|vehicle|车牌|plate/i.test(query)
      ) {
        score += 2;
      }
      return { node, score };
    })
    .sort((left, right) => right.score - left.score);

  const nodesToScan = hasConcreteHints
    ? scoredNodes
    : scoredNodes.filter((item) => item.score > 0).slice(0, 8);

  if (!nodesToScan.length) {
    return null;
  }

  const hits: InstanceInferenceHit[] = [];
  const relationshipSteps: RelationshipInferenceStep[] = [];
  let stepNo = 1;

  for (const { node, score } of nodesToScan) {
    const objectTypeId = Number(node.id);
    if (!Number.isFinite(objectTypeId)) {
      continue;
    }

    let matchedInstances: Record<string, unknown>[] = [];
    try {
      const instanceRes = await queryObjectTypeInstances({
        objectTypeId,
        page: 1,
        pageSize: 100
      });
      const filterTokens = hasConcreteHints ? entityHints : contextTokens;
      matchedInstances = instanceRes.items
        .filter((row) => instanceMatchesHints(row, filterTokens))
        .sort(
          (left, right) =>
            scoreInstanceMatch(right, filterTokens) -
            scoreInstanceMatch(left, filterTokens)
        );
    } catch {
      continue;
    }

    if (!matchedInstances.length) {
      continue;
    }

    const objectTypeName = resolveNodeName(node);
    const fieldLabels = await fetchFieldCommentMap(
      ontologySceneId,
      objectTypeId
    ).catch(() => ({}) as Record<string, string>);

    hits.push({
      objectTypeId,
      objectTypeName,
      instanceCount: matchedInstances.length,
      matchedRuleNames: [],
      sampleInstances: matchedInstances.slice(0, 5),
      fieldLabels
    });

    relationshipSteps.push({
      step: stepNo,
      description: `在图谱对象类型「${objectTypeName}」中定位 ${matchedInstances.length} 条匹配实例（节点相关度 ${score}）`
    });
    stepNo += 1;

    if (hasConcreteHints) {
      const anchorInstance = matchedInstances[0];
      const targetConcepts = extractTargetConcepts(query);
      const conceptTokens = buildConceptTokens(
        targetConcepts.length ? targetConcepts : ['']
      );

      if (prefersRelationshipInference(query)) {
        const linkCache = new Map<number, LinkDetail>();
        const nodeMap = new Map(
          (topology.nodes || [])
            .filter((item) => item.id != null)
            .map((item) => [item.id!, item])
        );
        const neighborEdges = getEdgesForType(topology, objectTypeId)
          .map((edge) => {
            const neighborTypeId = resolveNeighborTypeId(edge, objectTypeId);
            const neighborNode =
              neighborTypeId != null ? nodeMap.get(neighborTypeId) : undefined;
            if (!neighborNode || neighborTypeId == null) {
              return null;
            }

            return {
              edge,
              neighborNode,
              neighborTypeId,
              score: scoreNodeForConcepts(
                neighborNode,
                conceptTokens,
                edge.name || ''
              )
            };
          })
          .filter(
            (
              item
            ): item is {
              edge: Ontologymetadataservicev1TopologyEdge;
              neighborNode: Ontologymetadataservicev1TopologyNode;
              neighborTypeId: number;
              score: number;
            } => item != null
          )
          .sort((left, right) => right.score - left.score);

        for (const neighbor of neighborEdges.slice(0, 8)) {
          const step = await buildGraphStep(
            neighbor.edge,
            objectTypeId,
            linkCache
          );
          if (!step) {
            continue;
          }

          const targetInstances = await traverseSingleLink({
            currentInstances: [anchorInstance],
            step
          });
          if (!targetInstances?.length) {
            continue;
          }

          const targetTypeName = resolveNodeName(neighbor.neighborNode);
          const relationshipPathSteps: RelationshipInferenceStep[] = [
            {
              step: 1,
              description: buildAnchorLocateDescription(
                objectTypeName,
                anchorInstance
              )
            },
            {
              step: 2,
              description: `沿链接「${step.link.name || step.edge.name || '关联'}」从「${objectTypeName}」关联到「${targetTypeName}」`
            }
          ];

          const linkedResult = await buildRelationshipInferenceResult({
            ontologySceneId,
            query,
            sceneName,
            anchorTypeId: objectTypeId,
            anchorTypeName: objectTypeName,
            anchorInstance,
            targetTypeId: neighbor.neighborTypeId,
            targetTypeName,
            targetInstances: targetInstances.slice(0, 5),
            relationshipSteps: relationshipPathSteps,
            conceptTokens,
            targetNode: neighbor.neighborNode,
            requireConceptMatch: false
          });

          if (linkedResult) {
            return linkedResult;
          }
        }
      }

      break;
    }
  }

  if (!hits.length) {
    return null;
  }

  const totalInstances = hits.reduce((sum, hit) => sum + hit.instanceCount, 0);
  const inferencePath = [
    `查询语句：${query}`,
    '推理模式：图谱推理（未命中规则，单对象类型定位）',
    ...relationshipSteps.map(
      (step) => `步骤 ${step.step}：${step.description}`
    ),
    `命中对象类型：${hits.map((hit) => hit.objectTypeName).join('、')}`
  ].join('\n');

  return {
    query,
    summary: `在图谱「${sceneName || ontologySceneId}」中，未命中规则，已通过图谱推理命中 ${hits.length} 个对象类型、共 ${totalInstances} 条实例。`,
    hits,
    appliedRules: [],
    inferenceMode: 'relationship',
    inferencePath
  };
};

export const executeRelationshipInferenceQuery = async (params: {
  ontologySceneId: number;
  query: string;
  sceneName?: string;
  progress?: ThinkingProgressCallbacks;
}): Promise<InstanceInferenceResult | null> => {
  const { ontologySceneId, query, sceneName, progress } = params;
  const reportLine = (line: string) => progress?.onThinkingLine?.(line);
  const heuristicEntityHints = tokenizeEntityHints(query);
  const heuristicTargetConcepts = extractTargetConcepts(query);

  const topologyRes = await getOntologyTopology({ id: ontologySceneId });
  if (!isOntologyApiSuccess(topologyRes) || !topologyRes.data?.nodes?.length) {
    return null;
  }

  const topology = topologyRes.data;
  const queryContextTokens = buildQueryContextTokens(
    query,
    heuristicEntityHints
  );
  reportLine('▸ 语义理解：解析查询目标与实体线索…');
  const semanticIntent = await resolveRelationshipInferenceIntent({
    query,
    topology,
    entityHints: heuristicEntityHints,
    targetConcepts: heuristicTargetConcepts,
    queryContextTokens,
    progress
  });

  const entityHints = mergeUniqueStrings(
    heuristicEntityHints,
    semanticIntent.entityHints
  );
  const targetConcepts = mergeUniqueStrings(
    heuristicTargetConcepts,
    semanticIntent.targetConcepts,
    semanticIntent.targetFieldKeywords
  );

  if (semanticIntent.parseIntent) {
    reportLine(
      `  意图：${semanticIntent.parseIntent}（${semanticIntent.source === 'llm' ? '大模型' : '启发式'}）`
    );
  }
  if (entityHints.length) {
    reportLine(`  实体线索：${entityHints.join('、')}`);
  }
  if (targetConcepts.length) {
    reportLine(`  目标概念：${targetConcepts.join('、')}`);
  }

  const conceptTokens = buildConceptTokensFromSources(
    targetConcepts,
    semanticIntent
  );

  const nodeMap = new Map(
    (topology.nodes || [])
      .filter((node) => node.id != null)
      .map((node) => [node.id!, node])
  );
  const linkCache = new Map<number, LinkDetail>();

  const nodeMatchesSemanticTarget = (
    node: Ontologymetadataservicev1TopologyNode
  ) =>
    boostNodeScoreBySemanticNames(
      node,
      semanticIntent.targetObjectTypeNames,
      0
    ) > 0;

  const anchorCandidates = (topology.nodes || [])
    .map((node) => {
      const nodeText = `${node.name || ''} ${node.code || ''} ${node.description || ''}`;
      const entityScore = scoreTextByTokens(nodeText, entityHints);
      const vehicleBoost = /车|vehicle|plate|vin/i.test(nodeText) ? 1 : 0;
      const score = boostNodeScoreBySemanticNames(
        node,
        semanticIntent.anchorObjectTypeNames,
        entityScore + vehicleBoost
      );
      return { node, score };
    })
    .filter((item) => item.node.id != null)
    .sort((left, right) => right.score - left.score);

  const targetCandidates = (topology.nodes || [])
    .map((node) => ({
      node,
      score: boostNodeScoreBySemanticNames(
        node,
        semanticIntent.targetObjectTypeNames,
        scoreNodeForConcepts(node, conceptTokens)
      )
    }))
    .filter(
      (item) =>
        item.node.id != null &&
        (item.score > 0 || nodeMatchesSemanticTarget(item.node))
    )
    .sort((left, right) => right.score - left.score);

  const anchorNodes =
    anchorCandidates.filter((item) => item.score > 0).slice(0, 3).length > 0
      ? anchorCandidates.filter((item) => item.score > 0).slice(0, 3)
      : anchorCandidates.slice(0, 3);

  for (const anchorCandidate of anchorNodes) {
    const anchorTypeId = Number(anchorCandidate.node.id);
    if (!Number.isFinite(anchorTypeId)) {
      continue;
    }

    let anchorInstances: Record<string, unknown>[] = [];
    try {
      const anchorRes = await queryObjectTypeInstances({
        objectTypeId: anchorTypeId,
        page: 1,
        pageSize: 100
      });
      anchorInstances = entityHints.length
        ? anchorRes.items
            .filter((row) => instanceMatchesHints(row, entityHints))
            .sort(
              (left, right) =>
                scoreInstanceMatch(right, entityHints) -
                scoreInstanceMatch(left, entityHints)
            )
        : anchorRes.items.slice(0, 1);
    } catch {
      continue;
    }

    if (!anchorInstances.length) {
      continue;
    }

    const anchorInstance = anchorInstances[0];
    const anchorTypeName = resolveNodeName(anchorCandidate.node);

    const sameTypeResult = await tryResolveFromAnchorTypeProperties({
      ontologySceneId,
      query,
      sceneName,
      anchorTypeId,
      anchorTypeName,
      anchorInstance,
      anchorNode: anchorCandidate.node,
      conceptTokens,
      semanticIntent
    });

    if (sameTypeResult) {
      return sameTypeResult;
    }

    const fallbackNeighborTargets = getEdgesForType(topology, anchorTypeId)
      .map((edge) => {
        const neighborTypeId = resolveNeighborTypeId(edge, anchorTypeId);
        const neighborNode =
          neighborTypeId != null ? nodeMap.get(neighborTypeId) : undefined;
        if (!neighborNode || neighborTypeId == null) {
          return null;
        }

        return {
          node: neighborNode,
          score:
            boostNodeScoreBySemanticNames(
              neighborNode,
              semanticIntent.targetObjectTypeNames,
              scoreNodeForConcepts(neighborNode, conceptTokens, edge.name || '')
            ) + 1
        };
      })
      .filter(
        (
          item
        ): item is {
          node: Ontologymetadataservicev1TopologyNode;
          score: number;
        } => item != null
      )
      .sort((left, right) => right.score - left.score);

    const targetNodesToTry =
      targetCandidates.length > 0
        ? targetCandidates.slice(0, 5)
        : fallbackNeighborTargets.slice(0, 8);

    for (const targetCandidate of targetNodesToTry) {
      const targetTypeId = Number(targetCandidate.node.id);
      if (!Number.isFinite(targetTypeId) || targetTypeId === anchorTypeId) {
        continue;
      }

      const edgePaths = findPaths(topology, anchorTypeId, targetTypeId);
      if (!edgePaths.length) {
        continue;
      }

      for (const edgePath of edgePaths.slice(0, 2)) {
        const graphSteps: GraphPathStep[] = [];
        let currentTypeId = anchorTypeId;
        let validPath = true;

        for (const edge of edgePath) {
          const step = await buildGraphStep(edge, currentTypeId, linkCache);
          if (!step) {
            validPath = false;
            break;
          }

          graphSteps.push(step);
          currentTypeId = step.toTypeId;
        }

        if (!validPath || !graphSteps.length) {
          continue;
        }

        let currentInstances = [anchorInstance];
        let stepNo = 2;
        const relationshipSteps: RelationshipInferenceStep[] = [
          {
            step: 1,
            description: buildAnchorLocateDescription(
              anchorTypeName,
              anchorInstance
            )
          }
        ];
        reportLine(`  步骤 1：${relationshipSteps[0].description}`);

        for (const step of graphSteps) {
          const targetInstances = await traverseSingleLink({
            currentInstances,
            step
          });

          if (!targetInstances?.length) {
            validPath = false;
            break;
          }

          relationshipSteps.push({
            step: stepNo,
            description: `沿链接「${step.link.name || step.edge.name || '关联'}」从「${resolveNodeName(nodeMap.get(step.fromTypeId))}」关联到「${resolveNodeName(nodeMap.get(step.toTypeId))}」（${step.link.linkSourceColumnName || '-'} → ${step.link.linkTargetColumnName || '-'}）`
          });
          reportLine(
            `  步骤 ${stepNo}：${relationshipSteps[relationshipSteps.length - 1].description}`
          );
          stepNo += 1;
          currentInstances = targetInstances.slice(0, 5);
        }

        if (!validPath || !currentInstances.length) {
          continue;
        }

        const targetNode = nodeMap.get(targetTypeId);
        const targetTypeName = resolveNodeName(targetNode);
        const result = await buildRelationshipInferenceResult({
          ontologySceneId,
          query,
          sceneName,
          anchorTypeId,
          anchorTypeName,
          anchorInstance,
          targetTypeId,
          targetTypeName,
          targetInstances: currentInstances,
          relationshipSteps,
          conceptTokens,
          targetNode,
          semanticIntent
        });

        if (result) {
          return result;
        }
      }
    }

    const neighborEdges = getEdgesForType(topology, anchorTypeId)
      .map((edge) => {
        const neighborTypeId = resolveNeighborTypeId(edge, anchorTypeId);
        const neighborNode =
          neighborTypeId != null ? nodeMap.get(neighborTypeId) : undefined;
        if (!neighborNode || neighborTypeId == null) {
          return null;
        }

        const linkName = edge.name || '';
        const score =
          boostNodeScoreBySemanticNames(
            neighborNode,
            semanticIntent.targetObjectTypeNames,
            scoreNodeForConcepts(neighborNode, conceptTokens, linkName)
          ) +
          (targetCandidates.some(
            (candidate) => Number(candidate.node.id) === neighborTypeId
          )
            ? 1
            : 0);

        return { edge, neighborNode, neighborTypeId, score };
      })
      .filter(
        (
          item
        ): item is {
          edge: Ontologymetadataservicev1TopologyEdge;
          neighborNode: Ontologymetadataservicev1TopologyNode;
          neighborTypeId: number;
          score: number;
        } => item != null
      )
      .sort((left, right) => right.score - left.score);

    for (const neighbor of neighborEdges.slice(0, 8)) {
      const step = await buildGraphStep(neighbor.edge, anchorTypeId, linkCache);
      if (!step) {
        continue;
      }

      const targetInstances = await traverseSingleLink({
        currentInstances: [anchorInstance],
        step
      });
      if (!targetInstances?.length) {
        continue;
      }

      const targetTypeName = resolveNodeName(neighbor.neighborNode);
      const relationshipSteps: RelationshipInferenceStep[] = [
        {
          step: 1,
          description: buildAnchorLocateDescription(
            anchorTypeName,
            anchorInstance
          )
        },
        {
          step: 2,
          description: `沿链接「${step.link.name || step.edge.name || '关联'}」从「${anchorTypeName}」关联到「${targetTypeName}」（${step.link.linkSourceColumnName || '-'} → ${step.link.linkTargetColumnName || '-'}）`
        }
      ];

      const targetMatchesConcept =
        neighbor.score > 0 ||
        scoreNodeForConcepts(neighbor.neighborNode, conceptTokens) > 0 ||
        nodeMatchesSemanticTarget(neighbor.neighborNode);

      const result = await buildRelationshipInferenceResult({
        ontologySceneId,
        query,
        sceneName,
        anchorTypeId,
        anchorTypeName,
        anchorInstance,
        targetTypeId: neighbor.neighborTypeId,
        targetTypeName,
        targetInstances: targetInstances.slice(0, 5),
        relationshipSteps,
        conceptTokens,
        targetNode: neighbor.neighborNode,
        requireConceptMatch: !targetMatchesConcept,
        semanticIntent
      });

      if (result) {
        return result;
      }
    }
  }

  return executeDirectGraphLookup({
    ontologySceneId,
    query,
    sceneName,
    topology,
    entityHints
  });
};
