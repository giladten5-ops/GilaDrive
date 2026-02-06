import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../config/config.js";

const TOKEN_KEY = "token";

/**
 * TOKEN MANAGEMENT
 * These helpers handle the local storage of the JWT token.
 */
export async function getToken() {
    return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken() {
     await AsyncStorage.removeItem(TOKEN_KEY);
}

/**
 * UNIVERSAL API REQUEST HANDLER
 * This handles the repetitive work of setting headers, attaching tokens, 
 * and parsing the JSON response.
 */
export async function apiRequest(path, method = "GET", body, headers = {}, withAuth = false) {
    const config = {
        method,
        headers: { ...headers },
    };

    // Automatically attach the Bearer token if the request requires authentication
    if (withAuth) {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    if (body !== undefined) {
        config.headers["Content-Type"] = "application/json";
        config.body = JSON.stringify(body);
    }

    const normalizedBase = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
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

// --- AUTHENTICATION ---

export async function registerUser({ username, name, image, password }) {
    return apiRequest("/api/users", "POST", { username, name, image, password });
}

export async function loginUser({ username, password }) {
    return apiRequest("/api/tokens", "POST", { username, password });
}

// --- FILE OPERATIONS ---

export async function listFiles(filters = {}) {
    // Converts an object like { parentId: '123' } into a query string like '?parentId=123'
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

/**
 * Unified Update Function (PATCH)
 * Handles renaming, moving, and now starring.
 */
export async function updateFile(fileId, updates) {
    return apiRequest(`/api/files/${fileId}`, "PATCH", updates, {}, true);
}

export async function deleteFile(fileId) {
    return apiRequest(`/api/files/${fileId}`, "DELETE", undefined, {}, true);
}

/**
 * we send a PATCH request to update the 'isStarred' boolean property.
 */
export async function starFile(fileId) {
    return updateFile(fileId, { isStarred: true });
}

export async function unstarFile(fileId) {
    return updateFile(fileId, { isStarred: false });
}

// --- OTHER ---

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