import { getActionList } from '@/api/ontologySceneLibrary/ontologyAction';
import {
  fetchSceneLinkCodes,
  fetchSceneObjectTypeCodes
} from '@/pages/ontologyScene/modules/graph/services/graphCreateServices';

export const ONTOLOGY_IDENTIFIER_PATTERN = /^[a-zA-Z][a-zA-Z0-9]*$/;

export const ONTOLOGY_IDENTIFIER_FIRST_CHAR_MESSAGE = '首字符必须为英文字母';
export const ONTOLOGY_IDENTIFIER_CHARS_MESSAGE =
  '仅允许英文字母与数字(不允许下划线及特殊符号)';
export const ONTOLOGY_IDENTIFIER_EXTRA =
  '根据名称自动生成，可修改；首字符为英文字母，仅允许字母与数字，场景内全局唯一';

export const validateOntologyIdentifier = (
  value: string | undefined,
  callback: (message?: string) => void
) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    callback();
    return;
  }
  if (!/^[a-zA-Z]/.test(trimmed)) {
    callback(ONTOLOGY_IDENTIFIER_FIRST_CHAR_MESSAGE);
    return;
  }
  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
    callback(ONTOLOGY_IDENTIFIER_CHARS_MESSAGE);
    return;
  }
  callback();
};

export const ontologyIdentifierValidatorRule = {
  validator: validateOntologyIdentifier
};

/** 采集场景内已占用的对象类型 code、链接 code、行为 code */
export const fetchSceneAllOntologyIdentifiers = async (
  ontologyModelID: number
): Promise<string[]> => {
  const [objectCodes, linkCodes, actionRes] = await Promise.all([
    fetchSceneObjectTypeCodes(ontologyModelID),
    fetchSceneLinkCodes(ontologyModelID),
    getActionList({
      ontologyModelID,
      pageNum: 1,
      pageSize: -1
    }).catch(() => ({ items: [] as { code?: string }[] }))
  ]);

  const actionCodes = (actionRes.items || [])
    .map((item) => item.code?.trim())
    .filter((code): code is string => Boolean(code));

  return [...new Set([...objectCodes, ...linkCodes, ...actionCodes])];
};
