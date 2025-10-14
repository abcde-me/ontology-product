import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import './index.less';
import { Message, Modal } from '@arco-design/web-react';
import FromTable from '../FromTable';
import { postdocumentList } from '@/api/datasetsV2';

const TableStructureModel = (
  { filedetail, detailsdata, funChildStructure },
  ref
) => {
  const [structureVisible, setstructureVisible] = useState(false);
  const [tabeldata, settabeldata] = useState<any>([]);
  const FromTableRef: any = useRef();
  useImperativeHandle(ref, () => ({
    openModel: () => {
      // openModel(item, type);
      setstructureVisible(true);
    }
  }));
  // 回调函数，接收子组件传来的数据
  const onDataChange = (newData) => {
    settabeldata(newData); // 更新父组件的状态
  };
  const isDuplicate = (array, field) => {
    const seen = new Set();
    return array.some((item) => {
      const value = item[field];
      if (seen.has(value)) {
        return true; // 如果已经出现过该值，返回 true，表示重复
      }
      seen.add(value);
      return false;
    });
  };
  const structuresubmit = async () => {
    const result = isDuplicate(tabeldata.columns, 'column_name');
    const trueCount = tabeldata.columns.filter(
      (item) => item.is_semantic === true
    ).length;
    // 验证是否符合要求

    if (!result) {
      const columnname = tabeldata.columns.filter(
        (item) => item.column_name === ''
      ).length;
      if (columnname >= 1) {
        Message.error('列名不能为空');
        return Promise.reject(new Error('请填写完整的表结构配置'));
      }
      if (trueCount >= 1 && trueCount <= 50) {
        funChildStructure(tabeldata);
        setstructureVisible(false);
      } else {
        Message.error('最少打开1项索引列！');
        return Promise.reject(new Error('请填写完整的表结构配置'));
      }
    } else {
      Message.error('检测到重复列名，请修改为唯一列名。');
    }
  };
  const structureclear = () => {
    FromTableRef.current.closeModel();
    setstructureVisible(false);
  };
  return (
    <div className="TableStructureModel">
      <Modal
        title={'表结构配置'}
        visible={structureVisible}
        onOk={() => structuresubmit()}
        onCancel={() => structureclear()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: '70%'
        }}
      >
        <FromTable
          ref={FromTableRef}
          onDataChange={onDataChange}
          filedetail={filedetail}
          type={'edit'}
        ></FromTable>
      </Modal>
    </div>
  );
};
export default forwardRef(TableStructureModel);
