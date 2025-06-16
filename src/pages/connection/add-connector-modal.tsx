// import { Form, Input, Radio } from "@arco-design/web-react"
// import React, { forwardRef, useImperativeHandle, useState } from "react"
//  const AddConnectorModal=forwardRef((props:any,ref)=>{
//     const RadioGroup = Radio.Group;
//     const FormItem = Form.Item;
// const [form] = Form.useForm();
// const [newForm,setNewForm]=useState({}) as any
// useImperativeHandle(ref,()=>({
// getFormDataHan:()=>{
//     const addform=form.getFieldValue
//      const newfrom = {
//                     name: addform.name,
//                     config: {
//                         ...addform
//                     },
//                     creator: "梁世昌"
//                 };
//                 setNewForm(newfrom)
// }

// }))
//     return(
//         <div>
//              <Form style={{ width: 600 }} autoComplete='off'
//                         form={form}
//                     >
//                         <FormItem label='连接器名称：'
//                             required
//                             field="name"
//                             rules={[{ required: true, message: '请输入连接器名称' }]}
//                             labelCol={{ span: 5 }}
//                             wrapperCol={{ span: 19 }}
//                             labelAlign='right'
//                         >
//                             <Input placeholder='请输入' />
//                         </FormItem>
//                         <FormItem label='连接器类型：'
//                             field="type"
//                             rules={[{ required: true, message: '请选择类型' }]}
//                             labelCol={{ span: 5 }}
//                             wrapperCol={{ span: 19 }}
//                             labelAlign='right'
//                             initialValue='s3'
//                         >
//                             <RadioGroup defaultValue='s3' onChange={(value) => {
//                                 props.SetStorageTypeHan(value)
//                             }}>
//                                 <Radio value='s3'>对象存储</Radio>
//                                 <Radio value='hdfs'>HDFS</Radio>
//                             </RadioGroup>
//                         </FormItem>
//                         <span style={{ margin: '13px 0px 13px 0px', fontSize: '17px', fontWeight: '500' }}>连接信息</span>
//                         {
//                             props.StorageType == 's3' ?
//                                 <div>
//                                     <FormItem label='Endpoint：'
//                                         field="endpoint"
//                                         rules={[{ required: true, message: '请输入Endpoint' }]}
//                                         labelCol={{ span: 5 }}
//                                         wrapperCol={{ span: 19 }}
//                                         labelAlign='right'
//                                     >
//                                         <Input placeholder='请输入' />
//                                     </FormItem>
//                                     <FormItem label='AccessKey lD :'
//                                         field="access_key"
//                                         rules={[{ required: true, message: '请输入AccessKey lD' }]}
//                                         labelCol={{ span: 5 }}
//                                         wrapperCol={{ span: 19 }}
//                                         labelAlign='right'
//                                     >
//                                         <Input placeholder='请输入' />
//                                     </FormItem>
//                                     <FormItem label='AccessKey Secret :'
//                                         field="secret_key"
//                                         rules={[{ required: true, message: '请输入AccessKey Secret' }]}
//                                         labelCol={{ span: 5 }}
//                                         wrapperCol={{ span: 19 }}
//                                         labelAlign='right'
//                                     >
//                                         <Input placeholder='请输入' />
//                                     </FormItem>
//                                     <FormItem label='文件路径：'
//                                         field="path"
//                                         rules={[{ required: true, message: '请输入文件路径' }]}
//                                         labelCol={{ span: 5 }}
//                                         wrapperCol={{ span: 19 }}
//                                         labelAlign='right'
//                                     >
//                                         <Input placeholder='请输入' />
//                                     </FormItem>
//                                 </div>
//                                 : <div>
//                                     <FormItem label='Host：'
//                                         rules={[{ required: true, message: '请输入Host' }]}
//                                         labelCol={{ span: 5 }}
//                                         wrapperCol={{ span: 19 }}
//                                         labelAlign='right'
//                                         field='host'
//                                     >
//                                         <Input placeholder='请输入' />
//                                     </FormItem>
//                                     <FormItem label='Port：'
//                                         rules={[{ required: true, message: '请输入Port' }]}
//                                         labelCol={{ span: 5 }}
//                                         wrapperCol={{ span: 19 }}
//                                         labelAlign='right'
//                                         field='port'
//                                     >
//                                         <Input placeholder='请输入' />
//                                     </FormItem>
//                                     <FormItem label='用户名：'
//                                         rules={[{ required: true, message: '请输入用户名' }]}
//                                         labelCol={{ span: 5 }}
//                                         wrapperCol={{ span: 19 }}
//                                         labelAlign='right'
//                                         field='user'
//                                     >
//                                         <Input placeholder='请输入' />
//                                     </FormItem>
//                                     <FormItem label='目录路径：'
//                                         rules={[{ required: true, message: '请输入目录路径' }]}
//                                         labelCol={{ span: 5 }}
//                                         wrapperCol={{ span: 19 }}
//                                         labelAlign='right'
//                                         field="path"
//                                     >
//                                         <Input placeholder='请输入' />
//                                     </FormItem>
//                                 </div>
//                         }
//                     </Form>
//         </div>
//     )
// })
// export default AddConnectorModal