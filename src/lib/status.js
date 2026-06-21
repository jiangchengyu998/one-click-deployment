const apiStatusMap = {
    RUNNING: { color: 'bg-green-100 text-green-800', text: '运行中' },
    BUILDING: { color: 'bg-yellow-100 text-yellow-800', text: '构建中' },
    PENDING: { color: 'bg-blue-100 text-blue-800', text: '等待中' },
    ERROR: { color: 'bg-red-100 text-red-800', text: '错误' },
};

const databaseStatusMap = {
    RUNNING: { color: 'bg-green-100 text-green-800', text: '运行中' },
    CREATING: { color: 'bg-yellow-100 text-yellow-800', text: '创建中' },
    ERROR: { color: 'bg-red-100 text-red-800', text: '错误' },
};

const defaultStatus = { color: 'bg-gray-100 text-gray-800', text: '未知' };

export function getApiStatusInfo(status) {
    return apiStatusMap[status] || defaultStatus;
}

export function getDatabaseStatusInfo(status) {
    return databaseStatusMap[status] || defaultStatus;
}
