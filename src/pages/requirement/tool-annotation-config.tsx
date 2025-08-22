import React, { useState, useRef } from 'react';
import { Form, Input, Select, Button, Table, Tag, Modal, Space, Typography, Message, Card, Divider } from '@arco-design/web-react';
import { IconPlus, IconMinus, IconDelete } from '@arco-design/web-react/icon';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const FormItem = Form.Item;

// 定义类型接口
interface FileClassificationItem {
    id: string;
    type: string;
    annotationPropName: string;
    resultStorageName: string;
}

interface GraphicAnnotationItem {
    id: string;
    displayName: string;
    storageName: string;
    shape: string;
    color: string;
}

interface AddItemModalData {
    componentName: string;
    selectionType: 'single' | 'multiple';
    required: boolean;
    items: Array<{
        type: string;
        displayName: string;
        storageName: string;
    }>
}

const ToolAnnotationConfig: React.FC = () => {
    // 文件分类配置状态
    const [fileClassification, setFileClassification] = useState<FileClassificationItem[]>([
        { id: '1', type: 'text', annotationPropName: '默认属性', resultStorageName: 'default_property' }
    ]);

    // 图形标注配置状态
    const [graphicAnnotations, setGraphicAnnotations] = useState<GraphicAnnotationItem[]>([
        { id: '1', displayName: '边界框', storageName: 'bounding_box', shape: 'rectangle', color: '#FF0000' },
        { id: '2', displayName: '关键点', storageName: 'key_point', shape: 'circle', color: '#00FF00' },
        { id: '3', displayName: '多边形', storageName: 'polygon', shape: 'polygon', color: '#0000FF' },
        { id: '4', displayName: '曲线', storageName: 'polyline', shape: 'polyline', color: '#FFFF00' },
        { id: '5', displayName: '文本', storageName: 'text', shape: 'text', color: '#FF00FF' }
    ]);

    // 模态框状态
    const [addItemModalVisible, setAddItemModalVisible] = useState(false);
    const [modalData, setModalData] = useState<AddItemModalData>({
        componentName: '',
        selectionType: 'single',
        required: true,
        items: [
            { type: 'text', displayName: '', storageName: '' }
        ]
    });

    // 拖拽相关状态
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeModalItemId, setActiveModalItemId] = useState<string | null>(null);

    // 文件分类配置 - 添加项
    const handleAddFileClassificationItem = () => {
        const newId = Date.now().toString();
        setFileClassification([...fileClassification, {
            id: newId,
            type: 'text',
            annotationPropName: '',
            resultStorageName: ''
        }]);
    };

    // 文件分类配置 - 删除项
    const handleRemoveFileClassificationItem = (id: string) => {
        if (fileClassification.length <= 1) {
            Message.warning('至少保留一项配置');
            return;
        }
        setFileClassification(fileClassification.filter(item => item.id !== id));
    };

    // 图形标注配置 - 添加项
    const handleAddGraphicAnnotationItem = () => {
        setAddItemModalVisible(true);
    };

    // 图形标注配置 - 删除项
    const handleRemoveGraphicAnnotationItem = (id: string) => {
        if (graphicAnnotations.length <= 1) {
            Message.warning('至少保留一项配置');
            return;
        }
        setGraphicAnnotations(graphicAnnotations.filter(item => item.id !== id));
    };

    // 模态框 - 添加项
    const handleAddModalItem = () => {
        setModalData(prev => ({
            ...prev,
            items: [...prev.items, { type: 'text', displayName: '', storageName: '' }]
        }));
    };

    // 模态框 - 删除项
    const handleRemoveModalItem = (index: number) => {
        if (modalData.items.length <= 1) {
            Message.warning('至少保留一项');
            return;
        }
        setModalData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // 模态框 - 确认添加
    const handleConfirmAddItem = () => {
        if (!modalData.componentName) {
            Message.error('请输入属性组件名称');
            return;
        }

        // 这里可以根据模态框数据创建新的图形标注项
        const newId = Date.now().toString();
        setGraphicAnnotations([...graphicAnnotations, {
            id: newId,
            displayName: modalData.componentName,
            storageName: modalData.componentName.toLowerCase().replace(/\s+/g, '_'),
            shape: 'rectangle',
            color: '#FF0000'
        }]);

        setAddItemModalVisible(false);
        // 重置模态框数据
        setModalData({
            componentName: '',
            selectionType: 'single',
            required: true,
            items: [
                { type: 'text', displayName: '', storageName: '' }
            ]
        });
    };

    // 处理文件分类拖拽排序
    const handleFileClassificationDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const newItems = [...fileClassification];
            const activeIndex = newItems.findIndex(item => item.id === active.id);
            const overIndex = newItems.findIndex(item => item.id === over.id);

            const [removed] = newItems.splice(activeIndex, 1);
            newItems.splice(overIndex, 0, removed);

            setFileClassification(newItems);
        }
    };

    // 处理图形标注拖拽排序
    const handleGraphicAnnotationDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const newItems = [...graphicAnnotations];
            const activeIndex = newItems.findIndex(item => item.id === active.id);
            const overIndex = newItems.findIndex(item => item.id === over.id);

            const [removed] = newItems.splice(activeIndex, 1);
            newItems.splice(overIndex, 0, removed);

            setGraphicAnnotations(newItems);
        }
    };

    return (
        <div className="tool-annotation-config" style={{ padding: '20px' }}>
            <Title >工具标注配置</Title>
            <Divider />

            {/* 文件分类配置 */}
            {/* <Card title="文件分类配置" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Space size={16} align="center">
                        <Typography.Text style={{ width: '120px' }}>属性名称</Typography.Text>
                        <Input placeholder="请输入属性名称" style={{ width: '180px' }} />
                        <Select placeholder="选择类型" style={{ width: '140px' }}>
                            <Option value="text">文本</Option>
                            <Option value="number">数字</Option>
                            <Option value="date">日期</Option>
                        </Select>
                        <Select placeholder="选择选项" style={{ width: '140px' }}>
                            <Option value="option1">选项1</Option>
                            <Option value="option2">选项2</Option>
                            <Option value="option3">选项3</Option>
                        </Select>
                        <Button type="text">删除</Button>
                    </Space>
                </div>

                <Divider>属性选择</Divider>


                <Button type="text" icon={<IconPlus />} onClick={handleAddFileClassificationItem}>
                    添加属性
                </Button>
            </Card> */}

            {/* 图形标注配置 */}
            <Card title="图形标注配置" style={{ marginBottom: '20px' }}>
                {/* 图形标注项列表 */}
                {/* 一个列表，循环渲染，每一个item可以拖拽排序 */}
                {
                    graphicAnnotations?.map((displayName, index: any) => {
                        return (
                            <>1</>
                        )
                    })
                }
                <Button type="primary" icon={<IconPlus />} onClick={handleAddGraphicAnnotationItem}>
                    新增标注项
                </Button>
            </Card>

            {/* 添加图形标注项模态框 */}
            <Modal
                title="新增标注项"
                visible={addItemModalVisible}
                onCancel={() => setAddItemModalVisible(false)}
                onOk={handleConfirmAddItem}
            >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Form layout="vertical">
                        <FormItem label="属性组件名称">
                            <Input
                                value={modalData.componentName}
                                onChange={(e: any) => setModalData(prev => ({ ...prev, componentName: e.target.value }))}
                                placeholder="请输入属性组件名称"
                            />
                        </FormItem>
                        <FormItem label="选择类型">
                            <Select
                                value={modalData.selectionType}
                                onChange={(value) => setModalData(prev => ({ ...prev, selectionType: value as 'single' | 'multiple' }))}
                                placeholder="选择单选或多选"
                            >
                                <Option value="single">单选</Option>
                                <Option value="multiple">多选</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="必选类型">
                            <Select
                                value={modalData.required ? 'required' : 'optional'}
                                onChange={(value) => setModalData(prev => ({ ...prev, required: value === 'required' }))}
                                placeholder="选择必须或非必选"
                            >
                                <Option value="required">必须</Option>
                                <Option value="optional">非必选</Option>
                            </Select>
                        </FormItem>
                    </Form>

                    <Divider>属性列表</Divider>
                    {modalData.items.map((item, index) => (
                        <Space key={index} size={16} align="center" style={{ width: '100%', padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
                            <Select
                                value={item.type}
                                onChange={(value) => {
                                    const newItems = [...modalData.items];
                                    newItems[index].type = value;
                                    setModalData(prev => ({ ...prev, items: newItems }));
                                }}
                                placeholder="选择类型"
                                style={{ width: '120px' }}
                            >
                                <Option value="text">文本</Option>
                                <Option value="number">数字</Option>
                                <Option value="date">日期</Option>
                            </Select>
                            <Input
                                value={item.displayName}
                                onChange={(e: any) => {
                                    const newItems = [...modalData.items];
                                    newItems[index].displayName = e.target.value;
                                    setModalData(prev => ({ ...prev, items: newItems }));
                                }}
                                placeholder="标注展示名称"
                                style={{ width: '160px' }}
                            />
                            <Input
                                value={item.storageName}
                                onChange={(e: any) => {
                                    const newItems = [...modalData.items];
                                    newItems[index].storageName = e.target.value;
                                    setModalData(prev => ({ ...prev, items: newItems }));
                                }}
                                placeholder="结果存储名称"
                                style={{ width: '160px' }}
                            />
                            <Button
                                type="text"
                                icon={<IconMinus />}
                                onClick={() => handleRemoveModalItem(index)}
                                style={{ marginLeft: 'auto' }}
                            >删除</Button>
                        </Space>
                    ))}

                    <Button type="text" icon={<IconPlus />} onClick={handleAddModalItem}>
                        添加属性项
                    </Button>
                </Space>
            </Modal>
        </div>
    );
};

export default ToolAnnotationConfig;


const SortableItem = ({ id, item, onDelete }: { id: string; item: any; onDelete: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging }
        = useSortable({ id, data: { type: 'item', item } });

    const style = {
        transform: transform,
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        padding: '12px',
        marginBottom: '8px',
        backgroundColor: isDragging ? '#f0f5ff' : '#fff',
        border: '1px solid #e5e6eb',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div>{item.name}</div>
            <Button
                icon={<IconDelete />}
                size="small"
                type="text"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            />
        </div>
    );
};

const DraggableList = () => {
    const [items, setItems] = useState([
        { id: '1', name: '列表项 1' },
        { id: '2', name: '列表项 2' },
        { id: '3', name: '列表项 3' }
    ]);
    const [activeItem, setActiveItem] = useState<any>(null);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setItems((prev) => {
                const activeIndex = prev.findIndex(item => item.id === active.id);
                const overIndex = prev.findIndex(item => item.id === over?.id);
                const newItems = [...prev];
                [newItems[activeIndex], newItems[overIndex]] = [newItems[overIndex], newItems[activeIndex]];
                return newItems;
            });
        }
        setActiveItem(null);
    };

    const handleDelete = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <Card title="可拖拽排序列表">
            <DndContext
                collisionDetection={verticalListSortingStrategy}
                onDragStart={(event) => setActiveItem(event.active.data.current?.item)}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items.map(item => item.id)}>
                    {items.map(item => (
                        <SortableItem
                            key={item.id}
                            id={item.id}
                            item={item}
                            onDelete={() => handleDelete(item.id)}
                        />
                    ))}
                </SortableContext>

                <DragOverlay>
                    {activeItem && (
                        <div style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#fff',
                            border: '1px solid #e5e6eb',
                            borderRadius: '4px'
                        }}>
                            {activeItem.name}
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </Card>
    );
};

// 在合适的位置使用DraggableList组件
// return (
//   <div>
//     ...
//     <DraggableList />
//     ...
//   </div>
// );