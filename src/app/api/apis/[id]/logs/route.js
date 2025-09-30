// src/app/api/apis/[id]/logs/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取API日志
export async function GET(request, { params }) {
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
            return NextResponse.json({ error: '无权访问此API' }, { status: 403 });
        }

        // 从pipeline中获取日志
        const jenkinsUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;

        console.log('API信息:', {
            apiId: api.id,
            lastJobId: api.lastJobId,
            pipelineUrl: jenkinsUrl,
            jenkinsUser: jenkinsUser ? '已设置' : '未设置'
        });

        const buildNumber = api.lastJobId;
        if (!buildNumber) {
            return NextResponse.json({ error: 'API未部署过，没有构建记录' }, { status: 404 });
        }

        // 检查必要的环境变量
        if (!jenkinsUrl || !jenkinsUser || !jenkinsToken) {
            console.error('缺少必要的环境变量:', {
                hasPipelineUrl: !!jenkinsUrl,
                hasJenkinsUser: !!jenkinsUser,
                hasJenkinsToken: !!jenkinsToken
            });
            return NextResponse.json({ error: '系统配置不完整' }, { status: 500 });
        }

        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');

        // Jenkins API 通常使用 GET 请求获取日志
        const jenkinsUrlForLog = `${jenkinsUrl}/job/deploy_api/${buildNumber}/consoleText`;
        console.log('请求Jenkins URL:', jenkinsUrlForLog);

        const response = await fetch(jenkinsUrlForLog, {
            method: 'GET', // 改为 GET 请求
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'text/plain; charset=utf-8'
            }
        });

        console.log('Jenkins响应状态:', response.status, response.statusText);

        if (!response.ok) {
            let errorDetail = '';
            try {
                const errorText = await response.text();
                errorDetail = errorText.substring(0, 200); // 只取前200字符避免日志过长
            } catch (e) {
                errorDetail = '无法读取错误详情';
            }

            console.error('获取Jenkins日志失败:', {
                status: response.status,
                statusText: response.statusText,
                errorDetail: errorDetail
            });

            // 根据不同的状态码返回不同的错误信息
            if (response.status === 404) {
                return NextResponse.json({ error: '构建记录不存在或已被删除' }, { status: 404 });
            } else if (response.status === 401) {
                return NextResponse.json({ error: 'Jenkins认证失败' }, { status: 500 });
            } else {
                return NextResponse.json({
                    error: `获取日志失败: ${response.status} ${response.statusText}`
                }, { status: response.status });
            }
        }

        const logs = await response.text();
        console.log('获取到日志长度:', logs.length);

        if (!logs || logs.trim() === '') {
            return NextResponse.json([]);
        }

        // 解析日志 - 更灵活的解析方式
        const logLines = logs.split('\n');

        // 对包含 ‘环境变量’ 或者 ydphoto 的行进行特殊处理，将一整行使用****代替
        const envVarKeywords = ['oauth2','环境变量', 'ydphoto', 'deploy.sh', 'export ', 'SECRET', 'KEY', 'TOKEN', 'PASSWORD', 'PWD', 'AWS_', 'GCP_', 'AZURE_'];
        const sanitizedLogLines = logLines.map(line => {
            if (envVarKeywords.some(keyword => line.includes(keyword))) {
                return '****';
            }
            return line;
        });


        const parsedLogs = sanitizedLogLines.map((line, index) => {
            // 尝试多种日志格式的解析
            let timestamp = new Date();
            let level = 'INFO';
            let message = line;

            // 格式1: 2024-01-01 10:00:00 INFO Some message
            const format1 = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (.*)/);
            if (format1) {
                timestamp = new Date(`${format1[1]}`);
                level = format1[2];
                message = format1[3];
            }
            // 格式2: [2024-01-01T10:00:00.000Z] INFO: Some message
            else if (line.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                const format2 = line.match(/\[([^\]]+)\] (\w+): (.*)/);
                if (format2) {
                    timestamp = new Date(format2[1]);
                    level = format2[2];
                    message = format2[3];
                }
            }
            // 格式3: 包含常见日志级别关键词
            else {
                const levelMatch = line.match(/\b(ERROR|WARN|INFO|DEBUG|TRACE)\b/);
                if (levelMatch) {
                    level = levelMatch[1];
                }
            }

            // 如果时间解析失败，使用当前时间
            if (isNaN(timestamp.getTime())) {
                timestamp = new Date();
            }

            return {
                id: `${buildNumber}-${index}`,
                timestamp: timestamp.toISOString(),
                level: level,
                message: message
            };
        }).filter(log => log.message && log.message.trim() !== '');

        return NextResponse.json(parsedLogs);

    } catch (error) {
        console.error('获取API日志错误:', error);
        return NextResponse.json(
            { error: `服务器错误: ${error.message}` },
            { status: 500 }
        );
    }
}