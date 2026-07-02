import type { OntologyFunctionParam } from '@/pages/ontologyScene/types/ontologyFunction';
import { functionUsesQueryObjectsApi } from './ensureFunctionObjectTypeMetadata';
import type {
  SceneLinkTypeRef,
  SceneObjectTypeRef
} from './fetchSceneOntologyContext';

export interface ObjectTypeCodeSuggestion {
  invalid: string;
  suggested: string;
  suggestedName: string;
  reason: string;
}

export interface FunctionRunErrorDiagnosis {
  text: string;
  suggestions: ObjectTypeCodeSuggestion[];
}

const METADATA_ERROR_PATTERN = /Failed to resolve metadata for ([^\s:"']+)/gi;
const ERROR_BODY_CODE_PATTERN = /"code"\s*:\s*"([^"]+)"/g;
const OBJECT_TYPE_API_PATTERN =
  /Object(?:Ref|Set)\.Type\(\s*["']([^"']+)["']\s*\)/g;

const normalizeToken = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');

/** 常见拼音片段与中文名称关键词的对应，用于纠正 LLM 拼接的伪 code */
const PINYIN_NAME_SEGMENTS: Array<{ pinyin: string; keywords: string[] }> = [
  { pinyin: 'cheliang', keywords: ['车辆'] },
  { pinyin: 'jichu', keywords: ['基础'] },
  { pinyin: 'zhushuju', keywords: ['主数据'] },
  { pinyin: 'vehicle', keywords: ['车辆'] },
  { pinyin: 'renyuan', keywords: ['人员', '人'] },
  { pinyin: 'bumen', keywords: ['部门'] },
  { pinyin: 'wupin', keywords: ['物品'] },
  { pinyin: 'shebei', keywords: ['设备'] }
];

const scorePinyinNameSegments = (
  invalidNorm: string,
  objectTypeName: string
) => {
  let score = 0;
  let matchedSegments = 0;

  PINYIN_NAME_SEGMENTS.forEach(({ pinyin, keywords }) => {
    if (!invalidNorm.includes(pinyin)) {
      return;
    }

    if (keywords.some((keyword) => objectTypeName.includes(keyword))) {
      matchedSegments += 1;
      score += 40;
    }
  });

  if (matchedSegments >= 2) {
    score += 60;
  }

  return score;
};

const scoreObjectTypeMatch = (
  invalidCode: string,
  candidate: SceneObjectTypeRef
): number => {
  if (invalidCode === candidate.code) {
    return 1000;
  }

  const invalidNorm = normalizeToken(invalidCode);
  const codeNorm = normalizeToken(candidate.code);
  const nameNorm = normalizeToken(candidate.name);
  const objectTypeName = candidate.name || '';

  let score = 0;

  if (invalidNorm.includes(codeNorm) || codeNorm.includes(invalidNorm)) {
    score += 80;
  }

  if (nameNorm && invalidNorm.includes(nameNorm)) {
    score += 60;
  }

  score += scorePinyinNameSegments(invalidNorm, objectTypeName);

  const minLen = Math.min(invalidNorm.length, codeNorm.length);
  let prefixLen = 0;
  for (let index = 0; index < minLen; index += 1) {
    if (invalidNorm[index] === codeNorm[index]) {
      prefixLen += 1;
    } else {
      break;
    }
  }
  score += prefixLen * 3;

  return score;
};

const findBestObjectTypeMatch = (
  invalidCode: string,
  objectTypes: SceneObjectTypeRef[]
): SceneObjectTypeRef | null => {
  if (!objectTypes.length) {
    return null;
  }

  const exact = objectTypes.find((item) => item.code === invalidCode);
  if (exact) {
    return exact;
  }

  let best: { item: SceneObjectTypeRef; score: number } | null = null;

  objectTypes.forEach((item) => {
    const score = scoreObjectTypeMatch(invalidCode, item);
    if (!best || score > best.score) {
      best = { item, score };
    }
  });

  return best && best.score >= 12 ? best.item : null;
};

const collectInvalidObjectTypeCodes = (
  errorLog: string,
  content: string
): string[] => {
  const codes = new Set<string>();

  let match: RegExpExecArray | null;
  const metadataPattern = new RegExp(METADATA_ERROR_PATTERN.source, 'gi');
  while ((match = metadataPattern.exec(errorLog)) !== null) {
    codes.add(match[1].trim());
  }

  const bodyCodePattern = new RegExp(ERROR_BODY_CODE_PATTERN.source, 'g');
  while ((match = bodyCodePattern.exec(errorLog)) !== null) {
    const code = match[1].trim();
    if (
      errorLog.includes('资源不存在') ||
      errorLog.includes('Failed to resolve metadata')
    ) {
      codes.add(code);
    }
  }

  const objectTypePattern = new RegExp(OBJECT_TYPE_API_PATTERN.source, 'g');
  while ((match = objectTypePattern.exec(content)) !== null) {
    codes.add(match[1].trim());
  }

  return [...codes].filter(Boolean);
};

const buildSuggestions = (
  invalidCodes: string[],
  objectTypes: SceneObjectTypeRef[]
): ObjectTypeCodeSuggestion[] => {
  const suggestions: ObjectTypeCodeSuggestion[] = [];

  invalidCodes.forEach((invalid) => {
    const exactMatch = objectTypes.find((item) => item.code === invalid);
    if (exactMatch) {
      suggestions.push({
        invalid,
        suggested: invalid,
        suggestedName: exactMatch.name,
        reason:
          `code「${invalid}」已在当前场景库中（${exactMatch.name}），但函数运行时的 ontology-metadata-service 返回资源不存在；` +
          '这是场景库与运行时元数据服务未打通，不是 code 写错，也不是实例数据同步能解决的；需后端在创建/更新对象类型时自动注册到 metadata-service'
      });
      return;
    }

    const matched = findBestObjectTypeMatch(invalid, objectTypes);
    if (matched) {
      suggestions.push({
        invalid,
        suggested: matched.code,
        suggestedName: matched.name,
        reason: `运行时找不到 code「${invalid}」，场景中匹配到「${matched.name}」（code: ${matched.code}）`
      });
      return;
    }

    suggestions.push({
      invalid,
      suggested: '',
      suggestedName: '',
      reason: `运行时找不到 code「${invalid}」，且当前场景未找到可替换的对象类型，请检查对象类型是否已创建并同步`
    });
  });

  return suggestions;
};

const formatInputObjectTypeHints = (
  input: OntologyFunctionParam[]
): string[] => {
  const hints: string[] = [];

  input.forEach((param) => {
    const uiType = String(param.uiTypeAndValue?.uiType || '');
    const dataType = uiType.split('_')[0];
    const objectTypeData = param.uiTypeAndValue?.paramValue?.objectTypeData;

    if (
      (dataType === 'ObjectRef' || dataType === 'ObjectSet') &&
      objectTypeData?.code
    ) {
      hints.push(
        `- 入参 ${param.name} 已绑定对象类型：${objectTypeData.name || objectTypeData.code}（code: ${objectTypeData.code}），函数内应直接使用该入参，不要调用 ObjectRef.Type() 重新声明`
      );
    }
  });

  return hints;
};

export const diagnoseFunctionRunError = (params: {
  errorLog: string;
  content: string;
  input: OntologyFunctionParam[];
  objectTypes: SceneObjectTypeRef[];
  links: SceneLinkTypeRef[];
}): FunctionRunErrorDiagnosis => {
  const invalidCodes = collectInvalidObjectTypeCodes(
    params.errorLog,
    params.content
  );
  const suggestions = buildSuggestions(invalidCodes, params.objectTypes);
  const inputHints = formatInputObjectTypeHints(params.input);

  const allowedCodes = params.objectTypes
    .map((item) => `- ${item.code}（${item.name}）`)
    .join('\n');

  const lines = [
    '【报错诊断】',
    invalidCodes.length
      ? `无效/不可用的对象类型 code：${invalidCodes.join('、')}`
      : '未从报错中解析到明确的对象类型 code，请结合 Traceback 定位根因',
    '',
    '【可用对象类型 code 白名单（ObjectRef.Type / query 只能使用以下 code；ObjectSet 无 Type 方法）】',
    allowedCodes || '（当前场景暂无对象类型，请先在场景库创建并同步对象类型）',
    ''
  ];

  if (params.links.length) {
    lines.push(
      '【可用链接类型 code 白名单】',
      params.links
        .map((item) => `- ${item.code || item.name}（${item.name}）`)
        .join('\n'),
      ''
    );
  }

  if (inputHints.length) {
    lines.push('【入参对象类型绑定】', ...inputHints, '');
  }

  if (suggestions.length) {
    lines.push('【建议修复映射】');
    suggestions.forEach((item, index) => {
      if (item.suggested) {
        lines.push(
          `${index + 1}. 将「${item.invalid}」替换为「${item.suggested}」（${item.suggestedName}）：${item.reason}`
        );
      } else {
        lines.push(`${index + 1}. ${item.reason}`);
      }
    });
    lines.push('');
  }

  if (
    params.errorLog.includes("has no attribute 'query'") ||
    params.errorLog.includes('has no attribute query') ||
    params.content.includes('.query(')
  ) {
    lines.push(
      '【修复原则：query() 不存在】',
      '- ObjectRef.Type("code") 返回的类型类无 query() 方法',
      '- 全量列表：VehicleType = ObjectRef.Type("code"); vehicles = VehicleType.all()',
      '- 条件筛选：vehicles = VehicleType.filter(propertyName="值") 或 filter(propertyName__gt=值)',
      '- 禁止 .query() / .query(where=...)'
    );
  }

  if (
    params.errorLog.includes("ObjectSet' has no attribute 'Type'") ||
    params.errorLog.includes('ObjectSet has no attribute Type') ||
    params.content.includes('ObjectSet.Type(')
  ) {
    lines.push(
      '【修复原则：ObjectSet.Type 不存在】',
      '- 运行时仅 ObjectRef.Type("code") 可获取对象类型类；ObjectSet 无 Type 方法',
      '- 批量查询应写：VehicleType = ObjectRef.Type("code"); vehicles = VehicleType.all() 或 VehicleType.filter(字段=值)',
      '- ObjectSet 仅用于入参或 ObjectSet([{"object_type":"code","pk":"id"}, ...]) 构造实例集合',
      '- 禁止保留 ObjectSet.Type("xxx")'
    );
  }

  if (
    params.errorLog.includes('Error 1064') &&
    /near\s+""/i.test(params.errorLog) &&
    functionUsesQueryObjectsApi(params.content)
  ) {
    lines.push(
      '【修复原则：dataset 无法解析物理表】',
      '- SQL 在 FROM 后表名为空，说明 ontology_object_type_code 对应的对象类型实例尚未同步到 dataset',
      '- 不要修改 code；前往场景库「对象类型」列表，对目标类型执行「实例同步」，待同步成功后再试运行',
      '- 若已同步仍报错，检查对象类型是否配置了数据源/物理表（ontologyTableName）'
    );
  }

  if (
    (params.errorLog.includes('HTTP 500') ||
      params.errorLog.includes('Internal Server Error')) &&
    params.errorLog.includes('/dataset/internal/v1/Query') &&
    (params.content.includes('"conditions"') ||
      params.content.includes('"operator"') ||
      /"type"\s*:\s*"(?:or|and)"/.test(params.content))
  ) {
    lines.push(
      '【修复原则：query_objects where 格式非法】',
      '- dataset Query 的 where 仅支持：{"op":"=","left":{"type":"column","name":"字段"},"right":{"type":"value","value":"值"}}',
      '- 禁止 {"type":"or","conditions":[{"column":...,"operator":"like"}]} 写法',
      '- 模糊匹配 / LIKE / 多字段 OR：去掉 payload.where，全量 query_objects 后在 Python 用列表推导过滤 rows'
    );
  }

  if (
    params.errorLog.includes('Failed to resolve metadata') ||
    params.errorLog.includes('资源不存在')
  ) {
    lines.push(
      '【修复原则】',
      '- ObjectRef.Type("xxx") 的 xxx 必须来自上方白名单，精确匹配，不可拼接拼音或猜测',
      '- 若入参已是 ObjectRef/ObjectSet，直接使用入参变量操作对象，禁止 ObjectRef.Type() 重复获取类型',
      '- 属性名必须使用白名单对象类型下列出的属性英文名',
      '- 若 code 已在场景库但报资源不存在：不要改 code，也不要调用 SyncObjectTypeTask（那是实例数据同步）'
    );
  }

  return {
    text: lines.join('\n'),
    suggestions
  };
};

const OBJECT_TYPE_CODE_PATTERNS = [
  /Object(?:Ref|Set)\.Type\(\s*(["'])([^"']+)\1\s*\)/g,
  /object_type\s*=\s*(["'])([^"']+)\2/g
];

export const rewriteInvalidObjectTypeCodes = (
  source: string,
  suggestions: ObjectTypeCodeSuggestion[]
): { content: string; replacements: string[] } => {
  let content = source;
  const replacements: string[] = [];

  suggestions.forEach(({ invalid, suggested, suggestedName }) => {
    if (!invalid || !suggested || invalid === suggested) {
      return;
    }

    OBJECT_TYPE_CODE_PATTERNS.forEach((pattern) => {
      content = content.replace(pattern, (match, quote, code) => {
        if (code !== invalid) {
          return match;
        }
        replacements.push(
          `将对象类型 code「${invalid}」替换为「${suggested}」（${suggestedName}）`
        );
        return match.replace(invalid, suggested);
      });
    });
  });

  return { content, replacements };
};
