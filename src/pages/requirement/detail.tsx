import React, { useEffect, useRef, useState } from 'react';
import {
    Breadcrumb,
    Button,
    Form,
    Input,
    Popover,
    Radio,
    Steps,
    Table,
    Tabs,
    Notification,
    Typography,
    Select,
    Message,
    Modal,
    Switch,
    Checkbox,
    Tooltip,
} from '@arco-design/web-react';
import {
    IconArrowLeft,
    IconDelete,
    IconDragArrow,
    IconQuestionCircle,
} from '@arco-design/web-react/icon';
import { useParams } from '@/utils/url';
import { useHistory } from 'react-router';
import { ReactSortable } from 'react-sortablejs';
import {
    getTaskDetail,
} from '@/api/taskDetail';
import { useUserInfo } from '@/store/userInfoStore';
import { DataSourceModal } from '@/pages/requirement/detailModal';
import { formatDateTime } from './common';
import { uuid } from '@/models/utils';
import './detail.scss';
import { set } from 'lodash';
import useWatch from '@arco-design/web-react/es/Form/hooks/useWatch';
import item from '@/components/chat-with-history/sidebar/item';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;


export default function RequirementDetail() {
    const Step = Steps.Step;
    const [form] = Form.useForm();
    const FormItem = Form.Item;
    const TabPane = Tabs.TabPane;
    const RadioGroup = Radio.Group;
    const Option = Select.Option;
    const TextArea = Input.TextArea;

    const TabsStyle: React.CSSProperties = {
        textAlign: 'center',
    };
    const type = useParams('type');
    const taskId = useParams('id') as string;
    const history = useHistory();
    const userInfo = useUserInfo();
    const [selectedRadio, setSelectedRadio] = useState('');
    const [isShowErrorInfo, setIsShowErrorInfo] = useState(false);
    const [isShowDataErrorInfo, setIsShowDataErrorInfo] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    // 类型定义
    const [taskTypeVal, setTaskTypeVal] = useState(1);
    // 发布数据集合
    const [publishData, setPublishData] = useState<any>({});

    const [jobTableContent, setJobTableContent]: any = useState([]);
    // 初始化当前步骤位置
    const [stepCurrent, setStepCurrent] = useState(2);
    // 数据集 - 选中数据内容
    const [selectedData, setSelectedData]: any = useState([]);
    // 添加loading状态控制
    const [loading, setLoading] = useState(false);
    // 初始化分页数据
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 100
    });
    // 初始化筛选的值
    const [sortValue, setSortValue] = useState({
        status: '',
        file_type: '',
        sort: '',
        sort_by: ''
    });
    const workflowUuid = useParams('workflow_uuid');
    const workflowVersion = useParams('workflow_version');
    const workflowId = useParams('ds_workflow_id');
    let intervalDetailData: string | number | NodeJS.Timeout | undefined;

    useEffect(() => {
        if (selectedRadio !== '') {
            setIsShowErrorInfo(false);
        }
        if (selectedData?.length > 0) {
            setIsShowDataErrorInfo(false);
        }
    }, [selectedRadio, selectedData])
    // 基础配置
    const stepNext = () => {
        // 新增：当type为detail时直接跳转查看详情，跳过验证
        if (type === 'detail') {
            setStepCurrent(stepCurrent + 1);
            return;
        }

        console.log(publishData, 'push');
        form.validate()
            .then(() => {
                // 验证通过，切换到下一步
                if (selectedData?.length <= 0) {
                    setIsShowDataErrorInfo(true);
                    return;
                }
                if (selectedRadio === '') {
                    setIsShowErrorInfo(true);
                    return;
                }

                // 新增：发布前检查作业表格内容
                if (stepCurrent >= 3 && jobTableContent.length <= 0) {
                    return '请先添加作业配置内容';
                }
                console.log(stepCurrent, '=====', '123');

                // setStepCurrent(StepCurrent + 1);
            })
            .catch((errorInfo) => {
                if (selectedData?.length <= 0) {
                    setIsShowDataErrorInfo(true)
                }
                if (selectedRadio === '') {
                    setIsShowErrorInfo(true);
                    return;
                }
                if (stepCurrent >= 3 && jobTableContent.length <= 0) {
                    return '请先添加作业配置内容';
                }
            }).finally(() => {
                if (stepCurrent === 3) {
                    Notification.success({
                        title: '确认发布吗？',
                        content: '确认发布后，数据集将不可编辑',
                    })
                }
            });
    }

    // 标注工具映射
    const toolRadioName = {
        1: '图片标注'
    }
    // 标注数据内容
    const annotationData = () => {
        return (
            <RadioGroup
                className='annotation-radio-group'
                {...form.getFieldValue('annotationTool')}
                disabled={type === 'detail'}
                value={selectedRadio}
                onChange={(v) => {
                    setSelectedRadio(v),
                        setPublishData({
                            ...publishData,
                            label_tool_name: toolRadioName?.[v],
                            label_tool_code: v,
                        })
                }} style={{ marginBottom: 20 }}>
                <Radio
                    className="annotation-radio"
                    value={1}
                    key={1}>
                    <div className='annotation-title'>图片标注</div>
                </Radio>
                {/* <Radio
                    className="annotation-radio"
                    value={2}
                    key={2}>
                    <div className='annotation-title'>图片排序</div>
                </Radio>
                <Radio
                    className="annotation-radio"
                    value={3}
                    key={3}>
                    <div className='annotation-title'>多图审核</div>
                </Radio>
                <Radio
                    className="annotation-radio"
                    value={4}
                    key={4}>
                    <div className='annotation-title'>主副图匹配</div>
                </Radio> */}
            </RadioGroup>
        )
    }
    // 标注工具-文本内容
    const annotationTextTool = () => {
        return (
            <div>
                暂时不支持
            </div>
            // <div className='annotation-text-tool'>
            //     <RadioGroup value={selectedRadio} onChange={(v) => { setSelectedRadio(v) }} style={{ marginBottom: 20 }}>
            //         <Radio className="annotation-radio" value={1} key={1}>文本标注</Radio>
            //     </RadioGroup>
            // </div>
        )
    }
    const handleChildData = (data: any) => {
        console.log(Array.from(new Set(data)), '=====');
        setSelectedData(data);
        setPublishData({ ...publishData, label_count: selectedData.length })
    };

    // 工具配置功能
    const [picObj, setPicObj]: any = useState([{
        id: uuid(),
        name: '',
        result_name: '',
        shape: '',
        color: '#000000',
    }]);
    // 更新输入框值
    const handleInputChange = (id, field, value) => {
        setPicObj(picObj.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };
    // 属性标签内容
    const [propertyOptions, setPropertyOptions]: any = useState([{
        id: uuid(),
        type: '', // 类型
        annotation_name: '', // 标注展现名称
        result_val_name: '', // 结果存储名称
    }]);
    const typeOption = [
        { label: '选项', value: '选项' },
        { label: '多选', value: '多选' },
        { label: '单选', value: '单选' },
        { label: '输入框', value: '输入框' },
    ];
    const handleLabelChange = (id, field, value) => {
        setPropertyOptions(propertyOptions.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };
    const CheckboxGroup = Checkbox.Group;
    const useCheckbox = Checkbox.useCheckbox;
    const options = [...Array(6)].map((_, i) => ({
        label: `Option ${i}`,
        value: i,
    }));
    const {
        selected,
        selectAll,
        setSelected,
        unSelectAll,
    } = useCheckbox(
        options.map((x) => x.value),
        [1, 2]
    );
    const applyTags = useWatch('applyTags', form);
    const labelAttributes = (content_id: any, title_type: number) => {
        console.log(content_id, '=====');
        return (
            <div>1</div>
        );
    };
    const [labelTagsContent, setLabelTagsContent] = useState([
        {
            id: uuid() + `${Math.random() * 10}`,
            type: 1,
        }
    ])

    const addLabelContent = (num) => {
        console.log(labelTagsContent, '=======', num);
        setLabelTagsContent([...labelTagsContent, {
            id: uuid() + `${Math.random() * 10} + ${num}`,
            type: num,
        }])
    }
    const shapeOptions = ['矩形', '多边形', '线段', '特征点'];

    return (
        <div className='requirement-detail'>
            <div className="head-breadcrumb-box">
                {type === 'create' ? (
                    <div>
                        <Breadcrumb style={{ fontSize: 20, marginLeft: '21px' }}>
                            <BreadcrumbItem
                                onClick={() =>
                                    history.goBack()
                                }
                                className={'breadcrumb-text'}
                            >
                                创建需求
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </div>
                ) : (<div>
                    <IconArrowLeft
                        style={{ cursor: 'pointer', fontSize: '14px' }}
                        onClick={() => history.goBack()}
                    />
                    <Breadcrumb style={{ fontSize: 20, marginLeft: '21px' }}>
                        <BreadcrumbItem
                            onClick={() =>
                                history.goBack()
                            }
                            className={'breadcrumb-text'}
                        >
                            标注详情
                        </BreadcrumbItem>
                        <BreadcrumbItem>{taskId}</BreadcrumbItem>
                    </Breadcrumb>
                </div>)}

            </div>
            <div className='detail-content'>
                {/* 基础配置部分 */}
                <div className='basic-configuration'>
                    <div className='basic-title'>基础信息</div>
                    <Form
                        form={form}
                        disabled={type === 'detail'}
                        // initialValues={{ name: 'admin' }}
                        onValuesChange={(_, val) => {
                            setPublishData({ ...publishData, val })
                        }}
                        labelCol={{
                            span: 1
                        }}
                    >
                        <FormItem label='需求名称' field='name' rules={[{ required: true, message: '请输入需求名称', max: 50 }]}>
                            <Input placeholder='请输入需求名称' style={{ width: 643 }} />
                        </FormItem>
                        <FormItem
                            label='描述说明'
                            field='description'
                            rules={[{ required: true, message: '请输入描述内容', max: 200 }]}
                        >
                            <TextArea placeholder='请输入描述内容' style={{ width: 643 }} />
                        </FormItem>
                        <div className='basic-title'>任务配置</div>
                        <FormItem
                            label="标注类型"
                            required
                            className="annotation-tool"
                            field='label_type'
                        >
                            {isShowErrorInfo && <span className='error-info-text'>请选择标注工具</span>}
                            <Tabs type={'capsule'}
                                style={{
                                    overflow: 'unset'
                                }}
                                className="basic-tabs"
                                onChange={(val) => { setPublishData({ ...publishData, label_type: val }), setSelectedRadio('') }}
                            >
                                <TabPane disabled={type === 'detail'} key={1} title='图片'>
                                    <Typography.Paragraph>{annotationData()}</Typography.Paragraph>
                                </TabPane>
                                <TabPane disabled={type === 'detail'} key={2} title='文本'>
                                    <Typography.Paragraph>{annotationTextTool()}</Typography.Paragraph>
                                </TabPane>
                                <TabPane disabled={type === 'detail'} key={3} title='音频'>
                                    <Typography.Paragraph>{
                                        annotationTextTool()
                                    }</Typography.Paragraph>
                                </TabPane>
                                <TabPane disabled={type === 'detail'} key={4} title='视频'>
                                    <Typography.Paragraph>{
                                        annotationTextTool()
                                    }</Typography.Paragraph>
                                </TabPane>
                            </Tabs>
                        </FormItem>
                        <FormItem
                            field="dataset"
                            label="标注数据"
                            required
                        >
                            <div className='data-content-set'>
                                <Button type='primary' onClick={() => { setModalVisible(true) }}>选择</Button>
                                <div className='data-set-text'>已选数据量：{selectedData.length}</div>
                            </div>
                            {selectedData?.length <= 0 && isShowDataErrorInfo && <div className='data-error-info error-info-text'>请选择数据集合</div>}
                        </FormItem>
                    </Form>
                    <DataSourceModal
                        visible={modalVisible}
                        onClose={() => { setModalVisible(false) }}
                        title='数据集合'
                        getChildTableSelectData={handleChildData}
                    />
                </div>
                {/* 工具配置部分 */}
                <div className='tool-annotation-config'>
                    <div className='basic-title'>标签配置</div>
                    <Form
                        form={form}
                        disabled={type === 'detail'}
                        onValuesChange={(_, val) => {
                            setPublishData({ ...publishData, val })
                        }}
                        labelCol={{
                            span: 1
                        }}
                    >
                        <FormItem
                            label='标签和属性'
                            extra="标注员选择标签后，进行图形标注"
                            rules={[{ required: true, message: '请输入需求名称', max: 50 }]}>
                            <div className='label-container-title'>
                                <div className='label-container-title-text' style={{ marginLeft: 30 }}>标注展示名称</div>
                                <div className='label-container-title-text' style={{ marginLeft: 80 }} >结果存储名称</div>
                                <div className='label-container-title-text' style={{ marginLeft: 80 }}>形状</div>
                                <div className='label-container-title-text' style={{ marginLeft: 130 }}>颜色</div>
                            </div>
                            {/* 循环显示内容 */}
                            <div>
                                <ReactSortable
                                    list={picObj} // 要排序的数组
                                    setList={setPicObj} // 更新数组的函数
                                >
                                    {picObj.map((item, index) => (
                                        <div className='sortable-item' key={index}>
                                            <IconDragArrow fontSize={20} />
                                            <Input
                                                onChange={(e: any) => {
                                                    handleInputChange(item.id, 'name', e)
                                                }}
                                                className='sortable-item-input'
                                                style={{ marginLeft: '10px' }}
                                                placeholder='请输入标注展示名称'
                                                value={item.name}
                                            />
                                            <Input
                                                onChange={(e: any) => {
                                                    handleInputChange(item.id, 'result_name', e)
                                                }}
                                                className='sortable-item-input'
                                                placeholder='请输入结果存储名称'
                                                value={item.result_name}
                                            />
                                            <Select
                                                placeholder='请选择形状'
                                                style={{ width: 154 }}
                                                value={item.shape}
                                                onChange={(value: any) => {
                                                    handleInputChange(item.id, 'shape', value)
                                                }
                                                }
                                            >
                                                {shapeOptions.map((option, index) => (
                                                    <Option key={option} value={option}>
                                                        {option}
                                                    </Option>
                                                ))}
                                            </Select>
                                            <input
                                                type="color"
                                                value={item.color}
                                                onChange={(e) => { handleInputChange(item.id, 'color', e.target.value) }}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    marginLeft: '10px'
                                                }}
                                            />
                                            {picObj.length > 1 && <IconDelete fontSize={20} onClick={() => {
                                                setPicObj(picObj.filter((j: any) => j.id !== item.id))
                                            }} />}
                                        </div>
                                    ))}
                                </ReactSortable>

                            </div>
                            <Button
                                type='primary'
                                onClick={() => {
                                    // 点击添加标签增加一行录入项
                                    setPicObj([...picObj, {
                                        id: uuid(),
                                        name: '',
                                        result_name: '',
                                        shape: '',
                                        color: '#000'
                                    }])
                                }}>
                                添加标签
                            </Button>
                        </FormItem>
                        <FormItem label="标签属性">
                            {/* 标签属性按钮增加一整个 labelAttributes 模块 */}
                            <div className='label-attribute-container'>
                                <Button onClick={() => { addLabelContent(1) }}>单选</Button>
                                <Button onClick={() => { addLabelContent(2) }}>多选</Button>
                                <Button onClick={() => { addLabelContent(3) }}>输入框</Button>
                            </div>
                            {labelTagsContent.map((item, index) => (
                                <div key={index} className="label-attribute-item">
                                    {labelAttributes(item, item.type)}
                                </div>
                            ))}
                        </FormItem>
                        <FormItem label={<div>图片外标注 <Tooltip content='可以在图片范围外侧标注'><IconQuestionCircle /></Tooltip>  </div>}>
                            <Switch onChange={(val) => {
                                // 图片外标注 1 是 0 否
                                setPublishData({ ...publishData, image_out_of_bounds: val ? 1 : 0 })
                            }} />
                        </FormItem>
                    </Form>
                    {/* <Modal
                    title='标签添加'
                    visible={toolAnnotationVisible}
                    onOk={() => setToolAnnotationVisible(false)}
                    onCancel={() => setToolAnnotationVisible(false)}
                    autoFocus={false}
                    focusLock={true}
                >
                    <div>

                    </div>
                </Modal> */}
                </div>
                {/* 任务分配功能 */}
                <div className='task-configuration-content'>
                    <div className='basic-title'>任务分配</div>
                    <Form
                        form={form}
                        disabled={type === 'detail'}
                        onValuesChange={(_, val) => {
                            setPublishData({ ...publishData, val })
                        }}
                        labelCol={{
                            span: 1
                        }}
                    >
                        <FormItem label='选择类型:' required>
                            <RadioGroup defaultValue={1} onChange={(val) => { setTaskTypeVal(val) }}>
                                <Radio value={1}>部门</Radio>
                                <Radio value={2}>个人</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem rules={[
                            {
                                required: true,
                                message: '请选择类型'
                            },

                        ]} label={taskTypeVal === 1 ? '选择部门' : '选择个人'}>
                            <Button onClick={() => { console.log(123) }}>选择</Button>
                            <div>已选：{1}</div>
                        </FormItem>
                    </Form>
                </div>
                <div className='btn-content'>
                    <Button
                        // 修改：添加发布按钮禁用状态
                        disabled={stepCurrent >= 3 && jobTableContent.length <= 0}
                        onClick={() => { stepNext() }}
                        style={{ marginRight: 8 }}
                        type='primary'
                    >
                        确认
                    </Button>
                    <Button
                        type='secondary'
                        onClick={() => { history.goBack() }}
                    >
                        取消
                    </Button>
                </div>
            </div>
        </div>
    );
}