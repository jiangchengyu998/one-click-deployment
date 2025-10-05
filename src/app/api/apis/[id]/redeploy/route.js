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
            where: { id: id },
            include: { api_infor: true }
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
                // lastJobId: `job-${Date.now()}`,
                updatedAt: new Date()
            }
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

        // 检查用户配额
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            include: { _count: { select: { apis: true } } }
        });

        // 读取环境变量
        const pipelineUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');


        // api_information
        const apiInfor = api.api_infor[0]
        console.log('apiInfor:', apiInfor);
        // 构建参数字符串
        const query = new URLSearchParams({
            GIT_URL: api.gitUrl,
            API_PORT: apiInfor.serverPort,
            exe_node: apiInfor.execNode,
            branch: api.branch || 'main',
            api_id: api.id,
            gitToken: api.gitToken || '',
            // Switch to stringify for envs
            envs: JSON.stringify(api.envs),
            api_name: api.name + '-' +  user.code,
            CALL_BACK_HOST: process.env.NEXTAUTH_URL || '',
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