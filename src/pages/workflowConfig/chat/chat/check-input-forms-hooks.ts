import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { InputForm } from './type';
import { useToastContext } from '@/pages/workflowConfig/components/toast';
import { InputVarType } from '@/pages/workflowConfig/workflow/types';
import { TransferMethod } from '@/pages/workflowConfig/types/app';

export const useCheckInputsForms = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { notify } = useToastContext();

  const checkInputsForm = useCallback(
    (inputs: Record<string, any>, inputsForm: InputForm[]) => {
      let hasEmptyInput = '';
      let fileIsUploading = false;
      const requiredVars = inputsForm.filter(({ required }) => required);

      if (requiredVars?.length) {
        requiredVars.forEach(({ variable, label, type }) => {
          if (hasEmptyInput) return;

          if (fileIsUploading) return;

          if (!inputs[variable]) hasEmptyInput = label;

          if (
            (type === InputVarType.singleFile ||
              type === InputVarType.multiFiles) &&
            inputs[variable]
          ) {
            const files = inputs[variable];
            if (Array.isArray(files))
              fileIsUploading = files.find(
                (item) =>
                  item.transferMethod === TransferMethod.local_file &&
                  !item.uploadedId
              );
            else
              fileIsUploading =
                files.transferMethod === TransferMethod.local_file &&
                !files.uploadedId;
          }
        });
      }

      if (hasEmptyInput) {
        notify({
          type: 'error',
          message: t('appDebug.errorMessage.valueOfVarRequired', {
            key: hasEmptyInput
          })
        });
        return false;
      }

      if (fileIsUploading) {
        notify({
          type: 'info',
          message: t('appDebug.errorMessage.waitForFileUpload')
        });
        return;
      }

      return true;
    },
    [notify, t]
  );

  return {
    checkInputsForm
  };
};
