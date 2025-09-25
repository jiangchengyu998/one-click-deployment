"use client";
export default function Workflow() {
    const steps = [
        { number: '1', title: '注册账户', description: '创建您的云朵平台账户' },
        { number: '2', title: '创建数据库', description: '一键生成数据库实例和凭据' },
        { number: '3', title: '部署API', description: '提供GitHub地址，选择部署配置' },
        { number: '4', title: '访问应用', description: '通过专属域名访问您的API' }
    ]

    return (
        <section id="workflow" className="workflow">
            <div className="container">
                <div className="section-title">
                    <h2>简单四步，快速部署</h2>
                    <p>无需复杂配置，只需简单几步即可完成应用部署</p>
                </div>
                <div className="steps">
                    {steps.map((step, index) => (
                        <div key={index} className="step">
                            <div className="step-number">{step.number}</div>
                            <h4>{step.title}</h4>
                            <p>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
        .workflow {
          padding: 80px 0;
          background: var(--white);
        }
        
        .steps {
          display: flex;
          justify-content: space-between;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }
        
        .steps::before {
          content: '';
          position: absolute;
          top: 40px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #e0e0e0;
          z-index: 1;
        }
        
        .step {
          text-align: center;
          position: relative;
          z-index: 2;
          flex: 1;
        }
        
        .step-number {
          width: 80px;
          height: 80px;
          background: var(--primary-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: var(--white);
          font-size: 30px;
          font-weight: bold;
        }
        
        .step h4 {
          margin-bottom: 10px;
          font-size: 18px;
        }
        
        .step p {
          color: var(--light-text);
        }
        
        @media (max-width: 968px) {
          .steps {
            flex-direction: column;
          }
          
          .steps::before {
            display: none;
          }
          
          .step {
            margin-bottom: 40px;
          }
        }
      `}</style>
        </section>
    )
}