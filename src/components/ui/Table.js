// src/components/ui/Table.js
"use client";

export default function Table({ data, columns, className = '' }) {
    return (
        <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg ${className}`}>
            <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                <tr>
                    {columns.map((column, index) => (
                        <th
                            key={column.key}
                            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                index === 0 ? 'pl-6' : ''
                            } ${index === columns.length - 1 ? 'pr-6' : ''}`}
                        >
                            {column.title}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {columns.map((column, colIndex) => (
                            <td
                                key={column.key}
                                className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                                    colIndex === 0 ? 'pl-6' : ''
                                } ${colIndex === columns.length - 1 ? 'pr-6' : ''}`}
                            >
                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}