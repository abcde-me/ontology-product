import { getOntologyTopology } from '@/api/ontologySceneLibrary/graph';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { queryObjectTypeInstances } from '@/pages/exploreAnalysis/objectBrowse/services/instanceQuery';
import type {
  ApplicationScenarioRule,
  InstanceInferenceHit,
  InstanceInferenceResult,
  ThinkingProgressCallbacks
} from '../types';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import {
  executeRelationshipInferenceQuery,
  prefersRelationshipInference
} from './relationshipInferenceQuery';
import { fetchFieldCommentMap } from '@/pages/exploreAnalysis/objectBrowse/services/conditionQuery';
import {
  PLATE_QUERY_PATTERN,
  REGION_PLATE_ALIASES,
  resolveMatchedRegions,
  resolvePlatePrefixTokens
} from '@/utils/regionPlateAliases';

const CN_TOKEN_SPLITTER =
  /[\s,，;；、。：:？?！!与和及的相关中在按则若把将对进行执行查询检索搜索统计展示图谱规则实例覆盖对象类型有吗呢么是不是有没有哪些什么多少哪]+/;

const DOMAIN_KEYWORDS = [
  '车辆',
  '车牌',
  '地方',
  '省市',
  '简称',
  '维修',
  '工单'
];

const PLATE_FIELD_NAMES = [
  'plate_number',
  'plateNumber',
  'license_plate',
  'licensePlate',
  '车牌',
  '车牌号',
  '车牌号码'
];

const QUERY_AGGREGATE_PATTERN =
  /统计|数量|覆盖|有哪些|多少|列举|列出|展示全部|全部实例|对象类型.*实例|实例.*对象类型/;

const normalizePlate = (value: unknown) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[··•.\-_\s]/g, '');

/** 中文自然语言分词：避免整句无法与节点名/规则关键词匹配 */
const tokenize = (text: string) => {
  const normalized = text.toLowerCase().trim();
  if (!normalized) {
    return [];
  }

  const segments = normalized
    .split(CN_TOKEN_SPLITTER)
    .map((item) => item.replace(/[吗呢？?！!]+$/g, '').trim())
    .filter((item) => item.length >= 2);

  const keywords = DOMAIN_KEYWORDS.filter((keyword) =>
    normalized.includes(keyword.toLowerCase())
  );

  return [...new Set([...segments, ...keywords])];
};

const hasLocationQueryIntent = (query: string) =>
  resolveMatchedRegions(query).length > 0 || PLATE_QUERY_PATTERN.test(query);

const expandLocationTokens = (query: string, tokens: string[]) => {
  const normalized = query.toLowerCase().trim();
  const expanded = new Set(tokens);

  Object.entries(REGION_PLATE_ALIASES).forEach(([region, aliases]) => {
    if (!normalized.includes(region.toLowerCase())) {
      return;
    }

    expanded.add(region.toLowerCase());
    aliases.forEach((alias) => expanded.add(alias.toLowerCase()));
  });

  return [...expanded];
};

const buildInstanceFilterTokens = (
  query: string,
  tokens: string[],
  matchedRules: Array<{ rule: ApplicationScenarioRule }>
) => {
  const platePrefixes = resolvePlatePrefixTokens(query);
  if (platePrefixes.length > 0) {
    return platePrefixes;
  }

  const expanded = expandLocationTokens(query, tokens);
  const locationTokens = expanded.filter((token) => {
    if (
      Object.keys(REGION_PLATE_ALIASES).some(
        (region) => region.toLowerCase() === token
      )
    ) {
      return true;
    }

    return Object.values(REGION_PLATE_ALIASES).some((aliases) =>
      aliases.some((alias) => alias.toLowerCase() === token)
    );
  });

  if (locationTokens.length > 0) {
    return locationTokens;
  }

  const ruleMentionsPlate = matchedRules.some(({ rule }) =>
    /车牌|省市简称|地方|牌照/.test(`${rule.condition} ${rule.action}`)
  );

  if (ruleMentionsPlate && normalizedIncludesVehicle(query)) {
    return expanded.filter((token) => token !== '车辆');
  }

  return expanded;
};

const normalizedIncludesVehicle = (text: string) => /车辆|车牌|车/.test(text);

const isVehiclePlateRule = (rule: ApplicationScenarioRule) =>
  /车牌|车辆|地方|省市|简称/.test(
    `${rule.name} ${rule.condition} ${rule.action}`
  );

const scoreText = (text: string, tokens: string[]) => {
  const normalized = text.toLowerCase();
  return tokens.reduce(
    (score, token) => (normalized.includes(token) ? score + 1 : score),
    0
  );
};

const matchRules = (query: string, rules: ApplicationScenarioRule[]) => {
  const tokens = tokenize(query);
  const normalizedQuery = query.toLowerCase().trim();

  return rules
    .filter((rule) => rule.enabled)
    .map((rule) => {
      const text = `${rule.name} ${rule.condition} ${rule.action} ${rule.description || ''}`;
      let relevance = scoreText(text, tokens);

      if (rule.name && normalizedQuery.includes(rule.name.toLowerCase())) {
        relevance += 3;
      }

      relevance += scoreText(normalizedQuery, tokenize(rule.condition));
      relevance += scoreText(normalizedQuery, tokenize(rule.action));

      return { rule, relevance };
    })
    .filter((item) => item.relevance > 0)
    .sort((left, right) => right.relevance - left.relevance);
};

const isAggregateRuleQuery = (
  query: string,
  matchedRules: Array<{ rule: ApplicationScenarioRule }>
) => {
  if (!QUERY_AGGREGATE_PATTERN.test(query)) {
    return false;
  }

  return matchedRules.some(({ rule }) =>
    /统计|数量|覆盖|对象类型|实例|列举|列出|展示/.test(
      `${rule.condition} ${rule.action}`
    )
  );
};

const resolvePlateValue = (row: Record<string, unknown>) => {
  for (const field of PLATE_FIELD_NAMES) {
    if (row[field] != null && String(row[field]).trim()) {
      return String(row[field]);
    }
  }

  return '';
};

const isPlatePrefixToken = (token: string) =>
  Object.values(REGION_PLATE_ALIASES).some((aliases) =>
    aliases.some((alias) => alias.toLowerCase() === token.toLowerCase())
  );

const matchPlatePrefixes = (plateText: string, tokens: string[]) => {
  if (!plateText) {
    return false;
  }

  return tokens.some((token) => {
    const compactToken = normalizePlate(token);
    if (!compactToken) {
      return false;
    }

    return (
      plateText.startsWith(compactToken) || plateText.includes(compactToken)
    );
  });
};

const instanceMatchesQuery = (
  row: Record<string, unknown>,
  tokens: string[],
  options?: { platePrefixOnly?: boolean }
) => {
  const plateText = normalizePlate(resolvePlateValue(row));

  if (options?.platePrefixOnly) {
    return matchPlatePrefixes(plateText, tokens);
  }

  const text = Object.values(row)
    .map((value) => (value == null ? '' : String(value)))
    .join(' ')
    .toLowerCase();

  const platePrefixTokens = tokens.filter(isPlatePrefixToken);
  const generalTokens = tokens.filter((token) => !isPlatePrefixToken(token));

  if (platePrefixTokens.length > 0) {
    const plateMatched = matchPlatePrefixes(plateText, platePrefixTokens);
    if (!plateMatched) {
      return false;
    }

    if (!generalTokens.length) {
      return true;
    }
  }

  return generalTokens.some((token) => {
    const normalizedToken = token.toLowerCase();
    const compactToken = normalizePlate(token);

    if (text.includes(normalizedToken)) {
      return true;
    }

    if (!plateText || !compactToken) {
      return false;
    }

    return (
      plateText.includes(compactToken) ||
      (compactToken.length <= 2 && plateText.startsWith(compactToken))
    );
  });
};

const resolveSceneName = async (ontologySceneId: number) => {
  const sceneRes = await listOntologyModel({
    pageNo: 1,
    pageSize: 200,
    order: 'desc',
    orderBy: 'create_time'
  });

  if (!isOntologyApiSuccess(sceneRes) || !sceneRes.data?.result) {
    return undefined;
  }

  return sceneRes.data.result.find((item) => item.id === ontologySceneId)?.name;
};

export const executeInstanceInferenceQuery = async (params: {
  ontologySceneId: number;
  query: string;
  rules: ApplicationScenarioRule[];
  progress?: ThinkingProgressCallbacks;
}): Promise<InstanceInferenceResult> => {
  const { ontologySceneId, query, rules, progress } = params;
  const reportLine = (line: string) => progress?.onThinkingLine?.(line);
  const tokens = tokenize(query);
  const matchedRules = matchRules(query, rules);
  const appliedRuleNames = matchedRules.map((item) => item.rule.name);
  const ruleDrivenQuery = matchedRules.length > 0;
  const locationQuery = hasLocationQueryIntent(query);
  const instanceFilterTokens = buildInstanceFilterTokens(
    query,
    tokens,
    matchedRules
  );
  const platePrefixFilter = resolvePlatePrefixTokens(query).length > 0;
  const aggregateAllObjectTypes =
    !locationQuery &&
    ruleDrivenQuery &&
    isAggregateRuleQuery(query, matchedRules);
  const plateRuleMatched = matchedRules.some(({ rule }) =>
    isVehiclePlateRule(rule)
  );

  reportLine('▸ 加载图谱拓扑…');

  const topologyRes = await getOntologyTopology({ id: ontologySceneId });
  if (!isOntologyApiSuccess(topologyRes) || !topologyRes.data?.nodes?.length) {
    return {
      query,
      summary: '图谱拓扑为空或加载失败，请先在本体场景库中配置对象类型。',
      hits: [],
      appliedRules: appliedRuleNames
    };
  }

  const sceneName = await resolveSceneName(ontologySceneId);
  const fieldLabelCache = new Map<number, Record<string, string>>();

  const loadFieldLabels = async (objectTypeId: number) => {
    if (fieldLabelCache.has(objectTypeId)) {
      return fieldLabelCache.get(objectTypeId)!;
    }

    try {
      const labels = await fetchFieldCommentMap(ontologySceneId, objectTypeId);
      fieldLabelCache.set(objectTypeId, labels);
      return labels;
    } catch {
      const empty: Record<string, string> = {};
      fieldLabelCache.set(objectTypeId, empty);
      return empty;
    }
  };

  if (matchedRules.length === 0 || prefersRelationshipInference(query)) {
    reportLine(
      matchedRules.length === 0
        ? '▸ 未命中预定义规则，启动图谱关系推理…'
        : '▸ 查询涉及跨对象类型信息，启动图谱关系推理…'
    );
    const relationshipResult = await executeRelationshipInferenceQuery({
      ontologySceneId,
      query,
      sceneName,
      progress
    });

    if (relationshipResult) {
      return relationshipResult;
    }

    reportLine('▸ 图谱关系推理未命中，尝试关键词检索…');
  } else {
    reportLine(
      `▸ 命中规则：${appliedRuleNames.join('、') || '无'}，扫描对象类型实例…`
    );
  }

  const hits: InstanceInferenceHit[] = [];

  for (const node of topologyRes.data.nodes) {
    const nodeText = `${node.name || ''} ${node.code || ''} ${node.description || ''}`;
    const nodeRelevance = scoreText(nodeText, tokens);
    const ruleBoost = matchedRules.reduce((score, item) => {
      const ruleText = `${item.rule.condition} ${item.rule.action}`;
      const ruleTokens = tokenize(ruleText);
      return (
        score +
        scoreText(ruleText, tokenize(nodeText)) +
        scoreText(nodeText, ruleTokens)
      );
    }, 0);
    const vehicleRuleBoost =
      plateRuleMatched && /车辆|车牌|车/.test(nodeText) ? 2 : 0;

    const shouldIncludeNode =
      aggregateAllObjectTypes ||
      nodeRelevance > 0 ||
      ruleBoost > 0 ||
      vehicleRuleBoost > 0;

    if (!shouldIncludeNode) {
      continue;
    }

    const objectTypeId = Number(node.id);
    if (!Number.isFinite(objectTypeId)) {
      continue;
    }

    try {
      const instanceRes = await queryObjectTypeInstances({
        objectTypeId,
        page: 1,
        pageSize: 20
      });

      const shouldFilterInstances =
        instanceFilterTokens.length > 0 &&
        (!aggregateAllObjectTypes || locationQuery);
      const filtered = shouldFilterInstances
        ? instanceRes.items.filter((row) =>
            instanceMatchesQuery(row, instanceFilterTokens, {
              platePrefixOnly: platePrefixFilter
            })
          )
        : instanceRes.items;

      if (shouldFilterInstances && filtered.length === 0) {
        continue;
      }

      const samples = filtered.slice(0, 5);
      const fieldLabels = await loadFieldLabels(objectTypeId);

      hits.push({
        objectTypeId,
        objectTypeName: node.name || node.code || '未命名对象类型',
        instanceCount: aggregateAllObjectTypes
          ? instanceRes.total
          : filtered.length,
        matchedRuleNames: appliedRuleNames,
        sampleInstances: samples,
        fieldLabels
      });
    } catch {
      // skip failed object type
    }
  }

  hits.sort((left, right) => right.instanceCount - left.instanceCount);

  const totalInstances = hits.reduce((sum, hit) => sum + hit.instanceCount, 0);
  reportLine(
    hits.length > 0
      ? `▸ 检索完成：命中 ${hits.length} 个对象类型、共 ${totalInstances} 条实例`
      : '▸ 检索完成：未找到匹配实例'
  );

  const ruleHint = appliedRuleNames.length
    ? `规则「${appliedRuleNames.join('、')}」`
    : '';

  const summary =
    hits.length > 0
      ? `在图谱「${sceneName || ontologySceneId}」中，${ruleHint ? `基于${ruleHint}，` : ''}按查询「${query}」命中 ${hits.length} 个对象类型、共 ${totalInstances} 条实例。`
      : ruleDrivenQuery
        ? `已匹配${ruleHint || '规则'}，但在图谱「${sceneName || ontologySceneId}」中未查到实例。请确认对象类型已关联数据且实例已同步。`
        : `未在图谱「${sceneName || ontologySceneId}」中找到与「${query}」匹配的实例。已尝试图谱关系推理，可检查对象类型链接配置或调整查询条件。`;

  return {
    query,
    summary,
    hits,
    appliedRules: appliedRuleNames,
    inferenceMode: ruleDrivenQuery ? 'rule' : 'keyword'
  };
};
