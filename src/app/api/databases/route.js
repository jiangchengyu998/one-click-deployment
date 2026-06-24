// src/app/api/databases/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
    createDatabaseForUser,
    databaseSafeSelect,
    validateDatabaseCredentials
} from '@/lib/databaseProvisioning';
import { createLogger, getRequestContext } from '@/lib/logger';

const logger = createLogger('api.databases');

// 获取当前用户的数据库列表
export async function GET(request) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const databases = await prisma.database.findMany({
            where: { userId: session.id },
            select: databaseSafeSelect,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(databases);
    } catch (error) {
        requestLogger.error('database.list.failed', { error });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 创建新数据库
export async function POST(request) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { name, username, password } = await request.json();
        const databaseLogger = requestLogger.child({
            userId: session.id,
            databaseName: name,
            username,
        });

        const validationError = validateDatabaseCredentials({ name, username, password });
        if (validationError) {
            databaseLogger.warn('database.create.validation_failed', {
                reason: validationError,
            });
            return NextResponse.json(
                { error: validationError },
                { status: 400 }
            );
        }

        // 检查用户配额
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            include: { _count: { select: { databases: true } } }
        });

        if (user._count.databases >= user.dbQuota) {
            databaseLogger.warn('database.create.quota_exceeded', {
                currentDatabaseCount: user._count.databases,
                dbQuota: user.dbQuota,
            });
            return NextResponse.json(
                { error: '已达到数据库配额限制' },
                { status: 400 }
            );
        }

        const database = await createDatabaseForUser({
            userId: session.id,
            name,
            username,
            password
        });
        databaseLogger.info('database.create.record_created', {
            databaseId: database.id,
            status: database.status,
        });

        return NextResponse.json(database, { status: 201 });
    } catch (error) {
        requestLogger.error('database.create.failed', { error });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
