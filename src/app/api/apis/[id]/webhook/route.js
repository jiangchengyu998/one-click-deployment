import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 重新部署API
export async function POST(request, { params }) {
    try {

        const { id } = await params;

        // 获取参数
        const { apiStatus,jobId } = await request.json();
        console.log('接收到的参数:', { id, apiStatus,jobId });

        // 检查API是否存在
        const api = await prisma.api.findUnique({
            where: { id: id }
        });

        if (!api) {
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        // 更新API状态
        await prisma.api.update({
            where: { id: id },
            data: {
                status: apiStatus,
                lastJobId: jobId,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ message: 'API状态更新成功' });
    } catch (error) {
        console.error('更新API状态错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}