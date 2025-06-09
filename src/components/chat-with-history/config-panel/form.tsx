import React from 'react';
import { useCallback } from 'react';
import { useChatWithHistoryContext } from '../context';
import Input from './form-input';

const Form = () => {
  const {
    inputsForms,
    newConversationInputs,
    handleNewConversationInputsChange,
    isMobile
  } = useChatWithHistoryContext();

  const handleFormChange = useCallback(
    (variable: string, value: string) => {
      handleNewConversationInputsChange({
        ...newConversationInputs,
        [variable]: value
      });
    },
    [newConversationInputs, handleNewConversationInputsChange]
  );

  const renderField = (form: any) => {
    const { label, required, variable, options } = form;

    if (form.type === 'text-input' || form.type === 'paragraph') {
      return (
        <Input
          form={form}
          value={newConversationInputs[variable]}
          onChange={handleFormChange}
        />
      );
    }

    return null;
  };

  if (!inputsForms.length) return null;

  return (
    <div className="mb-4 py-2">
      {inputsForms.map((form) => (
        <div
          key={form.variable}
          className={`mb-3 flex text-sm text-gray-900 last-of-type:mb-0 ${isMobile && '!flex-wrap'}`}
        >
          <div
            className={`mr-2 w-[128px] shrink-0 py-2 ${isMobile && '!w-full'}`}
          >
            {form.label}
          </div>
          {renderField(form)}
        </div>
      ))}
    </div>
  );
};

export default Form;
