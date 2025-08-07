import React, { useEffect, useState } from 'react';
import {
    Breadcrumb,
    Button,
    Form,
    Input,
    Radio,
    Steps,
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
import './detail.scss';
import { set } from 'lodash';

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
    // 初始化当前步骤位置
    const [StepCurrent, setStepCurrent] = useState(1);
    // 数据集 - 选中数据内容
    const [selectedData, setSelectedData] = useState([]);
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
    // 基础配置内容
    const basicConfiguration = () => {
        return (
            <div className='basic-configuration'>
                <Form
                    form={form}
                    style={{ width: 600 }}
                    initialValues={{ name: 'admin' }}
                    autoComplete='off'
                    onValuesChange={(v, vs) => {
                        console.log(v, vs);
                    }}
                    onSubmit={(v) => {
                        console.log(v);
                    }}
                >
                    <FormItem label='需求名称' field='name' rules={[{ required: true, message: '请输入需求名称', max: 50 }]}>
                        <Input placeholder='请输入需求名称' />
                    </FormItem>
                    <FormItem
                        label='描述'
                        field='info'
                        rules={[{ required: true, message: '请输入描述内容', max: 200 }]}
                    >
                        <Input placeholder='' />
                    </FormItem>
                    <FormItem
                        label="标注工具"
                        required
                        className="annotation-tool"
                    // rules={[
                    //     {
                    //         required: true,
                    //         validator: (value, callback) => {
                    //             console.log('object', selectedRadio);
                    //             if (!selectedRadio) {
                    //                 callback('请选择标注工具');
                    //             } else {
                    //                 callback();
                    //             }
                    //         }
                    //     }
                    // ]}
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
                    <FormItem label="数据集" required extra={`已选数据量：${selectedData.length}`}>
                        <Button onClick={() => { }}>选择</Button>
                    </FormItem>
                </Form>
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
                    <div className='tool-hr' />
                    {/* 工具类型选择 */}
                    <FormItem
                        label='工具类型'
                        field='tool_type'
                        rules={[{ required: true, message: '请选择工具类型' }]}
                    >
                        <RadioGroup>
                            <Radio value='manual'>手动标注工具</Radio>
                            <Radio value='semi_auto'>半自动标注工具</Radio>
                            <Radio value='auto'>自动标注工具</Radio>
                        </RadioGroup>
                    </FormItem>

                    {/* 工具参数配置 */}
                    <FormItem
                        label='工具参数'
                        field='tool_params'
                        rules={[{ required: true, message: '请配置工具参数' }]}
                    >
                        <Input.TextArea rows={4} placeholder='请输入工具运行参数，多个参数用逗号分隔' />
                    </FormItem>

                    {/* 精度设置 */}
                    <FormItem
                        label='标注精度'
                        field='accuracy'
                        rules={[{ required: true, message: '请选择标注精度' }]}
                    >
                        <RadioGroup>
                            <Radio value='high'>高精度 ( slower )</Radio>
                            <Radio value='medium'>中等精度 ( balanced )</Radio>
                            <Radio value='low'>快速模式 ( faster )</Radio>
                        </RadioGroup>
                    </FormItem>

                    {/* 高级选项 */}
                    <FormItem label='高级配置' field='advanced_settings'>
                        <Input placeholder='请输入高级配置选项' />
                    </FormItem>
                </Form>
            </div>
        );
    };
    // 作业配置
    const JobConfiguration = () => {
        return (
            <div className='job-configuration'>
                <Form
                    form={form}
                    style={{ width: 600 }}
                    autoComplete='off'
                >
                    <div className='job-title'>
                        任务配置
                    </div>
                    <FormItem
                        label='是否审核'
                        field=''
                        rules={[{ required: true, message: '请输入作业名称' }]}
                    >
                        <RadioGroup defaultValue='a' style={{ marginBottom: 20 }}>
                            <Radio value={1}>是</Radio>
                            <Radio value={0}>否</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem
                        label='审核改题'
                        field=''
                        rules={[{ required: true, message: '请输入作业名称' }]}
                    >
                        <RadioGroup defaultValue='a' style={{ marginBottom: 20 }}>
                            <Radio value={1}>允许</Radio>
                            <Radio value={0}>禁止</Radio>
                        </RadioGroup>
                    </FormItem>
                    <div className='job-title'>
                        任务分配
                    </div>
                    <FormItem
                        label='分配方式'
                        field=''
                        rules={[{ required: true, message: '请输入作业名称' }]}
                    >
                        <RadioGroup defaultValue='a' style={{ marginBottom: 20 }}>
                            <Radio value={1}>均分</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem
                        label='分配任务'
                        field='job_name'
                        rules={[{ required: true, message: '请输入作业名称' }]}
                    >
                        <div>任务总数:{300}, 未分配:{0}</div>
                        <Input placeholder='请输入作业名称' />
                    </FormItem>
                </Form>
            </div>
        );
    };
    // 获取基础配置中的内容，判断是否都有值
    const getBasicContentValue = () => {
        if (name !== '' || name !== undefined || name !== null) {
            return true
        }
    }
    useEffect(() => {
        if (selectedRadio !== '') {
            setIsShowErrorInfo(false)
        }
    }, [selectedRadio])
    const stepNext = () => {
        form.validate()
            .then(() => {
                // 验证通过，切换到下一步
                if (selectedRadio === '') {
                    setIsShowErrorInfo(true);
                    return;
                }
                setStepCurrent(StepCurrent + 1);
            })
            .catch((errorInfo) => {
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
                        {StepCurrent >= 3 ? '完成' : '下一步'}
                    </Button>

                </div>
            </div>
            <div className='detail-content'>
                <Steps type='arrow' current={StepCurrent} style={{ maxWidth: 780 }}>
                    <Step title='1、基础配置' />
                    <Step title='2、工具配置' />
                    <Step title='3、作业配置' />
                </Steps>
            </div>
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
                StepCurrent === 3 && JobConfiguration()
            }
        </div>
    );
}