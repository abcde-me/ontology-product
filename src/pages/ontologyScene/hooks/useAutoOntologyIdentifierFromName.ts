import { useEffect, useMemo, useState } from 'react';
import { Form, type FormInstance } from '@arco-design/web-react';
import { generateOntologyIdentifier } from '@/utils/generateOntologyIdentifier';
import { fetchSceneAllOntologyIdentifiers } from '@/utils/ontologyIdentifier';

interface UseAutoOntologyIdentifierFromNameOptions {
  form: FormInstance;
  ontologyModelID?: number;
  nameField: string;
  idField: string;
  /** 为 false 时不根据名称自动写入 id（如编辑态） */
  enabled?: boolean;
}

/** 根据名称自动生成对象类型/链接/行为 id，并保证场景内全局唯一 */
export function useAutoOntologyIdentifierFromName({
  form,
  ontologyModelID,
  nameField,
  idField,
  enabled = true
}: UseAutoOntologyIdentifierFromNameOptions) {
  const [existingIds, setExistingIds] = useState<string[]>([]);
  const nameValue = Form.useWatch(nameField, form);

  useEffect(() => {
    if (!enabled || !ontologyModelID) {
      setExistingIds([]);
      return;
    }

    fetchSceneAllOntologyIdentifiers(ontologyModelID)
      .then(setExistingIds)
      .catch(() => setExistingIds([]));
  }, [enabled, ontologyModelID]);

  const suggestedId = useMemo(() => {
    if (!enabled || !nameValue?.trim()) {
      return '';
    }
    return generateOntologyIdentifier(nameValue, existingIds);
  }, [enabled, existingIds, nameValue]);

  useEffect(() => {
    if (!enabled || !suggestedId) {
      return;
    }
    form.setFieldValue(idField, suggestedId);
  }, [enabled, suggestedId, form, idField]);

  return { suggestedId, existingIds };
}
