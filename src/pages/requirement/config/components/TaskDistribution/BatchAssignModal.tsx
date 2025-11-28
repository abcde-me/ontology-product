/**
 * 批量分配弹窗组件
 */

import React, { useState, useMemo } from 'react';
import {
  Modal,
  Form,
  Select,
  Radio,
  Button,
  Message
} from '@arco-design/web-react';
import { TaskPackage, BatchAssignData, AssignType } from './types';
import { generateProcessOptions } from './utils';
import { DepartmentModal } from '../DepartmentModal';
import { IndividualModal } from '../IndividualModal';
import './styles.scss';
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

  // 生成工序选项
  const processOptions = useMemo(() => {
    return generateProcessOptions(taskPackages);
  }, [taskPackages]);

  // 重置表单
  const resetForm = () => {
    form.resetFields();
    setAssignType('department');
    setSelectedProcesses([]);
    setSelectedDepartments([]);
    setSelectedPersons([]);
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
      Message.success('批量分配成功');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            placeholder="请选择批量分配的人员角色"
            value={selectedProcesses}
            onChange={setSelectedProcesses}
            maxTagCount={2}
            options={processOptions}
            style={{ width: '100%' }}
          />
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
            <span>
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
        requirementDetail={null}
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
        requirementDetail={null}
        type="create"
      />
    </Modal>
  );
};

export default BatchAssignModal;
