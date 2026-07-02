import {
  resolveQuerySelectFields,
  type SceneObjectTypeQueryProfiles
} from './sceneObjectTypeQueryProfiles';

export interface RewriteObjectRefTypeToQueryObjectsOptions {
  queryProfiles?: SceneObjectTypeQueryProfiles;
}

export interface RewriteObjectRefTypeToQueryObjectsResult {
  content: string;
  changed: boolean;
  notes: string[];
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const deriveCollectionParamName = (typeVar: string, code: string): string => {
  if (/type$/i.test(typeVar)) {
    const base = typeVar.replace(/type$/i, '');
    if (base) {
      return `${base.charAt(0).toLowerCase()}${base.slice(1)}s`;
    }
  }
  return `objects_${code.slice(0, 12)}`;
};

const buildQueryPayloadBlock = (
  indent: string,
  objectTypeCode: string,
  fieldNames: string[],
  payloadVar = '_query_payload'
): string[] => {
  const selectLines = fieldNames.map(
    (name) => `${indent}        {"type": "column", "name": "${name}"},`
  );

  return [
    `${indent}${payloadVar} = {`,
    `${indent}    "ontology_object_type_code": "${objectTypeCode}",`,
    `${indent}    "select": [`,
    ...selectLines,
    `${indent}    ],`,
    `${indent}}`
  ];
};

/** 生成基于 client.service.query_objects 的查询片段（不调用 ObjectRef.Type） */
export const buildQueryObjectsSnippet = (
  indent: string,
  collVar: string,
  objectTypeCode: string,
  fieldNames?: string[]
): string => {
  const pad = indent;
  const fields = fieldNames?.filter(Boolean) ?? [];

  if (!fields.length) {
    return [
      `${pad}# 经数据集服务查询实例，不经过类型元数据解析`,
      `${pad}_query_res = client.service.query_objects(payload={"ontology_object_type_code": "${objectTypeCode}"})`,
      `${pad}_query_data = getattr(_query_res, "data", None) or {}`,
      `${pad}${collVar} = _query_data.get("results") or _query_data.get("result") or _query_data.get("items") or []`
    ].join('\n');
  }

  return [
    `${pad}# 经数据集服务查询实例，不经过类型元数据解析`,
    ...buildQueryPayloadBlock(pad, objectTypeCode, fields),
    `${pad}_query_res = client.service.query_objects(payload=_query_payload)`,
    `${pad}_query_data = getattr(_query_res, "data", None) or {}`,
    `${pad}${collVar} = _query_data.get("results") or _query_data.get("result") or _query_data.get("items") or []`
  ].join('\n');
};

const INCOMPLETE_QUERY_ONE_LINER =
  /^(\s*)(\w+)\s*=\s*client\.service\.query_objects\(payload=\{"ontology_object_type_code":\s*"([^"]+)"\}\)\s*$/gm;

const INCOMPLETE_QUERY_RES_LINE =
  /^(\s*)_query_res\s*=\s*client\.service\.query_objects\(payload=\{"ontology_object_type_code":\s*"([^"]+)"\}\)\s*$/gm;

/**
 * 为缺少 select 的 query_objects 调用补全 payload（避免 dataset 生成 SELECT  FROM 语法错误）。
 */
export const enrichIncompleteQueryObjectsPayloads = (
  source: string,
  queryProfiles?: SceneObjectTypeQueryProfiles
): RewriteObjectRefTypeToQueryObjectsResult => {
  if (!source?.trim() || !queryProfiles || !Object.keys(queryProfiles).length) {
    return { content: source, changed: false, notes: [] };
  }

  const notes: string[] = [];
  let content = source;
  let changed = false;

  if (INCOMPLETE_QUERY_ONE_LINER.test(content)) {
    INCOMPLETE_QUERY_ONE_LINER.lastIndex = 0;
    content = content.replace(
      INCOMPLETE_QUERY_ONE_LINER,
      (match, indent: string, resVar: string, code: string) => {
        const fields = resolveQuerySelectFields(queryProfiles, code);
        if (!fields.length) {
          notes.push(
            `对象类型 ${code} 在场景库中无属性，无法补全 query_objects select`
          );
          return match;
        }

        notes.push(
          `为 ${resVar} = query_objects 补全 select 字段（${fields.length} 个属性）`
        );
        changed = true;

        return [
          ...buildQueryPayloadBlock(indent, code, fields),
          `${indent}${resVar} = client.service.query_objects(payload=_query_payload)`
        ].join('\n');
      }
    );
  }

  if (INCOMPLETE_QUERY_RES_LINE.test(content)) {
    INCOMPLETE_QUERY_RES_LINE.lastIndex = 0;
    content = content.replace(
      INCOMPLETE_QUERY_RES_LINE,
      (match, indent: string, code: string) => {
        const fields = resolveQuerySelectFields(queryProfiles, code);
        if (!fields.length) {
          notes.push(
            `对象类型 ${code} 在场景库中无属性，无法补全 query_objects select`
          );
          return match;
        }

        notes.push(`为 _query_res 补全 select 字段（${fields.length} 个属性）`);
        changed = true;

        return [
          ...buildQueryPayloadBlock(indent, code, fields),
          `${indent}_query_res = client.service.query_objects(payload=_query_payload)`
        ].join('\n');
      }
    );
  }

  return { content, changed, notes };
};

const TYPE_AND_ALL_PATTERN =
  /^(\s*)(\w+)\s*=\s*ObjectRef\.Type\(\s*["']([^"']+)["']\s*\)\s*\n\1(\w+)\s*=\s*\2\.all\(\s*\)\s*$/gm;

const TYPE_AND_FILTER_PATTERN =
  /^(\s*)(\w+)\s*=\s*ObjectRef\.Type\(\s*["']([^"']+)["']\s*\)\s*\n\1(\w+)\s*=\s*\2\.filter\(([^)]*)\)\s*$/gm;

const TYPE_ONLY_LINE =
  /^(\s*)(\w+)\s*=\s*ObjectRef\.Type\(\s*["']([^"']+)["']\s*\)\s*$/gm;

/**
 * 将 ObjectRef.Type / ObjectSet.Type 查询改写为 client.service.query_objects。
 * 函数运行时内置 client，无需 import。
 */
export const rewriteObjectRefTypeToQueryObjects = (
  source: string,
  options?: RewriteObjectRefTypeToQueryObjectsOptions
): RewriteObjectRefTypeToQueryObjectsResult => {
  if (!source?.trim()) {
    return { content: source, changed: false, notes: [] };
  }

  const queryProfiles = options?.queryProfiles;
  const notes: string[] = [];
  let content = source;
  let changed = false;

  const enriched = enrichIncompleteQueryObjectsPayloads(content, queryProfiles);
  content = enriched.content;
  if (enriched.changed) {
    changed = true;
    notes.push(...enriched.notes);
  }

  const resolveFields = (code: string) =>
    resolveQuerySelectFields(queryProfiles, code);

  if (TYPE_AND_ALL_PATTERN.test(content)) {
    TYPE_AND_ALL_PATTERN.lastIndex = 0;
    content = content.replace(
      TYPE_AND_ALL_PATTERN,
      (
        _match,
        indent: string,
        typeVar: string,
        code: string,
        collVar: string
      ) => {
        notes.push(
          `将 ${typeVar} = ObjectRef.Type("${code}") + .all() 改为 client.service.query_objects`
        );
        changed = true;
        return buildQueryObjectsSnippet(
          indent,
          collVar,
          code,
          resolveFields(code)
        );
      }
    );
  }

  if (TYPE_AND_FILTER_PATTERN.test(content)) {
    TYPE_AND_FILTER_PATTERN.lastIndex = 0;
    content = content.replace(
      TYPE_AND_FILTER_PATTERN,
      (
        _match,
        indent: string,
        typeVar: string,
        code: string,
        collVar: string,
        _filterArgs: string
      ) => {
        notes.push(
          `将 ${typeVar}.filter(...) 改为 query_objects 全量查询 ${collVar}（条件可在 Python 中过滤行字典）`
        );
        changed = true;
        return [
          buildQueryObjectsSnippet(indent, collVar, code, resolveFields(code)),
          `${indent}# 原 filter(${_filterArgs}) 请在下方对 ${collVar} 行字典自行筛选`
        ].join('\n');
      }
    );
  }

  const typeAssignments: Array<{
    typeVar: string;
    code: string;
    indent: string;
  }> = [];
  let match: RegExpExecArray | null;
  const typeOnlyPattern = new RegExp(
    TYPE_ONLY_LINE.source,
    TYPE_ONLY_LINE.flags
  );
  while ((match = typeOnlyPattern.exec(content)) !== null) {
    typeAssignments.push({
      indent: match[1],
      typeVar: match[2],
      code: match[3]
    });
  }

  for (const { typeVar, code, indent } of typeAssignments) {
    const escaped = escapeRegExp(typeVar);
    const collVar = /type$/i.test(typeVar)
      ? deriveCollectionParamName(typeVar, code)
      : 'query_rows';

    content = content.replace(
      new RegExp(
        `^${indent}${escaped}\\s*=\\s*ObjectRef\\.Type\\([^)]+\\)\\s*\\n`,
        'm'
      ),
      ''
    );
    content = content.replace(
      new RegExp(`\\b${escaped}\\.all\\(\\s*\\)`, 'g'),
      collVar
    );
    content = content.replace(
      new RegExp(`\\b${escaped}\\.filter\\(`, 'g'),
      `${collVar}  # 原 Type.filter 已改为行列表，请用 Python 筛选\n${indent}# .filter(`
    );

    const hasCollVar = new RegExp(`\\b${escapeRegExp(collVar)}\\b`).test(
      content
    );
    if (!hasCollVar) {
      const snippet = buildQueryObjectsSnippet(
        indent,
        collVar,
        code,
        resolveFields(code)
      );
      content = content.replace(
        /(def\s+\w+\([^)]*\)\s*(?:->\s*[^:]+)?:\s*\n)/,
        `$1${snippet}\n`
      );
    }

    notes.push(
      `已移除 ObjectRef.Type("${code}")，改用 query_objects 结果 ${collVar}`
    );
    changed = true;
  }

  content = content.replace(
    /^(\s*)(\w+)\s*=\s*ObjectSet\.Type\(\s*["']([^"']+)["']\s*\)\s*$/gm,
    (_m, indent: string, collVar: string, code: string) => {
      notes.push(
        `将 ObjectSet.Type("${code}") 改为 client.service.query_objects`
      );
      changed = true;
      return buildQueryObjectsSnippet(
        indent,
        collVar,
        code,
        resolveFields(code)
      );
    }
  );

  if (/ObjectRef\.Type\s*\(/i.test(content)) {
    notes.push(
      '仍有 ObjectRef.Type() 未改写，请改为 client.service.query_objects'
    );
  }

  return { content, changed, notes };
};
