import { randomUUID } from 'crypto';

const SENSITIVE_KEY_PATTERN = /(password|passwd|pwd|secret|token|authorization|auth|credential|cookie|session|key)/i;
const SENSITIVE_VALUE_PATTERN = /(Bearer\s+|Basic\s+)[A-Za-z0-9._~+/=-]+/gi;
const REDACTED = '[REDACTED]';
const MAX_STRING_LENGTH = 1000;
const MAX_ARRAY_LENGTH = 20;
const MAX_OBJECT_DEPTH = 5;

function redactString(value) {
    const text = value.length > MAX_STRING_LENGTH
        ? `${value.slice(0, MAX_STRING_LENGTH)}...`
        : value;

    return text.replace(SENSITIVE_VALUE_PATTERN, `$1${REDACTED}`);
}

function sanitize(value, depth = 0) {
    if (value == null) {
        return value;
    }

    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : value.stack,
            cause: value.cause ? sanitize(value.cause, depth + 1) : undefined,
        };
    }

    if (typeof Response !== 'undefined' && value instanceof Response) {
        return {
            status: value.status,
            statusText: value.statusText,
            ok: value.ok,
            url: sanitizeUrl(value.url),
        };
    }

    if (typeof value === 'string') {
        return redactString(value);
    }

    if (typeof value !== 'object') {
        return value;
    }

    if (depth >= MAX_OBJECT_DEPTH) {
        return '[MaxDepth]';
    }

    if (Array.isArray(value)) {
        return value.slice(0, MAX_ARRAY_LENGTH).map(item => sanitize(item, depth + 1));
    }

    const output = {};
    for (const [key, entry] of Object.entries(value)) {
        output[key] = SENSITIVE_KEY_PATTERN.test(key)
            ? REDACTED
            : sanitize(entry, depth + 1);
    }

    return output;
}

function sanitizeUrl(value) {
    if (!value) {
        return value;
    }

    try {
        const url = new URL(value);
        for (const key of url.searchParams.keys()) {
            if (SENSITIVE_KEY_PATTERN.test(key)) {
                url.searchParams.set(key, REDACTED);
            }
        }
        return url.toString();
    } catch {
        return sanitize(value);
    }
}

function writeLog(level, scope, event, context = {}) {
    const record = {
        timestamp: new Date().toISOString(),
        level,
        scope,
        event,
        ...sanitize(context),
    };

    const line = JSON.stringify(record);
    if (level === 'ERROR') {
        console.error(line);
    } else if (level === 'WARN') {
        console.warn(line);
    } else if (level === 'DEBUG') {
        console.debug(line);
    } else {
        console.log(line);
    }
}

export function createLogger(scope, baseContext = {}) {
    return {
        child(extraContext = {}) {
            return createLogger(scope, { ...baseContext, ...extraContext });
        },
        debug(event, context = {}) {
            writeLog('DEBUG', scope, event, { ...baseContext, ...context });
        },
        info(event, context = {}) {
            writeLog('INFO', scope, event, { ...baseContext, ...context });
        },
        warn(event, context = {}) {
            writeLog('WARN', scope, event, { ...baseContext, ...context });
        },
        error(event, context = {}) {
            writeLog('ERROR', scope, event, { ...baseContext, ...context });
        },
    };
}

export function getRequestContext(request) {
    const requestId = request?.headers?.get('x-request-id')
        || request?.headers?.get('x-correlation-id')
        || randomUUID();

    return {
        requestId,
        method: request?.method,
        path: request?.nextUrl?.pathname || (request?.url ? new URL(request.url).pathname : undefined),
    };
}

export function getJenkinsConfigState() {
    return {
        hasJenkinsUrl: !!process.env.JENKINS_URL,
        hasJenkinsUser: !!process.env.JENKINS_USER,
        hasJenkinsToken: !!process.env.JENKINS_TOKEN,
    };
}
