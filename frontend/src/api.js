// src/config/api.js
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");
export const API_URL = `${API_BASE_URL}/api`;
