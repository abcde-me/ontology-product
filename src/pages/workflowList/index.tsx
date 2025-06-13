import React from "react";
import { Button } from '@arco-design/web-react';
import { useHistory } from "react-router";

export default function WorkflowList() {
    const history = useHistory();

    const handleClickBtn = () => {
        history.push(`/tenant/compute/modaforge/workflowConfig`);
    };

    return <Button shape='round' type='primary' onClick={handleClickBtn}>创建工作流</Button>
}