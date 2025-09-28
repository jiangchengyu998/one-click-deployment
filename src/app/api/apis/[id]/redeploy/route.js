// src/app/api/apis/[id]/redeploy/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 重新部署API
export async function POST(request, { params }) {
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
            return NextResponse.json({ error: '无权操作此API' }, { status: 403 });
        }

        // 更新API状态
        await prisma.api.update({
            where: { id: id },
            data: {
                status: 'BUILDING',
                lastJobId: `job-${Date.now()}`,
                updatedAt: new Date()
            }
        });

        // 读取环境变量
        const pipelineUrl = process.env.PIPELINE_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');


        // api_information
        const apiInfor = await prisma.apiInfor.findUnique({
            where: { apiId: id }
        });

        // 构建参数字符串
        const query = new URLSearchParams({
            GIT_URL: api.gitUrl,
            API_PORT: apiInfor.serverPort.toString(),
            exe_node: apiInfor.execNode,
            branch: "main",
            // Switch to stringify for envs
            envs: JSON.stringify(api.envs)
        }).toString();

        const response = await fetch(
            `${pipelineUrl}/job/deploy_api/buildWithParameters?${query}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${basicAuth}`
                }
            }
        );


        if (response.status === 201) {
            console.log('触发Jenkins任务成功');
        } else {
            console.error('触发Jenkins任务失败', response);
        }

        return NextResponse.json({ message: 'API重新部署命令已发送' });
    } catch (error) {
        console.error('重新部署API错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}