// src/lib/auth.js
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null
    }
}

export async function hashPassword(password) {
    return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
}

// 获取用户会话
export async function getUserSession(request) {
    try {
        console.log('Getting user session')
        const token = request.cookies.get('user-token')?.value

        if (!token) {
            return null
        }

        const decoded = verifyToken(token)
        console.log('Decoded user token:', decoded)
        if (!decoded || decoded.role !== 'user') {
            return null
        }

        return decoded
    } catch (error) {
        return null
    }
}

// 获取管理员会话
export async function getAdminSession(request) {
    try {
        const token = request.cookies.get('admin-token')?.value

        if (!token) {
            return null
        }

        const decoded = verifyToken(token)
        if (!decoded || decoded.role !== 'admin') {
            return null
        }

        return decoded
    } catch (error) {
        return null
    }
}

// 获取服务端会话
export async function getServerSession(request) {
    // 这里需要根据您的认证方案实现
    // 例如从cookie或header中获取token并验证
    try {

        console.log('Getting server session')

        const token = request.cookies.get('user-token')?.value

        // debugging
        console.log('Token from cookies:', token)
        if (!token) {
            return null
        }

        const decoded = verifyToken(token)
        console.log('Decoded token:', decoded)
        if (!decoded || decoded.role !== 'user') {
            return null
        }

        return decoded
    } catch (error) {
        return null
    }
}