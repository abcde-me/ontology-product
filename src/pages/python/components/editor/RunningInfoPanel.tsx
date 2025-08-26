import React, { useState } from 'react';
import { Collapse, Tabs, Typography } from '@arco-design/web-react';
import { IconDown, IconUp } from '@arco-design/web-react/icon';
import './RunningInfoPanel.scss';

const { Item: CollapseItem } = Collapse;
const { TabPane } = Tabs;
const { Text } = Typography;

interface RunningInfoPanelProps {
  runResult: string;
  runLog: string;
}

const RunningInfoPanel: React.FC<RunningInfoPanelProps> = ({
  runResult,
  runLog
}) => {
  const [activeKey, setActiveKey] = useState<string>('result');
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePanelChange = (key: string, keys: string[]) => {
    setIsExpanded(keys.length > 0);
  };

  return (
    <div className="running-info-panel">
      <Collapse
        activeKey={isExpanded ? ['1'] : []}
        onChange={handlePanelChange}
        expandIconPosition="left"
        expandIcon={isExpanded ? <IconDown /> : <IconUp />}
        style={{
          border: 'none'
        }}
      >
        <CollapseItem
          header={
            <div className="panel-header">
              <Text style={{ fontSize: '14px', fontWeight: 500 }}>
                运行信息
              </Text>
            </div>
          }
          name="1"
        >
          <div className="panel-content">
            <Tabs
              defaultActiveTab={activeKey}
              onChange={setActiveKey}
              style={{
                backgroundColor: '#F8FAFD'
              }}
            >
              <TabPane key="result" title="结果">
                <div className="run-result-content">{runResult}</div>
              </TabPane>

              <TabPane key="log" title="日志">
                <div className="runlog-content">{runLog}</div>
              </TabPane>
            </Tabs>
          </div>
        </CollapseItem>
      </Collapse>
    </div>
  );
};

export default RunningInfoPanel;
