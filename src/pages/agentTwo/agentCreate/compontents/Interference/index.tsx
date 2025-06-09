import { Switch } from '@arco-design/web-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
function Interference(props) {
  const [enabled, setenabled] = useState(false);
  const handleChangeChild = () => {};
  return (
    <div className="flex h-full w-full flex-col bg-white p-8">
      <div className="flex">
        <div>问答干预</div>
        <div>
          <Switch
            checked={enabled}
            onChange={() => handleChangeChild()}
            className="btn"
            checkedText="启用"
            uncheckedText="禁用"
          />
        </div>
      </div>
    </div>
  );
}
export default Interference;
