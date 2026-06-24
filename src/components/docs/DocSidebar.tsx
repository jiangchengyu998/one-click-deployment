export default function DocSidebar({
                                       steps,
                                       activeId,
                                   }: {
    steps: { id: string; title: string; number: number }[];
    activeId: string;
}) {
    return (
        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm max-md:-mx-4 max-md:rounded-none max-md:border-x-0 max-md:p-4 max-md:shadow-none md:sticky md:top-20 md:w-64">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 max-md:mb-3 max-md:tracking-normal">目录</h2>
            <ul className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-2 md:overflow-visible md:pb-0">
                {steps.map((s) => (
                    <li key={s.id} className="shrink-0 md:shrink">
                        <a
                            href={`#${s.id}`}
                            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium leading-6 transition-colors duration-150 md:items-start md:gap-3 md:rounded-md md:py-2.5 ${
                                activeId === s.id
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                            }`}
                        >
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs md:mt-0.5 ${
                                activeId === s.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                            }`}>
                                {s.number}
                            </span>
                            <span className="whitespace-nowrap md:whitespace-normal">{s.title}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
