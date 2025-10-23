export default function DocHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{title}</h1>
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        </header>
    );
}
