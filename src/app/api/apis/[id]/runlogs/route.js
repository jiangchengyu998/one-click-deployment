// src/pages/api/apis/[id]/route.js
import fetch from 'node-fetch';
import { prisma } from '@/lib/db';

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        // 从数据库查一下 api.name (这里假设你已有获取逻辑)
        // 检查 API 是否存在
        const api = await prisma.api.findUnique({
            where: { id: id }
        });

        const user = await prisma.user.findUnique({
            where: { id: api.userId }
        });

        const apiName = api.name + "-" + user.code;
        console.log(apiName);

        const response = await fetch(`${process.env.SMTP_USER}/logs/${apiName}.log`);
        if (!response.ok) {
            return res.status(response.status).json({ error: '获取运行日志失败' });
        }

        const text = await response.text();
        // console.log(text);
        const logs = text.split("\n").filter(Boolean);
        // 按行分割
        return Response.json({ logs }); // ✅ App Router 的写法
    } catch (error) {
        console.error(error);
        return Response.json({ error: "内部错误" }, { status: 500 }); // ✅
    }
}
