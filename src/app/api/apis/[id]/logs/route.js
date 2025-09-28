// src/app/api/apis/[id]/logs/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';

// 获取API日志
export async function GET(request, { params }) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // 在实际应用中，这里应该从日志服务获取真实的日志

        // 这里的日志，我想是从pipeline  ${pipelineUrl}/job/deploy_api/中获取的日志
        // 比如， Jenkins 的话，可以通过 Jenkins API 获取构建日志，类似这样：
        // GET /job/deploy_api/${buildNumber}/consoleText
        // 帮我实现
        const { id } = await params;
        // console.log('获取API日志，API ID:', id);
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
            return NextResponse.json({ error: '无权访问此API' }, { status: 403 });
        }
        // 从pipeline 中获取日志
        const pipelineUrl = process.env.PIPELINE_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        console.log('api:', api);
        const buildNumber = api.lastJobId;
        if (!buildNumber) {
            return NextResponse.json({ error: 'API未部署过' }, { status: 404 });
        }
        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');

        // 从pipeline 中获取日志
        const response = await fetch(
            `${pipelineUrl}/job/deploy_api/${buildNumber}/consoleText`,
            {
                    method: 'POST',
                    headers: {
                             'Authorization': `Basic ${basicAuth}`
                    }
                 }
        );

        console.log('fetch log response:', response);

        if (!response.ok) {
            return NextResponse.json({ error: '获取日志失败' }, { status: response.status });
        }
        const logs = await response.text();

        // 解析日志，将其转换为 JSON 数组
        const logLines = logs.split('\n');
        const parsedLogs = logLines.map(line => {
            const match = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (.*)/);
            if (match) {
                return {
                    timestamp: new Date(`${match[1]} GMT+8`),
                    level: match[2],
                    message: match[3]
                };
            }
            return null;
        }).filter(log => log !== null);

        // 这里返回模拟日志
        const mockLogs = parsedLogs;

        return NextResponse.json(mockLogs);
    } catch (error) {
        console.error('获取API日志错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}