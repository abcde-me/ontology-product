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
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [placeholderValue, setPlaceholderValue] = useState(
    `# 平台内置SDK，用于节点间数据交互
import platform_sdk as pf\n

  try:
    # 1. 获取上游节点的输入数据
    # 如果只有一个上游输入，可直接使用 get_input() 获取数据对象
    # 平台会自动处理反序列化，用户拿到的是可直接操作的变量
  input_data = pf.get_input()

    # 2. 在此编写您的核心处理逻辑
    # ----------------------------------
    # 示例：假设输入为xarray.Dataset
  processed_data = input_data.copy() # 创建副本以进行修改
  processed_data['temperature'] = processed_data['temperature'] + 273.15 # 摄氏度转开尔文
  processed_data.attrs['history'] = 'Converted temperature to Kelvin.'
  print("数据处理完成：已将温度单位转换为开尔文。")
    # ----------------------------------

    # 3. 设置当前节点的输出，供下游节点使用
    # format参数指定了当此节点为最终节点时，在“目标数据目录”中保存的格式
  pf.set_output(processed_data, format = 'netcdf')

except Exception as e:
    # 打印错误信息，平台会自动捕获并标记节点失败
  print(f"节点执行失败: {e}")
    raise`
  );

  const onChange = useCallback((val, viewUpdate) => {
    console.log('val:', JSON.stringify(val));
    setValue(val);
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
        onValuesChange={(_, v: any) => {
          handleValueChange(v);
        }}
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
                minHeight="420px"
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
        className="wk-data-customize-panel-modal w-full py-[20px]"
        visible={visible}
        footer={null}
        closeIcon={null}
        afterOpen={() => {
          // 使用状态保存DOM引用
          const modalDom = document.querySelector(
            '.arco-modal-wrapper'
          ) as HTMLDivElement;
          setModalElement(modalDom);
          console.log(modalDom, 'aaaadddd');
        }}
      >
        <div className="editor-container">
          <div
            ref={stickyModalRef}
            className={`sticky top-[0px] z-10 flex h-[52px] items-center justify-between bg-white px-[12px] py-[10px] ${isModalSticky ? 'is-sticky' : ''}`}
          >
            <Button
              type="primary"
              onClick={handleCustomizeRun}
              icon={<IconCaretRight />}
            >
              测试运行
            </Button>
            <IconShrink
              className="full-screen-icon"
              onClick={() => setVisible(false)}
            />
          </div>
          <div className="mt-[2px] px-[12px]">
            <CodeMirror
              value={value}
              minHeight="calc(100vh - 90px)"
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
      </Modal>
    </div>
  );
};

export default React.memo(Panel);
