import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 查询所有
export async function GET() {
    const list = await prisma.apiInfor.findMany();
    return NextResponse.json(list);
}

// 新增
export async function POST(request) {
    const data = await request.json();
    const info = await prisma.apiInfor.create({ data });
    return NextResponse.json(info);
}

// 创建API
// export async function POST(request) {
//     const data = await request.json();
//     const api = await prisma.api.create({ data });
//
//     // 插入api_infor
//     await prisma.apiInfor.create({
//         data: {
//             apiId: api.id,
//             serverIp: '127.0.0.1', // 默认值，可根据实际需求调整
//             serverPort: 3000,
//             execNode: 'default',
//         }
//     });
//
//     return NextResponse.json(api);
// }