import { Form, Input, Button, Checkbox } from '@arco-design/web-react';
import { Props } from 'ahooks/lib/useControllableValue';
import React from 'react';
const FormItem = Form.Item;

const App = ({addDataset}:Props) => {
  return (
    <Form 
    style={{ width: 600 }} 
    autoComplete='off'
    labelCol={{span: 4}}
    wrapperCol={{span: 10}}
    >
      <FormItem label='Username'>
        <Input placeholder='please enter your username...' />
      </FormItem>
      <FormItem label='Post'>
        <Input placeholder='please enter your post...' />
      </FormItem>
      <FormItem wrapperCol={{ offset: 5 }}>
        <Checkbox>I have read the manual</Checkbox>
      </FormItem>
      <FormItem wrapperCol={{ offset: 5 }}>
        {/* <Button type='primary' onClick={()=>addDataset(form.getFieldsValue())} >Submit</Button> */}
      </FormItem>


    </Form>
  );
};

export default App;
