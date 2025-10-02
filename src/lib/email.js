// lib/email.js 或您放置邮件配置的文件
import nodemailer from 'nodemailer';

// 创建Nodemailer传输器
const transporter = nodemailer.createTransport({
    host: 'smtp.163.com', // 修改为163邮箱的SMTP服务器
    port: 465, // 使用465端口
    secure: true, // 使用SSL，因为465端口要求secure为true
    auth: {
        user: process.env.SMTP_USER, // 使用环境变量
        pass: process.env.SMTP_PASSWORD, // 使用环境变量
    },
});

export async function sendVerificationEmail(email, verificationToken, name) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`;

    const mailOptions = {
        from: `"云朵平台" <${process.env.SMTP_FROM}>`, // 发件人信息也使用环境变量
        to: email,
        subject: '请验证您的邮箱 - 云朵平台',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">欢迎注册云朵平台</h2>
        <p>尊敬的 ${name}，</p>
        <p>感谢您注册云朵平台账户！请点击下面的链接完成邮箱验证：</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            验证邮箱地址
          </a>
        </div>
        <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
        <p style="word-break: break-all; color: #666;">
          ${verificationUrl}
        </p>
        <p>此验证链接将在24小时内有效。</p>
        <p>如果您没有注册云朵平台账户，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          云朵平台
        </p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
}