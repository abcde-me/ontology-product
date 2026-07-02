import { useEffect, useRef, useState } from 'react';
import { Form, type FormInstance } from '@arco-design/web-react';
import { useDebounceFn } from 'ahooks';
import {
  fetchSceneObjectTypeCodes,
  generateOntologyObjectTypeCodeName
} from '@/pages/ontologyScene/modules/objectType/services/generateOntologyObjectTypeCodeName';

interface UseAutoOntologyObjectTypeCodeFromNameOptions {
  form: FormInstance;
  ontologyModelID?: number;
  nameField: string;
  codeField: string;
  /** 为 false 时不根据名称自动写入 code（如编辑态） */
  enabled?: boolean;
}

/** 根据对象类型名称自动生成 id，并保证场景内对象类型唯一 */
export function useAutoOntologyObjectTypeCodeFromName({
  form,
  ontologyModelID,
  nameField,
  codeField,
  enabled = true
}: UseAutoOntologyObjectTypeCodeFromNameOptions) {
  const [existingCodes, setExistingCodes] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const existingCodesRef = useRef(existingCodes);
  existingCodesRef.current = existingCodes;
  const nameValue = Form.useWatch(nameField, form);

  useEffect(() => {
    if (!enabled || !ontologyModelID) {
      setExistingCodes([]);
      return;
    }

    fetchSceneObjectTypeCodes(ontologyModelID)
      .then(setExistingCodes)
      .catch(() => setExistingCodes([]));
  }, [enabled, ontologyModelID]);

  const { run: generateCode } = useDebounceFn(
    async (displayName: string) => {
      const trimmed = displayName.trim();
      if (!trimmed) {
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setGenerating(true);

      try {
        const { code } = await generateOntologyObjectTypeCodeName({
          displayName: trimmed,
          existingCodes: existingCodesRef.current,
          signal: controller.signal
        });

        if (controller.signal.aborted) {
          return;
        }

        form.setFieldValue(codeField, code);
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
          return;
        }
        console.warn('[ObjectType] 自动生成对象类型 id 失败', error);
      } finally {
        if (!controller.signal.aborted) {
          setGenerating(false);
        }
      }
    },
    { wait: 600 }
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!nameValue?.trim()) {
      abortRef.current?.abort();
      setGenerating(false);
      return;
    }

    generateCode(nameValue);
  }, [enabled, existingCodes, generateCode, nameValue]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { generating, existingCodes };
}
