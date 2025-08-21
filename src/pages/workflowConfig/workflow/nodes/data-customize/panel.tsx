import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Collapse,
  Form,
  Message,
  Modal,
  Spin
} from '@arco-design/web-react';
import CodeMirror from '@uiw/react-codemirror';
import { tags as t } from '@lezer/highlight';
import { python } from '@codemirror/lang-python';
import { useStoreApi } from 'reactflow';
import useConfig from './use-config';
import {
  IconCaretRight,
  IconExpand,
  IconRecordStop,
  IconShrink
} from '@arco-design/web-react/icon';
import { createTheme } from '@uiw/codemirror-themes';
import { useRequest } from 'ahooks';
import {
  getScriptingType,
  getScriptingEngine,
  getScriptingTemplate,
  scriptingBench,
  scriptingBenchResult
} from '@/api/workflow';
import './panel.scss';
import { useParams } from '@/utils/url';
import Cookies from 'js-cookie';

const FormItem = Form.Item;

const Panel = ({ id, data, parentRef }) => {
  const store = useStoreApi();
  const [form] = Form.useForm();
  const CollapseItem = Collapse.Item;
  const workflow_uuid = useParams('workflow_uuid') as string;
  const { readOnly, inputs, handleValueChange } = useConfig(id, data);
  const [isSticky, setSticky] = useState(false);
  const [isModalSticky, setModalSticky] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runningTime, setRunningTime] = useState(0);
  const [resultData, setResultData] = useState('');
  const [scriptingType, setScriptingType] = useState('');
  const [scriptingEngine, setScriptingEngine] = useState('');
  const stickyRef = useRef<HTMLDivElement>(null);
  const stickyModalRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [modalElement, setModalElement] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState(inputs?.script_content);
  const [visible, setVisible] = useState(false);
  const [placeholderValue, setPlaceholderValue] = useState('');
  const [runningBenchId, setRunningBenchId] = useState('');

  useEffect(() => {
    const getScriptingInfo = async () => {
      const typeRes = await getScriptingType();
      if (typeRes.data.script_types) {
        setScriptingType(typeRes.data.script_types[0].script_type);
        const engineRes = await getScriptingEngine(
          typeRes.data.script_types[0].script_type
        );
        if (engineRes.data.engines) {
          setScriptingEngine(engineRes.data.engines[0].engine_id);
          handleValueChange({
            ...inputs,
            scripting_type: typeRes.data.script_types[0].script_type,
            engine_id: engineRes.data.engines[0].engine_id
          });
        }
      }
      const templateRes = await getScriptingTemplate(workflow_uuid, id);
      if (templateRes.data.script_template) {
        setPlaceholderValue(templateRes.data.script_template);
        if (value === '') {
          setValue(templateRes.data.script_template);
          handleValueChange({
            ...inputs,
            script_content: templateRes.data.script_template
          });
        }
      }
    };
    getScriptingInfo();
  }, []);

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

  const getRunningTime = async () => {
    if (!isRunning) return;

    try {
      setRunningTime((prev) => prev + 1);
      if (runningTime >= 5) {
        setIsRunning(false);
        setResultData('运行时间超过5秒');
        return;
      }
      const res = await runningResult();
      if (res?.data) {
        setIsRunning(false);
        setResultData('运行结果出现，运行时间为：' + runningTime + '秒');
        return;
      }
    } catch (error) {
      setIsRunning(false);
      setResultData('运行失败');
    }
  };

  const {
    data: runningTimeData,
    loading,
    run,
    cancel
  } = useRequest(getRunningTime, {
    pollingInterval: 1000,
    pollingWhenHidden: false
  });

  useEffect(() => {
    isRunning ? run() : cancel();
  }, [isRunning]);

  useEffect(() => {
    if (resultData && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [resultData]);

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
    styles: [
      { tag: t.comment, color: '#6a737d', fontStyle: 'italic' },
      { tag: t.keyword, color: '#9a42a7', fontWeight: 'bold' }
    ]
  });

  const handleCustomizeRun = async () => {
    const res = await runningStart();
    if (res.data && res.code === '') {
      setRunningBenchId(res.data.bench_job_id);
      setIsRunning(!isRunning);
      setRunningTime(0);
    } else {
      Message.error(res?.message ?? '运行失败');
    }
  };

  const runningStart = async () => {
    const { edges, getNodes } = store.getState();
    const nodes = getNodes();
    const session_id = Cookies.get('session_id') as string;
    const params = {
      graph: {
        edges,
        nodes
      },
      bench_node: {
        id: id,
        data: {
          type: data.type,
          script_content: JSON.stringify(value),
          script_type: scriptingType,
          engine_id: scriptingEngine
        }
      }
    };
    const res = await scriptingBench(workflow_uuid, session_id, id, params);

    return res;
  };

  const runningResult = async () => {
    const session_id = Cookies.get('session_id') as string;
    if (!runningBenchId) return;
    const res = await scriptingBenchResult(
      workflow_uuid,
      session_id,
      id,
      runningBenchId
    );

    return res;
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
          <div
            className={`editor-container ${isRunning ? 'bg-[#F8FAFD]' : 'bg-white'}`}
          >
            <div
              ref={stickyRef}
              className={`sticky top-[101px] z-10 flex h-[52px] items-center justify-between px-[12px] py-[10px] ${isSticky ? 'is-sticky' : ''}`}
            >
              <div className="flex items-center">
                <Button
                  type={isRunning ? 'outline' : 'primary'}
                  style={
                    isRunning
                      ? {
                          borderColor: '#007DFA',
                          color: '#007DFA'
                        }
                      : {}
                  }
                  onClick={handleCustomizeRun}
                  disabled={!value}
                  icon={isRunning ? <IconRecordStop /> : <IconCaretRight />}
                >
                  {isRunning ? '终止运行' : '测试运行'}
                </Button>
                {isRunning ? (
                  <div className="ml-[8px] flex items-center leading-[30px] text-[#6E7B8D]">
                    <span>运行中</span>
                    <Spin size={14} className="ml-[4px]" />
                    <span className="ml-[8px]">{runningTime}s</span>
                  </div>
                ) : null}
              </div>
              <IconExpand
                className={`full-screen-icon ${isRunning ? 'pointer-events-none' : ''}`}
                onClick={() => setVisible(true)}
              />
            </div>
            <div
              className={`mt-[2px] px-[12px] ${isRunning ? 'running-code-mirror' : ''}`}
            >
              <CodeMirror
                value={value}
                theme={myTheme}
                placeholder={placeholderValue}
                extensions={[python()]}
                onChange={onChange}
                readOnly={isRunning}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: false
                }}
              />
            </div>
          </div>
        </FormItem>
        {resultData && (
          <Collapse
            defaultActiveKey="running_result"
            style={{ maxWidth: 1180 }}
          >
            <CollapseItem
              header="运行结果"
              name="running_result"
              ref={resultRef}
            >
              {resultData}
            </CollapseItem>
          </Collapse>
        )}
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
            extensions={[python()]}
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
