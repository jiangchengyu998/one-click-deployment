// src/app/api/apis/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取当前用户的API列表
export async function GET(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const apis = await prisma.api.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'desc' }
        });
        // 在这里通过userId获取用户信息，放到每个API对象中
        const userIds = apis.map(api => api.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } }
        });
        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});

        apis.forEach(api => {
            api.user = userMap[api.userId];
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

// 创建新API
export async function POST(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { name, gitUrl, gitToken, dockerfile } = await request.json();

        // 验证必填字段
        if (!name || !gitUrl) {
            return NextResponse.json(
                { error: 'API名称和Git仓库地址是必填的' },
                { status: 400 }
            );
        }

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
                userId: session.id,
                status: 'PENDING'
            },
        });

        // serverPort 获取所有api_infor记录 中最大的 port + 1，简单实现如下
        const maxPortRecord = await prisma.apiInfor.findFirst({
            orderBy: { serverPort: 'desc' },
        });
        const nextPort = maxPortRecord ? maxPortRecord.serverPort + 1 : 3003;

        // 创建api_infor记录
        await prisma.apiInfor.create({
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
        const response = await fetch(pipelineUrl + '/job/add_rr/buildWithParameters', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "parameter": [
                    {
                        "RR": api.name,
                        "exe_node": "w-ubuntu",
                    }
                ]
            })
        }).catch(
            error => {
                console.error('调用Jenkins创建DNS记录失败:', error);
                throw new Error('调用Jenkins创建DNS记录失败');
            }
        )

        if (response.status === 201) {
            const jsonResponse = await response.json();
            console.log('Jenkins创建DNS记录成功:', jsonResponse);
        } else {
            console.error('调用Jenkins创建DNS记录失败:', response.status, response.statusText);
            throw new Error('调用Jenkins创建DNS记录失败');
        }

        // 2. 调用 http://192.168.101.51:8080/job/add_nginx_file/ pipeline 创建nginx配置文件
        // 3. 调用http://192.168.101.51:8080/job/deploy_api/  部署服务

        return NextResponse.json(api, { status: 201 });
    } catch (error) {
        console.error('创建API错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}