import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import useConfig from './use-config';
import type { CodeNodeType } from './types';
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import {
  Form,
  Input,
  Select,
  Checkbox,
  Switch,
  InputNumber
  // Table,
  // Space,
  // Slider,
  // Button
} from '@arco-design/web-react';
import { cloneDeep } from 'lodash-es';
import {
  dataStandardizationBefore,
  dataStandardizationAfter,
  dateScreeningAfter,
  dataScreeningBefore,
  dataSpecialBefore,
  dataSpecialAfter,
  dataSpecialCharactersAfter,
  dataSpecialCharactersBefore,
  // dataDeduplicateBefore,
  // dataDeduplicateAfter,
  // dataFuzzyDeduplicateBefore,
  // dataFuzzyDeduplicateAfter,
  dataDetoxificationAfter,
  dataDetoxificationBefore,
  dataImputationBefore,
  dataImputationAfter,
  dataOutlierHandlingBefore,
  dataOutlierHandlingAfter
} from './date-text';
import './date-cleaning.scss';
import useWatch from '@arco-design/web-react/es/Form/hooks/useWatch';

const Panel: FC<NodePanelProps<CodeNodeType>> = ({ id, data }) => {
  const { readOnly, inputs, onValuesChange } = useConfig(id, data);
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const Option = Select.Option;

  const data_standardization = useWatch('data_standardization', form);
  const threshold_switch = useWatch('threshold_switch', form);
  const ts_remove = useWatch('ts_remove', form);
  const mg_is = useWatch('mg_is', form);
  const qd_is = useWatch('qd_is', form);
  const df_is = useWatch('df_is', form);
  const oh_is = useWatch('oh_is', form);
  const case_uniformity = useWatch('case_uniformity', form);
  const isChecked_data_standardization = () => {
    return [
      inputs?.unicode,
      inputs?.traditional_to_simplified,
      inputs?.case_uniformity
    ].some(Boolean);
  };
  return (
    <div className="wk-node-panel-content code-panel-content date-cleaning-panel mt-[16px]">
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        disabled={readOnly}
        initialValues={{
          ...inputs,
          mg_is: inputs?.mg_is,
          qd_is: inputs?.qd_is,
          df_is: inputs?.df_is,
          oh_is: inputs?.oh_is,
          data_standardization:
            inputs?.data_standardization || isChecked_data_standardization(),
          remove_url: inputs?.remove_url,
          remove_invisible: inputs?.remove_invisible,
          remove_html: inputs?.remove_html,
          threshold: inputs?.threshold || 800,
          unicode: inputs?.unicode,
          traditional_to_simplified: inputs?.traditional_to_simplified,
          case_transform: inputs?.case_transform,
          case_uniformity: inputs?.case_uniformity
        }}
        layout="inline"
        onValuesChange={(_, v: any) => {
          onValuesChange(v);
        }}
      >
        <FormItem
          layout="inline"
          label="处理类型："
          labelAlign="left"
          required
        />
        <div className="file-box">
          {/* switch 开关 */}
          <div className="date-switch">
            <FormItem
              field="data_standardization"
              labelAlign="left"
              extra="将数据转换为标准格式或单位，例如日期、时间、货币等。"
            >
              <Switch
                checked={form.getFieldValue('data_standardization')}
                style={{ margin: 0, width: 'auto' }}
              />
            </FormItem>
            <span className="date-switch-text">数据标准化</span>
          </div>
          {data_standardization && (
            <>
              <div className="date-option">
                <FormItem
                  layout="vertical"
                  label={null}
                  field="unicode"
                  labelAlign="left"
                >
                  <Checkbox checked={form.getFieldValue('unicode')}>
                    文本标准化
                  </Checkbox>
                </FormItem>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="traditional_to_simplified"
                  labelAlign="left"
                >
                  <Checkbox
                    checked={form.getFieldValue('traditional_to_simplified')}
                  >
                    繁体转简体
                  </Checkbox>
                </FormItem>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="case_uniformity"
                  labelAlign="left"
                >
                  <Checkbox checked={form.getFieldValue('case_uniformity')}>
                    大小写统一
                  </Checkbox>
                </FormItem>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="case_transform"
                  labelAlign="left"
                >
                  <Select
                    size="mini"
                    placeholder="请选择"
                    style={{
                      width: '120px',
                      height: '22px',
                      marginLeft: '8px'
                    }}
                    disabled={!case_uniformity}
                  >
                    <Option key={1} value={1}>
                      小写
                    </Option>
                    <Option key={2} value={2}>
                      大写
                    </Option>
                  </Select>
                </FormItem>
              </div>
              <div className="date-cleaning-info">
                <div className="info-before">
                  <span className="info-before-text">清洗前:</span>
                  <span className="info-before-content">
                    {dataStandardizationBefore}
                  </span>
                </div>
                <div className="info-after">
                  <span className="info-after-text">清洗前:</span>
                  <span className="info-after-content">
                    {dataStandardizationAfter}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="file-box">
          <div className="date-switch">
            {/* 数据过滤开关 */}
            <FormItem
              field="threshold_switch"
              labelAlign="left"
              extra="根据规则过滤数据，去除无效、错误或低质量数据"
            >
              <Switch
                checked={form.getFieldValue('threshold_switch')}
                style={{ margin: 0, width: 'auto' }}
              />
            </FormItem>
            <span className="date-switch-text">数据过滤</span>
          </div>
          {threshold_switch && (
            <>
              <FormItem
                field="threshold"
                layout="inline"
                label="字符串长度阈值"
                rules={[
                  {
                    min: 5,
                    max: 1204,
                    type: 'number',
                    message: '长度范围为5~1024个字符'
                  }
                ]}
              >
                <InputNumber
                  min={5}
                  max={1024}
                  step={1}
                  size="mini"
                  placeholder="请输入发阈值 范围5~1024"
                />
              </FormItem>
              <div className="date-cleaning-info">
                <div className="info-before">
                  <span className="info-before-text">清洗前:</span>
                  <span className="info-before-content">
                    {dataScreeningBefore}
                  </span>
                </div>
                <div className="info-after">
                  <span className="info-after-text">清洗前:</span>
                  <span className="info-after-content">
                    {dateScreeningAfter}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="file-box">
          <div className="date-switch">
            <FormItem
              field="ts_remove"
              labelAlign="left"
              extra="将数据转换为标准格式或单位"
            >
              <Switch
                checked={form.getFieldValue('ts_remove')}
                style={{ margin: 0, width: 'auto' }}
              />
            </FormItem>
            <span className="date-switch-text">特殊字符删除</span>
          </div>
          {ts_remove && (
            <>
              <div className="date-option">
                <FormItem
                  layout="vertical"
                  label={null}
                  field="remove_url"
                  labelAlign="left"
                >
                  <Checkbox checked={form.getFieldValue('remove_url')}>
                    去除URL链接
                  </Checkbox>
                </FormItem>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="remove_invisible"
                  labelAlign="left"
                >
                  <Checkbox checked={form.getFieldValue('remove_invisible')}>
                    去除不可见字符
                  </Checkbox>
                </FormItem>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="remove_html"
                  labelAlign="left"
                >
                  <Checkbox checked={form.getFieldValue('remove_html')}>
                    去除html格式字符
                  </Checkbox>
                </FormItem>
              </div>
              <div className="date-cleaning-info">
                <div className="info-before">
                  <span className="info-before-text">清洗前:</span>
                  <span className="info-before-content">
                    {dataSpecialBefore}
                  </span>
                </div>
                <div className="info-after">
                  <span className="info-after-text">清洗前:</span>
                  <span className="info-after-content">{dataSpecialAfter}</span>
                </div>
              </div>
            </>
          )}
        </div>
        {/* 这期不做 */}
        {/* <div className="file-box">
          <div className="date-switch">
            <FormItem field="data_standardization[3].enabled">
              <Switch
                style={{ margin: 0, width: 'auto' }}
                checked={specialCharFilter}
                onChange={(checked) => {
                  setSpecialCharFilter(checked);
                }}
              />
            </FormItem>
            <span className="date-switch-text">特殊字符过滤</span>
          </div>
          <div className="date-desc">将数据转换为标准格式或单位</div>
          {specialCharFilter && (
            <>
              <div className="date-option">
                <span className="date-option-desc">特殊字符占比</span>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="specialCharRatio"
                  labelAlign="left"
                >
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={sliderValue}
                    onChange={sliderOnChange}
                    style={{ width: 120 }}
                    disabled={true}
                  />
                </FormItem>
              </div>
              <div className="date-cleaning-info">
                <div className="info-before">
                  <span className="info-before-text">清洗前:</span>
                  <span className="info-before-content">
                    {dataSpecialCharactersBefore}
                  </span>
                </div>
                <div className="info-after">
                  <span className="info-after-text">清洗前:</span>
                  <span className="info-after-content">
                    {dataSpecialCharactersAfter}
                  </span>
                </div>
              </div>
            </>
          )}
        </div> */}
        <div className="file-box">
          <div className="date-switch">
            <FormItem field="mg_is" labelAlign="left">
              <Switch
                checked={form.getFieldValue('mg_is')}
                style={{ margin: 0, width: 'auto' }}
              />
            </FormItem>
            <span className="date-switch-text">去除敏感词</span>
          </div>
          {/* <div className="date-desc">---</div> */}
          {mg_is && (
            <>
              <div className="date-cleaning-info">
                <div className="info-before">
                  <span className="info-before-text">清洗前:</span>
                  <span className="info-before-content">
                    {dataSpecialCharactersBefore}
                  </span>
                </div>
                <div className="info-after">
                  <span className="info-after-text">清洗前:</span>
                  <span className="info-after-content">
                    {dataSpecialCharactersAfter}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        {/* 这期不做 */}
        {/* <div className="file-box">
          <div className="date-switch">
            <FormItem field="data_standardization[5].enabled">
              <Switch
                style={{ margin: 0, width: 'auto' }}
                checked={deduplicateSwitch}
                onChange={(checked) => {
                  setDeduplicateSwitch(checked);
                }}
              />
            </FormItem>
            <span className="date-switch-text">数据去重</span>
          </div>
          <div className="date-desc">---</div>
          {deduplicateSwitch && (
            <>
              <FormItem
                layout="vertical"
                label={null}
                field="duplicationCheckbox"
                labelAlign="left"
              >
                <Checkbox>重复比率过滤</Checkbox>
              </FormItem>
              <FormItem
                layout="vertical"
                label={null}
                field="duplicationInput"
                labelAlign="left"
              >
                <Input placeholder="请输入" />
              </FormItem>
              <FormItem
                layout="vertical"
                label={null}
                field="MD5"
                labelAlign="left"
              >
                <Checkbox>基于MD5去重</Checkbox>
              </FormItem>
              <div className="date-cleaning-info">
                <div className="info-before">
                  <span className="info-before-text">清洗前:</span>
                  <span className="info-before-content">
                    {dataDeduplicateBefore}
                  </span>
                </div>
                <div className="info-after">
                  <span className="info-after-text">清洗前:</span>
                  <span className="info-after-content">
                    {dataDeduplicateAfter}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="file-box">
          <div className="date-switch">
            <FormItem field="data_standardization[6].enabled">
              <Switch
                style={{ margin: 0, width: 'auto' }}
                checked={fuzzyDeduplicateSwitch}
                onChange={(checked) => {
                  setFuzzyDeduplicateSwitch(checked);
                }}
              />
            </FormItem>
            <span className="date-switch-text">相似度去重</span>
          </div>
          <div className="date-desc">---</div>
          {fuzzyDeduplicateSwitch && (
            <>
              <FormItem
                layout="vertical"
                label="数据相似度阈值"
                field="duplicationCheckbox"
                labelAlign="left"
              >
                <Input placeholder="请输入" />
              </FormItem>
              <div className="date-cleaning-info">
                <div className="info-before">
                  <span className="info-before-text">清洗前:</span>
                  <span className="info-before-content">
                    {dataFuzzyDeduplicateBefore}
                  </span>
                </div>
                <div className="info-after">
                  <span className="info-after-text">清洗前:</span>
                  <span className="info-after-content">
                    {dataFuzzyDeduplicateAfter}
                  </span>
                </div>
              </div>
            </>
          )}
        </div> */}
        <div className="file-box">
          <div className="date-switch">
            <FormItem field="qd_is">
              <Switch
                checked={form.getFieldValue('qd_is')}
                style={{ margin: 0, width: 'auto' }}
              />
            </FormItem>
            <span className="date-switch-text">数据去毒化</span>
          </div>
          {/* 提示文案位置 */}
          {/* <div className="date-desc">---</div> */}
          {qd_is && (
            <>
              <div className="date-cleaning-info">
                <div className="info-before">
                  <span className="info-before-text">清洗前:</span>
                  <span className="info-before-content">
                    {dataDetoxificationBefore}
                  </span>
                </div>
                <div className="info-after">
                  <span className="info-after-text">清洗前:</span>
                  <span className="info-after-content">
                    {dataDetoxificationAfter}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="file-box">
          <div className="date-switch">
            <FormItem field="df_is">
              <Switch
                checked={form.getFieldValue('df_is')}
                style={{ margin: 0, width: 'auto' }}
              />
            </FormItem>
            <span className="date-switch-text">数据填补</span>
          </div>
          {/* 提示文案位置 */}
          {/* <div className="date-desc">---</div> */}
          {df_is && (
            <>
              <div className="date-cleaning-info">
                <div className="info-before">
                  <span className="info-before-text">清洗前:</span>
                  <span className="info-before-content">
                    {dataImputationBefore}
                  </span>
                </div>
                <div className="info-after">
                  <span className="info-after-text">清洗前:</span>
                  <span className="info-after-content">
                    {dataImputationAfter}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="file-box">
          <div className="date-switch">
            <FormItem field="oh_is">
              <Switch
                checked={form.getFieldValue('oh_is')}
                style={{ margin: 0, width: 'auto' }}
              />
            </FormItem>
            <span className="date-switch-text">异常值处理</span>
          </div>
          {/* <div className="date-desc">---</div> */}
          {oh_is && (
            <>
              <div className="date-cleaning-info">
                <div className="info-before">
                  <span className="info-before-text">清洗前:</span>
                  <span className="info-before-content">
                    {dataOutlierHandlingBefore}
                  </span>
                </div>
                <div className="info-after">
                  <span className="info-after-text">清洗前:</span>
                  <span className="info-after-content">
                    {dataOutlierHandlingAfter}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </Form>
    </div>
  );
};

export default React.memo(Panel);
