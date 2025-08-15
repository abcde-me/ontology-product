import React, { useEffect, useState } from 'react';
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
    Typography,
} from '@arco-design/web-react';
import {
    IconArrowLeft,
} from '@arco-design/web-react/icon';
import { useParams } from '@/utils/url';
import { useHistory } from 'react-router';
import {
    getTaskDetail,
} from '@/api/taskDetail';
import { useUserInfo } from '@/store/userInfoStore';
import Mock from 'mockjs';
import { DataSourceModal } from '@/pages/requirement/detailModal';
import JobConfiguration from './job-configuration'
import './detail.scss';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;


export default function RequirementDetail() {
    const Step = Steps.Step;
    const [form] = Form.useForm();
    const FormItem = Form.Item;
    const TabPane = Tabs.TabPane;
    const RadioGroup = Radio.Group;
    const TabsStyle: React.CSSProperties = {
        textAlign: 'center',
        marginTop: 20,
    };
    const type = useParams('type');
    const taskId = useParams('id');
    const history = useHistory();
    const userInfo = useUserInfo();
    const [selectedRadio, setSelectedRadio] = useState('');
    const [isShowErrorInfo, setIsShowErrorInfo] = useState(false);
    const [isShowDataErrorInfo, setIsShowDataErrorInfo] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    // 初始化当前步骤位置
    const [StepCurrent, setStepCurrent] = useState(1);
    // 数据集 - 选中数据内容
    const [selectedData, setSelectedData]: any = useState([]);
    // 初始化详情数据
    const [taskDetailData, setTaskDetailData] = useState<any>({});
    // 初始化当前选中的节点类型
    const [activeNodeType, setActiveNodeType] = useState('');
    // 初始化是否切换了tab
    const [isChangeTab, setIsChangeTab] = useState(false);

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

    // 获取详情数据
    const getDetailData = () => { };

    // 标注数据内容
    const annotationData = () => {
        const testData = Mock.mock({
            'list|15': [
                {
                    'id|+1': 1, // 自增 ID
                    'title': '@ctitle(5,18)', // 随机中文姓名
                    'age|18-60': 1, // 18-60 之间的随机年龄
                    'phone': /^1[3-9]\d{9}$/, // 随机手机号
                    'address': '@county(true)', // 随机地址
                    'joinTime': '@date("yyyy-MM-dd")', // 随机日期
                    'img': '@image(200x100, #50B347, #FFF, Mock.js)',
                    'isActive|1': [true, false] // 随机布尔值
                }
            ],
            total: function () {
                return this.list.length; // 总条数
            }
        });
        return (
            <RadioGroup
                className='annotation-radio-group'
                {...form.getFieldValue('annotationTool')}
                value={selectedRadio} onChange={(v) => { setSelectedRadio(v) }} style={{ marginBottom: 20 }}>
                {testData?.list.map((item) => {
                    return (
                        <Radio
                            style={{ marginTop: '5px' }}
                            className="annotation-radio"
                            value={item.id}
                            key={item.id}>
                            <div className='annotation-title'>{item.title}</div>
                            <div className='annotation-content'>
                                <img
                                    className='content-img'
                                    src={item.img}
                                    alt=""
                                    style={{ width: '100px', height: '100px' }}
                                />
                            </div>
                        </Radio>
                    )
                })}
            </RadioGroup>
        )
    }
    // 标注工具-文本内容
    const annotationTextTool = () => {
        return (
            <div className='annotation-text-tool'>
                <RadioGroup value={selectedRadio} onChange={(v) => { setSelectedRadio(v) }} style={{ marginBottom: 20 }}>
                    <Radio>文本标注</Radio>
                </RadioGroup>
            </div>
        )
    }
    const name = Form.useWatch('name', form);
    const info = Form.useWatch('info', form);
    const annotationScene = Form.useWatch('annotationScene', form);
    const a = Form.useWatch('a', form);
    const handleChildData = (data: any) => {
        console.log('object', data);
        setSelectedData(data);
    };
    //格式化时间函数
    const formatDateTime = (dateTimeString: string): string => {
        try {
            const date = new Date(dateTimeString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
            return dateTimeString; // 如果格式化失败，返回原字符串
        }
    };
    // 添加移除数据函数
    const handleRemove = (id: number) => {
        setSelectedData(prevData => prevData.filter(item => item.id !== id));
    };

    // table -- 
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
    // 基础配置内容
    const basicConfiguration = () => {
        return (
            <div className='basic-configuration'>
                <Form
                    form={form}
                    initialValues={{ name: 'admin' }}
                    onValuesChange={(v, vs) => {
                        console.log(v, vs);
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
                        field='info'
                        rules={[{ required: true, message: '请输入描述内容', max: 200 }]}
                    >
                        <Input placeholder='请输入描述内容' style={{ width: 643 }} />
                    </FormItem>
                    <FormItem
                        label="标注工具"
                        required
                        className="annotation-tool"
                    >
                        {isShowErrorInfo && <span className='error-info-text'>请选择标注工具</span>}
                        <Tabs type={'capsule'}
                            style={{
                                overflow: 'unset'
                            }}
                            className="basic-tabs"
                            onChange={() => { setSelectedRadio('') }}
                        >
                            <TabPane key='1' title='图片'>
                                <Typography.Paragraph style={TabsStyle}>{annotationData()}</Typography.Paragraph>
                            </TabPane>
                            <TabPane key='2' title='文本'>
                                <Typography.Paragraph style={TabsStyle}>{annotationTextTool()}</Typography.Paragraph>
                            </TabPane>
                            <TabPane key='3' title='音频'>
                                <Typography.Paragraph style={TabsStyle}>{ }</Typography.Paragraph>
                            </TabPane>
                            <TabPane key='4' title='视频'>
                                <Typography.Paragraph style={TabsStyle}>{ }</Typography.Paragraph>
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
                                width: 1000
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
        );
    };
    // 工具配置内容
    const ToolConfiguration = () => {
        return (
            <div className='tool-configuration'>
                <Form
                    form={form}
                    style={{ width: 600 }}
                    autoComplete='off'
                >
                    <FormItem
                        label='标注场景'
                        field="annotationScene"
                        rules={[{ required: true, message: '请选择工具类型' }]}
                    >
                        <RadioGroup>
                            <Radio value='image'>图片分类</Radio>
                            <Radio value='graphic'>图形标注</Radio>
                        </RadioGroup>
                    </FormItem>
                </Form>
            </div>
        );
    };
    useEffect(() => {
        if (selectedRadio !== '') {
            setIsShowErrorInfo(false);
        }
        if (selectedData?.length > 0) {
            setIsShowDataErrorInfo(false);
        }
    }, [selectedRadio, selectedData])
    const stepNext = () => {
        form.validate()
            .then(() => {
                console.log('object222');
                // 验证通过，切换到下一步
                if (selectedData?.length <= 0) {
                    setIsShowDataErrorInfo(true);
                    return;
                }
                if (selectedRadio === '') {
                    setIsShowErrorInfo(true);
                    return;
                }
                setStepCurrent(StepCurrent + 1);
            })
            .catch((errorInfo) => {
                console.log('object111');
                if (selectedData?.length <= 0) {
                    setIsShowDataErrorInfo(true)
                }
                if (selectedRadio === '') {
                    setIsShowErrorInfo(true);
                    return;
                }
            });
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
                        // disabled={StepCurrent >= 3}
                        onClick={() => { stepNext() }}
                        style={{ marginLeft: 20, paddingRight: 8 }}
                        type='primary'
                    >
                        {StepCurrent >= 3 ? '发布' : '下一步'}
                    </Button>

                </div>
            </div>
            <div className='detail-content'>
                <Steps type='arrow' current={StepCurrent} style={{ maxWidth: 780 }}>
                    <Step title='1、基础配置' />
                    <Step title='2、工具配置' />
                    <Step title='3、作业配置' />
                </Steps>
                {/* 基础配置部分 */}
                {
                    StepCurrent === 1 && basicConfiguration()
                }
                {/* 工具配置部分 */}
                {
                    StepCurrent === 2 && ToolConfiguration()
                }
                {/* 作业配置部分 */}
                {
                    StepCurrent === 3 && <JobConfiguration />
                }
            </div>
        </div>
    );
}