// src/lib/utils.js
export function generateUserCode() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let code = '';

    // 生成2位代码（可扩展为3-4位）
    for (let i = 0; i < 2; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    return code;
}

// 检查代码是否唯一
export async function isCodeUnique(code) {
    const existingUser = await prisma.user.findUnique({
        where: { code }
    });

    return !existingUser;
}

// 格式化日期
export function formatDate(date) {
    return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 验证邮箱格式
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}