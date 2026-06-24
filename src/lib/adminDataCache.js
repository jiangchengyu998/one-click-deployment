const cache = new Map();
const inFlight = new Map();

export function getAdminCachedData(key) {
    return cache.get(key);
}

export function setAdminCachedData(key, data) {
    cache.set(key, data);
}

export function clearAdminCachedData(key) {
    cache.delete(key);
}

export async function fetchAdminJson(key, url, { force = false } = {}) {
    if (!force && cache.has(key)) {
        return cache.get(key);
    }

    if (!force && inFlight.has(key)) {
        return inFlight.get(key);
    }

    const request = fetch(url, {
        cache: 'no-store',
        credentials: 'include',
    }).then(async (response) => {
        if (response.status === 401) {
            const error = new Error('Unauthorized');
            error.status = 401;
            throw error;
        }

        if (!response.ok) {
            const error = new Error('Request failed');
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        cache.set(key, data);
        return data;
    }).finally(() => {
        inFlight.delete(key);
    });

    inFlight.set(key, request);
    return request;
}
