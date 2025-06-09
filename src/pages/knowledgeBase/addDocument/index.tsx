import { Button, Space, Steps } from '@arco-design/web-react';

import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import {
  detailKnowledge,
  fetchIndexingStatus,
  fetchProcessRule,
  uploadDocument
} from '@/api/knowledgeBase';
import BreadcrumbCom from '@/components/BreadcrumbCom';
import './index.css';
import { StepOne } from '../components/step-one';
import { StepTwo } from '../components/step-two';
import { StepThree } from '../components/step-three';
import { get } from 'lodash';
import { useQueryParams } from '@/utils';

function AddDocumentPage() {
  const queryParams = useQueryParams();
  const history = useHistory();
  const knowledgeId = queryParams.get('id');
  const [knowledgeDetail, setKnowledgeDetail] = React.useState<any>({});
  const [step, setStep] = React.useState(1);
  const [dataSource, setDataSource] = React.useState('local');
  const [fileList, setFileList] = React.useState([]);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [onlineList, setOnlineList] = React.useState([
    {
      url: '',
      update: ''
    }
  ]);
  const [segmentationMode, setSegmentationMode] = React.useState('automatic');
  const [documentsData, setDocumentsData] = React.useState<any>({});
  const [indexingStatusDetail, setIndexingStatusDetail] = React.useState([]);
  const [sourceData, setSourceData] = React.useState<any>({});
  const [isCompleted, setIsCompleted] = React.useState(false);
  const signal = React.useRef(new AbortController());

  const cRef = React.useRef<any>({});

  const breadcrumbList = [
    { name: 'AppForge' },
    { name: '个人空间' },
    { name: '知识库', href: '/tenant/compute/appforge/knowledgeBase' },
    {
      name: '文档',
      href: `/tenant/compute/appforge/knowledgeDetail?id=${knowledgeId}`
    }
  ];

  const queryDetail = async () => {
    try {
      const resp = await detailKnowledge(knowledgeId);
      setKnowledgeDetail(resp);
    } catch (err) {
      return;
    }
  };

  const handleNextClick = async () => {
    if (step === 1) {
      if (dataSource === 'local') {
        setStep((prev) => (prev += 1));
      } else {
        cRef.current.onStep();
      }
    }
    if (step === 2) {
      let rule = {};
      if (segmentationMode === 'custom') {
        rule = await cRef.current.onStep();
      } else {
        rule = { rules: {}, mode: 'automatic' };
      }
      try {
        const file_ids = fileList.map((item) => Number(item.response.id));
        const params = {
          data_source: {
            type: 'upload_file',
            info_list: {
              data_source_type: 'upload_file',
              file_info_list: {
                file_ids
              }
            }
          },
          // indexing_technique: 'economy',
          indexing_technique: 'high_quality',
          process_rule: rule,
          doc_form: 'text_model',
          doc_language: 'Chinese',
          retrieval_model: {
            search_method: 'semantic_search',
            reranking_enable: false,
            reranking_model: {},
            top_k: 3,
            score_threshold_enabled: false,
            score_threshold: 0.5
          }
        };
        const documentsData = await uploadDocument(knowledgeId, params);
        setDocumentsData(documentsData);
        setStep((prev) => (prev += 1));
      } catch (err) {}
    }
    if (step === 3) {
      history.push(
        `/tenant/compute/appforge/knowledgeDetail?id=${knowledgeDetail.id}`
      );
    }
  };

  const nextClickDisable = () => {
    if (step === 1) {
      if (dataSource === 'local') {
        return !uploadSuccess;
      } else {
        return false;
      }
    }
  };

  const handleCancel = () => {
    history.push(`/tenant/compute/appforge/knowledgeDetail?id=${knowledgeId}`);
  };

  React.useEffect(() => {
    const uploadSuccess = fileList.every((item) => item.status === 'done');
    setUploadSuccess(!!fileList.length && uploadSuccess);
  }, [fileList]);

  const getIndexingStatus = async (signal) => {
    try {
      const batch = get(documentsData, 'batch', null);
      const { data: indexingStatusDetail } = await fetchIndexingStatus(
        knowledgeId,
        batch,
        'indexing-status',
        signal
      );
      setIndexingStatusDetail(indexingStatusDetail);
    } catch (err) {
      return;
    }
  };

  const getProcessRule = async () => {
    try {
      const document_id = documentsData.documents[0].id;
      const params = { document_id: document_id };
      const sourceData = await fetchProcessRule('process-rule', params);
      setSourceData(sourceData);
    } catch (err) {
      return;
    }
  };

  React.useEffect(() => {
    const isCompleted =
      indexingStatusDetail.length &&
      indexingStatusDetail.every((indexingStatusDetail) =>
        ['completed', 'error'].includes(indexingStatusDetail.indexing_status)
      );
    setIsCompleted(isCompleted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexingStatusDetail]);

  React.useEffect(() => {
    if (step === 3) {
      const loopId = setInterval(() => {
        if (isCompleted) {
          clearInterval(loopId);
          return;
        }
        getIndexingStatus(signal.current);
      }, 2500);
      return () => clearInterval(loopId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isCompleted]);

  React.useEffect(() => {
    if (step === 3) {
      // getIndexingStatus();
      getProcessRule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  React.useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      signal.current.abort();
    };
  }, []);

  React.useEffect(() => {
    knowledgeId && queryDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgeId]);

  return (
    <div className="h-full pb-[20px] pr-[20px]">
      <BreadcrumbCom list={breadcrumbList} />
      <div className="h-full max-h-[calc(100vh-175px)] overflow-auto rounded-t-[12px] bg-white px-[24px] py-[20px]">
        <div className="mb-[20px] flex items-center justify-between">
          <div className="text-[18px] font-[500] leading-[32px] text-[var(--color-text-1)]">
            {get(knowledgeDetail, 'name', '--')}
          </div>
        </div>

        <Steps
          labelPlacement="vertical"
          current={step}
          className="mx-auto mb-[24px] max-w-[780px]"
        >
          <Steps.Step title="新增数据" />
          <Steps.Step title="文本分段与清洗" />
          <Steps.Step title="处理并完成" />
        </Steps>

        <div className="mx-[76px]">
          {step === 1 && (
            <StepOne
              cRef={cRef}
              knowledgeId={knowledgeId}
              dataSource={dataSource}
              setDataSource={setDataSource}
              fileList={fileList}
              setFileList={setFileList}
              onlineList={onlineList}
              setOnlineList={setOnlineList}
              setStep={setStep}
            />
          )}

          {step === 2 && (
            <StepTwo
              cRef={cRef}
              segmentationMode={segmentationMode}
              setSegmentationMode={setSegmentationMode}
            />
          )}
          {step === 3 && (
            <StepThree
              cRef={cRef}
              knowledgeDetail={knowledgeDetail}
              indexingStatusDetail={indexingStatusDetail}
              sourceData={sourceData}
              documents={documentsData.documents}
            />
          )}
        </div>
      </div>
      <div className="box-border h-[65px] w-full rounded-b-[12px] border-t border-[var(--color-border-2)] bg-white pl-[76px] leading-[64px]">
        <Space>
          {step < 3 && (
            <Button type="secondary" onClick={() => handleCancel()}>
              取消
            </Button>
          )}
          <Button
            type="primary"
            disabled={nextClickDisable()}
            onClick={() => handleNextClick()}
          >
            {step < 3 ? '下一步' : '前往知识库'}
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default observer(AddDocumentPage);
