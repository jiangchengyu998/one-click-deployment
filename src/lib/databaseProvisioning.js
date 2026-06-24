import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createLogger, getJenkinsConfigState } from '@/lib/logger';

const DATABASE_NAME_MAX_LENGTH = 64;
const DATABASE_USER_MAX_LENGTH = 32;
const MYSQL_IDENTIFIER_PATTERN = /^[A-Za-z0-9_]+$/;
const JENKINS_DELAY_MS = 7000;
const logger = createLogger('database.provisioning');

export const databaseSafeSelect = {
    id: true,
    userId: true,
    name: true,
    username: true,
    host: true,
    status: true,
    createdAt: true,
    updatedAt: true
};

export const databaseWithUserSafeSelect = {
    ...databaseSafeSelect,
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            code: true
        }
    }
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function normalizeIdentifierPart(value, fallback = '') {
    const normalized = String(value || '')
        .trim()
        .normalize('NFKD')
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');

    return normalized || fallback;
}

export function buildDefaultDatabaseName(user) {
    const codePart = normalizeIdentifierPart(user?.code) || 'db';
    const prefix = `${codePart}_`;
    const namePartMaxLength = Math.max(DATABASE_NAME_MAX_LENGTH - prefix.length, 1);
    const namePart = normalizeIdentifierPart(user?.name, 'user').slice(0, namePartMaxLength);

    return `${prefix}${namePart}`.slice(0, DATABASE_NAME_MAX_LENGTH);
}

export function buildDefaultDatabaseCredentials(user, password) {
    const name = buildDefaultDatabaseName(user);

    return {
        name,
        username: name.slice(0, DATABASE_USER_MAX_LENGTH),
        password
    };
}

export function validateDatabaseCredentials({ name, username, password }) {
    if (!name || !username || !password) {
        return '所有字段都是必填的';
    }

    if (name.length > DATABASE_NAME_MAX_LENGTH) {
        return `数据库名称不能超过 ${DATABASE_NAME_MAX_LENGTH} 个字符`;
    }

    if (username.length > DATABASE_USER_MAX_LENGTH) {
        return `数据库用户名不能超过 ${DATABASE_USER_MAX_LENGTH} 个字符`;
    }

    if (!MYSQL_IDENTIFIER_PATTERN.test(name) || !MYSQL_IDENTIFIER_PATTERN.test(username)) {
        return '数据库名称和用户名只能包含字母、数字和下划线';
    }

    return null;
}

export async function createDatabaseRecord({ userId, name, username, password }) {
    const validationError = validateDatabaseCredentials({ name, username, password });

    if (validationError) {
        throw new Error(validationError);
    }

    return prisma.database.create({
        data: {
            name,
            username,
            password: await hashPassword(password),
            apiPassword: '',
            host: process.env.NEXT_PUBLIC_MAIN_DOMAIN || '',
            userId,
            status: 'CREATING'
        },
        select: databaseSafeSelect
    });
}

async function triggerJenkinsJob(jobName, params) {
    const pipelineUrl = process.env.JENKINS_URL;
    const jenkinsUser = process.env.JENKINS_USER;
    const jenkinsToken = process.env.JENKINS_TOKEN;
    const jobLogger = logger.child({ jobName });

    if (!pipelineUrl || !jenkinsUser || !jenkinsToken) {
        jobLogger.error('database.jenkins_config_missing', getJenkinsConfigState());
        throw new Error('Jenkins 配置不完整，无法创建数据库');
    }

    const query = new URLSearchParams(params).toString();
    const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');
    const startedAt = Date.now();
    jobLogger.info('database.jenkins_job.started', {
        paramKeys: Object.keys(params),
    });
    const response = await fetch(
        `${pipelineUrl}/job/${jobName}/buildWithParameters?${query}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Basic ${basicAuth}`
            }
        }
    );

    if (response.status !== 200 && response.status !== 201) {
        jobLogger.error('database.jenkins_job.failed', {
            jenkinsStatus: response.status,
            jenkinsStatusText: response.statusText,
            durationMs: Date.now() - startedAt,
        });
        throw new Error(`Jenkins Job ${jobName} 触发失败: ${response.status} ${response.statusText}`);
    }

    jobLogger.info('database.jenkins_job.succeeded', {
        jenkinsStatus: response.status,
        jenkinsStatusText: response.statusText,
        durationMs: Date.now() - startedAt,
    });
}

async function provisionMysqlDatabase({ databaseId, name, username, password }) {
    const provisionLogger = logger.child({
        databaseId,
        databaseName: name,
        username,
    });
    provisionLogger.info('database.provision.started');

    await triggerJenkinsJob('create_mysql_user', {
        MYSQL_USER: username,
        MYSQL_PASSWORD: password
    });

    await delay(JENKINS_DELAY_MS);

    await triggerJenkinsJob('create_mysql_database', {
        MYSQL_USER: username,
        DB_NAME: name
    });

    await prisma.database.update({
        where: { id: databaseId },
        data: { status: 'RUNNING' }
    });
    provisionLogger.info('database.provision.completed', {
        status: 'RUNNING',
    });
}

export function startDatabaseProvisioning(database) {
    setTimeout(async () => {
        const provisionLogger = logger.child({
            databaseId: database.databaseId,
            databaseName: database.name,
            username: database.username,
        });
        try {
            await provisionMysqlDatabase(database);
            provisionLogger.info('database.provision.async_completed');
        } catch (error) {
            provisionLogger.error('database.provision.failed', { error });
            try {
                await prisma.database.update({
                    where: { id: database.databaseId },
                    data: { status: 'ERROR' }
                });
                provisionLogger.info('database.provision.status_updated', {
                    status: 'ERROR',
                });
            } catch (updateError) {
                provisionLogger.error('database.provision.status_update_failed', {
                    error: updateError,
                });
            }
        }
    }, 0);
}

export async function createDatabaseForUser({ userId, name, username, password }) {
    const database = await createDatabaseRecord({ userId, name, username, password });

    startDatabaseProvisioning({
        databaseId: database.id,
        name: database.name,
        username: database.username,
        password
    });

    return database;
}
