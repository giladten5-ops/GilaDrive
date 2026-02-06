// one func to handle all CRUD operations
export async function apiRequest(path, method = "GET", body, headers = {}, withAuth = false) {
    const config = {
        method,
        headers: { ...headers },
    };
    if (withAuth && typeof window !== "undefined") {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    if (body !== undefined) {
        config.headers["Content-Type"] = "application/json";
        config.body = JSON.stringify(body);
    }
    const base = typeof process !== "undefined" ? process.env.REACT_APP_API_BASE || "" : "";
    const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const url = normalizedBase ? `${normalizedBase}${path}` : path;
    const response = await fetch(url, config);
    let data = null;
    try {
        data = await response.json();
    } catch { }

    if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        if (response.status === 413) {
            msg = "HTTP 413 (Payload Too Large).";
        }
        if (data && data.error) {
            msg = data.error;
        }
        throw new Error(msg);
    }
    return data;
}



// sends a POST request to our node backend to register a new user
export async function registerUser({ username, name, image, password }) {
    return apiRequest("/api/users", "POST", { username, name, image, password });
}

export async function loginUser({ username, password }) {
    return apiRequest("/api/tokens", "POST", { username, password });
}

export async function listFiles(filters = {}) {
    //filters can be { parentId: 'some folder id', view: 'trash/starred/shared/...' }
    const params = new URLSearchParams(filters).toString();
    const path = params ? `/api/files?${params}` : "/api/files";

    return apiRequest(path, "GET", undefined, {}, true);
}

export async function uploadFile(fileData) {
    return apiRequest("/api/files", "POST", fileData, {}, true);
}

export async function getFile(fileId) {
    return apiRequest(`/api/files/${fileId}`, "GET", undefined, {}, true);
}

export async function updateFile(fileId, updates) {
    return apiRequest(`/api/files/${fileId}`, "PATCH", updates, {}, true);
}

export async function deleteFile(fileId) {
    return apiRequest(`/api/files/${fileId}`, "DELETE", undefined, {}, true);
}

export async function starFile(fileId) {
    return apiRequest(`/api/files/${fileId}/star`, "POST", undefined, {}, true);
}

export async function unstarFile(fileId) {
    return apiRequest(`/api/files/${fileId}/star`, "DELETE", undefined, {}, true);
}

export async function getUserId(username) {
  return apiRequest(`/api/users?username=${encodeURIComponent(username)}`, "GET", undefined, {}, true);
}

export async function addPermission(fileId, body) {
    return apiRequest(`/api/files/${fileId}/permissions`, "POST", body, {}, true);
}

export async function searchFiles(query) {
    const q = encodeURIComponent(String(query ?? "").trim());
    if (!q) {
        return [];
    }
    return apiRequest(`/api/search/${q}`, "GET", undefined, {}, true);
}
export async function updateUserImage(userId, image) {
    return apiRequest(`/api/users/${userId}`, "PATCH", { image }, {}, true);
}
