// src\saas\api\api.js

const pipelineUrl = process.env.JENKINS_URL;
const jenkinsUser = process.env.JENKINS_USER;
const jenkinsToken = process.env.JENKINS_TOKEN;
const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');


export async function createDnsRecord(api, user, apiInfor) {
    // 这里可以调用实际的DNS记录创建逻辑
    console.log('Creating DNS record (simulated)');
    return true;
}

export async function createNginxConfig(api, apiInfor, user) {
    // 添加nginx等配置
    console.log('添加nginx等配置');
    return true;
}

