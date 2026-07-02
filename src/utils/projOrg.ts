import { extractProjOrgList } from '@/utils/apiResponse';

export interface NormalizedProjectNode {
  id: string;
  title: string;
  name: string;
  [key: string]: unknown;
}

export interface NormalizedOrgNode {
  id: string;
  title: string;
  name: string;
  projectList: NormalizedProjectNode[];
  [key: string]: unknown;
}

const pickTitle = (item: Record<string, unknown>): string =>
  String(item.title || item.name || item.label || '未命名').trim();

const pickProjectArray = (
  org: Record<string, unknown>
): Record<string, unknown>[] => {
  const candidates = [
    org.projectList,
    org.projList,
    org.children,
    org.projects
  ];
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? (list as Record<string, unknown>[]) : [];
};

const normalizeProjectNode = (
  project: Record<string, unknown>
): NormalizedProjectNode | null => {
  const id = String(project.id ?? '').trim();
  if (!id) {
    return null;
  }

  const title = pickTitle(project);
  return {
    ...project,
    id,
    title,
    name: title
  };
};

const normalizeOrgNode = (
  item: Record<string, unknown>
): NormalizedOrgNode | null => {
  const id = String(item.id ?? '').trim();
  if (!id) {
    return null;
  }

  const title = pickTitle(item);
  const projectList = pickProjectArray(item)
    .map((project) => normalizeProjectNode(project))
    .filter((project): project is NormalizedProjectNode => !!project);

  return {
    ...item,
    id,
    title,
    name: title,
    projectList
  };
};

/** 统一组织/项目树字段（title、projectList 等） */
export const normalizeProjOrgList = (raw: unknown): NormalizedOrgNode[] => {
  if (!raw) {
    return [];
  }

  const list = Array.isArray(raw) ? raw : [];
  return list
    .filter((item) => item && typeof item === 'object')
    .map((item) => normalizeOrgNode(item as Record<string, unknown>))
    .filter((item): item is NormalizedOrgNode => !!item);
};

/** 从 GetProjOrg 响应中提取并规范化组织/项目树 */
export const extractAndNormalizeProjOrgList = (
  response: unknown
): NormalizedOrgNode[] => normalizeProjOrgList(extractProjOrgList(response));

/** 转为 ProjectSelect 组件所需的 treeData */
export const toProjectSelectTreeData = (
  projectList: NormalizedOrgNode[] | null | undefined
) => {
  if (!projectList?.length) {
    return [];
  }

  return projectList.map((item) => ({
    ...item,
    name: item.title || item.name,
    isPermission: true,
    projList: (item.projectList || []).map((project) => ({
      ...project,
      name: project.title || project.name,
      organization: {
        id: item.id,
        name: item.title || item.name
      }
    }))
  }));
};

export const getDefaultProjectId = (
  projectList: NormalizedOrgNode[]
): string[] | null => {
  const firstOrg = projectList[0];
  const firstProject = firstOrg?.projectList?.[0];
  if (!firstOrg?.id || !firstProject?.id) {
    return null;
  }

  return [firstOrg.id, firstProject.id];
};

export const isValidProjectId = (
  projectList: NormalizedOrgNode[],
  projectId?: string[] | null
) => {
  if (!Array.isArray(projectId) || projectId.length < 2) {
    return false;
  }

  const org = projectList.find((item) => item.id === projectId[0]);
  return !!org?.projectList?.find((project) => project.id === projectId[1]);
};
