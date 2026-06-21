"use client";

export default function LoadingSkeleton({
    rows = 3,
    itemClassName = 'h-24',
    showToolbar = true,
    gridClassName = '',
}) {
    const items = [...Array(rows)];
    const wrapperClassName = gridClassName || 'space-y-3';

    return (
        <div className="p-6">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                {showToolbar && <div className="h-12 bg-gray-200 rounded mb-4"></div>}
                <div className={wrapperClassName}>
                    {items.map((_, index) => (
                        <div key={index} className={`${itemClassName} bg-gray-200 rounded`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
