import { useEffect, useMemo, useState } from 'react';
import { Form, type FormInstance } from '@arco-design/web-react';
import { generateOntologyIdentifier } from '@/utils/generateOntologyIdentifier';
import { fetchSceneAllOntologyIdentifiers } from '@/utils/ontologyIdentifier';
import { LinkPairFormItem } from '../types';

interface UseLinkPairAutoIdOptions {
  form: FormInstance;
  index: number;
  ontologyModelID?: number;
  linkPairsField?: string;
}

/** 单组链接对：根据名称自动生成 id，并避让同表单内其他链接对 id */
export function useLinkPairAutoId({
  form,
  index,
  ontologyModelID,
  linkPairsField = 'linkPairs'
}: UseLinkPairAutoIdOptions) {
  const [existingIds, setExistingIds] = useState<string[]>([]);
  const linkPairs =
    (Form.useWatch(linkPairsField, form) as LinkPairFormItem[] | undefined) ||
    [];
  const nameValue = linkPairs[index]?.name;

  useEffect(() => {
    if (!ontologyModelID) {
      setExistingIds([]);
      return;
    }

    fetchSceneAllOntologyIdentifiers(ontologyModelID)
      .then(setExistingIds)
      .catch(() => setExistingIds([]));
  }, [ontologyModelID]);

  const reservedIds = useMemo(
    () =>
      linkPairs
        .map((item, itemIndex) => (itemIndex === index ? null : item?.id))
        .filter((id): id is string => Boolean(id?.trim())),
    [index, linkPairs]
  );

  const suggestedId = useMemo(() => {
    if (!nameValue?.trim()) {
      return '';
    }
    return generateOntologyIdentifier(nameValue, [
      ...existingIds,
      ...reservedIds
    ]);
  }, [existingIds, nameValue, reservedIds]);

  useEffect(() => {
    if (!suggestedId) {
      return;
    }
    form.setFieldValue(`${linkPairsField}.${index}.id`, suggestedId);
  }, [form, index, linkPairsField, suggestedId]);

  return { suggestedId };
}
