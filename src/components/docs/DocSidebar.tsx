export default function DocSidebar({
                                       steps,
                                       activeId,
                                   }: {
    steps: { id: string; title: string; number: number }[];
    activeId: string;
}) {
    return (
        <aside className="md:w-64 bg-white rounded-lg shadow p-6 h-fit sticky top-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">内容导航</h2>
            <ul className="space-y-3">
                {steps.map((s) => (
                    <li key={s.id}>
                        <a
                            href={`#${s.id}`}
                            className={`block px-3 py-2 rounded-md font-medium transition-colors duration-150 ${
                                activeId === s.id
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                            }`}
                        >
                            步骤{s.number}：{s.title}
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
