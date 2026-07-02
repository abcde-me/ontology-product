import { rewriteInvalidQueryObjectsWhere } from './rewriteInvalidQueryObjectsWhere';
import { rewriteObjectRefTypeToQueryObjects } from './rewriteObjectRefTypeToQueryObjects';
import { stripQueryObjectsWhere } from './stripQueryObjectsWhere';
import type { SceneObjectTypeQueryProfiles } from './sceneObjectTypeQueryProfiles';

/** 运行时 SDK 无 query()，批量查询应使用 query_objects */
const INVALID_TYPE_QUERY_PATTERN = /(\w+)\.query\(\s*\)/g;

export interface SanitizeOntologyFunctionRuntimeApiOptions {
  queryProfiles?: SceneObjectTypeQueryProfiles;
}

export interface SanitizeOntologyFunctionRuntimeApiResult {
  content: string;
  changed: boolean;
  notes: string[];
}

/**
 * 修正运行时无效 API，并将 ObjectRef.Type 查询改为 client.service.query_objects。
 */
export const sanitizeOntologyFunctionRuntimeApi = (
  source: string,
  options?: SanitizeOntologyFunctionRuntimeApiOptions
): SanitizeOntologyFunctionRuntimeApiResult => {
  if (!source?.trim()) {
    return { content: source, changed: false, notes: [] };
  }

  const notes: string[] = [];
  let content = source;
  let changed = false;

  if (INVALID_TYPE_QUERY_PATTERN.test(content)) {
    INVALID_TYPE_QUERY_PATTERN.lastIndex = 0;
    content = content.replace(
      INVALID_TYPE_QUERY_PATTERN,
      (_match, varName: string) => {
        notes.push(
          `将 ${varName}.query() 移除：请使用 query_objects 或行列表筛选`
        );
        changed = true;
        return `${varName}  # 原 .query() 已移除，请使用 client.service.query_objects`;
      }
    );
  }

  const queryRewrite = rewriteObjectRefTypeToQueryObjects(content, {
    queryProfiles: options?.queryProfiles
  });
  content = queryRewrite.content;
  if (queryRewrite.changed) {
    changed = true;
    notes.push(...queryRewrite.notes);
  }

  const whereRewrite = rewriteInvalidQueryObjectsWhere(content);
  content = whereRewrite.content;
  if (whereRewrite.changed) {
    changed = true;
    notes.push(...whereRewrite.notes);
  }

  // 测试路径下激进移除 where，避免依赖 dataset 不稳定的 where 支持（即使合法格式也可能 1064）
  const stripWhere = stripQueryObjectsWhere(content);
  content = stripWhere.content;
  if (stripWhere.changed) {
    changed = true;
    notes.push(...stripWhere.notes);
  }

  return { content, changed, notes };
};

export const containsObjectSetTypeUsage = (source: string): boolean =>
  /ObjectSet\.Type\s*\(/i.test(source);

export const containsInvalidTypeQueryUsage = (source: string): boolean =>
  /\w+\.query\s*\(/i.test(source);

export const containsObjectRefTypeUsage = (source: string): boolean =>
  /ObjectRef\.Type\s*\(/i.test(source);
