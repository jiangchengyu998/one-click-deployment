// src\saas\api\api.js

const pipelineUrl = process.env.JENKINS_URL;
const jenkinsUser = process.env.JENKINS_USER;
const jenkinsToken = process.env.JENKINS_TOKEN;
const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');


export async function createDnsRecord(api, user, apiInfor) {
    // 这里可以调用实际的DNS记录创建逻辑
    console.log('Creating DNS record (simulated)');
    // 1. 调用http://192.168.101.51:8080/job/add_rr/ pipeline 创建dns记录
    // 构建参数字符串
    const query = new URLSearchParams({
        RR: api.name+'-'+user.code,
        exe_node: apiInfor.execNode
    }).toString();

    const response = await fetch(
        `${pipelineUrl}/job/add_rr/buildWithParameters?${query}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`
            }
        }
    );


    if (response.status === 201) {
        console.log('Jenkins创建DNS记录成功:', response);
    } else {
        console.error('调用Jenkins创建DNS记录失败:', response.status, response.statusText);
        throw new Error('调用Jenkins创建DNS记录失败');
    }
    return true;
}

export async function createNginxConfig(api, apiInfor) {
    // 添加nginx等配置
    console.log('添加nginx等配置');
    // 2. 调用 http://192.168.101.51:8080/job/add_nginx_file/ pipeline 创建nginx配置文件
    // 构建参数字符串
    const queryAddNginx = new URLSearchParams({
        api_name: api.name+'-'+user.code,
        api_port: nextPort,
        server_ip: apiInfor.serverIp,
        exe_node: apiInfor.execNode
    }).toString();

    const responseAddNginx = await fetch(
        `${pipelineUrl}/job/add_nginx_file/buildWithParameters?${queryAddNginx}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`
            }
        }
    );


    if (responseAddNginx.status === 201) {
        console.log('Jenkins创建Nginx配置文件成功:', responseAddNginx);
    } else {
        console.error('调用Jenkins创建Nginx配置文件失败:', responseAddNginx.status, responseAddNginx.statusText);
        throw new Error('调用Jenkins创建Nginx配置文件失败');
    }
    return true;
}

