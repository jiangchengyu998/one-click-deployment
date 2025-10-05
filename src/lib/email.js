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
export async function sendDeployInfoEmail(email, status, apiName,apiId) {

    const mailOptions = {
        from: `"云朵平台" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: `您的API-[${apiName}]的状态为[${status}] - 云朵平台`,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin-bottom: 10px;">云朵平台 API 状态通知</h1>
    </div>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
        <h2 style="color: #495057; margin-top: 0;">API 信息概览</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; color: #6c757d; width: 100px;">API 名称:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${apiName}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #6c757d;">当前状态:</td>
                <td style="padding: 8px 0;">
                    <span style="padding: 4px 12px; border-radius: 4px; font-weight: bold; 
                        background-color: ${status === 'RUNNING' ? '#d4edda' : '#f8d7da'}; 
                        color: ${status === 'RUNNING' ? '#155724' : '#721c24'};">
                        ${status}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    ${status === 'RUNNING' ? `
    <div style="background-color: #e7f3ff; padding: 20px; border-radius: 6px; margin-bottom: 25px; text-align: center;">
        <h3 style="color: #004085; margin-top: 0;">🎉 您的API已成功运行！</h3>
        <p style="color: #004085; margin-bottom: 20px;">现在您可以访问以下链接来使用您的API：</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/apis/${apiId}" 
           style="display: inline-block; background-color: #007bff; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                  font-weight: bold; margin: 10px 0;">
           🔗 访问API服务
        </a>
        <p style="color: #6c757d; font-size: 14px; margin-top: 10px;">
            如果按钮无法点击，请复制以下链接：<br>
            <span style="color: #007bff;">${process.env.NEXTAUTH_URL}/dashboard/apis/${apiId}</span>
        </p>
    </div>
    ` : `
    <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
        <h3 style="color: #856404; margin-top: 0;">⚠️ 需要您的关注</h3>
        <p style="color: #856404; margin-bottom: 15px;">
            您的API当前状态为 <strong>${status}</strong>，建议您查看详细日志以了解具体情况。
        </p>
        <div style="text-align: center; margin-top: 15px;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/apis/${apiId}" 
               style="display: inline-block; background-color: #ffc107; color: #212529; 
                      padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                      font-weight: bold;">
               📊 查看详细日志
            </a>
        </div>
        <p style="color: #6c757d; font-size: 14px; margin-top: 15px;">
            如果按钮无法点击，请访问：<br>
            <span style="color: #007bff;">${process.env.NEXTAUTH_URL}/dashboard/apis/${apiId}</span>
        </p>
    </div>
    `}

    <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; color: #6c757d; font-size: 14px;">
        <p>感谢您使用云朵平台！如有任何问题，请随时联系我们。</p>
        <p style="margin-bottom: 5px;">云朵平台</p>
    </div>
</div>
`,
    };

    await transporter.sendMail(mailOptions);
}