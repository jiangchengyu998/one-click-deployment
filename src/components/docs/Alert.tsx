/* 通用提示框 */
export default function Alert({ type, text }: { type: "info" | "success" | "warning"; text: string }) {
    const styles = {
        info: "bg-blue-50 border-blue-500 text-blue-800",
        success: "bg-green-50 border-green-500 text-green-800",
        warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
    };
    return (
        <div className={`border-l-4 p-4 mb-6 ${styles[type]}`}>
            <p>{text}</p>
        </div>
    );
}