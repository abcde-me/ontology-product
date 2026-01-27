/**
 * 批量分配弹窗组件
 */

import AnnotationUserIcon from '@/assets/annotation/annotation-user.svg';
import QualityUserIcon from '@/assets/annotation/quality-user.svg';
import {
  Button,
  Checkbox,
  Form,
  Message,
  Modal,
  Radio,
  Select,
  Tag
} from '@arco-design/web-react';
import React, { useMemo, useState } from 'react';
import { DepartmentModal } from '../DepartmentModal';
import { IndividualModal } from '../IndividualModal';
import './styles.scss';
import { AssignType, BatchAssignData, TaskPackage } from './types';
import { generateProcessOptions } from './utils';
const FormItem = Form.Item;

interface BatchAssignModalProps {
  visible: boolean;
  onClose: () => void;
  taskPackages: TaskPackage[];
  onConfirm: (data: BatchAssignData) => void;
}

const BatchAssignModal: React.FC<BatchAssignModalProps> = ({
  visible,
  onClose,
  taskPackages,
  onConfirm
}) => {
  const [form] = Form.useForm();
  const [assignType, setAssignType] = useState<AssignType>('department');
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPersons, setSelectedPersons] = useState<string[]>([]);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [individualModalVisible, setIndividualModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');

  // 生成工序选项
  const processOptions = useMemo(() => {
    return generateProcessOptions(taskPackages);
  }, [taskPackages]);

  // 根据搜索值过滤选项
  const filteredProcessOptions = useMemo(() => {
    if (!searchValue) {
      return processOptions;
    }
    const searchLower = searchValue.toLowerCase();
    return processOptions.filter((opt) => {
      // 内联标签生成逻辑（与 getOptionLabel 保持一致）
      const label = `任务包${opt.taskId}-${
        opt.roleType === 'labeler'
          ? '标注'
          : `${opt.roleType.split('_')[1]}轮质检`
      }`;
      return label.toLowerCase().includes(searchLower);
    });
  }, [processOptions, searchValue]);

  // 是否全选（基于过滤后的选项）
  const isAllSelected = useMemo(() => {
    if (filteredProcessOptions.length === 0) return false;
    return filteredProcessOptions.every((opt) =>
      selectedProcesses.includes(opt.value)
    );
  }, [filteredProcessOptions, selectedProcesses]);

  // 是否部分选中（基于过滤后的选项）
  const isIndeterminate = useMemo(() => {
    const selectedCount = filteredProcessOptions.filter((opt) =>
      selectedProcesses.includes(opt.value)
    ).length;
    return selectedCount > 0 && selectedCount < filteredProcessOptions.length;
  }, [filteredProcessOptions, selectedProcesses]);

  // 处理全选（只选择过滤后的选项）
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 全选：添加所有过滤后的选项（保留已选中的其他选项）
      const filteredValues = filteredProcessOptions.map((opt) => opt.value);
      const newValue = [...new Set([...selectedProcesses, ...filteredValues])];
      setSelectedProcesses(newValue);
      form.setFieldValue('processes', newValue);
    } else {
      // 取消全选：移除所有过滤后的选项（保留未过滤的选项）
      const filteredValues = filteredProcessOptions.map((opt) => opt.value);
      const newValue = selectedProcesses.filter(
        (val) => !filteredValues.includes(val)
      );
      setSelectedProcesses(newValue);
      form.setFieldValue('processes', newValue);
    }
  };

  // 渲染选项图标
  const renderOptionIcon = (roleType: string) => {
    if (roleType === 'labeler') {
      return <AnnotationUserIcon style={{ width: 16, height: 16 }} />;
    }
    return <QualityUserIcon style={{ width: 16, height: 16 }} />;
  };

  // 获取选项显示文本（不带图标和已配字样）
  const getOptionLabel = (option: (typeof processOptions)[0]) => {
    return `任务包${option.taskId}-${
      option.roleType === 'labeler'
        ? '标注'
        : `${option.roleType.split('_')[1]}轮质检`
    }`;
  };

  // 自定义标签渲染（只显示文本，不显示图标和已配字样）
  const renderTag = (
    props: {
      value: any;
      label: React.ReactNode;
      closable: boolean;
      onClose: (event: any) => void;
    },
    index: number,
    values: any[]
  ) => {
    const option = processOptions.find((opt) => opt.value === props.value);
    const displayLabel = option ? getOptionLabel(option) : props.label;

    return (
      <Tag
        key={props.value}
        closable={props.closable}
        onClose={props.onClose}
        style={{
          margin: '1px 4px 2px 0',
          padding: '6px 8px',
          fontSize: '14px',
          backgroundColor: '#E7ECF0',
          borderRadius: '2px',
          color: '#0F172A'
        }}
      >
        {displayLabel}
      </Tag>
    );
  };

  // 自定义下拉框渲染
  const renderDropdown = (menu: React.ReactNode) => {
    return (
      <div className="process-select-dropdown">
        <div
          className="select-all-option"
          style={{
            padding: '8px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={(checked) => {
              handleSelectAll(checked);
            }}
          >
            全选
          </Checkbox>
        </div>
        {menu}
      </div>
    );
  };

  // 重置表单
  const resetForm = () => {
    form.resetFields();
    setAssignType('department');
    setSelectedProcesses([]);
    setSelectedDepartments([]);
    setSelectedPersons([]);
    setSearchValue('');
  };

  // 处理关闭
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 处理确认
  const handleConfirm = () => {
    form.validate().then((values) => {
      if (selectedProcesses.length === 0) {
        Message.warning('请至少选择一个工序');
        return;
      }

      const selectedCount =
        assignType === 'department'
          ? selectedDepartments.length
          : selectedPersons.length;

      if (selectedCount === 0) {
        Message.warning(
          `请选择${assignType === 'department' ? '部门' : '个人'}`
        );
        return;
      }

      const data: BatchAssignData = {
        selectedProcesses,
        assignType,
        selectedDepartments:
          assignType === 'department' ? selectedDepartments : [],
        selectedPersons: assignType === 'person' ? selectedPersons : []
      };

      onConfirm(data);
      handleClose();
    });
  };

  // 处理分配类型切换
  const handleAssignTypeChange = (value: AssignType) => {
    setAssignType(value);
    setSelectedDepartments([]);
    setSelectedPersons([]);
  };

  return (
    <Modal
      title="批量分配"
      visible={visible}
      onCancel={handleClose}
      footer={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'flex-end'
          }}
        >
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      }
      style={{ width: 600 }}
    >
      <Form form={form} colon labelCol={{ span: 4 }}>
        <FormItem
          label="选择工序"
          field="processes"
          required
          rules={[{ required: true, message: '请选择工序' }]}
        >
          <Select
            mode="multiple"
            className="multiple-process-select"
            placeholder="请选择批量分配人员的工序"
            value={selectedProcesses}
            onChange={(value) => {
              setSelectedProcesses(value);
              form.setFieldValue('processes', value);
            }}
            maxTagCount={2}
            dropdownRender={renderDropdown}
            renderTag={renderTag}
            showSearch
            onSearch={(value) => {
              setSearchValue(value);
            }}
            filterOption={(inputValue, option: any) => {
              const optionValue = option?.value || option?.props?.value;
              const optionData = processOptions.find(
                (opt) => opt.value === optionValue
              );
              if (!optionData) return false;
              const label = getOptionLabel(optionData);
              return label.toLowerCase().includes(inputValue.toLowerCase());
            }}
            style={{ width: '100%' }}
          >
            {processOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 400
                  }}
                >
                  {renderOptionIcon(option.roleType)}
                  <span>
                    任务包{option.taskId}-
                    {option.roleType === 'labeler'
                      ? '标注'
                      : `${option.roleType.split('_')[1]}轮质检`}
                  </span>
                  {option.isConfigured && (
                    <span style={{ fontSize: '14px', color: '#7F8C9F' }}>
                      (已配)
                    </span>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </FormItem>

        <FormItem
          initialValue={'department'}
          label="选择类型"
          field="assignType"
          required
          rules={[{ required: true, message: '请选择类型' }]}
        >
          <Radio.Group value={assignType} onChange={handleAssignTypeChange}>
            <Radio value="department">部门</Radio>
            <Radio value="person">个人</Radio>
          </Radio.Group>
        </FormItem>

        <FormItem
          label={assignType === 'department' ? '选择部门' : '选择个人'}
          required
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              onClick={() => {
                if (assignType === 'department') {
                  setDepartmentModalVisible(true);
                } else {
                  setIndividualModalVisible(true);
                }
              }}
            >
              选择
            </Button>
            <span style={{ fontSize: '14px', color: '#6E7B8D' }}>
              已选{' '}
              {assignType === 'department'
                ? selectedDepartments.length
                : selectedPersons.length}
            </span>
          </div>
        </FormItem>
      </Form>

      {/* 部门选择弹窗 */}
      <DepartmentModal
        visible={departmentModalVisible}
        onClose={() => setDepartmentModalVisible(false)}
        onConfirm={(keys) => {
          setSelectedDepartments(keys);
          setDepartmentModalVisible(false);
        }}
        initialSelected={selectedDepartments}
        title="选择部门"
        getChildTreeSelectData={() => {
          // 不在选择时立即触发，只在点击确认按钮时触发
        }}
        type="create"
      />

      {/* 个人选择弹窗 */}
      <IndividualModal
        visible={individualModalVisible}
        onClose={() => setIndividualModalVisible(false)}
        onConfirm={(keys) => {
          setSelectedPersons(keys);
          setIndividualModalVisible(false);
        }}
        initialSelected={selectedPersons}
        title="选择个人"
        getChildTreeSelectData={() => {
          // 不在选择时立即触发，只在点击确认按钮时触发
        }}
        getTreeIds={() => {}}
        type="create"
      />
    </Modal>
  );
};

export default BatchAssignModal;
