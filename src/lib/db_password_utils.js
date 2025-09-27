import crypto from 'crypto';

const secretKey = process.env.SECRET_KEY;
const iv = Buffer.alloc(16, 0); // 初始化向量，实际项目可随机生成并存储

if (!secretKey || Buffer.from(secretKey).length !== 32) {
    console.log('SECRET_KEY:', secretKey);
    throw new Error('SECRET_KEY 必须是 32 字节长度');
}

export function encryptPassword(password) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export function decryptPassword(encryptedPassword) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}