// scripts/seed.js
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
    // 创建默认管理员
    const adminPassword = await hashPassword('admin')
    await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
            avatar: null,
        },
    })

    console.log('数据库种子数据创建完成')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })