import React from 'react';
import { Empty, Result, Button } from '@arco-design/web-react';
import { useHistory } from 'react-router-dom';
import styles from './404.module.css';

export default function Page404() {
  const history = useHistory();

  return (
    <section className={styles['page-404']}>
      <main>
        <Result
          status="404"
          subTitle="您输入的地址有误, 或者无访问该页面的权限"
          icon={<Empty description=" " />}
          extra={
            <p>
              <Button onClick={location.reload}>刷新</Button>
              <Button onClick={() => history.goBack()} type="primary">
                返回上一页
              </Button>
            </p>
          }
        />
      </main>
    </section>
  );
}
