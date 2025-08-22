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
    Divider,
} from '@arco-design/web-react';
import {
    IconArrowLeft,
    IconDelete,
    IconDragArrow,
} from '@arco-design/web-react/icon';
import { useParams } from '@/utils/url';
import { useHistory } from 'react-router';
import { ReactSortable } from 'react-sortablejs';
import {
    getTaskDetail,
} from '@/api/taskDetail';
import { useUserInfo } from '@/store/userInfoStore';
import { DataSourceModal } from '@/pages/requirement/detailModal';
import JobConfiguration from './job-configuration';
import ToolAnnotationConfig from './tool-annotation-config';
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

    const TabsStyle: React.CSSProperties = {
        textAlign: 'center',
        marginTop: 20,
    };
    const type = useParams('type');
    const taskId = useParams('id') as string;
    const history = useHistory();
    const userInfo = useUserInfo();
    const [selectedRadio, setSelectedRadio] = useState('');
    const [isShowErrorInfo, setIsShowErrorInfo] = useState(false);
    const [isShowDataErrorInfo, setIsShowDataErrorInfo] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

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
    // 2. 在detail.tsx中定义获取表格内容的方法
    const getJobTableContent = (content: Array<{ key: string, name: string, taskCount: number, type: 'dept' | 'person' }>) => {
        setJobTableContent(content);
        // 这里可以添加对表格内容的验证或其他处理
    };

    // 基础配置内容
    // 基础配置 - 表格
    // 添加移除数据函数
    const handleRemove = (id: number) => {
        setSelectedData(prevData => prevData.filter(item => item.id !== id));
    };
    const columns = [
        {
            title: '目录名称',
            dataIndex: 'file_name',
            ellipsis: true,
            width: 200,
            render: (_, record) => (
                // 产品需求：文件名提示常驻
                <Popover content={record.file_sub_path}>
                    <span>{record.file_name}</span>
                </Popover>
            )
        },
        {
            title: '载入开始时间',
            dataIndex: 'task_load_start_time',
            width: 180,
            sorter: true,

            // sortOrder: 'ascend',
            // sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
            sortDirections: ['ascend' as const, 'descend' as const],
            render: (_, record) => formatDateTime(record.task_load_start_time)
        },
        {
            title: '载入结束时间',
            dataIndex: 'task_load_end_time',
            width: 180,
            sorter: true,
            sortDirections: ['ascend' as const, 'descend' as const],
            render: (_, record) => formatDateTime(record.task_load_start_time)
        },
        {
            title: '数据量',
            dataIndex: 'data_size',
            ellipsis: true,
            width: 100
        },
        {
            title: '创建人',
            dataIndex: 'upload_user',
            ellipsis: true,
            width: 100
        },
        {
            title: '运行ID',
            dataIndex: 'task_id',
            width: 180,
        },
        {
            title: '操作',
            dataIndex: 'actions',
            fixed: 'right' as const,
            width: 88,
            render: (_, record) => {
                return (
                    <div onClick={() => handleRemove(record.id)} style={{ cursor: 'pointer', color: '#f5222d' }}>移除</div>
                )
            }
        }
    ];
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
        setSelectedData(data);
        setPublishData({ ...publishData, label_count: selectedData.length })
    };

    const basicConfiguration = () => {
        return (
            <div className='basic-configuration'>
                <Form
                    form={form}
                    disabled={type === 'detail'}
                    // initialValues={{ name: 'admin' }}
                    onValuesChange={(_, val) => {
                        setPublishData({ ...publishData, val })
                    }}
                    labelCol={{
                        span: 2
                    }}
                >
                    <FormItem label='需求名称' field='name' rules={[{ required: true, message: '请输入需求名称', max: 50 }]}>
                        <Input placeholder='请输入需求名称' style={{ width: 643 }} />
                    </FormItem>
                    <FormItem
                        label='描述'
                        field='description'
                        rules={[{ required: true, message: '请输入描述内容', max: 200 }]}
                    >
                        <Input placeholder='请输入描述内容' style={{ width: 643 }} />
                    </FormItem>
                    <FormItem
                        label="标注工具"
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
                                <Typography.Paragraph style={TabsStyle}>{annotationData()}</Typography.Paragraph>
                            </TabPane>
                            <TabPane disabled={type === 'detail'} key={2} title='文本'>
                                <Typography.Paragraph style={TabsStyle}>{annotationTextTool()}</Typography.Paragraph>
                            </TabPane>
                            <TabPane disabled={type === 'detail'} key={3} title='音频'>
                                <Typography.Paragraph style={TabsStyle}>{
                                    annotationTextTool()
                                }</Typography.Paragraph>
                            </TabPane>
                            <TabPane disabled={type === 'detail'} key={4} title='视频'>
                                <Typography.Paragraph style={TabsStyle}>{
                                    annotationTextTool()
                                }</Typography.Paragraph>
                            </TabPane>
                        </Tabs>
                    </FormItem>
                    <FormItem
                        field="dataset"
                        label="数据集"
                        required
                        extra={`已选数据量：${selectedData.length}`}>
                        <Button type='primary' onClick={() => { setModalVisible(true) }}>选择</Button>
                        {selectedData?.length <= 0 && isShowDataErrorInfo && <div className='data-error-info error-info-text'>请选择数据集合</div>}
                    </FormItem>
                    <div className='table-container'>
                        <Table
                            style={{
                                maxWidth: 1000,
                                marginTop: 20,
                            }}
                            rowKey='id'
                            columns={columns}
                            data={selectedData}
                        />
                    </div>
                </Form>
                <DataSourceModal
                    visible={modalVisible}
                    onClose={() => { setModalVisible(false) }}
                    title='数据集合'
                    getChildTableSelectData={handleChildData}
                />
            </div>
        )
    }

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
        console.log(id, '----------', propertyOptions);
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
    const toolAnnotationConfig = () => {
        const options = ['矩形', '多边形', '线段', '特征点'];
        // 图形标签内容
        return (
            <div className='tool-annotation-config'>
                <div className='tool-title-text'>图形标注配置</div>
                <Form
                    form={form}
                    disabled={type === 'detail'}
                    onValuesChange={(_, val) => {
                        setPublishData({ ...publishData, val })
                    }}
                    labelCol={{
                        span: 2
                    }}
                >
                    <FormItem
                        label='图形标签'
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
                                            {options.map((option, index) => (
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
                                <div className='label-content'>
                                    <div className='label-header-content'>
                                        <span className='label-header-name'>属性组名称:</span>
                                        <Input className='label-input' style={{ width: 100, marginRight: 10 }} />
                                        {
                                            title_type == 1 || title_type === 2 ? (
                                                <div>
                                                    <Select defaultValue={1} style={{ width: 100, marginRight: 10 }}>
                                                        <Option value={1}>单选</Option>
                                                        <Option value={2}>多选</Option>
                                                    </Select>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Select disabled defaultValue={1} style={{ width: 100, marginRight: 10 }}>
                                                        <Option value={1}>输入框</Option>
                                                    </Select>
                                                </div>
                                            )
                                        }
                                        <Select defaultValue={1} style={{ width: 100, marginRight: 10 }}>
                                            <Option value={1}>必选</Option>
                                            <Option value={2}>非必选</Option>
                                        </Select>

                                    </div>
                                    <div className='label-content-options'>
                                        <div className='options-title'>
                                            属性选项
                                        </div>
                                        {title_type == 1 || title_type === 2 ? <div className='options-content'>
                                            <ReactSortable
                                                className='sortable-list-item'
                                                list={propertyOptions} // 要排序的数组
                                                setList={setPropertyOptions} // 更新数组的函数
                                            >
                                                {propertyOptions.map((item, index) => (
                                                    <div className='sortable-item' key={index}>
                                                        <IconDragArrow fontSize={20} />
                                                        <Select
                                                            placeholder='请选择类型'
                                                            style={{ width: 154 }}
                                                            value={item.type}
                                                            onChange={(value: any) => {
                                                                handleLabelChange(item.id, 'type', value)
                                                            }
                                                            }
                                                        >
                                                            {typeOption.map((option, index) => (
                                                                <Option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                        <Input
                                                            onChange={(val: any) => {
                                                                console.log(val, '========123');
                                                                handleLabelChange(item.id, 'annotation_name', val)
                                                            }}
                                                            className='sortable-item-input'
                                                            style={{ marginLeft: '10px' }}
                                                            placeholder='请输入标注展示名称'
                                                            value={item.annotation_name}
                                                        />
                                                        <Input
                                                            onChange={(val: any) => {
                                                                console.log(val, '========5555');
                                                                handleLabelChange(item.id, 'result_val_name', val)
                                                            }}
                                                            className='sortable-item-input'
                                                            placeholder='请输入结果存储名称'
                                                            value={item.result_val_name}
                                                        />
                                                        {propertyOptions.length > 1 && <IconDelete fontSize={20}
                                                            onClick={() => {
                                                                setPropertyOptions(propertyOptions.filter((j: any) => j.id !== item.id))
                                                            }} />}
                                                    </div>
                                                ))}
                                            </ReactSortable>
                                            <Button type='primary' onClick={() => {
                                                setPropertyOptions([...propertyOptions, {
                                                    id: uuid() + `${Math.random() * 100} + ${content_id}`,
                                                    type: '', // 类型
                                                    annotation_name: '', // 标注展现名称
                                                    result_val_name: '', // 结果存储名称
                                                }])
                                            }}>添加</Button>
                                        </div> : null}
                                        <FormItem label='应用标签' field='applyTags' required>
                                            <RadioGroup style={{ marginBottom: 20 }} defaultValue={1}>
                                                <Radio value={1}>全部图形标签</Radio>
                                                <Radio value={2}>部分图形标签</Radio>
                                            </RadioGroup>
                                        </FormItem>
                                        {
                                            applyTags === 2 && <>
                                                <FormItem label='制定标签' required>
                                                    <div className='define-tags'>
                                                        <div className='def-tags-item' onClick={() => { selectAll() }}>全选</div>
                                                        <div className='def-tags-item' onClick={() => { unSelectAll() }}>取消全选</div>
                                                    </div>
                                                </FormItem>
                                                <FormItem required>
                                                    <CheckboxGroup value={selected} options={options} onChange={setSelected} />
                                                </FormItem>
                                            </>
                                        }
                                    </div>
                                </div>
                            </div>
                        ))}
                    </FormItem>
                    <FormItem label='图片外标注'>
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
        )
    }
    // 作业配置功能
    const jobConfiguration = () => {
        return (
            <div>
                1
            </div>
        )
    }
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
                                新建标注需求
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
                <div>
                    <Button
                        type='secondary'
                        onClick={() => { history.goBack() }}
                        style={{ paddingLeft: 8 }}
                    >
                        取消
                    </Button>
                    <Button
                        // 修改：添加发布按钮禁用状态
                        disabled={stepCurrent >= 3 && jobTableContent.length <= 0}
                        onClick={() => { stepNext() }}
                        style={{ marginLeft: 20, paddingRight: 8 }}
                        type='primary'
                    >
                        {stepCurrent >= 3 ? '发布' : '下一步'}
                    </Button>

                </div>
            </div>
            <div className='detail-content'>
                <Steps type='arrow' current={stepCurrent} style={{ maxWidth: 780 }}>
                    <Step onClick={() => { setStepCurrent(1) }} title='1、基础配置' />
                    <Step onClick={() => { setStepCurrent(2) }} title='2、工具配置' />
                    <Step onClick={() => { setStepCurrent(3) }} title='3、作业配置' />
                </Steps>
                {/* 基础配置部分 */}
                {
                    stepCurrent === 1 && basicConfiguration()
                }
                {/* 工具配置部分 */}
                {
                    stepCurrent === 2 && toolAnnotationConfig()
                }
                {/* 作业配置部分 */}
                {
                    stepCurrent === 3 && <JobConfiguration getJobTableContent={getJobTableContent} />
                }
            </div>
        </div>
    );
}