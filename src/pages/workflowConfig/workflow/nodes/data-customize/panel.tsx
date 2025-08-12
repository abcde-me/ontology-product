import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Modal } from '@arco-design/web-react';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { python } from '@codemirror/legacy-modes/mode/python';
import { useStoreApi } from 'reactflow';
import useConfig from './use-config';
import {
  IconCaretRight,
  IconExpand,
  IconShrink
} from '@arco-design/web-react/icon';
import { createTheme } from '@uiw/codemirror-themes';
import './panel.scss';

const FormItem = Form.Item;

const Panel = ({ id, data, parentRef }) => {
  const store = useStoreApi();
  const [form] = Form.useForm();
  const { readOnly, inputs, handleValueChange } = useConfig(id, data);
  const [isSticky, setSticky] = useState(false);
  const [isModalSticky, setModalSticky] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stickyModalRef = useRef<HTMLDivElement>(null);
  const [modalElement, setModalElement] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState(inputs?.script_content);
  const [visible, setVisible] = useState(false);
  const [placeholderValue, setPlaceholderValue] = useState(
    `import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# 设置随机种子
np.random.seed(0)

# 创建一个模拟 30 天的销售额数据
df = pd.DataFrame({
    'day': range(1, 31),
    'sales': np.random.normal(loc=200, scale=30, size=30).astype(int)
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# 设置随机种子
np.random.seed(0)

# 创建一个模拟 30 天的销售额数据
df = pd.DataFrame({
    'day': range(1, 31),
    'sales': np.random.normal(loc=200, scale=30, size=30).astype(int)`
  );

  const onChange = useCallback((val, viewUpdate) => {
    setValue(val);
    handleValueChange({
      ...inputs,
      script_content: val
    });
  }, []);

  // 计算距离的核心函数
  const calculateDistance = () => {
    if (!parentRef.current || !stickyRef.current) return;
    // 获取父容器和子元素相对于视口的位置信息
    const parentRect = parentRef.current.getBoundingClientRect();
    const childRect = stickyRef.current.getBoundingClientRect();
    const stickyTop = parseInt(window.getComputedStyle(stickyRef.current).top);
    // 子元素顶部距离父容器顶部的距离 = 子元素视口顶部 - 父容器视口顶部
    const distance = childRect.top - parentRect.top;
    const isSticking = distance <= stickyTop;
    setSticky(isSticking);
  };

  // 计算距离的核心函数
  const calculateDistanceModal = () => {
    if (!modalElement || !stickyModalRef.current) return;
    // 获取父容器和子元素相对于视口的位置信息
    const parentRect = modalElement.getBoundingClientRect();
    const childRect = stickyModalRef.current.getBoundingClientRect();
    const stickyTop = parseInt(
      window.getComputedStyle(stickyModalRef.current).top
    );
    // 子元素顶部距离父容器顶部的距离 = 子元素视口顶部 - 父容器视口顶部
    const distance = childRect.top - parentRect.top;
    const isSticking = distance <= stickyTop;
    setModalSticky(isSticking);
  };

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    // 初始化计算一次
    calculateDistance();

    // 监听父容器的滚动事件（核心：仅父容器滚动时触发）
    const handleParentScroll = () => {
      calculateDistance();
    };

    // 添加事件监听
    parent.addEventListener('scroll', handleParentScroll);

    // 初始化计算一次
    calculateDistanceModal();

    // 组件卸载时清理事件监听
    return () => {
      parent.removeEventListener('scroll', handleParentScroll);
    };
  }, []);

  useEffect(() => {
    if (!modalElement) return;
    calculateDistanceModal();

    // 监听父容器的滚动事件（核心：仅父容器滚动时触发）
    const handleModalScroll = () => {
      calculateDistanceModal();
    };

    // 添加事件监听
    modalElement.addEventListener('scroll', handleModalScroll);

    // 组件卸载时清理事件监听
    return () => {
      modalElement.removeEventListener('scroll', handleModalScroll);
    };
  }, [modalElement]);

  const myTheme = createTheme({
    theme: 'light',
    settings: {
      background: '#ffffff',
      backgroundImage: '',
      foreground: '#75baff',
      caret: '#5d00ff',
      selection: '#036dd626',
      selectionMatch: '#036dd626',
      lineHighlight: '#8a91991a',
      gutterBackground: '#fff',
      gutterForeground: '#8a919966'
    },
    styles: []
  });

  const handleCustomizeRun = () => {
    const { edges, getNodes } = store.getState();
    const nodes = getNodes();
    const params = {
      graph: {
        edges,
        nodes
      },
      bench_node: {
        id: id,
        data: {
          type: data.type,
          title: data.title,
          script_content: JSON.stringify(value)
        }
      }
    };
    console.log(params, 'ssssssssssssssssssssssssssss');
  };

  return (
    <div className="wk-node-panel-content wk-data-customize-panel-content mt-[16px]">
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={{
          ...inputs
        }}
        layout="vertical"
      >
        <FormItem
          label="Python脚本:"
          field="script_content"
          labelAlign="left"
          required
        >
          <div className="editor-container">
            <div
              ref={stickyRef}
              className={`sticky top-[101px] z-10 flex h-[52px] items-center justify-between bg-white px-[12px] py-[10px] ${isSticky ? 'is-sticky' : ''}`}
            >
              <Button
                type="primary"
                onClick={handleCustomizeRun}
                icon={<IconCaretRight />}
              >
                测试运行
              </Button>
              <IconExpand
                className="full-screen-icon"
                onClick={() => setVisible(true)}
              />
            </div>
            <div className="mt-[2px] px-[12px]">
              <CodeMirror
                value={value}
                theme={myTheme}
                placeholder={placeholderValue}
                extensions={[StreamLanguage.define(python)]}
                onChange={onChange}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: false
                }}
              />
            </div>
          </div>
        </FormItem>
      </Form>
      <Modal
        className="wk-data-customize-panel-modal"
        title="Python脚本"
        visible={visible}
        footer={null}
        mask={false}
        maskClosable={false}
        closeIcon={
          <IconShrink
            className="full-screen-icon"
            onClick={() => setVisible(false)}
          />
        }
      >
        <div className="editor-container">
          <CodeMirror
            value={value}
            theme={myTheme}
            placeholder={placeholderValue}
            extensions={[StreamLanguage.define(python)]}
            onChange={onChange}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: false
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(Panel);
