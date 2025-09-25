// src/components/home/CTA.js
"use client";
import Link from 'next/link';

export default function CTA() {
    return (
        <section id="cta" className="cta">
            <div className="container">
                <div className="cta-content">
                    <h2>立即开始您的部署之旅</h2>
                    <p>加入数千名开发者，体验简单高效的部署流程</p>
                    {/* 修改按钮链接 */}
                    <Link href="/auth/register" className="btn btn-light">免费注册</Link>
                </div>
            </div>
            <style jsx>{`
        .cta {
          padding: 80px 0;
          text-align: center;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: var(--white);
        }
        
        .cta-content h2 {
          font-size: 36px;
          margin-bottom: 20px;
        }
        
        .cta-content p {
          font-size: 18px;
          max-width: 600px;
          margin: 0 auto 30px;
          opacity: 0.9;
        }
        
        @media (max-width: 768px) {
          .cta {
            padding: 60px 0;
          }
          
          .cta-content h2 {
            font-size: 28px;
          }
          
          .cta-content p {
            font-size: 16px;
          }
        }
      `}</style>
        </section>
    )
}