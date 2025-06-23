import UAPI from '@/api';
import axios from 'axios';

// 获取连接器的列表
export async function getConnectionList(params){
    return UAPI.RES.getConnection({}).get(params).inRegion().do()
}
