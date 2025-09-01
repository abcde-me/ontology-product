import React from 'react';
import { Modal } from '@arco-design/web-react';
import CodeMirror from '@uiw/react-codemirror';
import { SqlIndexStore, useSqlIndexStore } from '../store';

const defaultCodeValue = `import pandas as pd
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
    'sales': np.random.normal(loc=200, scale=30, size=30).astype(int)`;

/** 数据库详情 弹框 */
const ModalScriptDetail = () => {
  const scriptDetailVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.scriptDetailVisible
  );

  const closeScriptDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeScriptDetail
  );

  const codeValue = defaultCodeValue;

  return (
    <Modal
      title="SQL脚本详情"
      style={{ width: 960 }}
      visible={scriptDetailVisible}
      footer={null}
      onCancel={closeScriptDetail}
    >
      <div className="pb-[16px]">
        <CodeMirror value={codeValue} editable={false} height="500px" />
      </div>
    </Modal>
  );
};

export default ModalScriptDetail;
