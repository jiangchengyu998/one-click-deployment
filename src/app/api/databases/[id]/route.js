// src/app/api/databases/[id]/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { databaseWithUserSafeSelect } from '@/lib/databaseProvisioning';
import { createLogger, getJenkinsConfigState, getRequestContext } from '@/lib/logger';

const logger = createLogger('api.databases.detail');

// 获取数据库详情
export async function GET(request, { params }) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;
        const databaseLogger = requestLogger.child({
            databaseId: id,
            userId: session.id,
        });

        const database = await prisma.database.findFirst({
            where: {
                id: id,
                userId: session.id,
            },
            select: databaseWithUserSafeSelect
        });

        if (!database) {
            databaseLogger.warn('database.detail.not_found_or_forbidden');
            return NextResponse.json({ error: '数据库不存在' }, { status: 404 });
        }

        return NextResponse.json(database);
    } catch (error) {
        requestLogger.error('database.detail.failed', { error });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 删除数据库
export async function DELETE(request, { params }) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;
        const databaseLogger = requestLogger.child({
            databaseId: id,
            userId: session.id,
        });


        // 检查数据库是否存在
        const database = await prisma.database.findFirst({
            where: {
                id: id,
                userId: session.id,
            }
        });

        if (!database) {
            databaseLogger.warn('database.delete.not_found_or_forbidden');
            return NextResponse.json({ error: '数据库不存在' }, { status: 404 });
        }

        // 删除数据库
        await prisma.database.delete({
            where: { id: id }
        });
        databaseLogger.info('database.delete.record_deleted', {
            databaseName: database.name,
            username: database.username,
        });

        const pipelineUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        if (!pipelineUrl || !jenkinsUser || !jenkinsToken) {
            databaseLogger.error('database.delete.jenkins_config_missing', getJenkinsConfigState());
            throw new Error('Jenkins配置不完整');
        }
        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');

        // 1. 调用http://192.168.101.51:8080/job/delete_mysql_database_and_user/ pipeline 删除数据库和用户
        // 构建参数字符串
        const query = new URLSearchParams({
            DB_NAME: database.name,
            MYSQL_USER: database.username,
            MYSQL_PASSWORD: ''
        }).toString();

        const response = await fetch(
            `${pipelineUrl}/job/delete_mysql_database_and_user/buildWithParameters?${query}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${basicAuth}`
                }
            }
        );

        if (response.status === 201 || response.status === 200) {
            databaseLogger.info('database.delete.jenkins_triggered', {
                jobName: 'delete_mysql_database_and_user',
                jenkinsStatus: response.status,
                jenkinsStatusText: response.statusText,
            });
        } else {
            databaseLogger.error('database.delete.jenkins_trigger_failed', {
                jobName: 'delete_mysql_database_and_user',
                jenkinsStatus: response.status,
                jenkinsStatusText: response.statusText,
            });
        }

        return NextResponse.json({ message: '数据库删除成功' });
    } catch (error) {
        requestLogger.error('database.delete.failed', { error });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
