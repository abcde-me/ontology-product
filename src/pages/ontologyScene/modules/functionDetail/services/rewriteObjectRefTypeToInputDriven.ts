import type { SceneObjectTypeRef } from './fetchSceneOntologyContext';
import {
  OntologyFunctionParam,
  ParamType,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';

export interface ObjectRefTypeInputParam {
  name: string;
  paramType: ParamType.ObjectOne | ParamType.ObjectSet;
  objectTypeCode: string;
}

export interface RewriteObjectRefTypeResult {
  content: string;
  changed: boolean;
  notes: string[];
  addedInputParams: ObjectRefTypeInputParam[];
  remainingObjectRefType: boolean;
}

const TYPE_ASSIGN_LINE =
  /^(\s*)(\w+)\s*=\s*ObjectRef\.Type\(\s*["']([^"']+)["']\s*\)\s*$/gm;

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

const replaceTypeVarUsages = (
  source: string,
  typeVar: string,
  paramName: string
) => {
  const escaped = escapeRegExp(typeVar);
  return source
    .replace(new RegExp(`\\b${escaped}\\.all\\(\\s*\\)`, 'g'), paramName)
    .replace(
      new RegExp(`\\b${escaped}\\.filter\\(`, 'g'),
      `${paramName}.filter(`
    )
    .replace(new RegExp(`\\b${escaped}\\.get\\(`, 'g'), `${paramName}.get(`)
    .replace(
      new RegExp(`\\bfor\\s+(\\w+)\\s+in\\s+${escaped}\\.all\\(\\s*\\)`, 'g'),
      `for $1 in ${paramName}`
    )
    .replace(
      new RegExp(`\\bfor\\s+(\\w+)\\s+in\\s+${escaped}\\.filter\\(`, 'g'),
      `for $1 in ${paramName}.filter(`
    );
};

/**
 * 将 ObjectRef.Type() 改为 ObjectRef/ObjectSet 入参驱动，避免试运行查询 ontology-metadata-service。
 */
export const rewriteObjectRefTypeToInputDriven = (
  source: string
): RewriteObjectRefTypeResult => {
  if (!source?.trim()) {
    return {
      content: source,
      changed: false,
      notes: [],
      addedInputParams: [],
      remainingObjectRefType: false
    };
  }

  const notes: string[] = [];
  const addedInputParams: ObjectRefTypeInputParam[] = [];
  let content = source;
  let changed = false;

  const assignments: Array<{ typeVar: string; code: string }> = [];
  let match: RegExpExecArray | null;
  const assignPattern = new RegExp(
    TYPE_ASSIGN_LINE.source,
    TYPE_ASSIGN_LINE.flags
  );
  while ((match = assignPattern.exec(source)) !== null) {
    assignments.push({ typeVar: match[2], code: match[3] });
  }

  for (const { typeVar, code } of assignments) {
    const escapedTypeVar = escapeRegExp(typeVar);
    const collectionAssignPattern = new RegExp(
      `^(\\s*)(\\w+)\\s*=\\s*${escapedTypeVar}\\.all\\(\\s*\\)\\s*$`,
      'm'
    );
    const filterAssignPattern = new RegExp(
      `^(\\s*)(\\w+)\\s*=\\s*${escapedTypeVar}\\.filter\\([^)]*\\)\\s*$`,
      'm'
    );
    const typeLinePattern = new RegExp(
      `^\\s*${escapedTypeVar}\\s*=\\s*ObjectRef\\.Type\\([^)]+\\)\\s*\\n`,
      'm'
    );

    const collectionMatch = content.match(collectionAssignPattern);
    const filterMatch = content.match(filterAssignPattern);
    const paramName =
      collectionMatch?.[2] ||
      filterMatch?.[2] ||
      deriveCollectionParamName(typeVar, code);

    content = content.replace(typeLinePattern, '');
    content = content.replace(
      new RegExp(
        `^\\s*\\w+\\s*=\\s*${escapedTypeVar}\\.all\\(\\s*\\)\\s*\\n`,
        'm'
      ),
      ''
    );
    content = content.replace(
      new RegExp(
        `^\\s*\\w+\\s*=\\s*${escapedTypeVar}\\.filter\\([^)]*\\)\\s*\\n`,
        'm'
      ),
      ''
    );
    content = replaceTypeVarUsages(content, typeVar, paramName);

    if (!addedInputParams.some((item) => item.name === paramName)) {
      addedInputParams.push({
        name: paramName,
        paramType: ParamType.ObjectSet,
        objectTypeCode: code
      });
    }

    notes.push(
      `已将 ObjectRef.Type("${code}") 改为入参 ${paramName}（ObjectSet），试运行时请选择实例`
    );
    changed = true;
  }

  const remainingObjectRefType = /ObjectRef\.Type\s*\(/i.test(content);
  if (remainingObjectRefType) {
    notes.push(
      '仍有 ObjectRef.Type() 未能自动改写，请手动改为 ObjectRef/ObjectSet 入参'
    );
  }

  return {
    content,
    changed,
    notes,
    addedInputParams,
    remainingObjectRefType
  };
};

export const mergeSceneInputParams = (
  existing: OntologyFunctionParam[] = [],
  added: ObjectRefTypeInputParam[],
  objectTypes: SceneObjectTypeRef[]
): OntologyFunctionParam[] => {
  const result = [...existing];

  added.forEach((param) => {
    if (result.some((item) => item.name === param.name)) {
      return;
    }

    const objectType = objectTypes.find(
      (item) => item.code === param.objectTypeCode
    );
    const uiType =
      param.paramType === ParamType.ObjectSet
        ? `${ParamType.ObjectSet}_${UiType.ObjectSet}`
        : `${ParamType.ObjectOne}_${UiType.ObjectOne}`;

    result.push({
      name: param.name,
      uiTypeAndValue: {
        uiType,
        paramValue: objectType
          ? {
              objectTypeData: {
                id: objectType.id,
                code: objectType.code,
                name: objectType.name,
                icon: objectType.icon
              }
            }
          : undefined
      }
    });
  });

  return result;
};
