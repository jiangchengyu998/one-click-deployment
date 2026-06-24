import { timingSafeEqual } from 'crypto';

export const WEBHOOK_SECRET_HEADER = 'x-webhook-secret';

export function getWebhookSecretConfigState() {
    return {
        hasWebhookSecret: !!process.env.WEBHOOK_SECRET,
    };
}

export function getRequiredWebhookSecret() {
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
        throw new Error('WEBHOOK_SECRET未配置');
    }

    return secret;
}

export function isValidWebhookSecret(providedSecret) {
    const expectedSecret = process.env.WEBHOOK_SECRET;
    if (!expectedSecret || !providedSecret) {
        return false;
    }

    const expected = Buffer.from(expectedSecret);
    const provided = Buffer.from(providedSecret);
    if (expected.length !== provided.length) {
        return false;
    }

    return timingSafeEqual(expected, provided);
}
