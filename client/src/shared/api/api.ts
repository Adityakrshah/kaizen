/// <reference types="vite/client" />

// 1. Keep the base URL as just the server root (http://localhost:5000)
// Check your .env: VITE_API_URL should be "http://localhost:5000"
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: HeadersInit;
};

export async function request(endpoint: string, options: ApiOptions = {}) {
  // 2. SMART PATH HANDLING: 
  // If the endpoint is "/dashboard", it becomes "/api/dashboard"
  // If the endpoint is "/api/dashboard", it STAYS "/api/dashboard"
  const cleanPath = endpoint.startsWith("/api") 
    ? endpoint 
    : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const url = `${BASE_URL}${cleanPath}`;

  const config: RequestInit = {
    method: options.method || "GET",
    credentials: "include", // Essential for Better Auth sessions
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    body: options.body instanceof FormData 
      ? options.body 
      : options.body 
        ? JSON.stringify(options.body) 
        : undefined,
  };

  try {
    const res = await fetch(url, config);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    // Log the actual URL that failed to help us debug
    console.error(`[API Request Failed] ${url}:`, error);
    throw error;
  }
}