import React from 'react';
import { Form } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import type { FormInstance } from '@arco-design/web-react';
import LinkPairItemRow from '../LinkPairItemRow';
import { createEmptyLinkPairItem } from '../linkPairUtils';

interface LinkPairsSectionProps {
  form: FormInstance;
  ontologyModelID?: number;
  styles: Record<string, string>;
}

export default function LinkPairsSection({
  form,
  ontologyModelID,
  styles
}: LinkPairsSectionProps) {
  return (
    <>
      <Form.List field="linkPairs">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <LinkPairItemRow
                key={field.key}
                form={form}
                fieldPrefix={`linkPairs.${index}`}
                index={index}
                ontologyModelID={ontologyModelID}
                styles={styles}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
              />
            ))}

            <button
              type="button"
              onClick={() => add(createEmptyLinkPairItem())}
              className="flex h-[40px] w-full cursor-pointer items-center justify-center gap-[6px] rounded-[4px] border border-dashed border-[#C9D5F0] bg-[#EEF3FF] text-[14px] leading-[22px] text-[rgb(var(--primary-6))] transition-colors hover:border-[rgb(var(--primary-6))] hover:bg-[rgb(var(--primary-1))]"
            >
              <IconPlus />
              添加链接对
            </button>
          </>
        )}
      </Form.List>
    </>
  );
}
