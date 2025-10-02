// src/app/api/apis/route.js
import { NextResponse } from 'next/server';
// import { getServerSession } from '@/lib/auth';
import { getUserSession } from '@/lib/auth';

import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getUserSession(request);
        // console.log('api User session:', session);

        if (!session || !session.id) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const apis = await prisma.api.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(apis);
    } catch (error) {
        console.error('获取API列表错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const session = await getUserSession(request);

        if (!session || !session.id) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // 解析请求体, 添加envs
        const { name, gitUrl, gitToken, envs } = await request.json();

        // 检查用户配额
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            include: { _count: { select: { apis: true } } }
        });

        if (user._count.apis >= user.apiQuota) {
            return NextResponse.json(
                { error: '已达到API配额限制' },
                { status: 400 }
            );
        }

        // 生成域名
        const domain = `${name}-${user.code}.ydphoto.com`;

        // 创建API记录
        const api = await prisma.api.create({
            data: {
                name,
                gitUrl,
                gitToken,
                domain,
                envs,
                userId: session.id,
            },
        });

        // 30分钟后如果状态还在BUILDING，自动改为ERROR，防止卡死
        setTimeout(async () => {
            // 重新获取api状态，防止覆盖掉已经变更的状态
            const currentApi = await prisma.api.findUnique({
                where: { id: api.id }
            });

            if (currentApi.status === 'BUILDING') {
                console.log('API部署超时，自动设置为ERROR状态，API ID:', currentApi.id);
                await prisma.api.update({
                    where: { id: currentApi.id },
                    data: { status: 'ERROR' }
                });
            }

        }, 30*60*1000);


        // serverPort 获取所有api_infor记录 中最大的 port + 1，简单实现如下
        const maxPortRecord = await prisma.apiInfor.findFirst({
            orderBy: { serverPort: 'desc' },
        });
        const nextPort = maxPortRecord ? maxPortRecord.serverPort + 1 : 3004;

        console.log('Next available port:', nextPort);

        // 创建api_infor记录, execNode 先写死为 w-ubuntu,后续可以让用户选择, 返回值
        const apiInfor = await prisma.apiInfor.create({
            data: {
                apiId: api.id,
                serverIp: '100.95.91.54', // 默认值，可根据实际需求调整
                serverPort: nextPort,
                execNode: 'w-ubuntu',
            }
        });

        // 在实际应用中，这里应该调用部署服务
        const pipelineUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');

        // 1. 调用http://192.168.101.51:8080/job/add_rr/ pipeline 创建dns记录
        // 构建参数字符串
        const query = new URLSearchParams({
            rr: api.name+'-'+user.code,
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

        // 3. 调用http://192.168.101.51:8080/job/deploy_api/  部署服务
        // 构建参数字符串
        const queryDeployApi = new URLSearchParams({
            GIT_URL: api.gitUrl,
            API_PORT: nextPort,
            exe_node: apiInfor.execNode,
            branch: api.branch,
            api_id: api.id,
            gitToken: api.gitToken || '',
            // Switch to stringify for envs
            envs: JSON.stringify(api.envs),
            api_name: api.name + '-' +  user.code,
        }).toString();

        const responseDeployApi = await fetch(
            `${pipelineUrl}/job/deploy_api/buildWithParameters?${queryDeployApi}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${basicAuth}`
                }
            }
        );


        if (responseDeployApi.status === 201) {
            console.log('Jenkins部署服务成功:', responseDeployApi);
        } else {
            console.error('调用Jenkins部署服务失败:', responseDeployApi.status, responseDeployApi.statusText);
            throw new Error('调用Jenkins部署服务失败');
        }

        // 更新api状态为BUILDING
        await prisma.api.update({
            where: { id: api.id },
            data: { status: 'BUILDING' }
        });

        return NextResponse.json(api, { status: 201 });
    } catch (error) {
        console.error('创建API错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}