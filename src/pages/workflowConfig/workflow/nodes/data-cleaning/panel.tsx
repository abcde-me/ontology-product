import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import useConfig from './use-config';
import type {
  CodeNodeType,
} from './types';
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import {
  Form,
  Input,
  Select,
  Checkbox,
  Switch,
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

const Panel: FC<NodePanelProps<CodeNodeType>> = ({ id, data }) => {
  const {
    readOnly,
    inputs,
    updateInputs,
  } = useConfig(id, data);

  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const Option = Select.Option;

  const [switchChecked, setSwitchChecked] = useState(false);
  const [filterChecked, setFilterChecked] = useState(false);
  const [upperLowerStatus, setUpperLowerStatus] = useState(true);

  const [dataStandardizationSwitch, setDataStandardizationSwitch] =
    useState(false);
  const [SensitiveSwitch, setSensitiveSwitch] = useState(false);
  const [detoxificationSwitch, setDetoxificationSwitch] = useState(false);
  const [imputationSwitch, setImputationSwitch] = useState(false);
  const [outlierHandlingSwitch, setOutlierHandlingSwitch] = useState(false);
  // 获取from内容
  const onValuesChange = useMemo(() => (changeValue, values) => {
    updateInputs(values);
  }, [upperLowerStatus]);
  useEffect(() => {
    setImputationSwitch(inputs?.df_is);
    setOutlierHandlingSwitch(inputs?.oh_is);
    setDetoxificationSwitch(inputs.qd_is);
    setSensitiveSwitch(inputs?.mg_is);
    setDataStandardizationSwitch(inputs?.ts_remove);
    setSwitchChecked(inputs?.data_standardization);
    setFilterChecked(inputs?.threshold_switch)
  }, [inputs])
  return (
    <div className="wk-node-panel-content code-panel-content date-cleaning-panel mt-[16px]">
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={{
          remove_url: inputs?.remove_url,
          remove_invisible: inputs?.remove_invisible,
          remove_html: inputs?.remove_html,
          threshold: inputs?.threshold || 800,
          unicode: inputs?.unicode,
          traditional_to_simplified: inputs?.traditional_to_simplified,
          case_transform: inputs?.case_transform,
          case_uniformity: inputs?.case_uniformity,
          vars: cloneDeep(inputs.variables || [])
        }}
        layout="inline"
        onValuesChange={onValuesChange}
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
            <FormItem field="data_standardization">
              <Switch
                style={{ margin: 0, width: 'auto' }}
                checked={switchChecked}
                onChange={(checked) => {
                  setSwitchChecked(checked);
                }}
              />
            </FormItem>
            <span className="date-switch-text">数据标准化</span>
          </div>
          <div className="date-desc">
            将数据转换为标准格式或单位，例如日期、时间、货币等。
          </div>
          {switchChecked && (
            <>
              <div className="date-option">
                <FormItem
                  layout="vertical"
                  label={null}
                  field="unicode"
                  labelAlign="left"
                >
                  <Checkbox>文本标准化</Checkbox>
                </FormItem>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="traditional_to_simplified"
                  labelAlign="left"
                >
                  <Checkbox>繁体转简体</Checkbox>
                </FormItem>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="case_uniformity"
                  labelAlign="left"
                >
                  <Checkbox onChange={(checked) => { setUpperLowerStatus(!checked) }}>大小写统一</Checkbox>
                </FormItem>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="case_transform"
                  labelAlign="left"
                >
                  <Select
                    size='mini'
                    placeholder="请选择"
                    style={{ width: '120px', height: '22px', marginLeft: '8px' }}
                    disabled={upperLowerStatus}
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
            <FormItem field="threshold_switch">
              <Switch
                style={{ margin: 0, width: 'auto' }}
                checked={filterChecked}
                onChange={(checked) => setFilterChecked(checked)}
              />
            </FormItem>
            <span className="date-switch-text">数据过滤</span>
          </div>
          <div className="data-dec">
            根据规则过滤数据，去除无效、错误或低质量数据
          </div>
          {filterChecked && (
            <>
              <FormItem
                field="threshold"
                layout="inline"
                label="字符串长度阈值"

              >
                <Input size='mini' style={{ marginLeft: '16px' }} placeholder="请输入发阈值" min={0} />
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
            <FormItem field="ts_remove">
              <Switch
                style={{ margin: 0, width: 'auto' }}
                checked={dataStandardizationSwitch}
                onChange={(checked) => setDataStandardizationSwitch(checked)}
              />
            </FormItem>
            <span className="date-switch-text">特殊字符删除</span>
          </div>
          <div className="date-desc">将数据转换为标准格式或单位</div>
          {dataStandardizationSwitch && (
            <>
              <div className="date-option">
                <FormItem
                  layout="vertical"
                  label={null}
                  field="remove_url"
                  labelAlign="left"
                >
                  <Checkbox>去除URL链接</Checkbox>
                </FormItem>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="remove_invisible"
                  labelAlign="left"
                >
                  <Checkbox>去除不可见字符</Checkbox>
                </FormItem>
                <FormItem
                  layout="vertical"
                  label={null}
                  field="remove_html"
                  labelAlign="left"
                >
                  <Checkbox>去除html格式字符</Checkbox>
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
            <FormItem field="mg_is">
              <Switch
                style={{ margin: 0, width: 'auto' }}
                checked={SensitiveSwitch}
                onChange={(checked) => {
                  setSensitiveSwitch(checked);
                }}
              />
            </FormItem>
            <span className="date-switch-text">去除敏感词</span>
          </div>
          {/* <div className="date-desc">---</div> */}
          {SensitiveSwitch && (
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
                style={{ margin: 0, width: 'auto' }}
                checked={detoxificationSwitch}
                onChange={(checked) => {
                  setDetoxificationSwitch(checked);
                }}
              />
            </FormItem>
            <span className="date-switch-text">数据去毒化</span>
          </div>
          {/* 提示文案位置 */}
          {/* <div className="date-desc">---</div> */}
          {detoxificationSwitch && (
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
                style={{ margin: 0, width: 'auto' }}
                checked={imputationSwitch}
                onChange={(checked) => {
                  setImputationSwitch(checked);
                }}
              />
            </FormItem>
            <span className="date-switch-text">数据填补</span>
          </div>
          {/* 提示文案位置 */}
          {/* <div className="date-desc">---</div> */}
          {imputationSwitch && (
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
                style={{ margin: 0, width: 'auto' }}
                checked={outlierHandlingSwitch}
                onChange={(checked) => {
                  setOutlierHandlingSwitch(checked);
                }}
              />
            </FormItem>
            <span className="date-switch-text">异常值处理</span>
          </div>
          {/* <div className="date-desc">---</div> */}
          {outlierHandlingSwitch && (
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
