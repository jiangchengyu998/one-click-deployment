// src/app/api/databases/route.js
import { NextResponse } from 'next/server';
import { getUserSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取当前用户的数据库列表
export async function GET(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const databases = await prisma.database.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(databases);
    } catch (error) {
        console.error('获取数据库列表错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 创建新数据库
export async function POST(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // const { name, username, password, apiPassword } = await request.json();
        const { name, username, password } = await request.json();

        // 验证必填字段
        if (!name || !username || !password) {
            return NextResponse.json(
                { error: '所有字段都是必填的' },
                { status: 400 }
            );
        }

        // 检查用户配额
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            include: { _count: { select: { databases: true } } }
        });

        if (user._count.databases >= user.dbQuota) {
            return NextResponse.json(
                { error: '已达到数据库配额限制' },
                { status: 400 }
            );
        }

        // 加密密码
        const hashedPassword = await hashPassword(password);
        // const hashedPassword = await encryptPassword(password);
        // const hashedApiPassword = await hashPassword(apiPassword);

        // 生成数据库主机地址（在实际应用中，这里应该调用数据库创建服务）
        const host = `${process.env.NEXT_PUBLIC_MAIN_DOMAIN}`;

        // 创建数据库记录
        const database = await prisma.database.create({
            data: {
                name,
                username,
                password: hashedPassword,
                apiPassword: "",
                host,
                userId: session.id,
                status: 'CREATING'
            },
        });

        // 在实际应用中，这里应该调用数据库创建服务
        // 模拟数据库创建过程
        setTimeout(async () => {
            await prisma.database.update({
                where: { id: database.id },
                data: { status: 'RUNNING' }
            });
        }, 10000);

        const pipelineUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');

        // 1. 调用http://192.168.101.51:8080/job/create_mysql_user/ pipeline 创建数据库用户
        // 构建参数字符串
        const query = new URLSearchParams({
            MYSQL_USER: username,
            MYSQL_PASSWORD: password
        }).toString();

        const response = await fetch(
            `${pipelineUrl}/job/create_mysql_user/buildWithParameters?${query}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${basicAuth}`
                }
            }
        );

        if (response.status === 201 || response.status === 200) {
            console.log('调用Jenkins创建数据库用户成功');
        } else {
            console.error('调用Jenkins创建数据库用户失败:', response.status, response);
        }

        // 我想让上一条pipeline执行完毕后再执行下一条，所以加了个延时10秒
        setTimeout(async () => {

            // 2. 调用http://192.168.101.51:8080/job/create_mysql_database/ pipeline 创建数据库
            // 构建参数字符串
            const query_db = new URLSearchParams({
                MYSQL_USER: username,
                DB_NAME: name
            }).toString();

            const response_user = await fetch(
                `${pipelineUrl}/job/create_mysql_database/buildWithParameters?${query_db}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${basicAuth}`
                    }
                }
            );

            if (response_user.status === 201 || response_user.status === 200) {
                console.log('调用Jenkins创建数据库成功');
            } else {
                console.error('调用Jenkins创建数据库失败:', response_user.status, response_user);
            }

        }, 7000);

        return NextResponse.json(database, { status: 201 });
    } catch (error) {
        console.error('创建数据库错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}