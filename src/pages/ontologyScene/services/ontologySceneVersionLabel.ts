import type {
  OntologySceneVersion,
  OntologySceneVersionStore
} from '@/types/ontologySceneVersion';

export const INITIAL_SCENE_VERSION_LABEL = 'v1.0';

/** 头部展示的版本号：展示最新已保存版本，无记录时不显示占位版本号 */
export const getSceneDisplayVersionLabel = (
  store: OntologySceneVersionStore
): string => store.versions[0]?.label || '';

const VERSION_LABEL_PATTERN = /^v(\d+)\.(\d+)$/i;

/** 解析版本号，无法解析时返回 null */
export const parseSceneVersionLabel = (label: string) => {
  const match = label.trim().match(VERSION_LABEL_PATTERN);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2])
  };
};

/** 根据已有版本计算下一个版本号（首个为 v1.0） */
export const getNextSceneVersionLabel = (
  versions: OntologySceneVersion[] = []
): string => {
  if (!versions.length) {
    return INITIAL_SCENE_VERSION_LABEL;
  }

  let maxMajor = 1;
  let maxMinor = 0;

  versions.forEach((version) => {
    const parsed = parseSceneVersionLabel(version.label);
    if (!parsed) {
      return;
    }
    if (
      parsed.major > maxMajor ||
      (parsed.major === maxMajor && parsed.minor > maxMinor)
    ) {
      maxMajor = parsed.major;
      maxMinor = parsed.minor;
    }
  });

  let nextMinor = maxMinor + 1;
  let nextMajor = maxMajor;
  if (nextMinor > 9) {
    nextMajor += 1;
    nextMinor = 0;
  }

  return `v${nextMajor}.${nextMinor}`;
};

/** 已保存历史版本中最新的一条（列表按创建时间倒序，取第一条） */
export const getNewestSavedVersionId = (
  versions: OntologySceneVersion[] = []
) => versions[0]?.id ?? null;

export const isNewestSavedVersion = (
  versionId: string | undefined,
  versions: OntologySceneVersion[] = []
) => {
  if (!versionId) {
    return false;
  }
  return versionId === getNewestSavedVersionId(versions);
};

/** 是否为已冻结的历史版本（存在更新快照后，旧版本只读） */
export const isHistoricalSavedVersion = (
  versionId: string | undefined,
  versions: OntologySceneVersion[] = []
) => {
  if (!versionId || !versions.length) {
    return false;
  }
  return !isNewestSavedVersion(versionId, versions);
};

export interface SceneVersionSelectOption {
  value: string;
  versionLabel: string;
  /** 已保存快照中的最新版本 */
  isNewestSaved?: boolean;
}
