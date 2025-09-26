// src/app/api/admin/apis/[id]/logs/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

// 获取API日志（管理员）
export async function GET(request, { params }) {
    try {
        const session = await getAdminSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // 在实际应用中，这里应该从日志服务获取真实的日志
        // 这里返回模拟日志
        const mockLogs = [
            {
                timestamp: new Date(Date.now() - 300000),
                level: 'INFO',
                message: 'API部署开始'
            },
            {
                timestamp: new Date(Date.now() - 240000),
                level: 'INFO',
                message: '拉取代码仓库'
            },
            {
                timestamp: new Date(Date.now() - 180000),
                level: 'INFO',
                message: '构建Docker镜像'
            },
            {
                timestamp: new Date(Date.now() - 120000),
                level: 'INFO',
                message: '推送镜像到仓库'
            },
            {
                timestamp: new Date(Date.now() - 60000),
                level: 'INFO',
                message: '部署到运行环境'
            },
            {
                timestamp: new Date(),
                level: 'INFO',
                message: 'API部署完成'
            }
        ];

        return NextResponse.json(mockLogs);
    } catch (error) {
        console.error('获取API日志错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}