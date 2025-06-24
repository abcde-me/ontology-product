import type { FC } from 'react';
import React, { useCallback, useState } from 'react';
import { useBoolean } from 'ahooks';
import { useTranslation } from 'react-i18next';
import type { Param } from '../../types';
import { ParamType } from '../../types';
import AddButton from '@/pages/workflowConfig/components/button/add-button';
import Modal from '@/pages/workflowConfig/components/modal';
import Button from '@/pages/workflowConfig/components/button';
import Field from '@/pages/workflowConfig/app/config-modal/field';
import Input from '@/pages/workflowConfig/components/input';
import Textarea from '@/pages/workflowConfig/components/textarea';
import Select from '@/pages/workflowConfig/components/select';
import Switch from '@/pages/workflowConfig/components/switch';
import Toast from '@/pages/workflowConfig/components/toast';
import ConfigSelect from '@/pages/workflowConfig/app/config-select';
import {
  ChangeType,
  type MoreInfo
} from '@/pages/workflowConfig/workflow/types';
import { checkKeys } from '@/pages/workflowConfig/utils/var';

const i18nPrefix = 'workflow.nodes.parameterExtractor';
const errorI18nPrefix = 'workflow.errorMsg';

const DEFAULT_PARAM: Param = {
  name: '',
  type: ParamType.string,
  description: '',
  required: false
};

interface Props {
  type: 'add' | 'edit';
  payload?: Param;
  onSave: (payload: Param, moreInfo?: MoreInfo) => void;
  onCancel?: () => void;
}

const TYPES = [
  ParamType.string,
  ParamType.number,
  ParamType.arrayString,
  ParamType.arrayNumber,
  ParamType.arrayObject
];

const AddExtractParameter: FC<Props> = ({
  type,
  payload,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const isAdd = type === 'add';
  const [param, setParam] = useState<Param>(
    isAdd ? DEFAULT_PARAM : (payload as Param)
  );
  const [renameInfo, setRenameInfo] = useState<MoreInfo | undefined>(undefined);
  const handleParamChange = useCallback(
    (key: string) => {
      return (value: any) => {
        if (key === 'name') {
          const { isValid, errorKey, errorMessageKey } = checkKeys(
            [value],
            true
          );
          if (!isValid) {
            Toast.notify({
              type: 'error',
              message: t(`appDebug.varKeyError.${errorMessageKey}`, {
                key: errorKey
              })
            });
            return;
          }
        }
        setRenameInfo(
          key === 'name'
            ? {
                type: ChangeType.changeVarName,
                payload: {
                  beforeKey: param.name,
                  afterKey: value
                }
              }
            : undefined
        );
        setParam((prev) => {
          return {
            ...prev,
            [key]: value
          };
        });
      };
    },
    [param.name, t]
  );

  const [isShowModal, { setTrue: doShowModal, setFalse: doHideModal }] =
    useBoolean(!isAdd);

  const hideModal = useCallback(() => {
    doHideModal();
    onCancel?.();
  }, [onCancel, doHideModal]);

  const showAddModal = useCallback(() => {
    if (isAdd) setParam(DEFAULT_PARAM);

    doShowModal();
  }, [isAdd, doShowModal]);

  const checkValid = useCallback(() => {
    let errMessage = '';
    if (!param.name)
      errMessage = t(`${errorI18nPrefix}.fieldRequired`, {
        field: t(`${i18nPrefix}.addExtractParameterContent.name`)
      });
    if (
      !errMessage &&
      param.type === ParamType.select &&
      (!param.options || param.options.length === 0)
    )
      errMessage = t(`${errorI18nPrefix}.fieldRequired`, {
        field: t('appDebug.variableConfig.options')
      });
    if (!errMessage && !param.description)
      errMessage = t(`${errorI18nPrefix}.fieldRequired`, {
        field: t(`${i18nPrefix}.addExtractParameterContent.description`)
      });

    if (errMessage) {
      Toast.notify({
        type: 'error',
        message: errMessage
      });
      return false;
    }
    return true;
  }, [param, t]);

  const handleSave = useCallback(() => {
    if (!checkValid()) return;

    onSave(param, renameInfo);
    hideModal();
  }, [checkValid, onSave, param, hideModal, renameInfo]);

  return (
    <div>
      {isAdd && <AddButton className="mx-1" onClick={showAddModal} />}
      {isShowModal && (
        <Modal
          title={t(`${i18nPrefix}.addExtractParameter`)}
          isShow
          onClose={hideModal}
          className="!w-[400px] !max-w-[400px] !p-4"
        >
          <div>
            <div className="space-y-2">
              <Field title={t(`${i18nPrefix}.addExtractParameterContent.name`)}>
                <Input
                  className="rounded-[4px]"
                  value={param.name}
                  onChange={(e) => handleParamChange('name')(e.target.value)}
                  placeholder={t(
                    `${i18nPrefix}.addExtractParameterContent.namePlaceholder`
                  )}
                />
              </Field>
              <Field title={t(`${i18nPrefix}.addExtractParameterContent.type`)}>
                <Select
                  defaultValue={param.type}
                  allowSearch={false}
                  bgClassName="bg-gray-100"
                  onSelect={(v) => handleParamChange('type')(v.value)}
                  optionClassName="capitalize"
                  items={TYPES.map((type) => ({
                    value: type,
                    name: type
                  }))}
                />
              </Field>
              {param.type === ParamType.select && (
                <Field title={t('appDebug.variableConfig.options')}>
                  <ConfigSelect
                    options={param.options || []}
                    onChange={handleParamChange('options')}
                  />
                </Field>
              )}
              <Field
                title={t(
                  `${i18nPrefix}.addExtractParameterContent.description`
                )}
              >
                <Textarea
                  className="rounded-[4px]"
                  value={param.description}
                  onChange={(e) =>
                    handleParamChange('description')(e.target.value)
                  }
                  placeholder={t(
                    `${i18nPrefix}.addExtractParameterContent.descriptionPlaceholder`
                  )}
                />
              </Field>
              <Field
                title={t(`${i18nPrefix}.addExtractParameterContent.required`)}
              >
                <>
                  <div className="mb-1.5 text-xs font-normal leading-[18px] text-gray-500">
                    {t(
                      `${i18nPrefix}.addExtractParameterContent.requiredContent`
                    )}
                  </div>
                  <Switch
                    size="l"
                    defaultValue={param.required}
                    onChange={handleParamChange('required')}
                  />
                </>
              </Field>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button className="!w-[95px]" onClick={hideModal}>
                {t('common.operation.cancel')}
              </Button>
              <Button
                className="!w-[95px]"
                variant="primary"
                onClick={handleSave}
              >
                {isAdd ? t('common.operation.add') : t('common.operation.save')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default React.memo(AddExtractParameter);
