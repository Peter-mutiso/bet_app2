// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  let token: string | null = null;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("token"); 
    if (!token) console.warn("API Request attempted without a token.");
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${formattedEndpoint}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string> || {}) },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    throw new Error("Unauthorized: Your session has expired.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) as T : {} as T;
}