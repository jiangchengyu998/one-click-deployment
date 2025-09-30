// src/app/api/apis/[id]/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取API详情
export async function GET(request, { params }) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;

        const api = await prisma.api.findUnique({
            where: { id: id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        code: true
                    }
                }
            }
        });

        if (!api) {
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        // 检查权限
        if (api.userId !== session.id) {
            return NextResponse.json({ error: '无权访问此API' }, { status: 403 });
        }

        return NextResponse.json(api);
    } catch (error) {
        console.error('获取API详情错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 删除API
export async function DELETE(request, { params }) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;

        // 检查API是否存在
        const api = await prisma.api.findUnique({
            where: { id: id }
        });

        if (!api) {
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        // 检查权限
        if (api.userId !== session.id) {
            return NextResponse.json({ error: '无权删除此API' }, { status: 403 });
        }

        // 删除API
        await prisma.api.delete({
            where: { id: id }
        });

        const pipelineUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');

        // 1. 调用http://192.168.101.51:8080/job/delete_api/ pipeline 删除API相关资源
        // 构建参数字符串
        const query = new URLSearchParams({
            api_name: api.name,
            RR: api.name
        }).toString();

        const response = await fetch(
            `${pipelineUrl}/job/delete_api/buildWithParameters?${query}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${basicAuth}`
                }
            }
        );

        if (response.status === 201 || response.status === 200) {
            console.log('调用Jenkins删除API相关资源成功');
        } else {
            console.error('调用Jenkins删除API相关资源失败:', response.status, response.statusText);
        }


        return NextResponse.json({ message: 'API删除成功' });
    } catch (error) {
        console.error('删除API错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 更新API（包括环境变量）
export async function PATCH(request, { params }) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;
        const { envs,gitToken,branch } = await request.json();

        // console.log('Received envs update for API:', id, envs);

        // 检查API是否存在且用户有权限
        const api = await prisma.api.findUnique({
            where: { id: id }
        });

        if (!api) {
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        if (api.userId !== session.id) {
            return NextResponse.json({ error: '无权修改此API' }, { status: 403 });
        }

        // 更新环境变量
        const updatedApi = await prisma.api.update({
            where: { id: id },
            data: {
                envs: envs !== undefined ? envs : api.envs,
                gitToken: gitToken !== undefined ? gitToken : api.gitToken,
                branch: branch !== undefined ? branch : api.branch,
                updatedAt: new Date()
            }
        });

        // console.log('API环境变量更新成功:', updatedApi.id);

        return NextResponse.json(updatedApi);
    } catch (error) {
        console.error('更新API环境变量错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}