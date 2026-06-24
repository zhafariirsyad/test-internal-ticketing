export const API_BASE_URL = 'http://localhost:3001';

type RequestOptions = RequestInit & {
    token?: string
}

export async function apiFetch(
    endpoint: string,
    options: RequestOptions = {},
){
    const { token, headers, body, ...restOptions } = options
    const isFormData = body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`,{
        ...restOptions,
        body,
        headers: {
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || 'Whoops! Terjadi Kesalahan');
    }

    return data;
}

export function getAttachmentUrl(path?: string | null) {
    if (!path) {
        return '';
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    return `${API_BASE_URL}${path}`;
}
