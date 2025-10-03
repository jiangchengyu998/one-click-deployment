// src/app/api/admin/apis/[apiId]/api-infors/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 为指定 API 添加部署信息
export async function POST(request, { params }) {
    try {
        // 验证管理员权限
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        const { apiId } = params;
        const { serverIp, serverPort, execNode } = await request.json();

        // 验证输入
        if (!serverIp || !serverPort || !execNode) {
            return NextResponse.json(
                { error: '服务器IP、端口和执行节点为必填项' },
                { status: 400 }
            );
        }

        // 检查 API 是否存在
        const existingApi = await prisma.api.findUnique({
            where: { id: apiId }
        });

        if (!existingApi) {
            return NextResponse.json(
                { error: 'API未找到' },
                { status: 404 }
            );
        }

        // 检查是否已存在相同的部署信息
        const existingApiInfor = await prisma.apiInfor.findFirst({
            where: {
                apiId,
                serverIp,
                serverPort: parseInt(serverPort)
            }
        });

        if (existingApiInfor) {
            return NextResponse.json(
                { error: '该服务器和端口已存在部署信息' },
                { status: 409 }
            );
        }

        // 创建新的部署信息
        const newApiInfor = await prisma.apiInfor.create({
            data: {
                apiId,
                serverIp,
                serverPort: parseInt(serverPort),
                execNode
            },
            include: {
                apis: {
                    select: {
                        id: true,
                        name: true,
                        domain: true
                    }
                }
            }
        });

        return NextResponse.json(newApiInfor, { status: 201 });
    } catch (error) {
        console.error('添加部署信息错误:', error);

        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: '关联的API不存在' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 获取指定 API 的所有部署信息
export async function GET(request, { params }) {
    try {
        // 验证管理员权限
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        const { apiId } = params;

        // 查询该 API 的所有部署信息
        const apiInfors = await prisma.apiInfor.findMany({
            where: { apiId },
            orderBy: { createdAt: 'desc' },
            include: {
                apis: {
                    select: {
                        id: true,
                        name: true,
                        domain: true
                    }
                }
            }
        });

        return NextResponse.json(apiInfors);
    } catch (error) {
        console.error('获取API部署信息列表错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}