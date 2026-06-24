export default function DocHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <header className="mb-8 border-b border-gray-200 pb-7 max-md:mb-5 max-md:pb-5">
            <a href="/docs" className="mb-5 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 max-md:mb-4">
                <i className="fas fa-arrow-left mr-2"></i>返回文档中心
            </a>
            <h1 className="mb-3 text-4xl font-bold tracking-normal text-gray-950 max-md:text-3xl max-sm:text-2xl">{title}</h1>
            {subtitle && <p className="max-w-3xl text-lg leading-8 text-gray-600 max-md:text-base max-md:leading-7">{subtitle}</p>}
        </header>
    );
}
