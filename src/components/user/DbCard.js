// src/components/user/DbCard.js
"use client";

export default function DbCard({ database, onDelete, onView }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'RUNNING': return 'bg-green-100 text-green-800'
            case 'CREATING': return 'bg-yellow-100 text-yellow-800'
            case 'ERROR': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'RUNNING': return '运行中'
            case 'CREATING': return '创建中'
            case 'ERROR': return '错误'
            default: return '未知'
        }
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <i className="fas fa-database text-green-500 text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{database.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{database.host}</p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(database.status)}`}>
            {getStatusText(database.status)}
          </span>
                </div>

                <div className="mt-4">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">用户名:</span> {database.username}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        创建时间: {new Date(database.createdAt).toLocaleDateString()}
                    </p>
                </div>

                <div className="mt-4 flex space-x-3">
                    <button
                        onClick={onView}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <i className="fas fa-eye mr-1"></i> 查看
                    </button>
                    <button
                        onClick={onDelete}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <i className="fas fa-trash mr-1"></i> 删除
                    </button>
                </div>
            </div>
        </div>
    )
}