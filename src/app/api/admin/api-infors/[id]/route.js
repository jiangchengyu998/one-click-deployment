// src/app/api/admin/api-infors/[id]/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取单个 ApiInfor 详情
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

        const { id } = params;

        // 查询单个 ApiInfor
        const apiInfor = await prisma.apiInfor.findUnique({
            where: { id },
            include: {
                apis: {
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!apiInfor) {
            return NextResponse.json(
                { error: '部署信息未找到' },
                { status: 404 }
            );
        }

        return NextResponse.json(apiInfor);
    } catch (error) {
        console.error('获取部署信息详情错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 更新 ApiInfor
export async function PATCH(request, { params }) {
    try {
        // 验证管理员权限
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        const { id } = params;
        const { serverIp, serverPort, execNode } = await request.json();

        // 验证输入
        if (!serverIp || !serverPort || !execNode) {
            return NextResponse.json(
                { error: '服务器IP、端口和执行节点为必填项' },
                { status: 400 }
            );
        }

        // 检查部署信息是否存在
        const existingApiInfor = await prisma.apiInfor.findUnique({
            where: { id }
        });

        if (!existingApiInfor) {
            return NextResponse.json(
                { error: '部署信息未找到' },
                { status: 404 }
            );
        }

        // 更新部署信息
        const updatedApiInfor = await prisma.apiInfor.update({
            where: { id },
            data: {
                serverIp,
                serverPort: parseInt(serverPort),
                execNode,
                updatedAt: new Date()
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

        // 要调用pipeline修改相应的数据  todo

        return NextResponse.json(updatedApiInfor);
    } catch (error) {
        console.error('更新部署信息错误:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: '部署信息未找到' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 删除 ApiInfor
export async function DELETE(request, { params }) {
    try {
        // 验证管理员权限
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        const { id } = params;

        // 检查部署信息是否存在
        const existingApiInfor = await prisma.apiInfor.findUnique({
            where: { id }
        });

        if (!existingApiInfor) {
            return NextResponse.json(
                { error: '部署信息未找到' },
                { status: 404 }
            );
        }

        // 删除部署信息
        await prisma.apiInfor.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: '部署信息删除成功'
        });
    } catch (error) {
        console.error('删除部署信息错误:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: '部署信息未找到' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}