import type {
  OntologySceneVersion,
  OntologySceneVersionCompareResult,
  ResourceNameDiff
} from '@/types/ontologySceneVersion';

const diffNames = (base: string[], target: string[]): ResourceNameDiff => {
  const baseSet = new Set(base);
  const targetSet = new Set(target);

  return {
    added: target.filter((name) => !baseSet.has(name)),
    removed: base.filter((name) => !targetSet.has(name))
  };
};

export const compareSceneVersions = (
  baseVersion: OntologySceneVersion,
  targetVersion: OntologySceneVersion
): OntologySceneVersionCompareResult => {
  const base = baseVersion.snapshot;
  const target = targetVersion.snapshot;

  return {
    baseVersion,
    targetVersion,
    objectTypes: diffNames(base.objectTypeNames, target.objectTypeNames),
    linkTypes: diffNames(base.linkTypeNames, target.linkTypeNames),
    actions: diffNames(base.actionNames, target.actionNames),
    functions: diffNames(base.functionNames, target.functionNames),
    countsDelta: {
      objectTypes: target.counts.objectTypes - base.counts.objectTypes,
      linkTypes: target.counts.linkTypes - base.counts.linkTypes,
      actions: target.counts.actions - base.counts.actions,
      functions: target.counts.functions - base.counts.functions
    }
  };
};

const hasResourceDiff = (diff: ResourceNameDiff, delta: number) =>
  diff.added.length > 0 || diff.removed.length > 0 || delta !== 0;

export const formatCompareResultAsText = (
  result: OntologySceneVersionCompareResult,
  options?: { onlyChanged?: boolean }
): string => {
  const { baseVersion, targetVersion } = result;
  const onlyChanged = options?.onlyChanged !== false;

  const section = (title: string, diff: ResourceNameDiff, delta: number) => {
    if (onlyChanged && !hasResourceDiff(diff, delta)) {
      return '';
    }

    const lines: string[] = [
      `## ${title}（数量变化 ${delta >= 0 ? '+' : ''}${delta}）`
    ];
    if (diff.added.length) {
      lines.push(`新增: ${diff.added.join('、')}`);
    }
    if (diff.removed.length) {
      lines.push(`删除: ${diff.removed.join('、')}`);
    }
    return lines.join('\n');
  };

  const parts = [
    `基准版本: ${baseVersion.label}（${baseVersion.changeSummary || '无说明'}）`,
    `对比版本: ${targetVersion.label}（${targetVersion.changeSummary || '无说明'}）`,
    section('对象类型', result.objectTypes, result.countsDelta.objectTypes),
    section('链接类型', result.linkTypes, result.countsDelta.linkTypes),
    section('行为', result.actions, result.countsDelta.actions),
    section('函数', result.functions, result.countsDelta.functions)
  ].filter(Boolean);

  if (onlyChanged && parts.length === 2) {
    parts.push('（各资源类型均无名称或数量变更）');
  }

  return parts.join('\n\n');
};

export const hasCompareDiff = (result: OntologySceneVersionCompareResult) =>
  result.objectTypes.added.length > 0 ||
  result.objectTypes.removed.length > 0 ||
  result.linkTypes.added.length > 0 ||
  result.linkTypes.removed.length > 0 ||
  result.actions.added.length > 0 ||
  result.actions.removed.length > 0 ||
  result.functions.added.length > 0 ||
  result.functions.removed.length > 0 ||
  Object.values(result.countsDelta).some((value) => value !== 0);
